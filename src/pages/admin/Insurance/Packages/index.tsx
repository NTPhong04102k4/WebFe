import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useInsuranceCompanies,
  useInsuranceMutations,
  useInsurancePackages,
} from "src/query/insurance/useInsuranceQueries";
import type {
  InsurancePackageRequest,
  InsurancePackageViewModel,
} from "src/services/api/functions/insurance/insurance.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const emptyForm: InsurancePackageRequest = {
  companyID: 0,
  packageCode: "",
  packageName: "",
  packageType: "TNDS",
  description: "",
  coverageAmount: 0,
  basePremium: 0,
  duration_months: 12,
  isActive: true,
};

export default function AdminInsurancePackagesPage() {
  const [companyId, setCompanyId] = useState("");
  const { data: packages = [], isLoading, error } = useInsurancePackages(companyId ? Number(companyId) : undefined);
  const { data: companies = [] } = useInsuranceCompanies();
  const { createPackage, updatePackage, deletePackage } = useInsuranceMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsurancePackageViewModel | null>(null);
  const [form, setForm] = useState<InsurancePackageRequest>(emptyForm);

  const companyOptions = companies.map((company) => ({ label: company.companyName, value: String(company.companyID) }));

  const columns = useMemo<ColumnDef<InsurancePackageViewModel>[]>(
    () => [
      { accessorKey: "packageCode", header: "Mã gói" },
      { accessorKey: "packageName", header: "Tên gói" },
      { accessorKey: "companyName", header: "Công ty", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "packageType", header: "Loại" },
      { accessorKey: "coverageAmount", header: "Bảo hiểm", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "basePremium", header: "Phí", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "duration_months", header: "Tháng" },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sửa</button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => remove(row.original)}>Xóa</button>
          </div>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, companyID: companyId ? Number(companyId) : 0 });
    setOpen(true);
  };

  const openEdit = (item: InsurancePackageViewModel) => {
    setEditing(item);
    setForm({
      companyID: item.companyID,
      packageCode: item.packageCode,
      packageName: item.packageName,
      packageType: item.packageType,
      description: item.description ?? "",
      coverageAmount: item.coverageAmount,
      basePremium: item.basePremium,
      duration_months: item.duration_months,
      isActive: item.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updatePackage.mutateAsync({ id: editing.packageID, body: form });
        notify.success("Cập nhật gói bảo hiểm thành công");
      } else {
        await createPackage.mutateAsync(form);
        notify.success("Tạo gói bảo hiểm thành công");
      }
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const remove = async (item: InsurancePackageViewModel) => {
    if (!window.confirm(`Xóa gói ${item.packageName}?`)) return;
    try {
      await deletePackage.mutateAsync(item.packageID);
      notify.success("Đã xóa gói bảo hiểm");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Gói bảo hiểm</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quản lý sản phẩm và phí bảo hiểm</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tạo gói</button>
        </div>
        <SelectField className="mt-4 sm:max-w-sm" label="Công ty" value={companyId} placeholder="Tất cả công ty" options={companyOptions} onChange={(event) => setCompanyId(event.target.value)} />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Không lấy được danh sách gói bảo hiểm.</div>
      ) : packages.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có gói bảo hiểm" description="Chưa có gói bảo hiểm phù hợp." />
        </div>
      ) : (
        <DataTable data={packages} columns={columns} loading={isLoading} getRowId={(row) => String(row.packageID)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sửa gói bảo hiểm" : "Tạo gói bảo hiểm"} size="xl" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Hủy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createPackage.isPending || updatePackage.isPending}>Lưu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SelectField label="Công ty" value={String(form.companyID || "")} placeholder="Chọn công ty" options={companyOptions} onChange={(event) => setForm({ ...form, companyID: Number(event.target.value) })} />
          <Input label="Mã gói" value={form.packageCode} disabled={Boolean(editing)} onChange={(event) => setForm({ ...form, packageCode: event.target.value })} />
          <Input label="Tên gói" value={form.packageName} onChange={(event) => setForm({ ...form, packageName: event.target.value })} />
          <SelectField label="Loại" value={form.packageType} options={[{ label: "TNDS", value: "TNDS" }, { label: "Thân vỏ", value: "ThanVo" }, { label: "Tai nạn", value: "TaiNan" }, { label: "Toàn diện", value: "ToanDien" }]} onChange={(event) => setForm({ ...form, packageType: event.target.value })} />
          <Input label="Số tiền bảo hiểm" type="number" value={form.coverageAmount} onChange={(event) => setForm({ ...form, coverageAmount: Number(event.target.value) })} />
          <Input label="Phí cơ bản" type="number" value={form.basePremium} onChange={(event) => setForm({ ...form, basePremium: Number(event.target.value) })} />
          <Input label="Thời hạn (tháng)" type="number" value={form.duration_months} onChange={(event) => setForm({ ...form, duration_months: Number(event.target.value) })} />
          <SelectField label="Trạng thái" value={form.isActive ? "true" : "false"} options={[{ label: "Đang dùng", value: "true" }, { label: "Tạm dừng", value: "false" }]} onChange={(event) => setForm({ ...form, isActive: event.target.value !== "false" })} />
          <Input className="md:col-span-3" label="Mô tả" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

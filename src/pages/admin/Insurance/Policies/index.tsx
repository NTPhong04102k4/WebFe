import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { X } from "lucide-react";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import { CustomerPickerModal } from "src/components/common/CustomerPickerModal";
import { StaffPickerModal } from "src/components/common/StaffPickerModal";
import {
  useInsuranceMutations,
  useInsurancePackages,
  useInsurancePolicies,
} from "src/query/insurance/useInsuranceQueries";
import { useStaffDetail } from "src/query/staff/useStaffQueries";
import { workshopApi } from "src/services/api/functions/workshop/workshop.api";
import type {
  InsurancePolicyRequest,
  InsurancePolicyViewModel,
} from "src/services/api/functions/insurance/insurance.types";
import type { UserProfile } from "src/shared/types/Reponse/auth/user";
import { formatCurrency } from "@/common/utils/formatCurrency";

const emptyForm: InsurancePolicyRequest = {
  customerVehicleID: 0,
  packageID: 0,
  userID: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  premiumAmount: 0,
  soldByStaffID: null,
  document: null,
};

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

// Ô chọn khách hàng dùng chung cho bộ lọc và form tạo hợp đồng:
// - có onClear -> hiển thị nút xoá (dùng cho bộ lọc)
// - không có onClear -> hiển thị nút "Đổi" (dùng cho form)
function CustomerPickerField({
  label,
  user,
  placeholder,
  onPick,
  onClear,
}: {
  label: string;
  user: UserProfile | null;
  placeholder: string;
  onPick: () => void;
  onClear?: () => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {user ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600">
          <span className="truncate">
            {user.fullName || user.username}
            {user.email ? ` · ${user.email}` : ""}
            {user.phone ? ` · ${user.phone}` : ""}
          </span>
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Bỏ chọn khách hàng"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPick}
              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
            >
              Đổi
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={onPick}
          className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400"
        >
          {placeholder}
        </button>
      )}
    </div>
  );
}

export default function AdminInsurancePoliciesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [filterCustomer, setFilterCustomer] = useState<UserProfile | null>(null);
  const [filterPickerOpen, setFilterPickerOpen] = useState(false);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InsurancePolicyRequest>(emptyForm);
  const [formCustomer, setFormCustomer] = useState<UserProfile | null>(null);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState<InsurancePolicyViewModel | null>(null);

  const { data, isLoading, error } = useInsurancePolicies({
    page,
    pageSize: 20,
    userId: filterCustomer?.userID || undefined,
    status: status || undefined,
  });
  const { data: packages = [] } = useInsurancePackages();
  const { createPolicy, cancelPolicy } = useInsuranceMutations();
  const policies = data?.data ?? [];
  const packageOptions = packages.map((item) => ({ label: `${item.packageName} - ${item.companyName ?? ""}`, value: String(item.packageID) }));

  // Xe của khách hàng đang chọn trong form tạo hợp đồng
  const { data: vehicleData } = useQuery({
    queryKey: ["customer-vehicles", formCustomer?.userID],
    queryFn: () => workshopApi.listCustomerVehicles({ userId: String(formCustomer!.userID), pageSize: 100 }),
    enabled: !!formCustomer?.userID,
  });
  const vehicleOptions = useMemo(
    () =>
      (vehicleData?.data ?? []).map((v) => ({
        value: String(v.customerVehicleID),
        label: `${v.brandName ? v.brandName + " " : ""}${v.modelName} - ${v.licensePlate || v.vin}`,
      })),
    [vehicleData],
  );

  // Với hidePlaceholder, <select> luôn hiển thị option đầu tiên dù form.customerVehicleID
  // chưa khớp giá trị nào -> tự đồng bộ state với xe đầu tiên để nút Lưu không bị kẹt ở trạng thái disabled.
  useEffect(() => {
    if (vehicleOptions.length === 0) return;
    if (vehicleOptions.some((o) => o.value === String(form.customerVehicleID))) return;
    setForm((f) => ({ ...f, customerVehicleID: Number(vehicleOptions[0].value) }));
  }, [vehicleOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tên nhân viên bán đang chọn trong form tạo hợp đồng
  const { data: selectedStaff } = useStaffDetail(form.soldByStaffID ?? null);

  const columns = useMemo<ColumnDef<InsurancePolicyViewModel>[]>(
    () => [
      { accessorKey: "policyNumber", header: "Số HĐ" },
      { accessorKey: "ownerFullName", header: "Chủ xe", cell: ({ row }) => row.original.ownerFullName || row.original.userID },
      { accessorKey: "vehicleInfo", header: "Xe", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "packageName", header: "Gói", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "premiumAmount", header: "Phí", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ getValue }) => {
          const val = String(getValue() || "");
          if (val === "Active") return "Đang hiệu lực";
          if (val === "Cancelled") return "Đã huỷ";
          if (val === "Expired") return "Hết hạn";
          return val;
        },
      },
      { accessorKey: "daysToExpire", header: "Còn lại (ngày)" },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => {
          if (row.original.status === "Cancelled") return null;
          return (
            <div className="flex justify-end">
              <button
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-40"
                disabled={row.original.status === "Expired"}
                onClick={() => setConfirmCancel(row.original)}
                title="Huỷ hợp đồng: chuyển trạng thái sang Cancelled, không thể hoàn tác"
              >
                Huỷ HĐ
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const openCreate = () => {
    const firstPkg = packages[0];
    setFormCustomer(null);
    setForm({
      ...emptyForm,
      packageID: firstPkg?.packageID ?? 0,
      premiumAmount: firstPkg?.basePremium ?? 0,
      endDate: firstPkg ? addMonths(emptyForm.startDate, firstPkg.duration_months) : emptyForm.endDate,
    });
    setOpen(true);
  };

  const handlePackageChange = (packageID: number) => {
    const pkg = packages.find((p) => p.packageID === packageID);
    setForm((f) => ({
      ...f,
      packageID,
      premiumAmount: pkg ? pkg.basePremium : f.premiumAmount,
      endDate: pkg ? addMonths(f.startDate, pkg.duration_months) : f.endDate,
    }));
  };

  const handleStartDateChange = (value: string) => {
    const pkg = packages.find((p) => p.packageID === form.packageID);
    setForm((f) => ({
      ...f,
      startDate: value,
      endDate: pkg ? addMonths(value, pkg.duration_months) : f.endDate,
    }));
  };

  const handleSelectCustomer = (user: UserProfile) => {
    setFormCustomer(user);
    setForm((f) => ({ ...f, userID: user.userID, customerVehicleID: 0 }));
    setCustomerPickerOpen(false);
  };

  const save = async () => {
    try {
      await createPolicy.mutateAsync({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      notify.success("Tạo hợp đồng bảo hiểm thành công");
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const doCancel = async (policy: InsurancePolicyViewModel) => {
    try {
      await cancelPolicy.mutateAsync(policy.policyID);
      notify.success("Đã huỷ hợp đồng");
      setConfirmCancel(null);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const selectedPackage = packages.find((p) => p.packageID === form.packageID);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hợp đồng bảo hiểm</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Theo dõi hợp đồng, thanh toán và thời hạn</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tạo hợp đồng</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomerPickerField
            label="Khách hàng"
            user={filterCustomer}
            placeholder="Tìm theo email / username / SĐT..."
            onPick={() => setFilterPickerOpen(true)}
            onClear={() => { setFilterCustomer(null); setPage(1); }}
          />
          <SelectField
            label="Trạng thái"
            value={status}
            placeholder="Tất cả"
            options={[
              { label: "Đang hiệu lực", value: "Active" },
              { label: "Đã huỷ", value: "Cancelled" },
              { label: "Hết hạn", value: "Expired" },
            ]}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Không lấy được danh sách hợp đồng bảo hiểm. Vui lòng thử lại.</div>
      ) : policies.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có hợp đồng" description="Chưa có hợp đồng bảo hiểm phù hợp với bộ lọc hiện tại." />
        </div>
      ) : (
        <DataTable data={policies} columns={columns} loading={isLoading} getRowId={(row) => String(row.policyID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} — {data?.totalCount ?? 0} kết quả</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tạo hợp đồng bảo hiểm" size="xl" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huỷ</button>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={save}
            disabled={createPolicy.isPending || !form.userID || !form.customerVehicleID || !form.packageID}
          >
            Lưu
          </button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <CustomerPickerField
              label="Khách hàng"
              user={formCustomer}
              placeholder="Chọn khách hàng (tìm theo email / username / SĐT)..."
              onPick={() => setCustomerPickerOpen(true)}
            />
          </div>

          <SelectField
            label="Xe của khách hàng"
            hidePlaceholder={vehicleOptions.length > 0}
            disabled={!formCustomer || vehicleOptions.length === 0}
            value={form.customerVehicleID ? String(form.customerVehicleID) : ""}
            placeholder={!formCustomer ? "Chọn khách hàng trước" : "Khách hàng chưa có xe"}
            options={vehicleOptions}
            onChange={(event) => setForm({ ...form, customerVehicleID: Number(event.target.value) })}
          />

          <SelectField
            label="Gói bảo hiểm"
            value={String(form.packageID || "")}
            placeholder="Chọn gói"
            options={packageOptions}
            onChange={(event) => handlePackageChange(Number(event.target.value))}
          />

          <Input label="Ngày bắt đầu" type="date" value={form.startDate.slice(0, 10)} onChange={(event) => handleStartDateChange(event.target.value)} />

          <div className="flex flex-col gap-1">
            <Input
              label="Ngày kết thúc"
              type="date"
              value={form.endDate.slice(0, 10)}
              disabled
              readOnly
            />
            <span className="text-xs text-slate-400">
              {selectedPackage ? `Tự động tính theo thời hạn gói (${selectedPackage.duration_months} tháng)` : "Chọn gói bảo hiểm để tính ngày kết thúc"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <Input
              label="Phí bảo hiểm (VNĐ)"
              type="number"
              value={form.premiumAmount}
              onChange={(event) => setForm({ ...form, premiumAmount: Number(event.target.value) })}
            />
            <span className="text-xs text-slate-400">Số tiền khách hàng phải đóng cho gói bảo hiểm này (mặc định lấy theo phí gốc của gói, có thể điều chỉnh)</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Nhân viên bán (tuỳ chọn)</span>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600">
              <span className="truncate text-slate-700 dark:text-slate-200">
                {form.soldByStaffID ? (selectedStaff?.fullName ?? `#${form.soldByStaffID}`) : "Chưa chọn"}
              </span>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setStaffPickerOpen(true)}
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                >
                  Chọn
                </button>
                {form.soldByStaffID ? (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, soldByStaffID: null })}
                    className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300"
                  >
                    Bỏ chọn
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Tài liệu đính kèm (tuỳ chọn)</span>
            <input type="file" className="text-sm" onChange={(event) => setForm({ ...form, document: event.target.files?.[0] ?? null })} />
            <span className="text-xs text-slate-400">Bản scan/PDF hợp đồng giấy hoặc giấy chứng nhận bảo hiểm do công ty bảo hiểm cung cấp (nếu có)</span>
          </label>
        </div>
      </Modal>

      <CustomerPickerModal
        open={customerPickerOpen}
        onSelect={handleSelectCustomer}
        onClose={() => setCustomerPickerOpen(false)}
      />

      <CustomerPickerModal
        open={filterPickerOpen}
        onSelect={(user) => { setFilterCustomer(user); setPage(1); setFilterPickerOpen(false); }}
        onClose={() => setFilterPickerOpen(false)}
      />

      <StaffPickerModal
        open={staffPickerOpen}
        selected={form.soldByStaffID ? [form.soldByStaffID] : []}
        onConfirm={(ids) => { setForm({ ...form, soldByStaffID: ids[0] ?? null }); setStaffPickerOpen(false); }}
        onClose={() => setStaffPickerOpen(false)}
      />

      {/* Confirm huỷ hợp đồng */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Xác nhận huỷ hợp đồng</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Bạn có chắc muốn huỷ hợp đồng{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmCancel.policyNumber}
                </span>{" "}
                của khách hàng{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmCancel.ownerFullName || confirmCancel.userID}
                </span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                onClick={() => setConfirmCancel(null)}
                disabled={cancelPolicy.isPending}
              >
                Đóng
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={cancelPolicy.isPending}
                onClick={() => doCancel(confirmCancel)}
              >
                {cancelPolicy.isPending ? "Đang huỷ..." : "Huỷ hợp đồng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

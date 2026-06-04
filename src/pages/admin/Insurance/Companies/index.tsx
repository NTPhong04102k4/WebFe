import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useInsuranceCompanies,
  useInsuranceCompanyMutations,
} from "src/query/insurance/useInsuranceQueries";
import type {
  InsuranceCompanyRequest,
  InsuranceCompanyViewModel,
} from "src/services/api/functions/insurance/insurance.types";

const emptyForm: InsuranceCompanyRequest = {
  companyCode: "",
  companyName: "",
  hotline: "",
  email: "",
  address: "",
  logo: null,
  isActive: true,
};

export default function AdminInsuranceCompaniesPage() {
  const { data: companies = [], isLoading, error } = useInsuranceCompanies();
  const { createCompany, updateCompany, deleteCompany } = useInsuranceCompanyMutations();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceCompanyViewModel | null>(null);
  const [form, setForm] = useState<InsuranceCompanyRequest>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((company) =>
      [company.companyCode, company.companyName, company.hotline, company.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [companies, search]);

  const columns = useMemo<ColumnDef<InsuranceCompanyViewModel>[]>(
    () => [
      {
        accessorKey: "companyName",
        header: "Cong ty",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              {row.original.logoPath ? <img src={row.original.logoPath} alt={row.original.companyName} className="h-full w-full object-contain" /> : null}
            </div>
            <div>
              <div className="font-semibold">{row.original.companyName}</div>
              <div className="text-xs text-slate-500">Code: {row.original.companyCode}</div>
            </div>
          </div>
        ),
      },
      { accessorKey: "hotline", header: "Hotline", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "email", header: "Email", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "isActive", header: "Trang thai", cell: ({ row }) => row.original.isActive ? "Dang dung" : "Tam dung" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sua</button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => remove(row.original)}>Xoa</button>
          </div>
        ),
      },
    ],
    []
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (company: InsuranceCompanyViewModel) => {
    setEditing(company);
    setForm({
      companyCode: company.companyCode,
      companyName: company.companyName,
      hotline: company.hotline ?? "",
      email: company.email ?? "",
      address: company.address ?? "",
      logo: null,
      isActive: company.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateCompany.mutateAsync({ id: editing.companyID, body: form });
        notify.success("Cap nhat cong ty bao hiem thanh cong");
      } else {
        await createCompany.mutateAsync(form);
        notify.success("Tao cong ty bao hiem thanh cong");
      }
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const remove = async (company: InsuranceCompanyViewModel) => {
    if (!window.confirm(`Xoa cong ty ${company.companyName}?`)) return;
    try {
      await deleteCompany.mutateAsync(company.companyID);
      notify.success("Da xoa cong ty bao hiem");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cong ty bao hiem</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quan ly nha cung cap bao hiem</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tao cong ty</button>
        </div>
        <Input className="mt-4 sm:max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim ma, ten, hotline, email..." />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach cong ty bao hiem.</div>
      ) : filtered.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co cong ty" description="Chua co cong ty bao hiem phu hop." />
        </div>
      ) : (
        <DataTable data={filtered} columns={columns} loading={isLoading} getRowId={(row) => String(row.companyID)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sua cong ty bao hiem" : "Tao cong ty bao hiem"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createCompany.isPending || updateCompany.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Ma cong ty" value={form.companyCode} disabled={Boolean(editing)} onChange={(event) => setForm({ ...form, companyCode: event.target.value })} />
          <Input label="Ten cong ty" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} />
          <Input label="Hotline" value={form.hotline ?? ""} onChange={(event) => setForm({ ...form, hotline: event.target.value })} />
          <Input label="Email" type="email" value={form.email ?? ""} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <Input className="md:col-span-2" label="Dia chi" value={form.address ?? ""} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <SelectField label="Trang thai" value={form.isActive ? "true" : "false"} options={[{ label: "Dang dung", value: "true" }, { label: "Tam dung", value: "false" }]} onChange={(event) => setForm({ ...form, isActive: event.target.value !== "false" })} />
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-slate-700">Logo</span>
            <input type="file" accept="image/*" className="text-sm" onChange={(event) => setForm({ ...form, logo: event.target.files?.[0] ?? null })} />
          </label>
        </div>
      </Modal>
    </div>
  );
}

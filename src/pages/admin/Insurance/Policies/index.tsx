import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useInsuranceMutations,
  useInsurancePackages,
  useInsurancePolicies,
} from "src/query/insurance/useInsuranceQueries";
import type {
  InsurancePolicyRequest,
  InsurancePolicyViewModel,
} from "src/services/api/functions/insurance/insurance.types";
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

export default function AdminInsurancePoliciesPage() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InsurancePolicyRequest>(emptyForm);
  const { data, isLoading, error } = useInsurancePolicies({ page, pageSize: 20, userId: userId || undefined, status: status || undefined });
  const { data: packages = [] } = useInsurancePackages();
  const { createPolicy, cancelPolicy } = useInsuranceMutations();
  const policies = data?.data ?? [];
  const packageOptions = packages.map((item) => ({ label: `${item.packageName} - ${item.companyName ?? ""}`, value: String(item.packageID) }));

  const columns = useMemo<ColumnDef<InsurancePolicyViewModel>[]>(
    () => [
      { accessorKey: "policyNumber", header: "So HD" },
      { accessorKey: "ownerFullName", header: "Chu xe", cell: ({ row }) => row.original.ownerFullName || row.original.userID },
      { accessorKey: "vehicleInfo", header: "Xe", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "packageName", header: "Goi", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "premiumAmount", header: "Phi", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "status", header: "Trang thai" },
      { accessorKey: "daysToExpire", header: "Con lai" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" disabled={row.original.status === "Cancelled"} onClick={() => cancel(row.original)}>Huy</button>
          </div>
        ),
      },
    ],
    []
  );

  const save = async () => {
    try {
      await createPolicy.mutateAsync({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      notify.success("Tao hop dong bao hiem thanh cong");
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const cancel = async (policy: InsurancePolicyViewModel) => {
    if (!window.confirm(`Huy hop dong ${policy.policyNumber}?`)) return;
    try {
      await cancelPolicy.mutateAsync(policy.policyID);
      notify.success("Da huy hop dong");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hop dong bao hiem</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Theo doi hop dong, thanh toan va thoi han</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={() => { setForm(emptyForm); setOpen(true); }}>Tao hop dong</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="User ID" value={userId} onChange={(event) => { setUserId(event.target.value); setPage(1); }} placeholder="Loc theo user guid" />
          <SelectField label="Trang thai" value={status} placeholder="Tat ca" options={[{ label: "Active", value: "Active" }, { label: "Cancelled", value: "Cancelled" }, { label: "Expired", value: "Expired" }]} onChange={(event) => { setStatus(event.target.value); setPage(1); }} />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach hop dong bao hiem.</div>
      ) : policies.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co hop dong" description="Chua co hop dong bao hiem phu hop." />
        </div>
      ) : (
        <DataTable data={policies} columns={columns} loading={isLoading} getRowId={(row) => String(row.policyID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} - {data?.totalCount ?? 0} ket qua</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Truoc</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tao hop dong bao hiem" size="xl" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createPolicy.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Customer Vehicle ID" type="number" value={form.customerVehicleID} onChange={(event) => setForm({ ...form, customerVehicleID: Number(event.target.value) })} />
          <SelectField label="Goi bao hiem" value={String(form.packageID || "")} placeholder="Chon goi" options={packageOptions} onChange={(event) => setForm({ ...form, packageID: Number(event.target.value) })} />
          <Input label="User ID" value={form.userID} onChange={(event) => setForm({ ...form, userID: event.target.value })} />
          <Input label="Ngay bat dau" type="date" value={form.startDate.slice(0, 10)} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          <Input label="Ngay ket thuc" type="date" value={form.endDate.slice(0, 10)} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          <Input label="Phi" type="number" value={form.premiumAmount} onChange={(event) => setForm({ ...form, premiumAmount: Number(event.target.value) })} />
          <Input label="Sold by Staff ID" type="number" value={form.soldByStaffID ?? ""} onChange={(event) => setForm({ ...form, soldByStaffID: event.target.value ? Number(event.target.value) : null })} />
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Tai lieu</span>
            <input type="file" className="text-sm" onChange={(event) => setForm({ ...form, document: event.target.files?.[0] ?? null })} />
          </label>
        </div>
      </Modal>
    </div>
  );
}

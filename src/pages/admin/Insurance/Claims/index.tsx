import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import { useClaimsList, useInsuranceMutations } from "src/query/insurance/useInsuranceQueries";
import type {
  InsuranceClaimRequest,
  InsuranceClaimStatusRequest,
  InsuranceClaimViewModel,
} from "src/services/api/functions/insurance/insurance.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const emptyClaim: InsuranceClaimRequest = {
  policyID: 0,
  workOrderID: null,
  incidentDate: new Date().toISOString().slice(0, 10),
  reportedDate: new Date().toISOString().slice(0, 10),
  description: "",
  claimAmount: 0,
};

export default function AdminInsuranceClaimsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState<InsuranceClaimViewModel | null>(null);
  const [claimForm, setClaimForm] = useState<InsuranceClaimRequest>(emptyClaim);
  const [statusForm, setStatusForm] = useState<InsuranceClaimStatusRequest>({ status: "UnderReview", approvedAmount: null, notes: "" });
  const { data, isLoading, error } = useClaimsList(page, 20, status || undefined);
  const { createClaim, patchClaimStatus } = useInsuranceMutations();
  const claims = data?.data ?? [];

  const columns = useMemo<ColumnDef<InsuranceClaimViewModel>[]>(
    () => [
      { accessorKey: "claimNumber", header: "So yeu cau" },
      { accessorKey: "policyNumber", header: "Hop dong", cell: ({ row }) => row.original.policyNumber || `#${row.original.policyID}` },
      { accessorKey: "workOrderNumber", header: "Work order", cell: ({ row }) => row.original.workOrderNumber || row.original.workOrderID || "-" },
      { accessorKey: "claimAmount", header: "Yeu cau", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "approvedAmount", header: "Duyet", cell: ({ getValue }) => getValue() == null ? "-" : formatCurrency(Number(getValue())) },
      { accessorKey: "status", header: "Trang thai" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button className="rounded-lg border px-3 py-1.5 text-sm" onClick={() => openStatus(row.original)}>Xu ly</button>
          </div>
        ),
      },
    ],
    []
  );

  const openStatus = (claim: InsuranceClaimViewModel) => {
    setStatusOpen(claim);
    setStatusForm({
      status: claim.status || "UnderReview",
      approvedAmount: claim.approvedAmount ?? claim.claimAmount,
      notes: claim.notes ?? "",
    });
  };

  const saveClaim = async () => {
    try {
      await createClaim.mutateAsync({
        ...claimForm,
        incidentDate: new Date(claimForm.incidentDate).toISOString(),
        reportedDate: new Date(claimForm.reportedDate).toISOString(),
      });
      notify.success("Tao yeu cau boi thuong thanh cong");
      setOpen(false);
    } catch {
      notify.error("Tao yeu cau boi thuong that bai");
    }
  };

  const saveStatus = async () => {
    if (!statusOpen) return;
    try {
      await patchClaimStatus.mutateAsync({ id: statusOpen.claimID, body: statusForm });
      notify.success("Cap nhat trang thai boi thuong thanh cong");
      setStatusOpen(null);
    } catch {
      notify.error("Cap nhat trang thai that bai");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Yeu cau boi thuong</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Tiep nhan va xu ly claim bao hiem</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={() => { setClaimForm(emptyClaim); setOpen(true); }}>Tao yeu cau</button>
        </div>
        <SelectField className="mt-4 sm:max-w-sm" label="Trang thai" value={status} placeholder="Tat ca" options={[{ label: "Submitted", value: "Submitted" }, { label: "UnderReview", value: "UnderReview" }, { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" }, { label: "Paid", value: "Paid" }]} onChange={(event) => { setStatus(event.target.value); setPage(1); }} />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach yeu cau boi thuong.</div>
      ) : claims.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co yeu cau" description="Chua co yeu cau boi thuong phu hop." />
        </div>
      ) : (
        <DataTable data={claims} columns={columns} loading={isLoading} getRowId={(row) => String(row.claimID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} - {data?.totalCount ?? 0} ket qua</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Truoc</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tao yeu cau boi thuong" size="lg" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={saveClaim} disabled={createClaim.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Policy ID" type="number" value={claimForm.policyID} onChange={(event) => setClaimForm({ ...claimForm, policyID: Number(event.target.value) })} />
          <Input label="Work Order ID" type="number" value={claimForm.workOrderID ?? ""} onChange={(event) => setClaimForm({ ...claimForm, workOrderID: event.target.value ? Number(event.target.value) : null })} />
          <Input label="Ngay su co" type="date" value={claimForm.incidentDate.slice(0, 10)} onChange={(event) => setClaimForm({ ...claimForm, incidentDate: event.target.value })} />
          <Input label="Ngay bao cao" type="date" value={claimForm.reportedDate.slice(0, 10)} onChange={(event) => setClaimForm({ ...claimForm, reportedDate: event.target.value })} />
          <Input label="So tien yeu cau" type="number" value={claimForm.claimAmount} onChange={(event) => setClaimForm({ ...claimForm, claimAmount: Number(event.target.value) })} />
          <Input className="md:col-span-2" label="Mo ta" value={claimForm.description} onChange={(event) => setClaimForm({ ...claimForm, description: event.target.value })} />
        </div>
      </Modal>

      <Modal open={Boolean(statusOpen)} onClose={() => setStatusOpen(null)} title="Xu ly yeu cau boi thuong" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setStatusOpen(null)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={saveStatus} disabled={patchClaimStatus.isPending}>Luu</button>
        </div>
      }>
        <div className="space-y-4">
          <SelectField label="Trang thai" value={statusForm.status} options={[{ label: "Submitted", value: "Submitted" }, { label: "UnderReview", value: "UnderReview" }, { label: "Approved", value: "Approved" }, { label: "Rejected", value: "Rejected" }, { label: "Paid", value: "Paid" }]} onChange={(event) => setStatusForm({ ...statusForm, status: event.target.value })} />
          <Input label="So tien duyet" type="number" value={statusForm.approvedAmount ?? ""} onChange={(event) => setStatusForm({ ...statusForm, approvedAmount: event.target.value ? Number(event.target.value) : null })} />
          <Input label="Ghi chu" value={statusForm.notes ?? ""} onChange={(event) => setStatusForm({ ...statusForm, notes: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

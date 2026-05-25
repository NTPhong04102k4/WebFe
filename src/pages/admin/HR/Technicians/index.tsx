import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useHrTechnicianLevels,
  useHrTechnicianMutations,
  useHrTechniciansSearch,
} from "src/query/hr/useHrQueries";
import type {
  TechnicianRequest,
  TechnicianViewModel,
} from "src/services/api/functions/hr/hr.types";

const emptyForm: TechnicianRequest = {
  staffID: 0,
  levelID: 0,
  hireDate: new Date().toISOString().slice(0, 10),
  yearsOfExperience: 0,
  certifications: "",
  isAvailable: true,
  notes: "",
  isActive: true,
};

export default function AdminTechniciansPage() {
  const [page, setPage] = useState(1);
  const [available, setAvailable] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TechnicianViewModel | null>(null);
  const [form, setForm] = useState<TechnicianRequest>(emptyForm);
  const params = { page, pageSize: 20, available: available === "" ? undefined : available === "true" };
  const { data, isLoading, error } = useHrTechniciansSearch(params);
  const { data: levels = [] } = useHrTechnicianLevels();
  const { createTechnician, updateTechnician, deleteTechnician } = useHrTechnicianMutations();
  const technicians = data?.data ?? [];

  const columns = useMemo<ColumnDef<TechnicianViewModel>[]>(
    () => [
      { accessorKey: "staffFullName", header: "Nhan su", cell: ({ row }) => row.original.staffFullName || `Staff #${row.original.staffID}` },
      { accessorKey: "staffEmail", header: "Email", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "levelName", header: "Cap bac", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "yearsOfExperience", header: "Kinh nghiem" },
      { accessorKey: "currentWorkload", header: "Viec dang lam" },
      { accessorKey: "averageRating", header: "Rating", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "isAvailable", header: "San sang", cell: ({ row }) => row.original.isAvailable ? "Ranh" : "Ban" },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sua</button>
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

  const openEdit = (tech: TechnicianViewModel) => {
    setEditing(tech);
    setForm({
      staffID: tech.staffID,
      levelID: tech.levelID,
      hireDate: tech.hireDate?.slice(0, 10) || emptyForm.hireDate,
      yearsOfExperience: tech.yearsOfExperience,
      certifications: tech.certifications ?? "",
      isAvailable: tech.isAvailable,
      notes: tech.notes ?? "",
      isActive: tech.isActive,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, hireDate: new Date(form.hireDate).toISOString() };
      if (editing) {
        await updateTechnician.mutateAsync({ id: editing.technicianID, body: payload });
        notify.success("Cap nhat ky thuat vien thanh cong");
      } else {
        await createTechnician.mutateAsync(payload);
        notify.success("Tao ky thuat vien thanh cong");
      }
      setOpen(false);
    } catch {
      notify.error("Luu ky thuat vien that bai");
    }
  };

  const remove = async (tech: TechnicianViewModel) => {
    if (!window.confirm(`Xoa ky thuat vien ${tech.staffFullName || tech.staffID}?`)) return;
    try {
      await deleteTechnician.mutateAsync(tech.technicianID);
      notify.success("Da xoa ky thuat vien");
    } catch {
      notify.error("Xoa ky thuat vien that bai");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ky thuat vien</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quan ly ho so, workload va trang thai san sang</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tao ky thuat vien</button>
        </div>
        <SelectField className="mt-4 sm:max-w-sm" label="Loc trang thai" value={available} placeholder="Tat ca" options={[{ label: "Ranh", value: "true" }, { label: "Ban", value: "false" }]} onChange={(event) => { setAvailable(event.target.value); setPage(1); }} />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach ky thuat vien.</div>
      ) : technicians.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co ky thuat vien" description="Chua co ky thuat vien phu hop." />
        </div>
      ) : (
        <DataTable data={technicians} columns={columns} loading={isLoading} getRowId={(row) => String(row.technicianID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} - {data?.totalCount ?? 0} ket qua</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Truoc</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sua ky thuat vien" : "Tao ky thuat vien"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createTechnician.isPending || updateTechnician.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Staff ID" type="number" value={form.staffID} onChange={(event) => setForm({ ...form, staffID: Number(event.target.value) })} disabled={Boolean(editing)} />
          <SelectField label="Cap bac" value={String(form.levelID || "")} placeholder="Chon cap bac" options={levels.map((level) => ({ label: level.levelName, value: String(level.levelID) }))} onChange={(event) => setForm({ ...form, levelID: Number(event.target.value) })} />
          <Input label="Ngay vao lam" type="date" value={form.hireDate.slice(0, 10)} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} />
          <Input label="Nam kinh nghiem" type="number" value={form.yearsOfExperience ?? 0} onChange={(event) => setForm({ ...form, yearsOfExperience: Number(event.target.value) })} />
          <SelectField label="San sang" value={form.isAvailable ? "true" : "false"} options={[{ label: "Ranh", value: "true" }, { label: "Ban", value: "false" }]} onChange={(event) => setForm({ ...form, isAvailable: event.target.value !== "false" })} />
          <SelectField label="Trang thai" value={form.isActive ? "true" : "false"} options={[{ label: "Dang dung", value: "true" }, { label: "Tam dung", value: "false" }]} onChange={(event) => setForm({ ...form, isActive: event.target.value !== "false" })} />
          <Input label="Chung chi JSON" value={form.certifications ?? ""} onChange={(event) => setForm({ ...form, certifications: event.target.value })} />
          <Input label="Ghi chu" value={form.notes ?? ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

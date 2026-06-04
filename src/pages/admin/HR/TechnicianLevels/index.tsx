import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal } from "src/components/common";
import {
  useHrTechnicianLevelMutations,
  useHrTechnicianLevels,
} from "src/query/hr/useHrQueries";
import type {
  TechnicianLevelRequest,
  TechnicianLevelViewModel,
} from "src/services/api/functions/hr/hr.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const emptyForm: TechnicianLevelRequest = {
  levelCode: "",
  levelName: "",
  baseSalary: 0,
  hourlyRate: 0,
  bonusPerJob: 0,
  displayOrder: 1,
};

export default function AdminTechnicianLevelsPage() {
  const { data: levels = [], isLoading, error } = useHrTechnicianLevels();
  const { createLevel, updateLevel, deleteLevel } = useHrTechnicianLevelMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TechnicianLevelViewModel | null>(null);
  const [form, setForm] = useState<TechnicianLevelRequest>(emptyForm);

  const columns = useMemo<ColumnDef<TechnicianLevelViewModel>[]>(
    () => [
      { accessorKey: "levelCode", header: "Ma cap" },
      { accessorKey: "levelName", header: "Ten cap" },
      { accessorKey: "baseSalary", header: "Luong co ban", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "hourlyRate", header: "Theo gio", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "bonusPerJob", header: "Thuong/job", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "displayOrder", header: "Thu tu" },
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

  const openEdit = (level: TechnicianLevelViewModel) => {
    setEditing(level);
    setForm({
      levelCode: level.levelCode,
      levelName: level.levelName,
      baseSalary: level.baseSalary,
      hourlyRate: level.hourlyRate,
      bonusPerJob: level.bonusPerJob ?? 0,
      displayOrder: level.displayOrder,
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (editing) {
        await updateLevel.mutateAsync({ id: editing.levelID, body: form });
        notify.success("Cap nhat cap bac thanh cong");
      } else {
        await createLevel.mutateAsync(form);
        notify.success("Tao cap bac thanh cong");
      }
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const remove = async (level: TechnicianLevelViewModel) => {
    if (!window.confirm(`Xoa cap bac ${level.levelName}?`)) return;
    try {
      await deleteLevel.mutateAsync(level.levelID);
      notify.success("Da xoa cap bac");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cap bac ky thuat vien</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quan ly bac luong, hourly rate va thuong theo job</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tao cap bac</button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach cap bac.</div>
      ) : levels.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co cap bac" description="Chua co cap bac ky thuat vien." />
        </div>
      ) : (
        <DataTable data={levels} columns={columns} loading={isLoading} getRowId={(row) => String(row.levelID)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sua cap bac" : "Tao cap bac"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createLevel.isPending || updateLevel.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Ma cap" value={form.levelCode} disabled={Boolean(editing)} onChange={(event) => setForm({ ...form, levelCode: event.target.value })} />
          <Input label="Ten cap" value={form.levelName} onChange={(event) => setForm({ ...form, levelName: event.target.value })} />
          <Input label="Luong co ban" type="number" value={form.baseSalary} onChange={(event) => setForm({ ...form, baseSalary: Number(event.target.value) })} />
          <Input label="Theo gio" type="number" value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: Number(event.target.value) })} />
          <Input label="Thuong/job" type="number" value={form.bonusPerJob ?? 0} onChange={(event) => setForm({ ...form, bonusPerJob: Number(event.target.value) })} />
          <Input label="Thu tu hien thi" type="number" value={form.displayOrder ?? 1} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} />
        </div>
      </Modal>
    </div>
  );
}

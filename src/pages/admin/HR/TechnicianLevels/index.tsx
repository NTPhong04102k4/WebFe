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
  // createLevel, deleteLevel không còn dùng do đã ẩn chức năng tạo/xóa cấp bậc
  const { updateLevel } = useHrTechnicianLevelMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TechnicianLevelViewModel | null>(null);
  const [form, setForm] = useState<TechnicianLevelRequest>(emptyForm);

  const columns = useMemo<ColumnDef<TechnicianLevelViewModel>[]>(
    () => [
      { accessorKey: "levelCode", header: "Mã cấp" },
      { accessorKey: "levelName", header: "Tên cấp" },
      { accessorKey: "baseSalary", header: "Lương cơ bản", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "hourlyRate", header: "Theo giờ", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "bonusPerJob", header: "Thưởng/job", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      { accessorKey: "displayOrder", header: "Thứ tự" },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>Sửa</button>
            {/* Đã ẩn nút xóa cấp bậc (xóa cứng - DB.Remove) */}
            {/* <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => remove(row.original)}>Xóa</button> */}
          </div>
        ),
      },
    ],
    []
  );

  // Đã ẩn chức năng tạo cấp bậc
  // const openCreate = () => {
  //   setEditing(null);
  //   setForm(emptyForm);
  //   setOpen(true);
  // };

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
    if (!editing) return;
    try {
      await updateLevel.mutateAsync({ id: editing.levelID, body: form });
      notify.success("Cập nhật cấp bậc thành công");
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  // Đã ẩn chức năng xóa cấp bậc
  // const remove = async (level: TechnicianLevelViewModel) => {
  //   if (!window.confirm(`Xóa cấp bậc ${level.levelName}?`)) return;
  //   try {
  //     await deleteLevel.mutateAsync(level.levelID);
  //     notify.success("Đã xóa cấp bậc");
  //   } catch {
  //     // interceptor đã hiện toast lỗi
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Cấp bậc kỹ thuật viên</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Quản lý bậc lương, hourly rate và thưởng theo job</p>
          </div>
          {/* Đã ẩn nút tạo cấp bậc */}
          {/* <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>Tạo cấp bậc</button> */}
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Không lấy được danh sách cấp bậc.</div>
      ) : levels.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có cấp bậc" description="Chưa có cấp bậc kỹ thuật viên." />
        </div>
      ) : (
        <DataTable data={levels} columns={columns} loading={isLoading} getRowId={(row) => String(row.levelID)} />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Sửa cấp bậc" : "Tạo cấp bậc"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Hủy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={updateLevel.isPending}>Lưu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Mã cấp" value={form.levelCode} disabled={Boolean(editing)} onChange={(event) => setForm({ ...form, levelCode: event.target.value })} />
          <Input label="Tên cấp" value={form.levelName} onChange={(event) => setForm({ ...form, levelName: event.target.value })} />
          <Input label="Lương cơ bản" type="number" value={form.baseSalary} onChange={(event) => setForm({ ...form, baseSalary: Number(event.target.value) })} />
          <Input label="Theo giờ" type="number" value={form.hourlyRate} onChange={(event) => setForm({ ...form, hourlyRate: Number(event.target.value) })} />
          <Input label="Thưởng/job" type="number" value={form.bonusPerJob ?? 0} onChange={(event) => setForm({ ...form, bonusPerJob: Number(event.target.value) })} />
          <Input label="Thứ tự hiển thị" type="number" value={form.displayOrder ?? 1} onChange={(event) => setForm({ ...form, displayOrder: Number(event.target.value) })} />
        </div>
      </Modal>
    </div>
  );
}

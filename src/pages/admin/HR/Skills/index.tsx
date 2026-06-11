import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useHrSkillMutations,
  useHrSkills,
} from "src/query/hr/useHrQueries";
import type {
  SkillRequest,
  SkillViewModel,
} from "src/services/api/functions/hr/hr.types";

const emptyForm: SkillRequest = {
  skillCode: "",
  skillName: "",
  description: "",
  category: "",
  isActive: true,
};

export default function AdminHrSkillsPage() {
  const { data: skills = [], isLoading, error } = useHrSkills();
  const { createSkill, updateSkill, deleteSkill } = useHrSkillMutations();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SkillViewModel | null>(null);
  const [form, setForm] = useState<SkillRequest>(emptyForm);
  const [search, setSearch] = useState("");

  const filteredSkills = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return skills;
    return skills.filter((skill) =>
      [skill.skillCode, skill.skillName, skill.category, skill.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [search, skills]);

  const columns = useMemo<ColumnDef<SkillViewModel>[]>(
    () => [
      { accessorKey: "skillCode", header: "Mã" },
      { accessorKey: "skillName", header: "Tên kỹ năng" },
      { accessorKey: "category", header: "Nhóm", cell: ({ getValue }) => String(getValue() || "-") },
      {
        accessorKey: "isActive",
        header: "Trạng thái",
        cell: ({ row }) => (row.original.isActive ? "Đang dùng" : "Tạm dừng"),
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>
              Sửa
            </button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => handleDelete(row.original)}>
              Xóa
            </button>
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

  const openEdit = (skill: SkillViewModel) => {
    setEditing(skill);
    setForm({
      skillCode: skill.skillCode,
      skillName: skill.skillName,
      description: skill.description ?? "",
      category: skill.category ?? "",
      isActive: skill.isActive,
    });
    setOpen(true);
  };

  const close = () => setOpen(false);

  const save = async () => {
    try {
      const payload = {
        ...form,
        skillCode: form.skillCode.trim(),
        skillName: form.skillName.trim(),
      };
      if (editing) {
        await updateSkill.mutateAsync({ id: editing.skillID, body: payload });
        notify.success("Cập nhật kỹ năng thành công");
      } else {
        await createSkill.mutateAsync(payload);
        notify.success("Tạo kỹ năng thành công");
      }
      close();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const handleDelete = async (skill: SkillViewModel) => {
    if (!window.confirm(`Xóa kỹ năng ${skill.skillName}?`)) return;
    try {
      await deleteSkill.mutateAsync(skill.skillID);
      notify.success("Đã xóa kỹ năng");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quản lý kỹ năng</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Danh mục skill cho kỹ thuật viên</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>
            Tạo kỹ năng
          </button>
        </div>
        <Input className="mt-4 sm:max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã, tên, nhóm..." />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Không lấy được danh sách kỹ năng.</div>
      ) : filteredSkills.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có kỹ năng" description="Chưa có kỹ năng phù hợp với bộ lọc." />
        </div>
      ) : (
        <DataTable data={filteredSkills} columns={columns} loading={isLoading} getRowId={(row) => String(row.skillID)} />
      )}

      <Modal open={open} onClose={close} title={editing ? "Sửa kỹ năng" : "Tạo kỹ năng"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={close}>Hủy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createSkill.isPending || updateSkill.isPending}>Lưu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Mã kỹ năng" value={form.skillCode} onChange={(event) => setForm({ ...form, skillCode: event.target.value })} disabled={Boolean(editing)} />
          <Input label="Tên kỹ năng" value={form.skillName} onChange={(event) => setForm({ ...form, skillName: event.target.value })} />
          <Input label="Nhóm" value={form.category ?? ""} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <SelectField label="Trạng thái" value={form.isActive ? "true" : "false"} options={[{ label: "Đang dùng", value: "true" }, { label: "Tạm dừng", value: "false" }]} onChange={(event) => setForm({ ...form, isActive: event.target.value !== "false" })} />
          <Input className="md:col-span-2" label="Mô tả" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

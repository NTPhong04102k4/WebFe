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
      { accessorKey: "skillCode", header: "Ma" },
      { accessorKey: "skillName", header: "Ten ky nang" },
      { accessorKey: "category", header: "Nhom", cell: ({ getValue }) => String(getValue() || "-") },
      {
        accessorKey: "isActive",
        header: "Trang thai",
        cell: ({ row }) => (row.original.isActive ? "Dang dung" : "Tam dung"),
      },
      {
        id: "actions",
        header: "Hanh dong",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => openEdit(row.original)}>
              Sua
            </button>
            <button className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600" onClick={() => handleDelete(row.original)}>
              Xoa
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
        notify.success("Cap nhat ky nang thanh cong");
      } else {
        await createSkill.mutateAsync(payload);
        notify.success("Tao ky nang thanh cong");
      }
      close();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const handleDelete = async (skill: SkillViewModel) => {
    if (!window.confirm(`Xoa ky nang ${skill.skillName}?`)) return;
    try {
      await deleteSkill.mutateAsync(skill.skillID);
      notify.success("Da xoa ky nang");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Quan ly ky nang</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Danh muc skill cho ky thuat vien</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={openCreate}>
            Tao ky nang
          </button>
        </div>
        <Input className="mt-4 sm:max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tim ma, ten, nhom..." />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Khong lay duoc danh sach ky nang.</div>
      ) : filteredSkills.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co ky nang" description="Chua co ky nang phu hop voi bo loc." />
        </div>
      ) : (
        <DataTable data={filteredSkills} columns={columns} loading={isLoading} getRowId={(row) => String(row.skillID)} />
      )}

      <Modal open={open} onClose={close} title={editing ? "Sua ky nang" : "Tao ky nang"} footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={close}>Huy</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createSkill.isPending || updateSkill.isPending}>Luu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input label="Ma ky nang" value={form.skillCode} onChange={(event) => setForm({ ...form, skillCode: event.target.value })} disabled={Boolean(editing)} />
          <Input label="Ten ky nang" value={form.skillName} onChange={(event) => setForm({ ...form, skillName: event.target.value })} />
          <Input label="Nhom" value={form.category ?? ""} onChange={(event) => setForm({ ...form, category: event.target.value })} />
          <SelectField label="Trang thai" value={form.isActive ? "true" : "false"} options={[{ label: "Dang dung", value: "true" }, { label: "Tam dung", value: "false" }]} onChange={(event) => setForm({ ...form, isActive: event.target.value !== "false" })} />
          <Input className="md:col-span-2" label="Mo ta" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

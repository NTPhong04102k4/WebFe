import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import {
  useInsuranceCompanies,
  useInsuranceCompanyMutations,
} from "src/query/insurance/useInsuranceQueries";
import type {
  InsuranceCompanyRequest,
  InsuranceCompanyViewModel,
} from "src/services/api/functions/insurance/insurance.types";

// ─── Schema ──────────────────────────────────────────────────────────────────

const companySchema = yup.object({
  companyCode: yup.string().required("Bắt buộc").max(20, "Tối đa 20 ký tự"),
  companyName: yup.string().required("Bắt buộc").max(200, "Tối đa 200 ký tự"),
  hotline: yup.string().nullable().optional(),
  email: yup.string().email("Email không hợp lệ").nullable().optional(),
  address: yup.string().nullable().optional(),
  isActive: yup.boolean().required(),
});

type CompanyFormValues = yup.InferType<typeof companySchema>;

// ─── Column helper ───────────────────────────────────────────────────────────

const col = createColumnHelper<InsuranceCompanyViewModel>();

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        active
          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
      }`}
    >
      {active ? "Hoạt động" : "Tạm dừng"}
    </span>
  );
}

interface CompanyDialogProps {
  open: boolean;
  editing: InsuranceCompanyViewModel | null;
  onClose: () => void;
}

function CompanyDialog({ open, editing, onClose }: CompanyDialogProps) {
  const { createCompany, updateCompany } = useInsuranceCompanyMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyFormValues>({
    resolver: yupResolver(companySchema),
    defaultValues: editing
      ? {
          companyCode: editing.companyCode,
          companyName: editing.companyName,
          hotline: editing.hotline ?? "",
          email: editing.email ?? "",
          address: editing.address ?? "",
          isActive: editing.isActive,
        }
      : { companyCode: "", companyName: "", hotline: "", email: "", address: "", isActive: true },
  });

  React.useEffect(() => {
    if (open) {
      reset(
        editing
          ? {
              companyCode: editing.companyCode,
              companyName: editing.companyName,
              hotline: editing.hotline ?? "",
              email: editing.email ?? "",
              address: editing.address ?? "",
              isActive: editing.isActive,
            }
          : { companyCode: "", companyName: "", hotline: "", email: "", address: "", isActive: true }
      );
    }
  }, [open, editing, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const body: InsuranceCompanyRequest = {
      companyCode: values.companyCode,
      companyName: values.companyName,
      hotline: values.hotline || null,
      email: values.email || null,
      address: values.address || null,
      isActive: values.isActive,
    };
    if (editing) {
      await updateCompany.mutateAsync({ id: editing.companyID, body });
    } else {
      await createCompany.mutateAsync(body);
    }
    onClose();
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={editing ? "Chỉnh sửa công ty bảo hiểm" : "Thêm công ty bảo hiểm"}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {editing ? "Chỉnh sửa công ty BH" : "Thêm công ty BH"}
        </h2>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mã công ty <span className="text-red-500">*</span>
              </label>
              <input
                {...register("companyCode")}
                disabled={!!editing}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              {errors.companyCode && (
                <p className="mt-1 text-xs text-red-500">{errors.companyCode.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tên công ty <span className="text-red-500">*</span>
              </label>
              <input
                {...register("companyName")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Hotline
              </label>
              <input
                {...register("hotline")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Địa chỉ
              </label>
              <input
                {...register("address")}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              />
            </div>

            <div className="col-span-2 flex items-center gap-2">
              <input
                {...register("isActive")}
                id="isActive"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 dark:text-slate-300">
                Đang hoạt động
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Đang lưu…" : editing ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminInsuranceCompaniesPage() {
  const [filterActive, setFilterActive] = useState<"" | "true" | "false">("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<InsuranceCompanyViewModel | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: companies = [], isLoading } = useInsuranceCompanies();
  const { deleteCompany } = useInsuranceCompanyMutations();

  const filtered =
    filterActive === ""
      ? companies
      : companies.filter((c) => String(c.isActive) === filterActive);

  const columns = [
    col.accessor("companyID", { header: "ID" }),
    col.accessor("companyCode", { header: "Mã" }),
    col.accessor("companyName", { header: "Tên công ty" }),
    col.accessor("hotline", {
      header: "Hotline",
      cell: (ctx) => ctx.getValue() ?? "—",
    }),
    col.accessor("isActive", {
      header: "Trạng thái",
      cell: (ctx) => <StatusBadge active={ctx.getValue()} />,
    }),
    col.display({
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setEditing(row.original); setDialogOpen(true); }}
            className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Sửa
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row.original.companyID)}
            className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Xóa
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const openCreate = () => { setEditing(null); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    await deleteCompany.mutateAsync(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Công ty bảo hiểm
        </h1>

        <div className="flex items-center gap-2">
          <select
            aria-label="Lọc trạng thái"
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as "" | "true" | "false")}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="">Tất cả</option>
            <option value="true">Hoạt động</option>
            <option value="false">Tạm dừng</option>
          </select>

          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Thêm
          </button>
        </div>
      </div>

      {isLoading && (
        <p className="py-8 text-center text-sm text-slate-500">Đang tải…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-400">Chưa có công ty nào.</p>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CompanyDialog open={dialogOpen} editing={editing} onClose={closeDialog} />

      {/* Confirm delete */}
      {deleteId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận xóa"
        >
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
              Xóa công ty này? Hành động không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-600"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteCompany.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteCompany.isPending ? "Đang xóa…" : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

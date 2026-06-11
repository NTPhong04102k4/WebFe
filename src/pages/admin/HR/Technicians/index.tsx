import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import {
  DataTable,
  EmptyState,
  Input,
  Modal,
  SelectField,
} from "src/components/common";
import { MultiCombobox } from "src/components/core/MultiCombobox/MultiCombobox";
import { StaffPickerModal } from "src/components/common/StaffPickerModal";
import { useStaffDetail } from "src/query/staff/useStaffQueries";
import {
  useHrTechnicianLevels,
  useHrTechnicianMutations,
  useHrTechniciansSearch,
} from "src/query/hr/useHrQueries";
import type {
  TechnicianRequest,
  TechnicianViewModel,
} from "src/services/api/functions/hr/hr.types";

function parseCertifications(json?: string | null): string[] {
  if (!json) return [];
  try {
    const list = JSON.parse(json);
    return Array.isArray(list)
      ? list.filter((item) => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

const emptyForm: TechnicianRequest = {
  staffID: 0,
  levelID: 0,
  hireDate: new Date().toISOString().slice(0, 10),
  certifications: "",
  notes: "",
  isActive: true,
};

export default function AdminTechniciansPage() {
  const [page, setPage] = useState(1);
  const [available, setAvailable] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TechnicianViewModel | null>(null);
  const [form, setForm] = useState<TechnicianRequest>(emptyForm);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [staffPickerOpen, setStaffPickerOpen] = useState(false);
  // const [confirmDelete, setConfirmDelete] =
  //   useState<TechnicianViewModel | null>(null);
  const params = {
    page,
    pageSize: 20,
    available: available === "" ? undefined : available === "true",
  };
  const { data, isLoading, error } = useHrTechniciansSearch(params);
  const { data: levels = [] } = useHrTechnicianLevels();
  // deleteTechnician không còn dùng do đã ẩn chức năng xóa kỹ thuật viên
  const { createTechnician, updateTechnician } =
    useHrTechnicianMutations();
  const { data: selectedStaff } = useStaffDetail(
    !editing && form.staffID > 0 ? form.staffID : null,
  );
  const technicians = data?.data ?? [];

  const columns = useMemo<ColumnDef<TechnicianViewModel>[]>(
    () => [
      {
        accessorKey: "staffFullName",
        header: "Nhân sự",
        cell: ({ row }) =>
          row.original.staffFullName || `Staff #${row.original.staffID}`,
      },
      {
        accessorKey: "staffEmail",
        header: "Email",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "levelName",
        header: "Cấp bậc",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      { accessorKey: "yearsOfExperience", header: "Kinh nghiệm (năm)" },
      { accessorKey: "currentWorkload", header: "Việc đang làm" },
      {
        accessorKey: "averageRating",
        header: "Đánh giá",
        cell: ({ getValue }) => String(getValue() || "-"),
      },
      {
        accessorKey: "isAvailable",
        header: "Sẵn sàng",
        cell: ({ row }) => (row.original.isAvailable ? "Rảnh" : "Bận"),
      },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
              onClick={() => openEdit(row.original)}
            >
              Sửa
            </button>
            {/* Đã ẩn nút xóa kỹ thuật viên (xóa mềm - IsActive=false) */}
            {/* <button
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600"
              onClick={() => setConfirmDelete(row.original)}
            >
              Xóa
            </button> */}
          </div>
        ),
      },
    ],
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCertifications([]);
    setOpen(true);
  };

  const openEdit = (tech: TechnicianViewModel) => {
    setEditing(tech);
    setForm({
      staffID: tech.staffID,
      levelID: tech.levelID,
      hireDate: tech.hireDate?.slice(0, 10) || emptyForm.hireDate,
      certifications: tech.certifications ?? "",
      notes: tech.notes ?? "",
      isActive: tech.isActive,
    });
    setCertifications(parseCertifications(tech.certifications));
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        hireDate: new Date(form.hireDate).toISOString(),
        certifications: JSON.stringify(certifications),
      };
      if (editing) {
        await updateTechnician.mutateAsync({
          id: editing.technicianID,
          body: payload,
        });
        notify.success("Cập nhật kỹ thuật viên thành công");
      } else {
        await createTechnician.mutateAsync(payload);
        notify.success("Tạo kỹ thuật viên thành công");
      }
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  // Đã ẩn chức năng xóa kỹ thuật viên
  // const remove = async (tech: TechnicianViewModel) => {
  //   try {
  //     await deleteTechnician.mutateAsync(tech.technicianID);
  //     notify.success("Đã xóa kỹ thuật viên");
  //     setConfirmDelete(null);
  //   } catch {
  //     // interceptor đã hiện toast lỗi
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Kỹ thuật viên
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Quản lý hồ sơ, khối lượng công việc và trạng thái sẵn sàng
            </p>
          </div>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            onClick={openCreate}
          >
            Tạo kỹ thuật viên
          </button>
        </div>
        <SelectField
          className="mt-4 sm:max-w-sm"
          label="Lọc trạng thái"
          value={available}
          placeholder="Tất cả"
          options={[
            { label: "Rảnh", value: "true" },
            { label: "Bận", value: "false" },
          ]}
          onChange={(event) => {
            setAvailable(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Không thể tải danh sách kỹ thuật viên. Vui lòng thử lại.
        </div>
      ) : technicians.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState
            title="Chưa có kỹ thuật viên"
            description="Chưa có kỹ thuật viên phù hợp với bộ lọc hiện tại."
          />
        </div>
      ) : (
        <DataTable
          data={technicians}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => String(row.technicianID)}
        />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>
          Trang {data?.page ?? page} — {data?.totalCount ?? 0} kỹ thuật viên
        </span>
        <div className="flex gap-2">
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <button
            className="rounded-lg border px-3 py-1.5 disabled:opacity-50"
            disabled={(data?.data.length ?? 0) < 20}
            onClick={() => setPage(page + 1)}
          >
            Sau
          </button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Sửa kỹ thuật viên" : "Tạo kỹ thuật viên"}
        footer={
          <div className="flex justify-end gap-2">
            <button
              className="rounded-lg border px-4 py-2 text-sm"
              onClick={() => setOpen(false)}
            >
              Huỷ
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
              onClick={save}
              disabled={
                createTechnician.isPending || updateTechnician.isPending
              }
            >
              Lưu
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {editing ? (
            <Input
              label="Nhân sự"
              value={editing.staffFullName || `Staff #${editing.staffID}`}
              disabled
            />
          ) : (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                Nhân sự
              </label>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border-2 border-slate-400 bg-white px-3 py-1.5 text-left text-sm dark:border-slate-500 dark:bg-slate-900"
                onClick={() => setStaffPickerOpen(true)}
              >
                <span
                  className={
                    form.staffID ? "" : "text-slate-500 dark:text-slate-400"
                  }
                >
                  {form.staffID
                    ? (selectedStaff?.fullName ?? `Staff #${form.staffID}`)
                    : "Chọn nhân viên..."}
                </span>
              </button>
            </div>
          )}
          <SelectField
            label="Cấp bậc"
            value={String(form.levelID || "")}
            placeholder="Chọn cấp bậc"
            options={levels.map((level) => ({
              label: level.levelName,
              value: String(level.levelID),
            }))}
            onChange={(event) =>
              setForm({ ...form, levelID: Number(event.target.value) })
            }
          />
          <Input
            label="Ngày vào làm"
            type="date"
            value={form.hireDate.slice(0, 10)}
            onChange={(event) =>
              setForm({ ...form, hireDate: event.target.value })
            }
          />
          {editing && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                Trạng thái sẵn sàng
              </label>
              <div className="rounded-lg border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {editing.isAvailable ? "Rảnh" : "Bận"}
              </div>
            </div>
          )}
          <SelectField
            label="Trạng thái hoạt động"
            value={form.isActive ? "true" : "false"}
            options={[
              { label: "Đang dùng", value: "true" },
              { label: "Tạm dừng", value: "false" },
            ]}
            onChange={(event) =>
              setForm({ ...form, isActive: event.target.value !== "false" })
            }
          />
          <MultiCombobox
            className="md:col-span-2"
            label="Chứng chỉ"
            options={[]}
            value={certifications}
            onChange={setCertifications}
            allowCreate
            placeholder="Nhập tên chứng chỉ và nhấn Enter"
          />
          <Input
            label="Ghi chú"
            className="md:col-span-2"
            value={form.notes ?? ""}
            onChange={(event) =>
              setForm({ ...form, notes: event.target.value })
            }
          />
        </div>
      </Modal>

      <StaffPickerModal
        open={staffPickerOpen}
        selected={form.staffID ? [form.staffID] : []}
        onConfirm={(ids) => {
          setForm({ ...form, staffID: ids[0] ?? 0 });
          setStaffPickerOpen(false);
        }}
        onClose={() => setStaffPickerOpen(false)}
      />

      {/* Confirm xóa kỹ thuật viên - đã ẩn chức năng xóa */}
      {/* {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Xác nhận xóa kỹ thuật viên
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Bạn có chắc muốn xóa kỹ thuật viên{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmDelete.staffFullName || `#${confirmDelete.staffID}`}
                </span>
                ? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                onClick={() => setConfirmDelete(null)}
                disabled={deleteTechnician.isPending}
              >
                Huỷ
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={deleteTechnician.isPending}
                onClick={() => remove(confirmDelete)}
              >
                {deleteTechnician.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

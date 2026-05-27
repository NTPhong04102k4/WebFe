import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable } from "src/components/core/Table/DataTable";
import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import { Modal } from "src/components/core/Modal/Modal";
import {
  useAppointmentDetail,
  useAppointments,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import type {
  AppointmentQueryRequest,
  AppointmentRequest,
  AppointmentViewModel,
} from "src/services/api/functions/workshop/workshop.types";
import { notify } from "src/components/core/Feedback/toast";

import {
  ActionButton,
  Badge,
  formatDate,
  formatMoney,
  getErrorMessage,
  PageHeader,
  TextareaField,
} from "../workshopUi";

type AppointmentForm = {
  customerVehicleID: string;
  locationID: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration_minutes: string;
  assignedTechnicianID: string;
  appointmentType: string;
  customerNote: string;
  staffNote: string;
  serviceID: string;
  estimatedPrice: string;
  serviceNotes: string;
};

const defaults: AppointmentForm = {
  customerVehicleID: "",
  locationID: "",
  scheduledDate: "",
  scheduledTime: "",
  estimatedDuration_minutes: "60",
  assignedTechnicianID: "",
  appointmentType: "Maintenance",
  customerNote: "",
  staffNote: "",
  serviceID: "",
  estimatedPrice: "0",
  serviceNotes: "",
};

const statuses = ["Scheduled", "Confirmed", "In-Progress", "Completed", "Cancelled", "NoShow"];

function statusTone(status: string) {
  if (status === "Completed") return "green" as const;
  if (status === "Confirmed" || status === "In-Progress") return "blue" as const;
  if (status === "Cancelled" || status === "NoShow") return "red" as const;
  return "amber" as const;
}

export default function WorkshopAppointmentsPage() {
  const [query, setQuery] = useState<AppointmentQueryRequest>({ page: 1, pageSize: 20 });
  const [draft, setDraft] = useState({
    status: "",
    locationID: "",
    technicianID: "",
    fromDate: "",
    toDate: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [statusTarget, setStatusTarget] = useState<AppointmentViewModel | null>(null);
  const [nextStatus, setNextStatus] = useState("Confirmed");
  const [cancelReason, setCancelReason] = useState("");

  const { data, isLoading, refetch } = useAppointments(query);
  const detail = useAppointmentDetail(detailId);
  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 200, available: true });
  const { data: serviceRes } = useServiceCatalog({ page: 1, pageSize: 200, isActive: true });
  const technicians = techRes?.data ?? [];
  const services = serviceRes?.data ?? [];
  const mutations = useWorkshopMutations();
  const { register, handleSubmit, reset } = useForm<AppointmentForm>({ defaultValues: defaults });

  const applyFilter = () => {
    setQuery({
      page: 1,
      pageSize: 20,
      status: draft.status || undefined,
      locationID: draft.locationID ? Number(draft.locationID) : undefined,
      technicianID: draft.technicianID ? Number(draft.technicianID) : undefined,
      fromDate: draft.fromDate || undefined,
      toDate: draft.toDate || undefined,
    });
  };

  const createAppointment = async (values: AppointmentForm) => {
    const scheduledDateTime =
      values.scheduledDate && values.scheduledTime
        ? new Date(`${values.scheduledDate}T${values.scheduledTime}`).toISOString()
        : "";

    if (!scheduledDateTime) {
      notify.info("Vui lòng chọn ngày và giờ hẹn");
      return;
    }

    const body: AppointmentRequest = {
      customerVehicleID: Number(values.customerVehicleID),
      locationID: Number(values.locationID),
      scheduledDateTime,
      estimatedDuration_minutes: Number(values.estimatedDuration_minutes),
      assignedTechnicianID: values.assignedTechnicianID
        ? Number(values.assignedTechnicianID)
        : null,
      appointmentType: values.appointmentType,
      customerNote: values.customerNote || null,
      staffNote: values.staffNote || null,
      services: values.serviceID
        ? [
            {
              serviceID: Number(values.serviceID),
              estimatedPrice: Number(values.estimatedPrice || 0),
              notes: values.serviceNotes || null,
            },
          ]
        : [],
    };

    await mutations.createAppointment.mutateAsync(body);
    notify.success("Đã tạo lịch hẹn");
    setFormOpen(false);
    reset(defaults);
  };

  const confirmAppointment = async (id: number) => {
    await mutations.confirmAppointment.mutateAsync(id);
    notify.success("Đã xác nhận lịch hẹn");
  };

  const sendReminder = async (id: number) => {
    await mutations.reminderAppointment.mutateAsync(id);
    notify.success("Đã gửi nhắc hẹn");
  };

  const saveStatus = async () => {
    if (!statusTarget) return;
    if (nextStatus === "Cancelled") {
      await mutations.cancelAppointment.mutateAsync({
        id: statusTarget.appointmentID,
        body: { status: "Cancelled", cancelReason: cancelReason || null },
      });
    } else {
      await mutations.patchAppointmentStatus.mutateAsync({
        id: statusTarget.appointmentID,
        body: { status: nextStatus, cancelReason: cancelReason || null },
      });
    }
    notify.success("Đã cập nhật trạng thái");
    setStatusTarget(null);
    setCancelReason("");
  };

  const columns = useMemo<ColumnDef<AppointmentViewModel>[]>(
    () => [
      { header: "Mã hẹn", accessorKey: "appointmentNumber" },
      {
        header: "Xe",
        cell: ({ row }) =>
          row.original.vehicleInfo ?? `Vehicle #${row.original.customerVehicleID}`,
      },
      {
        header: "Thời gian",
        cell: ({ row }) => formatDate(row.original.scheduledDateTime),
      },
      { header: "Chi nhánh", accessorKey: "locationName" },
      { header: "Kỹ thuật viên", accessorKey: "assignedTechnicianName" },
      {
        header: "Trạng thái",
        cell: ({ row }) => (
          <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      {
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => setDetailId(row.original.appointmentID)}>
              Xem
            </ActionButton>
            <ActionButton onClick={() => confirmAppointment(row.original.appointmentID)}>
              Xác nhận
            </ActionButton>
            <ActionButton
              onClick={() => {
                setStatusTarget(row.original);
                setNextStatus(row.original.status);
              }}
            >
              Trạng thái
            </ActionButton>
            <ActionButton onClick={() => sendReminder(row.original.appointmentID)}>
              Nhắc hẹn
            </ActionButton>
          </div>
        ),
      },
    ],
    [],
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / (query.pageSize ?? 20)),
  );

  const statusOptions = statuses.map((s) => ({ value: s, label: s }));
  const technicianOptions = technicians.map((t) => ({
    value: String(t.technicianID),
    label: t.staffFullName ?? `Tech #${t.technicianID}`,
  }));

  return (
    <div>
      <PageHeader
        title="Lịch hẹn workshop"
        description="Tạo, xác nhận, cập nhật trạng thái và gửi nhắc hẹn cho khách."
        action={
          <div className="flex gap-2">
            <ActionButton onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Tải lại
            </ActionButton>
            <ActionButton variant="primary" onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Tạo lịch
            </ActionButton>
          </div>
        }
      />

      {/* Filter bar */}
      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
        <Select
          label="Trạng thái"
          placeholder="Tất cả"
          value={draft.status}
          onChange={(e) => setDraft((s) => ({ ...s, status: e.target.value }))}
          options={statusOptions}
        />
        <Input
          label="Location ID"
          type="number"
          min={1}
          value={draft.locationID}
          onChange={(e) => setDraft((s) => ({ ...s, locationID: e.target.value }))}
        />
        <Select
          label="Kỹ thuật viên"
          placeholder="Tất cả"
          value={draft.technicianID}
          onChange={(e) => setDraft((s) => ({ ...s, technicianID: e.target.value }))}
          options={technicianOptions}
        />
        <Input
          label="Từ ngày"
          type="date"
          value={draft.fromDate}
          onChange={(e) => setDraft((s) => ({ ...s, fromDate: e.target.value }))}
        />
        <Input
          label="Đến ngày"
          type="date"
          value={draft.toDate}
          onChange={(e) => setDraft((s) => ({ ...s, toDate: e.target.value }))}
        />
        <div className="flex gap-2 md:col-span-5">
          <ActionButton variant="primary" onClick={applyFilter}>
            Lọc
          </ActionButton>
          <ActionButton
            onClick={() => {
              setDraft({
                status: "",
                locationID: "",
                technicianID: "",
                fromDate: "",
                toDate: "",
              });
              setQuery({ page: 1, pageSize: 20 });
            }}
          >
            Xóa lọc
          </ActionButton>
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => String(row.appointmentID)}
        loading={isLoading}
        enablePagination={false}
        emptyTitle="Chưa có lịch hẹn"
      />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tổng {data?.totalCount ?? 0} lịch hẹn</span>
        <div className="flex gap-2">
          <ActionButton
            disabled={(query.page ?? 1) <= 1}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}
          >
            Trước
          </ActionButton>
          <span className="px-2 py-2">
            Trang {query.page ?? 1}/{totalPages}
          </span>
          <ActionButton
            disabled={(query.page ?? 1) >= totalPages}
            onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}
          >
            Sau
          </ActionButton>
        </div>
      </div>

      {/* Create appointment modal */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Tạo lịch hẹn"
        size="xl"
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setFormOpen(false)}>Hủy</ActionButton>
            <ActionButton
              variant="primary"
              onClick={handleSubmit(createAppointment)}
              disabled={mutations.createAppointment.isPending}
            >
              Tạo lịch
            </ActionButton>
          </div>
        }
      >
        <AppointmentFields
          register={register}
          technicians={technicians}
          services={services}
        />
      </Modal>

      {/* Detail modal */}
      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title="Chi tiết lịch hẹn"
        size="xl"
      >
        {detail.isLoading ? (
          <p className="text-sm text-slate-500">Đang tải...</p>
        ) : detail.data ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Mã hẹn" value={detail.data.appointmentNumber} />
              <Info
                label="Trạng thái"
                value={
                  <Badge tone={statusTone(detail.data.status)}>
                    {detail.data.status}
                  </Badge>
                }
              />
              <Info
                label="Xe"
                value={detail.data.vehicleInfo ?? detail.data.customerVehicleID}
              />
              <Info label="Thời gian" value={formatDate(detail.data.scheduledDateTime)} />
              <Info
                label="Chi nhánh"
                value={detail.data.locationName ?? detail.data.locationID}
              />
              <Info
                label="Kỹ thuật viên"
                value={detail.data.assignedTechnicianName ?? "-"}
              />
              <Info label="Loại hẹn" value={detail.data.appointmentType} />
              <Info
                label="Nhắc hẹn"
                value={
                  detail.data.reminderSent
                    ? `Đã gửi ${formatDate(detail.data.reminderSentDate)}`
                    : "Chưa gửi"
                }
              />
            </div>
            <Info label="Ghi chú khách" value={detail.data.customerNote ?? "-"} />
            <Info label="Ghi chú staff" value={detail.data.staffNote ?? "-"} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="py-2">Dịch vụ</th>
                    <th>Giá dự kiến</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {(detail.data.services ?? []).map((service) => (
                    <tr key={service.appointmentServiceID}>
                      <td className="py-2">{service.serviceName ?? service.serviceID}</td>
                      <td>{formatMoney(service.estimatedPrice)}</td>
                      <td>{service.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Status update modal */}
      <Modal
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        title="Cập nhật trạng thái"
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setStatusTarget(null)}>Hủy</ActionButton>
            <ActionButton
              variant="primary"
              onClick={saveStatus}
              disabled={
                mutations.patchAppointmentStatus.isPending ||
                mutations.cancelAppointment.isPending
              }
            >
              Lưu
            </ActionButton>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Trạng thái"
            value={nextStatus}
            onChange={(e) => setNextStatus(e.target.value)}
            options={statusOptions}
          />
          <TextareaField
            label="Lý do hủy / ghi chú"
            value={cancelReason}
            onChange={setCancelReason}
          />
        </div>
      </Modal>
    </div>
  );
}

function AppointmentFields({
  register,
  technicians,
  services,
}: {
  register: ReturnType<typeof useForm<AppointmentForm>>["register"];
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
  services: Array<{
    serviceID: number;
    serviceName: string;
    serviceCode: string;
    price: number;
  }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="CustomerVehicleID"
        type="number"
        min={1}
        required
        {...register("customerVehicleID", { required: true })}
      />
      <Input
        label="Location ID"
        type="number"
        min={1}
        required
        {...register("locationID", { required: true })}
      />
      <Input
        label="Ngày hẹn"
        type="date"
        required
        {...register("scheduledDate", { required: true })}
      />
      <Input
        label="Giờ hẹn"
        type="time"
        required
        {...register("scheduledTime", { required: true })}
      />
      <Input
        label="Thời lượng (phút)"
        type="number"
        min={15}
        max={1440}
        {...register("estimatedDuration_minutes")}
      />
      <Select
        label="Kỹ thuật viên"
        placeholder="Chưa gán"
        options={technicians.map((t) => ({
          value: t.technicianID,
          label: t.staffFullName ?? `Tech #${t.technicianID}`,
        }))}
        {...register("assignedTechnicianID")}
      />
      <Select
        label="Loại hẹn"
        options={[
          { value: "Maintenance", label: "Maintenance" },
          { value: "Repair", label: "Repair" },
          { value: "Inspection", label: "Inspection" },
        ]}
        {...register("appointmentType")}
      />
      <Select
        label="Dịch vụ"
        placeholder="Chưa chọn"
        options={services.map((s) => ({
          value: s.serviceID,
          label: `${s.serviceName} - ${s.price.toLocaleString("vi-VN")} VND`,
        }))}
        {...register("serviceID")}
      />
      <Input
        label="Giá dự kiến"
        type="number"
        min={0}
        {...register("estimatedPrice")}
      />
      <Input label="Ghi chú dịch vụ" {...register("serviceNotes")} />
      <Input label="Ghi chú staff" {...register("staffNote")} />
      <div className="sm:col-span-2">
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
            Ghi chú khách
          </span>
          <textarea
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
            rows={3}
            {...register("customerNote")}
          />
        </label>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}
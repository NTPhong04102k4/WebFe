import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, RefreshCw, X, ClipboardCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable } from "src/components/core/Table/DataTable";
import { Input } from "src/components/core/Form/Input";
import { Select } from "src/components/core/Select/Select";
import { Modal } from "src/components/core/Modal/Modal";
import {
  useAppointmentDetail,
  useAppointments,
  useCheckInAppointment,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import type { AppointmentStatus } from "src/services/api/functions/workshop/workshop.types";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import type {
  AppointmentQueryRequest,
  AppointmentRequest,
  AppointmentViewModel,
} from "src/services/api/functions/workshop/workshop.types";
import { notify } from "src/components/core/Feedback/toast";
import { useLocationList } from "src/query/location/useLocationQueries";
import { VehicleAutocomplete } from "../VehicleAutocomplete";

import {
  ActionButton,
  Badge,
  formatDate,
  formatMoney,
  getErrorMessage,
  PageHeader,
  TextareaField,
} from "../workshopUi";

// ── Types ─────────────────────────────────────────────────────────────────────

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
};

/** Một dòng dịch vụ khi tạo lịch hẹn */
type ServiceRow = {
  serviceID: string;
  estimatedPrice: string;
  notes: string;
};

/** Form check-in + tạo Work Order */
type CheckInForm = {
  primaryTechnicianId: string;
  mileageIn: string;
  priority: string;
  customerComplaint: string;
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
};

const checkInDefaults: CheckInForm = {
  primaryTechnicianId: "",
  mileageIn: "0",
  priority: "Normal",
  customerComplaint: "",
};

const statuses = ["Scheduled", "Confirmed", "In-Progress", "Completed", "Cancelled", "NoShow"];

const priorityOptions = [
  { value: "Low", label: "Thấp" },
  { value: "Normal", label: "Bình thường" },
  { value: "High", label: "Cao" },
  { value: "Urgent", label: "Khẩn cấp" },
];

function statusTone(status: string) {
  if (status === "Completed") return "green" as const;
  if (status === "Confirmed" || status === "In-Progress") return "blue" as const;
  if (status === "Cancelled" || status === "NoShow") return "red" as const;
  return "amber" as const;
}

export const STATUS_LABELS: Record<string, string> = {
  Scheduled: "Đã lên lịch",
  Confirmed: "Đã xác nhận",
  "In-Progress": "Đang sửa chữa",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
  NoShow: "Khách không đến",
};

export const TYPE_LABELS: Record<string, string> = {
  Maintenance: "Bảo dưỡng",
  Repair: "Sửa chữa",
  Inspection: "Kiểm tra",
};

// ── Component chính ───────────────────────────────────────────────────────────

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

  // Tính năng C: danh sách dịch vụ trong form tạo lịch
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([
    { serviceID: "", estimatedPrice: "0", notes: "" },
  ]);

  // Tính năng A: check-in
  const [checkInTarget, setCheckInTarget] = useState<AppointmentViewModel | null>(null);
  const [checkInForm, setCheckInForm] = useState<CheckInForm>(checkInDefaults);

  const { data, isLoading, refetch } = useAppointments(query);
  const detail = useAppointmentDetail(detailId);
  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 200, available: true });
  const { data: serviceRes } = useServiceCatalog({ page: 1, pageSize: 200, isActive: true });
  // Tính năng B: danh sách chi nhánh
  const { data: locationList } = useLocationList();

  const technicians = techRes?.data ?? [];
  const services = serviceRes?.data ?? [];
  const locations = locationList ?? [];

  const mutations = useWorkshopMutations();
  const { register, handleSubmit, reset, setValue, watch } = useForm<AppointmentForm>({ defaultValues: defaults });
  const watchVehicleId = watch("customerVehicleID");

  // Tính năng A: hook check-in với xử lý conflict
  const checkInMutation = useCheckInAppointment({
    onConflict: (appointmentId) => {
      notify.error(`Lịch hẹn #${appointmentId} đã được check-in trước đó (đã có phiếu công việc).`);
    },
    onAppointmentNotFound: () => {
      notify.error("Lịch hẹn không tồn tại hoặc đã bị hủy.");
    },
  });

  // ── Filter ───────────────────────────────────────────────────────────────

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

  // ── Tạo lịch hẹn ─────────────────────────────────────────────────────────

  const createAppointment = async (values: AppointmentForm) => {
    const scheduledDateTime =
      values.scheduledDate && values.scheduledTime
        ? new Date(`${values.scheduledDate}T${values.scheduledTime}`).toISOString()
        : "";

    if (!scheduledDateTime) {
      notify.info("Vui lòng chọn ngày và giờ hẹn");
      return;
    }

    // Tính năng C: build mảng services từ serviceRows
    const validServices = serviceRows
      .filter((r) => r.serviceID !== "")
      .map((r) => ({
        serviceID: Number(r.serviceID),
        notes: r.notes || null,
      }));

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
      services: validServices,
    };

    await mutations.createAppointment.mutateAsync(body);
    notify.success("Đã tạo lịch hẹn");
    setFormOpen(false);
    reset(defaults);
    setServiceRows([{ serviceID: "", estimatedPrice: "0", notes: "" }]);
  };

  // ── Xác nhận / nhắc hẹn ─────────────────────────────────────────────────

  const confirmAppointment = async (id: number) => {
    await mutations.confirmAppointment.mutateAsync(id);
    notify.success("Đã xác nhận lịch hẹn");
  };

  const sendReminder = async (id: number) => {
    await mutations.reminderAppointment.mutateAsync(id);
    notify.success("Đã gửi nhắc hẹn");
  };

  // ── Cập nhật trạng thái ──────────────────────────────────────────────────

  const saveStatus = async () => {
    if (!statusTarget) return;
    try {
      if (nextStatus === "Cancelled") {
        await mutations.cancelAppointment.mutateAsync({
          id: statusTarget.appointmentID,
          body: { status: "Cancelled", cancelReason: cancelReason || null },
        });
      } else {
        await mutations.patchAppointmentStatus.mutateAsync({
          id: statusTarget.appointmentID,
          body: { status: nextStatus as AppointmentStatus },
        });
      }
      notify.success("Đã cập nhật trạng thái");
      setStatusTarget(null);
      setCancelReason("");
    } catch {
      // interceptor đã hiện toast lỗi, giữ modal mở để user có thể thử lại
    }
  };

  // ── Tính năng A: Check-in ─────────────────────────────────────────────────

  const openCheckIn = (appt: AppointmentViewModel) => {
    setCheckInTarget(appt);
    setCheckInForm(checkInDefaults);
  };

  const handleCheckIn = async () => {
    if (!checkInTarget) return;

    if (!checkInForm.primaryTechnicianId) {
      notify.info("Vui lòng chọn kỹ thuật viên phụ trách");
      return;
    }

    try {
      const result = await checkInMutation.mutateAsync({
        id: checkInTarget.appointmentID,
        body: {
          primaryTechnicianId: Number(checkInForm.primaryTechnicianId),
          mileageIn: Number(checkInForm.mileageIn || 0),
          priority: checkInForm.priority || "Normal",
          customerComplaint: checkInForm.customerComplaint || null,
        },
      });

      notify.success(
        `Đã check-in và tạo phiếu công việc${result?.workOrderNumber ? ` #${result.workOrderNumber}` : ""}` +
          (result?.servicesCount ? ` (${result.servicesCount} dịch vụ)` : ""),
      );
      setCheckInTarget(null);
      // Nếu đang xem detail của appointment này thì refetch
      if (detailId === checkInTarget.appointmentID) {
        detail.refetch();
      }
    } catch (err) {
      // Conflict / AppointmentNotFound được xử lý bởi onError trong hook
      // Các lỗi khác thì toast
      const msg = getErrorMessage(err);
      if (
        !(err as any)?.response?.data?.errorCode?.includes("Conflict") &&
        !(err as any)?.response?.data?.errorCode?.includes("AppointmentNotFound")
      ) {
        notify.error(msg);
      }
    }
  };

  const handleQuickCheckIn = async (appt: AppointmentViewModel) => {
    const techId = appt.assignedTechnicianID || technicians[0]?.technicianID;
    if (!techId) {
      notify.error("Không tìm thấy kỹ thuật viên khả dụng để gán. Vui lòng check-in chi tiết.");
      return;
    }
    try {
      const result = await checkInMutation.mutateAsync({
        id: appt.appointmentID,
        body: {
          primaryTechnicianId: Number(techId),
          mileageIn: 0,
          priority: "Normal",
          customerComplaint: appt.customerNote || null,
        },
      });
      notify.success(
        `Đã check-in nhanh và tạo phiếu công việc${result?.workOrderNumber ? ` #${result.workOrderNumber}` : ""}` +
          (result?.servicesCount ? ` (${result.servicesCount} dịch vụ)` : ""),
      );
      if (detailId === appt.appointmentID) {
        detail.refetch();
      }
    } catch (err) {
      const msg = getErrorMessage(err);
      if (
        !(err as any)?.response?.data?.errorCode?.includes("Conflict") &&
        !(err as any)?.response?.data?.errorCode?.includes("AppointmentNotFound")
      ) {
        notify.error(msg);
      }
    }
  };

  // ── Tính năng C: quản lý service rows ───────────────────────────────────

  const addServiceRow = () => {
    setServiceRows((prev) => [...prev, { serviceID: "", estimatedPrice: "0", notes: "" }]);
  };

  const removeServiceRow = (index: number) => {
    setServiceRows((prev) => prev.filter((_, i) => i !== index));
  };

  const updateServiceRow = (index: number, field: keyof ServiceRow, value: string) => {
    setServiceRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  // Auto-fill giá khi chọn dịch vụ
  const handleServiceSelect = (index: number, serviceId: string) => {
    const found = services.find((s) => String(s.serviceID) === serviceId);
    setServiceRows((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
              ...row,
              serviceID: serviceId,
              estimatedPrice: found ? String(found.price) : row.estimatedPrice,
            }
          : row,
      ),
    );
  };

  // ── Columns ───────────────────────────────────────────────────────────────

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
          <Badge tone={statusTone(row.original.status)}>{STATUS_LABELS[row.original.status] ?? row.original.status}</Badge>
        ),
      },
      {
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => {
          const appt = row.original;
          const canCheckIn =
            (appt.status === "Confirmed" || appt.status === "Scheduled") &&
            !appt.workOrderID;
          const canConfirm = appt.status === "Pending" || appt.status === "Scheduled";
          return (
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => setDetailId(appt.appointmentID)}>Xem</ActionButton>
              {canConfirm && (
                <ActionButton onClick={() => confirmAppointment(appt.appointmentID)}>
                  Xác nhận
                </ActionButton>
              )}
              {canCheckIn && (
                <>
                  <ActionButton variant="primary" onClick={() => handleQuickCheckIn(appt)}>
                    <ClipboardCheck className="mr-1 h-3.5 w-3.5" />
                    Check-in nhanh
                  </ActionButton>
                  <ActionButton onClick={() => openCheckIn(appt)}>
                    Chi tiết
                  </ActionButton>
                </>
              )}
              <ActionButton
                onClick={() => {
                  setStatusTarget(appt);
                  setNextStatus(appt.status);
                }}
              >
                Trạng thái
              </ActionButton>
              <ActionButton onClick={() => sendReminder(appt.appointmentID)}>
                Nhắc hẹn
              </ActionButton>
            </div>
          );
        },
      },
    ],
    [],
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.totalCount ?? 0) / (query.pageSize ?? 20)),
  );

  const statusOptions = statuses.map((s) => ({ value: s, label: STATUS_LABELS[s] ?? s }));
  const technicianOptions = technicians.map((t) => ({
    value: String(t.technicianID),
    label: t.staffFullName ?? `Tech #${t.technicianID}`,
  }));
  // Tính năng B: options cho chi nhánh
  const locationOptions = locations.map((loc) => ({
    value: String(loc.locationID),
    label: `${loc.locationName} (${loc.city})`,
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
        {/* Tính năng B: filter chi nhánh qua dropdown */}
        <Select
          label="Chi nhánh"
          placeholder="Tất cả"
          value={draft.locationID}
          onChange={(e) => setDraft((s) => ({ ...s, locationID: e.target.value }))}
          options={locationOptions}
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

      {/* ── Modal tạo lịch hẹn ── */}
      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          reset(defaults);
          setServiceRows([{ serviceID: "", estimatedPrice: "0", notes: "" }]);
        }}
        title="Tạo lịch hẹn"
        size="xl"
        closeOnBackdrop={false}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton
              onClick={() => {
                setFormOpen(false);
                reset(defaults);
                setServiceRows([{ serviceID: "", estimatedPrice: "0", notes: "" }]);
              }}
            >
              Hủy
            </ActionButton>
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
          setValue={setValue}
          watchVehicleId={watchVehicleId}
          technicians={technicians}
          locations={locations}
          services={services}
          serviceRows={serviceRows}
          onAddService={addServiceRow}
          onRemoveService={removeServiceRow}
          onUpdateService={updateServiceRow}
          onServiceSelect={handleServiceSelect}
        />
      </Modal>

      {/* ── Modal chi tiết lịch hẹn ── */}
      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title="Chi tiết lịch hẹn"
        size="xl"
        footer={
          detail.data &&
          (detail.data.status === "Confirmed" || detail.data.status === "Scheduled") &&
          !detail.data.workOrderID ? (
            <div className="flex justify-end">
              <ActionButton
                variant="primary"
                onClick={() => {
                  if (detail.data) {
                    setDetailId(null);
                    openCheckIn(detail.data);
                  }
                }}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Check-in & Tạo phiếu công việc
              </ActionButton>
            </div>
          ) : undefined
        }
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
                    {STATUS_LABELS[detail.data.status] ?? detail.data.status}
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
              <Info label="Loại hẹn" value={TYPE_LABELS[detail.data.appointmentType] ?? detail.data.appointmentType} />
              <Info
                label="Nhắc hẹn"
                value={
                  detail.data.reminderSent
                    ? `Đã gửi ${formatDate(detail.data.reminderSentDate)}`
                    : "Chưa gửi"
                }
              />
              {detail.data.workOrderID && (
                <Info
                  label="Phiếu công việc"
                  value={
                    <span className="font-medium text-blue-600">
                      {detail.data.workOrderNumber ?? `#${detail.data.workOrderID}`}
                    </span>
                  }
                />
              )}
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

      {/* ── Modal cập nhật trạng thái ── */}
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

      {/* ── Modal Check-in & Tạo Work Order (Tính năng A) ── */}
      <Modal
        open={checkInTarget !== null}
        onClose={() => setCheckInTarget(null)}
        title="Check-in & Tạo phiếu công việc"
        size="lg"
        closeOnBackdrop={false}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton onClick={() => setCheckInTarget(null)}>Hủy</ActionButton>
            <ActionButton
              variant="primary"
              onClick={handleCheckIn}
              disabled={checkInMutation.isPending}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {checkInMutation.isPending ? "Đang xử lý..." : "Xác nhận Check-in"}
            </ActionButton>
          </div>
        }
      >
        {checkInTarget && (
          <div className="space-y-4">
            {/* Thông tin tóm tắt appointment */}
            <div className="rounded-lg bg-blue-50 p-3 text-sm dark:bg-blue-900/20">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                {checkInTarget.appointmentNumber}
              </p>
              <p className="mt-1 text-blue-700 dark:text-blue-300">
                {checkInTarget.vehicleInfo ?? `Xe #${checkInTarget.customerVehicleID}`}
              </p>
              <p className="text-blue-600 dark:text-blue-400">
                {checkInTarget.locationName} · {formatDate(checkInTarget.scheduledDateTime)}
              </p>
              {checkInTarget.workOrderID && (
                <p className="mt-1 font-semibold text-amber-600 dark:text-amber-400">
                  ⚠ Đã có phiếu công việc #{checkInTarget.workOrderNumber}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Kỹ thuật viên phụ trách */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                  Kỹ thuật viên phụ trách <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
                  value={checkInForm.primaryTechnicianId}
                  onChange={(e) =>
                    setCheckInForm((f) => ({ ...f, primaryTechnicianId: e.target.value }))
                  }
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  {technicians.map((t) => (
                    <option key={t.technicianID} value={t.technicianID}>
                      {t.staffFullName ?? `Tech #${t.technicianID}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Km vào */}
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                  Số km vào (odometer)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
                  value={checkInForm.mileageIn}
                  onChange={(e) =>
                    setCheckInForm((f) => ({ ...f, mileageIn: e.target.value }))
                  }
                />
              </div>

              {/* Độ ưu tiên */}
              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
                  value={checkInForm.priority}
                  onChange={(e) =>
                    setCheckInForm((f) => ({ ...f, priority: e.target.value }))
                  }
                >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phàn nàn của khách */}
            <TextareaField
              label="Khiếu nại / mô tả vấn đề của khách"
              value={checkInForm.customerComplaint}
              onChange={(val) => setCheckInForm((f) => ({ ...f, customerComplaint: val }))}
              rows={3}
            />

            <p className="text-xs text-slate-500 dark:text-slate-400">
              * Backend sẽ tự động copy danh sách dịch vụ từ lịch hẹn vào phiếu công việc.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── AppointmentFields (Tính năng B + C) ──────────────────────────────────────

function AppointmentFields({
  register,
  setValue,
  watchVehicleId,
  technicians,
  locations,
  services,
  serviceRows,
  onAddService,
  onRemoveService,
  onUpdateService,
  onServiceSelect,
}: {
  register: ReturnType<typeof useForm<AppointmentForm>>["register"];
  setValue: ReturnType<typeof useForm<AppointmentForm>>["setValue"];
  watchVehicleId: string;
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
  locations: Array<{ locationID: number; locationName: string; city: string }>;
  services: Array<{
    serviceID: number;
    serviceName: string;
    serviceCode: string;
    price: number;
  }>;
  serviceRows: ServiceRow[];
  onAddService: () => void;
  onRemoveService: (index: number) => void;
  onUpdateService: (index: number, field: keyof ServiceRow, value: string) => void;
  onServiceSelect: (index: number, serviceId: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <VehicleAutocomplete
          value={watchVehicleId}
          onSelect={(veh) => {
            setValue("customerVehicleID", String(veh.customerVehicleID));
          }}
          required
          label="Xe khách hàng"
        />
        <input
          type="hidden"
          {...register("customerVehicleID", { required: true })}
        />
      </div>

      {/* Tính năng B: dropdown chi nhánh */}
      <div>
        <label className="block text-sm font-medium text-slate-800 dark:text-slate-100 mb-1">
          Chi nhánh <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
          {...register("locationID", { required: true })}
        >
          <option value="">-- Chọn chi nhánh --</option>
          {locations.map((loc) => (
            <option key={loc.locationID} value={loc.locationID}>
              {loc.locationName} ({loc.city})
            </option>
          ))}
        </select>
      </div>

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
          { value: "Maintenance", label: "Bảo dưỡng" },
          { value: "Repair", label: "Sửa chữa" },
          { value: "Inspection", label: "Kiểm tra" },
        ]}
        {...register("appointmentType")}
      />
      <Input label="Ghi chú staff" {...register("staffNote")} />

      {/* Tính năng C: Multi-service selection */}
      <div className="sm:col-span-2">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Dịch vụ đăng ký
          </span>
          <button
            type="button"
            onClick={onAddService}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Thêm dịch vụ
          </button>
        </div>

        <div className="space-y-2">
          {serviceRows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_120px_1fr_auto] gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/50"
            >
              {/* Chọn dịch vụ */}
              <select
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                value={row.serviceID}
                onChange={(e) => onServiceSelect(index, e.target.value)}
              >
                <option value="">-- Chọn dịch vụ --</option>
                {services.map((s) => (
                  <option key={s.serviceID} value={s.serviceID}>
                    {s.serviceName}
                  </option>
                ))}
              </select>

              {/* Giá dự kiến */}
              <input
                type="number"
                min={0}
                placeholder="Giá (VND)"
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                value={row.estimatedPrice}
                onChange={(e) => onUpdateService(index, "estimatedPrice", e.target.value)}
              />

              {/* Ghi chú */}
              <input
                type="text"
                placeholder="Ghi chú dịch vụ..."
                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                value={row.notes}
                onChange={(e) => onUpdateService(index, "notes", e.target.value)}
              />

              {/* Xóa */}
              <button
                type="button"
                onClick={() => onRemoveService(index)}
                disabled={serviceRows.length === 1}
                className="flex items-center justify-center rounded p-1.5 text-slate-400 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition"
                title="Xóa dịch vụ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {serviceRows.some((r) => r.serviceID) && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {serviceRows.filter((r) => r.serviceID).length} dịch vụ đã chọn
          </p>
        )}
      </div>

      {/* Ghi chú khách */}
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

// ── Info row ─────────────────────────────────────────────────────────────────

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-slate-900 dark:text-slate-100">{value}</div>
    </div>
  );
}

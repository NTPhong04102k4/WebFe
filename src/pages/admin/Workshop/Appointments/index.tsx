import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable, Input, Modal } from "@/components/common";
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
  scheduledDateTime: string;
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
  scheduledDateTime: "",
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
    const body: AppointmentRequest = {
      customerVehicleID: Number(values.customerVehicleID),
      locationID: Number(values.locationID),
      scheduledDateTime: new Date(values.scheduledDateTime).toISOString(),
      estimatedDuration_minutes: Number(values.estimatedDuration_minutes),
      assignedTechnicianID: values.assignedTechnicianID ? Number(values.assignedTechnicianID) : null,
      appointmentType: values.appointmentType,
      customerNote: values.customerNote || null,
      staffNote: values.staffNote || null,
      services: values.serviceID
        ? [{
            serviceID: Number(values.serviceID),
            estimatedPrice: Number(values.estimatedPrice || 0),
            notes: values.serviceNotes || null,
          }]
        : [],
    };

    try {
      await mutations.createAppointment.mutateAsync(body);
      notify.success("Da tao lich hen");
      setFormOpen(false);
      reset(defaults);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const confirmAppointment = async (id: number) => {
    try {
      await mutations.confirmAppointment.mutateAsync(id);
      notify.success("Da xac nhan lich hen");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const sendReminder = async (id: number) => {
    try {
      await mutations.reminderAppointment.mutateAsync(id);
      notify.success("Da gui nhac hen");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

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
          body: { status: nextStatus, cancelReason: cancelReason || null },
        });
      }
      notify.success("Da cap nhat trang thai");
      setStatusTarget(null);
      setCancelReason("");
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const columns = useMemo<ColumnDef<AppointmentViewModel>[]>(
    () => [
      { header: "Ma hen", accessorKey: "appointmentNumber" },
      {
        header: "Xe",
        cell: ({ row }) => row.original.vehicleInfo ?? `Vehicle #${row.original.customerVehicleID}`,
      },
      {
        header: "Thoi gian",
        cell: ({ row }) => formatDate(row.original.scheduledDateTime),
      },
      { header: "Chi nhanh", accessorKey: "locationName" },
      { header: "Ky thuat vien", accessorKey: "assignedTechnicianName" },
      {
        header: "Trang thai",
        cell: ({ row }) => <Badge tone={statusTone(row.original.status)}>{row.original.status}</Badge>,
      },
      {
        header: "Thao tac",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => setDetailId(row.original.appointmentID)}>Xem</ActionButton>
            <ActionButton onClick={() => confirmAppointment(row.original.appointmentID)}>Confirm</ActionButton>
            <ActionButton onClick={() => {
              setStatusTarget(row.original);
              setNextStatus(row.original.status);
            }}>Status</ActionButton>
            <ActionButton onClick={() => sendReminder(row.original.appointmentID)}>Reminder</ActionButton>
          </div>
        ),
      },
    ],
    []
  );

  const rows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.totalCount ?? 0) / (query.pageSize ?? 20)));

  return (
    <div>
      <PageHeader
        title="Lich hen workshop"
        description="Tao, xac nhan, cap nhat trang thai va gui nhac hen cho khach."
        action={
          <div className="flex gap-2">
            <ActionButton onClick={() => refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Tai lai</ActionButton>
            <ActionButton variant="primary" onClick={() => setFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tao lich</ActionButton>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
        <Select label="Trang thai" value={draft.status} onChange={(value) => setDraft((s) => ({ ...s, status: value }))} options={statuses} />
        <Input label="LocationID" type="number" min={1} value={draft.locationID} onChange={(e) => setDraft((s) => ({ ...s, locationID: e.target.value }))} />
        <Select label="Ky thuat vien" value={draft.technicianID} onChange={(value) => setDraft((s) => ({ ...s, technicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
        <Input label="Tu ngay" type="date" value={draft.fromDate} onChange={(e) => setDraft((s) => ({ ...s, fromDate: e.target.value }))} />
        <Input label="Den ngay" type="date" value={draft.toDate} onChange={(e) => setDraft((s) => ({ ...s, toDate: e.target.value }))} />
        <div className="flex gap-2 md:col-span-5">
          <ActionButton variant="primary" onClick={applyFilter}>Loc</ActionButton>
          <ActionButton onClick={() => {
            setDraft({ status: "", locationID: "", technicianID: "", fromDate: "", toDate: "" });
            setQuery({ page: 1, pageSize: 20 });
          }}>Xoa loc</ActionButton>
        </div>
      </div>

      <DataTable data={rows} columns={columns} getRowId={(row) => String(row.appointmentID)} loading={isLoading} enablePagination={false} emptyTitle="Chua co lich hen" />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tong {data?.totalCount ?? 0} lich hen</span>
        <div className="flex gap-2">
          <ActionButton disabled={(query.page ?? 1) <= 1} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>Truoc</ActionButton>
          <span className="px-2 py-2">Trang {query.page ?? 1}/{totalPages}</span>
          <ActionButton disabled={(query.page ?? 1) >= totalPages} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>Sau</ActionButton>
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Tao lich hen" size="xl" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setFormOpen(false)}>Huy</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit(createAppointment)} disabled={mutations.createAppointment.isPending}>Tao lich</ActionButton>
        </div>
      }>
        <AppointmentFields register={register} technicians={technicians} services={services} />
      </Modal>

      <Modal open={detailId !== null} onClose={() => setDetailId(null)} title="Chi tiet lich hen" size="xl">
        {detail.isLoading ? <p>Dang tai...</p> : detail.data ? (
          <div className="space-y-4 text-sm">
            <div className="grid gap-2 sm:grid-cols-2">
              <Info label="Ma hen" value={detail.data.appointmentNumber} />
              <Info label="Trang thai" value={<Badge tone={statusTone(detail.data.status)}>{detail.data.status}</Badge>} />
              <Info label="Xe" value={detail.data.vehicleInfo ?? detail.data.customerVehicleID} />
              <Info label="Thoi gian" value={formatDate(detail.data.scheduledDateTime)} />
              <Info label="Chi nhanh" value={detail.data.locationName ?? detail.data.locationID} />
              <Info label="Ky thuat vien" value={detail.data.assignedTechnicianName ?? "-"} />
              <Info label="Loai hen" value={detail.data.appointmentType} />
              <Info label="Nhac hen" value={detail.data.reminderSent ? `Da gui ${formatDate(detail.data.reminderSentDate)}` : "Chua gui"} />
            </div>
            <Info label="Ghi chu khach" value={detail.data.customerNote ?? "-"} />
            <Info label="Ghi chu staff" value={detail.data.staffNote ?? "-"} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-500">
                  <tr><th className="py-2">Dich vu</th><th>Gia du kien</th><th>Ghi chu</th></tr>
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

      <Modal open={statusTarget !== null} onClose={() => setStatusTarget(null)} title="Cap nhat trang thai" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setStatusTarget(null)}>Huy</ActionButton>
          <ActionButton variant="primary" onClick={saveStatus} disabled={mutations.patchAppointmentStatus.isPending || mutations.cancelAppointment.isPending}>Luu</ActionButton>
        </div>
      }>
        <div className="space-y-4">
          <Select label="Trang thai" value={nextStatus} onChange={setNextStatus} options={statuses} />
          <TextareaField label="Ly do huy / ghi chu" value={cancelReason} onChange={setCancelReason} />
        </div>
      </Modal>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | { value: string; label: string }>;
}) {
  return (
    <label className="space-y-1">
      <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900">
        <option value="">Tat ca</option>
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
    </label>
  );
}

function AppointmentFields({
  register,
  technicians,
  services,
}: {
  register: ReturnType<typeof useForm<AppointmentForm>>["register"];
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
  services: Array<{ serviceID: number; serviceName: string; serviceCode: string; price: number }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="CustomerVehicleID" type="number" min={1} required {...register("customerVehicleID", { required: true })} />
      <Input label="LocationID" type="number" min={1} required {...register("locationID", { required: true })} />
      <Input label="Thoi gian hen" type="datetime-local" required {...register("scheduledDateTime", { required: true })} />
      <Input label="Thoi luong phut" type="number" min={15} max={1440} {...register("estimatedDuration_minutes")} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Ky thuat vien</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("assignedTechnicianID")}>
          <option value="">Chua gan</option>
          {technicians.map((t) => <option key={t.technicianID} value={t.technicianID}>{t.staffFullName ?? `Tech #${t.technicianID}`}</option>)}
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Loai hen</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("appointmentType")}>
          <option value="Maintenance">Maintenance</option>
          <option value="Repair">Repair</option>
          <option value="Inspection">Inspection</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Dich vu</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("serviceID")}>
          <option value="">Chua chon</option>
          {services.map((service) => (
            <option key={service.serviceID} value={service.serviceID}>
              {service.serviceName} - {service.price.toLocaleString("vi-VN")} VND
            </option>
          ))}
        </select>
      </label>
      <Input label="Gia du kien" type="number" min={0} {...register("estimatedPrice")} />
      <Input label="Ghi chu dich vu" {...register("serviceNotes")} />
      <Input label="Ghi chu staff" {...register("staffNote")} />
      <label className="space-y-1 sm:col-span-2">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Ghi chu khach</span>
        <textarea className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" rows={3} {...register("customerNote")} />
      </label>
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

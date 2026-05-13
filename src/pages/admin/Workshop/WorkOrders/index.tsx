import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { DataTable, Input, Modal } from "@/components/common";
import {
  useWorkOrderDetail,
  useWorkOrders,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import type {
  WorkOrderQueryRequest,
  WorkOrderRequest,
  WorkOrderViewModel,
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

type CreateForm = {
  appointmentID: string;
  customerVehicleID: string;
  locationID: string;
  primaryTechnicianID: string;
  serviceAdvisorID: string;
  priority: string;
  mileageIn: string;
  customerComplaint: string;
};

const createDefaults: CreateForm = {
  appointmentID: "",
  customerVehicleID: "",
  locationID: "",
  primaryTechnicianID: "",
  serviceAdvisorID: "",
  priority: "Normal",
  mileageIn: "0",
  customerComplaint: "",
};

const workStatuses = ["Open", "InProgress", "WaitingParts", "QualityCheck", "Completed", "Delivered", "Cancelled"];
const priorities = ["Low", "Normal", "High", "Urgent"];
const paymentMethods = ["Cash", "Card", "Transfer", "VNPay", "Momo"];

function tone(status: string) {
  if (status === "Completed" || status === "Delivered") return "green" as const;
  if (status === "InProgress" || status === "QualityCheck") return "blue" as const;
  if (status === "WaitingParts") return "amber" as const;
  if (status === "Cancelled") return "red" as const;
  return "slate" as const;
}

export default function WorkOrdersPage() {
  const [query, setQuery] = useState<WorkOrderQueryRequest>({ page: 1, pageSize: 20 });
  const [draft, setDraft] = useState({ status: "", technicianID: "", customerVehicleID: "", fromDate: "", toDate: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [action, setAction] = useState<{ type: "status" | "assign" | "service" | "part" | "pay"; workOrder: WorkOrderViewModel } | null>(null);

  const { data, isLoading } = useWorkOrders(query);
  const detail = useWorkOrderDetail(detailId);
  const mutations = useWorkshopMutations();
  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 200 });
  const technicians = techRes?.data ?? [];
  const createForm = useForm<CreateForm>({ defaultValues: createDefaults });

  const applyFilter = () => {
    setQuery({
      page: 1,
      pageSize: 20,
      status: draft.status || undefined,
      technicianID: draft.technicianID ? Number(draft.technicianID) : undefined,
      customerVehicleID: draft.customerVehicleID ? Number(draft.customerVehicleID) : undefined,
      fromDate: draft.fromDate || undefined,
      toDate: draft.toDate || undefined,
    });
  };

  const createWorkOrder = async (values: CreateForm) => {
    const body: WorkOrderRequest = {
      appointmentID: values.appointmentID ? Number(values.appointmentID) : null,
      customerVehicleID: Number(values.customerVehicleID),
      locationID: Number(values.locationID),
      primaryTechnicianID: Number(values.primaryTechnicianID),
      serviceAdvisorID: values.serviceAdvisorID ? Number(values.serviceAdvisorID) : null,
      priority: values.priority,
      mileageIn: Number(values.mileageIn || 0),
      customerComplaint: values.customerComplaint || null,
    };
    try {
      await mutations.createWorkOrder.mutateAsync(body);
      notify.success("Da tao phieu cong viec");
      setCreateOpen(false);
      createForm.reset(createDefaults);
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  const columns = useMemo<ColumnDef<WorkOrderViewModel>[]>(
    () => [
      { header: "So phieu", accessorKey: "workOrderNumber" },
      {
        header: "Xe",
        cell: ({ row }) => row.original.vehicleInfo ?? `Vehicle #${row.original.customerVehicleID}`,
      },
      { header: "KTV chinh", accessorKey: "primaryTechnicianName" },
      {
        header: "Trang thai",
        cell: ({ row }) => <Badge tone={tone(row.original.status)}>{row.original.status}</Badge>,
      },
      { header: "Uu tien", accessorKey: "priority" },
      {
        header: "Thanh toan",
        cell: ({ row }) => (
          <div>
            <div>{formatMoney(row.original.totalAmount)}</div>
            <div className="text-xs text-slate-500">{row.original.paymentStatus}</div>
          </div>
        ),
      },
      {
        header: "Tao ngay",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        header: "Thao tac",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => setDetailId(row.original.workOrderID)}>Xem</ActionButton>
            <ActionButton onClick={() => setAction({ type: "status", workOrder: row.original })}>Status</ActionButton>
            <ActionButton onClick={() => setAction({ type: "assign", workOrder: row.original })}>Gan KTV</ActionButton>
            <ActionButton onClick={() => setAction({ type: "service", workOrder: row.original })}>Dich vu</ActionButton>
            <ActionButton onClick={() => setAction({ type: "part", workOrder: row.original })}>Phu tung</ActionButton>
            <ActionButton onClick={() => setAction({ type: "pay", workOrder: row.original })}>Pay</ActionButton>
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
        title="Phieu cong viec"
        description="Quan ly work order, gan tho, them dich vu/phu tung va thanh toan."
        action={<ActionButton variant="primary" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tao phieu</ActionButton>}
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
        <Select label="Trang thai" value={draft.status} onChange={(value) => setDraft((s) => ({ ...s, status: value }))} options={workStatuses} />
        <Select label="KTV" value={draft.technicianID} onChange={(value) => setDraft((s) => ({ ...s, technicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
        <Input label="CustomerVehicleID" type="number" min={1} value={draft.customerVehicleID} onChange={(e) => setDraft((s) => ({ ...s, customerVehicleID: e.target.value }))} />
        <Input label="Tu ngay" type="date" value={draft.fromDate} onChange={(e) => setDraft((s) => ({ ...s, fromDate: e.target.value }))} />
        <Input label="Den ngay" type="date" value={draft.toDate} onChange={(e) => setDraft((s) => ({ ...s, toDate: e.target.value }))} />
        <div className="flex gap-2 md:col-span-5">
          <ActionButton variant="primary" onClick={applyFilter}>Loc</ActionButton>
          <ActionButton onClick={() => {
            setDraft({ status: "", technicianID: "", customerVehicleID: "", fromDate: "", toDate: "" });
            setQuery({ page: 1, pageSize: 20 });
          }}>Xoa loc</ActionButton>
        </div>
      </div>

      <DataTable data={rows} columns={columns} getRowId={(row) => String(row.workOrderID)} loading={isLoading} emptyTitle="Chua co phieu cong viec" enablePagination={false} />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tong {data?.totalCount ?? 0} phieu</span>
        <div className="flex gap-2">
          <ActionButton disabled={(query.page ?? 1) <= 1} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>Truoc</ActionButton>
          <span className="px-2 py-2">Trang {query.page ?? 1}/{totalPages}</span>
          <ActionButton disabled={(query.page ?? 1) >= totalPages} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>Sau</ActionButton>
        </div>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tao phieu cong viec" size="xl" footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setCreateOpen(false)}>Huy</ActionButton>
          <ActionButton variant="primary" onClick={createForm.handleSubmit(createWorkOrder)} disabled={mutations.createWorkOrder.isPending}>Tao phieu</ActionButton>
        </div>
      }>
        <CreateFields register={createForm.register} technicians={technicians} />
      </Modal>

      <Modal open={detailId !== null} onClose={() => setDetailId(null)} title="Chi tiet phieu cong viec" size="xl">
        {detail.isLoading ? <p>Dang tai...</p> : detail.data ? <WorkOrderDetail workOrder={detail.data} /> : null}
      </Modal>

      {action ? (
        <WorkOrderActionModal
          action={action}
          technicians={technicians}
          onClose={() => setAction(null)}
          mutations={mutations}
        />
      ) : null}
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

function CreateFields({
  register,
  technicians,
}: {
  register: ReturnType<typeof useForm<CreateForm>>["register"];
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="AppointmentID" type="number" min={1} {...register("appointmentID")} />
      <Input label="CustomerVehicleID" type="number" min={1} required {...register("customerVehicleID", { required: true })} />
      <Input label="LocationID" type="number" min={1} required {...register("locationID", { required: true })} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">KTV chinh *</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("primaryTechnicianID", { required: true })}>
          <option value="">Chon KTV</option>
          {technicians.map((t) => <option key={t.technicianID} value={t.technicianID}>{t.staffFullName ?? `Tech #${t.technicianID}`}</option>)}
        </select>
      </label>
      <Input label="ServiceAdvisorID" type="number" min={1} {...register("serviceAdvisorID")} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Uu tien</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("priority")}>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <Input label="Km vao" type="number" min={0} {...register("mileageIn")} />
      <label className="space-y-1 sm:col-span-2">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Khach phan anh</span>
        <textarea className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" rows={3} {...register("customerComplaint")} />
      </label>
    </div>
  );
}

function WorkOrderActionModal({
  action,
  technicians,
  onClose,
  mutations,
}: {
  action: { type: "status" | "assign" | "service" | "part" | "pay"; workOrder: WorkOrderViewModel };
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
  onClose: () => void;
  mutations: ReturnType<typeof useWorkshopMutations>;
}) {
  const [status, setStatus] = useState(action.workOrder.status);
  const [mileageOut, setMileageOut] = useState(action.workOrder.mileageOut ? String(action.workOrder.mileageOut) : "");
  const [diagnosis, setDiagnosis] = useState(action.workOrder.diagnosis ?? "");
  const [workPerformed, setWorkPerformed] = useState(action.workOrder.workPerformed ?? "");
  const [technicianID, setTechnicianID] = useState("");
  const [service, setService] = useState({ serviceID: "", technicianID: "", laborHours: "1", unitPrice: "0", notes: "" });
  const [part, setPart] = useState({ accessoryID: "", quantity: "1", unitPrice: "0", installedByTechnicianID: "", notes: "" });
  const [payment, setPayment] = useState({ paymentMethod: "Cash", amountPaid: String(action.workOrder.totalAmount ?? 0), discountAmount: "0" });

  const save = async () => {
    const id = action.workOrder.workOrderID;
    try {
      if (action.type === "status") {
        await mutations.patchWorkOrderStatus.mutateAsync({
          id,
          body: {
            status,
            mileageOut: mileageOut ? Number(mileageOut) : null,
            diagnosis: diagnosis || null,
            workPerformed: workPerformed || null,
          },
        });
      }
      if (action.type === "assign") {
        await mutations.assignTechnician.mutateAsync({ id, body: { technicianID: Number(technicianID) } });
      }
      if (action.type === "service") {
        await mutations.addWorkOrderService.mutateAsync({
          id,
          body: {
            serviceID: Number(service.serviceID),
            technicianID: Number(service.technicianID),
            laborHours: Number(service.laborHours || 0),
            unitPrice: Number(service.unitPrice || 0),
            notes: service.notes || null,
          },
        });
      }
      if (action.type === "part") {
        await mutations.addWorkOrderPart.mutateAsync({
          id,
          body: {
            accessoryID: Number(part.accessoryID),
            quantity: Number(part.quantity || 1),
            unitPrice: Number(part.unitPrice || 0),
            installedByTechnicianID: part.installedByTechnicianID ? Number(part.installedByTechnicianID) : null,
            notes: part.notes || null,
          },
        });
      }
      if (action.type === "pay") {
        await mutations.payWorkOrder.mutateAsync({
          id,
          body: {
            paymentMethod: payment.paymentMethod,
            amountPaid: Number(payment.amountPaid || 0),
            discountAmount: Number(payment.discountAmount || 0),
          },
        });
      }
      notify.success("Da luu thay doi");
      onClose();
    } catch (error) {
      notify.error(getErrorMessage(error));
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thao tac ${action.workOrder.workOrderNumber}`} size="lg" footer={
      <div className="flex justify-end gap-2">
        <ActionButton onClick={onClose}>Huy</ActionButton>
        <ActionButton variant="primary" onClick={save}>Luu</ActionButton>
      </div>
    }>
      {action.type === "status" ? (
        <div className="space-y-4">
          <Select label="Trang thai" value={status} onChange={setStatus} options={workStatuses} />
          <Input label="Km ra" type="number" min={0} value={mileageOut} onChange={(e) => setMileageOut(e.target.value)} />
          <TextareaField label="Chan doan" value={diagnosis} onChange={setDiagnosis} />
          <TextareaField label="Cong viec da lam" value={workPerformed} onChange={setWorkPerformed} />
        </div>
      ) : null}
      {action.type === "assign" ? (
        <Select label="Ky thuat vien" value={technicianID} onChange={setTechnicianID} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
      ) : null}
      {action.type === "service" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="ServiceID" type="number" min={1} value={service.serviceID} onChange={(e) => setService((s) => ({ ...s, serviceID: e.target.value }))} />
          <Select label="Ky thuat vien" value={service.technicianID} onChange={(value) => setService((s) => ({ ...s, technicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
          <Input label="Gio cong" type="number" min={0} max={24} value={service.laborHours} onChange={(e) => setService((s) => ({ ...s, laborHours: e.target.value }))} />
          <Input label="Don gia" type="number" min={0} value={service.unitPrice} onChange={(e) => setService((s) => ({ ...s, unitPrice: e.target.value }))} />
          <Input label="Ghi chu" value={service.notes} onChange={(e) => setService((s) => ({ ...s, notes: e.target.value }))} />
        </div>
      ) : null}
      {action.type === "part" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="AccessoryID" type="number" min={1} value={part.accessoryID} onChange={(e) => setPart((s) => ({ ...s, accessoryID: e.target.value }))} />
          <Input label="So luong" type="number" min={1} value={part.quantity} onChange={(e) => setPart((s) => ({ ...s, quantity: e.target.value }))} />
          <Input label="Don gia" type="number" min={0} value={part.unitPrice} onChange={(e) => setPart((s) => ({ ...s, unitPrice: e.target.value }))} />
          <Select label="Nguoi lap" value={part.installedByTechnicianID} onChange={(value) => setPart((s) => ({ ...s, installedByTechnicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
          <Input label="Ghi chu" value={part.notes} onChange={(e) => setPart((s) => ({ ...s, notes: e.target.value }))} />
        </div>
      ) : null}
      {action.type === "pay" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Phuong thuc" value={payment.paymentMethod} onChange={(value) => setPayment((s) => ({ ...s, paymentMethod: value }))} options={paymentMethods} />
          <Input label="So tien tra" type="number" min={0} value={payment.amountPaid} onChange={(e) => setPayment((s) => ({ ...s, amountPaid: e.target.value }))} />
          <Input label="Giam gia" type="number" min={0} value={payment.discountAmount} onChange={(e) => setPayment((s) => ({ ...s, discountAmount: e.target.value }))} />
        </div>
      ) : null}
    </Modal>
  );
}

function WorkOrderDetail({ workOrder }: { workOrder: WorkOrderViewModel }) {
  return (
    <div className="space-y-5 text-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="So phieu" value={workOrder.workOrderNumber} />
        <Info label="Trang thai" value={<Badge tone={tone(workOrder.status)}>{workOrder.status}</Badge>} />
        <Info label="Thanh toan" value={workOrder.paymentStatus} />
        <Info label="Xe" value={workOrder.vehicleInfo ?? workOrder.customerVehicleID} />
        <Info label="Chi nhanh" value={workOrder.locationName ?? workOrder.locationID} />
        <Info label="KTV chinh" value={workOrder.primaryTechnicianName ?? workOrder.primaryTechnicianID} />
        <Info label="Bat dau" value={formatDate(workOrder.startDateTime)} />
        <Info label="Ket thuc" value={formatDate(workOrder.endDateTime)} />
        <Info label="Tong tien" value={formatMoney(workOrder.totalAmount)} />
      </div>
      <Info label="Khach phan anh" value={workOrder.customerComplaint ?? "-"} />
      <Info label="Chan doan" value={workOrder.diagnosis ?? "-"} />
      <Info label="Cong viec da lam" value={workOrder.workPerformed ?? "-"} />

      <Section title="Dich vu">
        <Table headers={["Dich vu", "KTV", "Gio", "Don gia", "Thanh tien"]}>
          {(workOrder.services ?? []).map((s) => (
            <tr key={s.workOrderServiceID}>
              <td className="py-2">{s.serviceName ?? s.serviceID}</td>
              <td>{s.technicianName ?? s.technicianID}</td>
              <td>{s.laborHours}</td>
              <td>{formatMoney(s.unitPrice)}</td>
              <td>{formatMoney(s.totalPrice ?? s.lineTotal)}</td>
            </tr>
          ))}
        </Table>
      </Section>

      <Section title="Phu tung">
        <Table headers={["Phu tung", "SL", "Don gia", "Thanh tien", "Nguoi lap"]}>
          {(workOrder.parts ?? []).map((p) => (
            <tr key={p.workOrderPartID}>
              <td className="py-2">{p.accessoryName ?? p.accessoryID}</td>
              <td>{p.quantity}</td>
              <td>{formatMoney(p.unitPrice)}</td>
              <td>{formatMoney(p.totalPrice ?? p.lineTotal)}</td>
              <td>{p.installedByTechnicianName ?? p.installedByTechnicianID ?? "-"}</td>
            </tr>
          ))}
        </Table>
      </Section>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800">
          <tr>{headers.map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 [&_td]:px-3">
          {children}
        </tbody>
      </table>
    </div>
  );
}

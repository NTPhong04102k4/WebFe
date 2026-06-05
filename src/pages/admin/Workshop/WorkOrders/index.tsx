import { useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Star, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

import { DataTable, Input, Modal } from "@/components/common";
import { VehicleAutocomplete } from "../VehicleAutocomplete";
import {
  useWorkOrderDetail,
  useWorkOrderPaymentInfo,
  useWorkOrders,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import type {
  WorkOrderQueryRequest,
  WorkOrderRequest,
  WorkOrderViewModel,
} from "src/services/api/functions/workshop/workshop.types";
import { notify } from "src/components/core/Feedback/toast";
import apiClient from "src/services/api";

import {
  ActionButton,
  Badge,
  formatDate,
  formatMoney,
  getErrorMessage,
  PageHeader,
  TextareaField,
} from "../workshopUi";
import { workshopKeys } from "src/query/workshop/keys";

export const STATUS_LABELS: Record<string, string> = {
  Open: "Mở",
  InProgress: "Đang tiến hành",
  WaitingParts: "Chờ phụ tùng",
  QualityCheck: "Kiểm tra chất lượng",
  Completed: "Hoàn thành",
  Delivered: "Đã giao xe",
  Cancelled: "Đã hủy",
};

export const PRIORITY_LABELS: Record<string, string> = {
  Low: "Thấp",
  Normal: "Bình thường",
  High: "Cao",
  Urgent: "Khẩn cấp",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Cash: "Tiền mặt",
  Card: "Thẻ",
  Transfer: "Chuyển khoản",
  VNPay: "VNPay",
  Momo: "Momo",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Failed: "Thất bại",
};

// ─── Kiểu dữ liệu phụ tùng từ accessories API ────────────────────────────────
interface AccessoryItem {
  accessoryID: number;
  accessoryName: string;
  price?: number;
  sellingPrice?: number;
  unitPrice?: number;
}

interface AccessoryListResponse {
  data?: AccessoryItem[];
  items?: AccessoryItem[];
  totalCount?: number;
}

// ─── Form tạo phiếu ───────────────────────────────────────────────────────────
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

function tone(status: string) {
  if (status === "Completed" || status === "Delivered") return "green" as const;
  if (status === "InProgress" || status === "QualityCheck") return "blue" as const;
  if (status === "WaitingParts") return "amber" as const;
  if (status === "Cancelled") return "red" as const;
  return "slate" as const;
}

// ─── Trang chính ──────────────────────────────────────────────────────────────
export default function WorkOrdersPage() {
  const [query, setQuery] = useState<WorkOrderQueryRequest>({ page: 1, pageSize: 20 });
  const [draft, setDraft] = useState({ status: "", technicianID: "", customerVehicleID: "", fromDate: "", toDate: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [paymentInfoId, setPaymentInfoId] = useState<number | null>(null);
  const [action, setAction] = useState<{ type: "status" | "assign" | "service" | "part" | "pay"; workOrder: WorkOrderViewModel } | null>(null);

  const { data, isLoading } = useWorkOrders(query);
  const detail = useWorkOrderDetail(detailId);
  const paymentWorkOrder = useWorkOrderDetail(paymentInfoId);
  const paymentInfo = useWorkOrderPaymentInfo(paymentInfoId);
  const mutations = useWorkshopMutations();
  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 200 });
  const { data: serviceRes } = useServiceCatalog({ page: 1, pageSize: 200, isActive: true });
  const technicians = techRes?.data ?? [];
  const services = serviceRes?.data ?? [];
  const createForm = useForm<CreateForm>({ defaultValues: createDefaults });
  const { register, handleSubmit, reset, setValue, watch } = createForm;
  const watchVehicleId = watch("customerVehicleID");

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
      notify.success("Đã tạo phiếu công việc");
      setCreateOpen(false);
      createForm.reset(createDefaults);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const columns = useMemo<ColumnDef<WorkOrderViewModel>[]>(
    () => [
      { header: "Số phiếu", accessorKey: "workOrderNumber" },
      {
        header: "Xe",
        cell: ({ row }) => row.original.vehicleInfo ?? `Vehicle #${row.original.customerVehicleID}`,
      },
      { header: "KTV chính", accessorKey: "primaryTechnicianName" },
      {
        header: "Trạng thái",
        cell: ({ row }) => <Badge tone={tone(row.original.status)}>{STATUS_LABELS[row.original.status] ?? row.original.status}</Badge>,
      },
      {
        header: "Ưu tiên",
        cell: ({ row }) => PRIORITY_LABELS[row.original.priority] ?? row.original.priority,
      },
      {
        header: "Thanh toán",
        cell: ({ row }) => (
          <div>
            <div>{formatMoney(row.original.totalAmount)}</div>
            <div className="text-xs text-slate-500">{PAYMENT_STATUS_LABELS[row.original.paymentStatus] ?? row.original.paymentStatus}</div>
          </div>
        ),
      },
      {
        header: "Tạo ngày",
        cell: ({ row }) => formatDate(row.original.createdDate),
      },
      {
        header: "Thao tác",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={() => setDetailId(row.original.workOrderID)}>Xem</ActionButton>
            <ActionButton onClick={() => setAction({ type: "status", workOrder: row.original })}>Status</ActionButton>
            <ActionButton onClick={() => setAction({ type: "assign", workOrder: row.original })}>Gán KTV</ActionButton>
            <ActionButton onClick={() => setAction({ type: "service", workOrder: row.original })}>Dịch vụ</ActionButton>
            <ActionButton onClick={() => setAction({ type: "part", workOrder: row.original })}>Phụ tùng</ActionButton>
            <ActionButton onClick={() => setAction({ type: "pay", workOrder: row.original })}>Thanh toán</ActionButton>
            <ActionButton onClick={() => setPaymentInfoId(row.original.workOrderID)}>QR</ActionButton>
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
        title="Phiếu công việc"
        description="Quản lý work order, gán thợ, thêm dịch vụ/phụ tùng và thanh toán."
        action={<ActionButton variant="primary" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" /> Tạo phiếu</ActionButton>}
      />

      <div className="mb-4 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:grid-cols-5">
        <Select label="Trạng thái" value={draft.status} onChange={(value) => setDraft((s) => ({ ...s, status: value }))} options={workStatuses.map(s => ({ value: s, label: STATUS_LABELS[s] ?? s }))} />
        <Select label="KTV" value={draft.technicianID} onChange={(value) => setDraft((s) => ({ ...s, technicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
        <Input label="CustomerVehicleID" type="number" min={1} value={draft.customerVehicleID} onChange={(e) => setDraft((s) => ({ ...s, customerVehicleID: e.target.value }))} />
        <Input label="Từ ngày" type="date" value={draft.fromDate} onChange={(e) => setDraft((s) => ({ ...s, fromDate: e.target.value }))} />
        <Input label="Đến ngày" type="date" value={draft.toDate} onChange={(e) => setDraft((s) => ({ ...s, toDate: e.target.value }))} />
        <div className="flex gap-2 md:col-span-5">
          <ActionButton variant="primary" onClick={applyFilter}>Lọc</ActionButton>
          <ActionButton onClick={() => {
            setDraft({ status: "", technicianID: "", customerVehicleID: "", fromDate: "", toDate: "" });
            setQuery({ page: 1, pageSize: 20 });
          }}>Xóa lọc</ActionButton>
        </div>
      </div>

      <DataTable data={rows} columns={columns} getRowId={(row) => String(row.workOrderID)} loading={isLoading} emptyTitle="Chưa có phiếu công việc" enablePagination={false} />

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>Tổng {data?.totalCount ?? 0} phiếu</span>
        <div className="flex gap-2">
          <ActionButton disabled={(query.page ?? 1) <= 1} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>Trước</ActionButton>
          <span className="px-2 py-2">Trang {query.page ?? 1}/{totalPages}</span>
          <ActionButton disabled={(query.page ?? 1) >= totalPages} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>Sau</ActionButton>
        </div>
      </div>

      {/* Modal tạo phiếu */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Tạo phiếu công việc" size="xl" closeOnBackdrop={false} footer={
        <div className="flex justify-end gap-2">
          <ActionButton onClick={() => setCreateOpen(false)}>Hủy</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit(createWorkOrder)} disabled={mutations.createWorkOrder.isPending}>Tạo phiếu</ActionButton>
        </div>
      }>
        <CreateFields register={register} setValue={setValue} watchVehicleId={watchVehicleId} technicians={technicians} />
      </Modal>

      {/* Modal chi tiết */}
      <Modal open={detailId !== null} onClose={() => setDetailId(null)} title="Chi tiết phiếu công việc" size="xl">
        {detail.isLoading ? (
          <p>Đang tải...</p>
        ) : detail.data ? (
          <WorkOrderDetail workOrder={detail.data} mutations={mutations} />
        ) : null}
      </Modal>

      {/* Modal thông tin thanh toán */}
      <Modal open={paymentInfoId !== null} onClose={() => setPaymentInfoId(null)} title="Thông tin thanh toán" size="lg">
        {paymentInfo.isLoading ? <p>Đang tải...</p> : paymentInfo.data ? (
          <div className="space-y-3 text-sm">
            <div
              className={`rounded-lg p-3 ${
                paymentWorkOrder.data?.paymentStatus === "Paid"
                  ? "bg-green-50 text-green-700"
                  : paymentWorkOrder.data?.paymentStatus === "Failed"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {paymentWorkOrder.data?.paymentStatus === "Paid"
                ? "Thanh toán thành công"
                : paymentWorkOrder.data?.paymentStatus === "Failed"
                ? "Thanh toán thất bại hoặc sai số tiền"
                : "Đang chờ thanh toán"}
            </div>
            <Info label="Mã phiếu" value={paymentInfo.data.workOrderNumber ?? paymentInfoId} />
            <Info label="Số tiền QR" value={formatMoney(paymentInfo.data.amount)} />
            <Info label="Ngân hàng" value={paymentInfo.data.bankName ?? "-"} />
            <Info label="Số tài khoản" value={paymentInfo.data.bankAccount ?? paymentInfo.data.accountNumber ?? "-"} />
            <Info label="Chủ tài khoản" value={paymentInfo.data.accountName ?? "-"} />
            <Info label="Nội dung CK" value={paymentInfo.data.transferContent ?? "-"} />
            {paymentInfo.data.qrImageUrl || paymentInfo.data.qrCodeUrl || paymentInfo.data.qrCode ? (
              <img
                src={(paymentInfo.data.qrImageUrl ?? paymentInfo.data.qrCodeUrl ?? paymentInfo.data.qrCode) || undefined}
                alt="QR thanh toán work order"
                className="max-h-72 rounded-lg border border-slate-200 bg-white p-2"
              />
            ) : null}
            {paymentInfo.data.paymentUrl ? (
              <a className="text-blue-600 underline" href={paymentInfo.data.paymentUrl} target="_blank" rel="noreferrer">
                Mở liên kết thanh toán
              </a>
            ) : null}
            <ActionButton onClick={() => paymentWorkOrder.refetch()}>Tôi đã chuyển khoản</ActionButton>
          </div>
        ) : paymentWorkOrder.data?.paymentStatus === "Paid" ? (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Thanh toán thành công. Thông tin QR không còn khả dụng.
          </div>
        ) : paymentInfo.error ? (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            Không tải được QR. Nếu đã chuyển khoản, hệ thống sẽ cập nhật trạng thái sau khi nhận IPN.
            <div className="mt-3">
              <ActionButton onClick={() => paymentWorkOrder.refetch()}>Tôi đã chuyển khoản</ActionButton>
            </div>
          </div>
        ) : null}
      </Modal>

      {action ? (
        <WorkOrderActionModal
          action={action}
          technicians={technicians}
          services={services}
          onClose={() => setAction(null)}
          mutations={mutations}
        />
      ) : null}
    </div>
  );
}

// ─── Select component ─────────────────────────────────────────────────────────
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
        <option value="">Tất cả</option>
        {options.map((option) => {
          const val = typeof option === "string" ? option : option.value;
          const lbl = typeof option === "string" ? option : option.label;
          return <option key={val} value={val}>{lbl}</option>;
        })}
      </select>
    </label>
  );
}

// ─── Autocomplete phụ tùng ───────────────────────────────────────────────────
function AccessoryAutocomplete({
  onSelect,
}: {
  onSelect: (item: AccessoryItem) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<AccessoryItem[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounce 400ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!keyword.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<AccessoryListResponse>("/accessories", {
          params: { keyword: keyword.trim(), page: 1, pageSize: 20 },
        });
        const items: AccessoryItem[] = res.data?.data ?? res.data?.items ?? [];
        setResults(items);
        setOpen(items.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: AccessoryItem) => {
    onSelect(item);
    setKeyword(item.accessoryName);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Tìm phụ tùng</span>
      <input
        type="text"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Nhập tên phụ tùng..."
        className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
      />
      {loading && (
        <div className="absolute right-3 top-9 text-xs text-slate-400">Đang tìm...</div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {results.map((item) => {
            const price = item.price ?? item.sellingPrice ?? item.unitPrice ?? 0;
            return (
              <li
                key={item.accessoryID}
                onMouseDown={() => handleSelect(item)}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="font-medium">{item.accessoryName}</span>
                {price > 0 && (
                  <span className="ml-2 text-slate-500">{formatMoney(price)}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ─── Form tạo phiếu (fields) ─────────────────────────────────────────────────
function CreateFields({
  register,
  setValue,
  watchVehicleId,
  technicians,
}: {
  register: ReturnType<typeof useForm<CreateForm>>["register"];
  setValue: ReturnType<typeof useForm<CreateForm>>["setValue"];
  watchVehicleId: string;
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Mã hẹn (AppointmentID)" type="number" min={1} {...register("appointmentID")} />
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
      <Input label="Chi nhánh (LocationID)" type="number" min={1} required {...register("locationID", { required: true })} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">KTV chính *</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("primaryTechnicianID", { required: true })}>
          <option value="">Chọn KTV</option>
          {technicians.map((t) => <option key={t.technicianID} value={t.technicianID}>{t.staffFullName ?? `Tech #${t.technicianID}`}</option>)}
        </select>
      </label>
      <Input label="Cố vấn dịch vụ (ServiceAdvisorID)" type="number" min={1} {...register("serviceAdvisorID")} />
      <label className="space-y-1">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Ưu tiên</span>
        <select className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" {...register("priority")}>
          {priorities.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p] ?? p}</option>)}
        </select>
      </label>
      <Input label="Km vào" type="number" min={0} {...register("mileageIn")} />
      <label className="space-y-1 sm:col-span-2">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Khách phản ánh</span>
        <textarea className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900" rows={3} {...register("customerComplaint")} />
      </label>
    </div>
  );
}

// ─── Modal thao tác (status / assign / service / part / pay) ─────────────────
function WorkOrderActionModal({
  action,
  technicians,
  services,
  onClose,
  mutations,
}: {
  action: { type: "status" | "assign" | "service" | "part" | "pay"; workOrder: WorkOrderViewModel };
  technicians: Array<{ technicianID: number; staffFullName?: string | null }>;
  services: Array<{ serviceID: number; serviceName: string; serviceCode: string; price: number }>;
  onClose: () => void;
  mutations: ReturnType<typeof useWorkshopMutations>;
}) {
  const [status, setStatus] = useState(action.workOrder.status);
  const [mileageOut, setMileageOut] = useState(action.workOrder.mileageOut ? String(action.workOrder.mileageOut) : "");
  const [diagnosis, setDiagnosis] = useState(action.workOrder.diagnosis ?? "");
  const [workPerformed, setWorkPerformed] = useState(action.workOrder.workPerformed ?? "");
  const [technicianID, setTechnicianID] = useState("");
  const [service, setService] = useState({ serviceID: "", technicianID: "", laborHours: "1", unitPrice: "0", notes: "" });
  const [part, setPart] = useState({ accessoryID: "", accessoryName: "", quantity: "1", unitPrice: "0", installedByTechnicianID: "", notes: "" });
  const netTotal = (action.workOrder.totalAmount ?? 0) - (action.workOrder.discountAmount ?? 0);
  const remaining = Math.max(0, netTotal - (action.workOrder.depositPaid ?? 0));
  const [payment, setPayment] = useState({
    paymentType: "Full" as "Deposit" | "Final" | "Full",
    paymentMethod: "Cash" as "Cash" | "Transfer" | "Mixed",
    cashAmount: String(remaining),
    transferAmount: "0",
    discountAmount: "0",
    transactionRef: "",
    note: "",
  });

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
            paymentType: payment.paymentType,
            paymentMethod: payment.paymentMethod,
            cashAmount: Number(payment.cashAmount || 0),
            transferAmount: Number(payment.transferAmount || 0),
            discountAmount: Number(payment.discountAmount || 0),
            transactionRef: payment.transactionRef || null,
            note: payment.note || null,
          },
        });
      }
      notify.success("Đã lưu thay đổi");
      onClose();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <Modal open onClose={onClose} title={`Thao tác ${action.workOrder.workOrderNumber}`} size="lg" closeOnBackdrop={false} footer={
      <div className="flex justify-end gap-2">
        <ActionButton onClick={onClose}>Hủy</ActionButton>
        <ActionButton variant="primary" onClick={save}>Lưu</ActionButton>
      </div>
    }>
      {action.type === "status" ? (
        <div className="space-y-4">
          <Select label="Trạng thái" value={status} onChange={(v) => setStatus(v as typeof status)} options={workStatuses.map(s => ({ value: s, label: STATUS_LABELS[s] ?? s }))} />
          <Input label="Km ra" type="number" min={0} value={mileageOut} onChange={(e) => setMileageOut(e.target.value)} />
          <TextareaField label="Chẩn đoán" value={diagnosis} onChange={setDiagnosis} />
          <TextareaField label="Công việc đã làm" value={workPerformed} onChange={setWorkPerformed} />
        </div>
      ) : null}

      {action.type === "assign" ? (
        <Select label="Kỹ thuật viên" value={technicianID} onChange={setTechnicianID} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
      ) : null}

      {action.type === "service" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Dịch vụ</span>
            <select
              value={service.serviceID}
              onChange={(e) => {
                const selected = services.find((item) => item.serviceID === Number(e.target.value));
                setService((s) => ({
                  ...s,
                  serviceID: e.target.value,
                  unitPrice: selected ? String(selected.price) : s.unitPrice,
                }));
              }}
              className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
            >
              <option value="">Chọn dịch vụ</option>
              {services.map((item) => (
                <option key={item.serviceID} value={item.serviceID}>
                  {item.serviceName} - {item.price.toLocaleString("vi-VN")} VND
                </option>
              ))}
            </select>
          </label>
          <Select label="Kỹ thuật viên" value={service.technicianID} onChange={(value) => setService((s) => ({ ...s, technicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
          <Input label="Giờ công" type="number" min={0} max={24} value={service.laborHours} onChange={(e) => setService((s) => ({ ...s, laborHours: e.target.value }))} />
          <Input label="Đơn giá" type="number" min={0} value={service.unitPrice} onChange={(e) => setService((s) => ({ ...s, unitPrice: e.target.value }))} />
          <Input label="Ghi chú" value={service.notes} onChange={(e) => setService((s) => ({ ...s, notes: e.target.value }))} />
        </div>
      ) : null}

      {action.type === "part" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Autocomplete phụ tùng */}
          <div className="sm:col-span-2">
            <AccessoryAutocomplete
              onSelect={(item) => {
                const price = item.price ?? item.sellingPrice ?? item.unitPrice ?? 0;
                setPart((s) => ({
                  ...s,
                  accessoryID: String(item.accessoryID),
                  accessoryName: item.accessoryName,
                  unitPrice: price > 0 ? String(price) : s.unitPrice,
                }));
              }}
            />
          </div>
          {/* Hiển thị tên + ID đã chọn */}
          {part.accessoryID && (
            <div className="sm:col-span-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              Đã chọn: <strong>{part.accessoryName}</strong> (ID: {part.accessoryID})
            </div>
          )}
          <Input label="Số lượng" type="number" min={1} value={part.quantity} onChange={(e) => setPart((s) => ({ ...s, quantity: e.target.value }))} />
          <Input label="Đơn giá" type="number" min={0} value={part.unitPrice} onChange={(e) => setPart((s) => ({ ...s, unitPrice: e.target.value }))} />
          <Select label="Người lắp" value={part.installedByTechnicianID} onChange={(value) => setPart((s) => ({ ...s, installedByTechnicianID: value }))} options={technicians.map((t) => ({ value: String(t.technicianID), label: t.staffFullName ?? `Tech #${t.technicianID}` }))} />
          <Input label="Ghi chú" value={part.notes} onChange={(e) => setPart((s) => ({ ...s, notes: e.target.value }))} />
        </div>
      ) : null}

      {action.type === "pay" ? (
        <div className="space-y-4">
          {/* Tóm tắt */}
          <div className="rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
            <div className="flex justify-between"><span className="text-slate-500">Tổng phiếu</span><span className="font-medium">{formatMoney(action.workOrder.totalAmount)}</span></div>
            {(action.workOrder.depositPaid ?? 0) > 0 && (
              <div className="flex justify-between text-green-600"><span>Đã cọc</span><span>- {formatMoney(action.workOrder.depositPaid)}</span></div>
            )}
            <div className="mt-1 flex justify-between border-t pt-1 font-semibold"><span>Còn lại</span><span className="text-blue-700">{formatMoney(remaining)}</span></div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Loại thanh toán" value={payment.paymentType}
              onChange={(value) => setPayment((s) => ({ ...s, paymentType: value as typeof s.paymentType }))}
              options={[
                { value: "Full", label: "Thanh toán toàn bộ" },
                { value: "Deposit", label: "Đặt cọc" },
                { value: "Final", label: "Thanh toán phần còn lại" },
              ]}
            />
            <Select label="Phương thức" value={payment.paymentMethod}
              onChange={(value) => {
                const method = value as typeof payment.paymentMethod;
                setPayment((s) => ({
                  ...s,
                  paymentMethod: method,
                  cashAmount: method === "Transfer" ? "0" : s.cashAmount,
                  transferAmount: method === "Cash" ? "0" : s.transferAmount,
                }));
              }}
              options={[
                { value: "Cash", label: "Tiền mặt" },
                { value: "Transfer", label: "Chuyển khoản" },
                { value: "Mixed", label: "Kết hợp (Tiền mặt + CK)" },
              ]}
            />
            {(payment.paymentMethod === "Cash" || payment.paymentMethod === "Mixed") && (
              <Input label="Tiền mặt (VND)" type="number" min={0}
                value={payment.cashAmount}
                onChange={(e) => setPayment((s) => ({ ...s, cashAmount: e.target.value }))}
              />
            )}
            {(payment.paymentMethod === "Transfer" || payment.paymentMethod === "Mixed") && (
              <Input label="Chuyển khoản (VND)" type="number" min={0}
                value={payment.transferAmount}
                onChange={(e) => setPayment((s) => ({ ...s, transferAmount: e.target.value }))}
              />
            )}
            <Input label="Giảm giá" type="number" min={0} value={payment.discountAmount}
              onChange={(e) => setPayment((s) => ({ ...s, discountAmount: e.target.value }))}
            />
            <Input label="Mã giao dịch" value={payment.transactionRef}
              onChange={(e) => setPayment((s) => ({ ...s, transactionRef: e.target.value }))}
            />
            <div className="sm:col-span-2">
              <Input label="Ghi chú" value={payment.note}
                onChange={(e) => setPayment((s) => ({ ...s, note: e.target.value }))}
              />
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

// ─── Chi tiết phiếu công việc ─────────────────────────────────────────────────
function WorkOrderDetail({
  workOrder,
  mutations,
}: {
  workOrder: WorkOrderViewModel;
  mutations: ReturnType<typeof useWorkshopMutations>;
}) {
  const qc = useQueryClient();

  const handleDeleteService = async (workOrderServiceID: number) => {
    if (!window.confirm("Xóa dịch vụ này khỏi phiếu?")) return;
    try {
      await mutations.deleteWorkOrderService.mutateAsync({
        workOrderId: workOrder.workOrderID,
        workOrderServiceId: workOrderServiceID,
      });
      await qc.invalidateQueries({ queryKey: workshopKeys.workOrder(workOrder.workOrderID) });
      notify.success("Đã xóa dịch vụ");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const handleDeletePart = async (workOrderPartID: number) => {
    if (!window.confirm("Xóa phụ tùng này khỏi phiếu?")) return;
    try {
      await mutations.deleteWorkOrderPart.mutateAsync({
        workOrderId: workOrder.workOrderID,
        workOrderPartId: workOrderPartID,
      });
      await qc.invalidateQueries({ queryKey: workshopKeys.workOrder(workOrder.workOrderID) });
      notify.success("Đã xóa phụ tùng");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-5 text-sm">
      {/* Thông tin chung */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Info label="Số phiếu" value={workOrder.workOrderNumber} />
        <Info label="Trạng thái" value={<Badge tone={tone(workOrder.status)}>{STATUS_LABELS[workOrder.status] ?? workOrder.status}</Badge>} />
        <Info label="Thanh toán" value={PAYMENT_STATUS_LABELS[workOrder.paymentStatus] ?? workOrder.paymentStatus} />
        <Info label="Xe" value={workOrder.vehicleInfo ?? workOrder.customerVehicleID} />
        <Info label="Chi nhánh" value={workOrder.locationName ?? workOrder.locationID} />
        <Info label="KTV chính" value={workOrder.primaryTechnicianName ?? workOrder.primaryTechnicianID} />
        <Info label="Bắt đầu" value={formatDate(workOrder.startDateTime)} />
        <Info label="Kết thúc" value={formatDate(workOrder.endDateTime)} />
        <Info label="Tổng tiền" value={formatMoney(workOrder.totalAmount)} />
      </div>
      <Info label="Khách phản ánh" value={workOrder.customerComplaint ?? "-"} />
      <Info label="Chẩn đoán" value={workOrder.diagnosis ?? "-"} />
      <Info label="Công việc đã làm" value={workOrder.workPerformed ?? "-"} />

      {/* Bảng dịch vụ */}
      <Section title="Dịch vụ">
        <Table headers={["Dịch vụ", "KTV", "Giờ", "Đơn giá", "Thành tiền", ""]}>
          {(workOrder.services ?? []).map((s) => (
            <tr key={s.workOrderServiceID}>
              <td className="py-2">{s.serviceName ?? s.serviceID}</td>
              <td>{s.technicianName ?? s.technicianID}</td>
              <td>{s.laborHours}</td>
              <td>{formatMoney(s.unitPrice)}</td>
              <td>{formatMoney(s.totalPrice ?? s.lineTotal)}</td>
              <td>
                <button
                  onClick={() => handleDeleteService(s.workOrderServiceID)}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                  title="Xóa dịch vụ"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Bảng phụ tùng */}
      <Section title="Phụ tùng">
        <Table headers={["Phụ tùng", "SL", "Đơn giá", "Thành tiền", "Người lắp", ""]}>
          {(workOrder.parts ?? []).map((p) => (
            <tr key={p.workOrderPartID}>
              <td className="py-2">{p.accessoryName ?? p.accessoryID}</td>
              <td>{p.quantity}</td>
              <td>{formatMoney(p.unitPrice)}</td>
              <td>{formatMoney(p.totalPrice ?? p.lineTotal)}</td>
              <td>{p.installedByTechnicianName ?? p.installedByTechnicianID ?? "-"}</td>
              <td>
                <button
                  onClick={() => handleDeletePart(p.workOrderPartID)}
                  className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                  title="Xóa phụ tùng"
                >
                  <X className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* Lịch sử thanh toán */}
      {(workOrder.payments ?? []).length > 0 && (
        <Section title="Lịch sử thanh toán">
          <Table headers={["Loại", "Phương thức", "Tiền mặt", "Chuyển khoản", "Tổng", "Mã GD", "Nhân viên", "Ngày"]}>
            {(workOrder.payments ?? []).map((p) => (
              <tr key={p.workOrderPaymentID} className="text-xs">
                <td className="py-1.5">{p.paymentType === "Deposit" ? "Cọc" : p.paymentType === "Final" ? "Còn lại" : "Toàn bộ"}</td>
                <td>{p.paymentMethod === "Cash" ? "Tiền mặt" : p.paymentMethod === "Transfer" ? "Chuyển khoản" : "Kết hợp"}</td>
                <td>{p.cashAmount > 0 ? formatMoney(p.cashAmount) : "-"}</td>
                <td>{p.transferAmount > 0 ? formatMoney(p.transferAmount) : "-"}</td>
                <td className="font-medium text-blue-700">{formatMoney(p.amount)}</td>
                <td className="text-slate-500">{p.transactionRef ?? "-"}</td>
                <td>{p.receivedByStaffName ?? "-"}</td>
                <td>{formatDate(p.paidDate)}</td>
              </tr>
            ))}
          </Table>
          {(workOrder.depositPaid ?? 0) > 0 && workOrder.paymentStatus !== "Paid" && (
            <div className="mt-2 text-sm text-slate-600">
              Đã cọc: <strong>{formatMoney(workOrder.depositPaid)}</strong>
              {" · "}Còn lại:{" "}
              <strong className="text-orange-600">
                {formatMoney(Math.max(0, workOrder.totalAmount - workOrder.discountAmount - workOrder.depositPaid))}
              </strong>
            </div>
          )}
        </Section>
      )}

      {/* Bàn giao xe */}
      {workOrder.status === "Completed" && !workOrder.deliveredDateTime && (
        <DeliverSection workOrder={workOrder} mutations={mutations} />
      )}
      {workOrder.deliveredDateTime && (
        <Section title="Bàn giao xe">
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            <Info label="Thời gian bàn giao" value={formatDate(workOrder.deliveredDateTime)} />
            <Info label="Nhân viên bàn giao" value={workOrder.deliveredByStaffName ?? "-"} />
            {workOrder.handoverNote && <Info label="Ghi chú" value={workOrder.handoverNote} />}
            {workOrder.customerConfirmedAt
              ? <Info label="Khách xác nhận" value={formatDate(workOrder.customerConfirmedAt)} />
              : <div className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">Khách chưa xác nhận nhận xe</div>
            }
          </div>
        </Section>
      )}

      {/* Section đánh giá khách hàng — chỉ hiện khi Completed hoặc Delivered */}
      {(workOrder.status === "Completed" || workOrder.status === "Delivered") && (
        <FeedbackSection workOrder={workOrder} mutations={mutations} />
      )}
    </div>
  );
}

// ─── Section bàn giao xe ───────────────────────────────────────────────────────
function DeliverSection({
  workOrder,
  mutations,
}: {
  workOrder: WorkOrderViewModel;
  mutations: ReturnType<typeof useWorkshopMutations>;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const handleDeliver = async () => {
    setSaving(true);
    try {
      await mutations.deliverWorkOrder.mutateAsync({ id: workOrder.workOrderID, body: { handoverNote: note || null } });
      notify.success("Đã bàn giao xe cho khách");
    } catch {
      // interceptor đã hiện toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section title="Bàn giao xe">
      <div className="space-y-3">
        <p className="text-sm text-slate-600">Phiếu đã hoàn thành. Xác nhận bàn giao xe cho khách hàng.</p>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Ghi chú bàn giao (tuỳ chọn)</span>
          <textarea
            rows={2}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tình trạng xe khi bàn giao, lưu ý cho khách..."
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={handleDeliver}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? "Đang xử lý..." : "Xác nhận bàn giao xe"}
        </button>
      </div>
    </Section>
  );
}

// ─── Section đánh giá khách hàng ─────────────────────────────────────────────
function FeedbackSection({
  workOrder,
  mutations,
}: {
  workOrder: WorkOrderViewModel;
  mutations: ReturnType<typeof useWorkshopMutations>;
}) {
  const [rating, setRating] = useState<number>(workOrder.customerRating ?? 0);
  const [hovered, setHovered] = useState<number>(0);
  const [comment, setComment] = useState<string>(workOrder.customerFeedback ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (rating === 0) {
      notify.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    setSaving(true);
    try {
      await mutations.feedbackWorkOrder.mutateAsync({
        id: workOrder.workOrderID,
        body: { rating, feedback: comment || null },
      });
      notify.success("Đã lưu đánh giá khách hàng");
    } catch {
      // interceptor đã hiện toast lỗi
    } finally {
      setSaving(false);
    }
  };

  const displayRating = hovered > 0 ? hovered : rating;

  return (
    <Section title="Đánh giá khách hàng">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
        {/* Đã có đánh giá cũ */}
        {workOrder.customerRating != null && workOrder.customerRating > 0 && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <span>Đánh giá hiện tại:</span>
            <span className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i <= (workOrder.customerRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                />
              ))}
            </span>
            {workOrder.customerFeedback && (
              <span className="italic">"{workOrder.customerFeedback}"</span>
            )}
          </div>
        )}

        {/* Chọn sao */}
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Chọn mức đánh giá</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(i)}
                className="rounded p-0.5 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    i <= displayRating ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600"
                  }`}
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 self-center text-sm text-slate-500">
                {["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Xuất sắc"][rating]}
              </span>
            )}
          </div>
        </div>

        {/* Bình luận */}
        <div className="space-y-1">
          <span className="block text-sm font-medium text-slate-700 dark:text-slate-200">Bình luận</span>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Nhập nhận xét của khách hàng..."
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm dark:border-slate-500 dark:bg-slate-900"
          />
        </div>

        <ActionButton variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu đánh giá"}
        </ActionButton>
      </div>
    </Section>
  );
}

// ─── Các component nhỏ ────────────────────────────────────────────────────────
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

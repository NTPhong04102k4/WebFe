import {
  Activity,
  AlertCircle,
  CalendarClock,
  Car,
  CheckCircle2,
  ClipboardList,
  Star,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useCarList } from "src/query/car/useCarQueries";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import { usePendingReviews } from "src/query/review/useReviewQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import { useStaffList } from "src/query/staff/useStaffQueries";
import {
  useAppointments,
  useWorkOrders,
} from "src/query/workshop/useWorkshopQueries";
import type {
  AppointmentViewModel,
  WorkOrderViewModel,
} from "src/services/api/functions/workshop/workshop.types";

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

function formatMoney(value?: number | null) {
  if (value == null) return "-";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function countStatus<T extends { status: string }>(rows: T[], status: string) {
  return rows.filter((item) => item.status === status).length;
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "blue",
  loading,
}: {
  title: string;
  value: string | number;
  hint: string;
  icon: typeof Activity;
  tone?: "blue" | "green" | "amber" | "red" | "slate";
  loading?: boolean;
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200",
    red: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  }[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {loading ? "..." : value}
          </p>
        </div>
        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tones}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function StatusBar({
  label,
  value,
  total,
  tone = "bg-blue-600",
}: {
  label: string;
  value: number;
  total: number;
  tone?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-300">{label}</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct(value, total)}%` }} />
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function AppointmentTable({ rows }: { rows: AppointmentViewModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-4">Ma hen</th>
            <th className="py-2 pr-4">Thoi gian</th>
            <th className="py-2 pr-4">Xe</th>
            <th className="py-2">Trang thai</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((item) => (
            <tr key={item.appointmentID}>
              <td className="py-2 pr-4 font-medium">{item.appointmentNumber}</td>
              <td className="py-2 pr-4">{formatDateTime(item.scheduledDateTime)}</td>
              <td className="py-2 pr-4">{item.vehicleInfo ?? item.customerVehicleID}</td>
              <td className="py-2">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chua co lich hen.</p> : null}
    </div>
  );
}

function WorkOrderTable({ rows }: { rows: WorkOrderViewModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-4">So phieu</th>
            <th className="py-2 pr-4">Xe</th>
            <th className="py-2 pr-4">Trang thai</th>
            <th className="py-2">Tong tien</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((item) => (
            <tr key={item.workOrderID}>
              <td className="py-2 pr-4 font-medium">{item.workOrderNumber}</td>
              <td className="py-2 pr-4">{item.vehicleInfo ?? item.customerVehicleID}</td>
              <td className="py-2 pr-4">{item.status}</td>
              <td className="py-2">{formatMoney(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chua co phieu cong viec.</p> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const role = useAuthStore((state) => state.user?.role);
  const canReadStaff = role === "Admin" || role === "SuperAdmin";

  const now = new Date();
  const today = isoDate(now);
  const monthStart = isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = isoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0));

  const todayAppointments = useAppointments({
    page: 1,
    pageSize: 200,
    fromDate: today,
    toDate: today,
  });
  const recentAppointments = useAppointments({
    page: 1,
    pageSize: 5,
    fromDate: today,
    toDate: monthEnd,
  });
  const workOrders = useWorkOrders({
    page: 1,
    pageSize: 200,
  });
  const recentWorkOrders = useWorkOrders({
    page: 1,
    pageSize: 5,
  });
  const completedWorkOrders = useWorkOrders({
    page: 1,
    pageSize: 1,
    status: "Completed",
    fromDate: monthStart,
    toDate: monthEnd,
  });
  const cars = useCarList({ pageIndex: 1, pageSize: 1 });
  const services = useServiceCatalog({ page: 1, pageSize: 1, isActive: true });
  const technicians = useHrTechniciansSearch({ page: 1, pageSize: 1, available: true });
  const pendingReviews = usePendingReviews({ page: 1, pageSize: 1 });
  const staff = useStaffList({ page: 1, pageSize: 1, isActive: true }, canReadStaff);

  const appointmentRows = todayAppointments.data?.data ?? [];
  const todayTotal = todayAppointments.data?.totalCount ?? appointmentRows.length;
  const scheduledCount = countStatus(appointmentRows, "Scheduled");
  const confirmedCount = countStatus(appointmentRows, "Confirmed");
  const inProgressAppointmentCount = countStatus(appointmentRows, "In-Progress");
  const completedAppointmentCount = countStatus(appointmentRows, "Completed");
  const workOrderRows = workOrders.data?.data ?? [];
  const openWo = countStatus(workOrderRows, "Open");
  const inProgressWo = countStatus(workOrderRows, "InProgress");
  const waitingWo = countStatus(workOrderRows, "WaitingParts");
  const activeWoTotal = openWo + inProgressWo + waitingWo;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Dashboard quan tri
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Tong hop nhanh tu cac API hien co, khong phu thuoc endpoint summary rieng.
          </p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Hom nay: {new Date().toLocaleDateString("vi-VN")}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Lich hen hom nay"
          value={todayTotal}
          hint={`${scheduledCount} scheduled, ${confirmedCount} confirmed`}
          icon={CalendarClock}
          loading={todayAppointments.isLoading}
        />
        <KpiCard
          title="Work order dang xu ly"
          value={activeWoTotal}
          hint={`${openWo} open, ${inProgressWo} in progress, ${waitingWo} waiting parts`}
          icon={ClipboardList}
          tone="amber"
          loading={workOrders.isLoading}
        />
        <KpiCard
          title="Phieu hoan thanh thang nay"
          value={completedWorkOrders.data?.totalCount ?? 0}
          hint={`${monthStart} den ${monthEnd}`}
          icon={CheckCircle2}
          tone="green"
          loading={completedWorkOrders.isLoading}
        />
        <KpiCard
          title="Pending reviews"
          value={pendingReviews.data?.totalCount ?? 0}
          hint="Can staff/admin duyet"
          icon={Star}
          tone="red"
          loading={pendingReviews.isLoading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Tong xe"
          value={cars.data?.totalCount ?? 0}
          hint="Lay tu GET /cars"
          icon={Car}
          tone="slate"
          loading={cars.isLoading}
        />
        <KpiCard
          title="Dich vu active"
          value={services.data?.totalCount ?? 0}
          hint="Lay tu GET /services?isActive=true"
          icon={Wrench}
          loading={services.isLoading}
        />
        <KpiCard
          title="Technician available"
          value={technicians.data?.totalCount ?? 0}
          hint="Lay tu GET /hr/technicians"
          icon={Users}
          tone="green"
          loading={technicians.isLoading}
        />
        <KpiCard
          title="Staff active"
          value={canReadStaff ? staff.data?.totalCount ?? 0 : "Restricted"}
          hint={canReadStaff ? "Lay tu GET /auth/admin/staff" : "Chi Admin/SuperAdmin xem duoc"}
          icon={UserCog}
          tone="slate"
          loading={canReadStaff && staff.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Panel title="Trang thai lich hen hom nay" subtitle="Tinh tren du lieu pageSize 200 cua ngay hien tai.">
          <div className="space-y-4">
            <StatusBar label="Scheduled" value={scheduledCount} total={todayTotal} tone="bg-amber-500" />
            <StatusBar label="Confirmed" value={confirmedCount} total={todayTotal} tone="bg-blue-600" />
            <StatusBar label="In-Progress" value={inProgressAppointmentCount} total={todayTotal} tone="bg-indigo-600" />
            <StatusBar label="Completed" value={completedAppointmentCount} total={todayTotal} tone="bg-emerald-600" />
          </div>
        </Panel>

        <Panel title="Tai xuong dich vu" subtitle="Work order can xu ly theo trang thai chinh.">
          <div className="space-y-4">
            <StatusBar label="Open" value={openWo} total={activeWoTotal} tone="bg-slate-500" />
            <StatusBar label="InProgress" value={inProgressWo} total={activeWoTotal} tone="bg-blue-600" />
            <StatusBar label="WaitingParts" value={waitingWo} total={activeWoTotal} tone="bg-amber-500" />
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Lich hen gan toi" subtitle="Tu hom nay den cuoi thang">
          <AppointmentTable rows={recentAppointments.data?.data ?? []} />
        </Panel>
        <Panel title="Work order gan day" subtitle="Lay 5 phieu moi nhat tu /workshop/work-orders">
          <WorkOrderTable rows={recentWorkOrders.data?.data ?? []} />
        </Panel>
      </div>

      <Panel title="Ghi chu du lieu" subtitle="Nhung KPI tong hop sau nay nen chuyen sang dashboard summary endpoint neu can realtime cao.">
        <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-3">
          <div className="flex gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>Doanh thu don hang chua hien thi vi FE hien chua co query list admin orders/payment chuan hoa.</span>
          </div>
          <div className="flex gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>Average rating toan he thong hien can aggregate endpoint rieng de tinh chinh xac.</span>
          </div>
          <div className="flex gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>Staff role khong goi API staff list de tranh 403; Admin/SuperAdmin se thay KPI staff active.</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}

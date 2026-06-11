import {
  CalendarClock,
  Car,
  CheckCircle2,
  ClipboardList,
  ShoppingCart,
  Star,
  TrendingUp,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

import { useAuthStore } from "@/stores/authStore";
import { useCarList } from "src/query/car/useCarQueries";
import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import { useAdminOrders, useRevenue } from "src/query/order/useOrderQueries";
import { usePendingReviews } from "src/query/review/useReviewQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import { useStaffList } from "src/query/staff/useStaffQueries";
import {
  useAppointments,
  useWorkOrders,
} from "src/query/workshop/useWorkshopQueries";
import type { OrderViewModel } from "src/services/api/functions/orders/order.api";
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
  icon: typeof CalendarClock;
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
            <th className="py-2 pr-4">Mã hẹn</th>
            <th className="py-2 pr-4">Thời gian</th>
            <th className="py-2 pr-4">Xe</th>
            <th className="py-2">Trạng thái</th>
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
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chưa có lịch hẹn.</p> : null}
    </div>
  );
}

function WorkOrderTable({ rows }: { rows: WorkOrderViewModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-4">Số phiếu</th>
            <th className="py-2 pr-4">Xe</th>
            <th className="py-2 pr-4">Trạng thái</th>
            <th className="py-2">Tổng tiền</th>
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
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chưa có phiếu công việc.</p> : null}
    </div>
  );
}

function OrderTable({ rows }: { rows: OrderViewModel[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="py-2 pr-4">Mã đơn</th>
            <th className="py-2 pr-4">Khách hàng</th>
            <th className="py-2 pr-4">Trạng thái</th>
            <th className="py-2 pr-4">Thanh toán</th>
            <th className="py-2">Tổng tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((item) => (
            <tr key={item.orderID}>
              <td className="py-2 pr-4 font-medium">{item.orderNumber}</td>
              <td className="py-2 pr-4">{item.customerName ?? "-"}</td>
              <td className="py-2 pr-4">{item.orderStatus}</td>
              <td className="py-2 pr-4">{item.paymentStatus}</td>
              <td className="py-2">{formatMoney(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">Chưa có đơn hàng.</p> : null}
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

  const todayAppointments = useAppointments({ page: 1, pageSize: 200, fromDate: today, toDate: today });
  const recentAppointments = useAppointments({ page: 1, pageSize: 5, fromDate: today, toDate: monthEnd });
  const workOrders = useWorkOrders({ page: 1, pageSize: 200 });
  const recentWorkOrders = useWorkOrders({ page: 1, pageSize: 5 });
  const completedWorkOrders = useWorkOrders({ page: 1, pageSize: 1, status: "Completed", fromDate: monthStart, toDate: monthEnd });
  const cars = useCarList({ pageIndex: 1, pageSize: 1 });
  const services = useServiceCatalog({ page: 1, pageSize: 1, isActive: true });
  const technicians = useHrTechniciansSearch({ page: 1, pageSize: 1, available: true });
  const pendingReviews = usePendingReviews({ page: 1, pageSize: 1 });
  const staff = useStaffList({ page: 1, pageSize: 1, isActive: true }, canReadStaff);
  const monthRevenue = useRevenue({ fromDate: monthStart, toDate: monthEnd, groupBy: "day" });
  const recentOrders = useAdminOrders({ page: 1, pageSize: 5 });

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
            Dashboard quản trị
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Hôm nay: {new Date().toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* KPI hàng 1 — vận hành */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Lịch hẹn hôm nay"
          value={todayTotal}
          hint={`${scheduledCount} scheduled · ${confirmedCount} confirmed`}
          icon={CalendarClock}
          loading={todayAppointments.isLoading}
        />
        <KpiCard
          title="Work order đang xử lý"
          value={activeWoTotal}
          hint={`${openWo} open · ${inProgressWo} in-progress · ${waitingWo} waiting`}
          icon={ClipboardList}
          tone="amber"
          loading={workOrders.isLoading}
        />
        <KpiCard
          title="Phiếu hoàn thành tháng này"
          value={completedWorkOrders.data?.totalCount ?? 0}
          hint={`${monthStart} — ${monthEnd}`}
          icon={CheckCircle2}
          tone="green"
          loading={completedWorkOrders.isLoading}
        />
        <KpiCard
          title="Review chờ duyệt"
          value={pendingReviews.data?.totalCount ?? 0}
          hint="Cần staff/admin phê duyệt"
          icon={Star}
          tone="red"
          loading={pendingReviews.isLoading}
        />
      </div>

      {/* KPI hàng 2 — kinh doanh */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Doanh thu tháng này"
          value={formatMoney(monthRevenue.data?.totalRevenue)}
          hint={`${monthRevenue.data?.totalOrders ?? 0} đơn hàng`}
          icon={TrendingUp}
          tone="green"
          loading={monthRevenue.isLoading}
        />
        <KpiCard
          title="Tổng đơn hàng"
          value={recentOrders.data?.totalCount ?? 0}
          hint="Tất cả đơn hàng trong hệ thống"
          icon={ShoppingCart}
          tone="blue"
          loading={recentOrders.isLoading}
        />
        <KpiCard
          title="Tổng xe"
          value={cars.data?.totalCount ?? 0}
          hint="Xe đang niêm yết"
          icon={Car}
          tone="slate"
          loading={cars.isLoading}
        />
        <KpiCard
          title="Dịch vụ active"
          value={services.data?.totalCount ?? 0}
          hint="Dịch vụ đang hoạt động"
          icon={Wrench}
          loading={services.isLoading}
        />
      </div>

      {/* KPI hàng 3 — nhân sự */}
      <div className="grid gap-4 sm:grid-cols-2">
        <KpiCard
          title="Kỹ thuật viên sẵn sàng"
          value={technicians.data?.totalCount ?? 0}
          hint="Technician available"
          icon={Users}
          tone="green"
          loading={technicians.isLoading}
        />
        <KpiCard
          title="Staff active"
          value={canReadStaff ? (staff.data?.totalCount ?? 0) : "Restricted"}
          hint={canReadStaff ? "Nhân viên đang hoạt động" : "Chỉ Admin/SuperAdmin xem được"}
          icon={UserCog}
          tone="slate"
          loading={canReadStaff && staff.isLoading}
        />
      </div>

      {/* Status bars */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Trạng thái lịch hẹn hôm nay" subtitle="Thống kê trên dữ liệu của ngày hiện tại">
          <div className="space-y-4">
            <StatusBar label="Scheduled" value={scheduledCount} total={todayTotal} tone="bg-amber-500" />
            <StatusBar label="Confirmed" value={confirmedCount} total={todayTotal} tone="bg-blue-600" />
            <StatusBar label="In-Progress" value={inProgressAppointmentCount} total={todayTotal} tone="bg-indigo-600" />
            <StatusBar label="Completed" value={completedAppointmentCount} total={todayTotal} tone="bg-emerald-600" />
          </div>
        </Panel>

        <Panel title="Work order theo trạng thái" subtitle="Work order cần xử lý">
          <div className="space-y-4">
            <StatusBar label="Open" value={openWo} total={activeWoTotal} tone="bg-slate-500" />
            <StatusBar label="InProgress" value={inProgressWo} total={activeWoTotal} tone="bg-blue-600" />
            <StatusBar label="WaitingParts" value={waitingWo} total={activeWoTotal} tone="bg-amber-500" />
          </div>
        </Panel>
      </div>

      {/* Các bảng dữ liệu gần đây */}
      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title="Lịch hẹn sắp tới" subtitle="Từ hôm nay đến cuối tháng">
          <AppointmentTable rows={recentAppointments.data?.data ?? []} />
        </Panel>
        <Panel title="Work order gần đây" subtitle="5 phiếu mới nhất">
          <WorkOrderTable rows={recentWorkOrders.data?.data ?? []} />
        </Panel>
      </div>

      <Panel title="Đơn hàng gần đây" subtitle="5 đơn hàng mới nhất trong hệ thống">
        <OrderTable rows={recentOrders.data?.data ?? []} />
      </Panel>
    </div>
  );
}

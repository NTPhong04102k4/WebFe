export const STATUS_BADGE: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  Scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  Sending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  Sent: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  Failed: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export const TARGET_LABEL: Record<string, string> = {
  Customer: "Khách hàng (FCM)",
  Staff: "Nhân viên (Email)",
  Both: "Tất cả",
};

export function formatDt(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("vi-VN", { hour12: false });
}

import { Lock, UserCheck, Users } from "lucide-react";
import type { ReactNode } from "react";

type UserSummaryProps = {
  total: number;
  currentPage: number;
  active: number;
  locked: number;
};

export function UserSummary({ total, currentPage, active, locked }: UserSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard icon={<Users className="h-5 w-5" />} label="Tong ket qua" value={total} />
      <SummaryCard icon={<Users className="h-5 w-5" />} label="Dang hien thi" value={currentPage} />
      <SummaryCard icon={<UserCheck className="h-5 w-5" />} label="Active tren trang" value={active} tone="green" />
      <SummaryCard icon={<Lock className="h-5 w-5" />} label="Bi khoa tren trang" value={locked} tone="red" />
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "blue",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  tone?: "blue" | "green" | "red";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    red: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
  }[tone];

  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </div>
    </div>
  );
}

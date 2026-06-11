import React from "react";
import { Inbox } from "lucide-react";

export type EmptyStateProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title = "Không có dữ liệu",
  description = "Chưa có mục nào để hiển thị.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="mb-4 h-12 w-12 text-slate-500 dark:text-slate-400" />
      <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      {action}
    </div>
  );
}

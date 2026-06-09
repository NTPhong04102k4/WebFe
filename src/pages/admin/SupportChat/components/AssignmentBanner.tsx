import { Bell, CheckCircle, X } from "lucide-react";
import type { AssignmentNotification } from "../useSupportChatHandler";

interface Props {
  notif: AssignmentNotification;
  onAccept: () => void;
  onDecline: () => void;
  disabled: boolean;
}

export function AssignmentBanner({ notif, onAccept, onDecline, disabled }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20 shrink-0">
      <Bell className="h-5 w-5 text-blue-600 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
          Yêu cầu phân công từ <span className="font-bold">{notif.requestedBy}</span>
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-400 truncate">
          Hội thoại #{notif.conversationId}
          {notif.subject ? `: ${notif.subject}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={disabled}
          onClick={onAccept}
        >
          <CheckCircle className="h-3.5 w-3.5" /> Chấp nhận
        </button>
        <button
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 disabled:opacity-50"
          disabled={disabled}
          onClick={onDecline}
        >
          <X className="h-3.5 w-3.5" /> Từ chối
        </button>
      </div>
    </div>
  );
}

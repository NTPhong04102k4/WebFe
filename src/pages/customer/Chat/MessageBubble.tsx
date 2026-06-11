import { Pin } from "lucide-react";
import type { MessageViewModel } from "@/services/api/functions/chat/chat.api";
import { highlightText } from "./highlightText";

interface MessageBubbleProps {
  message: MessageViewModel;
  isMine: boolean;
  staffName?: string;
  searchQuery: string;
}

export function MessageBubble({
  message,
  isMine,
  staffName,
  searchQuery,
}: MessageBubbleProps) {
  return (
    <div
      id={`msg-${message.messageID}`}
      className={`flex flex-col relative group ${isMine ? "items-end" : "items-start"} rounded-lg p-1`}
    >
      <div className="flex items-center gap-2 max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm transition-all duration-300 ${
            isMine
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-slate-100 text-slate-900 rounded-bl-none"
          }`}
        >
          {highlightText(message.content || "", searchQuery)}
        </div>
      </div>
      <span className="mt-1 text-[10px] text-slate-400 px-1 flex items-center gap-1">
        {isMine
          ? "Bạn"
          : message.senderType === "Staff"
            ? staffName || "Nhân viên"
            : "Hệ thống"}
        {" · "}
        {message.createdDate
          ? new Date(message.createdDate).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""}
        {message.isPinned && (
          <Pin className="h-2.5 w-2.5 text-amber-500 rotate-45" />
        )}
      </span>
    </div>
  );
}

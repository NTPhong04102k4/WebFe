import { MessageSquare } from "lucide-react";
import { FlatList } from "@/shared/components/FlatList";
import type { ConversationViewModel } from "@/services/api/functions/chat/chat.api";

interface ConversationListPanelProps {
  conversations: ConversationViewModel[];
  isLoading: boolean;
  selectedId: number | null;
  onSelect: (id: number) => void;
  subject: string;
  initialMessage: string;
  onSubjectChange: (value: string) => void;
  onInitialMessageChange: (value: string) => void;
  onCreate: () => void;
  isCreating: boolean;
}

export function ConversationListPanel({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  subject,
  initialMessage,
  onSubjectChange,
  onInitialMessageChange,
  onCreate,
  isCreating,
}: ConversationListPanelProps) {
  return (
    <div className="flex flex-col flex-1 border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto min-h-[280px] md:h-full md:overflow-hidden shrink-0">
      <div className="border-b border-slate-100 bg-slate-50/50 p-4 shrink-0">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-slate-500" />
          Lịch sử hội thoại
        </h2>
      </div>

      {isLoading && (
        <div className="p-4 text-center text-sm text-slate-450">
          Đang tải...
        </div>
      )}
      {!isLoading && conversations.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-400">
          Chưa có cuộc trò chuyện nào. Hãy tạo mới ở ô bên dưới!
        </div>
      )}
      {!isLoading && conversations.length > 0 && (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationID}
          estimateSize={() => 80}
          className="flex-1 max-h-[350px]"
          renderItem={({ item }) => {
            const isSelected = selectedId === item.conversationID;
            const hasUnread = (item.unreadCountCustomer ?? 0) > 0;
            return (
              <button
                type="button"
                className={`relative block w-full px-4 py-3.5 text-left transition-all hover:bg-slate-50 border-b border-slate-100 ${
                  isSelected
                    ? "bg-blue-50/70 border-l-4 border-blue-600 pl-3"
                    : "pl-4"
                }`}
                onClick={() => onSelect(item.conversationID)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`truncate text-sm font-medium ${
                      isSelected ? "text-blue-900" : "text-slate-700"
                    } ${hasUnread ? "font-bold text-slate-900" : ""}`}
                  >
                    {item.subject}
                  </span>
                  <span
                    className={`text-[10px] rounded px-1.5 py-0.5 font-medium shrink-0 ${
                      item.status === "Open" || item.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {item.status === "Closed" ? "Đã đóng" : "Đang mở"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[180px]">
                    {item.lastMessagePreview ||
                      (item.assignedStaffName
                        ? `NV: ${item.assignedStaffName}`
                        : "Chờ phân công")}
                  </span>
                  {hasUnread && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white shadow-sm">
                      {item.unreadCountCustomer}
                    </span>
                  )}
                </div>
              </button>
            );
          }}
        />
      )}

      {/* Create new conversation */}
      <div className="border-t border-slate-200 bg-slate-50/50 p-4 shrink-0">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Tạo hội thoại mới
        </h3>
        <div className="space-y-3">
          <input
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Tiêu đề (ví dụ: Tư vấn mua xe...)"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
            placeholder="Nội dung cần hỗ trợ..."
            value={initialMessage}
            onChange={(e) => onInitialMessageChange(e.target.value)}
          />
          <button
            className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            disabled={!subject.trim() || !initialMessage.trim() || isCreating}
            onClick={onCreate}
          >
            Gửi yêu cầu hỗ trợ
          </button>
        </div>
      </div>
    </div>
  );
}

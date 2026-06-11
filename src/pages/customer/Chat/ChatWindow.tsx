import {
  ArrowDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Pin,
  Search,
  Send,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { FlatList } from "@/shared/components/FlatList";
import type { MessageViewModel } from "@/services/api/functions/chat/chat.api";
import { MessageBubble } from "./MessageBubble";

interface ChatWindowProps {
  selectedId: number | null;
  subject?: string;
  assignedStaffName?: string;
  isClosed: boolean;
  messages: MessageViewModel[];
  pinnedMessage: MessageViewModel | null;

  isChatSearchOpen: boolean;
  chatSearchQuery: string;
  matchingMessageIds: number[];
  currentMatchIndex: number;
  onToggleSearch: () => void;
  onSearchQueryChange: (value: string) => void;
  onMatchIndexChange: (index: number) => void;
  onCloseSearch: () => void;

  showScrollBottomBtn: boolean;
  onScrollToBottom: () => void;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;

  message: string;
  onMessageChange: (value: string) => void;
  onMessageKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  isSending: boolean;

  onRequestClose: () => void;
}

export function ChatWindow({
  selectedId,
  subject,
  assignedStaffName,
  isClosed,
  messages,
  pinnedMessage,
  isChatSearchOpen,
  chatSearchQuery,
  matchingMessageIds,
  currentMatchIndex,
  onToggleSearch,
  onSearchQueryChange,
  onMatchIndexChange,
  onCloseSearch,
  showScrollBottomBtn,
  onScrollToBottom,
  onScroll,
  scrollContainerRef,
  message,
  onMessageChange,
  onMessageKeyDown,
  onSendMessage,
  isSending,
  onRequestClose,
}: ChatWindowProps) {
  if (!selectedId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-440 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4 text-slate-300 border border-slate-100">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h3 className="font-semibold text-slate-700 text-base mb-1">
          Hỗ trợ trực tuyến SoldCars
        </h3>
        <p className="text-sm max-w-sm">
          Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo mới để trao
          đổi với đội ngũ chăm sóc khách hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/30 shrink-0 gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{subject ?? "..."}</h3>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {assignedStaffName
                ? `Nhân viên hỗ trợ: ${assignedStaffName}`
                : "Đang chờ nhân viên kết nối"}
            </span>
            <span>·</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isClosed
                  ? "bg-slate-100 text-slate-500"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              {isClosed ? "Đã đóng" : "Đang mở"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-lg border shadow-sm transition ${
              isChatSearchOpen
                ? "bg-blue-50 border-blue-200 text-blue-600"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500"
            }`}
            title="Tìm kiếm tin nhắn"
          >
            <Search className="h-4 w-4" />
          </button>
          {!isClosed && (
            <button
              onClick={onRequestClose}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
            >
              Đóng hội thoại
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {isChatSearchOpen && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-2.5 shrink-0 gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-4 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Tìm tin nhắn..."
              value={chatSearchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex items-center gap-3">
            {matchingMessageIds.length > 0 && (
              <span className="text-xs text-slate-600 font-medium">
                {currentMatchIndex + 1}/{matchingMessageIds.length} kết quả
              </span>
            )}
            {matchingMessageIds.length === 0 && chatSearchQuery.trim() && (
              <span className="text-xs text-red-500 font-medium">
                Không tìm thấy
              </span>
            )}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() =>
                  onMatchIndexChange(
                    currentMatchIndex > 0
                      ? currentMatchIndex - 1
                      : matchingMessageIds.length - 1,
                  )
                }
                disabled={matchingMessageIds.length === 0}
                className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  onMatchIndexChange(
                    currentMatchIndex < matchingMessageIds.length - 1
                      ? currentMatchIndex + 1
                      : 0,
                  )
                }
                disabled={matchingMessageIds.length === 0}
                className="p-1.5 border-l border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={onCloseSearch}
              className="p-1.5 text-slate-450 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pinned message banner */}
      {pinnedMessage && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50/80 px-6 py-2 shrink-0 gap-4">
          <div
            className="flex flex-1 items-center gap-2 cursor-pointer truncate text-xs text-amber-900 font-semibold"
            onClick={() => {
              const el = document.getElementById(
                `msg-${pinnedMessage.messageID}`,
              );
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-4", "ring-amber-400");
                setTimeout(
                  () => el.classList.remove("ring-4", "ring-amber-400"),
                  2000,
                );
              }
            }}
          >
            <Pin className="h-3.5 w-3.5 text-amber-600 shrink-0 rotate-45" />
            <span className="truncate">
              Tin nhắn ghim:{" "}
              <span className="font-normal text-slate-700">
                &ldquo;{pinnedMessage.content}&rdquo;
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Messages list */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 bg-slate-50/20">
          <MessageSquare className="h-8 w-8 mb-2 opacity-55" />
          <p className="text-sm">
            Bắt đầu trò chuyện bằng cách nhập tin nhắn bên dưới.
          </p>
        </div>
      )}
      {messages.length > 0 && (
        <FlatList
          data={[...messages].reverse()}
          keyExtractor={(item) => item.messageID}
          inverted={true}
          estimateSize={() => 70}
          className="flex-1 p-6 bg-slate-50/20"
          scrollRef={scrollContainerRef}
          onScroll={onScroll}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.senderType === "Customer"}
              staffName={assignedStaffName}
              searchQuery={chatSearchQuery}
            />
          )}
        />
      )}

      {/* Scroll to bottom button */}
      {showScrollBottomBtn && (
        <button
          onClick={onScrollToBottom}
          className="absolute bottom-20 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 focus:outline-none z-10 hover:scale-110"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}

      {/* Input box */}
      <div className="border-t border-slate-100 p-4 bg-white shrink-0">
        {isClosed ? (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>
              Cuộc hội thoại này đã đóng. Nếu cần hỗ trợ thêm, vui lòng tạo
              hội thoại mới.
            </span>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={onMessageKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={isSending}
            />
            <button
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-700 disabled:opacity-50"
              disabled={!message.trim() || isSending}
              onClick={onSendMessage}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import {
  Send, MessageSquare, Search, CheckCircle, AlertCircle, UserPlus,
  Lock, Pin, X, ChevronUp, ChevronDown, ArrowDown, Info, Star,
} from "lucide-react";
import { Input } from "@/components/core/Form/Input";
import EmptyState from "@/components/common/EmptyState";
import type { ConversationViewModel, MessageViewModel } from "@/services/api/functions/chat/chat.api";
import { getCustomerDisplayName } from "../supportChatHelpers";

const highlightText = (text: string, q: string): React.ReactNode => {
  if (!q.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${q.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase()
          ? <mark key={i} className="bg-yellow-300 text-slate-950 px-0.5 rounded font-semibold">{p}</mark>
          : p
      )}
    </>
  );
};

interface Props {
  activeConversation: ConversationViewModel;
  messages: MessageViewModel[];
  pinnedMessage: MessageViewModel | null;
  isClosed: boolean;
  isAssignedToMe: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  showScrollBottomBtn: boolean;
  onScroll: () => void;
  scrollToBottom: () => void;
  isChatSearchOpen: boolean;
  onToggleChatSearch: () => void;
  chatSearchQuery: string;
  onChatSearchChange: (v: string) => void;
  currentMatchIndex: number;
  matchingMessageIds: number[];
  onMatchIndexChange: (v: number | ((p: number) => number)) => void;
  isCustomerInfoOpen: boolean;
  onToggleCustomerInfo: () => void;
  message: string;
  onMessageChange: (v: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessagePending: boolean;
  onPin: (messageId: number, pin: boolean) => void;
  onAssignSelf: () => void;
  assignSelfPending: boolean;
  onOpenCloseModal: () => void;
}

export function ChatWindow({
  activeConversation, messages, pinnedMessage, isClosed, isAssignedToMe,
  messagesEndRef, scrollContainerRef, showScrollBottomBtn, onScroll, scrollToBottom,
  isChatSearchOpen, onToggleChatSearch, chatSearchQuery, onChatSearchChange,
  currentMatchIndex, matchingMessageIds, onMatchIndexChange,
  isCustomerInfoOpen, onToggleCustomerInfo,
  message, onMessageChange, onSendMessage, onKeyDown, sendMessagePending,
  onPin, onAssignSelf, assignSelfPending, onOpenCloseModal,
}: Props) {
  return (
    <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">

      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 shrink-0 gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
            {getCustomerDisplayName(activeConversation)}
          </h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="truncate max-w-[200px]">Yêu cầu: {activeConversation.subject}</span>
            <span>·</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
              activeConversation.status === "Open" || activeConversation.status === "Active"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-slate-150 text-slate-600 dark:bg-slate-800"
            }`}>
              {activeConversation.status === "Closed" ? "Đã đóng" : activeConversation.status === "Active" ? "Đang xử lý" : "Đang mở"}
            </span>
            {activeConversation.pendingStaffID && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                ⏳ Chờ xác nhận phân công
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChatSearch}
            className={`p-2 rounded-lg border shadow-sm transition ${
              isChatSearchOpen
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/35"
                : "border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
            }`}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleCustomerInfo}
            className={`p-2 rounded-lg border shadow-sm transition ${
              isCustomerInfoOpen
                ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/35"
                : "border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <Info className="h-4 w-4" />
          </button>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {!activeConversation.assignedStaffName ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
              disabled={assignSelfPending}
              onClick={onAssignSelf}
            >
              <UserPlus className="h-3.5 w-3.5" /> Nhận hỗ trợ
            </button>
          ) : !isAssignedToMe ? (
            <button
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              disabled={assignSelfPending}
              onClick={onAssignSelf}
            >
              Chuyển cho tôi
            </button>
          ) : !isClosed ? (
            <button
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40"
              onClick={onOpenCloseModal}
            >
              <CheckCircle className="h-3.5 w-3.5" /> Đóng hỗ trợ
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs text-slate-550 dark:bg-slate-800">
              <Lock className="h-3 w-3" /> Đã kết thúc
            </span>
          )}
        </div>
      </div>

      {/* Chat search bar */}
      {isChatSearchOpen && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900 shrink-0 gap-2">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm tin nhắn..."
              value={chatSearchQuery}
              onChange={(e) => onChatSearchChange(e.target.value)}
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
              <span className="text-xs text-red-500 font-medium">Không tìm thấy</span>
            )}
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white dark:border-slate-700">
              <button
                onClick={() => onMatchIndexChange((p) => (p > 0 ? p - 1 : matchingMessageIds.length - 1))}
                disabled={matchingMessageIds.length === 0}
                className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              ><ChevronUp className="h-4 w-4" /></button>
              <button
                onClick={() => onMatchIndexChange((p) => (p < matchingMessageIds.length - 1 ? p + 1 : 0))}
                disabled={matchingMessageIds.length === 0}
                className="p-1.5 border-l border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
              ><ChevronDown className="h-4 w-4" /></button>
            </div>
            <button
              onClick={() => { onToggleChatSearch(); onChatSearchChange(""); }}
              className="p-1.5 text-slate-450 hover:text-slate-650"
            ><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      {/* Pinned banner */}
      {pinnedMessage && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50/80 px-6 py-2 dark:border-slate-800/60 dark:bg-amber-950/10 shrink-0 gap-4">
          <div
            className="flex flex-1 items-center gap-2 cursor-pointer truncate text-xs text-amber-900 dark:text-amber-400 font-semibold"
            onClick={() => {
              const el = document.getElementById(`msg-${pinnedMessage.messageID}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                el.classList.add("ring-4", "ring-amber-400");
                setTimeout(() => el.classList.remove("ring-4", "ring-amber-400"), 2000);
              }
            }}
          >
            <Pin className="h-3.5 w-3.5 text-amber-600 shrink-0 rotate-45" />
            <span className="truncate">
              Tin nhắn ghim:{" "}
              <span className="font-normal text-slate-700 dark:text-slate-300">
                &ldquo;{pinnedMessage.content}&rdquo;
              </span>
            </span>
          </div>
          <button
            onClick={() => onPin(pinnedMessage.messageID, false)}
            className="text-slate-400 hover:text-slate-600"
          ><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="flex-1 space-y-4 overflow-y-auto p-6 bg-slate-50/20 dark:bg-slate-950/5 relative"
      >
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              title="Chưa có tin nhắn nào"
              description="Chưa có tin nhắn nào trong hội thoại này."
            />
          </div>
        )}

        {messages.map((item: MessageViewModel) => {
          const mine = item.senderType === "Staff" && isAssignedToMe;

          return (
            <div
              key={item.messageID}
              id={`msg-${item.messageID}`}
              className={`flex flex-col relative group ${mine ? "items-end" : "items-start"} transition-all duration-200 rounded-lg p-1`}
            >
              <div className="flex items-center gap-2 max-w-[80%]">
                {!mine && !isClosed && (
                  <button
                    onClick={() => onPin(item.messageID, !item.isPinned)}
                    className={`opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded-full shrink-0 transition ${
                      item.isPinned ? "bg-amber-100 text-amber-600 opacity-100" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                    title={item.isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                  ><Pin className="h-3 w-3" /></button>
                )}

                <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm transition-all duration-300 ${
                  mine
                    ? "bg-blue-600 text-white rounded-br-none dark:bg-blue-500"
                    : item.senderType === "Customer"
                      ? "bg-slate-100 text-slate-900 rounded-bl-none dark:bg-slate-800 dark:text-slate-100"
                      : "bg-amber-100 text-amber-900 rounded-bl-none dark:bg-amber-900/20 dark:text-amber-300 border border-amber-200"
                }`}>
                  {highlightText(item.content || "", chatSearchQuery)}
                </div>

                {mine && !isClosed && (
                  <button
                    onClick={() => onPin(item.messageID, !item.isPinned)}
                    className={`opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded-full shrink-0 transition ${
                      item.isPinned ? "bg-amber-100 text-amber-600 opacity-100" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                    title={item.isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                  ><Pin className="h-3 w-3" /></button>
                )}
              </div>

              <span className="mt-1 text-[10px] text-slate-400 px-1 dark:text-slate-500 flex items-center gap-1">
                {item.senderType === "Customer"
                  ? `Khách hàng (${getCustomerDisplayName(activeConversation)})`
                  : mine ? "Bạn" : `Nhân viên (${activeConversation.assignedStaffName || "Hệ thống"})`}
                {" · "}
                {item.createdDate
                  ? new Date(item.createdDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : ""}
                {item.isPinned && <Pin className="h-2.5 w-2.5 text-amber-500 rotate-45" />}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {showScrollBottomBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-20 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 z-10 hover:scale-110"
        ><ArrowDown className="h-5 w-5" /></button>
      )}

      {/* Message input */}
      <div className="border-t border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-950 shrink-0">
        {isClosed ? (
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 p-3.5 text-slate-600 text-sm">
            <Lock className="h-4 w-4 shrink-0" />
            <span>Cuộc trò chuyện đã kết thúc.</span>
          </div>
        ) : !isAssignedToMe ? (
          <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-950/10 dark:border-amber-900/30 p-3.5 text-amber-800 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Bạn cần nhận hỗ trợ cuộc trò chuyện này để có thể gửi tin nhắn.</span>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1 min-w-0">
              <Input
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập tin nhắn phản hồi cho khách hàng..."
                disabled={sendMessagePending}
              />
            </div>
            <button
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500 mb-[2px]"
              disabled={!message.trim() || sendMessagePending}
              onClick={onSendMessage}
            ><Send className="h-5 w-5" /></button>
          </div>
        )}
      </div>
    </div>
  );
}

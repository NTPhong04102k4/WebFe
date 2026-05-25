import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import { aiApi } from "@/services/api/functions/ai/ai.api";
import type { AiMessageViewModel, AiSessionViewModel } from "@/services/api/functions/ai/ai.api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  messageID?: number;
}

type FeedbackMap = Record<number, "up" | "down">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeHistory(messages: AiMessageViewModel[]): DisplayMessage[] {
  const result: DisplayMessage[] = [];
  for (const m of messages) {
    if (m.text) {
      result.push({ id: `${m.messageID}-u`, role: "user", content: m.text });
    }
    const aiContent = m.response ?? (m.role === "assistant" ? (m.content ?? null) : null);
    if (aiContent) {
      result.push({
        id: `${m.messageID}-a`,
        role: "assistant",
        content: aiContent,
        messageID: m.messageID,
      });
    }
  }
  return result;
}

function formatSessionDate(dateStr?: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SendIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

function ThumbUpIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbDownIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z" />
      <path d="M17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <line x1="12" y1="7" x2="12" y2="11" />
      <line x1="8" y1="15" x2="8" y2="15" strokeWidth={3} strokeLinecap="round" />
      <line x1="12" y1="15" x2="12" y2="15" strokeWidth={3} strokeLinecap="round" />
      <line x1="16" y1="15" x2="16" y2="15" strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
        <BotIcon />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3.5 shadow-sm ring-1 ring-slate-200/80">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  feedback,
  onFeedback,
  feedbackPending,
}: {
  message: DisplayMessage;
  feedback?: "up" | "down";
  onFeedback: (messageID: number, rating: "up" | "down") => void;
  feedbackPending: boolean;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
        <BotIcon />
      </div>
      <div className="group flex max-w-[75%] flex-col gap-1.5">
        <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-sm ring-1 ring-slate-200/80">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
        {message.messageID != null && (
          <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              disabled={feedbackPending || feedback != null}
              onClick={() => onFeedback(message.messageID!, "up")}
              className={`rounded-md px-1.5 py-0.5 text-xs transition-colors disabled:pointer-events-none ${
                feedback === "up"
                  ? "text-green-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title="Hữu ích"
            >
              <ThumbUpIcon filled={feedback === "up"} />
            </button>
            <button
              disabled={feedbackPending || feedback != null}
              onClick={() => onFeedback(message.messageID!, "down")}
              className={`rounded-md px-1.5 py-0.5 text-xs transition-colors disabled:pointer-events-none ${
                feedback === "down"
                  ? "text-red-500"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              }`}
              title="Không hữu ích"
            >
              <ThumbDownIcon filled={feedback === "down"} />
            </button>
            {feedback != null && (
              <span className="ml-1 text-xs text-slate-400">
                {feedback === "up" ? "Cảm ơn!" : "Ghi nhận phản hồi"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionItem({
  session,
  isActive,
  onSelect,
  onDelete,
  deleteIsPending,
}: {
  session: AiSessionViewModel;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  deleteIsPending: boolean;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 transition-colors ${
        isActive ? "bg-blue-50" : "hover:bg-slate-50"
      }`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
    >
      <MessageIcon />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${isActive ? "text-blue-700" : "text-slate-800"}`}>
          {session.title || "Cuộc trò chuyện"}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {session.totalMessages ?? 0} tin · {formatSessionDate(session.updatedDate ?? session.createdDate)}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        disabled={deleteIsPending}
        className="shrink-0 rounded p-1 text-slate-300 opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 disabled:opacity-30"
        title="Xóa phiên chat"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function EmptyState() {
  const suggestions = [
    "Toyota Camry 2024 còn hàng không?",
    "Đặt lịch bảo dưỡng như thế nào?",
    "So sánh Honda CR-V và Mazda CX-5",
    "Tôi muốn gặp nhân viên tư vấn",
  ];
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
        <BotIcon />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">Trợ lý AI SoldCars</h3>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Tôi có thể giúp bạn tìm xe, đặt lịch dịch vụ, so sánh mẫu xe và nhiều hơn nữa.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <div
            key={s}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-left text-sm text-slate-600 hover:border-blue-300 hover:bg-blue-50/50"
          >
            "{s}"
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AiChatPage() {
  const qc = useQueryClient();

  // ── State (all useState/useRef before queries/mutations) ──────────────────
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [feedbackMap, setFeedbackMap] = useState<FeedbackMap>({});
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Queries ────────────────────────────────────────────────────────────────
  const sessionsQuery = useQuery({
    queryKey: ["ai-sessions"],
    queryFn: ({ signal }) => aiApi.sessions({ signal }),
  });

  const historyQuery = useQuery({
    queryKey: ["ai-messages", sessionId],
    enabled: sessionId != null,
    queryFn: ({ signal }) => aiApi.messages(sessionId!, { signal }),
    staleTime: 30_000,
  });

  // ── Mutations (declared before effects that depend on them) ───────────────
  const sendMutation = useMutation({
    mutationFn: (text: string) =>
      aiApi.chat({ sessionID: sessionId, text, inputType: "text" }),
    onMutate: (text) => {
      setIsSending(true);
      setMessages((prev) => [
        ...prev,
        { id: `opt-${Date.now()}`, role: "user", content: text },
      ]);
    },
    onSuccess: (res) => {
      setSessionId(res.sessionID);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${res.messageID}`,
          role: "assistant",
          content: res.response,
          messageID: res.messageID,
        },
      ]);
      qc.invalidateQueries({ queryKey: ["ai-sessions"] });
      if (res.wasEscalated) {
        notify.success("AI đã chuyển cuộc trò chuyện sang nhân viên hỗ trợ");
      }
    },
    onError: (err: Error) => {
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("opt-")));
      notify.error(err.message || "Gửi thất bại. Thử lại.");
    },
    onSettled: () => setIsSending(false),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => aiApi.deleteSession(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["ai-sessions"] });
      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
      }
      notify.success("Đã xóa phiên chat.");
    },
    onError: () => notify.error("Xóa thất bại."),
  });

  const feedbackMutation = useMutation({
    mutationFn: ({ messageID, rating }: { messageID: number; rating: "up" | "down" }) =>
      aiApi.feedback(messageID, { rating: rating === "up" ? 1 : -1 }),
    onMutate: ({ messageID, rating }) => {
      setFeedbackMap((prev) => ({ ...prev, [messageID]: rating }));
    },
    onError: (_, { messageID }) => {
      setFeedbackMap((prev) => {
        const next = { ...prev };
        delete next[messageID];
        return next;
      });
      notify.error("Gửi đánh giá thất bại.");
    },
  });

  // ── Effects ────────────────────────────────────────────────────────────────

  // Auto-select first session on initial load
  useEffect(() => {
    if (sessionId == null && sessionsQuery.data?.[0]) {
      setSessionId(sessionsQuery.data[0].sessionID);
    }
  }, [sessionId, sessionsQuery.data]);

  // Populate messages from server history when session changes
  useEffect(() => {
    if (historyQuery.data) {
      setMessages(normalizeHistory(historyQuery.data));
      setFeedbackMap({});
    }
  }, [historyQuery.data]);

  // Scroll to bottom on new messages or while AI is typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setInput("");
    setFeedbackMap({});
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSelectSession = (id: number) => {
    if (id === sessionId) return;
    setSessionId(id);
    setMessages([]);
    setFeedbackMap({});
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMutation.mutate(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.currentTarget;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  };

  const handleFeedback = (messageID: number, rating: "up" | "down") => {
    feedbackMutation.mutate({ messageID, rating });
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const sessions = sessionsQuery.data ?? [];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <span className="text-sm font-semibold text-slate-800">Lịch sử chat</span>
          <Link
            to="/chat"
            className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            Nhân viên ›
          </Link>
        </div>

        {/* New chat button */}
        <div className="px-3 pt-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          >
            <PlusIcon />
            Cuộc trò chuyện mới
          </button>
        </div>

        {/* Sessions list */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-0.5 px-2 pb-4">
          {sessionsQuery.isLoading ? (
            <div className="space-y-2 px-1 pt-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="mt-6 text-center text-xs text-slate-400">Chưa có cuộc trò chuyện nào.</p>
          ) : (
            sessions.map((session) => (
              <SessionItem
                key={session.sessionID}
                session={session}
                isActive={sessionId === session.sessionID}
                onSelect={() => handleSelectSession(session.sessionID)}
                onDelete={() => deleteMutation.mutate(session.sessionID)}
                deleteIsPending={
                  deleteMutation.isPending && deleteMutation.variables === session.sessionID
                }
              />
            ))
          )}
        </div>
      </aside>

      {/* ── Main Chat Area ───────────────────────────────────────────── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3.5 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <BotIcon />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Trợ lý AI SoldCars</p>
            <p className="text-xs text-slate-400">
              {isSending ? (
                <span className="text-blue-500">Đang soạn trả lời...</span>
              ) : (
                "Sẵn sàng hỗ trợ bạn"
              )}
            </p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {historyQuery.isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "items-end gap-3"}`}>
                  {i % 2 !== 0 && (
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-200" />
                  )}
                  <div
                    className={`animate-pulse rounded-2xl bg-slate-200 ${i % 2 === 0 ? "h-12 w-48" : "h-16 w-64"}`}
                  />
                </div>
              ))}
            </div>
          ) : messages.length === 0 && !isSending ? (
            <EmptyState />
          ) : (
            <div className="space-y-5">
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  feedback={msg.messageID != null ? feedbackMap[msg.messageID] : undefined}
                  onFeedback={handleFeedback}
                  feedbackPending={feedbackMutation.isPending}
                />
              ))}
              {isSending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto flex max-w-4xl items-end gap-3">
            <div className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400/20">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi... (Enter gửi · Shift+Enter xuống dòng)"
                rows={1}
                disabled={isSending}
                className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60"
                style={{ maxHeight: "160px" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              title="Gửi (Enter)"
            >
              {isSending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <SendIcon />
              )}
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-slate-400">
            AI có thể sai. Hãy kiểm tra thông tin quan trọng trước khi quyết định.
          </p>
        </div>
      </main>
    </div>
  );
}

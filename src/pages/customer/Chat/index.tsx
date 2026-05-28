import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import {
  Send,
  MessageSquare,
  User,
  ShieldAlert,
  Pin,
  X,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Search,
  Star,
} from "lucide-react";
import {
  chatApi,
  type CloseConversationRequest,
} from "@/services/api/functions/chat/chat.api";
import { useChatHub } from "@/hooks/useChatHub";

export default function CustomerChatPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [message, setMessage] = useState("");

  // Close modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRating, setCloseRating] = useState<number>(0);
  const [closeFeedback, setCloseFeedback] = useState("");

  // Search
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchingMessageIds, setMatchingMessageIds] = useState<number[]>([]);

  // Scroll
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── SignalR realtime ─────────────────────────────────────────────────────
  useChatHub({ activeConversationId: selectedId });

  // ── Queries (không cần refetchInterval nữa — SignalR push) ───────────────
  const conversations = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: ({ signal }) => chatApi.conversations({ signal }),
    // Giữ 30s để fallback nếu SignalR mất kết nối
    refetchInterval: 30_000,
  });

  const detail = useQuery({
    queryKey: ["chat-conversation", selectedId],
    enabled: selectedId != null,
    queryFn: ({ signal }) => chatApi.detail(selectedId!, { signal }),
    refetchInterval: selectedId != null ? 30_000 : undefined,
  });

  const messages = detail.data?.messages ?? [];
  // Pinned messages từ server (không dùng localStorage nữa)
  const pinnedMessage = (detail.data?.pinnedMessages ?? [])[0] ?? null;
  const selectedConversation = conversations.data?.find(
    (c) => c.conversationID === selectedId
  );

  // ── Auto-select first conversation ───────────────────────────────────────
  useEffect(() => {
    if (!selectedId && conversations.data?.[0]) {
      setSelectedId(conversations.data[0].conversationID);
    }
  }, [conversations.data, selectedId]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottomBtn(false);
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const isScrolledUp =
      container.scrollHeight - container.scrollTop - container.clientHeight > 200;
    setShowScrollBottomBtn(isScrolledUp);
  };

  // ── Mark as read ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (selectedId) {
      chatApi
        .markRead(selectedId)
        .then(() => qc.invalidateQueries({ queryKey: ["chat-conversations"] }))
        .catch(() => {});
    }
  }, [selectedId, messages.length, qc]);

  // ── In-chat search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      setMatchingMessageIds([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const matches = messages
      .filter(
        (m) =>
          m.content && m.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
      .map((m) => m.messageID);
    setMatchingMessageIds(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
  }, [chatSearchQuery, messages]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && matchingMessageIds[currentMatchIndex]) {
      const targetId = matchingMessageIds[currentMatchIndex];
      const element = document.getElementById(`message-bubble-${targetId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-4", "ring-amber-400");
        const timer = setTimeout(
          () => element.classList.remove("ring-4", "ring-amber-400"),
          2000
        );
        return () => clearTimeout(timer);
      }
    }
  }, [currentMatchIndex, matchingMessageIds]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createConversation = useMutation({
    mutationFn: () =>
      chatApi.createConversation({
        conversationType: "Support",
        priority: "Normal",
        subject: subject.trim(),
        initialMessage: initialMessage.trim(),
      }),
    onSuccess: (data) => {
      setSelectedId(data.conversationID);
      setSubject("");
      setInitialMessage("");
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      notify.success("Đã tạo cuộc trò chuyện");
    },
    onError: (error: Error) => notify.error(error.message),
  });

  const sendMessage = useMutation({
    mutationFn: () =>
      chatApi.sendMessage({
        conversationID: selectedId!,
        messageType: "Text",
        content: message.trim(),
      }),
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["chat-conversation", selectedId] });
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error: Error) => notify.error(error.message),
  });


  const closeConversation = useMutation({
    mutationFn: (body: CloseConversationRequest) =>
      chatApi.close(selectedId!, body),
    onSuccess: () => {
      setShowCloseModal(false);
      setCloseRating(0);
      setCloseFeedback("");
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["chat-conversation", selectedId] });
      notify.success("Đã đóng cuộc trò chuyện");
    },
    onError: (error: Error) => notify.error(error.message),
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      message.trim() &&
      !sendMessage.isPending
    ) {
      event.preventDefault();
      sendMessage.mutate();
    }
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <>{text}</>;
    const parts = text.split(
      new RegExp(
        `(${search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
        "gi"
      )
    );
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === search.toLowerCase() ? (
            <mark
              key={i}
              className="bg-yellow-300 text-slate-950 px-0.5 rounded font-semibold"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const isClosed = detail.data?.status === "Closed";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Close Modal với Rating */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Đóng cuộc trò chuyện
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Hãy để lại đánh giá để giúp chúng tôi cải thiện dịch vụ.
            </p>

            {/* Rating stars */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Đánh giá chất lượng hỗ trợ
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCloseRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= closeRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 hover:text-amber-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Nhận xét thêm (không bắt buộc)..."
              value={closeFeedback}
              onChange={(e) => setCloseFeedback(e.target.value)}
            />

            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                onClick={() => setShowCloseModal(false)}
              >
                Huỷ
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                disabled={closeConversation.isPending}
                onClick={() =>
                  closeConversation.mutate({
                    customerRating: closeRating || null,
                    customerFeedback: closeFeedback.trim() || null,
                  })
                }
              >
                Xác nhận đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <MessageSquare className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhắn tin hỗ trợ</h1>
          <p className="text-sm text-slate-500">
            Trao đổi trực tiếp với nhân viên chăm sóc khách hàng của SoldCars
          </p>
        </div>
      </div>

      <div className="mt-6 grid min-h-[620px] gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 bg-slate-50/50 p-4">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-500" />
              Lịch sử hội thoại
            </h2>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[350px] lg:max-h-[300px]">
            {conversations.isLoading && (
              <div className="p-4 text-center text-sm text-slate-400">
                Đang tải...
              </div>
            )}
            {!conversations.isLoading &&
              (conversations.data ?? []).length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  Chưa có cuộc trò chuyện nào. Hãy tạo mới ở ô bên dưới!
                </div>
              )}

            {(conversations.data ?? []).map((item) => {
              const isSelected = selectedId === item.conversationID;
              // ✅ Đúng field: unreadCountCustomer
              const hasUnread = (item.unreadCountCustomer ?? 0) > 0;
              return (
                <button
                  key={item.conversationID}
                  type="button"
                  className={`relative block w-full px-4 py-3.5 text-left transition-all hover:bg-slate-50 ${
                    isSelected
                      ? "bg-blue-50/70 border-l-4 border-blue-600 pl-3"
                      : "pl-4"
                  }`}
                  onClick={() => setSelectedId(item.conversationID)}
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
                      {/* ✅ Đúng field: lastMessagePreview */}
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
            })}
          </div>

          {/* Create new conversation */}
          <div className="border-t border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Tạo hội thoại mới
            </h3>
            <div className="space-y-3">
              <input
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Tiêu đề (ví dụ: Tư vấn mua xe...)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={2}
                placeholder="Nội dung cần hỗ trợ..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
              />
              <button
                className="w-full rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                disabled={
                  !subject.trim() ||
                  !initialMessage.trim() ||
                  createConversation.isPending
                }
                onClick={() => createConversation.mutate()}
              >
                Gửi yêu cầu hỗ trợ
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="flex rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[550px] relative">
          {selectedId ? (
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/30 shrink-0 gap-2">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {detail.data?.subject ?? "..."}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedConversation?.assignedStaffName
                        ? `Nhân viên hỗ trợ: ${selectedConversation.assignedStaffName}`
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
                    onClick={() => setIsChatSearchOpen(!isChatSearchOpen)}
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
                      onClick={() => setShowCloseModal(true)}
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
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    {matchingMessageIds.length > 0 && (
                      <span className="text-xs text-slate-600 font-medium">
                        {currentMatchIndex + 1}/{matchingMessageIds.length} kết quả
                      </span>
                    )}
                    {matchingMessageIds.length === 0 &&
                      chatSearchQuery.trim() !== "" && (
                        <span className="text-xs text-red-500 font-medium">
                          Không tìm thấy
                        </span>
                      )}
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() =>
                          setCurrentMatchIndex((prev) =>
                            prev > 0 ? prev - 1 : matchingMessageIds.length - 1
                          )
                        }
                        disabled={matchingMessageIds.length === 0}
                        className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentMatchIndex((prev) =>
                            prev < matchingMessageIds.length - 1 ? prev + 1 : 0
                          )
                        }
                        disabled={matchingMessageIds.length === 0}
                        className="p-1.5 border-l border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setIsChatSearchOpen(false);
                        setChatSearchQuery("");
                      }}
                      className="p-1.5 text-slate-450 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pinned message banner — từ server */}
              {pinnedMessage && (
                <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50/80 px-6 py-2 shrink-0 gap-4">
                  <div
                    className="flex flex-1 items-center gap-2 cursor-pointer truncate text-xs text-amber-900 font-semibold"
                    onClick={() => {
                      const el = document.getElementById(
                        `message-bubble-${pinnedMessage.messageID}`
                      );
                      if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                        el.classList.add("ring-4", "ring-amber-400");
                        setTimeout(
                          () => el.classList.remove("ring-4", "ring-amber-400"),
                          2000
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
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 space-y-4 overflow-y-auto p-6 bg-slate-50/20"
              >
                {messages.length === 0 && (
                  <div className="flex h-full flex-col items-center justify-center text-slate-400">
                    <MessageSquare className="h-8 w-8 mb-2 opacity-55" />
                    <p className="text-sm">
                      Bắt đầu trò chuyện bằng cách nhập tin nhắn bên dưới.
                    </p>
                  </div>
                )}

                {messages.map((item) => {
                  const mine = item.senderType === "Customer";
                  return (
                    <div
                      key={item.messageID}
                      id={`message-bubble-${item.messageID}`}
                      className={`flex flex-col relative group ${
                        mine ? "items-end" : "items-start"
                      } rounded-lg p-1`}
                    >
                      <div className="flex items-center gap-2 max-w-[80%]">
                        <div
                          className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words shadow-sm transition-all duration-300 ${
                            mine
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-slate-100 text-slate-900 rounded-bl-none"
                          }`}
                        >
                          {highlightText(item.content || "", chatSearchQuery)}
                        </div>
                      </div>
                      <span className="mt-1 text-[10px] text-slate-400 px-1 flex items-center gap-1">
                        {mine
                          ? "Bạn"
                          : item.senderType === "Staff"
                          ? selectedConversation?.assignedStaffName || "Nhân viên"
                          : "Hệ thống"}
                        {" · "}
                        {item.createdDate
                          ? new Date(item.createdDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                        {item.isPinned && (
                          <Pin className="h-2.5 w-2.5 text-amber-500 rotate-45" />
                        )}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBottomBtn && (
                <button
                  onClick={scrollToBottom}
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
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Nhập tin nhắn..."
                      disabled={sendMessage.isPending}
                    />
                    <button
                      className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-700 disabled:opacity-50"
                      disabled={!message.trim() || sendMessage.isPending}
                      onClick={() => sendMessage.mutate()}
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-440 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4 text-slate-300 border border-slate-100">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-700 text-base mb-1">
                Hỗ trợ trực tuyến SoldCars
              </h3>
              <p className="text-sm max-w-sm">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc tạo mới để trao đổi
                với đội ngũ chăm sóc khách hàng.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

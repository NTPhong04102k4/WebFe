import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import {
  Send,
  MessageSquare,
  Search,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Lock,
  MessageCircle,
  Inbox,
  Pin,
  X,
  ChevronUp,
  ChevronDown,
  ArrowDown,
  Info,
  Star,
  Bell,
} from "lucide-react";
import {
  chatApi,
  type MessageViewModel,
  type ConversationViewModel,
} from "@/services/api/functions/chat/chat.api";
import { useAuthStore } from "@/stores/authStore";
import { useChatHub } from "@/hooks/useChatHub";

const getCustomerDisplayName = (item?: ConversationViewModel | null) => {
  if (!item) return "Khách ẩn danh";
  return item.customerName || (item as any).customerUsername || (item as any).userName || (item as any).username || "Khách ẩn danh";
};

// ── Assignment Notification Banner ──────────────────────────────────────────

interface AssignmentNotification {
  conversationId: number;
  requestedBy: string;
  subject?: string;
  action?: string;
  assignRequestedAt?: string;
}

export default function AdminSupportChatPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Active" | "Closed">("Open");
  const [assignmentFilter, setAssignmentFilter] = useState<"All" | "Mine" | "Unassigned">("All");
  const [message, setMessage] = useState("");

  // Advanced states
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(true);

  // Search in chat
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchingMessageIds, setMatchingMessageIds] = useState<number[]>([]);

  // Assignment confirmation banner
  const [assignmentNotif, setAssignmentNotif] = useState<AssignmentNotification | null>(null);

  // Close modal
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRating, setCloseRating] = useState(0);
  const [closeFeedback, setCloseFeedback] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── SignalR realtime ─────────────────────────────────────────────────────
  useChatHub({
    activeConversationId: selectedId,
    callbacks: {
      onAssignmentRequested: (data) => {
        // Hiển thị banner xác nhận phân công trong UI
        setAssignmentNotif({
          conversationId: data.conversationId,
          requestedBy: data.requestedBy,
          subject: data.subject,
          action: data.action,
          assignRequestedAt: data.assignRequestedAt,
        });
      },
      onAssignmentConfirmed: (data) => {
        if (data.accepted) {
          notify.success("Đã hoàn tất chuyển cuộc trò chuyện");
        } else {
          notify.info("Nhân viên đã từ chối yêu cầu phân công");
        }
      },
    },
  });

  // ── Queries (fallback polling 30s) ────────────────────────────────────────
  const conversations = useQuery({
    queryKey: ["staff-conversations"],
    queryFn: ({ signal }) => chatApi.staffConversations({ signal }),
    refetchInterval: 30_000,
  });

  const detail = useQuery({
    queryKey: ["staff-conversation", selectedId],
    enabled: selectedId != null,
    queryFn: ({ signal }) => chatApi.detail(selectedId!, { signal }),
    refetchInterval: selectedId != null ? 30_000 : undefined,
  });

  const messages = detail.data?.messages ?? [];
  // ✅ Pinned messages từ server — không dùng localStorage
  const pinnedMessage = (detail.data?.pinnedMessages ?? [])[0] ?? null;
  const activeConversation = conversations.data?.find(
    (c) => c.conversationID === selectedId
  );

  const currentUserFullName = user?.fullName || "";
  const currentUsername = user?.username || "";
  const isAssignedToMe =
    activeConversation?.assignedStaffName &&
    (activeConversation.assignedStaffName === currentUserFullName ||
      activeConversation.assignedStaffName === currentUsername);

  // ── Scroll ────────────────────────────────────────────────────────────────
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
        .then(() => qc.invalidateQueries({ queryKey: ["staff-conversations"] }))
        .catch(() => {});
    }
  }, [selectedId, messages.length, qc]);

  // ── Search ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      setMatchingMessageIds([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const matches = messages
      .filter(
        (m) =>
          m.content &&
          m.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
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

  // Tự nhận cuộc trò chuyện (không truyền staffID)
  const assignSelf = useMutation({
    mutationFn: (id: number) => chatApi.assign(id),
    onSuccess: () => {
      notify.success("Đã tiếp nhận cuộc hội thoại");
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversation", selectedId] });
    },
    onError: (error: Error) => notify.error(error.message),
  });

  // Xác nhận yêu cầu phân công
  const respondAssign = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      chatApi.respondAssign(id, accept),
    onSuccess: (_, { accept }) => {
      setAssignmentNotif(null);
      if (accept) {
        notify.success("Đã nhận cuộc trò chuyện");
        qc.invalidateQueries({ queryKey: ["staff-conversations"] });
        qc.invalidateQueries({ queryKey: ["staff-conversation", selectedId] });
      } else {
        notify.info("Đã từ chối yêu cầu phân công");
      }
    },
    onError: (error: Error) => notify.error(error.message),
  });

  const closeConversation = useMutation({
    mutationFn: ({ id, rating, feedback }: { id: number; rating: number | null; feedback: string | null }) =>
      chatApi.close(id, { customerRating: rating, customerFeedback: feedback }),
    onSuccess: () => {
      setShowCloseModal(false);
      setCloseRating(0);
      setCloseFeedback("");
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversation", selectedId] });
      notify.success("Đã đóng cuộc hội thoại");
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
      qc.invalidateQueries({ queryKey: ["staff-conversation", selectedId] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
    },
    onError: (error: Error) => notify.error(error.message),
  });

  // ✅ Pin/Unpin — gọi server API
  const pinMutation = useMutation({
    mutationFn: ({ messageId, pin }: { messageId: number; pin: boolean }) =>
      chatApi.pinMessage(messageId, pin),
    onSuccess: (_, { pin }) => {
      notify.success(pin ? "Đã ghim tin nhắn" : "Đã bỏ ghim tin nhắn");
      qc.invalidateQueries({ queryKey: ["staff-conversation", selectedId] });
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

  const highlightText = (text: string, searchStr: string) => {
    if (!searchStr.trim()) return <>{text}</>;
    const parts = text.split(
      new RegExp(`(${searchStr.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi")
    );
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchStr.toLowerCase() ? (
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

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredList = (conversations.data ?? []).filter((item) => {
    const searchLower = search.toLowerCase();
    const displayName = getCustomerDisplayName(item);
    const matchesSearch =
      (item.subject ?? "").toLowerCase().includes(searchLower) ||
      displayName.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "All" || item.status === statusFilter;

    const isAssignedToCurrentUser =
      item.assignedStaffName &&
      (item.assignedStaffName === currentUserFullName ||
        item.assignedStaffName === currentUsername);

    const matchesAssignment =
      assignmentFilter === "All" ||
      (assignmentFilter === "Mine" && isAssignedToCurrentUser) ||
      (assignmentFilter === "Unassigned" && !item.assignedStaffName);

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  const isClosed = activeConversation?.status === "Closed";

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">

      {/* ── Assignment Confirmation Banner ──────────────────────────────── */}
      {assignmentNotif && (
        <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/20">
          <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
              Yêu cầu phân công từ{" "}
              <span className="font-bold">{assignmentNotif.requestedBy}</span>
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400 truncate">
              Hội thoại #{assignmentNotif.conversationId}
              {assignmentNotif.subject ? `: ${assignmentNotif.subject}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={respondAssign.isPending}
              onClick={() =>
                respondAssign.mutate({
                  id: assignmentNotif.conversationId,
                  accept: true,
                })
              }
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Chấp nhận
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 disabled:opacity-50"
              disabled={respondAssign.isPending}
              onClick={() =>
                respondAssign.mutate({
                  id: assignmentNotif.conversationId,
                  accept: false,
                })
              }
            >
              <X className="h-3.5 w-3.5" />
              Từ chối
            </button>
          </div>
        </div>
      )}

      {/* ── Close Modal ─────────────────────────────────────────────────── */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
              Đóng cuộc hội thoại
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Thêm ghi chú hoặc xếp hạng nếu cần trước khi đóng.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Chất lượng hỗ trợ (tuỳ chọn)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setCloseRating(star)}>
                    <Star
                      className={`h-7 w-7 transition-colors ${
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
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-3 py-2.5 text-sm focus:border-blue-500 focus:outline-none resize-none"
              rows={3}
              placeholder="Ghi chú về kết quả hỗ trợ..."
              value={closeFeedback}
              onChange={(e) => setCloseFeedback(e.target.value)}
            />
            <div className="mt-4 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                onClick={() => setShowCloseModal(false)}
              >
                Huỷ
              </button>
              <button
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                disabled={closeConversation.isPending}
                onClick={() =>
                  closeConversation.mutate({
                    id: selectedId!,
                    rating: closeRating || null,
                    feedback: closeFeedback.trim() || null,
                  })
                }
              >
                Xác nhận đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Hỗ trợ trực tuyến
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Quản lý và phản hồi yêu cầu trợ giúp từ khách hàng
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[340px_1fr]">

        {/* Left Column: Inbox */}
        <div className="flex flex-col border-r border-slate-200 dark:border-slate-800 overflow-hidden">

          {/* Search */}
          <div className="p-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Tìm khách hàng hoặc tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900/20 space-y-2">
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900">
              {(["Open", "Active", "Closed", "All"] as const).map((s) => (
                <button
                  key={s}
                  className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                    statusFilter === s
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === "Open" ? "Mở" : s === "Active" ? "Đang xử lý" : s === "Closed" ? "Đóng" : "Tất cả"}
                </button>
              ))}
            </div>
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900">
              {(["All", "Mine", "Unassigned"] as const).map((a) => (
                <button
                  key={a}
                  className={`flex-1 rounded-md py-1 text-xs font-medium transition-all ${
                    assignmentFilter === a
                      ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  }`}
                  onClick={() => setAssignmentFilter(a)}
                >
                  {a === "All" ? "Hộp thư chung" : a === "Mine" ? "Tôi phụ trách" : "Chờ tiếp nhận"}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-850">
            {conversations.isLoading && (
              <div className="flex items-center justify-center p-8 text-sm text-slate-450">
                Đang tải danh sách...
              </div>
            )}
            {!conversations.isLoading && filteredList.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Inbox className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-xs">Không tìm thấy cuộc trò chuyện nào.</p>
              </div>
            )}
            {filteredList.map((item) => {
              const isSelected = selectedId === item.conversationID;
              // ✅ Đúng field: unreadCountStaff
              const hasUnread = (item.unreadCountStaff ?? 0) > 0;
              const displayName = getCustomerDisplayName(item);
              const hasPendingAssign = !!item.pendingStaffID;

              return (
                <button
                  key={item.conversationID}
                  className={`relative block w-full px-4 py-3.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                    isSelected
                      ? "bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-600 pl-3"
                      : "pl-4"
                  }`}
                  onClick={() => setSelectedId(item.conversationID)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`truncate text-sm font-medium dark:text-slate-200 ${
                        isSelected ? "text-blue-900 font-bold" : "text-slate-700"
                      } ${hasUnread ? "font-bold text-slate-950 dark:text-slate-100" : ""}`}
                    >
                      {displayName}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {hasPendingAssign && (
                        <span className="h-2 w-2 rounded-full bg-amber-400" title="Đang chờ xác nhận phân công" />
                      )}
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {item.lastMessageAt
                          ? new Date(item.lastMessageAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>
                  </div>
                  {/* ✅ lastMessagePreview */}
                  <p className={`mt-0.5 truncate text-xs ${
                    hasUnread ? "font-semibold text-slate-900 dark:text-slate-200" : "text-slate-500"
                  }`}>
                    {item.lastMessagePreview || item.subject}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className={`rounded-full px-2 py-0.5 font-medium ${
                      item.assignedStaffName
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                    }`}>
                      {item.assignedStaffName ? `NV: ${item.assignedStaffName}` : "Chờ phân công"}
                    </span>
                    {hasUnread && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                        {item.unreadCountStaff}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="flex bg-slate-50/10 dark:bg-slate-950/10 overflow-hidden">
          {selectedId && activeConversation ? (
            <div className="flex flex-1 overflow-hidden">

              {/* Chat Window */}
              <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">

                {/* Toolbar Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/40 dark:border-slate-800 dark:bg-slate-900/40 shrink-0 gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-slate-100">
                      {getCustomerDisplayName(activeConversation)}
                    </h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="truncate max-w-[200px]">
                        Yêu cầu: {activeConversation.subject}
                      </span>
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

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsChatSearchOpen(!isChatSearchOpen)}
                      className={`p-2 rounded-lg border shadow-sm transition ${
                        isChatSearchOpen
                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/35"
                          : "border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350"
                      }`}
                    >
                      <Search className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsCustomerInfoOpen(!isCustomerInfoOpen)}
                      className={`p-2 rounded-lg border shadow-sm transition ${
                        isCustomerInfoOpen
                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/35"
                          : "border-slate-250 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <Info className="h-4 w-4" />
                    </button>
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                    {/* Assignment action buttons */}
                    {!activeConversation.assignedStaffName ? (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                        disabled={assignSelf.isPending}
                        onClick={() => assignSelf.mutate(selectedId)}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Nhận hỗ trợ
                      </button>
                    ) : !isAssignedToMe ? (
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        disabled={assignSelf.isPending}
                        onClick={() => assignSelf.mutate(selectedId)}
                      >
                        Chuyển cho tôi
                      </button>
                    ) : !isClosed ? (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40"
                        onClick={() => setShowCloseModal(true)}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Đóng hỗ trợ
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-2 text-xs text-slate-550 dark:bg-slate-800">
                        <Lock className="h-3 w-3" /> Đã kết thúc
                      </span>
                    )}
                  </div>
                </div>

                {/* Search bar */}
                {isChatSearchOpen && (
                  <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900 shrink-0 gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-450" />
                      <input
                        className="w-full rounded-lg border border-slate-250 bg-white py-1.5 pl-8 pr-4 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100"
                        placeholder="Tìm tin nhắn..."
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      {matchingMessageIds.length > 0 && (
                        <span className="text-xs text-slate-650 font-medium">
                          {currentMatchIndex + 1}/{matchingMessageIds.length} kết quả
                        </span>
                      )}
                      {matchingMessageIds.length === 0 && chatSearchQuery.trim() !== "" && (
                        <span className="text-xs text-red-500 font-medium">Không tìm thấy</span>
                      )}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white dark:border-slate-700 dark:bg-slate-850">
                        <button
                          onClick={() => setCurrentMatchIndex((prev) => (prev > 0 ? prev - 1 : matchingMessageIds.length - 1))}
                          disabled={matchingMessageIds.length === 0}
                          className="p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setCurrentMatchIndex((prev) => (prev < matchingMessageIds.length - 1 ? prev + 1 : 0))}
                          disabled={matchingMessageIds.length === 0}
                          className="p-1.5 border-l border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(""); }}
                        className="p-1.5 text-slate-450 hover:text-slate-650"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Pinned message banner — từ server */}
                {pinnedMessage && (
                  <div className="flex items-center justify-between border-b border-slate-200 bg-amber-50/80 px-6 py-2 dark:border-slate-800/60 dark:bg-amber-950/10 shrink-0 gap-4">
                    <div
                      className="flex flex-1 items-center gap-2 cursor-pointer truncate text-xs text-amber-900 dark:text-amber-400 font-semibold"
                      onClick={() => {
                        const el = document.getElementById(`message-bubble-${pinnedMessage.messageID}`);
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
                      onClick={() => pinMutation.mutate({ messageId: pinnedMessage.messageID, pin: false })}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Messages */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 space-y-4 overflow-y-auto p-6 bg-slate-50/20 dark:bg-slate-950/5 relative"
                >
                  {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-slate-400">
                      <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">Chưa có tin nhắn nào trong hội thoại này.</p>
                    </div>
                  )}

                  {messages.map((item: MessageViewModel) => {
                    const isCurrentStaff = item.senderType === "Staff";
                    const mine =
                      isCurrentStaff &&
                      !!activeConversation.assignedStaffName &&
                      (activeConversation.assignedStaffName === currentUserFullName ||
                        activeConversation.assignedStaffName === currentUsername);

                    return (
                      <div
                        key={item.messageID}
                        id={`message-bubble-${item.messageID}`}
                        className={`flex flex-col relative group ${
                          mine ? "items-end" : "items-start"
                        } transition-all duration-200 rounded-lg p-1`}
                      >
                        <div className="flex items-center gap-2 max-w-[80%]">
                          {/* Pin button on hover — chỉ Staff, khi conv chưa đóng */}
                          {!mine && !isClosed && (
                            <button
                              onClick={() =>
                                pinMutation.mutate({
                                  messageId: item.messageID,
                                  pin: !item.isPinned,
                                })
                              }
                              className={`opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded-full shrink-0 transition ${
                                item.isPinned
                                  ? "bg-amber-100 text-amber-600 opacity-100"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                              title={item.isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
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
                              onClick={() =>
                                pinMutation.mutate({
                                  messageId: item.messageID,
                                  pin: !item.isPinned,
                                })
                              }
                              className={`opacity-0 group-hover:opacity-100 flex items-center justify-center p-1.5 rounded-full shrink-0 transition ${
                                item.isPinned
                                  ? "bg-amber-100 text-amber-600 opacity-100"
                                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                              }`}
                              title={item.isPinned ? "Bỏ ghim" : "Ghim tin nhắn"}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                          )}
                        </div>

                        <span className="mt-1 text-[10px] text-slate-400 px-1 dark:text-slate-500 flex items-center gap-1">
                          {item.senderType === "Customer"
                            ? `Khách hàng (${getCustomerDisplayName(activeConversation)})`
                            : mine
                            ? "Bạn"
                            : `Nhân viên (${activeConversation.assignedStaffName || "Hệ thống"})`}
                          {" · "}
                          {item.createdDate
                            ? new Date(item.createdDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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

                {showScrollBottomBtn && (
                  <button
                    onClick={scrollToBottom}
                    className="absolute bottom-20 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700 z-10 hover:scale-110"
                  >
                    <ArrowDown className="h-5 w-5" />
                  </button>
                )}

                {/* Input */}
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
                    <div className="flex gap-2">
                      <input
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn phản hồi cho khách hàng..."
                        disabled={sendMessage.isPending}
                      />
                      <button
                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 p-2.5 text-white transition hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-500"
                        disabled={!message.trim() || sendMessage.isPending}
                        onClick={() => sendMessage.mutate()}
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Sidebar: Customer Info */}
              {isCustomerInfoOpen && (
                <div className="hidden lg:flex w-64 flex-col border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 overflow-y-auto shrink-0 animate-in slide-in-from-right-5 duration-200">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      Thông tin khách hàng
                    </h4>
                    <button onClick={() => setIsCustomerInfoOpen(false)} className="text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col items-center text-center border-b border-slate-100 pb-4 dark:border-slate-800">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-650 text-xl font-bold dark:bg-blue-900 dark:text-blue-300 mb-2">
                      {getCustomerDisplayName(activeConversation)[0]?.toUpperCase() || "?"}
                    </div>
                    <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      {activeConversation.customerName || "Chưa cập nhật tên"}
                    </h5>
                    {activeConversation.customerPhone && (
                      <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
                        📞 {activeConversation.customerPhone}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 space-y-3.5">
                    {[
                      { label: "Mã hội thoại", value: `#${activeConversation.conversationID}` },
                      { label: "Chủ đề", value: activeConversation.subject },
                      { label: "Phân loại", value: activeConversation.conversationType || "Hỗ trợ chung" },
                      { label: "Độ ưu tiên", value: activeConversation.priority || "Normal" },
                      { label: "Nhân viên tiếp nhận", value: activeConversation.assignedStaffName || "Chưa phân công" },
                      {
                        label: "Ngày gửi yêu cầu",
                        value: activeConversation.createdDate
                          ? new Date(activeConversation.createdDate).toLocaleString()
                          : "-",
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {label}
                        </span>
                        <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-450 dark:text-slate-500 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 mb-4 text-slate-350 border border-slate-200/50">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base mb-1">
                Kênh hỗ trợ khách hàng
              </h3>
              <p className="text-sm max-w-sm">
                Vui lòng chọn một cuộc trò chuyện từ danh sách hộp thư bên trái.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

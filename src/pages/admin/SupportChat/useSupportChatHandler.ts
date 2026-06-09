import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import {
  chatApi,
  type MessageViewModel,
  type ConversationViewModel,
  type StaffView,
} from "@/services/api/functions/chat/chat.api";
import { useAuthStore } from "@/stores/authStore";
import { useChatHub } from "@/hooks/useChatHub";
import { getCustomerDisplayName } from "./supportChatHelpers";

export interface AssignmentNotification {
  conversationId: number;
  requestedBy: string;
  subject?: string;
  action?: string;
  assignRequestedAt?: string;
}

export interface SupportChatHandler {
  selectedId: number | null;
  onSelectConversation: (id: number) => void;
  activeView: StaffView;
  onViewChange: (v: StaffView) => void;
  search: string;
  onSearchChange: (v: string) => void;
  showOnlyMine: boolean;
  onToggleMine: () => void;
  filteredList: ConversationViewModel[];
  conversationsLoading: boolean;
  pendingBadge: number;

  activeConversation: ConversationViewModel | null;
  isAssignedToMe: boolean;
  isClosed: boolean;

  messages: MessageViewModel[];
  pinnedMessage: MessageViewModel | null;
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
  onMatchIndexChange: (v: number | ((p: number) => number)) => void;
  matchingMessageIds: number[];

  isCustomerInfoOpen: boolean;
  onToggleCustomerInfo: () => void;

  assignmentNotif: AssignmentNotification | null;
  onRespondAssign: (accept: boolean) => void;
  respondAssignPending: boolean;
  onAssignSelf: () => void;
  assignSelfPending: boolean;

  showCloseModal: boolean;
  onOpenCloseModal: () => void;
  onCloseModal: () => void;
  closeRating: number;
  onRatingChange: (v: number) => void;
  closeFeedback: string;
  onFeedbackChange: (v: string) => void;
  onConfirmClose: () => void;
  closeConversationPending: boolean;

  message: string;
  onMessageChange: (v: string) => void;
  onSendMessage: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  sendMessagePending: boolean;

  onPin: (messageId: number, pin: boolean) => void;
}

export function useSupportChatHandler(): SupportChatHandler {
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<StaffView>("all");
  const [search, setSearch] = useState("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [message, setMessage] = useState("");
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const [isCustomerInfoOpen, setIsCustomerInfoOpen] = useState(true);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchingMessageIds, setMatchingMessageIds] = useState<number[]>([]);
  const [assignmentNotif, setAssignmentNotif] = useState<AssignmentNotification | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRating, setCloseRating] = useState(0);
  const [closeFeedback, setCloseFeedback] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useChatHub({
    activeConversationId: selectedId,
    joinStaffInbox: true,
    callbacks: {
      onAssignmentRequested: (data) => setAssignmentNotif({
        conversationId: data.conversationId,
        requestedBy: data.requestedBy,
        subject: data.subject,
        action: data.action,
        assignRequestedAt: data.assignRequestedAt,
      }),
      onAssignmentConfirmed: (data) => {
        if (data.accepted) notify.success("Đã hoàn tất chuyển cuộc trò chuyện");
        else notify.info("Nhân viên đã từ chối yêu cầu phân công");
      },
    },
  });

  const conversations = useQuery({
    queryKey: ["staff-conversations", activeView],
    queryFn: ({ signal }) => chatApi.staffConversations(activeView, { pageSize: 50 }, { signal }),
    refetchInterval: 30_000,
  });

  const pendingCount = useQuery({
    queryKey: ["staff-pending-count"],
    queryFn: () => chatApi.staffConversations("pending", { pageSize: 1 }),
    select: (d) => d.totalCount,
    refetchInterval: 30_000,
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", selectedId],
    enabled: selectedId != null,
    queryFn: ({ signal }) => chatApi.messages(selectedId!, { pageSize: 50 }, { signal }),
    refetchInterval: selectedId != null ? 30_000 : undefined,
  });

  const conversationList = conversations.data?.data ?? [];
  const messages = messagesQuery.data?.messages ?? [];
  const pinnedMessage = (messagesQuery.data?.pinnedMessages ?? [])[0] ?? null;
  const activeConversation = conversationList.find((c) => c.conversationID === selectedId) ?? null;

  const currentUserFullName = user?.fullName || "";
  const currentUsername = user?.username || "";
  const isAssignedToMe = !!(
    activeConversation?.assignedStaffName &&
    (activeConversation.assignedStaffName === currentUserFullName ||
      activeConversation.assignedStaffName === currentUsername)
  );

  const filteredList = conversationList.filter((item) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matched =
        (item.subject ?? "").toLowerCase().includes(q) ||
        getCustomerDisplayName(item).toLowerCase().includes(q);
      if (!matched) return false;
    }
    if (showOnlyMine) {
      return !!(
        item.assignedStaffName &&
        (item.assignedStaffName === currentUserFullName ||
          item.assignedStaffName === currentUsername)
      );
    }
    return true;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollBottomBtn(false);
  };

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  const onScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBottomBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 200);
  };

  useEffect(() => {
    if (selectedId) {
      chatApi
        .markRead(selectedId)
        .then(() => qc.invalidateQueries({ queryKey: ["staff-conversations"] }))
        .catch(() => {});
    }
  }, [selectedId, messages.length, qc]);

  useEffect(() => {
    if (!chatSearchQuery.trim()) {
      setMatchingMessageIds([]);
      setCurrentMatchIndex(-1);
      return;
    }
    const matched = messages
      .filter((m) => m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      .map((m) => m.messageID);
    setMatchingMessageIds(matched);
    setCurrentMatchIndex(matched.length > 0 ? 0 : -1);
  }, [chatSearchQuery, messages]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && matchingMessageIds[currentMatchIndex]) {
      const el = document.getElementById(`msg-${matchingMessageIds[currentMatchIndex]}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-amber-400");
        const t = setTimeout(() => el.classList.remove("ring-4", "ring-amber-400"), 2000);
        return () => clearTimeout(t);
      }
    }
  }, [currentMatchIndex, matchingMessageIds]);

  const assignSelf = useMutation({
    mutationFn: (id: number) => chatApi.assign(id),
    onSuccess: () => {
      notify.success("Đã tiếp nhận cuộc hội thoại");
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
    },
  });

  const respondAssign = useMutation({
    mutationFn: ({ id, accept }: { id: number; accept: boolean }) =>
      chatApi.respondAssign(id, accept),
    onSuccess: (_, { accept }) => {
      setAssignmentNotif(null);
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-pending-count"] });
      if (accept) {
        notify.success("Đã nhận cuộc trò chuyện");
        qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      } else {
        notify.info("Đã từ chối yêu cầu phân công");
      }
    },
  });

  const closeConversation = useMutation({
    mutationFn: ({ id, rating, feedback }: { id: number; rating: number | null; feedback: string | null }) =>
      chatApi.close(id, { customerRating: rating, customerFeedback: feedback }),
    onSuccess: () => {
      setShowCloseModal(false);
      setCloseRating(0);
      setCloseFeedback("");
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      notify.success("Đã đóng cuộc hội thoại");
    },
  });

  const sendMessage = useMutation({
    mutationFn: () =>
      chatApi.sendMessage({ conversationID: selectedId!, messageType: "Text", content: message.trim() }),
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ messageId, pin }: { messageId: number; pin: boolean }) =>
      chatApi.pinMessage(messageId, pin),
    onSuccess: (_, { pin }) => {
      notify.success(pin ? "Đã ghim tin nhắn" : "Đã bỏ ghim tin nhắn");
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
    },
  });

  return {
    selectedId,
    onSelectConversation: setSelectedId,
    activeView,
    onViewChange: setActiveView,
    search,
    onSearchChange: setSearch,
    showOnlyMine,
    onToggleMine: () => setShowOnlyMine((v) => !v),
    filteredList,
    conversationsLoading: conversations.isLoading,
    pendingBadge: pendingCount.data ?? 0,

    activeConversation,
    isAssignedToMe,
    isClosed: activeConversation?.status === "Closed",

    messages,
    pinnedMessage,
    messagesEndRef,
    scrollContainerRef,
    showScrollBottomBtn,
    onScroll,
    scrollToBottom,

    isChatSearchOpen,
    onToggleChatSearch: () => setIsChatSearchOpen((v) => !v),
    chatSearchQuery,
    onChatSearchChange: setChatSearchQuery,
    currentMatchIndex,
    onMatchIndexChange: setCurrentMatchIndex,
    matchingMessageIds,

    isCustomerInfoOpen,
    onToggleCustomerInfo: () => setIsCustomerInfoOpen((v) => !v),

    assignmentNotif,
    onRespondAssign: (accept) => {
      if (assignmentNotif) respondAssign.mutate({ id: assignmentNotif.conversationId, accept });
    },
    respondAssignPending: respondAssign.isPending,
    onAssignSelf: () => { if (selectedId) assignSelf.mutate(selectedId); },
    assignSelfPending: assignSelf.isPending,

    showCloseModal,
    onOpenCloseModal: () => setShowCloseModal(true),
    onCloseModal: () => setShowCloseModal(false),
    closeRating,
    onRatingChange: setCloseRating,
    closeFeedback,
    onFeedbackChange: setCloseFeedback,
    onConfirmClose: () => {
      if (selectedId) closeConversation.mutate({
        id: selectedId,
        rating: closeRating || null,
        feedback: closeFeedback.trim() || null,
      });
    },
    closeConversationPending: closeConversation.isPending,

    message,
    onMessageChange: setMessage,
    onSendMessage: () => sendMessage.mutate(),
    onKeyDown: (e) => {
      if (e.key === "Enter" && !e.shiftKey && message.trim() && !sendMessage.isPending) {
        e.preventDefault();
        sendMessage.mutate();
      }
    },
    sendMessagePending: sendMessage.isPending,

    onPin: (messageId, pin) => pinMutation.mutate({ messageId, pin }),
  };
}

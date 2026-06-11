import { useEffect, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import {
  chatApi,
  type CloseConversationRequest,
} from "@/services/api/functions/chat/chat.api";
import { useChatHub } from "@/hooks/useChatHub";
import { CloseConversationModal } from "./CloseConversationModal";
import { ConversationListPanel } from "./ConversationListPanel";
import { ChatWindow } from "./ChatWindow";

export default function CustomerChatPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [message, setMessage] = useState("");

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeRating, setCloseRating] = useState<number>(0);
  const [closeFeedback, setCloseFeedback] = useState("");

  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matchingMessageIds, setMatchingMessageIds] = useState<number[]>([]);

  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ── SignalR ───────────────────────────────────────────────────────────────
  useChatHub({ activeConversationId: selectedId });

  // ── Queries ───────────────────────────────────────────────────────────────

  const conversations = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: ({ signal }) =>
      chatApi.conversations({ pageSize: 50 }, { signal }),
    refetchInterval: 30_000,
  });

  const messagesQuery = useQuery({
    queryKey: ["chat-messages", selectedId],
    enabled: selectedId != null,
    queryFn: ({ signal }) =>
      chatApi.messages(selectedId!, { pageSize: 50 }, { signal }),
    refetchInterval: selectedId != null ? 30_000 : undefined,
  });

  const conversationList = conversations.data?.data ?? [];
  const messages = messagesQuery.data?.messages ?? [];
  const pinnedMessage = (messagesQuery.data?.pinnedMessages ?? [])[0] ?? null;
  const selectedConversation = conversationList.find(
    (c) => c.conversationID === selectedId,
  );

  // ── Auto-select first conversation ────────────────────────────────────────
  useEffect(() => {
    if (!selectedId && conversationList[0]) {
      setSelectedId(conversationList[0].conversationID);
    }
  }, [conversationList, selectedId]);

  // ── Scroll to bottom on new messages ─────────────────────────────────────
  const scrollToBottom = () => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
    setShowScrollBottomBtn(false);
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setShowScrollBottomBtn(el.scrollTop > 200);
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
      .filter((m) =>
        m.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()),
      )
      .map((m) => m.messageID);
    setMatchingMessageIds(matches);
    setCurrentMatchIndex(matches.length > 0 ? 0 : -1);
  }, [chatSearchQuery, messages]);

  useEffect(() => {
    if (currentMatchIndex >= 0 && matchingMessageIds[currentMatchIndex]) {
      const el = document.getElementById(
        `msg-${matchingMessageIds[currentMatchIndex]}`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-4", "ring-amber-400");
        const t = setTimeout(
          () => el.classList.remove("ring-4", "ring-amber-400"),
          2000,
        );
        return () => clearTimeout(t);
      }
    }
  }, [currentMatchIndex, matchingMessageIds]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createConversation = useMutation({
    mutationFn: () =>
      chatApi.createConversation({
        conversationType: "General",
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
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
  });

  const closeConversation = useMutation({
    mutationFn: (body: CloseConversationRequest) =>
      chatApi.close(selectedId!, body),
    onSuccess: () => {
      setShowCloseModal(false);
      setCloseRating(0);
      setCloseFeedback("");
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["chat-messages", selectedId] });
      notify.success("Đã đóng cuộc trò chuyện");
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey &&
      message.trim() &&
      !sendMessage.isPending
    ) {
      e.preventDefault();
      sendMessage.mutate();
    }
  };

  const isClosed = messagesQuery.data?.status === "Closed";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 gap-4 p-4 min-h-100vh">
      {showCloseModal && (
        <CloseConversationModal
          rating={closeRating}
          feedback={closeFeedback}
          isPending={closeConversation.isPending}
          onRatingChange={setCloseRating}
          onFeedbackChange={setCloseFeedback}
          onCancel={() => setShowCloseModal(false)}
          onConfirm={() =>
            closeConversation.mutate({
              customerRating: closeRating || null,
              customerFeedback: closeFeedback.trim() || null,
            })
          }
        />
      )}

      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhắn tin hỗ trợ</h1>
          <p className="text-sm text-slate-500">
            Trao đổi trực tiếp với nhân viên chăm sóc khách hàng của SoldCars
          </p>
        </div>
      </div>

      <div className="flex flex-col h-[900px]  md:grid flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[340px_1fr]">
        <ConversationListPanel
          conversations={conversationList}
          isLoading={conversations.isLoading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          subject={subject}
          initialMessage={initialMessage}
          onSubjectChange={setSubject}
          onInitialMessageChange={setInitialMessage}
          onCreate={() => createConversation.mutate()}
          isCreating={createConversation.isPending}
        />

        <div className="flex overflow-hidden flex-1 min-h-0 relative">
          <ChatWindow
            selectedId={selectedId}
            subject={messagesQuery.data?.subject}
            assignedStaffName={selectedConversation?.assignedStaffName}
            isClosed={isClosed}
            messages={messages}
            pinnedMessage={pinnedMessage}
            isChatSearchOpen={isChatSearchOpen}
            chatSearchQuery={chatSearchQuery}
            matchingMessageIds={matchingMessageIds}
            currentMatchIndex={currentMatchIndex}
            onToggleSearch={() => setIsChatSearchOpen((p) => !p)}
            onSearchQueryChange={setChatSearchQuery}
            onMatchIndexChange={setCurrentMatchIndex}
            onCloseSearch={() => {
              setIsChatSearchOpen(false);
              setChatSearchQuery("");
            }}
            showScrollBottomBtn={showScrollBottomBtn}
            onScrollToBottom={scrollToBottom}
            onScroll={handleScroll}
            scrollContainerRef={scrollContainerRef}
            message={message}
            onMessageChange={setMessage}
            onMessageKeyDown={handleKeyDown}
            onSendMessage={() => sendMessage.mutate()}
            isSending={sendMessage.isPending}
            onRequestClose={() => setShowCloseModal(true)}
          />
        </div>
      </div>
    </div>
  );
}

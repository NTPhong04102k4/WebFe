import { useEffect, useRef, useCallback } from "react";
import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HubConnectionState,
} from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { notify } from "@/components/core/Feedback/toast";

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL ?? "https://web-7012.onrender.com"}/hubs/chat`;

export interface ChatHubCallbacks {
  /** Nhận được tin nhắn mới trong conversation đang mở */
  onNewMessage?: (data: {
    messageID: number;
    conversationID: number;
    senderType: string;
    content?: string | null;
    createdDate: string;
  }) => void;

  /** Conversation được cập nhật (assign, close, v.v.) */
  onConversationUpdated?: (data: {
    conversationId: number;
    action: string;
    status?: string;
    assignedStaffID?: number;
    lastMessagePreview?: string;
    unreadCountStaff?: number;
  }) => void;

  /** Có cuộc hội thoại mới từ khách (staff-inbox) */
  onNewConversation?: (data: {
    conversationId: number;
    subject?: string;
    conversationType?: string;
    priority?: string;
  }) => void;

  /** Admin / nhân viên khác yêu cầu phân công cho mình */
  onAssignmentRequested?: (data: {
    conversationId: number;
    requestedBy: string;
    subject?: string;
    targetStaffId?: number;
    action?: string;
    assignRequestedAt?: string;
  }) => void;

  /** Phản hồi sau khi xác nhận / từ chối yêu cầu phân công */
  onAssignmentConfirmed?: (data: {
    conversationId: number;
    accepted: boolean;
    newStaffId?: number;
    action?: string;
  }) => void;

  /** Tin nhắn bị ghim / bỏ ghim */
  onMessagePinned?: (data: {
    messageID: number;
    conversationID: number;
    isPinned: boolean;
  }) => void;
}

interface UseChatHubOptions {
  /** ID conversation đang được mở để join room */
  activeConversationId?: number | null;
  callbacks?: ChatHubCallbacks;
}

/**
 * Hook quản lý kết nối SignalR cho chat.
 * Tự động:
 *   - Kết nối khi user đã login
 *   - Join room "conv_{id}" khi activeConversationId thay đổi
 *   - Reconnect tự động khi mất kết nối
 *   - Invalidate React Query cache khi nhận push
 */
export function useChatHub({
  activeConversationId,
  callbacks = {},
}: UseChatHubOptions = {}) {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const connectionRef = useRef<HubConnection | null>(null);
  const prevConvIdRef = useRef<number | null>(null);

  const {
    onNewMessage,
    onConversationUpdated,
    onNewConversation,
    onAssignmentRequested,
    onAssignmentConfirmed,
    onMessagePinned,
  } = callbacks;

  // ── Start/Stop connection ────────────────────────────────────────────────

  useEffect(() => {
    if (!accessToken) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    // ── Event handlers ──────────────────────────────────────────────────

    connection.on("NewMessage", (data) => {
      // Invalidate messages và conversation list
      qc.invalidateQueries({ queryKey: ["chat-conversation", data.conversationID] });
      qc.invalidateQueries({ queryKey: ["staff-conversation", data.conversationID] });
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      onNewMessage?.(data);
    });

    connection.on("ConversationUpdated", (data) => {
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      if (data.conversationId) {
        qc.invalidateQueries({ queryKey: ["chat-conversation", data.conversationId] });
        qc.invalidateQueries({ queryKey: ["staff-conversation", data.conversationId] });
      }
      onConversationUpdated?.(data);
    });

    connection.on("NewConversation", (data) => {
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      onNewConversation?.(data);
    });

    connection.on("AssignmentRequested", (data) => {
      // Hiển thị toast thông báo có yêu cầu phân công
      notify.info(
        `📋 Yêu cầu tiếp nhận hội thoại: "${data.subject || "Hội thoại mới"}" từ ${data.requestedBy}`
      );
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      onAssignmentRequested?.(data);
    });

    connection.on("AssignmentConfirmed", (data) => {
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      if (data.conversationId) {
        qc.invalidateQueries({ queryKey: ["staff-conversation", data.conversationId] });
      }
      onAssignmentConfirmed?.(data);
    });

    connection.on("MessagePinned", (data) => {
      qc.invalidateQueries({ queryKey: ["chat-conversation", data.conversationID] });
      qc.invalidateQueries({ queryKey: ["staff-conversation", data.conversationID] });
      onMessagePinned?.(data);
    });

    // ── Start ───────────────────────────────────────────────────────────

    connection
      .start()
      .then(() => {
        connectionRef.current = connection;
      })
      .catch((err) => {
        console.warn("[ChatHub] Failed to start:", err);
      });

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Join / Leave conversation room ───────────────────────────────────────

  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== HubConnectionState.Connected) return;

    // Leave previous room
    if (prevConvIdRef.current !== null && prevConvIdRef.current !== activeConversationId) {
      conn.invoke("LeaveConversation", prevConvIdRef.current).catch(() => {});
    }

    // Join new room
    if (activeConversationId != null) {
      conn.invoke("JoinConversation", activeConversationId).catch(() => {});
    }

    prevConvIdRef.current = activeConversationId ?? null;
  }, [activeConversationId]);

  // ── Helpers exposed to component ─────────────────────────────────────────

  const joinConversation = useCallback((id: number) => {
    const conn = connectionRef.current;
    if (conn?.state === HubConnectionState.Connected) {
      conn.invoke("JoinConversation", id).catch(() => {});
    }
  }, []);

  const leaveConversation = useCallback((id: number) => {
    const conn = connectionRef.current;
    if (conn?.state === HubConnectionState.Connected) {
      conn.invoke("LeaveConversation", id).catch(() => {});
    }
  }, []);

  const isConnected = connectionRef.current?.state === HubConnectionState.Connected;

  return { isConnected, joinConversation, leaveConversation };
}

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

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL ?? "https://web-7012.onrender.com"}/chathub`;

export interface ChatHubCallbacks {
  onNewMessage?: (data: {
    conversationId: number;
    messageID: number;
    senderType: string;
    content?: string;
    messageType: string;
    createdDate: string;
  }) => void;

  onConversationUpdated?: (data: {
    conversationId: number;
    action: string;
    status?: string;
    assignedStaffID?: number;
  }) => void;

  onAssignmentRequested?: (data: {
    conversationId: number;
    requestedBy: string;
    subject?: string;
    action?: string;
    assignRequestedAt?: string;
  }) => void;

  onAssignmentConfirmed?: (data: {
    conversationId: number;
    accepted: boolean;
    newStaffId?: number;
    action?: string;
  }) => void;

  onMessagePinned?: (data: {
    messageId: number;
    conversationId: number;
    isPinned: boolean;
  }) => void;
}

interface UseChatHubOptions {
  activeConversationId?: number | null;
  /** Staff pages: join staff inbox group để nhận ConversationUpdated + AssignmentRequested */
  joinStaffInbox?: boolean;
  callbacks?: ChatHubCallbacks;
}

export function useChatHub({
  activeConversationId,
  joinStaffInbox = false,
  callbacks = {},
}: UseChatHubOptions = {}) {
  const qc = useQueryClient();
  const { accessToken } = useAuthStore();
  const connectionRef = useRef<HubConnection | null>(null);
  const prevConvIdRef = useRef<number | null>(null);
  // Ref luôn giữ giá trị mới nhất — tránh closure stale trong .start().then()
  const activeConvIdRef = useRef<number | null>(activeConversationId ?? null);

  const {
    onNewMessage,
    onConversationUpdated,
    onAssignmentRequested,
    onAssignmentConfirmed,
    onMessagePinned,
  } = callbacks;

  // Giữ ref đồng bộ với prop mới nhất (chạy trước effect kết nối)
  useEffect(() => {
    activeConvIdRef.current = activeConversationId ?? null;
  }, [activeConversationId]);

  // ── Kết nối / ngắt kết nối ──────────────────────────────────────────────

  useEffect(() => {
    if (!accessToken) return;

    const connection = new HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connection.on("NewMessage", (data) => {
      const convId = data.conversationId ?? data.conversationID;
      qc.invalidateQueries({ queryKey: ["chat-messages", convId] });
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      onNewMessage?.(data);
    });

    connection.on("ConversationUpdated", (data) => {
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-pending-count"] });
      if (data.conversationId) {
        qc.invalidateQueries({ queryKey: ["chat-messages", data.conversationId] });
      }
      onConversationUpdated?.(data);
    });

    connection.on("AssignmentRequested", (data) => {
      notify.info(
        `Yêu cầu tiếp nhận: "${data.subject || "Hội thoại mới"}" từ ${data.requestedBy}`
      );
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      qc.invalidateQueries({ queryKey: ["staff-pending-count"] });
      onAssignmentRequested?.(data);
    });

    connection.on("AssignmentConfirmed", (data) => {
      qc.invalidateQueries({ queryKey: ["staff-conversations"] });
      if (data.conversationId) {
        qc.invalidateQueries({ queryKey: ["chat-messages", data.conversationId] });
      }
      onAssignmentConfirmed?.(data);
    });

    connection.on("MessagePinned", (data) => {
      const convId = data.conversationId ?? data.conversationID;
      qc.invalidateQueries({ queryKey: ["chat-messages", convId] });
      onMessagePinned?.(data);
    });

    connection
      .start()
      .then(() => {
        connectionRef.current = connection;
        if (joinStaffInbox) {
          connection.invoke("JoinStaffInbox").catch(() => {});
        }
        // Đọc từ ref — lấy giá trị mới nhất, tránh stale closure
        const convId = activeConvIdRef.current;
        if (convId != null) {
          connection.invoke("JoinConversation", convId).catch(() => {});
          prevConvIdRef.current = convId;
        }
      })
      .catch((err) => console.warn("[ChatHub] start failed:", err));

    // Rejoin groups sau reconnect — cũng dùng ref để lấy conversation hiện tại
    connection.onreconnected(() => {
      if (joinStaffInbox) {
        connection.invoke("JoinStaffInbox").catch(() => {});
      }
      const convId = activeConvIdRef.current;
      if (convId != null) {
        connection.invoke("JoinConversation", convId).catch(() => {});
        prevConvIdRef.current = convId;
      }
    });

    return () => {
      connection.stop();
      connectionRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // ── Join / Leave conversation room khi tab thay đổi ──────────────────────

  useEffect(() => {
    const conn = connectionRef.current;
    if (!conn || conn.state !== HubConnectionState.Connected) return;

    if (prevConvIdRef.current !== null && prevConvIdRef.current !== activeConversationId) {
      conn.invoke("LeaveConversation", prevConvIdRef.current).catch(() => {});
    }
    if (activeConversationId != null) {
      conn.invoke("JoinConversation", activeConversationId).catch(() => {});
    }
    prevConvIdRef.current = activeConversationId ?? null;
  }, [activeConversationId]);

  // ── Helpers ───────────────────────────────────────────────────────────────

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

  return {
    isConnected: connectionRef.current?.state === HubConnectionState.Connected,
    joinConversation,
    leaveConversation,
  };
}

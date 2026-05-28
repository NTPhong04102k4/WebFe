import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

// ── Types đồng bộ chính xác với Backend ─────────────────────────────────────

export interface ConversationViewModel {
  conversationID: number;
  conversationUUID?: string;
  conversationType: string;
  subject?: string | null;
  relatedCarID?: number | null;
  relatedServiceID?: number | null;
  relatedWorkOrderID?: number | null;
  customerUserID?: string;
  customerName?: string | null;
  customerPhone?: string | null;
  assignedStaffID?: number | null;
  assignedStaffName?: string | null;
  /** Field pending assignment — dùng cho luồng xác nhận phân công */
  pendingStaffID?: number | null;
  assignRequestedBy?: number | null;
  assignRequestedAt?: string | null;
  status: string; // Open | Active | Closed
  priority: string; // Low | Normal | High
  /** Unread cho customer (dùng ở Customer Chat page) */
  unreadCountCustomer: number;
  /** Unread cho staff (dùng ở Admin SupportChat page) */
  unreadCountStaff: number;
  lastMessageAt?: string | null;
  /** Preview 200 ký tự tin nhắn cuối */
  lastMessagePreview?: string | null;
  closedDate?: string | null;
  customerRating?: number | null;
  customerFeedback?: string | null;
  createdDate?: string;
  updatedDate?: string;
}

export interface MessageViewModel {
  messageID: number;
  conversationID: number;
  senderType: "Customer" | "Staff" | "AIBot" | string;
  senderUserID?: string | null;
  senderStaffID?: number | null;
  senderName?: string | null;
  messageType: string;
  content?: string | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentSize?: number | null;
  attachmentMimeType?: string | null;
  replyToMessageID?: number | null;
  isRead: boolean;
  readAt?: string | null;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  pinnedAt?: string | null;
  pinnedByStaffID?: number | null;
  createdDate: string;
}

export interface ConversationDetailViewModel extends ConversationViewModel {
  totalMessages: number;
  messages: MessageViewModel[];
  /** Danh sách tin nhắn đã ghim từ DB */
  pinnedMessages: MessageViewModel[];
}

export interface CreateConversationRequest {
  conversationType: "CarInquiry" | "ServiceInquiry" | "Support" | "General";
  subject: string;
  relatedCarID?: number | null;
  priority: "Low" | "Normal" | "High";
  initialMessage: string;
}

export interface SendMessageRequest {
  conversationID: number;
  messageType: "Text" | "Image" | "File" | "Voice" | "Video";
  content?: string | null;
  attachmentUrl?: string | null;
  replyToMessageID?: number | null;
}

export interface CloseConversationRequest {
  customerRating?: number | null; // 1–5
  customerFeedback?: string | null;
}

// ── API calls ────────────────────────────────────────────────────────────────

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if ("data" in obj) return obj.data as T;
  }
  return payload as T;
};

const unwrapList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }
  return [];
};

export const chatApi = {
  // ── Conversations ─────────────────────────────────────────────────────────

  conversations: async (options?: ApiRequestOptions): Promise<ConversationViewModel[]> => {
    const res = await apiClient.get(API.chat.conversations, withSignal({}, options));
    return unwrapList<ConversationViewModel>(res.data);
  },

  staffConversations: async (options?: ApiRequestOptions): Promise<ConversationViewModel[]> => {
    const res = await apiClient.get(API.chat.staffConversations, withSignal({}, options));
    return unwrapList<ConversationViewModel>(res.data);
  },

  detail: async (id: number, options?: ApiRequestOptions): Promise<ConversationDetailViewModel> => {
    const res = await apiClient.get<unknown>(API.chat.messages(id), withSignal({}, options));
    return unwrap<ConversationDetailViewModel>(res.data);
  },

  messages: async (
    id: number,
    params: { page?: number; pageSize?: number; q?: string },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<unknown>(API.chat.messages(id), withSignal({ params }, options));
    return unwrap<ConversationDetailViewModel>(res.data);
  },

  createConversation: async (body: CreateConversationRequest) => {
    const res = await apiClient.post<unknown>(API.chat.conversations, body);
    return unwrap<{ conversationID: number; conversationUUID: string }>(res.data);
  },

  sendMessage: async (body: SendMessageRequest) => {
    const res = await apiClient.post<unknown>(API.chat.createMessage, body);
    return unwrap<{ messageID: number }>(res.data);
  },

  markRead: async (id: number) => {
    const res = await apiClient.put<unknown>(API.chat.read(id), {});
    return unwrap(res.data);
  },

  // ── Assignment flows ──────────────────────────────────────────────────────

  /**
   * Phân công / chuyển nhân viên:
   * - Không truyền staffID → tự nhận (Staff tự assign chính mình)
   * - Truyền staffID → Admin gán cho staff khác (cần staff xác nhận)
   * - Staff đang giữ muốn chuyển → truyền staffID khác (cần xác nhận)
   */
  assign: async (id: number, staffID?: number) => {
    const body = staffID ? { staffID } : {};
    const res = await apiClient.put<unknown>(API.chat.assign(id), body);
    return unwrap(res.data);
  },

  /**
   * Xác nhận hoặc từ chối yêu cầu phân công.
   * accept = true → nhận; false → từ chối
   */
  respondAssign: async (id: number, accept: boolean) => {
    const res = await apiClient.put<unknown>(API.chat.respondAssign(id), { accept });
    return unwrap(res.data);
  },

  // ── Close & Rating ────────────────────────────────────────────────────────

  close: async (id: number, body: CloseConversationRequest = {}) => {
    const res = await apiClient.put<unknown>(API.chat.close(id), body);
    return unwrap(res.data);
  },

  // ── Pin Message (Server-side — đồng bộ giữa tất cả thiết bị) ─────────────

  /**
   * Ghim hoặc bỏ ghim tin nhắn. Chỉ Staff mới có quyền.
   * pin = true → ghim; false → bỏ ghim
   */
  pinMessage: async (messageId: number, pin: boolean) => {
    const res = await apiClient.put<unknown>(
      `${API.chat.pinMessage(messageId)}?pin=${pin}`,
      {}
    );
    return unwrap(res.data);
  },
};

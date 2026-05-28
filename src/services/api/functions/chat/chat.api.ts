import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

// ── Enums ────────────────────────────────────────────────────────────────────

export type ConversationStatus = "Open" | "Active" | "Closed";
export type ConversationType   = "CarInquiry" | "ServiceInquiry" | "General";
export type Priority           = "Low" | "Normal" | "High";
export type MessageType        = "Text" | "Image" | "File";
export type SenderType         = "Customer" | "Staff";

/** Tham số view cho staff inbox tabs */
export type StaffView = "all" | "open" | "active" | "closed" | "unassigned" | "pending" | "mine";

// ── Response types ────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
}

export interface ConversationViewModel {
  conversationID: number;
  conversationUUID: string;
  conversationType: ConversationType;
  subject?: string;
  relatedCarID?: number;
  relatedServiceID?: number;
  relatedWorkOrderID?: number;
  customerUserID: string;
  customerName?: string;
  customerPhone?: string;
  assignedStaffID?: number;
  assignedStaffName?: string;
  pendingStaffID?: number;
  assignRequestedBy?: number;
  assignRequestedAt?: string;
  status: ConversationStatus;
  priority: Priority;
  unreadCountCustomer: number;
  unreadCountStaff: number;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  closedDate?: string;
  customerRating?: number;
  customerFeedback?: string;
  createdDate: string;
}

export interface MessageViewModel {
  messageID: number;
  conversationID: number;
  senderType: SenderType;
  senderUserID?: string;
  senderStaffID?: number;
  senderName?: string;
  messageType: MessageType;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  replyToMessageID?: number;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  isDeleted: boolean;
  isPinned: boolean;
  pinnedAt?: string;
  pinnedByStaffID?: number;
  createdDate: string;
}

export interface ConversationDetailViewModel extends ConversationViewModel {
  totalMessages: number;
  messages: MessageViewModel[];
  pinnedMessages: MessageViewModel[];
}

// ── Request types ─────────────────────────────────────────────────────────────

export interface CreateConversationRequest {
  conversationType: ConversationType;
  subject?: string;
  relatedCarID?: number;
  priority?: Priority;
  initialMessage: string;
}

export interface SendMessageRequest {
  conversationID: number;
  messageType: MessageType;
  content?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  attachmentMimeType?: string;
  replyToMessageID?: number;
}

export interface CloseConversationRequest {
  customerRating?: number | null;
  customerFeedback?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if ("data" in obj) return obj.data as T;
  }
  return payload as T;
};

/**
 * Xử lý mọi dạng response:
 *   A) trực tiếp array
 *   B) { data: T[], totalCount: n }          ← raw PagedResult
 *   C) { data: T[] }                         ← OperationResult<T[]> (API cũ)
 *   D) { data: { data: T[], totalCount: n } } ← OperationResult<PagedResult>
 */
const unwrapPaged = <T>(payload: unknown): PagedResult<T> => {
  if (Array.isArray(payload)) return { data: payload as T[], totalCount: payload.length };
  if (!payload || typeof payload !== "object") return { data: [], totalCount: 0 };
  const obj = payload as Record<string, unknown>;

  // B / C: obj.data là array
  if (Array.isArray(obj.data)) {
    return { data: obj.data as T[], totalCount: (obj.totalCount as number) ?? 0 };
  }

  // D: obj.data là object chứa array
  if (obj.data && typeof obj.data === "object") {
    const inner = obj.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) {
      return { data: inner.data as T[], totalCount: (inner.totalCount as number) ?? 0 };
    }
  }

  return { data: [], totalCount: 0 };
};

// ── API ───────────────────────────────────────────────────────────────────────

export const chatApi = {
  // ── Customer ──────────────────────────────────────────────────────────────

  /** GET /chat/conversations?page&pageSize → PagedResult<ConversationViewModel> */
  conversations: async (
    params: { page?: number; pageSize?: number } = { page: 1, pageSize: 50 },
    options?: ApiRequestOptions
  ): Promise<PagedResult<ConversationViewModel>> => {
    const res = await apiClient.get(API.chat.conversations, withSignal({ params }, options));
    return unwrapPaged<ConversationViewModel>(res.data);
  },

  // ── Staff ─────────────────────────────────────────────────────────────────

  /** GET /chat/conversations/staff?view=&page&pageSize → PagedResult<ConversationViewModel> */
  staffConversations: async (
    view: StaffView = "all",
    params: { page?: number; pageSize?: number } = { page: 1, pageSize: 50 },
    options?: ApiRequestOptions
  ): Promise<PagedResult<ConversationViewModel>> => {
    const res = await apiClient.get(API.chat.staffConversations, withSignal({ params: { view, ...params } }, options));
    return unwrapPaged<ConversationViewModel>(res.data);
  },

  // ── Detail ────────────────────────────────────────────────────────────────

  /** GET /chat/conversations/:id → ConversationViewModel */
  detail: async (id: number, options?: ApiRequestOptions): Promise<ConversationViewModel> => {
    const res = await apiClient.get<unknown>(API.chat.conversation(id), withSignal({}, options));
    return unwrap<ConversationViewModel>(res.data);
  },

  /** GET /chat/conversations/:id/messages?page&pageSize&q → ConversationDetailViewModel */
  messages: async (
    id: number,
    params: { page?: number; pageSize?: number; q?: string } = { page: 1, pageSize: 50 },
    options?: ApiRequestOptions
  ): Promise<ConversationDetailViewModel> => {
    const res = await apiClient.get<unknown>(API.chat.messages(id), withSignal({ params }, options));
    return unwrap<ConversationDetailViewModel>(res.data);
  },

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** POST /chat/conversations → { conversationID, conversationUUID } */
  createConversation: async (body: CreateConversationRequest) => {
    const res = await apiClient.post<unknown>(API.chat.conversations, body);
    return unwrap<{ conversationID: number; conversationUUID: string }>(res.data);
  },

  /** POST /chat/messages → { messageID } */
  sendMessage: async (body: SendMessageRequest) => {
    const res = await apiClient.post<unknown>(API.chat.createMessage, body);
    return unwrap<{ messageID: number }>(res.data);
  },

  /** PUT /chat/conversations/:id/read */
  markRead: async (id: number) => {
    const res = await apiClient.put<unknown>(API.chat.read(id), {});
    return unwrap(res.data);
  },

  // ── Assignment ────────────────────────────────────────────────────────────

  /**
   * PUT /chat/conversations/:id/assign
   * - Không truyền staffID → tự nhận
   * - Truyền staffID → Admin assign cho staff khác (cần xác nhận)
   */
  assign: async (id: number, staffID?: number) => {
    const body = staffID ? { staffID } : {};
    const res = await apiClient.put<unknown>(API.chat.assign(id), body);
    return unwrap(res.data);
  },

  /** PUT /chat/conversations/:id/respond-assign */
  respondAssign: async (id: number, accept: boolean) => {
    const res = await apiClient.put<unknown>(API.chat.respondAssign(id), { accept });
    return unwrap(res.data);
  },

  // ── Close ─────────────────────────────────────────────────────────────────

  /** PUT /chat/conversations/:id/close */
  close: async (id: number, body: CloseConversationRequest = {}) => {
    const res = await apiClient.put<unknown>(API.chat.close(id), body);
    return unwrap(res.data);
  },

  // ── Pin ───────────────────────────────────────────────────────────────────

  /** PUT /chat/messages/:messageId/pin?pin=true|false */
  pinMessage: async (messageId: number, pin: boolean) => {
    const res = await apiClient.put<unknown>(
      `${API.chat.pinMessage(messageId)}?pin=${pin}`,
      {}
    );
    return unwrap(res.data);
  },
};

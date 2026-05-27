import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

export interface ConversationViewModel {
  conversationID: number;
  subject: string;
  status: string;
  conversationType?: string | null;
  priority?: string | null;
  customerName?: string | null;
  assignedStaffName?: string | null;
  lastMessage?: string | null;
  unreadCount?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface MessageViewModel {
  messageID: number;
  conversationID: number;
  senderType: "Customer" | "Staff" | "AIBot" | string;
  messageType: string;
  content?: string | null;
  isRead: boolean;
  createdDate: string;
}

export interface ConversationDetailViewModel extends ConversationViewModel {
  messages?: MessageViewModel[];
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
  content: string;
  attachmentUrl?: string | null;
  replyToMessageID?: number | null;
}

export const chatApi = {
  conversations: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get(API.chat.conversations, withSignal({}, options));
    const d = res.data as unknown;
    if (Array.isArray(d)) return d as ConversationViewModel[];
    if (d && typeof d === "object") {
      const obj = d as Record<string, unknown>;
      if (Array.isArray(obj.data)) return obj.data as ConversationViewModel[];
      if (Array.isArray(obj.items)) return obj.items as ConversationViewModel[];
    }
    return [] as ConversationViewModel[];
  },

  detail: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<ConversationDetailViewModel>(
      API.chat.conversation(id),
      withSignal({}, options)
    );
    return res.data;
  },

  messages: async (
    id: number,
    params: { page?: number; pageSize?: number },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<
      ConversationDetailViewModel | { messages: MessageViewModel[] }
    >(API.chat.messages(id), withSignal({ params }, options));
    return res.data;
  },

  createConversation: async (body: CreateConversationRequest) => {
    const res = await apiClient.post<ConversationViewModel>(
      API.chat.conversations,
      body
    );
    return res.data;
  },

  sendMessage: async (body: SendMessageRequest) => {
    const res = await apiClient.post<MessageViewModel>(API.chat.createMessage, body);
    return res.data;
  },

  markRead: async (id: number) => {
    const res = await apiClient.put(API.chat.read(id), {});
    return res.data;
  },
};

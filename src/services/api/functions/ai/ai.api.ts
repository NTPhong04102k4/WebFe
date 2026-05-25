import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

export interface AiSessionViewModel {
  sessionID: number;
  title: string;
  status?: string;
  totalMessages?: number;
  createdDate?: string;
  updatedDate?: string;
}

export interface AiMessageViewModel {
  messageID: number;
  sessionID: number;
  role?: "user" | "assistant" | string;
  text?: string | null;
  response?: string | null;
  content?: string | null;
  intent?: string | null;
  createdDate?: string;
}

export interface AiChatResponse {
  sessionID: number;
  messageID: number;
  response: string;
  intent?: string | null;
  responseType?: string | null;
  wasEscalated?: boolean;
  escalatedToConversationID?: number | null;
}

export interface AiOperationResult<T> {
  success: boolean;
  data?: T | null;
  message?: string | null;
  error?: string | null;
}

function unwrap<T>(payload: T | AiOperationResult<T>): T {
  return payload && typeof payload === "object" && "success" in payload
    ? ((payload as AiOperationResult<T>).data as T)
    : (payload as T);
}

export const aiApi = {
  sessions: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<AiSessionViewModel[]>(
      API.ai.sessions,
      withSignal({}, options)
    );
    return res.data;
  },

  messages: async (sessionId: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<AiMessageViewModel[]>(
      API.ai.messages(sessionId),
      withSignal({}, options)
    );
    return res.data;
  },

  createSession: async (title?: string) => {
    const res = await apiClient.post<AiSessionViewModel>(API.ai.sessions, {
      title: title ?? "Cuộc trò chuyện mới",
    });
    return res.data;
  },

  chat: async (body: { sessionID?: number | null; text: string; inputType: string }) => {
    const res = await apiClient.post<AiChatResponse | AiOperationResult<AiChatResponse>>(
      API.ai.chat,
      body
    );
    return unwrap(res.data);
  },

  deleteSession: async (sessionId: number) => {
    const res = await apiClient.delete(API.ai.session(sessionId));
    return res.data;
  },

  feedback: async (messageId: number, body: { rating: number; feedback?: string | null }) => {
    const res = await apiClient.post(API.ai.feedback(messageId), body);
    return res.data;
  },
};

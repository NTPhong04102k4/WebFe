import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatSession {
  sessionId: number;
  sessionUUID: string;
  title: string | null;
  sessionType: string;
  totalMessages: number;
  tokensUsed: number;
  status: string;
  lastInteractionAt: string | null;
  createdDate: string;
  lastMessagePreview: string | null;
}

export interface ChatMessage {
  messageId: number;
  role: "user" | "assistant";
  inputType: string;
  rawInput: string | null;
  responseContent: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  intent: string | null;
  userRating: number | null;
  wasEscalated: boolean;
  escalatedToConversationId: number | null;
  createdDate: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatMessage[];
}

export type AiIntent =
  | "ask_car_availability"
  | "ask_car_price"
  | "ask_car_detail"
  | "suggest_service"
  | "suggest_accessory"
  | "prompt_booking"
  | "ask_service_info"
  | "ask_app_feature"
  | "ask_kb"
  | "ask_claude_ai"
  | "request_human_support"
  | "rate_limited"
  | "chitchat"
  | "ask_general";

export interface AIChatResponse {
  sessionId: number;
  messageId: number;
  response: string;
  intent: AiIntent;
  responseType: "text";
  wasEscalated: boolean;
  escalatedToConversationId: number | null;
  metadata: AiMetadata | null;
}

export type AiMetadata =
  | CarListMetadata
  | ServiceListMetadata
  | AccessoryListMetadata
  | BookingPromptMetadata;

export interface CarListMetadata {
  type: "car_list";
  items: CarItem[];
}

export interface CarItem {
  carId: number;
  carName: string;
  brand: string;
  bodyType?: string;
  modelYear: number;
  listPrice: number;
  salePrice: number | null;
  fuelType: string;
  transmission?: string;
  seats?: number;
  condition?: string;
  location?: string;
  image: string | null;
  rating?: number | null;
}

export interface ServiceListMetadata {
  type: "service_list";
  items: ServiceItem[];
}

export interface ServiceItem {
  serviceId: number;
  serviceCode: string;
  name: string;
  category: string;
  price: number;
  duration: number;
  description: string | null;
}

export interface AccessoryListMetadata {
  type: "accessory_list";
  items: AccessoryItem[];
}

export interface AccessoryItem {
  accessoryId: number;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  stock: number;
  warranty: number | null;
  image: string | null;
  compatible: string | null;
}

export interface BookingPromptMetadata {
  type: "booking_prompt";
  services: { serviceId: number; name: string; price: number; duration: number }[];
}

export interface SendMessageRequest {
  sessionId?: number;
  text: string;
  inputType?: string;
}

export interface MessageFeedbackRequest {
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

interface PagedResult<T> {
  data: T[];
  totalCount: number;
}

interface OperationResult<T = unknown> {
  success: boolean;
  data?: T | null;
  message?: string | null;
}

// ─── Normalizers (.NET serializes SessionID → sessionID, not sessionId) ───────

function pick(obj: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) if (k in obj) return obj[k];
  return undefined;
}

function normalizeSession(raw: Record<string, unknown>): ChatSession {
  return {
    sessionId:         pick(raw, "sessionId", "sessionID", "SessionId", "SessionID") as number,
    sessionUUID:       pick(raw, "sessionUUID", "sessionUId", "SessionUUID", "sessionUId") as string ?? "",
    title:             pick(raw, "title", "Title") as string | null ?? null,
    sessionType:       pick(raw, "sessionType", "SessionType") as string ?? "General",
    totalMessages:     pick(raw, "totalMessages", "TotalMessages") as number ?? 0,
    tokensUsed:        pick(raw, "tokensUsed", "TokensUsed") as number ?? 0,
    status:            pick(raw, "status", "Status") as string ?? "Active",
    lastInteractionAt: pick(raw, "lastInteractionAt", "LastInteractionAt") as string | null ?? null,
    createdDate:       pick(raw, "createdDate", "CreatedDate") as string ?? "",
    lastMessagePreview: pick(raw, "lastMessagePreview", "LastMessagePreview") as string | null ?? null,
  };
}

function normalizeMessage(raw: Record<string, unknown>): ChatMessage {
  return {
    messageId:                 pick(raw, "messageId", "messageID", "MessageId", "MessageID") as number,
    role:                      pick(raw, "role", "Role") as "user" | "assistant" ?? "user",
    inputType:                 pick(raw, "inputType", "InputType") as string ?? "text",
    rawInput:                  pick(raw, "rawInput", "RawInput", "text", "Text") as string | null ?? null,
    responseContent:           pick(raw, "responseContent", "ResponseContent", "response", "Response") as string | null ?? null,
    attachmentUrl:             pick(raw, "attachmentUrl", "AttachmentUrl") as string | null ?? null,
    attachmentType:            pick(raw, "attachmentType", "AttachmentType") as string | null ?? null,
    intent:                    pick(raw, "intent", "Intent") as string | null ?? null,
    userRating:                pick(raw, "userRating", "UserRating") as number | null ?? null,
    wasEscalated:              pick(raw, "wasEscalated", "WasEscalated") as boolean ?? false,
    escalatedToConversationId: pick(raw, "escalatedToConversationId", "escalatedToConversationID", "EscalatedToConversationId") as number | null ?? null,
    createdDate:               pick(raw, "createdDate", "CreatedDate") as string ?? "",
  };
}

function normalizeChatResponse(raw: Record<string, unknown>): AIChatResponse {
  return {
    sessionId:                 pick(raw, "sessionId", "sessionID", "SessionId", "SessionID") as number,
    messageId:                 pick(raw, "messageId", "messageID", "MessageId", "MessageID") as number,
    response:                  pick(raw, "response", "Response") as string ?? "",
    intent:                    pick(raw, "intent", "Intent") as AiIntent ?? "chitchat",
    responseType:              "text",
    wasEscalated:              pick(raw, "wasEscalated", "WasEscalated") as boolean ?? false,
    escalatedToConversationId: pick(raw, "escalatedToConversationId", "escalatedToConversationID") as number | null ?? null,
    metadata:                  pick(raw, "metadata", "Metadata") as AiMetadata | null ?? null,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== "object") return [];
  const p = payload as Record<string, unknown>;
  // OperationResult wrapper
  const inner = "success" in p ? p.data : payload;
  if (Array.isArray(inner)) return inner as T[];
  if (!inner || typeof inner !== "object") return [];
  const ip = inner as Record<string, unknown>;
  // Paginated: { data: [...], totalCount }
  if (Array.isArray(ip.data)) return ip.data as T[];
  // .NET ReferenceHandler.Preserve
  if (Array.isArray(ip["$values"])) return ip["$values"] as T[];
  return [];
}

function toPaged<T>(payload: unknown): PagedResult<T> {
  if (Array.isArray(payload)) return { data: payload as T[], totalCount: payload.length };
  if (!payload || typeof payload !== "object") return { data: [], totalCount: 0 };
  const p = payload as Record<string, unknown>;
  const inner = "success" in p ? p.data : payload;
  if (!inner || typeof inner !== "object") return { data: [], totalCount: 0 };
  const ip = inner as Record<string, unknown>;
  if ("totalCount" in ip) {
    return {
      data: toArray<T>(ip.data ?? ip["$values"] ?? []),
      totalCount: Number(ip.totalCount) || 0,
    };
  }
  const arr = toArray<T>(inner);
  return { data: arr, totalCount: arr.length };
}

function unwrapSingle<T>(payload: unknown): T | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if ("success" in p) return (p.data as T) ?? null;
  return payload as T;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const aiApi = {
  sessions: async (page = 1, options?: ApiRequestOptions): Promise<PagedResult<ChatSession>> => {
    const res = await apiClient.get(
      API.ai.sessions,
      withSignal({ params: { page, pageSize: 20 } }, options)
    );
    const paged = toPaged<Record<string, unknown>>(res.data);
    return { data: paged.data.map(normalizeSession), totalCount: paged.totalCount };
  },

  searchSessions: async (
    q: string,
    page = 1,
    pageSize = 20,
    options?: ApiRequestOptions
  ): Promise<PagedResult<ChatSession> & { query: string }> => {
    const res = await apiClient.get(
      API.ai.sessionsSearch,
      withSignal({ params: { q, page, pageSize } }, options)
    );
    const payload = res.data as unknown;
    const paged = toPaged<Record<string, unknown>>(payload);
    const inner =
      payload && typeof payload === "object" && "success" in payload
        ? (payload as Record<string, unknown>).data
        : payload;
    const query =
      inner && typeof inner === "object"
        ? (pick(inner as Record<string, unknown>, "query", "Query") as string | undefined)
        : undefined;
    return {
      data: paged.data.map(normalizeSession),
      totalCount: paged.totalCount,
      query: query ?? q,
    };
  },

  session: async (sessionId: number): Promise<ChatSession | null> => {
    const res = await apiClient.get(API.ai.session(sessionId));
    return unwrapSingle<ChatSession>(res.data);
  },

  messages: async (sessionId: number, options?: ApiRequestOptions): Promise<ChatSessionDetail> => {
    const res = await apiClient.get(
      API.ai.messages(sessionId),
      withSignal({}, options)
    );

    const fallback = (msgs: ChatMessage[]): ChatSessionDetail => ({
      sessionId, sessionUUID: "", title: null, sessionType: "General",
      totalMessages: msgs.length, tokensUsed: 0, status: "Active",
      lastInteractionAt: null, createdDate: "", lastMessagePreview: null, messages: msgs,
    });

    const payload = res.data as unknown;
    if (!payload || typeof payload !== "object") return fallback([]);

    const p = payload as Record<string, unknown>;

    // OperationResult wrapper: { success, data }
    const inner = "success" in p ? p.data : payload;
    if (!inner || typeof inner !== "object") return fallback([]);

    const ip = inner as Record<string, unknown>;

    // ChatSessionDetail: { sessionId/sessionID, messages: [...] }
    const msgsRaw = ip.messages ?? ip.Messages;
    if (Array.isArray(msgsRaw)) {
      return {
        ...normalizeSession(ip),
        messages: msgsRaw.map((m) => normalizeMessage(m as Record<string, unknown>)),
      };
    }

    // Flat array of messages
    if (Array.isArray(inner)) {
      return fallback((inner as Record<string, unknown>[]).map(normalizeMessage));
    }

    // Paginated: { data: [...], totalCount } or { data: ChatSessionDetail }
    if ("data" in ip) {
      if (Array.isArray(ip.data)) {
        return fallback((ip.data as Record<string, unknown>[]).map(normalizeMessage));
      }
      const nested = ip.data as Record<string, unknown>;
      const nestedMsgs = nested?.messages ?? nested?.Messages;
      if (nested && Array.isArray(nestedMsgs)) {
        return {
          ...normalizeSession(nested),
          messages: (nestedMsgs as Record<string, unknown>[]).map(normalizeMessage),
        };
      }
    }

    // $values (ReferenceHandler.Preserve)
    if (Array.isArray(ip["$values"])) {
      return fallback((ip["$values"] as Record<string, unknown>[]).map(normalizeMessage));
    }

    return fallback([]);
  },

  createSession: async (sessionType = "General") => {
    const res = await apiClient.post<OperationResult<{ sessionId: number; sessionUUID: string }>>(
      API.ai.sessions,
      { sessionType }
    );
    return res.data;
  },

  chat: async (body: SendMessageRequest, signal?: AbortSignal) => {
    const res = await apiClient.post<OperationResult<AIChatResponse>>(
      API.ai.chat,
      body,
      { signal }
    );
    const d = res.data as unknown;
    const raw =
      d && typeof d === "object" && "success" in (d as object)
        ? ((d as OperationResult<AIChatResponse>).data as unknown)
        : d;
    return normalizeChatResponse(raw as Record<string, unknown>);
  },

  renameSession: async (sessionId: number, title: string) => {
    const res = await apiClient.put(API.ai.rename(sessionId), { title });
    return res.data;
  },

  deleteSession: async (sessionId: number) => {
    const res = await apiClient.delete(API.ai.session(sessionId));
    return res.data;
  },

  feedback: async (messageId: number, body: MessageFeedbackRequest) => {
    const res = await apiClient.post(API.ai.feedback(messageId), body);
    return res.data;
  },

  /** GET /ai/quota — Authorized */
  quota: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<unknown>(
      API.ai.quota,
      withSignal({}, options)
    );
    return unwrapSingle<{
      dailyLimit: number;
      dailyUsed: number;
      remaining: number;
      resetAt: string;
    }>(res.data);
  },
};

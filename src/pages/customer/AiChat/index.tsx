import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { aiApi, type AiMessageViewModel } from "@/services/api/functions/ai/ai.api";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function normalizeMessage(message: AiMessageViewModel): LocalMessage[] {
  const result: LocalMessage[] = [];
  if (message.text) result.push({ id: `${message.messageID}-u`, role: "user", content: message.text });
  if (message.response ?? message.content) {
    result.push({
      id: `${message.messageID}-a`,
      role: "assistant",
      content: message.response ?? message.content ?? "",
    });
  }
  return result;
}

export default function CustomerAiChatPage() {
  const qc = useQueryClient();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);

  const sessions = useQuery({
    queryKey: ["ai-sessions"],
    queryFn: ({ signal }) => aiApi.sessions({ signal }),
  });
  const history = useQuery({
    queryKey: ["ai-messages", sessionId],
    enabled: sessionId != null,
    queryFn: ({ signal }) => aiApi.messages(sessionId!, { signal }),
  });

  useEffect(() => {
    if (!sessionId && sessions.data?.[0]) setSessionId(sessions.data[0].sessionID);
  }, [sessionId, sessions.data]);

  useEffect(() => {
    if (history.data) setLocalMessages(history.data.flatMap(normalizeMessage));
  }, [history.data]);

  const send = useMutation({
    mutationFn: (text: string) => aiApi.chat({ sessionID: sessionId, text, inputType: "text" }),
    onMutate: (text) => {
      setLocalMessages((items) => [...items, { id: `local-${Date.now()}`, role: "user", content: text }]);
    },
    onSuccess: (response) => {
      setSessionId(response.sessionID);
      setLocalMessages((items) => [
        ...items,
        { id: String(response.messageID), role: "assistant", content: response.response },
      ]);
      qc.invalidateQueries({ queryKey: ["ai-sessions"] });
      if (response.wasEscalated && response.escalatedToConversationID) {
        toast.success("AI đã chuyển cuộc trò chuyện sang nhân viên hỗ trợ");
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    send.mutate(text);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI tư vấn và RAG</h1>
          <p className="mt-1 text-sm text-slate-600">Hỏi về xe, giá, dịch vụ, chính sách và yêu cầu gặp nhân viên khi cần.</p>
        </div>
        <Link to="/chat" className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50">Chat nhân viên</Link>
      </div>

      <div className="mt-6 grid min-h-[640px] gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-4 font-semibold text-slate-900">Lịch sử</div>
          <button
            className="m-3 w-[calc(100%-1.5rem)] rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white"
            onClick={() => {
              setSessionId(null);
              setLocalMessages([]);
            }}
          >
            Cuộc trò chuyện mới
          </button>
          <div className="divide-y">
            {(sessions.data ?? []).map((session) => (
              <button
                key={session.sessionID}
                className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${sessionId === session.sessionID ? "bg-blue-50" : ""}`}
                onClick={() => setSessionId(session.sessionID)}
              >
                <div className="font-medium text-slate-900">{session.title}</div>
                <div className="mt-1 text-xs text-slate-500">{session.totalMessages ?? 0} tin nhắn</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-auto p-5">
              {localMessages.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                  Ví dụ: “Xe Toyota Camry còn hàng không?”, “Đặt lịch bảo dưỡng thế nào?”, “Tôi muốn gặp nhân viên”.
                </div>
              ) : null}
              {localMessages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] whitespace-pre-wrap rounded-xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {send.isPending ? <div className="text-sm text-slate-500">AI đang trả lời...</div> : null}
            </div>
            <div className="flex gap-2 border-t p-4">
              <textarea className="min-h-11 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" rows={1} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi" />
              <button className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={!input.trim() || send.isPending} onClick={submit}>
                Gửi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

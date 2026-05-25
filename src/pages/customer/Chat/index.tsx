import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";

import { chatApi } from "@/services/api/functions/chat/chat.api";

export default function CustomerChatPage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [initialMessage, setInitialMessage] = useState("");
  const [message, setMessage] = useState("");

  const conversations = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: ({ signal }) => chatApi.conversations({ signal }),
  });
  const detail = useQuery({
    queryKey: ["chat-conversation", selectedId],
    enabled: selectedId != null,
    queryFn: ({ signal }) => chatApi.detail(selectedId!, { signal }),
  });

  useEffect(() => {
    if (!selectedId && conversations.data?.[0]) setSelectedId(conversations.data[0].conversationID);
  }, [conversations.data, selectedId]);

  const createConversation = useMutation({
    mutationFn: () =>
      chatApi.createConversation({
        conversationType: "Support",
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
    onError: (error: Error) => notify.error(error.message),
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
      qc.invalidateQueries({ queryKey: ["chat-conversation", selectedId] });
      qc.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error: Error) => notify.error(error.message),
  });

  const messages = detail.data?.messages ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Nhắn tin hỗ trợ</h1>
      <div className="mt-6 grid min-h-[620px] gap-6 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold text-slate-900">Cuộc trò chuyện</h2>
          </div>
          <div className="max-h-72 divide-y overflow-auto">
            {(conversations.data ?? []).map((item) => (
              <button
                key={item.conversationID}
                type="button"
                className={`block w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${selectedId === item.conversationID ? "bg-blue-50" : ""}`}
                onClick={() => setSelectedId(item.conversationID)}
              >
                <div className="font-semibold text-slate-900">{item.subject}</div>
                <div className="mt-1 text-xs text-slate-500">{item.status} · {item.assignedStaffName ?? "Chưa phân công"}</div>
              </button>
            ))}
          </div>
          <div className="border-t p-4">
            <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Tiêu đề" value={subject} onChange={(event) => setSubject(event.target.value)} />
            <textarea className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" rows={3} placeholder="Tin nhắn đầu tiên" value={initialMessage} onChange={(event) => setInitialMessage(event.target.value)} />
            <button
              className="mt-2 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
              disabled={!subject.trim() || !initialMessage.trim() || createConversation.isPending}
              onClick={() => createConversation.mutate()}
            >
              Tạo chat
            </button>
          </div>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white">
          {selectedId ? (
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b p-4">
                <div className="font-semibold text-slate-900">{detail.data?.subject ?? "Đang tải..."}</div>
                <div className="text-xs text-slate-500">{detail.data?.status}</div>
              </div>
              <div className="flex-1 space-y-3 overflow-auto p-4">
                {messages.map((item) => {
                  const mine = item.senderType === "Customer";
                  return (
                    <div key={item.messageID} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${mine ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                        {item.content}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-2 border-t p-4">
                <input className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập tin nhắn" />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={!message.trim() || sendMessage.isPending} onClick={() => sendMessage.mutate()}>
                  Gửi
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-500">Chọn hoặc tạo cuộc trò chuyện.</div>
          )}
        </div>
      </div>
    </div>
  );
}

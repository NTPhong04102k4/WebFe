import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/services/api/functions/ai/ai.api";

interface Props {
  onSelect: (sessionId: number) => void;
}

export function SessionSearch({ onSelect }: Props) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [q]);

  const searchQuery = useQuery({
    queryKey: ["ai-sessions-search", debouncedQ],
    queryFn: ({ signal }) => aiApi.searchSessions(debouncedQ, 1, 20, { signal }),
    enabled: debouncedQ.length >= 2,
    staleTime: 10_000,
  });

  const results = searchQuery.data?.data ?? [];

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="search"
          placeholder="Tim cuoc tro chuyen..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/20"
        />
        {searchQuery.isFetching && (
          <span className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" />
        )}
      </div>

      {debouncedQ.length >= 2 && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-20 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
          {results.map((session) => (
            <button
              key={session.sessionId}
              type="button"
              onClick={() => {
                onSelect(session.sessionId);
                setQ("");
                setDebouncedQ("");
              }}
              className="block w-full px-3 py-2 text-left hover:bg-slate-50"
            >
              <span className="block truncate text-sm font-medium text-slate-800">
                {session.title ?? "Khong co tieu de"}
              </span>
              {session.lastMessagePreview && (
                <span className="mt-0.5 block truncate text-xs text-slate-400">
                  {session.lastMessagePreview}
                </span>
              )}
            </button>
          ))}
          {!searchQuery.isFetching && results.length === 0 && (
            <div className="px-3 py-3 text-xs text-slate-400">
              Khong tim thay ket qua cho "{debouncedQ}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

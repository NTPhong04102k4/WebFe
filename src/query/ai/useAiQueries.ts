import { useQuery } from "@tanstack/react-query";
import { aiApi } from "src/services/api/functions/ai/ai.api";
import { useAuthStore } from "@/stores/authStore";

const aiKeys = {
  all: ["ai"] as const,
  quota: () => [...aiKeys.all, "quota"] as const,
};

/** GET /ai/quota — hiển thị số lượt chat còn lại trong ngày */
export function useAiQuota() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: aiKeys.quota(),
    queryFn: ({ signal }) => aiApi.quota({ signal }),
    enabled: !!accessToken,
    staleTime: 60_000,
    retry: false,
  });
}

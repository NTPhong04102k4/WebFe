import { useAuthStore } from "@/stores/authStore";
import { logger } from "@/common/utils/logger";

export const useAuth = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user) as any;

  const isAuthenticated = !!accessToken;

  logger.log("🔧 useAuth hook called:", {
    isAuthenticated,
    hasUser: !!user,
    userName: user?.fullName || user?.username || "No user",
    tokenExists: !!accessToken,
  })

  return {
    isAuthenticated,
    user,
    token: accessToken,
  }
};

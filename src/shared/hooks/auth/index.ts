import { useAppSelector } from "src/redux/hook";
import { selectIsAuthenticated, selectUser } from "src/redux/Slice/AuthSlice";
import { useAuthQuery } from "src/query/auth/useAuthQuery";
import { logger } from "src/utils/logger";

export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const token = useAppSelector((state) => state.auth.token);
  const authQuery = useAuthQuery();

  logger.log("🔧 useAuth hook called:", {
    isAuthenticated,
    hasUser: !!user,
    userName:
      (user as any)?.fullName || (user as any)?.username || "No user",
    tokenExists: !!token,
  });

  return {
    isAuthenticated,
    user,
    token,
    ...authQuery,
  };
};

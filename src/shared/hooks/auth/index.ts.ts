import { useAppSelector } from "src/redux/hook";
import { selectIsAuthenticated, selectUser } from "src/redux/Slice/AuthSlice";
import { useAuthQuery } from "src/query/auth/useAuthQuery";

export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const token = useAppSelector((state) => state.auth.token);
  const authQuery = useAuthQuery();

  // Debug log to track when hook is called and what values it returns
  console.log("🔧 useAuth hook called:", {
    isAuthenticated,
    hasUser: !!user,
    userName: user?.fullName || user?.username || "No user",
    tokenExists: !!token,
    userObject: user,
  });

  return {
    isAuthenticated,
    user,
    token,
    ...authQuery,
  };
};

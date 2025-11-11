import { useAppSelector } from "src/redux/hook";
import { selectAuth, selectIsAuthenticated, selectUser } from "src/redux/Slice/AuthSlice";
import { useAuthQuery } from "src/query/auth/useAuthQuery";
import { shallowEqual } from "react-redux";

export const useAuth = () => {
  // Use individual selectors to ensure re-render when specific values change
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser, shallowEqual);
  const token = useAppSelector((state) => state.auth.token);
  const authQuery = useAuthQuery();

  return {
    isAuthenticated,
    user,
    token,
    ...authQuery,
  };
};

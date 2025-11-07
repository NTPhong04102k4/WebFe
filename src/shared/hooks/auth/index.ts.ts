import { useAppSelector } from "src/redux/hook";
import { selectAuth } from "src/redux/Slice/AuthSlice";
import { useAuthQuery } from "src/query/auth/useAuthQuery";

export const useAuth = () => {
  const authState = useAppSelector(selectAuth);
  const authQuery = useAuthQuery();

  return {
    ...authState,
    ...authQuery,
  };
};

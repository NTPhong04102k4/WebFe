import { useMemo, useState } from "react";

import { useAdminUsers } from "src/query/user/useUserQueries";
import type {
  PagedUsersResponse,
  UserListPeriod,
  UserListQuery,
  UserProfile,
} from "src/shared/types/Reponse/auth/user";

export type UserStatusFilter = "all" | "active" | "inactive" | "locked" | "unlocked";

const defaultQuery: Required<Pick<UserListQuery, "page" | "pageSize" | "period" | "sortBy" | "sortDir">> = {
  page: 1,
  pageSize: 20,
  period: "all",
  sortBy: "createdDate",
  sortDir: "desc",
};

function emptyPagedUsers(query: UserListQuery): PagedUsersResponse {
  return {
    items: [],
    totalCount: 0,
    page: query.page ?? defaultQuery.page,
    pageSize: query.pageSize ?? defaultQuery.pageSize,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    period: query.period ?? defaultQuery.period,
    fromDate: query.fromDate ?? null,
    toDate: query.toDate ?? null,
    search: query.search ?? null,
  };
}

export function useUserManagement() {
  const [search, setSearchState] = useState("");
  const [email, setEmailState] = useState("");
  const [username, setUsernameState] = useState("");
  const [phone, setPhoneState] = useState("");
  const [period, setPeriodState] = useState<UserListPeriod>("all");
  const [statusFilters, setStatusFiltersState] = useState<UserStatusFilter[]>([]);
  const [fromDate, setFromDateState] = useState("");
  const [toDate, setToDateState] = useState("");
  const [sortBy, setSortByState] = useState<UserListQuery["sortBy"]>("createdDate");
  const [sortDir, setSortDirState] = useState<UserListQuery["sortDir"]>("desc");
  const [page, setPage] = useState(defaultQuery.page);
  const [pageSize, setPageSizeState] = useState(defaultQuery.pageSize);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const query = useMemo<UserListQuery>(() => {
    const isActive =
      statusFilters.includes("active") && !statusFilters.includes("inactive")
        ? true
        : statusFilters.includes("inactive") && !statusFilters.includes("active")
          ? false
          : undefined;
    const isLocked =
      statusFilters.includes("locked") && !statusFilters.includes("unlocked")
        ? true
        : statusFilters.includes("unlocked") && !statusFilters.includes("locked")
          ? false
          : undefined;

    return {
      ...defaultQuery,
      page,
      pageSize,
      period,
      fromDate: period === "custom" ? fromDate || undefined : undefined,
      toDate: period === "custom" ? toDate || undefined : undefined,
      search: search.trim() || undefined,
      email: email.trim() || undefined,
      username: username.trim() || undefined,
      phone: phone.trim() || undefined,
      isActive,
      isLocked,
      sortBy,
      sortDir,
    };
  }, [email, fromDate, page, pageSize, period, phone, search, sortBy, sortDir, statusFilters, toDate, username]);

  const usersQuery = useAdminUsers(query);
  const pagedUsers = usersQuery.data ?? emptyPagedUsers(query);

  const summary = useMemo(() => {
    const items = pagedUsers.items;

    return {
      total: pagedUsers.totalCount,
      currentPage: items.length,
      active: items.filter((user) => user.isActive).length,
      locked: items.filter((user) => user.isLocked).length,
    };
  }, [pagedUsers]);

  const resetPage = () => setPage(1);

  const setSearch = (value: string) => {
    setSearchState(value);
    resetPage();
  };

  const setEmail = (value: string) => {
    setEmailState(value);
    resetPage();
  };

  const setUsername = (value: string) => {
    setUsernameState(value);
    resetPage();
  };

  const setPhone = (value: string) => {
    setPhoneState(value);
    resetPage();
  };

  const setPeriod = (value: UserListPeriod) => {
    setPeriodState(value);
    resetPage();
  };

  const setStatusFilters = (value: UserStatusFilter[]) => {
    setStatusFiltersState(value.filter((item) => item !== "all"));
    resetPage();
  };

  const setFromDate = (value: string) => {
    setFromDateState(value);
    resetPage();
  };

  const setToDate = (value: string) => {
    setToDateState(value);
    resetPage();
  };

  const setDateRange = (value: { fromDate: string; toDate: string }) => {
    setFromDateState(value.fromDate);
    setToDateState(value.toDate);
    resetPage();
  };

  const setSortBy = (value: UserListQuery["sortBy"]) => {
    setSortByState(value);
    resetPage();
  };

  const setSortDir = (value: UserListQuery["sortDir"]) => {
    setSortDirState(value);
    resetPage();
  };

  const setPageSize = (value: number) => {
    setPageSizeState(value);
    setPage(1);
  };

  return {
    error: usersQuery.error,
    search,
    setSearch,
    email,
    setEmail,
    username,
    setUsername,
    phone,
    setPhone,
    period,
    setPeriod,
    statusFilters,
    setStatusFilters,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    setDateRange,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedUser,
    openDetail: setSelectedUser,
    closeDetail: () => setSelectedUser(null),
    users: pagedUsers.items,
    pagedUsers,
    summary,
    isLoading: usersQuery.isLoading,
    isSyncing: usersQuery.isFetching && !usersQuery.isLoading,
    refetch: usersQuery.refetch,
  };
}

import type { PagedUsersResponse } from "src/shared/types/Reponse/auth/user";

type UserPaginationProps = {
  page: number;
  pageSize: number;
  data: PagedUsersResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function UserPagination({
  page,
  pageSize,
  data,
  onPageChange,
  onPageSizeChange,
}: UserPaginationProps) {
  const totalPages = Math.max(1, data.totalPages || 1);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Trang {page} / {totalPages} - {data.totalCount} ket qua
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border-2 border-slate-400 bg-white px-2 py-1.5 text-sm text-slate-800 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
          <option value={100}>100 / trang</option>
        </select>
        <button
          type="button"
          className="rounded-lg border-2 border-slate-400 px-3 py-1.5 text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={!data.hasPreviousPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Truoc
        </button>
        <button
          type="button"
          className="rounded-lg border-2 border-slate-400 px-3 py-1.5 text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={!data.hasNextPage}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

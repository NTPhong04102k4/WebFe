import { Select } from "src/components/core/Select/Select";
import type { PagedUsersResponse } from "src/shared/types/Reponse/auth/user";

const PAGE_SIZE_OPTIONS = [
  { value: 10,  label: "10 / trang" },
  { value: 20,  label: "20 / trang" },
  { value: 50,  label: "50 / trang" },
  { value: 100, label: "100 / trang" },
];

type UserPaginationProps = {
  page: number;
  pageSize: number;
  data: PagedUsersResponse;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function UserPagination({ page, pageSize, data, onPageChange, onPageSizeChange }: UserPaginationProps) {
  const totalPages = Math.max(1, data.totalPages || 1);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Trang {page} / {totalPages} — {data.totalCount} kết quả
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <div className="w-32">
          <Select
            options={PAGE_SIZE_OPTIONS}
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          />
        </div>
        <button
          type="button"
          className="rounded-lg border-2 border-slate-400 px-3 py-1.5 text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
          disabled={!data.hasPreviousPage}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Trước
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

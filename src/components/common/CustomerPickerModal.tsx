import { useEffect, useState } from "react";
import { Search, X, UserCircle2, CheckSquare, Square } from "lucide-react";
import { useAdminUsers } from "src/query/user/useUserQueries";
import type { UserProfile } from "src/shared/types/Reponse/auth/user";

const PAGE_SIZE = 8;

type BaseProps = {
  open: boolean;
  onClose: () => void;
};

type SingleSelectProps = BaseProps & {
  mode?: "single";
  onSelect: (user: UserProfile) => void;
};

type MultiSelectProps = BaseProps & {
  mode: "multi";
  selected: string[];
  onConfirm: (userIDs: string[]) => void;
};

type Props = SingleSelectProps | MultiSelectProps;

export function CustomerPickerModal(props: Props) {
  const { open, onClose } = props;
  const isMulti = props.mode === "multi";

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [localSelected, setLocalSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [keyword]);

  useEffect(() => {
    if (open) {
      setKeyword("");
      setDebouncedKeyword("");
      setPage(1);
      setLocalSelected(new Set(props.mode === "multi" ? props.selected : []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const { data, isLoading } = useAdminUsers({
    page,
    pageSize: PAGE_SIZE,
    search: debouncedKeyword || undefined,
  });

  const list = data?.items ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (!open) return null;

  const toggleOne = (userID: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userID)) next.delete(userID);
      else next.add(userID);
      return next;
    });
  };

  const handleRowClick = (user: UserProfile) => {
    if (props.mode === "multi") toggleOne(user.userID);
    else props.onSelect(user);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Chọn khách hàng
            </h2>
            {isMulti && localSelected.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {localSelected.size} đã chọn
                <button onClick={() => setLocalSelected(new Set())} className="hover:text-blue-900 dark:hover:text-blue-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo email, username hoặc số điện thoại..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-slate-400"
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              Đang tải...
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              Không tìm thấy khách hàng nào.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                <tr>
                  {isMulti && <th className="w-10 px-4 py-2.5" />}
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Họ tên</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Email</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">SĐT</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {list.map((user) => {
                  const checked = localSelected.has(user.userID);
                  return (
                    <tr
                      key={user.userID}
                      onClick={() => handleRowClick(user)}
                      className={`cursor-pointer transition-colors ${
                        isMulti && checked
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      }`}
                    >
                      {isMulti && (
                        <td className="px-4 py-2.5 text-center">
                          {checked ? (
                            <CheckSquare className="h-4 w-4 text-blue-600 mx-auto" />
                          ) : (
                            <Square className="h-4 w-4 text-slate-300 mx-auto" />
                          )}
                        </td>
                      )}
                      <td className="px-3 py-2.5 font-medium text-slate-800 dark:text-slate-100">
                        {user.fullName || "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{user.email || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300">{user.phone || "—"}</td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400">{user.username}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              ←
            </button>
            <span className="px-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              →
            </button>
            <span className="ml-2 text-slate-400">{total} khách hàng</span>
          </div>
          {props.mode === "multi" ? (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              >
                Huỷ
              </button>
              <button
                onClick={() => props.onConfirm(Array.from(localSelected))}
                className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 min-w-[100px]"
              >
                {localSelected.size > 0 ? `Xác nhận (${localSelected.size})` : "Xác nhận"}
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Đóng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Search, X, Users, CheckSquare, Square } from "lucide-react";
import { useStaffList } from "src/query/staff/useStaffQueries";
import { useLocationList } from "src/query/location/useLocationQueries";
import type { StaffResponse } from "src/services/api/functions/staff/staff.types";

const ROLE_OPTIONS = [
  { value: 1, label: "SuperAdmin" },
  { value: 2, label: "Admin" },
  { value: 3, label: "Staff" },
] as const;

const PAGE_SIZE = 8;

function staffIdOf(s: StaffResponse): number {
  return s.staffID ?? s.id ?? 0;
}

function staffNameOf(s: StaffResponse): string {
  return s.fullName;
}

interface Props {
  open: boolean;
  selected: number[];
  onConfirm: (ids: number[]) => void;
  onClose: () => void;
}

export function StaffPickerModal({ open, selected, onConfirm, onClose }: Props) {
  // ─── filters ──────────────────────────────────────────────────────────
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [locationID, setLocationID] = useState<number | "">("");
  const [roleID, setRoleID] = useState<number | "">("");
  const [isActive, setIsActive] = useState<"" | "true" | "false">("");
  const [page, setPage] = useState(1);

  // ─── local selection ──────────────────────────────────────────────────
  const [localSelected, setLocalSelected] = useState<Set<number>>(new Set(selected));

  // Sync selected when modal opens
  useEffect(() => {
    if (open) setLocalSelected(new Set(selected));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce keyword
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKeyword(keyword);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [keyword]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [locationID, roleID, isActive]);

  // ─── data ─────────────────────────────────────────────────────────────
  const { data, isLoading } = useStaffList(
    {
      page,
      pageSize: PAGE_SIZE,
      keyword: debouncedKeyword || null,
      locationID: locationID !== "" ? locationID : null,
      roleID: roleID !== "" ? roleID : null,
      isActive: isActive !== "" ? isActive === "true" : null,
    },
    open,
  );

  const { data: locations = [] } = useLocationList();

  const list = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ─── page-level select all ─────────────────────────────────────────────
  const pageIds = useMemo(
    () => list.map(staffIdOf).filter((id) => id > 0),
    [list],
  );
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => localSelected.has(id));
  const somePageSelected = !allPageSelected && pageIds.some((id) => localSelected.has(id));

  function togglePageAll() {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function toggleOne(id: number) {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearAll() {
    setLocalSelected(new Set());
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Chọn nhân viên
            </h2>
            {localSelected.size > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {localSelected.size} đã chọn
                <button onClick={clearAll} className="hover:text-blue-900 dark:hover:text-blue-100">
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

        {/* ── Filters ────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0 space-y-2">
          {/* Keyword */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm tên, email, username..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Row 2: location + role + status */}
          <div className="flex gap-2">
            <select
              value={locationID}
              onChange={(e) => setLocationID(e.target.value !== "" ? Number(e.target.value) : "")}
              className="flex-1 text-sm border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Tất cả vị trí</option>
              {locations.map((loc) => {
                const id = (loc as { locationID?: number; id?: number }).locationID
                  ?? (loc as { locationID?: number; id?: number }).id;
                return (
                  <option key={id} value={id}>
                    {(loc as { locationName: string }).locationName}
                  </option>
                );
              })}
            </select>

            <select
              value={roleID}
              onChange={(e) => setRoleID(e.target.value !== "" ? Number(e.target.value) : "")}
              className="flex-1 text-sm border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Tất cả vai trò</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value as typeof isActive)}
              className="flex-1 text-sm border rounded-lg px-3 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đang hoạt động</option>
              <option value="false">Đã vô hiệu</option>
            </select>
          </div>
        </div>

        {/* ── Staff list ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              Đang tải...
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
              Không tìm thấy nhân viên nào.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0">
                <tr>
                  <th className="w-10 px-4 py-2.5">
                    <button
                      onClick={togglePageAll}
                      className="text-slate-500 hover:text-blue-600 dark:text-slate-400"
                      title={allPageSelected ? "Bỏ chọn trang này" : "Chọn tất cả trang này"}
                    >
                      {allPageSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-600" />
                      ) : somePageSelected ? (
                        <CheckSquare className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Họ tên</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Vai trò</th>
                  <th className="text-left px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Vị trí</th>
                  <th className="text-center px-3 py-2.5 font-medium text-slate-600 dark:text-slate-300">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {list.map((staff) => {
                  const id = staffIdOf(staff);
                  const checked = localSelected.has(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => toggleOne(id)}
                      className={`cursor-pointer transition-colors ${
                        checked
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700/30"
                      }`}
                    >
                      <td className="px-4 py-2.5 text-center">
                        <div
                          className={`w-4 h-4 rounded border-2 mx-auto flex items-center justify-center transition-colors ${
                            checked
                              ? "bg-blue-600 border-blue-600"
                              : "border-slate-300 dark:border-slate-500"
                          }`}
                        >
                          {checked && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-medium text-slate-800 dark:text-slate-100">
                          {staffNameOf(staff)}
                        </div>
                        <div className="text-xs text-slate-400">{staff.email}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {staff.roleName ?? staff.role ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 dark:text-slate-400 text-xs">
                        {staff.locationName ?? staff.location ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            staff.isActive !== false ? "bg-green-500" : "bg-slate-300"
                          }`}
                          title={staff.isActive !== false ? "Đang hoạt động" : "Vô hiệu"}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-between gap-3">
          {/* Pagination */}
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
            <span className="ml-2 text-slate-400">{total} nhân viên</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Huỷ
            </button>
            <button
              onClick={() => onConfirm(Array.from(localSelected))}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 min-w-[100px]"
            >
              {localSelected.size > 0
                ? `Xác nhận (${localSelected.size})`
                : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

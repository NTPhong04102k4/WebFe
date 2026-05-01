import React, { useCallback, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSearchParams } from "react-router-dom";

import {
  useClaimsList,
  useExpiringPolicies,
  useInsuranceMutations,
} from "src/query/insurance/useInsuranceQueries";
import { useTableQueryParams } from "src/shared/hooks/useTableQueryParams";
import type {
  InsuranceClaimViewModel,
  InsurancePolicyViewModel,
} from "src/services/api/functions/insurance/insurance.types";

import staff from "../staff-dashboard.module.scss";

const policyCol = createColumnHelper<InsurancePolicyViewModel>();
const claimCol = createColumnHelper<InsuranceClaimViewModel>();

function TablePager(props: {
  page: number;
  pageSize: number;
  totalCount: number;
  setPage: (p: number) => void;
  isLoading?: boolean;
}) {
  const { page, pageSize, totalCount, setPage, isLoading } = props;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return (
    <div className={staff.pagination} role="navigation" aria-label="Phân trang claim">
      <button
        type="button"
        className={staff.paginationBtn}
        disabled={page <= 1 || isLoading}
        onClick={() => setPage(page - 1)}
      >
        Trước
      </button>
      <span>
        Trang {page} / {totalPages} ({totalCount} mục)
      </span>
      <button
        type="button"
        className={staff.paginationBtn}
        disabled={page >= totalPages || isLoading}
        onClick={() => setPage(page + 1)}
      >
        Sau
      </button>
    </div>
  );
}

export function StaffInsurancePanel() {
  const [searchParams, setSearchParams] = useSearchParams();

  const within = useMemo(() => {
    const n = Number(searchParams.get("within"));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
  }, [searchParams]);

  const setWithin = useCallback(
    (next: number) => {
      const v = Math.max(1, Math.floor(next));
      const nextParams = new URLSearchParams(searchParams);
      if (v === 30) nextParams.delete("within");
      else nextParams.set("within", String(v));
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const { params: claimParams, setParams: setClaimParams } = useTableQueryParams({
    page: "claimPage",
    pageSize: "claimSize",
    search: "claimSearch",
    status: "claimStatus",
  });

  const { data: expiring = [], isLoading } = useExpiringPolicies(within, true);

  const claimsQuery = useMemo(
    () => ({
      page: claimParams.page,
      pageSize: claimParams.pageSize,
      status: claimParams.status || undefined,
    }),
    [claimParams.page, claimParams.pageSize, claimParams.status],
  );

  const { data: claimsRes, isLoading: claimsLoading } =
    useClaimsList(claimsQuery);
  const claims = claimsRes?.data ?? [];
  const claimsTotal = claimsRes?.totalCount ?? 0;

  const { patchClaimStatus } = useInsuranceMutations();
  const [msg, setMsg] = React.useState<string | null>(null);

  const onClaimStatus = async (
    id: number,
    status: string,
    approvedAmount?: number,
  ) => {
    setMsg(null);
    try {
      await patchClaimStatus.mutateAsync({
        id,
        body: { status, approvedAmount, notes: "Cập nhật từ staff portal" },
      });
      setMsg("Đã cập nhật yêu cầu bồi thường.");
    } catch {
      setMsg("Cập nhật thất bại (cần quyền Staff).");
    }
  };

  const policyColumns = [
    policyCol.accessor("policyNumber", { header: "Số HĐ" }),
    policyCol.accessor("ownerFullName", {
      header: "Khách",
      cell: (ctx) => ctx.getValue() ?? "—",
    }),
    policyCol.accessor((row) => new Date(row.endDate).toLocaleDateString("vi-VN"), {
      id: "end",
      header: "Hết hạn",
    }),
    policyCol.accessor("daysToExpire", { header: "Còn (ngày)" }),
  ];

  const claimColumns = [
    claimCol.accessor("claimNumber", { header: "Mã" }),
    claimCol.accessor("status", { header: "TT hiện tại" }),
    claimCol.accessor("claimAmount", {
      header: "Số tiền",
      cell: (ctx) => ctx.getValue()?.toLocaleString("vi-VN"),
    }),
    claimCol.display({
      id: "claimActions",
      header: "Cập nhật",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <select
            aria-label="Trạng thái claim"
            defaultValue=""
            onChange={(e) => {
              const v = e.target.value;
              if (v === "Approved") {
                const amt = window.prompt(
                  "Số tiền duyệt (optional)",
                  String(c.claimAmount),
                );
                onClaimStatus(c.claimID, v, amt ? Number(amt) : undefined);
              } else if (v) {
                onClaimStatus(c.claimID, v);
              }
            }}
          >
            <option value="">Đổi trạng thái…</option>
            <option value="UnderReview">UnderReview</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Paid">Paid</option>
          </select>
        );
      },
    }),
  ];

  const policyTable = useReactTable({
    data: expiring,
    columns: policyColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const claimTable = useReactTable({
    data: claims,
    columns: claimColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <p className={staff.note}>
        Hợp đồng sắp hết hạn và xử lý claim — chỉ Admin / SuperAdmin / Staff.
      </p>
      {msg && <p className={staff.ok}>{msg}</p>}

      <div className={staff.card}>
        <h3 className={staff.title}>Hợp đồng sắp hết hạn</h3>
        <div className={staff.tableToolbar}>
          <div className={staff.field} style={{ marginBottom: 0, maxWidth: 220 }}>
            <label htmlFor="within">Trong số ngày (đồng bộ URL)</label>
            <input
              id="within"
              type="number"
              min={1}
              value={within}
              onChange={(e) => setWithin(Number(e.target.value) || 30)}
            />
          </div>
        </div>
        {isLoading && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              {policyTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {policyTable.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={staff.card}>
        <h3 className={staff.title}>Yêu cầu bồi thường — xử lý trạng thái</h3>
        <div className={staff.tableToolbar}>
          <div className={staff.field} style={{ marginBottom: 0, minWidth: 160 }}>
            <label htmlFor="claim-filter-status">Lọc trạng thái</label>
            <select
              id="claim-filter-status"
              value={claimParams.status}
              onChange={(e) =>
                setClaimParams({ status: e.target.value, page: 1 })
              }
            >
              <option value="">Tất cả</option>
              <option value="Submitted">Submitted</option>
              <option value="UnderReview">UnderReview</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
          <div className={staff.field} style={{ marginBottom: 0, width: 100 }}>
            <label htmlFor="claim-size">/ trang</label>
            <select
              id="claim-size"
              value={String(claimParams.pageSize)}
              onChange={(e) =>
                setClaimParams({ pageSize: Number(e.target.value), page: 1 })
              }
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </select>
          </div>
        </div>
        {claimsLoading && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              {claimTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {claimTable.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePager
          page={claimParams.page}
          pageSize={claimParams.pageSize}
          totalCount={claimsTotal}
          isLoading={claimsLoading}
          setPage={(p) => setClaimParams({ page: p })}
        />
      </div>
    </div>
  );
}

export default StaffInsurancePanel;

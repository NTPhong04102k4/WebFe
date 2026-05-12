import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useCustomerVehicles } from "src/query/workshop/useWorkshopQueries";
import { useTableQueryParams } from "src/shared/hooks/useTableQueryParams";
import type { CustomerVehicleViewModel } from "src/services/api/functions/workshop/workshop.types";

import staff from "../staff-dashboard.module.scss";

const col = createColumnHelper<CustomerVehicleViewModel>();

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
    <div className={staff.pagination} role="navigation" aria-label="Phân trang xe khách">
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

export function StaffVehiclePanel() {
  const { params, setParams } = useTableQueryParams({
    page: "vPage",
    pageSize: "vSize",
    search: "vSearch",
    status: "vUserId",
  });

  const query = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      userId: params.status ? Number(params.status) : undefined,
    }),
    [params.page, params.pageSize, params.status]
  );

  const { data: res, isLoading } = useCustomerVehicles(query);
  const vehicles = res?.data ?? [];
  const total = res?.totalCount ?? 0;

  const columns = [
    col.accessor("customerVehicleID", { header: "ID" }),
    col.accessor("licensePlate", {
      header: "Biển số",
      cell: (ctx) => ctx.getValue() ?? "—",
    }),
    col.accessor("brandName", {
      header: "Hãng",
      cell: (ctx) => ctx.getValue() ?? "—",
    }),
    col.accessor("modelName", { header: "Model" }),
    col.accessor("modelYear", { header: "Năm" }),
    col.accessor("currentMileage", {
      header: "Km hiện tại",
      cell: (ctx) => ctx.getValue()?.toLocaleString("vi-VN"),
    }),
    col.accessor("ownerFullName", {
      header: "Chủ xe",
      cell: (ctx) => ctx.getValue() ?? "—",
    }),
    col.accessor("isActive", {
      header: "Trạng thái",
      cell: (ctx) => (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
            ctx.getValue()
              ? "bg-green-100 text-green-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {ctx.getValue() ? "Hoạt động" : "Tạm dừng"}
        </span>
      ),
    }),
  ];

  const table = useReactTable({
    data: vehicles,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <p className={staff.note}>
        Danh sách xe khách hàng — xem thông tin, lịch sử bảo dưỡng.
      </p>

      <div className={staff.card}>
        <h3 className={staff.title}>Xe khách hàng</h3>

        <div className={staff.tableToolbar}>
          <div className={staff.field} style={{ marginBottom: 0, minWidth: 160 }}>
            <label htmlFor="v-userid">Lọc theo User ID</label>
            <input
              id="v-userid"
              type="number"
              min={1}
              placeholder="Tất cả"
              value={params.status}
              onChange={(e) => setParams({ status: e.target.value, page: 1 })}
            />
          </div>
          <div className={staff.field} style={{ marginBottom: 0, width: 100 }}>
            <label htmlFor="v-size">/ trang</label>
            <select
              id="v-size"
              value={String(params.pageSize)}
              onChange={(e) =>
                setParams({ pageSize: Number(e.target.value), page: 1 })
              }
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </select>
          </div>
        </div>

        {isLoading && <p>Đang tải…</p>}

        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
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
              {vehicles.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", color: "#94a3b8" }}>
                    Không có xe nào.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <TablePager
          page={params.page}
          pageSize={params.pageSize}
          totalCount={total}
          isLoading={isLoading}
          setPage={(p) => setParams({ page: p })}
        />
      </div>
    </div>
  );
}

export default StaffVehiclePanel;

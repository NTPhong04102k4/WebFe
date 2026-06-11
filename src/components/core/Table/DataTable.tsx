import React from "react";
import { GripVertical } from "lucide-react";
import { DragDropManager, type DragEndEvent } from "@dnd-kit/dom";
import { Sortable } from "@dnd-kit/dom/sortable";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";

import { EmptyState } from "../Feedback";
import { Loading } from "../Feedback/Loading";
import { cn } from "../utils";

export type DataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  getRowId?: (row: TData, index: number) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  enableSorting?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  onRowClick?: (row: TData) => void;
  onRowOrderChange?: (nextData: TData[], activeId: string, overId: string) => void;
};

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

type SortableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  dragId: string;
  index: number;
  manager?: DragDropManager;
  draggable: boolean;
};

function SortableRow({ dragId, index, manager, draggable, children, className, ...props }: SortableRowProps) {
  const rowRef = React.useRef<HTMLTableRowElement | null>(null);
  const handleRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (!draggable || !manager || !rowRef.current) return undefined;

    const sortable = new Sortable(
      {
        id: dragId,
        index,
        element: rowRef.current,
        handle: handleRef.current ?? rowRef.current,
      },
      manager
    );

    return sortable.register();
  }, [dragId, draggable, index, manager]);

  return (
    <tr
      ref={rowRef}
      className={cn("border-b border-slate-300 bg-white transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800", className)}
      {...props}
    >
      {draggable ? (
        <td className="w-10 px-3 py-3 align-middle">
          <button
            ref={handleRef}
            type="button"
            className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:cursor-grabbing dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Kéo để sắp xếp"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </td>
      ) : null}
      {children}
    </tr>
  );
}

export function DataTable<TData>({
  data,
  columns,
  getRowId,
  loading = false,
  emptyTitle = "Không có dữ liệu",
  emptyDescription = "Chưa có mục nào để hiển thị.",
  className,
  enableSorting = true,
  enablePagination = false,
  initialPageSize = 10,
  onRowClick,
  onRowOrderChange,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const resolveRowId = React.useCallback(
    (row: TData, index: number) => getRowId?.(row, index) ?? String(index),
    [getRowId]
  );

  const manager = React.useMemo(
    () => (onRowOrderChange ? new DragDropManager() : undefined),
    [onRowOrderChange]
  );

  React.useEffect(() => {
    if (!manager || !onRowOrderChange) return undefined;

    const cleanup = manager.monitor.addEventListener("dragend", (event: DragEndEvent) => {
      if (event.canceled) return;

      const activeId = String(event.operation.source?.id ?? "");
      const overId = String(event.operation.target?.id ?? "");
      if (!activeId || !overId || activeId === overId) return;

      const fromIndex = data.findIndex((item, index) => resolveRowId(item, index) === activeId);
      const toIndex = data.findIndex((item, index) => resolveRowId(item, index) === overId);
      if (fromIndex < 0 || toIndex < 0) return;

      onRowOrderChange(moveItem(data, fromIndex, toIndex), activeId, overId);
    });

    return cleanup;
  }, [data, manager, onRowOrderChange, resolveRowId]);

  React.useEffect(() => () => manager?.destroy(), [manager]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    manualPagination: false,
  });

  const rows = table.getRowModel().rows;
  const isDraggable = Boolean(onRowOrderChange);
  const colSpan = columns.length + (isDraggable ? 1 : 0);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {isDraggable ? <th className="w-10 px-3 py-3" aria-label="Sắp xếp" /> : null}
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 text-left disabled:cursor-default"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: "↑",
                          desc: "↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={colSpan}>
                  <Loading />
                </td>
              </tr>
            ) : null}
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={colSpan}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : null}
            {!loading
              ? rows.map((row, visibleIndex) => (
                  <SortableRow
                    key={row.id}
                    dragId={row.id}
                    index={visibleIndex}
                    manager={manager}
                    draggable={isDraggable}
                    onClick={() => onRowClick?.(row.original)}
                    className={onRowClick ? "cursor-pointer" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-slate-800 dark:text-slate-100">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </SortableRow>
                ))
              : null}
          </tbody>
        </table>
      </div>
      {enablePagination ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          <span>
            Trang {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border-2 border-slate-400 px-3 py-1.5 text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Trước
            </button>
            <button
              type="button"
              className="rounded-lg border-2 border-slate-400 px-3 py-1.5 text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sau
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

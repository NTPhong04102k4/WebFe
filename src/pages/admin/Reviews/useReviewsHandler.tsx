import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useAllCarReviews,
  useServiceReviews,
} from "src/query/review/useReviewQueries";
import type { DateTimeRangeValue } from "src/components/common/DateTimePicker";

const PAGE_SIZE = 20;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-600"
          }`}
        />
      ))}
    </span>
  );
}

// Đã ẩn chức năng xóa đánh giá
// export type ConfirmDelete = { type: "car" | "service"; id: number };

export function useReviewsHandler() {
  const [tab, setTab] = useState<"car" | "service">("car");
  const [page, setPage] = useState(1);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateTimeRangeValue>({ fromDate: "", toDate: "" });

  const fromDate = dateRange.fromDate ? dateRange.fromDate.slice(0, 10) : undefined;
  const toDate = dateRange.toDate ? dateRange.toDate.slice(0, 10) : undefined;

  const carQ = useAllCarReviews({ page, pageSize: PAGE_SIZE, fromDate, toDate });
  const serviceQ = useServiceReviews({ page, pageSize: PAGE_SIZE, locationId: 0, fromDate, toDate });

  const carReviews = carQ.data?.data ?? [];
  const serviceReviews = serviceQ.data?.data ?? [];
  const carTotal = carQ.data?.totalCount ?? 0;
  const carPages = Math.max(1, Math.ceil(carTotal / PAGE_SIZE));

  const filter = <T extends { overallRating: number }>(list: T[]) =>
    list.filter((r) => starFilter == null || r.overallRating === starFilter);

  const avgRating = carReviews.length
    ? (carReviews.reduce((s, r) => s + r.overallRating, 0) / carReviews.length).toFixed(1)
    : "—";

  // Đã ẩn chức năng xóa đánh giá
  // const handleConfirmDelete = () => {
  //   if (!confirmDelete) return;
  //   const { type, id } = confirmDelete;
  //   setConfirmDelete(null);
  //   if (type === "car") {
  //     setDeletingCarId(id);
  //     deleteCarReview.mutate(id, {
  //       onSuccess: () => { notify.success("Đã xóa đánh giá"); setDeletingCarId(null); },
  //       onError:   () => setDeletingCarId(null),
  //     });
  //   } else {
  //     setDeletingServiceId(id);
  //     deleteServiceReview.mutate(id, {
  //       onSuccess: () => { notify.success("Đã xóa đánh giá dịch vụ"); setDeletingServiceId(null); },
  //       onError:   () => setDeletingServiceId(null),
  //     });
  //   }
  // };

  const carColumns = useMemo<ColumnDef<(typeof carReviews)[0]>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-slate-400">{(page - 1) * PAGE_SIZE + row.index + 1}</span>
      ),
    },
    {
      accessorKey: "carName",
      header: "Xe",
      cell: ({ getValue, row }) => (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {String(getValue() || `#${row.original.carID}`)}
        </span>
      ),
    },
    {
      accessorKey: "overallRating",
      header: "Rating",
      cell: ({ getValue }) => <StarRating rating={Number(getValue())} />,
    },
    {
      id: "content",
      header: "Tiêu đề / Nội dung",
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.title && (
            <p className="truncate font-medium text-slate-700 dark:text-slate-200">{row.original.title}</p>
          )}
          <p className="line-clamp-2 text-xs text-slate-400">
            {row.original.content.slice(0, 100)}{row.original.content.length > 100 ? "…" : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdDate",
      header: "Ngày",
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-400">
          {new Date(String(getValue())).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    // Đã ẩn cột hành động xóa đánh giá xe
    // {
    //   id: "actions",
    //   header: "Hành động",
    //   enableSorting: false,
    //   cell: ({ row }) => (
    //     <button
    //       onClick={() => setConfirmDelete({ type: "car", id: row.original.reviewID })}
    //       disabled={deletingCarId === row.original.reviewID}
    //       className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-400"
    //     >
    //       {deletingCarId === row.original.reviewID ? "Đang xóa..." : "Xóa"}
    //     </button>
    //   ),
    // },
  ], [page]);

  const serviceColumns = useMemo<ColumnDef<(typeof serviceReviews)[0]>[]>(() => [
    {
      id: "index",
      header: "#",
      cell: ({ row }) => (
        <span className="text-slate-400">{(page - 1) * PAGE_SIZE + row.index + 1}</span>
      ),
    },
    {
      accessorKey: "overallRating",
      header: "Rating",
      cell: ({ getValue }) => <StarRating rating={Number(getValue())} />,
    },
    {
      id: "content",
      header: "Nội dung",
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="line-clamp-2 text-xs text-slate-400">
            {row.original.content.slice(0, 100)}{row.original.content.length > 100 ? "…" : ""}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "createdDate",
      header: "Ngày",
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-400">
          {new Date(String(getValue())).toLocaleDateString("vi-VN")}
        </span>
      ),
    },
    // Đã ẩn cột hành động xóa đánh giá dịch vụ
    // {
    //   id: "actions",
    //   header: "Hành động",
    //   enableSorting: false,
    //   cell: ({ row }) => (
    //     <button
    //       onClick={() => setConfirmDelete({ type: "service", id: row.original.reviewID })}
    //       disabled={deletingServiceId === row.original.reviewID}
    //       className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-700 dark:text-red-400"
    //     >
    //       {deletingServiceId === row.original.reviewID ? "Đang xóa..." : "Xóa"}
    //     </button>
    //   ),
    // },
  ], [page]);

  return {
    tab, setTab,
    page, setPage,
    starFilter, setStarFilter,
    dateRange, setDateRange,
    carQ, serviceQ,
    carReviews: filter(carReviews),
    serviceReviews: filter(serviceReviews),
    carTotal, carPages,
    avgRating,
    serviceTotal: serviceQ.data?.totalCount ?? serviceReviews.length,
    carColumns,
    serviceColumns,
  };
}

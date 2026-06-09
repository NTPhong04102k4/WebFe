import { Star } from "lucide-react";
import { DataTable, Modal } from "src/components/core";
import { DateTimePicker } from "src/components/common/DateTimePicker";
import { useReviewsHandler } from "./useReviewsHandler";

export default function AdminReviewsPage() {
  const h = useReviewsHandler();

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Star className="h-6 w-6 text-amber-400" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quản lý đánh giá</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: "Đánh giá xe",      value: h.carTotal,      color: "text-blue-600"   },
          { label: "Đánh giá dịch vụ", value: h.serviceTotal,  color: "text-purple-600" },
          { label: "Điểm TB xe",       value: h.avgRating,     color: "text-amber-500"  },
        ].map((c) => (
          <div key={c.label} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs text-slate-400">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 w-fit dark:border-slate-700 dark:bg-slate-800">
        {(["car", "service"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { h.setTab(t); h.setPage(1); }}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              h.tab === t
                ? "bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {t === "car" ? "Đánh giá xe" : "Đánh giá dịch vụ"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">Sao:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => { h.setStarFilter(h.starFilter === s ? null : s); h.setPage(1); }}
                className={`rounded px-2 py-1 text-xs ${
                  h.starFilter === s
                    ? "bg-amber-100 font-medium text-amber-700"
                    : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {s}★
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <DateTimePicker
            label="Khoảng ngày"
            type="date"
            value={h.dateRange}
            onChange={(v) => { h.setDateRange(v); h.setPage(1); }}
            className="flex-1 min-w-[280px]"
          />
          {(h.dateRange.fromDate || h.dateRange.toDate) && (
            <button
              onClick={() => { h.setDateRange({ fromDate: "", toDate: "" }); h.setPage(1); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400"
            >
              Xóa lọc ngày
            </button>
          )}
        </div>
      </div>

      {h.tab === "car" && (
        <DataTable
          data={h.carReviews}
          columns={h.carColumns}
          loading={h.carQ.isLoading}
          getRowId={(row) => String(row.reviewID)}
          emptyTitle="Không có đánh giá nào"
          emptyDescription="Chưa có đánh giá xe phù hợp với bộ lọc."
        />
      )}

      {h.tab === "service" && (
        <DataTable
          data={h.serviceReviews}
          columns={h.serviceColumns}
          loading={h.serviceQ.isLoading}
          getRowId={(row) => String(row.reviewID)}
          emptyTitle="Không có đánh giá dịch vụ"
          emptyDescription="Chưa có đánh giá dịch vụ phù hợp với bộ lọc."
        />
      )}

      {h.tab === "car" && h.carPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Tổng {h.carTotal} · Trang {h.page}/{h.carPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={h.page <= 1}
              onClick={() => h.setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Trước
            </button>
            <button
              disabled={h.page >= h.carPages}
              onClick={() => h.setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      <Modal
        open={!!h.confirmDelete}
        title="Xác nhận xóa đánh giá"
        onClose={() => h.setConfirmDelete(null)}
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <button
              onClick={() => h.setConfirmDelete(null)}
              disabled={h.isConfirmDeleting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              Huỷ
            </button>
            <button
              onClick={h.handleConfirmDelete}
              disabled={h.isConfirmDeleting}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
            >
              Xóa
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Bạn có chắc muốn xóa đánh giá{h.confirmDelete?.type === "service" ? " dịch vụ" : ""} này?
          Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
}

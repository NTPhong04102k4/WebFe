import { useState } from "react";
import { Star } from "lucide-react";

import {
  useCustomerVehicles,
  useWorkOrderDetail,
  useWorkOrders,
} from "src/query/workshop/useWorkshopQueries";
import {
  useServiceReviewByWorkOrder,
  useReviewMutations,
} from "src/query/review/useReviewQueries";
import { notify } from "@/components/core/Feedback/toast";
import { useAuthStore } from "@/stores/authStore";

import shell from "../account-shell.module.scss";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(null)}
          className="p-0.5 focus:outline-none"
        >
          <Star className={`h-6 w-6 transition-colors ${s <= active ? "fill-amber-400 text-amber-400" : "fill-none text-slate-300"}`} />
        </button>
      ))}
      <span className="ml-1 self-center text-sm text-slate-500">{value}/5</span>
    </div>
  );
}

function ServiceReviewPanel({ workOrderId, technicianId, locationId }: {
  workOrderId: number;
  technicianId?: number | null;
  locationId?: number | null;
}) {
  const { data: existing, isLoading, error } = useServiceReviewByWorkOrder(workOrderId);
  const { createServiceReview, deleteServiceReview } = useReviewMutations();

  const [overallRating, setOverallRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [speedRating, setSpeedRating] = useState(5);
  const [attitudeRating, setAttitudeRating] = useState(5);
  const [content, setContent] = useState("");
  const [wouldRecommend, setWouldRecommend] = useState(true);

  if (isLoading) return <p className={shell.sub}>Đang kiểm tra đánh giá…</p>;

  // 404 = chưa review (error.response?.status === 404)
  const notYetReviewed = error != null || existing == null;

  if (!notYetReviewed && existing) {
    return (
      <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-700">Bạn đã đánh giá dịch vụ này</p>
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={`h-4 w-4 ${i < existing.overallRating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
          ))}
          <span className="ml-1 text-xs text-slate-500">{new Date(existing.createdDate).toLocaleDateString("vi-VN")}</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{existing.content}</p>
        {existing.responseFromShop && (
          <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-xs text-blue-700">
            <span className="font-medium">Phản hồi:</span> {existing.responseFromShop}
          </div>
        )}
        <button
          className="mt-3 rounded border border-red-300 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          disabled={deleteServiceReview.isPending}
          onClick={() => {
            if (!window.confirm("Xóa đánh giá này?")) return;
            deleteServiceReview.mutate(existing.reviewID, {
              onSuccess: () => notify.success("Đã xóa đánh giá"),
            });
          }}
        >
          Xóa đánh giá
        </button>
      </div>
    );
  }

  const submit = async () => {
    if (!content.trim()) {
      notify.info("Vui lòng nhập nội dung đánh giá");
      return;
    }
    try {
      await createServiceReview.mutateAsync({
        workOrderID: workOrderId,
        technicianID: technicianId ?? null,
        locationID: locationId ?? null,
        overallRating,
        qualityRating,
        speedRating,
        attitudeRating,
        content: content.trim(),
        wouldRecommend,
      });
      notify.success("Đã gửi đánh giá dịch vụ");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <p className="mb-3 text-sm font-medium text-slate-700">Đánh giá dịch vụ lần sửa này</p>

      <div className={shell.grid}>
        <div className={shell.field}>
          <label>Tổng thể</label>
          <StarPicker value={overallRating} onChange={setOverallRating} />
        </div>
        <div className={shell.field}>
          <label>Chất lượng sửa</label>
          <StarPicker value={qualityRating} onChange={setQualityRating} />
        </div>
        <div className={shell.field}>
          <label>Tốc độ</label>
          <StarPicker value={speedRating} onChange={setSpeedRating} />
        </div>
        <div className={shell.field}>
          <label>Thái độ KTV</label>
          <StarPicker value={attitudeRating} onChange={setAttitudeRating} />
        </div>
        <div className={shell.field} style={{ gridColumn: "1 / -1" }}>
          <label>Nhận xét</label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />
        </div>
        <div className={shell.field}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={(e) => setWouldRecommend(e.target.checked)}
            />
            <span>Tôi sẽ giới thiệu cho người khác</span>
          </label>
        </div>
      </div>

      <button
        type="button"
        className={`${shell.btn} ${shell.primary}`}
        disabled={createServiceReview.isPending}
        onClick={submit}
      >
        {createServiceReview.isPending ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </div>
  );
}

export default function WorkOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userID ?? user?.id;

  const { data: vehiclesRes } = useCustomerVehicles({ page: 1, pageSize: 100, userId: userID });
  const vehicles = vehiclesRes?.data ?? [];

  const [vehicleFilter, setVehicleFilter] = useState<number | "">("");
  const { data: woRes, isLoading } = useWorkOrders({
    page: 1,
    pageSize: 30,
    customerVehicleID: vehicleFilter === "" ? undefined : Number(vehicleFilter),
  });
  const rows = woRes?.data ?? [];

  const [openId, setOpenId] = useState<number | null>(null);
  const detailQuery = useWorkOrderDetail(openId);

  return (
    <section>
      <h2 className={shell.title}>Phiếu sửa chữa</h2>
      <p className={shell.sub}>Theo dõi phiếu công việc và gửi đánh giá sau khi hoàn tất.</p>

      <div className={shell.field} style={{ maxWidth: 400 }}>
        <label htmlFor="vf">Lọc theo xe</label>
        <select
          id="vf"
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">Tất cả xe</option>
          {vehicles.map((v) => (
            <option key={v.customerVehicleID} value={v.customerVehicleID}>
              {v.brandName} {v.modelName} — {v.vin}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className={shell.sub}>Đang tải…</p>}

      <div className={shell.tableWrap}>
        <table className={shell.table}>
          <thead>
            <tr>
              <th>Số phiếu</th>
              <th>Trạng thái</th>
              <th>Tổng tiền</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((w) => (
              <tr key={w.workOrderID}>
                <td>{w.workOrderNumber}</td>
                <td><span className={shell.badge}>{w.status}</span></td>
                <td>{w.totalAmount?.toLocaleString("vi-VN")} ₫</td>
                <td>
                  <button
                    type="button"
                    className={`${shell.btn} ${shell.secondary}`}
                    onClick={() => setOpenId(openId === w.workOrderID ? null : w.workOrderID)}
                  >
                    {openId === w.workOrderID ? "Đóng" : "Xem"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openId != null && (
        <div className={shell.card} style={{ marginTop: "1rem" }}>
          {detailQuery.isLoading && <p>Đang tải chi tiết…</p>}
          {detailQuery.data && (
            <>
              <p style={{ marginTop: 0 }}>
                <strong>{detailQuery.data.workOrderNumber}</strong> · {detailQuery.data.vehicleInfo ?? "—"}
              </p>
              <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                Thanh toán: {detailQuery.data.paymentStatus} · {detailQuery.data.totalAmount?.toLocaleString("vi-VN")} ₫
              </p>

              {detailQuery.data.status === "Completed" && (
                <ServiceReviewPanel
                  workOrderId={openId}
                  technicianId={(detailQuery.data as { technicianID?: number | null }).technicianID}
                  locationId={(detailQuery.data as { locationID?: number | null }).locationID}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

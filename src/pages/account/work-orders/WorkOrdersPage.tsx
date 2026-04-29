import React, { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useCustomerVehicles,
  useWorkOrderDetail,
  useWorkOrders,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useAuthStore } from "@/stores/authStore";

import shell from "../account-shell.module.scss";

type FeedbackForm = {
  rating: number;
  feedback: string;
};

export default function WorkOrdersPage() {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userID ?? user?.id;

  const { data: vehiclesRes } = useCustomerVehicles({
    page: 1,
    pageSize: 100,
    userId: userID,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const [vehicleFilter, setVehicleFilter] = useState<number | "">("");
  const { data: woRes, isLoading } = useWorkOrders({
    page: 1,
    pageSize: 30,
    customerVehicleID:
      vehicleFilter === "" ? undefined : Number(vehicleFilter),
  });
  const rows = woRes?.data ?? [];

  const [openId, setOpenId] = useState<number | null>(null);
  const { feedbackWorkOrder } = useWorkshopMutations();
  const { register, handleSubmit, reset } = useForm<FeedbackForm>({
    defaultValues: { rating: 5, feedback: "" },
  });
  const [msg, setMsg] = useState<string | null>(null);

  const detailQuery = useWorkOrderDetail(openId);

  const onFeedback = async (f: FeedbackForm) => {
    if (openId == null) return;
    setMsg(null);
    try {
      await feedbackWorkOrder.mutateAsync({
        id: openId,
        body: {
          rating: Number(f.rating),
          feedback: f.feedback || undefined,
        },
      });
      setMsg("Cảm ơn bạn đã đánh giá.");
      reset();
    } catch {
      setMsg("Gửi đánh giá thất bại.");
    }
  };

  return (
    <section>
      <h2 className={shell.title}>Phiếu sửa chữa</h2>
      <p className={shell.sub}>
        Theo dõi phiếu công việc và gửi đánh giá sau khi hoàn tất.
      </p>

      <div className={shell.field} style={{ maxWidth: 400 }}>
        <label htmlFor="vf">Lọc theo xe</label>
        <select
          id="vf"
          value={vehicleFilter}
          onChange={(e) =>
            setVehicleFilter(e.target.value === "" ? "" : Number(e.target.value))
          }
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
                <td>
                  <span className={shell.badge}>{w.status}</span>
                </td>
                <td>{w.totalAmount?.toLocaleString("vi-VN")} ₫</td>
                <td>
                  <button
                    type="button"
                    className={`${shell.btn} ${shell.secondary}`}
                    onClick={() =>
                      setOpenId(openId === w.workOrderID ? null : w.workOrderID)
                    }
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
                <strong>{detailQuery.data.workOrderNumber}</strong> ·{" "}
                {detailQuery.data.vehicleInfo ?? "—"}
              </p>
              <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                Thanh toán: {detailQuery.data.paymentStatus} ·{" "}
                {detailQuery.data.totalAmount?.toLocaleString("vi-VN")} ₫
              </p>
              {detailQuery.data.customerFeedback ? (
                <p className={shell.ok}>Bạn đã đánh giá: {detailQuery.data.customerRating}/5</p>
              ) : (
                <form onSubmit={handleSubmit(onFeedback)}>
                  <div className={shell.field}>
                    <label>Điểm (1–5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      {...register("rating", { valueAsNumber: true })}
                    />
                  </div>
                  <div className={shell.field}>
                    <label>Nhận xét</label>
                    <textarea {...register("feedback")} />
                  </div>
                  <button
                    type="submit"
                    className={`${shell.btn} ${shell.primary}`}
                    disabled={feedbackWorkOrder.isPending}
                  >
                    Gửi đánh giá
                  </button>
                  {msg && <p className={shell.ok}>{msg}</p>}
                </form>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

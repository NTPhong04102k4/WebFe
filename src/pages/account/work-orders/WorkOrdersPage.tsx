import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core/Table/DataTable";
import { Select } from "src/components/core/Select/Select";
import LoadingSpinner from "src/components/common/LoadingSpinner";
import type { WorkOrderViewModel } from "src/services/api/functions/workshop/workshop.types";

import { useWorkOrdersHandler } from "./useWorkOrdersHandler";
import { ServiceReviewPanel } from "./components/ServiceReviewPanel";
import shell from "../account-shell.module.scss";

export default function WorkOrdersPage() {
  const h = useWorkOrdersHandler();

  const columns = useMemo<ColumnDef<WorkOrderViewModel>[]>(
    () => [
      { accessorKey: "workOrderNumber", header: "Số phiếu" },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ getValue }) => <span className={shell.badge}>{getValue<string>()}</span>,
      },
      {
        accessorKey: "totalAmount",
        header: "Tổng tiền",
        cell: ({ getValue }) => `${getValue<number>()?.toLocaleString("vi-VN")} ₫`,
      },
      {
        id: "actions",
        header: "Chi tiết",
        cell: ({ row }) => (
          <button
            type="button"
            className={`${shell.btn} ${shell.secondary}`}
            onClick={() => h.toggleDetail(row.original.workOrderID)}
          >
            {h.openId === row.original.workOrderID ? "Đóng" : "Xem"}
          </button>
        ),
      },
    ],
    [h.openId, h.toggleDetail]
  );

  return (
    <section>
      <h2 className={shell.title}>Phiếu sửa chữa</h2>
      <p className={shell.sub}>Theo dõi phiếu công việc và gửi đánh giá sau khi hoàn tất.</p>

      <div style={{ maxWidth: 400 }}>
        <Select
          label="Lọc theo xe"
          options={h.vehicleOptions}
          placeholder="Tất cả xe"
          value={h.vehicleFilter}
          onChange={(e) => h.handleVehicleFilterChange(e.target.value)}
        />
      </div>

      <DataTable
        data={h.rows}
        columns={columns}
        loading={h.isLoading}
        emptyTitle="Chưa có phiếu sửa chữa"
        emptyDescription="Phiếu sẽ xuất hiện sau khi bạn đặt lịch hẹn."
      />

      {h.openId != null && (
        <div className={shell.card} style={{ marginTop: "1rem" }}>
          {h.detailLoading && <LoadingSpinner size="sm" />}
          {h.detailData && (
            <>
              <p style={{ marginTop: 0 }}>
                <strong>{h.detailData.workOrderNumber}</strong> · {h.detailData.vehicleInfo ?? "—"}
              </p>
              <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                Thanh toán: {h.detailData.paymentStatus} · {h.detailData.totalAmount?.toLocaleString("vi-VN")} ₫
              </p>

              {h.detailData.status === "Completed" && (
                <ServiceReviewPanel
                  workOrderId={h.openId}
                  technicianId={h.detailData.primaryTechnicianID}
                  locationId={h.detailData.locationID}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

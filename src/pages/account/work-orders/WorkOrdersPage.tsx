import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core/Table/DataTable";
import { Select } from "src/components/core/Select/Select";
import LoadingSpinner from "src/components/common/LoadingSpinner";
import type { WorkOrderViewModel } from "src/services/api/functions/workshop/workshop.types";

import { useWorkOrdersHandler } from "./useWorkOrdersHandler";
import { ServiceReviewPanel } from "./components/ServiceReviewPanel";
import shell from "../account-shell.module.scss";

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  Cash: "Tiền mặt",
  Transfer: "Chuyển khoản",
  Mixed: "Kết hợp",
};

function paymentMethodLabel(method?: string | null) {
  if (!method) return "—";
  return PAYMENT_METHOD_LABEL[method] ?? method;
}

function WorkOrderItemsPreview({ workOrder }: { workOrder: WorkOrderViewModel }) {
  const items = [
    ...(workOrder.services ?? []).map((s) => ({
      key: `svc-${s.workOrderServiceID}`,
      name: s.serviceName ?? `Dịch vụ #${s.serviceID}`,
      imagePath: null as string | null | undefined,
      quantity: 1,
      unitPrice: s.unitPrice,
    })),
    ...(workOrder.parts ?? []).map((p) => ({
      key: `part-${p.workOrderPartID}`,
      name: p.accessoryName ?? `Phụ tùng #${p.accessoryID}`,
      imagePath: p.accessoryImagePath,
      quantity: p.quantity,
      unitPrice: p.unitPrice,
    })),
  ];

  if (items.length === 0) return <span style={{ color: "#94a3b8" }}>—</span>;

  const visible = items.slice(0, 2);
  const remaining = items.length - visible.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 180 }}>
      {visible.map((item) => (
        <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {item.imagePath ? (
            <img
              src={item.imagePath}
              alt={item.name}
              style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", border: "1px solid #e2e8f0", flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f1f5f9", flexShrink: 0 }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 500, fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name}
            </p>
            <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
              x{item.quantity} · {item.unitPrice.toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>
      ))}
      {remaining > 0 && (
        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>+{remaining} mục khác</span>
      )}
    </div>
  );
}

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
        id: "items",
        header: "Dịch vụ / Phụ tùng",
        cell: ({ row }) => <WorkOrderItemsPreview workOrder={row.original} />,
      },
      {
        accessorKey: "paymentMethod",
        header: "Phương thức TT",
        cell: ({ getValue }) => paymentMethodLabel(getValue<string | null | undefined>()),
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

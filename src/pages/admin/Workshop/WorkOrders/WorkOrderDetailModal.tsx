import React from "react";
import type { WorkOrderViewModel } from "src/services/api/functions/workshop/workshop.types";

interface Props {
  workOrder: WorkOrderViewModel | null;
  onClose: () => void;
}

function formatVND(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

function formatDate(s?: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString("vi-VN");
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4">
      <span className="w-40 shrink-0 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="text-sm text-slate-800 dark:text-slate-200">{value ?? "—"}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function WorkOrderDetailModal({ workOrder, onClose }: Props) {
  if (!workOrder) return null;

  const wo = workOrder;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết phiếu ${wo.workOrderNumber}`}
    >
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Phiếu công việc</p>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {wo.workOrderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                wo.status === "Completed" || wo.status === "Closed"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : wo.status === "InProgress"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : wo.status === "OnHold"
                  ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {wo.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100 p-6 dark:divide-slate-700">
          {/* Basic info */}
          <Section title="Thông tin cơ bản">
            <InfoRow label="Xe khách hàng" value={wo.vehicleInfo} />
            <InfoRow label="Chi nhánh" value={wo.locationName} />
            <InfoRow label="Kỹ thuật viên" value={wo.primaryTechnicianName} />
            <InfoRow label="Cố vấn dịch vụ" value={wo.serviceAdvisorName} />
            <InfoRow label="Ưu tiên" value={wo.priority} />
            <InfoRow label="Km vào" value={wo.mileageIn?.toLocaleString("vi-VN")} />
            <InfoRow label="Km ra" value={wo.mileageOut?.toLocaleString("vi-VN")} />
            <InfoRow label="Bắt đầu" value={formatDate(wo.startDateTime)} />
            <InfoRow label="Hoàn thành" value={formatDate(wo.endDateTime)} />
            <InfoRow label="Triệu chứng KH" value={wo.customerComplaint} />
            <InfoRow label="Chẩn đoán" value={wo.diagnosis} />
            <InfoRow label="Công việc đã làm" value={wo.workPerformed} />
          </Section>

          {/* Services */}
          {wo.services && wo.services.length > 0 && (
            <Section title="Dịch vụ thực hiện">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                      <th className="pb-2 pr-4">Dịch vụ</th>
                      <th className="pb-2 pr-4">Thợ</th>
                      <th className="pb-2 pr-4">Giờ công</th>
                      <th className="pb-2 pr-4">Đơn giá</th>
                      <th className="pb-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {wo.services.map((s) => (
                      <tr key={s.workOrderServiceID}>
                        <td className="py-2 pr-4">{s.serviceName ?? s.serviceID}</td>
                        <td className="py-2 pr-4 text-slate-500">{s.technicianID ?? "—"}</td>
                        <td className="py-2 pr-4">{s.laborHours}h</td>
                        <td className="py-2 pr-4">{formatVND(s.unitPrice)}</td>
                        <td className="py-2">{formatVND(s.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Parts */}
          {wo.parts && wo.parts.length > 0 && (
            <Section title="Phụ tùng / vật tư">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-500 dark:text-slate-400">
                      <th className="pb-2 pr-4">Phụ tùng</th>
                      <th className="pb-2 pr-4">SL</th>
                      <th className="pb-2 pr-4">Đơn giá</th>
                      <th className="pb-2">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {wo.parts.map((p) => (
                      <tr key={p.workOrderPartID}>
                        <td className="py-2 pr-4">{p.accessoryName ?? p.accessoryID}</td>
                        <td className="py-2 pr-4">{p.quantity}</td>
                        <td className="py-2 pr-4">{formatVND(p.unitPrice)}</td>
                        <td className="py-2">{formatVND(p.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* Payment */}
          <Section title="Thanh toán">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <InfoRow label="Công lao động" value={formatVND(wo.laborCost)} />
              <InfoRow label="Phụ tùng" value={formatVND(wo.partsCost)} />
              <InfoRow label="Dịch vụ" value={formatVND(wo.serviceCost)} />
              <InfoRow label="Giảm giá" value={formatVND(wo.discountAmount)} />
              <InfoRow label="Thuế" value={formatVND(wo.taxAmount)} />
              <div className="col-span-2 mt-1 flex justify-between border-t border-slate-200 pt-2 dark:border-slate-600">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Tổng cộng
                </span>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {formatVND(wo.totalAmount)}
                </span>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <InfoRow label="Trạng thái TT" value={wo.paymentStatus} />
              <InfoRow label="Phương thức" value={wo.paymentMethod} />
              <InfoRow label="Ngày thanh toán" value={formatDate(wo.paidDate)} />
              {wo.customerRating != null && (
                <InfoRow
                  label="Đánh giá KH"
                  value={`${"★".repeat(wo.customerRating)}${"☆".repeat(5 - wo.customerRating)} (${wo.customerRating}/5)`}
                />
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

export default WorkOrderDetailModal;

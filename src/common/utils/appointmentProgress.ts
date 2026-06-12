import type { AppointmentViewModel } from "src/services/api/functions/workshop/workshop.types";

/** Luồng tiến độ tổng hợp: lịch hẹn → tiếp nhận xe → sửa chữa → bàn giao */
export const APPOINTMENT_PROGRESS_STEPS = [
  "Đặt lịch",
  "Xác nhận",
  "Đang sửa chữa",
  "Kiểm tra chất lượng",
  "Chờ bàn giao",
  "Đã giao xe",
];

/** Gộp trạng thái lịch hẹn + trạng thái phiếu sửa (nếu đã check-in) thành 1 chỉ số bước (0-based). */
export function appointmentProgressStepIndex(appt: AppointmentViewModel): number | null {
  if (appt.status === "Cancelled" || appt.status === "NoShow") return null;

  switch (appt.workOrderStatus) {
    case "Open":
      return 1;
    case "InProgress":
    case "WaitingParts":
      return 2;
    case "QualityCheck":
      return 3;
    case "Completed":
    case "AwaitingHandover":
      return 4;
    case "Delivered":
      return 5;
    case "Cancelled":
      return null;
    default:
      break;
  }

  switch (appt.status) {
    case "Pending":
    case "Scheduled":
      return 0;
    case "Confirmed":
    case "In-Progress":
      return 1;
    case "Completed":
      return 5;
    default:
      return 0;
  }
}

export function appointmentProgressCancelledLabel(appt: AppointmentViewModel): string | undefined {
  if (appt.workOrderStatus === "Cancelled") return "Phiếu sửa đã hủy";
  if (appt.status === "Cancelled") return "Lịch hẹn đã hủy";
  if (appt.status === "NoShow") return "Khách không đến";
  return undefined;
}

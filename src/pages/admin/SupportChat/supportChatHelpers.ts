import type { ConversationViewModel, StaffView } from "@/services/api/functions/chat/chat.api";

export const getCustomerDisplayName = (item?: ConversationViewModel | null): string => {
  if (!item) return "Khách ẩn danh";
  return (item as any).customerName || (item as any).customerUsername || "Khách ẩn danh";
};

export const VIEW_TABS: { key: StaffView; label: string }[] = [
  { key: "all",        label: "Tất cả" },
  { key: "open",       label: "Đang mở" },
  { key: "active",     label: "Đang xử lý" },
  { key: "closed",     label: "Đã đóng" },
  { key: "unassigned", label: "Hộp chung" },
  { key: "pending",    label: "Chờ tiếp nhận" },
  { key: "mine",       label: "Tôi phụ trách" },
];

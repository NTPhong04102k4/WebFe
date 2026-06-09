import { X } from "lucide-react";
import type { ConversationViewModel } from "@/services/api/functions/chat/chat.api";
import { getCustomerDisplayName } from "../supportChatHelpers";

interface Props {
  activeConversation: ConversationViewModel;
  onClose: () => void;
}

export function CustomerInfoSidebar({ activeConversation, onClose }: Props) {
  return (
    <div className="hidden lg:flex w-64 flex-col border-l border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 overflow-y-auto shrink-0 animate-in slide-in-from-right-5 duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Thông tin khách hàng</h4>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-col items-center text-center border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-650 text-xl font-bold dark:bg-blue-900 dark:text-blue-300 mb-2">
          {getCustomerDisplayName(activeConversation)[0]?.toUpperCase() || "?"}
        </div>
        <h5 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
          {activeConversation.customerName || "Chưa cập nhật tên"}
        </h5>
        {activeConversation.customerPhone && (
          <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">
            📞 {activeConversation.customerPhone}
          </p>
        )}
      </div>

      <div className="mt-4 space-y-3.5">
        {[
          { label: "Mã hội thoại", value: `#${activeConversation.conversationID}` },
          { label: "Chủ đề", value: activeConversation.subject },
          { label: "Phân loại", value: activeConversation.conversationType },
          { label: "Độ ưu tiên", value: activeConversation.priority },
          { label: "Nhân viên tiếp nhận", value: activeConversation.assignedStaffName || "Chưa phân công" },
          { label: "Ngày gửi yêu cầu", value: new Date(activeConversation.createdDate).toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
            <span className="text-xs text-slate-700 dark:text-slate-350 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { User } from "lucide-react";
import { FlatList } from "@/shared/components/FlatList";
import { Input } from "@/components/core/Form/Input";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import type { ConversationViewModel, StaffView } from "@/services/api/functions/chat/chat.api";
import { VIEW_TABS, getCustomerDisplayName } from "../supportChatHelpers";

interface Props {
  filteredList: ConversationViewModel[];
  loading: boolean;
  selectedId: number | null;
  activeView: StaffView;
  onViewChange: (v: StaffView) => void;
  search: string;
  onSearchChange: (v: string) => void;
  showOnlyMine: boolean;
  onToggleMine: () => void;
  pendingBadge: number;
  onSelect: (id: number) => void;
}

export function ConversationList({
  filteredList, loading, selectedId, activeView, onViewChange,
  search, onSearchChange, showOnlyMine, onToggleMine, pendingBadge, onSelect,
}: Props) {
  return (
    <div className="flex flex-col border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden h-[25vh] md:h-full shrink-0">

      {/* Search + mine toggle */}
      <div className="p-3 border-b border-slate-150 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0 space-y-2">
        <Input
          type="search"
          placeholder="Tìm khách hàng hoặc tiêu đề..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <button
          onClick={onToggleMine}
          className={`w-full flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
            showOnlyMine
              ? "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
          }`}
        >
          <User className="h-3.5 w-3.5" />
          {showOnlyMine ? "Đang lọc: Của tôi" : "Chỉ của tôi"}
        </button>
      </div>

      {/* View tabs */}
      <div className="flex overflow-x-auto gap-0.5 p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 shrink-0 scrollbar-none">
        {VIEW_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key)}
            className={`relative shrink-0 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
              activeView === key
                ? "bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            {label}
            {key === "pending" && pendingBadge > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {pendingBadge > 99 ? "99+" : pendingBadge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <LoadingSpinner size="sm" />
        </div>
      )}
      {!loading && filteredList.length === 0 && (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState title="Không tìm thấy cuộc trò chuyện nào." />
        </div>
      )}
      {!loading && filteredList.length > 0 && (
        <FlatList
          data={filteredList}
          keyExtractor={(item) => item.conversationID}
          estimateSize={() => 105}
          className="flex-1"
          renderItem={({ item }) => {
            const isSelected = selectedId === item.conversationID;
            const hasUnread = (item.unreadCountStaff ?? 0) > 0;
            const displayName = getCustomerDisplayName(item);
            const hasPendingAssign = !!item.pendingStaffID;

            return (
              <button
                className={`relative block w-full px-4 py-3.5 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-900/40 border-b border-slate-100 dark:border-slate-850 ${
                  isSelected ? "bg-blue-50/70 dark:bg-blue-950/20 border-l-4 border-blue-600 pl-3" : "pl-4"
                }`}
                onClick={() => onSelect(item.conversationID)}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`truncate text-sm font-medium dark:text-slate-200 ${
                    isSelected ? "text-blue-900 font-bold" : "text-slate-700"
                  } ${hasUnread ? "font-bold text-slate-950 dark:text-slate-100" : ""}`}>
                    {displayName}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    {hasPendingAssign && (
                      <span className="h-2 w-2 rounded-full bg-amber-400" title="Đang chờ xác nhận phân công" />
                    )}
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
                <p className={`mt-0.5 truncate text-xs ${hasUnread ? "font-semibold text-slate-900 dark:text-slate-200" : "text-slate-500"}`}>
                  {item.lastMessagePreview || item.subject}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${
                    item.assignedStaffName
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
                  }`}>
                    {item.assignedStaffName ? `NV: ${item.assignedStaffName}` : "Chờ phân công"}
                  </span>
                  {hasUnread && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                      {item.unreadCountStaff}
                    </span>
                  )}
                </div>
              </button>
            );
          }}
        />
      )}
    </div>
  );
}

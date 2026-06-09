import { MessageCircle } from "lucide-react";
import { useSupportChatHandler } from "./useSupportChatHandler";
import { AssignmentBanner } from "./components/AssignmentBanner";
import { CloseConversationModal } from "./components/CloseConversationModal";
import { ConversationList } from "./components/ConversationList";
import { ChatWindow } from "./components/ChatWindow";
import { CustomerInfoSidebar } from "./components/CustomerInfoSidebar";

export default function AdminSupportChatPage() {
  const h = useSupportChatHandler();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">

      {h.assignmentNotif && (
        <AssignmentBanner
          notif={h.assignmentNotif}
          onAccept={() => h.onRespondAssign(true)}
          onDecline={() => h.onRespondAssign(false)}
          disabled={h.respondAssignPending}
        />
      )}

      <CloseConversationModal
        open={h.showCloseModal}
        onClose={h.onCloseModal}
        rating={h.closeRating}
        onRatingChange={h.onRatingChange}
        feedback={h.closeFeedback}
        onFeedbackChange={h.onFeedbackChange}
        onConfirm={h.onConfirmClose}
        loading={h.closeConversationPending}
      />

      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Hỗ trợ trực tuyến</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Quản lý và phản hồi yêu cầu trợ giúp từ khách hàng</p>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col md:grid flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[340px_1fr]">

        <ConversationList
          filteredList={h.filteredList}
          loading={h.conversationsLoading}
          selectedId={h.selectedId}
          activeView={h.activeView}
          onViewChange={h.onViewChange}
          search={h.search}
          onSearchChange={h.onSearchChange}
          showOnlyMine={h.showOnlyMine}
          onToggleMine={h.onToggleMine}
          pendingBadge={h.pendingBadge}
          onSelect={h.onSelectConversation}
        />

        <div className="flex bg-slate-50/10 dark:bg-slate-950/10 overflow-hidden flex-1 min-h-0">
          {h.selectedId && h.activeConversation ? (
            <div className="flex flex-1 overflow-hidden">
              <ChatWindow
                activeConversation={h.activeConversation}
                messages={h.messages}
                pinnedMessage={h.pinnedMessage}
                isClosed={h.isClosed}
                isAssignedToMe={h.isAssignedToMe}
                messagesEndRef={h.messagesEndRef}
                scrollContainerRef={h.scrollContainerRef}
                showScrollBottomBtn={h.showScrollBottomBtn}
                onScroll={h.onScroll}
                scrollToBottom={h.scrollToBottom}
                isChatSearchOpen={h.isChatSearchOpen}
                onToggleChatSearch={h.onToggleChatSearch}
                chatSearchQuery={h.chatSearchQuery}
                onChatSearchChange={h.onChatSearchChange}
                currentMatchIndex={h.currentMatchIndex}
                matchingMessageIds={h.matchingMessageIds}
                onMatchIndexChange={h.onMatchIndexChange}
                isCustomerInfoOpen={h.isCustomerInfoOpen}
                onToggleCustomerInfo={h.onToggleCustomerInfo}
                message={h.message}
                onMessageChange={h.onMessageChange}
                onSendMessage={h.onSendMessage}
                onKeyDown={h.onKeyDown}
                sendMessagePending={h.sendMessagePending}
                onPin={h.onPin}
                onAssignSelf={h.onAssignSelf}
                assignSelfPending={h.assignSelfPending}
                onOpenCloseModal={h.onOpenCloseModal}
              />
              {h.isCustomerInfoOpen && (
                <CustomerInfoSidebar
                  activeConversation={h.activeConversation}
                  onClose={h.onToggleCustomerInfo}
                />
              )}
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-450 dark:text-slate-500 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 mb-4 text-slate-350 border border-slate-200/50">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-base mb-1">Kênh hỗ trợ khách hàng</h3>
              <p className="text-sm max-w-sm">Vui lòng chọn một cuộc trò chuyện từ danh sách hộp thư bên trái.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Modal } from "src/components/common";
import { useAdminUserSubscription } from "src/query/premium/usePremiumQueries";
import type { UserProfile } from "src/shared/types/Reponse/auth/user";

type UserDetailModalProps = {
  user: UserProfile | null;
  onClose: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function displayName(user: UserProfile) {
  return user.fullName || user.username || user.email || user.userID;
}

function PremiumSection({ userId }: { userId: string }) {
  const { data, isLoading } = useAdminUserSubscription(userId);

  if (isLoading) return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600 text-sm text-slate-500">
      Đang tải thông tin gói...
    </div>
  );

  if (!data?.hasActiveSubscription || !data.subscription) return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600 text-sm text-slate-500 dark:text-slate-400">
      Không có gói Premium nào đang hoạt động
    </div>
  );

  const sub = data.subscription;
  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Expired: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    Cancelled: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
    Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };
  const statusLabel: Record<string, string> = {
    Active: "Đang hoạt động", Expired: "Hết hạn", Cancelled: "Đã hủy", Pending: "Chờ xác nhận",
  };

  return (
    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          ✦ {sub.planName} ({sub.tier})
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[sub.status] ?? ""}`}>
          {statusLabel[sub.status] ?? sub.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
        <span>Loại: {sub.subscriptionType === "Monthly" ? "Tháng" : "Năm"}</span>
        <span>Còn lại: {sub.daysRemaining} ngày</span>
        <span>Bắt đầu: {formatDate(sub.startDate)}</span>
        <span>Hết hạn: {formatDate(sub.endDate)}</span>
        {sub.paymentMethod && <span className="col-span-2">Thanh toán: {sub.paymentMethod}</span>}
      </div>
    </div>
  );
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return (
    <Modal open={Boolean(user)} onClose={onClose} size="lg" title="Chi tiet nguoi dung">
      {user ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              {user.image ? (
                <img className="h-full w-full object-cover" src={user.image} alt={displayName(user)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold">
                  {displayName(user).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{displayName(user)}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailItem label="User ID" value={user.userID} />
            <DetailItem label="Ma user" value={user.userCode || "-"} />
            <DetailItem label="Email" value={user.email || "-"} />
            <DetailItem label="Phone" value={user.phone || "-"} />
            <DetailItem label="Email verified" value={user.emailVerified ? "Da xac thuc" : "Chua xac thuc"} />
            <DetailItem label="Phone verified" value={user.phoneVerified ? "Da xac thuc" : "Chua xac thuc"} />
            <DetailItem label="Trang thai" value={user.isActive ? "Dang hoat dong" : "Tam dung"} />
            <DetailItem label="Khoa tai khoan" value={user.isLocked ? `Co, den ${formatDate(user.lockUntil)}` : "Khong"} />
            <DetailItem label="Ngay tao" value={formatDate(user.createdDate)} />
            <DetailItem label="Cap nhat" value={formatDate(user.updatedDate)} />
            <DetailItem label="Dang nhap cuoi" value={formatDate(user.lastLoginDate)} />
            <DetailItem label="Login attempts" value={String(user.loginAttempts ?? 0)} />
          </div>

          <DetailItem label="Dia chi" value={user.address || "-"} />

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Gói Premium
            </div>
            <PremiumSection userId={user.userID} />
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

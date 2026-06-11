import { Modal } from "src/components/common";
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
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(date);
}

function displayName(user: UserProfile) {
  return user.fullName || user.username || user.email || user.userID;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      size="lg"
      title="Chi tiết người dùng"
    >
      {user ? (
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              {user.image ? (
                <img className="h-full w-full object-cover" src={user.image} alt={displayName(user)} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-100">
                  {displayName(user).charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{displayName(user)}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DetailItem label="User ID" value={String(user.userID)} />
            <DetailItem label="Mã user" value={user.userCode || "-"} />
            <DetailItem label="Email" value={user.email || "-"} />
            <DetailItem label="Username" value={user.username || "-"} />
            <DetailItem label="CMND / CCCD" value={(user as UserProfile & { identityNumber?: string }).identityNumber || "-"} />
            <DetailItem label="Phone" value={user.phone || "-"} />
            <DetailItem label="Email verified" value={user.emailVerified ? "Đã xác thực" : "Chưa xác thực"} />
            <DetailItem label="Phone verified" value={user.phoneVerified ? "Đã xác thực" : "Chưa xác thực"} />
            <DetailItem label="Trạng thái" value={user.isActive ? "Đang hoạt động" : "Tạm dừng"} />
            <DetailItem label="Khóa tài khoản" value={user.isLocked ? `Có, đến ${formatDate(user.lockUntil)}` : "Không"} />
            <DetailItem label="Ngày tạo" value={formatDate(user.createdDate)} />
            <DetailItem label="Cập nhật" value={formatDate(user.updatedDate)} />
            <DetailItem label="Đăng nhập cuối" value={formatDate(user.lastLoginDate)} />
            <DetailItem label="Login attempts" value={String(user.loginAttempts ?? 0)} />
          </div>
          <DetailItem label="Địa chỉ" value={user.address || "-"} />
        </div>
      ) : null}
    </Modal>
  );
}

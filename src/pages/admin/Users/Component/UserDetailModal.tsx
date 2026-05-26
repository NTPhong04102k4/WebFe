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

function PremiumSection() {
  return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600 text-sm text-slate-500 dark:text-slate-400">
      Thông tin gói Premium theo user chưa khả dụng (backend đang phát triển endpoint).
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
            <PremiumSection />

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

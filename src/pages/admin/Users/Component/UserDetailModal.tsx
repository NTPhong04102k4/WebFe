import { useState } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "src/components/common";
import { notify } from "src/components/core/Feedback/toast";
import { useAdminUserMutations } from "src/query/user/useUserQueries";
import type { AdminUserUpdateRequest } from "src/services/api/functions/user/Routes.Fn";
import type { UserProfile } from "src/shared/types/Reponse/auth/user";

// ─── Types ─────────────────────────────────────────────────────────────────

type UserDetailModalProps = {
  user: UserProfile | null;
  onClose: () => void;
};

type ConfirmAction = {
  title: string;
  message: string;
  onConfirm: () => void;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

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

// ─── ConfirmDialog ──────────────────────────────────────────────────────────

function ConfirmDialog({
  action,
  isPending,
  onCancel,
}: {
  action: ConfirmAction;
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{action.title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{action.message}</p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            onClick={action.onConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DetailItem ─────────────────────────────────────────────────────────────

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-300 p-3 dark:border-slate-600">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-100">{value}</div>
    </div>
  );
}

// ─── FormField ─────────────────────────────────────────────────────────────

function FormField({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls = "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100";

// ─── EditForm ───────────────────────────────────────────────────────────────

function EditForm({
  user,
  onCancel,
  onSaveRequest,
}: {
  user: UserProfile;
  onCancel: () => void;
  onSaveRequest: (data: AdminUserUpdateRequest) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminUserUpdateRequest>({
    defaultValues: {
      email: user.email ?? "",
      username: user.username ?? "",
      identityNumber: (user as UserProfile & { identityNumber?: string }).identityNumber ?? "",
      fullName: user.fullName ?? "",
      phone: user.phone ?? "",
      address: user.address ?? "",
      gender: user.gender ?? "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSaveRequest)} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <FormField label="Email" required error={errors.email?.message}>
          <input
            {...register("email", {
              required: "Email là bắt buộc",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Email không đúng định dạng" },
            })}
            className={inputCls}
            placeholder="user@example.com"
          />
        </FormField>

        <FormField label="Username" required error={errors.username?.message}>
          <input
            {...register("username", { required: "Username là bắt buộc" })}
            className={inputCls}
            placeholder="username"
          />
        </FormField>

        <FormField label="CMND / CCCD" required error={errors.identityNumber?.message}>
          <input
            {...register("identityNumber", { required: "IdentityNumber là bắt buộc" })}
            className={inputCls}
            placeholder="012345678901"
          />
        </FormField>

        <FormField label="Họ tên" error={errors.fullName?.message}>
          <input {...register("fullName")} className={inputCls} placeholder="Nguyễn Văn A" />
        </FormField>

        <FormField label="Số điện thoại" error={errors.phone?.message}>
          <input {...register("phone")} className={inputCls} placeholder="0912345678" />
        </FormField>

        <FormField label="Giới tính">
          <select {...register("gender")} className={inputCls}>
            <option value="">— Chọn —</option>
            <option value="Male">Nam</option>
            <option value="Female">Nữ</option>
            <option value="Other">Khác</option>
          </select>
        </FormField>

        <FormField label="Ngày sinh">
          <input {...register("dateOfBirth")} type="date" className={inputCls} />
        </FormField>
      </div>

      <FormField label="Địa chỉ">
        <input {...register("address")} className={inputCls} placeholder="123 Đường ABC, Quận 1" />
      </FormField>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
          Hủy
        </button>
        <button type="submit"
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Lưu thay đổi
        </button>
      </div>
    </form>
  );
}

// ─── UserDetailModal ────────────────────────────────────────────────────────

export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const { update, remove } = useAdminUserMutations();

  const isPending = update.isPending || remove.isPending;

  const handleCloseConfirm = () => setConfirm(null);

  const handleSaveRequest = (data: AdminUserUpdateRequest) => {
    if (!user) return;
    setConfirm({
      title: "Xác nhận cập nhật",
      message: `Bạn có chắc muốn cập nhật thông tin người dùng "${displayName(user)}"?`,
      onConfirm: () => {
        update.mutate(
          { id: user.userID, data },
          {
            onSuccess: () => {
              notify.success("Cập nhật thành công");
              setConfirm(null);
              setEditing(false);
            },
          }
        );
      },
    });
  };

  const handleDeleteRequest = () => {
    if (!user) return;
    setConfirm({
      title: "Xác nhận xóa người dùng",
      message: `Hành động này không thể hoàn tác. Bạn có chắc muốn xóa người dùng "${displayName(user)}"?`,
      onConfirm: () => {
        remove.mutate(user.userID, {
          onSuccess: () => {
            notify.success("Đã xóa người dùng");
            setConfirm(null);
            onClose();
          },
        });
      },
    });
  };

  const handleClose = () => {
    setEditing(false);
    setConfirm(null);
    onClose();
  };

  return (
    <>
      <Modal
        open={Boolean(user)}
        onClose={handleClose}
        size="lg"
        title={editing ? "Chỉnh sửa người dùng" : "Chi tiết người dùng"}
      >
        {user ? (
          <div className="space-y-5">
            {/* Avatar + tên */}
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
              {!editing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={handleDeleteRequest}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <EditForm
                user={user}
                onCancel={() => setEditing(false)}
                onSaveRequest={handleSaveRequest}
              />
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : null}
      </Modal>

      {confirm && (
        <ConfirmDialog
          action={confirm}
          isPending={isPending}
          onCancel={handleCloseConfirm}
        />
      )}
    </>
  );
}

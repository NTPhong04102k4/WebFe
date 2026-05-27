import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { notify } from "@/components/core/Feedback/toast";
import { useAuthStore } from "@/stores/authStore";
import {
  useMyProfile,
  useUpdateProfile,
  useChangePassword,
  profileEditSchema,
  changePasswordSchema,
  type ProfileEditValues,
  type ChangePasswordValues,
} from "@/query/user/useProfileQuery";
import {
  useMySubscription,
  usePremiumMutations,
} from "@/query/premium/usePremiumQueries";

// ─── Helpers ───────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

const ROLE_LABEL: Record<string, string> = {
  Customer: "Khách hàng",
  Admin: "Quản trị viên",
  SuperAdmin: "Super Admin",
  Staff: "Nhân viên",
};

const GENDER_LABEL: Record<string, string> = {
  Male: "Nam",
  Female: "Nữ",
  Other: "Khác",
};

// ─── Skeleton ──────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-56 rounded bg-slate-200" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AvatarSection ─────────────────────────────────────────────────────────

interface AvatarSectionProps {
  name: string;
  username: string;
  email: string;
  role: string;
  imageUrl?: string;
  onImageChange: (file: File) => void;
  isUploading: boolean;
}

function AvatarSection({
  name,
  username,
  email,
  role,
  imageUrl,
  onImageChange,
  isUploading,
}: AvatarSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  const avatarSrc = preview ?? imageUrl;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* Avatar */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-blue-100 hover:ring-blue-400"
            title="Đổi ảnh đại diện"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-blue-600 text-xl font-bold text-white">
                {getInitials(name)}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
          </button>
          {isUploading && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
              <svg
                className="h-4 w-4 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 truncate">{name}</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 truncate">
            @{username} · {email}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── InfoSection ───────────────────────────────────────────────────────────

interface InfoSectionProps {
  defaultValues: ProfileEditValues & { gender?: string; dateOfBirth?: string };
  onSave: (values: ProfileEditValues & { imageFile?: File }) => Promise<void>;
  isSaving: boolean;
}

function InfoSection({ defaultValues, onSave, isSaving }: InfoSectionProps) {
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues,
  });

  const handleCancel = () => {
    reset(defaultValues);
    setEditing(false);
  };

  const onSubmit = async (values: ProfileEditValues) => {
    await onSave(values);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Thông tin cá nhân</h2>
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Chỉnh sửa
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoRow label="Họ tên" value={defaultValues.fullName} />
          <InfoRow
            label="Số điện thoại"
            value={defaultValues.phone || "—"}
          />
          <InfoRow
            label="Địa chỉ"
            value={defaultValues.address || "—"}
            wide
          />
          <InfoRow
            label="Giới tính"
            value={
              defaultValues.gender
                ? (GENDER_LABEL[defaultValues.gender] ?? defaultValues.gender)
                : "—"
            }
          />
          <InfoRow
            label="Ngày sinh"
            value={
              defaultValues.dateOfBirth
                ? new Date(defaultValues.dateOfBirth).toLocaleDateString(
                    "vi-VN",
                  )
                : "—"
            }
          />
        </dl>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-200 bg-white p-6">
      <h2 className="font-semibold text-slate-900">Chỉnh sửa thông tin</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <FormField label="Họ và tên" error={errors.fullName?.message}>
          <input
            {...register("fullName")}
            className="input-base"
            placeholder="Nguyễn Văn A"
          />
        </FormField>

        <FormField label="Số điện thoại" error={errors.phone?.message}>
          <input
            {...register("phone")}
            className="input-base"
            placeholder="0912345678"
          />
        </FormField>

        <FormField label="Địa chỉ" error={errors.address?.message}>
          <input
            {...register("address")}
            className="input-base"
            placeholder="123 Đường ABC, Quận 1, TP.HCM"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Giới tính" error={errors.gender?.message}>
            <select {...register("gender")} className="input-base">
              <option value="">— Chọn —</option>
              <option value="Male">Nam</option>
              <option value="Female">Nữ</option>
              <option value="Other">Khác</option>
            </select>
          </FormField>

          <FormField label="Ngày sinh" error={errors.dateOfBirth?.message}>
            <input
              {...register("dateOfBirth")}
              type="date"
              className="input-base"
            />
          </FormField>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── ChangePasswordSection ─────────────────────────────────────────────────

function ChangePasswordSection() {
  const [open, setOpen] = useState(false);
  const { mutateAsync, isPending } = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await mutateAsync(values);
      notify.success("Đổi mật khẩu thành công!");
      reset();
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Bảo mật</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Thay đổi mật khẩu đăng nhập của bạn
          </p>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          {open ? "Đóng" : "Đổi mật khẩu"}
        </button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-4 space-y-4 border-t border-slate-100 pt-4"
        >
          <FormField
            label="Mật khẩu hiện tại"
            error={errors.currentPassword?.message}
          >
            <input
              {...register("currentPassword")}
              type="password"
              className="input-base"
              autoComplete="current-password"
            />
          </FormField>

          <FormField
            label="Mật khẩu mới"
            error={errors.newPassword?.message}
          >
            <input
              {...register("newPassword")}
              type="password"
              className="input-base"
              autoComplete="new-password"
            />
          </FormField>

          <FormField
            label="Xác nhận mật khẩu mới"
            error={errors.confirmPassword?.message}
          >
            <input
              {...register("confirmPassword")}
              type="password"
              className="input-base"
              autoComplete="new-password"
            />
          </FormField>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Đang đổi..." : "Xác nhận"}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); reset(); }}
              className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── SubscriptionSection (giữ nguyên từ code cũ) ──────────────────────────

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  Active: { label: "Đang hoạt động", cls: "bg-green-100 text-green-700" },
  Expired: { label: "Đã hết hạn", cls: "bg-red-100 text-red-700" },
  Cancelled: { label: "Đã hủy", cls: "bg-slate-100 text-slate-600" },
  Pending: { label: "Chờ xác nhận", cls: "bg-yellow-100 text-yellow-700" },
};

function SubscriptionSection() {
  const navigate = useNavigate();
  const subscription = useMySubscription();
  const { cancel, renew } = usePremiumMutations();

  const sub = subscription.data?.subscription;
  const hasActive = subscription.data?.hasActiveSubscription;

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => notify.success("Đã hủy gia hạn tự động."),
    });
  };

  const handleRenew = () => {
    renew.mutate(undefined, {
      onSuccess: () => notify.success("Gia hạn thành công!"),
    });
  };

  if (subscription.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-3 h-16 animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  if (!sub || !hasActive) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold text-slate-900">Gói thành viên</h2>
        <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <p className="text-sm text-slate-600">
            Bạn chưa đăng ký gói Premium nào.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Nâng cấp để mở khóa ưu tiên đăng tin, hỗ trợ 24/7 và trợ lý AI.
          </p>
          <button
            onClick={() => navigate("/premium")}
            className="mt-4 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Xem các gói Premium
          </button>
        </div>
      </div>
    );
  }

  const status =
    STATUS_LABELS[sub.status] ?? {
      label: sub.status,
      cls: "bg-slate-100 text-slate-600",
    };
  const endDate = new Date(sub.endDate).toLocaleDateString("vi-VN");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Gói thành viên</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-75">
              {sub.tier} ·{" "}
              {sub.subscriptionType === "Monthly" ? "Hàng tháng" : "Hàng năm"}
            </p>
            <p className="mt-1 text-xl font-bold">{sub.planName}</p>
          </div>
          <svg
            className="h-8 w-8 opacity-30"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/15 px-3 py-2">
            <p className="text-xs opacity-75">Hết hạn</p>
            <p className="mt-0.5 text-sm font-semibold">{endDate}</p>
          </div>
          <div className="rounded-lg bg-white/15 px-3 py-2">
            <p className="text-xs opacity-75">Còn lại</p>
            <p className="mt-0.5 text-sm font-semibold">
              {sub.daysRemaining} ngày
            </p>
          </div>
        </div>
      </div>

      {sub.features.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {sub.features.slice(0, 4).map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <svg
                className="h-4 w-4 shrink-0 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleRenew}
          disabled={renew.isPending}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {renew.isPending ? "Đang gia hạn..." : "Gia hạn gói"}
        </button>
        {sub.status === "Active" && sub.autoRenew && (
          <button
            onClick={handleCancel}
            disabled={cancel.isPending}
            className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {cancel.isPending ? "Đang hủy..." : "Hủy gia hạn"}
          </button>
        )}
        <button
          onClick={() => navigate("/premium")}
          className="rounded-lg border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Đổi gói
        </button>
      </div>

      {sub.autoRenew && sub.status === "Active" && (
        <p className="mt-3 text-xs text-slate-400">
          Gia hạn tự động vào {endDate}. Bạn có thể hủy bất kỳ lúc nào.
        </p>
      )}
    </div>
  );
}

// ─── Shared UI helpers ─────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-800">{value}</dd>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── ProfilePage ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateProfile();

  const isSocialAccount = !!(profileQuery.data as { idSocial?: string })
    ?.idSocial;

  // Avatar upload tức thì — tách mutation riêng để tối ưu UX
  const handleAvatarChange = async (file: File) => {
    try {
      await updateProfile.mutateAsync({ fullName: user?.fullName ?? "", imageFile: file });
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const handleSave = async (values: ProfileEditValues) => {
    try {
      await updateProfile.mutateAsync(values);
      notify.success("Cập nhật thông tin thành công!");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  // Dùng data từ Zustand làm fallback instant (từ localStorage khi F5)
  // profileQuery.data bổ sung các field mà JWT không có
  const profile = profileQuery.data;
  const displayName = user?.fullName || user?.username || "";
  const username = user?.username ?? "";
  const email = user?.email ?? "";
  const role = user?.role ?? "Customer";
  const imageUrl = user?.image ?? profile?.image ?? "";

  const defaultValues: ProfileEditValues & {
    gender?: string;
    dateOfBirth?: string;
  } = {
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? profile?.phone ?? "",
    address: user?.address ?? profile?.address ?? "",
    gender: (["Male", "Female", "Other"].includes(profile?.gender ?? "")
      ? profile?.gender
      : undefined) as "Male" | "Female" | "Other" | undefined,
    dateOfBirth:
      profile?.dateOfBirth
        ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
        : undefined,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      {/* Khi fetch lần đầu và chưa có Zustand data — hiếm vì persist */}
      {profileQuery.isLoading && !user ? (
        <div className="mt-6">
          <ProfileSkeleton />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Avatar + tên + role */}
          <AvatarSection
            name={displayName}
            username={username}
            email={email}
            role={role}
            imageUrl={imageUrl}
            onImageChange={handleAvatarChange}
            isUploading={updateProfile.isPending}
          />

          {/* Thông tin cá nhân */}
          {profileQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full rounded bg-slate-100" />
                ))}
              </div>
            </div>
          ) : (
            <InfoSection
              defaultValues={defaultValues}
              onSave={handleSave}
              isSaving={updateProfile.isPending}
            />
          )}

          {/* Đổi mật khẩu — ẩn nếu tài khoản social */}
          {!isSocialAccount && <ChangePasswordSection />}

          {/* Gói thành viên */}
          <SubscriptionSection />
        </div>
      )}
    </div>
  );
}

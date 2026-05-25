import { useNavigate } from "react-router-dom";
import { notify } from "@/components/core/Feedback/toast";
import { useMySubscription, usePremiumMutations } from "@/query/premium/usePremiumQueries";

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
      onError: () => notify.error("Hủy thất bại. Vui lòng thử lại."),
    });
  };

  const handleRenew = () => {
    renew.mutate(undefined, {
      onSuccess: () => notify.success("Gia hạn thành công!"),
      onError: () => notify.error("Gia hạn thất bại. Vui lòng thử lại."),
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

  const status = STATUS_LABELS[sub.status] ?? { label: sub.status, cls: "bg-slate-100 text-slate-600" };
  const endDate = new Date(sub.endDate).toLocaleDateString("vi-VN");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Gói thành viên</h2>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider opacity-75">
              {sub.tier} · {sub.subscriptionType === "Monthly" ? "Hàng tháng" : "Hàng năm"}
            </p>
            <p className="mt-1 text-xl font-bold">{sub.planName}</p>
          </div>
          <svg className="h-8 w-8 opacity-30" fill="currentColor" viewBox="0 0 24 24">
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
            <p className="mt-0.5 text-sm font-semibold">{sub.daysRemaining} ngày</p>
          </div>
        </div>
      </div>

      {/* Features */}
      {sub.features.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {sub.features.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
              <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
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

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      <div className="mt-6 space-y-4">
        {/* Placeholder cho thông tin user — mở rộng sau */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Thông tin tài khoản</h2>
          <p className="mt-2 text-sm text-slate-500">
            Tính năng chỉnh sửa thông tin cá nhân đang được xây dựng.
          </p>
        </div>

        <SubscriptionSection />
      </div>
    </div>
  );
}

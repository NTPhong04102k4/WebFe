import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send } from "lucide-react";

import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import { useAuthStore } from "@/stores/authStore";
import { notify } from "@/components/core/Feedback/toast";

export function CarInquiryForm({ carID }: { carID: number }) {
  const user = useAuthStore((s) => s.user);
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () =>
      carRouteFn.createInquiry(carID, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: user?.email,
        message: message.trim() || null,
      }),
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: () => {
      notify.error("Không thể gửi yêu cầu. Vui lòng thử lại.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      notify.error("Vui lòng nhập họ tên và số điện thoại");
      return;
    }
    mutation.mutate();
  };

  if (submitted) {
    return (
      <div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700">
        Đã ghi nhận thông tin của bạn. Nhân viên sẽ liên hệ bạn sớm.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">
        Xe hiện không thể đặt mua. Để lại thông tin, nhân viên sẽ liên hệ tư vấn xe tương tự.
      </p>
      <input
        type="text"
        placeholder="Họ và tên"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <textarea
        placeholder="Ghi chú (không bắt buộc)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {mutation.isPending ? "Đang gửi..." : "Đăng ký quan tâm"}
      </button>
    </form>
  );
}

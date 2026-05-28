import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/core";
import { notify } from "@/components/core/Feedback/toast";
import {
  useChangePassword,
  changePasswordSchema,
  type ChangePasswordValues,
} from "@/query/user/useProfileQuery";

export function ChangePasswordSection() {
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
          <Input
            label="Mật khẩu hiện tại"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />

          <Input
            label="Mật khẩu mới"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />

          <Input
            label="Xác nhận mật khẩu mới"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

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

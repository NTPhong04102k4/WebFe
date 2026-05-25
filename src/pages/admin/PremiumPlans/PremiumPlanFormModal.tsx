import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { useAdminPremiumMutations } from "src/query/premium/usePremiumQueries";
import type { PremiumPlan, PremiumPlanCreateRequest } from "src/services/api/functions/premium/premium.types";

type Props = {
  open: boolean;
  editingPlan: PremiumPlan | null;
  onClose: () => void;
};

const emptyForm = (): PremiumPlanCreateRequest => ({
  planName: "",
  tier: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  features: [],
  isActive: true,
  maxListings: null,
  prioritySupport: false,
  aiChatAccess: false,
});

export function PremiumPlanFormModal({ open, editingPlan, onClose }: Props) {
  const { createPlan, updatePlan } = useAdminPremiumMutations();
  const [form, setForm] = useState<PremiumPlanCreateRequest>(emptyForm());
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingPlan) {
      setForm({
        planName: editingPlan.planName,
        tier: editingPlan.tier,
        description: editingPlan.description ?? "",
        monthlyPrice: editingPlan.monthlyPrice,
        yearlyPrice: editingPlan.yearlyPrice,
        features: [...editingPlan.features],
        isActive: editingPlan.isActive,
        maxListings: editingPlan.maxListings ?? null,
        prioritySupport: editingPlan.prioritySupport,
        aiChatAccess: editingPlan.aiChatAccess,
      });
    } else {
      setForm(emptyForm());
    }
    setNewFeature("");
  }, [open, editingPlan]);

  if (!open) return null;

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, features: [...f.features, trimmed] }));
    setNewFeature("");
  };

  const removeFeature = (idx: number) =>
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));

  const isPending = createPlan.isPending || updatePlan.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.planID, req: form });
        notify.success("Cập nhật gói Premium thành công");
      } else {
        await createPlan.mutateAsync(form);
        notify.success("Tạo gói Premium thành công");
      }
      onClose();
    } catch {
      notify.error("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-slate-900 max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-300 p-5 dark:border-slate-600">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {editingPlan ? "Chỉnh sửa gói Premium" : "Thêm gói Premium mới"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tên gói *</label>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.planName}
                onChange={(e) => setForm((f) => ({ ...f, planName: e.target.value }))}
                placeholder="VD: Gói Vàng"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mã tier *</label>
              <input
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                placeholder="VD: Gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Giá tháng (VND) *</label>
              <input
                required
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.monthlyPrice}
                onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Giá năm (VND) *</label>
              <input
                required
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.yearlyPrice}
                onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Giới hạn tin đăng</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.maxListings ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxListings: e.target.value ? Number(e.target.value) : null }))
                }
                placeholder="Để trống = không giới hạn"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
            <textarea
              rows={2}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.aiChatAccess}
                onChange={(e) => setForm((f) => ({ ...f, aiChatAccess: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Quyền truy cập AI Chat
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.prioritySupport}
                onChange={(e) => setForm((f) => ({ ...f, prioritySupport: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Hỗ trợ ưu tiên
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded"
              />
              Đang hoạt động
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tính năng</label>
            <div className="mb-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                placeholder="Nhập tính năng rồi nhấn Enter hoặc +"
              />
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {form.features.length > 0 && (
              <ul className="space-y-1">
                {form.features.map((f, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800">
                    <span className="text-slate-700 dark:text-slate-300">{f}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : editingPlan ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

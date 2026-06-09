import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { notify } from "src/components/core/Feedback/toast";
import { Modal, Input, Checkbox } from "src/components/core";
import { useAdminPremiumMutations } from "src/query/premium/usePremiumQueries";
import type { PremiumPlan, PremiumPlanCreateRequest } from "src/services/api/functions/premium/premium.types";
import { parsePlanFeatures } from "src/services/api/functions/premium/premium.types";

type Props = {
  open: boolean;
  editingPlan: PremiumPlan | null;
  onClose: () => void;
};

type FormState = Omit<PremiumPlanCreateRequest, "features"> & { featuresArr: string[] };

const emptyForm = (): FormState => ({
  planCode: "",
  planName: "",
  description: "",
  monthlyPrice: 0,
  yearlyPrice: 0,
  discountPercent: 0,
  maxCarsView: null,
  maxOrdersPerMonth: null,
  prioritySupport: false,
  isActive: true,
  featuresArr: [],
});

export function PremiumPlanFormModal({ open, editingPlan, onClose }: Props) {
  const { createPlan, updatePlan } = useAdminPremiumMutations();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingPlan) {
      setForm({
        planCode: editingPlan.planCode ?? "",
        planName: editingPlan.planName,
        description: editingPlan.description ?? "",
        monthlyPrice: editingPlan.monthlyPrice,
        yearlyPrice: editingPlan.yearlyPrice,
        discountPercent: editingPlan.discountPercent ?? 0,
        maxCarsView: editingPlan.maxCarsView ?? null,
        maxOrdersPerMonth: editingPlan.maxOrdersPerMonth ?? null,
        prioritySupport: editingPlan.prioritySupport,
        isActive: editingPlan.isActive,
        featuresArr: parsePlanFeatures(editingPlan.features),
      });
    } else {
      setForm(emptyForm());
    }
    setNewFeature("");
  }, [open, editingPlan]);

  const addFeature = () => {
    const trimmed = newFeature.trim();
    if (!trimmed) return;
    setForm((f) => ({ ...f, featuresArr: [...f.featuresArr, trimmed] }));
    setNewFeature("");
  };

  const removeFeature = (idx: number) =>
    setForm((f) => ({ ...f, featuresArr: f.featuresArr.filter((_, i) => i !== idx) }));

  const isPending = createPlan.isPending || updatePlan.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { featuresArr, ...rest } = form;
    const payload: PremiumPlanCreateRequest = { ...rest, features: JSON.stringify(featuresArr) };
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.planID, req: payload });
        notify.success("Đã cập nhật gói Premium");
      } else {
        await createPlan.mutateAsync(payload);
        notify.success("Đã tạo gói Premium mới");
      }
      onClose();
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <Modal
      open={open}
      title={editingPlan ? "Chỉnh sửa gói Premium" : "Thêm gói Premium mới"}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="premium-plan-form"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "Đang lưu..." : editingPlan ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      }
    >
      <form id="premium-plan-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Input
              label="Mã gói"
              required
              value={form.planCode}
              onChange={(e) => setForm((f) => ({ ...f, planCode: e.target.value }))}
              placeholder="VD: GOLD_PLAN (duy nhất, không đổi sau khi tạo)"
              disabled={!!editingPlan}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <Input
              label="Tên gói"
              required
              value={form.planName}
              onChange={(e) => setForm((f) => ({ ...f, planName: e.target.value }))}
              placeholder="VD: Gói Vàng"
            />
          </div>
          <div>
            <Input
              label="Giá tháng (VND)"
              required
              type="number"
              min={0}
              value={form.monthlyPrice}
              onChange={(e) => setForm((f) => ({ ...f, monthlyPrice: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Input
              label="Giá năm (VND)"
              required
              type="number"
              min={0}
              value={form.yearlyPrice}
              onChange={(e) => setForm((f) => ({ ...f, yearlyPrice: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Input
              label="Giới hạn xe xem"
              type="number"
              min={0}
              value={form.maxCarsView ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, maxCarsView: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Để trống = không giới hạn"
            />
          </div>
          <div>
            <Input
              label="Giới hạn đơn/tháng"
              type="number"
              min={0}
              value={form.maxOrdersPerMonth ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, maxOrdersPerMonth: e.target.value ? Number(e.target.value) : null }))}
              placeholder="Để trống = không giới hạn"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
          <textarea
            rows={2}
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-500 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
            value={form.description ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <div className="flex flex-wrap gap-4">
          <Checkbox
            label="Hỗ trợ ưu tiên (Priority Support)"
            checked={form.prioritySupport}
            onChange={(e) => setForm((f) => ({ ...f, prioritySupport: e.target.checked }))}
          />
          <Checkbox
            label="Đang hoạt động"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tính năng</label>
          <div className="mb-2 flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
              placeholder="Nhập tính năng rồi nhấn Enter hoặc +"
            />
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.featuresArr.length > 0 && (
            <ul className="space-y-1">
              {form.featuresArr.map((feat, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm dark:bg-slate-800">
                  <span className="text-slate-700 dark:text-slate-300">{feat}</span>
                  <button type="button" onClick={() => removeFeature(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </Modal>
  );
}

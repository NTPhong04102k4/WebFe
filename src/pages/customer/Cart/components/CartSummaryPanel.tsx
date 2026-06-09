import { Input } from "@/components/core/Form/Input";
import { Select } from "@/components/core/Select/Select";
import type { SelectOption } from "@/components/core/Select/Select";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type {
  ApplyPromoResult,
  InstallmentPlanViewModel,
  OrderPreviewResult,
} from "@/services/api/functions/orders/order.api";
import type { CartViewModel } from "@/services/api/functions/cart/cart.api";
import type { DisplayItem } from "../cartHelpers";

const PAYMENT_OPTIONS: SelectOption[] = [
  { value: "BANK_TRANSFER", label: "Chuyển khoản ngân hàng" },
  { value: "CASH", label: "Tiền mặt tại showroom" },
];

interface Props {
  previewResult: OrderPreviewResult | null;
  isCustomer: boolean;
  serverCart: CartViewModel | undefined;
  selectedItems: DisplayItem[];
  selectedTotal: number;
  previewIsPending: boolean;
  appliedPromo: ApplyPromoResult | null;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  hasCarInSelection: boolean;
  isInstallment: boolean;
  onInstallmentToggle: () => void;
  selectedCarTotal: number;
  installmentPlansLoading: boolean;
  installmentPlans: InstallmentPlanViewModel[];
  installmentMonths: number | null;
  onInstallmentMonthsChange: (months: number | null) => void;
  selectedPlan: InstallmentPlanViewModel | null;
  downPayment: string;
  onDownPaymentChange: (value: string) => void;
  downPaymentError: string | null;
  downPaymentNum: number;
  minDownPayment: number | null;
  promoCode: string;
  onPromoCodeChange: (value: string) => void;
  onApplyPromo: () => void;
  promoLoading: boolean;
  deliveryAddress: string;
  onDeliveryAddressChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  canCustomerCheckout: boolean;
  onCheckout: () => void;
  checkoutPending: boolean;
}

export default function CartSummaryPanel({
  previewResult,
  isCustomer,
  serverCart,
  selectedItems,
  selectedTotal,
  previewIsPending,
  appliedPromo,
  paymentMethod,
  onPaymentMethodChange,
  hasCarInSelection,
  isInstallment,
  onInstallmentToggle,
  selectedCarTotal,
  installmentPlansLoading,
  installmentPlans,
  installmentMonths,
  onInstallmentMonthsChange,
  selectedPlan,
  downPayment,
  onDownPaymentChange,
  downPaymentError,
  downPaymentNum,
  minDownPayment,
  promoCode,
  onPromoCodeChange,
  onApplyPromo,
  promoLoading,
  deliveryAddress,
  onDeliveryAddressChange,
  notes,
  onNotesChange,
  canCustomerCheckout,
  onCheckout,
  checkoutPending,
}: Props) {
  const installmentOptions: SelectOption[] = installmentPlansLoading
    ? [{ value: "__loading__", label: "Đang tải...", disabled: true }]
    : installmentPlans.map((p) => ({
        value: p.months,
        label: `${p.label} — ${p.annualRatePercent}%/năm`,
      }));

  return (
    <div className="sticky top-24 self-start rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-slate-900">Thanh toán</h2>

      <div className="mt-4 space-y-2">
        {previewResult ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tạm tính</span>
              <span>{formatCurrency(previewResult.subTotal)}</span>
            </div>
            {previewResult.taxAmount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Thuế (VAT)</span>
                <span>{formatCurrency(previewResult.taxAmount)}</span>
              </div>
            ) : null}
            {appliedPromo && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Mã {appliedPromo.code}</span>
                <span>- {formatCurrency(appliedPromo.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span className="text-slate-900">Tổng đơn thật</span>
              <span className="text-blue-700">
                {formatCurrency(appliedPromo ? appliedPromo.finalAmount : previewResult.totalAmount)}
              </span>
            </div>
          </>
        ) : isCustomer && serverCart && selectedItems.length === 0 ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Tạm tính (toàn giỏ)</span>
              <span>{formatCurrency(serverCart.subTotal)}</span>
            </div>
            {serverCart.taxAmount > 0 ? (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Thuế (VAT)</span>
                <span>{formatCurrency(serverCart.taxAmount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span className="text-slate-900">Tổng</span>
              <span className="text-blue-700">{formatCurrency(serverCart.totalAmount)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">
              Đã chọn ({selectedItems.length}){previewIsPending ? " ..." : ""}
            </span>
            <span className="font-semibold text-blue-700">{formatCurrency(selectedTotal)}</span>
          </div>
        )}
      </div>

      {!canCustomerCheckout ? (
        <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Vui lòng đăng nhập bằng tài khoản Customer để thanh toán.
        </div>
      ) : null}

      <div className="mt-4">
        <Select
          label="Phương thức thanh toán"
          options={PAYMENT_OPTIONS}
          value={paymentMethod}
          onChange={(e) => onPaymentMethodChange(e.target.value)}
        />
      </div>

      {hasCarInSelection && paymentMethod === "BANK_TRANSFER" && (
        <div className="mt-4 rounded-lg border border-slate-200 p-3">
          <div className="flex cursor-pointer items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Đăng ký trả góp</span>
            <button
              type="button"
              role="switch"
              aria-checked={isInstallment}
              onClick={onInstallmentToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isInstallment ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isInstallment ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {isInstallment && (
            <div className="mt-3 space-y-3">
              <div>
                <span className="text-xs text-slate-500">Giá trị xe chọn</span>
                <p className="font-semibold text-blue-700">{formatCurrency(selectedCarTotal)}</p>
              </div>

              <Select
                label="Kỳ hạn"
                options={installmentOptions}
                placeholder="-- Chọn kỳ hạn --"
                value={installmentMonths ?? ""}
                onChange={(e) =>
                  onInstallmentMonthsChange(e.target.value ? Number(e.target.value) : null)
                }
              />

              {selectedPlan && (
                <>
                  <Input
                    type="number"
                    label={`Tiền đặt cọc${minDownPayment ? ` (tối thiểu ${formatCurrency(minDownPayment)})` : ""}`}
                    min={minDownPayment ?? 0}
                    step={1000000}
                    placeholder="Nhập số tiền (VND)"
                    value={downPayment}
                    onChange={(e) => onDownPaymentChange(e.target.value)}
                    error={downPaymentError ?? undefined}
                  />

                  {selectedPlan.monthlyPayment && downPaymentNum >= (minDownPayment ?? 0) && (
                    <div className="rounded-lg bg-blue-50 p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Trả mỗi tháng</span>
                        <span className="font-semibold text-blue-700">
                          {formatCurrency(
                            downPaymentNum > 0
                              ? (() => {
                                  const principal = selectedCarTotal - downPaymentNum;
                                  const r = selectedPlan.annualRatePercent / 100 / 12;
                                  return principal > 0
                                    ? Math.round(
                                        (principal * r) /
                                          (1 - Math.pow(1 + r, -selectedPlan.months)),
                                      )
                                    : 0;
                                })()
                              : selectedPlan.monthlyPayment,
                          )}
                        </span>
                      </div>
                      {selectedPlan.totalRepayment && (
                        <div className="mt-1 flex justify-between text-xs text-slate-500">
                          <span>Tổng trả</span>
                          <span>{formatCurrency(selectedPlan.totalRepayment)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <span className="text-sm font-medium text-slate-700">Mã giảm giá</span>
        <div className="mt-1 flex gap-2">
          <div className="flex-1">
            <Input
              className="uppercase"
              placeholder="Nhập mã..."
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && void onApplyPromo()}
            />
          </div>
          <button
            type="button"
            disabled={promoLoading || !promoCode.trim()}
            onClick={() => void onApplyPromo()}
            className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {promoLoading ? "..." : "Áp dụng"}
          </button>
        </div>
        {appliedPromo && (
          <div className="mt-2 rounded-lg bg-green-50 px-3 py-2 text-sm">
            <div className="flex justify-between text-green-700">
              <span>{appliedPromo.description ?? appliedPromo.code}</span>
              <span>- {formatCurrency(appliedPromo.discountAmount)}</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold">
              <span className="text-slate-600">Sau giảm giá</span>
              <span className="text-blue-700">{formatCurrency(appliedPromo.finalAmount)}</span>
            </div>
          </div>
        )}
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Địa chỉ giao hàng</span>
        <textarea
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          value={deliveryAddress}
          onChange={(e) => onDeliveryAddressChange(e.target.value)}
        />
      </label>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-slate-700">Ghi chú</span>
        <textarea
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          rows={3}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </label>

      <button
        type="button"
        className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={checkoutPending || selectedItems.length === 0 || !canCustomerCheckout}
        onClick={onCheckout}
      >
        {checkoutPending ? "Đang tạo..." : `Thanh toán (${selectedItems.length})`}
      </button>
    </div>
  );
}

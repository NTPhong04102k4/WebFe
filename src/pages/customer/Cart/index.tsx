import { Link } from "react-router-dom";

import PremiumGateModal from "@/pages/customer/Premium/components/PremiumGateModal";
import { Checkbox } from "@/components/core/Form/Checkbox";
import EmptyState from "@/components/common/EmptyState";
import LoadingSpinner from "@/components/common/LoadingSpinner";

import { useCartHandler } from "./useCartHandler";
import CartItemCard from "./components/CartItemCard";
import CartSummaryPanel from "./components/CartSummaryPanel";

export default function CustomerCartPage() {
  const h = useCartHandler();

  if (h.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>
        <LoadingSpinner className="mt-12" />
      </div>
    );
  }

  return (
    <div className="min-w-[765px]">
      {h.showPremiumGate && (
        <PremiumGateModal
          featureTitle="Giới hạn đơn hàng"
          featureDescription="Bạn đã đạt giới hạn đơn hàng tháng này. Nâng cấp để tiếp tục mua sắm."
          onClose={() => h.setShowPremiumGate(false)}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>

        {h.items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white min-w-40 flex flex-col">
            <EmptyState
              title="Giỏ hàng đang trống"
              description="Thêm xe hoặc phụ kiện để bắt đầu."
              action={
                <div className="flex gap-3">
                  <Link
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
                    to="/cars"
                  >
                    Mua xe
                  </Link>
                  <Link
                    className="rounded-lg border px-4 py-2 text-sm font-medium"
                    to="/accessories"
                  >
                    Mua phụ kiện
                  </Link>
                </div>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Danh sách sản phẩm */}
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <Checkbox
                  checked={
                    h.selectedItemKeys.size === h.availableCount &&
                    h.availableCount > 0
                  }
                  onChange={h.toggleSelectAll}
                  label={
                    <span className="font-medium text-slate-700">
                      Chọn tất cả ({h.items.length} sản phẩm
                      {h.isCustomer && h.serverCart?.hasUnavailableItems
                        ? `, ${h.items.length - h.availableCount} không khả dụng`
                        : ""}
                      )
                    </span>
                  }
                />
              </div>

              <div className="space-y-3">
                {h.paginatedItems.map((item) => {
                  const key = `${item.type}-${item.id}`;
                  return (
                    <CartItemCard
                      key={key}
                      item={item}
                      isSelected={h.selectedItemKeys.has(key)}
                      onToggle={() => h.toggleItem(key)}
                      onRemove={() => h.handleRemove(item.type, item.id)}
                      onUpdateQuantity={(qty) =>
                        h.handleUpdateQuantity(item.type, item.id, qty)
                      }
                    />
                  );
                })}
              </div>

              {h.totalPages > 1 ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-6">
                  <p className="text-sm text-slate-700">
                    Trang <span className="font-medium">{h.currentPage}</span> /{" "}
                    <span className="font-medium">{h.totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        h.setCurrentPage((p) => Math.max(1, p - 1))
                      }
                      disabled={h.currentPage === 1}
                      className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        h.setCurrentPage((p) => Math.min(h.totalPages, p + 1))
                      }
                      disabled={h.currentPage === h.totalPages}
                      className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Panel thanh toán */}
            <CartSummaryPanel
              previewResult={h.previewResult}
              isCustomer={h.isCustomer}
              serverCart={h.serverCart}
              selectedItems={h.selectedItems}
              selectedTotal={h.selectedTotal}
              previewIsPending={h.previewIsPending}
              appliedPromo={h.appliedPromo}
              paymentMethod={h.paymentMethod}
              onPaymentMethodChange={h.handlePaymentMethodChange}
              hasCarInSelection={h.hasCarInSelection}
              isInstallment={h.isInstallment}
              onInstallmentToggle={h.handleInstallmentToggle}
              selectedCarTotal={h.selectedCarTotal}
              installmentPlansLoading={h.installmentPlansLoading}
              installmentPlans={h.installmentPlans}
              installmentMonths={h.installmentMonths}
              onInstallmentMonthsChange={h.handleInstallmentMonthsChange}
              selectedPlan={h.selectedPlan}
              downPayment={h.downPayment}
              onDownPaymentChange={h.setDownPayment}
              downPaymentError={h.downPaymentError}
              downPaymentNum={h.downPaymentNum}
              minDownPayment={h.minDownPayment}
              promoCode={h.promoCode}
              onPromoCodeChange={h.handlePromoCodeChange}
              onApplyPromo={h.handleApplyPromo}
              promoLoading={h.promoLoading}
              deliveryAddress={h.deliveryAddress}
              onDeliveryAddressChange={h.setDeliveryAddress}
              notes={h.notes}
              onNotesChange={h.setNotes}
              canCustomerCheckout={h.canCustomerCheckout}
              onCheckout={h.handleCheckout}
              checkoutPending={h.checkoutPending}
            />
          </div>
        )}
      </div>
    </div>
  );
}

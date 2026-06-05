import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PremiumGateModal from "@/pages/customer/Premium/components/PremiumGateModal";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { notify } from "@/components/core/Feedback/toast";
import {
  createOrderInputFromCart,
  createOrderPreviewInputFromCart,
  orderApi,
  type ApplyPromoResult,
  type InstallmentPlanViewModel,
  type OrderPreviewResult,
} from "@/services/api/functions/orders/order.api";
import { cartApi, type CartViewModel } from "@/services/api/functions/cart/cart.api";
import { cartKeys } from "@/query/cart/keys";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useCart } from "@/hooks/useCart";
import { useCartMutations } from "@/query/cart/useCartQueries";

// CartItem extended với availability info từ server
type DisplayItem = CartItem & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
};

function adaptServerCart(cart: CartViewModel | undefined): DisplayItem[] {
  if (!cart) return [];
  return [
    ...cart.cars.map((c) => ({
      type: "car" as const,
      id: c.carID,
      name: c.carName,
      price: c.salePrice,
      quantity: 1,
      isAvailable: c.isAvailable,
      unavailableReason: c.unavailableReason,
    })),
    ...cart.accessories.map((a) => ({
      type: "accessory" as const,
      id: a.accessoryID,
      name: a.accessoryName,
      price: a.unitPrice,
      quantity: a.quantity,
      isAvailable: true,
    })),
  ];
}

function getErrorMessage(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })
    ?.response;
  const message = response?.data?.message;
  if (response?.status === 401) return "Vui lòng đăng nhập lại để thanh toán.";
  if (response?.status === 403) return "Tài khoản hiện tại không có quyền thanh toán đơn khách.";
  if (response?.status === 422) return message ?? "Thông tin thanh toán không hợp lệ.";
  return message ?? (error instanceof Error ? error.message : "Không xử lý được yêu cầu.");
}

export default function CustomerCartPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { serverCart, serverCartQuery, isCustomer } = useCart();
  const mutations = useCartMutations();

  const localItems = useCartStore((s) => s.items);
  const localRemoveItem = useCartStore((s) => s.removeItem);
  const localUpdateQuantity = useCartStore((s) => s.updateQuantity);

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  // Nguồn dữ liệu: server (Customer) hoặc local (guest)
  // Phải memoize để tránh tạo array mới mỗi render — nếu không selectedItems thay đổi liên tục và kích hoạt preview loop
  const items: DisplayItem[] = useMemo(
    () => (isCustomer ? adaptServerCart(serverCart) : localItems),
    [isCustomer, serverCart, localItems],
  );

  const handleRemove = (type: "car" | "accessory", id: number) => {
    if (isCustomer) {
      type === "car" ? mutations.removeCar.mutate(id) : mutations.removeAccessory.mutate(id);
    } else {
      localRemoveItem(type, id);
    }
  };

  const handleUpdateQuantity = (type: "car" | "accessory", id: number, quantity: number) => {
    if (isCustomer) {
      if (quantity <= 0) {
        type === "car" ? mutations.removeCar.mutate(id) : mutations.removeAccessory.mutate(id);
      } else if (type === "accessory") {
        mutations.updateItem.mutate({ itemType: "accessory", itemId: id, quantity });
      }
    } else {
      localUpdateQuantity(type, id, quantity);
    }
  };

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ApplyPromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [previewResult, setPreviewResult] = useState<OrderPreviewResult | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 5;
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canCustomerCheckout = Boolean(accessToken) && user?.role === "Customer";

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemKeys.has(`${item.type}-${item.id}`)),
    [items, selectedItemKeys],
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );

  const selectedCarTotal = useMemo(
    () =>
      selectedItems
        .filter((i) => i.type === "car")
        .reduce((sum, i) => sum + i.price, 0),
    [selectedItems],
  );
  const hasCarInSelection = selectedCarTotal > 0;

  const downPaymentNum = parseFloat(downPayment.replace(/\D/g, "")) || 0;

  const installmentPlansQuery = useQuery({
    queryKey: ["installment-plans", selectedCarTotal, downPaymentNum],
    queryFn: () =>
      orderApi.installmentPlans(
        selectedCarTotal > 0 ? selectedCarTotal : undefined,
        downPaymentNum > 0 ? downPaymentNum : undefined,
      ),
    enabled: isInstallment && hasCarInSelection,
    staleTime: 5 * 60 * 1000,
  });

  const installmentPlans: InstallmentPlanViewModel[] = installmentPlansQuery.data ?? [];

  const selectedPlan = installmentPlans.find((p) => p.months === installmentMonths) ?? null;

  const minDownPayment = selectedPlan?.minDownPayment ?? null;
  const downPaymentError =
    selectedPlan && minDownPayment !== null && downPaymentNum < minDownPayment
      ? `Tối thiểu ${formatCurrency(minDownPayment)} (${selectedPlan.minDownPaymentPct}%)`
      : null;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    const total = previewResult?.totalAmount ?? selectedTotal;
    if (total <= 0) { notify.error("Vui lòng chọn sản phẩm trước khi áp dụng mã."); return; }
    setPromoLoading(true);
    try {
      const result = await orderApi.applyPromo(promoCode.trim(), total);
      setAppliedPromo(result ?? null);
      if (result) notify.success(`Áp dụng thành công! Giảm ${formatCurrency(result.discountAmount)}`);
    } catch {
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const preview = useMutation({
    mutationFn: (vars: { items: CartItem[] }) =>
      orderApi.preview(createOrderPreviewInputFromCart(vars.items)),
    onSuccess: setPreviewResult,
    onError: () => setPreviewResult(null),
  });

  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (selectedItems.length === 0 || !canCustomerCheckout) {
      setPreviewResult(null);
      return;
    }
    previewTimerRef.current = setTimeout(
      () => preview.mutate({ items: selectedItems }),
      400,
    );
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [canCustomerCheckout, selectedItems]);

  const createOrder = useMutation({
    mutationFn: async () => {
      if (selectedItems.length === 0) {
        throw new Error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      }
      if (!canCustomerCheckout) {
        throw new Error("Vui lòng đăng nhập bằng tài khoản Customer để thanh toán.");
      }
      const latestPreview = await orderApi.preview(
        createOrderPreviewInputFromCart(selectedItems),
      );
      if (isInstallment) {
        if (!installmentMonths) throw new Error("Vui lòng chọn kỳ hạn trả góp.");
        if (downPaymentNum <= 0) throw new Error("Vui lòng nhập số tiền đặt cọc.");
        if (downPaymentError) throw new Error(downPaymentError);
      }
      return orderApi.create(
        createOrderInputFromCart(selectedItems, {
          paymentMethod,
          isInstallment,
          installmentMonths: isInstallment ? installmentMonths : null,
          downPayment: isInstallment ? downPaymentNum : null,
          deliveryAddress: deliveryAddress.trim() || null,
          notes: notes.trim() || null,
          previewToken: latestPreview.previewToken,
        }),
      );
    },
    onSuccess: async (result) => {
      if (isCustomer) {
        // Xóa các item đã checkout khỏi server cart
        await Promise.allSettled(
          selectedItems.map((item) =>
            item.type === "car"
              ? cartApi.removeCar(item.id)
              : cartApi.removeAccessory(item.id),
          ),
        );
        qc.invalidateQueries({ queryKey: cartKeys.all });
      } else {
        selectedItems.forEach((item) => localRemoveItem(item.type, item.id));
      }
      setSelectedItemKeys(new Set());
      notify.success("Đã tạo đơn hàng");
      navigate(
        result?.order?.orderNumber ? `/orders/${result.order.orderNumber}` : "/orders",
      );
    },
    onError: (error: unknown) => {
      const code = (error as { response?: { data?: { errorCode?: string } } })?.response?.data
        ?.errorCode;
      if (code === "OrderLimitExceeded") {
        setShowPremiumGate(true);
      }
      // interceptor đã show error toast
    },
  });

  const toggleSelectAll = () => {
    // Chỉ cho chọn item available
    const availableItems = items.filter((i) => i.isAvailable !== false);
    setSelectedItemKeys((current) =>
      current.size === availableItems.length && availableItems.length > 0
        ? new Set()
        : new Set(availableItems.map((item) => `${item.type}-${item.id}`)),
    );
  };

  const toggleItem = (key: string) => {
    setSelectedItemKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Loading state cho server cart
  if (isCustomer && serverCartQuery.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>
        <div className="mt-6 flex justify-center py-12 text-slate-500">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  const availableCount = items.filter((i) => i.isAvailable !== false).length;

  return (
    <>
      {showPremiumGate && (
        <PremiumGateModal
          featureTitle="Giới hạn đơn hàng"
          featureDescription="Bạn đã đạt giới hạn đơn hàng tháng này. Nâng cấp để tiếp tục mua sắm."
          onClose={() => setShowPremiumGate(false)}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>

        {items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">Giỏ hàng đang trống.</p>
            <div className="mt-4 flex justify-center gap-3">
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
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-slate-300"
                  checked={selectedItemKeys.size === availableCount && availableCount > 0}
                  onChange={toggleSelectAll}
                />
                <span className="font-medium text-slate-700">
                  Chọn tất cả ({items.length} sản phẩm
                  {isCustomer && serverCart?.hasUnavailableItems
                    ? `, ${items.length - availableCount} không khả dụng`
                    : ""}
                  )
                </span>
              </div>

              <div className="space-y-3">
                {paginatedItems.map((item) => {
                  const key = `${item.type}-${item.id}`;
                  const isSelected = selectedItemKeys.has(key);
                  const isCar = item.type === "car";
                  const unavailable = item.isAvailable === false;

                  return (
                    <div
                      key={key}
                      className={`flex gap-4 rounded-xl border bg-white p-4 ${
                        unavailable ? "border-red-200 opacity-75" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-5 w-5 rounded border-slate-300"
                          checked={isSelected}
                          disabled={unavailable}
                          onChange={() => !unavailable && toggleItem(key)}
                        />
                      </div>
                      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {item.imagePath ? (
                          <img
                            className="h-full w-full object-cover"
                            src={item.imagePath}
                            alt={item.name}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium uppercase text-slate-500">
                          {isCar ? "Xe" : "Phụ kiện"}
                        </div>
                        <h2 className="mt-1 font-semibold text-slate-900">{item.name}</h2>
                        {unavailable ? (
                          <p className="mt-1 text-xs text-red-600">
                            {item.unavailableReason ?? "Không còn khả dụng"}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            {formatCurrency(item.price)}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          {!isCar ? (
                            <>
                              <button
                                type="button"
                                className="h-8 w-8 rounded border"
                                onClick={() =>
                                  handleUpdateQuantity(item.type, item.id, item.quantity - 1)
                                }
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button
                                type="button"
                                className="h-8 w-8 rounded border"
                                onClick={() =>
                                  handleUpdateQuantity(item.type, item.id, item.quantity + 1)
                                }
                              >
                                +
                              </button>
                            </>
                          ) : (
                            <span className="text-sm text-slate-500">Số lượng: 1</span>
                          )}
                          <button
                            type="button"
                            className="ml-3 text-sm text-red-600"
                            onClick={() => handleRemove(item.type, item.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                      <div className="text-right font-semibold text-slate-900">
                        {unavailable ? (
                          <span className="text-sm text-red-500">Không khả dụng</span>
                        ) : (
                          formatCurrency(item.price * item.quantity)
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 sm:px-6">
                  <p className="text-sm text-slate-700">
                    Trang <span className="font-medium">{currentPage}</span> /{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Thanh toán panel */}
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
                        {formatCurrency(appliedPromo
                          ? appliedPromo.finalAmount
                          : previewResult.totalAmount)}
                      </span>
                    </div>
                  </>
                ) : isCustomer && serverCart && selectedItems.length === 0 ? (
                  // Hiện tổng toàn giỏ từ server khi chưa chọn item
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
                      <span className="text-blue-700">
                        {formatCurrency(serverCart.totalAmount)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">
                      Đã chọn ({selectedItems.length})
                      {preview.isPending ? " ..." : ""}
                    </span>
                    <span className="font-semibold text-blue-700">
                      {formatCurrency(selectedTotal)}
                    </span>
                  </div>
                )}
              </div>

              {!canCustomerCheckout ? (
                <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                  Vui lòng đăng nhập bằng tài khoản Customer để thanh toán.
                </div>
              ) : null}

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Phương thức thanh toán</span>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={paymentMethod}
                  onChange={(event) => {
                    setPaymentMethod(event.target.value);
                    if (event.target.value !== "BANK_TRANSFER") setIsInstallment(false);
                  }}
                >
                  <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                  <option value="CASH">Tiền mặt tại showroom</option>
                </select>
              </label>

              {/* Trả góp — chỉ hiện khi có xe trong giỏ */}
              {hasCarInSelection && paymentMethod === "BANK_TRANSFER" && (
                <div className="mt-4 rounded-lg border border-slate-200 p-3">
                  <label className="flex cursor-pointer items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Đăng ký trả góp</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isInstallment}
                      onClick={() => {
                        setIsInstallment((v) => !v);
                        setInstallmentMonths(null);
                        setDownPayment("");
                      }}
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
                  </label>

                  {isInstallment && (
                    <div className="mt-3 space-y-3">
                      <div>
                        <span className="text-xs text-slate-500">Giá trị xe chọn</span>
                        <p className="font-semibold text-blue-700">{formatCurrency(selectedCarTotal)}</p>
                      </div>

                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">Kỳ hạn</span>
                        <select
                          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                          value={installmentMonths ?? ""}
                          onChange={(e) => {
                            setInstallmentMonths(e.target.value ? Number(e.target.value) : null);
                            setDownPayment("");
                          }}
                        >
                          <option value="">-- Chọn kỳ hạn --</option>
                          {installmentPlansQuery.isLoading ? (
                            <option disabled>Đang tải...</option>
                          ) : (
                            installmentPlans.map((p) => (
                              <option key={p.months} value={p.months}>
                                {p.label} — {p.annualRatePercent}%/năm
                              </option>
                            ))
                          )}
                        </select>
                      </label>

                      {selectedPlan && (
                        <>
                          <label className="block">
                            <span className="text-xs font-medium text-slate-600">
                              Tiền đặt cọc
                              {minDownPayment ? ` (tối thiểu ${formatCurrency(minDownPayment)})` : ""}
                            </span>
                            <input
                              type="number"
                              min={minDownPayment ?? 0}
                              step={1000000}
                              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm ${
                                downPaymentError ? "border-red-400" : ""
                              }`}
                              placeholder="Nhập số tiền (VND)"
                              value={downPayment}
                              onChange={(e) => setDownPayment(e.target.value)}
                            />
                            {downPaymentError && (
                              <p className="mt-1 text-xs text-red-500">{downPaymentError}</p>
                            )}
                          </label>

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

              {/* Mã giảm giá */}
              <div className="mt-4">
                <span className="text-sm font-medium text-slate-700">Mã giảm giá</span>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border px-3 py-2 text-sm uppercase"
                    placeholder="Nhập mã..."
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      if (appliedPromo) setAppliedPromo(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && void handleApplyPromo()}
                  />
                  <button
                    type="button"
                    disabled={promoLoading || !promoCode.trim()}
                    onClick={() => void handleApplyPromo()}
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
                  onChange={(event) => setDeliveryAddress(event.target.value)}
                />
              </label>
              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Ghi chú</span>
                <textarea
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </label>
              <button
                type="button"
                className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={
                  createOrder.isPending || selectedItems.length === 0 || !canCustomerCheckout
                }
                onClick={() => createOrder.mutate()}
              >
                {createOrder.isPending ? "Đang tạo..." : `Thanh toán (${selectedItems.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

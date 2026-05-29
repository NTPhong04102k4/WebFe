import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { notify } from "@/components/core/Feedback/toast";
import {
  createOrderInputFromCart,
  createOrderPreviewInputFromCart,
  orderApi,
  type OrderPreviewResult,
} from "@/services/api/functions/orders/order.api";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, type CartItem } from "@/stores/cartStore";

function getErrorMessage(error: unknown) {
  const response = (error as { response?: { status?: number; data?: { message?: string } } })?.response;
  const message = response?.data?.message;

  if (response?.status === 401) return "Vui lòng đăng nhập lại để thanh toán.";
  if (response?.status === 403) return "Tài khoản hiện tại không có quyền thanh toán đơn khách.";
  if (response?.status === 422) return message ?? "Thông tin thanh toán không hợp lệ.";
  return message ?? (error instanceof Error ? error.message : "Không xử lý được yêu cầu.");
}

export default function CustomerCartPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
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

  const preview = useMutation({
    mutationFn: (vars: { items: CartItem[] }) => orderApi.preview(createOrderPreviewInputFromCart(vars.items)),
    onSuccess: setPreviewResult,
    onError: () => setPreviewResult(null),
  });

  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (selectedItems.length === 0 || !canCustomerCheckout) {
      setPreviewResult(null);
      return;
    }

    previewTimerRef.current = setTimeout(() => preview.mutate({ items: selectedItems }), 400);
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

      const latestPreview = await orderApi.preview(createOrderPreviewInputFromCart(selectedItems));
      return orderApi.create(
        createOrderInputFromCart(selectedItems, {
          paymentMethod,
          deliveryAddress: deliveryAddress.trim() || null,
          notes: notes.trim() || null,
          previewToken: latestPreview.previewToken,
        }),
      );
    },
    onSuccess: (result) => {
      selectedItems.forEach((item) => removeItem(item.type, item.id));
      setSelectedItemKeys(new Set());
      notify.success("Đã tạo đơn hàng");
      navigate(result?.order?.orderNumber ? `/orders/${result.order.orderNumber}` : "/orders");
    },
    onError: (error: unknown) => notify.error(getErrorMessage(error)),
  });

  const toggleSelectAll = () => {
    setSelectedItemKeys((current) =>
      current.size === items.length ? new Set() : new Set(items.map((item) => `${item.type}-${item.id}`)),
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Giỏ hàng đang trống.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" to="/cars">
              Mua xe
            </Link>
            <Link className="rounded-lg border px-4 py-2 text-sm font-medium" to="/accessories">
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
                checked={selectedItemKeys.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
              />
              <span className="font-medium text-slate-700">Chọn tất cả ({items.length} sản phẩm)</span>
            </div>

            <div className="space-y-3">
              {paginatedItems.map((item) => {
                const key = `${item.type}-${item.id}`;
                const isSelected = selectedItemKeys.has(key);
                const isCar = item.type === "car";

                return (
                  <div key={key} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded border-slate-300"
                        checked={isSelected}
                        onChange={() => toggleItem(key)}
                      />
                    </div>
                    <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.imagePath ? (
                        <img className="h-full w-full object-cover" src={item.imagePath} alt={item.name} />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium uppercase text-slate-500">
                        {isCar ? "Xe" : "Phụ kiện"}
                      </div>
                      <h2 className="mt-1 font-semibold text-slate-900">{item.name}</h2>
                      <p className="mt-1 text-sm font-semibold text-blue-700">{formatCurrency(item.price)}</p>
                      <div className="mt-3 flex items-center gap-2">
                        {!isCar ? (
                          <>
                            <button
                              type="button"
                              className="h-8 w-8 rounded border"
                              onClick={() => updateQuantity(item.type, item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              type="button"
                              className="h-8 w-8 rounded border"
                              onClick={() => updateQuantity(item.type, item.id, item.quantity + 1)}
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
                          onClick={() => removeItem(item.type, item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
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
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span className="text-slate-900">Tổng đơn thật</span>
                    <span className="text-blue-700">{formatCurrency(previewResult.totalAmount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Đã chọn ({selectedItems.length}){preview.isPending ? " ..." : ""}
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

            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Phương thức</span>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
              >
                <option value="BANK_TRANSFER">Chuyển khoản</option>
              </select>
            </label>
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
              disabled={createOrder.isPending || selectedItems.length === 0 || !canCustomerCheckout}
              onClick={() => createOrder.mutate()}
            >
              {createOrder.isPending ? "Đang tạo..." : `Thanh toán (${selectedItems.length})`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

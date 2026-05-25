import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { createOrderInputFromCart, orderApi } from "@/services/api/functions/orders/order.api";
import { useCartStore } from "@/stores/cartStore";

export default function CustomerCartPage() {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  const createOrder = useMutation({
    mutationFn: () =>
      orderApi.create(
        createOrderInputFromCart(items, {
          paymentMethod,
          deliveryAddress: deliveryAddress.trim() || null,
          notes: notes.trim() || null,
        })
      ),
    onSuccess: (result) => {
      clearCart();
      toast.success("Đã tạo đơn hàng");
      if (result?.order?.orderNumber) navigate(`/orders/${result.order.orderNumber}`);
      else navigate("/orders");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng</h1>

      {items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Giỏ hàng đang trống.</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" to="/cars">Mua xe</Link>
            <Link className="rounded-lg border px-4 py-2 text-sm font-medium" to="/accessories">Mua phụ kiện</Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
                <div className="h-24 w-32 overflow-hidden rounded-lg bg-slate-100">
                  {item.imagePath ? <img className="h-full w-full object-cover" src={item.imagePath} alt={item.name} /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium uppercase text-slate-500">{item.type === "car" ? "Xe" : "Phụ kiện"}</div>
                  <h2 className="mt-1 font-semibold text-slate-900">{item.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-blue-700">{formatCurrency(item.price)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.type, item.id, item.quantity - 1)}>-</button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button className="h-8 w-8 rounded border" onClick={() => updateQuantity(item.type, item.id, item.quantity + 1)}>+</button>
                    <button className="ml-3 text-sm text-red-600" onClick={() => removeItem(item.type, item.id)}>Xóa</button>
                  </div>
                </div>
                <div className="text-right font-semibold text-slate-900">{formatCurrency(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-slate-900">Thanh toán</h2>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-slate-600">Tạm tính</span>
              <span className="font-semibold">{formatCurrency(totalPrice())}</span>
            </div>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Phương thức</span>
              <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="BANK_TRANSFER">Chuyển khoản</option>
                <option value="CARD">Thẻ</option>
                <option value="NAPAS_BANK_TRANSFER">Napas</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Địa chỉ giao hàng</span>
              <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={3} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} />
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-medium text-slate-700">Ghi chú</span>
              <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={createOrder.isPending}
              onClick={() => createOrder.mutate()}
            >
              {createOrder.isPending ? "Đang tạo..." : "Tạo đơn hàng"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

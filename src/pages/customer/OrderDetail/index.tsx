import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { orderApi } from "@/services/api/functions/orders/order.api";

export default function CustomerOrderDetailPage() {
  const { orderNumber = "" } = useParams();
  const detail = useQuery({
    queryKey: ["customer-order-detail", orderNumber],
    enabled: Boolean(orderNumber),
    queryFn: ({ signal }) => orderApi.detail(orderNumber, { signal }),
  });
  const payment = useQuery({
    queryKey: ["customer-order-payment", orderNumber],
    enabled: Boolean(orderNumber),
    queryFn: ({ signal }) => orderApi.paymentInfo(orderNumber, { signal }),
  });
  const order = detail.data;
  const pay = payment.data;
  const qr = pay?.qrImageUrl ?? pay?.qrCodeUrl;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/orders" className="text-sm font-medium text-blue-700 hover:underline">← Quay lại đơn hàng</Link>
      {detail.isLoading ? (
        <div className="mt-6 text-center text-slate-600">Đang tải...</div>
      ) : detail.error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">Lỗi: {detail.error.message}</div>
      ) : order ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h1 className="text-2xl font-bold text-slate-900">{order.orderNumber}</h1>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">Trạng thái:</span> <b>{order.orderStatus}</b></div>
              <div><span className="text-slate-500">Thanh toán:</span> <b>{order.paymentStatus}</b></div>
              <div><span className="text-slate-500">Loại đơn:</span> <b>{order.orderType}</b></div>
              <div><span className="text-slate-500">Phương thức:</span> <b>{order.paymentMethod}</b></div>
            </div>
            <div className="mt-5 border-t pt-4">
              <div className="flex justify-between text-sm"><span>Tạm tính</span><span>{formatCurrency(order.subTotal)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>Thuế</span><span>{formatCurrency(order.taxAmount ?? 0)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>Giảm giá</span><span>{formatCurrency(order.discountAmount ?? 0)}</span></div>
              <div className="mt-3 flex justify-between text-lg font-bold text-blue-700"><span>Tổng</span><span>{formatCurrency(order.totalAmount)}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Thông tin chuyển khoản</h2>
            {payment.isLoading ? (
              <p className="mt-3 text-sm text-slate-600">Đang tải QR...</p>
            ) : pay ? (
              <div className="mt-4 space-y-3 text-sm">
                {qr ? <img className="mx-auto h-48 w-48 object-contain" src={qr} alt="QR thanh toán" /> : null}
                <div><span className="text-slate-500">Ngân hàng:</span> {pay.bankName}</div>
                <div><span className="text-slate-500">Tài khoản:</span> {pay.bankAccount ?? pay.accountNumber}</div>
                <div><span className="text-slate-500">Nội dung:</span> <b>{pay.transferContent}</b></div>
                <div><span className="text-slate-500">Số tiền:</span> <b>{formatCurrency(pay.amount ?? order.totalAmount)}</b></div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Không có thông tin thanh toán.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

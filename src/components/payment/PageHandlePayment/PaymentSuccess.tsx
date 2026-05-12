import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSePayOrder } from "src/query/payment/usePaymentQueries";
import { FaCheckCircle } from "react-icons/fa";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  // Fetch order details if order_id is available
  const { data: order, isLoading } = useSePayOrder(orderId, !!orderId);

  useEffect(() => {
    // Clear payment state from sessionStorage
    sessionStorage.removeItem("payment_state");
  }, []);

  const formatCurrency = (amount: string, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
            <FaCheckCircle size={64} color="#10b981" />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-gray-600 text-lg">
            Cảm ơn bạn đã thanh toán. Đơn hàng của bạn đã được xử lý thành công.
          </p>
        </div>

        {/* Order Information */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Thông tin đơn hàng
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mã đơn hàng:</span>
                <span className="font-semibold text-gray-800">{orderId}</span>
              </div>
              {order && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mã hóa đơn:</span>
                    <span className="font-semibold text-gray-800">
                      {order.order_invoice_number}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tiền:</span>
                    <span className="font-bold text-green-600 text-lg">
                      {formatCurrency(order.order_amount, order.order_currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {order.order_status}
                    </span>
                  </div>
                </>
              )}
              {isLoading && (
                <div className="text-center text-gray-500">
                  Đang tải thông tin đơn hàng...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/home")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Về trang chủ
          </button>
          {orderId && (
            <button
              onClick={() => navigate(`/payment/order/${orderId}`)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Xem chi tiết đơn hàng
            </button>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Bạn sẽ nhận được email xác nhận đơn hàng
            trong vài phút tới. Nếu có bất kỳ thắc mắc nào, vui lòng liên hệ với
            chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

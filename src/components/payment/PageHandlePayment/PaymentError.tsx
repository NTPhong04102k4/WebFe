import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaExclamationCircle } from "react-icons/fa";

const PaymentError = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");
  const errorMessage = searchParams.get("message") || searchParams.get("error");

  useEffect(() => {
    // Clear payment state from sessionStorage
    sessionStorage.removeItem("payment_state");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <FaExclamationCircle size={64} color="#ef4444" />
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-gray-600 text-lg mb-4">
            Rất tiếc, giao dịch thanh toán của bạn không thể hoàn tất.
          </p>
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 text-sm">
                <strong>Chi tiết lỗi:</strong> {errorMessage}
              </p>
            </div>
          )}
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
            </div>
          </div>
        )}

        {/* Possible Reasons */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-3">
            Các nguyên nhân có thể:
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
            <li>Số dư tài khoản không đủ</li>
            <li>Thông tin thẻ không hợp lệ hoặc đã hết hạn</li>
            <li>Giao dịch bị từ chối bởi ngân hàng</li>
            <li>Lỗi kết nối mạng hoặc hệ thống</li>
            <li>Thời gian giao dịch đã hết hạn</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/payment")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Thử lại thanh toán
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Về trang chủ
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Cần hỗ trợ?</strong> Nếu bạn gặp vấn đề liên tục, vui lòng
            liên hệ bộ phận hỗ trợ khách hàng của chúng tôi. Chúng tôi sẵn sàng
            hỗ trợ bạn.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentError;

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") || searchParams.get("orderId");

  useEffect(() => {
    // Clear payment state from sessionStorage
    sessionStorage.removeItem("payment_state");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
            <FaTimesCircle size={64} color="#f59e0b" />
          </div>
        </div>

        {/* Cancel Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Thanh toán đã bị hủy
          </h1>
          <p className="text-gray-600 text-lg">
            Bạn đã hủy quá trình thanh toán. Đơn hàng của bạn vẫn được lưu và
            bạn có thể thanh toán lại bất cứ lúc nào.
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
              <div className="flex justify-between">
                <span className="text-gray-600">Trạng thái:</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  Đã hủy
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">
            Đơn hàng của bạn vẫn được lưu
          </h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
            <li>Bạn có thể quay lại và thanh toán bất cứ lúc nào</li>
            <li>Đơn hàng sẽ được giữ trong 24 giờ</li>
            <li>Bạn sẽ nhận được email nhắc nhở nếu chưa thanh toán</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate("/payment")}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Thanh toán lại
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Về trang chủ
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Nếu bạn gặp vấn đề trong quá trình thanh toán hoặc có câu hỏi, vui
            lòng liên hệ với chúng tôi để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;

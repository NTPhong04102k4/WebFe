import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { ENV } from "src/config/environment";

interface PaymentFormLocationState {
  orderId: string;
  customerId: string;
}

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy orderId và customerId từ location state
  const state = location.state as PaymentFormLocationState | null;
  const orderId = state?.orderId || "123";
  const customerId = state?.customerId || "1";

  // Hooks phải được gọi trước khi có early return
  const invoiceNumber = useMemo(
    () => (orderId ? `INV_${new Date().getTime()}_${orderId}` : ""),
    [orderId]
  );

  const signature = useMemo(() => {
    if (!orderId || !customerId) {
      return "";
    }

    // Danh sách các field được phép ký (theo thứ tự alphabet)
    const allowedFields = [
      "cancel_url",
      "currency",
      "customer_id",
      "error_url",
      "merchant",
      "operation",
      "order_amount",
      "order_description",
      "order_invoice_number",
      "success_url",
      // "payment_method", // Nếu có
    ];

    // Tạo object chứa các field và giá trị
    const fields: Record<string, string> = {
      merchant: ENV.SEPAY_MERCHANT_ID || "",
      operation: "PURCHASE",
      order_amount: "100000",
      currency: "VND",
      order_invoice_number: invoiceNumber,
      order_description: `Thanh toán đơn hàng #${orderId}`,
      customer_id: customerId,
      success_url: `${ENV.API_URL}/payment/success`,
      error_url: `${ENV.API_URL}/payment/error`,
      cancel_url: `${ENV.API_URL}/payment/cancel`,
      // payment_method: "BANK_TRANSFER", // Nếu có
    };

    // Lọc và tạo chuỗi ký theo đúng thứ tự
    const signedFields: string[] = [];
    for (const field of allowedFields) {
      if (fields[field]) {
        signedFields.push(`${field}=${fields[field]}`);
      }
    }

    // ⚠️ QUAN TRỌNG: Kiểm tra docs Sepay xem dùng dấu gì
    // Option 1: Dấu &
    const signedString = signedFields.join("&");

    // Option 2: Dấu phẩy (nếu docs Sepay yêu cầu)
    // const signedString = signedFields.join(",");

    console.log("Signed string:", signedString); // Debug

    // Hash HMAC SHA256
    const hash = CryptoJS.HmacSHA256(signedString, ENV.SEPAY_SECRET_KEY || "");

    // Base64 encode
    return CryptoJS.enc.Base64.stringify(hash);
  }, [orderId, customerId, invoiceNumber]);

  // Kiểm tra nếu thiếu dữ liệu cần thiết
  if (!orderId || !customerId) {
    return (
      <div className="min-w-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">
            Thiếu thông tin thanh toán
          </h2>
          <p className="text-red-600 mb-4">
            Không tìm thấy thông tin đơn hàng. Vui lòng quay lại và thử lại.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const orderAmount = 100000;
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(orderAmount);

  return (
    <div className="min-w-full p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Thông tin thanh toán
        </h2>

        {/* Hiển thị thông tin đơn hàng */}
        <div className="space-y-4 mb-6">
          <div className="border-b pb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-semibold text-gray-800">{orderId}</span>
            </div>
          </div>

          <div className="border-b pb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mã hóa đơn:</span>
              <span className="font-semibold text-gray-800 text-sm">
                {invoiceNumber}
              </span>
            </div>
          </div>

          <div className="border-b pb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mô tả:</span>
              <span className="font-semibold text-gray-800 text-right">
                Thanh toán đơn hàng #{orderId}
              </span>
            </div>
          </div>

          <div className="border-b pb-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Mã khách hàng:</span>
              <span className="font-semibold text-gray-800">{customerId}</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-700">
                Tổng tiền:
              </span>
              <span className="text-2xl font-bold text-blue-600">
                {formattedAmount}
              </span>
            </div>
          </div>
        </div>

        {/* Form submit */}
        <form method="POST" action={`${ENV.SEPAY_BASE_URL}/v1/checkout/init`}>
          <input type="hidden" name="merchant" value={ENV.SEPAY_MERCHANT_ID} />
          <input type="hidden" name="operation" value="PURCHASE" />
          <input
            type="hidden"
            name="order_amount"
            value={orderAmount.toString()}
          />
          <input type="hidden" name="currency" value="VND" />
          <input
            type="hidden"
            name="order_invoice_number"
            value={invoiceNumber}
          />
          <input
            type="hidden"
            name="order_description"
            value={`Thanh toán đơn hàng #${orderId}`}
          />
          <input type="hidden" name="customer_id" value={customerId} />
          <input
            type="hidden"
            name="success_url"
            value={`${ENV.API_URL}/payment/success`}
          />
          <input
            type="hidden"
            name="error_url"
            value={`${ENV.API_URL}/payment/error`}
          />
          <input
            type="hidden"
            name="cancel_url"
            value={`${ENV.API_URL}/payment/cancel`}
          />
          <input type="hidden" name="signature" value={signature} />

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Thanh toán
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;

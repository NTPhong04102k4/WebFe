import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { ENV } from "src/config/environment";
import { useAuth } from "src/shared/hooks/auth/index.ts";
import { getTokenClaims } from "src/services/decode";

interface PaymentFormLocationState {
  orderId: string;
  customerId: string;
  orderAmount?: number;
  orderDescription?: string;
  paymentMethod?: string;
}

const PaymentForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

  // Lấy thông tin từ location state
  const state = location.state as PaymentFormLocationState | null;

  // Debug: Log state để kiểm tra
  useEffect(() => {
    console.log("🔍 PaymentForm Debug:", {
      hasState: !!state,
      state: state,
      locationState: location.state,
      orderId: state?.orderId,
      customerId: state?.customerId,
      user: user,
      userUUID: user?.userUUID,
      token: token ? `${token.substring(0, 20)}...` : "No token",
    });
  }, [state, location.state, user, token]);

  // Fallback: Lấy từ sessionStorage nếu state bị mất
  const getFromStorage = () => {
    try {
      const stored = sessionStorage.getItem("payment_state");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading from sessionStorage:", e);
    }
    return null;
  };

  // Lưu state vào sessionStorage để backup
  useEffect(() => {
    if (state) {
      sessionStorage.setItem("payment_state", JSON.stringify(state));
    }
  }, [state]);

  // Lấy thông tin từ state hoặc storage hoặc user
  const storedState = getFromStorage();
  const finalState = state || storedState;

  // Decode token để xem thông tin
  const tokenClaims = useMemo(() => {
    return token ? getTokenClaims(token) : null;
  }, [token]);

  const orderId = finalState?.orderId || "";

  // Lấy customerId từ nhiều nguồn (theo thứ tự ưu tiên)
  const customerId = useMemo(() => {
    // 1. Từ state (nếu có)
    if (finalState?.customerId) {
      return finalState.customerId;
    }
    // 2. Từ user.userUUID
    if (user?.userUUID) {
      return user.userUUID;
    }
    // 3. Từ token.sub (subject claim - thường là user ID)
    if (tokenClaims?.sub) {
      return tokenClaims.sub;
    }
    // 4. Từ user.userID (fallback)
    if (user?.userID) {
      return `USER_${user.userID}`;
    }
    // 5. Từ user.email (last resort)
    if (user?.email) {
      return user.email;
    }
    return "";
  }, [finalState?.customerId, user, tokenClaims]);

  const orderAmount = finalState?.orderAmount || 100000;
  const orderDescription =
    finalState?.orderDescription || `Thanh toán đơn hàng #${orderId}`;
  const paymentMethod = finalState?.paymentMethod; // Optional: CARD, BANK_TRANSFER, NAPAS_BANK_TRANSFER

  // Hooks phải được gọi trước khi có early return
  const invoiceNumber = useMemo(
    () => (orderId ? `INV_${new Date().getTime()}_${orderId}` : ""),
    [orderId]
  );

  const signature = useMemo(() => {
    if (
      !orderId ||
      !customerId ||
      !ENV.SEPAY_MERCHANT_ID ||
      !ENV.SEPAY_SECRET_KEY
    ) {
      return "";
    }

    // Danh sách các field được phép ký theo thứ tự trong tài liệu SePay
    // Thứ tự: merchant, operation, payment_method, order_amount, currency,
    // order_invoice_number, order_description, customer_id, success_url, error_url, cancel_url
    const allowedFields = [
      "merchant",
      "operation",
      "payment_method",
      "order_amount",
      "currency",
      "order_invoice_number",
      "order_description",
      "customer_id",
      "success_url",
      "error_url",
      "cancel_url",
    ];

    // Tạo object chứa các field và giá trị
    const fields: Record<string, string> = {
      merchant: ENV.SEPAY_MERCHANT_ID,
      operation: "PURCHASE",
      order_amount: orderAmount.toString(),
      currency: "VND",
      order_invoice_number: invoiceNumber,
      order_description: orderDescription,
      customer_id: customerId,
      success_url: `${window.location.origin}/payment/success`,
      error_url: `${window.location.origin}/payment/error`,
      cancel_url: `${window.location.origin}/payment/cancel`,
    };

    // Thêm payment_method nếu có
    if (paymentMethod) {
      fields.payment_method = paymentMethod;
    }

    // Lọc và tạo chuỗi ký theo đúng thứ tự (chỉ lấy các field có giá trị)
    const signedFields: string[] = [];
    for (const field of allowedFields) {
      if (fields[field] && fields[field].trim() !== "") {
        signedFields.push(`${field}=${fields[field]}`);
      }
    }

    // Tạo chuỗi ký với dấu phẩy (theo tài liệu SePay)
    const signedString = signedFields.join(",");

    console.log("Signed string:", signedString); // Debug

    // Hash HMAC SHA256
    const hash = CryptoJS.HmacSHA256(signedString, ENV.SEPAY_SECRET_KEY);

    // Base64 encode
    return CryptoJS.enc.Base64.stringify(hash);
  }, [
    orderId,
    customerId,
    invoiceNumber,
    orderAmount,
    orderDescription,
    paymentMethod,
  ]);

  // Kiểm tra nếu thiếu dữ liệu cần thiết
  if (
    !orderId ||
    !customerId ||
    !ENV.SEPAY_MERCHANT_ID ||
    !ENV.SEPAY_SECRET_KEY
  ) {
    return (
      <div className="min-w-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">
            Thiếu thông tin thanh toán
          </h2>
          <p className="text-red-600 mb-4">
            {!orderId || !customerId
              ? "Không tìm thấy thông tin đơn hàng. Vui lòng quay lại và thử lại."
              : "Cấu hình SePay chưa đầy đủ. Vui lòng kiểm tra lại cấu hình môi trường."}
          </p>

          {/* Debug Panel */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-yellow-800 font-semibold mb-2"
            >
              {showDebug ? "Ẩn" : "Hiển thị"} Debug Info
            </button>
            {showDebug && (
              <div className="space-y-1 text-yellow-700">
                <p>
                  <strong>Location State:</strong>{" "}
                  {JSON.stringify(state, null, 2)}
                </p>
                <p>
                  <strong>Stored State:</strong>{" "}
                  {JSON.stringify(storedState, null, 2)}
                </p>
                <p>
                  <strong>Order ID:</strong> {orderId || "❌ MISSING"}
                </p>
                <p>
                  <strong>Customer ID:</strong>{" "}
                  {customerId ? (
                    <span className="text-green-700 font-bold">
                      {customerId}
                    </span>
                  ) : (
                    <span className="text-red-700 font-bold">❌ MISSING</span>
                  )}
                </p>
                <p>
                  <strong>Customer ID Source:</strong>{" "}
                  {finalState?.customerId
                    ? "From State"
                    : user?.userUUID
                    ? "From user.userUUID"
                    : tokenClaims?.sub
                    ? "From token.sub"
                    : user?.userID
                    ? "From user.userID"
                    : user?.email
                    ? "From user.email"
                    : "NOT FOUND"}
                </p>
                <p>
                  <strong>User Object:</strong>{" "}
                  {user
                    ? JSON.stringify(
                        {
                          userUUID: user.userUUID || "MISSING",
                          userID: user.userID || "MISSING",
                          fullName: user.fullName || "MISSING",
                          email: user.email || "MISSING",
                        },
                        null,
                        2
                      )
                    : "NOT LOGGED IN"}
                </p>
                <p>
                  <strong>Token:</strong>{" "}
                  {token ? `${token.substring(0, 30)}...` : "NO TOKEN"}
                </p>
                <p>
                  <strong>Token Claims:</strong>{" "}
                  {tokenClaims ? JSON.stringify(tokenClaims, null, 2) : "N/A"}
                </p>
                <div className="mt-2 p-2 bg-red-50 border border-red-300 rounded">
                  <p className="font-bold text-red-800">⚠️ SePay Config:</p>
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>
                      Merchant ID:{" "}
                      {ENV.SEPAY_MERCHANT_ID ? (
                        <span className="text-green-700">✓ SET</span>
                      ) : (
                        <span className="text-red-700">
                          ✗ MISSING - Cần set REACT_APP_SEPAY_MERCHANT_ID
                        </span>
                      )}
                    </li>
                    <li>
                      Secret Key:{" "}
                      {ENV.SEPAY_SECRET_KEY ? (
                        <span className="text-green-700">✓ SET</span>
                      ) : (
                        <span className="text-red-700">
                          ✗ MISSING - Cần set REACT_APP_SEPAY_SECRET_KEY
                        </span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mt-4"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Kiểm tra số tiền hợp lệ
  if (orderAmount <= 0) {
    return (
      <div className="min-w-full p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">
            Số tiền không hợp lệ
          </h2>
          <p className="text-red-600 mb-4">
            Số tiền thanh toán phải lớn hơn 0.
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
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(orderAmount);

  return (
    <div className="min-w-full p-6 max-w-2xl mx-auto">
      {/* Debug Toggle Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          {showDebug ? "Ẩn" : "Hiển thị"} Debug
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-300 rounded-lg text-xs">
          <h3 className="font-bold text-yellow-800 mb-2">
            🔍 Debug Information
          </h3>
          <div className="space-y-2 text-yellow-700">
            <div>
              <strong>Location State:</strong>
              <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(state, null, 2)}
              </pre>
            </div>
            <div>
              <strong>Stored State:</strong>
              <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-32">
                {JSON.stringify(storedState, null, 2)}
              </pre>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p>
                <strong>Order ID:</strong> {orderId || "❌ MISSING"}
              </p>
              <p>
                <strong>Customer ID:</strong> {customerId || "❌ MISSING"}
              </p>
              <p>
                <strong>Order Amount:</strong>{" "}
                {orderAmount.toLocaleString("vi-VN")} VND
              </p>
              <p>
                <strong>User UUID:</strong>{" "}
                {user?.userUUID || "❌ NOT AVAILABLE"}
              </p>
              <p>
                <strong>Customer ID Source:</strong>{" "}
                {finalState?.customerId
                  ? "From State"
                  : user?.userUUID
                  ? "From user.userUUID"
                  : tokenClaims?.sub
                  ? "From token.sub"
                  : user?.userID
                  ? "From user.userID"
                  : user?.email
                  ? "From user.email"
                  : "NOT FOUND"}
              </p>
              <p>
                <strong>Token:</strong>{" "}
                {token ? `✓ ${token.substring(0, 20)}...` : "❌ NO TOKEN"}
              </p>
              <p>
                <strong>Token IAT:</strong>{" "}
                {tokenClaims?.iat
                  ? new Date(tokenClaims.iat * 1000).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
              <p>
                <strong>Token EXP:</strong>{" "}
                {tokenClaims?.exp
                  ? new Date(tokenClaims.exp * 1000).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
              <p>
                <strong>Token SUB:</strong> {tokenClaims?.sub || "N/A"}
              </p>
            </div>
            <div>
              <strong>SePay Config:</strong>
              <ul className="ml-4 mt-1">
                <li>
                  Merchant ID:{" "}
                  {ENV.SEPAY_MERCHANT_ID
                    ? `✓ ${ENV.SEPAY_MERCHANT_ID.substring(0, 10)}...`
                    : "❌ MISSING"}
                </li>
                <li>
                  Secret Key: {ENV.SEPAY_SECRET_KEY ? "✓ SET" : "❌ MISSING"}
                </li>
                <li>Base URL: {ENV.SEPAY_BASE_URL || "N/A"}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

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
                {orderDescription}
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
            value={orderDescription}
          />
          {paymentMethod && (
            <input type="hidden" name="payment_method" value={paymentMethod} />
          )}
          <input type="hidden" name="customer_id" value={customerId} />
          <input
            type="hidden"
            name="success_url"
            value={`${window.location.origin}/payment/success`}
          />
          <input
            type="hidden"
            name="error_url"
            value={`${window.location.origin}/payment/error`}
          />
          <input
            type="hidden"
            name="cancel_url"
            value={`${window.location.origin}/payment/cancel`}
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

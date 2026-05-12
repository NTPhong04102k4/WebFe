import React from "react";
import { useSePayOrder } from "src/query/payment/usePaymentQueries";
import { SePayTransaction } from "src/shared/types/Reponse/Payment";

interface OrderDetailProps {
  orderId: string;
}

/**
 * Component hiển thị chi tiết đơn hàng SePay
 */
export const OrderDetail: React.FC<OrderDetailProps> = ({ orderId }) => {
  const { data: order, isLoading, isError, error } = useSePayOrder(orderId);

  if (isLoading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">
          Lỗi khi tải đơn hàng
        </h3>
        <p className="text-red-600 text-sm">
          {error instanceof Error
            ? error.message
            : "Không thể tải thông tin đơn hàng"}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: string, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(parseFloat(amount));
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("success") || statusLower.includes("completed")) {
      return "bg-green-100 text-green-800 border-green-300";
    }
    if (statusLower.includes("pending") || statusLower.includes("processing")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
    if (
      statusLower.includes("failed") ||
      statusLower.includes("error") ||
      statusLower.includes("cancelled")
    ) {
      return "bg-red-100 text-red-800 border-red-300";
    }
    return "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Chi tiết đơn hàng
      </h2>

      {/* Thông tin cơ bản */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Mã đơn hàng
          </h3>
          <p className="text-lg font-bold text-gray-800">{order.order_id}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Mã hóa đơn
          </h3>
          <p className="text-lg font-bold text-gray-800">
            {order.order_invoice_number}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Trạng thái
          </h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(
              order.order_status
            )}`}
          >
            {order.order_status}
          </span>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Số tiền</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(order.order_amount, order.order_currency)}
          </p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Mô tả</h3>
          <p className="text-gray-800">{order.order_description}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Khách hàng
          </h3>
          <p className="text-gray-800">{order.customer_id || "N/A"}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Ngày tạo</h3>
          <p className="text-gray-800">{formatDate(order.created_at)}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Cập nhật lần cuối
          </h3>
          <p className="text-gray-800">{formatDate(order.updated_at)}</p>
        </div>
      </div>

      {/* Giao dịch */}
      {order.transactions && order.transactions.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Giao dịch
          </h3>
          <div className="space-y-3">
            {order.transactions.map((transaction: SePayTransaction) => (
              <div
                key={transaction.id}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Transaction ID</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {transaction.transaction_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Loại</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {transaction.transaction_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Trạng thái</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        transaction.transaction_status
                      )}`}
                    >
                      {transaction.transaction_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Số tiền</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phương thức</p>
                    <p className="text-sm text-gray-800">
                      {transaction.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Ngày tạo</p>
                    <p className="text-sm text-gray-800">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;

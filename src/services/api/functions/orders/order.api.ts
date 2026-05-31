import apiClient from "../..";
import { API } from "../../endpoints";
import type { OperationResult } from "src/services/types/common.types";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { CartItem } from "src/stores/cartStore";

export interface OrderLineCar {
  carID: number;
  discountAmount?: number;
}

export interface OrderLineAccessory {
  accessoryID: number;
  quantity: number;
}

export interface OrderCartPayload {
  cars: OrderLineCar[];
  accessories: OrderLineAccessory[];
}

export interface CreateOrderInput extends OrderCartPayload {
  /** PascalCase — đúng với backend enum */
  orderType: "Car" | "Accessory" | "Mixed";
  paymentMethod: string;
  isInstallment: boolean;
  installmentMonths?: number | null;
  downPayment?: number | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  previewToken: string;
}

export type OrderPreviewInput = OrderCartPayload;

export interface OrderPreviewResult extends OrderCartPayload {
  previewToken: string;
  expiresAt?: string;
  subTotal: number;
  taxRate?: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
}

export interface OrderViewModel {
  orderID: number;
  orderNumber: string;
  orderType: string;
  orderStatus: string;
  subTotal: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentDate?: string | null;
  deliveryAddress?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  cars?: unknown[];
  accessories?: unknown[];
}

export interface OrderListResult {
  data: OrderViewModel[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}

export interface PaymentInfoViewModel {
  qrImageUrl?: string | null;
  transferContent?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  amount?: number;
  orderNumber?: string;
  expiredAt?: string | null;
  signature?: string | null;
}

export interface CreateOrderResult {
  order: OrderViewModel;
  payment?: PaymentInfoViewModel | null;
}

export type PaymentStatus = "Pending" | "PartialPaid" | "Paid" | "Failed" | "Refunded";

export interface PaymentRecord {
  paymentMethod: "BANK_TRANSFER" | "CASH" | "MIXED";
  amount: number;
  paymentDate: string;
  paymentReference: string | null;
}

export interface CheckPaymentResult {
  paymentStatus: PaymentStatus;
  orderStatus: string;
  totalPaid: number;
  remaining: number;
  orderTotal?: number;
  newTransactions?: number;
  payments?: PaymentRecord[];
}

/** Response nguyên bản từ check-payment (giữ success/errorCode để phân nhánh UI) */
export interface CheckPaymentApiResponse {
  success: boolean;
  errorCode?: string;
  message?: string;
  data?: CheckPaymentResult;
}

export interface RecordCashInput {
  amount: number;
  receiptNumber?: string;
  notes?: string;
}

export interface RecordCashResult {
  paymentStatus: PaymentStatus;
  totalPaid: number;
  remaining: number;
  orderTotal: number;
}

function unwrap<T>(payload: T | OperationResult<T>): T {
  return payload && typeof payload === "object" && "data" in payload
    ? ((payload as OperationResult<T>).data as T)
    : (payload as T);
}

export function createOrderInputFromCart(
  items: CartItem[],
  input: Pick<CreateOrderInput, "paymentMethod" | "deliveryAddress" | "notes" | "previewToken">
): CreateOrderInput {
  const payload = createOrderPreviewInputFromCart(items);
  const orderType = resolveOrderType(payload);

  return {
    ...payload,
    orderType,
    paymentMethod: input.paymentMethod,
    isInstallment: false,
    deliveryAddress: input.deliveryAddress,
    notes: input.notes,
    previewToken: input.previewToken,
  };
}

export function createOrderPreviewInputFromCart(items: CartItem[]): OrderPreviewInput {
  const cars = items
    .filter((item) => item.type === "car")
    .map((item) => ({ carID: item.id }));
  const accessories = items
    .filter((item) => item.type === "accessory")
    .map((item) => ({ accessoryID: item.id, quantity: item.quantity }));

  return { cars, accessories };
}

export function resolveOrderType(payload: OrderCartPayload): CreateOrderInput["orderType"] {
  const { cars, accessories } = payload;
  return cars.length && accessories.length ? "Mixed" : cars.length ? "Car" : "Accessory";
}

export interface AdminOrderListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

export interface RevenueDataPoint {
  label: string;
  totalSales: number;
  orderCount: number;
}

export interface RevenueReport {
  fromDate?: string;
  toDate?: string;
  groupBy: string;
  totalRevenue: number;
  totalOrders: number;
  data: RevenueDataPoint[];
}

export const orderApi = {
  list: async (params: AdminOrderListParams, options?: ApiRequestOptions) => {
    const res = await apiClient.get<OrderListResult>(
      API.ordersPayment.orders,
      withSignal({ params }, options)
    );
    return res.data;
  },

  myOrders: async (params: Pick<AdminOrderListParams, "page" | "pageSize">, options?: ApiRequestOptions) => {
    try {
      const res = await apiClient.get<OrderListResult>(
        API.ordersPayment.myOrders,
        withSignal({ params }, options)
      );
      return res.data;
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status !== 404) {
        throw error;
      }

      const fallback = await apiClient.get<OrderListResult>(
        API.ordersPayment.orders,
        withSignal({ params }, options)
      );
      return fallback.data;
    }
  },

  detail: async (orderNumber: string, options?: ApiRequestOptions) => {
    const res = await apiClient.get<OrderViewModel | OperationResult<OrderViewModel>>(
      API.ordersPayment.order(orderNumber),
      withSignal({}, options)
    );
    return unwrap(res.data);
  },

  paymentInfo: async (orderNumber: string, options?: ApiRequestOptions) => {
    const res = await apiClient.get<PaymentInfoViewModel | OperationResult<PaymentInfoViewModel>>(
      API.ordersPayment.orderPaymentInfo(orderNumber),
      withSignal({}, options)
    );
    return unwrap(res.data);
  },

  preview: async (body: OrderPreviewInput) => {
    const res = await apiClient.post<OperationResult<OrderPreviewResult>>(
      API.ordersPayment.previewOrder,
      body
    );
    return unwrap(res.data);
  },

  create: async (body: CreateOrderInput) => {
    const res = await apiClient.post<OperationResult<CreateOrderResult>>(
      API.ordersPayment.createOrder,
      body
    );
    return unwrap(res.data);
  },

  /**
   * POST /orders/payment/order/{orderNumber}/check-payment — đối soát thủ công với SePay.
   * suppressErrorHandling=true để interceptor không reject khi success=false (PartialPayment, NotFound).
   * Caller tự phân nhánh dựa trên result.success / result.errorCode.
   */
  checkPayment: async (orderNumber: string): Promise<CheckPaymentApiResponse> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<CheckPaymentApiResponse>(
      API.ordersPayment.checkPayment(orderNumber),
      undefined,
      { suppressErrorHandling: true } as any
    );
    return res.data;
  },

  /** POST /orders/payment/order/{orderNumber}/cash — ghi tiền mặt (Staff/Admin/Sales) */
  recordCash: async (orderNumber: string, body: RecordCashInput) => {
    const res = await apiClient.post<OperationResult<RecordCashResult>>(
      API.ordersPayment.recordCash(orderNumber),
      body
    );
    return unwrap(res.data);
  },

  /** POST /orders/payment/order/{orderNumber}/send-invoice — Admin,Staff gửi lại hóa đơn */
  sendInvoice: async (orderNumber: string, options?: ApiRequestOptions) => {
    const res = await apiClient.post<OperationResult | void>(
      API.ordersPayment.sendInvoice(orderNumber),
      undefined,
      withSignal({}, options)
    );
    return res.data;
  },

  /** GET /orders/payment/revenue-report */
  revenue: async (
    params: { fromDate?: string; toDate?: string; groupBy?: string },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<RevenueReport | OperationResult<RevenueReport>>(
      API.ordersPayment.revenueReport,
      withSignal({ params }, options)
    );
    return unwrap(res.data) as RevenueReport;
  },
};

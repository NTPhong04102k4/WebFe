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
  discountAmount?: number;
}

export interface CreateOrderInput {
  orderType: "CAR" | "ACCESSORY" | "MIXED";
  paymentMethod: string;
  isInstallment: boolean;
  installmentMonths?: number | null;
  downPayment?: number | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  cars: OrderLineCar[];
  accessories: OrderLineAccessory[];
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
  paymentStatus: string;
  paymentDate?: string | null;
  deliveryAddress?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  cars?: unknown[];
  accessories?: unknown[];
}

export interface PaymentInfoViewModel {
  qrImageUrl?: string | null;
  qrCodeUrl?: string | null;
  transferContent?: string | null;
  bankAccount?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  amount?: number;
  orderNumber?: string;
  expiredAt?: string | null;
}

export interface CreateOrderResult {
  order: OrderViewModel;
  payment?: PaymentInfoViewModel | null;
}

function unwrap<T>(payload: T | OperationResult<T>): T {
  return payload && typeof payload === "object" && "data" in payload
    ? ((payload as OperationResult<T>).data as T)
    : (payload as T);
}

export function createOrderInputFromCart(
  items: CartItem[],
  input: Pick<CreateOrderInput, "paymentMethod" | "deliveryAddress" | "notes">
): CreateOrderInput {
  const cars = items
    .filter((item) => item.type === "car")
    .map((item) => ({ carID: item.id }));
  const accessories = items
    .filter((item) => item.type === "accessory")
    .map((item) => ({ accessoryID: item.id, quantity: item.quantity }));
  const orderType =
    cars.length && accessories.length ? "MIXED" : cars.length ? "CAR" : "ACCESSORY";

  return {
    orderType,
    paymentMethod: input.paymentMethod,
    isInstallment: false,
    deliveryAddress: input.deliveryAddress,
    notes: input.notes,
    cars,
    accessories,
  };
}

export const orderApi = {
  list: async (params: { page?: number; pageSize?: number }, options?: ApiRequestOptions) => {
    const res = await apiClient.get<{ data: OrderViewModel[]; totalCount: number }>(
      API.ordersPayment.orders,
      withSignal({ params }, options)
    );
    return res.data;
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

  create: async (body: CreateOrderInput) => {
    const res = await apiClient.post<OperationResult<CreateOrderResult>>(
      API.ordersPayment.createOrder,
      body
    );
    return unwrap(res.data);
  },
};

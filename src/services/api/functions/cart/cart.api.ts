import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";
import type { OperationResult } from "src/services/types/common.types";

export interface CartCarItem {
  carID: number;
  carName: string;
  carBrand: string;
  thumbnailUrl?: string | null;
  salePrice: number;
  discountAmount: number;
  totalPrice: number;
  isAvailable: boolean;
  unavailableReason?: string | null;
}

export interface CartAccessoryItem {
  accessoryID: number;
  accessoryName: string;
  thumbnailUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CartViewModel {
  userId: string;
  updatedAt: string;
  totalItems: number;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  hasUnavailableItems: boolean;
  cars: CartCarItem[];
  accessories: CartAccessoryItem[];
}

export interface AddCarToCartInput {
  carId: number;
  discountAmount?: number;
}

export interface AddAccessoryToCartInput {
  accessoryId: number;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemType: "accessory";
  itemId: number;
  quantity: number;
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as OperationResult<T>).data as T;
  }
  return payload as T;
}

export const cartApi = {
  /** GET /cart — Customer */
  get: async (options?: ApiRequestOptions) => {
    const res = await apiClient.get<CartViewModel | OperationResult<CartViewModel>>(
      API.cart.root,
      withSignal({}, options)
    );
    return unwrap<CartViewModel>(res.data);
  },

  /** POST /cart/cars — Customer */
  addCar: async (body: AddCarToCartInput) => {
    const res = await apiClient.post<OperationResult>(API.cart.cars, body);
    return res.data;
  },

  /** DELETE /cart/cars/{carId} — Customer */
  removeCar: async (carId: number) => {
    const res = await apiClient.delete<OperationResult>(API.cart.car(carId));
    return res.data;
  },

  /** POST /cart/accessories — Customer */
  addAccessory: async (body: AddAccessoryToCartInput) => {
    const res = await apiClient.post<OperationResult>(API.cart.accessories, body);
    return res.data;
  },

  /** DELETE /cart/accessories/{accessoryId} — Customer */
  removeAccessory: async (accessoryId: number) => {
    const res = await apiClient.delete<OperationResult>(API.cart.accessory(accessoryId));
    return res.data;
  },

  /** PATCH /cart/items — Customer (quantity=0 = xóa luôn) */
  updateItem: async (body: UpdateCartItemInput) => {
    const res = await apiClient.patch<OperationResult>(API.cart.items, body);
    return res.data;
  },

  /** DELETE /cart — Customer */
  clear: async () => {
    const res = await apiClient.delete<OperationResult>(API.cart.root);
    return res.data;
  },
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cartApi,
  type AddCarToCartInput,
  type AddAccessoryToCartInput,
  type UpdateCartItemInput,
} from "src/services/api/functions/cart/cart.api";
import { cartKeys } from "./keys";

/** GET /cart — lấy giỏ hàng server-side (price realtime, isAvailable check) */
export function useServerCart(enabled = true) {
  return useQuery({
    queryKey: cartKeys.detail(),
    queryFn: ({ signal }) => cartApi.get({ signal }),
    enabled,
    staleTime: 30_000,
    retry: false,
  });
}

export function useCartMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: cartKeys.all });

  return {
    addCar: useMutation({
      mutationFn: (body: AddCarToCartInput) => cartApi.addCar(body),
      onSuccess: invalidate,
    }),
    removeCar: useMutation({
      mutationFn: (carId: number) => cartApi.removeCar(carId),
      onSuccess: invalidate,
    }),
    addAccessory: useMutation({
      mutationFn: (body: AddAccessoryToCartInput) => cartApi.addAccessory(body),
      onSuccess: invalidate,
    }),
    removeAccessory: useMutation({
      mutationFn: (accessoryId: number) => cartApi.removeAccessory(accessoryId),
      onSuccess: invalidate,
    }),
    updateItem: useMutation({
      mutationFn: (body: UpdateCartItemInput) => cartApi.updateItem(body),
      onSuccess: invalidate,
    }),
    clearCart: useMutation({
      mutationFn: () => cartApi.clear(),
      onSuccess: invalidate,
    }),
  };
}

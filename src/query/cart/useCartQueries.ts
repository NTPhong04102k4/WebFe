import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cartApi,
  type AddCarToCartInput,
  type AddAccessoryToCartInput,
  type UpdateCartItemInput,
  type CartViewModel,
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
      onMutate: async (carId) => {
        await qc.cancelQueries({ queryKey: cartKeys.detail() });
        const prev = qc.getQueryData<CartViewModel>(cartKeys.detail());
        qc.setQueryData<CartViewModel>(cartKeys.detail(), (old) =>
          old ? { ...old, cars: old.cars.filter((c) => c.carId !== carId) } : old
        );
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev !== undefined) qc.setQueryData(cartKeys.detail(), ctx.prev);
      },
      onSettled: invalidate,
    }),

    addAccessory: useMutation({
      mutationFn: (body: AddAccessoryToCartInput) => cartApi.addAccessory(body),
      onSuccess: invalidate,
    }),

    removeAccessory: useMutation({
      mutationFn: (accessoryId: number) => cartApi.removeAccessory(accessoryId),
      onMutate: async (accessoryId) => {
        await qc.cancelQueries({ queryKey: cartKeys.detail() });
        const prev = qc.getQueryData<CartViewModel>(cartKeys.detail());
        qc.setQueryData<CartViewModel>(cartKeys.detail(), (old) =>
          old
            ? { ...old, accessories: old.accessories.filter((a) => a.accessoryId !== accessoryId) }
            : old
        );
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev !== undefined) qc.setQueryData(cartKeys.detail(), ctx.prev);
      },
      onSettled: invalidate,
    }),

    updateItem: useMutation({
      mutationFn: (body: UpdateCartItemInput) => cartApi.updateItem(body),
      onMutate: async ({ itemId, quantity }) => {
        await qc.cancelQueries({ queryKey: cartKeys.detail() });
        const prev = qc.getQueryData<CartViewModel>(cartKeys.detail());
        qc.setQueryData<CartViewModel>(cartKeys.detail(), (old) =>
          old
            ? {
                ...old,
                accessories: old.accessories.map((a) =>
                  a.accessoryId === itemId
                    ? { ...a, quantity, totalPrice: a.unitPrice * quantity }
                    : a
                ),
              }
            : old
        );
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev !== undefined) qc.setQueryData(cartKeys.detail(), ctx.prev);
      },
      onSettled: invalidate,
    }),

    clearCart: useMutation({
      mutationFn: () => cartApi.clear(),
      onSuccess: () => {
        qc.setQueryData(cartKeys.detail(), null);
        invalidate();
      },
    }),
  };
}

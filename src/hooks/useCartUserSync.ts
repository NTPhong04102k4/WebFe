import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { switchCartUser, useCartStore } from "@/stores/cartStore";
import { cartApi } from "@/services/api/functions/cart/cart.api";
import { cartKeys } from "@/query/cart/keys";

/**
 * Mount một lần ở App root.
 * Khi user thay đổi (login / logout / switch account):
 *   1. Snapshot guest items trước khi switch
 *   2. Gọi switchCartUser để load đúng IDB key
 *   3. Nếu vừa login với role Customer + có guest items → push lên Redis cart
 */
export function useCartUserSync() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.userUUID ?? (user ? `id-${user.id}` : null);
  const isCustomer = user?.role === "Customer";
  const qc = useQueryClient();

  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (prevUserId.current === userId) return;

    const wasGuest =
      prevUserId.current === null || prevUserId.current === undefined;
    const isNowLoggedIn = userId !== null;
    prevUserId.current = userId;

    const doSwitch = async () => {
      // Snapshot trước khi switchCartUser clear memory
      const guestItems = useCartStore.getState().items;

      await switchCartUser(userId);

      // Merge guest cart → server khi login với Customer role
      if (wasGuest && isNowLoggedIn && isCustomer && guestItems.length > 0) {
        await Promise.allSettled(
          guestItems.map((item) =>
            item.type === "car"
              ? cartApi.addCar({ carId: item.id }).catch(() => {})
              : cartApi
                  .addAccessory({ accessoryId: item.id, quantity: item.quantity })
                  .catch(() => {})
          )
        );
        useCartStore.getState().clearCart();
        qc.invalidateQueries({ queryKey: cartKeys.all });
      }
    };

    doSwitch();
  }, [userId, isCustomer, qc]);
}

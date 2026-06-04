import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { notify } from "@/components/core/Feedback/toast";
import { useServerCart, useCartMutations } from "@/query/cart/useCartQueries";

export interface AddCarParams {
  carId: number;
  name: string;
  price: number;
  imagePath?: string;
  discountAmount?: number;
}

export interface AddAccessoryParams {
  accessoryId: number;
  quantity: number;
  name: string;
  price: number;
  imagePath?: string;
}

/**
 * Unified cart hook.
 * Customer (logged-in role="Customer"): server-first via Redis cart API — live prices, cross-device.
 * Guest / other roles: local IndexedDB via cartStore.
 */
export function useCart() {
  const user = useAuthStore((s) => s.user);
  const isCustomer = user?.role === "Customer";

  const guestItems = useCartStore((s) => s.items);
  const guestAddItem = useCartStore((s) => s.addItem);
  const guestRemoveItem = useCartStore((s) => s.removeItem);
  const guestUpdateQuantity = useCartStore((s) => s.updateQuantity);

  const serverCartQuery = useServerCart(isCustomer);
  const mutations = useCartMutations();
  const serverCart = serverCartQuery.data;

  const totalCount = isCustomer
    ? (serverCart?.cars.length ?? 0) + (serverCart?.accessories.length ?? 0)
    : guestItems.reduce((s, i) => s + i.quantity, 0);

  const isInCart = (type: "car" | "accessory", id: number): boolean => {
    if (isCustomer) {
      return type === "car"
        ? (serverCart?.cars.some((c) => c.carId === id) ?? false)
        : (serverCart?.accessories.some((a) => a.accessoryId === id) ?? false);
    }
    return guestItems.some((i) => i.type === type && i.id === id);
  };

  const addCar = async ({ carId, name, price, imagePath, discountAmount }: AddCarParams) => {
    if (isCustomer) {
      try {
        await mutations.addCar.mutateAsync({ carId, discountAmount });
        notify.success("Đã thêm xe vào giỏ hàng");
      } catch {
        // interceptor đã toast lỗi
      }
    } else {
      guestAddItem({ type: "car", id: carId, name, price, imagePath });
      notify.success("Đã thêm xe vào giỏ hàng");
    }
  };

  const addAccessory = async ({
    accessoryId,
    quantity,
    name,
    price,
    imagePath,
  }: AddAccessoryParams) => {
    if (isCustomer) {
      try {
        await mutations.addAccessory.mutateAsync({ accessoryId, quantity });
        notify.success("Đã thêm phụ kiện vào giỏ hàng");
      } catch {
        // interceptor đã toast lỗi
      }
    } else {
      guestAddItem({ type: "accessory", id: accessoryId, name, price, imagePath });
      notify.success("Đã thêm phụ kiện vào giỏ hàng");
    }
  };

  const removeCar = async (carId: number) => {
    if (isCustomer) {
      await mutations.removeCar.mutateAsync(carId);
    } else {
      guestRemoveItem("car", carId);
    }
  };

  const removeAccessory = async (accessoryId: number) => {
    if (isCustomer) {
      await mutations.removeAccessory.mutateAsync(accessoryId);
    } else {
      guestRemoveItem("accessory", accessoryId);
    }
  };

  const updateQuantity = async (type: "car" | "accessory", id: number, quantity: number) => {
    if (isCustomer) {
      if (quantity <= 0) {
        if (type === "car") await mutations.removeCar.mutateAsync(id);
        else await mutations.removeAccessory.mutateAsync(id);
      } else if (type === "accessory") {
        await mutations.updateItem.mutateAsync({ itemType: "accessory", itemId: id, quantity });
      }
    } else {
      guestUpdateQuantity(type, id, quantity);
    }
  };

  return {
    serverCart,
    serverCartQuery,
    guestItems,
    totalCount,
    isCustomer,
    isInCart,
    addCar,
    addAccessory,
    removeCar,
    removeAccessory,
    updateQuantity,
    mutations,
    isAddingCar: mutations.addCar.isPending,
    isAddingAccessory: mutations.addAccessory.isPending,
  };
}

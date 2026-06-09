import type { CartItem } from "@/stores/cartStore";
import type { CartViewModel } from "@/services/api/functions/cart/cart.api";

export type DisplayItem = CartItem & {
  isAvailable?: boolean;
  unavailableReason?: string | null;
};

export function adaptServerCart(cart: CartViewModel | undefined): DisplayItem[] {
  if (!cart) return [];
  return [
    ...cart.cars.map((c) => ({
      type: "car" as const,
      id: c.carID,
      name: c.carName,
      price: c.salePrice,
      quantity: 1,
      isAvailable: c.isAvailable,
      unavailableReason: c.unavailableReason,
    })),
    ...cart.accessories.map((a) => ({
      type: "accessory" as const,
      id: a.accessoryID,
      name: a.accessoryName,
      price: a.unitPrice,
      quantity: a.quantity,
      isAvailable: true,
    })),
  ];
}

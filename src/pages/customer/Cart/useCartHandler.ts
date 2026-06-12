import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notify } from "@/components/core/Feedback/toast";
import {
  createOrderInputFromCart,
  createOrderPreviewInputFromCart,
  orderApi,
  type ApplyPromoResult,
  type InstallmentPlanViewModel,
  type OrderPreviewResult,
} from "@/services/api/functions/orders/order.api";
import { cartApi } from "@/services/api/functions/cart/cart.api";
import { cartKeys } from "@/query/cart/keys";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useCart } from "@/hooks/useCart";
import { useCartMutations } from "@/query/cart/useCartQueries";
import { adaptServerCart, type DisplayItem } from "./cartHelpers";
import type { CartViewModel } from "@/services/api/functions/cart/cart.api";

export type CartHandlerReturn = {
  // Data
  items: DisplayItem[];
  paginatedItems: DisplayItem[];
  selectedItems: DisplayItem[];
  serverCart: CartViewModel | undefined;
  isCustomer: boolean;
  isLoading: boolean;

  // Selection
  selectedItemKeys: Set<string>;
  availableCount: number;
  toggleSelectAll: () => void;
  toggleItem: (key: string) => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;

  // Cart actions
  handleRemove: (type: "car" | "accessory", id: number) => void;
  handleUpdateQuantity: (type: "car" | "accessory", id: number, quantity: number) => void;

  // Order form
  deliveryAddress: string;
  setDeliveryAddress: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  paymentMethod: string;
  handlePaymentMethodChange: (method: string) => void;

  // Installment
  isInstallment: boolean;
  handleInstallmentToggle: () => void;
  installmentMonths: number | null;
  handleInstallmentMonthsChange: (months: number | null) => void;
  downPayment: string;
  setDownPayment: (v: string) => void;
  downPaymentNum: number;
  downPaymentError: string | null;
  minDownPayment: number | null;
  selectedCarTotal: number;
  hasCarInSelection: boolean;
  installmentPlansLoading: boolean;
  installmentPlans: InstallmentPlanViewModel[];
  selectedPlan: InstallmentPlanViewModel | null;

  // Promo
  promoCode: string;
  handlePromoCodeChange: (value: string) => void;
  appliedPromo: ApplyPromoResult | null;
  handleApplyPromo: () => void;
  promoLoading: boolean;

  // Preview
  previewResult: OrderPreviewResult | null;
  previewIsPending: boolean;

  // Summary
  selectedTotal: number;
  canCustomerCheckout: boolean;
  handleCheckout: () => void;
  checkoutPending: boolean;

  // UI
  showPremiumGate: boolean;
  setShowPremiumGate: (v: boolean) => void;
};

export function useCartHandler(): CartHandlerReturn {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { serverCart, serverCartQuery, isCustomer } = useCart();
  const mutations = useCartMutations();

  const localItems = useCartStore((s) => s.items);
  const localRemoveItem = useCartStore((s) => s.removeItem);
  const localUpdateQuantity = useCartStore((s) => s.updateQuantity);

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);

  const items: DisplayItem[] = useMemo(
    () => (isCustomer ? adaptServerCart(serverCart) : localItems),
    [isCustomer, serverCart, localItems],
  );

  // --- Cart item actions ---
  const handleRemove = (type: "car" | "accessory", id: number) => {
    if (isCustomer) {
      type === "car" ? mutations.removeCar.mutate(id) : mutations.removeAccessory.mutate(id);
    } else {
      localRemoveItem(type, id);
    }
  };

  const handleUpdateQuantity = (type: "car" | "accessory", id: number, quantity: number) => {
    if (isCustomer) {
      if (quantity <= 0) {
        type === "car" ? mutations.removeCar.mutate(id) : mutations.removeAccessory.mutate(id);
      } else if (type === "accessory") {
        mutations.updateItem.mutate({ itemType: "accessory", itemId: id, quantity });
      }
    } else {
      localUpdateQuantity(type, id, quantity);
    }
  };

  // --- Form state ---
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentMonths, setInstallmentMonths] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState<string>("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<ApplyPromoResult | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [previewResult, setPreviewResult] = useState<OrderPreviewResult | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedItemKeys, setSelectedItemKeys] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  // --- Derived values ---
  const pageSize = 5;
  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const canCustomerCheckout = Boolean(accessToken) && user?.role === "Customer";
  const availableCount = items.filter((i) => i.isAvailable !== false).length;

  const selectedItems = useMemo(
    () => items.filter((item) => selectedItemKeys.has(`${item.type}-${item.id}`)),
    [items, selectedItemKeys],
  );
  const selectedTotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems],
  );
  const selectedCarTotal = useMemo(
    () => selectedItems.filter((i) => i.type === "car").reduce((sum, i) => sum + i.price, 0),
    [selectedItems],
  );
  const hasCarInSelection = selectedCarTotal > 0;
  const downPaymentNum = parseFloat(downPayment.replace(/\D/g, "")) || 0;

  // --- Installment plans ---
  const installmentPlansQuery = useQuery({
    queryKey: ["installment-plans", selectedCarTotal, downPaymentNum],
    queryFn: () =>
      orderApi.installmentPlans(
        selectedCarTotal > 0 ? selectedCarTotal : undefined,
        downPaymentNum > 0 ? downPaymentNum : undefined,
      ),
    enabled: isInstallment && hasCarInSelection,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
  const installmentPlans: InstallmentPlanViewModel[] = installmentPlansQuery.data ?? [];
  const selectedPlan = installmentPlans.find((p) => p.months === installmentMonths) ?? null;
  const minDownPayment = selectedPlan?.minDownPayment ?? null;
  const downPaymentError =
    selectedPlan && minDownPayment !== null && downPaymentNum < minDownPayment
      ? `Tối thiểu ${minDownPayment} (${selectedPlan.minDownPaymentPct}%)`
      : null;

  // --- Handlers ---
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method !== "BANK_TRANSFER") setIsInstallment(false);
  };

  const handleInstallmentToggle = () => {
    setIsInstallment((v) => !v);
    setInstallmentMonths(null);
    setDownPayment("");
  };

  const handleInstallmentMonthsChange = (months: number | null) => {
    setInstallmentMonths(months);
    const plan = installmentPlans.find((p) => p.months === months);
    setDownPayment(plan?.minDownPayment ? String(plan.minDownPayment) : "");
  };

  const handlePromoCodeChange = (value: string) => {
    setPromoCode(value);
    if (appliedPromo) setAppliedPromo(null);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    const total = previewResult?.totalAmount ?? selectedTotal;
    if (total <= 0) {
      notify.error("Vui lòng chọn sản phẩm trước khi áp dụng mã.");
      return;
    }
    setPromoLoading(true);
    try {
      const result = await orderApi.applyPromo(promoCode.trim(), total);
      setAppliedPromo(result ?? null);
      if (result) notify.success(`Áp dụng thành công! Giảm ${result.discountAmount}`);
    } catch {
      setAppliedPromo(null);
    } finally {
      setPromoLoading(false);
    }
  };

  const toggleSelectAll = () => {
    const availableItems = items.filter((i) => i.isAvailable !== false);
    setSelectedItemKeys((current) =>
      current.size === availableItems.length && availableItems.length > 0
        ? new Set()
        : new Set(availableItems.map((item) => `${item.type}-${item.id}`)),
    );
  };

  const toggleItem = (key: string) => {
    setSelectedItemKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // --- Preview (debounced) ---
  const preview = useMutation({
    mutationFn: (vars: { items: typeof selectedItems }) =>
      orderApi.preview(createOrderPreviewInputFromCart(vars.items)),
    onSuccess: setPreviewResult,
    onError: () => setPreviewResult(null),
  });

  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    if (selectedItems.length === 0 || !canCustomerCheckout) {
      setPreviewResult(null);
      return;
    }
    previewTimerRef.current = setTimeout(() => preview.mutate({ items: selectedItems }), 400);
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [canCustomerCheckout, selectedItems]);

  // --- Create order ---
  const createOrder = useMutation({
    mutationFn: async () => {
      if (selectedItems.length === 0)
        throw new Error("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
      if (!canCustomerCheckout)
        throw new Error("Vui lòng đăng nhập bằng tài khoản Customer để thanh toán.");
      const latestPreview = await orderApi.preview(
        createOrderPreviewInputFromCart(selectedItems),
      );
      if (isInstallment) {
        if (!installmentMonths) throw new Error("Vui lòng chọn kỳ hạn trả góp.");
        if (downPaymentNum <= 0) throw new Error("Vui lòng nhập số tiền đặt cọc.");
        if (downPaymentError) throw new Error(downPaymentError);
      }
      return orderApi.create(
        createOrderInputFromCart(selectedItems, {
          paymentMethod,
          isInstallment,
          installmentMonths: isInstallment ? installmentMonths : null,
          downPayment: isInstallment ? downPaymentNum : null,
          deliveryAddress: deliveryAddress.trim() || null,
          notes: notes.trim() || null,
          previewToken: latestPreview.previewToken,
        }),
      );
    },
    onSuccess: async (result) => {
      if (isCustomer) {
        await Promise.allSettled(
          selectedItems.map((item) =>
            item.type === "car"
              ? cartApi.removeCar(item.id)
              : cartApi.removeAccessory(item.id),
          ),
        );
        qc.invalidateQueries({ queryKey: cartKeys.all });
      } else {
        selectedItems.forEach((item) => localRemoveItem(item.type, item.id));
      }
      setSelectedItemKeys(new Set());
      notify.success("Đã tạo đơn hàng");
      navigate(result?.order?.orderNumber ? `/orders/${result.order.orderNumber}` : "/orders");
    },
    onError: (error: unknown) => {
      const code = (error as { response?: { data?: { errorCode?: string } } })?.response?.data
        ?.errorCode;
      if (code === "OrderLimitExceeded") setShowPremiumGate(true);
    },
  });

  return {
    items,
    paginatedItems,
    selectedItems,
    serverCart,
    isCustomer,
    isLoading: isCustomer && serverCartQuery.isLoading,
    selectedItemKeys,
    availableCount,
    toggleSelectAll,
    toggleItem,
    currentPage,
    totalPages,
    setCurrentPage,
    handleRemove,
    handleUpdateQuantity,
    deliveryAddress,
    setDeliveryAddress,
    notes,
    setNotes,
    paymentMethod,
    handlePaymentMethodChange,
    isInstallment,
    handleInstallmentToggle,
    installmentMonths,
    handleInstallmentMonthsChange,
    downPayment,
    setDownPayment,
    downPaymentNum,
    downPaymentError,
    minDownPayment,
    selectedCarTotal,
    hasCarInSelection,
    installmentPlansLoading: installmentPlansQuery.isLoading,
    installmentPlans,
    selectedPlan,
    promoCode,
    handlePromoCodeChange,
    appliedPromo,
    handleApplyPromo: () => void handleApplyPromo(),
    promoLoading,
    previewResult,
    previewIsPending: preview.isPending,
    selectedTotal,
    canCustomerCheckout,
    handleCheckout: () => createOrder.mutate(),
    checkoutPending: createOrder.isPending,
    showPremiumGate,
    setShowPremiumGate,
  };
}

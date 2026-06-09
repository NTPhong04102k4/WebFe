import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  useCustomerVehicles,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";
import type {
  CustomerVehicleRequest,
  CustomerVehicleViewModel,
} from "src/services/api/functions/workshop/workshop.types";
import { useAuthStore } from "@/stores/authStore";
import { notify } from "@/components/core/Feedback/toast";
import type { SelectOption } from "src/components/core/Select/Select";

export type FormValues = {
  vin: string;
  licensePlate: string;
  brandID: number;
  modelName: string;
  modelYear: number;
  color: string;
  currentMileage: number;
};

const defaultValues: FormValues = {
  vin: "",
  licensePlate: "",
  brandID: 0,
  modelName: "",
  modelYear: new Date().getFullYear(),
  color: "",
  currentMileage: 0,
};

export type GarageHandlerReturn = {
  vehicles: CustomerVehicleViewModel[];
  isLoading: boolean;
  hasError: boolean;
  form: UseFormReturn<FormValues>;
  editingId: number | null;
  brandOptions: SelectOption[];
  loadingBrands: boolean;
  isPending: boolean;
  onSubmit: (values: FormValues) => void;
  startEdit: (v: CustomerVehicleViewModel) => void;
  cancelEdit: () => void;
};

export function useGarageHandler(): GarageHandlerReturn {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userUUID || user?.userID || user?.id;

  const { data: brands = [], isLoading: loadingBrands } = useQuery({
    queryKey: ["brand-cars"],
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 10 * 60_000,
  });

  const { data: list, isLoading, error } = useCustomerVehicles({
    page: 1,
    pageSize: 50,
    userId: userID,
  });

  const { createVehicle, updateVehicle } = useWorkshopMutations();
  const [editingId, setEditingId] = useState<number | null>(null);

  const form = useForm<FormValues>({ defaultValues });

  const vehicles = list?.data ?? [];

  const brandOptions = useMemo<SelectOption[]>(
    () => brands.map((b) => ({ value: b.id, label: b.brandName ?? "" })),
    [brands]
  );

  const onSubmit = async (values: FormValues) => {
    if (!userID) return;

    const body: CustomerVehicleRequest = {
      userID,
      vin: values.vin.trim(),
      licensePlate: values.licensePlate.trim() || undefined,
      brandID: values.brandID,
      modelName: values.modelName.trim(),
      modelYear: Number(values.modelYear),
      color: values.color.trim() || undefined,
      currentMileage: Number(values.currentMileage),
      isActive: true,
    };

    try {
      if (editingId != null) {
        await updateVehicle.mutateAsync({ id: editingId, body });
        notify.success("Đã cập nhật xe.");
      } else {
        await createVehicle.mutateAsync(body);
        notify.success("Đã thêm xe.");
      }
      form.reset(defaultValues);
      setEditingId(null);
    } catch {
      // interceptor đã hiển thị lỗi
    }
  };

  const startEdit = (v: CustomerVehicleViewModel) => {
    setEditingId(v.customerVehicleID);
    form.reset({
      vin: v.vin,
      licensePlate: v.licensePlate ?? "",
      brandID: v.brandID,
      modelName: v.modelName,
      modelYear: v.modelYear,
      color: v.color ?? "",
      currentMileage: v.currentMileage,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    form.reset(defaultValues);
  };

  return {
    vehicles,
    isLoading,
    hasError: !!error,
    form,
    editingId,
    brandOptions,
    loadingBrands,
    isPending: createVehicle.isPending || updateVehicle.isPending,
    onSubmit,
    startEdit,
    cancelEdit,
  };
}

import { useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";

import {
  useInsuranceMutations,
  useInsurancePackages,
  useMyPolicies,
} from "src/query/insurance/useInsuranceQueries";
import { useCustomerVehicles } from "src/query/workshop/useWorkshopQueries";
import { useAuthStore } from "@/stores/authStore";
import { notify } from "@/components/core/Feedback/toast";
import type { SelectOption } from "src/components/core/Select/Select";
import type { InsurancePolicyViewModel } from "src/services/api/functions/insurance/insurance.types";

export type PolicyForm = {
  customerVehicleID: number;
  packageID: number;
  startDate: string;
  endDate: string;
  premiumAmount: number;
};

export type InsuranceHandlerReturn = {
  policies: InsurancePolicyViewModel[];
  polLoading: boolean;
  vehicleOptions: SelectOption[];
  packageOptions: SelectOption[];
  tab: "policies" | "new";
  setTab: (t: "policies" | "new") => void;
  form: UseFormReturn<PolicyForm>;
  isPending: boolean;
  onSubmit: (values: PolicyForm) => Promise<void>;
};

export function useInsuranceHandler(): InsuranceHandlerReturn {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userID ?? user?.id;

  const { data: polRes, isLoading: polLoading } = useMyPolicies(userID);
  const policies = polRes?.data ?? [];

  const { data: vehiclesRes } = useCustomerVehicles({
    page: 1,
    pageSize: 100,
    userId: userID,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: packages = [] } = useInsurancePackages(undefined);

  const { createPolicy } = useInsuranceMutations();
  const [tab, setTab] = useState<"policies" | "new">("policies");

  const form = useForm<PolicyForm>({
    defaultValues: {
      customerVehicleID: 0,
      packageID: 0,
      startDate: "",
      endDate: "",
      premiumAmount: 0,
    },
  });

  const vehicleOptions = useMemo<SelectOption[]>(
    () => vehicles.map((v) => ({ value: v.customerVehicleID, label: `${v.vin} · ${v.modelName}` })),
    [vehicles]
  );

  const packageOptions = useMemo<SelectOption[]>(
    () =>
      packages.map((pk) => ({
        value: pk.packageID,
        label: `${pk.companyName} — ${pk.packageName} (${pk.basePremium?.toLocaleString("vi-VN")} ₫)`,
      })),
    [packages]
  );

  const onSubmit = async (f: PolicyForm) => {
    if (!userID) return;

    try {
      await createPolicy.mutateAsync({
        customerVehicleID: f.customerVehicleID,
        packageID: f.packageID,
        userID,
        startDate: new Date(f.startDate).toISOString(),
        endDate: new Date(f.endDate).toISOString(),
        premiumAmount: Number(f.premiumAmount),
      });
      notify.success("Đã gửi hợp đồng (chờ xử lý).");
      form.reset();
      setTab("policies");
    } catch {
      // interceptor đã hiển thị lỗi
    }
  };

  return {
    policies,
    polLoading,
    vehicleOptions,
    packageOptions,
    tab,
    setTab,
    form,
    isPending: createPolicy.isPending,
    onSubmit,
  };
}

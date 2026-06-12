import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  useCustomerVehicles,
  useWorkOrderDetail,
  useWorkOrders,
} from "src/query/workshop/useWorkshopQueries";
import type { SelectOption } from "src/components/core/Select/Select";
import type { WorkOrderViewModel } from "src/services/api/functions/workshop/workshop.types";

export type WorkOrdersHandlerReturn = {
  rows: WorkOrderViewModel[];
  isLoading: boolean;
  vehicleOptions: SelectOption[];
  vehicleFilter: number | "";
  handleVehicleFilterChange: (value: string) => void;
  openId: number | null;
  toggleDetail: (id: number) => void;
  detailData: WorkOrderViewModel | undefined;
  detailLoading: boolean;
};

export function useWorkOrdersHandler(): WorkOrdersHandlerReturn {
  const { data: vehiclesRes } = useCustomerVehicles({ page: 1, pageSize: 100 });
  const vehicles = vehiclesRes?.data ?? [];

  const [vehicleFilter, setVehicleFilter] = useState<number | "">("");
  const { data: woRes, isLoading } = useWorkOrders({
    page: 1,
    pageSize: 30,
    customerVehicleID: vehicleFilter === "" ? undefined : Number(vehicleFilter),
  });
  const rows = woRes?.data ?? [];

  const [searchParams] = useSearchParams();
  const workOrderIdParam = searchParams.get("workOrderId");
  const [openId, setOpenId] = useState<number | null>(
    workOrderIdParam ? Number(workOrderIdParam) : null
  );
  const detailQuery = useWorkOrderDetail(openId);

  const vehicleOptions = useMemo<SelectOption[]>(
    () =>
      vehicles.map((v) => ({
        value: v.customerVehicleID,
        label: `${v.brandName} ${v.modelName} — ${v.vin}`,
      })),
    [vehicles]
  );

  const handleVehicleFilterChange = (value: string) => {
    setVehicleFilter(value === "" ? "" : Number(value));
  };

  const toggleDetail = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return {
    rows,
    isLoading,
    vehicleOptions,
    vehicleFilter,
    handleVehicleFilterChange,
    openId,
    toggleDetail,
    detailData: detailQuery.data,
    detailLoading: detailQuery.isLoading,
  };
}

import { useMemo } from "react";
import { useForm } from "react-hook-form";

import { notify } from "@/components/core/Feedback/toast";
import { useAppointments, useCustomerVehicles, useWorkshopMutations } from "src/query/workshop/useWorkshopQueries";
import type { AppointmentViewModel } from "src/services/api/functions/workshop/workshop.types";
import { useLocation } from "src/shared/hooks/location";
import { useAuthStore } from "@/stores/authStore";
import type { SelectOption } from "src/components/core/Select/Select";

export type ApptForm = {
  customerVehicleID: number;
  locationID: number;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration_minutes: number;
  appointmentType: string;
  customerNote: string;
};

export function useAppointmentsHandler() {
  const user = useAuthStore((s) => s.user);
  const rawUID = user?.userUUID || user?.userID || user?.id;
  const userID = rawUID != null ? String(rawUID) : undefined;

  const { locations, loading: locLoading } = useLocation();
  const { data: vehiclesRes } = useCustomerVehicles({ page: 1, pageSize: 100, userId: userID });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: apptRes, isLoading } = useAppointments({ page: 1, pageSize: 30 });
  const rows: AppointmentViewModel[] = apptRes?.data ?? [];

  const { createAppointment, cancelAppointment } = useWorkshopMutations();

  const form = useForm<ApptForm>({
    defaultValues: {
      scheduledDate: "",
      scheduledTime: "",
      estimatedDuration_minutes: 60,
      appointmentType: "Maintenance",
      customerNote: "",
    },
  });

  const vehicleOptions = useMemo<SelectOption[]>(
    () => vehicles.map((v) => ({ value: v.customerVehicleID, label: `${v.brandName ?? ""} ${v.modelName} · ${v.vin}` })),
    [vehicles]
  );

  const locationOptions = useMemo<SelectOption[]>(
    () => locations.map((l) => ({ value: l.locationID, label: l.locationName })),
    [locations]
  );

  const onCreate = async (f: ApptForm) => {
    const isoString =
      f.scheduledDate && f.scheduledTime
        ? new Date(`${f.scheduledDate}T${f.scheduledTime}`).toISOString()
        : "";
    try {
      await createAppointment.mutateAsync({
        customerVehicleID: f.customerVehicleID,
        locationID: f.locationID,
        scheduledDateTime: isoString,
        estimatedDuration_minutes: Number(f.estimatedDuration_minutes),
        appointmentType: f.appointmentType,
        customerNote: f.customerNote || undefined,
        services: [],
      });
      notify.success("Đã gửi lịch hẹn.");
      form.reset();
    } catch {
      // interceptor handles error toast
    }
  };

  const onCancel = async (id: number) => {
    try {
      await cancelAppointment.mutateAsync({
        id,
        body: { status: "Cancelled", cancelReason: "Khách hàng hủy trên web" },
      });
      notify.success("Đã hủy lịch.");
    } catch {
      // interceptor handles error toast
    }
  };

  return {
    form,
    vehicleOptions,
    locationOptions,
    locLoading,
    onCreate,
    isCreating: createAppointment.isPending,
    rows,
    isLoading,
    onCancel,
    isCancelling: cancelAppointment.isPending,
  };
}

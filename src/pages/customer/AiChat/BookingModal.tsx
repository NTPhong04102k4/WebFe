import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { notify } from "@/components/core/Feedback/toast";
import { workshopApi } from "@/services/api/functions/workshop/workshop.api";
import type { BookingPromptMetadata } from "@/services/api/functions/ai/ai.api";

type BookingService = BookingPromptMetadata["services"][number];

interface Props {
  open: boolean;
  preselectedServices: BookingService[];
  onClose: () => void;
}

export function BookingModal({ open, preselectedServices, onClose }: Props) {
  const [vehicleId, setVehicleId] = useState("");
  const [locationId, setLocationId] = useState("1");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const vehiclesQuery = useQuery({
    queryKey: ["workshop-customer-vehicles", "ai-booking"],
    queryFn: ({ signal }) =>
      workshopApi.listCustomerVehicles({ page: 1, pageSize: 50 }, { signal }),
    enabled: open,
  });

  const duration = useMemo(
    () => preselectedServices.reduce((sum, service) => sum + service.duration, 0),
    [preselectedServices]
  );

  const createMutation = useMutation({
    mutationFn: () =>
      workshopApi.createAppointment({
        customerVehicleID: Number(vehicleId),
        locationID: Number(locationId),
        scheduledDateTime,
        estimatedDuration_minutes: duration,
        appointmentType: "Maintenance",
        customerNote: customerNote.trim() || null,
        services: preselectedServices.map((service) => ({
          serviceID: service.serviceId,
          estimatedPrice: service.price,
        })),
      }),
    onSuccess: () => {
      notify.success("Da gui yeu cau dat lich.");
      onClose();
    },
  });

  if (!open) return null;

  const vehicles = vehiclesQuery.data?.data ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vehicleId || !locationId || !scheduledDateTime) {
      notify.error("Vui long nhap day du xe, dia diem va thoi gian hen.");
      return;
    }
    if (preselectedServices.length === 0) {
      notify.error("Chua co dich vu de dat lich.");
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">Dat lich dich vu</h2>
          <p className="mt-1 text-xs text-slate-500">
            Can co xe da dang ky trong garage truoc khi dat lich.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <div className="text-xs font-semibold text-slate-600">Dich vu</div>
            <div className="mt-2 space-y-1">
              {preselectedServices.map((service) => (
                <div key={service.serviceId} className="flex justify-between gap-3 text-sm text-slate-700">
                  <span>{service.name}</span>
                  <span className="shrink-0 font-medium">{service.price.toLocaleString("vi-VN")}d</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-xs text-slate-500">Thoi luong du kien: {duration} phut</div>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Xe cua ban</span>
            <select
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            >
              <option value="">Chon xe da dang ky</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.customerVehicleID} value={vehicle.customerVehicleID}>
                  {vehicle.brandName ? `${vehicle.brandName} ` : ""}
                  {vehicle.modelName} {vehicle.modelYear}
                  {vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Ma dia diem</span>
            <input
              type="number"
              min={1}
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Thoi gian hen</span>
            <input
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(event) => setScheduledDateTime(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-600">Ghi chu</span>
            <textarea
              value={customerNote}
              onChange={(event) => setCustomerNote(event.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Huy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {createMutation.isPending ? "Dang gui..." : "Dat lich"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

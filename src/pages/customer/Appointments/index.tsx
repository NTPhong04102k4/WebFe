import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { useLocationList } from "@/query/location/useLocationQueries";
import { useServiceCatalog } from "@/query/service-catalog/useServiceCatalogQueries";
import { useAppointments, useCustomerVehicles, useWorkshopMutations } from "@/query/workshop/useWorkshopQueries";

export default function CustomerAppointmentsPage() {
  const [customerVehicleID, setCustomerVehicleID] = useState("");
  const [locationID, setLocationID] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  const appointments = useAppointments({ page: 1, pageSize: 20 });
  const vehicles = useCustomerVehicles({ page: 1, pageSize: 100 });
  const locations = useLocationList();
  const services = useServiceCatalog({ page: 1, pageSize: 100, isActive: true });
  const { createAppointment, cancelAppointment } = useWorkshopMutations();

  const serviceOptions = services.data?.data ?? [];
  const selectedService = useMemo(
    () => serviceOptions.find((service) => String(service.serviceID) === serviceID),
    [serviceOptions, serviceID]
  );

  const submit = () => {
    if (!customerVehicleID || !locationID || !serviceID || !scheduledDateTime) {
      toast.error("Vui lòng chọn xe, chi nhánh, dịch vụ và thời gian");
      return;
    }
    createAppointment.mutate(
      {
        customerVehicleID: Number(customerVehicleID),
        locationID: Number(locationID),
        scheduledDateTime: new Date(scheduledDateTime).toISOString(),
        estimatedDuration_minutes: selectedService?.estimatedDuration_minutes ?? 60,
        appointmentType: "Service",
        customerNote: customerNote.trim() || null,
        services: [
          {
            serviceID: Number(serviceID),
            estimatedPrice: selectedService?.price ?? 0,
          },
        ],
      },
      { onSuccess: () => toast.success("Đã đặt lịch dịch vụ"), onError: (error: Error) => toast.error(error.message) }
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Đặt dịch vụ và lịch hẹn</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Tạo lịch hẹn</h2>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Xe của tôi</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={customerVehicleID} onChange={(event) => setCustomerVehicleID(event.target.value)}>
              <option value="">Chọn xe</option>
              {(vehicles.data?.data ?? []).map((vehicle) => (
                <option key={vehicle.customerVehicleID} value={vehicle.customerVehicleID}>
                  {vehicle.brandName} {vehicle.modelName} · {vehicle.licensePlate ?? vehicle.vin}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Chi nhánh</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={locationID} onChange={(event) => setLocationID(event.target.value)}>
              <option value="">Chọn chi nhánh</option>
              {(locations.data ?? []).map((location: any) => (
                <option key={location.locationID ?? location.id} value={location.locationID ?? location.id}>
                  {location.locationName ?? location.name ?? location.address}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Dịch vụ</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={serviceID} onChange={(event) => setServiceID(event.target.value)}>
              <option value="">Chọn dịch vụ</option>
              {serviceOptions.map((service) => (
                <option key={service.serviceID} value={service.serviceID}>
                  {service.serviceName} · {formatCurrency(service.price)}
                </option>
              ))}
            </select>
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Thời gian</span>
            <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" type="datetime-local" value={scheduledDateTime} onChange={(event) => setScheduledDateTime(event.target.value)} />
          </label>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Ghi chú</span>
            <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={3} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} />
          </label>
          <button className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50" disabled={createAppointment.isPending} onClick={submit}>
            {createAppointment.isPending ? "Đang đặt..." : "Đặt lịch"}
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">Lịch hẹn hiện có</h2>
          </div>
          <div className="divide-y">
            {(appointments.data?.data ?? []).map((item) => (
              <div key={item.appointmentID} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{item.appointmentNumber}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.vehicleInfo} · {item.locationName}</div>
                    <div className="mt-1 text-sm text-slate-600">{new Date(item.scheduledDateTime).toLocaleString("vi-VN")}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700">{item.status}</div>
                    {item.status !== "Cancelled" ? (
                      <button className="mt-2 text-sm text-red-600" onClick={() => cancelAppointment.mutate({ id: item.appointmentID, body: { status: "Cancelled", cancelReason: "Customer cancelled" } })}>
                        Hủy
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {!appointments.isLoading && (appointments.data?.data ?? []).length === 0 ? (
              <div className="p-6 text-center text-slate-600">Chưa có lịch hẹn.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, X } from "lucide-react";
import { notify } from "@/components/core/Feedback/toast";

import { useAuthStore } from "@/stores/authStore";
import { formatCurrency } from "@/common/utils/formatCurrency";
import { useLocationList } from "@/query/location/useLocationQueries";
import { useServiceCatalog } from "@/query/service-catalog/useServiceCatalogQueries";
import { useAppointments, useCustomerVehicles, useWorkshopMutations } from "@/query/workshop/useWorkshopQueries";
import { brandCarRouteFn } from "src/services/api/functions/BrandCar/Routes.Fn";

const CURRENT_YEAR = new Date().getFullYear();

type VehicleFormState = {
  brandID: string;
  modelName: string;
  modelYear: string;
  vin: string;
  licensePlate: string;
  color: string;
  currentMileage: string;
};

const defaultVehicleForm: VehicleFormState = {
  brandID: "",
  modelName: "",
  modelYear: String(CURRENT_YEAR),
  vin: "",
  licensePlate: "",
  color: "",
  currentMileage: "0",
};

export default function CustomerAppointmentsPage() {
  const userUUID = useAuthStore((state) => state.user?.userUUID);

  // Appointment booking form
  const [customerVehicleID, setCustomerVehicleID] = useState("");
  const [locationID, setLocationID] = useState("");
  const [serviceID, setServiceID] = useState("");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [customerNote, setCustomerNote] = useState("");

  // Add vehicle modal
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(defaultVehicleForm);

  const appointments = useAppointments({ page: 1, pageSize: 20 });
  const vehicles = useCustomerVehicles({ page: 1, pageSize: 100 });
  const locations = useLocationList();
  const services = useServiceCatalog({ page: 1, pageSize: 100, isActive: true });
  const { createAppointment, cancelAppointment, createVehicle } = useWorkshopMutations();

  const { data: brands = [] } = useQuery({
    queryKey: ["brand-cars"],
    queryFn: () => brandCarRouteFn.getBrandsCars(),
    staleTime: 10 * 60_000,
  });

  const serviceOptions = services.data?.data ?? [];
  const selectedService = useMemo(
    () => serviceOptions.find((s) => String(s.serviceID) === serviceID),
    [serviceOptions, serviceID]
  );

  const submit = () => {
    if (!customerVehicleID || !locationID || !serviceID || !scheduledDateTime) {
      notify.info("Vui lòng chọn xe, chi nhánh, dịch vụ và thời gian");
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
      {
        onSuccess: () => {
          notify.success("Đã đặt lịch dịch vụ");
          setCustomerVehicleID("");
          setLocationID("");
          setServiceID("");
          setScheduledDateTime("");
          setCustomerNote("");
        },
        onError: (error: Error) => notify.error(error.message),
      }
    );
  };

  const submitVehicle = async () => {
    if (!vehicleForm.brandID || !vehicleForm.modelName || !vehicleForm.vin) {
      notify.info("Vui lòng điền hãng xe, dòng xe và số VIN");
      return;
    }
    if (!userUUID) {
      notify.error("Không xác định được tài khoản, vui lòng đăng nhập lại");
      return;
    }
    try {
      await createVehicle.mutateAsync({
        userID: userUUID,
        brandID: Number(vehicleForm.brandID),
        modelName: vehicleForm.modelName.trim(),
        modelYear: Number(vehicleForm.modelYear) || CURRENT_YEAR,
        vin: vehicleForm.vin.trim(),
        licensePlate: vehicleForm.licensePlate.trim() || null,
        color: vehicleForm.color.trim() || null,
        currentMileage: Number(vehicleForm.currentMileage) || 0,
        isActive: true,
      });
      notify.success("Đã thêm xe thành công");
      setVehicleModalOpen(false);
      setVehicleForm(defaultVehicleForm);
    } catch (error: unknown) {
      const msg = (error as any)?.response?.data?.message ?? (error as Error).message ?? "Lỗi thêm xe";
      notify.error(msg);
    }
  };

  const updateVehicleField = (field: keyof VehicleFormState) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setVehicleForm((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900">Đặt dịch vụ và lịch hẹn</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        {/* ── Booking form ──────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Tạo lịch hẹn</h2>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Xe của tôi</span>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                onClick={() => setVehicleModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                Thêm xe
              </button>
            </div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={customerVehicleID}
              onChange={(e) => setCustomerVehicleID(e.target.value)}
            >
              <option value="">Chọn xe</option>
              {(vehicles.data?.data ?? []).map((v) => (
                <option key={v.customerVehicleID} value={v.customerVehicleID}>
                  {v.brandName} {v.modelName} · {v.licensePlate ?? v.vin}
                </option>
              ))}
            </select>
            {!vehicles.isLoading && (vehicles.data?.data ?? []).length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Chưa có xe — nhấn{" "}
                <button
                  type="button"
                  className="font-medium text-blue-600 underline"
                  onClick={() => setVehicleModalOpen(true)}
                >
                  Thêm xe
                </button>{" "}
                để đăng ký xe của bạn.
              </p>
            )}
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Chi nhánh</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={locationID}
              onChange={(e) => setLocationID(e.target.value)}
            >
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
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={serviceID}
              onChange={(e) => setServiceID(e.target.value)}
            >
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
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              type="datetime-local"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
            />
          </label>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">Ghi chú</span>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
            />
          </label>

          <button
            className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={createAppointment.isPending}
            onClick={submit}
          >
            {createAppointment.isPending ? "Đang đặt..." : "Đặt lịch"}
          </button>
        </div>

        {/* ── Appointment list ──────────────────────────────── */}
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
                    <div className="mt-1 text-sm text-slate-600">
                      {item.vehicleInfo} · {item.locationName}
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {new Date(item.scheduledDateTime).toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-700">{item.status}</div>
                    {item.status !== "Cancelled" ? (
                      <button
                        className="mt-2 text-sm text-red-600"
                        onClick={() =>
                          cancelAppointment.mutate({
                            id: item.appointmentID,
                            body: { status: "Cancelled", cancelReason: "Customer cancelled" },
                          })
                        }
                      >
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

      {/* ── Add vehicle modal ──────────────────────────────── */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="text-base font-semibold text-slate-900">Thêm xe của tôi</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600"
                onClick={() => {
                  setVehicleModalOpen(false);
                  setVehicleForm(defaultVehicleForm);
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Hãng xe <span className="text-red-500">*</span>
                </label>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={vehicleForm.brandID}
                  onChange={updateVehicleField("brandID")}
                >
                  <option value="">Chọn hãng xe</option>
                  {brands.map((brand: any) => {
                    const id = brand.brandID ?? brand.id ?? 0;
                    return (
                      <option key={id} value={id}>
                        {brand.brandName ?? `Brand #${id}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Dòng xe <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="VD: Camry, Civic..."
                  value={vehicleForm.modelName}
                  onChange={updateVehicleField("modelName")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Năm sản xuất</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  type="number"
                  min={1990}
                  max={CURRENT_YEAR + 1}
                  value={vehicleForm.modelYear}
                  onChange={updateVehicleField("modelYear")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Số VIN <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="17 ký tự VIN"
                  value={vehicleForm.vin}
                  onChange={updateVehicleField("vin")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Biển số xe</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="VD: 51A-123.45"
                  value={vehicleForm.licensePlate}
                  onChange={updateVehicleField("licensePlate")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Màu sắc</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  placeholder="VD: Trắng, Đen..."
                  value={vehicleForm.color}
                  onChange={updateVehicleField("color")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700">
                  Số km hiện tại
                </label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  type="number"
                  min={0}
                  value={vehicleForm.currentMileage}
                  onChange={updateVehicleField("currentMileage")}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-5 py-4">
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => {
                  setVehicleModalOpen(false);
                  setVehicleForm(defaultVehicleForm);
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-blue-700"
                disabled={createVehicle.isPending}
                onClick={submitVehicle}
              >
                {createVehicle.isPending ? "Đang lưu..." : "Thêm xe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

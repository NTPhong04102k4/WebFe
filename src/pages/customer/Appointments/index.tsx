import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { formatCurrency } from "@/common/utils/formatCurrency";
import { notify } from "@/components/core/Feedback/toast";
import { useAuthStore } from "@/stores/authStore";
import {
  useAppointments,
  useCustomerVehicles,
  useWorkshopMutations,
} from "@/query/workshop/useWorkshopQueries";
import { useServiceCatalog } from "src/query/service-catalog/useServiceCatalogQueries";
import { EmptyState } from "src/components/core/Feedback/EmptyState";
import type { AppointmentServiceItem } from "src/services/api/functions/workshop/workshop.types";

// ── Booking modal ─────────────────────────────────────────────────────────────

interface SelectedService extends AppointmentServiceItem {
  serviceName: string;
}

function BookingModal({
  onClose,
  preselectedServiceID,
}: {
  onClose: () => void;
  preselectedServiceID: number | null;
}) {
  const user = useAuthStore((s) => s.user);
  const userID = user?.userID ?? user?.id;

  const { data: vehiclesRes } = useCustomerVehicles({ page: 1, pageSize: 100, userId: userID });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: catalogRes } = useServiceCatalog({ page: 1, pageSize: 100, isActive: true });
  const catalog = catalogRes?.data ?? [];

  const { createAppointment } = useWorkshopMutations();

  const [vehicleID, setVehicleID] = useState("");
  const [locationID, setLocationID] = useState("1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [appointmentType, setAppointmentType] = useState("Maintenance");
  const [customerNote, setCustomerNote] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [addServiceID, setAddServiceID] = useState("");

  // Pre-select service from URL param
  useEffect(() => {
    if (!preselectedServiceID || catalog.length === 0) return;
    const svc = catalog.find((s) => s.serviceID === preselectedServiceID);
    if (svc && !selectedServices.some((s) => s.serviceID === svc.serviceID)) {
      setSelectedServices([{ serviceID: svc.serviceID, estimatedPrice: svc.price, notes: null, serviceName: svc.serviceName }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedServiceID, catalog.length]);

  const totalDuration = useMemo(() => {
    const ids = selectedServices.map((s) => s.serviceID);
    return catalog
      .filter((c) => ids.includes(c.serviceID))
      .reduce((sum, c) => sum + c.estimatedDuration_minutes, 0);
  }, [selectedServices, catalog]);

  const addService = () => {
    if (!addServiceID) return;
    const svc = catalog.find((c) => c.serviceID === Number(addServiceID));
    if (!svc) return;
    if (selectedServices.some((s) => s.serviceID === svc.serviceID)) {
      notify.error("Dịch vụ này đã được chọn.");
      return;
    }
    setSelectedServices((prev) => [
      ...prev,
      { serviceID: svc.serviceID, estimatedPrice: svc.price, notes: null, serviceName: svc.serviceName },
    ]);
    setAddServiceID("");
  };

  const removeService = (serviceID: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceID !== serviceID));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleID) { notify.error("Vui lòng chọn xe."); return; }
    if (!date || !time) { notify.error("Vui lòng chọn ngày và giờ hẹn."); return; }
    if (selectedServices.length === 0) { notify.error("Vui lòng chọn ít nhất 1 dịch vụ."); return; }

    try {
      await createAppointment.mutateAsync({
        customerVehicleID: Number(vehicleID),
        locationID: Number(locationID),
        scheduledDateTime: new Date(`${date}T${time}`).toISOString(),
        estimatedDuration_minutes: totalDuration || 60,
        appointmentType,
        customerNote: customerNote.trim() || null,
        services: selectedServices.map((s) => ({
          serviceID: s.serviceID,
          estimatedPrice: s.estimatedPrice,
          notes: s.notes,
        })),
      });
      notify.success("Đã gửi yêu cầu đặt lịch!");
      onClose();
    } catch {
      /* interceptor đã toast */
    }
  };

  const unavailableIDs = new Set(selectedServices.map((s) => s.serviceID));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-semibold text-slate-900">Tạo lịch hẹn mới</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 space-y-4 px-5 py-4">
          {/* Dịch vụ đã chọn */}
          <div>
            <span className="text-sm font-medium text-slate-700">Dịch vụ đã chọn</span>
            {selectedServices.length === 0 ? (
              <p className="mt-1 text-sm text-slate-400">Chưa chọn dịch vụ nào.</p>
            ) : (
              <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
                {selectedServices.map((s) => (
                  <div key={s.serviceID} className="flex items-center justify-between gap-2 text-sm">
                    <div>
                      <span className="font-medium text-slate-800">{s.serviceName}</span>
                      <span className="ml-2 text-slate-500">{formatCurrency(s.estimatedPrice)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeService(s.serviceID)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                {totalDuration > 0 && (
                  <p className="mt-1 text-xs text-slate-400">⏱ Thời lượng dự kiến: {totalDuration} phút</p>
                )}
              </div>
            )}
          </div>

          {/* Thêm dịch vụ */}
          <div>
            <span className="block text-sm font-medium text-slate-700">Thêm dịch vụ</span>
            <div className="mt-1 flex gap-2">
              <select
                value={addServiceID}
                onChange={(e) => setAddServiceID(e.target.value)}
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">— Chọn dịch vụ —</option>
                {catalog
                  .filter((c) => !unavailableIDs.has(c.serviceID))
                  .map((c) => (
                    <option key={c.serviceID} value={c.serviceID}>
                      {c.serviceName} — {formatCurrency(c.price)}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addService}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium hover:bg-slate-200"
              >
                Thêm
              </button>
            </div>
          </div>

          {/* Xe */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Xe của bạn <span className="text-red-500">*</span></span>
            {vehicles.length === 0 ? (
              <div className="mt-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                Bạn chưa có xe nào.{" "}
                <Link to="/profile" className="font-medium underline">Thêm xe trong hồ sơ</Link>
              </div>
            ) : (
              <select
                required
                value={vehicleID}
                onChange={(e) => setVehicleID(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="">— Chọn xe —</option>
                {vehicles.map((v) => (
                  <option key={v.customerVehicleID} value={v.customerVehicleID}>
                    {v.brandName} {v.modelName} {v.modelYear}
                    {v.licensePlate ? ` — ${v.licensePlate}` : ""}
                  </option>
                ))}
              </select>
            )}
          </label>

          {/* Ngày giờ */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Ngày hẹn <span className="text-red-500">*</span></span>
              <input
                required
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Giờ hẹn</span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </label>
          </div>

          {/* Loại hẹn + Chi nhánh */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Loại hẹn</span>
              <select
                value={appointmentType}
                onChange={(e) => setAppointmentType(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              >
                <option value="Maintenance">Bảo dưỡng</option>
                <option value="Repair">Sửa chữa</option>
                <option value="Inspection">Kiểm tra</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Chi nhánh (ID)</span>
              <input
                type="number"
                min={1}
                value={locationID}
                onChange={(e) => setLocationID(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
              />
            </label>
          </div>

          {/* Ghi chú */}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Mô tả vấn đề / ghi chú</span>
            <textarea
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              rows={3}
              placeholder="VD: Xe hay rung ở tốc độ cao..."
              className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-400"
            />
          </label>

          <div className="flex justify-end gap-2 pt-1 border-t">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createAppointment.isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createAppointment.isPending ? "Đang gửi..." : "Đặt lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Scheduled:   "bg-amber-50 text-amber-700",
    Confirmed:   "bg-blue-50 text-blue-700",
    "In-Progress": "bg-indigo-50 text-indigo-700",
    Completed:   "bg-green-50 text-green-700",
    Cancelled:   "bg-red-50 text-red-700",
    NoShow:      "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CustomerAppointmentsPage() {
  const [searchParams] = useSearchParams();
  const preselectedServiceID = searchParams.get("serviceID") ? Number(searchParams.get("serviceID")) : null;

  const [bookingOpen, setBookingOpen] = useState(!!preselectedServiceID);

  const user = useAuthStore((s) => s.user);
  const accessToken = useAuthStore((s) => s.accessToken);
  const canLoad = Boolean(accessToken) && user?.role === "Customer";

  const appointments = useAppointments({ page: 1, pageSize: 20 });
  const { cancelAppointment } = useWorkshopMutations();

  const rows = appointments.data?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch hẹn của tôi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Xem và quản lý lịch bảo dưỡng / sửa chữa.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/services"
            className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Xem dịch vụ
          </Link>
          {canLoad && (
            <button
              type="button"
              onClick={() => setBookingOpen(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Tạo lịch hẹn
            </button>
          )}
        </div>
      </div>

      {!canLoad ? (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Vui lòng đăng nhập bằng tài khoản Customer để xem lịch hẹn.
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">Lịch hẹn hiện có</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {appointments.isLoading && (
              <p className="p-6 text-center text-sm text-slate-500">Đang tải...</p>
            )}

            {!appointments.isLoading && rows.length === 0 && (
              <EmptyState
                title="Chưa có lịch hẹn"
                description="Chọn dịch vụ và đặt lịch để được phục vụ."
              />
            )}

            {rows.map((appt) => (
              <div key={appt.appointmentID} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{appt.appointmentNumber}</span>
                      <StatusBadge status={appt.status} />
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {appt.vehicleInfo}
                      {appt.locationName ? ` · ${appt.locationName}` : ""}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {new Date(appt.scheduledDateTime).toLocaleString("vi-VN")}
                    </div>
                    {Array.isArray((appt as any).services) && (appt as any).services.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(appt as any).services.map((s: any) => (
                          <span key={s.appointmentServiceID ?? s.serviceID} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {s.serviceName ?? `#${s.serviceID}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {appt.status !== "Cancelled" && appt.status !== "Completed" && (
                    <button
                      type="button"
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                      disabled={cancelAppointment.isPending}
                      onClick={() =>
                        cancelAppointment.mutate({
                          id: appt.appointmentID,
                          body: { status: "Cancelled", cancelReason: "Khách hàng hủy" },
                        })
                      }
                    >
                      Hủy lịch
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookingOpen && (
        <BookingModal
          onClose={() => setBookingOpen(false)}
          preselectedServiceID={preselectedServiceID}
        />
      )}
    </div>
  );
}

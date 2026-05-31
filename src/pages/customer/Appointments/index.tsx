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
import { useLocation } from "src/shared/hooks/location";
import { EmptyState } from "src/components/core/Feedback/EmptyState";
import { Modal } from "src/components/core/Modal";
import { Select } from "src/components/core/Select";
import { Input } from "src/components/core/Form";
import { ComboTreeBox } from "src/components/core/ComboTreeBox";
import type { ComboTreeItem } from "src/components/core/ComboTreeBox/ComboTreeBox";
import { useCategoryList } from "src/query/category/useCategoryQueries";
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
  const rawUID = user?.userUUID || user?.userID || user?.id;
  const userID = rawUID != null ? String(rawUID) : undefined;

  const { data: vehiclesRes } = useCustomerVehicles({ page: 1, pageSize: 100, userId: userID });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: catalogRes, isLoading: catalogLoading } = useServiceCatalog({ page: 1, pageSize: 100, isActive: true });
  const catalog = catalogRes?.data ?? [];

  const { data: categoriesData } = useCategoryList();
  const categories = categoriesData ?? [];

  const { locations, loading: locLoading, error: locError } = useLocation();

  const { createAppointment } = useWorkshopMutations();

  const [vehicleID, setVehicleID] = useState("");
  const [locationID, setLocationID] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");
  const [appointmentType, setAppointmentType] = useState("Maintenance");
  const [customerNote, setCustomerNote] = useState("");
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

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

  const unavailableIDs = useMemo(
    () => new Set(selectedServices.map((s) => s.serviceID)),
    [selectedServices],
  );

  const serviceTree = useMemo((): ComboTreeItem[] => {
    if (!catalog.length) return [];

    const available = catalog.filter((svc) => !unavailableIDs.has(svc.serviceID));

    // Flat fallback khi chưa có categories
    if (!categories.length) {
      return available.map((svc) => ({
        id: String(svc.serviceID),
        label: `${svc.serviceName} — ${formatCurrency(svc.price)}`,
      }));
    }

    const byCategory = new Map<number, typeof available>();
    available.forEach((svc) => {
      if (!byCategory.has(svc.categoryID)) byCategory.set(svc.categoryID, []);
      byCategory.get(svc.categoryID)!.push(svc);
    });

    function buildTree(parentID: number | null): ComboTreeItem[] {
      const nodes: ComboTreeItem[] = [];
      categories
        .filter((c) => c.parentCategoryID === parentID && c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .forEach((cat) => {
          const children: ComboTreeItem[] = [
            ...buildTree(cat.categoryID),
            ...(byCategory.get(cat.categoryID) ?? []).map((svc) => ({
              id: String(svc.serviceID),
              label: `${svc.serviceName} — ${formatCurrency(svc.price)}`,
            })),
          ];
          if (children.length) nodes.push({ id: `cat-${cat.categoryID}`, label: cat.categoryName, children });
        });
      return nodes;
    }

    const tree = buildTree(null);
    // Fallback: nếu tree rỗng (services không khớp category nào) thì flat list
    if (!tree.length) {
      return available.map((svc) => ({
        id: String(svc.serviceID),
        label: `${svc.serviceName} — ${formatCurrency(svc.price)}`,
      }));
    }
    return tree;
  }, [catalog, categories, unavailableIDs]);

  const handleAddService = (id: string) => {
    const svc = catalog.find((c) => String(c.serviceID) === id);
    if (!svc) return;
    if (unavailableIDs.has(svc.serviceID)) { notify.error("Dịch vụ này đã được chọn."); return; }
    setSelectedServices((prev) => [
      ...prev,
      { serviceID: svc.serviceID, estimatedPrice: svc.price, notes: null, serviceName: svc.serviceName },
    ]);
  };

  const removeService = (serviceID: number) => {
    setSelectedServices((prev) => prev.filter((s) => s.serviceID !== serviceID));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleID) { notify.error("Vui lòng chọn xe."); return; }
    if (!locationID || locationID === "0") { notify.error("Vui lòng chọn chi nhánh."); return; }
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

  return (
    <Modal
      open
      title="Tạo lịch hẹn mới"
      onClose={onClose}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="booking-form"
            disabled={createAppointment.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createAppointment.isPending ? "Đang gửi..." : "Đặt lịch"}
          </button>
        </div>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit} className="space-y-4">
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
        <ComboTreeBox
          label="Thêm dịch vụ"
          placeholder="Tìm và chọn dịch vụ..."
          items={serviceTree}
          loading={catalogLoading}
          onChange={handleAddService}
        />

        {/* Xe */}
        {vehicles.length === 0 ? (
          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
            <span className="block text-sm font-medium text-slate-800 mb-1">Xe của bạn <span className="text-red-500">*</span></span>
            Bạn chưa có xe nào.{" "}
            <Link to="/profile" className="font-medium underline">Thêm xe trong hồ sơ</Link>
          </div>
        ) : (
          <Select
            label="Xe của bạn"
            required
            placeholder="— Chọn xe —"
            value={vehicleID}
            onChange={(e) => setVehicleID(e.target.value)}
            options={vehicles.map((v) => ({
              value: v.customerVehicleID,
              label: `${v.brandName} ${v.modelName} ${v.modelYear}${v.licensePlate ? ` — ${v.licensePlate}` : ""}`,
            }))}
          />
        )}

        {/* Ngày giờ */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Ngày hẹn"
            required
            type="date"
            value={date}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            label="Giờ hẹn"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Loại hẹn + Chi nhánh */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Loại hẹn"
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            options={[
              { value: "Maintenance", label: "Bảo dưỡng" },
              { value: "Repair", label: "Sửa chữa" },
              { value: "Inspection", label: "Kiểm tra" },
            ]}
          />
          <Select
            label="Chi nhánh"
            required
            placeholder={locLoading ? "Đang tải..." : "— Chọn chi nhánh —"}
            value={locationID}
            onChange={(e) => setLocationID(e.target.value)}
            disabled={locLoading}
            error={locError ? "Không tải được danh sách chi nhánh" : undefined}
            options={locations.map((loc) => ({
              value: String(loc.locationID),
              label: `${loc.locationName} — ${loc.address}, ${loc.city}`,
            }))}
          />
        </div>

        {/* Ghi chú */}
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800">Mô tả vấn đề / ghi chú</label>
          <textarea
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            rows={3}
            placeholder="VD: Xe hay rung ở tốc độ cao..."
            className="w-full resize-none rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25"
          />
        </div>
      </form>
    </Modal>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  Pending:       "Chờ xác nhận",
  Scheduled:     "Đã vào lịch",
  Confirmed:     "Đã xác nhận",
  "In-Progress": "Đang thực hiện",
  Completed:     "Hoàn thành",
  Cancelled:     "Đã huỷ",
  NoShow:        "Không đến",
};

const STATUS_CLASS: Record<string, string> = {
  Pending:       "bg-amber-50 text-amber-700",
  Scheduled:     "bg-blue-50 text-blue-700",
  Confirmed:     "bg-green-50 text-green-700",
  "In-Progress": "bg-indigo-50 text-indigo-700",
  Completed:     "bg-emerald-50 text-emerald-700",
  Cancelled:     "bg-red-50 text-red-600",
  NoShow:        "bg-slate-100 text-slate-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status] ?? "bg-slate-100 text-slate-600"}`}>
      {STATUS_LABEL[status] ?? status}
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

                  {["Pending", "Scheduled", "Confirmed"].includes(appt.status) && (
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

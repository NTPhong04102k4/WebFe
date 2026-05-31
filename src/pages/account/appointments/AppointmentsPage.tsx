import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import {
  useAppointments,
  useCustomerVehicles,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useLocation } from "src/shared/hooks/location";
import type { LocationResponse } from "src/shared/types/Reponse/Location";
import { useAuthStore } from "@/stores/authStore";

import shell from "../account-shell.module.scss";

type ApptForm = {
  customerVehicleID: number;
  locationID: number;
  scheduledDateTime: string;
  estimatedDuration_minutes: number;
  appointmentType: string;
  customerNote: string;
};

export default function AppointmentsPage() {
  const user = useAuthStore((s) => s.user);
  const rawUID = user?.userUUID || user?.userID || user?.id;
  const userID = rawUID != null ? String(rawUID) : undefined;

  const { locations, loading: locLoading } = useLocation();
  const { data: vehiclesRes } = useCustomerVehicles({
    page: 1,
    pageSize: 100,
    userId: userID,
  });
  const vehicles = vehiclesRes?.data ?? [];

  const { data: apptRes, isLoading } = useAppointments({
    page: 1,
    pageSize: 30,
  });
  const rows = apptRes?.data ?? [];

  const { createAppointment, cancelAppointment } = useWorkshopMutations();
  const [msg, setMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<ApptForm>({
    defaultValues: {
      customerVehicleID: 0,
      locationID: 0,
      scheduledDateTime: "",
      estimatedDuration_minutes: 60,
      appointmentType: "Maintenance",
      customerNote: "",
    },
  });

  const vehicleOptions = useMemo(
    () =>
      vehicles.map((v) => ({
        id: v.customerVehicleID,
        label: `${v.brandName ?? ""} ${v.modelName} · ${v.vin}`,
      })),
    [vehicles]
  );

  const onCreate = async (f: ApptForm) => {
    setMsg(null);
    if (!f.customerVehicleID || !f.locationID || !f.scheduledDateTime) {
      setMsg("Chọn xe, chi nhánh và thời gian.");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        customerVehicleID: f.customerVehicleID,
        locationID: f.locationID,
        scheduledDateTime: new Date(f.scheduledDateTime).toISOString(),
        estimatedDuration_minutes: Number(f.estimatedDuration_minutes),
        appointmentType: f.appointmentType,
        customerNote: f.customerNote || undefined,
        services: [],
      });
      setMsg("Đã gửi lịch hẹn.");
      reset();
    } catch (e: unknown) {
      setMsg("Không tạo được lịch. Kiểm tra dữ liệu hoặc quyền.");
    }
  };

  const onCancel = async (id: number) => {
    setMsg(null);
    try {
      await cancelAppointment.mutateAsync({
        id,
        body: { status: "Cancelled", cancelReason: "Khách hàng hủy trên web" },
      });
      setMsg("Đã hủy lịch.");
    } catch {
      setMsg("Không hủy được lịch.");
    }
  };

  return (
    <section>
      <h2 className={shell.title}>Lịch hẹn xưởng</h2>
      <p className={shell.sub}>Đặt lịch bảo dưỡng / sửa chữa và xem trạng thái.</p>

      <div className={shell.card}>
        <h3 className={shell.title} style={{ fontSize: "1rem" }}>
          Đặt lịch mới
        </h3>
        <form onSubmit={handleSubmit(onCreate)}>
          <div className={shell.grid}>
            <div className={shell.field}>
              <label>Xe *</label>
              <select
                {...register("customerVehicleID", { valueAsNumber: true })}
              >
                <option value={0}>— Chọn xe —</option>
                {vehicleOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={shell.field}>
              <label>Chi nhánh *</label>
              <select {...register("locationID", { valueAsNumber: true })} disabled={locLoading}>
                <option value={0}>— Chọn —</option>
                {locations.map((l) => (
                  <option key={l.locationCode} value={l.locationID}>
                    {l.locationName}
                  </option>
                ))}
              </select>
            </div>
            <div className={shell.field}>
              <label>Thời gian *</label>
              <input type="datetime-local" {...register("scheduledDateTime")} />
            </div>
            <div className={shell.field}>
              <label>Thời lượng (phút)</label>
              <input
                type="number"
                min={15}
                max={1440}
                {...register("estimatedDuration_minutes", { valueAsNumber: true })}
              />
            </div>
            <div className={shell.field}>
              <label>Loại hình</label>
              <select {...register("appointmentType")}>
                <option value="Maintenance">Bảo dưỡng</option>
                <option value="Repair">Sửa chữa</option>
                <option value="Inspection">Kiểm tra</option>
              </select>
            </div>
            <div className={shell.field} style={{ gridColumn: "1 / -1" }}>
              <label>Ghi chú</label>
              <textarea {...register("customerNote")} />
            </div>
          </div>
          <div className={shell.btnRow}>
            <button
              type="submit"
              className={`${shell.btn} ${shell.primary}`}
              disabled={createAppointment.isPending}
            >
              Gửi lịch
            </button>
          </div>
          {msg && <p className={shell.ok}>{msg}</p>}
        </form>
      </div>

      <h3 className={shell.title} style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>
        Lịch của tôi
      </h3>
      {isLoading && <p className={shell.sub}>Đang tải…</p>}
      <div className={shell.tableWrap}>
        <table className={shell.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.appointmentID}>
                <td>{a.appointmentNumber}</td>
                <td>
                  {new Date(a.scheduledDateTime).toLocaleString("vi-VN")}
                </td>
                <td>
                  <span className={shell.badge}>{a.status}</span>
                </td>
                <td>{a.customerNote ?? "—"}</td>
                <td>
                  {a.status !== "Cancelled" && a.status !== "Completed" && (
                    <button
                      type="button"
                      className={`${shell.btn} ${shell.danger}`}
                      onClick={() => onCancel(a.appointmentID)}
                      disabled={cancelAppointment.isPending}
                    >
                      Hủy
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

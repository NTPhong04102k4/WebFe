import React, { useState } from "react";

import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import {
  useAppointments,
  useWorkOrders,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import type { AppointmentStatus, WorkOrderStatus } from "src/services/api/functions/workshop/workshop.types";
import { useLocation } from "src/shared/hooks/location";
import type { LocationResponse } from "src/shared/types/Reponse/Location";

import staff from "../staff-dashboard.module.scss";

function locationRowId(l: LocationResponse & { locationID?: number; id?: number }) {
  return l.locationID ?? l.id ?? 0;
}

export function StaffWorkshopPanel() {
  const { locations } = useLocation();
  const { data: apptRes, isLoading: loadA } = useAppointments({
    page: 1,
    pageSize: 40,
  });
  const appointments = apptRes?.data ?? [];

  const { data: woRes, isLoading: loadW } = useWorkOrders({
    page: 1,
    pageSize: 40,
  });
  const workOrders = woRes?.data ?? [];

  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 100 });
  const technicians = (techRes?.data as { technicianID?: number; fullName?: string }[]) ?? [];

  const {
    confirmAppointment,
    reminderAppointment,
    patchAppointmentStatus,
    createWorkOrder,
    assignTechnician,
    patchWorkOrderStatus,
  } = useWorkshopMutations();

  const [woForm, setWoForm] = useState({
    customerVehicleID: "",
    locationID: "",
    primaryTechnicianID: "",
    mileageIn: "0",
    complaint: "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  const onConfirm = async (id: number) => {
    setMsg(null);
    try {
      await confirmAppointment.mutateAsync(id);
      setMsg("Đã xác nhận lịch.");
    } catch {
      setMsg("Thao tác thất bại.");
    }
  };

  const onReminder = async (id: number) => {
    setMsg(null);
    try {
      await reminderAppointment.mutateAsync(id);
      setMsg("Đã gửi nhắc lịch.");
    } catch {
      setMsg("Gửi nhắc thất bại.");
    }
  };

  const onApptStatus = async (id: number, status: string) => {
    setMsg(null);
    try {
      await patchAppointmentStatus.mutateAsync({ id, body: { status: status as AppointmentStatus } });
      setMsg("Đã cập nhật trạng thái lịch.");
    } catch {
      setMsg("Cập nhật thất bại.");
    }
  };

  const submitWo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const cv = Number(woForm.customerVehicleID);
    const loc = Number(woForm.locationID);
    const tech = Number(woForm.primaryTechnicianID);
    if (!cv || !loc || !tech) {
      setMsg("Điền đủ xe, chi nhánh và kỹ thuật viên.");
      return;
    }
    try {
      await createWorkOrder.mutateAsync({
        customerVehicleID: cv,
        locationID: loc,
        primaryTechnicianID: tech,
        mileageIn: Number(woForm.mileageIn) || 0,
        customerComplaint: woForm.complaint || undefined,
        priority: "Normal",
      });
      setMsg("Đã tạo phiếu công việc.");
      setWoForm({
        customerVehicleID: "",
        locationID: "",
        primaryTechnicianID: "",
        mileageIn: "0",
        complaint: "",
      });
    } catch {
      setMsg("Không tạo được phiếu (kiểm tra quyền Staff).");
    }
  };

  const onAssignWo = async (workOrderId: number, technicianID: number) => {
    setMsg(null);
    try {
      await assignTechnician.mutateAsync({
        id: workOrderId,
        body: { technicianID },
      });
      setMsg("Đã gán thợ.");
    } catch {
      setMsg("Gán thợ thất bại.");
    }
  };

  const onWoStatus = async (workOrderId: number, status: string) => {
    setMsg(null);
    try {
      await patchWorkOrderStatus.mutateAsync({
        id: workOrderId,
        body: { status: status as WorkOrderStatus },
      });
      setMsg("Đã cập nhật phiếu.");
    } catch {
      setMsg("Cập nhật phiếu thất bại.");
    }
  };

  return (
    <div>
      <p className={staff.note}>
        Khu vực dành cho Admin / SuperAdmin / Staff. Thợ (Technician) không truy cập được.
      </p>
      {msg && <p className={staff.ok}>{msg}</p>}

      <div className={staff.card}>
        <h3 className={staff.title}>Lịch hẹn</h3>
        {loadA && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointmentID}>
                  <td>{a.appointmentNumber}</td>
                  <td>{new Date(a.scheduledDateTime).toLocaleString("vi-VN")}</td>
                  <td>{a.status}</td>
                  <td>
                    <button
                      type="button"
                      className={`${staff.btn} ${staff.btnPrimary}`}
                      onClick={() => onConfirm(a.appointmentID)}
                      disabled={confirmAppointment.isPending}
                    >
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      className={`${staff.btn} ${staff.btnMuted}`}
                      onClick={() => onReminder(a.appointmentID)}
                      disabled={reminderAppointment.isPending}
                    >
                      Nhắc lịch
                    </button>
                    <select
                      aria-label="Trạng thái lịch"
                      defaultValue=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) onApptStatus(a.appointmentID, v);
                      }}
                    >
                      <option value="">Đổi trạng thái…</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={staff.card}>
        <h3 className={staff.title}>Tạo phiếu công việc (Work order)</h3>
        <form onSubmit={submitWo}>
          <div className={staff.grid2}>
            <div className={staff.field}>
              <label>ID xe khách (customerVehicleID)</label>
              <input
                value={woForm.customerVehicleID}
                onChange={(e) =>
                  setWoForm((s) => ({ ...s, customerVehicleID: e.target.value }))
                }
                inputMode="numeric"
              />
            </div>
            <div className={staff.field}>
              <label>Chi nhánh</label>
              <select
                value={woForm.locationID}
                onChange={(e) =>
                  setWoForm((s) => ({ ...s, locationID: e.target.value }))
                }
              >
                <option value="">—</option>
                {locations.map((l) => {
                  const id = locationRowId(l);
                  return (
                    <option key={id || l.locationCode} value={id}>
                      {l.locationName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className={staff.field}>
              <label>Kỹ thuật viên chính (ID)</label>
              <select
                value={woForm.primaryTechnicianID}
                onChange={(e) =>
                  setWoForm((s) => ({
                    ...s,
                    primaryTechnicianID: e.target.value,
                  }))
                }
              >
                <option value="">—</option>
                {technicians.map((t, i) => (
                  <option
                    key={t.technicianID ?? i}
                    value={t.technicianID ?? ""}
                  >
                    {(t as { fullName?: string }).fullName ?? "Tech"} (
                    {t.technicianID})
                  </option>
                ))}
              </select>
            </div>
            <div className={staff.field}>
              <label>Km vào xưởng</label>
              <input
                value={woForm.mileageIn}
                onChange={(e) =>
                  setWoForm((s) => ({ ...s, mileageIn: e.target.value }))
                }
              />
            </div>
            <div className={staff.field} style={{ gridColumn: "1 / -1" }}>
              <label>Triệu chứng / yêu cầu</label>
              <input
                value={woForm.complaint}
                onChange={(e) =>
                  setWoForm((s) => ({ ...s, complaint: e.target.value }))
                }
              />
            </div>
          </div>
          <button
            type="submit"
            className={`${staff.btn} ${staff.btnPrimary}`}
            disabled={createWorkOrder.isPending}
          >
            Tạo phiếu
          </button>
        </form>
      </div>

      <div className={staff.card}>
        <h3 className={staff.title}>Phiếu công việc</h3>
        {loadW && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              <tr>
                <th>Số phiếu</th>
                <th>TT</th>
                <th>Gán thợ</th>
                <th>Đổi TT</th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map((w) => (
                <tr key={w.workOrderID}>
                  <td>{w.workOrderNumber}</td>
                  <td>{w.status}</td>
                  <td>
                    <select
                      aria-label="Gán kỹ thuật viên"
                      defaultValue=""
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v) onAssignWo(w.workOrderID, v);
                      }}
                    >
                      <option value="">Chọn thợ…</option>
                      {technicians.map((t, i) => (
                        <option
                          key={t.technicianID ?? i}
                          value={t.technicianID ?? ""}
                        >
                          {(t as { fullName?: string }).fullName ?? "Tech"}{" "}
                          ({t.technicianID})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      aria-label="Trạng thái phiếu"
                      defaultValue=""
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v) onWoStatus(w.workOrderID, v);
                      }}
                    >
                      <option value="">—</option>
                      <option value="Open">Open</option>
                      <option value="InProgress">InProgress</option>
                      <option value="OnHold">OnHold</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

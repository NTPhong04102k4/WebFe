import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useHrTechniciansSearch } from "src/query/hr/useHrQueries";
import {
  useAppointments,
  useWorkOrders,
  useWorkshopMutations,
} from "src/query/workshop/useWorkshopQueries";
import { useTableQueryParams } from "src/shared/hooks/useTableQueryParams";
import { useLocation } from "src/shared/hooks/location";
import type { LocationResponse } from "src/shared/types/Reponse/Location";
import type {
  AppointmentViewModel,
  WorkOrderViewModel,
} from "src/services/api/functions/workshop/workshop.types";

import staff from "../staff-dashboard.module.scss";

function locationRowId(l: LocationResponse & { locationID?: number; id?: number }) {
  return l.locationID ?? l.id ?? 0;
}

const woSchema = yup.object({
  customerVehicleID: yup
    .string()
    .required("Bắt buộc")
    .matches(/^[0-9]+$/, "Chỉ nhập số"),
  locationID: yup.string().required("Chọn chi nhánh"),
  primaryTechnicianID: yup.string().required("Chọn kỹ thuật viên"),
  mileageIn: yup
    .string()
    .matches(/^[0-9]*$/, "Chỉ nhập số")
    .default("0"),
  complaint: yup.string().optional(),
});

type WoFormValues = yup.InferType<typeof woSchema>;

const apptCol = createColumnHelper<AppointmentViewModel>();
const woCol = createColumnHelper<WorkOrderViewModel>();

function TablePager(props: {
  page: number;
  pageSize: number;
  totalCount: number;
  setPage: (p: number) => void;
  isLoading?: boolean;
}) {
  const { page, pageSize, totalCount, setPage, isLoading } = props;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return (
    <div className={staff.pagination} role="navigation" aria-label="Phân trang">
      <button
        type="button"
        className={staff.paginationBtn}
        disabled={page <= 1 || isLoading}
        onClick={() => setPage(page - 1)}
      >
        Trước
      </button>
      <span>
        Trang {page} / {totalPages} ({totalCount} mục)
      </span>
      <button
        type="button"
        className={staff.paginationBtn}
        disabled={page >= totalPages || isLoading}
        onClick={() => setPage(page + 1)}
      >
        Sau
      </button>
    </div>
  );
}

export function StaffWorkshopPanel() {
  const { locations } = useLocation();

  const { params: apptParams, setParams: setApptParams } = useTableQueryParams({
    page: "apptPage",
    pageSize: "apptSize",
    search: "apptSearch",
    status: "apptStatus",
  });

  const { params: woParams, setParams: setWoParams } = useTableQueryParams({
    page: "woPage",
    pageSize: "woSize",
    search: "woSearch",
    status: "woStatus",
  });

  const apptQuery = useMemo(
    () => ({
      page: apptParams.page,
      pageSize: apptParams.pageSize,
      status: apptParams.status || undefined,
    }),
    [apptParams.page, apptParams.pageSize, apptParams.status],
  );

  const woQuery = useMemo(
    () => ({
      page: woParams.page,
      pageSize: woParams.pageSize,
      status: woParams.status || undefined,
    }),
    [woParams.page, woParams.pageSize, woParams.status],
  );

  const { data: apptRes, isLoading: loadA } = useAppointments(apptQuery);
  const appointments = apptRes?.data ?? [];
  const apptTotal = apptRes?.totalCount ?? 0;

  const { data: woRes, isLoading: loadW } = useWorkOrders(woQuery);
  const workOrders = woRes?.data ?? [];
  const woTotal = woRes?.totalCount ?? 0;

  const { data: techRes } = useHrTechniciansSearch({ page: 1, pageSize: 100 });
  const technicians =
    (techRes?.data as { technicianID?: number; fullName?: string }[]) ?? [];

  const {
    confirmAppointment,
    reminderAppointment,
    patchAppointmentStatus,
    createWorkOrder,
    assignTechnician,
    patchWorkOrderStatus,
  } = useWorkshopMutations();

  const [msg, setMsg] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WoFormValues>({
    resolver: yupResolver(woSchema),
    defaultValues: {
      customerVehicleID: "",
      locationID: "",
      primaryTechnicianID: "",
      mileageIn: "0",
      complaint: "",
    },
  });

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
      await patchAppointmentStatus.mutateAsync({ id, body: { status } });
      setMsg("Đã cập nhật trạng thái lịch.");
    } catch {
      setMsg("Cập nhật thất bại.");
    }
  };

  const submitWo = handleSubmit(async (values) => {
    setMsg(null);
    const cv = Number(values.customerVehicleID);
    const loc = Number(values.locationID);
    const tech = Number(values.primaryTechnicianID);
    try {
      await createWorkOrder.mutateAsync({
        customerVehicleID: cv,
        locationID: loc,
        primaryTechnicianID: tech,
        mileageIn: Number(values.mileageIn) || 0,
        customerComplaint: values.complaint || undefined,
        priority: "Normal",
      });
      setMsg("Đã tạo phiếu công việc.");
      reset();
    } catch {
      setMsg("Không tạo được phiếu (kiểm tra quyền Staff).");
    }
  });

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
        body: { status },
      });
      setMsg("Đã cập nhật phiếu.");
    } catch {
      setMsg("Cập nhật phiếu thất bại.");
    }
  };

  const apptColumns = [
    apptCol.accessor("appointmentNumber", { header: "Mã" }),
    apptCol.accessor((row) => new Date(row.scheduledDateTime).toLocaleString("vi-VN"), {
      id: "scheduled",
      header: "Giờ",
    }),
    apptCol.accessor("status", { header: "Trạng thái" }),
    apptCol.display({
      id: "actions",
      header: "Thao tác",
      cell: ({ row }) => {
        const a = row.original;
        return (
          <>
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
          </>
        );
      },
    }),
  ];

  const woColumns = [
    woCol.accessor("workOrderNumber", { header: "Số phiếu" }),
    woCol.accessor("status", { header: "TT" }),
    woCol.display({
      id: "assign",
      header: "Gán thợ",
      cell: ({ row }) => {
        const w = row.original;
        return (
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
              <option key={t.technicianID ?? i} value={t.technicianID ?? ""}>
                {(t as { fullName?: string }).fullName ?? "Tech"} ({t.technicianID})
              </option>
            ))}
          </select>
        );
      },
    }),
    woCol.display({
      id: "woStatus",
      header: "Đổi TT",
      cell: ({ row }) => {
        const w = row.original;
        return (
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
        );
      },
    }),
  ];

  const apptTable = useReactTable({
    data: appointments,
    columns: apptColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const woTable = useReactTable({
    data: workOrders,
    columns: woColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <p className={staff.note}>
        Khu vực dành cho Admin / SuperAdmin / Staff. Thợ (Technician) không truy cập được.
      </p>
      {msg && <p className={staff.ok}>{msg}</p>}

      <div className={staff.card}>
        <h3 className={staff.title}>Lịch hẹn</h3>
        <div className={staff.tableToolbar}>
          <div className={staff.field} style={{ marginBottom: 0, minWidth: 140 }}>
            <label htmlFor="appt-status">Lọc trạng thái</label>
            <select
              id="appt-status"
              value={apptParams.status}
              onChange={(e) =>
                setApptParams({ status: e.target.value, page: 1 })
              }
            >
              <option value="">Tất cả</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="InProgress">InProgress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className={staff.field} style={{ marginBottom: 0, width: 100 }}>
            <label htmlFor="appt-size">/ trang</label>
            <select
              id="appt-size"
              value={String(apptParams.pageSize)}
              onChange={(e) =>
                setApptParams({ pageSize: Number(e.target.value), page: 1 })
              }
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </select>
          </div>
        </div>
        {loadA && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              {apptTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {apptTable.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePager
          page={apptParams.page}
          pageSize={apptParams.pageSize}
          totalCount={apptTotal}
          isLoading={loadA}
          setPage={(p) => setApptParams({ page: p })}
        />
      </div>

      <div className={staff.card}>
        <h3 className={staff.title}>Tạo phiếu công việc (Work order)</h3>
        <form onSubmit={submitWo} noValidate>
          <div className={staff.grid2}>
            <div className={staff.field}>
              <label>ID xe khách (customerVehicleID)</label>
              <input inputMode="numeric" {...register("customerVehicleID")} />
              {errors.customerVehicleID && (
                <span className={staff.err}>{errors.customerVehicleID.message}</span>
              )}
            </div>
            <div className={staff.field}>
              <label>Chi nhánh</label>
              <select {...register("locationID")}>
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
              {errors.locationID && (
                <span className={staff.err}>{errors.locationID.message}</span>
              )}
            </div>
            <div className={staff.field}>
              <label>Kỹ thuật viên chính (ID)</label>
              <select {...register("primaryTechnicianID")}>
                <option value="">—</option>
                {technicians.map((t, i) => (
                  <option key={t.technicianID ?? i} value={t.technicianID ?? ""}>
                    {(t as { fullName?: string }).fullName ?? "Tech"} ({t.technicianID})
                  </option>
                ))}
              </select>
              {errors.primaryTechnicianID && (
                <span className={staff.err}>{errors.primaryTechnicianID.message}</span>
              )}
            </div>
            <div className={staff.field}>
              <label>Km vào xưởng</label>
              <input {...register("mileageIn")} />
              {errors.mileageIn && (
                <span className={staff.err}>{errors.mileageIn.message}</span>
              )}
            </div>
            <div className={staff.field} style={{ gridColumn: "1 / -1" }}>
              <label>Triệu chứng / yêu cầu</label>
              <input {...register("complaint")} />
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
        <div className={staff.tableToolbar}>
          <div className={staff.field} style={{ marginBottom: 0, minWidth: 140 }}>
            <label htmlFor="wo-status">Lọc trạng thái</label>
            <select
              id="wo-status"
              value={woParams.status}
              onChange={(e) => setWoParams({ status: e.target.value, page: 1 })}
            >
              <option value="">Tất cả</option>
              <option value="Open">Open</option>
              <option value="InProgress">InProgress</option>
              <option value="OnHold">OnHold</option>
              <option value="Completed">Completed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className={staff.field} style={{ marginBottom: 0, width: 100 }}>
            <label htmlFor="wo-size">/ trang</label>
            <select
              id="wo-size"
              value={String(woParams.pageSize)}
              onChange={(e) =>
                setWoParams({ pageSize: Number(e.target.value), page: 1 })
              }
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="40">40</option>
            </select>
          </div>
        </div>
        {loadW && <p>Đang tải…</p>}
        <div className={staff.tableWrap}>
          <table className={staff.table}>
            <thead>
              {woTable.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder
                        ? null
                        : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {woTable.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TablePager
          page={woParams.page}
          pageSize={woParams.pageSize}
          totalCount={woTotal}
          isLoading={loadW}
          setPage={(p) => setWoParams({ page: p })}
        />
      </div>
    </div>
  );
}

export default StaffWorkshopPanel;

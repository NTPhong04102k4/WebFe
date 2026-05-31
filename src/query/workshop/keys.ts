import type { AppointmentQueryRequest, WorkOrderQueryRequest } from "src/services/api/functions/workshop/workshop.types";

export const workshopKeys = {
  all: ["workshop"] as const,
  vehicles: (p: { userId?: string | number; page?: number; pageSize?: number }) =>
    [...workshopKeys.all, "vehicles", p] as const,
  vehicle: (id: number) => [...workshopKeys.all, "vehicle", id] as const,
  history: (id: number) => [...workshopKeys.all, "history", id] as const,
  appointments: (q: AppointmentQueryRequest) =>
    [...workshopKeys.all, "appointments", q] as const,
  appointment: (id: number) =>
    [...workshopKeys.all, "appointment", id] as const,
  workOrders: (q: WorkOrderQueryRequest) =>
    [...workshopKeys.all, "workOrders", q] as const,
  workOrder: (id: number) => [...workshopKeys.all, "workOrder", id] as const,
  workOrderPaymentInfo: (id: number) =>
    [...workshopKeys.all, "workOrderPaymentInfo", id] as const,
  scheduleTimeline: (params: { date: string; locationId?: number }) =>
    [...workshopKeys.all, "scheduleTimeline", params] as const,
  workOrderHistory: (params: { vehicleId: number; page?: number; pageSize?: number }) =>
    [...workshopKeys.all, "workOrderHistory", params] as const,
};

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { workshopApi } from "src/services/api/functions/workshop/workshop.api";
import type {
  AppointmentCancelRequest,
  AppointmentCheckInRequest,
  AppointmentQueryRequest,
  AppointmentRequest,
  AppointmentStatusRequest,
  AssignTechnicianRequest,
  CustomerVehicleRequest,
  CustomerVehicleUpdateMileageRequest,
  WorkOrderDeliveryRequest,
  WorkOrderFeedbackRequest,
  WorkOrderPartItemRequest,
  WorkOrderPaymentRequest,
  WorkOrderQueryRequest,
  WorkOrderRequest,
  WorkOrderServiceItemRequest,
  WorkOrderStatusRequest,
} from "src/services/api/functions/workshop/workshop.types";

import { workshopKeys } from "./keys";

export function useCustomerVehicles(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
}) {
  return useQuery({
    queryKey: workshopKeys.vehicles(params),
    queryFn: ({ signal }) =>
      workshopApi.listCustomerVehicles(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useCustomerVehicle(id: number | null) {
  return useQuery({
    queryKey: id != null ? workshopKeys.vehicle(id) : ["workshop", "vehicle", "none"],
    queryFn: ({ signal }) => workshopApi.getCustomerVehicle(id!, { signal }),
    enabled: id != null,
  });
}

export function useMaintenanceHistory(vehicleId: number | null) {
  return useQuery({
    queryKey:
      vehicleId != null
        ? workshopKeys.history(vehicleId)
        : ["workshop", "history", "none"],
    queryFn: ({ signal }) =>
      workshopApi.getMaintenanceHistory(vehicleId!, { signal }),
    enabled: vehicleId != null,
  });
}

export function useAppointments(q: AppointmentQueryRequest) {
  return useQuery({
    queryKey: workshopKeys.appointments(q),
    queryFn: ({ signal }) => workshopApi.listAppointments(q, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useAppointmentDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? workshopKeys.appointment(id) : ["workshop", "appointment", "none"],
    queryFn: ({ signal }) => workshopApi.getAppointment(id!, { signal }),
    enabled: id != null,
  });
}

export function useWorkOrders(q: WorkOrderQueryRequest) {
  return useQuery({
    queryKey: workshopKeys.workOrders(q),
    queryFn: ({ signal }) => workshopApi.listWorkOrders(q, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    refetchInterval: 15_000,
  });
}

export function useWorkOrderDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? workshopKeys.workOrder(id) : ["workshop", "wo", "none"],
    queryFn: ({ signal }) => workshopApi.getWorkOrder(id!, { signal }),
    enabled: id != null,
    refetchInterval: (query) => {
      const status = query.state.data?.paymentStatus;
      return status === "Paid" || status === "Failed" ? false : 3_000;
    },
  });
}

export function useWorkOrderPaymentInfo(id: number | null) {
  return useQuery({
    queryKey:
      id != null
        ? workshopKeys.workOrderPaymentInfo(id)
        : ["workshop", "workOrderPaymentInfo", "none"],
    queryFn: ({ signal }) =>
      workshopApi.getWorkOrderPaymentInfo(id!, { signal }),
    enabled: id != null,
    retry: false,
  });
}

export function useWorkshopMutations() {
  const qc = useQueryClient();

  const invalidateAll = () => qc.invalidateQueries({ queryKey: workshopKeys.all });

  return {
    createVehicle: useMutation({
      mutationFn: (body: CustomerVehicleRequest) =>
        workshopApi.createCustomerVehicle(body),
      onSuccess: invalidateAll,
    }),
    updateVehicle: useMutation({
      mutationFn: ({ id, body }: { id: number; body: CustomerVehicleRequest }) =>
        workshopApi.updateCustomerVehicle(id, body),
      onSuccess: invalidateAll,
    }),
    patchMileage: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: CustomerVehicleUpdateMileageRequest;
      }) => workshopApi.patchVehicleMileage(id, body),
      onSuccess: invalidateAll,
    }),
    deleteVehicle: useMutation({
      mutationFn: (id: number) => workshopApi.deleteCustomerVehicle(id),
      onSuccess: invalidateAll,
    }),
    createAppointment: useMutation({
      mutationFn: (body: AppointmentRequest) =>
        workshopApi.createAppointment(body),
      onSuccess: invalidateAll,
    }),
    confirmAppointment: useMutation({
      mutationFn: (id: number) => workshopApi.confirmAppointment(id),
      onSuccess: invalidateAll,
    }),
    cancelAppointment: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body?: AppointmentCancelRequest;
      }) => workshopApi.cancelAppointment(id, body),
      onSuccess: invalidateAll,
    }),
    patchAppointmentStatus: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: AppointmentStatusRequest;
      }) => workshopApi.patchAppointmentStatus(id, body),
      onSuccess: invalidateAll,
    }),
    reminderAppointment: useMutation({
      mutationFn: (id: number) => workshopApi.sendAppointmentReminder(id),
      onSuccess: invalidateAll,
    }),
    createWorkOrder: useMutation({
      mutationFn: (body: WorkOrderRequest) =>
        workshopApi.createWorkOrder(body),
      onSuccess: (_, variables) => {
        invalidateAll();
        // Appointment status đổi thành "In-Progress" sau khi tạo WO — invalidate riêng
        if (variables.appointmentID != null) {
          qc.invalidateQueries({
            queryKey: workshopKeys.appointment(variables.appointmentID),
          });
        }
      },
    }),
    patchWorkOrderStatus: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderStatusRequest;
      }) => workshopApi.patchWorkOrderStatus(id, body),
      onSuccess: invalidateAll,
    }),
    assignTechnician: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: AssignTechnicianRequest;
      }) => workshopApi.assignTechnician(id, body),
      onSuccess: invalidateAll,
    }),
    addWorkOrderService: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderServiceItemRequest;
      }) => workshopApi.addWorkOrderService(id, body),
      onSuccess: invalidateAll,
    }),
    deleteWorkOrderService: useMutation({
      mutationFn: ({
        workOrderId,
        workOrderServiceId,
      }: {
        workOrderId: number;
        workOrderServiceId: number;
      }) => workshopApi.deleteWorkOrderService(workOrderId, workOrderServiceId),
      onSuccess: invalidateAll,
    }),
    addWorkOrderPart: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderPartItemRequest;
      }) => workshopApi.addWorkOrderPart(id, body),
      onSuccess: invalidateAll,
    }),
    deleteWorkOrderPart: useMutation({
      mutationFn: ({
        workOrderId,
        workOrderPartId,
      }: {
        workOrderId: number;
        workOrderPartId: number;
      }) => workshopApi.deleteWorkOrderPart(workOrderId, workOrderPartId),
      onSuccess: invalidateAll,
    }),
    payWorkOrder: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderPaymentRequest;
      }) => workshopApi.payWorkOrder(id, body),
      onSuccess: invalidateAll,
    }),
    deliverWorkOrder: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderDeliveryRequest;
      }) => workshopApi.deliverWorkOrder(id, body),
      onSuccess: invalidateAll,
    }),
    confirmDelivery: useMutation({
      mutationFn: ({ id }: { id: number }) => workshopApi.confirmDelivery(id),
      onSuccess: invalidateAll,
    }),
    feedbackWorkOrder: useMutation({
      mutationFn: ({
        id,
        body,
      }: {
        id: number;
        body: WorkOrderFeedbackRequest;
      }) => workshopApi.submitWorkOrderFeedback(id, body),
      onSuccess: () => {
        invalidateAll();
      },
    }),
  };
}

/**
 * Check-in lịch hẹn — tạo WorkOrder 1 bước (endpoint mới, thay thế flow 2 bước cũ).
 * Backend tự lấy vehicleId, locationId, copy services từ Appointment.
 *
 * Error codes:
 * - "Conflict"            → Appointment đã check-in rồi (đã có WorkOrder)
 * - "AppointmentNotFound" → Appointment không tồn tại hoặc đã bị hủy
 */
export function useCheckInAppointment(options?: {
  onConflict?: (appointmentId: number) => void;
  onAppointmentNotFound?: () => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: AppointmentCheckInRequest }) =>
      workshopApi.checkInAppointment(id, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: workshopKeys.all });
      qc.invalidateQueries({ queryKey: workshopKeys.appointment(id) });
    },
    onError: (error: unknown, { id }) => {
      const errorCode = (
        error as { response?: { data?: { errorCode?: string } } }
      )?.response?.data?.errorCode;

      if (errorCode === "Conflict") {
        options?.onConflict?.(id);
      } else if (errorCode === "AppointmentNotFound") {
        options?.onAppointmentNotFound?.();
      }
    },
  });
}

/**
 * Tạo WorkOrder từ Appointment với xử lý lỗi đặc biệt:
 * - "Conflict"           → Appointment đã có WorkOrder rồi (1:1 constraint)
 * - "AppointmentNotFound" → Appointment bị cancel hoặc không tồn tại
 *
 * Khi appointmentID = null → khách vãng lai, không copy services
 */
export function useCreateWorkOrder(options?: {
  onConflict?: (appointmentId: number) => void;
  onAppointmentNotFound?: () => void;
}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: WorkOrderRequest) => workshopApi.createWorkOrder(body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: workshopKeys.all });
      if (variables.appointmentID != null) {
        qc.invalidateQueries({
          queryKey: workshopKeys.appointment(variables.appointmentID),
        });
      }
    },
    onError: (error: unknown, variables) => {
      const errorCode = (
        error as { response?: { data?: { errorCode?: string } } }
      )?.response?.data?.errorCode;

      if (errorCode === "Conflict" && variables.appointmentID != null) {
        options?.onConflict?.(variables.appointmentID);
      } else if (errorCode === "AppointmentNotFound") {
        options?.onAppointmentNotFound?.();
      }
    },
  });
}

/** GET /workshop/appointments/schedule-timeline — Staff+ */
export function useScheduleTimeline(params: { date: string; locationId?: number }) {
  return useQuery({
    queryKey: workshopKeys.scheduleTimeline(params),
    queryFn: ({ signal }) => workshopApi.getScheduleTimeline(params, { signal }),
    staleTime: 60_000,
    enabled: !!params.date,
  });
}

/** GET /workshop/work-orders/maintenance-history — Lịch sử bảo dưỡng theo phiếu sửa */
export function useWorkOrderMaintenanceHistory(params: {
  vehicleId: number;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: workshopKeys.workOrderHistory(params),
    queryFn: ({ signal }) =>
      workshopApi.getWorkOrderMaintenanceHistory(params, { signal }),
    staleTime: SEARCH_STALE_MS,
    placeholderData: keepPreviousData,
    enabled: params.vehicleId > 0,
  });
}

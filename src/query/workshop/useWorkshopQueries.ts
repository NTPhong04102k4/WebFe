import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { SEARCH_STALE_MS } from "src/query/queryClient";
import { workshopApi } from "src/services/api/functions/workshop/workshop.api";
import type {
  AppointmentQueryRequest,
  AppointmentRequest,
  AppointmentStatusRequest,
  AssignTechnicianRequest,
  CustomerVehicleRequest,
  CustomerVehicleUpdateMileageRequest,
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
  userId?: string | number;
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
  });
}

export function useWorkOrderDetail(id: number | null) {
  return useQuery({
    queryKey: id != null ? workshopKeys.workOrder(id) : ["workshop", "wo", "none"],
    queryFn: ({ signal }) => workshopApi.getWorkOrder(id!, { signal }),
    enabled: id != null,
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
        body?: AppointmentStatusRequest;
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
      onSuccess: invalidateAll,
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

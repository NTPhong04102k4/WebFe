import apiClient from "../..";
import { API } from "../../endpoints";
import type { ApiRequestOptions } from "../../requestOptions";
import { withSignal } from "../../requestOptions";

import type {
  AppointmentListResult,
  AppointmentQueryRequest,
  AppointmentRequest,
  AppointmentStatusRequest,
  AppointmentViewModel,
  AssignTechnicianRequest,
  CustomerVehicleListResult,
  CustomerVehicleRequest,
  CustomerVehicleUpdateMileageRequest,
  CustomerVehicleViewModel,
  MaintenanceHistoryViewModel,
  WorkOrderFeedbackRequest,
  WorkOrderListResult,
  WorkOrderPartItemRequest,
  WorkOrderPaymentRequest,
  WorkOrderQueryRequest,
  WorkOrderRequest,
  WorkOrderServiceItemRequest,
  WorkOrderStatusRequest,
  WorkOrderViewModel,
} from "./workshop.types";

export const workshopApi = {
  // —— Customer vehicles ——
  listCustomerVehicles: async (
    params: {
      page?: number;
      pageSize?: number;
      userId?: number;
    },
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<CustomerVehicleListResult>(
      API.workshop.customerVehicles,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getCustomerVehicle: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<CustomerVehicleViewModel>(
      API.workshop.customerVehicle(id),
      withSignal({}, options)
    );
    return res.data;
  },

  getMaintenanceHistory: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<MaintenanceHistoryViewModel[]>(
      API.workshop.customerVehicleHistory(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createCustomerVehicle: async (body: CustomerVehicleRequest) => {
    const res = await apiClient.post<CustomerVehicleViewModel>(
      API.workshop.customerVehicles,
      body
    );
    return res.data;
  },

  updateCustomerVehicle: async (id: number, body: CustomerVehicleRequest) => {
    const res = await apiClient.put<CustomerVehicleViewModel>(
      API.workshop.customerVehicle(id),
      body
    );
    return res.data;
  },

  patchVehicleMileage: async (
    id: number,
    body: CustomerVehicleUpdateMileageRequest
  ) => {
    const res = await apiClient.patch<unknown>(
      API.workshop.customerVehicleMileage(id),
      body
    );
    return res.data;
  },

  deleteCustomerVehicle: async (id: number) => {
    await apiClient.delete(API.workshop.customerVehicle(id));
  },

  // —— Appointments ——
  listAppointments: async (
    params: AppointmentQueryRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<AppointmentListResult>(
      API.workshop.appointments,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getAppointment: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<AppointmentViewModel>(
      API.workshop.appointment(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createAppointment: async (body: AppointmentRequest) => {
    const res = await apiClient.post<AppointmentViewModel>(
      API.workshop.appointments,
      body
    );
    return res.data;
  },

  confirmAppointment: async (id: number) => {
    const res = await apiClient.put<unknown>(
      API.workshop.appointmentConfirm(id),
      {}
    );
    return res.data;
  },

  cancelAppointment: async (id: number, body?: AppointmentStatusRequest) => {
    const res = await apiClient.put<unknown>(
      API.workshop.appointmentCancel(id),
      body ?? {}
    );
    return res.data;
  },

  patchAppointmentStatus: async (
    id: number,
    body: AppointmentStatusRequest
  ) => {
    const res = await apiClient.patch<unknown>(
      API.workshop.appointmentStatus(id),
      body
    );
    return res.data;
  },

  sendAppointmentReminder: async (id: number) => {
    const res = await apiClient.post<unknown>(
      API.workshop.appointmentReminder(id),
      {}
    );
    return res.data;
  },

  // —— Work orders ——
  listWorkOrders: async (
    params: WorkOrderQueryRequest,
    options?: ApiRequestOptions
  ) => {
    const res = await apiClient.get<WorkOrderListResult>(
      API.workshop.workOrders,
      withSignal({ params }, options)
    );
    return res.data;
  },

  getWorkOrder: async (id: number, options?: ApiRequestOptions) => {
    const res = await apiClient.get<WorkOrderViewModel>(
      API.workshop.workOrder(id),
      withSignal({}, options)
    );
    return res.data;
  },

  createWorkOrder: async (body: WorkOrderRequest) => {
    const res = await apiClient.post<WorkOrderViewModel>(
      API.workshop.workOrders,
      body
    );
    return res.data;
  },

  patchWorkOrderStatus: async (id: number, body: WorkOrderStatusRequest) => {
    const res = await apiClient.patch<unknown>(
      API.workshop.workOrderStatus(id),
      body
    );
    return res.data;
  },

  assignTechnician: async (id: number, body: AssignTechnicianRequest) => {
    const res = await apiClient.patch<unknown>(
      API.workshop.workOrderAssignTechnician(id),
      body
    );
    return res.data;
  },

  addWorkOrderService: async (
    id: number,
    body: WorkOrderServiceItemRequest
  ) => {
    const res = await apiClient.post<unknown>(
      API.workshop.workOrderServices(id),
      body
    );
    return res.data;
  },

  deleteWorkOrderService: async (
    workOrderId: number,
    workOrderServiceId: number
  ) => {
    await apiClient.delete(
      API.workshop.workOrderServiceItem(workOrderId, workOrderServiceId)
    );
  },

  addWorkOrderPart: async (id: number, body: WorkOrderPartItemRequest) => {
    const res = await apiClient.post<unknown>(
      API.workshop.workOrderParts(id),
      body
    );
    return res.data;
  },

  deleteWorkOrderPart: async (
    workOrderId: number,
    workOrderPartId: number
  ) => {
    await apiClient.delete(
      API.workshop.workOrderPartItem(workOrderId, workOrderPartId)
    );
  },

  payWorkOrder: async (id: number, body: WorkOrderPaymentRequest) => {
    const res = await apiClient.post<unknown>(
      API.workshop.workOrderPay(id),
      body
    );
    return res.data;
  },

  submitWorkOrderFeedback: async (
    id: number,
    body: WorkOrderFeedbackRequest
  ) => {
    const res = await apiClient.post<unknown>(
      API.workshop.workOrderFeedback(id),
      body
    );
    return res.data;
  },
};

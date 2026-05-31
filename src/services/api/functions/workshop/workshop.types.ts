import type { PagedResult } from "../hr/hr.types";
import type { OperationResult } from "src/services/types/common.types";

export type {
  PagedResult,
} from "../hr/hr.types";

export interface CustomerVehicleRequest {
  userID: string | number;
  carID?: number | null;
  vin: string;
  licensePlate?: string | null;
  brandID: number;
  modelName: string;
  modelYear: number;
  color?: string | null;
  currentMileage: number;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
  isActive: boolean;
}

export interface CustomerVehicleUpdateMileageRequest {
  currentMileage: number;
}

export interface CustomerVehicleViewModel {
  customerVehicleID: number;
  userID: string | number;
  ownerFullName?: string | null;
  carID?: number | null;
  vin: string;
  licensePlate?: string | null;
  brandID: number;
  brandName?: string | null;
  modelName: string;
  modelYear: number;
  color?: string | null;
  currentMileage: number;
  lastServiceDate?: string | null;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
  isActive: boolean;
  createdDate: string;
}

export interface MaintenanceHistoryViewModel {
  historyID: number;
  customerVehicleID: number;
  workOrderID: number;
  workOrderNumber?: string | null;
  serviceDate: string;
  mileage: number;
  servicesSummary?: string | null;
  totalCost: number;
  nextRecommendedServiceDate?: string | null;
  nextRecommendedMileage?: number | null;
}

export interface AppointmentServiceItem {
  serviceID: number;
  estimatedPrice: number;
  notes?: string | null;
}

export interface AppointmentRequest {
  customerVehicleID: number;
  locationID?: number | null;
  scheduledDateTime: string;
  estimatedDuration_minutes: number;
  assignedTechnicianID?: number | null;
  appointmentType: string;
  customerNote?: string | null;
  staffNote?: string | null;
  services: AppointmentServiceItem[];
}

export interface AppointmentQueryRequest {
  page?: number;
  pageSize?: number;
  status?: string | null;
  locationID?: number | null;
  technicianID?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

/** Dùng cho PATCH /appointments/{id}/status */
export interface AppointmentStatusRequest {
  status: string;
}

/** Dùng cho PUT /appointments/{id}/cancel */
export interface AppointmentCancelRequest {
  status: string;
  cancelReason?: string | null;
}

export interface AppointmentServiceViewModel {
  appointmentServiceID: number;
  serviceID: number;
  serviceName?: string | null;
  estimatedPrice: number;
  notes?: string | null;
}

export interface AppointmentViewModel {
  appointmentID: number;
  appointmentNumber: string;
  customerVehicleID: number;
  vehicleInfo?: string | null;
  locationID: number;
  locationName?: string | null;
  scheduledDateTime: string;
  estimatedDuration_minutes: number;
  assignedTechnicianID?: number | null;
  assignedTechnicianName?: string | null;
  appointmentType: string;
  status: string;
  reminderSent: boolean;
  reminderSentDate?: string | null;
  customerNote?: string | null;
  staffNote?: string | null;
  cancelReason?: string | null;
  createdDate: string;
  services?: AppointmentServiceViewModel[];
}

export interface WorkOrderRequest {
  appointmentID?: number | null;
  customerVehicleID: number;
  locationID: number;
  primaryTechnicianID: number;
  serviceAdvisorID?: number | null;
  priority?: string;
  mileageIn: number;
  customerComplaint?: string | null;
}

export interface WorkOrderStatusRequest {
  status: string;
  mileageOut?: number | null;
  diagnosis?: string | null;
  workPerformed?: string | null;
}

export interface AssignTechnicianRequest {
  technicianID: number;
}

export interface WorkOrderServiceItemRequest {
  serviceID: number;
  technicianID: number;
  laborHours: number;
  unitPrice: number;
  notes?: string | null;
}

export interface WorkOrderPartItemRequest {
  accessoryID: number;
  quantity: number;
  unitPrice: number;
  installedByTechnicianID?: number | null;
  notes?: string | null;
}

export interface WorkOrderPaymentRequest {
  paymentMethod: string;
  amountPaid: number;
  discountAmount?: number | null;
}

export interface WorkOrderPaymentInfoViewModel {
  workOrderID?: number;
  workOrderNumber?: string;
  amount?: number;
  amountDue?: number;
  bankName?: string | null;
  bankAccount?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  transferContent?: string | null;
  qrImageUrl?: string | null;
  qrCodeUrl?: string | null;
  qrCode?: string | null;
  paymentUrl?: string | null;
  expiresAt?: string | null;
  expiredAt?: string | null;
  signature?: string | null;
}

export interface WorkOrderFeedbackRequest {
  rating: number;
  feedback?: string | null;
}

export interface WorkOrderQueryRequest {
  page?: number;
  pageSize?: number;
  status?: string | null;
  technicianID?: number | null;
  customerVehicleID?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
}

export interface WorkOrderServiceViewModel {
  workOrderServiceID: number;
  serviceID: number;
  serviceName?: string | null;
  technicianID: number;
  technicianName?: string | null;
  laborHours: number;
  unitPrice: number;
  totalPrice: number;
  lineTotal?: number;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
  notes?: string | null;
}

export interface WorkOrderPartViewModel {
  workOrderPartID: number;
  accessoryID: number;
  accessoryName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  lineTotal?: number;
  installedByTechnicianID?: number | null;
  installedByTechnicianName?: string | null;
  installedDate?: string | null;
  notes?: string | null;
}

export interface WorkOrderViewModel {
  workOrderID: number;
  workOrderNumber: string;
  appointmentID?: number | null;
  customerVehicleID: number;
  vehicleInfo?: string | null;
  locationID: number;
  locationName?: string | null;
  primaryTechnicianID?: number | null;
  primaryTechnicianName?: string | null;
  serviceAdvisorID?: number | null;
  serviceAdvisorName?: string | null;
  status: string;
  priority: string;
  startDateTime?: string | null;
  endDateTime?: string | null;
  mileageIn: number;
  mileageOut: number;
  customerComplaint?: string | null;
  diagnosis?: string | null;
  workPerformed?: string | null;
  laborCost: number;
  partsCost: number;
  serviceCost: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string | null;
  paidDate?: string | null;
  customerRating?: number | null;
  customerFeedback?: string | null;
  warrantyMonths?: number | null;
  createdDate: string;
  services?: WorkOrderServiceViewModel[];
  parts?: WorkOrderPartViewModel[];
}

export type CustomerVehicleListResult = PagedResult<CustomerVehicleViewModel>;
export type AppointmentListResult = PagedResult<AppointmentViewModel>;
export type WorkOrderListResult = PagedResult<WorkOrderViewModel>;
export type WorkshopOperationResult<T = unknown> = OperationResult<T>;

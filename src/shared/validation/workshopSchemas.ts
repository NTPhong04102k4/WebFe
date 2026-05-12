import * as yup from "yup";

// ─── WorkOrder create form ────────────────────────────────────────────────────

export const createWorkOrderSchema = yup.object({
  customerVehicleID: yup
    .string()
    .required("Bắt buộc")
    .matches(/^[0-9]+$/, "Chỉ nhập số"),
  locationID: yup
    .string()
    .required("Bắt buộc chọn chi nhánh"),
  primaryTechnicianID: yup
    .string()
    .required("Bắt buộc chọn kỹ thuật viên"),
  mileageIn: yup
    .string()
    .matches(/^[0-9]*$/, "Chỉ nhập số")
    .default("0"),
  complaint: yup.string().optional(),
});

export type CreateWorkOrderFormValues = yup.InferType<typeof createWorkOrderSchema>;

// ─── WorkOrder status patch ───────────────────────────────────────────────────

export const workOrderStatusSchema = yup.object({
  status: yup
    .string()
    .required()
    .oneOf(["Open", "InProgress", "OnHold", "Completed", "Closed"]),
  notes: yup.string().nullable().optional(),
});

export type WorkOrderStatusFormValues = yup.InferType<typeof workOrderStatusSchema>;

// ─── WorkOrder payment form ───────────────────────────────────────────────────

export const workOrderPaymentSchema = yup.object({
  paymentMethod: yup
    .string()
    .required("Chọn phương thức thanh toán")
    .oneOf(["Cash", "BankTransfer", "Card"]),
  amountPaid: yup
    .number()
    .typeError("Phải là số")
    .required("Bắt buộc")
    .positive("Số tiền phải > 0"),
  discountAmount: yup.number().nullable().optional().min(0),
});

export type WorkOrderPaymentFormValues = yup.InferType<typeof workOrderPaymentSchema>;

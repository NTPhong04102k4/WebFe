import * as yup from "yup";

// ─── InsuranceClaim form ──────────────────────────────────────────────────────

export const createClaimSchema = yup.object({
  policyID: yup
    .number()
    .typeError("Bắt buộc chọn hợp đồng")
    .required("Bắt buộc")
    .positive("Phải chọn hợp đồng hợp lệ"),
  workOrderID: yup.number().nullable().optional(),
  incidentDate: yup
    .string()
    .required("Bắt buộc nhập ngày xảy ra sự cố")
    .matches(/^\d{4}-\d{2}-\d{2}/, "Định dạng YYYY-MM-DD"),
  reportedDate: yup
    .string()
    .required("Bắt buộc nhập ngày báo cáo")
    .matches(/^\d{4}-\d{2}-\d{2}/, "Định dạng YYYY-MM-DD"),
  description: yup
    .string()
    .required("Bắt buộc nhập mô tả")
    .min(10, "Tối thiểu 10 ký tự"),
  claimAmount: yup
    .number()
    .typeError("Phải là số")
    .required("Bắt buộc")
    .positive("Số tiền phải lớn hơn 0"),
});

export type CreateClaimFormValues = yup.InferType<typeof createClaimSchema>;

// ─── ClaimStatus patch ────────────────────────────────────────────────────────

export const claimStatusSchema = yup.object({
  status: yup
    .string()
    .required()
    .oneOf(["UnderReview", "Approved", "Rejected", "Paid"]),
  approvedAmount: yup.number().nullable().optional().positive("Phải > 0"),
  notes: yup.string().nullable().optional(),
});

export type ClaimStatusFormValues = yup.InferType<typeof claimStatusSchema>;

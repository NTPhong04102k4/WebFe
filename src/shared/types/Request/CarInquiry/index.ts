export interface CarInquiryRequest {
  fullName: string;
  phone: string;
  email?: string | null;
  message?: string | null;
}

export interface CarInquiryListParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface CarInquiryStatusRequest {
  status: string;
}

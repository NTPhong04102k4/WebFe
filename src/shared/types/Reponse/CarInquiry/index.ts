export interface CarInquiryViewModel {
  inquiryID: number;
  activityType: string;
  carID: number;
  carName?: string | null;
  carImagePath?: string | null;
  fullName: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  status: string;
  createdDate: string;
}

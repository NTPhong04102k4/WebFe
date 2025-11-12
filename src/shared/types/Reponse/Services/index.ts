export interface ServiceDetailResponse {
  serviceID: number;
  serviceCode: string;
  serviceName: string;
  description: string;
  price: number;
  duration: number; // in minutes
  imagePath: string | null;
  isActive: boolean;
  createdBy: number;
  createdDate: string;
  updatedDate: string | null;
}

export interface ServiceListItem {
  serviceID: number;
  serviceName: string;
  price: number;
  duration: number;
  imagePath: string | null;
  isActive: boolean;
}

export interface ServiceListResponse {
  items: ServiceListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

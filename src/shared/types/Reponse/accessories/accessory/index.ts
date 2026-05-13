export interface AccessoryDetailResponse {
  accessoryID: number;
  accessoryCode: string;
  accessoryName: string;
  categoryID: number;
  brandAccessoryID: number;
  description: string;
  price: number;
  costPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  compatibleCarModels: string;
  imagePath: string;
  installationVideo: string;
  warrantyMonths: number;
  createdBy: number;
}

export interface AccessoriesListItem {
  accessoryID: number;
  accessoryName: string;
  price: number;
  costPrice?: number | null;
  imagePath: string;
  categoryName: string;
  brandName: string;
  stockQuantity: number;
}

export interface AccessoryListResponse {
  items: AccessoriesListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

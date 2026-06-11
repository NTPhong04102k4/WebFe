export type AccessoryPagingRequest = {
  page?: number;
  pageSize?: number;
  priceFrom?: number | null;
  priceTo?: number | null;
  categoryID?: number | null;
  categoryIDs?: number[] | null;
  brandAccessoryID?: number | null;
  sortBy?: string | null;
  sortDescending?: boolean;
};

export type AccessoryRequestCreate = {
  accessoryCode: string;
  accessoryName: string;
  categoryID: number;
  brandAccessoryID?: number | null;
  description: string;
  price: number;
  costPrice?: number | null;
  stockQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  compatibleCarModels: string; // JSON string
  imagePath?: File | null;
  installationVideo?: File | null;
  warrantyMonths?: number | null;
  createdBy: number;
};
export type AccessoryRequestUpdate = {
  accessoryID: number;
  accessoryCode: string;
  accessoryName: string;
  categoryID: number;
  brandAccessoryID?: number | null;
  description: string;
  price: number;
  costPrice?: number | null;
  stockQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  compatibleCarModels: string; // JSON string
  imagePath?: File | null;
  installationVideo?: File | null;
  warrantyMonths?: number | null;
  createdBy: number;
};

export type { AccessoryRequestCreate as AccessoriesRequest };

import type { OperationResult } from "src/services/types/common.types";
import type { PagedResult } from "../hr/hr.types";

export interface ServiceCatalogQuery {
  categoryID?: number | null;
  isActive?: boolean | null;
  keyword?: string | null;
  page?: number;
  pageSize?: number;
}

export interface ServiceCatalogRequest {
  serviceCode: string;
  serviceName: string;
  categoryID: number;
  description?: string | null;
  price: number;
  estimatedDuration_minutes: number;
  requiredSkills?: string[] | null;
  isActive?: boolean;
}

export interface ServiceCatalogViewModel {
  serviceID: number;
  serviceCode: string;
  serviceName: string;
  categoryID: number;
  categoryName?: string | null;
  description?: string | null;
  price: number;
  estimatedDuration_minutes: number;
  requiredSkills?: string[] | null;
  isActive: boolean;
  createdDate: string;
}

export interface ServiceCatalogStatusRequest {
  isActive: boolean;
}

export type ServiceCatalogListResult = PagedResult<ServiceCatalogViewModel>;
export type ServiceCatalogOperationResult<T = unknown> = OperationResult<T>;

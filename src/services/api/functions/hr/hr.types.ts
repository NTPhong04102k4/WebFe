/** HR view models — theo docs/api/modules/hr.md (camelCase khi JSON). */
export interface SkillViewModel {
  skillID: number;
  skillCode: string;
  skillName: string;
  description?: string;
  category?: string;
  isActive: boolean;
}

export interface TechnicianListParams {
  page?: number;
  pageSize?: number;
  available?: boolean;
}

/** Phân trang thường gặp từ backend */
export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

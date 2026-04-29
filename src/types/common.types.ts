export interface OperationResult<T = unknown> {
  success: boolean
  errorCode?: string | null
  message?: string | null
  data?: T | null
}

export interface PagedResponse<T> {
  data: T[]
  totalCount: number
}

export interface PagedResponseAlt<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PagedResponseFull<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
}

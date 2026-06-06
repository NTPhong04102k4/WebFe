export interface BroadcastRequest {
  title: string;
  body: string;
  /** Customer | Staff | Both */
  targetType: 'Customer' | 'Staff' | 'Both';
  /** RoleName filter — only used when targetType = Staff | Both */
  staffRoleFilter?: string;
  /** ISO datetime — null means Draft (manual send) */
  scheduledAt?: string;
}

export interface BroadcastQueryRequest {
  page?: number;
  pageSize?: number;
  status?: string;
}

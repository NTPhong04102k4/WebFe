export interface BroadcastRequest {
  title: string;
  body: string;
  /** Customer | Staff | Both */
  targetType: 'Customer' | 'Staff' | 'Both';
  /** RoleName filter — only used when targetType = Staff | Both AND targetStaffIDs is empty */
  staffRoleFilter?: string;
  /** ISO datetime — null means Draft (manual send) */
  scheduledAt?: string;
  /** Specific staff IDs to target. SuperAdmin: omit = all staff. Admin: required. */
  targetStaffIDs?: number[];
}

export interface BroadcastQueryRequest {
  page?: number;
  pageSize?: number;
  status?: string;
}

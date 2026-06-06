export interface BroadcastViewModel {
  broadcastID: number;
  title: string;
  body: string;
  /** Customer | Staff | Both */
  targetType: string;
  staffRoleFilter?: string;
  /** Draft | Scheduled | Sending | Sent | Failed */
  status: string;
  scheduledAt?: string;
  sentAt?: string;
  recipientCount: number;
  creatorName?: string;
  createdDate: string;
}

export interface BroadcastListResult {
  data: BroadcastViewModel[];
  totalCount: number;
}

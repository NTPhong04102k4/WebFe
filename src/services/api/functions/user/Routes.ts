export const userRoute = {
  adminUsers: "/user/admin/users",
  recent7Days: "/user/admin/users/recent/7-days",
  recent30Days: "/user/admin/users/recent/30-days",
  allUsers: "/user/admin/users/all",
  detailByKey: (gmailOrUserName: string) =>
    `/user/${encodeURIComponent(gmailOrUserName)}`,
  adminUserById: (id: string | number) => `/user/admin/users/${id}`,
  fcmToken: "/user/fcm-token",
  sendGmailMessage: "/user/send-gmail-message",
} as const;

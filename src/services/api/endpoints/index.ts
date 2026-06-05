/**
 * Single source of truth for HTTP paths — aligned with docs/api/frontend-api-reference.md
 * (no global `api/` prefix).
 */
export const API = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
    logout: "/auth/logout",
    refreshToken: "/auth/refresh-token",
    googleLogin: "/auth/login/google",
    googleCallback: "/auth/callback/google",
    facebookLogin: "/auth/login/facebook",
    facebookCallback: "/auth/callback/facebook",
    adminLogin: "/auth/admin/login",
    adminStaffCreate: "/auth/admin/staff/create",
    adminStaff: "/auth/admin/staff",
    adminStaffDetail: (staffId: string | number) =>
      `/auth/admin/staff/${staffId}`,
    adminStaffPassword: (staffId: string | number) =>
      `/auth/admin/staff/${staffId}/password`,
    adminStaffStatus: (staffId: string | number) =>
      `/auth/admin/staff/${staffId}/status`,
    superAdminRecoverPassword: "/auth/admin/superadmin/recover-password",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },
  user: {
    detail: "/user/detail",
    updateProfile: "/user/profile",
    changePassword: "/user/changepassword",
    forgetPassword: "/user/forgetPassword",
    verifyOtpForPassword: "/user/verifyOtpForPassword",
    resetPasswordWithTemp: "/user/resetPasswordWithTemp",
    sendGmailMessage: "/user/send-gmail-message",
    filesUpload: "/user/files/upload",
  },
  ordersPayment: {
    /** GET /orders/payment/orders — Admin,SuperAdmin,Staff */
    orders: "/orders/payment/orders",
    myOrders: "/orders/payment/my-orders",
    /** GET /orders/payment/order/{orderNumber} — Authorized */
    order: (orderNumber: string) => `/orders/payment/order/${orderNumber}`,
    /** GET /orders/payment/order/{orderNumber}/payment-info — Authorized */
    orderPaymentInfo: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/payment-info`,
    /** POST /orders/payment/preview — Customer */
    previewOrder: "/orders/payment/preview",
    /** POST /orders/payment/order — Customer */
    createOrder: "/orders/payment/order",
    /** POST /orders/payment/order/{orderNumber}/check-payment — đối soát online */
    checkPayment: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/check-payment`,
    /** POST /orders/payment/order/{orderNumber}/cash — ghi tiền mặt (Staff/Admin/Sales) */
    recordCash: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/cash`,
    /** POST /orders/payment/sepay-ipn — AllowAnonymous */
    sepayIpn: "/orders/payment/sepay-ipn",
    /** PATCH /orders/payment/order/{id}/status — Admin,SuperAdmin,Staff */
    /**
     * GET /orders/payment/revenue-report — Admin,SuperAdmin
     * params: fromDate?, toDate?, groupBy? (Day|Month|Category)
     */
    revenueReport: "/orders/payment/revenue-report",
    /** POST /orders/payment/order/{orderNumber}/send-invoice — Admin,Staff */
    sendInvoice: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/send-invoice`,
    /** GET /orders/payment/order/{orderNumber}/invoice-pdf — Admin,Staff,Customer(own) */
    invoicePdf: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/invoice-pdf`,
    /** PATCH /orders/payment/order/{id}/status — Admin,SuperAdmin,Staff */
    orderStatus: (id: string | number) =>
      `/orders/payment/order/${id}/status`,
    /** POST /orders/payment/order/{orderNumber}/cancel — Customer (Pending only) */
    cancelOrder: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/cancel`,
    /** GET /orders/payment/installment-plans — Public */
    installmentPlans: "/orders/payment/installment-plans",
    /** POST /orders/payment/promo/apply — Public */
    promoApply: "/orders/payment/promo/apply",
  },

  finance: {
    /** GET /finance/summary — Admin,SuperAdmin */
    summary: "/finance/summary",
    /** GET /finance/payroll-summary — Admin,SuperAdmin */
    payrollSummary: "/finance/payroll-summary",
  },

  cart: {
    /** GET /cart — Customer */
    root: "/cart",
    /** POST /cart/cars — Customer */
    cars: "/cart/cars",
    /** DELETE /cart/cars/{carId} — Customer */
    car: (carId: number) => `/cart/cars/${carId}`,
    /** POST /cart/accessories — Customer */
    accessories: "/cart/accessories",
    /** DELETE /cart/accessories/{accessoryId} — Customer */
    accessory: (accessoryId: number) => `/cart/accessories/${accessoryId}`,
    /** PATCH /cart/items — Customer */
    items: "/cart/items",
  },

  chat: {
    conversations: "/chat/conversations",
    staffConversations: "/chat/conversations/staff",
    conversation: (id: string | number) => `/chat/conversations/${id}`,
    messages: (id: string | number) => `/chat/conversations/${id}/messages`,
    createMessage: "/chat/messages",
    assign: (id: string | number) => `/chat/conversations/${id}/assign`,
    close: (id: string | number) => `/chat/conversations/${id}/close`,
    read: (id: string | number) => `/chat/conversations/${id}/read`,
    respondAssign: (id: string | number) => `/chat/conversations/${id}/respond-assign`,
    pinMessage: (messageId: string | number) => `/chat/messages/${messageId}/pin`,
  },
  ai: {
    sessions: "/ai/sessions",
    sessionsSearch: "/ai/sessions/search",
    session: (id: string | number) => `/ai/sessions/${id}`,
    messages: (id: string | number) => `/ai/sessions/${id}/messages`,
    rename: (id: string | number) => `/ai/sessions/${id}/rename`,
    chat: "/ai/chat",
    feedback: (id: string | number) => `/ai/messages/${id}/feedback`,
    kb: "/ai/kb",
    kbItem: (id: string | number) => `/ai/kb/${id}`,
    /** GET /ai/quota — Authorized */
    quota: "/ai/quota",
  },
  car: {
    detail: (id: string | number) => `/cars/${id}`,
    techSpecGet: (id: string | number) => `/cars/${id}/tech-spec`,
    paging: "/cars",
    create: "/car/create",
    edit: "/car/edit",
    delete: (id: string | number) => `/cars/${id}`,
    techSpecDetailItem: "/car/techSpec/DetailItem",
    techSpecCreate: "/car/techSpec/create",
    techSpecEdit: "/car/techSpec/edit",
  },
  accessory: {
    detail: (id: string | number) => `/accessories/${id}`,
    all: "/accessories",
    create: "/accessories",
    edit: (id: string | number) => `/accessories/${id}`,
  },
  category: {
    all: "/categories",
    detail: (id: string | number) => `/categories/${id}`,
    create: "/categories",
    edit: (id: string | number) => `/categories/${id}`,
  },
  common: {
    brands: "/common/brands",
    brandAccessories: "/common/brand-accessories",
    brandCreate: "/common/brand/create",
    brandEdit: "/common/brand/edit",
    brandAccessoryCreate: "/common/brand-accessories",
    brandAccessoryEdit: (name: string) =>
      `/common/brand-accessories/${encodeURIComponent(name)}`,
    bodytypes: "/common/bodytypes",
    bodytypeCreate: "/common/bodytype/create",
    bodytypeUpdate: "/common/bodytype/update",
    location: "/common/location",
    locations: "/common/locations",
    locationsNearby: "/common/locations/nearby",
  },
  hr: {
    payrolls: "/hr/payrolls",
    payroll: (id: string | number) => `/hr/payrolls/${id}`,
    payrollPay: (id: string | number) => `/hr/payrolls/${id}/pay`,
    payrollRecalculate: "/hr/payrolls/recalculate",
    skills: {
      list: "/hr/skills",
      detail: (id: string | number) => `/hr/skills/${id}`,
    },
    technicianLevels: {
      list: "/hr/technician-levels",
      detail: (id: string | number) => `/hr/technician-levels/${id}`,
    },
    technicians: {
      list: "/hr/technicians",
      available: "/hr/technicians/available",
      detail: (id: string | number) => `/hr/technicians/${id}`,
      skills: (id: string | number) => `/hr/technicians/${id}/skills`,
      performance: (id: string | number) => `/hr/technicians/${id}/performance`,
      assignSkill: (id: string | number) => `/hr/technicians/${id}/skills`,
      removeSkill: (technicianId: string | number, skillId: string | number) =>
        `/hr/technicians/${technicianId}/skills/${skillId}`,
    },
  },
  insurance: {
    companies: "/insurance/companies",
    company: (id: string | number) => `/insurance/companies/${id}`,
    packages: "/insurance/packages",
    package: (id: string | number) => `/insurance/packages/${id}`,
    policies: "/insurance/policies",
    policiesExpiring: "/insurance/policies/expiring",
    policy: (id: string | number) => `/insurance/policies/${id}`,
    policyCancel: (id: string | number) => `/insurance/policies/${id}/cancel`,
    /** POST /insurance/claims — Customer */
    claims: "/insurance/claims",
    /** GET /insurance/claims — Authorized */
    claim: (id: string | number) => `/insurance/claims/${id}`,
    /** PATCH /insurance/claims/{id}/status — Admin,Staff */
    claimStatus: (id: string | number) => `/insurance/claims/${id}/status`,
  },
  workshop: {
    customerVehicles: "/workshop/customer-vehicles",
    customerVehicle: (id: string | number) =>
      `/workshop/customer-vehicles/${id}`,
    customerVehicleHistory: (id: string | number) =>
      `/workshop/customer-vehicles/${id}/maintenance-history`,
    customerVehicleMileage: (id: string | number) =>
      `/workshop/customer-vehicles/${id}/mileage`,
    appointments: "/workshop/appointments",
    appointment: (id: string | number) => `/workshop/appointments/${id}`,
    appointmentConfirm: (id: string | number) =>
      `/workshop/appointments/${id}/confirm`,
    appointmentCancel: (id: string | number) =>
      `/workshop/appointments/${id}/cancel`,
    appointmentStatus: (id: string | number) =>
      `/workshop/appointments/${id}/status`,
    appointmentReminder: (id: string | number) =>
      `/workshop/appointments/${id}/send-reminder`,
    workOrders: "/workshop/work-orders",
    workOrder: (id: string | number) => `/workshop/work-orders/${id}`,
    workOrderStatus: (id: string | number) =>
      `/workshop/work-orders/${id}/status`,
    workOrderAssignTechnician: (id: string | number) =>
      `/workshop/work-orders/${id}/assign-technician`,
    workOrderServices: (id: string | number) =>
      `/workshop/work-orders/${id}/services`,
    workOrderParts: (id: string | number) =>
      `/workshop/work-orders/${id}/parts`,
    workOrderPay: (id: string | number) => `/workshop/work-orders/${id}/pay`,
    workOrderDeliver: (id: string | number) => `/workshop/work-orders/${id}/deliver`,
    workOrderConfirmDelivery: (id: string | number) => `/workshop/work-orders/${id}/confirm-delivery`,
    workOrderPaymentInfo: (id: string | number) =>
      `/workshop/work-orders/${id}/payment-info`,
    workOrderFeedback: (id: string | number) =>
      `/workshop/work-orders/${id}/feedback`,
    /** POST /workshop/appointments/{id}/check-in — tạo WorkOrder 1 bước từ Appointment */
    appointmentCheckIn: (id: string | number) =>
      `/workshop/appointments/${id}/check-in`,
    /** GET /workshop/appointments/schedule-timeline — Staff+ */
    scheduleTimeline: "/workshop/appointments/schedule-timeline",
    /** GET /workshop/work-orders/maintenance-history — Authorized */
    workOrderMaintenanceHistory: "/workshop/work-orders/maintenance-history",
    workOrderServiceItem: (
      workOrderId: string | number,
      workOrderServiceId: string | number,
    ) => `/workshop/work-orders/${workOrderId}/services/${workOrderServiceId}`,
    workOrderPartItem: (
      workOrderId: string | number,
      workOrderPartId: string | number,
    ) => `/workshop/work-orders/${workOrderId}/parts/${workOrderPartId}`,
  },
  serviceCatalog: {
    list: "/services",
    detail: (id: string | number) => `/services/${id}`,
    status: (id: string | number) => `/services/${id}/status`,
  },
  premium: {
    plans: "/premium-plans",
    plan: (id: string | number) => `/premium-plans/${id}`,
    mySubscription: "/premium-plans/my-subscription",
    subscribe: "/premium-plans/subscribe",
    cancel: "/premium-plans/cancel",
    renew: "/premium-plans/renew",
    /** GET /premium-plans/admin/subscriptions — Added in commit feat/manage revenue premium plans */
    adminSubscriptions: "/premium-plans/admin/subscriptions",
    /** POST /premium-plans/subscribe/activate — Customer */
    subscribeActivate: "/premium-plans/subscribe/activate",
    /** GET — lấy lại QR của PENDING sub hiện có, không tạo mới */
    subscribePendingQr: "/premium-plans/subscribe/pending-qr",
    /** POST /premium-plans/subscribe/cancel-pending — Customer */
    cancelPending: "/premium-plans/subscribe/cancel-pending",
    /** GET /premium-plans/my-subscriptions — Customer, paginated history */
    mySubscriptions: "/premium-plans/my-subscriptions",
  },

  review: {
    carList: (carId: string | number) => `/reviews/cars/${carId}`,
    carStats: (carId: string | number) => `/reviews/cars/${carId}/stats`,
    carDetail: (id: string | number) => `/reviews/cars/detail/${id}`,
    carCreate: "/reviews/cars",
    carMy: "/reviews/cars/my",
    carUpdate: (id: string | number) => `/reviews/cars/${id}`,
    car: (id: string | number) => `/reviews/cars/${id}`,
    carHelpful: (id: string | number) => `/reviews/cars/${id}/helpful`,
    carReport: (id: string | number) => `/reviews/cars/${id}/report`,
    serviceByTechnician: (technicianId: string | number) =>
      `/reviews/services/technician/${technicianId}`,
    serviceTechnicianStats: (technicianId: string | number) =>
      `/reviews/services/technician/${technicianId}/stats`,
    serviceByLocation: (locationId: string | number) =>
      `/reviews/services/location/${locationId}`,
    serviceLocationStats: (locationId: string | number) =>
      `/reviews/services/location/${locationId}/stats`,
    serviceWorkOrder: (workOrderId: string | number) =>
      `/reviews/services/work-order/${workOrderId}`,
    service: (id: string | number) => `/reviews/services/${id}`,
    serviceDetail: (id: string | number) => `/reviews/services/detail/${id}`,
    serviceCreate: "/reviews/services",
    serviceMy: "/reviews/services/my",
    serviceRespond: (id: string | number) => `/reviews/services/${id}/respond`,
    adminAll: "/reviews/admin",
    adminPending: "/reviews/admin/pending",
    adminModerate: (id: string | number) => `/reviews/admin/${id}/moderate`,
  },
} as const;

export type ApiEndpoints = typeof API;

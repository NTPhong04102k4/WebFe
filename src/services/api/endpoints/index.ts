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
  },
  user: {
    detail: "/user/detail",
    updateProfile: "/user/update-profile",
    changePassword: "/user/changepassword",
    forgetPassword: "/user/forgetPassword",
    verifyOtpForPassword: "/user/verifyOtpForPassword",
    resetPasswordWithTemp: "/user/resetPasswordWithTemp",
    sendGmailMessage: "/user/send-gmail-message",
    filesUpload: "/user/files/upload",
  },
  ordersPayment: {
    orders: "/orders/payment/orders",
    order: (orderNumber: string) => `/orders/payment/order/${orderNumber}`,
    orderPaymentInfo: (orderNumber: string) =>
      `/orders/payment/order/${orderNumber}/payment-info`,
    createOrder: "/orders/payment/order",
    sepayIpn: "/orders/payment/sepay-ipn",
    orderStatus: (id: string | number) =>
      `/orders/payment/order/${id}/status`,
  },
  car: {
    detail: "/car/detail",
    paging: "/cars",
    create: "/car/create",
    edit: "/car/edit",
    /** Backend route currently used by app (see Swagger if 404). */
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
    brandAccessoryEdit: (name: string) => `/common/brand-accessories/${encodeURIComponent(name)}`,
    bodytypes: "/common/bodytypes",
    bodytypeCreate: "/common/bodytype/create",
    bodytypeUpdate: "/common/bodytype/update",
    location: "/common/location",
    locations: "/common/locations",
  },
  hr: {
    payrolls: "/hr/payrolls",
    payroll: (id: string | number) => `/hr/payrolls/${id}`,
    payrollPay: (id: string | number) => `/hr/payrolls/${id}/pay`,
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
      performance: (id: string | number) =>
        `/hr/technicians/${id}/performance`,
      assignSkill: (id: string | number) =>
        `/hr/technicians/${id}/skills`,
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
    policyCancel: (id: string | number) =>
      `/insurance/policies/${id}/cancel`,
    claims: "/insurance/claims",
    claim: (id: string | number) => `/insurance/claims/${id}`,
    claimStatus: (id: string | number) =>
      `/insurance/claims/${id}/status`,
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
    workOrderPay: (id: string | number) =>
      `/workshop/work-orders/${id}/pay`,
    workOrderFeedback: (id: string | number) =>
      `/workshop/work-orders/${id}/feedback`,
    workOrderServiceItem: (
      workOrderId: string | number,
      workOrderServiceId: string | number
    ) =>
      `/workshop/work-orders/${workOrderId}/services/${workOrderServiceId}`,
    workOrderPartItem: (
      workOrderId: string | number,
      workOrderPartId: string | number
    ) => `/workshop/work-orders/${workOrderId}/parts/${workOrderPartId}`,
  },
  review: {
    carList: "/review/car",
    car: (id: string | number) => `/review/car/${id}`,
    serviceList: "/review/service",
    service: (id: string | number) => `/review/service/${id}`,
    adminPending: "/review/pending",
    adminModerate: (id: string | number) => `/review/${id}/moderate`,
  },
} as const;

export type ApiEndpoints = typeof API;

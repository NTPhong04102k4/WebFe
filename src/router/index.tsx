import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import CustomerLayout from '@/components/layout/CustomerLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'

// ── Account pages ─────────────────────────────────────────────────────────────
import AccountLayout from '@/pages/account/AccountLayout'
const AccountGaragePage       = lazy(() => import('@/pages/account/garage/GaragePage'))
const AccountAppointmentsPage = lazy(() => import('@/pages/account/appointments/AppointmentsPage'))
const AccountWorkOrdersPage   = lazy(() => import('@/pages/account/work-orders/WorkOrdersPage'))
const AccountInsurancePage    = lazy(() => import('@/pages/account/insurance/MyInsurancePage'))
const AccountReviewsPage      = lazy(() => import('@/pages/account/reviews/MyReviewsPage'))

// ── Customer pages ────────────────────────────────────────────────────────────
const HomePage            = lazy(() => import('@/pages/customer/Home'))
const CarsPage            = lazy(() => import('@/pages/customer/Cars'))
const CarDetailPage       = lazy(() => import('@/pages/customer/CarDetail'))
const AccessoriesPage     = lazy(() => import('@/pages/customer/Accessories'))
const AccessoryDetailPage = lazy(() => import('@/pages/customer/AccessoryDetail'))
const CartPage            = lazy(() => import('@/pages/customer/Cart'))
const OrdersPage          = lazy(() => import('@/pages/customer/Orders'))
const OrderDetailPage     = lazy(() => import('@/pages/customer/OrderDetail'))
const AppointmentsPage    = lazy(() => import('@/pages/customer/Appointments'))
const ProfilePage         = lazy(() => import('@/pages/customer/Profile'))
const ReviewsPage         = lazy(() => import('@/pages/customer/Reviews'))
const ChatPage            = lazy(() => import('@/pages/customer/Chat'))
const AiChatPage          = lazy(() => import('@/pages/customer/AiChat'))
const PremiumPlansPage    = lazy(() => import('@/pages/customer/Premium'))
const PremiumHistoryPage  = lazy(() => import('@/pages/customer/Premium/PremiumHistory'))
const ServicesPage        = lazy(() => import('@/pages/customer/Services'))

// ── Auth pages ────────────────────────────────────────────────────────────────
const LoginPage           = lazy(() => import('@/pages/auth/Login'))
const RegisterPage        = lazy(() => import('@/pages/auth/Register'))
const VerifyOtpPage       = lazy(() => import('@/pages/auth/VerifyOtp'))
const ForgotPasswordPage  = lazy(() => import('@/pages/auth/ForgotPassword'))
const ResetPasswordPage   = lazy(() => import('@/pages/auth/ResetPassword'))
const AdminLoginPage      = lazy(() => import('@/pages/auth/AdminLogin'))

// ── Admin pages ───────────────────────────────────────────────────────────────
const DashboardPage              = lazy(() => import('@/pages/admin/dashboard/index'))
const AdminCarsPage              = lazy(() => import('@/pages/admin/Cars'))
const AdminBrandsPage            = lazy(() => import('@/pages/admin/Brands'))
const AdminBodyTypesPage         = lazy(() => import('@/pages/admin/BodyTypes'))
const AdminAccessoriesPage       = lazy(() => import('@/pages/admin/Accessories'))
const AdminCategoriesPage        = lazy(() => import('@/pages/admin/Categories'))
const AdminLocationsPage         = lazy(() => import('@/pages/admin/Locations'))
const AdminOrdersPage            = lazy(() => import('@/pages/admin/Orders'))
const AdminUsersPage             = lazy(() => import('@/pages/admin/Users'))
const TechniciansPage            = lazy(() => import('@/pages/admin/HR/Technicians'))
const TechnicianLevelsPage       = lazy(() => import('@/pages/admin/HR/TechnicianLevels'))
const SkillsPage                 = lazy(() => import('@/pages/admin/HR/Skills'))
const PayrollPage                = lazy(() => import('@/pages/admin/HR/Payroll'))
const InsuranceCompaniesPage     = lazy(() => import('@/pages/admin/Insurance/Companies'))
const InsurancePackagesPage      = lazy(() => import('@/pages/admin/Insurance/Packages'))
const InsurancePoliciesPage      = lazy(() => import('@/pages/admin/Insurance/Policies'))
const WorkshopAppointmentsPage   = lazy(() => import('@/pages/admin/Workshop/Appointments'))
const CustomerVehiclesPage       = lazy(() => import('@/pages/admin/Workshop/CustomerVehicles'))
const WorkOrdersPage             = lazy(() => import('@/pages/admin/Workshop/WorkOrders'))
const ServiceCatalogPage          = lazy(() => import('@/pages/admin/Workshop/Services'))
const AdminReviewsPage           = lazy(() => import('@/pages/admin/Reviews'))
const StaffPage                  = lazy(() => import('@/pages/admin/Staff/index'))
const AdminPremiumPlansPage      = lazy(() => import('@/pages/admin/PremiumPlans/index'))
const AdminSubscriptionsPage     = lazy(() => import('@/pages/admin/Subscriptions/index'))
const AdminFinancePage           = lazy(() => import('@/pages/admin/Finance/index'))
const AdminSupportChatPage       = lazy(() => import('@/pages/admin/SupportChat/index'))
const AdminBroadcastPage         = lazy(() => import('@/pages/admin/Broadcast/index'))
const AdminCarInquiriesPage      = lazy(() => import('@/pages/admin/CarInquiries/index'))

function Fallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )
}

export default function AppRouter() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* ── Customer ────────────────────────────────────── */}
        <Route element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="cars/:id" element={<CarDetailPage />} />
          <Route path="accessories" element={<AccessoriesPage />} />
          <Route path="accessories/:id" element={<AccessoryDetailPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="ai-chat" element={<AiChatPage />} />
          <Route path="premium" element={<PremiumPlansPage />} />
          <Route path="premium/history" element={<ProtectedRoute><PremiumHistoryPage /></ProtectedRoute>} />

          {/* Cần đăng nhập */}
          <Route path="orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="orders/:orderNumber" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
          <Route path="appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="reviews" element={<Navigate to="/cars" replace />} />
          <Route path="reviews/:carId" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Route>

        {/* ── Account ─────────────────────────────────────── */}
        <Route
          path="account"
          element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="garage" replace />} />
          <Route path="garage" element={<AccountGaragePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="appointments" element={<AccountAppointmentsPage />} />
          <Route path="work-orders" element={<AccountWorkOrdersPage />} />
          <Route path="insurance" element={<AccountInsurancePage />} />
          <Route path="reviews" element={<AccountReviewsPage />} />
        </Route>

        {/* ── Auth ────────────────────────────────────────── */}
        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-otp" element={<VerifyOtpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="admin/login" element={<AdminLoginPage />} />
        </Route>

        {/* ── Admin ────────────────────────────────────────── */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['Admin', 'SuperAdmin', 'Staff']} redirectTo="/auth/admin/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cars" element={<AdminCarsPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="body-types" element={<AdminBodyTypesPage />} />
          <Route path="accessories" element={<AdminAccessoriesPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="users" element={<AdminUsersPage />} />

          {/* HR */}
          <Route path="hr/technicians" element={<TechniciansPage />} />
          <Route path="hr/levels" element={<TechnicianLevelsPage />} />
          <Route path="hr/skills" element={<SkillsPage />} />
          <Route path="hr/payroll" element={<PayrollPage />} />

          {/* Insurance */}
          <Route path="insurance/companies" element={<InsuranceCompaniesPage />} />
          <Route path="insurance/packages" element={<InsurancePackagesPage />} />
          <Route path="insurance/policies" element={<InsurancePoliciesPage />} />
          {/* Workshop */}
          <Route path="workshop/appointments" element={<WorkshopAppointmentsPage />} />
          <Route path="workshop/vehicles" element={<CustomerVehiclesPage />} />
          <Route path="workshop/work-orders" element={<WorkOrdersPage />} />
          <Route path="workshop/services" element={<ServiceCatalogPage />} />

          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="premium-plans" element={<AdminPremiumPlansPage />} />
          <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
          <Route path="support" element={<AdminSupportChatPage />} />
          <Route path="broadcast" element={<AdminBroadcastPage />} />
          <Route path="car-inquiries" element={<AdminCarInquiriesPage />} />

          {/* SuperAdmin only */}
          <Route
            path="staff"
            element={
              <ProtectedRoute roles={['SuperAdmin']}>
                <StaffPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

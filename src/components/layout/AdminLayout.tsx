import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Car, ChevronDown, ChevronRight, LayoutDashboard, LogOut,
  Menu, Package, ShoppingBag, Users, Wrench, Shield, Star,
  UserCog, MapPin, X, Briefcase,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import api from '@/services/api/axiosInstance'

interface NavItem {
  label: string
  icon: React.ReactNode
  to?: string
  children?: { label: string; to: string }[]
  superAdminOnly?: boolean
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, to: '/admin/dashboard' },
  {
    label: 'Quản lý xe',
    icon: <Car className="h-4 w-4" />,
    children: [
      { label: 'Danh sách xe', to: '/admin/cars' },
      { label: 'Thương hiệu', to: '/admin/brands' },
      { label: 'Loại thân xe', to: '/admin/body-types' },
    ],
  },
  {
    label: 'Phụ kiện',
    icon: <Package className="h-4 w-4" />,
    children: [
      { label: 'Danh sách phụ kiện', to: '/admin/accessories' },
      { label: 'Danh mục', to: '/admin/categories' },
    ],
  },
  { label: 'Địa điểm', icon: <MapPin className="h-4 w-4" />, to: '/admin/locations' },
  { label: 'Đơn hàng', icon: <ShoppingBag className="h-4 w-4" />, to: '/admin/orders' },
  { label: 'Người dùng', icon: <Users className="h-4 w-4" />, to: '/admin/users' },
  {
    label: 'Nhân sự (HR)',
    icon: <Briefcase className="h-4 w-4" />,
    children: [
      { label: 'Kỹ thuật viên', to: '/admin/hr/technicians' },
      { label: 'Cấp bậc', to: '/admin/hr/levels' },
      { label: 'Kỹ năng', to: '/admin/hr/skills' },
      { label: 'Bảng lương', to: '/admin/hr/payroll' },
    ],
  },
  {
    label: 'Bảo hiểm',
    icon: <Shield className="h-4 w-4" />,
    children: [
      { label: 'Công ty BH', to: '/admin/insurance/companies' },
      { label: 'Gói BH', to: '/admin/insurance/packages' },
      { label: 'Hợp đồng', to: '/admin/insurance/policies' },
      { label: 'Yêu cầu BT', to: '/admin/insurance/claims' },
    ],
  },
  {
    label: 'Xưởng dịch vụ',
    icon: <Wrench className="h-4 w-4" />,
    children: [
      { label: 'Lịch hẹn', to: '/admin/workshop/appointments' },
      { label: 'Xe khách hàng', to: '/admin/workshop/vehicles' },
      { label: 'Phiếu công việc', to: '/admin/workshop/work-orders' },
    ],
  },
  { label: 'Đánh giá', icon: <Star className="h-4 w-4" />, to: '/admin/reviews' },
  {
    label: 'Quản lý Staff',
    icon: <UserCog className="h-4 w-4" />,
    to: '/admin/staff',
    superAdminOnly: true,
  },
]

function SidebarItem({
  item,
  isSuperAdmin,
}: {
  item: NavItem
  isSuperAdmin: boolean
}) {
  const location = useLocation()
  const [open, setOpen] = useState(() =>
    item.children?.some((c) => location.pathname.startsWith(c.to)) ?? false
  )

  if (item.superAdminOnly && !isSuperAdmin) return null

  if (item.children) {
    const isActive = item.children.some((c) => location.pathname.startsWith(c.to))
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="flex items-center gap-3">
            {item.icon}
            {item.label}
          </span>
          {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>
        {open && (
          <div className="ml-7 mt-0.5 space-y-0.5">
            {item.children.map((child) => (
              <Link
                key={child.to}
                to={child.to}
                className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  location.pathname === child.to
                    ? 'bg-blue-600 font-medium text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      to={item.to!}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        location.pathname === item.to
          ? 'bg-blue-600 text-white'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {item.icon}
      {item.label}
    </Link>
  )
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout, accessToken, isSuperAdmin } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      if (accessToken) {
        const refreshToken = useAuthStore.getState().refreshToken
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
      // ignore
    } finally {
      logout()
      toast.success('Đã đăng xuất')
      navigate('/auth/admin/login')
    }
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Car className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-slate-800">SoldCars Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <SidebarItem key={item.label} item={item} isSuperAdmin={isSuperAdmin()} />
        ))}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-200 p-3">
        <div className="mb-2 rounded-lg bg-slate-50 px-3 py-2">
          <div className="text-xs font-medium text-slate-800 truncate">{user?.fullName || user?.username}</div>
          <div className="text-xs text-slate-500">{user?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200 bg-white lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-white shadow-xl">
            <button
              className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:block">
              Xin chào, <strong>{user?.fullName || user?.username}</strong>
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
              {(user?.fullName || user?.username || 'A')[0].toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

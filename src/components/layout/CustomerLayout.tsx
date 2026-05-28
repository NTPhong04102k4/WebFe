import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Car,
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  MessageCircle,
  Bot,
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { notify } from "@/components/core/Feedback/toast";
import api from "@/services/api/axiosInstance";
import { canAccessStaffBackend, getUserRoles } from "@/common/utils/roles";
import { isTokenExpired } from "@/services/decode";
import { API } from "@/services/api/endpoints";

export default function CustomerLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, logout, accessToken } = useAuthStore();
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);

  const cartCount = useCartStore((s) => s.totalCount());
  const navigate = useNavigate();

  // Chạy một lần khi layout mount — nếu access token đã expire thì thử refresh
  // ngay, không đợi request đầu tiên bị 401
  const refreshAttempted = useRef(false);
  useEffect(() => {
    if (refreshAttempted.current) return;
    refreshAttempted.current = true;

    if (!accessToken || !isTokenExpired(accessToken)) return;

    if (!refreshToken) {
      logout();
      navigate("/auth/login", { replace: true });
      return;
    }

    api
      .post<{ access_token?: string; token?: string; refresh_token?: string }>(
        API.auth.refreshToken,
        { refreshToken },
      )
      .then((res) => {
        const newAccess = res.data.access_token ?? res.data.token ?? "";
        const newRefresh = res.data.refresh_token ?? refreshToken;
        if (newAccess) {
          setTokens(newAccess, newRefresh);
        } else {
          logout();
          navigate("/auth/login", { replace: true });
        }
      })
      .catch(() => {
        // Refresh thất bại — buộc đăng xuất để tránh dùng token cũ
        logout();
        notify.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/auth/login", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect staff/admin về backend của họ ngay sau login
  useEffect(() => {
    if (canAccessStaffBackend(getUserRoles(user))) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate, user]);

  // Click outside to close user menu dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      if (accessToken) {
        const rToken = useAuthStore.getState().refreshToken;
        await api.post(API.auth.logout, { refreshToken: rToken });
      }
    } catch {
      // bỏ qua lỗi API — local state luôn được clear
    } finally {
      logout();
      notify.success("Đã đăng xuất");
      navigate("/");
    }
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/cars", label: "Xe hơi" },
    { to: "/accessories", label: "Phụ kiện" },
    { to: "/appointments", label: "Dịch vụ" },
    { to: "/reviews", label: "Review" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-blue-700"
          >
            <Car className="h-6 w-6" />
            <span className="text-lg">SoldCars</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* AI Chat */}
            <Link
              to="/ai-chat"
              className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600 sm:block"
              title="AI Chatbot"
            >
              <Bot className="h-5 w-5" />
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-600"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((p) => !p)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block">
                    {user.fullName || user.username}
                  </span>
                </button>
                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <User className="h-4 w-4" /> Hồ sơ cá nhân
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <ShoppingCart className="h-4 w-4" /> Đơn hàng của tôi
                    </Link>
                    <Link
                      to="/appointments"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Car className="h-4 w-4" /> Lịch hẹn
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <MessageCircle className="h-4 w-4" /> Chat
                    </Link>
                    {(user.role === "Admin" || user.role === "SuperAdmin") && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-slate-50"
                      >
                        Trang quản trị
                      </Link>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth/login"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="block py-3 text-sm font-medium text-slate-700 hover:text-blue-600"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2 text-white">
                <Car className="h-5 w-5 text-blue-400" />
                <span className="font-bold">SoldCars</span>
              </div>
              <p className="text-sm leading-relaxed">
                Hệ thống mua bán xe hơi uy tín, chất lượng hàng đầu Việt Nam.
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Liên kết nhanh</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/cars" className="hover:text-white">
                    Xe hơi
                  </Link>
                </li>
                <li>
                  <Link to="/accessories" className="hover:text-white">
                    Phụ kiện
                  </Link>
                </li>
                <li>
                  <Link to="/appointments" className="hover:text-white">
                    Đặt lịch hẹn
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-semibold text-white">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/ai-chat" className="hover:text-white">
                    AI Chatbot
                  </Link>
                </li>
                <li>
                  <Link to="/chat" className="hover:text-white">
                    Chat trực tiếp
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-700 pt-6 text-center text-xs">
            © {new Date().getFullYear()} SoldCars. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

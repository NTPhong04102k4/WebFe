import React, { useEffect, useMemo, useRef, useState } from "react";
import { BellIcon, SearchIcon } from "./icon";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/redux/hook";
import { clearCredentials, selectAuth } from "src/redux/Slice/AuthSlice";
import { authAPI } from "src/services/api/functions/auth/authFn";

interface HeaderProps {
  sidebarOpen: boolean;
}

export const HeaderDashBoard: React.FC<HeaderProps> = React.memo(
  ({ sidebarOpen }) => {
    return (
      <header
        className={`fixed top-0 right-0 h-16 bg-white border-b z-10 flex items-center justify-between px-6
          ${sidebarOpen ? "left-64" : "left-20"}`}
      >
        <SearchBar />
        <UserSection />
      </header>
    );
  }
);
const SearchBar: React.FC = React.memo(() => {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const placeholder = useMemo(
    () => "Tìm kiếm xe, dịch vụ, phụ kiện, email/sđt/username...",
    []
  );

  const onSubmit = () => {
    const q = value.trim();
    if (!q) return;
    // Điều hướng đến trang kết quả tìm kiếm quản trị
    navigate(`/admin?query=${encodeURIComponent(q)}`);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="flex items-center w-96">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="absolute left-3 top-2.5 text-gray-400"
          aria-label="Tìm kiếm"
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
});

const UserSection: React.FC = () => (
  <div className="flex items-center space-x-4">
    <NotificationButton />
    <UserInfo />
  </div>
);

const NotificationButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  // Dữ liệu thông báo mẫu, sẽ thay bằng API đơn hàng theo location
  const [notifications] = useState<
    { id: string; title: string; description?: string; time?: string }[]
  >([]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="p-2 rounded-lg hover:bg-gray-100 relative"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <BellIcon />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-20">
          <div className="px-4 py-2 border-b font-semibold">Thông báo</div>
          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500">
                Chưa có đơn hàng mới tại khu vực của bạn.
              </div>
            ) : (
              <ul className="divide-y">
                {notifications.map((n) => (
                  <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="text-sm font-medium">{n.title}</div>
                    {n.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {n.description}
                      </div>
                    )}
                    {n.time && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {n.time}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const UserInfo: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector(selectAuth);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const name =
    auth.user?.fullName ||
    auth.user?.userName ||
    auth.user?.email ||
    "Admin User";

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
    } finally {
      dispatch(clearCredentials());
      navigate("/auth/login");
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center space-x-3 hover:bg-gray-100 px-2 py-1 rounded-lg"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <span className="font-medium max-w-[180px] truncate">{name}</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20 py-1"
        >
          <button
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
          >
            Hồ sơ
          </button>
          <button
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

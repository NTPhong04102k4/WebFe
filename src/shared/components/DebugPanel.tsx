import React, { useState } from "react";
import { useAuthQuery } from "src/query/auth/useAuthQuery";
import { useAppSelector, useAppDispatch } from "src/redux/hook";
import { selectAuth, clearCredentials } from "src/redux/Slice/AuthSlice";
import { Trash2, User, Key, RefreshCw, Eye, EyeOff } from "lucide-react";

export const DebugPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector(selectAuth);
  const { logout, refetchProfile } = useAuthQuery();
  const [showStorage, setShowStorage] = useState(false);

  const handleClearStorage = () => {
    if (window.confirm("Bạn có chắc muốn xóa tất cả dữ liệu đăng nhập?")) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      dispatch(clearCredentials());
      alert("Đã xóa tất cả dữ liệu đăng nhập!");
      window.location.reload();
    }
  };

  const handleLogout = () => {
    logout();
    // logout mutation sẽ tự động redirect, nhưng vẫn hiển thị alert
    setTimeout(() => {
      alert("Đã đăng xuất!");
    }, 100);
  };

  const handleRefreshAuth = async () => {
    try {
      await refetchProfile();
      alert("Đã làm mới trạng thái đăng nhập!");
    } catch (error) {
      alert("Không thể làm mới trạng thái đăng nhập!");
    }
  };

  const getStorageInfo = () => {
    const authUser = localStorage.getItem("auth_user");
    const authToken = localStorage.getItem("auth_token");

    return {
      authUser: authUser ? JSON.parse(authUser) : null,
      authToken: authToken ? `${authToken.substring(0, 20)}...` : null,
      hasUser: !!authUser,
      hasToken: !!authToken,
    };
  };

  const storageInfo = getStorageInfo();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">🔧 Debug Panel</h3>
        <button
          onClick={() => setShowStorage(!showStorage)}
          className="text-gray-500 hover:text-gray-700"
        >
          {showStorage ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Auth Status */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <User size={14} className="text-blue-500" />
          <span className="text-xs font-medium">Auth Status:</span>
          <span
            className={`text-xs px-2 py-1 rounded ${
              isAuthenticated
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập"}
          </span>
        </div>

        {user && (
          <div className="text-xs text-gray-600 ml-6">
            <div>
              👤{" "}
              {user.fullName ||
                (user as any)?.name ||
                (user as any)?.username ||
                "N/A"}
            </div>
            <div>📧 {(user as any)?.email || "N/A"}</div>
            {(user as any)?.username && (
              <div>🔐 Username: {(user as any).username}</div>
            )}
            {(user as any)?.phone && <div>📱 Phone: {(user as any).phone}</div>}
          </div>
        )}
      </div>

      {/* Storage Info */}
      {showStorage && (
        <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Key size={14} className="text-gray-500" />
            <span className="font-medium">Storage Info:</span>
          </div>
          <div className="ml-6 space-y-1">
            <div
              className={`${
                storageInfo.hasUser ? "text-green-600" : "text-red-600"
              }`}
            >
              📦 auth_user: {storageInfo.hasUser ? "Có" : "Không"}
            </div>
            <div
              className={`${
                storageInfo.hasToken ? "text-green-600" : "text-red-600"
              }`}
            >
              🔑 auth_token: {storageInfo.hasToken ? "Có" : "Không"}
            </div>
            {storageInfo.authToken && (
              <div className="text-gray-500 break-all">
                Token: {storageInfo.authToken}
              </div>
            )}
            {storageInfo.authUser && (
              <div className="text-gray-500 mt-1">
                <div className="font-medium">User Data:</div>
                <pre className="text-[10px] overflow-auto max-h-32 bg-white p-1 rounded border">
                  {JSON.stringify(storageInfo.authUser, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        <button
          onClick={handleClearStorage}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors"
        >
          <Trash2 size={14} />
          Xóa Storage
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 transition-colors"
        >
          <User size={14} />
          Đăng xuất
        </button>

        <button
          onClick={handleRefreshAuth}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={14} />
          Làm mới Auth
        </button>
      </div>

      {/* Quick Links */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            🔗{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Đến trang đăng nhập
            </a>
          </div>
          <div>
            🏠{" "}
            <a href="/" className="text-blue-500 hover:underline">
              Về trang chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

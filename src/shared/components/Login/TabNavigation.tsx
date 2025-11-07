import React from "react";

interface TabNavigationProps {
  isLogin: boolean;
  onToggle: () => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  isLogin,
  onToggle,
}) => {
  return (
    <div className="mb-3 ">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={onToggle}
          className={`flex-1 min-w-0 py-2 px-4 rounded-md font-medium transition-all duration-200 text-center whitespace-nowrap ${
            isLogin
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Đăng nhập
        </button>
        <button
          onClick={onToggle}
          className={`flex-1 min-w-0 py-2 px-4 rounded-md font-medium transition-all duration-200 text-center whitespace-nowrap ${
            !isLogin
              ? "bg-white text-green-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Đăng ký
        </button>
      </div>
    </div>
  );
};

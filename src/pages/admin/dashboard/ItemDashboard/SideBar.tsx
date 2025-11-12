import React from "react";
import {
  BuyCarIcon,
  MenuIcon,
  PostsIcon,
  RevenueIcon,
  SellCarIcon,
  UserIcon,
} from "./icon";
import { CarIcon } from "./icon";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isActiveTab: number;
  setIsActiveTab: (tab: number) => void;
}

export type Feats = {
  icon: React.ElementType<{ size: number; color: string }>;
  name: string;
  id: number;
};

export const DATA_FEATS: Feats[] = [
  // { id: 0, name: "Quản lí user", icon: UserIcon },
  // { id: 1, name: "Quản lí nhân viên", icon: UserIcon },
  { id: 0, name: "Quản lí car", icon: CarIcon },
  { id: 1, name: "Quản lí hóa đơn", icon: PostsIcon },
  { id: 2, name: "Quản lí dịch vụ", icon: PostsIcon },
  { id: 3, name: "Quản lí phụ kiện", icon: SellCarIcon },
  { id: 4, name: "Thống kê doanh thu", icon: RevenueIcon },
];

export const Sidebar: React.FC<SidebarProps> = React.memo(
  ({ isOpen, onToggle, isActiveTab, setIsActiveTab }) => {
    const handleChangeTab = (idxTabActive: number) => {
      setIsActiveTab(idxTabActive);
    };

    return (
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-lg shadow-gray-500/50 transition-all duration-300 z-20 
        ${isOpen ? "w-64 bg-red-500" : "w-20"}`}
      >
        <div className="flex items-center shadow-sm justify-between h-16 border-b px-4">
          <h1
            className={`font-bold text-xl transition-opacity duration-300 ${
              !isOpen ? "opacity-0 hidden" : "opacity-100"
            }`}
          >
            Admin
          </h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Toggle Sidebar"
          >
            <MenuIcon />
          </button>
        </div>
        <div className="w-full flex flex-col gap-1">
          {DATA_FEATS.map((item) => {
            console.log("id:", item.id);
            return (
              <FeaturesSideBar
                activeTab={item.id === isActiveTab}
                isOpenSidebar={isOpen}
                icon={item.icon}
                feat={item.name}
                key={item.id}
                onClick={() => handleChangeTab(item.id)}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

const FeaturesSideBar = ({
  icon: Icon,
  feat,
  isOpenSidebar,
  onClick,
  activeTab,
}: {
  icon: React.ElementType<{ size: number; color: string }>;
  feat: string;
  isOpenSidebar: boolean;
  onClick: () => void;
  activeTab: boolean;
}) => {
  return (
    <div
      className={`
        flex flex-row justify-between items-center px-6 py-5 
        hover:shadow cursor-pointer
        transition-all duration-300 
        hover:bg-gray-50 active:scale-95
        ${
          activeTab
            ? "bg-gray-100 border-l-4 border-blue-500 text-blue-700"
            : "bg-white"
        }
      `}
      onClick={onClick}
    >
      <h3
        className={`
        text-black font-sans font-medium 2xl:text-xl text-lg
        transition-opacity duration-300
        ${isOpenSidebar ? "opacity-100 " : "opacity-0 hidden"}
      `}
      >
        {feat}
      </h3>
      <Icon size={24} color={activeTab ? "#3B82F6" : "#000"} />
    </div>
  );
};

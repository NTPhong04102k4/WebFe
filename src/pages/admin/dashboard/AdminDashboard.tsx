/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useState } from "react";
import { storage } from "src/services/storage";
import { Sidebar } from "./ItemDashboard/SideBar";
import { HeaderDashBoard } from "./ItemDashboard/HeaderDashBoard";
import { Accessories } from "./ItemDashboard/mainDashBoard/Accessories";
import { Cars } from "./ItemDashboard/mainDashBoard/Cars";
import { Services } from "./ItemDashboard/mainDashBoard/ServiecsManagement";

enum ActiveTab {
  // USERS = 0,
  // STAFF = 1,
  CARS = 0,
  INVOICES = 1,
  SERVICES = 2,
  ACCESSORIES = 3,
  REVENUE = 4,
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(ActiveTab.ACCESSORIES);

  // Khôi phục activeTab từ localStorage khi component mount
  useEffect(() => {
    const savedTab = storage.get("admin_activeTab");
    if (savedTab !== null) {
      const tabIndex = parseInt(savedTab, 10);
      // Chỉ set nếu giá trị hợp lệ
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 4) {
        setActiveTab(tabIndex as ActiveTab);
      }
      // Xóa localStorage sau khi đọc để tránh conflict
      storage.remove("admin_activeTab");
    }
  }, []);

  const ActiveTabContent = React.useCallback(
    ({ activeTabIdx }: { activeTabIdx: ActiveTab }) => {
      switch (activeTabIdx) {
        // case ActiveTab.USERS:
        //   return <UsersTab />;
        // case ActiveTab.STAFF:
        //   return <UsersTab />;
        case ActiveTab.CARS:
          return <Cars />;
        // case ActiveTab.INVOICES:
        //   return <PurchaseTab />;
        case ActiveTab.SERVICES:
          return <Services />;
        case ActiveTab.ACCESSORIES:
          return <Accessories />;
        // case ActiveTab.REVENUE:
        // return <RevenueTab />;
        default:
          return null;
      }
    },
    []
  );
  useEffect(() => {}, []);

  return (
    <div className="min-h-screen w-full relative inline-flex bg-gray-50">
      <Sidebar
        isActiveTab={activeTab}
        setIsActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />

      <HeaderDashBoard sidebarOpen={sidebarOpen} />

      <main
        className={`
            transition-all duration-300  relative
            pt-24 pb-20 px-6 flex h-auto flex-col 
            ${
              sidebarOpen
                ? "w-[calc(100%-256px)] ml-64"
                : "w-[calc(100%-80px)] ml-20"
            }
          `}
      >
        <div className="flex flex-col h-auto w-full ">
          <ActiveTabContent activeTabIdx={activeTab} />
        </div>
      </main>
      <footer
        className={`
            fixed z-0 bottom-0 right-0 
            bg-white border-t p-4 
            text-center text-gray-600
            transition-all duration-300
            ${sidebarOpen ? "left-64" : "left-20"}
          `}
      >
        <p>
          © {new Date().getFullYear()} Car Sales Admin Dashboard. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
};

export default React.memo(AdminDashboard);

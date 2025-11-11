/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useState } from "react";
import { Sidebar } from "./ItemDashboard/SideBar";
import { HeaderDashBoard } from "./ItemDashboard/HeaderDashBoard";
import { Accessories } from "./ItemDashboard/mainDashBoard/Accessories";
import { Cars } from "./ItemDashboard/mainDashBoard/Cars";

enum ActiveTab {
  USERS = 0,
  STAFF = 1,
  CARS = 2,
  INVOICES = 3,
  SERVICES = 4,
  ACCESSORIES = 5,
  REVENUE = 6,
}

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState(ActiveTab.ACCESSORIES);
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
        // case ActiveTab.SERVICES:
        //   return <Accessories />;
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

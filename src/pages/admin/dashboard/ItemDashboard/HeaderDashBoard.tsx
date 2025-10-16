import React from "react";
import { BellIcon, SearchIcon } from "./icon";
interface HeaderProps {
    sidebarOpen: boolean;
  }
  
  export const HeaderDashBoard: React.FC<HeaderProps> = React.memo(({ sidebarOpen }) => {
    return (
      <header 
        className={`fixed top-0 right-0 h-16 bg-white border-b z-10 flex items-center justify-between px-6
          ${sidebarOpen ? 'left-64' : 'left-20'}`}
      >
        <SearchBar />
        <UserSection />
      </header>
    );
  });
   const SearchBar: React.FC = React.memo(() => (
    <div className="flex items-center w-96">
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
        />
        <div className="absolute left-3 top-2.5 text-gray-400">
          <SearchIcon />
        </div>
      </div>
    </div>
   ));
  
  const UserSection: React.FC = () => (
    <div className="flex items-center space-x-4">
      <NotificationButton />
      <UserInfo />
    </div>
  );
  const NotificationButton: React.FC = () => (
    <button 
      className="p-2 rounded-lg hover:bg-gray-100 relative"
      aria-label="Notifications"
    >
      <BellIcon />
      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
    </button>
  );
  
  const UserInfo: React.FC = () => (
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full bg-gray-200" />
      <span className="font-medium">Admin User</span>
    </div>
  );

  

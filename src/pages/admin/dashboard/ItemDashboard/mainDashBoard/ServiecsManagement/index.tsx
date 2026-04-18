import React from "react";
import { storage } from "src/services/storage";
import { useNavigate } from "react-router-dom";
import { useCategoryList } from "src/shared/hooks/Category/useCategoryManagement";
import { ServiceGrid } from "./Component/ServiceGrid";

export const Services = () => {
  const navigate = useNavigate();
  const { categories, loading: loadingItems } = useCategoryList();

  const handleNavigateToForm = (path: string) => {
    // Lưu index của sidebar (SERVICES = 2) vào localStorage
    storage.set("admin_activeTab", "2");
    navigate(path);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 transition-opacity duration-300">
      <h2 className="text-xl font-bold mb-4">Quản lý Dịch vụ</h2>

      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
          onClick={() => {
            handleNavigateToForm("/auth/login/admin/services/new");
          }}
        >
          + Thêm dịch vụ
        </button>
      </div>

      <ServiceGrid
        items={categories}
        loading={loadingItems}
        emptyText="Chưa có dữ liệu dịch vụ"
        onEdit={(id) => {
          handleNavigateToForm(`/auth/login/admin/services/edit/${id}`);
        }}
      />
    </div>
  );
};

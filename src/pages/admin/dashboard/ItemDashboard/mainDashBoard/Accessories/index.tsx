import { useNavigate } from "react-router-dom";

import { BrandFilter } from "./Component/BrandFilter";
import { AccessoryGrid } from "./Component/AccessoryGrid";
import { Pagination } from "./Component/Pagination";
import { BrandControls } from "./Component/BrandControls";
import { useAccessoriesHandler } from "./useAccessoriesHandler";

const PAGE_SIZE = 8;

export const Accessories = () => {
  const navigate = useNavigate();
  const h = useAccessoriesHandler();

  return (
    <div className="bg-white rounded-lg shadow p-4 transition-opacity duration-300">
      <h2 className="text-xl font-bold mb-4">Quản lý Phụ kiện</h2>

      <div className="mb-3 flex items-center justify-end gap-2">
        <BrandControls
          brands={h.brands}
          onChanged={h.refreshBrands}
          selectedId={h.selectedBrandControlId}
          setSelectedId={h.setSelectedBrandControlId}
        />
        <button
          type="button"
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
          onClick={() => navigate("/auth/login/admin/accessories/new")}
        >
          + Thêm phụ kiện
        </button>
      </div>

      <BrandFilter
        brands={h.brands.map((b) => ({ id: b.name, name: b.name }))}
        loading={h.loadingBrands}
        isAllSelected={h.selectedBrands.has("all")}
        selectedBrands={h.selectedBrands}
        onSelectAll={h.handleSelectAll}
        onToggleBrand={h.handleToggleBrand}
      />

      <AccessoryGrid
        items={h.filteredItems.slice(
          (h.currentPage - 1) * PAGE_SIZE,
          h.currentPage * PAGE_SIZE
        )}
        loading={h.loadingItems}
        emptyText="Chưa có dữ liệu phụ kiện"
        onEdit={(id) => navigate(`/auth/login/admin/accessories/edit/${id}`)}
      />

      <Pagination
        currentPage={h.currentPage}
        totalPages={h.totalPages}
        onPrev={() => { if (h.currentPage > 1) h.setPage(h.currentPage - 1); }}
        onNext={() => { if (h.currentPage < h.totalPages) h.setPage(h.currentPage + 1); }}
      />
    </div>
  );
};

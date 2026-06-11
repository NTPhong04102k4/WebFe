import { EmptyState, Loading } from "src/components/core";

import { BrandFormModal } from "./Component/BrandFormModal";
import { BrandTable } from "./Component/BrandTable";
import { BrandToolbar } from "./Component/BrandToolbar";
import { useBrandManagement } from "./customHookModule/useBrandManagement";

export default function AdminBrandsPage() {
  const brandManager = useBrandManagement();

  return (
    <div className="space-y-6">
      <BrandToolbar
        search={brandManager.search}
        isSyncing={brandManager.isSyncing}
        onSearchChange={brandManager.setSearch}
        onCreate={brandManager.openCreate}
      />

      {brandManager.isLoading ? (
        <Loading label="Đang tải hãng xe..." />
      ) : brandManager.error ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm font-medium text-slate-800 dark:border-red-400 dark:bg-red-900 dark:text-slate-100">
          Lỗi: {brandManager.error.message}
        </div>
      ) : brandManager.filteredBrands.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có hãng xe" description="Chưa có hãng xe phù hợp với bộ lọc." />
        </div>
      ) : (
        <BrandTable brands={brandManager.filteredBrands} onEdit={brandManager.openEdit} />
      )}

      <BrandFormModal
        open={brandManager.modalOpen}
        editingBrand={brandManager.editingBrand}
        isSaving={brandManager.isSaving}
        form={brandManager.form}
        onClose={brandManager.closeModal}
        onSubmit={brandManager.submitForm}
      />
    </div>
  );
}

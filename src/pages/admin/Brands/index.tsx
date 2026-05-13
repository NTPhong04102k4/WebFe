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
        <Loading label="Dang tai hang xe..." />
      ) : brandManager.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Loi: {brandManager.error.message}
        </div>
      ) : brandManager.filteredBrands.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState title="Khong co hang xe" description="Chua co hang xe phu hop voi bo loc." />
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

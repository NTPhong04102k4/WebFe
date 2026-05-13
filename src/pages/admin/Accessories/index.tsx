import { EmptyState, Loading } from "src/components/core";

import { AccessoryFormModal } from "./Component/AccessoryFormModal";
import { AccessoryPagination } from "./Component/AccessoryPagination";
import { AccessoryTable } from "./Component/AccessoryTable";
import { AccessoryToolbar } from "./Component/AccessoryToolbar";
import { useAccessoryManagement } from "./customHookModule/useAccessoryManagement";

const getBrandValue = (brand: { name: string }, index: number) =>
  String((brand as { brandAccessoryID?: number; id?: number }).brandAccessoryID ?? (brand as { id?: number }).id ?? index + 1);

export default function AdminAccessoriesPage() {
  const accessoryManager = useAccessoryManagement();

  const categoryOptions = accessoryManager.categories.map((category) => ({
    label: category.categoryName,
    value: String(category.categoryID),
  }));
  const brandOptions = accessoryManager.brands.map((brand, index) => ({
    label: brand.name,
    value: getBrandValue(brand, index),
  }));

  return (
    <div className="space-y-6">
      <AccessoryToolbar
        brandOptions={brandOptions}
        categoryOptions={categoryOptions}
        isSyncing={accessoryManager.isSyncing}
        search={accessoryManager.search}
        selectedBrand={accessoryManager.selectedBrand}
        selectedCategory={accessoryManager.selectedCategory}
        sortBy={accessoryManager.sortBy}
        sortDescending={accessoryManager.sortDescending}
        onCreate={accessoryManager.openCreate}
        onSearchChange={accessoryManager.setSearch}
        onSelectedBrandChange={accessoryManager.setSelectedBrand}
        onSelectedCategoryChange={accessoryManager.setSelectedCategory}
        onSortByChange={accessoryManager.setSortBy}
        onSortDescendingChange={accessoryManager.setSortDescending}
      />

      {accessoryManager.isLoading ? (
        <Loading label="Dang tai phu kien..." />
      ) : accessoryManager.error ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm font-medium text-slate-800 dark:border-red-400 dark:bg-red-900 dark:text-slate-100">
          Loi: {accessoryManager.error.message}
        </div>
      ) : accessoryManager.accessories.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co phu kien" description="Chua co phu kien phu hop voi bo loc." />
        </div>
      ) : (
        <AccessoryTable accessories={accessoryManager.accessories} onEdit={accessoryManager.openEdit} />
      )}

      <AccessoryPagination
        page={accessoryManager.page}
        totalPages={accessoryManager.totalPages}
        onPageChange={accessoryManager.setPage}
      />

      <AccessoryFormModal
        categories={accessoryManager.categories}
        brands={accessoryManager.brands}
        editingAccessory={accessoryManager.editingAccessory}
        form={accessoryManager.form}
        isSaving={accessoryManager.isSaving}
        modalOpen={accessoryManager.modalOpen}
        closeModal={accessoryManager.closeModal}
        submitForm={accessoryManager.submitForm}
      />
    </div>
  );
}

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

  const brandOptions = accessoryManager.brands.map((brand, index) => ({
    label: brand.name,
    value: getBrandValue(brand, index),
  }));

  return (
    <div className="space-y-6">
      <AccessoryToolbar
        brandOptions={brandOptions}
        categoryTreeItems={accessoryManager.categoryTreeItems}
        isCategoryLoading={accessoryManager.isCategoryLoading}
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
        <AccessoryTable accessories={accessoryManager.accessories} onEdit={accessoryManager.openEdit} onDelete={accessoryManager.handleDelete} />
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

      {accessoryManager.deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Xác nhận xóa phụ kiện</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Bạn có chắc muốn xóa{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {accessoryManager.deleteConfirmItem.accessoryName}
                </span>?
                Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => accessoryManager.setDeleteConfirmItem(null)}
                disabled={accessoryManager.isDeleting}
              >
                Huỷ
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={accessoryManager.isDeleting}
                onClick={accessoryManager.confirmDelete}
              >
                {accessoryManager.isDeleting ? 'Đang xóa...' : 'Xóa phụ kiện'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { EmptyState, Loading } from "src/components/core";

import { CategoryFormModal } from "./Component/CategoryFormModal";
import { CategoryTable } from "./Component/CategoryTable";
import { CategoryToolbar } from "./Component/CategoryToolbar";
import { useCategoryManagement } from "./customHookModule/useCategoryManagement";

export default function AdminCategoriesPage() {
  const categoryManager = useCategoryManagement();

  return (
    <div className="space-y-6">
      <CategoryToolbar
        isSyncing={categoryManager.isSyncing}
        search={categoryManager.search}
        onCreate={categoryManager.openCreate}
        onSearchChange={categoryManager.setSearch}
      />

      {categoryManager.isLoading ? (
        <Loading label="Dang tai danh muc..." />
      ) : categoryManager.error ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm font-medium text-slate-800 dark:border-red-400 dark:bg-red-900 dark:text-slate-100">
          Loi: {categoryManager.error.message}
        </div>
      ) : categoryManager.categories.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co danh muc" description="Chua co danh muc phu hop voi bo loc." />
        </div>
      ) : (
        <CategoryTable
          categories={categoryManager.categories}
          onEdit={categoryManager.openEdit}
          onReorder={categoryManager.reorderCategories}
        />
      )}

      <CategoryFormModal
        categories={categoryManager.categories}
        editingCategory={categoryManager.editingCategory}
        form={categoryManager.form}
        isSaving={categoryManager.isSaving}
        modalOpen={categoryManager.modalOpen}
        closeModal={categoryManager.closeModal}
        submitForm={categoryManager.submitForm}
      />
    </div>
  );
}

import { EmptyState, Loading } from "src/components/core";

import { BodyTypeFormModal } from "./Component/BodyTypeFormModal";
import { BodyTypeTable } from "./Component/BodyTypeTable";
import { BodyTypeToolbar } from "./Component/BodyTypeToolbar";
import { useBodyTypeManagement } from "./customHookModule/useBodyTypeManagement";

export default function AdminBodyTypesPage() {
  const bodyTypeManager = useBodyTypeManagement();

  return (
    <div className="space-y-6">
      <BodyTypeToolbar
        search={bodyTypeManager.search}
        isSyncing={bodyTypeManager.isSyncing}
        onSearchChange={bodyTypeManager.setSearch}
        onCreate={bodyTypeManager.openCreate}
      />

      {bodyTypeManager.isLoading ? (
        <Loading label="Đang tải kiểu thân xe..." />
      ) : bodyTypeManager.error ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm font-medium text-slate-800 dark:border-red-400 dark:bg-red-900 dark:text-slate-100">
          Lỗi: {bodyTypeManager.error.message}
        </div>
      ) : bodyTypeManager.filteredBodyTypes.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có kiểu thân xe" description="Chưa có kiểu thân xe phù hợp với bộ lọc." />
        </div>
      ) : (
        <BodyTypeTable bodyTypes={bodyTypeManager.filteredBodyTypes} onEdit={bodyTypeManager.openEdit} />
      )}

      <BodyTypeFormModal
        open={bodyTypeManager.modalOpen}
        editingBodyType={bodyTypeManager.editingBodyType}
        isSaving={bodyTypeManager.isSaving}
        form={bodyTypeManager.form}
        onClose={bodyTypeManager.closeModal}
        onSubmit={bodyTypeManager.submitForm}
      />
    </div>
  );
}

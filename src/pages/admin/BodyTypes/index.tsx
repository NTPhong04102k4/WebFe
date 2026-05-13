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
        <Loading label="Dang tai kieu than xe..." />
      ) : bodyTypeManager.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Loi: {bodyTypeManager.error.message}
        </div>
      ) : bodyTypeManager.filteredBodyTypes.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <EmptyState title="Khong co kieu than xe" description="Chua co kieu than xe phu hop voi bo loc." />
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

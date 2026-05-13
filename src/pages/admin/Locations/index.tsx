import { EmptyState, Loading } from "src/components/core";

import { LocationTable } from "./Component/LocationTable";
import { LocationToolbar } from "./Component/LocationToolbar";
import { useLocationManagement } from "./customHookModule/useLocationManagement";

export default function AdminLocationsPage() {
  const locationManager = useLocationManagement();

  return (
    <div className="space-y-6">
      <LocationToolbar
        isSyncing={locationManager.isSyncing}
        search={locationManager.search}
        selectedType={locationManager.selectedType}
        onSearchChange={locationManager.setSearch}
        onTypeChange={locationManager.setSelectedType}
      />

      {locationManager.isLoading ? (
        <Loading label="Dang tai dia diem..." />
      ) : locationManager.error ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-sm font-medium text-slate-800 dark:border-red-400 dark:bg-red-900 dark:text-slate-100">
          Loi: {locationManager.error.message}
        </div>
      ) : locationManager.filteredLocations.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Khong co dia diem" description="Chua co dia diem phu hop voi bo loc." />
        </div>
      ) : (
        <LocationTable locations={locationManager.filteredLocations} />
      )}
    </div>
  );
}

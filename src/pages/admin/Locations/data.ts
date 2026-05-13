import type { LocationResponse } from "src/shared/types/Reponse/Location";

export const LOCATION_TYPE_OPTIONS = [
  { label: "Tat ca loai", value: "" },
  { label: "Store", value: "Store" },
  { label: "Workshop", value: "Workshop" },
  { label: "Warehouse", value: "Warehouse" },
] as const;

export type LocationManagerState = {
  error: Error | null;
  filteredLocations: LocationResponse[];
  isLoading: boolean;
  isSyncing: boolean;
  search: string;
  selectedType: string;
  setSearch: (value: string) => void;
  setSelectedType: (value: string) => void;
};

import { useMemo, useState } from "react";

import { useLocationList } from "src/query/location/useLocationQueries";

export function useLocationManagement() {
  const { data: locations = [], isLoading, isFetching, error } = useLocationList();
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesType = selectedType ? location.locationType === selectedType : true;
      const matchesSearch = q
        ? [
            location.locationCode,
            location.locationName,
            location.locationType,
            location.address,
            location.city,
            location.province,
            location.phone,
            location.email,
            location.managerName,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(q))
        : true;

      return matchesType && matchesSearch;
    });
  }, [locations, search, selectedType]);

  return {
    error: error as Error | null,
    filteredLocations,
    isLoading,
    isSyncing: isFetching && !isLoading,
    search,
    selectedType,
    setSearch,
    setSelectedType,
  };
}

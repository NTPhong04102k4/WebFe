import React from "react";
import { useCarList, useCarMutations } from "src/query/car/useCarQueries";
import { CarResponseItem } from "src/shared/types/Reponse/Car";
import { CarFilters } from "./Components/CarFilters";
import { CarList } from "./Components/CarList";
import { Pagination } from "./Components/Pagination";
import { CreateCarForm } from "./Components/CreateCarForm";
import { EditCarForm } from "./Components/EditCarForm";
import { CarDetailView } from "./Components/CarDetailView";

type ViewMode = "list" | "create" | "edit" | "detail";

export const Cars: React.FC = () => {
  const [query, setQuery] = React.useState<{
    condition: "new" | "used" | "certified" | "";
    search: string;
    brandCode: string;
    bodyCode: string;
    page: number;
    pageSize: number;
  }>({
    condition: "",
    search: "",
    brandCode: "",
    bodyCode: "",
    page: 1,
    pageSize: 20,
  });
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [selectedCarId, setSelectedCarId] = React.useState<number | null>(null);

  const { deleteCar } = useCarMutations();

  const { data: allCarsData, refetch: refetchCarList } = useCarList({
    pageIndex: query.page,
    pageSize: query.pageSize,
    search: query.search,
    brandCode: query.brandCode,
    bodyCode: query.bodyCode,
  });

  // Filter and paginate cars locally
  const filteredAndPaginatedCars = React.useMemo(() => {
    if (!allCarsData?.data) return { data: [], total: 0 };

    let filtered = [...allCarsData.data];

    // Filter by condition
    if (query.condition) {
      const conditionMap: Record<string, string> = {
        new: "New",
        used: "Used",
        certified: "Certified",
      };
      const normalizedCondition =
        conditionMap[query.condition.toLowerCase()] || query.condition;
      filtered = filtered.filter(
        (car) =>
          car.condition?.toLowerCase() === normalizedCondition.toLowerCase()
      );
    }

    return {
      data: filtered,
      total: query.condition ? filtered.length : allCarsData.totalCount,
    };
  }, [allCarsData, query]);

  // Find selected car from all cars
  const selectedCar: CarResponseItem | undefined = React.useMemo(() => {
    if (!selectedCarId || !allCarsData) return undefined;
    return allCarsData.data.find((car) => car.carID === selectedCarId);
  }, [selectedCarId, allCarsData]);

  const handleCreateClick = () => {
    setViewMode("create");
  };

  const handleEditClick = (id: string) => {
    setSelectedCarId(Number(id));
    setViewMode("edit");
  };

  const handleViewDetailClick = (id: string) => {
    setSelectedCarId(Number(id));
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCarId(null);
  };

  const handleCreated = () => {
    refetchCarList();
    handleBackToList();
  };

  const handleUpdated = () => {
    refetchCarList();
    handleBackToList();
  };

  const handleDeleteCar = (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa xe "${name}" không? Hành động này không thể hoàn tác.`)) return;
    deleteCar.mutate(Number(id), {
      onSuccess: () => refetchCarList(),
      onError: () => alert("Có lỗi xảy ra khi xóa xe"),
    });
  };

  return (
    <div>
      {viewMode === "list" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quản lý xe</h2>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Thêm mới
            </button>
          </div>
          <CarFilters
            value={query}
            onChange={(next) =>
              setQuery((prev) => ({ ...prev, ...next, page: 1 }))
            }
          />
          <CarList
            query={query}
            cars={filteredAndPaginatedCars.data}
            isLoading={!allCarsData}
            onSelectCar={handleEditClick}
            onViewDetail={handleViewDetailClick}
            onDeleteCar={handleDeleteCar}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            onPageSizeChange={(pageSize) =>
              setQuery((prev) => ({ ...prev, pageSize, page: 1 }))
            }
          />
          <Pagination
            currentPage={query.page}
            totalRes={filteredAndPaginatedCars.total}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            itemsPerPage={query.pageSize}
          />
        </>
      )}

      {viewMode === "create" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Thêm mới xe</h2>
            <button
              onClick={handleBackToList}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              ← Quay lại
            </button>
          </div>
          <CreateCarForm onCreated={handleCreated} />
        </div>
      )}

      {viewMode === "edit" && selectedCar && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Chỉnh sửa xe</h2>
            <button
              onClick={handleBackToList}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              ← Quay lại
            </button>
          </div>
          <EditCarForm
            car={selectedCar}
            onUpdated={handleUpdated}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {viewMode === "detail" && selectedCar && (
        <CarDetailView car={selectedCar} onBack={handleBackToList} />
      )}
    </div>
  );
};

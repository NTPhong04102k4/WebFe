import LoadingSpinner from "@/components/common/LoadingSpinner";
import { CarStatsPanel } from "./CarStatsPanel";
import { useCarsHandler } from "./useCarsHandler";
import { CarFilters } from "./components/CarFilters";
import { CarList } from "./components/CarList";
import { CarFormModal } from "./components/CarFormModal";
import { CarDeleteModal } from "./components/CarDeleteModal";

export default function AdminCarsPage() {
  const h = useCarsHandler();

  return (
    <div className="space-y-6">
      <CarStatsPanel />

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý xe</h1>
            <p className="mt-1 text-sm text-slate-600">
              List / filter / tạo & cập nhật
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={h.openCreateModal}
          >
            + Tạo xe
          </button>
        </div>

        <CarFilters
          search={h.search}
          onSearchChange={h.handleSearchChange}
          brandCode={h.brandCode}
          onBrandChange={h.handleBrandChange}
          brandOptions={h.brandOptions}
          brandsLoading={h.brandsLoading}
          bodyCode={h.bodyCode}
          onBodyChange={h.handleBodyChange}
          bodyOptions={h.bodyOptions}
          bodiesLoading={h.bodiesLoading}
          priceFrom={h.priceFrom}
          onPriceFromChange={h.handlePriceFromChange}
          priceTo={h.priceTo}
          onPriceToChange={h.handlePriceToChange}
          statusCodes={h.statusCodes}
          onStatusToggle={h.handleStatusToggle}
          conditions={h.conditions}
          onConditionToggle={h.handleConditionToggle}
          onReset={h.handleResetFilters}
        />
      </div>

      {h.isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : h.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {h.error.message}
        </div>
      ) : (
        <>
          <CarList
            data={h.data}
            onEdit={h.openEditModal}
            onDelete={h.openDeleteConfirm}
          />

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              disabled={h.page <= 1}
              onClick={h.handlePagePrev}
            >
              Trước
            </button>
            <div className="text-sm text-slate-600">
              Trang{" "}
              <strong className="font-semibold text-slate-900">{h.page}</strong>{" "}
              / {h.totalPages}
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
              disabled={h.page >= h.totalPages}
              onClick={h.handlePageNext}
            >
              Sau
            </button>
          </div>
        </>
      )}

      {h.modalOpen && (
        <CarFormModal
          carId={h.editingCarId}
          brandIdOptions={h.brandIdOptions}
          bodyTypeIdOptions={h.bodyTypeIdOptions}
          carStatusOptions={h.carStatusOptions}
          locationOptions={h.locationOptions}
          brandsLoading={h.brandsLoading}
          bodiesLoading={h.bodiesLoading}
          isSaving={h.isSaving}
          onClose={h.closeModal}
          onSave={h.handleSave}
        />
      )}

      <CarDeleteModal
        car={h.deleteConfirmCar}
        isDeleting={h.isDeleting}
        onConfirm={h.handleDelete}
        onClose={h.closeDeleteConfirm}
      />
    </div>
  );
}

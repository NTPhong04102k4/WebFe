import LoadingSpinner from "src/components/common/LoadingSpinner";
import EmptyState from "src/components/common/EmptyState";

import { useGarageHandler } from "./useGarageHandler";
import { VehicleForm } from "./components/VehicleForm";
import { VehicleCard } from "./components/VehicleCard";
import shell from "../account-shell.module.scss";

export default function GaragePage() {
  const h = useGarageHandler();

  return (
    <section>
      <h2 className={shell.title}>Garage — xe đăng ký</h2>
      <p className={shell.sub}>
        Thêm hoặc chỉnh sửa xe để đặt lịch hẹn và mua bảo hiểm.
      </p>

      <VehicleForm
        form={h.form}
        editingId={h.editingId}
        brandOptions={h.brandOptions}
        loadingBrands={h.loadingBrands}
        isPending={h.isPending}
        onSubmit={h.onSubmit}
        cancelEdit={h.cancelEdit}
      />

      <h3 className={shell.title} style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>
        Danh sách xe
      </h3>

      {h.isLoading && <LoadingSpinner size="md" />}
      {h.hasError && (
        <EmptyState
          title="Không tải được danh sách"
          description="Kiểm tra mạng hoặc đăng nhập lại."
        />
      )}
      {!h.isLoading && !h.hasError && h.vehicles.length === 0 && (
        <EmptyState title="Chưa có xe nào" description="Thêm xe phía trên." />
      )}

      <div className={shell.grid}>
        {h.vehicles.map((v) => (
          <VehicleCard key={v.customerVehicleID} vehicle={v} onEdit={h.startEdit} />
        ))}
      </div>
    </section>
  );
}

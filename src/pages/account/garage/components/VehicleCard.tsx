import type { CustomerVehicleViewModel } from "src/services/api/functions/workshop/workshop.types";
import shell from "../../account-shell.module.scss";

type Props = {
  vehicle: CustomerVehicleViewModel;
  onEdit: (v: CustomerVehicleViewModel) => void;
};

export function VehicleCard({ vehicle: v, onEdit }: Props) {
  return (
    <div className={shell.card}>
      <p style={{ margin: "0 0 0.35rem", fontWeight: 700 }}>
        {v.brandName ?? "—"} {v.modelName}{" "}
        <span className={shell.badge}>{v.modelYear}</span>
      </p>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
        VIN: {v.vin}
        {v.licensePlate ? ` · ${v.licensePlate}` : ""}
      </p>
      <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem" }}>
        {v.currentMileage.toLocaleString()} km
      </p>
      <div className={shell.btnRow}>
        <button
          type="button"
          className={`${shell.btn} ${shell.secondary}`}
          onClick={() => onEdit(v)}
        >
          Sửa
        </button>
      </div>
    </div>
  );
}

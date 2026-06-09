import shell from "../account-shell.module.scss";
import { useAppointmentsHandler } from "./useAppointmentsHandler";
import { AppointmentForm } from "./components/AppointmentForm";
import { AppointmentTable } from "./components/AppointmentTable";

export default function AppointmentsPage() {
  const h = useAppointmentsHandler();

  return (
    <section>
      <h2 className={shell.title}>Lịch hẹn xưởng</h2>
      <p className={shell.sub}>Đặt lịch bảo dưỡng / sửa chữa và xem trạng thái.</p>

      <div className={shell.card}>
        <h3 className={shell.title} style={{ fontSize: "1rem" }}>Đặt lịch mới</h3>
        <AppointmentForm
          form={h.form}
          vehicleOptions={h.vehicleOptions}
          locationOptions={h.locationOptions}
          locLoading={h.locLoading}
          onSubmit={h.onCreate}
          isCreating={h.isCreating}
        />
      </div>

      <h3 className={shell.title} style={{ fontSize: "1.05rem", marginTop: "1.5rem" }}>
        Lịch của tôi
      </h3>
      <AppointmentTable
        rows={h.rows}
        isLoading={h.isLoading}
        onCancel={h.onCancel}
        isCancelling={h.isCancelling}
      />
    </section>
  );
}

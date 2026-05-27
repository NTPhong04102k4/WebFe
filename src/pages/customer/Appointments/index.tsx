import { useAppointments, useWorkshopMutations } from "@/query/workshop/useWorkshopQueries";
import { EmptyState } from "src/components/core/Feedback/EmptyState";

export default function CustomerAppointmentsPage() {
  const appointments = useAppointments({ page: 1, pageSize: 20 });
  const { cancelAppointment } = useWorkshopMutations();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Lịch hẹn của tôi
      </h1>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Lịch hẹn hiện có
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(appointments.data?.data ?? []).map((item) => (
            <div key={item.appointmentID} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {item.appointmentNumber}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {item.vehicleInfo} · {item.locationName}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {new Date(item.scheduledDateTime).toLocaleString("vi-VN")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:text-blue-400 dark:ring-blue-800">
                    {item.status}
                  </span>
                  {item.status !== "Cancelled" && (
                    <div className="mt-2">
                      <button
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400"
                        disabled={cancelAppointment.isPending}
                        onClick={() =>
                          cancelAppointment.mutate({
                            id: item.appointmentID,
                            body: {
                              status: "Cancelled",
                              cancelReason: "Customer cancelled",
                            },
                          })
                        }
                      >
                        Hủy lịch
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!appointments.isLoading &&
            (appointments.data?.data ?? []).length === 0 && (
              <EmptyState
                title="Chưa có lịch hẹn"
                description="Bạn chưa có lịch hẹn nào. Liên hệ nhân viên để đặt lịch."
              />
            )}
        </div>
      </div>
    </div>
  );
}
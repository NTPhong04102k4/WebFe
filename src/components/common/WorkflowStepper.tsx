import { Check, X as XIcon } from "lucide-react";

/** Thanh hiển thị tiến trình các bước (lịch hẹn / phiếu công việc). */
export function WorkflowStepper({
  steps,
  currentIndex,
  cancelledLabel,
}: {
  steps: string[];
  /** Chỉ số bước hiện tại (0-based). Các bước < currentIndex coi là đã hoàn thành. */
  currentIndex: number;
  /** Nếu có giá trị, hiển thị trạng thái đã hủy thay cho stepper. */
  cancelledLabel?: string;
}) {
  if (cancelledLabel) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <XIcon className="h-3.5 w-3.5" />
        </span>
        <span className="font-medium">{cancelledLabel}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  isDone
                    ? "bg-blue-600 text-white"
                    : isCurrent
                    ? "border-2 border-blue-600 text-blue-600 dark:text-blue-300"
                    : "border-2 border-slate-300 text-slate-400 dark:border-slate-600 dark:text-slate-500"
                }`}
              >
                {isDone ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              <span
                className={`max-w-[6.5rem] text-center text-xs ${
                  isCurrent
                    ? "font-semibold text-blue-700 dark:text-blue-300"
                    : isDone
                    ? "text-slate-700 dark:text-slate-200"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 ${
                  isDone ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

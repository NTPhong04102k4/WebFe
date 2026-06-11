import { useEffect, useState } from "react";

import { notify } from "@/components/core/Feedback/toast";
import { EmptyState, LoadingSpinner } from "src/components/common";
import { MultiCombobox } from "src/components/core/MultiCombobox/MultiCombobox";
import { useHrTechnicianMutations, useMyTechnician } from "src/query/hr/useHrQueries";

function parseCertifications(json?: string | null): string[] {
  if (!json) return [];
  try {
    const list = JSON.parse(json);
    return Array.isArray(list) ? list.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export default function MyTechnicianProfilePage() {
  const { data: technician, isLoading } = useMyTechnician();
  const { updateTechnician } = useHrTechnicianMutations();
  const [certifications, setCertifications] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (technician) {
      setCertifications(parseCertifications(technician.certifications));
      setNotes(technician.notes ?? "");
    }
  }, [technician]);

  const save = async () => {
    if (!technician) return;
    try {
      await updateTechnician.mutateAsync({
        id: technician.technicianID,
        body: {
          staffID: technician.staffID,
          levelID: technician.levelID,
          hireDate: technician.hireDate,
          certifications: JSON.stringify(certifications),
          notes,
          isActive: technician.isActive,
        },
      });
      notify.success("Cập nhật hồ sơ thành công");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
        <EmptyState
          title="Bạn chưa được gán làm kỹ thuật viên"
          description="Liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hồ sơ kỹ thuật viên của tôi</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Xem thông tin hồ sơ và cập nhật chứng chỉ, ghi chú cá nhân.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900 md:grid-cols-2">
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Họ tên</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.staffFullName || `Staff #${technician.staffID}`}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.staffEmail || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Cấp bậc</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.levelName || "-"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Ngày vào làm</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.hireDate?.slice(0, 10)}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Số năm kinh nghiệm</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.yearsOfExperience} năm</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Trạng thái sẵn sàng</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.isAvailable ? "Rảnh" : "Bận"}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Việc đang làm</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.currentWorkload}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng việc đã hoàn thành</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.totalJobsCompleted}</div>
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Đánh giá trung bình</div>
          <div className="text-sm text-slate-800 dark:text-slate-100">{technician.averageRating ?? "-"}</div>
        </div>
      </div>

      {technician.skills && technician.skills.length > 0 && (
        <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Kỹ năng</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {technician.skills.map((skill) => (
              <span
                key={skill.technicianSkillID}
                className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
              >
                {skill.skillName} (cấp {skill.proficiencyLevel})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Cập nhật thông tin</h2>
        <MultiCombobox
          label="Chứng chỉ"
          options={[]}
          value={certifications}
          onChange={setCertifications}
          allowCreate
          placeholder="Nhập tên chứng chỉ và nhấn Enter"
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">Ghi chú</label>
          <textarea
            className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-blue-300 dark:focus:ring-blue-300/30"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            onClick={save}
            disabled={updateTechnician.isPending}
          >
            {updateTechnician.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { notify } from "@/components/core/Feedback/toast";

import { DataTable, EmptyState, Input, Modal, SelectField } from "src/components/common";
import {
  useInsuranceMutations,
  useInsurancePackages,
  useInsurancePolicies,
} from "src/query/insurance/useInsuranceQueries";
import type {
  InsurancePolicyRequest,
  InsurancePolicyViewModel,
} from "src/services/api/functions/insurance/insurance.types";
import { formatCurrency } from "@/common/utils/formatCurrency";

const emptyForm: InsurancePolicyRequest = {
  customerVehicleID: 0,
  packageID: 0,
  userID: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  premiumAmount: 0,
  soldByStaffID: null,
  document: null,
};

export default function AdminInsurancePoliciesPage() {
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<InsurancePolicyRequest>(emptyForm);
  const [confirmCancel, setConfirmCancel] = useState<InsurancePolicyViewModel | null>(null);
  const { data, isLoading, error } = useInsurancePolicies({ page, pageSize: 20, userId: userId || undefined, status: status || undefined });
  const { data: packages = [] } = useInsurancePackages();
  const { createPolicy, cancelPolicy } = useInsuranceMutations();
  const policies = data?.data ?? [];
  const packageOptions = packages.map((item) => ({ label: `${item.packageName} - ${item.companyName ?? ""}`, value: String(item.packageID) }));

  const columns = useMemo<ColumnDef<InsurancePolicyViewModel>[]>(
    () => [
      { accessorKey: "policyNumber", header: "Số HĐ" },
      { accessorKey: "ownerFullName", header: "Chủ xe", cell: ({ row }) => row.original.ownerFullName || row.original.userID },
      { accessorKey: "vehicleInfo", header: "Xe", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "packageName", header: "Gói", cell: ({ getValue }) => String(getValue() || "-") },
      { accessorKey: "premiumAmount", header: "Phí", cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ getValue }) => {
          const val = String(getValue() || "");
          if (val === "Active") return "Đang hiệu lực";
          if (val === "Cancelled") return "Đã huỷ";
          if (val === "Expired") return "Hết hạn";
          return val;
        },
      },
      { accessorKey: "daysToExpire", header: "Còn lại (ngày)" },
      {
        id: "actions",
        header: "Hành động",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 disabled:opacity-40"
              disabled={row.original.status === "Cancelled" || row.original.status === "Expired"}
              onClick={() => setConfirmCancel(row.original)}
            >
              Huỷ HĐ
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const save = async () => {
    try {
      await createPolicy.mutateAsync({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      });
      notify.success("Tạo hợp đồng bảo hiểm thành công");
      setOpen(false);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const doCancel = async (policy: InsurancePolicyViewModel) => {
    try {
      await cancelPolicy.mutateAsync(policy.policyID);
      notify.success("Đã huỷ hợp đồng");
      setConfirmCancel(null);
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-600 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Hợp đồng bảo hiểm</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Theo dõi hợp đồng, thanh toán và thời hạn</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white" onClick={() => { setForm(emptyForm); setOpen(true); }}>Tạo hợp đồng</button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input label="Mã khách hàng" value={userId} onChange={(event) => { setUserId(event.target.value); setPage(1); }} placeholder="Lọc theo mã khách hàng (UUID)" />
          <SelectField
            label="Trạng thái"
            value={status}
            placeholder="Tất cả"
            options={[
              { label: "Đang hiệu lực", value: "Active" },
              { label: "Đã huỷ", value: "Cancelled" },
              { label: "Hết hạn", value: "Expired" },
            ]}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">Không lấy được danh sách hợp đồng bảo hiểm. Vui lòng thử lại.</div>
      ) : policies.length === 0 && !isLoading ? (
        <div className="rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
          <EmptyState title="Không có hợp đồng" description="Chưa có hợp đồng bảo hiểm phù hợp với bộ lọc hiện tại." />
        </div>
      ) : (
        <DataTable data={policies} columns={columns} loading={isLoading} getRowId={(row) => String(row.policyID)} />
      )}

      <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900">
        <span>Trang {data?.page ?? page} — {data?.totalCount ?? 0} kết quả</span>
        <div className="flex gap-2">
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={page <= 1} onClick={() => setPage(page - 1)}>Trước</button>
          <button className="rounded-lg border px-3 py-1.5 disabled:opacity-50" disabled={(data?.data.length ?? 0) < 20} onClick={() => setPage(page + 1)}>Sau</button>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Tạo hợp đồng bảo hiểm" size="xl" footer={
        <div className="flex justify-end gap-2">
          <button className="rounded-lg border px-4 py-2 text-sm" onClick={() => setOpen(false)}>Huỷ</button>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white" onClick={save} disabled={createPolicy.isPending}>Lưu</button>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Mã xe khách hàng" type="number" value={form.customerVehicleID} onChange={(event) => setForm({ ...form, customerVehicleID: Number(event.target.value) })} />
          <SelectField label="Gói bảo hiểm" value={String(form.packageID || "")} placeholder="Chọn gói" options={packageOptions} onChange={(event) => setForm({ ...form, packageID: Number(event.target.value) })} />
          <Input label="Mã khách hàng (UUID)" value={form.userID} onChange={(event) => setForm({ ...form, userID: event.target.value })} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          <Input label="Ngày bắt đầu" type="date" value={form.startDate.slice(0, 10)} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          <Input label="Ngày kết thúc" type="date" value={form.endDate.slice(0, 10)} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
          <Input label="Phí bảo hiểm (VNĐ)" type="number" value={form.premiumAmount} onChange={(event) => setForm({ ...form, premiumAmount: Number(event.target.value) })} />
          <Input label="Mã nhân viên bán" type="number" value={form.soldByStaffID ?? ""} onChange={(event) => setForm({ ...form, soldByStaffID: event.target.value ? Number(event.target.value) : null })} />
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Tài liệu đính kèm</span>
            <input type="file" className="text-sm" onChange={(event) => setForm({ ...form, document: event.target.files?.[0] ?? null })} />
          </label>
        </div>
      </Modal>

      {/* Confirm huỷ hợp đồng */}
      {confirmCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="px-6 py-5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Xác nhận huỷ hợp đồng</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Bạn có chắc muốn huỷ hợp đồng{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmCancel.policyNumber}
                </span>{" "}
                của khách hàng{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {confirmCancel.ownerFullName || confirmCancel.userID}
                </span>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-slate-700">
              <button
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                onClick={() => setConfirmCancel(null)}
                disabled={cancelPolicy.isPending}
              >
                Đóng
              </button>
              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                disabled={cancelPolicy.isPending}
                onClick={() => doCancel(confirmCancel)}
              >
                {cancelPolicy.isPending ? "Đang huỷ..." : "Huỷ hợp đồng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

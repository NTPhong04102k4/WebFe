import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { UserCog } from "lucide-react";

import { DataTable } from "src/components/core/Table/DataTable";
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";
import { notify } from "@/components/core/Feedback/toast";
import { formatDateTime } from "@/common/utils/formatDate";
import { carInquiryRouteFn } from "@/services/api/functions/CarInquiry/Routes.Fn";
import type { CarInquiryViewModel } from "@/shared/types/Reponse/CarInquiry";

const STATUS_OPTIONS: SelectOption[] = [
  { value: "New", label: "Mới" },
  { value: "Contacted", label: "Đã liên hệ" },
  { value: "Closed", label: "Đã đóng" },
];

export default function AdminCarInquiriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const pageSize = 10;

  const { data, isLoading } = useQuery({
    queryKey: ["car-inquiries", page, pageSize, status],
    queryFn: () =>
      carInquiryRouteFn.getPaging({
        page,
        pageSize,
        ...(status ? { status } : {}),
      }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      carInquiryRouteFn.updateStatus(id, { status }),
    onSuccess: () => {
      notify.success("Cập nhật trạng thái thành công");
      void queryClient.invalidateQueries({ queryKey: ["car-inquiries"] });
    },
  });

  const items = data?.data ?? [];
  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = useMemo<ColumnDef<CarInquiryViewModel>[]>(
    () => [
      {
        id: "car",
        header: "Xe",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.carImagePath ? (
              <img
                src={row.original.carImagePath}
                alt={row.original.carName ?? ""}
                className="h-10 w-14 rounded-md object-cover"
              />
            ) : (
              <div className="h-10 w-14 rounded-md bg-slate-100" />
            )}
            <span className="font-medium text-slate-900">{row.original.carName ?? `#${row.original.carID}`}</span>
          </div>
        ),
      },
      {
        id: "customer",
        header: "Khách hàng",
        cell: ({ row }) => (
          <div className="text-sm">
            <p className="font-medium text-slate-900">{row.original.fullName}</p>
            <p className="text-slate-500">{row.original.phone}</p>
            {row.original.email ? <p className="text-slate-500">{row.original.email}</p> : null}
          </div>
        ),
      },
      {
        accessorKey: "message",
        header: "Ghi chú",
        cell: ({ getValue }) => <span className="text-sm text-slate-600">{String(getValue() ?? "-")}</span>,
      },
      {
        id: "status",
        header: "Trạng thái",
        cell: ({ row }) => (
          <Select
            options={STATUS_OPTIONS}
            value={row.original.status}
            onChange={(e) => updateStatus.mutate({ id: row.original.inquiryID, status: e.target.value })}
            disabled={updateStatus.isPending}
          />
        ),
      },
      {
        accessorKey: "createdDate",
        header: "Ngày tạo",
        cell: ({ getValue }) => formatDateTime(getValue() as string),
      },
    ],
    [updateStatus]
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <UserCog className="h-6 w-6 text-blue-500" />
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Khách quan tâm</h1>
      </div>

      <div style={{ maxWidth: 220 }}>
        <Select
          options={STATUS_OPTIONS}
          placeholder="Tất cả trạng thái"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        />
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={isLoading}
        getRowId={(row) => String(row.inquiryID)}
        emptyTitle="Chưa có khách hàng quan tâm"
        emptyDescription="Chưa có yêu cầu liên hệ nào cho xe hết hàng."
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Tổng {total} · Trang {page}/{totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Trước
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

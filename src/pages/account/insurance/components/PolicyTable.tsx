import dayjs from "dayjs";
import type { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "src/components/core/Table/DataTable";
import type { InsurancePolicyViewModel } from "src/services/api/functions/insurance/insurance.types";
import shell from "../../account-shell.module.scss";

const columns: ColumnDef<InsurancePolicyViewModel>[] = [
  { accessorKey: "policyNumber", header: "Số HĐ" },
  {
    accessorKey: "packageName",
    header: "Gói",
    cell: ({ getValue }) => (getValue<string>() ?? "—"),
  },
  {
    id: "endDate",
    header: "Hạn",
    cell: ({ row }) => (
      <>
        {dayjs(row.original.endDate).format("DD/MM/YYYY")}{" "}
        <span className={shell.badge}>{row.original.daysToExpire} ngày</span>
      </>
    ),
  },
  {
    accessorKey: "premiumAmount",
    header: "Phí",
    cell: ({ getValue }) => getValue<number>()?.toLocaleString("vi-VN"),
  },
  { accessorKey: "status", header: "TT" },
];

type Props = {
  data: InsurancePolicyViewModel[];
  loading: boolean;
};

export function PolicyTable({ data, loading }: Props) {
  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      emptyTitle="Chưa có hợp đồng"
      emptyDescription="Mua gói mới để bắt đầu."
    />
  );
}

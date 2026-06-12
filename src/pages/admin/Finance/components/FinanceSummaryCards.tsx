import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Wrench,
  Package,
  ClipboardList,
  Wallet,
  Landmark,
} from "lucide-react";
import { fmt } from "../financeHelpers";

type Props = {
  isLoading: boolean;
  totalRevenue: number;
  orderRevenue: number;
  workshopRevenue: number;
  cashRevenue: number;
  transferRevenue: number;
  totalExpense: number;
  payrollExpense: number;
  partsExpense: number;
  grossProfit: number;
  totalOrders: number;
  totalWorkOrders: number;
};

export function FinanceSummaryCards({
  isLoading,
  totalRevenue,
  orderRevenue,
  workshopRevenue,
  cashRevenue,
  transferRevenue,
  totalExpense,
  payrollExpense,
  partsExpense,
  grossProfit,
  totalOrders,
  totalWorkOrders,
}: Props) {
  const cards = [
    {
      label: "Tổng doanh thu",
      value: isLoading ? "…" : fmt(totalRevenue),
      sub: "Đơn hàng + Workshop",
      icon: TrendingUp,
      gradient: "from-emerald-500 to-emerald-600",
      text: "text-emerald-600",
      large: true,
    },
    {
      label: "Doanh thu đơn hàng",
      value: isLoading ? "…" : fmt(orderRevenue),
      sub: `${totalOrders} đơn`,
      icon: ShoppingBag,
      gradient: "from-blue-500 to-blue-600",
      text: "text-blue-600",
    },
    {
      label: "Doanh thu Workshop",
      value: isLoading ? "…" : fmt(workshopRevenue),
      sub: `${totalWorkOrders} work order`,
      icon: Wrench,
      gradient: "from-cyan-500 to-cyan-600",
      text: "text-cyan-600",
    },
    {
      label: "Thu tiền mặt",
      value: isLoading ? "…" : fmt(cashRevenue),
      sub: "Tiền mặt",
      icon: Wallet,
      gradient: "from-lime-500 to-lime-600",
      text: "text-lime-600",
    },
    {
      label: "Thu chuyển khoản",
      value: isLoading ? "…" : fmt(transferRevenue),
      sub: "CK / ngân hàng",
      icon: Landmark,
      gradient: "from-sky-500 to-sky-600",
      text: "text-sky-600",
    },
    {
      label: "Tổng chi phí",
      value: isLoading ? "…" : fmt(totalExpense),
      sub: "Lương + Phụ tùng",
      icon: TrendingDown,
      gradient: "from-red-500 to-red-600",
      text: "text-red-600",
    },
    {
      label: "Chi phí lương",
      value: isLoading ? "…" : fmt(payrollExpense),
      sub: "Lương nhân viên",
      icon: DollarSign,
      gradient: "from-orange-500 to-orange-600",
      text: "text-orange-600",
    },
    {
      label: "Chi phí phụ tùng",
      value: isLoading ? "…" : fmt(partsExpense),
      sub: "Vật tư, linh kiện",
      icon: Package,
      gradient: "from-amber-500 to-amber-600",
      text: "text-amber-600",
    },
    {
      label: "Lợi nhuận gộp",
      value: isLoading ? "…" : fmt(grossProfit),
      sub: grossProfit >= 0 ? "Dương ✓" : "Âm ✗",
      icon: grossProfit >= 0 ? TrendingUp : TrendingDown,
      gradient: grossProfit >= 0 ? "from-violet-500 to-violet-600" : "from-rose-500 to-rose-600",
      text: grossProfit >= 0 ? "text-violet-600" : "text-rose-600",
      large: true,
    },
    {
      label: "Tổng Work Orders",
      value: isLoading ? "…" : totalWorkOrders,
      sub: "Lệnh sửa chữa",
      icon: ClipboardList,
      gradient: "from-indigo-500 to-indigo-600",
      text: "text-indigo-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <div className={`absolute right-0 top-0 h-full w-1 bg-gradient-to-b ${card.gradient}`} />
          <card.icon className={`mb-2 h-5 w-5 ${card.text}`} />
          <p className="text-xs font-medium text-slate-400">{card.label}</p>
          <p className={`mt-1 font-bold ${card.large ? "text-2xl" : "text-xl"} ${card.text}`}>
            {card.value}
          </p>
          {card.sub && <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>}
        </div>
      ))}
    </div>
  );
}

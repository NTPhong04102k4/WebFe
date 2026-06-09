export const fmt = (v: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v ?? 0);

export function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

const now = new Date();
export const DEFAULT_FROM = toISO(new Date(now.getFullYear(), now.getMonth(), 1));
export const DEFAULT_TO = toISO(new Date(now.getFullYear(), now.getMonth() + 1, 0));

export function groupByFromRange(from: string, to: string): "Day" | "Month" {
  const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400_000;
  return days <= 31 ? "Day" : "Month";
}

export function fmtPeriodLabel(label: string): string {
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [y, m] = label.split("-");
    return `Tháng ${m}/${y}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [y, m, d] = label.split("-");
    return `${d}/${m}/${y}`;
  }
  return label;
}

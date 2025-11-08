import React from "react";
import { DATA_CATEGORIES, DetailItem } from "src/pages/shop/data";

type AccessoryRecord = DetailItem & { dateOfManufacture: Date };
type StockFilter = "all" | "low" | "healthy";
type SortKey = "stock" | "margin" | "value";

const ACCESSORY_CATEGORY =
  DATA_CATEGORIES.find(
    (category) =>
      category.id === "Accessories" || category.name === "Accessories"
  ) ?? DATA_CATEGORIES[0];

const ACCESSORY_ITEMS: AccessoryRecord[] = (ACCESSORY_CATEGORY?.data ?? []).map(
  (item) => ({
    ...item,
    dateOfManufacture:
      item.dateOfManufacture instanceof Date
        ? item.dateOfManufacture
        : new Date(item.dateOfManufacture),
  })
);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const toId = (item: DetailItem) => item.id?.toString() ?? "";

const getMarginPercent = (item: DetailItem) => {
  if (!item.originPrice) return 0;
  return ((item.priceSell - item.originPrice) / item.originPrice) * 100;
};

const getInventoryValue = (item: DetailItem) => item.priceSell * item.nums;

const getStockBand = (stock: number) => {
  if (stock <= 10) {
    return {
      band: "Critical" as const,
      badge: "border-red-200 bg-red-50 text-red-600",
      barColor: "bg-red-500",
      hint: "Restock now",
    };
  }
  if (stock <= 18) {
    return {
      band: "Low" as const,
      badge: "border-amber-200 bg-amber-50 text-amber-600",
      barColor: "bg-amber-500",
      hint: "Plan procurement",
    };
  }
  return {
    band: "Healthy" as const,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-600",
    barColor: "bg-emerald-500",
    hint: "Stable stock",
  };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const daysInInventory = (date: Date) => {
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const StatCard: React.FC<{
  label: string;
  value: string;
  subLabel: string;
  chip?: string;
  chipTone?: string;
}> = ({ label, value, subLabel, chip, chipTone = "bg-slate-100 text-slate-600" }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between text-sm text-slate-500">
      <span>{label}</span>
      {chip && (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${chipTone}`}
        >
          {chip}
        </span>
      )}
    </div>
    <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    <p className="text-sm text-slate-500">{subLabel}</p>
  </div>
);

export const AccessoryTab: React.FC = () => {
  const accessories = ACCESSORY_ITEMS;
  const [searchTerm, setSearchTerm] = React.useState("");
  const [stockFilter, setStockFilter] = React.useState<StockFilter>("all");
  const [sortKey, setSortKey] = React.useState<SortKey>("stock");
  const [selectedId, setSelectedId] = React.useState<string | null>(() =>
    accessories[0] ? toId(accessories[0]) : null
  );

  const analytics = React.useMemo(() => {
    if (!accessories.length) {
      return {
        totalSkus: 0,
        totalUnits: 0,
        inventoryValue: 0,
        avgMargin: 0,
        lowStock: 0,
        topMover: undefined as AccessoryRecord | undefined,
      };
    }

    const totals = accessories.reduce(
      (acc, item) => {
        const salesValue = getInventoryValue(item);
        return {
          units: acc.units + item.nums,
          sales: acc.sales + salesValue,
          cost: acc.cost + item.originPrice * item.nums,
        };
      },
      { units: 0, sales: 0, cost: 0 }
    );

    const topMover = accessories.reduce((prev, curr) =>
      getInventoryValue(curr) > getInventoryValue(prev) ? curr : prev
    );

    const lowStock = accessories.filter((item) => item.nums <= 15).length;
    const avgMargin = totals.cost
      ? ((totals.sales - totals.cost) / totals.cost) * 100
      : 0;

    return {
      totalSkus: accessories.length,
      totalUnits: totals.units,
      inventoryValue: totals.sales,
      avgMargin,
      lowStock,
      topMover,
    };
  }, [accessories]);

  const filteredAccessories = React.useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return accessories.filter((item) => {
      const idMatches = toId(item).toLowerCase().includes(query);
      const nameMatches = item.name.toLowerCase().includes(query);
      const stockBand = getStockBand(item.nums).band;
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "low" && stockBand !== "Healthy") ||
        (stockFilter === "healthy" && stockBand === "Healthy");

      return (query === "" || idMatches || nameMatches) && matchesStock;
    });
  }, [accessories, searchTerm, stockFilter]);

  const sortedAccessories = React.useMemo(() => {
    const sorted = [...filteredAccessories];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case "margin":
          return getMarginPercent(b) - getMarginPercent(a);
        case "value":
          return getInventoryValue(b) - getInventoryValue(a);
        default:
          return b.nums - a.nums;
      }
    });
    return sorted;
  }, [filteredAccessories, sortKey]);

  React.useEffect(() => {
    if (!sortedAccessories.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId) {
      setSelectedId(toId(sortedAccessories[0]));
      return;
    }
    const stillVisible = sortedAccessories.some(
      (item) => toId(item) === selectedId
    );
    if (!stillVisible) {
      setSelectedId(toId(sortedAccessories[0]));
    }
  }, [sortedAccessories, selectedId]);

  const selectedAccessory =
    accessories.find((item) => toId(item) === selectedId) ??
    sortedAccessories[0] ??
    null;

  const restockQueue = React.useMemo(
    () =>
      [...accessories]
        .filter((item) => item.nums <= 18)
        .sort((a, b) => a.nums - b.nums)
        .slice(0, 4),
    [accessories]
  );

  const maxStock = React.useMemo(
    () => accessories.reduce((max, item) => Math.max(max, item.nums), 1),
    [accessories]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Admin - Accessories
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Accessory Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Synced with shop catalog - {analytics.totalSkus} SKUs tracked from
            data.ts
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            type="button"
          >
            Export report
          </button>
          <button
            className="flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            type="button"
          >
            Create purchase order
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total SKUs"
          value={`${analytics.totalSkus}`}
          subLabel={`${analytics.totalUnits} units in stock`}
          chip="Catalog"
        />
        <StatCard
          label="Inventory value"
          value={currencyFormatter.format(analytics.inventoryValue)}
          subLabel="Potential revenue"
          chip="Live"
          chipTone="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Average margin"
          value={`${analytics.avgMargin.toFixed(1)}%`}
          subLabel="vs landed cost"
          chip="Gross"
          chipTone="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Low stock"
          value={`${analytics.lowStock} items`}
          subLabel="Below 18 units"
          chip="Alerts"
          chipTone="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5 text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-4.35-4.35M9.75 17.25a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                />
              </svg>
              <input
                className="w-full border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                placeholder="Search by accessory name or ID"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
              value={stockFilter}
              onChange={(event) =>
                setStockFilter(event.target.value as StockFilter)
              }
            >
              <option value="all">All stock levels</option>
              <option value="low">Critical & low</option>
              <option value="healthy">Healthy stock</option>
            </select>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:outline-none"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
            >
              <option value="stock">Sort by units</option>
              <option value="margin">Sort by margin</option>
              <option value="value">Sort by inventory value</option>
            </select>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Catalog overview
                </h3>
                <p className="text-sm text-slate-500">
                  Showing {sortedAccessories.length} of {accessories.length}{" "}
                  SKUs
                </p>
              </div>
              {analytics.topMover && (
                <p className="text-sm text-slate-500">
                  Top mover:{" "}
                  <span className="font-semibold text-slate-900">
                    {analytics.topMover.name}
                  </span>
                </p>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3">Stock</th>
                    <th className="px-6 py-3">Sell price</th>
                    <th className="px-6 py-3">Margin</th>
                    <th className="px-6 py-3">Built</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedAccessories.map((item) => {
                    const stockBand = getStockBand(item.nums);
                    return (
                      <tr
                        key={toId(item)}
                        className={`cursor-pointer transition hover:bg-slate-50 ${
                          selectedId === toId(item) ? "bg-slate-50" : ""
                        }`}
                        onClick={() => setSelectedId(toId(item))}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
                              {item.img ? (
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {toId(item)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {item.nums} units
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {currencyFormatter.format(item.priceSell)}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {getMarginPercent(item).toFixed(1)}%
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(item.dateOfManufacture)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${stockBand.badge}`}
                          >
                            {stockBand.band}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {!sortedAccessories.length && (
                    <tr>
                      <td
                        className="px-6 py-12 text-center text-slate-500"
                        colSpan={6}
                      >
                        No accessories match your filters. Clear filters to view
                        the full catalog sourced from shop/data.ts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                Selection details
              </h3>
              <p className="text-sm text-slate-500">
                Drill into a SKU before approving changes
              </p>
            </div>
            {selectedAccessory ? (
              <div className="space-y-5 px-6 py-6 text-sm text-slate-600">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-xl bg-slate-100">
                    {selectedAccessory.img ? (
                      <img
                        src={selectedAccessory.img}
                        alt={selectedAccessory.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedAccessory.name}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {toId(selectedAccessory)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-4">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Sell price
                      </dt>
                      <dd className="text-base font-semibold text-slate-900">
                        {currencyFormatter.format(selectedAccessory.priceSell)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Margin
                      </dt>
                      <dd className="text-base font-semibold text-slate-900">
                        {getMarginPercent(selectedAccessory).toFixed(1)}%
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Inventory value
                      </dt>
                      <dd className="text-base font-semibold text-slate-900">
                        {currencyFormatter.format(
                          getInventoryValue(selectedAccessory)
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Manufactured
                      </dt>
                      <dd className="text-base font-semibold text-slate-900">
                        {formatDate(selectedAccessory.dateOfManufacture)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-slate-500">
                    <span>Stock health</span>
                    <span>{selectedAccessory.nums} units</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${getStockBand(selectedAccessory.nums).barColor}`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (selectedAccessory.nums / maxStock) * 100
                          )
                        )}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {getStockBand(selectedAccessory.nums).hint} - In inventory{" "}
                    {daysInInventory(selectedAccessory.dateOfManufacture)} days
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    type="button"
                  >
                    Add to promotion
                  </button>
                  <button
                    className="flex-1 rounded-xl border border-blue-600 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    type="button"
                  >
                    Schedule restock
                  </button>
                </div>
              </div>
            ) : (
              <p className="px-6 py-10 text-sm text-slate-500">
                Choose an accessory from the table to see detailed insights.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900">
                Restock queue
              </h3>
              <p className="text-sm text-slate-500">
                Trigger purchase orders before we hit zero
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {restockQueue.map((item) => {
                const stockBand = getStockBand(item.nums);
                return (
                  <div
                    key={toId(item)}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        {item.nums} units - {stockBand.band} -{" "}
                        {daysInInventory(item.dateOfManufacture)} days old
                      </p>
                    </div>
                    <button
                      className="rounded-full border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      type="button"
                      onClick={() => setSelectedId(toId(item))}
                    >
                      Create PO
                    </button>
                  </div>
                );
              })}
              {!restockQueue.length && (
                <p className="px-6 py-10 text-sm text-slate-500">
                  All accessories are healthy. Monitor alerts as new catalog data
                  arrives.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRevenue } from "./useRevenueCustom";
import { RevenueData } from "./data";
import moment from "moment";

enum TimeChart {
  DAYS = "Days",
  WEEKS = "Weeks",
  MONTHS = "Months",
  ANNUAL = "Years",
}

export const RevenueTab = React.memo(() => {
  const dataRevenue = useRevenue();
  const { getTransactionInMonth, getTransactionInYear } = dataRevenue;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [data, setData] = useState<RevenueData[]>([]);
  const [filter, setFilter] = useState<string>(TimeChart.MONTHS);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const chartRef = useRef<HTMLDivElement>(null);
  const MAX_VALUE = 50000;

  useEffect(() => {
    let newData: RevenueData[] = [];
    const now = new Date();

    switch (filter) {
      case TimeChart.MONTHS:
        for (let month = 1; month <= 12; month++) {
          const monthData = getTransactionInMonth({ year: currentYear, month });
          const value = month <= currentMonth ? monthData[0]?.value || 0 : 0;
          newData.push({
            value,
            day: new Date(currentYear, month - 1),
            idCar: "",
            idStaff: "",
            idUser: ""
          });
        }
        break;

      case TimeChart.ANNUAL:
        const startYear = currentYear - 4;
        for (let year = startYear; year <= currentYear; year++) {
          const yearData = getTransactionInYear(year);
          const value = year < currentYear
            ? yearData.reduce((sum, item) => sum + item.value, 0)
            : yearData.slice(0, currentMonth).reduce((sum, item) => sum + item.value, 0);
          newData.push({
            value,
            day: new Date(year, 0),
            idCar: "",
            idStaff: "",
            idUser: ""
          });
        }
        break;

      case TimeChart.WEEKS:
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - (i * 7));
          const value = date <= now ? Math.random() * MAX_VALUE : 0;
          newData.push({
            value,
            day: date,
            idCar: "",
            idStaff: "",
            idUser: ""
          });
        }
        break;

      case TimeChart.DAYS:
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const value = date <= now ? Math.random() * MAX_VALUE : 0;
          newData.push({
            value,
            day: date,
            idCar: "",
            idStaff: "",
            idUser: ""
          });
        }
        break;
    }
    setData(newData);
  }, [filter, currentYear, currentMonth]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value);
      setHoverIndex(null);
      setHoverValue(null);
    },
    []
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = rect.bottom - e.clientY;

    const value = (y / rect.height) * MAX_VALUE;
    setHoverValue(Math.round(value));

    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
    setHoverIndex(null);
  };

  const getDateFormat = (date: Date) => {
    switch (filter) {
      case TimeChart.DAYS:
        return moment(date).format("ddd");
      case TimeChart.WEEKS:
        return `W${moment(date).week()}`;
      case TimeChart.MONTHS:
        return moment(date).format("MMM");
      case TimeChart.ANNUAL:
        return moment(date).format("YYYY");
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 transition-opacity h-auto flex-1 flex flex-col duration-300">
      <div className="flex-row flex justify-between px-6 py-3 items-center ">
        <h2 className="text-2xl font-bold ">Biểu Đồ Doanh Thu</h2>
        <select
          className="rounded py-2 px-3 w-40 mr-6 text-base shadow focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={filter}
          onChange={handleFilterChange}
        >
          <option value={TimeChart.DAYS}>Days</option>
          <option value={TimeChart.WEEKS}>Weeks</option>
          <option value={TimeChart.MONTHS}>Months</option>
          <option value={TimeChart.ANNUAL}>Years</option>
        </select>
      </div>

      <div
        className="h-[300px] 2xl:h-[600px] w-[90%] self-center flex flex-row relative  "
        ref={chartRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {data.map((item, index) => (
          <div key={item.idUser} className="flex w-[15%] flex-col-reverse h-full  items-center min-w-[48px]">
            <span className=" border-t border-gray-800 w-full text-center text-sm pt-2">{getDateFormat(item.day)}</span>
            <div
              className={`w-12 ${hoverIndex === index ? "bg-blue-700" : "bg-blue-500"} rounded-t`}
              style={{ height: `${(item.value / MAX_VALUE) * 100}%` }}
            />
            <h3 className=" text-sm">{item.value.toLocaleString()}</h3>
          </div>
        ))}
      </div>
      <h3 className="flex self-center my-4 font-semibold text-2xl text-black">{`${filter} Revenue Chart`}</h3>
    </div>
  );
});
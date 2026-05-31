import { useEffect, useRef, useState } from "react";
import apiClient from "src/services/api";
import type { CustomerVehicleListResult, CustomerVehicleViewModel } from "src/services/api/functions/workshop/workshop.types";
import { formatMoney } from "./workshopUi";

interface VehicleAutocompleteProps {
  value?: string | number;
  onSelect: (vehicle: CustomerVehicleViewModel) => void;
  required?: boolean;
  label?: string;
  placeholder?: string;
}

export function VehicleAutocomplete({
  value,
  onSelect,
  required = false,
  label = "Chọn xe khách hàng",
  placeholder = "Nhập biển số, tên khách hàng, dòng xe, hoặc số VIN...",
}: VehicleAutocompleteProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<CustomerVehicleViewModel[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicleViewModel | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Load initial vehicle info if value (ID) is provided
  useEffect(() => {
    if (value && !selectedVehicle) {
      setLoading(true);
      apiClient
        .get<CustomerVehicleViewModel>(`/workshop/customer-vehicles/${value}`)
        .then((res) => {
          if (res.data) {
            setSelectedVehicle(res.data);
            const brand = res.data.brandName ?? "";
            const model = res.data.modelName ?? "";
            const plate = res.data.licensePlate ? ` [${res.data.licensePlate}]` : "";
            setKeyword(`${brand} ${model}${plate}`);
          }
        })
        .catch(() => {
          // If detailed fetch fails, fallback to simple ID display
          setKeyword(`Xe khách hàng #${value}`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [value, selectedVehicle]);

  // Debounce search 400ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!keyword.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    // Skip query if keyword matches current selected vehicle label
    if (selectedVehicle) {
      const brand = selectedVehicle.brandName ?? "";
      const model = selectedVehicle.modelName ?? "";
      const plate = selectedVehicle.licensePlate ? ` [${selectedVehicle.licensePlate}]` : "";
      const currentLabel = `${brand} ${model}${plate}`;
      if (keyword.trim() === currentLabel.trim()) {
        return;
      }
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const queryVal = keyword.trim().toLowerCase();
        // Request a relatively large page size so we can filter client-side if server doesn't support keyword query
        const res = await apiClient.get<CustomerVehicleListResult>("/workshop/customer-vehicles", {
          params: { page: 1, pageSize: 100 },
        });

        const items = res.data?.data ?? [];
        
        // Filter: client-side match (just in case backend doesn't support full-text keyword searches on customer-vehicles)
        const matched = items.filter((item) => {
          const brandName = (item.brandName ?? "").toLowerCase();
          const modelName = (item.modelName ?? "").toLowerCase();
          const licensePlate = (item.licensePlate ?? "").toLowerCase();
          const ownerFullName = (item.ownerFullName ?? "").toLowerCase();
          const vin = (item.vin ?? "").toLowerCase();

          return (
            brandName.includes(queryVal) ||
            modelName.includes(queryVal) ||
            licensePlate.includes(queryVal) ||
            ownerFullName.includes(queryVal) ||
            vin.includes(queryVal)
          );
        });

        setResults(matched);
        setOpen(matched.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword, selectedVehicle]);

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (item: CustomerVehicleViewModel) => {
    setSelectedVehicle(item);
    onSelect(item);
    
    const brand = item.brandName ?? "";
    const model = item.modelName ?? "";
    const plate = item.licensePlate ? ` [${item.licensePlate}]` : "";
    setKeyword(`${brand} ${model}${plate}`);
    
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedVehicle(null);
    setKeyword("");
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative space-y-1">
      <label className="block text-sm font-medium text-slate-800 dark:text-slate-100">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border-2 border-slate-400 bg-white px-3 py-2 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/25 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100"
          required={required}
        />
        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Xóa lựa chọn"
          >
            ×
          </button>
        )}
      </div>
      {loading && (
        <div className="absolute right-8 top-8 text-xs text-slate-400">Đang tìm...</div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
          {results.map((item) => (
            <li
              key={item.customerVehicleID}
              onMouseDown={() => handleSelect(item)}
              className="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-0"
            >
              <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                <span>
                  {item.brandName} {item.modelName} ({item.modelYear})
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {item.licensePlate ?? "Không biển số"}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>Chủ xe: {item.ownerFullName ?? `User #${item.userID}`}</span>
                <span>VIN: {item.vin}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

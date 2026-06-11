import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import { useCart } from "@/hooks/useCart";
import { useAuthStore } from "@/stores/authStore";
import type { CarResponse, CarResponseItem } from "@/shared/types/Reponse/Car";
import { useBrandCarList } from "@/query/brand-car/useBrandCarQueries";
import { useBodyTypeList } from "@/query/body-type/useBodyTypeQueries";
import { useCarStatusList } from "@/query/car/useCarQueries";
import { Loading } from "@/components/core/Feedback/Loading";
import PremiumGateModal from "@/pages/customer/Premium/components/PremiumGateModal";
import { getImageSrc } from "./carHelpers";
import { CompareModal } from "./components/CompareModal";
import { CarFilters } from "./components/CarFilters";
import { CarCard } from "./components/CarCard";
import { CompareBar } from "./components/CompareBar";

export default function CustomerCarsPage() {
  const { addCar, isInCart } = useCart();
  const user = useAuthStore((s) => s.user);
  const [showPremiumGate, setShowPremiumGate] = useState(false);
  const [compareList, setCompareList] = useState<CarResponseItem[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const toggleCompare = (car: CarResponseItem) => {
    setCompareList((prev) => {
      if (prev.some((c) => c.carID === car.carID))
        return prev.filter((c) => c.carID !== car.carID);
      if (prev.length >= 3) return prev;
      return [...prev, car];
    });
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const { data: brandCars = [], isLoading: brandsLoading } = useBrandCarList();
  const { data: bodyTypes = [], isLoading: bodiesLoading } = useBodyTypeList();
  const { data: carStatuses = [] } = useCarStatusList();

  const [page, setPage] = useState(1);
  const pageSize = 12;

  const [search, setSearch] = useState(
    () => searchParams.get("search") ?? searchParams.get("carName") ?? "",
  );
  const [brandCode, setBrandCode] = useState(
    () => searchParams.get("brandCode") ?? "",
  );
  const [bodyCode, setBodyCode] = useState(
    () => searchParams.get("bodyCode") ?? "",
  );
  const [condition, setCondition] = useState(
    () => searchParams.get("condition") ?? "",
  );
  const [statusCode, setStatusCode] = useState(
    () => searchParams.get("statusCode") ?? "",
  );
  const [priceFrom, setPriceFrom] = useState<string>("");
  const [priceTo, setPriceTo] = useState<string>("");

  // Đồng bộ filter hiện tại lên URL để giữ trạng thái khi reload/share link
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (brandCode) params.brandCode = brandCode;
    if (bodyCode) params.bodyCode = bodyCode;
    if (condition) params.condition = condition;
    if (statusCode) params.statusCode = statusCode;
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, brandCode, bodyCode, condition, statusCode]);

  const priceFromNum = useMemo(() => {
    const n = Number(priceFrom);
    return priceFrom.trim() && Number.isFinite(n) ? n : undefined;
  }, [priceFrom]);

  const priceToNum = useMemo(() => {
    const n = Number(priceTo);
    return priceTo.trim() && Number.isFinite(n) ? n : undefined;
  }, [priceTo]);

  const brandOptions = useMemo(
    () => brandCars.map((b) => ({ value: b.brandCode, label: b.brandName })),
    [brandCars],
  );
  const bodyOptions = useMemo(
    () => bodyTypes.map((b) => ({ value: b.bodyCode, label: b.bodyName })),
    [bodyTypes],
  );
  const statusOptions = useMemo(
    () =>
      carStatuses
        .filter((s) => s.isActive)
        .map((s) => ({ value: s.statusCode, label: s.statusName })),
    [carStatuses],
  );

  const { data, isLoading, error } = useQuery<CarResponse, Error>({
    queryKey: [
      "customer-cars",
      page,
      pageSize,
      search,
      brandCode,
      bodyCode,
      priceFromNum,
      priceToNum,
      condition,
      statusCode,
    ],
    placeholderData: keepPreviousData,
    queryFn: () =>
      carRouteFn.getPaging({
        pageIndex: page,
        pageSize,
        search: search.trim(),
        brandCode: brandCode.trim(),
        bodyCode: bodyCode.trim(),
        ...(priceFromNum !== undefined ? { priceFrom: priceFromNum } : {}),
        ...(priceToNum !== undefined ? { priceTo: priceToNum } : {}),
        ...(condition ? { conditions: [condition] } : {}),
        ...(statusCode ? { statusCodes: [statusCode] } : {}),
      }),
  });

  const total = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cars = data?.data ?? [];
  const isCapped = !isLoading && total > cars.length && !user;

  const handleReset = () => {
    setPage(1);
    setSearch("");
    setBrandCode("");
    setBodyCode("");
    setPriceFrom("");
    setPriceTo("");
    setCondition("");
    setStatusCode("");
  };

  return (
    <>
      {showPremiumGate && (
        <PremiumGateModal
          featureTitle="Xem toàn bộ danh sách xe"
          featureDescription="Nâng cấp Premium để xem tất cả xe không giới hạn."
          onClose={() => setShowPremiumGate(false)}
        />
      )}
      {showCompare && compareList.length >= 2 && (
        <CompareModal
          cars={compareList}
          onClose={() => setShowCompare(false)}
        />
      )}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Danh sách xe</h1>
          <p className="mt-1 text-sm text-slate-600">
            Lọc theo mã hãng / mã dòng xe và khoảng giá
          </p>
        </div>

        <CarFilters
          search={search}
          brandCode={brandCode}
          bodyCode={bodyCode}
          condition={condition}
          statusCode={statusCode}
          priceFrom={priceFrom}
          priceTo={priceTo}
          brandOptions={brandOptions}
          bodyOptions={bodyOptions}
          statusOptions={statusOptions}
          brandsLoading={brandsLoading}
          bodiesLoading={bodiesLoading}
          onSearchChange={(v) => {
            setPage(1);
            setSearch(v);
          }}
          onBrandCodeChange={(v) => {
            setPage(1);
            setBrandCode(v);
          }}
          onBodyCodeChange={(v) => {
            setPage(1);
            setBodyCode(v);
          }}
          onConditionChange={(v) => {
            setPage(1);
            setCondition(v);
          }}
          onStatusCodeChange={(v) => {
            setPage(1);
            setStatusCode(v);
          }}
          onPriceFromChange={(v) => {
            setPage(1);
            setPriceFrom(v);
          }}
          onPriceToChange={(v) => {
            setPage(1);
            setPriceTo(v);
          }}
          onReset={handleReset}
        />

        {isLoading ? (
          <Loading label="Đang tải..." className="py-16" />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Lỗi: {error.message}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => {
                const img = getImageSrc(car);
                return (
                  <CarCard
                    key={car.carID}
                    car={car}
                    img={img}
                    inCompare={compareList.some((c) => c.carID === car.carID)}
                    onToggleCompare={() => toggleCompare(car)}
                    inCart={isInCart("car", car.carID)}
                    onAddToCart={() =>
                      void addCar({
                        carId: car.carID,
                        name: car.carName,
                        price: car.salePrice ?? car.price,
                        imagePath: img,
                      })
                    }
                  />
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Trước
              </button>
              <div className="text-sm text-slate-600">
                Trang{" "}
                <strong className="font-semibold text-slate-900">{page}</strong>{" "}
                / {totalPages}
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Sau
              </button>
            </div>

            {isCapped && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
                <p className="text-sm text-amber-800">
                  Đang xem <strong>{cars.length}</strong>/{total} xe.{" "}
                  <button
                    type="button"
                    className="font-semibold text-amber-700 underline"
                    onClick={() => setShowPremiumGate(true)}
                  >
                    Nâng cấp Premium
                  </button>{" "}
                  để xem toàn bộ danh sách.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <CompareBar
        compareList={compareList}
        onToggle={toggleCompare}
        onClear={() => setCompareList([])}
        onCompare={() => setShowCompare(true)}
      />
    </>
  );
}

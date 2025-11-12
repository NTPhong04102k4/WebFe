import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SiSpeedtest } from "react-icons/si";
import { LiaGasPumpSolid } from "react-icons/lia";
import { TbManualGearbox } from "react-icons/tb";
import { CiBookmark } from "react-icons/ci";
import { GoArrowUpRight } from "react-icons/go";
import { Pagination } from "./item/Paingation";
import { useNavigate } from "react-router";
import { CarDetail } from "../home/item/typeData";
import { carRouteFn } from "src/services/api/functions/car/Routes.Fn";
import { mapCarsToDetails } from "src/shared/utils/carAdapter";

const ITEMS_PER_PAGE = 12;

enum StatusCar {
  GREATE_PRICE = "Great Price",
  SALE = "Sale",
  NONE = "none",
}

enum SortPrice {
  ASCENDING = "Ascending",
  DESCENDING = "Descending",
  DEFAULT = "Default",
}

const Listings = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<SortPrice>(SortPrice.DEFAULT);
  const [cars, setCars] = useState<CarDetail[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let canceled = false;

    const fetchCars = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await carRouteFn.getCars({
          pageIndex: currentPage,
          pageSize: ITEMS_PER_PAGE,
        });
        if (canceled) return;
        setCars(mapCarsToDetails(response.data));
        setTotalResults(response.totalCount ?? response.data.length);
      } catch (err) {
        if (canceled) return;
        console.error("Failed to fetch listing cars", err);
        setError("Unable to load listings right now.");
        setCars([]);
        setTotalResults(0);
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    fetchCars();

    return () => {
      canceled = true;
    };
  }, [currentPage]);

  const parsePrice = useCallback((price: string) => {
    const parsed = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }, []);

  const currentData = useMemo(() => {
    switch (filter) {
      case SortPrice.ASCENDING:
        return [...cars].sort(
          (a, b) => parsePrice(a.priceBuy) - parsePrice(b.priceBuy)
        );
      case SortPrice.DESCENDING:
        return [...cars].sort(
          (a, b) => parsePrice(b.priceBuy) - parsePrice(a.priceBuy)
        );
      default:
        return [...cars];
    }
  }, [cars, filter, parsePrice]);

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as SortPrice);
      setCurrentPage(1);
    },
    []
  );

  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleViewDetails = (item: CarDetail) => {
    navigate(`/listings/details?carId=${item.id}`, {
      state: { subItem: item, carId: item.id },
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#050b2b]">
      <div className="rounded-b-[45px] flex flex-col w-full px-[5%] bg-white">
        <main className="bg-white rounded-b-lg py-8">
          <nav className="text-blue-500 font-sans">
            Home / <span>Listings</span>
          </nav>
          <h2 className="text-2xl mb-6 font-sans font-medium">Listings</h2>
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center mb-6">
              <p>
                Showing {isLoading ? 0 : currentData.length} of {totalResults} results
              </p>
              <select
                className="p-2 rounded-md border"
                value={filter}
                onChange={handleFilterChange}
              >
                {Object.values(SortPrice).map((sortType) => (
                  <option key={sortType} value={sortType}>
                    {sortType}
                  </option>
                ))}
              </select>
            </div>
            {isLoading ? (
              <p className="text-center text-gray-500">Loading listings...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : currentData.length === 0 ? (
              <p className="text-center text-gray-500">No listings available.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 w-full gap-2">
                  {currentData.map((subItem) => (
                    <div
                      key={subItem.id}
                      className="h-auto w-auto my-2 mx-1 hover:shadow-xl transition duration-300 bg-white border border-gray-200 rounded-lg shadow"
                    >
                      <div
                        className="h-auto aspect-[5/3] w-full bg-cover bg-center relative rounded-t-lg"
                        style={{ backgroundImage: `url(${subItem.img})` }}
                      >
                        <div
                          className={`absolute top-2 left-2 ${
                            subItem.status === StatusCar.SALE
                              ? "bg-blue-600"
                              : subItem.status === StatusCar.GREATE_PRICE
                              ? "bg-green-600"
                              : "bg-transparent"
                          } text-white text-xs font-semibold px-2 py-1 rounded`}
                        >
                          {subItem.status !== StatusCar.NONE ? subItem.status : null}
                        </div>
                        <button className="absolute top-2 right-2 bg-white p-2 rounded-full">
                          <CiBookmark size={20} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h2 className="text-lg font-semibold truncate">{subItem.name}</h2>
                        <p className="text-sm text-gray-600 truncate">{subItem.script}</p>
                        <hr className="mt-3 mb-3" />
                        <div className="mt-4 flex justify-between 2xl:px-6 gap-6 items-center text-sm">
                          <div className="flex flex-col items-center">
                            <SiSpeedtest size={20} />
                            <span>{subItem.speed.replace("km/h", "")} Miles</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <LiaGasPumpSolid size={20} />
                            <span>{subItem.energy}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <TbManualGearbox size={20} />
                            <span>{subItem.transmission}</span>
                          </div>
                        </div>
                        <hr className="mt-3 mb-3" />
                        <div className="justify-between 2xl:pl-6 2xl:pr-0 flex flex-row items-center">
                          <h2 className="text-[#000] text-base font-sans font-semibold">
                            ${subItem.priceBuy.replaceAll(" ", "")}
                          </h2>
                          <div
                            className="inline-flex gap-2 p-2 justify-center items-center "
                            onClick={() => handleViewDetails(subItem)}
                          >
                            <h2 className="text-base text-[#0044ff] hover:underline active:opacity-80 cursor-pointer">
                              View Details
                            </h2>
                            <button className="cursor-pointer">
                              <GoArrowUpRight size={24} color="#0044ff" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination
                  totalRes={totalResults}
                  currentPage={currentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={changePage}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default React.memo(Listings);

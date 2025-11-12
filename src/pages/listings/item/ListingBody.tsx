import React, { useCallback, useEffect, useState } from "react";
import { GoArrowUpRight } from "react-icons/go";
import { Pagination } from "./Paingation";
import { TbManualGearbox } from "react-icons/tb";
import { LiaGasPumpSolid } from "react-icons/lia";
import { SiSpeedtest } from "react-icons/si";
import { CiBookmark } from "react-icons/ci";
import { useLocation, useNavigate } from "react-router";
import { CarDetail } from "src/pages/home/item/typeData";
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

const ListingBody = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<SortPrice>(SortPrice.DEFAULT);

  const locationState = location.state as
    | {
        subItem?: CarDetail[];
        body?: CarDetail["body"];
      }
    | undefined;

  const stateCars = locationState?.subItem;

  const selectedBody =
    locationState?.body ??
    stateCars?.[0]?.body ??
    ("Sedan" as CarDetail["body"]);

  const [bodyCars, setBodyCars] = useState<CarDetail[]>(() =>
    (stateCars ?? []).filter(
      (item) => item.body.toLowerCase() === selectedBody.toLowerCase()
    )
  );
  const [isLoadingCars, setIsLoadingCars] = useState(
    (stateCars ?? []).length === 0
  );
  const [carError, setCarError] = useState<string | null>(null);

  useEffect(() => {
    if (stateCars && stateCars.length > 0) {
      setBodyCars(
        stateCars.filter(
          (item) => item.body.toLowerCase() === selectedBody.toLowerCase()
        )
      );
      setIsLoadingCars(false);
    }
  }, [stateCars, selectedBody]);

  useEffect(() => {
    let isMounted = true;

    const fetchBodyCars = async () => {
      setIsLoadingCars(true);
      setCarError(null);

      try {
        const response = await carRouteFn.getCars({
          pageIndex: 1,
          pageSize: 60,
        });

        if (!isMounted) return;

        const normalized = mapCarsToDetails(response.data).filter(
          (item) => item.body.toLowerCase() === selectedBody.toLowerCase()
        );
        setBodyCars(normalized);
      } catch (error) {
        console.error("Failed to load cars by body", error);
        if (!isMounted) return;
        setCarError("Unable to load cars for this body type.");
        setBodyCars([]);
      } finally {
        if (isMounted) {
          setIsLoadingCars(false);
        }
      }
    };

    fetchBodyCars();

    return () => {
      isMounted = false;
    };
  }, [selectedBody]);

  const parsePrice = useCallback((price: string) => {
    const parsed = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }, []);

  const sortedData = React.useMemo(() => {
    switch (filter) {
      case SortPrice.ASCENDING:
        return [...bodyCars].sort(
          (a, b) => parsePrice(a.priceBuy) - parsePrice(b.priceBuy)
        );
      case SortPrice.DESCENDING:
        return [...bodyCars].sort(
          (a, b) => parsePrice(b.priceBuy) - parsePrice(a.priceBuy)
        );
      default:
        return [...bodyCars];
    }
  }, [bodyCars, filter, parsePrice]);

  const currentData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedData, currentPage]);

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
    <div className="w-full min-h-screen flex flex-col  bg-[#050b2b]">
      <div className="flex flex-col w-full bg-white px-[5%] pb-12 ">
        <nav className="text-blue-500 font-sans mt-12">
          Home / <span>Listings/Body/{selectedBody}</span>
        </nav>
        <h2 className="text-2xl mb-6 font-sans font-medium">Listings</h2>
        <div className="flex justify-between items-center mb-6">
          <p>
            Showing {isLoadingCars ? 0 : currentData.length} of {" "}
            {isLoadingCars ? 0 : sortedData.length} results
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
        {isLoadingCars ? (
          <p className="text-center text-gray-500">Loading cars...</p>
        ) : carError ? (
          <p className="text-center text-red-500">{carError}</p>
        ) : sortedData.length === 0 ? (
          <p className="text-center text-gray-500">
            No cars found for the selected body type.
          </p>
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
                    <h2 className="text-lg font-semibold truncate">
                      {subItem.name}
                    </h2>
                    <p className="text-sm text-gray-600 truncate">
                      {subItem.script}
                    </p>
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
              totalRes={sortedData.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={changePage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(ListingBody);

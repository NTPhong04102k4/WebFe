import React, { useCallback, useMemo, useState } from "react";
import { GoArrowUpRight } from "react-icons/go";
import { Pagination } from "./Paingation";
import { TbManualGearbox } from "react-icons/tb";
import { LiaGasPumpSolid } from "react-icons/lia";
import { SiSpeedtest } from "react-icons/si";
import { CiBookmark } from "react-icons/ci";
import { useNavigate } from "react-router";
import { CarDetail } from "src/pages/home/item/typeData";
import { useCarList } from "src/query/car/useCarQueries";
import { CarResponseItem } from "src/shared/types/Reponse/Car";

const ITEMS_PER_PAGE = 100;

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

// Helper function to get image URL from CarResponseItem
const getImageUrl = (car: CarResponseItem): string => {
  if (car.primaryImagePath) {
    if (typeof car.primaryImagePath === "string") {
      return car.primaryImagePath;
    }
    if (typeof car.primaryImagePath === "object") {
      return (
        (car.primaryImagePath as any)?.url ||
        (car.primaryImagePath as any)?.path ||
        "https://via.placeholder.com/300x200"
      );
    }
  }

  if (car.imagePaths) {
    let images: any[] = [];
    if (typeof car.imagePaths === "string") {
      images = (car.imagePaths as string)
        .split(",")
        .map((s: string) => s.trim());
    } else if (Array.isArray(car.imagePaths)) {
      images = car.imagePaths as any[];
    }

    if (images.length > 0) {
      const firstImage = images[0];
      if (typeof firstImage === "string") {
        return firstImage;
      }
      if (typeof firstImage === "object" && firstImage !== null) {
        return (
          (firstImage as any)?.url ||
          (firstImage as any)?.path ||
          "https://via.placeholder.com/300x200"
        );
      }
    }
  }

  return "https://via.placeholder.com/300x200";
};

// Helper function to map CarResponseItem to CarDetail
const mapCarToCarDetail = (car: CarResponseItem): CarDetail => {
  const imageUrl = getImageUrl(car);

  // Determine status based on price difference
  let status: "Sale" | "Great Price" | "none" = "none";
  if (car.importPrice && car.salePrice) {
    const discount =
      ((car.importPrice - car.salePrice) / car.importPrice) * 100;
    if (discount > 20) {
      status = "Great Price";
    } else if (discount > 0) {
      status = "Sale";
    }
  }

  // Format price
  const formatPrice = (price: number): string => {
    return ` $${price.toLocaleString("en-US")}`;
  };

  // Calculate used time (simplified - using modelYear)
  const currentYear = new Date().getFullYear();
  const usedTime = car.modelYear
    ? `${currentYear - car.modelYear} years`
    : "N/A";

  // Map fuel type
  const fuelTypeMap: Record<string, "Petrol" | "Hybird" | "Diesel"> = {
    Petrol: "Petrol",
    Gasoline: "Petrol",
    Diesel: "Diesel",
    Hybrid: "Hybird",
    Electric: "Hybird",
  };
  const energy = fuelTypeMap[car.fuelType] || "Petrol";

  // Map body type
  const bodyTypeMap: Record<
    number,
    "Sedan" | "Coupe" | "SUV" | "Truck" | "HatchBack" | "Convertible"
  > = {
    1: "Sedan",
    2: "Coupe",
    3: "SUV",
    4: "Truck",
    5: "HatchBack",
    6: "Convertible",
  };
  const body = bodyTypeMap[car.bodyTypeID] || "Sedan";

  // Map transmission
  const transmissionMap: Record<string, "CVT" | "Manual" | "Automatic"> = {
    Automatic: "Automatic",
    Manual: "Manual",
    CVT: "CVT",
  };
  const transmission = transmissionMap[car.transmission] || "Automatic";

  return {
    id: car.carID,
    name: car.carName,
    img: imageUrl,
    script: car.shortDescription || car.detailedDescription || "",
    speed: "180 km/h", // Default value as API doesn't provide this
    priceRoot: car.importPrice
      ? formatPrice(car.importPrice)
      : formatPrice(car.price),
    priceBuy: formatPrice(car.salePrice || car.price),
    status,
    isUsedTime: usedTime,
    brand: car.modelName || "",
    body,
    seat: car.seats,
    door: car.doors,
    energy,
    year: new Date(car.modelYear, 0, 1),
    transmission,
    driveType: car.driveType || "",
    condition: car.condition === "new" ? "new" : "used",
    engineSize: car.engineSize || 0,
    cylinders: 4, // Default value as API doesn't provide this in CarResponseItem
    color: car.color || "",
    VIN: car.vin || "",
    descriptOverview: car.detailedDescription || car.shortDescription || "",
    physicBody: {
      length: 0,
      height: 0,
      wheelbase: 0,
      height_includeRoofRails: 0,
      luggageCapacity_seatUp: 0,
      luggageCapacity_seatDown: 0,
      width: 0,
      width_include_mirrors: 0,
      grossVechicleWeight: 0,
      maxLoadingWeigt: 0,
      maxRoofLoad: 0,
      seatMax: car.seats,
      fullTank: 0,
      braked: 0,
      unBraked: 0,
      kerbweight: 0,
      turningCircle: 0,
      location: [0, 0],
    },
  };
};

const ListingCarOld = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<SortPrice>(SortPrice.DEFAULT);
  const {
    data: carResponse,
    isLoading,
    isError,
    error,
  } = useCarList({
    page: currentPage,
    pageSize: ITEMS_PER_PAGE,
    brandCode: "",
    bodyCode: "",
  });
  const navigate = useNavigate();

  // Map API response to CarDetail format
  const mappedCars = useMemo(() => {
    if (!carResponse?.data) return [];
    return carResponse.data.map(mapCarToCarDetail);
  }, [carResponse]);

  // Tạo một memoized function để sắp xếp dữ liệu
  const getSortedData = useCallback(
    (sortType: SortPrice, data: CarDetail[]) => {
      switch (sortType) {
        case SortPrice.ASCENDING:
          return [...data].sort(
            (a, b) =>
              parseFloat(a.priceBuy.replace(/[^0-9.-]+/g, "")) -
              parseFloat(b.priceBuy.replace(/[^0-9.-]+/g, ""))
          );
        case SortPrice.DESCENDING:
          return [...data].sort(
            (a, b) =>
              parseFloat(b.priceBuy.replace(/[^0-9.-]+/g, "")) -
              parseFloat(a.priceBuy.replace(/[^0-9.-]+/g, ""))
          );
        default:
          return [...data];
      }
    },
    []
  );

  // Tính toán dữ liệu đã sắp xếp
  const sortedData = useMemo(
    () => getSortedData(filter, mappedCars),
    [filter, mappedCars, getSortedData]
  );

  // currentData is now just sortedData since pagination is handled by API
  const currentData = sortedData;

  // Xử lý thay đổi filter
  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilter(e.target.value as SortPrice);
      setCurrentPage(1); // Reset về trang 1 khi thay đổi filter
    },
    []
  );

  // Xử lý thay đổi trang
  const changePage = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const handleViewDetails = (carId: number, carDetail: CarDetail) => {
    navigate("/listings/details", {
      state: { subItem: carDetail, carID: carId },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-[#050b2b]">
        <div className="flex flex-col w-full bg-white px-[5%]">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-lg">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-[#050b2b]">
        <div className="flex flex-col w-full bg-white px-[5%]">
          <div className="flex justify-center items-center min-h-[400px]">
            <p className="text-lg text-red-500">
              Error loading cars: {error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalResults = carResponse?.total || 0;

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#050b2b]">
      <div className="flex flex-col w-full bg-white px-[5%]">
        <nav className="text-blue-500 font-sans mt-12">
          Home / <span>Listings</span>
        </nav>
        <h2 className="text-2xl mb-6 font-sans font-medium">Listings</h2>
        <div className="flex justify-between items-center mb-6">
          <p>
            Showing {currentData.length} of {totalResults} results
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
                    {subItem.priceBuy}
                  </h2>
                  <div
                    className="inline-flex gap-2 p-2 justify-center items-center "
                    onClick={() =>
                      handleViewDetails(
                        typeof subItem.id === "number"
                          ? subItem.id
                          : Number(subItem.id),
                        subItem
                      )
                    }
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
      </div>
    </div>
  );
};
export default React.memo(ListingCarOld);

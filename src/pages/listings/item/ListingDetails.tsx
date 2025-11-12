import React from "react";
import { GiSteeringWheel } from "react-icons/gi";
import { GoArrowUpRight } from "react-icons/go";
import { IoPricetagOutline } from "react-icons/io5";
import { LiaGasPumpSolid } from "react-icons/lia";
import { LuSmartphoneNfc } from "react-icons/lu";
import { SiSpeedtest } from "react-icons/si";
import { SlLocationPin } from "react-icons/sl";
import { TbManualGearbox } from "react-icons/tb";
import { useLocation } from "react-router";
import { CarDetail } from "src/pages/home/item/typeData";
import { carRouteFn } from "src/services/api/functions/car/Routes.Fn";
import { mapCarsToDetails } from "src/shared/utils/carAdapter";

type ListingDetailState = {
  subItem?: CarDetail;
  carId?: number | string;
};

const parseNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const MAX_PAGE_BATCHES = 30;
const PAGE_BATCH_SIZE = 60;

const DetailsCar = () => {
  const location = useLocation();
  const state = location.state as ListingDetailState | null;

  const [carDetail, setCarDetail] = React.useState<CarDetail | null>(
    state?.subItem ?? null
  );
  const [isLoading, setIsLoading] = React.useState(!state?.subItem);
  const [error, setError] = React.useState<string | null>(null);

  const hasInitialData = Boolean(state?.subItem);

  const queryParamId = React.useMemo(() => {
    const params = new URLSearchParams(location.search);
    return parseNumericId(params.get("carId"));
  }, [location.search]);

  const carId = React.useMemo(() => {
    const stateId = parseNumericId(state?.carId ?? state?.subItem?.id);
    return stateId ?? queryParamId;
  }, [state?.carId, state?.subItem?.id, queryParamId]);

  const fetchCarById = React.useCallback(async (id: number) => {
    let pageIndex = 1;

    while (pageIndex <= MAX_PAGE_BATCHES) {
      const response = await carRouteFn.getCars({
        pageIndex,
        pageSize: PAGE_BATCH_SIZE,
      });

      const mappedCars = mapCarsToDetails(response.data);
      const matchedCar = mappedCars.find(
        (item) => Number(item.id) === Number(id)
      );
      if (matchedCar) {
        return matchedCar;
      }

      const totalCount =
        response.totalCount ?? pageIndex * PAGE_BATCH_SIZE + mappedCars.length;
      if (
        pageIndex * PAGE_BATCH_SIZE >= totalCount ||
        response.data.length === 0
      ) {
        break;
      }

      pageIndex += 1;
    }

    return null;
  }, []);

  React.useEffect(() => {
    if (!carId) {
      if (!hasInitialData) {
        setError("Car information is unavailable.");
        setIsLoading(false);
      }
      return;
    }

    let canceled = false;

    const fetchDetails = async () => {
      if (!hasInitialData) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const detail =
          (state?.subItem && Number(state.subItem.id) === Number(carId)
            ? state.subItem
            : null) ?? (await fetchCarById(carId));

        if (canceled) return;

        if (detail) {
          setCarDetail(detail);
        } else {
          setError("Car details are unavailable.");
        }
      } catch (err) {
        if (canceled) return;
        console.error("Failed to fetch car detail", err);
        setError("Unable to load car details right now.");
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    fetchDetails();

    return () => {
      canceled = true;
    };
  }, [carId, hasInitialData, state?.subItem, fetchCarById]);

  const detailTitle = carDetail?.name ?? (isLoading ? "Loading..." : "Unknown");

  const priceDifference =
    carDetail && carDetail.priceBuy !== carDetail.priceRoot
      ? Number(carDetail.priceRoot.replaceAll(",", "")) -
        Number(carDetail.priceBuy.replaceAll(",", ""))
      : 0;

  return (
    <div className="w-full flex flex-col bg-[#050b2b] ">
      <div className="bg-white rounded-b-[45px] py-6 w-full px-[10%] ">
        <nav className="inline-flex items-center text-blue-500 ">
          Listings/<span>Details/{detailTitle}</span>
        </nav>
        {isLoading ? (
          <p className="text-gray-500 mt-6">Loading car details...</p>
        ) : error ? (
          <p className="text-red-500 mt-6">{error}</p>
        ) : !carDetail ? (
          <p className="text-gray-700 mt-6">
            Car details are unavailable right now.
          </p>
        ) : (
          <>
            <h2 className="font-black text-2xl">{carDetail.name}</h2>
            <h3>{carDetail.script}</h3>
            <div className="mt-4 flex gap-6 w-auto 2xl:px-6 items-center text-sm">
              <div className="flex w-28 rounded-2xl text-blue-800 flex-col items-center bg-sky-200 py-2 ">
                <SiSpeedtest size={14} />
                <span className="text-sm ">
                  {carDetail.speed.replace("km/h", "")} Miles
                </span>
              </div>
              <div className="flex flex-col items-center text-blue-800 rounded-2xl w-20 bg-sky-200 py-2 px-4">
                <LiaGasPumpSolid size={14} />
                <span>{carDetail.energy}</span>
              </div>
              <div className="flex flex-col items-center text-blue-800  rounded-2xl w-16  bg-sky-200 py-2 px-3">
                <TbManualGearbox size={14} />
                <span>{carDetail.transmission}</span>
              </div>
            </div>
            <div className="inline-flex gap-[5%] w-full my-6 flex-wrap lg:flex-nowrap">
              <div className="w-full lg:w-[70%] ">
                <div
                  className=" rounded-xl w-[100%] h-auto aspect-[5/3] bg-center bg-cover"
                  style={{ backgroundImage: `url(${carDetail.img})` }}
                />
                {/* CarOverview */}
                <h2 className="font-medium font-sans text-lg xl:text-lg 2xl:text-xl md:text-base mt-12">
                  Car Overview
                </h2>
                <p className="text-sm md:text-base text-gray-700 mt-4 leading-relaxed">
                  {carDetail.descriptOverview}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {[
                    { label: "Brand", value: carDetail.brand },
                    { label: "Body", value: carDetail.body },
                    { label: "Seats", value: carDetail.seat },
                    { label: "Doors", value: carDetail.door },
                    {
                      label: "Model Year",
                      value: carDetail.year.getFullYear(),
                    },
                    { label: "Condition", value: carDetail.condition },
                    { label: "Drive Type", value: carDetail.driveType },
                    { label: "Transmission", value: carDetail.transmission },
                    {
                      label: "Engine Size",
                      value: carDetail.engineSize
                        ? `${carDetail.engineSize} L`
                        : "Updating",
                    },
                    {
                      label: "Fuel Type",
                      value: carDetail.energy,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {item.label}
                      </p>
                      <p className="text-base font-semibold text-gray-900 mt-1">
                        {item.value ?? "Updating"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-[30%] gap-6 flex flex-col mt-8 lg:mt-0">
                <div className="border rounded-xl p-4 border-gray-300 shadow-md">
                  <h2>Our Price</h2>
                  {carDetail.priceBuy !== carDetail.priceRoot ? (
                    <div>
                      <h3 className="font-sans text-sm xl:text-sm 2xl:text-[15px]">
                        <span className="line-through">
                          ${carDetail.priceRoot}
                        </span>
                        <span className="font-sans font-medium text-base ml-2">
                          ${carDetail.priceBuy}
                        </span>
                      </h3>
                      <h3 className="text-gray-700 font-sans ">
                        Instant Saving: ${priceDifference.toLocaleString()}
                      </h3>
                    </div>
                  ) : (
                    <h3 className="font-sans font-medium text-base my-1 ">
                      ${carDetail.priceBuy}
                    </h3>
                  )}
                  <button className="text-white bg-blue-500 rounded-xl  gap-3 inline-flex items-center py-3 my-3 px-4 w-full justify-center hover:bg-blue-700 transition duration-300 active:scale-95">
                    <IoPricetagOutline className="" size={20} />
                    Make An Office Price
                  </button>
                  <button className="border border-gray-800 px-4 py-3 w-full items-center justify-center gap-2 rounded-xl inline-flex hover:bg-gray-200 active:scale-95 transition duration-300 my-3">
                    <GiSteeringWheel size={20} />
                    Schedule Test Drive
                  </button>
                </div>
                <div className="border rounded-xl py-4 px-[7%] border-gray-300 shadow flex flex-col">
                  <div
                    className="bg-cover bg-center w-[25%] h-auto aspect-square rounded-full shadow border-gray-400 hover:scale-105 transition duration-300 border"
                    style={{
                      backgroundImage: `url(${require("src/assets/images/team/demo3.avif")})`,
                    }}
                  />
                  <h2 className="my-1 pt-2 font-sans font-medium text-base xl:text-base md:text-sm 2xl:text-lg">
                    Admin
                  </h2>
                  <h3 className="text-gray-500 font-sans font-normal md:text-sm text-sm xl:text-base 2xl:text-base">
                    44, Ngo 84,Pho Chua Lang
                  </h3>
                  <div className="inline-flex justify-between items-center gap-5  my-4 w-full">
                    <div className="inline-flex items-center justify-center gap-2 font-sans text-lg">
                      {" "}
                      <div className="hover:scale-110 transition duration-300 text-blue-500 p-2 bg-sky-100 rounded-full">
                        <SlLocationPin size={18} />
                      </div>{" "}
                      Get Direction
                    </div>
                    <div className="inline-flex items-center justify-center gap-2 font-sans text-lg">
                      {" "}
                      <div className="hover:scale-110 transition duration-300 text-blue-500 p-2 bg-sky-100 rounded-full">
                        <LuSmartphoneNfc size={18} />{" "}
                      </div>
                      0365022794
                    </div>
                  </div>
                  <button className="border border-blue-500 py-2 px-4 items-center justify-center hover:bg-sky-300 transition hover:font-medium gap-2 hover:text-white duration-300 active:scale-95  rounded-xl inline-flex bg-sky-100 text-blue-600 w-full">
                    Message Dealer <GoArrowUpRight size={18} />
                  </button>
                  <button className="border my-4 border-green-500 py-2 px-4 items-center justify-center hover:bg-green-200 gap-2  hover:font-medium hover:text-white transition duration-300 active:scale-95  rounded-xl inline-flex bg-sky-50 text-green-600 w-full">
                    Message Dealer <GoArrowUpRight size={18} />
                  </button>
                  <h2 className="text-black font-sans font-normal text-lg self-center justify-center inline-flex items-center hover:underline cursor-default active:scale-95 transition duration-300 gap-2">
                    View All stock at this dealer <GoArrowUpRight size={18} />
                  </h2>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default React.memo(DetailsCar);

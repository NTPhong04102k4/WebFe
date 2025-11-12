import React from "react";
import { GiSteeringWheel } from "react-icons/gi";
import { GoArrowUpRight } from "react-icons/go";
import { IoPricetagOutline } from "react-icons/io5";
import { LiaGasPumpSolid } from "react-icons/lia";
import { LuSmartphoneNfc } from "react-icons/lu";
import { SiSpeedtest } from "react-icons/si";
import { SlLocationPin } from "react-icons/sl";
import { TbManualGearbox } from "react-icons/tb";
import { useLocation, useNavigate } from "react-router";
import { CarDetail } from "src/pages/home/item/typeData";
import { useAuth } from "src/shared/hooks/auth/index.ts";
import { useCarDetail } from "src/shared/hooks/Car";

const DetailsCar = () => {
  const location = useLocation();
  const propsData = location.state?.subItem as CarDetail;
  const carID = location.state?.carID as number | undefined;
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data: carDetailResponse,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
  } = useCarDetail(carID || null);
  const handleMakeAnOffer = () => {
    if (!user) {
      alert("Please login to make an offer");
      setTimeout(() => {
        navigate("/auth/login");
      }, 1000);
      return;
    }
    const priceString = propsData?.priceBuy?.replace(/[$,]/g, "") || "0";
    const priceUSD = parseFloat(priceString) || 0;

    const depositPercentage = 0.1; // 10% deposit
    const orderAmountVND = Math.max(
      Math.round(priceUSD * 25000 * depositPercentage),
      10000
    );

    const orderId = carID
      ? `ORDER_${carID}_${Date.now()}`
      : `ORDER_${Date.now()}`;

    const customerId = user?.userUUID || user?.userID?.toString() || "";

    navigate("/payment", {
      state: {
        orderId: orderId,
        customerId: customerId,
        orderAmount: orderAmountVND,
        orderDescription: `Đặt cọc mua xe ${propsData?.name || ""}`,
        paymentMethod: undefined,
      },
    });
    return;
  };
  return (
    <div className="w-full flex flex-col bg-[#050b2b] ">
      <div className="bg-white rounded-b-[45px] py-6 w-full px-[10%] ">
        <nav className="inline-flex items-center text-blue-500 ">
          Listings/<span>Details/{propsData?.name}</span>
        </nav>
        <h2 className="font-black text-2xl">{propsData?.name}</h2>
        <h3>{propsData.script}</h3>
        <div className="mt-4 flex gap-6 w-auto 2xl:px-6 items-center text-sm">
          <div className="flex w-28 rounded-2xl text-blue-800 flex-col items-center bg-sky-200 py-2 ">
            <SiSpeedtest size={14} />
            <span className="text-sm ">
              {propsData.speed.replace("km/h", "")} Miles
            </span>
          </div>
          <div className="flex flex-col items-center text-blue-800 rounded-2xl w-20 bg-sky-200 py-2 px-4">
            <LiaGasPumpSolid size={14} />
            <span>{propsData.energy}</span>
          </div>
          <div className="flex flex-col items-center text-blue-800  rounded-2xl w-16  bg-sky-200 py-2 px-3">
            <TbManualGearbox size={14} />
            <span>{propsData.transmission}</span>
          </div>
        </div>
        <div className="inline-flex gap-[5%] w-full my-6">
          <div className="w-[70%] ">
            <div
              className=" rounded-xl w-[100%] h-auto aspect-[5/3] bg-center bg-cover"
              style={{ backgroundImage: `url(${propsData.img})` }}
            />
            {/* CarOverview */}
            <h2 className="font-medium font-sans text-lg xl:text-lg 2xl:text-xl md:text-base mt-12">
              Car Overview
            </h2>
            <p className="text-gray-600 mt-2">
              {propsData?.descriptOverview || propsData?.script}
            </p>

            {/* Technical Specifications */}
            {carDetailResponse && (
              <div className="mt-8">
                <h2 className="font-medium font-sans text-lg xl:text-lg 2xl:text-xl md:text-base mb-4">
                  Technical Specifications
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Dimensions */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Dimensions
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        Length: {carDetailResponse.length_mm} mm (
                        {(carDetailResponse.length_mm / 1000).toFixed(2)} m)
                      </p>
                      <p>
                        Width: {carDetailResponse.width_mm} mm (
                        {(carDetailResponse.width_mm / 1000).toFixed(2)} m)
                      </p>
                      <p>
                        Height: {carDetailResponse.height_mm} mm (
                        {(carDetailResponse.height_mm / 1000).toFixed(2)} m)
                      </p>
                      <p>
                        Wheelbase: {carDetailResponse.wheelbase_mm} mm (
                        {(carDetailResponse.wheelbase_mm / 1000).toFixed(2)} m)
                      </p>
                      {carDetailResponse.groundClearance_mm && (
                        <p>
                          Ground Clearance:{" "}
                          {carDetailResponse.groundClearance_mm} mm
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Weight */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Weight
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Curb Weight: {carDetailResponse.curbWeight_kg} kg</p>
                      {carDetailResponse.grossWeight_kg && (
                        <p>
                          Gross Weight: {carDetailResponse.grossWeight_kg} kg
                        </p>
                      )}
                      {carDetailResponse.payloadCapacity_kg && (
                        <p>
                          Payload Capacity:{" "}
                          {carDetailResponse.payloadCapacity_kg} kg
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Engine */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Engine
                    </h3>
                    <div className="space-y-1 text-sm">
                      <p>Engine Code: {carDetailResponse.engineCode}</p>
                      <p>Cylinders: {carDetailResponse.cylinders}</p>
                      <p>Max Power: {carDetailResponse.maxPower_hp} HP</p>
                      <p>Max Torque: {carDetailResponse.maxTorque_nm} Nm</p>
                      {carDetailResponse.compression_ratio && (
                        <p>
                          Compression Ratio:{" "}
                          {carDetailResponse.compression_ratio}:1
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Performance */}
                  {(carDetailResponse.topSpeed_kmh ||
                    carDetailResponse.acceleration_0_100_sec) && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">
                        Performance
                      </h3>
                      <div className="space-y-1 text-sm">
                        {carDetailResponse.topSpeed_kmh && (
                          <p>
                            Top Speed: {carDetailResponse.topSpeed_kmh} km/h
                          </p>
                        )}
                        {carDetailResponse.acceleration_0_100_sec && (
                          <p>
                            0-100 km/h:{" "}
                            {carDetailResponse.acceleration_0_100_sec} sec
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fuel Consumption */}
                  {(carDetailResponse.fuelConsumption_city_l100km ||
                    carDetailResponse.fuelConsumption_highway_l100km ||
                    carDetailResponse.fuelConsumption_combined_l100km) && (
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold text-sm text-gray-700 mb-2">
                        Fuel Consumption
                      </h3>
                      <div className="space-y-1 text-sm">
                        {carDetailResponse.fuelConsumption_city_l100km && (
                          <p>
                            City:{" "}
                            {carDetailResponse.fuelConsumption_city_l100km}{" "}
                            L/100km
                          </p>
                        )}
                        {carDetailResponse.fuelConsumption_highway_l100km && (
                          <p>
                            Highway:{" "}
                            {carDetailResponse.fuelConsumption_highway_l100km}{" "}
                            L/100km
                          </p>
                        )}
                        {carDetailResponse.fuelConsumption_combined_l100km && (
                          <p>
                            Combined:{" "}
                            {carDetailResponse.fuelConsumption_combined_l100km}{" "}
                            L/100km
                          </p>
                        )}
                        {carDetailResponse.fuelTankCapacity_l && (
                          <p>
                            Tank Capacity:{" "}
                            {carDetailResponse.fuelTankCapacity_l} L
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Safety & Features */}
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-gray-700 mb-2">
                      Safety & Features
                    </h3>
                    <div className="space-y-1 text-sm">
                      {carDetailResponse.safetyRating && (
                        <p>Safety Rating: {carDetailResponse.safetyRating}</p>
                      )}
                      {carDetailResponse.airbags && (
                        <p>Airbags: {carDetailResponse.airbags}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.abs
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          ABS
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.esp
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          ESP
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.airConditioning
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          Air Conditioning
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.sunRoof
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          Sun Roof
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.leatherSeats
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          Leather Seats
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.navigationSystem
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          Navigation System
                        </p>
                        <p className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              carDetailResponse.bluetoothConnectivity
                                ? "bg-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          Bluetooth
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state for detail */}
            {isLoadingDetail && carID && (
              <div className="mt-8">
                <p className="text-gray-500">
                  Loading technical specifications...
                </p>
              </div>
            )}

            {/* Error state for detail */}
            {isErrorDetail && carID && (
              <div className="mt-8">
                <p className="text-red-500">
                  Unable to load technical specifications
                </p>
              </div>
            )}
          </div>
          <div className=" w-[30%] gap-6 flex flex-col">
            <div className="border rounded-xl p-4 border-gray-300 shadow-md">
              <h2>Our Price</h2>
              {propsData.priceBuy !== propsData.priceRoot ? (
                <div>
                  <h3 className="font-sans text-sm xl:text-sm 2xl:text-[15px]">
                    <span className="line-through">${propsData.priceRoot}</span>
                    <span className="font-sans font-medium text-base ml-2">
                      ${propsData.priceBuy}
                    </span>
                  </h3>
                  <h3 className="text-gray-700 font-sans ">
                    Instant Saving: $
                    {Number(propsData.priceRoot.replaceAll(",", "")) -
                      Number(propsData.priceBuy.replaceAll(",", ""))}
                  </h3>
                </div>
              ) : (
                <h3 className="font-sans font-medium text-base my-1 ">
                  {" "}
                  ${propsData.priceBuy}
                </h3>
              )}
              <button
                onClick={() => handleMakeAnOffer()}
                className="text-white bg-blue-500 rounded-xl  gap-3 inline-flex items-center py-3 my-3 px-4 w-full justify-center hover:bg-blue-700 transition duration-300 active:scale-95"
              >
                <IoPricetagOutline className="" size={20} />
                Deposit
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
                44, Ngõ 84,Phố Chùa Láng
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
      </div>
    </div>
  );
};
export default React.memo(DetailsCar);

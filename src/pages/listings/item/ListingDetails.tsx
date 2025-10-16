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
import { FooterComponent } from "src/shared/components/footer";
import { Header } from "src/shared/components/header";
import { CarDetail } from "src/pages/home/item/typeData";

const DetailsCar = () => {
  const location = useLocation();
  const propsData = location.state?.subItem as CarDetail;
  return (
    <div className="w-full flex flex-col bg-[#050b2b] ">
      <Header />
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
            <div></div>
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
      <FooterComponent show={true} />
    </div>
  );
};
export default React.memo(DetailsCar);

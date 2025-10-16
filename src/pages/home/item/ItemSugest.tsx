import React from "react";
import { GoArrowUpRight } from "react-icons/go";
import { OptionSuggest, Suggest } from "./typeData";
import { IoPhonePortraitOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { useNavigate } from "react-router";

const DATA_SALE = [
  {
    nums: "836001000",
    script: "CARS FOR SALE",
    id: 0,
  },
  {
    nums: "738000250",
    script: "DEALER REVIEWS",
    id: 1,
  },
  {
    nums: "100001000",
    script: "VISITORS PER DAY",
    id: 2,
  },
  {
    nums: "238100200",
    script: "VERIFIED DEALERS",
    id: 3,
  },
];
// component mô tả tính năng web
export const SuggestChoice = ({
  data,
  title = "",
}: {
  data: Suggest[];
  title: string;
}) => {
  return (
    <div className="flex flex-col md:flex-row pr-[90px] pl-[90px] mt-4 mb-4 pt-16 pb-20 bg-[#f6fbfc]">
      <div className="w-full md:w-2/5  pr-4 mb-4 md:mb-0">
        <h2 className="md:w-[350px] hover:scale-110 duration-300  2xl:w-[400px] md:text-2xl 2xl:text-4xl font-serif font-bold  text-black p-4">
          {title} 
        </h2>
      </div>
      <div className="w-full md:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {data.map((item) => (
          <div key={item.id} className="flex flex-col hover:scale-105 active:scale-100 duration-500">
            <img
              src={item.icon}
              className="w-16 h-16"
              alt={`${item.id} icon`}
            />
            <h3 className={` text-xl font-sans text-black font-medium mt-4 mb-3`}>
              {item.title}
            </h3>
            <h3 className="text-base font-sans font-normal text-black">{item.script}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

// click component sẽ về đầu trang
export const ContentGoHome = () => {
  function formatNumber(propVal:string|number) {
    const value=Number(propVal);
    if (value>= 1_000_000_000) {
        // Đơn vị B (tỷ)
        return (value / 1_000_000_000).toFixed(2) + 'B';
    } else if (value >= 1_000_000) {
        // Đơn vị M (triệu)
        return (value / 1_000_000).toFixed(1) + 'M';
    } else if (value >= 1_000) {
        // Đơn vị K (nghìn)
        return (value / 1_000).toFixed(1) + 'K';
    } else {
        // Số nhỏ hơn 1,000
        return value.toString();
    }
}


  return (
    <div>
      <div className="flex flex-row w-full h-auto min-h-[380px]  aspect-[3/1] flex-1 mt-12">
        <div
          className={`flex flex-1 bg-center bg-cover `}
          style={{
            backgroundImage: `url(${require("src/assets/images/homepage/homepage_onl.png")})`,
          }}
        />
        <div className="py-[80px] pl-[80px] flex flex-col gap-8 flex-1 bg-[#291f2e] ">
          <h2
            className={`leading-normal text-[#FFF] font-sans font-bold md:text-3xl md:w-1/2   2xl:text-6xl 2xl:w-[60%] `}
          >
            Online,in-person, everywhere
          </h2>
          <h3 className="font-sans font-normal md:text-[14px] 2xl:text-xl text-[#FFF] max-w-[80%]">
            Choose from thousands of vehicles from multiple brands and buy
            online with Click & Drive, or visit us at one of our dealerships
            today.
          </h3>
          <button className="gap-2 rounded-xl border-x border-y border-[#FFF] p-4 flex flex-row justify-center items-center w-1/3" onClick={()=>window.scrollTo({ top: 0, behavior: 'smooth' })
}>
            <h2 className="text-xl font-bold text-[#FFF] hover:opacity-90 active:opacity-70 opacity-100 duration-500">
              Get Started
            </h2>
            <GoArrowUpRight size={24} color="#FFF" />
          </button>
        </div>
        {/*  số lương doanh thu bán hàng */}
      </div>
      <div className="flex flex-row justify-evenly w-full h-auto mt-12 mb-12">
        {DATA_SALE.map((item) => {
          return (
            <div className=" flex flex-col gap-4" key={item.id}>
              <h2 className="text-[#000] text-3xl font-sans font-bold">
                {formatNumber(item.nums)}
              </h2>
              <h3 className="font-sans font-normal text-[16px] leading-normal text-[#00]">
                {item.script}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// suggest choice sell or buy
export const SuggestChoiceOption = ({ data }: { data: OptionSuggest[] }) => {
  const navigate=useNavigate();
  return (
    <div className="w-[90%] h-auto flex flex-row gap-4 self-center mt-16 ">
      {data.map((item) => {
        return (
          <div
            className={`flex flex-1 flex-col pl-[80px] pr-[80px] ${
              Number(item.id) === 0 ? "bg-[#a7dcff]" : "bg-[#fdcaff]"
            } p-[80px] rounded-xl relative
            hover:drop-shadow-xl
          
          `}
          >
            <h2 className="text-2xl font-sans font-semibold text-[#000] max-w-[230px]">
              {item.title}
            </h2>
            <h3 className="font-sans font-normal text-[16px] mt-4 max-w-[400px] leading-6 ">
              {item.script}
            </h3>
            <button
              className={`rounded-lg ${
                Number(item.id) === 0 ? "bg-blue-800" : "bg-[#181818]"
              } min-h-16 w-[40%] gap-3 p-2 justify-center items-center mt-3 inline-flex opacity-100 hover:opacity-85 active:opacity-70 duration-300`}
              onClick={() =>{item.id===0?        window.scrollTo({ top: 0, behavior: 'smooth' }):navigate('/sellCar')
            }
            }
            >
              <h3 className="font-sans font-medium text-xl text-[#FFF] ">
                Get Started
              </h3>
              <GoArrowUpRight size={24} color="#FFF" />
            </button>
            <div
              className="w-[15%] h-auto aspect-[1] bg-contain bg-center right-[60px] flex absolute bottom-[50px]"
              style={{ backgroundImage: `url(${item.icon})` }}
            />
          </div>
        );
      })}
    </div>
  );
};
export const Question=()=>{
  return(
    <div className="inline-flex bg-[#f0fcff] w-full md:pt-12 md:pb-20   flex-1 px-[5%] items-center mt-20">
      <div className="flex w-1/2">      <div className="bg-center bg-cover rounded-2xl box-shadow self-end w-[90%]  h-auto aspect-[14/11]  " style={{backgroundImage:`url(${require('src/assets/images/homepage/more_question.png')})`}}/>
      </div>
      <div className="flex flex-col w-1/2 gap-6 ">
        <h2 className="font-sans font-bold text-2xl 2xl:text-4xl text-black w-[70%]">Have more questions? Don't hesitate to reach us</h2>
        <h3 className="font-sans font-normal md:text-sm 2xl:text-xl text-[#000] w-[40%]">123 Queensberry Street, North Melbourne VIC3051, Australia.</h3>
        <div className="inline-flex gap-6 ">
          <h2 className="border-2 rounded-3xl border-gray-500 py-2 px-8 justify-center items-center inline-flex cursor-pointer hover:underline duration-75 active:opacity-80 gap-2"><IoPhonePortraitOutline size={24} color="#000"/> +76 956 039 999</h2>
          <h2 className="py-2 px-8 items-center justify-center inline-flex gap-2 border-gray-500 cursor-pointer border-2 rounded-3xl duration-75 active:opacity-80 hover:underline"><CiMail color='#000' size={24}/> ali@boxcars.com</h2>
        </div>
        <div className="rounded-xl px-6 py-4 2xl:px-3 2xl:py-6 gap-2 items-center justify-center  cursor-pointer active:opacity-80 duration-300 hover:opacity-95 inline-flex bg-[#050b20] self-start  " onClick={()=>{        window.scrollTo({ top: 0, behavior: 'smooth' });
}}><h2 className=" text-base 2xl:text-2xl items-center justify-center flex text-[#fff]" >View Started</h2> <GoArrowUpRight size={24} color="#fff"/></div>
      </div>
    </div>
  );
}
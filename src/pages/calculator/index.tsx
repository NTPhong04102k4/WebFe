import React from "react";
import { GoArrowUpRight } from "react-icons/go";

const CalculatorFeatures = React.memo(() => {
  return (
    <div className="w-full flex flex-col bg-[#050b2b]">
      <div className="w-full bg-white  rounded-[35px]  flex items-center justify-center py-12">
        <div className="w-[85%] border border-gray-400 rounded-xl  justify-between flex flex-row  ">
          <div className="w-[65%] gap-2 flex  flex-col px-[2.5%] py-4 space-y-4 pl-8 mb-3">
            <h2 className="text-2xl  font-bold mt-3">Auto Loan Calculator</h2>
            <h3 className="text-sm">
              Use our loan calculator to calculate payments over the life of
              your loan. Enter your information to see how much your monthly
              payments could be. You can adjust length of loan, down payment and
              interest rate to see how those changes raise or lower your
              payments.
            </h3>
            <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
              <div className="rounded-xl border w-full border-gray-500 px-3 2xl:px-4 justify-center flex flex-col relative">
                <h3 className="  font-sans font-light text-gray-700 text-xs">{`Price($)`}</h3>
                <input
                  className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
                  type="text"
                  placeholder="Ali"
                />
              </div>
              <div className="rounded-xl border w-full border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
                <h3 className="  font-sans font-light text-gray-700 text-xs">
                  Interest Rate
                </h3>
                <input
                  className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
                  type="text"
                  placeholder="Phong"
                />
              </div>
            </div>
            <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
              <div className="rounded-xl border w-full border-gray-500 px-3 2xl:px-4 justify-center flex flex-col relative">
                <h3 className="  font-sans font-light text-gray-700 text-xs">
                  Loan Term (year)
                </h3>
                <input
                  className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
                  type="text"
                  placeholder="Ali"
                />
              </div>
              <div className="rounded-xl border w-full border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
                <h3 className="  font-sans font-light text-gray-700 text-xs">
                  Down Payment
                </h3>
                <input
                  className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
                  type="text"
                  placeholder="Phong"
                />
              </div>
            </div>
            <button className=" text-white text-base 2xl:text-xl font-sans font-semibold bg-blue-500 active:scale-95 hover:drop-shadow-sm transition duration-300 rounded-3xl items-center mt-2 inline-flex justify-center py-3 px-12 w-[100%] self-center">
              Calculator <GoArrowUpRight size={22} color="#fff" />
            </button>
          </div>
          <div className="bg-sky-50 w-[27%] flex pt-[80px] flex-col pl-7">
            <h2 className="text-black font-medium text-xl 2xl:text-2xl ">
              Monthly Payment
            </h2>
            <h3 className="mt-2 mb-3 text-blue-600 font-bold   inline-flex text-base 2xl:text-xl">
              $ {}0
            </h3>
            <h2 className="text-black font-medium text-xl 2xl:text-2xl">
              Total Interest
            </h2>
            <h3 className="mt-2 mb-3 text-blue-600 font-bold   inline-flex text-base 2xl:text-xl">
              $ {}0
            </h3>

            <h2 className="text-black font-medium text-xl 2xl:text-2xl">
              Total Payment
            </h2>
            <h3 className="mt-2 mb-3 text-blue-600 font-bold   inline-flex text-base 2xl:text-xl">
              $ {}0
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CalculatorFeatures;

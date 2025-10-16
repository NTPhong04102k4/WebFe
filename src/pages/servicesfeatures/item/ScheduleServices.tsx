import React from "react";
import { DATA_OPEN } from "../data";
export const ScheduleServices = React.memo(() => {
    return (
        <div className="w-full h-auto flex relative">
            <div className="w-[65%] h-auto flex relative flex-col bg-gray-100 p-6 rounded-3xl items-center mt-10 px-[5%]">
                <h2 className="text-black font-sans font-bold text-2xl 2xl:text-3xl self-start">Schedule Service</h2>
                <h3 className="mt-6 font-sans font-normal self-start w-[75%] text-sm 2xl:text-base text-black">Use our loan calculator to calculate payments over the life of your loan. Enter your information to
                    see how much your monthly payments could be. You can adjust length of loan, down payment and
                    interest rate to see how those changes raise or lower your payments.</h3>




                <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
                    <div className="rounded-xl border w-full border-gray-500 bg-white px-3 2xl:px-4 justify-center flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Name</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Ali" />
                    </div>
                    <div className="rounded-xl border w-full border-gray-500 bg-white px-3 py-[6px] 2xl:p-4 flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Email</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Phong" />
                    </div>

                </div>
                <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
                    <div className="rounded-xl border w-full bg-white border-gray-500 px-3 2xl:px-4 justify-center flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Phone</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Ali" />
                    </div>
                    <div className="rounded-xl border w-full bg-white border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Make Model</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Phong" />
                    </div>

                </div>
                <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
                    <div className="rounded-xl border w-full bg-white border-gray-500 px-3 2xl:px-4 justify-center flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Mileage (optional)</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Ali" />
                    </div>
                    <div className="rounded-xl border w-full bg-white border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
                        <h3 className="  font-sans font-light text-gray-700 text-xs">Best Time</h3>
                        <input className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal" type="text" placeholder="Phong" />
                    </div>

                </div>
                <button className="items-center justify-center flex w-full rounded-3xl py-3 mt-6 font-semibold bg-blue-500 text-white text-base 2xl:text-xl">Request a Service</button>
                <h3 className="w-full text-sm 2xl:text-base text-gray-950 mt-8">By submitting this form you will be scheduling a service appointment at no obligation and will be contacted within 48
                    hours by a service advisor.</h3>
            </div>

            <div className="flex flex-col cursor-pointer rounded-xl bg-gray-100 border-[0.5px] border-gray-300 py-3 px-5 drop-shadow-sm self-start mt-10 ml-16">
                <h3 className="text-black font-sans font-semibold text-xl 2xl:text-2xl self-center mb-3">Opening hours</h3>
                {
                    DATA_OPEN.map(item => {
                        return (
                            <div className="inline-flex justify-between mt-2 gap-6">
                                <h3 className="text-black font-sans font-normal text-base">{item.name}</h3>
                                <h3 className="text-black font-sans font-normal text-base">{item.rangeTime}</h3>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
})
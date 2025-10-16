import React from "react";
import { GoArrowUpRight } from "react-icons/go";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { MdOutlineEmail } from "react-icons/md";
import { DATA_OFFICES } from "./data";
export const AddressContact = React.memo(() => {
    return (
        <div className="flex flex-col px-[5%] mt-[100px] gap-8">
            <h2 className="text-black text-[22px] font-medium 2xl:text-3xl font-sans">Our Offices</h2>
            <div className="inline-flex gap-6 items-center justify-center">
                {DATA_OFFICES.map(item => {
                    return (
                        <div className="flex flex-col relative w-[33.33%]">
                            <h2 className="text-black font-medium font-sans text-lg 2xl:text-2xl">{item?.officeName}</h2>
                            <h3 className="text-black font-sans font-normal text-sm 2xl:text-lg  w-[68%] mt-2">{item?.address}</h3>
                            <h2 className="inline-flex gap-3 my-3 items-center font-medium cursor-pointer hover:underline active:opacity-60 2xl:text-lg ">See on Map <GoArrowUpRight size={20} color="#000" /></h2>
                            <div className="inline-flex gap-5">
                                <h2 className="text-gray-700 text-sm inline-flex gap-3 2xl:text-base"><MdOutlineEmail size={20} className="text-gray-700" /> {item?.email} </h2>
                                <h2 className="text-gray-700 text-sm inline-flex gap-3 2xl:text-base"><LiaPhoneVolumeSolid size={20} className="text-gray-500" /> {item?.phone}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
})
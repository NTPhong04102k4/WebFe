import React from "react";
import { GiPositionMarker } from "react-icons/gi";
import { LiaPhoneVolumeSolid } from "react-icons/lia";
import { MdOutlineEmail } from "react-icons/md";
import { Social } from "src/shared/components/footer/data";
export const FormContact = React.memo(({ data }: { data: Social[] }) => {
  return (
    <div className="inline-flex gap-9 2xl:gap-12 px-[5%] flex-1 mt-12 ">
      <div className="flex w-[55%] flex-col rounded-2xl  ">
        <h2 className="font-medium font-sans text-xl 2xl:text-2xl text-black mt-4">
          Get In Touch
        </h2>
        <h3 className="mt-4 text-sm 2xl:text-base text-gray-800 w-[85%]">
          Etiam pharetra egestas interdum blandit viverra morbi consequat mi non
          bibendum egestas quam egestas nulla.
        </h3>
        <div className="inline-flex gap-4 2xl:gap-6 w-full  justify-between mt-4">
          <div className="rounded-xl border w-full border-gray-500 px-3 2xl:px-4 justify-center flex flex-col relative">
            <h3 className="  font-sans font-light text-gray-700 text-xs">
              First Name*
            </h3>
            <input
              className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
              type="text"
              placeholder="Ali"
            />
          </div>
          <div className="rounded-xl border w-full border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
            <h3 className="  font-sans font-light text-gray-700 text-xs">
              Last Name*
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
              Email*
            </h3>
            <input
              className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
              type="text"
              placeholder="example@gmail.com"
            />
          </div>
          <div className="rounded-xl border w-full border-gray-500 px-3 py-[6px] 2xl:p-4 flex flex-col relative">
            <h3 className="  font-sans font-light text-gray-700 text-xs">
              Phone
            </h3>
            <input
              className="focus:outline-none  w-full text-black font-sans text-sm 2xl:text-base font-normal"
              type="text"
              placeholder="+90 123 456 789"
            />
          </div>
        </div>
        <div className="flex flex-col mt-4 border border-gray-500 rounded-2xl w-full  pt-2 pb-4  h-full relative">
          <h3 className="text-gray-500 font-sans text-sm font-normal px-4">
            Message
          </h3>
          <textarea
            className="w-full px-4 h-full  border border-gray-500 mt-2 text-black text-sm focus:outline-none resize-none outline-none border-none"
            placeholder="Type in here..."
            inputMode="text"
          />
          <h2 className="py-2 px-4 w-[25%] rounded-2xl items-center justify-center flex absolute bottom-[-50px] bg-blue-500 mt-2 self-start text-white text-sm 2xl:text-base">
            Send Message
          </h2>
        </div>
      </div>
      <div className="flex w-[45%] flex-col border border-gray-600 rounded-2xl pt-4 pb-16 pl-5  ">
        <h2 className="font-medium font-sans text-xl 2xl:text-2xl text-black">
          Contact details
        </h2>
        <h3 className="font-normal font-sans text-sm 2xl:text-base text-black mt-4 w-[95%]">
          Etiam pharetra egestas interdum blandit viverra morbi consequat mi non
          bibendum egestas quam egestas nulla.
        </h3>
        <div className="inline-flex gap-4 mt-4">
          <GiPositionMarker size={20} className="text-gray-600 mt-2 " />
          <div className="flex flex-col ">
            <h2 className="font-medium font-sans text-sm 2xl:text-lg text-black">
              Address
            </h2>
            <h3 className="font-normal font-sans text-sm 2xl:text-lg text-gray-800">
              123 Queensberry Street, North Melbourne VIC3051, Australia.
            </h3>
          </div>
        </div>
        <div className="inline-flex gap-4 mt-4">
          <MdOutlineEmail size={20} className="text-gray-600 mt-2 " />
          <div className="flex flex-col ">
            <h2 className="font-medium font-sans text-sm 2xl:text-lg text-black">
              Email
            </h2>
            <h3 className="font-normal font-sans text-sm 2xl:text-lg text-gray-800">
              ali@boxcars.com
            </h3>
          </div>
        </div>
        <div className="inline-flex gap-4 mt-4">
          <LiaPhoneVolumeSolid size={20} className="text-gray-600 mt-2 " />
          <div className="flex flex-col ">
            <h2 className="font-medium font-sans text-sm 2xl:text-lg text-black">
              Phone
            </h2>
            <h3 className="font-normal font-sans text-sm 2xl:text-lg text-gray-800">
              +76 956 123 456
            </h3>
          </div>
        </div>
        <h2 className={`text-black text-xl font-medium 2xl:text-4xl mt-6 `}>
          Follow Us
        </h2>
        <div className={`text-black inline-flex gap-6 md:mt-5 2xl:mt-8`}>
          {data.map((item) => {
            const IconType = item.icon;
            return (
              <IconType
                size={24}
                color="#000"
                className="hover:scale-125 duration-300 transition-all"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

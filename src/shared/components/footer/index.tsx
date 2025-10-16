import React from "react";

import { GoDotFill } from "react-icons/go";
import { DATA_FOOTER, DATA_SOCIAL, Theme } from "./data";


export const Footer = ({ theme }: { theme?: number }) => {
  const colorText=theme===Theme.LIGHT?'text-black':'text-white';
  return (
    <div className="flex flex-col">
    <div
      className={`${
        theme === Theme.LIGHT
          ? "bg-[#fff] "
          : "bg-[#050b2b] "
      } inline-flex w-full px-[5%] justify-between pt-[3%] pb-[5%]`}
    >
      {DATA_FOOTER.map((item) => {
        return (
          <div className="flex flex-col ">
            <h2 className={`${colorText} font-sans font-medium text-2xl 2xl:text-4xl  `}>
              {item.title}
            </h2>
            <div className="mt-[19px] flex flex-col gap-[12px] ">
              {item.data.map((feat) => {
                return (
                  <h2
                    className={`${colorText} text-sm 2xl:text-2xl 2xl:mt-4  font-sans font-normal `}
                    onClick={() => {}}
                  >
                    {feat.name}
                  </h2>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex gap-3 flex-col">
        <h2 className={`${colorText} font-sans font-medium  text-2xl 2xl:text-4xl `}>Sales Hours</h2>
        <h3 className={`${colorText} text-sm 2xl:text-2xl mt-[10px] 2xl:mt-4 font-sans font-normal`}>Monday - Friday: 09:00AM - 09:00 PM</h3>
        <h3 className={`${colorText} text-sm 2xl:text-2xl  font-sans font-normal`}>Saturday: 09:00AM - 07:00PM</h3>
        <h3 className={`${colorText} text-sm 2xl:text-2xl  font-sans font-normal`}>Sunday: Closed</h3>
        <h2 className={`${colorText} text-xl font-medium 2xl:text-4xl mt-4`}>Connect With Us</h2>
        <div className={`${colorText} inline-flex gap-6 md:mt-5 2xl:mt-8`}>
            {
                DATA_SOCIAL.map(item=>{
                  const IconType=item.icon
                    return(
                        <IconType size={36} color="#fff" className="hover:scale-125 transition duration-300 "/>
                    );
                })
            }
        </div>
      </div>

    </div>
    <hr className="text-gray-500 "/>
    <div className="inline-flex justify-between px-[5%] py-4 ">
      <h2 className={`${colorText} text-base  font-sans `} >© 2024 Boxcars.com. All rights reserved.</h2>
      <div className={`${colorText} inline-flex items-center justify-center gap-2 cursor-pointer hover:underline `}>
      <h2 className={`${colorText} text-base  font-sans font-normal `}>Terms & Conditions</h2>
      <GoDotFill size={16} className="text-gray-500"/>
      <h2 className={`${colorText} text-base  font-sans font-normal `}>Privacy Notice</h2>
      </div>
    </div>
    </div>
  );
};
export  const FooterComponent=({ theme,show=true }: { theme?: number,show?:boolean })=>{
  const colorText=theme===Theme.LIGHT?'text-black':'text-white';
  return(
    <div className="flex flex-col w-full">
      {show&& <div className="inline-flex items-center justify-between  px-[10%] w-full py-6">
        <div className="flex-col flex justify-center">
          <h2 className={`${colorText} text-base  font-sans font-medium `}>Join BoxCar</h2>
          <h3 className={`${colorText} text-sm  font-sans font-normal `}>Receive pricing updates, shopping tips & more!</h3>
        </div>
        <div className="inline-flex w-[33%]  rounded-2xl bg-[#2e376b] pl-4 pr-1 py-1"><input type={'email'} className={` ${theme===Theme.LIGHT?'text-black text-sm':'text-white text-sm'} flex flex-1 bg-transparent focus:outline-none active:outline-none `} placeholder="Your email address"/><h2 className={`${theme===Theme.LIGHT?'text-black':'text-white'} text-sm py-2 px-3 rounded-2xl bg-blue-500 self-end flex items-center justify-center`}>Sign Up</h2> </div>
      </div>}
      <hr className={`${theme===Theme.LIGHT?'text-gray-500':'#fff'}`}/>
    <div
      className={`${
        theme === Theme.LIGHT
          ? "bg-[#fff] "
          : "bg-[#050b2b] "
      } inline-flex w-full px-[10%] justify-between pt-[3%] pb-[5%]`}
    >
      {DATA_FOOTER.map((item) => {
        return (
          <div className="flex flex-col ">
            <h2 className={`${colorText} font-sans font-medium text-2xl 2xl:text-4xl  `}>
              {item.title}
            </h2>
            <div className="mt-[19px] flex flex-col gap-[12px] ">
              {item.data.map((feat) => {
                return (
                  <h2
                    className={`${colorText} text-sm 2xl:text-2xl 2xl:mt-4  font-sans font-normal `}
                    onClick={() => {}}
                  >
                    {feat.name}
                  </h2>
                );
              })}
            </div>
          </div>
        );
      })}
     
      <div className="flex gap-3 flex-col">
        <h2 className={`${colorText} font-sans font-medium  text-2xl 2xl:text-4xl `}>Our Mobile App</h2>
        
        <h2 className={`${colorText} text-xl font-medium 2xl:text-4xl mt-4`}>Connect With Us</h2>
        <div className={`${colorText} inline-flex gap-6 md:mt-5 2xl:mt-8`}>
            {
                DATA_SOCIAL.map(item=>{
                  const IconType=item.icon;
              
                      return <IconType size={36} color="#fff" className="hover:scale-125 duration-300 transition-all"/>
                    
                })
            }
        </div>
      </div>

    </div>
    <hr className="text-gray-500 "/>
    <div className="inline-flex justify-between px-[10%] py-4 ">
      <h2 className={`${colorText} text-base  font-sans `} >© 2024 Boxcars.com. All rights reserved.</h2>
      <div className={`${colorText} inline-flex items-center justify-center gap-2 cursor-pointer hover:underline `}>
      <h2 className={`${colorText} text-base  font-sans font-normal `}>Terms & Conditions</h2>
      <GoDotFill size={16} className={`${theme===Theme.LIGHT?"text-gray-500":'#fff'}`}/>
      <h2 className={`${colorText} text-base  font-sans font-normal `}>Privacy Notice</h2>
      </div>
    </div>
    </div>
  );
}


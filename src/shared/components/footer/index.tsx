import React from "react";

import { GoDotFill } from "react-icons/go";
import { DATA_FOOTER, DATA_SOCIAL, Theme } from "./data";

export const Footer = ({ theme }: { theme?: number }) => {
  const colorText = theme === Theme.LIGHT ? "text-black" : "text-white";
  return (
    <div className="flex flex-col w-full max-w-full overflow-x-hidden box-border">
      <div
        className={`${
          theme === Theme.LIGHT ? "bg-[#fff] " : "bg-[#050b2b] "
        } flex flex-col sm:flex-row sm:flex-wrap lg:inline-flex w-full max-w-full px-4 sm:px-6 md:px-[5%] justify-between pt-6 sm:pt-[3%] pb-6 sm:pb-[5%] gap-6 sm:gap-4 lg:gap-0 box-border overflow-x-hidden`}
      >
        {DATA_FOOTER.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col w-full sm:w-[45%] md:w-[30%] lg:w-auto"
            >
              <h2
                className={`${colorText} font-sans font-medium text-lg sm:text-xl md:text-2xl 2xl:text-4xl`}
              >
                {item.title}
              </h2>
              <div className="mt-3 sm:mt-[19px] flex flex-col gap-2 sm:gap-[12px]">
                {item.data.map((feat) => {
                  return (
                    <h2
                      key={feat.id}
                      className={`${colorText} text-xs sm:text-sm 2xl:text-2xl 2xl:mt-4 font-sans font-normal cursor-pointer hover:opacity-80 transition-opacity`}
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
        <div className="flex gap-3 flex-col w-full sm:w-[45%] md:w-[30%] lg:w-auto">
          <h2
            className={`${colorText} font-sans font-medium text-lg sm:text-xl md:text-2xl 2xl:text-4xl`}
          >
            Sales Hours
          </h2>
          <h3
            className={`${colorText} text-xs sm:text-sm 2xl:text-2xl mt-2 sm:mt-[10px] 2xl:mt-4 font-sans font-normal`}
          >
            Monday - Friday: 09:00AM - 09:00 PM
          </h3>
          <h3
            className={`${colorText} text-xs sm:text-sm 2xl:text-2xl font-sans font-normal`}
          >
            Saturday: 09:00AM - 07:00PM
          </h3>
          <h3
            className={`${colorText} text-xs sm:text-sm 2xl:text-2xl font-sans font-normal`}
          >
            Sunday: Closed
          </h3>
          <h2
            className={`${colorText} text-base sm:text-lg md:text-xl font-medium 2xl:text-4xl mt-2 sm:mt-4`}
          >
            Connect With Us
          </h2>
          <div
            className={`${colorText} inline-flex gap-4 sm:gap-6 md:mt-5 2xl:mt-8`}
          >
            {DATA_SOCIAL.map((item) => {
              const IconType = item.icon;
              return (
                <IconType
                  key={item.id}
                  size={28}
                  className="sm:w-9 sm:h-9 md:w-[36px] md:h-[36px] hover:scale-125 transition duration-300 cursor-pointer"
                  color={theme === Theme.LIGHT ? "#000" : "#fff"}
                />
              );
            })}
          </div>
        </div>
      </div>
      <hr className="text-gray-500" />
      <div className="flex flex-col sm:flex-row sm:justify-between px-4 sm:px-6 md:px-[5%] py-4 gap-3 sm:gap-0 w-full max-w-full box-border overflow-x-hidden">
        <h2
          className={`${colorText} text-xs sm:text-sm md:text-base font-sans text-center sm:text-left`}
        >
          © 2024 Boxcars.com. All rights reserved.
        </h2>
        <div
          className={`${colorText} flex sm:inline-flex items-center justify-center gap-2 cursor-pointer hover:underline`}
        >
          <h2
            className={`${colorText} text-xs sm:text-sm md:text-base font-sans font-normal`}
          >
            Terms & Conditions
          </h2>
          <GoDotFill
            size={12}
            className={`${
              theme === Theme.LIGHT ? "text-gray-500" : "text-gray-400"
            } sm:w-4 sm:h-4`}
          />
          <h2
            className={`${colorText} text-xs sm:text-sm md:text-base font-sans font-normal`}
          >
            Privacy Notice
          </h2>
        </div>
      </div>
    </div>
  );
};
export const FooterComponent = ({
  theme,
  show = true,
}: {
  theme?: number;
  show?: boolean;
}) => {
  const colorText = theme === Theme.LIGHT ? "text-black" : "text-white";
  return (
    <div
      className={`flex flex-col w-full max-w-full overflow-x-hidden box-border ${
        theme === Theme.LIGHT ? "bg-[#fff]" : "bg-[#050b2b]"
      }`}
    >
      {show && (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-4 sm:px-6 md:px-[5%] lg:px-[10%] w-full max-w-full py-4 md:py-6 gap-4 md:gap-0 box-border overflow-x-hidden">
          <div className="flex-col flex justify-center">
            <h2
              className={`${colorText} text-base md:text-lg font-sans font-medium `}
            >
              Join BoxCar
            </h2>
            <h3
              className={`${colorText} text-xs sm:text-sm font-sans font-normal `}
            >
              Receive pricing updates, shopping tips & more!
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:min-w-[280px] md:w-[33%] rounded-2xl bg-[#2e376b] pl-4 pr-1 py-1 gap-2 sm:gap-0">
            <input
              type={"email"}
              className={`${
                theme === Theme.LIGHT
                  ? "text-black text-sm"
                  : "text-white text-sm"
              } flex flex-1 bg-transparent focus:outline-none active:outline-none placeholder:text-gray-400`}
              placeholder="Your email address"
            />
            <h2
              className={`${
                theme === Theme.LIGHT ? "text-black" : "text-white"
              } text-xs sm:text-sm py-2 px-3 sm:px-4 rounded-2xl bg-blue-500 self-end sm:self-auto flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors`}
            >
              Sign Up
            </h2>
          </div>
        </div>
      )}
      <hr
        className={`${
          theme === Theme.LIGHT ? "text-gray-500" : "text-gray-600"
        }`}
      />
      <div
        className={`${
          theme === Theme.LIGHT ? "bg-[#fff] " : "bg-[#050b2b] "
        } flex flex-col sm:flex-row sm:flex-wrap lg:inline-flex w-full max-w-full px-4 sm:px-6 md:px-[5%] lg:px-[10%] justify-between pt-6 sm:pt-[3%] pb-6 sm:pb-[5%] gap-6 sm:gap-4 lg:gap-0 box-border overflow-x-hidden`}
      >
        {DATA_FOOTER.map((item) => {
          return (
            <div
              key={item.id}
              className="flex flex-col w-full sm:w-[45%] md:w-[30%] lg:w-auto"
            >
              <h2
                className={`${colorText} font-sans font-medium text-lg sm:text-xl md:text-2xl 2xl:text-4xl`}
              >
                {item.title}
              </h2>
              <div className="mt-3 sm:mt-[19px] flex flex-col gap-2 sm:gap-[12px]">
                {item.data.map((feat) => {
                  return (
                    <h2
                      key={feat.id}
                      className={`${colorText} text-xs sm:text-sm 2xl:text-2xl 2xl:mt-4 font-sans font-normal cursor-pointer hover:opacity-80 transition-opacity`}
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

        <div className="flex gap-3 flex-col w-full sm:w-[45%] md:w-[30%] lg:w-auto">
          <h2
            className={`${colorText} font-sans font-medium text-lg sm:text-xl md:text-2xl 2xl:text-4xl`}
          >
            Our Mobile App
          </h2>

          <h2
            className={`${colorText} text-base sm:text-lg md:text-xl font-medium 2xl:text-4xl mt-2 sm:mt-4`}
          >
            Connect With Us
          </h2>
          <div
            className={`${colorText} inline-flex gap-4 sm:gap-6 md:mt-5 2xl:mt-8`}
          >
            {DATA_SOCIAL.map((item) => {
              const IconType = item.icon;

              return (
                <IconType
                  key={item.id}
                  size={28}
                  className="sm:w-9 sm:h-9 md:w-[36px] md:h-[36px] hover:scale-125 duration-300 transition-all cursor-pointer"
                  color={theme === Theme.LIGHT ? "#000" : "#fff"}
                />
              );
            })}
          </div>
        </div>
      </div>
      <hr className="text-gray-500" />
      <div className="flex flex-col sm:flex-row sm:justify-between px-4 sm:px-6 md:px-[5%] lg:px-[10%] py-4 gap-3 sm:gap-0 w-full max-w-full box-border overflow-x-hidden">
        <h2
          className={`${colorText} text-xs sm:text-sm md:text-base font-sans text-center sm:text-left`}
        >
          © 2024 Boxcars.com. All rights reserved.
        </h2>
        <div
          className={`${colorText} flex sm:inline-flex items-center justify-center gap-2 cursor-pointer hover:underline`}
        >
          <h2
            className={`${colorText} text-xs sm:text-sm md:text-base font-sans font-normal`}
          >
            Terms & Conditions
          </h2>
          <GoDotFill
            size={12}
            className={`${
              theme === Theme.LIGHT ? "text-gray-500" : "text-gray-400"
            } sm:w-4 sm:h-4`}
          />
          <h2
            className={`${colorText} text-xs sm:text-sm md:text-base font-sans font-normal`}
          >
            Privacy Notice
          </h2>
        </div>
      </div>
    </div>
  );
};

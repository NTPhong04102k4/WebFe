import React from "react";
import styled from "styled-components";
import { Brand, CarDetail } from "./typeData";
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from "react-router";

export const ListBrand = ({
  data,
  title,
  detail = false,
  carsData = [],
}: {
  data: Brand[];
  title: string;
  detail?: boolean;
  carsData?: CarDetail[];
}) => {
  const navigate = useNavigate();
  const handleBody = (obj: {
    name: string;
    id: string | number;
    img: string;
  }) => {
    const dataProps = carsData.filter((c: CarDetail) => c.body === obj.name);
    navigate("/listings/body", { state: { subItem: dataProps } });
  };
  const DATA = data;
  if (detail === false) {
    return (
      <>
        <h2 className="text-4xl font-semibold font-sans text-center mt-16">
          {title}
        </h2>
        <div className="flex flex-row flex-wrap items-center justify-center gap-2 mt-16 pr-[45px] pl-[45px] ">
          {DATA.map((item, index) => {
            return (
              <div
                onClick={() => handleBody(item)}
                className="flex flex-col gap-2 hover:scale-105 active:scale-90 duration-500 flex-1"
                key={item.id}
              >
                <ItemCarBrand srcImage={item.img} />
                <h3 className="text-xl text-[#000] text-center font-serif font-medium">
                  {item.name}
                </h3>
              </div>
            );
          })}
        </div>
      </>
    );
  } else
    return (
      <>
        <div className=" w-[90%] inline-flex self-center justify-between ">
          <h2 className="text-3xl 2xl:4xl font-semibold font-sans self-center  mt-16 ">
            {title}
          </h2>
          <div className="inline-flex gap-2  items-end">
            <h2 className="text-base font-sans font-normal text-[#000] cursor-pointer hover:underline active:opacity-70  ">
              Show All Brands
            </h2>
            <GoArrowUpRight
              size={24}
              color="#000"
              className="cursor-pointer active:opacity-70"
            />
          </div>
        </div>

        <div className="inline-flex  flex-shrink-0 items-center justify-center gap-2 mt-8 w-[90%] self-center overflow-hidden">
          {DATA.map((item, index) => {
            if (index < 6) {
              return (
                <div
                  className="flex flex-col p-4 border-[0.5px] rounded-lg border-gray-200 "
                  style={{ width: `calc(16.7% - 8px` }}
                  key={item.id}
                >
                  <div
                    className="w-1/2 self-center h-auto aspect-square bg-center bg-cover "
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                  <h3 className="text-base 2xl:text-xl text-[#000] text-center font-serif font-medium">
                    {item.name}
                  </h3>
                </div>
              );
            } else return null;
          })}
        </div>
      </>
    );
};

const ItemCarBrand = styled.div<{ srcImage: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: ${({ srcImage }) =>
    `url(${srcImage || "src/assets/images/homepage/cars.png"})`};
  background-size: cover;
  background-position: center;
  aspect-ratio: 2/1;
  flex: 1;
`;

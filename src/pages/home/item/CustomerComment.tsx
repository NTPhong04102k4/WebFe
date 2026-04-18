import React, { useEffect, useState } from "react";
import { IoStarHalfOutline } from "react-icons/io5";
import { IoStar } from "react-icons/io5";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { GoCheckCircleFill } from "react-icons/go";

export enum TrustPilot {
  GREAT = 5,
  GOOD = 4,
  NORMAL = 3,
  NOTSATISFIED = 2,
  BAD = 1,
}
export type ReviewCustomer = {
  numStar: 1 | 2 | 3 | 4 | 5 | null;
  id: number | string;
  comment: string;
  img: string;
  job: string;
  name: string;
  totalPriceBuy: string | number | 0;
};
export const DATA_REVIEWS: ReviewCustomer[] = [
  {
    numStar: 5,
    id: 0,
    comment:
      "I'd recommend Phoenix Auto to anyone seeking quality service. The staff, especially Sarah, provided exceptional assistance throughout my visit.",
    img: require("src/assets/images/homepage/customer/mr_bee.png"),
    job: "Teacher",
    name: "Mr.Bee",
    totalPriceBuy: 25000,
  },
  {
    numStar: 4,
    id: 1,
    comment:
      "Great experience at Sunrise Motors. The team was professional and thorough. Only missed 5 stars due to a slight delay in paperwork.",
    img: require("src/assets/images/homepage/customer/christopher.jpg"),
    job: "Software Developer",
    name: "Christopher ",
    totalPriceBuy: 30000,
  },
  {
    numStar: 3,
    id: 2,
    comment:
      "Excellent service at GreenLeaf Auto. Mark and his team went above and beyond to ensure I got the perfect car for my needs. Highly satisfied!",
    img: require("src/assets/images/homepage/customer/jessica.jpg"),
    job: "Nurse",
    name: "Jessica",
    totalPriceBuy: 50000,
  },
  {
    numStar: 5,
    id: 3,
    comment:
      "Decent experience at CityRide Autos. The car selection was good, but I felt the sales approach was a bit pushy. Room for improvement in customer service.",
    img: require("src/assets/images/homepage/customer/Jennifer.png"),
    job: "Accountant",
    name: "Jennifer",
    totalPriceBuy: 120000,
  },
  {
    numStar: 5,
    id: 4,
    comment:
      "I'm thoroughly impressed with EcoAuto's service. Their commitment to eco-friendly options and knowledgeable staff made my purchase a breeze. Highly recommend!",
    img: require("src/assets/images/homepage/customer/matthew.jpg"),
    job: "Environmental Scientist",
    name: "Matthew",
    totalPriceBuy: 300000,
  },
];
export const CustomerComment = ({ data }: { data: ReviewCustomer[] }) => {
  const [resultReviewCustomer, setResultReviewCustomer] = useState<{
    totalStars: number;
    numReview: number;
  }>({ totalStars: 0, numReview: 0 });
  const [statusReview, setStatusReview] = useState<number>(0);
  const calReviewCustomers = (data: ReviewCustomer[]) => {
    const totalReview = data.reduce(
      (acc, item) => {
        if (item.numStar === null || item.numStar === undefined) {
          return acc;
        }

        acc.totalStars += item.numStar;
        acc.numReview++;
        return acc;
      },
      { totalStars: 0, numReview: 0 },
    );
    return totalReview;
  };
  const fnCheckStatusTrustpilot = (val: number) => {
    switch (true) {
      case val > 1 && val < 2: {
        return TrustPilot.BAD;
      }
      case val > 2 && val < 3:
        return TrustPilot.NOTSATISFIED;
      case val > 3 && val < 4:
        return TrustPilot.NORMAL;
      case val > 4 && val < 5:
        return TrustPilot.GOOD;
      case val === 5:
        return TrustPilot.GREAT;
      default:
        return;
    }
  };
  const fnConvertTrustpilotToText = (val: number) => {
    if (!val) return;
    switch (val) {
      case TrustPilot.BAD: {
        return "Bad";
      }
      case TrustPilot.NOTSATISFIED: {
        return "UnSatisfied";
      }
      case TrustPilot.NORMAL: {
        return "Normal";
      }
      case TrustPilot.GOOD: {
        return "Good";
      }
      case TrustPilot.GREAT: {
        return "Great";
      }
      default:
        return NaN;
    }
  };
  // Effect to handle status review based on resultReviewCustomer
  useEffect(() => {
    const statusReviewNow = fnCheckStatusTrustpilot(
      resultReviewCustomer.totalStars / resultReviewCustomer.numReview,
    );
    setStatusReview(statusReviewNow ?? 0);
  }, [resultReviewCustomer]); // Only depends on resultReviewCustomer

  // Effect to calculate and set resultReviewCustomer based on data
  useEffect(() => {
    const val = calReviewCustomers(data);
    setResultReviewCustomer(val);
  }, [data]); // Only depends on data

  const resAverage =
    resultReviewCustomer.totalStars / resultReviewCustomer.numReview;
  function StarRating({ rating }: { rating: number }) {
    const validRating = Math.min(Math.max(rating, 1), 5);
    const fullStars = Math.floor(validRating);
    const hasHalfStar = validRating % 1 >= 0.4;

    return (
      <div className="flex gap-[2px]">
        {[...Array(5)].map((_, index) => (
          <span>
            {index < fullStars ? (
              <div className="  bg-[#1f791f] " style={{ padding: "2px" }}>
                <IoStar
                  className="text-yellow-400"
                  size={24}
                  fill="currentColor"
                  style={{ position: "relative" }}
                />
              </div>
            ) : index === fullStars && hasHalfStar ? (
              <div className="  bg-[#1f791f] " style={{ padding: "2px" }}>
                <IoStarHalfOutline
                  className="text-yellow-400"
                  size={24}
                  fill="currentColor"
                />
              </div>
            ) : (
              <div className="  bg-[#717271] " style={{ padding: "2px" }}>
                {" "}
                <IoStar color="#FFF" size={24} />
              </div>
            )}
          </span>
        ))}
      </div>
    );
  }
  const [idSelect, setIdSelect] = useState(0);
  return (
    <div className="flex flex-row w-full  bg-[#f0fcff] 2xl:pb-[150px]  md:pb-[90px] md:pt-[30px] mt-24">
      <div className="flex flex-col w-2/5 2xl:pt-[100px] md:pt-[50px] md:pl-[90px] 2xl:pl-[120px]">
        <h2 className="md:text-3xl 2xl:text-4xl font-bold text-[#000] max-w-[250px] font-sans">
          What Our Customers Say
        </h2>
        <h3 className="2xl:mt-12 md:mt-8 font-sans font-semibold bg-transparent text-[#000] text-2xl 2xl:text-4xl mb-4">
          {fnConvertTrustpilotToText(statusReview)}{" "}
        </h3>

        <StarRating rating={resAverage} />
        <h2 className="text-base 2xl:text-lg font-normal text-[#000] mt-3 mb-4">
          Based on {resultReviewCustomer.numReview} reviews
        </h2>
        <div className="inline-flex gap-2">
          <IoStar className="text-green-600 " size={24} />
          <h2 className="text-base font-bold text-[#000]">Trustpilot</h2>
        </div>
      </div>
      <div className="flex flex-col w-3/5">
        <div className="inline-flex gap-4 self-end mt-6 mr-6   2xl:mt-10 2xl:mr-10 ">
          <button className="justify-center items-center py-2 px-5 rounded-2xl border-x border-y border-[#000]">
            <SlArrowLeft size={16} color="#000" />
          </button>
          <button className="justify-center items-center px-5 py-2 rounded-2xl border-x border-y border-[#000]">
            <SlArrowRight size={16} color="#000" />
          </button>
        </div>

        <div className="flex-col flex gap-6 w-full ">
          {idSelect === data[idSelect].id && (
            <div className="flex-col flex ">
              <div className="inline-flex gap-4 items-center">
                <StarRating rating={data[idSelect].numStar ?? 0} />
                <GoCheckCircleFill
                  size={14}
                  color={`${Number(data[idSelect].totalPriceBuy) > 30000 ? "#038303" : "#beb4b4b7"}`}
                />
                <h3
                  className={`font-base font-sans text-[#000] font-semibold  2xl:text-2xl`}
                >
                  Verified
                </h3>
              </div>
              <h2 className="font-sans font-medium text-2xl 2xl:text-4xl md:mt-3 2xl:mt-4  ">
                {data[idSelect].name}
              </h2>
              <h3 className=" font-sans font-normal text-sm 2xl:text-xl leading-normal">
                {data[idSelect].job}
              </h3>
              <h3 className="w-[80%] mt-6 mb-6 text-xl 2xl:text-2xl font-semibold">
                {data[idSelect].comment}
              </h3>
            </div>
          )}
          <div className=" w-full inline-flex gap-2 md:mt-4 2xl:mt-7">
            {" "}
            {data.map((item, idx) => {
              return (
                <div
                  className={`w-1/12  ${idSelect === item.id ? "opacity-100 border-blue-500 border-2 " : "border-gray-300 opacity-30"}   cursor-pointer  border  rounded-full   h-auto aspect-square bg-center bg-cover`}
                  style={{ backgroundImage: `url(${item.img})` }}
                  onClick={() => {
                    setIdSelect(Number(item.id));
                  }}
                />
              );
            })}{" "}
          </div>
        </div>
      </div>
    </div>
  );
};

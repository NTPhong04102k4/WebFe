import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";

import { ListBrand } from "../home/item/ListBrand";
import { DATA_BRAND, DATA_SUGGEST } from "../home/item/data";
import ContentGoHome from "./item/ContentGoHome";
import { GoArrowUpRight } from "react-icons/go";
import { DATA_TEAM } from "./item/data";
import {
  DATA_REVIEWS,
  ReviewCustomer,
  TrustPilot,
} from "../home/item/CustomerComment";
import { QuestionFrequently } from "./item/QuestionFrequently";
import { ContentReview } from "./item/ContentReview";
import { ImageIntroduce } from "./item/ImageIntroduce";
import { ReviewAboutUs } from "./item/ReviewAboutUs";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
export const About = React.memo(() => {
  const [resultReviewCustomer, setResultReviewCustomer] = useState({
    totalStars: 0,
    numReview: 0,
  });
  const [, setStatusReview] = useState(0);
  const numsReview = DATA_REVIEWS.length;
  const calReviewCustomers = useCallback((data: ReviewCustomer[]) => {
    return data.reduce(
      (acc, item) => {
        if (item.numStar === null || item.numStar === undefined) {
          return acc;
        }
        acc.totalStars += item.numStar;
        acc.numReview++;
        return acc;
      },
      { totalStars: 0, numReview: 0 }
    );
  }, []);

  const fnCheckStatusTrustpilot = useCallback((val: number) => {
    switch (true) {
      case val > 1 && val < 2:
        return TrustPilot.BAD;
      case val > 2 && val < 3:
        return TrustPilot.NOTSATISFIED;
      case val > 3 && val < 4:
        return TrustPilot.NORMAL;
      case val > 4 && val < 5:
        return TrustPilot.GOOD;
      case val === 5:
        return TrustPilot.GREAT;
      default:
        return 0;
    }
  }, []);

  useEffect(() => {
    const val = calReviewCustomers(DATA_REVIEWS);
    const statusReviewNow = fnCheckStatusTrustpilot(
      val.totalStars / (val.numReview || 1)
    ); // Avoid division by zero
    setStatusReview(statusReviewNow);
    setResultReviewCustomer(val);
  }, [calReviewCustomers, fnCheckStatusTrustpilot]);
  const resAverage = useMemo(() => {
    return resultReviewCustomer.numReview
      ? resultReviewCustomer.totalStars / resultReviewCustomer.numReview
      : 0;
  }, [resultReviewCustomer]);
  return (
    <Container className="bg-[#050b2b]">
      <Header />
      <div className="rounded-b-[45px] flex flex-col relative bg-white pb-[45px] px-[5%]">
        <h2 className="text-xl pl-[5%] font-normal font-sans text-black mt-8  ">
          {" "}
          <span className="text-blue-500 ">Home</span>/ Contact Us
        </h2>
        <h2 className="text-2xl pl-[5%] font-sans font-bold mb-10">About Us</h2>
        <ContentReview />
        <ImageIntroduce />
        <div className="flex flex-col relative w-full px-[5%] mt-12">
          <h2 className="font-medium font-sans text-black text-xl 2xl:text-2xl ">
            Why Choose Us
          </h2>
          <div className="inline-flex gap-2 ">
            {DATA_SUGGEST.map((item) => {
              return (
                <div key={item.id} className="flex flex-col mt-6">
                  <img
                    src={item.icon}
                    style={{
                      color: "red",
                      accentColor: "red",
                      caretColor: "red",
                      colorScheme: "red",
                    }}
                    className="w-16 h-16 "
                    alt={`${item.id} icon`}
                  />
                  <h3 className={` text-xl font-serif text-black mt-4 mb-3`}>
                    {item.title}
                  </h3>
                  <h4 className="text-xs font-sans text-gray-900">
                    {item.script}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
        <ContentGoHome />
        <ListBrand
          title="Explore Our Premium Brands"
          data={DATA_BRAND}
          detail={true}
        />
        <ReviewAboutUs
          data={DATA_TEAM}
          numsReview={numsReview}
          resAverage={resAverage}
        />
        <div className="flex-col flex gap-6 px-[5%] mt-12 w-full relative">
          <div className=" inline-flex justify-between w-full  ">
            <h2 className="font-sans text-black 2xl:text-3xl text-2xl font-medium">
              Our Team
            </h2>
            <h2 className="inline-flex  items-center hover:underline active:opacity-65 gap-3 text-base 2xl:text-xl">
              View All <GoArrowUpRight size={20} color="#000" className="" />
            </h2>
          </div>
          <div className="inline-flex gap-2 relative w-full flex-shrink-0 ">
            {DATA_TEAM.map((item) => {
              return (
                <div className="flex flex-col w-1/4" key={item.id}>
                  <div
                    className="rounded-md bg-center  bg-cover flex  hover:drop-shadow-sm  h-auto aspect-[3/4] "
                    style={{ backgroundImage: `url(${item.img})` }}
                  />
                  <h2 className="font-medium text-base mt-3 2xl:text-xl pl-[5%] text-black ">
                    {item.name}
                  </h2>
                  <h3 className="font-normal text-sm 2xl:text-lg text-gray-900 font-sans pl-[5%]">
                    {item.job}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        <QuestionFrequently />
      </div>
      <FooterComponent show={true} />
    </Container>
  );
});
export default About;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
`;

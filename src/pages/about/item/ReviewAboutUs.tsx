import React, { useCallback, useMemo, useState } from "react";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import styled from "styled-components";
import { Person } from "./data";
export const ReviewAboutUs=React.memo(({data,resAverage,numsReview}:{data:Person[],resAverage:number,numsReview:number})=>{
      const [currentIndex, setCurrentIndex] = useState(0);
      const itemsPerPage = 3;
    
      const currentItems = useMemo(() => {
        return data.slice(currentIndex, currentIndex + itemsPerPage);
      }, [currentIndex, data]);
    
      const handleNext = useCallback(() => {
        if (currentIndex + itemsPerPage < data.length) {
          setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
        }
      }, [currentIndex,data]);
    
      const handlePrev = useCallback(() => {
        if (currentIndex - itemsPerPage >= 0) {
          setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
        }
      }, [currentIndex]);
    return(
        <div className="flex flex-col relative w-full rounded-xl bg-sky-100 pt-8 pb-9 gap-4 mt-16">
        <div className="inline-flex justify-between w-full px-[7%]">
          <h2 className="font-semibold font-sans text-2xl 2xl:text-3xl text-black">What our customers say</h2>
          <h3 className="text-sm 2xl:text-base text-gray-900 font-sans font-normal">{`Rated ${resAverage} / 5 based on ${numsReview - 1} reviews Showing our 4 & 5 star reviews`}</h3>
        </div>
        <div className="flex items-center justify-between w-[90%] self-center ">
         
          <div className="flex flex-nowrap gap-4 p-4 overflow-hidden">
            {
              currentItems.map((obj) => (
                <div 
                  className="flex flex-col p-4 border-[0.5px] rounded-lg border-gray-200 box- bg-white hover:drop-shadow-md shadow-lg duration-500  cursor-pointer active:placeholder-opacity-90 active:scale-90 " 
                  style={{ width: 'calc(33.33% - 16px)' }} 
                  key={obj.id}
                >
                  <h2 className="inline-flex justify-between w-full items-center font-medium text-base 2xl:text-xl">
                    {obj.job} 
                    <img src={require('src/assets/icon/icon_team.png')} alt="icon_team" className="w-4 h-4"/>
                  </h2>
                  <h3 className="font-normal font-sans text-sm h-[120px] 2xl:text-base text-black  self-center flex mt-4 mb-6 ">{obj.script}</h3>
                  <div className="inline-flex gap-6 items-center ">
                    <div 
                      style={{ backgroundImage: `url(${obj.img})` }} 
                      className="bg-cover bg-center h-auto aspect-[1/1]  w-[15%] rounded-full"
                    />
                    <div className="">
                      <h3 className="font-bold">{obj.name}</h3>
                      <h3 className="text-gray-500 text-sm 2xl:text-base font-sans font-normal">{obj.job}</h3>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
      
        </div>
        <div className="inline-flex gap-6 items-center justify-center self-start  pl-[7%]">
            <ButtonIcon onClick={()=>handlePrev()}>
              <SlArrowLeft size={20} color="#000" />
            </ButtonIcon>
            <ButtonIcon onClick={()=>handleNext()}>
              <SlArrowRight size={20} color="#000" />
            </ButtonIcon>
            </div>
      </div>
    );
})
const ButtonIcon = styled.button`
border-radius: 25px;
padding: 5px 10px 5px 10px;
width: 60px;
height: 40px;
justify-content: center;
align-items: center;
display: flex;
background-color: #fff;
border-width:0.5px ;
border-color: #5e5959;
transition: all 0.5s ease-in;
&:hover{
  scale: 1.05;
  opacity: 0.85;
}
&:active{
  opacity: 0.5;
  box-shadow: 1px 1px 1px  1px #000;
}
`;
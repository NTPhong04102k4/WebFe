import React, { useState, useEffect, useCallback, useMemo } from "react";
import { CiBookmark } from "react-icons/ci";
import { SiSpeedtest } from "react-icons/si";
import { LiaGasPumpSolid } from "react-icons/lia";
import { TbManualGearbox } from "react-icons/tb";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { GoArrowUpRight } from "react-icons/go";
import { CarDetail } from "./typeData";
import { useNavigate } from "react-router";

enum StatusCar {
  GREAT_PRICE = 'Great Price',
  SALE = "Sale",
  NONE = 'none'
}

interface MostCarProps {
  data: CarDetail[];
  title: string;
}

export const ListCar: React.FC<MostCarProps> = React.memo(({ data, title }) => {
  const itemsPerPage = 4;
  const [currentPage, setCurrentPage] = useState(0);
  const [displayData, setDisplayData] = useState<CarDetail[]>([]);
  const navigate = useNavigate();

  // Initialize categories and filter data
  const initialData = useMemo(()=>data.filter(item => 
    ['BMW', 'Audi', 'Tesla', 'Mercedes'].includes(item.brand)
  ),[data]);


  useEffect(() => {
    const startIndex = currentPage * itemsPerPage;
    const newData = initialData.slice(startIndex, startIndex + itemsPerPage);
    setDisplayData(newData);
  }, [currentPage, itemsPerPage, initialData]);
  
  // Handle navigation
  const handlePrevious = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);
  
  const handleNext = useCallback(() => {
    const maxPages = Math.ceil(initialData.length / itemsPerPage);
    if (currentPage < maxPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, initialData]);
  
  // Calculate if navigation buttons should be disabled
  const maxPages = Math.ceil(initialData.length / itemsPerPage);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage >= maxPages - 1;
  return (
    <div className="self-center flex flex-col w-full">
      <h2 className="text-4xl text-center font-sans font-bold mt-12 mb-2">{title}</h2>

      {/* Car Grid */}
      <div className="w-[90%] self-center mt-4">
        <div className={`w-full grid grid-cols-4 h-auto gap-[9px] transition duration-100 `}>
          {displayData.map(car => (
            <div 
              key={car.id} 
              className="h-auto bg-white border border-gray-200 rounded-lg shadow"
            >
              <div 
                className="h-auto aspect-[5/3] w-full bg-cover bg-center relative rounded-t-lg"
                style={{ backgroundImage: `url(${car.img})` }}
              >
                {car.status !== StatusCar.NONE && (
                  <div className={`absolute top-2 left-2 ${
                    car.status === StatusCar.SALE ? "bg-blue-600" : "bg-green-600"
                  } text-white text-xs font-semibold px-2 py-1 rounded`}>
                    {car.status}
                  </div>
                )}
                <button 
                  className="absolute top-2 right-2 bg-white p-2 rounded-full"
                  aria-label="Bookmark"
                >
                  <CiBookmark size={20} />
                </button>
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold truncate">{car.name}</h2>
                <p className="text-sm text-gray-600 truncate">{car.script}</p>
                <hr className="mt-3" />

                <div className="mt-3 flex md:justify-between 2xl:justify-evenly gap-6 items-center text-sm">
                  <div className="flex flex-col items-center">
                    <SiSpeedtest size={20} />
                    <span>{car.speed.replace("km/h", "")} Miles</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <LiaGasPumpSolid size={20} />
                    <span>{car.energy}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <TbManualGearbox size={20} />
                    <span>{car.transmission}</span>
                  </div>
                </div>

                <hr className="mt-3 mb-3" />

                <div className="md:justify-between 2xl:justify-evenly flex flex-row items-center">
                  <h2 className="text-[#000] text-base font-sans font-semibold">
                    {car.priceBuy}$
                  </h2>
                  <button
                    className="inline-flex gap-2 p-2 justify-center items-center text-base text-[#0044ff]"
                    onClick={() =>
                      navigate(`/cars/details?carId=${car.id}`, {
                        state: { subItem: car, carId: car.id },
                      })
                    }
                  >
                    View Details <GoArrowUpRight size={24} color="#0044ff" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls */}
        <div className="inline-flex w-full gap-6 self-center mt-12 justify-center">
          <button
            className={`w-14 h-auto border rounded-lg items-center flex p-2 justify-center
              ${isFirstPage ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-80 active:opacity-50'}`}
            onClick={handlePrevious}
            disabled={isFirstPage}
            aria-label="Previous page"
          >
            <SlArrowLeft size={24} color="#000" />
          </button>
          <button
            className={`w-14 h-auto border rounded-lg items-center flex p-2 justify-center
              ${isLastPage ? 'opacity-50 cursor-not-allowed' : 'opacity-100 hover:opacity-80 active:opacity-50'}`}
            onClick={handleNext}
            disabled={isLastPage}
            aria-label="Next page"
          >
            <SlArrowRight size={24} color="#000" />
          </button>
        </div>
      </div>
    </div>
  );
});

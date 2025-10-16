import React, { useCallback, useRef } from 'react';
import { FaCheck } from 'react-icons/fa';
import { GoArrowUpRight } from 'react-icons/go';

const DATA_SALE = [
  { nums: "836001000", script: "CARS FOR SALE", id: 0 },
  { nums: "738000250", script: "DEALER REVIEWS", id: 1 },
  { nums: "100001000", script: "VISITORS PER DAY", id: 2 },
  { nums: "238100200", script: "VERIFIED DEALERS", id: 3 },
];

const PROGRESS = [
  'We are the UK’s largest provider, with more patrols in more places',
  'You get 24/7 roadside assistance',
  'We fix 4 out of 5 cars at the roadside'
];

const formatNumber = (value: string | number) => {
  const numberValue = Number(value);
  if (numberValue >= 1_000_000_000) {
    return `${(numberValue / 1_000_000_000).toFixed(2)}B`;
  } 
  if (numberValue >= 1_000_000) {
    return `${(numberValue / 1_000_000).toFixed(1)}M`;
  } 
  if (numberValue >= 1_000) {
    return `${(numberValue / 1_000).toFixed(1)}K`;
  } 
  return numberValue.toString();
};

const ContentGoHome = React.memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 1;
    }
  },[]);

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row mt-12 bg-sky-200 rounded-lg overflow-hidden">
        <div className="w-2/5 flex">
          <video
            ref={videoRef}
            className="w-full h-auto rounded-lg"
            controls
            preload="metadata"
            onLoadedMetadata={handleLoadedMetadata}
          >
            <source src="/assets/about/car.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="md:w-3/5 p-8 flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black leading-tight">
            Get A Fair Price For Your Car - Sell To Us Today
          </h2>
          <p className="text-black text-lg">
            We are committed to providing our customers with exceptional service, competitive pricing, and a wide range of options.
          </p>
          {PROGRESS.map((item, index) => (
            <div  className="flex items-center gap-3 text-black">
              <div className='h-[26px] w-auto flex items-center justify-center rounded-full bg-white flex-shrink-0'>
                <FaCheck className="text-gray-950" size={12} />
              </div>
              <span>{item}</span>
            </div>
          ))}
          <button className="inline-flex items-center gap-2 bg-blue-500 self-start text-white font-bold py-3 px-6 rounded-xl hover:bg-opacity-90 transition duration-300">
            Get Started
            <GoArrowUpRight size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-12">
        {DATA_SALE.map((item) => (
          <div key={item.id} className="text-center">
            <h2 className="text-3xl font-bold">{formatNumber(item.nums)}</h2>
            <p className="mt-2 text-gray-600">{item.script}</p>
          </div>
        ))}
      </div>

      <hr className="border-gray-300" />
    </div>
  );
});

export default ContentGoHome;

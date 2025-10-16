import React from "react";
import { Img } from "react-image";

export const ImageIntroduce= React.memo(() => {
    return (
        <div className="flex w-full my-12 gap-4 px-[5%]  ">
            <div className="w-[17%] flex flex-col gap-4">
                <div className="w-full aspect-[3/4] flex flex-col items-start p-4 text-white bg-blue-500 rounded-lg transition duration-300 ease-in-out hover:scale-105">
                    <h3 className="font-bold text-lg">45</h3>
                    <h3 className="font-medium text-[17px]">Years in Business</h3>
                </div>
                <Img
                    className="w-full aspect-square rounded-lg transition duration-300 ease-in-out hover:scale-105"
                    src={require('src/assets/images/about/about1.png')}
                    alt="About Image 1"
                    loader={<div className="bg-gray-300 rounded-lg"></div>} // Optional: Loader while the image is loading
                />
            </div>
            <Img
                className="w-[33%] h-full bg-cover bg-center aspect-square rounded-2xl transition duration-300 ease-in-out hover:scale-105"
                src={require('src/assets/images/about/about2.png')}
                alt="About Image 2"
                loader={<div className="bg-gray-300 rounded-lg"></div>} // Optional: Loader while the image is loading
            />
            <div className="flex flex-col w-[50%] gap-4 ">
                <Img
                    className="w-full rounded-2xl aspect-[5/2]  transition duration-300 ease-in-out hover:scale-105"
                    src={require('src/assets/images/about/about3.png')}
                    alt="About Image 3"
                    loader={<div className="bg-gray-300 rounded-lg"></div>} // Optional: Loader while the image is loading
                />
                <div className="flex gap-4 w-full">
                    <Img
                        className="w-2/5 aspect-square rounded-2xl transition duration-300 ease-in-out hover:scale-105"
                        src={require('src/assets/images/about/about4.png')}
                        alt="About Image 4"
                        loader={<div className="bg-gray-300 rounded-lg"></div>} // Optional: Loader while the image is loading
                    />
                    <Img
                        className="w-3/5 aspect-[3/2] pr-4 rounded-2xl transition duration-300 ease-in-out hover:scale-105"
                        src={require('src/assets/images/about/about5.png')}
                        alt="About Image 5"
                        loader={<div className="bg-gray-300 rounded-lg"></div>} // Optional: Loader while the image is loading
                    />
                </div>
            </div>
        </div>
    );
});

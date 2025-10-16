import React from "react";

export const ContentReview = React.memo(() => {
    return (
        <div className="inline-flex w-full px-[5%] gap-4">
            <h2 className="text-black font-bold text-2xl w-[60%]"><span className="w-[85%] flex ">{`We Value Our Clients And Want Them To Have A Nice Experience`}</span></h2>
            <div className="w-[60%] text-black font-normal text-sm gap-2 flex-col flex">
                <h3 className="text-base w-[95%] text-black font-normal font-sans">
                    Lorem ipsum dolor sit amet consectetur. Convallis integer enim eget
                    sit urna. Eu duis lectus amet vestibulum varius. Nibh tellus sit sit
                    at lorem facilisis. Nunc vulputate ac interdum aliquet vestibulum in
                    tellus.
                </h3>
                <h2 className="text-base w-[95%] text-black font-normal font-sans">
                    Sit convallis rhoncus dolor purus amet orci urna. Lobortis
                    vulputate vestibulum consectetur donec ipsum egestas velit laoreet
                    justo. Eu dignissim egestas egestas ipsum. Sit est nunc
                    pellentesque at a aliquam ultrices consequat. Velit duis velit nec
                    amet eget eu morbi. Libero non diam sit viverra dignissim. Aliquam
                    tincidunt in cursus euismod enim.
                </h2>
                <h3 className="text-base w-[95%] text-black font-normal font-sans">
                    Magna odio sed ornare ultrices. Id lectus mi amet sit at sit arcu
                    mi nisl. Mauris egestas arcu mauris.
                </h3>
            </div>
        </div>
    );
})
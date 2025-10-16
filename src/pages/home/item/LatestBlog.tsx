import styled from "styled-components";
import { Blog } from "./typeData";
import moment from "moment";
import { LuDot } from "react-icons/lu";

const LatestBlogList = ({ data, title }: { title: string; data: Blog[] }) => {
  
  return (
    <StyledMostCar>
      <h2 className="text-4xl  font-sans font-bold mt-12 mb-8">{title}</h2>
      <div className="w-full h-auto inline-flex gap-[9px]  ">
        {data.map((subItem) => (
          <div
            key={subItem.id}
            className="h-auto flex-shrink-0 bg-white   relative  "
            style={{ width: `calc(33.33% - 8px)` }}
          >
            <div
              className="h-auto aspect-[5/3] w-full bg-cover bg-center relative shadow-md 2xl:shadow-lg  rounded-lg "
              style={{ backgroundImage: `url(${subItem.img})` }}
            >
              <div
                className={`absolute top-2 left-2 bg-[#fff] text-black text-xs 2xl:text-sm brightness-110  font-semibold px-2 py-1 rounded-lg`}
              >
                {subItem.status}
              </div>
            </div>
            <div className="px-3 pt-3 pb-1 inline-flex gap-3 2xl:gap-5 w-full items-center">
              <h2 className="text-lg font-semibold truncate">
                {subItem.owner}
              </h2>
            <LuDot size={27} className="text-gray-500" />
              <p className="text-sm text-gray-600 truncate">         
                {moment(subItem.date.toString()).format('LL')}
              </p>
            </div> 
            <h2 className="font-medium font-sans text-lg 2xl:text-2xl md:h-auto 2xl:h-20 text-[#000] relative  h-auto px-3  justify-between w-full ">{subItem.script}</h2>
          </div>

        ))}
      </div>
      
    </StyledMostCar>
  );
};

const StyledMostCar = styled.div`
  width: 90%;
  overflow: hidden;
  align-self: center;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

export default LatestBlogList;

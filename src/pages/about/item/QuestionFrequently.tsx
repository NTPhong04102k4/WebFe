import React, { useCallback, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { RiSubtractFill } from "react-icons/ri";
import { DATA_FAQ } from "./data";

export const QuestionFrequently = React.memo(() => {
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const toggleExpandDetails = useCallback((id: number) => {
    setExpandedIds((prevIds) => {
      if (prevIds.includes(id)) {
        return prevIds.filter((item) => item !== id);
      }
      return [...prevIds, id];
    });
  }, []);

  return (
    <div className="flex flex-col gap-6 w-[60%] h-auto min-h-[400px] self-center items-start justify-center p-4 mt-12">
      <h2 className="w-auto self-center flex font-bold text-2xl 2xl:text-3xl text-black mb-4">
        Frequently Asked Questions
      </h2>
      {DATA_FAQ.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`flex flex-col px-[5%] rounded pt-4 pb-3 w-full ${isExpanded ? 'bg-gray-200' : ''}`}
          >
            <h2
              className="cursor-pointer flex items-center font-medium font-sans justify-between text-[15px] 2xl:text-lg text-black"
              onClick={() => toggleExpandDetails(item.id)}
            >
              {item.question}
              <button>
                {isExpanded ? (
                  <RiSubtractFill className="text-black" size={20} />
                ) : (
                  <IoMdAdd className="text-black" size={20} />
                )}
              </button>
            </h2>
            {isExpanded && (
              <p className="mt-2 text-gray-950 text-sm w-[95%] 2xl:text-base">
                {item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
});

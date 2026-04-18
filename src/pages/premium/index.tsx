import React, { useState } from "react";
import { logger } from "src/utils/logger";
import { IoMdCheckmark } from "react-icons/io";
import { DATA_PREMIUM } from "./data";

const MembershipPlans: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#050b2b] w-full">
      <div className="w-full bg-white rounded-b-[65px] pt-12 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Membership Plans
        </h1>

        <div className="container mx-auto px-4 md:px-[3%] flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16 max-w-7xl">
            {DATA_PREMIUM.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-50 rounded-xl p-6 border border-gray-300 hover:drop-shadow-xl hover:bg-blue-600 active:scale-100 cursor-pointer transition duration-300 group"
                onMouseEnter={() => setHoveredId(Number(plan.id))}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex items-center gap-4 mb-3">
                  <span
                    className={`text-2xl font-bold ${
                      hoveredId === Number(plan.id)
                        ? "text-white"
                        : "text-black"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    ${plan.price}
                  </span>
                </div>

                <h3
                  className={`text-lg font-semibold mb-2 ${
                    hoveredId === Number(plan.id) ? "text-white" : "text-black"
                  } group-hover:text-white transition-colors duration-300`}
                >
                  {plan.namePackage}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    hoveredId === Number(plan.id)
                      ? "text-gray-100"
                      : "text-gray-600"
                  } group-hover:text-gray-100 transition-colors duration-300`}
                >
                  {plan.script}
                </p>

                <ul className="space-y-3 mb-6 flex flex-col">
                  <li
                    className={`text-sm inline-flex gap-3 items-center ${
                      hoveredId === Number(plan.id)
                        ? "text-white"
                        : "text-black"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <IoMdCheckmark className="text-blue-500 drop-shadow-2xl" />
                    </div>
                    {plan.listings} Listings
                  </li>
                  <li
                    className={`text-sm inline-flex gap-3 items-center ${
                      hoveredId === Number(plan.id)
                        ? "text-white"
                        : "text-black"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <IoMdCheckmark className="text-blue-500 drop-shadow-2xl" />
                    </div>
                    {plan.daysVisibility} Days Visibility
                  </li>
                  <li
                    className={`text-sm inline-flex gap-3 items-center ${
                      hoveredId === Number(plan.id)
                        ? "text-white"
                        : "text-black"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <IoMdCheckmark className="text-blue-500 drop-shadow-2xl" />
                    </div>
                    {plan.revisions} Revisions
                  </li>
                  <li
                    className={`text-sm inline-flex gap-3 items-center ${
                      hoveredId === Number(plan.id)
                        ? "text-white"
                        : "text-black"
                    } group-hover:text-white transition-colors duration-300`}
                  >
                    <div className="p-1 bg-white rounded-full">
                      <IoMdCheckmark className="text-blue-500 drop-shadow-2xl" />
                    </div>
                    {plan.daysDeliveryTime} Days Delivery Time
                  </li>
                  {plan.features.map((feature, index) => (
                    <li
                      className={`flex items-center gap-3 text-sm ${
                        hoveredId === Number(plan.id)
                          ? "text-white"
                          : "text-black"
                      } group-hover:text-white transition-colors duration-300`}
                    >
                      {feature.included && (
                        <div className="p-1 bg-white rounded-full">
                          <IoMdCheckmark className="text-blue-500 drop-shadow-2xl" />
                        </div>
                      )}
                      {feature.text}
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-2 px-4 bg-white text-blue-600 border rounded-lg active:scale-90 transition duration-200 font-medium hover:bg-blue-50"
                  onClick={() =>
                    logger.log(`Selected plan: ${plan.namePackage}`)
                  }
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MembershipPlans);

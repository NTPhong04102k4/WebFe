import React from "react";
import { DATA_FAQ } from "../about/item/data";
import { QuestionFrequentlyFAQs } from "./QuestionFrequently";

const Faqs = React.memo(() => {
  return (
    <div className="flex flex-col w-full bg-[#050b2b]">
      <div className="bg-white flex  flex-col items-center rounded-[35px]">
        <QuestionFrequentlyFAQs data={DATA_FAQ} title={"General"} />
        <QuestionFrequentlyFAQs data={DATA_FAQ} title={"Payments"} />
      </div>
    </div>
  );
});
export default Faqs;

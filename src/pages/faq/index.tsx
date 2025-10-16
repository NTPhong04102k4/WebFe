import React from "react";
import { DATA_FAQ } from "../about/item/data";
import { QuestionFrequentlyFAQs } from "./QuestionFrequently";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";

const Faqs = React.memo(() => {
  return (
    <div className="flex flex-col w-full bg-[#050b2b]">
      <Header />
      <div className="bg-white flex  flex-col items-center rounded-[35px]">
        <QuestionFrequentlyFAQs data={DATA_FAQ} title={"General"} />
        <QuestionFrequentlyFAQs data={DATA_FAQ} title={"Payments"} />
      </div>
      <FooterComponent show={true} />
    </div>
  );
});
export default Faqs;

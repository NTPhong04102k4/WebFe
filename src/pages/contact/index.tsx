import React, { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "src/shared/components/header";
import MapComponent from "src/shared/components/address";
import { FooterComponent } from "src/shared/components/footer";
import { FormContact } from "./FormContact";
import { AddressContact } from "./AddressContact";
import { DATA_SOCIAL } from "src/shared/components/footer/data";

export const ContactUs = React.memo(() => {
  const address = "Trường Đại Học Giao Thông Vận Tải";
  const position: [number, number] = [21.0379, 105.8025];
  const [isMapInteractive, setMapInteractive] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // Bắt sự kiện click vào MapComponent
  const handleMapClick = useCallback(() => {
    setMapInteractive(true);
  }, []);

  // Bắt sự kiện click ra ngoài MapComponent
  const handleClickOutside = (event: MouseEvent) => {
    if (mapRef.current && !mapRef.current.contains(event.target as Node)) {
      setMapInteractive(false);
    }
  };

  useEffect(() => {
    // Thêm sự kiện lắng nghe click bên ngoài
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Gỡ bỏ sự kiện lắng nghe khi component bị unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="flex w-full flex-col  relative bg-[#050b2b]  ">
      <Header />
      <div className="w-full px-[5%] bg-white rounded-b-[48px] pb-14 h-auto relative flex flex-col">
        <h2 className="text-xl pl-[5%] font-normal font-sans text-black mt-8  ">
          {" "}
          <span className="text-blue-500 ">Home</span>/ Contact Us
        </h2>
        <h2 className="text-2xl pl-[5%] font-sans font-bold mb-10">
          Contact Us
        </h2>

        <div
          ref={mapRef}
          onClick={handleMapClick}
          className="relative z-10 w-[95%] flex self-center"
        >
          <MapComponent
            address={address}
            position={position}
            interactive={isMapInteractive} // Truyền trạng thái tương tác vào MapComponent
          />
        </div>

        <FormContact data={DATA_SOCIAL} />
        <AddressContact />
      </div>

      <FooterComponent show={true} />
    </div>
  );
});
export default ContactUs;

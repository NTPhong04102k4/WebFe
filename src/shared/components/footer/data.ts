import { FaFacebookF } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { CiInstagram } from "react-icons/ci";
import {  FaLinkedinIn } from "react-icons/fa6";
import { IconType } from "react-icons";
export type page={
    name:string,
    id:number|string,
    path:string,
}
export enum Theme{
    DARK=0,
    LIGHT=1
  }
  export type Social = {
      id: number;
      icon: IconType; // Sử dụng IconType để xác định kiểu cho icon
      fn: () => void; // Hàm được gọi khi nhấp vào icon
  };
  
  export const DATA_SOCIAL: Social[] = [
      {
          id: 0,
          icon: FaFacebookF, // Không cần thêm dấu <>, truyền vào như một component
          fn: () => {
              // Thêm hành động cho Facebook
          },
      },
      {
          id: 1, // Đổi id thành 1 để duy nhất
          icon: FaTwitter,
          fn: () => {
              // Thêm hành động cho Twitter
          },
      },
      {
          id: 2, // Đổi id thành 2 để duy nhất
          icon: CiInstagram,
          fn: () => {
              // Thêm hành động cho Instagram
          },
      },
      {
          id: 3, // Đổi id thành 3 để duy nhất
          icon: FaLinkedinIn,
          fn: () => {
              // Thêm hành động cho LinkedIn
          },
      },
  ];
  export const DATA_FOOTER = [
    {
      id: 0,
      title: "Company",
      data: [
        {
          id: 0,
          name: "About Us",
          path: "/about",
        },
        {
          id: 1,
          name: "Blog",
          path: "/blog",
        },
        {
          id: 2,
          name: "Services",
          path: "/services",
        },
        {
          id: 3,
          name: "FAQs",
          path: "/faqs",
        },
        {
          id: 4,
          name: "Terms",
          path: "/terms",
        },
        {
          id: 5,
          name: "Contact Us",
          path: "/contact",
        },
      ],
    },
    {
      id: 1,
      title: "Quick Links",
      data: [
        // liên hệ với email
        {
          id: 0,
          name: "Get In Touch",
          path: "/contact",
        },
        {
          id: 1,
          name: "Help Center",
          path: "/help-center",
        },
        {
          id: 2,
          name: "Live Chat",
          path: "/zaloOA",
        },
        {
          id: 3,
          name: "How it works",
          path: "/guide",
        },
      ],
    },
    {
      id: 2,
      title: "Our Brands",
      data: [
        {
          id: 0,
          name: "Toyota",
          path: "/toyota",
        },
        {
          id: 1,
          name: "Porsche",
          path: "/porsche",
        },
        {
          id: 2,
          name: "Audi",
          path: "/audi",
        },
        {
          id: 3,
          name: "BMW",
          path: "/bmw",
        },
        {
          id: 4,
          name: "Ford",
          path: "/ford",
        },
        {
          id: 5,
          name: "Nissan",
          path: "/nissan",
        },
        {
          id: 6,
          name: "Peugeot",
          path: "/peugeot",
        },
        {
          id: 7,
          name: "Volkswagen",
          path: "/volkswagen",
        },
      ],
    },
    {
      id: 1,
      title: "Vehicles Type",
      data: [
        {
          id: 0,
          name: "Sedan",
          path: "/sedan",
        },
        {
          id: 1,
          name: "Hatchback",
          path: "/hatchback",
        },
        {
          id: 2,
          name: "SUV",
          path: "/suv",
        },
        {
          id: 3,
          name: "Hybrid",
          path: "/hybird",
        },
        {
          id: 4,
          name: "Electric",
          path: "/electric",
        },
        {
          id: 5,
          name: "Coupe",
          path: "/coupe",
        },
        {
          id: 6,
          name: "Truck",
          path: "/truck",
        },
        {
          id: 7,
          name: "Convertible",
          path: "/convertible",
        },
      ],
    },
  ];
  
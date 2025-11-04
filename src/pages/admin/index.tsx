import axios from "axios";
import React, { useEffect, useState } from "react";
import { GoArrowRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";

const Admin = React.memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  useEffect(() => {
    // Giả sử API của bạn có đường dẫn /api/admins
    axios.get("/api/admins")
      .then((response) => response.data)
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
    console.log("adminAPi:", data);
  }, [data]);

  function handleClick() {
    navigate("/auth/login/admin/page_manage");
  }

  return (
    <div className="flex flex-col  bg-sky-50 w-full h-screen justify-center items-center">
      <div className="w-[35%] h-auto   flex flex-col border border-gray bg-white rounded-lg  self-center  items-center drop-shadow hover:drop-shadow-xl ">
        <div className=" flex flex-col rounded-t-lg 2xl:py-12  py-12 w-full  bg-purple-400 self-center justify-center items-center">
          <h2 className="text-blue-600  font-sans font-bold text-2xl 2xl:text-4xl  self-center flex">
            Admin Login
          </h2>
          <h3 className="text-black font-sans font-normal text-base 2xl:text-xl ">
            Hello there, Sign in and start managing your website
          </h3>
        </div>

        <div className="inline-flex gap-6 mt-4 justify-center w-full min-h-8 relative py-3 px-6 items-center 2xl:py-5 2xl:px-7">
          <h2 className="text-gray-600 font-sans w-[15%] font-medium text-base 2xl:text-xl">
            Admin:
          </h2>
          <input
            className="hover:drop-shadow-md focus:outline-none py-2 px-2 w-[70%] border rounded-sm border-gray-100 focus:border-gray-400 text-gray-700 font-sans text-sm 2xl:text-base font-normal"
            type="text"
            placeholder="Admin_User"
          />
        </div>
        <div className="hover:drop-shadow-md inline-flex gap-6 justify-center w-full min-h-8 relative py-3 px-6 items-center">
          <h2 className="text-gray-600 font-sans w-[15%] font-medium text-base 2xl:text-xl">
            Password:
          </h2>
          <input
            className="focus:outline-none py-2 px-2 w-[70%] border rounded-sm border-gray-100 focus:border-gray-400 text-gray-700 font-sans text-sm 2xl:text-base font-normal"
            type="password"
            placeholder="@123456..."
          />
        </div>
        <div className="inline-flex items-center gap-2 px-12 2xl:px-16 w-full mt-2">
          <input type="checkbox" className="size-4" />
          <h3 className="text-gray-700 font-sans font-normal text-base 2xl:text-xl">
            Remember Me
          </h3>
        </div>

        <button
          className="inline-flex gap-2  mt-6 mb-6 border  drop-shadow border-gray-300  active:bg-gray-600 active:scale-90 transition duration-300 text-gray-900 text-xl w-[50%] rounded-3xl  py-1 px-6 self-center justify-center items-center"
          onClick={handleClick}
          aria-label="Login"
        >
          Login
          <GoArrowRight size={24} className="active:text-gray-300" />
        </button>
      </div>
    </div>
  );
});

export default Admin;

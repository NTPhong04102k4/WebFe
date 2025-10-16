import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Blog } from "src/pages/home/item/typeData";
import moment from "moment";
import { GoArrowLeft, GoArrowRight, GoDotFill } from "react-icons/go";
import { FaCheck } from "react-icons/fa";
import { DATA_BLOG } from "src/pages/home/item/data";
import { Header } from "src/shared/components/header";
import { DATA_SOCIAL } from "src/shared/components/footer/data";
import { FooterComponent } from "src/shared/components/footer";
const DATA_LEARN = [
  "Become a UI/UX designer.",
  "Build & test a complete mobile app.",
  "You will be able to start earning money Figma skills.",
  "Learn to design mobile apps & websites.",
  "Build a UI project from beginning to end.",
  "Design 3 different logos.",
  "Work with colors & fonts.",
  "Create low-fidelity wireframe.",
  "You will create your own UI Kit.",
  "Downloadable exercise files.",
];
const REQUIREMENTS = [
  "We do not require any previous experience or pre-defined skills to take this course. A great orientation would be enough to master UI/UX design.",
  "A computer with a good internet connection.",
  "Adobe Photoshop (OPTIONAL)",
];
const BlogDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.dataProps as Blog;
  const prev = location.state?.prev as Blog;
  const next = location.state?.next as Blog;
  const fnBlogDetail = (id: number | string) => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const dataProps = DATA_BLOG.find((item) => item.id === id) ?? DATA_BLOG[0];
    const idxDataBlog = DATA_BLOG.findIndex((item) => item.id === id);
    console.log("idx:", idxDataBlog);
    navigate("/home/blog/all_blogs/details", {
      state: {
        dataProps,
        prev: DATA_BLOG[idxDataBlog > 0 ? idxDataBlog - 1 : 0],
        next: DATA_BLOG[
          idxDataBlog < DATA_BLOG.length ? idxDataBlog + 1 : idxDataBlog
        ],
      },
    });
  };
  return (
    <div className="flex flex-col w-full bg-[#050b2b] min-h-screen">
      <Header />
      <div className="bg-white rounded-b-[45px] flex flex-col w-full px-[8%] py-12">
        <nav className="inline-flex gap-[2px] text-base text-blue-500">
          Home / <span>Accessories</span>
        </nav>
        <h2 className="font-sans text-xl font-medium mb-3">{data.name}</h2>
        <h2 className="inline-flex gap-3 font-sans font-normal items-center text-gray-950 ">
          {data.owner} <GoDotFill className="text-gray-400 size-4" />{" "}
          {moment(data?.date).format("LL")}
        </h2>
        <div
          className="bg-center bg-cover rounded-xl w-full h-auto aspect-[7/3] my-4"
          style={{ backgroundImage: `url(${data.img})` }}
        />
        <h3 className="self-center w-[70%]  text-center font-sans font-normal text-base xl:text-base md:text-sm 2xl:text-xl">
          {data.script}
        </h3>
        <div className="bg-sky-100 w-[70%] self-center  flex flex-col border-l-[16px] my-12 justify-center border-l-blue-500 rounded-2xl py-6">
          <h3 className="w-[86%] self-center font-sans font-medium italic hover:scale-95 duration-300 transition opacity-90 ">
            Aliquam hendrerit sollicitudin purus, quis rutrum mi accumsan nec.
            Quisque bibendum orci ac nibh facilisis, at malesuada orci congue.
          </h3>
          <h3 className="font-medium font-sans text-lg my-3 px-[7%]">{`\nLuis Pickford`}</h3>
        </div>
        <h2 className="font-medium font-sans text-xl mb-3 w-[70%] self-center">
          What you’ll learn
        </h2>
        <div className=" grid-cols-2 w-[70%] grid self-center ">
          {DATA_LEARN.map((item) => {
            return (
              <h2 className="inline-flex gap-2 items-center justify-start my-[6px] text-gray-600 hover:underline ">
                <div className="p-1  bg-sky-200 rounded-full">
                  <FaCheck className="text-blue-500  size-3 " />
                </div>{" "}
                {item}
              </h2>
            );
          })}
        </div>
        <div
          className="w-[70%] h-auto aspect-[7/3] bg-center bg-cover self-center rounded-xl my-8"
          style={{ backgroundImage: `url(${data.img})` }}
        />
        <h3 className="w-[70%] self-center font-sans font-medium text-xl mb-3">
          Requirements
        </h3>
        {REQUIREMENTS.map((item) => {
          return (
            <h2 className="inline-flex items-start w-[70%] self-center gap-2 leading-normal my-1 hover:underline">
              <div className=" p-1 rounded-full">
                <GoDotFill className="text-gray-400 h-4 w-4" />
              </div>
              {item}
            </h2>
          );
        })}
        <div className="inline-flex items-center  w-[70%] snap-center self-center mt-6 pt-6 border-t-[1px] border-gray-400">
          <div className="w-[30%] flex flex-row">
            <h2 className="font-medium font-sans text-sm xl:text-sm 2xl:text-base text-black ">
              Share this Post
            </h2>
            {DATA_SOCIAL.map((item) => {
              const Icon = item.icon;
              return (
                <Icon
                  size={16}
                  className="text-black mx-2 hover:scale-[2] transition duration-300 "
                />
              );
            })}
          </div>
          <div className="inline-flex w-[70%] gap-1 min-h-10 font-medium text-sm xl:text-sm 2xl:text-base md:text-xs">
            <h2 className="items-center w-[55%] flex px-[5%] bg-sky-300 rounded-3xl hover:cursor-auto hover:scale-[1.03] transition duration-300 ">
              Exterior
            </h2>
            <h3 className="items-center justify-center w-[25%] flex px-[5%] bg-sky-300 rounded-3xl hover:cursor-pointer hover:scale-105 transition duration-300">
              Fuel System
            </h3>
            <h3 className="items-center w-[20%] flex justify-center px-[5%] bg-sky-300 rounded-3xl hover:cursor-pointer hover:scale-105 transition duration-300">
              {data.status}
            </h3>
          </div>
        </div>
        <div className="inline-flex gap-4 py-6 border-y my-4 border-gray-400  w-[70%] snap-center self-center">
          <div className="w-auto h-auto ">
            {" "}
            <div
              className="h-auto w-[60px] aspect-square bg-center bg-cover rounded-full flex"
              style={{
                backgroundImage: `url(${require("src/assets/images/team/demo.jpg")})`,
              }}
            />
          </div>
          <div className="w-auto flex flex-col font-sans  ">
            <h2 className="font-medium text-black">Admin</h2>
            <h3 className="font-normal italic md:text-xs xl:text-sm 2xl:text-base">
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem
              accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
              quae ab illo inventore veritatis et quasi architecto beatae vitae
              dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas
              sit.
            </h3>
          </div>
        </div>
        <div className="inline-flex justify-between w-[70%] self-center pb-6 border-b border-gray-400">
          {prev && (
            <div className="flex flex-col cursor-pointer active:scale-95 active:opacity-80 transition duration-300">
              <h2
                className="inline-flex items-center gap-2 "
                onClick={() => fnBlogDetail(prev.id)}
              >
                <GoArrowLeft className="size-4 " /> Previous Post
              </h2>
              <h3>{prev?.name}</h3>
            </div>
          )}
          {next && (
            <div className="flex flex-col cursor-pointer active:scale-95 active:opacity-80 transition duration-300">
              <h2
                className="inline-flex items-center gap-2 self-end"
                onClick={() => fnBlogDetail(next.id)}
              >
                <GoArrowRight className="size-4 " /> Next Post
              </h2>
              <h3>{next?.name}</h3>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 w-[70%] self-center mt-4 mb-12">
          <h2 className="font-sans font-medium text-xl ">Comments</h2>
          <div className="inline-flex  w-full">
            <div className="w-auto  h-auto flex my-3">
              <div
                className="h-full w-[60px] aspect-square bg-cover bg-center rounded-full"
                style={{
                  backgroundImage: `url(${require("src/assets/images/team/demo2.avif")})`,
                }}
              />
            </div>
            <div className="flex flex-col ml-4 gap-1">
              <h2 className="inline-flex items-center font-sans font-normal md:text-sm xl:text-sm 2xl:text-base gap-1 mt-2">
                {data.owner} <GoDotFill className="text-gray-500 size-4" />{" "}
                {moment(data.date).format("LL")}
              </h2>
              <h3 className="font-sans font-normal text-sm text-gray-700">
                {
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enimad minim veniam."
                }
              </h3>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-[70%] self-center">
          <h2 className="text-xl font-sans font-medium my-6 ">
            Leave a Comment
          </h2>
          <div className="inline-flex justify-between gap-4 ">
            <div className="w-[50%] border border-gray-500 p-3 rounded-xl ">
              <h4 className=" font-mono text-sm text-gray-500">Name</h4>
              <input
                className="focus:outline-none text-gray-800 h-4 text-sm "
                placeholder="Your Name"
              />
            </div>
            <div className="w-[50%] border border-gray-500 p-3 rounded-xl ">
              <h4 className=" font-mono text-sm text-gray-500">Email</h4>
              <input
                className="focus:outline-none text-gray-800 h-4 text-sm "
                placeholder="Your Email"
              />
            </div>
          </div>
          <div className="border px-3 my-4 h-[180px] py-2 border-gray-500  rounded-xl">
            <textarea
              className="w-full  h-full  border border-gray-800  text-black text-sm focus:outline-none resize-none outline-none border-none"
              placeholder="Type in here..."
              inputMode="text"
            />
          </div>
          <button className="active:scale-90 bg-blue-500 rounded-xl border-white text-[#fff] text-sm transition duration-300 hover:bg-blue-700 py-3 px-3 self-start flex ">
            Submit Comment
          </button>
        </div>
      </div>
      <FooterComponent show={true} />
    </div>
  );
};
export default React.memo(BlogDetail);

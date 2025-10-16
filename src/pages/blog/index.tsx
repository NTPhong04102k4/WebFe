import React from "react";

import { MainBodyBlog } from "./blogPagesBranches/MainBlog";
import { DATA_BLOG } from "../home/item/data";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
const Blog = React.memo(() => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050b2b]">
      <Header />
      <MainBodyBlog data={DATA_BLOG} />
      <FooterComponent show={true} />
    </div>
  );
});
export default Blog;

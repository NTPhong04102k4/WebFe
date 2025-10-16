import moment from "moment";
import React from "react";
import { DATA_BLOG } from "src/pages/home/item/data";
import { MainBodyBlog } from "./MainBlog";
import { Header } from "src/shared/components/header";
import { FooterComponent } from "src/shared/components/footer";
const BlogLastPost = React.memo(() => {
  const currentYear = new Date().getFullYear();
  const data = DATA_BLOG.filter(
    (item) => moment(item.date).year() === currentYear
  );

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050b2b]">
      <Header />
      <MainBodyBlog data={data} />
      <FooterComponent show={true} />
    </div>
  );
});
export default BlogLastPost;

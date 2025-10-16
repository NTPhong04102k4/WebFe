import React from "react";
import styled from "styled-components";
import {
  DATA_BLOG,
  DATA_BODY,
  DATA_BRAND,
  DATA_EXPAND,
  DATA_OPTION_SUGGEST,
  DATA_SUGGEST,
} from "./item/data";
import { MostCar } from "./item/ScrollCar";
import { ListCar } from "./item/ListCar";
import { ListBrand } from "./item/ListBrand";
import {
  ContentGoHome,
  Question,
  SuggestChoice,
  SuggestChoiceOption,
} from "./item/ItemSugest";
import { CustomerComment, DATA_REVIEWS } from "./item/CustomerComment";
import LatestBlogList from "./item/LatestBlog";
import { Footer } from "src/shared/components/footer";
import { HeaderHome } from "./item/Header";
import { Theme } from "src/shared/components/footer/data";
import { DATA_CAR } from "../listings/item/data";
const Home = React.memo(() => {
  return (
    <Container>
      <HeaderHome data={DATA_EXPAND} />
      <ListBrand data={DATA_BODY} title="Select a Body Styles" />
      <SuggestChoice
        data={DATA_SUGGEST}
        title={`We're BIG on what matters to you`}
      />

      <MostCar data={DATA_CAR} title=" The Most Searched Cars" />
      <SuggestChoiceOption data={DATA_OPTION_SUGGEST} />
      <ListCar data={DATA_CAR} title="Recommended Cars For You" />
      <ContentGoHome />
      {/* danh sach oto sap nhap ve*/}
      <ListCar data={DATA_CAR} title="Upcoming Cars" />
      <CustomerComment data={DATA_REVIEWS} />
      <LatestBlogList data={DATA_BLOG} title="Latest Blog Posts" />
      <ListBrand
        title="Explore Our Premium Brands"
        data={DATA_BRAND}
        detail={true}
      />
      <Question />
      <Footer theme={Theme.LIGHT} />
    </Container>
  );
});

export default Home;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

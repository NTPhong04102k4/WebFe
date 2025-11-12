import React, { useMemo } from "react";
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
import { HeaderHome } from "./item/Header";
import { carRouteFn } from "src/services/api/functions/car/Routes.Fn";
import { mapCarsToDetails } from "src/shared/utils/carAdapter";
import { CarDetail } from "./item/typeData";
const Home = React.memo(() => {
  const [cars, setCars] = React.useState<CarDetail[]>([]);
  const [isLoadingCars, setIsLoadingCars] = React.useState(true);
  const [carError, setCarError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const fetchCars = async () => {
      setIsLoadingCars(true);
      setCarError(null);

      try {
        const response = await carRouteFn.getCars({
          pageIndex: 1,
          pageSize: 48,
        });
        if (!isMounted) return;
        setCars(mapCarsToDetails(response.data));
      } catch (error) {
        console.error("Failed to load cars", error);
        if (!isMounted) return;
        setCarError("Unable to load cars right now. Please try again later.");
        setCars([]);
      } finally {
        if (isMounted) {
          setIsLoadingCars(false);
        }
      }
    };

    fetchCars();
    return () => {
      isMounted = false;
    };
  }, []);

  const upcomingCars = React.useMemo(
    () => cars.filter((car) => car.condition === "new"),
    [cars]
  );

  const renderListCarSection = (title: string, data: CarDetail[]) => {
    if (isLoadingCars) {
      return (
        <section className="self-center flex flex-col w-full">
          <h2 className="text-4xl text-center font-sans font-bold mt-12 mb-2">
            {title}
          </h2>
          <p className="text-center text-white mt-6" role="status">
            Loading cars...
          </p>
        </section>
      );
    }

    if (carError) {
      return (
        <section className="self-center flex flex-col w-full">
          <h2 className="text-4xl text-center font-sans font-bold mt-12 mb-2">
            {title}
          </h2>
          <p className="text-center text-red-400 mt-6">{carError}</p>
        </section>
      );
    }

    if (data.length === 0) {
      return (
        <section className="self-center flex flex-col w-full">
          <h2 className="text-4xl text-center font-sans font-bold mt-12 mb-2">
            {title}
          </h2>
          <p className="text-center text-white mt-6">
            No cars available for this section.
          </p>
        </section>
      );
    }

    return <ListCar data={data} title={title} />;
  };

  return (
    <Container>
      <HeaderHome data={DATA_EXPAND} carsData={cars} />
      <ListBrand
        data={DATA_BODY}
        title="Select a Body Styles"
        carsData={cars}
      />
      <SuggestChoice
        data={DATA_SUGGEST}
        title={`We're BIG on what matters to you`}
      />
      <MostCar data={cars} title=" The Most Searched Cars" />
      <SuggestChoiceOption data={DATA_OPTION_SUGGEST} />
      {renderListCarSection("Recommended Cars For You", cars)}
      <ContentGoHome />
      {/* danh sach oto sap nhap ve*/}
      {renderListCarSection("Upcoming Cars", upcomingCars)}
      <CustomerComment data={DATA_REVIEWS} />
      <LatestBlogList data={DATA_BLOG} title="Latest Blog Posts" />
      <ListBrand
        title="Explore Our Premium Brands"
        data={DATA_BRAND}
        detail={true}
        carsData={cars}
      />
      <Question />
    </Container>
  );
});

export default Home;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

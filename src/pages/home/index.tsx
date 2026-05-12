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
import { useCarList } from "src/query/car/useCarQueries";
import { CarResponseItem } from "src/shared/types/Reponse/Car";
import { CarDetail } from "./item/typeData";

// Helper function to get image URL from CarResponseItem
const getImageUrl = (car: CarResponseItem): string => {
  if (car.primaryImagePath) {
    if (typeof car.primaryImagePath === "string") {
      return car.primaryImagePath;
    }
    if (typeof car.primaryImagePath === "object") {
      return (
        (car.primaryImagePath as any)?.url ||
        (car.primaryImagePath as any)?.path ||
        "https://via.placeholder.com/300x200"
      );
    }
  }

  if (car.imagePaths) {
    let images: any[] = [];
    if (typeof car.imagePaths === "string") {
      images = (car.imagePaths as string)
        .split(",")
        .map((s: string) => s.trim());
    } else if (Array.isArray(car.imagePaths)) {
      images = car.imagePaths as any[];
    }

    if (images.length > 0) {
      const firstImage = images[0];
      if (typeof firstImage === "string") {
        return firstImage;
      }
      if (typeof firstImage === "object" && firstImage !== null) {
        return (
          (firstImage as any)?.url ||
          (firstImage as any)?.path ||
          "https://via.placeholder.com/300x200"
        );
      }
    }
  }

  return "https://via.placeholder.com/300x200";
};

// Helper function to map CarResponseItem to CarDetail
const mapCarToCarDetail = (car: CarResponseItem): CarDetail => {
  const imageUrl = getImageUrl(car);

  // Determine status based on price difference
  let status: "Sale" | "Great Price" | "none" = "none";
  if (car.importPrice && car.salePrice) {
    const discount =
      ((car.importPrice - car.salePrice) / car.importPrice) * 100;
    if (discount > 20) {
      status = "Great Price";
    } else if (discount > 0) {
      status = "Sale";
    }
  }

  // Format price
  const formatPrice = (price: number): string => {
    return ` $${price.toLocaleString("en-US")}`;
  };

  // Calculate used time
  const currentYear = new Date().getFullYear();
  const usedTime = car.modelYear
    ? `${currentYear - car.modelYear} years`
    : "N/A";

  // Map fuel type
  const fuelTypeMap: Record<string, "Petrol" | "Hybird" | "Diesel"> = {
    Petrol: "Petrol",
    Gasoline: "Petrol",
    Diesel: "Diesel",
    Hybrid: "Hybird",
    Electric: "Hybird",
  };
  const energy = fuelTypeMap[car.fuelType] || "Petrol";

  // Map body type
  const bodyTypeMap: Record<
    number,
    "Sedan" | "Coupe" | "SUV" | "Truck" | "HatchBack" | "Convertible"
  > = {
    1: "Sedan",
    2: "Coupe",
    3: "SUV",
    4: "Truck",
    5: "HatchBack",
    6: "Convertible",
  };
  const body = bodyTypeMap[car.bodyTypeID] || "Sedan";

  // Map transmission
  const transmissionMap: Record<string, "CVT" | "Manual" | "Automatic"> = {
    Automatic: "Automatic",
    Manual: "Manual",
    CVT: "CVT",
  };
  const transmission = transmissionMap[car.transmission] || "Automatic";

  return {
    id: car.carID,
    name: car.carName,
    img: imageUrl,
    script: car.shortDescription || car.detailedDescription || "",
    speed: "180 km/h",
    priceRoot: car.importPrice
      ? formatPrice(car.importPrice)
      : formatPrice(car.price),
    priceBuy: formatPrice(car.salePrice || car.price),
    status,
    isUsedTime: usedTime,
    brand: car.modelName || "",
    body,
    seat: car.seats,
    door: car.doors,
    energy,
    year: new Date(car.modelYear, 0, 1),
    transmission,
    driveType: car.driveType || "",
    condition: car.condition === "new" ? "new" : "used",
    engineSize: car.engineSize || 0,
    cylinders: 4,
    color: car.color || "",
    VIN: car.vin || "",
    descriptOverview: car.detailedDescription || car.shortDescription || "",
    physicBody: {
      length: 0,
      height: 0,
      wheelbase: 0,
      height_includeRoofRails: 0,
      luggageCapacity_seatUp: 0,
      luggageCapacity_seatDown: 0,
      width: 0,
      width_include_mirrors: 0,
      grossVechicleWeight: 0,
      maxLoadingWeigt: 0,
      maxRoofLoad: 0,
      seatMax: car.seats,
      fullTank: 0,
      braked: 0,
      unBraked: 0,
      kerbweight: 0,
      turningCircle: 0,
      location: [0, 0],
    },
  };
};

const Home = React.memo(() => {
  // Fetch cars from API
  const { data: carResponse, isLoading } = useCarList({
    page: 1,
    pageSize: 100, // Get more cars for home page
    brandCode: "",
    bodyCode: "",
  });

  // Map API response to CarDetail format
  const DATA_CAR = useMemo(() => {
    if (!carResponse?.data) return [];
    return carResponse.data.map(mapCarToCarDetail);
  }, [carResponse]);

  if (isLoading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-lg">Loading...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <HeaderHome data={DATA_EXPAND} carsData={DATA_CAR} />
      <ListBrand
        data={DATA_BODY}
        title="Select a Body Styles"
        carsData={DATA_CAR}
      />
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
        carsData={DATA_CAR}
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

import placeholderCar from "src/assets/images/homepage/cars.png";
import { CarDetail } from "src/pages/home/item/typeData";
import { CarListItem } from "src/shared/types/Reponse/Car";

const BODY_TYPE_MAP: Record<number, CarDetail["body"]> = {
  1: "Sedan",
  2: "SUV",
  3: "Coupe",
  4: "Truck",
  5: "HatchBack",
  6: "Convertible",
};

const DEFAULT_PHYSIC_BODY: CarDetail["physicBody"] = {
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
  seatMax: 0,
  fullTank: 0,
  braked: 0,
  unBraked: 0,
  kerbweight: 0,
  turningCircle: 0,
  location: [0, 0],
};

const FALLBACK_IMAGE = placeholderCar;

const formatPrice = (value?: number | null) => {
  if (!value && value !== 0) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
};

const parseImage = (item: CarListItem) => {
  if (item.primaryImagePath) {
    return item.primaryImagePath;
  }

  if (item.imagePaths) {
    try {
      const parsed = JSON.parse(item.imagePaths) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0];
      }
    } catch {
      /* ignore JSON parsing errors */
    }
  }

  return FALLBACK_IMAGE;
};

const normalizeEnergy = (energy?: string | null): CarDetail["energy"] => {
  if (!energy) return "Petrol";
  const normalized = energy.toLowerCase();
  if (normalized.includes("diesel")) return "Diesel";
  if (normalized.includes("electric")) return "Electric";
  if (normalized.includes("hybrid")) return "Hybird";
  if (normalized.includes("gas")) return "Gasoline";
  return "Petrol";
};

const normalizeBody = (bodyTypeId?: number | null): CarDetail["body"] => {
  if (!bodyTypeId) return "SUV";
  return BODY_TYPE_MAP[bodyTypeId] ?? "SUV";
};

const normalizeCondition = (condition?: string | null): CarDetail["condition"] =>
  condition?.toLowerCase() === "new" ? "new" : "used";

const buildIsUsedTime = (item: CarListItem) => {
  if (item.condition?.toLowerCase() === "new") {
    return "Brand new";
  }
  if (item.mileage && item.mileage > 0) {
    return `${new Intl.NumberFormat("en-US").format(item.mileage)} km`;
  }
  return "Used";
};

const speedString = (item: CarListItem) => {
  const fallback = 200;
  const topSpeed = item.mileage && item.mileage > 0 ? item.mileage : fallback;
  return `${topSpeed} km/h`;
};

const mapStatus = (item: CarListItem): CarDetail["status"] => {
  const basePrice = item.price ?? 0;
  const salePrice = item.salePrice ?? basePrice;
  if (salePrice && basePrice && salePrice < basePrice) {
    return "Sale";
  }
  if (item.isFeature) {
    return "Great Price";
  }
  return "none";
};

export const mapCarsToDetails = (items: CarListItem[]): CarDetail[] => {
  return items.map((item) => {
    const price = item.price ?? item.salePrice ?? 0;
    const salePrice = item.salePrice ?? price;

    return {
      id: item.carID,
      name: item.carName,
      brand: item.modelName ?? item.carCode,
      img: parseImage(item),
      script:
        item.shortDescription ??
        `${item.modelYear} ${item.modelName ?? item.carCode}`,
      speed: speedString(item),
      priceRoot: formatPrice(price),
      priceBuy: formatPrice(salePrice),
      status: mapStatus(item),
      isUsedTime: buildIsUsedTime(item),
      body: normalizeBody(item.bodyTypeID),
      seat: item.seats ?? 5,
      door: item.doors ?? 4,
      energy: normalizeEnergy(item.fuelType),
      year: new Date(item.modelYear ?? new Date().getFullYear(), 0, 1),
      transmission:
        (item.transmission as CarDetail["transmission"]) ?? "Automatic",
      driveType: item.driveType ?? "FWD",
      condition: normalizeCondition(item.condition),
      engineSize: item.engineSize ?? 0,
      cylinders: 4,
      color: item.color ?? "Black",
      VIN: item.vin ?? item.carCode,
      descriptOverview:
        item.detailedDescription ??
        item.shortDescription ??
        "Information is being updated.",
      physicBody: { ...DEFAULT_PHYSIC_BODY },
    };
  });
};

export interface BrandCarResponse {
  brandCode: string;
  brandName: string;
  logoPath: string | null;
  description: string | null;
  countryOrigin: string;
  website: string | null;
}

export interface BodyCarReponse {
  bodyCode: string;
  bodyName: string;
  imagePath: string | null;
  description: string | null;
  seatCapacityRange: string;
}

export interface CarListItem {
  carID: number;
  carCode: string;
  vin: string | null;
  carName: string;
  brandID: number;
  modelName: string | null;
  modelYear: number | null;
  bodyTypeID: number | null;
  statusID: number | null;
  condition: string | null;
  locationID: number | null;
  price: number | null;
  importPrice: number | null;
  salePrice: number | null;
  engineSize: number | null;
  fuelType: string | null;
  transmission: string | null;
  driveType: string | null;
  doors: number | null;
  seats: number | null;
  color: string | null;
  mileage: number | null;
  videoPath: string | null;
  imagePaths: string | null;
  primaryImagePath: string | null;
  detailedDescription: string | null;
  shortDescription: string | null;
  isFeature: boolean;
  viewCount: number;
}

export interface CarListResponse {
  data: CarListItem[];
  totalCount: number;
}

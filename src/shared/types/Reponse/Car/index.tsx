export interface BrandCarResponse {
  brandCode: string;
  id: number;
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
export interface CarDetailResponse {
  carID: number;
  length_mm: number;
  width_mm: number;
  height_mm: number;
  wheelbase_mm: number;
  groundClearance_mm: number;
  curbWeight_kg: number;
  grossWeight_kg: number | null;
  payloadCapacity_kg: number | null;
  engineCode: string;
  cylinders: number;
  maxPower_hp: number;
  maxTorque_nm: number;
  compression_ratio?: number | null;
  topSpeed_kmh?: number | null;
  acceleration_0_100_sec?: number | null;
  fuelConsumption_city_l100km?: number | null;
  fuelConsumption_highway_l100km?: number | null;
  fuelConsumption_combined_l100km?: number | null;
  fuelTankCapacity_l?: number | null;
  safetyRating?: string | null;
  airbags?: number | null;
  abs: boolean;
  esp: boolean;
  airConditioning: boolean;
  sunRoof: boolean;
  leatherSeats: boolean;
  navigationSystem: boolean;
  bluetoothConnectivity: boolean;
}
export interface CarResponseItem {
  carID: number;
  carCode: string;
  vin: string;
  carName: string;
  brandID: number;
  modelName: string;
  modelYear: number;
  bodyTypeID: number;
  statusID: number;
  condition: string;
  locationID: number;
  price: number;
  importPrice: number | null;
  salePrice: number;
  engineSize: number;
  fuelType: string;
  transmission: string;
  driveType: string;
  doors: number;
  seats: number;
  color: string;
  mileage: number;
  videoPath: string | null;
  imagePaths: string | string[] | null;
  primaryImagePath: string | null;
  detailedDescription: string | null;
  shortDescription: string | null;
  isFeature: boolean;
  viewCount: number;
  soldDate?: string | null;
  createdBy?: number | null;
  isActive?: boolean;
}
export interface CarResponse {
  data: CarResponseItem[];
  totalCount: number;
}

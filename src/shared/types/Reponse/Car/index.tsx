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
  engineSize: 2.5;
  fuelType: string;
  transmission: "Automatic";
  driveType: string;
  doors: number;
  seats: number;
  color: string;
  mileage: number;
  videoPath: any | null;
  imagePaths: any[];
  primaryImagePath: any;
  detailedDescription: string | null;
  shortDescription: string;
  isFeature: boolean;
  viewCount: number;
}
export interface CarResponse {
  data: CarResponseItem[];
  total: number;
}

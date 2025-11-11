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

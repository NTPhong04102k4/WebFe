export interface LocationResponse {
  locationID?: number;
  locationCode: string;
  locationName: string;
  locationType: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  phone: string;
  email: string | null;
  openTime: string;
  closeTime: string;
  latitude: string | null;
  longitude: string | null;
  managerName: string | null;
}

export const brandCarRoute = {
  getBrandsCars: "/common/brands",
  createBrandCar: "/common/brands",
  updateBrandCar: (brandCode: string) =>
    `/common/brands/${encodeURIComponent(brandCode)}`,
};

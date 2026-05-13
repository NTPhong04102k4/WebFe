export const brandRoute = {
  getBrands: "/common/brand-accessories",
  createBrand: "/common/brand-accessories",
  updateBrand: (name: string) => `/common/brand-accessories/${encodeURIComponent(name)}`,
};

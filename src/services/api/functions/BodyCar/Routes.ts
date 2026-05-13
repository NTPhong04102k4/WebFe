export const bodyCarRoute = {
  getBodyCars: "/common/bodytypes",
  createBodyType: "/common/body-types",
  updateBodyType: (bodyCode: string) =>
    `/common/body-types/${encodeURIComponent(bodyCode)}`,
};

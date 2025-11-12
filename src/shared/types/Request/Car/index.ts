export type CarListRequest = {
  pageIndex?: number;
  pageSize?: number;
  bodyCode?: string | null;
  brandCode?: string | null;
  priceFrom?: number | null;
  priceTo?: number | null;
  carId?: number | null;
};

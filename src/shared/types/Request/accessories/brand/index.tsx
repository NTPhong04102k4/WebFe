type BrandRequestUpdate = {
  name: string;
  image: File | string | null;
  description: string;
  id?: number | string | null;
};
type BrandRequestCreate = {
  name: string;
  description: string;
  image: File | string | null;
};
export type { BrandRequestUpdate, BrandRequestCreate };

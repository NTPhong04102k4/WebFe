type BrandRequestUpdate = {
  name: string;
  image: File | string | null;
  description: string;
};
type BrandRequestCreate = {
  name: string;
  description: string;
  image: File | string | null;
};
export type { BrandRequestUpdate, BrandRequestCreate };

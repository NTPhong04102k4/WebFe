export type CategoryRequestCreate = {
  categoryName: string;
  description: string;
  parentCategoryID: number | null;
  displayOrder: number;
  isActive: boolean;
};

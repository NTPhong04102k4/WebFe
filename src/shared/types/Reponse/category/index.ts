export interface CategoryResponse {
  categoryID: number;
  categoryName: string;
  description: string;
  parentCategoryID: number | null;
  displayOrder: number;
  isActive: boolean;
}

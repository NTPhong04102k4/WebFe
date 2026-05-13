import type { ServiceCatalogQuery } from "src/services/api/functions/serviceCatalog/serviceCatalog.types";

export const serviceCatalogKeys = {
  all: ["serviceCatalog"] as const,
  list: (query: ServiceCatalogQuery) => [...serviceCatalogKeys.all, "list", query] as const,
  detail: (id: number) => [...serviceCatalogKeys.all, "detail", id] as const,
};

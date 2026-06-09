import { useEffect, useMemo, useState } from "react";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import { AccessoriesListItem, AccessoryListResponse } from "src/shared/types/Reponse/accessories/accessory";

const PAGE_SIZE = 8;

export type AccessoriesHandlerReturn = {
  brands: BrandAccessoryResponse[];
  loadingBrands: boolean;
  selectedBrandControlId: string;
  setSelectedBrandControlId: (id: string) => void;
  filteredItems: AccessoriesListItem[];
  loadingItems: boolean;
  currentPage: number;
  totalPages: number;
  selectedBrands: Set<string>;
  setPage: (page: number) => void;
  refreshBrands: () => Promise<void>;
  handleSelectAll: () => void;
  handleToggleBrand: (id: string) => void;
};

export function useAccessoriesHandler(): AccessoriesHandlerReturn {
  const [brands, setBrands] = useState<BrandAccessoryResponse[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [selectedBrandControlId, setSelectedBrandControlId] = useState("");
  const [allRaw, setAllRaw] = useState<AccessoriesListItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [currentPage, setPage] = useState(1);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set(["all"]));

  const filteredItems = useMemo(() => {
    if (selectedBrands.has("all")) return allRaw;
    return allRaw.filter((item) => selectedBrands.has(String(item.brandName)));
  }, [allRaw, selectedBrands]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)),
    [filteredItems.length]
  );

  useEffect(() => {
    setPage((p) => Math.min(Math.max(p, 1), totalPages));
  }, [totalPages]);

  const refreshBrands = async () => {
    setLoadingBrands(true);
    try {
      const res = await brandRouteFn.getBrands();
      const source = res as unknown as BrandAccessoryResponse[];
      setBrands(
        source.map((b) => ({
          name: String(b.name),
          description: b.description ?? "",
          image: b.image ?? null,
        }))
      );
    } catch {
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  const refreshAccessories = async () => {
    setLoadingItems(true);
    try {
      const res: AccessoryListResponse = await accessoryRouteFn.getAll();
      setAllRaw(res.items ?? []);
    } catch {
      setAllRaw([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await refreshBrands();
      await refreshAccessories();
    })();
  }, []);

  const handleSelectAll = () => {
    setSelectedBrands(new Set(["all"]));
    setPage(1);
  };

  const handleToggleBrand = (id: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      const idStr = String(id);
      if (next.has("all")) next.delete("all");
      if (next.has(idStr)) {
        next.delete(idStr);
      } else {
        next.add(idStr);
      }
      if (next.size === 0) next.add("all");
      return next;
    });
    setPage(1);
  };

  return {
    brands,
    loadingBrands,
    selectedBrandControlId,
    setSelectedBrandControlId,
    filteredItems,
    loadingItems,
    currentPage,
    totalPages,
    selectedBrands,
    setPage,
    refreshBrands,
    handleSelectAll,
    handleToggleBrand,
  };
}

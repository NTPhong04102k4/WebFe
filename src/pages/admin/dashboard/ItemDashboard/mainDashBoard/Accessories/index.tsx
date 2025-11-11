import React, { useEffect, useMemo, useState } from "react";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import { BrandFilter } from "./Item/BrandFilter";
import { AccessoryGrid } from "./Item/AccessoryGrid";
import { Pagination } from "./Item/Pagination";
import { BrandControls } from "./Item/BrandControls";
import { AccessoryEditor } from "./Item/AccessoryEditor";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import {
  AccessoriesListItem,
  AccessoryListResponse,
} from "src/shared/types/Reponse/accessories/accessory";

export const Accessories = () => {
  const [brands, setBrands] = useState<BrandAccessoryResponse[]>([]);
  const [loadingBrands, setLoadingBrands] = useState<boolean>(false);
  const [selectedBrandControlId, setSelectedBrandControlId] =
    useState<string>("");

  const [allRaw, setAllRaw] = useState<AccessoriesListItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(false);
  const [currentPage, setPage] = useState<number>(1);

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(
    new Set(["all"])
  );
  const filteredItems = useMemo(() => {
    if (selectedBrands.has("all")) return allRaw;
    return allRaw.filter((item) => selectedBrands.has(String(item.brandName)));
  }, [allRaw, selectedBrands]);
  const pageSize = 8;
  const totalPages = useMemo(() => {
    const count = filteredItems.length;
    return Math.max(1, Math.ceil(count / pageSize));
  }, [filteredItems.length]);
  useEffect(() => {
    // Clamp current page when filtered list changes
    setPage((p) => {
      if (p < 1) return 1;
      if (p > totalPages) return totalPages;
      return p;
    });
  }, [totalPages]);
  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage]);
  const refreshBrands = async () => {
    setLoadingBrands(true);
    try {
      const res = await brandRouteFn.getBrands();
      const source: BrandAccessoryResponse[] =
        res as unknown as BrandAccessoryResponse[];
      const normalized: BrandAccessoryResponse[] = source.map((b) => ({
        name: String(b.name),
        description: b.description ?? "",
        image: b.image ?? null,
      }));
      setBrands(normalized);
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
      const source: AccessoriesListItem[] = res.items ?? [];
      setAllRaw(source);
    } catch {
      setAllRaw([]);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    (async () => {
      await refreshBrands();
      await refreshAccessories();
    })();
  }, []);

  const [editorOpen, setEditorOpen] = useState<boolean>(false);
  const [editingAccessoryId, setEditingAccessoryId] = useState<
    string | number | null
  >(null);

  return (
    <div className="bg-white rounded-lg shadow p-4 transition-opacity duration-300">
      <h2 className="text-xl font-bold mb-4">Quản lý Phụ kiện</h2>

      <div className="mb-3 flex items-center justify-end gap-2">
        <BrandControls
          brands={brands}
          onChanged={() => {
            refreshBrands();
          }}
          selectedId={selectedBrandControlId}
          setSelectedId={setSelectedBrandControlId}
        />
        <button
          type="button"
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
          onClick={() => {
            setEditingAccessoryId(null);
            setEditorOpen(true);
          }}
        >
          + Thêm phụ kiện
        </button>
      </div>
      <BrandFilter
        brands={brands.map((b) => ({ id: b.name, name: b.name }))}
        loading={loadingBrands}
        isAllSelected={selectedBrands.has("all")}
        selectedBrands={selectedBrands}
        onSelectAll={() => {
          setSelectedBrands(new Set(["all"]));
          setPage(1);
        }}
        onToggleBrand={(id: string) => {
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
        }}
      />

      <AccessoryGrid
        items={filteredItems.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        )}
        loading={loadingItems}
        emptyText="Chưa có dữ liệu phụ kiện"
        onEdit={(id) => {
          setEditingAccessoryId(id);
          setEditorOpen(true);
        }}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={() => {
          if (currentPage > 1) setPage((p) => p - 1);
        }}
        onNext={() => {
          if (currentPage < totalPages) setPage((p) => p + 1);
        }}
      />

      <AccessoryEditor
        open={editorOpen}
        accessoryId={editingAccessoryId}
        onClose={() => setEditorOpen(false)}
        onSaved={async () => {
          await refreshAccessories();
        }}
      />
    </div>
  );
};

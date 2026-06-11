import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import type { ComboTreeItem, MultiComboboxOption } from "src/components/core";
import {
  useAccessoryDetail,
  useAccessoryList,
  useAccessoryMutations,
} from "src/query/accessory/useAccessoryQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { useBrandAccessoryList } from "src/query/brand-accessory/useBrandAccessoryQueries";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useServiceCategoryList } from "src/query/service-category/useServiceCategoryQueries";
import { serviceCatalogApi } from "src/services/api/functions/serviceCatalog/serviceCatalog.api";
import { useAuthStore } from "src/stores/authStore";
import type {
  AccessoriesListItem,
  AccessoryDetailResponse,
} from "src/shared/types/Reponse/accessories/accessory";
import type {
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import type { AccessoryFormValues } from "../data";

const emptyForm: AccessoryFormValues = {
  accessoryCode: "",
  accessoryName: "",
  categoryID: "",
  brandAccessoryID: "",
  description: "",
  price: "",
  costPrice: "",
  stockQuantity: "0",
  minStockLevel: "0",
  maxStockLevel: "0",
  compatibleBrands: [],
  compatibleBodyTypes: [],
  imagePath: null,
  installationVideo: null,
  warrantyMonths: "",
};

const BRAND_KEY = "brand";
const BODY_TYPE_KEY = "bodytype";

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function parseCompatibleModels(
  value: AccessoryDetailResponse["compatibleCarModels"],
): string[] {
  let current: unknown = value;

  // API có thể trả về chuỗi JSON hoặc mảng chứa 1 chuỗi JSON lồng nhau
  // (vd: ["[\"brand:TOYOTA\",\"bodytype:SEDAN\"]"]) -> bóc tách đến khi
  // còn lại 1 mảng phẳng các chuỗi "key:value".
  for (let depth = 0; depth < 5; depth++) {
    if (!current) return [];

    if (Array.isArray(current)) {
      const currentArray: unknown[] = current;
      if (
        currentArray.length === 1 &&
        typeof currentArray[0] === "string" &&
        /^[[{]/.test(currentArray[0].trim())
      ) {
        try {
          current = JSON.parse(currentArray[0] as string);
          continue;
        } catch {
          return currentArray.map((item) => String(item));
        }
      }
      return currentArray.map((item) => String(item));
    }

    if (typeof current === "string") {
      try {
        current = JSON.parse(current);
        continue;
      } catch {
        return [];
      }
    }

    return [];
  }

  return [];
}

function toCompatibleEntries(models: string[]): Array<[string, string]> {
  return models
    .map((model) => {
      const separatorIndex = model.indexOf(":");
      if (separatorIndex === -1) return null;
      const key = model.slice(0, separatorIndex).trim().toLowerCase();
      const value = model.slice(separatorIndex + 1).trim();
      return [key, value] as [string, string];
    })
    .filter((entry): entry is [string, string] => entry !== null);
}

function findTreeLabel(items: ComboTreeItem[], id: string): string | undefined {
  for (const item of items) {
    if (item.id === id) return item.label;
    if (item.children) {
      const found = findTreeLabel(item.children, id);
      if (found) return found;
    }
  }
}

function formFromDetail(detail: AccessoryDetailResponse): AccessoryFormValues {
  const compatibleModels = parseCompatibleModels(detail.compatibleCarModels);
  const compatibleEntries = toCompatibleEntries(compatibleModels);
  const compatibleBrands = compatibleEntries
    .filter(([key]) => key === BRAND_KEY)
    .map(([, value]) => value);
  const compatibleBodyTypes = compatibleEntries
    .filter(([key]) => key === BODY_TYPE_KEY)
    .map(([, value]) => value);

  console.log("[formFromDetail] raw compatibleCarModels=", detail.compatibleCarModels);
  console.log("[formFromDetail] parsed compatibleModels=", compatibleModels);
  console.log("[formFromDetail] compatibleEntries=", compatibleEntries);
  console.log("[formFromDetail] compatibleBrands=", compatibleBrands, "compatibleBodyTypes=", compatibleBodyTypes);

  return {
    accessoryCode: detail.accessoryCode ?? "",
    accessoryName: detail.accessoryName ?? "",
    categoryID: String(detail.categoryID ?? ""),
    brandAccessoryID: detail.brandAccessoryID
      ? String(detail.brandAccessoryID)
      : "",
    description: detail.description ?? "",
    price: String(detail.price ?? ""),
    costPrice: detail.costPrice != null ? String(detail.costPrice) : "",
    stockQuantity: String(detail.stockQuantity ?? 0),
    minStockLevel: String(detail.minStockLevel ?? 0),
    maxStockLevel: String(detail.maxStockLevel ?? 0),
    compatibleBrands,
    compatibleBodyTypes,
    imagePath: null,
    installationVideo: null,
    warrantyMonths:
      detail.warrantyMonths != null ? String(detail.warrantyMonths) : "",
  };
}

export function useAccessoryManagement() {
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortBy, setSortBy] = useState("accessoryName");
  const [sortDescending, setSortDescending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectId, setSelectId] = useState<number | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<AccessoriesListItem | null>(null);
  const pageSize = 10;

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      brandAccessoryID: selectedBrand ? Number(selectedBrand) : null,
      sortBy,
      sortDescending,
    }),
    [page, pageSize, selectedBrand, sortBy, sortDescending],
  );

  const accessoryQuery = useAccessoryList(listParams);
  const categoryQuery = useServiceCategoryList();
  const brandQuery = useBrandAccessoryList();
  const carBrandQuery = useBrandCarList();
  const bodyTypeQuery = useBodyTypeList();
  const detailQuery = useAccessoryDetail(selectId);
  const { createAccessory, updateAccessory, deleteAccessory } =
    useAccessoryMutations();

  const carBrandOptions = useMemo<MultiComboboxOption[]>(
    () =>
      (carBrandQuery.data ?? []).map((brand) => ({
        value: brand.brandCode,
        label: brand.brandName,
      })),
    [carBrandQuery.data],
  );

  const bodyTypeOptions = useMemo<MultiComboboxOption[]>(
    () =>
      (bodyTypeQuery.data ?? []).map((bodyType) => ({
        value: bodyType.bodyCode,
        label: bodyType.bodyName,
      })),
    [bodyTypeQuery.data],
  );

  const serviceCatalogQuery = useQuery({
    queryKey: ["service-catalog", "tree-filter"],
    queryFn: () =>
      serviceCatalogApi.list({ page: 1, pageSize: 1000, isActive: true }),
    staleTime: 5 * 60_000,
  });

  const categoryTreeItems = useMemo<ComboTreeItem[]>(() => {
    const raw = serviceCatalogQuery.data as any;
    const services: {
      serviceID: number;
      serviceName: string;
      categoryID: number;
      categoryName?: string | null;
    }[] = raw?.data ?? raw?.items ?? [];

    const catMap = new Map<
      number,
      { id: number; name: string; services: typeof services }
    >();
    for (const svc of services) {
      if (!catMap.has(svc.categoryID)) {
        catMap.set(svc.categoryID, {
          id: svc.categoryID,
          name: svc.categoryName ?? `Danh mục ${svc.categoryID}`,
          services: [],
        });
      }
      catMap.get(svc.categoryID)!.services.push(svc);
    }

    return Array.from(catMap.values()).map((cat) => ({
      id: String(cat.id),
      label: cat.name,
      children: cat.services.map((svc) => ({
        id: `svc_${svc.serviceID}`,
        label: svc.serviceName,
        meta: { categoryID: cat.id },
      })),
    }));
  }, [serviceCatalogQuery.data]);

  const form = useForm<AccessoryFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const editingAccessory = detailQuery.data ?? null;

  const accessories = useMemo(() => {
    let items = accessoryQuery.data?.items ?? [];

    if (selectedCategory) {
      const catName = findTreeLabel(categoryTreeItems, selectedCategory);
      if (catName) {
        items = items.filter((item) => item.categoryName === catName);
      }
    }

    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter((item) =>
        [item.accessoryName, item.categoryName, item.brandName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      );
    }

    return items;
  }, [accessoryQuery.data?.items, search, selectedCategory, categoryTreeItems]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectId(null);
    form.reset(emptyForm);
  };

  const openCreate = () => {
    setSelectId(null);
    form.reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AccessoriesListItem) => {
    setSelectId(item.accessoryID);
    setModalOpen(true);
  };

  useEffect(() => {
    console.log("[useAccessoryManagement] reset effect", {
      modalOpen,
      selectId,
      editingAccessoryID: editingAccessory?.accessoryID,
      editingAccessory,
    });
    if (
      !modalOpen ||
      !editingAccessory ||
      selectId !== editingAccessory.accessoryID
    )
      return;
    const formValues = formFromDetail(editingAccessory);
    console.log("[useAccessoryManagement] form.reset values", formValues);
    form.reset(formValues);
  }, [editingAccessory, selectId, form, modalOpen]);

  const submitForm = form.handleSubmit(async (values) => {
    try {
      const createdBy =
        user?.userID ?? user?.id ?? editingAccessory?.createdBy ?? 1;
      const basePayload = {
        accessoryCode: values.accessoryCode.trim(),
        accessoryName: values.accessoryName.trim(),
        categoryID: toNumber(values.categoryID),
        brandAccessoryID: values.brandAccessoryID
          ? toNumber(values.brandAccessoryID)
          : null,
        description: values.description.trim(),
        price: toNumber(values.price),
        costPrice: values.costPrice ? toNumber(values.costPrice) : null,
        stockQuantity: toNumber(values.stockQuantity),
        minStockLevel: toNumber(values.minStockLevel),
        maxStockLevel: toNumber(values.maxStockLevel),
        compatibleCarModels: JSON.stringify([
          ...values.compatibleBrands.map((code) => `${BRAND_KEY}:${code}`),
          ...values.compatibleBodyTypes.map(
            (code) => `${BODY_TYPE_KEY}:${code}`,
          ),
        ]),
        imagePath: values.imagePath,
        installationVideo: values.installationVideo,
        warrantyMonths: values.warrantyMonths
          ? toNumber(values.warrantyMonths)
          : null,
        createdBy,
      };

      if (editingAccessory) {
        const body: AccessoryRequestUpdate = {
          ...basePayload,
          accessoryID: editingAccessory.accessoryID,
        };
        await updateAccessory.mutateAsync({
          id: editingAccessory.accessoryID,
          body,
        });
        notify.success("Cập nhật phụ kiện thành công");
      } else {
        await createAccessory.mutateAsync(
          basePayload as AccessoryRequestCreate,
        );
        notify.success("Tạo phụ kiện thành công");
      }

      closeModal();
    } catch {
      // interceptor đã hiển thị toast lỗi
    }
  });

  const handleDelete = (item: AccessoriesListItem) => {
    setDeleteConfirmItem(item);
  };

  const confirmDelete = () => {
    if (!deleteConfirmItem) return;
    deleteAccessory.mutate(deleteConfirmItem.accessoryID, {
      onSuccess: () => {
        notify.success("Xóa phụ kiện thành công");
        setDeleteConfirmItem(null);
      },
    });
  };

  return {
    accessories,
    bodyTypeOptions,
    brands: brandQuery.data ?? [],
    carBrandOptions,
    categories: categoryQuery.data ?? [],
    categoryTreeItems,
    deleteConfirmItem,
    editingAccessory,
    error: (accessoryQuery.error ?? null) as Error | null,
    form,
    isBodyTypeLoading: bodyTypeQuery.isLoading,
    isCarBrandLoading: carBrandQuery.isLoading,
    isCategoryLoading: serviceCatalogQuery.isLoading,
    isLoading:
      accessoryQuery.isLoading ||
      categoryQuery.isLoading ||
      brandQuery.isLoading,
    isSaving: createAccessory.isPending || updateAccessory.isPending,
    isDeleting: deleteAccessory.isPending,
    isSyncing: accessoryQuery.isFetching && !accessoryQuery.isLoading,
    modalOpen,
    page,
    pageSize,
    search,
    selectedBrand,
    selectedCategory,
    sortBy,
    sortDescending,
    totalPages: accessoryQuery.data?.totalPages ?? 1,
    closeModal,
    confirmDelete,
    handleDelete,
    setDeleteConfirmItem,
    openCreate,
    openEdit,
    setPage,
    setSearch,
    setSelectedBrand: (value: string) => {
      setSelectedBrand(value);
      setPage(1);
    },
    setSelectedCategory: (value: string) => {
      setSelectedCategory(value);
      setPage(1);
    },
    setSortBy,
    setSortDescending,
    submitForm,
  };
}

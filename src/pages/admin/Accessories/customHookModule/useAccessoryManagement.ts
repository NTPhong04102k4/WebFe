import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import type { MultiComboboxOption } from "src/components/core";
import {
  useAccessoryDetail,
  useAccessoryList,
  useAccessoryMutations,
} from "src/query/accessory/useAccessoryQueries";
import { useBodyTypeList } from "src/query/body-type/useBodyTypeQueries";
import { useBrandAccessoryList } from "src/query/brand-accessory/useBrandAccessoryQueries";
import { useBrandCarList } from "src/query/brand-car/useBrandCarQueries";
import { useCategoryList } from "src/query/category/useCategoryQueries";
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

function formFromDetail(detail: AccessoryDetailResponse): AccessoryFormValues {
  const compatibleModels = parseCompatibleModels(detail.compatibleCarModels);
  const compatibleEntries = toCompatibleEntries(compatibleModels);
  const compatibleBrands = compatibleEntries
    .filter(([key]) => key === BRAND_KEY)
    .map(([, value]) => value);
  const compatibleBodyTypes = compatibleEntries
    .filter(([key]) => key === BODY_TYPE_KEY)
    .map(([, value]) => value);

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
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [sortOption, setSortOptionState] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectId, setSelectId] = useState<number | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] =
    useState<AccessoriesListItem | null>(null);
  const pageSize = 10;

  const [sortBy, sortDirection] = sortOption ? sortOption.split(":") : ["", ""];
  const sortDescending = sortDirection === "desc";

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      categoryID:
        selectedCategories.length === 1 ? Number(selectedCategories[0]) : null,
      categoryIDs:
        selectedCategories.length > 1 ? selectedCategories.map(Number) : null,
      brandAccessoryID: selectedBrand ? Number(selectedBrand) : null,
      sortBy: sortBy || null,
      sortDescending,
    }),
    [page, pageSize, selectedCategories, selectedBrand, sortBy, sortDescending],
  );

  const accessoryQuery = useAccessoryList(listParams);
  const categoryQuery = useCategoryList();
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

  const categoryOptions = useMemo<MultiComboboxOption[]>(
    () =>
      (categoryQuery.data ?? [])
        .filter((c) => c.isActive)
        .map((c) => ({ value: String(c.categoryID), label: c.categoryName })),
    [categoryQuery.data],
  );

  const form = useForm<AccessoryFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const editingAccessory = detailQuery.data ?? null;

  const accessories = accessoryQuery.data?.items ?? [];

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
    if (
      !modalOpen ||
      !editingAccessory ||
      selectId !== editingAccessory.accessoryID
    )
      return;
    form.reset(formFromDetail(editingAccessory));
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
    categoryOptions,
    deleteConfirmItem,
    editingAccessory,
    error: (accessoryQuery.error ?? null) as Error | null,
    form,
    isBodyTypeLoading: bodyTypeQuery.isLoading,
    isCarBrandLoading: carBrandQuery.isLoading,
    isCategoryLoading: categoryQuery.isLoading,
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
    selectedBrand,
    selectedCategories,
    sortOption,
    totalPages: accessoryQuery.data?.totalPages ?? 1,
    closeModal,
    confirmDelete,
    handleDelete,
    setDeleteConfirmItem,
    openCreate,
    openEdit,
    setPage,
    setSelectedBrand: (value: string) => {
      setSelectedBrand(value);
      setPage(1);
    },
    setSelectedCategories: (value: string[]) => {
      setSelectedCategoriesState(value);
      setPage(1);
    },
    setSortOption: (value: string) => {
      setSortOptionState(value);
      setPage(1);
    },
    submitForm,
  };
}

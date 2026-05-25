import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import { useAccessoryDetail, useAccessoryList, useAccessoryMutations } from "src/query/accessory/useAccessoryQueries";
import { useBrandAccessoryList } from "src/query/brand-accessory/useBrandAccessoryQueries";
import { useServiceCategoryList } from "src/query/service-category/useServiceCategoryQueries";
import { useAuthStore } from "src/stores/authStore";
import type { AccessoriesListItem, AccessoryDetailResponse } from "src/shared/types/Reponse/accessories/accessory";
import type { AccessoryRequestCreate, AccessoryRequestUpdate } from "src/shared/types/Request/accessories/accessory";
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
  compatibleCarModels: "",
  imagePath: null,
  installationVideo: null,
  warrantyMonths: "",
};

const toNumber = (value: string, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function formFromDetail(detail: AccessoryDetailResponse): AccessoryFormValues {
  return {
    accessoryCode: detail.accessoryCode ?? "",
    accessoryName: detail.accessoryName ?? "",
    categoryID: String(detail.categoryID ?? ""),
    brandAccessoryID: detail.brandAccessoryID ? String(detail.brandAccessoryID) : "",
    description: detail.description ?? "",
    price: String(detail.price ?? ""),
    costPrice: detail.costPrice != null ? String(detail.costPrice) : "",
    stockQuantity: String(detail.stockQuantity ?? 0),
    minStockLevel: String(detail.minStockLevel ?? 0),
    maxStockLevel: String(detail.maxStockLevel ?? 0),
    compatibleCarModels: detail.compatibleCarModels ?? "",
    imagePath: null,
    installationVideo: null,
    warrantyMonths: detail.warrantyMonths != null ? String(detail.warrantyMonths) : "",
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const pageSize = 10;

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      categoryID: selectedCategory ? Number(selectedCategory) : null,
      brandAccessoryID: selectedBrand ? Number(selectedBrand) : null,
      sortBy,
      sortDescending,
    }),
    [page, pageSize, selectedBrand, selectedCategory, sortBy, sortDescending]
  );

  const accessoryQuery = useAccessoryList(listParams);
  const categoryQuery = useServiceCategoryList();
  const brandQuery = useBrandAccessoryList();
  const detailQuery = useAccessoryDetail(editingId);
  const { createAccessory, updateAccessory, deleteAccessory } = useAccessoryMutations();

  const form = useForm<AccessoryFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const editingAccessory = detailQuery.data ?? null;

  const accessories = useMemo(() => {
    const items = accessoryQuery.data?.items ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((item) =>
      [item.accessoryName, item.categoryName, item.brandName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [accessoryQuery.data?.items, search]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    form.reset(emptyForm);
  };

  const openCreate = () => {
    setEditingId(null);
    form.reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item: AccessoriesListItem) => {
    setEditingId(item.accessoryID);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen || !editingAccessory || editingId !== editingAccessory.accessoryID) return;
    form.reset(formFromDetail(editingAccessory));
  }, [editingAccessory, editingId, form, modalOpen]);

  const submitForm = form.handleSubmit(async (values) => {
    try {
      const createdBy = user?.userID ?? user?.id ?? editingAccessory?.createdBy ?? 1;
      const basePayload = {
        accessoryCode: values.accessoryCode.trim(),
        accessoryName: values.accessoryName.trim(),
        categoryID: toNumber(values.categoryID),
        brandAccessoryID: values.brandAccessoryID ? toNumber(values.brandAccessoryID) : null,
        description: values.description.trim(),
        price: toNumber(values.price),
        costPrice: values.costPrice ? toNumber(values.costPrice) : null,
        stockQuantity: toNumber(values.stockQuantity),
        minStockLevel: toNumber(values.minStockLevel),
        maxStockLevel: toNumber(values.maxStockLevel),
        compatibleCarModels: values.compatibleCarModels.trim(),
        imagePath: values.imagePath,
        installationVideo: values.installationVideo,
        warrantyMonths: values.warrantyMonths ? toNumber(values.warrantyMonths) : null,
        createdBy,
      };

      if (editingAccessory) {
        const body: AccessoryRequestUpdate = {
          ...basePayload,
          accessoryID: editingAccessory.accessoryID,
        };
        await updateAccessory.mutateAsync({ id: editingAccessory.accessoryID, body });
        notify.success("Cap nhat phu kien thanh cong");
      } else {
        await createAccessory.mutateAsync(basePayload as AccessoryRequestCreate);
        notify.success("Tao phu kien thanh cong");
      }

      closeModal();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Luu phu kien that bai");
    }
  });

  const handleDelete = (item: AccessoriesListItem) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phụ kiện "${item.accessoryName}" không? Hành động này không thể hoàn tác.`)) return;
    deleteAccessory.mutate(item.accessoryID, {
      onSuccess: () => notify.success("Xóa phụ kiện thành công"),
      onError: () => notify.error("Có lỗi xảy ra khi xóa phụ kiện"),
    });
  };

  return {
    accessories,
    brands: brandQuery.data ?? [],
    categories: categoryQuery.data ?? [],
    editingAccessory,
    error: (accessoryQuery.error ?? null) as Error | null,
    form,
    isLoading: accessoryQuery.isLoading || categoryQuery.isLoading || brandQuery.isLoading,
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
    openCreate,
    openEdit,
    handleDelete,
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

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import type { ComboTreeItem } from "src/components/core";
import { useAccessoryDetail, useAccessoryList, useAccessoryMutations } from "src/query/accessory/useAccessoryQueries";
import { useBrandAccessoryList } from "src/query/brand-accessory/useBrandAccessoryQueries";
import { useServiceCategoryList } from "src/query/service-category/useServiceCategoryQueries";
import { serviceCatalogApi } from "src/services/api/functions/serviceCatalog/serviceCatalog.api";
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

const compatibleModelsToFormValue = (value: AccessoryDetailResponse["compatibleCarModels"]) =>
  Array.isArray(value) ? JSON.stringify(value) : value ?? "";

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
    compatibleCarModels: compatibleModelsToFormValue(detail.compatibleCarModels),
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
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<AccessoriesListItem | null>(null);
  const pageSize = 10;

  const listParams = useMemo(
    () => ({
      page,
      pageSize,
      brandAccessoryID: selectedBrand ? Number(selectedBrand) : null,
      sortBy,
      sortDescending,
    }),
    [page, pageSize, selectedBrand, sortBy, sortDescending]
  );

  const accessoryQuery = useAccessoryList(listParams);
  const categoryQuery = useServiceCategoryList();
  const brandQuery = useBrandAccessoryList();
  const detailQuery = useAccessoryDetail(editingId);
  const { createAccessory, updateAccessory, deleteAccessory } = useAccessoryMutations();

  const serviceCatalogQuery = useQuery({
    queryKey: ["service-catalog", "tree-filter"],
    queryFn: () => serviceCatalogApi.list({ page: 1, pageSize: 1000, isActive: true }),
    staleTime: 5 * 60_000,
  });

  const categoryTreeItems = useMemo<ComboTreeItem[]>(() => {
    const raw = serviceCatalogQuery.data as any;
    const services: { serviceID: number; serviceName: string; categoryID: number; categoryName?: string | null }[] =
      raw?.data ?? raw?.items ?? [];

    const catMap = new Map<number, { id: number; name: string; services: typeof services }>();
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
        notify.success("Cập nhật phụ kiện thành công");
      } else {
        await createAccessory.mutateAsync(basePayload as AccessoryRequestCreate);
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
    brands: brandQuery.data ?? [],
    categories: categoryQuery.data ?? [],
    categoryTreeItems,
    deleteConfirmItem,
    editingAccessory,
    error: (accessoryQuery.error ?? null) as Error | null,
    form,
    isCategoryLoading: serviceCatalogQuery.isLoading,
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
    confirmDelete,
    openCreate,
    openEdit,
    handleDelete,
    setDeleteConfirmItem,
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

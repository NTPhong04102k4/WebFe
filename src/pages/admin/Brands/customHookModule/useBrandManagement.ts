import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { notify } from "src/components/core";
import {
  useBrandCarList,
  useBrandCarMutations,
} from "src/query/brand-car/useBrandCarQueries";
import type { BrandCarPayload } from "src/services/api/functions/BrandCar/Routes.Fn";
import type { BrandCarResponse } from "src/shared/types/Reponse/Car";

export type BrandFormValues = {
  brandCode: string;
  brandName: string;
  countryOrigin: string;
  website: string;
  description: string;
  logo: File | null;
};

const emptyForm: BrandFormValues = {
  brandCode: "",
  brandName: "",
  countryOrigin: "",
  website: "",
  description: "",
  logo: null,
};

function formFromBrand(brand: BrandCarResponse): BrandFormValues {
  return {
    brandCode: brand.brandCode ?? "",
    brandName: brand.brandName ?? "",
    countryOrigin: brand.countryOrigin ?? "",
    website: brand.website ?? "",
    description: brand.description ?? "",
    logo: null,
  };
}

function toPayload(values: BrandFormValues, editingBrand: BrandCarResponse | null): BrandCarPayload {
  return {
    brandCode: values.brandCode.trim(),
    brandName: values.brandName.trim(),
    countryOrigin: values.countryOrigin.trim(),
    website: values.website.trim(),
    description: values.description.trim(),
    logo: values.logo,
    logoPath: editingBrand?.logoPath ?? null,
  };
}

export function useBrandManagement() {
  const { data: brands = [], isLoading, isFetching, error } = useBrandCarList();
  const { createBrandCar, updateBrandCar } = useBrandCarMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandCarResponse | null>(null);

  const form = useForm<BrandFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const filteredBrands = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;

    return brands.filter((brand) =>
      [brand.brandCode, brand.brandName, brand.countryOrigin, brand.website]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [brands, search]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingBrand(null);
    form.reset(emptyForm);
  };

  const openCreate = () => {
    setEditingBrand(null);
    form.reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (brand: BrandCarResponse) => {
    setEditingBrand(brand);
    form.reset(formFromBrand(brand));
    setModalOpen(true);
  };

  const submitForm = form.handleSubmit(async (values) => {
    try {
      const payload = toPayload(values, editingBrand);

      if (editingBrand) {
        await updateBrandCar.mutateAsync({
          brandCode: editingBrand.brandCode,
          data: payload,
        });
        notify.success("Cap nhat hang xe thanh cong");
      } else {
        await createBrandCar.mutateAsync(payload);
        notify.success("Tao hang xe thanh cong");
      }

      closeModal();
    } catch (e) {
      notify.error(e instanceof Error ? e.message : "Luu hang xe that bai");
    }
  });

  return {
    error,
    search,
    setSearch,
    modalOpen,
    editingBrand,
    filteredBrands,
    form,
    isLoading,
    isSaving: createBrandCar.isPending || updateBrandCar.isPending,
    isSyncing: isFetching && !isLoading,
    closeModal,
    openCreate,
    openEdit,
    submitForm,
  };
}

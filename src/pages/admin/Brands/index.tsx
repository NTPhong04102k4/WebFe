import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  useBrandCarList,
  useBrandCarMutations,
} from "@/query/brand-car/useBrandCarQueries";
import type { BrandCarResponse } from "@/shared/types/Reponse/Car";

type BrandFormValues = {
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

export default function AdminBrandsPage() {
  const { data: brands = [], isLoading, isFetching, error } = useBrandCarList();
  const { createBrandCar, updateBrandCar } = useBrandCarMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandCarResponse | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
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
    reset(emptyForm);
  };

  const openCreate = () => {
    setEditingBrand(null);
    reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (brand: BrandCarResponse) => {
    setEditingBrand(brand);
    reset(formFromBrand(brand));
    setModalOpen(true);
  };

  const submit = async (values: BrandFormValues) => {
    const payload = {
      brandCode: values.brandCode.trim(),
      brandName: values.brandName.trim(),
      countryOrigin: values.countryOrigin.trim(),
      website: values.website.trim(),
      description: values.description.trim(),
      logo: values.logo,
      logoPath: editingBrand?.logoPath ?? null,
    };

    if (editingBrand) {
      await updateBrandCar.mutateAsync({
        brandCode: editingBrand.brandCode,
        data: payload,
      });
      toast.success("Cập nhật hãng xe thành công");
    } else {
      await createBrandCar.mutateAsync(payload);
      toast.success("Tạo hãng xe thành công");
    }

    closeModal();
  };

  const isSaving = createBrandCar.isPending || updateBrandCar.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý hãng xe</h1>
            <p className="mt-1 text-sm text-slate-600">
              Danh mục hãng dùng cho bộ lọc và form xe
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={openCreate}
          >
            + Tạo hãng
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên, quốc gia..."
          />
          {isFetching && !isLoading ? (
            <span className="text-xs text-slate-500">Đang đồng bộ...</span>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Lỗi: {error.message}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="grid grid-cols-1 gap-0 md:grid-cols-5 md:border-b md:border-slate-200 md:bg-slate-50">
            <div className="px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">Hãng</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Quốc gia</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Website</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Hành động</div>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Không có hãng xe</div>
          ) : (
            filteredBrands.map((brand) => (
              <div
                key={brand.brandCode}
                className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 md:grid-cols-5 md:gap-2"
              >
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {brand.logoPath ? (
                      <img className="h-full w-full object-contain" src={brand.logoPath} alt={brand.brandName} />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{brand.brandName}</div>
                    <div className="truncate text-xs text-slate-600">Code: {brand.brandCode}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700">{brand.countryOrigin || "-"}</div>
                <div className="truncate text-sm text-slate-700">{brand.website || "-"}</div>
                <div className="flex md:justify-end">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => openEdit(brand)}
                  >
                    Sửa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl"
            onSubmit={handleSubmit((values) => {
              submit(values).catch((e: any) =>
                toast.error(e?.message ?? "Lưu hãng xe thất bại")
              );
            })}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {editingBrand ? "Chỉnh sửa hãng xe" : "Tạo hãng xe"}
                </div>
                <div className="text-xs text-slate-500">Mã hãng là khóa dùng khi lọc xe</div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={closeModal}
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 py-5 md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Mã hãng</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 read-only:bg-slate-50"
                  readOnly={Boolean(editingBrand)}
                  {...register("brandCode", {
                    required: "Vui lòng nhập mã hãng",
                    setValueAs: (value) => String(value).trim(),
                  })}
                />
                {errors.brandCode ? (
                  <span className="text-xs text-red-600">{errors.brandCode.message}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Tên hãng</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  {...register("brandName", {
                    required: "Vui lòng nhập tên hãng",
                    setValueAs: (value) => String(value).trim(),
                  })}
                />
                {errors.brandName ? (
                  <span className="text-xs text-red-600">{errors.brandName.message}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Quốc gia</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  {...register("countryOrigin")}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Website</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  {...register("website")}
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Mô tả</span>
                <textarea
                  className="min-h-[88px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  {...register("description")}
                />
              </label>
              <Controller
                name="logo"
                control={control}
                render={({ field: { onChange } }) => (
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={closeModal}
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {editingBrand ? "Lưu thay đổi" : "Tạo hãng"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

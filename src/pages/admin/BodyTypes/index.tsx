import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  useBodyTypeList,
  useBodyTypeMutations,
} from "@/query/body-type/useBodyTypeQueries";
import type { BodyCarReponse } from "@/shared/types/Reponse/Car";

type BodyTypeFormValues = {
  bodyCode: string;
  bodyName: string;
  seatCapacityRange: string;
  description: string;
  image: File | null;
};

const emptyForm: BodyTypeFormValues = {
  bodyCode: "",
  bodyName: "",
  seatCapacityRange: "",
  description: "",
  image: null,
};

function formFromBodyType(bodyType: BodyCarReponse): BodyTypeFormValues {
  return {
    bodyCode: bodyType.bodyCode ?? "",
    bodyName: bodyType.bodyName ?? "",
    seatCapacityRange: bodyType.seatCapacityRange ?? "",
    description: bodyType.description ?? "",
    image: null,
  };
}

export default function AdminBodyTypesPage() {
  const { data: bodyTypes = [], isLoading, isFetching, error } = useBodyTypeList();
  const { createBodyType, updateBodyType } = useBodyTypeMutations();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBodyType, setEditingBodyType] = useState<BodyCarReponse | null>(null);

  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<BodyTypeFormValues>({
    defaultValues: emptyForm,
    mode: "onBlur",
  });

  const filteredBodyTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bodyTypes;
    return bodyTypes.filter((bodyType) =>
      [bodyType.bodyCode, bodyType.bodyName, bodyType.seatCapacityRange]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [bodyTypes, search]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingBodyType(null);
    reset(emptyForm);
  };

  const openCreate = () => {
    setEditingBodyType(null);
    reset(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (bodyType: BodyCarReponse) => {
    setEditingBodyType(bodyType);
    reset(formFromBodyType(bodyType));
    setModalOpen(true);
  };

  const submit = async (values: BodyTypeFormValues) => {
    const payload = {
      bodyCode: values.bodyCode.trim(),
      bodyName: values.bodyName.trim(),
      seatCapacityRange: values.seatCapacityRange.trim(),
      description: values.description.trim(),
      image: values.image,
      imagePath: editingBodyType?.imagePath ?? null,
    };

    if (editingBodyType) {
      await updateBodyType.mutateAsync({
        bodyCode: editingBodyType.bodyCode,
        data: payload,
      });
      toast.success("Cập nhật kiểu thân xe thành công");
    } else {
      await createBodyType.mutateAsync(payload);
      toast.success("Tạo kiểu thân xe thành công");
    }

    closeModal();
  };

  const isSaving = createBodyType.isPending || updateBodyType.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý kiểu thân xe</h1>
            <p className="mt-1 text-sm text-slate-600">
              Danh mục body type dùng cho bộ lọc và form xe
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={openCreate}
          >
            + Tạo kiểu thân
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên, số ghế..."
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
            <div className="px-4 py-3 text-sm font-semibold text-slate-700 md:col-span-2">Kiểu thân</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Số ghế</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Mô tả</div>
            <div className="px-4 py-3 text-sm font-semibold text-slate-700">Hành động</div>
          </div>

          {filteredBodyTypes.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-500">Không có kiểu thân xe</div>
          ) : (
            filteredBodyTypes.map((bodyType) => (
              <div
                key={bodyType.bodyCode}
                className="grid grid-cols-1 items-center gap-3 border-t border-slate-200 px-4 py-4 md:grid-cols-5 md:gap-2"
              >
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {bodyType.imagePath ? (
                      <img className="h-full w-full object-cover" src={bodyType.imagePath} alt={bodyType.bodyName} />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">{bodyType.bodyName}</div>
                    <div className="truncate text-xs text-slate-600">Code: {bodyType.bodyCode}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700">{bodyType.seatCapacityRange || "-"}</div>
                <div className="truncate text-sm text-slate-700">{bodyType.description || "-"}</div>
                <div className="flex md:justify-end">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    onClick={() => openEdit(bodyType)}
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
                toast.error(e?.message ?? "Lưu kiểu thân xe thất bại")
              );
            })}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <div className="text-base font-bold text-slate-900">
                  {editingBodyType ? "Chỉnh sửa kiểu thân xe" : "Tạo kiểu thân xe"}
                </div>
                <div className="text-xs text-slate-500">Mã body type là khóa dùng khi lọc xe</div>
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
                <span className="text-sm font-medium text-slate-700">Mã kiểu thân</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 read-only:bg-slate-50"
                  readOnly={Boolean(editingBodyType)}
                  {...register("bodyCode", {
                    required: "Vui lòng nhập mã kiểu thân",
                    setValueAs: (value) => String(value).trim(),
                  })}
                />
                {errors.bodyCode ? (
                  <span className="text-xs text-red-600">{errors.bodyCode.message}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium text-slate-700">Tên kiểu thân</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  {...register("bodyName", {
                    required: "Vui lòng nhập tên kiểu thân",
                    setValueAs: (value) => String(value).trim(),
                  })}
                />
                {errors.bodyName ? (
                  <span className="text-xs text-red-600">{errors.bodyName.message}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Khoảng số ghế</span>
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  placeholder="VD: 4-5"
                  {...register("seatCapacityRange")}
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
                name="image"
                control={control}
                render={({ field: { onChange } }) => (
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Ảnh</span>
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
                {editingBodyType ? "Lưu thay đổi" : "Tạo kiểu thân"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

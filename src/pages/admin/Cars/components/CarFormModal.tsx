import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { Modal } from "@/components/core/Modal/Modal";
import { Input } from "@/components/core/Form/Input";
import { Select } from "@/components/core/Select/Select";
import type { SelectOption } from "@/components/core/Select/Select";
import { Checkbox } from "@/components/core/Form/Checkbox";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { carRouteFn } from "@/services/api/functions/Cars/Routes.Fn";
import { useAuthStore } from "@/stores/authStore";
import {
  emptyForm,
  buildCarFormData,
  parseImagePaths,
  type CarFormState,
} from "../carsHelpers";
import {
  DRIVE_TYPE,
  DRIVE_TYPE_OPTIONS,
  FUEL_TYPE,
  FUEL_TYPE_OPTIONS,
} from "@/common/utils/const";

const CONDITION_OPTIONS: SelectOption[] = [
  { value: "New", label: "Xe mới" },
  { value: "Used", label: "Xe cũ" },
  { value: "Certified", label: "Xe cũ đã chứng nhận" },
];

type Props = {
  carId: number | null;
  brandIdOptions: SelectOption[];
  bodyTypeIdOptions: SelectOption[];
  carStatusOptions: SelectOption[];
  locationOptions: SelectOption[];
  brandsLoading: boolean;
  bodiesLoading: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (fd: FormData) => Promise<void>;
};

export function CarFormModal({
  carId,
  brandIdOptions,
  bodyTypeIdOptions,
  carStatusOptions,
  locationOptions,
  brandsLoading,
  bodiesLoading,
  isSaving,
  onClose,
  onSave,
}: Props) {
  const user = useAuthStore((s) => s.user);

  const { data: carDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-car-detail", carId],
    queryFn: () => carRouteFn.getDetail(carId!),
    enabled: !!carId,
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CarFormState>({ defaultValues: emptyForm, mode: "onBlur" });

  const watchedImageFiles = watch("imageFiles");
  const watchedVideoFile = watch("videoFile");

  // Ảnh hiện có của xe (edit mode) + tập hợp ảnh đã bị đánh dấu xoá
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set());

  const keepImagePaths = useMemo(
    () => existingImages.filter((path) => !removedImages.has(path)),
    [existingImages, removedImages],
  );

  const toggleRemoveImage = (path: string) => {
    setRemovedImages((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  useEffect(() => {
    if (!carId) {
      reset(emptyForm);
      setExistingImages([]);
      setRemovedImages(new Set());
      return;
    }
    if (!carDetail) return;
    setExistingImages(parseImagePaths(carDetail.imagePaths));
    setRemovedImages(new Set());
    reset({
      carCode: carDetail.carCode ?? "",
      vin: carDetail.vin ?? "",
      carName: carDetail.carName ?? "",
      modelYear: String(carDetail.modelYear ?? ""),
      modelName: carDetail.modelName ?? "",
      brandID: String(carDetail.brandID ?? ""),
      bodyTypeID: String(carDetail.bodyTypeID ?? ""),
      statusID: String(carDetail.statusID ?? ""),
      condition: carDetail.condition ?? "New",
      locationID: String(carDetail.locationID ?? ""),
      price: String(carDetail.price ?? ""),
      importPrice:
        carDetail.importPrice == null ? "" : String(carDetail.importPrice),
      salePrice: String(carDetail.salePrice ?? ""),
      engineSize: String((carDetail.engineSize as any) ?? ""),
      fuelType: String(carDetail.fuelType ?? FUEL_TYPE.GASOLINE),
      transmission: String((carDetail as any).transmission ?? "Automatic"),
      driveType: String((carDetail as any).driveType ?? DRIVE_TYPE.FWD),
      doors: String((carDetail as any).doors ?? "4"),
      seats: String((carDetail as any).seats ?? ""),
      color: String((carDetail as any).color ?? "Đen"),
      mileage: String((carDetail as any).mileage ?? ""),
      shortDescription: String(carDetail.shortDescription ?? ""),
      detailedDescription: String(carDetail.detailedDescription ?? ""),
      isFeature: Boolean(carDetail.isFeature ?? false),
      isActive: Boolean((carDetail as any).isActive ?? true),
      imageFiles: [],
      videoFile: null,
    });
  }, [carId, carDetail, reset]);

  const submit = handleSubmit(async (values) => {
    const fd = buildCarFormData(
      values,
      user,
      carId ? keepImagePaths : undefined,
    );
    await onSave(fd);
  });
  const isCreate = !!carId;
  return (
    <Modal
      open
      title={isCreate ? "Tạo xe" : "Chỉnh sửa xe"}
      size="lg"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Huỷ
          </button>
          <button
            form="car-form"
            type="submit"
            disabled={isSaving || detailLoading}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-60 ${isSaving ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isSaving ? "Đang lưu..." : !!carId ? "Tạo xe" : "Lưu thay đổi"}
          </button>
        </div>
      }
    >
      <div className="relative max-h-[65vh] overflow-y-auto">
        {carId && detailLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
            <LoadingSpinner size="lg" />
          </div>
        )}
        <form
          id="car-form"
          onSubmit={submit}
          className={`grid grid-cols-1 gap-4 md:grid-cols-2${isSaving ? " pointer-events-none select-none opacity-60" : ""}`}
        >
          <Input
            label="Car code"
            {...register("carCode")}
            disabled={!isCreate}
          />
          <Input label="VIN" {...register("vin")} disabled={!isCreate} />

          <div className="md:col-span-2">
            <Input
              label="Tên xe"
              required
              error={errors.carName?.message}
              {...register("carName", { required: "Vui lòng nhập tên xe" })}
            />
          </div>

          <Input
            label="Model year"
            required
            inputMode="numeric"
            error={errors.modelYear?.message}
            {...register("modelYear", {
              required: "Vui lòng nhập năm sản xuất",
            })}
          />
          <Input label="Model name" {...register("modelName")} />

          <Select
            label="Hãng xe"
            required
            options={brandIdOptions}
            placeholder="Chọn hãng xe"
            disabled={brandsLoading}
            error={errors.brandID?.message}
            {...register("brandID", { required: "Vui lòng chọn hãng xe" })}
          />
          <Select
            label="Kiểu thân xe"
            required
            options={bodyTypeIdOptions}
            placeholder="Chọn kiểu thân xe"
            disabled={bodiesLoading}
            error={errors.bodyTypeID?.message}
            {...register("bodyTypeID", {
              required: "Vui lòng chọn kiểu thân xe",
            })}
          />

          <Select
            label="Trạng thái xe"
            options={carStatusOptions}
            placeholder="Chọn trạng thái"
            disabled={carStatusOptions.length === 0 || !isCreate}
            {...register("statusID")}
          />
          <Select
            label="Chi nhánh / Vị trí"
            options={locationOptions}
            placeholder="Chọn chi nhánh"
            disabled={locationOptions.length === 0}
            {...register("locationID")}
          />

          <Select
            label="Tình trạng"
            options={CONDITION_OPTIONS}
            {...register("condition")}
          />

          <Input
            label="Giá (Price)"
            required
            inputMode="numeric"
            error={errors.price?.message}
            {...register("price", { required: "Vui lòng nhập giá" })}
          />
          <Input
            label="Import price"
            inputMode="numeric"
            {...register("importPrice")}
          />
          <Input
            label="Sale price"
            inputMode="numeric"
            {...register("salePrice")}
          />

          <Input
            label="Engine size"
            inputMode="decimal"
            {...register("engineSize")}
          />
          <Select
            label="Fuel type"
            {...register("fuelType")}
            options={FUEL_TYPE_OPTIONS}
          />
          <Input label="Transmission" {...register("transmission")} />
          <Select
            label="Drive type"
            {...register("driveType")}
            options={DRIVE_TYPE_OPTIONS}
          />

          <Input label="Doors" inputMode="numeric" {...register("doors")} />
          <Input label="Seats" inputMode="numeric" {...register("seats")} />
          <Input label="Color" {...register("color")} />
          <Input label="Mileage" inputMode="numeric" {...register("mileage")} />

          <div className="md:col-span-2">
            <Input
              label="Short description"
              {...register("shortDescription")}
            />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-800">
              Detailed description
            </label>
            <textarea
              className="min-h-[96px] rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
              {...register("detailedDescription")}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Checkbox label="Xe nổi bật" {...register("isFeature")} />
            <Checkbox label="Đang hoạt động" {...register("isActive")} />
          </div>

          {carId && existingImages.length > 0 && (
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-800">
                Ảnh hiện có ({keepImagePaths.length}/{existingImages.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((path) => {
                  const isRemoved = removedImages.has(path);
                  return (
                    <div key={path} className="relative h-20 w-20">
                      <img
                        src={path}
                        alt="Ảnh xe"
                        className={`h-20 w-20 rounded-lg border border-slate-200 object-cover${
                          isRemoved ? " opacity-30" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => toggleRemoveImage(path)}
                        className={`absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow ${
                          isRemoved
                            ? "bg-emerald-500 hover:bg-emerald-600"
                            : "bg-red-500 hover:bg-red-600"
                        }`}
                        title={isRemoved ? "Khôi phục ảnh" : "Xoá ảnh"}
                      >
                        {isRemoved ? "↺" : "×"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-800">
              Thêm ảnh mới (ImageFiles)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                setValue("imageFiles", files, { shouldDirty: true });
              }}
            />
            {watchedImageFiles.length > 0 && (
              <p className="text-xs text-slate-500">
                Đã chọn {watchedImageFiles.length} ảnh
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm font-medium text-slate-800">
              Video (VideoFile)
            </label>
            <input
              type="file"
              accept="video/*"
              className="text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setValue("videoFile", f, { shouldDirty: true });
              }}
            />
            {watchedVideoFile && (
              <p className="text-xs text-slate-500">
                Đã chọn: {watchedVideoFile.name}
              </p>
            )}
          </div>
        </form>
      </div>
    </Modal>
  );
}

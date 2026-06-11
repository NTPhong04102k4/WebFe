import { Controller } from "react-hook-form";

import { Input, Modal, MultiCombobox, Select } from "src/components/core";
import type { AccessoryManagerState } from "../data";
import { AccessoryMediaField } from "./AccessoryMediaField";

type AccessoryFormModalProps = Pick<
  AccessoryManagerState,
  | "bodyTypeOptions"
  | "carBrandOptions"
  | "categories"
  | "brands"
  | "editingAccessory"
  | "form"
  | "isBodyTypeLoading"
  | "isCarBrandLoading"
  | "isSaving"
  | "modalOpen"
  | "closeModal"
  | "submitForm"
>;

const getBrandValue = (brand: { name: string }, index: number) =>
  String(
    (brand as { brandAccessoryID?: number; id?: number }).brandAccessoryID ??
      (brand as { id?: number }).id ??
      index + 1,
  );

export function AccessoryFormModal({
  bodyTypeOptions,
  carBrandOptions,
  categories,
  brands,
  editingAccessory,
  form,
  isBodyTypeLoading,
  isCarBrandLoading,
  isSaving,
  modalOpen,
  closeModal,
  submitForm,
}: AccessoryFormModalProps) {
  const {
    control,
    register,
    formState: { errors },
  } = form;

  const categoryOptions = categories.map((category) => ({
    label: category.categoryName,
    value: category.categoryID,
  }));
  const brandOptions = brands.map((brand, index) => ({
    label: brand.name,
    value: getBrandValue(brand, index),
  }));

  return (
    <Modal
      open={modalOpen}
      onClose={closeModal}
      size="xl"
      title={editingAccessory ? "Chỉnh sửa phụ kiện" : "Tạo phụ kiện"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border-2 border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 dark:border-slate-500 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            onClick={closeModal}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="accessory-form"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            {editingAccessory ? "Lưu thay đổi" : "Tạo phụ kiện"}
          </button>
        </div>
      }
    >
      <form
        id="accessory-form"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        onSubmit={submitForm}
      >
        <Input
          label="Mã phụ kiện"
          readOnly={Boolean(editingAccessory)}
          error={errors.accessoryCode?.message}
          className="read-only:bg-slate-200 dark:read-only:bg-slate-800"
          {...register("accessoryCode", {
            required: "Vui lòng nhập mã phụ kiện",
          })}
        />
        <Input
          label="Tên phụ kiện"
          error={errors.accessoryName?.message}
          {...register("accessoryName", {
            required: "Vui lòng nhập tên phụ kiện",
          })}
        />
        <Select
          label="Danh mục"
          placeholder="Chọn danh mục"
          options={categoryOptions}
          error={errors.categoryID?.message}
          {...register("categoryID", { required: "Vui lòng chọn danh mục" })}
        />
        <Select
          label="Thương hiệu"
          placeholder="Chọn thương hiệu"
          options={brandOptions}
          {...register("brandAccessoryID")}
        />
        <Input
          label="Giá bán"
          type="number"
          min="0"
          error={errors.price?.message}
          {...register("price", { required: "Vui lòng nhập giá bán" })}
        />
        <Input
          label="Giá vốn"
          type="number"
          min="0"
          {...register("costPrice")}
        />
        <Input
          label="Tồn kho"
          type="number"
          min="0"
          {...register("stockQuantity")}
        />
        <Input
          label="Bảo hành (tháng)"
          type="number"
          min="0"
          {...register("warrantyMonths")}
        />
        <Input
          label="Tồn tối thiểu"
          type="number"
          min="0"
          {...register("minStockLevel")}
        />
        <Input
          label="Tồn tối đa"
          type="number"
          min="0"
          {...register("maxStockLevel")}
        />
        <Controller
          name="compatibleBrands"
          control={control}
          render={({ field: { value, onChange } }) => (
            <MultiCombobox
              label="Hãng xe tương thích"
              placeholder="Chọn hãng xe"
              options={carBrandOptions}
              value={value}
              onChange={onChange}
              loading={isCarBrandLoading}
            />
          )}
        />
        <Controller
          name="compatibleBodyTypes"
          control={control}
          render={({ field: { value, onChange } }) => (
            <MultiCombobox
              label="Loại thân xe tương thích"
              placeholder="Chọn loại thân xe"
              options={bodyTypeOptions}
              value={value}
              onChange={onChange}
              loading={isBodyTypeLoading}
            />
          )}
        />{" "}
        <div className="flex flex-col gap-4 ">
          <Input
            label="Mô tả"
            className="md:col-span-2"
            {...register("description")}
          />
          <Controller
            name="imagePath"
            control={control}
            render={({ field: { value, onChange } }) => (
              <AccessoryMediaField
                label="Ảnh phụ kiện"
                kind="image"
                existingUrl={editingAccessory?.imagePath}
                value={value}
                onChange={onChange}
              />
            )}
          />
        </div>
        <Controller
          name="installationVideo"
          control={control}
          render={({ field: { value, onChange } }) => (
            <AccessoryMediaField
              label="Video lắp đặt"
              kind="video"
              existingUrl={editingAccessory?.installationVideo}
              value={value}
              onChange={onChange}
            />
          )}
        />
      </form>
    </Modal>
  );
}

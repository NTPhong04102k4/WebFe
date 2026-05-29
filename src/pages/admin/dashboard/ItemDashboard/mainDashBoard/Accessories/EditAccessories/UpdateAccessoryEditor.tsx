import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import { AccessoryRequestUpdate } from "src/shared/types/Request/accessories/accessory";
import * as yup from "yup";
import { useBrandAccessory } from "src/shared/hooks/BrandAccessory";
import { useCategory } from "src/shared/hooks/Category";
import { AccessoryFormFields } from ".";
import { useBodyType } from "src/shared/hooks/BodyType";

type Props = {
  open: boolean;
  onClose: () => void;
  accessoryId: string | number;
  onSaved?: () => void;
  variant?: "modal" | "page";
};

function parseCompatibleModels(value: string | string[] | null | undefined) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter((model): model is string => typeof model === "string" && model.trim() !== "");
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed
          .map((item: any) =>
            typeof item === "string"
              ? item
              : typeof item?.bodyCode === "string"
              ? item.bodyCode
              : null
          )
          .filter((model: any): model is string => typeof model === "string" && model.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

export const UpdateAccessoryEditor: React.FC<Props> = ({
  open,
  onClose,
  accessoryId,
  onSaved,
  variant = "modal",
}) => {
  const isEditing = true;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { brandAccessories: brands } = useBrandAccessory();
  const { bodyTypes: models } = useBodyType();
  const { categories } = useCategory();

  const defaultForm = useMemo(
    () => ({
      accessoryCode: "",
      accessoryName: "",
      description: "",
      price: "",
      categoryID: "",
      brandAccessoryID: "",
      compatibleCarModels: [] as string[],
      costPrice: "",
      stockQuantity: "",
      minStockLevel: "",
      maxStockLevel: "",
      warrantyMonths: "",
      createdBy: 1,
    }),
    []
  );
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const schema = useMemo(
    () =>
      yup.object({
        createdBy: yup.number().required("Người tạo là bắt buộc"),
        accessoryName: yup.string().trim().required("Tên phụ kiện là bắt buộc"),
        price: yup
          .number()
          .typeError("Giá bán phải là số")
          .min(0, "Giá bán không âm")
          .required("Giá bán là bắt buộc"),
        categoryID: yup
          .number()
          .typeError("Danh mục không hợp lệ")
          .required("Danh mục là bắt buộc"),
        brandAccessoryID: yup
          .mixed()
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        costPrice: yup
          .number()
          .typeError("Giá vốn phải là số")
          .min(0, "Giá vốn không âm")
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        stockQuantity: yup
          .number()
          .typeError("Tồn kho phải là số")
          .min(0, "Tồn kho không âm")
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        minStockLevel: yup
          .number()
          .typeError("Tồn tối thiểu phải là số")
          .min(0, "Tồn tối thiểu không âm")
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        maxStockLevel: yup
          .number()
          .typeError("Tồn tối đa phải là số")
          .min(0, "Tồn tối đa không âm")
          .nullable()
          .transform((v, o) => (o === "" ? null : v)),
        warrantyMonths: yup
          .number()
          .nullable()
          .transform((v, o) => (o === "" ? null : v))
          .oneOf([3, 6, 12, 24, null], "Chọn 3, 6, 12, hoặc 24"),
        compatibleCarModels: yup.array().of(yup.string()).default([]),
      }),
    []
  );

  useEffect(() => {
    if (!open || !accessoryId) return;
    setImageFile(null);
    setVideoFile(null);
    setError(null);
  }, [open, accessoryId]);

  useEffect(() => {
    if (!open || !accessoryId) return;
    (async () => {
      try {
        const detail = await accessoryRouteFn.getDetail(Number(accessoryId));
        if (detail) {
          const compat = parseCompatibleModels(detail.compatibleCarModels);
          setForm({
            accessoryCode: detail.accessoryCode ?? "",
            accessoryName: detail.accessoryName ?? "",
            description: detail.description ?? "",
            price: detail.price !== undefined ? String(detail.price) : "",
            categoryID:
              detail.categoryID !== undefined ? String(detail.categoryID) : "",
            brandAccessoryID:
              detail.brandAccessoryID !== undefined
                ? String(detail.brandAccessoryID)
                : "",
            compatibleCarModels: compat,
            costPrice:
              detail.costPrice !== undefined ? String(detail.costPrice) : "",
            stockQuantity:
              detail.stockQuantity !== undefined
                ? String(detail.stockQuantity)
                : "",
            minStockLevel:
              detail.minStockLevel !== undefined
                ? String(detail.minStockLevel)
                : "",
            maxStockLevel:
              detail.maxStockLevel !== undefined
                ? String(detail.maxStockLevel)
                : "",
            warrantyMonths:
              detail.warrantyMonths !== undefined &&
              detail.warrantyMonths !== null
                ? String(detail.warrantyMonths)
                : "",
            createdBy: 1,
          });
        }
      } catch (err) {
        console.error("Failed to load accessory detail", err);
      }
    })();
  }, [open, accessoryId]);

  const submit = async () => {
    setError(null);
    try {
      await schema.validateSync({
        createdBy: form.createdBy,
        accessoryName: form.accessoryName,
        price: form.price,
        categoryID: form.categoryID,
        brandAccessoryID: form.brandAccessoryID,
        costPrice: form.costPrice,
        stockQuantity: form.stockQuantity,
        minStockLevel: form.minStockLevel,
        maxStockLevel: form.maxStockLevel,
        warrantyMonths: form.warrantyMonths,
        compatibleCarModels: Array.isArray(form.compatibleCarModels)
          ? form.compatibleCarModels
          : [],
      });
      setLoading(true);
      const payload: AccessoryRequestUpdate = {
        accessoryID: Number(accessoryId),
        accessoryCode: form.accessoryCode.trim(),
        accessoryName: form.accessoryName.trim(),
        categoryID: form.categoryID ? Number(form.categoryID) : 1,
        brandAccessoryID:
          form.brandAccessoryID && !isNaN(Number(form.brandAccessoryID))
            ? Number(form.brandAccessoryID)
            : null,
        description: form.description ?? "",
        price: form.price ? Number(form.price) : 0,
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        stockQuantity: form.stockQuantity
          ? Number(form.stockQuantity)
          : undefined,
        minStockLevel: form.minStockLevel
          ? Number(form.minStockLevel)
          : undefined,
        maxStockLevel: form.maxStockLevel
          ? Number(form.maxStockLevel)
          : undefined,
        compatibleCarModels: JSON.stringify(
          Array.isArray(form.compatibleCarModels)
            ? form.compatibleCarModels
            : []
        ),
        imagePath: imageFile ?? undefined,
        installationVideo: videoFile ?? undefined,
        warrantyMonths: form.warrantyMonths
          ? Number(form.warrantyMonths)
          : null,
        createdBy: 1,
      };
      await accessoryRouteFn.update(Number(accessoryId), payload);
      onSaved?.();
      onClose();
    } catch (e: any) {
      if (e instanceof yup.ValidationError) {
        const firstMessage =
          (Array.isArray(e.errors) && e.errors.length > 0 && e.errors[0]) ||
          e.message ||
          "Vui lòng kiểm tra các trường nhập liệu";
        setError(firstMessage);
      } else {
        setError("Lưu phụ kiện thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const content = (
    <>
      <Title>Sửa phụ kiện</Title>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <AccessoryFormFields
        form={form as any}
        isEditing={isEditing}
        models={models}
        brands={brands}
        categories={categories}
        onChange={setForm as any}
        setImageFile={setImageFile}
        setVideoFile={setVideoFile}
      />
      <Actions>
        <Button type="button" onClick={onClose}>
          {variant === "modal" ? "Huỷ" : "Quay lại"}
        </Button>
        <PrimaryButton type="button" onClick={submit} disabled={loading}>
          Lưu
        </PrimaryButton>
      </Actions>
    </>
  );

  if (variant === "modal") {
    return (
      <Overlay>
        <Backdrop onClick={onClose} />
        <Modal>{content}</Modal>
      </Overlay>
    );
  }

  return <PageContainer>{content}</PageContainer>;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Backdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
`;

const Modal = styled.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
`;

const Title = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
`;

const ErrorText = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  transition: background 120ms ease;
  &:hover {
    background: #f9fafb;
  }
`;

const PrimaryButton = styled(Button)`
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
  opacity: ${(p) => (p.disabled ? 0.6 : 1)};
  &:hover {
    background: #1d4ed8;
  }
`;

const PageContainer = styled.div`
  position: relative;
  background: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 1rem;
  width: 100%;
  max-width: 48rem;
  margin: 1rem auto;
`;

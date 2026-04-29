import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import { AccessoryRequestCreate } from "src/shared/types/Request/accessories/accessory";
import * as yup from "yup";
import { useBrandAccessory } from "src/shared/hooks/BrandAccessory";
import { useCategory } from "src/shared/hooks/Category";
import { AccessoryFormFields } from ".";
import { useBodyType } from "src/shared/hooks/BodyType";
import { useAuthStore } from "@/stores/authStore";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  variant?: "modal" | "page";
};

export const CreateAccessoryEditor: React.FC<Props> = ({
  open,
  onClose,
  onSaved,
  variant = "modal",
}) => {
  const user = useAuthStore((s) => s.user);
  const roles = useMemo(() => {
    const r =
      (user as any)?.roles ||
      (user as any)?.authorities ||
      ((user as any)?.role ? [(user as any)?.role] : []);
    return Array.isArray(r) ? r.map((x) => String(x).toLowerCase()) : [];
  }, [user]);
  const generateAccessoryCode = React.useCallback(() => {
    const random = Math.floor(1000 + Math.random() * 9000);
    const roleSegment = roles.length > 0 ? roles.join("-") : "user";
    return `Acc${random}-${roleSegment}`;
  }, [roles]);

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
    if (!open) return;
    setForm({
      ...defaultForm,
      accessoryCode: generateAccessoryCode(),
    });
    setImageFile(null);
    setVideoFile(null);
    setError(null);
  }, [open, defaultForm, generateAccessoryCode]);

  const submit = async () => {
    setError(null);
    if (!form.accessoryCode.trim() || !form.accessoryName.trim()) {
      setError("Mã và tên phụ kiện là bắt buộc");
      return;
    }
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
      const accessoryCode =
        form.accessoryCode && form.accessoryCode.trim().length > 0
          ? form.accessoryCode.trim()
          : generateAccessoryCode();
      const payload: AccessoryRequestCreate = {
        accessoryCode,
        accessoryName: form.accessoryName.trim(),
        categoryID: form.categoryID ? Number(form.categoryID) : 0,
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
      await accessoryRouteFn.create(payload);
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
      <Title>Thêm phụ kiện</Title>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <AccessoryFormFields
        form={form as any}
        isEditing={false}
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
          Tạo
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

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import {
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import { AccessoryDetailResponse } from "src/shared/types/Reponse/accessories/accessory";
import { CategoryResponse } from "src/shared/types/Reponse/category";
import { categoryRouteFn } from "src/services/api/functions/category/Routes.Fn";

type Props = {
  open: boolean;
  onClose: () => void;
  accessoryId?: string | number | null;
  onSaved?: () => void;
};
export const AccessoryEditor: React.FC<Props> = ({
  open,
  onClose,
  accessoryId,
  onSaved,
}) => {
  const isEditing = useMemo(() => !!accessoryId, [accessoryId]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<BrandAccessoryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [form, setForm] = useState<AccessoryDetailResponse>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const res = await brandRouteFn.getBrands();
      const source: BrandAccessoryResponse[] = res;
      const mapped: BrandAccessoryResponse[] = source.map(
        (b: BrandAccessoryResponse) => ({
          name: String(b.name),
          description: b.description ?? "",
          image: b.image ?? null,
        })
      );
      setBrands(mapped);
    })();
  }, [open, isEditing, accessoryId]);
  useEffect(() => {
    (async () => {
      const res = await categoryRouteFn.getCategories();
      const source: CategoryResponse[] = res;
      setCategories(source);
    })();
  }, []);
  const submit = async () => {
    if (!form?.accessoryName.trim() || !form?.accessoryCode.trim()) {
      setError("Mã và tên phụ kiện là bắt buộc");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (isEditing && accessoryId) {
        // Update with all required fields (server expects these fields)
        const payload: AccessoryRequestUpdate = {
          accessoryID: Number(accessoryId),
          accessoryCode: form.accessoryCode,
          accessoryName: form.accessoryName,
          categoryID: Number(form.categoryID ?? 0),
          brandAccessoryID:
            form.brandAccessoryID !== undefined &&
            form.brandAccessoryID !== null
              ? Number(form.brandAccessoryID)
              : (undefined as any),
          description: form.description ?? "",
          price:
            (form as any).price !== undefined && (form as any).price !== null
              ? Number((form as any).price)
              : (undefined as any),
          costPrice:
            (form as any).costPrice !== undefined &&
            (form as any).costPrice !== null
              ? Number((form as any).costPrice)
              : (undefined as any),
          stockQuantity:
            (form as any).stockQuantity !== undefined &&
            (form as any).stockQuantity !== null
              ? Number((form as any).stockQuantity)
              : (undefined as any),
          minStockLevel:
            (form as any).minStockLevel !== undefined &&
            (form as any).minStockLevel !== null
              ? Number((form as any).minStockLevel)
              : (undefined as any),
          maxStockLevel:
            (form as any).maxStockLevel !== undefined &&
            (form as any).maxStockLevel !== null
              ? Number((form as any).maxStockLevel)
              : (undefined as any),
          compatibleCarModels:
            form.compatibleCarModels && String(form.compatibleCarModels).trim()
              ? String(form.compatibleCarModels).trim()
              : (undefined as any),
          imagePath: imageFile ?? (undefined as any),
          installationVideo: videoFile ?? (undefined as any),
          warrantyMonths:
            (form as any).warrantyMonths !== undefined &&
            (form as any).warrantyMonths !== null &&
            String((form as any).warrantyMonths) !== ""
              ? Number((form as any).warrantyMonths)
              : (undefined as any),
        } as any;
        await accessoryRouteFn.update(accessoryId, payload);
      } else {
        const payload: AccessoryRequestCreate = {
          accessoryCode: form.accessoryCode.trim(),
          accessoryName: form.accessoryName.trim(),
          categoryID: Number(form.categoryID ?? 0),
          brandAccessoryID:
            form.brandAccessoryID !== undefined &&
            form.brandAccessoryID !== null
              ? Number(form.brandAccessoryID)
              : (undefined as any),
          description: form.description ?? "",
          price:
            (form as any).price !== undefined && (form as any).price !== null
              ? Number((form as any).price)
              : 0,
          costPrice:
            (form as any).costPrice !== undefined &&
            (form as any).costPrice !== null &&
            String((form as any).costPrice) !== ""
              ? Number((form as any).costPrice)
              : (undefined as any),
          stockQuantity:
            (form as any).stockQuantity !== undefined &&
            (form as any).stockQuantity !== null &&
            String((form as any).stockQuantity) !== ""
              ? Number((form as any).stockQuantity)
              : (undefined as any),
          minStockLevel:
            (form as any).minStockLevel !== undefined &&
            (form as any).minStockLevel !== null &&
            String((form as any).minStockLevel) !== ""
              ? Number((form as any).minStockLevel)
              : (undefined as any),
          maxStockLevel:
            (form as any).maxStockLevel !== undefined &&
            (form as any).maxStockLevel !== null &&
            String((form as any).maxStockLevel) !== ""
              ? Number((form as any).maxStockLevel)
              : (undefined as any),
          compatibleCarModels:
            form.compatibleCarModels && String(form.compatibleCarModels).trim()
              ? String(form.compatibleCarModels).trim()
              : "[]",
          imagePath: imageFile ?? (undefined as any),
          installationVideo: videoFile ?? (undefined as any),
          warrantyMonths:
            (form as any).warrantyMonths !== undefined &&
            (form as any).warrantyMonths !== null &&
            String((form as any).warrantyMonths) !== ""
              ? Number((form as any).warrantyMonths)
              : (undefined as any),
          createdBy: 0,
        };
        await accessoryRouteFn.create(payload);
      }
      onSaved?.();
      onClose();
    } catch {
      setError("Lưu phụ kiện thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Overlay>
      <Backdrop onClick={onClose} />
      <Modal>
        <Title>{isEditing ? "Sửa phụ kiện" : "Thêm phụ kiện"}</Title>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <Grid>
          <Field>
            <Label>Mã</Label>
            <Input
              value={form.accessoryCode}
              onChange={(e) =>
                setForm((f) => ({ ...f, accessoryCode: e.target.value }))
              }
              placeholder="Mã phụ kiện"
            />
          </Field>
          <Field>
            <Label>Tên</Label>
            <Input
              value={form.accessoryName}
              onChange={(e) =>
                setForm((f) => ({ ...f, accessoryName: e.target.value }))
              }
              placeholder="Tên phụ kiện"
            />
          </Field>
          <Field>
            <Label>Giá</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field>
            <Label>Thương hiệu</Label>
            <Select
              value={form.brandAccessoryID}
              onChange={(e) =>
                setForm((f) => ({ ...f, brandAccessoryID: e.target.value }))
              }
            >
              <option value="">-- Không chọn --</option>
              {brands.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field colSpan>
            <Label>Mô tả</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Mô tả"
            />
          </Field>
          <Field colSpan>
            <Label>Hình ảnh (file)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
          </Field>
          <Field>
            <Label>Giá vốn</Label>
            <Input
              type="number"
              value={form.costPrice}
              onChange={(e) =>
                setForm((f) => ({ ...f, costPrice: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field>
            <Label>Tồn kho</Label>
            <Input
              type="number"
              value={form.stockQuantity}
              onChange={(e) =>
                setForm((f) => ({ ...f, stockQuantity: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field>
            <Label>Tồn tối thiểu</Label>
            <Input
              type="number"
              value={form.minStockLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, minStockLevel: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field>
            <Label>Tồn tối đa</Label>
            <Input
              type="number"
              value={form.maxStockLevel}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxStockLevel: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
          <Field colSpan>
            <Label>Mẫu xe tương thích (JSON)</Label>
            <Textarea
              rows={2}
              value={form.compatibleCarModels}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  compatibleCarModels: e.target.value,
                }))
              }
              placeholder='["Model A","Model B"]'
            />
          </Field>
          <Field>
            <Label>Video lắp đặt</Label>
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
          </Field>
          <Field>
            <Label>Bảo hành (tháng)</Label>
            <Input
              type="number"
              value={form.warrantyMonths ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, warrantyMonths: e.target.value }))
              }
              placeholder="0"
            />
          </Field>
        </Grid>
        <Actions>
          <Button type="button" onClick={onClose}>
            Huỷ
          </Button>
          <PrimaryButton type="button" onClick={submit} disabled={loading}>
            {isEditing ? "Lưu" : "Tạo"}
          </PrimaryButton>
        </Actions>
      </Modal>
    </Overlay>
  );
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Field = styled.div<{ colSpan?: boolean }>`
  ${(p) =>
    p.colSpan
      ? `
    grid-column: 1 / -1;
  `
      : ""}
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #111827;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
`;

const Select = styled.select`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #111827;
  background: #fff;
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

import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { accessoryRouteFn } from "src/services/api/functions/accessories/accessory/Routes.Fn";
import {
  AccessoryRequestCreate,
  AccessoryRequestUpdate,
} from "src/shared/types/Request/accessories/accessory";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";

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

  const [form, setForm] = useState<{
    accessoryCode: string;
    accessoryName: string;
    price: number | string;
    brandAccessoryID: string;
    description: string;
    imagePath: File | null;
  }>({
    accessoryCode: "",
    accessoryName: "",
    price: "",
    brandAccessoryID: "",
    description: "",
    imagePath: null,
  });

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
  const submit = async () => {
    if (!form.accessoryName.trim() || !form.accessoryCode.trim()) {
      setError("Mã và tên phụ kiện là bắt buộc");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (isEditing && accessoryId) {
        const payload: AccessoryRequestUpdate = {
          accessoryID: Number(accessoryId),
          accessoryCode: form.accessoryCode.trim(),
          accessoryName: form.accessoryName.trim(),
          categoryID: 0,
          brandAccessoryID: form.brandAccessoryID
            ? Number(form.brandAccessoryID)
            : null,
          description: form.description ?? "",
          price: Number(form.price || 0),
          costPrice: null,
          stockQuantity: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          compatibleCarModels: "[]",
          imagePath: form.imagePath,
          installationVideo: null,
          warrantyMonths: null,
        };
        await accessoryRouteFn.update(accessoryId, payload);
      } else {
        const payload: AccessoryRequestCreate = {
          accessoryCode: form.accessoryCode.trim(),
          accessoryName: form.accessoryName.trim(),
          categoryID: 0,
          brandAccessoryID: form.brandAccessoryID
            ? Number(form.brandAccessoryID)
            : null,
          description: form.description ?? "",
          price: Number(form.price || 0),
          costPrice: null,
          stockQuantity: 0,
          minStockLevel: 0,
          maxStockLevel: 0,
          compatibleCarModels: "[]",
          imagePath: form.imagePath,
          installationVideo: null,
          warrantyMonths: null,
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
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  imagePath: e.target.files?.[0] ?? null,
                }))
              }
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

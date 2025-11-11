import React from "react";
import styled from "styled-components";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
import { CategoryResponse } from "src/shared/types/Reponse/category";
import { BodyCarReponse } from "src/shared/types/Reponse/Car";

type AccessoryFormState = {
  accessoryCode: string;
  accessoryName: string;
  description: string;
  price: string;
  categoryID: string;
  brandAccessoryID: string;
  costPrice: string;
  stockQuantity: string;
  minStockLevel: string;
  maxStockLevel: string;
  warrantyMonths: string;
  createdBy: string;
  compatibleCarModels: string[];
};

type Props = {
  form: AccessoryFormState;
  isEditing: boolean;
  brands: BrandAccessoryResponse[];
  categories: CategoryResponse[];
  onChange: React.Dispatch<React.SetStateAction<AccessoryFormState>>;
  setImageFile: (file: File | null) => void;
  setVideoFile: (file: File | null) => void;
  models: BodyCarReponse[];
};

export const AccessoryFormFields: React.FC<Props> = ({
  form,
  isEditing,
  brands,
  categories,
  onChange,
  setImageFile,
  setVideoFile,
  models,
}) => {
  return (
    <Grid>
      <Field>
        <Label>Mã phụ kiện</Label>
        <Input
          value={form.accessoryCode}
          disabled={isEditing}
          onChange={(e) =>
            onChange((f) => ({ ...f, accessoryCode: e.target.value }))
          }
          placeholder="Mã phụ kiện"
        />
      </Field>
      <Field>
        <Label>Tên phụ kiện</Label>
        <Input
          value={form.accessoryName}
          disabled={isEditing}
          onChange={(e) =>
            onChange((f) => ({ ...f, accessoryName: e.target.value }))
          }
          placeholder="Tên phụ kiện"
        />
      </Field>
      <Field>
        <Label>Giá bán</Label>
        <Input
          type="number"
          value={form.price}
          onChange={(e) => onChange((f) => ({ ...f, price: e.target.value }))}
          placeholder="0"
        />
      </Field>
      <Field>
        <Label>Thương hiệu</Label>
        <Select
          value={form.brandAccessoryID}
          onChange={(e) =>
            onChange((f) => ({ ...f, brandAccessoryID: e.target.value }))
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
      <Field>
        <Label>Danh mục</Label>
        <Select
          value={form.categoryID}
          onChange={(e) =>
            onChange((f) => ({ ...f, categoryID: e.target.value }))
          }
        >
          <option value="">-- Không chọn --</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
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
            onChange((f) => ({ ...f, description: e.target.value }))
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
            onChange((f) => ({ ...f, costPrice: e.target.value }))
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
            onChange((f) => ({ ...f, stockQuantity: e.target.value }))
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
            onChange((f) => ({ ...f, minStockLevel: e.target.value }))
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
            onChange((f) => ({ ...f, maxStockLevel: e.target.value }))
          }
          placeholder="0"
        />
      </Field>
      <Field colSpan>
        <Label>Mẫu xe tương thích</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {models.map((m: BodyCarReponse) => {
            const checked = (form.compatibleCarModels || []).includes(
              m.bodyCode
            );
            return (
              <label key={m.bodyCode} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    onChange((f) => {
                      const current = Array.isArray(f.compatibleCarModels)
                        ? f.compatibleCarModels
                        : [];
                      const next = e.target.checked
                        ? Array.from(new Set([...current, m.bodyCode]))
                        : current.filter((c) => c !== m.bodyCode);
                      return { ...f, compatibleCarModels: next };
                    });
                  }}
                />
                <span>{m.bodyName}</span>
              </label>
            );
          })}
        </div>
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
        <Select
          value={form.warrantyMonths}
          onChange={(e) =>
            onChange((f) => ({ ...f, warrantyMonths: e.target.value }))
          }
        >
          <option value="">-- Chọn --</option>
          <option value="3">3</option>
          <option value="6">6</option>
          <option value="12">12</option>
          <option value="24">24</option>
        </Select>
      </Field>
    </Grid>
  );
};

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

import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import {
  BrandRequestCreate,
  BrandRequestUpdate,
} from "src/shared/types/Request/accessories/brand";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";
type Props = {
  brands: BrandAccessoryResponse[];
  onChanged?: () => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
};

export const BrandControls: React.FC<Props> = ({
  brands,
  onChanged,
  selectedId,
  setSelectedId,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    image: File | string | null;
  }>({ name: "", description: "", image: null });
  const isEditing = !!editingId;

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", image: null });
    setOpen(true);
  };

  const openEdit = () => {
    if (!selectedId) return;
    setEditingId(selectedId);
    const selected = brands.find((b) => b.name === selectedId);
    if (selected) {
      setForm({
        name: selected.name ?? "",
        description: selected.description ?? "",
        image: selected.image ?? null,
      });
    }
    setOpen(true);
  };

  const close = () => setOpen(false);

  const submit = async () => {
    if (!form.name.trim()) {
      setError("Tên thương hiệu là bắt buộc");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (isEditing && editingId) {
        const payload: BrandRequestUpdate = {
          name: form.name.trim(),
          description: form.description?.trim() ?? "",
          image: form.image ?? null,
          id: editingId,
        };
        await brandRouteFn.updateBrand(payload);
      } else {
        const payload: BrandRequestCreate = {
          name: form.name.trim(),
          description: form.description?.trim() ?? "",
          image: form.image ?? null,
        };
        await brandRouteFn.createBrand(payload);
      }
      onChanged?.();
      setOpen(false);
    } catch {
      setError("Lưu thương hiệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Select
        value={selectedId}
        onChange={(e) => {
          const v = e.target.value;
          setSelectedId(v);
        }}
      >
        <option value="">-- Chọn thương hiệu để sửa --</option>
        {brands.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        onClick={openEdit}
        disabled={!selectedId}
        title={!selectedId ? "Chọn 1 thương hiệu để sửa" : "Sửa thương hiệu"}
      >
        Sửa thương hiệu
      </Button>
      <Button type="button" onClick={openCreate}>
        + Thêm thương hiệu
      </Button>

      {open ? (
        <ModalOverlay>
          <Backdrop onClick={close} />
          <Modal>
            <Title>{isEditing ? "Sửa thương hiệu" : "Thêm thương hiệu"}</Title>
            {error ? <ErrorBox>{error}</ErrorBox> : null}
            <div>
              <Field>
                <Label>Tên</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Nhập tên thương hiệu"
                />
              </Field>
              <Field>
                <Label>Mô tả</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Mô tả ngắn"
                  rows={3}
                />
              </Field>
              <Field>
                <Label>Ảnh (từ thiết bị)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      image: e.target.files?.[0] ?? null,
                    }))
                  }
                />
              </Field>
              {form.image ? (
                <PreviewWrapper>
                  <PreviewImage
                    src={
                      typeof form.image === "string"
                        ? form.image
                        : URL.createObjectURL(form.image)
                    }
                    alt="Xem trước ảnh thương hiệu"
                  />
                </PreviewWrapper>
              ) : null}
            </div>
            <Actions>
              <Button type="button" onClick={close}>
                Huỷ
              </Button>
              <PrimaryButton type="button" onClick={submit} disabled={loading}>
                {isEditing ? "Lưu" : "Tạo"}
              </PrimaryButton>
            </Actions>
          </Modal>
        </ModalOverlay>
      ) : null}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
`;

const Select = styled.select`
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #ffffff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
  transition: box-shadow 120ms ease, border-color 120ms ease;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
  }
`;

const Button = styled.button`
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background: #ffffff;
  transition: background-color 120ms ease, transform 60ms ease,
    box-shadow 120ms ease, opacity 120ms ease;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
  &:hover {
    background: #f9fafb;
  }
  &:active {
    background: #f3f4f6;
  }
  &:disabled {
    color: #9ca3af;
    background: #f9fafb;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const PrimaryButton = styled(Button)`
  border: none;
  background: #2563eb;
  color: #ffffff;
  &:hover {
    background: #1d4ed8;
  }
  &:active {
    background: #1e40af;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
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
  -webkit-backdrop-filter: blur(1px);
  backdrop-filter: blur(1px);
`;

const Modal = styled.div`
  position: relative;
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
  padding: 1.25rem;
  width: 100%;
  max-width: 28rem;
  margin: 0 1rem;
`;

const Title = styled.div`
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
`;

const ErrorBox = styled.div`
  font-size: 0.875rem;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.75rem;
`;

const Field = styled.div`
  & + & {
    margin-top: 0.75rem;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #ffffff;
  transition: box-shadow 120ms ease, border-color 120ms ease;
  ::placeholder {
    color: #9ca3af;
  }
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #ffffff;
  transition: box-shadow 120ms ease, border-color 120ms ease;
  ::placeholder {
    color: #9ca3af;
  }
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.35);
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const PreviewWrapper = styled.div`
  margin-top: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background: #f9fafb;
`;

const PreviewImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  display: block;
`;

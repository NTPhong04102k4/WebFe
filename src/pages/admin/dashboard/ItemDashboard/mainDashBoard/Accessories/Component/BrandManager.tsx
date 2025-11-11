import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { brandRouteFn } from "src/services/api/functions/accessories/brand/Route.Fn";
import {
  BrandRequestCreate,
  BrandRequestUpdate,
} from "src/shared/types/Request/accessories/brand";
import { BrandAccessoryResponse } from "src/shared/types/Reponse/accessories/brand";

type Props = {
  onChanged?: () => void;
};

export const BrandManager: React.FC<Props> = ({ onChanged }) => {
  const [brands, setBrands] = useState<BrandAccessoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    image: string | null;
  }>({ name: "", description: "", image: null });
  const isEditing = useMemo(() => !!editingId, [editingId]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await brandRouteFn.getBrands();
      const source: BrandAccessoryResponse[] = res;
      const mapped: BrandAccessoryResponse[] = source.map(
        (b: BrandAccessoryResponse) => ({
          name: b.name,
          image: b.image ?? null,
          description: b.description ?? "",
        })
      );
      setBrands(mapped);
    } catch (e) {
      setError("Không tải được danh sách thương hiệu");
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", description: "", image: null });
    setOpen(true);
  };

  const openEdit = (b: BrandAccessoryResponse) => {
    setEditingId(b.name);
    setForm({
      name: b.name,
      description: b.description ?? "",
      image: b.image ?? null,
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
  };

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
      await load();
      onChanged?.();
      setOpen(false);
    } catch (e) {
      setError("Lưu thương hiệu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <HeaderRow>
        <Title>Thương hiệu phụ kiện</Title>
        <Button type="button" onClick={openCreate}>
          + Thêm thương hiệu
        </Button>
      </HeaderRow>
      {error ? <ErrorText>{error}</ErrorText> : null}
      <ListRow>
        {loading ? (
          <div>Đang tải...</div>
        ) : brands.length === 0 ? (
          <div>Chưa có thương hiệu</div>
        ) : (
          brands.map((b) => (
            <PillButton
              key={b.name}
              type="button"
              onClick={() => openEdit(b)}
              title={`Sửa ${b.name}`}
            >
              {b.name}
            </PillButton>
          ))
        )}
      </ListRow>

      {open ? (
        <ModalOverlay>
          <Backdrop onClick={close} />
          <Modal>
            <ModalTitle>
              {isEditing ? "Sửa thương hiệu" : "Thêm thương hiệu"}
            </ModalTitle>
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
                <Label>Ảnh (URL)</Label>
                <Input
                  value={form.image ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.value || null }))
                  }
                  placeholder="https://..."
                />
              </Field>
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
    </Wrapper>
  );
};

const Wrapper = styled.div`
  margin-bottom: 1rem;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-weight: 600;
`;

const Button = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background: #ffffff;
  transition: background-color 120ms ease, transform 60ms ease,
    box-shadow 120ms ease;
  &:hover {
    background: #f9fafb;
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

const ErrorText = styled.div`
  font-size: 0.875rem;
  color: #dc2626;
  margin-top: 0.25rem;
`;

const ListRow = styled.div`
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
`;

const PillButton = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  white-space: nowrap;
  background: #ffffff;
  transition: background-color 120ms ease, border-color 120ms ease;
  &:hover {
    background: #f9fafb;
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
`;

const Modal = styled.div`
  position: relative;
  background: #ffffff;
  border-radius: 0.5rem;
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  width: 100%;
  max-width: 28rem;
`;

const ModalTitle = styled.div`
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
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
`;

const Textarea = styled.textarea`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  background: #ffffff;
`;

const Actions = styled.div`
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

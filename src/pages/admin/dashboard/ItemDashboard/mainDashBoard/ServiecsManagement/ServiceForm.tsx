import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import * as yup from "yup";
import { CategoryRequestCreate } from "src/shared/types/Request/Category";
import { useCategory } from "src/shared/hooks/Category";
import {
  useCategoryDetail,
  useCategoryMutation,
} from "src/shared/hooks/Category/useCategoryManagement";

const ServiceForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const categoryId = id ? Number(id) : undefined;
  const navigate = useNavigate();
  const isEditMode = !!categoryId;

  const [error, setError] = useState<string | null>(null);
  const { categories } = useCategory();
  const { category: initialData, loading: loadingDetail } = useCategoryDetail(
    categoryId || null
  );
  const {
    createAsync,
    updateAsync,
    isCreating,
    isUpdating,
    createError,
    updateError,
  } = useCategoryMutation();

  const loading = isCreating || isUpdating || loadingDetail;

  const defaultForm = {
    categoryName: "",
    description: "",
    parentCategoryID: null as number | null,
    displayOrder: 0,
    isActive: true,
  };

  const [form, setForm] = useState<typeof defaultForm>(defaultForm);

  // Filter out current category from parent options when editing
  const parentCategoryOptions = useMemo(() => {
    if (isEditMode && categoryId) {
      return categories.filter((cat) => cat.categoryID !== categoryId);
    }
    return categories;
  }, [categories, isEditMode, categoryId]);

  const schema = useMemo(
    () =>
      yup.object({
        categoryName: yup.string().trim().required("Tên danh mục là bắt buộc"),
        description: yup.string().trim().required("Mô tả là bắt buộc"),
        parentCategoryID: yup
          .number()
          .nullable()
          .transform((v, o) => (o === "" || o === null ? null : v)),
        displayOrder: yup
          .number()
          .typeError("Thứ tự hiển thị phải là số")
          .min(0, "Thứ tự hiển thị không được âm")
          .required("Thứ tự hiển thị là bắt buộc"),
        isActive: yup.boolean().required(),
      }),
    []
  );

  // Load initial data if editing
  useEffect(() => {
    if (isEditMode && initialData) {
      setForm({
        categoryName: initialData.categoryName,
        description: initialData.description,
        parentCategoryID: initialData.parentCategoryID,
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
      });
    }
  }, [isEditMode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await schema.validate(form, { abortEarly: false });
    } catch (err: any) {
      const firstError =
        err.inner?.[0]?.message || "Vui lòng kiểm tra lại các trường";
      setError(firstError);
      return;
    }

    try {
      const submitData: CategoryRequestCreate = {
        categoryName: form.categoryName.trim(),
        description: form.description.trim(),
        parentCategoryID: form.parentCategoryID,
        displayOrder: form.displayOrder,
        isActive: form.isActive,
      };

      if (isEditMode && categoryId) {
        await updateAsync({ id: categoryId, data: submitData });
      } else {
        await createAsync(submitData);
      }

      navigate(-1);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (isEditMode ? "Cập nhật danh mục thất bại" : "Tạo danh mục thất bại")
      );
      console.error("Error saving category:", err);
    }
  };

  // Handle mutation errors
  useEffect(() => {
    if (createError) {
      setError("Tạo danh mục thất bại");
    }
    if (updateError) {
      setError("Cập nhật danh mục thất bại");
    }
  }, [createError, updateError]);

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>{isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}</Title>

        {error && <ErrorText>{error}</ErrorText>}

        <FormGroup>
          <Label>Tên danh mục *</Label>
          <Input
            type="text"
            value={form.categoryName}
            onChange={(e) =>
              setForm((s) => ({ ...s, categoryName: e.target.value }))
            }
            placeholder="Tên danh mục"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Mô tả *</Label>
          <TextArea
            value={form.description}
            onChange={(e) =>
              setForm((s) => ({ ...s, description: e.target.value }))
            }
            placeholder="Mô tả danh mục"
            rows={4}
            required
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <Label>Danh mục cha</Label>
            <Select
              value={form.parentCategoryID || ""}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  parentCategoryID: e.target.value
                    ? Number(e.target.value)
                    : null,
                }))
              }
            >
              <option value="">Không có (danh mục gốc)</option>
              {parentCategoryOptions.map((cat) => (
                <option key={cat.categoryID} value={cat.categoryID}>
                  {cat.categoryName}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Thứ tự hiển thị *</Label>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  displayOrder: Number(e.target.value) || 0,
                }))
              }
              placeholder="0"
              min="0"
              required
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <CheckboxContainer>
            <Checkbox
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((s) => ({ ...s, isActive: e.target.checked }))
              }
            />
            <Label>Đang hoạt động</Label>
          </CheckboxContainer>
        </FormGroup>

        <ButtonRow>
          <Button type="button" onClick={() => navigate(-1)}>
            Hủy
          </Button>
          <SubmitButton type="submit" disabled={loading}>
            {loading
              ? isEditMode
                ? "Đang cập nhật..."
                : "Đang tạo..."
              : isEditMode
              ? "Cập nhật"
              : "Tạo danh mục"}
          </SubmitButton>
        </ButtonRow>
      </Form>
    </Container>
  );
};

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Form = styled.form`
  background: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: #111827;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1rem;
  height: 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
  }
`;

const SubmitButton = styled(Button)`
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  &:hover {
    background: #2563eb;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  padding: 0.75rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

export default ServiceForm;

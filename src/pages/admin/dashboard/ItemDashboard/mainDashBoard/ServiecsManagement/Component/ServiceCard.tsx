import React from "react";
import styled from "styled-components";
import { CategoryResponse } from "src/shared/types/Reponse/category";

type Props = {
  item: CategoryResponse;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export const ServiceCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <Card>
      <ImageWrapper>
        <Placeholder>Danh mục</Placeholder>
      </ImageWrapper>
      <Status isActive={item.isActive}>
        {item.isActive ? "Đang hoạt động" : "Tạm ngưng"}
      </Status>
      <Name>{item.categoryName}</Name>
      <Description>{item.description}</Description>
      {item.parentCategoryID && (
        <ParentInfo>Danh mục cha: {item.parentCategoryID}</ParentInfo>
      )}
      <DisplayOrder>Thứ tự hiển thị: {item.displayOrder}</DisplayOrder>
      <Actions>
        <ActionButton type="button" onClick={() => onEdit?.(item.categoryID)}>
          Cập nhật
        </ActionButton>
      </Actions>
    </Card>
  );
};

const Card = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: box-shadow 150ms ease;
  background: #fff;
  &:hover {
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
`;

const Placeholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 0.875rem;
`;

const Status = styled.div<{ isActive: boolean }>`
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
  margin-bottom: 0.5rem;
  background: ${(props) => (props.isActive ? "#d1fae5" : "#fee2e2")};
  color: ${(props) => (props.isActive ? "#065f46" : "#991b1b")};
`;

const Name = styled.div`
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
`;

const Description = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
  line-height: 1.4;
`;

const ParentInfo = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const DisplayOrder = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #111827;
  transition: background 120ms ease;
  &:hover {
    background: #f9fafb;
  }
`;

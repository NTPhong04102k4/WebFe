import React from "react";
import styled from "styled-components";
import { AccessoriesListItem } from "src/shared/types/Reponse/accessories/accessory";

type Props = {
  item: AccessoriesListItem;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export const AccessoryCard: React.FC<Props> = ({ item, onEdit, onDelete }) => {
  return (
    <Card>
      <ImageWrapper>
        <Img src={item.imagePath} alt={item.accessoryName} />
      </ImageWrapper>
      <Code>Tồn kho: {item.stockQuantity}</Code>
      <Name>{item.accessoryName}</Name>
      <Price>Giá bán: {item.price}</Price>
      <Actions>
        <ActionButton type="button" onClick={() => onEdit?.(item.accessoryID)}>
          Cập nhập
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

const Img = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Code = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const Name = styled.div`
  font-weight: 600;
  color: #111827;
`;

const Price = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
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

const DeleteButton = styled(ActionButton)`
  color: #dc2626;
  &:hover {
    background: #fef2f2;
  }
`;

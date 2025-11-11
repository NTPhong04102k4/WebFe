import React from "react";
import styled from "styled-components";

type BrandItem = {
  id: string;
  name: string;
};

type Props = {
  brands: BrandItem[];
  loading: boolean;
  isAllSelected: boolean;
  selectedBrands: Set<string>;
  onSelectAll: () => void;
  onToggleBrand: (id: string) => void;
};

export const BrandFilter: React.FC<Props> = ({
  brands,
  loading,
  isAllSelected,
  selectedBrands,
  onSelectAll,
  onToggleBrand,
}) => {
  return (
    <Container>
      <FilterButton
        type="button"
        onClick={onSelectAll}
        $selected={isAllSelected}
      >
        Tất cả
      </FilterButton>

      {loading ? (
        <LoadingText>Đang tải thương hiệu...</LoadingText>
      ) : brands.length === 0 ? (
        <EmptyText>Chưa có dữ liệu thương hiệu</EmptyText>
      ) : (
        brands.map((b) => {
          const isSelected = isAllSelected
            ? false
            : selectedBrands.has(String(b.id));
          return (
            <FilterButton
              key={b.id}
              type="button"
              onClick={() => onToggleBrand(b.name)}
              $selected={isSelected}
              title={b.name}
            >
              {b.name}
            </FilterButton>
          );
        })
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
`;

const FilterButton = styled.button<{ $selected?: boolean }>`
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid ${(p) => (p.$selected ? "#2563eb" : "#e5e7eb")};
  font-size: 0.875rem;
  white-space: nowrap;
  background: ${(p) => (p.$selected ? "#2563eb" : "#ffffff")};
  color: ${(p) => (p.$selected ? "#ffffff" : "#374151")};
  transition: background-color 120ms ease, border-color 120ms ease,
    color 120ms ease;
  &:hover {
    background: ${(p) => (p.$selected ? "#2563eb" : "#f9fafb")};
  }
`;

const LoadingText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const EmptyText = styled.span`
  font-size: 0.875rem;
  color: #9ca3af;
`;

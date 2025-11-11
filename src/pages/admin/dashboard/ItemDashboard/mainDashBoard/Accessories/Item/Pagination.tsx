import React from "react";
import styled from "styled-components";

type Props = {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export const Pagination: React.FC<Props> = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}) => {
  return (
    <Container>
      <InfoText>
        Trang {currentPage}/{totalPages}
      </InfoText>
      <ButtonsRow>
        <Button disabled={currentPage <= 1} onClick={onPrev}>
          Trước
        </Button>
        <Button disabled={currentPage >= totalPages} onClick={onNext}>
          Sau
        </Button>
      </ButtonsRow>
    </Container>
  );
};

const Container = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const InfoText = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
`;

const ButtonsRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background: #ffffff;
  transition: background-color 120ms ease, color 120ms ease, opacity 120ms ease;
  &:hover {
    background: #f9fafb;
  }
  &:disabled {
    color: #9ca3af;
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

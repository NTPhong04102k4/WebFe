import React from "react";
import { CategoryResponse } from "src/shared/types/Reponse/category";
import { ServiceCard } from "./ServiceCard";

type Props = {
  items: CategoryResponse[];
  loading: boolean;
  emptyText?: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export const ServiceGrid: React.FC<Props> = ({
  items,
  loading,
  emptyText = "Chưa có dữ liệu dịch vụ",
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mt-4">
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải dịch vụ...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-400">{emptyText}</div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ServiceCard
            key={item.categoryID}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

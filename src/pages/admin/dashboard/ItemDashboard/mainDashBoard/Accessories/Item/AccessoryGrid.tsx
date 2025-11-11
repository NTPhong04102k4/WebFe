import React from "react";
import { AccessoriesListItem } from "src/shared/types/Reponse/accessories/accessory";
import { AccessoryCard } from "./AccessoryCard";

type Props = {
  items: AccessoriesListItem[];
  loading: boolean;
  emptyText?: string;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
};

export const AccessoryGrid: React.FC<Props> = ({
  items,
  loading,
  emptyText = "Chưa có dữ liệu phụ kiện",
  onEdit,
  onDelete,
}) => {
  return (
    <div className="mt-4">
      {loading ? (
        <div className="text-sm text-gray-500">Đang tải phụ kiện...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-gray-400">{emptyText}</div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <AccessoryCard
            key={item.accessoryID}
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

import React from "react";
import type { CarFiltersValue } from "./CarFilters";
import { CarResponseItem } from "src/shared/types/Reponse/Car";
const BRAND_CAR = {
  TOYOTA: 1,
  HONDA: 2,
  FORD: 3,
  BMW: 4,
  MERCEDES: 5,
};
export const CarList: React.FC<{
  query: CarFiltersValue;
  cars: CarResponseItem[];
  isLoading?: boolean;
  onSelectCar: (id: string) => void;
  onViewDetail: (id: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}> = ({
  query,
  cars,
  isLoading = false,
  onSelectCar,
  onViewDetail,
  onPageChange,
  onPageSizeChange,
}) => {
  const items = cars;
  const getBrandName = (idBrand: number) => {
    switch (idBrand) {
      case BRAND_CAR.TOYOTA:
        return "Toyota";
      case BRAND_CAR.HONDA:
        return "Honda";
      case BRAND_CAR.FORD:
        return "Ford";
      case BRAND_CAR.BMW:
        return "BMW";
      case BRAND_CAR.MERCEDES:
        return "Mercedes";
      default:
        return "Toyota";
    }
  };
  return (
    <div className="border rounded-md p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Danh sách xe</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Hiển thị</span>
          <select
            className="border rounded-md px-2 py-1"
            value={query.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="text-sm text-gray-500">mỗi trang</span>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">Hình ảnh</th>
              <th className="py-2 pr-3">Tên xe</th>
              <th className="py-2 pr-3">Hãng</th>
              <th className="py-2 pr-3">Năm</th>
              <th className="py-2 pr-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={5}>
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="py-6 text-center text-gray-500" colSpan={5}>
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              items.map((c) => {
                const getImageUrl = (): string | null => {
                  if (c.primaryImagePath) {
                    if (typeof c.primaryImagePath === "string") {
                      return c.primaryImagePath;
                    }
                    if (typeof c.primaryImagePath === "object") {
                      return (
                        (c.primaryImagePath as any)?.url ||
                        (c.primaryImagePath as any)?.path ||
                        null
                      );
                    }
                  }

                  if (c.imagePaths) {
                    let images: any[] = [];

                    if (typeof c.imagePaths === "string") {
                      const imagePathsStr = c.imagePaths as string;
                      images = imagePathsStr
                        .split(",")
                        .map((s: string) => s.trim());
                    } else if (Array.isArray(c.imagePaths)) {
                      images = c.imagePaths;
                    }

                    if (images.length > 0) {
                      const firstImage = images[0];
                      if (typeof firstImage === "string") {
                        return firstImage;
                      }
                      if (
                        typeof firstImage === "object" &&
                        firstImage !== null
                      ) {
                        return (
                          (firstImage as any)?.url ||
                          (firstImage as any)?.path ||
                          null
                        );
                      }
                    }
                  }

                  return null;
                };

                const imageUrl = getImageUrl();

                return (
                  <tr key={c.carID} className="border-b hover:bg-gray-50">
                    <td className="py-2 pr-3">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={c.carName}
                          className="w-16 h-16 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/64x64?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-3">{c.carName}</td>
                    <td className="py-2 pr-3">{getBrandName(c.brandID)}</td>
                    <td className="py-2 pr-3">{c.modelYear}</td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 border rounded-md hover:bg-gray-100"
                          onClick={() => onSelectCar(String(c.carID))}
                        >
                          Sửa
                        </button>
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          onClick={() => onViewDetail(String(c.carID))}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          className="px-3 py-1 border rounded-md disabled:opacity-50"
          disabled={query.page <= 1}
          onClick={() => onPageChange(Math.max(1, query.page - 1))}
        >
          Trang trước
        </button>
        <div className="text-sm">
          Trang <span className="font-medium">{query.page}</span>
        </div>
        <button
          className="px-3 py-1 border rounded-md"
          onClick={() => onPageChange(query.page + 1)}
        >
          Trang sau
        </button>
      </div>
    </div>
  );
};

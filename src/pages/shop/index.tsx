import React, { useEffect, useState, useCallback } from "react";
import { logger } from "@/common/utils/logger";
import { DATA_CATEGORIES, DetailItem } from "./data";
import { CustomPriceSlider } from "./item/SliderPrice";
import { ProductCard } from "./item/ProductCard";
import { Pagination } from "./item/Pagination";

enum SortPrice {
  ASCENDING = "Ascending",
  DESCENDING = "Descending",
  LATEST = "Latest",
  ALL = "All",
}
const ITEMS_PER_PAGE = 100;
const Shop: React.FC = () => {
  const [cost, setCost] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(
    DATA_CATEGORIES[0].id
  );
  const [filteredData, setFilteredData] = useState<DetailItem[]>(
    DATA_CATEGORIES[0].data
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState(SortPrice.ALL);

  const sortData = useCallback((data: DetailItem[], sortType: SortPrice) => {
    switch (sortType) {
      case SortPrice.ASCENDING:
        return [...data].sort((a, b) => a.priceSell - b.priceSell);
      case SortPrice.DESCENDING:
        return [...data].sort((a, b) => b.priceSell - a.priceSell);
      case SortPrice.LATEST:
        const currentYear = new Date().getFullYear();
        return data.filter(
          (item) => item.dateOfManufacture.getFullYear() === currentYear
        );
      default:
        return data;
    }
  }, []);

  const filterByPrice = useCallback((data: DetailItem[], price: number) => {
    if (price === 0) return data;
    const upperLimit = price + 50;
    const lowerLimit = price > 50 ? price - 50 : 0;
    return data.filter(
      (item) => item.priceSell >= lowerLimit && item.priceSell <= upperLimit
    );
  }, []);

  useEffect(() => {
    const categoryData =
      DATA_CATEGORIES.find((item) => item.id === selectedCategory)?.data || [];
    const sortedData = sortData(categoryData, filter);
    const finalData = filterByPrice(sortedData, cost);
    setFilteredData(finalData);
    setCurrentPage(1);
  }, [selectedCategory, filter, cost, sortData, filterByPrice]);

  const handleSelectCategory = useCallback((categoryId: string | number) => {
    setSelectedCategory(categoryId);
    setCost(0);
  }, []);

  const handleAddToCart = useCallback((item: DetailItem) => {
    logger.log("Adding to cart:", item);
  }, []);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col w-full bg-[#050b2b]">
      <main className="bg-white rounded-b-lg p-8">
        <nav className="text-base  mb-0 font-sans ">Home / Shop</nav>
        <h2 className="text-2xl mb-6 font-sans font-medium">Shop</h2>
        <div className="flex">
          <aside className="w-1/4 pr-6">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-lg font-medium mb-4">Categories</h2>
              {DATA_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  className={`block w-full text-left py-2 ${
                    selectedCategory === category.id ? "text-blue-500" : ""
                  }`}
                  onClick={() => handleSelectCategory(category.id)}
                >
                  {category.name} ({category.nums})
                </button>
              ))}
            </div>
            <CustomPriceSlider setCost={setCost} item={selectedCategory} />
          </aside>

          <section className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p>
                Showing {Math.min(ITEMS_PER_PAGE, filteredData.length)} of{" "}
                {filteredData.length} results
              </p>
              <select
                className="p-2 rounded-md border"
                value={filter}
                onChange={(e) => setFilter(e.target.value as SortPrice)}
                aria-label="Sort by"
              >
                {Object.values(SortPrice).map((sortType) => (
                  <option key={sortType} value={sortType}>
                    {sortType}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {displayData.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            <Pagination
              totalRes={filteredData.length}
              currentPage={currentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Shop;

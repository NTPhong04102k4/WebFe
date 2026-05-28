import React, { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface FlatListProps<T> {
  data: T[];
  renderItem: (info: { item: T; index: number }) => React.ReactNode;
  keyExtractor?: (item: T, index: number) => string | number;
  inverted?: boolean;
  estimateSize?: (index: number) => number;
  onViewableItemsChanged?: (info: {
    viewableItems: Array<{ item: T; index: number }>;
    changed: Array<{ item: T; index: number; isViewable: boolean }>;
  }) => void;
  className?: string;
  style?: React.CSSProperties;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export function FlatList<T>({
  data,
  renderItem,
  keyExtractor = (_, idx) => idx,
  inverted = false,
  estimateSize = () => 105,
  onViewableItemsChanged,
  className = "",
  style,
  scrollRef,
  onScroll,
}: FlatListProps<T>) {
  const localRef = useRef<HTMLDivElement>(null);
  const parentRef = scrollRef || localRef;

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  const prevVisibleIndicesRef = useRef<number[]>([]);

  const virtualItems = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (!onViewableItemsChanged) return;

    const currentIndices = virtualItems.map((vi) => vi.index);

    const hasChanged =
      currentIndices.length !== prevVisibleIndicesRef.current.length ||
      currentIndices.some((idx, i) => idx !== prevVisibleIndicesRef.current[i]);

    if (hasChanged) {
      const viewableItems = virtualItems.map((vi) => ({
        item: data[vi.index],
        index: vi.index,
      }));

      const prevSet = new Set(prevVisibleIndicesRef.current);
      const currSet = new Set(currentIndices);

      const changed: Array<{ item: T; index: number; isViewable: boolean }> = [];

      currentIndices.forEach((idx) => {
        if (!prevSet.has(idx)) {
          changed.push({ item: data[idx], index: idx, isViewable: true });
        }
      });

      prevVisibleIndicesRef.current.forEach((idx) => {
        if (!currSet.has(idx) && idx < data.length) {
          changed.push({ item: data[idx], index: idx, isViewable: false });
        }
      });

      onViewableItemsChanged({ viewableItems, changed });
      prevVisibleIndicesRef.current = currentIndices;
    }
  }, [virtualItems, data, onViewableItemsChanged]);

  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div
      ref={parentRef}
      className={`overflow-y-auto relative ${className}`}
      onScroll={onScroll}
      style={{
        ...style,
        ...(inverted ? { transform: "scaleY(-1)" } : {}),
      }}
    >
      <div
        style={{
          height: `${totalSize}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map((virtualRow) => {
          const index = virtualRow.index;
          const item = data[index];
          if (!item) return null;

          return (
            <div
              key={virtualRow.key}
              data-index={index}
              ref={rowVirtualizer.measureElement}
              className="absolute left-0 top-0 w-full"
              style={{
                transform: `translateY(${virtualRow.start}px) ${
                  inverted ? "scaleY(-1)" : ""
                }`,
              }}
            >
              {renderItem({ item, index })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";

export const OverviewText = ({
  description,
}: {
  description?: string | null;
}) => {
  const [expanded, setExpanded] = React.useState(false);
  const safeText =
    description?.trim() || "Information is being updated. Please check back.";
  const shouldAllowToggle = safeText.length > 220;

  return (
    <div className="mt-4">
      <p
        className={`text-sm md:text-base text-gray-700 leading-relaxed transition-all duration-300 whitespace-pre-line ${
          expanded ? "max-h-[600px]" : "max-h-[96px] overflow-hidden"
        }`}
      >
        {safeText}
      </p>
      {shouldAllowToggle && (
        <button
          type="button"
          className="mt-3 text-blue-600 text-sm font-medium hover:underline"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      )}
    </div>
  );
};

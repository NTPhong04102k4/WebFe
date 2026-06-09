import { Checkbox } from "@/components/core/Form/Checkbox";
import { formatCurrency } from "@/common/utils/formatCurrency";
import type { DisplayItem } from "../cartHelpers";

interface Props {
  item: DisplayItem;
  isSelected: boolean;
  onToggle: () => void;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export default function CartItemCard({ item, isSelected, onToggle, onRemove, onUpdateQuantity }: Props) {
  const isCar = item.type === "car";
  const unavailable = item.isAvailable === false;

  return (
    <div
      className={`flex gap-4 rounded-xl border bg-white p-4 ${
        unavailable ? "border-red-200 opacity-75" : "border-slate-200"
      }`}
    >
      <div className="flex items-center">
        <Checkbox
          checked={isSelected}
          disabled={unavailable}
          onChange={() => !unavailable && onToggle()}
        />
      </div>
      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        {item.imagePath ? (
          <img className="h-full w-full object-cover" src={item.imagePath} alt={item.name} />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium uppercase text-slate-500">
          {isCar ? "Xe" : "Phụ kiện"}
        </div>
        <h2 className="mt-1 font-semibold text-slate-900">{item.name}</h2>
        {unavailable ? (
          <p className="mt-1 text-xs text-red-600">
            {item.unavailableReason ?? "Không còn khả dụng"}
          </p>
        ) : (
          <p className="mt-1 text-sm font-semibold text-blue-700">{formatCurrency(item.price)}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          {!isCar ? (
            <>
              <button
                type="button"
                className="h-8 w-8 rounded border"
                onClick={() => onUpdateQuantity(item.quantity - 1)}
              >
                -
              </button>
              <span className="w-8 text-center text-sm">{item.quantity}</span>
              <button
                type="button"
                className="h-8 w-8 rounded border"
                onClick={() => onUpdateQuantity(item.quantity + 1)}
              >
                +
              </button>
            </>
          ) : (
            <span className="text-sm text-slate-500">Số lượng: 1</span>
          )}
          <button type="button" className="ml-3 text-sm text-red-600" onClick={onRemove}>
            Xóa
          </button>
        </div>
      </div>
      <div className="text-right font-semibold text-slate-900">
        {unavailable ? (
          <span className="text-sm text-red-500">Không khả dụng</span>
        ) : (
          formatCurrency(item.price * item.quantity)
        )}
      </div>
    </div>
  );
}

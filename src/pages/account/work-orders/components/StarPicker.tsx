import { useState } from "react";
import { Star } from "lucide-react";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export function StarPicker({ value, onChange }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(null)}
          className="p-0.5 focus:outline-none"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              s <= active ? "fill-amber-400 text-amber-400" : "fill-none text-slate-300"
            }`}
          />
        </button>
      ))}
      <span className="ml-1 self-center text-sm text-slate-500">{value}/5</span>
    </div>
  );
}

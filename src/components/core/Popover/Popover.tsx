import React from "react";

import { cn } from "../utils";

export type HoverInfoProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
};

const sideClass = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "left-1/2 top-full mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export function HoverInfo({ children, content, side = "top", className }: HoverInfoProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-40 hidden w-max max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg group-hover:block group-focus-within:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
          sideClass[side],
          className
        )}
      >
        {content}
      </span>
    </span>
  );
}

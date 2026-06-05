import React from "react";
import { X } from "lucide-react";

import { cn } from "../utils";

export type ModalProps = {
  open: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnBackdrop?: boolean;
};

const sizeClass = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  size = "md",
  closeOnBackdrop = true,
}: ModalProps) {
  // Dùng ref để Escape listener luôn gọi onClose mới nhất mà không cần re-register mỗi render
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  });

  React.useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]); // chỉ phụ thuộc vào open, không phụ thuộc onClose

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        // onClick thay vì onMouseDown: chỉ đóng khi cả mousedown lẫn mouseup đều trên backdrop
        // tránh đóng modal khi user đang kéo text trong form
        if (closeOnBackdrop && event.target === event.currentTarget) onClose();
      }}
    >
      <div className={cn("w-full rounded-xl bg-white shadow-xl-light dark:bg-slate-900 dark:shadow-xl-dark", sizeClass[size])}>
        <div className="flex items-center justify-between gap-4 border-b border-slate-300 px-5 py-4 dark:border-slate-600">
          {title ? <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2> : <span />}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Dong"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-slate-300 px-5 py-4 dark:border-slate-600">{footer}</div> : null}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

import { Input } from "src/components/core";

type AccessoryMediaFieldProps = {
  label: string;
  kind: "image" | "video";
  existingUrl?: string | null;
  value: File | null;
  onChange: (file: File | null) => void;
  error?: string;
};

export function AccessoryMediaField({
  label,
  kind,
  existingUrl,
  value,
  onChange,
  error,
}: AccessoryMediaFieldProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  const accept = kind === "image" ? "image/*" : "video/*";
  const hasExisting = Boolean(existingUrl);
  const countLabel =
    kind === "image"
      ? hasExisting
        ? "Đã có 1 ảnh"
        : "Chưa có ảnh"
      : hasExisting
        ? "Đã có 1 video"
        : "Chưa có video";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
          {label}
        </span>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-200">
          {countLabel}
        </span>
      </div>

      {previewUrl ? (
        kind === "image" ? (
          <img
            src={previewUrl}
            alt={label}
            className="h-32 w-full rounded-lg border-2 border-blue-400 object-cover"
          />
        ) : (
          <video
            src={previewUrl}
            controls
            className="h-32 w-full rounded-lg border-2 border-blue-400 object-cover"
          />
        )
      ) : hasExisting ? (
        kind === "image" ? (
          <img
            src={existingUrl ?? undefined}
            alt={label}
            className="h-32 w-full rounded-lg border-2 border-slate-300 object-cover dark:border-slate-600"
          />
        ) : (
          <video
            src={existingUrl ?? undefined}
            controls
            className="h-32 w-full rounded-lg border-2 border-slate-300 object-cover dark:border-slate-600"
          />
        )
      ) : null}

      {previewUrl ? (
        <p className="text-xs text-blue-600 dark:text-blue-400">
          File mới sẽ thay thế {kind === "image" ? "ảnh" : "video"} hiện tại khi lưu.
        </p>
      ) : null}

      <Input
        type="file"
        accept={accept}
        error={error}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}

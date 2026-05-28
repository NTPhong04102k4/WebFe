import { useRef, useState } from "react";

const ROLE_LABEL: Record<string, string> = {
  Customer: "Khách hàng",
  Admin: "Quản trị viên",
  SuperAdmin: "Super Admin",
  Staff: "Nhân viên",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface AvatarSectionProps {
  name: string;
  username: string;
  email: string;
  role: string;
  imageUrl?: string;
  onImageChange: (file: File) => void;
  isUploading: boolean;
}

export function AvatarSection({
  name,
  username,
  email,
  role,
  imageUrl,
  onImageChange,
  isUploading,
}: AvatarSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageChange(file);
  };

  const avatarSrc = preview ?? imageUrl;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-offset-2 ring-blue-100 hover:ring-blue-400"
            title="Đổi ảnh đại diện"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-blue-600 text-xl font-bold text-white">
                {getInitials(name)}
              </span>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </span>
          </button>
          {isUploading && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
              <svg
                className="h-4 w-4 animate-spin text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            </span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 truncate">{name}</h2>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {ROLE_LABEL[role] ?? role}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 truncate">
            @{username} · {email}
          </p>
        </div>
      </div>
    </div>
  );
}

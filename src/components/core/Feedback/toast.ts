import toast from "react-hot-toast";

const BASE_STYLE: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: 500,
  borderRadius: "10px",
  padding: "12px 16px",
  maxWidth: "400px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
};

export const notify = {
  /** Thao tác CRUD thành công */
  success: (message: string) =>
    toast.success(message, {
      style: {
        ...BASE_STYLE,
        background: "#f0fdf4",
        color: "#166534",
        border: "1px solid #bbf7d0",
      },
      iconTheme: { primary: "#16a34a", secondary: "#f0fdf4" },
      duration: 2000,
    }),

  /** Thao tác CRUD thất bại hoặc lỗi hệ thống */
  error: (message: string) =>
    toast.error(message, {
      style: {
        ...BASE_STYLE,
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      },
      iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
      duration: 3000,
    }),

  /** Điều kiện chưa đủ / thông báo trung tính (không phải lỗi) */
  info: (message: string) =>
    toast(message, {
      icon: "ℹ️",
      style: {
        ...BASE_STYLE,
        background: "#eff6ff",
        color: "#1e40af",
        border: "1px solid #bfdbfe",
      },
      duration: 2500,
    }),

  loading: (message: string) =>
    toast.loading(message, {
      style: { ...BASE_STYLE, background: "#f8fafc", color: "#334155" },
    }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
};

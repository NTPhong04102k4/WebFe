// Drive type của xe (hệ dẫn động)
export const DRIVE_TYPE = {
  RWD: "rwd", // Rear-Wheel Drive - dẫn động cầu sau
  FWD: "fwd", // Front-Wheel Drive - dẫn động cầu trước
  AWD: "awd", // All-Wheel Drive - dẫn động 4 bánh toàn thời gian
  FOUR_WD: "4wd", // Four-Wheel Drive - dẫn động 4 bánh bán thời gian (gài cầu)
} as const;

// Loại nhiên liệu của xe
export const FUEL_TYPE = {
  GASOLINE: "gasoline", // Xăng
  DIESEL: "diesel", // Dầu diesel
  ELECTRIC: "electric", // Xe điện hoàn toàn (chạy bằng pin/động cơ điện)
  HYBRID: "hybrid", // Xe lai - kết hợp động cơ đốt trong và động cơ điện
  PHEV: "phev", // Plug-in Hybrid Electric Vehicle - hybrid sạc điện ngoài
  MHEV: "mhev", // Mild Hybrid Electric Vehicle - hybrid nhẹ, hỗ trợ động cơ chính
  CNG: "cng", // Compressed Natural Gas - khí thiên nhiên nén
  LPG: "lpg", // Liquefied Petroleum Gas - khí dầu mỏ hóa lỏng (gas)
  HYDROGEN: "hydrogen", // Khí hydro - dùng cho xe pin nhiên liệu (fuel cell)
  ETHANOL: "ethanol", // Cồn ethanol (xăng sinh học, ví dụ E85)
} as const;

// Tình trạng xe
export const CAR_CONDITION = {
  NEW: "new", // Xe mới
  USED: "used", // Xe đã qua sử dụng
  CERTIFIED: "certified", // Xe đã qua sử dụng được chứng nhận (Certified Pre-Owned)
} as const;

// Giới tính
export const GENDER = {
  MALE: "male", // Nam
  FEMALE: "female", // Nữ
  OTHER: "other", // Khác
} as const;

// Vị trí lưu trữ xe
export const LOCATION_TYPE = {
  STORE: "store", // Cửa hàng / showroom
  WAREHOUSE: "kho", // Kho lưu trữ
  WORKSHOP: "xuong", // Xưởng sửa chữa / bảo dưỡng
} as const;

// Trạng thái xe
export const CAR_STATUS = {
  INCOMING: "incoming", // Xe sắp về / đang nhập kho
  AVAILABLE: "available", // Xe sẵn sàng để bán
  RESERVED: "reserved", // Xe đã được đặt cọc/giữ chỗ
  SOLD: "sold", // Xe đã bán
  MAINTENANCE: "maintenance", // Xe đang bảo trì/bảo dưỡng
  INACTIVE: "inactive", // Xe ngừng hoạt động/không kinh doanh
} as const;

export type DriveType = (typeof DRIVE_TYPE)[keyof typeof DRIVE_TYPE];
export type FuelType = (typeof FUEL_TYPE)[keyof typeof FUEL_TYPE];
export type CarCondition = (typeof CAR_CONDITION)[keyof typeof CAR_CONDITION];
export type Gender = (typeof GENDER)[keyof typeof GENDER];
export type LocationType = (typeof LOCATION_TYPE)[keyof typeof LOCATION_TYPE];
export type CarStatus = (typeof CAR_STATUS)[keyof typeof CAR_STATUS];

// Options sẵn dùng cho Select component (value/label)
export const DRIVE_TYPE_OPTIONS = [
  { value: DRIVE_TYPE.FWD, label: "Dẫn động cầu trước (FWD)" },
  { value: DRIVE_TYPE.RWD, label: "Dẫn động cầu sau (RWD)" },
  { value: DRIVE_TYPE.AWD, label: "Dẫn động 4 bánh toàn thời gian (AWD)" },
  { value: DRIVE_TYPE.FOUR_WD, label: "Dẫn động 4 bánh bán thời gian (4WD)" },
];

export const FUEL_TYPE_OPTIONS = [
  { value: FUEL_TYPE.GASOLINE, label: "Xăng" },
  { value: FUEL_TYPE.DIESEL, label: "Dầu diesel" },
  { value: FUEL_TYPE.ELECTRIC, label: "Điện" },
  { value: FUEL_TYPE.HYBRID, label: "Hybrid (xăng + điện)" },
  { value: FUEL_TYPE.PHEV, label: "Plug-in Hybrid (PHEV)" },
  { value: FUEL_TYPE.MHEV, label: "Mild Hybrid (MHEV)" },
  { value: FUEL_TYPE.CNG, label: "Khí thiên nhiên nén (CNG)" },
  { value: FUEL_TYPE.LPG, label: "Khí dầu mỏ hóa lỏng (LPG)" },
  { value: FUEL_TYPE.HYDROGEN, label: "Hydro (pin nhiên liệu)" },
  { value: FUEL_TYPE.ETHANOL, label: "Cồn ethanol" },
];

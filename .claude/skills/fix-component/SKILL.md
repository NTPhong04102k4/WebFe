---
name: fix-component
description: Enforce dùng component có sẵn trong src/components/. KHÔNG tự viết raw HTML cho modal, input, select, table, spinner, empty state, combobox, date picker, tooltip.
argument-hint: "[file path]"
---

# Enforce Project Components — SoldCar

## Quy tắc bắt buộc

**KHÔNG bao giờ** tự viết raw HTML cho các UI pattern đã có sẵn trong `src/components/`.
Mỗi khi thấy raw `<input>`, `<select>`, `<table>`, overlay div, spinner div → phải thay bằng component tương ứng dưới đây.

---

## Catalog đầy đủ — src/components/

### Modal
```tsx
import { Modal } from "src/components/core/Modal/Modal";

<Modal
  open={boolean}
  title="Tiêu đề"
  onClose={() => setOpen(false)}
  size="sm" | "md" | "lg" | "xl"   // default "md"
  footer={<div className="flex gap-3">...</div>}  // optional
  closeOnBackdrop={true}  // default true
>
  {/* content */}
</Modal>
```

### Input
```tsx
import { Input } from "src/components/core/Form/Input";

// Standalone
<Input label="Tên" placeholder="..." value={val} onChange={(e) => setVal(e.target.value)} />

// react-hook-form
<Input label="Email" required error={errors.email?.message} {...register("email", { required: "Bắt buộc" })} />

// Inline validation
<Input type="date" label="Ngày" error={submitted && !val ? "Vui lòng chọn ngày" : undefined} />

// Các type hỗ trợ: text, password, email, number, date, time, tel, url, search
```

### Select (single)
```tsx
import { Select } from "src/components/core/Select/Select";
import type { SelectOption } from "src/components/core/Select/Select";

const options: SelectOption[] = items.map((item) => ({ value: item.id, label: item.name }));

// Standalone — onChange nhận SyntheticEvent, KHÔNG phải value string trực tiếp
<Select
  label="Chi nhánh"
  options={options}
  placeholder="-- Chọn --"
  value={selectedId}
  onChange={(e) => setSelectedId(e.target.value)}
  error={submitted && !selectedId ? "Vui lòng chọn" : undefined}
/>

// react-hook-form (register spread hoạt động vì forwardRef + ...props trên native <select>)
<Select label="Loại" options={options} placeholder="-- Chọn --" error={errors.type?.message} {...register("type", { required: "Bắt buộc" })} />
```

⚠️ **TRAP**: `onChange` là `React.ChangeEvent<HTMLSelectElement>`, KHÔNG phải `(value: string) => void`.
Nếu code cũ có `onChange={(value) => setX(value)}` → phải đổi thành `onChange={(e) => setX(e.target.value)}`.

### ComboBox (multi-select)
```tsx
import { ComboBox } from "src/components/common/ComboBox";

const options = [{ label: "Toyota", value: "toyota" }, ...];

<ComboBox
  label="Hãng xe"
  placeholder="Chọn hãng..."
  value={selectedValues}       // string[]
  valueCollection={options}
  onChange={(vals) => setSelectedValues(vals)}  // (string[]) => void
/>
```

### Checkbox
```tsx
import { Checkbox } from "src/components/core/Form/Checkbox";

<Checkbox label="Đồng ý điều khoản" checked={val} onChange={(e) => setVal(e.target.checked)} />

// react-hook-form
<Checkbox label="Kích hoạt" {...register("isActive")} />
```

### Radio
```tsx
import { Radio } from "src/components/core/Form/Radio";

{["Nam", "Nữ", "Khác"].map((g) => (
  <Radio key={g} label={g} value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} />
))}

// react-hook-form
<Radio label="Nam" value="Male" {...register("gender")} />
```

### DataTable
```tsx
import { DataTable } from "src/components/core/Table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<MyType>[] = [
  { accessorKey: "name", header: "Tên" },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <button onClick={() => handleEdit(row.original)}>Sửa</button>,
  },
];

<DataTable
  data={data ?? []}
  columns={columns}
  loading={isLoading}
  emptyTitle="Chưa có dữ liệu"
  emptyDescription="Thêm mục mới để bắt đầu."
  onRowClick={(row) => setSelected(row)}   // optional
  enablePagination                          // optional, default false
  initialPageSize={20}                     // optional
/>
```

### DateTimePicker (range)
```tsx
import { DateTimePicker } from "src/components/common/DateTimePicker";
import type { DateTimeRangeValue } from "src/components/common/DateTimePicker";

const [range, setRange] = useState<DateTimeRangeValue>({ fromDate: "", toDate: "" });

<DateTimePicker label="Khoảng thời gian" value={range} onChange={setRange} />

// Lấy giá trị: range.fromDate, range.toDate (string dạng datetime-local)
```

⚠️ Dùng cho **date range**. Nếu chỉ cần 1 ngày/giờ → dùng `<Input type="date">` hoặc `<Input type="time">`.

### EmptyState
```tsx
// Named export từ core (dùng trong DataTable hoặc standalone)
import { EmptyState } from "src/components/core/Feedback/EmptyState";
<EmptyState title="Chưa có dữ liệu" description="Mô tả thêm" />

// Default export từ common (có thêm prop action)
import EmptyState from "src/components/common/EmptyState";
<EmptyState title="Chưa có xe" description="Thêm xe mới." action={<button>Thêm</button>} />
```

### Loading / Spinner
```tsx
// Core — dùng trong DataTable hoặc full-page load
import { Loading } from "src/components/core/Feedback/Loading";
<Loading />

// Common — spinner nhỏ hơn với size control
import LoadingSpinner from "src/components/common/LoadingSpinner";
<LoadingSpinner size="sm" | "md" | "lg" />
```

### Tooltip (HoverInfo)
```tsx
import { HoverInfo } from "src/components/core/Popover/Popover";

<HoverInfo content="Giải thích thêm" side="top" | "bottom" | "left" | "right">
  <span>Hover vào đây</span>
</HoverInfo>
```

---

## Validation pattern — inline errors thay vì notify.info

**KHÔNG** dùng `notify.info("Vui lòng điền đầy đủ")` để validate form.  
**DÙNG** `submitted` state + `error` prop trên từng field:

```tsx
const [submitted, setSubmitted] = useState(false);

function handleSubmit() {
  setSubmitted(true);
  if (!vehicleID || !locationID) return;
  // proceed
}

<Select
  label="Xe"
  options={vehicleOptions}
  value={vehicleID}
  onChange={(e) => setVehicleID(e.target.value)}
  error={submitted && !vehicleID ? "Vui lòng chọn xe" : undefined}
/>
```

## datetime-local pitfall

Browser cần cả ngày VÀ giờ mới có `value`. Chỉ chọn ngày → `e.target.value = ""` → state không update.

**Fix**: Tách thành 2 input, hoặc dùng `DateTimePicker` nếu cần range.

```tsx
// 2 input riêng
<Input type="date" label="Ngày" value={date} onChange={(e) => setDate(e.target.value)} />
<Input type="time" label="Giờ" value={time} onChange={(e) => setTime(e.target.value)} />
const isoString = date && time ? new Date(`${date}T${time}`).toISOString() : "";
```

---

## Hướng dẫn thực hiện

1. Đọc file từ `$ARGUMENTS`
2. Scan toàn bộ JSX tìm:
   - Raw `<input>` → `Input`
   - Raw `<select>` / local Select wrapper → `Select`
   - Raw `<table>` / custom table → `DataTable`
   - Overlay div / custom modal → `Modal`
   - Spinner div / loading skeleton tự viết → `Loading` hoặc `LoadingSpinner`
   - "Không có dữ liệu" div → `EmptyState`
   - Multi-select tự viết → `ComboBox`
   - Date range inputs → `DateTimePicker`
   - Tooltip div → `HoverInfo`
3. Cập nhật imports
4. Chuyển đổi từng element, chú ý `Select.onChange` signature
5. Thay `notify.info` validation toast bằng inline `error` prop + `submitted` state
6. Nếu file > ~200 lines sau khi thay component:
   - Tách logic ra `useXxxHandler.ts` (state/query/mutation/handlers)
   - Tách UI thành sub-components trong `components/`
   - Đặt pure utils/types vào `<page>Helpers.ts`
   - `index.tsx` chỉ còn: gọi hook + render composition

---

## Component Splitting — page > ~200 lines

Khi page component quá dài, tách ra `components/` subfolder trong cùng thư mục page:

```
src/pages/<role>/<Page>/
├── index.tsx              ← CHỈ render UI — không có useState/useMutation/useQuery
├── useXxxHandler.ts       ← toàn bộ state, query, mutation, handlers — export 1 hook
├── <page>Helpers.ts       ← utility functions thuần (getImageSrc, formatXxx, pure types)
└── components/
    ├── <Item>Card.tsx      ← card/row trong grid hoặc list
    ├── <Item>Filters.tsx   ← filter panel (Input + Select)
    ├── <Feature>Modal.tsx  ← modal đặc thù của page
    └── <Feature>Bar.tsx    ← floating bar / action bar
```

**Nguyên tắc:**
- `index.tsx` **không có** `useState`, `useMutation`, `useQuery`, `useEffect` — chỉ gọi hook + render JSX
- `useXxxHandler.ts` export 1 hook duy nhất, trả về object typed với tất cả state/handlers
- Props callbacks truyền `string` value, không truyền `SyntheticEvent` xuống sub-component
- Handler gọi `setPage(1)` được đóng gói trong `useXxxHandler` trước khi expose
- Utility function thuần (không có hook) → `<page>Helpers.ts`

---

### Pattern: useXxxHandler.ts

```ts
// useCartHandler.ts
export type CartHandlerReturn = {
  // data
  items: DisplayItem[];
  isLoading: boolean;
  // actions
  handleRemove: (type: "car" | "accessory", id: number) => void;
  handleCheckout: () => void;
  // form state
  paymentMethod: string;
  handlePaymentMethodChange: (method: string) => void;
  // ui
  showPremiumGate: boolean;
  setShowPremiumGate: (v: boolean) => void;
  // ... tất cả các field cần cho UI
};

export function useCartHandler(): CartHandlerReturn {
  // state
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER");

  // queries / mutations
  const createOrder = useMutation({ ... });

  // handlers — đóng gói side-effect trước khi expose
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
    if (method !== "BANK_TRANSFER") setIsInstallment(false);  // side-effect đi kèm
  };

  return { items, isLoading, handleRemove, handleCheckout, paymentMethod, handlePaymentMethodChange, ... };
}
```

```tsx
// index.tsx — chỉ render
export default function CartPage() {
  const h = useCartHandler();

  if (h.isLoading) return <LoadingSpinner />;

  return (
    <>
      <CartItemCard onRemove={() => h.handleRemove(...)} />
      <CartSummaryPanel
        paymentMethod={h.paymentMethod}
        onPaymentMethodChange={h.handlePaymentMethodChange}
        onCheckout={h.handleCheckout}
      />
    </>
  );
}
```

**Ví dụ thực tế — Cart page (`src/pages/customer/Cart/`):**
```
index.tsx             ← 120 lines, chỉ JSX + gọi useCartHandler
useCartHandler.ts     ← state/query/mutation/handlers, export CartHandlerReturn
cartHelpers.ts        ← DisplayItem type + adaptServerCart()
components/
  CartItemCard.tsx    ← props: item, isSelected, onToggle, onRemove, onUpdateQuantity
  CartSummaryPanel.tsx ← props: tất cả checkout state + handlers từ hook
```

**Ví dụ — Cars page (`src/pages/customer/Cars/`):**
```
index.tsx          ← state + useQuery + compose CarFilters/CarCard/CompareModal/CompareBar
carHelpers.ts      ← getImageSrc(car)
components/
  CarFilters.tsx   ← props: filter values + onXxxChange(value: string) + onReset
  CarCard.tsx      ← props: car, img, inCompare, onToggleCompare, inCart, onAddToCart
  CompareModal.tsx ← props: cars[], onClose  (dùng Modal core)
  CompareBar.tsx   ← props: compareList, onToggle, onClear, onCompare
```

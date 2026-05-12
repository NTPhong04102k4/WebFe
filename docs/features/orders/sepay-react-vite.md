# SePay Payment — Hướng dẫn tích hợp React + Vite

## Tổng quan luồng thanh toán

```
Customer đặt hàng
      │
      ▼
POST /orders/payment/order          ← gửi OrderInput (JWT Customer)
      │
      ▼
API trả về CreateOrderResult
  ├── order.orderNumber              ← "SC20240101120000123"
  └── payment.qrImageUrl             ← URL ảnh QR SePay (gen bởi SERVER, client chỉ render)
      payment.transferContent        ← nội dung CK khách điền (= orderNumber, bắt đầu "SC")
      payment.bankAccount            ← "0365022794"
      payment.bankName               ← "Ngân hàng Quân đội MB"
      payment.amount                 ← số tiền chính xác (VND)
      payment.signature              ← HMAC-SHA256 để xác minh response không bị tamper
      │
      ▼
Hiển thị QR + hướng dẫn chuyển khoản cho khách
      │
      ▼
Khách chuyển khoản (ngân hàng mobile app)
      │
      ▼
SePay phát hiện → gọi POST /orders/payment/sepay-ipn  ← server-to-server
      │
      ▼
Backend xác thực + cập nhật PaymentStatus = "success"
      │
      ▼
Frontend polling GET /orders/payment/order/{orderNumber}
  → khi paymentStatus === "success" → chuyển sang trang thành công
```

---

## 1. Cài đặt môi trường React + Vite

```bash
npm create vite@latest soldcars-web -- --template react-ts
cd soldcars-web
npm install
npm install axios react-query @tanstack/react-query
npm install react-router-dom
npm install --save-dev @types/react @types/react-dom
```

---

## 2. Cấu hình biến môi trường

Dùng **`VITE_API_BASE_URL`** trỏ tới Web API (cùng host mà app gọi `POST /orders/payment/order`, v.v.). Mẫu đầy đủ: [`../../fe.env.example`](../../fe.env.example).

`.env.development` (ví dụ):

```env
VITE_API_BASE_URL=https://localhost:7250
VITE_RETURN_URL=http://localhost:5173/soldcars/payment/success
VITE_CANCEL_URL=http://localhost:5173/soldcars/payment/cancel
```

`.env.production` (thay placeholder bằng URL deploy thật — **không** hardcode nhiều host khác nhau giữa các tài liệu):

```env
VITE_API_BASE_URL=https://YOUR-API-HOST
VITE_RETURN_URL=https://YOUR-FRONTEND-HOST/soldcars/payment/success
VITE_CANCEL_URL=https://YOUR-FRONTEND-HOST/soldcars/payment/cancel
```

---

## 3. Axios instance với JWT

```ts
// src/lib/axios.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh hoặc redirect khi 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 4. TypeScript types

```ts
// src/types/order.ts

export interface OrderCarItem {
  carID: number
  discountAmount?: number
}

export interface OrderAccessoryItem {
  accessoryID: number
  quantity: number
  discountAmount?: number
}

export interface CreateOrderInput {
  orderType: 'CAR' | 'ACCESSORY' | 'MIXED'
  paymentMethod: 'BANK_TRANSFER' | 'CARD' | 'NAPAS_BANK_TRANSFER'
  isInstallment?: boolean
  installmentMonths?: number
  downPayment?: number
  deliveryAddress?: string
  notes?: string
  cars: OrderCarItem[]
  accessories: OrderAccessoryItem[]
}

export interface SepayPaymentInfo {
  qrImageUrl: string
  /** = OrderNumber — khách phải điền ĐÚNG vào nội dung chuyển khoản */
  transferContent: string
  /** Số TK của merchant: 0365022794 */
  bankAccount: string
  /** Tên ngân hàng: Ngân hàng Quân đội MB */
  bankName: string
  /** Số tiền VND, phải chuyển đúng số này */
  amount: number
  orderNumber: string
  expiredAt?: string        // ISO 8601
  /** HMAC-SHA256 để xác minh response không bị hacker thay đổi */
  signature: string
}

export interface OrderViewModel {
  orderID: number
  orderNumber: string
  orderType: string
  orderStatus: string
  subTotal: number
  taxRate: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string     // "Pending" | "success" | "Failed"
  paymentDate?: string
  paymentReference?: string
  isInstallment: boolean
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryAddress?: string
  notes?: string
  createdDate: string
  updatedDate: string
  cars: OrderCarDetailViewModel[]
  accessories: OrderAccessoryDetailViewModel[]
}

export interface OrderCarDetailViewModel {
  carID: number
  carName: string
  carBrand: string
  carModel: string
  carVIN: string
  unitPrice: number
  discountAmount: number
  totalPrice: number
}

export interface OrderAccessoryDetailViewModel {
  accessoryID: number
  accessoryName: string
  accessoryCode: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CreateOrderResult {
  order: OrderViewModel
  payment?: SepayPaymentInfo
}

export interface OperationResult<T = unknown> {
  success: boolean
  errorCode?: string
  message?: string
  data?: T
}
```

---

## 5. API service functions

```ts
// src/services/orderService.ts
import { api } from '@/lib/axios'
import type {
  CreateOrderInput,
  CreateOrderResult,
  OrderViewModel,
  SepayPaymentInfo,
  OperationResult,
} from '@/types/order'

/** Tạo đơn hàng mới — yêu cầu JWT role Customer */
export async function createOrder(
  input: CreateOrderInput
): Promise<OperationResult<CreateOrderResult>> {
  const { data } = await api.post<OperationResult<CreateOrderResult>>(
    '/orders/payment/order',
    input
  )
  return data
}

/** Lấy chi tiết đơn hàng theo OrderNumber */
export async function getOrderDetail(
  orderNumber: string
): Promise<OperationResult<OrderViewModel>> {
  const { data } = await api.get<OperationResult<OrderViewModel>>(
    `/orders/payment/order/${orderNumber}`
  )
  return data
}

/** Lấy thông tin QR / chuyển khoản SePay */
export async function getPaymentInfo(
  orderNumber: string
): Promise<OperationResult<SepayPaymentInfo>> {
  const { data } = await api.get<OperationResult<SepayPaymentInfo>>(
    `/orders/payment/order/${orderNumber}/payment-info`
  )
  return data
}
```

---

## 6. Hook TanStack Query

```ts
// src/hooks/useOrder.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrder, getOrderDetail, getPaymentInfo } from '@/services/orderService'
import type { CreateOrderInput } from '@/types/order'

export const orderKeys = {
  detail: (orderNumber: string) => ['order', orderNumber] as const,
  paymentInfo: (orderNumber: string) => ['order', orderNumber, 'payment-info'] as const,
}

/** Mutation: tạo đơn hàng */
export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateOrderInput) => createOrder(input),
    onSuccess: (result) => {
      if (result.success && result.data?.order) {
        queryClient.setQueryData(
          orderKeys.detail(result.data.order.orderNumber),
          result
        )
      }
    },
  })
}

/** Query: chi tiết đơn hàng */
export function useOrderDetail(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => getOrderDetail(orderNumber),
    enabled: enabled && !!orderNumber,
    select: (res) => res.data,
  })
}

/**
 * Polling trạng thái thanh toán.
 * Dừng polling khi paymentStatus = "success" hoặc "Failed".
 */
export function usePaymentStatusPolling(orderNumber: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderNumber),
    queryFn: () => getOrderDetail(orderNumber),
    enabled: !!orderNumber,
    refetchInterval: (query) => {
      const status = query.state.data?.data?.paymentStatus
      if (status === 'success' || status === 'Failed') return false
      return 5000  // poll mỗi 5 giây
    },
    select: (res) => res.data,
  })
}

/** Query: thông tin QR/payment */
export function usePaymentInfo(orderNumber: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.paymentInfo(orderNumber),
    queryFn: () => getPaymentInfo(orderNumber),
    enabled: enabled && !!orderNumber,
    staleTime: 1000 * 60 * 5,  // QR hợp lệ 5 phút
    select: (res) => res.data,
  })
}
```

---

## 7. Component trang thanh toán SePay

```tsx
// src/pages/payment/SepayPaymentPage.tsx
import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePaymentInfo, usePaymentStatusPolling } from '@/hooks/useOrder'

export default function SepayPaymentPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const navigate = useNavigate()

  const { data: paymentInfo, isLoading: loadingQr } = usePaymentInfo(orderNumber!)
  const { data: order } = usePaymentStatusPolling(orderNumber!)

  // Chuyển hướng khi thanh toán thành công
  useEffect(() => {
    if (order?.paymentStatus === 'success') {
      navigate(`/soldcars/payment/success?order=${orderNumber}`)
    }
    if (order?.paymentStatus === 'Failed') {
      navigate(`/soldcars/payment/failed?order=${orderNumber}`)
    }
  }, [order?.paymentStatus, navigate, orderNumber])

  if (loadingQr) return <div>Đang tải thông tin thanh toán...</div>
  if (!paymentInfo) return <div>Không tìm thấy thông tin thanh toán.</div>

  return (
    <div className="payment-container">
      <h2>Thanh toán đơn hàng</h2>
      <p>Mã đơn hàng: <strong>{paymentInfo.orderNumber}</strong></p>
      <p>
        Số tiền:{' '}
        <strong>
          {paymentInfo.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </strong>
      </p>

      {/* QR Code */}
      <div className="qr-wrapper">
        <img
          src={paymentInfo.qrImageUrl}
          alt="QR thanh toán SePay"
          width={250}
          height={250}
        />
      </div>

      {/* Hướng dẫn chuyển khoản */}
      <div className="transfer-info">
        <p>Ngân hàng: <strong>{paymentInfo.bankName}</strong></p>
        <p>Số tài khoản: <strong>{paymentInfo.bankAccount}</strong></p>
        <p>
          Nội dung chuyển khoản:{' '}
          <strong style={{ color: 'red' }}>{paymentInfo.transferContent}</strong>
        </p>
        <small>⚠️ Điền đúng nội dung chuyển khoản để hệ thống tự xác nhận</small>
      </div>

      {/* Trạng thái polling */}
      <div className="payment-status">
        <span>Trạng thái: </span>
        {order?.paymentStatus === 'Pending' && (
          <span className="status-pending">Đang chờ thanh toán...</span>
        )}
      </div>

      {paymentInfo.expiredAt && (
        <p>
          Hết hạn:{' '}
          {new Date(paymentInfo.expiredAt).toLocaleString('vi-VN')}
        </p>
      )}
    </div>
  )
}
```

---

## 8. Component tạo đơn hàng

```tsx
// src/pages/checkout/CheckoutPage.tsx
import { useNavigate } from 'react-router-dom'
import { useCreateOrder } from '@/hooks/useOrder'
import type { CreateOrderInput } from '@/types/order'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { mutateAsync: createOrder, isPending } = useCreateOrder()

  const handleCheckout = async (cartItems: { carId: number }[]) => {
    const input: CreateOrderInput = {
      orderType: 'CAR',
      paymentMethod: 'BANK_TRANSFER',
      cars: cartItems.map((item) => ({ carID: item.carId })),
      accessories: [],
    }

    try {
      const result = await createOrder(input)

      if (!result.success || !result.data) {
        alert(result.message ?? 'Tạo đơn hàng thất bại')
        return
      }

      const { order, payment } = result.data

      if (payment) {
        // Có thông tin QR → chuyển sang trang thanh toán SePay
        navigate(`/soldcars/payment/sepay/${order.orderNumber}`)
      } else {
        // Phương thức khác (CARD, v.v.)
        navigate(`/soldcars/order/${order.orderNumber}`)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      alert('Đã xảy ra lỗi, vui lòng thử lại.')
    }
  }

  return (
    <div>
      <h2>Xác nhận đơn hàng</h2>
      <button
        onClick={() => handleCheckout([{ carId: 1 }])}
        disabled={isPending}
      >
        {isPending ? 'Đang xử lý...' : 'Đặt hàng & Thanh toán'}
      </button>
    </div>
  )
}
```

---

## 9. React Router config

```tsx
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CheckoutPage from '@/pages/checkout/CheckoutPage'
import SepayPaymentPage from '@/pages/payment/SepayPaymentPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/soldcars/payment/sepay/:orderNumber" element={<SepayPaymentPage />} />
          <Route path="/soldcars/payment/success" element={<div>Thanh toán thành công!</div>} />
          <Route path="/soldcars/payment/failed" element={<div>Thanh toán thất bại.</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

---

## 10. Vite proxy config (tránh CORS khi dev)

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    proxy: {
      '/orders': {
        target: 'https://localhost:7250',
        changeOrigin: true,
        secure: false,        // chấp nhận self-signed cert khi dev
      },
      '/auth': {
        target: 'https://localhost:7250',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

Sau khi cấu hình proxy, đổi `VITE_API_BASE_URL` trong `.env.development` về rỗng:

```env
VITE_API_BASE_URL=
```

---

## 11. Checklist trước khi deploy

- [ ] Cấu hình IPN URL trong SePay dashboard = `https://{domain}/orders/payment/sepay-ipn`
- [ ] `SePay:IPN_key` trong appsettings/Cloud Run Secret khớp với SePay dashboard
- [ ] `SePay:MerchantId` và `SePay:SecretKey` dùng key production (không phải test)
- [ ] `bankAccount` và `bankCode` trong `BuildStaticQrUrl()` đã điền tài khoản thật
- [ ] CORS cho phép domain frontend production trong `Program.cs`
- [ ] SePay dashboard đã whitelist IP server backend (nếu cần)
- [ ] Test toàn bộ flow với số tiền nhỏ (vd: 1000 VND) trước khi go-live

---

## 12. Bảo mật — Ngăn hacker thay đổi QR / số tiền

### Cơ chế hoạt động

```
Server tạo QR URL:
  https://qr.sepay.vn/img?acc=0365022794&bank=MB&amount=25000000&des=SC20240101120000123&template=compact
                              ^^^^^^^^^^^^ ^^   ^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^
                              Số TK thật   Bank  Đúng số tiền  OrderNumber từ DB

  → Server ký HMAC-SHA256("SC20240101120000123|25000000|0365022794|SC20240101120000123", IPN_key)
  → Gửi signature cùng với payment info
```

### Tại sao QR không thể bị thay đổi

| Mối đe dọa | Biện pháp |
|-----------|-----------|
| Hacker intercept HTTPS để đổi `bankAccount` | **TLS** mã hóa toàn bộ — không đọc được |
| Hacker đổi `amount` trong JSON response | **Signature** sẽ không khớp → React hiển thị cảnh báo |
| Hacker thay ảnh QR bằng QR của họ | QR URL trỏ về `qr.sepay.vn` — server SePay gen ảnh, không phải data URI |
| Khách vô tình điền sai nội dung CK | Backend IPN không map được → order giữ trạng thái `Pending`, không confirm |
| Khách điền đúng nội dung nhưng sai số tiền | IPN handler từ chối (tolerance ±1000 VND) → PaymentStatus = "Failed" |

> **Điểm quan trọng nhất:** Server KHÔNG tin vào bất kỳ dữ liệu nào từ client để xác nhận thanh toán.  
> Toàn bộ xác nhận xảy ra ở backend qua IPN webhook từ SePay, không phải từ frontend.

### Verify signature phía React (optional nhưng nên làm)

Để verify HMAC-SHA256 trong browser cần dùng Web Crypto API — nhưng **không nên expose `IPN_key` ra client**.  
Thay vào đó, thêm một endpoint verify server-side:

```ts
// src/services/orderService.ts

/** Gọi server để xác minh signature của payment info */
export async function verifyPaymentSignature(
  orderNumber: string,
  amount: number,
  signature: string
): Promise<boolean> {
  try {
    const { data } = await api.post<{ valid: boolean }>(
      '/orders/payment/verify-signature',
      { orderNumber, amount, signature }
    )
    return data.valid
  } catch {
    return false
  }
}
```

Hoặc đơn giản hơn: **React chỉ hiển thị thông tin và không cho phép user chỉnh sửa** — mọi xác nhận đều từ IPN.

### Component hiển thị đúng chuẩn (không để user nhầm)

```tsx
// QUAN TRỌNG: Highlight transferContent để khách không điền sai
<div className="transfer-guide">
  <div className="warning-box">
    ⚠️ Điền ĐÚNG nội dung chuyển khoản để hệ thống tự xác nhận
  </div>

  <div className="copy-field">
    <label>Nội dung chuyển khoản</label>
    <div className="copy-value">
      <strong className="highlight">{paymentInfo.transferContent}</strong>
      <button onClick={() => navigator.clipboard.writeText(paymentInfo.transferContent)}>
        📋 Copy
      </button>
    </div>
    <small>Sao chép và dán vào ứng dụng ngân hàng — không thêm ký tự khác</small>
  </div>

  <div className="amount-display">
    <label>Số tiền chuyển khoản</label>
    <strong className="amount">
      {paymentInfo.amount.toLocaleString('vi-VN')} ₫
    </strong>
    <small>Chuyển đúng số tiền này — chênh lệch &gt; 1.000đ sẽ không được xác nhận</small>
  </div>

  <div className="bank-info">
    <span>Số TK: <strong>{paymentInfo.bankAccount}</strong></span>
    <span>Ngân hàng: <strong>{paymentInfo.bankName}</strong></span>
  </div>
</div>
```

---

## 13. Troubleshooting

| Vấn đề | Nguyên nhân | Cách xử lý |
|--------|-------------|------------|
| IPN không nhận được | URL không đúng / server không public | Kiểm tra `SePay:IpnUrl` trong appsettings |
| `Authorization` không khớp | `IPN_key` sai | So sánh key trong SePay dashboard và appsettings |
| QR hiển thị nhưng thanh toán không cập nhật | Polling chưa bắt đầu | Kiểm tra `usePaymentStatusPolling` đã gắn vào component |
| Số tiền không khớp | Tolerance 1000 VND không đủ | Điều chỉnh tolerance trong `HandlePaymentNotificationAsync` |
| CORS lỗi khi dev | Proxy chưa cấu hình | Thêm proxy trong `vite.config.ts` |

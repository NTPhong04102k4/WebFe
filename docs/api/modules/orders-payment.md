# Module: Đơn hàng & thanh toán (`/orders/payment`)

Xem thêm: `Models/InputModel/FeatureCore/Order/OrderInput.cs`, `Models/ViewModel/FeatureCore/Order/Order.cs`, `Common/SepayConfig.cs`.

---

## 1. Danh sách đơn (Admin/Staff)

### `GET /orders/payment/orders`

**Header:** Bearer — role **Admin, SuperAdmin, Staff**.

**Query**

| Param | Mặc định |
|-------|----------|
| page | 1 |
| pageSize | 20 |

**Response 200**

```json
{
  "data": [],
  "totalCount": 0
}
```

`data`: mảng `OrderViewModel` (xem mục 4).

---

## 2. Chi tiết đơn theo mã

### `GET /orders/payment/order/{orderNumber}`

**Header:** Bearer (bất kỳ user đăng nhập).

**Response 200**

```json
{
  "success": true,
  "data": {}
}
```

`data`: **`OrderViewModel`** (camelCase).

**404:** `OperationResult` — `errorCode`: `NotFound`.

---

## 3. Thông tin thanh toán (QR / chuyển khoản)

### `GET /orders/payment/order/{orderNumber}/payment-info`

**Header:** Bearer.

**Response 200**

```json
{
  "success": true,
  "data": {
    "qrImageUrl": "",
    "transferContent": "",
    "bankAccount": "",
    "bankName": "",
    "amount": 0,
    "orderNumber": "",
    "expiredAt": "",
    "signature": ""
  }
}
```

**404:** không tìm thấy hoặc đơn đã thanh toán.

---

## 4. Tạo đơn (Customer)

### `POST /orders/payment/order`

**Header:** Bearer — role **Customer** (claim `NameIdentifier` = customer code).

**Payload (JSON) — `OrderInput`**

| Field | Type | Mô tả |
|-------|------|--------|
| orderType | string | `"CAR"` \| `"ACCESSORY"` \| `"MIXED"` |
| paymentMethod | string | `BANK_TRANSFER`, `CARD`, `NAPAS_BANK_TRANSFER`, … |
| isInstallment | boolean | |
| installmentMonths | number? | |
| downPayment | number? | |
| deliveryAddress | string? | |
| notes | string? | |
| cars | array | `{ carID, discountAmount? }` |
| accessories | array | `{ accessoryID, quantity, discountAmount? }` |

**Response 201:** `OperationResult` với `data` kiểu **`CreateOrderResult`**:

```json
{
  "success": true,
  "data": {
    "order": {},
    "payment": {}
  }
}
```

- `order`: **`OrderViewModel`**
- `payment`: **`SepayPaymentInfo`** hoặc `null` nếu không dùng chuyển khoản

**OrderViewModel (tóm tắt field)**

| Field | Type |
|-------|------|
| orderID | number |
| orderNumber | string |
| orderType | string |
| orderStatus | string |
| subTotal, taxRate, taxAmount, discountAmount, totalAmount | number |
| paymentMethod, paymentStatus | string |
| paymentDate | string? (ISO) |
| isInstallment, installmentMonths, monthlyPayment, downPayment | … |
| customerName, customerPhone, customerEmail, deliveryAddress | string |
| cars[] | OrderCarDetailViewModel |
| accessories[] | OrderAccessoryDetailViewModel |

---

## 5. Cập nhật trạng thái đơn (Admin/Staff)

### `PATCH /orders/payment/order/{id}/status`

**Header:** Bearer — **Admin, SuperAdmin, Staff**.

**Payload (JSON)**

| Field | Type |
|-------|------|
| status | string (bắt buộc, ≤20 ký tự) |
| notes | string? |

**Response 200:** `OperationResult` theo service.

---

## 6. Webhook SePay (server → server)

### `POST /orders/payment/sepay-ipn`

**Không dùng JWT.** Header: `Authorization: Apikey {IPN_key}`.

**Payload (JSON) — `SepayWebhookPayload`**

| JSON field | Kiểu | Ghi chú |
|------------|------|---------|
| id | number | ID giao dịch SePay |
| gateway | string | Tên ngân hàng |
| transactionDate | string | `yyyy-MM-dd HH:mm:ss` |
| accountNumber | string | STK nhận |
| subAccount | string? | |
| code | string? | |
| content | string | **Nội dung CK — map OrderNumber** |
| transferType | string | `in` / `out` |
| transferAmount | number | VND |
| accumulated | number | |
| referenceCode | string? | |
| description | string? | |
| toBank | string? | |

**Response:** `{ "success": true }` hoặc `400` với `{ "success": false, "message": "..." }`.

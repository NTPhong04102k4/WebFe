# Order & Payment Module — API Documentation

> **FE / codegen:** contract tập trung — **[`../api/modules/orders-payment.md`](../api/modules/orders-payment.md)**. Nếu mâu thuẫn, chốt theo `api/modules/`.

Base path: `/orders/payment`

---

## Endpoints

### GET /orders/payment/orders
Lấy danh sách đơn hàng (phân trang).

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`

**Query Params**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| page | int | ❌ | `1` |
| pageSize | int | ❌ | `20` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `{ data: OrderViewModel[], totalCount: int }` |
| 500 | Lỗi server | `OperationResult` |

---

### GET /orders/payment/order/{orderNumber}
Lấy chi tiết một đơn hàng.

**Auth:** ✅ (bất kỳ role)

**Path Params**
| Param | Type | Required |
|-------|------|----------|
| orderNumber | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `OperationResult { Success: true, Data: OrderViewModel }` |
| 404 | Không tìm thấy | `OperationResult` |
| 500 | Lỗi server | `OperationResult` |

---

### GET /orders/payment/order/{orderNumber}/payment-info
Lấy thông tin QR/thanh toán SePay.

**Auth:** ✅ (bất kỳ role)

**Path Params**
| Param | Type | Required |
|-------|------|----------|
| orderNumber | string | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `OperationResult { Success: true, Data: SepayPaymentInfo }` |
| 404 | Không tìm thấy | `OperationResult` |
| 500 | Lỗi server | `OperationResult` |

---

### POST /orders/payment/order
Tạo đơn hàng mới.

**Auth:** ✅ `Customer`

**Request Body** `application/json`
| Field | Type | Required | Default | Ghi chú |
|-------|------|----------|---------|---------|
| OrderType | string | ✅ | | `"CAR"` \| `"ACCESSORY"` \| `"MIXED"` |
| PaymentMethod | string | ✅ | `"BANK_TRANSFER"` | `"BANK_TRANSFER"` \| `"CARD"` \| `"NAPAS_BANK_TRANSFER"` |
| IsInstallment | bool | ❌ | `false` | |
| InstallmentMonths | int | ❌ optional | | Bắt buộc nếu IsInstallment = true |
| DownPayment | decimal | ❌ optional | | |
| DeliveryAddress | string | ❌ optional | | max 500 |
| Notes | string | ❌ optional | | |
| Cars | OrderCarItem[] | ❌ | `[]` | Danh sách xe |
| Accessories | OrderAccessoryItem[] | ❌ | `[]` | Danh sách phụ kiện |

**OrderCarItem**
| Field | Type | Required | Default |
|-------|------|----------|---------|
| CarID | int | ✅ | |
| DiscountAmount | decimal | ❌ | `0` |

**OrderAccessoryItem**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| AccessoryID | int | ✅ | |
| Quantity | int | ✅ | >= 1 |
| DiscountAmount | decimal | ❌ | `0` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 201 | Tạo thành công | `OperationResult { Success: true, Data: CreateOrderResult }` |
| 400 | Validation lỗi | `OperationResult` |
| 500 | Lỗi server | `OperationResult` |

---

### PATCH /orders/payment/order/{id}/status
Cập nhật trạng thái đơn hàng.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`

**Path Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ — OrderID |

**Request Body** `application/json`
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Status | string | ✅ | max 20 |
| Notes | string | ❌ optional | |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `OperationResult { Success: true, Data }` |
| 404 | Không tìm thấy | `OperationResult` |
| 400 | Validation lỗi | `OperationResult` |
| 500 | Lỗi server | `OperationResult` |

---

### POST /orders/payment/sepay-ipn
Webhook nhận thông báo thanh toán từ SePay.

**Auth:** Không yêu cầu (AllowAnonymous)  
> ⚠️ Xác thực qua header `Authorization: Apikey {IPN_key}`

**Headers**
| Header | Required |
|--------|----------|
| Authorization | ✅ `Apikey <key>` |

**Request Body:** `SepayWebhookPayload` (JSON từ SePay)

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Xử lý thành công | `{ success: true }` |
| 400 | Payload không hợp lệ / lỗi xử lý | `{ success: false, message }` |

---

## Response Schemas

### OrderViewModel
```json
{
  "orderID": 1,
  "orderNumber": "ORD-20240101-0001",
  "orderType": "CAR",
  "orderStatus": "Pending",
  "subTotal": 500000000,
  "taxRate": 0.1,
  "taxAmount": 50000000,
  "discountAmount": 0,
  "totalAmount": 550000000,
  "paymentMethod": "BANK_TRANSFER",
  "paymentStatus": "Pending",
  "paymentDate": null,
  "paymentReference": null,
  "isInstallment": false,
  "installmentMonths": null,
  "monthlyPayment": null,
  "downPayment": null,
  "customerName": "string",
  "customerPhone": "string",
  "customerEmail": "string",
  "deliveryAddress": null,
  "notes": null,
  "createdDate": "2024-01-01T00:00:00",
  "updatedDate": "2024-01-01T00:00:00",
  "cars": [ OrderCarDetailViewModel ],
  "accessories": [ OrderAccessoryDetailViewModel ]
}
```

### CreateOrderResult
```json
{
  "order": OrderViewModel,
  "payment": SepayPaymentInfo    // optional
}
```

### SepayPaymentInfo
```json
{
  "qrImageUrl": "string",
  "transferContent": "string",
  "bankAccount": "string",
  "bankName": "string",
  "amount": 550000000
}
```

### OrderCarDetailViewModel
```json
{
  "carID": 1,
  "carName": "string",
  "carBrand": "string",
  "carModel": "string",
  "carVIN": "string",
  "unitPrice": 500000000,
  "discountAmount": 0,
  "totalPrice": 500000000
}
```

### OrderAccessoryDetailViewModel
```json
{
  "accessoryID": 1,
  "accessoryName": "string",
  "accessoryCode": "string",
  "quantity": 2,
  "unitPrice": 500000,
  "totalPrice": 1000000
}
```

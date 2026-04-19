# Module: Phụ kiện & danh mục (`/accessory`, `/category`)

---

## 1. Phụ kiện

### `GET /accessory/detail?accessoryId={id}`

**Response 200:** **`AcessoriesReponse`** (typo trong code) — camelCase:

| Field | Type |
|-------|------|
| accessoryID | number |
| accessoryName | string |
| price, costPrice | number |
| imagePath | string? |
| categoryName, brandName | string? |
| stockQuantity | number |

**404:** `{ "message": "Accessory not found." }`

---

### `GET /accessory/all`

**Query — `AccessoriesPagingRequest`**

| Param | Mô tả |
|-------|--------|
| page | ≥1 |
| pageSize | 1–100 (mặc 10) |
| categoryID | number? |
| brandAccessoryID | number? |
| priceFrom, priceTo | number? |
| sortBy | string? |
| sortDescending | boolean (mặc false) |

**Response 200:** **`AccessoriesPagedResponse`**

```json
{
  "items": [],
  "totalCount": 0,
  "page": 1,
  "pageSize": 10,
  "totalPages": 0
}
```

---

### `POST /accessory/create`

**Header:** Admin, SuperAdmin, Staff.  
**Content-Type:** `multipart/form-data` — **`AccessoriesRequest`**

| Field | Ghi chú |
|-------|---------|
| accessoryCode, accessoryName | Bắt buộc |
| categoryID | > 0 |
| brandAccessoryID | optional |
| description | string |
| price | > 0 |
| costPrice | optional |
| stockQuantity, minStockLevel, maxStockLevel | number |
| compatibleCarModels | string (JSON text) |
| imagePath | file (ảnh ≤5MB) |
| installationVideo | file (video ≤50MB) |
| warrantyMonths | number? |
| createdBy | number |

**Response 201:** `CreatedAtAction` với body là accessory vừa tạo.

---

### `PUT /accessory/edit?id={id}`

Cùng form **AccessoriesRequest** như create.

**Response 200:** accessory đã cập nhật.

---

## 2. Danh mục (`/category`)

### `GET /category/all`

**Response 200:** mảng category (theo service).

**404:** `{ "message": "No categories found." }`

---

### `GET /category/detail?categoryId={id}`

**Response 200:** một category.

---

### `POST /category/create`

**Header:** Admin, SuperAdmin, Staff.  
**Payload (JSON) — `CategoryRequest`**

| Field | Type |
|-------|------|
| categoryName | string |
| description | string? |
| parentCategoryID | number? |
| isActive | boolean |
| displayOrder | number |

---

### `PUT /category/edit?id={id}`

**Payload:** giống `CategoryRequest`.

**Response 200:** category sau khi sửa hoặc `400` nếu lỗi.

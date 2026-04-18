# Brand Module — API Documentation

Base path: `/common`

---

## Endpoints

### GET /common/brands
Lấy danh sách tất cả thương hiệu xe.

**Auth:** Không yêu cầu

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `Brand[]` |
| 404 | Không có thương hiệu | `"Không tìm thấy thương hiệu nào"` |

---

### POST /common/brand/create
Tạo thương hiệu mới.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| BrandCode | string | ✅ | |
| BrandName | string | ❌ optional | |
| Logo | file | ❌ optional | max 10MB; jpeg, jpg, png, gif, webp |
| description | string | ❌ optional | |
| displayOrder | int | ❌ optional | > 0 |
| isActive | bool | ❌ optional | |
| linkWebsite | string | ❌ optional | |
| CountryOrigin | string | ❌ optional | |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `Brand` |
| 400 | Validation lỗi | error message |

---

### PATCH /common/brand/edit
Cập nhật thương hiệu theo `BrandCode`.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form** — giống POST, tất cả fields đều optional trừ `BrandCode`.

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `Brand` |
| 400 | Validation lỗi | error message |

---

### GET /common/brand_accessories
Lấy danh sách thương hiệu phụ kiện.

**Auth:** Không yêu cầu

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `BrandAccessoryReponse[]` |
| 404 | Không có dữ liệu | `"Không tìm thấy thương hiệu phụ kiện nào"` |

---

### POST /common/brand_accessory/create
Tạo thương hiệu phụ kiện mới.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| Name | string | ✅ | |
| Description | string | ❌ optional | |
| Image | file | ❌ optional | max 10MB |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `BrandAccessoryReponse` |
| 400 | Validation lỗi | error message |

---

### PATCH /common/brand_accessory/edit
Cập nhật thương hiệu phụ kiện.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required |
|-------|------|----------|
| id | int | ❌ optional |
| Name | string | ✅ |
| Description | string | ❌ optional |
| Image | file | ❌ optional |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `BrandAccessoryReponse` |
| 400 | Validation lỗi | error message |

---

## Response Schemas

### Brand
```json
{
  "id": 1,
  "brandCode": "string",
  "brandName": "string",
  "logoPatch": "string",        // optional — URL ảnh
  "description": "string",      // optional
  "countryOrigin": "string",    // optional
  "website": "string"           // optional
}
```

### BrandAccessoryReponse
```json
{
  "name": "string",
  "description": "string",
  "image": "string"             // optional — URL ảnh
}
```

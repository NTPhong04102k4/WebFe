# BodyType Module — API Documentation

Base path: `/common`

---

## Endpoints

### GET /common/bodytypes
Lấy danh sách tất cả loại thân xe.

**Auth:** Không yêu cầu

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `BodyType[]` |
| 404 | Không có dữ liệu | `{ message: "No body types found." }` |

---

### POST /common/bodytype/create
Tạo loại thân xe mới.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| BodyCode | string | ✅ | | |
| BodyName | string | ✅ | | |
| Description | string | ❌ optional | | |
| SeatCapacityRange | string | ❌ optional | | VD: "5-7 chỗ" |
| ImageFile | file | ❌ optional | | max 10MB; jpeg, jpg, png, webp |
| IsActive | bool | ❌ | `true` | |
| DisplayOrder | int | ❌ | `1` | |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `BodyType` |
| 400 | Validation lỗi | error message |

---

### PUT /common/bodytype/update
Cập nhật loại thân xe theo `BodyCode`.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required |
|-------|------|----------|
| BodyCode | string | ✅ — dùng để tìm kiếm |
| BodyName | string | ❌ optional |
| Description | string | ❌ optional |
| SeatCapacityRange | string | ❌ optional |
| ImageFile | file | ❌ optional |
| IsActive | bool | ❌ optional |
| DisplayOrder | int | ❌ optional |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `BodyType` |
| 404 | Không tìm thấy | `{ message: "Body type not found." }` |
| 400 | Validation lỗi | error message |

---

## Response Schema

### BodyType
```json
{
  "bodyCode": "string",
  "bodyName": "string",
  "imagePath": "string",            // optional — URL ảnh
  "description": "string",          // optional
  "seatCapacityRange": "string"     // optional — VD: "5-7 chỗ"
}
```

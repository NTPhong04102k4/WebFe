# Category Module — API Documentation

Base path: `/category`

---

## Endpoints

### GET /category/all
Lấy tất cả danh mục phụ kiện.

**Auth:** Không yêu cầu

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `CategoryReponse[]` |
| 404 | Không có dữ liệu | `{ message: "No categories found." }` |

---

### GET /category/detail
Lấy chi tiết một danh mục.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| categoryId | int | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `CategoryReponse` |
| 404 | Không tìm thấy | `{ message: "Category not found." }` |

---

### POST /category/create
Tạo danh mục mới.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`

**Request Body** `application/json`
| Field | Type | Required | Default |
|-------|------|----------|---------|
| CategoryName | string | ✅ | |
| Description | string | ❌ optional | |
| ParentCategoryID | int | ❌ optional | — danh mục cha |
| IsActive | bool | ❌ | `true` |
| DisplayOrder | int | ❌ | `1` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `CategoryReponse` |
| 400 | Tạo thất bại | `{ message: "Failed to create category." }` |

---

### PUT /category/edit
Cập nhật danh mục.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Request Body** `application/json` — giống POST /category/create

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `CategoryReponse` |
| 400 | Cập nhật thất bại | `{ message: "Failed to update category." }` |

---

## Response Schema

### CategoryReponse
```json
{
  "categoryID": 1,
  "categoryName": "string",
  "description": "string",       // optional
  "parentCategoryID": null,      // optional — ID danh mục cha
  "displayOrder": 1,
  "isActive": true
}
```

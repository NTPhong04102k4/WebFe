# Accessory Module — API Documentation

Base path: `/accessory`

---

## Endpoints

### GET /accessory/detail
Lấy chi tiết một phụ kiện.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| accessoryId | int | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `AcessoriesDetailReponse` |
| 404 | Không tìm thấy | `{ message: "Accessory not found." }` |

---

### GET /accessory/all
Lấy danh sách phụ kiện có phân trang và lọc.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required | Default |
|-------|------|----------|---------|
| Page | int | ❌ | `1` |
| PageSize | int | ❌ | `10` |
| PriceFrom | decimal | ❌ optional | |
| PriceTo | decimal | ❌ optional | |
| CategoryID | int | ❌ optional | |
| BrandAccessoryID | int | ❌ optional | |
| SortBy | string | ❌ optional | |
| SortDescending | bool | ❌ | `false` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `AccessoriesPagedResponse` |
| 400 | PriceFrom > PriceTo | `{ message: "PriceFrom cannot be greater than PriceTo" }` |

---

### POST /accessory/create
Tạo phụ kiện mới.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| AccessoryCode | string | ✅ | | |
| AccessoryName | string | ✅ | | |
| CategoryID | int | ✅ | | |
| Price | decimal | ✅ | | > 0 |
| Description | string | ✅ | | |
| CompatibleCarModels | string | ✅ | | |
| CreatedBy | int | ✅ | | |
| BrandAccessoryID | int | ❌ optional | | |
| CostPrice | decimal | ❌ optional | | |
| StockQuantity | int | ❌ | `0` | |
| MinStockLevel | int | ❌ | `10` | |
| MaxStockLevel | int | ❌ | `1000` | |
| ImagePath | file | ❌ optional | | max 5MB; jpeg, jpg, png, webp |
| InstallationVideo | file | ❌ optional | | max 50MB; mp4, avi, mov |
| WarrantyMonths | int | ❌ optional | | |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 201 | Tạo thành công | `AcessoriesReponse` |
| 400 | Validation lỗi | `{ message }` |
| 500 | Lỗi server | `{ message }` |

---

### PUT /accessory/edit
Cập nhật phụ kiện.

**Auth:** ✅ `Admin`, `SuperAdmin`, `Staff`  
**Content-Type:** `multipart/form-data`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Request Form:** giống POST /accessory/create

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `AcessoriesReponse` |
| 400 | Validation lỗi | `{ message }` |
| 500 | Lỗi server | `{ message }` |

---

## Response Schemas

### AcessoriesReponse (list item)
```json
{
  "accessoryID": 1,
  "accessoryName": "string",
  "price": 500000,
  "costPrice": 400000,
  "imagePath": "string",          // optional — URL ảnh
  "categoryName": "string",       // optional
  "brandName": "string",          // optional
  "stockQuantity": 50
}
```

### AcessoriesDetailReponse
```json
{
  "accessoryID": 1,
  "accessoryCode": "string",
  "accessoryName": "string",
  "categoryID": 1,
  "brandAccessoryID": null,       // optional
  "description": "string",
  "price": 500000,
  "costPrice": null,              // optional
  "stockQuantity": 50,
  "minStockLevel": 10,
  "maxStockLevel": 1000,
  "compatibleCarModels": "string",
  "imagePath": "string",
  "installationVideo": "string",
  "warrantyMonths": null,         // optional
  "createdBy": 1
}
```

### AccessoriesPagedResponse
```json
{
  "items": [ AcessoriesReponse ],
  "totalCount": 100,
  "page": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

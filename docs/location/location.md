# Location Module — API Documentation

> **FE / codegen:** contract tập trung — **[`../api/modules/common-catalog.md`](../api/modules/common-catalog.md)**. Nếu mâu thuẫn, chốt theo `api/modules/`.

Base path: `/common`

---

## Endpoints

### GET /common/locations
Lấy danh sách tất cả chi nhánh / kho.

**Auth:** Không yêu cầu

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `Location[]` |
| 404 | Không có dữ liệu | `"Không tìm thấy địa điểm nào"` |

---

### GET /common/location
Lấy thông tin một địa điểm theo IP / LocationCode.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required | Ghi chú |
|-------|------|----------|---------|
| ip | string | ✅ | Truyền `LocationCode` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `Location` |
| 404 | Không tìm thấy | `"Không tìm thấy địa điểm"` |

---

## Response Schema

### Location
```json
{
  "locationCode": "string",
  "locationName": "string",
  "locationType": "Store",        // "Store" | "Workshop" | "Warehouse"
  "address": "string",
  "city": "string",
  "province": "string",
  "postalCode": "string",         // optional
  "phone": "string",
  "email": "string",              // optional
  "openTime": "08:00:00",
  "closeTime": "18:00:00",
  "latitude": null,               // optional
  "longitude": null,              // optional
  "managerName": "string"         // optional
}
```

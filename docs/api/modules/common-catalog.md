# Module: Dữ liệu chung (`/common`)

Brand, body type, location — kết hợp nhiều controller dùng route prefix `common`.

---

## 1. Thương hiệu xe

### `GET /common/brands`

**Response 200:** mảng brand (theo `BrandServices`).

**404:** không có brand.

---

### `POST /common/brand/create` · `PATCH /common/brand/edit`

**Header:** Admin, SuperAdmin.  
**Content-Type:** `multipart/form-data` — **`BrandRequest`**

| Field | Type |
|-------|------|
| brandCode | string (bắt buộc) |
| brandName, countryOrigin | string? |
| logo | file? (ảnh ≤10MB) |
| description | string? |
| displayOrder | number? |
| isActive | bool? |
| linkWebsite | string? |

**Response 200:** brand đã tạo/cập nhật.

---

## 2. Thương hiệu phụ kiện

### `GET /common/brand_accessories`

**Response 200:** mảng brand accessory.

---

### `POST /common/brand_accessory/create` · `PATCH /common/brand_accessory/edit`

**Header:** Admin, SuperAdmin (+ Staff cho edit).  
**Content-Type:** `multipart/form-data` — **`BrandAccessoryRequest`** (xem `Models/InputModel/FeatureCore/Brand/BrandAccessoryRequest.cs`).

---

## 3. Kiểu dáng thân xe (body type)

### `GET /common/bodytypes`

**Response 200:** mảng body type.

---

### `POST /common/bodytype/create`

**Header:** SuperAdmin, Admin.  
**Form:** `BodyCarRequest` — có `imageFile` optional (ảnh ≤10MB).

---

### `PUT /common/bodytype/update`

**Header:** Admin, SuperAdmin.  
**Form:** `BodyCarUpdateRequest` — cần `bodyCode`, có thể kèm `imageFile`.

---

## 4. Địa điểm / IP

### `GET /common/location?ip={ip}`

**Response 200:** thông tin location theo IP (theo `LocationServices`).

**404:** không tìm thấy.

---

### `GET /common/locations`

**Response 200:** danh sách tất cả địa điểm (showroom, …).

**404:** không có dữ liệu.

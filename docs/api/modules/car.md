# Module: Xe (`/car`)

DTO: `Models/InputModel/Common/Car/`, ViewModel: `Models/ViewModel/FeatureCore/Car/`.

---

## 1. Chi tiết xe (public)

### `GET /car/detail?id={id}`

**Query:** `id` (number) — CarID.

**Response 200:** `CarReponseDetail` / object chi tiết từ `GetCarByIdAsync` (xem `CarReponseDetail.cs`).

**404:** chuỗi thông báo text.

---

## 2. Phân trang danh sách xe

### `POST /car/paging`

**Query (CarPagingRequest)** — bind từ query string:

| Param | Mặc định | Mô tả |
|-------|----------|--------|
| pageIndex | 1 | |
| pageSize | 10 | |
| bodyCode | string? | Lọc |
| brandCode | string? | |
| priceFrom | number? | |
| priceTo | number? | |

*(Endpoint là POST nhưng filter nằm trên **query**.)*

**Header:** JWT tùy logic service (email/role để cá nhân hóa).

**Response 200**

```json
{
  "data": [],
  "totalCount": 0
}
```

`data[]`: **`CarReponse`** (camelCase), ví dụ:

| Field | Type |
|-------|------|
| carID | number |
| carCode, vin, carName | string |
| brandID, modelName, modelYear, bodyTypeID, statusID | number |
| condition | string |
| locationID | number |
| price, importPrice, salePrice | number |
| engineSize, fuelType, transmission, driveType | string/number |
| doors, seats, mileage | number |
| color | string |
| videoPath, imagePaths, primaryImagePath | string? |
| detailedDescription, shortDescription | string? |
| isFeature, viewCount | bool/number |

---

## 3. Tạo / sửa xe (multipart)

### `POST /car/create`

**Header:** Bearer — **Admin, SuperAdmin**.  
**Content-Type:** `multipart/form-data` — **`CarRequest`**

Các field chính (form):

| Field | Type | Ghi chú |
|-------|------|---------|
| carCode, vin, carName | string | |
| brandID, modelName, modelYear, bodyTypeID, statusID, locationID | number | |
| condition | string | New / Used / Certified |
| price, importPrice, salePrice, engineSize | number | |
| fuelType, transmission, driveType | string | |
| doors, seats, mileage | number | |
| color | string | |
| imageFiles | file[] | Ảnh, mỗi file ≤10MB |
| videoFile | file? | ≤50MB |
| detailedDescription, shortDescription | string? | |
| isFeature, isActive, viewCount, createdBy | bool/number | |

**Response 200:** object xe tạo (`CarReponse` tương tự).

---

### `PUT /car/edit?id={id}`

Giống form **CarRequest** + query `id`.

---

## 4. Thông số kỹ thuật (tech spec)

### `GET /car/techSpec/detail?id={id}`

**Response:** cùng kiểu chi tiết xe (service dùng chung get by id).

### `PATCH /car/techSpec/edit?id={id}`

**Header:** Admin, SuperAdmin.  
**Payload (JSON):** `CarDetailRequest` — kích thước, động cơ, an toàn, … (rất nhiều field optional; xem file `CarDetailRequest.cs`).

### `POST /car/techSpec/create`

**Payload (JSON):** `CarDetailRequest` (có `carID`).

**Response 200:** kết quả cập nhật/tạo tech spec.

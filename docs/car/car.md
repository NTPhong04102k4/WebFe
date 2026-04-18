# Car Module — API Documentation

Base path: `/car`

---

## Endpoints

### GET /car/detail
Lấy thông tin chi tiết một xe.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `CarReponse` |
| 404 | Không tìm thấy | `"Không tìm thấy chi tiết xe"` |

---

### POST /car/paging
Lấy danh sách xe có phân trang và lọc.

**Auth:** Không yêu cầu

**Request Body** `application/json`
| Field | Type | Required | Default |
|-------|------|----------|---------|
| PageIndex | int | ❌ | 1 |
| PageSize | int | ❌ | 10 |
| BodyCode | string | ❌ optional | |
| BrandCode | string | ❌ optional | |
| PriceFrom | int | ❌ optional | |
| PriceTo | int | ❌ optional | |

**Response** `200 OK`
```json
{
  "data": [ CarReponse ],
  "totalCount": 100
}
```

---

### POST /car/create
Tạo xe mới.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Request Form**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| CarCode | string | ✅ | |
| VIN | string | ✅ | |
| CarName | string | ✅ | |
| BrandID | int | ✅ | |
| ModelName | string | ✅ | |
| ModelYear | int | ✅ | |
| BodyTypeID | int | ✅ | |
| StatusID | int | ✅ | |
| Condition | string | ✅ | `"New"` \| `"Used"` \| `"Certified"` |
| LocationID | int | ✅ | |
| Price | decimal | ✅ | |
| EngineSize | decimal | ✅ | |
| FuelType | string | ✅ | |
| Transmission | string | ✅ | |
| DriveType | string | ✅ | |
| Doors | int | ✅ | |
| Seats | int | ✅ | |
| Color | string | ✅ | |
| Mileage | int | ✅ | |
| CreatedBy | int | ✅ | |
| ImportPrice | decimal | ❌ optional | |
| SalePrice | decimal | ❌ optional | |
| VideoFile | file | ❌ optional | max 50MB; mp4, avi, mov, mkv, webm |
| ImageFiles | file[] | ❌ optional | max 10MB/file; jpeg, jpg, png, gif, webp |
| DetailedDescription | string | ❌ optional | |
| ShortDescription | string | ❌ optional | |
| IsFeature | bool | ❌ | default `false` |
| SoldDate | datetime | ❌ optional | |
| IsActive | bool | ❌ | default `true` |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `CarReponse` |
| 400 | Validation lỗi | error message |

---

### PUT /car/edit
Cập nhật thông tin xe.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `multipart/form-data`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Request Form:** giống POST /car/create

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `CarReponse` |
| 400 | Validation lỗi | error message |

---

### GET /car/techSpec/detail
Lấy thông số kỹ thuật của xe.

**Auth:** Không yêu cầu

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Thành công | `CarReponseDetail` |
| 404 | Không tìm thấy | `"Không tìm thấy thông số kỹ thuật xe"` |

---

### POST /car/techSpec/create
Tạo thông số kỹ thuật cho xe.

**Auth:** ✅ `Admin`, `SuperAdmin`  
**Content-Type:** `application/json`

**Request Body** — xem schema `CarDetailRequest` bên dưới.

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Tạo thành công | `CarReponseDetail` |
| 400 | Lỗi | error message |

---

### PATCH /car/techSpec/edit
Cập nhật thông số kỹ thuật xe.

**Auth:** ✅ `Admin`, `SuperAdmin`

**Query Params**
| Param | Type | Required |
|-------|------|----------|
| id | int | ✅ |

**Request Body:** `CarDetailRequest`

**Responses**
| Status | Condition | Body |
|--------|-----------|------|
| 200 | Cập nhật thành công | `CarReponseDetail` |
| 400 | Lỗi | error message |

---

## Request Schemas

### CarDetailRequest
| Field | Type | Required |
|-------|------|----------|
| CarID | int | ✅ |
| Length_mm | int | ❌ |
| Width_mm | int | ❌ |
| Height_mm | int | ❌ |
| Wheelbase_mm | int | ❌ |
| GroundClearance_mm | int | ❌ |
| CurbWeight_kg | int | ❌ |
| GrossWeight_kg | int | ❌ |
| PayloadCapacity_kg | int | ❌ |
| EngineCode | string | ✅ |
| Cylinders | int | ❌ |
| MaxPower_hp | int | ❌ |
| MaxTorque_nm | int | ❌ |
| Compression_ratio | decimal | ❌ |
| TopSpeed_kmh | int | ❌ |
| Acceleration_0_100_sec | decimal | ❌ |
| FuelConsumption_city_l100km | decimal | ❌ |
| FuelConsumption_highway_l100km | decimal | ❌ |
| FuelConsumption_combined_l100km | decimal | ❌ |
| FuelTankCapacity_l | int | ❌ |
| SafetyRating | string | ✅ |
| Airbags | int | ❌ |
| ABS | bool | ❌ |
| ESP | bool | ❌ |
| AirConditioning | bool | ❌ |
| SunRoof | bool | ❌ |
| LeatherSeats | bool | ❌ |
| NavigationSystem | bool | ❌ |
| BluetoothConnectivity | bool | ❌ |

---

## Response Schemas

### CarReponse
```json
{
  "carID": 1,
  "carCode": "string",
  "vin": "string",
  "carName": "string",
  "brandID": 1,
  "modelName": "string",
  "modelYear": 2024,
  "bodyTypeID": 1,
  "statusID": 1,
  "condition": "New",
  "locationID": 1,
  "price": 500000000,
  "importPrice": null,          // optional
  "salePrice": null,            // optional
  "engineSize": 2.0,
  "fuelType": "string",
  "transmission": "string",
  "driveType": "string",
  "doors": 4,
  "seats": 5,
  "color": "string",
  "mileage": 0,
  "videoPath": null,            // optional — URL video
  "imagePaths": "[]",          // optional — JSON array string
  "primaryImagePath": null,     // optional
  "detailedDescription": null,  // optional
  "shortDescription": null,     // optional
  "isFeature": false,
  "viewCount": 0
}
```

### CarReponseDetail
Thông số kỹ thuật — tất cả fields kỹ thuật, xem `CarDetailRequest` bên trên (trả về kiểu tương ứng).

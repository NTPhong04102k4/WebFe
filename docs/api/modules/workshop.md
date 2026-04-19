# Module: Xưởng dịch vụ (`/workshop/*`)

Input: `Models/InputModel/FeatureCore/Workshop/`.  
ViewModel: `Models/ViewModel/FeatureCore/Workshop/WorkshopViewModels.cs`.

---

## 1. Xe khách hàng — `/workshop/customer-vehicles`

**Authorize** (JWT).

| Method | Path | Query / Body |
|--------|------|----------------|
| GET | `/workshop/customer-vehicles` | `page`, `pageSize`, `userId?` |
| GET | `/workshop/customer-vehicles/{id}` | — |
| GET | `/workshop/customer-vehicles/{id}/maintenance-history` | — → `MaintenanceHistoryViewModel[]` |
| POST | `/workshop/customer-vehicles` | JSON **CustomerVehicleRequest** |
| PUT | `/workshop/customer-vehicles/{id}` | JSON **CustomerVehicleRequest** |
| PATCH | `/workshop/customer-vehicles/{id}/mileage` | JSON **CustomerVehicleUpdateMileageRequest** |
| DELETE | `/workshop/customer-vehicles/{id}` | — **Admin, SuperAdmin, Staff** |

### Payload `CustomerVehicleRequest` (JSON)

| Field | Type |
|-------|------|
| userID | number |
| carID | number? |
| vin | string (≤50) |
| licensePlate | string? |
| brandID | number |
| modelName | string (≤100) |
| modelYear | number (1900–2100) |
| color | string? |
| currentMileage | number |
| lastServiceDate, nextServiceDate | string? (ISO) |
| nextServiceMileage | number? |
| isActive | boolean |

### Payload `CustomerVehicleUpdateMileageRequest`

```json
{ "currentMileage": 0 }
```

### Response — `CustomerVehicleViewModel`

| Field | Type |
|-------|------|
| customerVehicleID, userID | number |
| ownerFullName | string? |
| carID | number? |
| vin, licensePlate | string |
| brandID, brandName | number / string? |
| modelName, modelYear | string / number |
| color | string? |
| currentMileage | number |
| lastServiceDate, nextServiceDate | string? |
| nextServiceMileage | number? |
| isActive | boolean |
| createdDate | string (ISO) |

### Response — `MaintenanceHistoryViewModel`

| Field | Type |
|-------|------|
| historyID, customerVehicleID, workOrderID | number |
| workOrderNumber | string? |
| serviceDate | string (ISO) |
| mileage | number |
| servicesSummary | string? |
| totalCost | number |
| nextRecommendedServiceDate | string? |
| nextRecommendedMileage | number? |

**List:** `{ data, totalCount, page, pageSize }`.

---

## 2. Lịch hẹn — `/workshop/appointments`

| Method | Path | Auth | Body / Query |
|--------|------|------|----------------|
| GET | `/workshop/appointments` | Bearer | **AppointmentQueryRequest** (query) |
| GET | `/workshop/appointments/{id}` | Bearer | — |
| POST | `/workshop/appointments` | Bearer | **AppointmentRequest** |
| PUT | `/workshop/appointments/{id}/confirm` | Admin, Staff, SuperAdmin | — |
| PUT | `/workshop/appointments/{id}/cancel` | Bearer | optional **AppointmentStatusRequest** |
| PATCH | `/workshop/appointments/{id}/status` | Admin, Staff, SuperAdmin | **AppointmentStatusRequest** |
| POST | `/workshop/appointments/{id}/send-reminder` | Admin, Staff, SuperAdmin | — |

### Query `AppointmentQueryRequest`

| Field | Type |
|-------|------|
| page, pageSize | number |
| status | string? |
| locationID | number? |
| technicianID | number? |
| fromDate, toDate | string? (ISO) |

### Payload `AppointmentRequest` (JSON)

| Field | Type |
|-------|------|
| customerVehicleID | number |
| locationID | number |
| scheduledDateTime | string (ISO) |
| estimatedDuration_minutes | number (15–1440) |
| assignedTechnicianID | number? |
| appointmentType | string (≤30) — Maintenance, Repair, Inspection |
| customerNote, staffNote | string? |
| services | **AppointmentServiceItem[]** |

**AppointmentServiceItem:** `serviceID`, `estimatedPrice`, `notes?`.

### Payload `AppointmentStatusRequest`

| Field | Type |
|-------|------|
| status | string (≤20) |
| cancelReason | string? (≤500) |

### Response — `AppointmentViewModel`

| Field | Type |
|-------|------|
| appointmentID | number |
| appointmentNumber | string |
| customerVehicleID | number |
| vehicleInfo | string? |
| locationID, locationName | number / string? |
| scheduledDateTime | string (ISO) |
| estimatedDuration_minutes | number |
| assignedTechnicianID, assignedTechnicianName | number / string? |
| appointmentType, status | string |
| reminderSent | boolean |
| reminderSentDate | string? |
| customerNote, staffNote, cancelReason | string? |
| createdDate | string (ISO) |
| services | AppointmentServiceViewModel[]? |

---

## 3. Phiếu công việc — `/workshop/work-orders`

**Authorize** (JWT). Một số thao tác chỉ **Admin, SuperAdmin, Staff**.

| Method | Path | Role ghi chú |
|--------|------|----------------|
| GET | `/workshop/work-orders` | Query **WorkOrderQueryRequest** |
| GET | `/workshop/work-orders/{id}` | |
| POST | `/workshop/work-orders` | Staff+ — **WorkOrderRequest** |
| PATCH | `/workshop/work-orders/{id}/status` | Staff+ — **WorkOrderStatusRequest** |
| PATCH | `/workshop/work-orders/{id}/assign-technician` | Staff+ — **AssignTechnicianRequest** |
| POST | `/workshop/work-orders/{id}/services` | Staff+ — **WorkOrderServiceItemRequest** |
| DELETE | `.../services/{workOrderServiceId}` | Staff+ |
| POST | `.../parts` | Staff+ — **WorkOrderPartItemRequest** |
| DELETE | `.../parts/{workOrderPartId}` | Staff+ |
| POST | `.../pay` | Staff+ — **WorkOrderPaymentRequest** |
| POST | `.../feedback` | User đăng nhập — **WorkOrderFeedbackRequest** |

### Query `WorkOrderQueryRequest`

| Field | Type |
|-------|------|
| page, pageSize | number |
| status | string? |
| technicianID, customerVehicleID | number? |
| fromDate, toDate | string? (ISO) |

### Payload chính (JSON)

**WorkOrderRequest:** `appointmentID?`, `customerVehicleID`, `locationID`, `primaryTechnicianID`, `serviceAdvisorID?`, `priority` (≤10, mặc Normal), `mileageIn`, `customerComplaint?`.

**WorkOrderStatusRequest:** `status`, `mileageOut?`, `diagnosis?`, `workPerformed?`.

**AssignTechnicianRequest:** `{ "technicianID": 0 }`.

**WorkOrderServiceItemRequest:** `serviceID`, `technicianID`, `laborHours`, `unitPrice`, `notes?`.

**WorkOrderPartItemRequest:** `accessoryID`, `quantity`, `unitPrice`, `installedByTechnicianID?`, `notes?`.

**WorkOrderPaymentRequest:** `paymentMethod`, `amountPaid`, `discountAmount?`.

**WorkOrderFeedbackRequest:** `rating` (1–5), `feedback?`.

### Response — `WorkOrderViewModel`

| Field | Type |
|-------|------|
| workOrderID | number |
| workOrderNumber | string |
| appointmentID | number? |
| customerVehicleID | number |
| vehicleInfo | string? |
| locationID, locationName | number / string? |
| primaryTechnicianID, primaryTechnicianName | number / string? |
| serviceAdvisorID, serviceAdvisorName | number / string? |
| status, priority | string |
| startDateTime, endDateTime | string? |
| mileageIn, mileageOut | number |
| customerComplaint, diagnosis, workPerformed | string? |
| laborCost, partsCost, serviceCost, discountAmount, taxAmount, totalAmount | number |
| paymentStatus, paymentMethod | string |
| paidDate | string? |
| customerRating, customerFeedback | number / string? |
| warrantyMonths | number? |
| createdDate | string (ISO) |
| services | WorkOrderServiceViewModel[]? |
| parts | WorkOrderPartViewModel[]? |

**Chi tiết dòng dịch vụ / phụ tùng:** xem `WorkOrderServiceViewModel`, `WorkOrderPartViewModel` trong cùng file ViewModel.

**Thao tác thành công:** thường trả `OperationResult` (`success`, `data`, …) hoặc `201` kèm payload từ service.

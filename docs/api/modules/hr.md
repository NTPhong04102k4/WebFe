# Module: HR (`/hr/*`)

Input: `Models/InputModel/FeatureCore/HR/`.  
ViewModel: `Models/ViewModel/FeatureCore/HR/HRViewModels.cs`.

**Lỗi thường gặp:** `OperationResult` — `{ success, errorCode, message }`. Phân trang: `{ data, totalCount, page, pageSize }`.

---

## 1. Kỹ năng — `/hr/skills`

| Method | Path | Auth | Payload |
|--------|------|------|---------|
| GET | `/hr/skills` | Không | — |
| GET | `/hr/skills/{id}` | Không | — |
| POST | `/hr/skills` | Admin, SuperAdmin | JSON **SkillRequest** |
| PUT | `/hr/skills/{id}` | Admin, SuperAdmin | JSON **SkillRequest** |
| DELETE | `/hr/skills/{id}` | Admin, SuperAdmin | — |

### Payload `SkillRequest` (JSON)

| Field | Type |
|-------|------|
| skillCode | string (≤30) |
| skillName | string (≤100) |
| description | string? |
| category | string? (≤50) |
| isActive | boolean |

### Response entity — `SkillViewModel`

| Field | Type |
|-------|------|
| skillID | number |
| skillCode, skillName | string |
| description, category | string? |
| isActive | boolean |

---

## 2. Cấp bậc kỹ thuật viên — `/hr/technician-levels`

| GET | `/hr/technician-levels`, `/hr/technician-levels/{id}` — public |
| POST, PUT, DELETE | Admin, SuperAdmin — body **TechnicianLevelRequest** |

### Payload `TechnicianLevelRequest` (JSON)

| Field | Type |
|-------|------|
| levelCode | string (≤20) |
| levelName | string (≤50) |
| baseSalary | number |
| hourlyRate | number |
| bonusPerJob | number? |
| displayOrder | number |

### Response — `TechnicianLevelViewModel`

| Field | Type |
|-------|------|
| levelID | number |
| levelCode, levelName | string |
| baseSalary, hourlyRate | number |
| bonusPerJob | number? |
| displayOrder | number |

---

## 3. Kỹ thuật viên — `/hr/technicians`

| Method | Path | Auth | Ghi chú |
|--------|------|------|---------|
| GET | `/hr/technicians` | Không | Query: `page`, `pageSize`, `available?` |
| GET | `/hr/technicians/available` | Không | Danh sách rảnh |
| GET | `/hr/technicians/{id}` | Không | |
| GET | `/hr/technicians/{id}/skills` | Không | Mảng skill |
| GET | `/hr/technicians/{id}/performance` | Admin, Staff, SuperAdmin | |
| POST | `/hr/technicians` | Admin, SuperAdmin | **TechnicianRequest** |
| PUT | `/hr/technicians/{id}` | Admin, SuperAdmin | |
| DELETE | `/hr/technicians/{id}` | Admin, SuperAdmin | |
| POST | `/hr/technicians/{id}/skills` | Admin, SuperAdmin | **AssignSkillRequest** |
| DELETE | `/hr/technicians/{id}/skills/{skillId}` | Admin, SuperAdmin | |

### Payload `TechnicianRequest` (JSON)

| Field | Type |
|-------|------|
| staffID | number |
| levelID | number |
| hireDate | string (ISO date) |
| yearsOfExperience | number (0–80) |
| certifications | string? (JSON array text) |
| isAvailable | boolean |
| notes | string? |
| isActive | boolean |

### Payload `AssignSkillRequest` (JSON)

| Field | Type |
|-------|------|
| skillID | number |
| proficiencyLevel | number (1–5) |
| certifiedDate | string? (ISO) |
| expiryDate | string? (ISO) |

### Response — `TechnicianViewModel`

| Field | Type |
|-------|------|
| technicianID, staffID | number |
| staffFullName, staffEmail | string? |
| levelID, levelName | number / string? |
| hireDate | string (ISO) |
| yearsOfExperience | number |
| certifications | string? |
| isAvailable | boolean |
| currentWorkload, totalJobsCompleted | number |
| averageRating | number? |
| notes | string? |
| isActive | boolean |
| skills | TechnicianSkillViewModel[]? |

### Response — `TechnicianPerformanceViewModel`

| Field | Type |
|-------|------|
| technicianID | number |
| staffFullName | string? |
| currentWorkload, totalJobsCompleted | number |
| averageRating | number? |
| completedThisMonth | number |
| totalRevenueGenerated | number |

---

## 4. Bảng lương — `/hr/payrolls`

**Toàn bộ:** Bearer — **Admin, SuperAdmin**.

| Method | Path | Query / Body |
|--------|------|----------------|
| GET | `/hr/payrolls` | `page`, `pageSize`, `staffId?`, `period?` (DateTime) |
| GET | `/hr/payrolls/{id}` | — |
| POST | `/hr/payrolls` | **PayrollRequest** |
| PUT | `/hr/payrolls/{id}` | **PayrollRequest** |
| PATCH | `/hr/payrolls/{id}/pay` | **PayrollPaymentRequest** |
| DELETE | `/hr/payrolls/{id}` | — |

### Payload `PayrollRequest` (JSON)

| Field | Type |
|-------|------|
| staffID | number |
| payPeriod | string (ISO date) |
| baseSalary | number |
| workingHours | number (0–744) |
| overtimeHours | number (0–300) |
| jobsCompleted | number |
| commissionAmount, bonusAmount, deductionAmount, taxAmount | number |
| notes | string? |

### Payload `PayrollPaymentRequest` (JSON)

| Field | Type |
|-------|------|
| paymentStatus | string — `Pending` / `Paid` |
| paidDate | string? (ISO) |

### Response — `PayrollViewModel`

| Field | Type |
|-------|------|
| payrollID, staffID | number |
| staffFullName | string? |
| payPeriod | string (ISO) |
| baseSalary, workingHours, overtimeHours | number |
| jobsCompleted | number |
| commissionAmount, bonusAmount, deductionAmount | number |
| grossSalary, taxAmount, netSalary | number |
| paymentStatus | string |
| paidDate | string? |
| notes | string? |

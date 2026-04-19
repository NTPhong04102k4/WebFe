# Module: Bảo hiểm (`/insurance/*`)

Input: `Models/InputModel/FeatureCore/Insurance/InsuranceRequest.cs`.  
ViewModel: `Models/ViewModel/FeatureCore/Insurance/InsuranceViewModels.cs`.

---

## 1. Công ty bảo hiểm — `/insurance/companies`

| Method | Path | Auth | Body |
|--------|------|------|------|
| GET | `/insurance/companies` | Không | — |
| GET | `/insurance/companies/{id}` | Không | — |
| POST | `/insurance/companies` | Admin, SuperAdmin | **multipart** InsuranceCompanyRequest |
| PUT | `/insurance/companies/{id}` | Admin, SuperAdmin | **multipart** |
| DELETE | `/insurance/companies/{id}` | Admin, SuperAdmin | — |

### Form `InsuranceCompanyRequest` (multipart)

| Field | Type |
|-------|------|
| companyCode | string (≤20) |
| companyName | string (≤200) |
| hotline | string? |
| email | string? |
| address | string? |
| logo | file? |
| isActive | boolean |

### Response — `InsuranceCompanyViewModel`

| Field | Type |
|-------|------|
| companyID | number |
| companyCode, companyName | string |
| hotline, email, address, logoPath | string? |
| isActive | boolean |

---

## 2. Gói bảo hiểm — `/insurance/packages`

| GET | `/insurance/packages?companyId=` — public |
| GET | `/insurance/packages/{id}` — public |
| POST, PUT, DELETE | Admin, SuperAdmin — JSON **InsurancePackageRequest** |

### Payload `InsurancePackageRequest` (JSON)

| Field | Type |
|-------|------|
| companyID | number |
| packageCode | string (≤30) |
| packageName | string (≤200) |
| packageType | string (≤50) — vd: TNDS, ThanVo, TaiNan, ToanDien |
| description | string? |
| coverageAmount, basePremium | number |
| duration_months | number (1–120) |
| isActive | boolean |

### Response — `InsurancePackageViewModel`

| Field | Type |
|-------|------|
| packageID, companyID | number |
| companyName | string? |
| packageCode, packageName, packageType | string |
| description | string? |
| coverageAmount, basePremium | number |
| duration_months | number |
| isActive | boolean |

---

## 3. Hợp đồng — `/insurance/policies`

**Mọi endpoint:** Bearer (controller có `[Authorize]`).

| Method | Path | Query / Body |
|--------|------|----------------|
| GET | `/insurance/policies` | `page`, `pageSize`, `userId?`, `status?` |
| GET | `/insurance/policies/expiring` | `withinDays` — **Admin, SuperAdmin, Staff** |
| GET | `/insurance/policies/{id}` | — |
| POST | `/insurance/policies` | **multipart** InsurancePolicyRequest |
| PATCH | `/insurance/policies/{id}/cancel` | — — **Admin, SuperAdmin, Staff** |

### Form `InsurancePolicyRequest` (multipart)

| Field | Type |
|-------|------|
| customerVehicleID | number |
| packageID | number |
| userID | number |
| startDate, endDate | string (ISO) |
| premiumAmount | number |
| document | file? |
| soldByStaffID | number? |

### Response — `InsurancePolicyViewModel`

| Field | Type |
|-------|------|
| policyID | number |
| policyNumber | string |
| customerVehicleID | number |
| vehicleInfo | string? |
| packageID | number |
| packageName, companyName | string? |
| userID | number |
| ownerFullName | string? |
| startDate, endDate | string (ISO) |
| premiumAmount | number |
| paymentStatus, status | string |
| documentPath | string? |
| soldByStaffID, soldByStaffName | number / string? |
| createdDate | string (ISO) |
| daysToExpire | number (computed) |

**Phân trang list:** `{ data: InsurancePolicyViewModel[], totalCount, page, pageSize }`.

---

## 4. Yêu cầu bồi thường — `/insurance/claims`

**Authorize** trên toàn controller.

| Method | Path | Body / Query |
|--------|------|----------------|
| GET | `/insurance/claims` | `page`, `pageSize`, `status?` |
| GET | `/insurance/claims/{id}` | — |
| POST | `/insurance/claims` | JSON **InsuranceClaimRequest** |
| PATCH | `/insurance/claims/{id}/status` | JSON **InsuranceClaimStatusRequest** — **Admin, SuperAdmin, Staff** |

### Payload `InsuranceClaimRequest` (JSON)

| Field | Type |
|-------|------|
| policyID | number |
| workOrderID | number? |
| incidentDate, reportedDate | string (ISO) |
| description | string |
| claimAmount | number |

### Payload `InsuranceClaimStatusRequest` (JSON)

| Field | Type |
|-------|------|
| status | string — Submitted, UnderReview, Approved, Rejected, Paid |
| approvedAmount | number? |
| notes | string? |

### Response — `InsuranceClaimViewModel`

| Field | Type |
|-------|------|
| claimID | number |
| claimNumber | string |
| policyID | number |
| policyNumber | string? |
| workOrderID, workOrderNumber | number / string? |
| incidentDate, reportedDate | string (ISO) |
| description | string |
| claimAmount | number |
| approvedAmount | number? |
| status | string |
| processedDate | string? |
| notes | string? |
| createdDate | string (ISO) |

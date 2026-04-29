# Module Review & Rating

## Tổng quan

Module quản lý đánh giá xe và dịch vụ bảo dưỡng. Hỗ trợ rating đa chiều, moderation queue, helpful voting và report vi phạm.

---

## Entities

| Entity | Table | Schema | Mục đích |
|--------|-------|--------|----------|
| `CarReview` | `CarReviews` | `Review` | Đánh giá xe (cần duyệt) |
| `ServiceReview` | `ServiceReviews` | `Review` | Đánh giá dịch vụ sửa chữa |
| `ReviewHelpfulVote` | `ReviewHelpfulVotes` | `Review` | Vote helpful/not-helpful |
| `ReviewReport` | `ReviewReports` | `Review` | Báo cáo vi phạm |

**Lưu ý:** `Core.Cars` được thêm 2 cột: `AverageRating DECIMAL(3,2)`, `ReviewCount INT`.

---

## API Endpoints

### Car Reviews

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/reviews/cars/{carId}` | — | Lấy danh sách review đã duyệt theo xe |
| `GET` | `/reviews/cars/{carId}/stats` | — | Thống kê rating (avg, phân phối sao) |
| `GET` | `/reviews/cars/detail/{reviewId}` | — | Chi tiết 1 review |
| `POST` | `/reviews/cars` | User | Tạo review xe |
| `DELETE` | `/reviews/cars/{reviewId}` | User (owner) | Xóa review của mình |
| `POST` | `/reviews/cars/{reviewId}/helpful` | User | Vote helpful/not-helpful |
| `POST` | `/reviews/cars/{reviewId}/report` | User | Báo cáo vi phạm |
| `GET` | `/reviews/admin/pending` | Admin/SuperAdmin | Queue review chờ duyệt |
| `PUT` | `/reviews/admin/{reviewId}/moderate` | Admin/SuperAdmin | Duyệt/Từ chối review |

### Service Reviews

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/reviews/services/technician/{technicianId}` | — | Review theo thợ kỹ thuật |
| `GET` | `/reviews/services/location/{locationId}` | — | Review theo xưởng |
| `POST` | `/reviews/services` | User | Tạo review dịch vụ |
| `POST` | `/reviews/services/{reviewId}/respond` | Staff/Admin | Shop phản hồi review |

---

## Request / Response

### POST `/reviews/cars`

```json
{
  "carID": 1,
  "orderID": 5,
  "overallRating": 5,
  "performanceRating": 4,
  "comfortRating": 5,
  "designRating": 5,
  "valueRating": 4,
  "title": "Xe rất tốt!",
  "content": "Chạy êm, tiết kiệm nhiên liệu, rất hài lòng.",
  "pros": "Êm, tiết kiệm",
  "cons": "Ghế hơi cứng",
  "imagePaths": null
}
```

### GET `/reviews/cars/{carId}/stats` — Response

```json
{
  "carID": 1,
  "averageRating": 4.6,
  "reviewCount": 15,
  "count5Star": 8,
  "count4Star": 5,
  "count3Star": 1,
  "count2Star": 1,
  "count1Star": 0,
  "avgPerformance": 4.5,
  "avgComfort": 4.7,
  "avgDesign": 4.8,
  "avgValue": 4.3
}
```

### PUT `/reviews/admin/{reviewId}/moderate`

```json
{
  "status": "Approved",
  "rejectReason": null
}
```

Status hợp lệ: `Approved` | `Rejected`

---

## Business Logic

- **Verified purchase**: Review tự động được đánh dấu `IsVerifiedPurchase = true` nếu user có đơn hàng đã thanh toán cho xe đó.
- **CarReview unique**: Mỗi user chỉ review 1 xe 1 lần (unique index `CarID + UserID`).
- **ServiceReview unique**: Mỗi `WorkOrderID` chỉ có 1 review.
- **AverageRating**: Tự tính lại khi review được Approve/Delete (gọi `RecalculateCarRatingAsync`).
- **CarReview flow**: `Pending` → Staff duyệt → `Approved` / `Rejected`
- **ServiceReview flow**: Tự động `Approved` ngay khi tạo.

---

## Files

```
Reponsities/Review/
  CarReview.cs
  ServiceReview.cs
  ReviewHelpfulVote.cs
  ReviewReport.cs

Models/InputModel/FeatureCore/Review/
  CarReviewRequest.cs       (+ ModerateReviewRequest, ReviewHelpfulRequest, ReviewReportRequest)
  ServiceReviewRequest.cs   (+ ServiceReviewRespondRequest)

Models/ViewModel/FeatureCore/Review/
  ReviewViewModels.cs       (CarReviewViewModel, CarReviewStatsViewModel, ServiceReviewViewModel)

Services/FeatureCore/Review/
  ICarReviewServices.cs
  CarReviewServices.cs
  IServiceReviewServices.cs
  ServiceReviewServices.cs

Controllers/FeatureCore/Review/
  ReviewController.cs
```

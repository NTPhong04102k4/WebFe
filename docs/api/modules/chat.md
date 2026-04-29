# Module Chat Real-time

## Tổng quan

Module chat giữa khách hàng và nhân viên. Hỗ trợ text, đính kèm file, phân công staff, đánh giá sau khi đóng conversation.

> **Lưu ý:** Module này cung cấp REST API đồng bộ. Để có real-time push notification, tích hợp thêm SignalR (xem phần mở rộng).

---

## Entities

| Entity | Table | Schema | Mục đích |
|--------|-------|--------|----------|
| `Conversation` | `Conversations` | `Chat` | Phòng chat (1 khách ↔ 1 staff) |
| `ConversationMessage` | `Messages` | `Chat` | Từng tin nhắn |

---

## API Endpoints

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/chat/conversations` | User/Staff | Danh sách conversation (tự động phân theo role) |
| `GET` | `/chat/conversations/staff` | Staff/Admin | Conversations đang mở cho staff |
| `GET` | `/chat/conversations/{id}` | User/Staff | Chi tiết conversation |
| `GET` | `/chat/conversations/{id}/messages` | User/Staff | Tin nhắn (có phân trang) |
| `POST` | `/chat/conversations` | User | Tạo conversation mới |
| `PUT` | `/chat/conversations/{id}/assign` | Staff/Admin | Phân công nhân viên |
| `PUT` | `/chat/conversations/{id}/close` | User/Staff | Đóng conversation |
| `PUT` | `/chat/conversations/{id}/read` | User/Staff | Đánh dấu đã đọc |
| `POST` | `/chat/messages` | User/Staff | Gửi tin nhắn |

---

## Request / Response

### POST `/chat/conversations`

```json
{
  "conversationType": "CarInquiry",
  "subject": "Hỏi về xe Toyota Camry 2024",
  "relatedCarID": 12,
  "priority": "Normal",
  "initialMessage": "Xe này còn hàng không? Tôi muốn xem thử."
}
```

**ConversationType hợp lệ:** `CarInquiry` | `ServiceInquiry` | `Support` | `General`

**Priority hợp lệ:** `Low` | `Normal` | `High`

### POST `/chat/messages`

```json
{
  "conversationID": 5,
  "messageType": "Text",
  "content": "Vâng, xe vẫn còn. Bạn muốn đặt lịch xem xe không?",
  "attachmentUrl": null,
  "replyToMessageID": null
}
```

**MessageType hợp lệ:** `Text` | `Image` | `File` | `Voice` | `Video`

### PUT `/chat/conversations/{id}/close`

```json
{
  "customerRating": 5,
  "customerFeedback": "Nhân viên tư vấn rất nhiệt tình, cảm ơn!"
}
```

### GET `/chat/conversations/{id}/messages` — Response

```json
{
  "conversationID": 5,
  "subject": "Hỏi về xe Toyota Camry 2024",
  "status": "Active",
  "customerName": "Nguyễn Văn A",
  "assignedStaffName": "Trần Thị B",
  "messages": [
    {
      "messageID": 1,
      "senderType": "Customer",
      "messageType": "Text",
      "content": "Xe này còn hàng không?",
      "isRead": true,
      "createdDate": "2025-01-15T10:30:00"
    }
  ]
}
```

---

## Business Logic

- **Role routing**: `GET /chat/conversations` tự trả về danh sách tương ứng — khách xem của mình, staff xem tất cả Open/Active.
- **UnreadCount**: Tự tăng khi gửi tin nhắn cho bên kia; reset về 0 khi gọi `PUT /read`.
- **Status flow**: `Open` → (staff reply lần đầu) → `Active` → (đóng) → `Closed`
- **Tin nhắn xóa**: `IsDeleted = true`, content bị ẩn trong response (trả về `null`).
- **Escalation từ AI**: Khi AI Bot tạo conversation, `SenderType = "AIBot"` cho message đầu tiên.

---

## Files

```
Reponsities/Chat/
  Conversation.cs
  ConversationMessage.cs

Models/InputModel/FeatureCore/Chat/
  ChatRequest.cs    (CreateConversationRequest, SendMessageRequest,
                     AssignConversationRequest, CloseConversationRequest)

Models/ViewModel/FeatureCore/Chat/
  ChatViewModels.cs (ConversationViewModel, ConversationDetailViewModel, MessageViewModel)

Services/FeatureCore/Chat/
  IChatServices.cs
  ChatServices.cs

Controllers/FeatureCore/Chat/
  ChatController.cs
```

---

## Mở rộng SignalR (tuỳ chọn)

Để bổ sung real-time, tạo `ChatHub : Hub` và inject `IHubContext<ChatHub>` vào `ChatServices`. Các events cần implement:

| Event | Trigger |
|-------|---------|
| `OnMessageReceived` | Sau `SendMessageAsync` |
| `OnReadReceipt` | Sau `MarkAsReadAsync` |
| `OnConversationAssigned` | Sau `AssignStaffAsync` |
| `OnConversationClosed` | Sau `CloseConversationAsync` |

# Module AI Chatbot

## Tổng quan

Chatbot AI dạng session-based (giống ChatGPT sidebar) với intent routing tự động. Hỗ trợ query DB cho xe/giá, tra cứu Knowledge Base, và escalate sang nhân viên khi cần.

---

## Entities

| Entity | Table | Schema | Mục đích |
|--------|-------|--------|----------|
| `ChatSession` | `ChatSessions` | `AIBot` | Phiên hội thoại của user |
| `AIChatMessage` | `ChatMessages` | `AIBot` | Từng message + response |
| `KnowledgeBase` | `KnowledgeBase` | `AIBot` | Tài liệu nội bộ (FAQ, chính sách) |
| `IntentDefinition` | `IntentDefinitions` | `AIBot` | Catalog các intent |

---

## API Endpoints

### Session Management

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/ai/sessions` | User | Danh sách sessions (sidebar history) |
| `GET` | `/ai/sessions/{sessionId}` | User | Chi tiết session |
| `GET` | `/ai/sessions/{sessionId}/messages` | User | Lịch sử tin nhắn |
| `POST` | `/ai/sessions` | User | Tạo session mới |
| `PUT` | `/ai/sessions/{sessionId}/rename` | User | Đổi tên session |
| `DELETE` | `/ai/sessions/{sessionId}` | User | Xóa session (soft delete) |

### Chat

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `POST` | `/ai/chat` | User | Gửi câu hỏi, nhận phản hồi |
| `POST` | `/ai/messages/{messageId}/feedback` | User | Đánh giá chất lượng trả lời |

### Knowledge Base (Admin)

| Method | Route | Auth | Mô tả |
|--------|-------|------|-------|
| `GET` | `/ai/kb` | — | Danh sách tài liệu KB |
| `POST` | `/ai/kb` | Admin/SuperAdmin | Thêm tài liệu KB |
| `PUT` | `/ai/kb/{docId}` | Admin/SuperAdmin | Cập nhật tài liệu KB |
| `DELETE` | `/ai/kb/{docId}` | Admin/SuperAdmin | Xóa tài liệu KB (soft) |

---

## Request / Response

### POST `/ai/chat`

```json
{
  "sessionID": 3,
  "text": "Xe Toyota Camry còn không?",
  "inputType": "text"
}
```

- `sessionID`: tuỳ chọn — nếu null, tự tạo session mới.
- `inputType`: `text` | `voice` | `image` | `file` | `mixed`

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionID": 3,
    "messageID": 42,
    "response": "Hiện có **3** xe Toyota Camry đang sẵn sàng:\n\n• **Toyota Camry 2024** (2024) — 1,200,000,000đ — Showroom Hà Nội\n...",
    "intent": "ask_car_availability",
    "responseType": "text",
    "wasEscalated": false,
    "escalatedToConversationID": null
  }
}
```

### POST `/ai/messages/{messageId}/feedback`

```json
{
  "rating": 4,
  "feedback": "Trả lời đúng nhưng cần thêm thông tin giá"
}
```

### POST `/ai/kb`

```json
{
  "documentType": "FAQ",
  "category": "Đặt lịch",
  "title": "Cách đặt lịch bảo dưỡng trên app",
  "content": "Để đặt lịch bảo dưỡng, vào menu 'Dịch vụ' → chọn 'Đặt lịch'...",
  "keywords": "đặt lịch, bảo dưỡng, booking",
  "language": "vi"
}
```

---

## Intent Routing

| Intent | Trigger keywords | Handler | Nguồn dữ liệu |
|--------|-----------------|---------|----------------|
| `ask_car_availability` | "còn xe", "sẵn có", "còn hàng" | DB Query | `Core.Cars` WHERE Status=AVAILABLE |
| `ask_car_price` | "giá", "bao nhiêu tiền", "price" | DB Query | `Core.Cars` ListPrice/SalePrice |
| `ask_service_info` | "bảo dưỡng", "sửa chữa", "dịch vụ" | KB Lookup | `AIBot.KnowledgeBase` WHERE Category=Service |
| `ask_app_feature` | "tính năng", "app", "hướng dẫn" | KB Lookup | `AIBot.KnowledgeBase` WHERE Category=Feature |
| `request_human_support` | "nhân viên", "tư vấn viên", "gặp người" | Escalate | Tạo `Chat.Conversation` |
| `complaint` | "khiếu nại", "phàn nàn", "không hài lòng" | Escalate (High) | Tạo `Chat.Conversation` Priority=High |
| `chitchat` | "xin chào", "hello", "cảm ơn" | Template | — |
| `ask_kb` (fallback) | — | KB Lookup | `AIBot.KnowledgeBase` (keyword match) |

---

## Business Logic

### Per-user Isolation
Mọi query history đều có `WHERE UserID = currentUserId` — không bao giờ leak data giữa các user.

```csharp
// LUÔN filter theo UserID
var session = await _db.Set<ChatSession>()
    .FirstOrDefaultAsync(s => s.SessionID == id && s.UserID == userId);
```

### Session Management
- Session tự tạo nếu `sessionID = null` trong request.
- `Title` tự gán từ message đầu tiên (100 ký tự).
- `TotalMessages` tăng 2 mỗi lượt (user + assistant).
- Delete là soft delete (`Status = "Deleted"`), không xóa lịch sử khỏi DB.

### Escalation Flow
Khi intent là `request_human_support` hoặc `complaint`:
1. AI tự tạo `Chat.Conversation` với `SenderType = "AIBot"`
2. Set `Priority = High` nếu là khiếu nại
3. Trả về `wasEscalated = true` + `escalatedToConversationID`
4. Frontend redirect user đến màn hình Chat

### Knowledge Base Search
Hiện dùng keyword matching đơn giản (title + keywords). Có thể nâng cấp lên vector search (Qdrant) khi cần độ chính xác cao hơn — xem `SoldCars_Implementation_Code.md` section 8.

---

## Files

```
Reponsities/AIBot/
  ChatSession.cs
  AIChatMessage.cs
  KnowledgeBase.cs
  IntentDefinition.cs

Models/InputModel/FeatureCore/AIBot/
  AIChatRequest.cs    (AIChatRequest, CreateSessionRequest, RenameSessionRequest,
                       MessageFeedbackRequest, KnowledgeBaseRequest)

Models/ViewModel/FeatureCore/AIBot/
  AIBotViewModels.cs  (ChatSessionViewModel, ChatSessionDetailViewModel,
                       AIChatMessageViewModel, AIChatResponse, KnowledgeBaseViewModel)

Services/FeatureCore/AIBot/
  IAIChatServices.cs
  AIChatServices.cs

Controllers/FeatureCore/AIBot/
  AIChatController.cs
```

---

## Mở rộng (Production)

| Feature | Cách implement |
|---------|---------------|
| **LLM tích hợp** | Inject `IHttpClientFactory`, gọi OpenAI/Claude API trong `AIChatServices` |
| **Vector Search** | Thay keyword match bằng Qdrant embedding search (xem doc implementation) |
| **Speech-to-Text** | Xử lý file audio qua OpenAI Whisper trước khi đưa vào `ProcessMessageAsync` |
| **OCR ảnh** | Dùng Azure Vision API, truyền extracted text vào `text` field |
| **Rate Limiting** | Thêm `[EnableRateLimiting("ai_chat")]` trên controller |
| **Token tracking** | Cập nhật `InputTokens`/`OutputTokens` từ LLM response header |

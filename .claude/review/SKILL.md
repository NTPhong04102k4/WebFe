---
name: review
description: Review và refactor code. Phân tích theo checklist: type safety, performance, convention, accessibility, security. Đưa ra fix cụ thể theo priority.
argument-hint: "[file path]"
disable-model-invocation: false
---

# Code Review & Refactor

Review code theo convention và tech stack của project.

---

<!-- ═══════════════════════════════════════════════
     PROJECT CONFIG — SoldCar
     ═══════════════════════════════════════════════

FRAMEWORK=react + typescript
LANGUAGE=typescript
STYLING=tailwind + styled-components
  TAILWIND_CUSTOM=no
SERVER_STATE=react-query
GLOBAL_STATE=redux-toolkit
MAX_COMPONENT_LINES=250
LINTER=none
COMMIT_CONVENTION=none
MULTI_TENANT=no

AXIOS_INSTANCE=src/services/api/index.ts
AUTH_SLICE=src/redux/Slice/AuthSlice.ts

BUSINESS_RULES=
  - Không import store trực tiếp — dùng useAppSelector/useAppDispatch
  - useEffect phải có cleanup nếu subscribe event hoặc async
  - 401 response xử lý qua custom event, không redirect trực tiếp
  - Type files phải là .ts không phải .tsx
  - API function đặt trong Routes.Fn.ts, URL constants trong Routes.ts
  - Query keys phải dùng factory pattern (export const {resource}Keys)
  - Không dùng any — dùng unknown + type guard hoặc đúng type
  - Form validation dùng yup + react-hook-form, không validate thủ công
════════════════════════════════════════════════ -->

---

## Checklist Review

### 🔴 Critical — Phải fix trước khi merge

- **Type safety**
  - Không dùng `any` (thay bằng `unknown` + type guard hoặc đúng type)
  - Props interface đầy đủ, không thiếu optional/required
  - Return type function rõ ràng nếu không tự infer được

- **Memory leak**
  - `useEffect` có cleanup (clearInterval, removeEventListener, abort fetch)
  - Subscription được unsubscribe
  - Promise không bị ignore sau unmount

- **Infinite re-render**
  - Dependency array của `useEffect`, `useCallback`, `useMemo` đúng và đủ
  - Object/array literal không tạo mới mỗi render

- **Error handling**
  - Async operation có try/catch hoặc `.catch()`
  - API error được hiển thị cho user, không nuốt im
  - Không `console.error` thay cho xử lý thật

- **Security**
  - Không dùng `dangerouslySetInnerHTML` với user input
  - Không expose secret/key trong client code
  - Input được validate trước khi submit

### 🟡 Important — Nên fix trong sprint này

- **Performance**
  - List item có stable `key` (không dùng index nếu list có thể thay đổi)
  - Heavy computation có `useMemo`
  - Callback truyền xuống child có `useCallback`
  - Component không re-render không cần thiết (check với `React.memo` nếu phù hợp)
  - Lazy load component/route nếu chunk lớn

- **React Query** (nếu dùng)
  - `staleTime` được set hợp lý
  - Query key đúng factory pattern, đủ scope
  - `enabled` flag khi query có dependency chưa sẵn

- **Styling** (nếu `TAILWIND_CUSTOM=yes`)
  - Không hardcode màu Tailwind mặc định (`text-blue-500`, `bg-gray-100`, v.v.)
  - Dùng custom token (`text-primary`, `bg-surface`, ...)

- **Accessibility**
  - Button/link có accessible name
  - `<img>` có `alt`
  - Form input có `label` hoặc `aria-label`
  - Focusable bằng keyboard, focus visible

- **Multi-tenant** (nếu `MULTI_TENANT=yes`)
  - Data fetch có truyền `tenantId`
  - Query key có `tenantId` để cache tách biệt
  - Không hardcode tenant ID

### 🟢 Nice to have — Backlog

- Naming rõ ràng, consistent với phần còn lại của codebase
- Component > `MAX_COMPONENT_LINES` → gợi ý tách nhỏ
- Logic lặp → extract ra hook hoặc util
- Comment giải thích "tại sao" không phải "cái gì"

---

## Output format

```
## 🔍 Review: [tên file]

### Tóm tắt
[1-2 câu đánh giá tổng thể]

### ❌ Critical Issues
[Mỗi issue: dòng code → vấn đề → fix + code example]

### ⚠️ Important Issues
[Tương tự]

### 💡 Suggestions
[Nice-to-have]

### ✅ Điểm tốt
[Mention những phần làm đúng]

### 📝 Refactored version
[Full file sau khi refactor, nếu thay đổi nhiều]
```

---

## Hướng dẫn thực hiện

1. Đọc file từ `$ARGUMENTS`
2. Chạy qua toàn bộ checklist theo thứ tự Critical → Important → Nice to have
3. Mỗi issue: chỉ rõ vị trí + vấn đề + code fix cụ thể
4. Nếu refactor lớn: show full file sau refactor
5. Luôn mention những phần code đã làm tốt

Review: **$ARGUMENTS**

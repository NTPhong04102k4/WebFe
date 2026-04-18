# AI Toolkit — Claude Code Skills

Bộ skills dùng chung cho mọi dự án frontend/fullstack. **Nguồn chuẩn** là thư mục `ai-toolkit/` trong repo (hoặc nội dung tương đương sau khi giải nén `ai-toolkit.zip`).

---

## Cấu trúc thư mục (đúng = dùng được)

Sau khi giải nén zip, bạn phải có **một** thư mục gốc (ví dụ `ai-toolkit/`) chứa:

- `CONFIG.md`, `README.md`
- `gen-api/`, `gen-component/`, `gen-schema/`, `gen-test/`, `review/` — mỗi thư mục có `SKILL.md`

Nếu thấy thư mục tên lạ dạng `{gen-component,...}` thì **xóa** (artifact lỗi khi nén zip trên một số công cụ).

---

## Cài đặt — dùng chung cho mọi project (khuyến nghị)

Copy **nội dung** bên trong `ai-toolkit/` (các thư mục `gen-*`, `review`, không bắt buộc copy `CONFIG.md`/`README.md` vào skills) vào thư mục skills của Claude Code.

**macOS / Linux (bash)**

```bash
# Từ thư mục chứa folder ai-toolkit (đã giải nén hoặc clone repo)
mkdir -p ~/.claude/skills
cp -r ai-toolkit/gen-* ai-toolkit/review ~/.claude/skills/
# Hoặc gom đủ 5 skill một lần:
# cp -r ai-toolkit/gen-api ai-toolkit/gen-component ai-toolkit/gen-schema ai-toolkit/gen-test ai-toolkit/review ~/.claude/skills/
```

**Windows (PowerShell)**

```powershell
$skills = Join-Path $env:USERPROFILE ".claude\skills"
New-Item -ItemType Directory -Force -Path $skills | Out-Null
# Đổi đường dẫn nguồn cho đúng chỗ bạn đặt ai-toolkit
$src = "C:\path\to\ai-toolkit"
Copy-Item "$src\gen-api","$src\gen-component","$src\gen-schema","$src\gen-test","$src\review" -Destination $skills -Recurse -Force
```

Sau đó mở lại Claude Code / terminal — các lệnh slash như `/gen-api` sẽ map tới skill tương ứng (theo phiên bản CLI bạn dùng).

---

## Cài đặt — chỉ một repo cụ thể

```bash
mkdir -p .claude/skills
cp -r ai-toolkit/gen-* ai-toolkit/review .claude/skills/
```

Hoặc Windows:

```powershell
New-Item -ItemType Directory -Force -Path ".claude\skills" | Out-Null
Copy-Item "ai-toolkit\gen-*","ai-toolkit\review" -Destination ".claude\skills" -Recurse -Force
```

Một số bản cấu hình cũ đặt skill trực tiếp dưới `.claude/gen-api/`, … — vẫn có thể hoạt động; **chuẩn README này là** `.claude/skills/<tên-skill>/SKILL.md`.

---

## Workflow cho dự án mới (sau này)

1. **Giữ một bản toolkit** ở nơi bạn quản lý (repo riêng `ai-toolkit`, hoặc copy thư mục `ai-toolkit/` từ project này).
2. **Mỗi project**: copy `CONFIG.md` vào **root** repo dự án, điền đủ mục (stack, folder, API, test…).
3. **Không bắt buộc** sửa từng `SKILL.md` — cách nhanh nhất: **dán toàn bộ `CONFIG.md` đã điền** vào đầu phiên chat khi dùng `/gen-*` hoặc `/review`.
4. (Tuỳ chọn) Đồng bộ block "PROJECT CONFIG" trong từng `SKILL.md` với `CONFIG.md` nếu bạn muốn skill file tự mang context không cần paste mỗi lần.

---

## Skills có sẵn

| Lệnh | Mục đích |
|------|----------|
| `/gen-component` | Tạo UI component / page / layout |
| `/gen-api` | Tạo service + React Query hook |
| `/gen-schema` | Tạo TypeScript types + Zod schema |
| `/gen-test` | Viết Vitest / Jest test |
| `/review` | Review & refactor code |

---

## Cách dùng nhanh

### Bước 1 — Config project

Mở `CONFIG.md`, điền theo project (hoặc chỉ các mục liên quan skill bạn hay dùng).

### Bước 2 — Áp config cho AI

- **Cách A**: Tìm trong mỗi `SKILL.md` khối comment `PROJECT CONFIG — Điền từ CONFIG.md` và điền giá trị.
- **Cách B (khuyến nghị)**: Dán toàn bộ `CONFIG.md` đã điền vào đầu hội thoại — AI áp dụng cho session đó.

### Bước 3 — Lệnh

```text
/gen-component CourseCard component
/gen-component QuizPage page

/gen-api course list,get,create,update
/gen-api exam create,get

/gen-schema Course
/gen-schema ExamResult

/gen-test src/components/CourseCard.tsx
/gen-test src/hooks/useExamTimer.ts

/review src/pages/ExamPage.tsx
/review src/features/quiz/QuizPlayer.tsx
```

---

## Workflow đề xuất

```text
Tính năng mới
    │
    ▼
/gen-schema [Entity]
    │
    ▼
/gen-api [resource] all
    │
    ▼
/gen-component [UI] page
    │
    ▼
/gen-test [component]
    │
    ▼
/review [file]
```

---

## Cập nhật skill

Sửa trực tiếp `SKILL.md` trong từng thư mục skill (bản global `~/.claude/skills/` hoặc bản trong repo `ai-toolkit/` rồi copy lại). Thay đổi có hiệu lực ở phiên làm việc tiếp theo.

---

## Zip `ai-toolkit.zip`

File zip chỉ là **đóng gói** cùng nội dung với thư mục `ai-toolkit/`. Nên **ưu tiên** git pull / copy thư mục `ai-toolkit/` để tránh artifact thư mục lỗi khi giải nén; nếu dùng zip, kiểm tra lại cấu trúc như mục đầu README.

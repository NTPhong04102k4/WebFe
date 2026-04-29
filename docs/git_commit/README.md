# Hướng dẫn commit (SoldCars Web)

Tài liệu này chuẩn hóa **subject**, **body** và **scope** để lịch sử Git dễ đọc, dễ tìm kiếm, phù hợp changelog / release.

## Định dạng subject (bắt buộc)

```
<type>(<scope>): <mô tả ngắn bằng tiếng Anh, imperative, không chấm cuối>
```

- **type** (chọn một): `feat` | `fix` | `docs` | `style` | `refactor` | `perf` | `test` | `chore` | `build` | `ci`
- **scope** (tùy chọn, gợi ý cho repo này): `auth`, `api`, `db`, `orders`, `swagger`, `deps`, …
- **Mô tả**: tối đa ~72 ký tự; dùng động từ chỉ hành động: *add*, *fix*, *remove*, *refactor*.

Ví dụ:

```text
feat(auth): complete Google login via external cookie middleware
fix(jwt): accept Jwt:Audience as JSON array for validation
docs(git_commit): add commit message conventions
```

## Body (khuyến nghị khi thay đổi không tầm thường)

Sau dòng trống dưới subject, liệt kê ngắn **cái gì** và **vì sao** (không paste secret).

```text
feat(auth): unify OAuth callbacks with ASP.NET external auth

- Google/Facebook use Challenge; callbacks read ExternalTempCookie then service
- SaveTokens on provider options for userinfo/Graph access
- Sign out temp cookie after issuing app JWT
```

## Quy tắc bổ sung

| Quy tắc | Chi tiết |
|--------|-----------|
| Một commit một chủ đích | Tránh trộn refactor lớn + fix nhỏ không liên quan. |
| Không commit secret | Dùng User Secrets / env; không đưa `ClientSecret`, connection string production vào Git. |
| Liên kết issue | Cuối body: `Refs #123` hoặc `Closes #123` nếu team dùng tracker. |
| Breaking change | Thêm đoạn bắt đầu bằng `BREAKING CHANGE:` trong footer (Conventional Commits). |

## Commit đa dòng (PowerShell)

```powershell
git commit -m "feat(auth): unify Google and Facebook OAuth with middleware" -m "- Replace manual Google URL + code exchange with Challenge + cookie callback`n- Add CompleteGoogle/FacebookLogin from saved tokens and Graph/userinfo`n- Sign out ExternalTempCookie after JWT issuance"
```

Hoặc mở editor:

```powershell
git commit
```

## Tóm tắt type

| type | Khi nào |
|------|---------|
| `feat` | Hành vi mới cho user / API |
| `fix` | Sửa bug |
| `docs` | Chỉ tài liệu |
| `refactor` | Đổi cấu trúc code, không đổi hành vi |
| `chore` | Công cụ, format, việc vặt |
| `build` / `ci` | csproj, pipeline |

---

*Cập nhật theo nhu cầu team; có thể bổ sung template PR trong cùng thư mục nếu cần.*

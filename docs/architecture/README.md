# Architecture Docs

Tài liệu kiến trúc và tối ưu hệ thống cho SoldCars backend.

| File | Nội dung |
|------|----------|
| [url-flow.md](url-flow.md) | Luồng xử lý HTTP request từ browser đến API, các điểm chậm, bottleneck |
| [load-balancing.md](load-balancing.md) | 9 thuật toán load balancing phổ biến, khi nào dùng cái nào, tình huống SoldCars |
| [api-optimization.md](api-optimization.md) | 16 checklist item tối ưu API ASP.NET Core 8 + code mẫu |

## Đọc theo thứ tự

1. **url-flow.md** — hiểu bức tranh lớn: request đi qua đâu, tốn thời gian ở đâu.
2. **load-balancing.md** — chọn chiến lược phân tải khi deploy cluster.
3. **api-optimization.md** — áp dụng các tối ưu cụ thể vào code.

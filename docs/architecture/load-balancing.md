# Load Balancing — Thuật toán và Ứng dụng

Load Balancer (LB) phân phối request HTTP tới nhiều backend instance để:
- **Tăng throughput** (horizontal scaling)
- **Tăng độ sẵn sàng** (fail-over khi một instance die)
- **Giảm latency** (routing theo vị trí / sức tải)

SoldCars API đang dùng Cloud Run với Google HTTPS Load Balancer. Dưới đây là các thuật toán phổ biến và khi nào dùng.

---

## 1. Round Robin

**Cách hoạt động:** Request #1 → server A, #2 → B, #3 → C, #4 → A, …

```
[LB] ─req1→ A
[LB] ─req2→ B
[LB] ─req3→ C
[LB] ─req4→ A  (xoay vòng)
```

**Ưu:** đơn giản, stateless, dễ cấu hình.
**Nhược:** không quan tâm tải thực, instance yếu/mạnh như nhau → nghẽn.
**Dùng khi:** tất cả backend đồng nhất, request có cost tương đương.

---

## 2. Weighted Round Robin

**Cách hoạt động:** Gán trọng số (weight) cho mỗi server. Server mạnh nhận nhiều hơn.

```
Weights:  A=3, B=2, C=1
Sequence: A, A, A, B, B, C, A, A, A, B, B, C, ...
```

**Dùng khi:** backend khác spec (một số server CPU mạnh hơn). Phù hợp với cluster hybrid (one m5.xlarge + two m5.large).

---

## 3. Least Connections

**Cách hoạt động:** Route request tới server đang có ít connection đang xử lý nhất.

```
A: 10 active, B: 3 active, C: 7 active
Next request → B
```

**Dùng khi:** workload có request rất khác nhau về thời gian (ví dụ: 1 request POST `/work-orders/.../pay` lâu, 1 request GET `/brand` rất nhanh). API SoldCars có cả endpoint upload file (chậm) + endpoint CRUD đơn giản → Least Connections thường tối ưu hơn Round Robin.

---

## 4. Weighted Least Connections

Kết hợp weight + least connections: `effective_load = active_connections / weight`. Server nào có `effective_load` thấp nhất thì được chọn.

---

## 5. Least Response Time

**Cách hoạt động:** Theo dõi response time trung bình, route tới server phản hồi nhanh nhất + ít connection nhất.

**Dùng khi:** cần SLA thấp cho user-facing API. Khó hơn ở chỗ LB phải liên tục probe / đo.

---

## 6. IP Hash (Source IP Hashing)

**Cách hoạt động:** `hash(client_ip) mod N` → chọn server cố định cho 1 client.

```
Client 192.168.1.100 → luôn đi server B
Client 10.0.0.5     → luôn đi server A
```

**Ưu:** session stickiness tự nhiên (không cần Redis shared session).
**Nhược:** nếu N thay đổi (scale up/down), hash re-shuffle → mất session. Giải pháp: **Consistent Hashing**.
**Dùng khi:** legacy app lưu session in-memory. SoldCars dùng JWT stateless → **không cần**.

---

## 7. Consistent Hashing

**Cách hoạt động:** Hash cả client và server lên vòng tròn (0–2^32). Client đi tới server có hash gần nhất trên vòng theo chiều kim đồng hồ.

```
   A (hash 50)
       ╲
        ╲  client1 (hash 80) → đi A→B gần nhất là B
    C (hash 300) ────→ client2 (hash 250) → C
       ╱
   B (hash 150)
```

**Ưu:** khi thêm/bớt server, chỉ 1/N keys cần re-hash.
**Dùng khi:** cache sharding (Redis Cluster), distributed DB, CDN.

---

## 8. Random / Random with Two Choices

**Cách hoạt động:** Pick 2 server ngẫu nhiên, chọn server ít connection hơn (P2C — Power of Two Choices).

**Ưu:** xấp xỉ Least Connections nhưng rẻ hơn (không cần giữ state toàn cluster). Thường dùng trong service mesh (Envoy, Linkerd).

---

## 9. Layer 4 vs Layer 7

| | Layer 4 (Transport) | Layer 7 (Application) |
|---|---|---|
| Dựa trên | IP + Port (TCP/UDP) | HTTP headers, URL, cookie |
| Tốc độ | Rất nhanh | Chậm hơn (parse HTTP) |
| Tính năng | Forward byte stream | Routing theo path, host, cookie; TLS termination; WAF |
| Ví dụ | AWS NLB, HAProxy (mode tcp) | Nginx, ALB, Cloud HTTPS LB, Envoy |

SoldCars dùng **Layer 7** (Google HTTPS LB) để:
- Terminate TLS ở edge
- Route theo host (`api.soldcars.com` vs `admin.soldcars.com`)
- Add header `X-Forwarded-For`
- Tích hợp Cloud Armor (WAF)

---

## 10. Health Checks

LB định kỳ gọi health endpoint (`GET /health`) để quyết định server có "healthy" hay không.

- **Liveness** — server còn sống?
- **Readiness** — server sẵn sàng nhận request? (DB connected, cache ready)

Recommend thêm endpoint:

```csharp
[HttpGet("/health")]
[AllowAnonymous]
public IActionResult Health() => Ok(new { status = "ok", time = DateTime.UtcNow });

[HttpGet("/health/ready")]
[AllowAnonymous]
public async Task<IActionResult> Ready([FromServices] SoldCarsDbContext db)
{
    var canDb = await db.Database.CanConnectAsync();
    return canDb ? Ok() : StatusCode(503);
}
```

---

## 11. Chọn thuật toán cho SoldCars

| Tình huống | Đề xuất |
|-----------|---------|
| API chung, backend đồng spec | Round Robin (default) |
| Endpoint nặng upload (Brand logo, Car images, Insurance documents) | **Least Connections** |
| Redis cluster sharding | Consistent Hashing |
| Traffic bursty (campaign, flash sale) | Weighted Least Connections + auto-scaling |
| Stateful legacy (không có) | N/A (SoldCars stateless với JWT) |

Cloud Run của Google mặc định dùng một dạng **Least Loaded** với auto-scaling — phù hợp cho hầu hết use case của SoldCars. Không cần tự cấu hình LB algorithm trừ khi migrate sang GKE hoặc VM cluster.

---

## 12. Tham khảo

- Nginx docs — Load balancing methods: <https://nginx.org/en/docs/http/load_balancing.html>
- HAProxy — balance algorithms: <https://docs.haproxy.org/2.8/configuration.html#4-balance>
- "The Power of Two Choices in Randomized Load Balancing" — Michael Mitzenmacher

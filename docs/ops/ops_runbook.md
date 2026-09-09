# SỔ TAY VẬN HÀNH THƯƠNG MẠI (OPERATIONS RUNBOOK) — VTCOON

> **Dự án:** VTCoOn — Đại Gia Địa Ốc Việt Nam  
> **Tài liệu:** Sổ tay hướng dẫn triển khai, vận hành và xử lý sự cố môi trường Production  
> **Căn cứ:** Slice OPS-04 · Master Roadmap Giai đoạn 4: Production & Go-Live  
> **Phiên bản:** 1.0.0 (Thương Mại)

---

## 1. HƯỚNG DẪN TRIỂN KHAI (DEPLOYMENT)

### 1.1 Điều Kiện Tiên Quyết (Prerequisites)
- Máy chủ Linux (Ubuntu 22.04 LTS / Debian 12 khuyến nghị) hoặc VPS có IP tĩnh.
- Docker Engine >= 24.0.0 và Docker Compose v2 (plugin `docker compose`).
- Tên miền đã trỏ bản ghi DNS (A / CNAME) về địa chỉ IP của máy chủ.
- Mở các cổng mạng tường lửa (Firewall / Security Group):
  * Cổng 80/TCP: HTTP (chuyển hướng sang HTTPS và xác thực Let's Encrypt).
  * Cổng 443/TCP: HTTPS (Giao diện web) và WSS (WebSocket qua Nginx reverse proxy).

### 1.2 Thiết Lập Môi Trường (.env)
Tạo tệp `.env` tại thư mục gốc dự án trên máy chủ:

```bash
NODE_ENV=production
PORT=3000
WSS_PORT=3001
GRACE_PERIOD_MS=60000
```

### 1.3 Quy Trình Khởi Chạy Hệ Thống
1. Kéo mã nguồn mới nhất hoặc clone kho lưu trữ:
   ```bash
   cd /opt/vtcoon
   ```
2. Chuẩn bị thư mục và chứng chỉ SSL (`ssl/cert.pem` và `ssl/key.pem`):
   ```bash
   mkdir -p ssl
   # Nếu chưa cấp phát chứng chỉ Let's Encrypt ở Mục 3, tạo chứng chỉ self-signed tạm thời:
   if [ ! -f ssl/cert.pem ]; then
     openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
       -keyout ssl/key.pem -out ssl/cert.pem \
       -subj "/CN=localhost"
   fi
   ```
3. Xây dựng và khởi chạy stack container ngầm:
   ```bash
   docker compose up -d --build
   ```
4. Kiểm tra trạng thái hoạt động của các container:
   ```bash
   docker compose ps
   ```
   * Container `vtcoon` phải hiển thị trạng thái `Up (healthy)`.
   * Container `nginx` phải hiển thị trạng thái `Up`.

5. Kiểm tra trực tiếp endpoint sức khỏe dịch vụ và SPA tĩnh (Cổng 3000):
   ```bash
   # Kiểm tra trực tiếp qua cổng 3000 ánh xạ trên máy host:
   curl -f http://127.0.0.1:3000/health
   # Hoặc kiểm tra qua Nginx reverse proxy (cổng 443 HTTPS):
   curl -k -f https://127.0.0.1/health
   # Phản hồi chuẩn: {"status":"ok","activeRooms":0,"uptime":10}
   ```

---

## 2. QUY TRÌNH ROLLBACK (XỬ LÝ SỰ CỐ KHẨN CẤP)

Khi phát hiện sự cố nghiêm trọng sau khi triển khai phiên bản mới (crash loop, rò rỉ bộ nhớ, lỗi logic game), đội vận hành thực hiện quy trình rollback khẩn cấp theo các bước sau:

### 2.1 Các Bước Rollback Nhanh (Dưới 60 Giây)
1. Dừng stack dịch vụ phiên bản lỗi:
   ```bash
   docker compose down
   ```
2. Khôi phục về commit / tag phiên bản ổn định trước đó:
   ```bash
   git checkout <LAST_STABLE_TAG_OR_COMMIT>
   ```
3. Xây dựng lại và khởi chạy stack ổn định:
   ```bash
   docker compose up -d --build
   ```
4. Xác minh trạng thái sau rollback:
   ```bash
   docker compose ps
   curl -f http://127.0.0.1:3000/health
   ```
5. Ghi nhận sự cố vào nhật ký vận hành và thông báo đội ngũ kỹ thuật điều tra nguyên nhân (RCA).

---

## 3. QUẢN TRỊ CHỨNG CHỈ SSL & CERTBOT (LET'S ENCRYPT)

Hệ thống sử dụng Nginx làm điểm kết thúc SSL (SSL Termination) cho cả lưu lượng HTTPS và WSS, bảo vệ với tiêu đề HSTS (`Strict-Transport-Security`).

### 3.1 Cấp Phát Chứng Chỉ Ban Đầu (First-Time Setup)
Sử dụng Certbot trên máy chủ chủ (Host) để tạo chứng chỉ Let's Encrypt:

```bash
sudo certbot certonly --standalone -d vtcoon.vn -d www.vtcoon.vn
```

Sao chép hoặc tạo liên kết mềm (symlink) chứng chỉ vào thư mục `./ssl` được mount bởi Docker Compose:
```bash
cp /etc/letsencrypt/live/vtcoon.vn/fullchain.pem ./ssl/cert.pem
cp /etc/letsencrypt/live/vtcoon.vn/privkey.pem ./ssl/key.pem
chmod 600 ./ssl/key.pem
```

### 3.2 Gia Hạn Chứng Chỉ Tự Động Không Gián Đoạn (Zero-Downtime SSL Renewal)
1. Tạo script tự động gia hạn `/usr/local/bin/renew-vtcoon-ssl.sh`:
   ```bash
   #!/bin/bash
   certbot renew --quiet
   cp /etc/letsencrypt/live/vtcoon.vn/fullchain.pem /opt/vtcoon/ssl/cert.pem
   cp /etc/letsencrypt/live/vtcoon.vn/privkey.pem /opt/vtcoon/ssl/key.pem
   cd /opt/vtcoon && docker compose exec -T nginx nginx -s reload
   ```
2. Cấp quyền thực thi:
   ```bash
   chmod +x /usr/local/bin/renew-vtcoon-ssl.sh
   ```
3. Đặt Cron Job chạy định kỳ hàng tuần vào lúc 03:00 sáng Thứ Hai:
   ```crontab
   0 3 * * 1 /usr/local/bin/renew-vtcoon-ssl.sh
   ```
   * Lệnh `nginx -s reload` nạp lại chứng chỉ mới vào bộ nhớ mà không làm ngắt kết nối WebSocket của người chơi đang thi đấu.

---

## 4. GIÁM SÁT & QUẢN LÝ LOG (LOG MONITORING & OBSERVABILITY)

### 4.1 Theo Dõi Log Thời Gian Thực
- Theo dõi toàn bộ luồng log dịch vụ ứng dụng:
  ```bash
  docker compose logs -f vtcoon
  ```
- Theo dõi log truy cập và lỗi của Nginx reverse proxy:
  ```bash
  docker compose logs -f nginx
  ```

### 4.2 Cấu Trúc Log Sự Kiện Nghiệp Vụ (Structured Logs)
Mọi biến động trạng thái bàn cờ, tài chính và bảo mật đều được ghi dưới định dạng chuẩn JSON:
```json
{"event":"SECURITY_OUT_OF_TURN","correlationId":"AB12CD","playerId":"p2","timestamp":1788960000000}
{"event":"RATE_LIMIT_HIT","socketId":"s1","count":11,"timestamp":1788960000000}
{"event":"DOWNGRADE_PROPERTY","correlationId":"QPYZVB","timestamp":1788960328294,"delta":{"cellIndex":1,"refund":150,"playerId":"p1"}}
{"event":"MORTGAGE_PROPERTY","correlationId":"T018AA","timestamp":1788960328516,"delta":{"cellIndex":8,"loan":500,"playerId":"P2"}}
```

Các mẫu truy vấn kiểm tra sự cố bảo mật qua grep:
```bash
docker compose logs vtcoon | grep "SECURITY_OUT_OF_TURN"
docker compose logs vtcoon | grep "RATE_LIMIT_HIT"
docker compose logs vtcoon | grep "ABUSE_DETECTED"
```

### 4.3 Cấu Hình Tự Động Xoay Vòng Log (Log Rotation)
Để ngăn chặn nguy cơ đầy ổ đĩa trên máy chủ, Docker daemon được khuyến nghị cấu hình giới hạn kích thước tệp log tại `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "3"
  }
}
```

---

## 5. DANH MỤC BIẾN MÔI TRƯỜNG BẮT BUỘC (MANDATORY ENVIRONMENT VARIABLES)

Hệ thống VTCoOn tuân thủ nguyên tắc Thiết kế Phòng Thủ (Fail-Fast). Khi khởi động, nếu thiếu bất kỳ biến môi trường nào dưới đây, server sẽ dừng ngay lập tức kèm thông điệp lỗi rõ ràng.

| Tên Biến | Bắt Buộc | Giá Trị Mẫu | Mô Tả Nghiệp Vụ & Kỹ Thuật |
|---|:---:|---|---|
| `NODE_ENV` | **Có** | `production` | Môi trường thực thi. Xác định chế độ tối ưu và chặn các cờ debug không an toàn. Giá trị hợp lệ: `production`, `development`, `test`. |
| `WSS_PORT` | **Có** | `3001` | Cổng mạng mở socket lắng nghe kết nối WebSocket Server. Nginx upstream `app_wss` sẽ proxy các yêu cầu `/rooms/` vào cổng này. |
| `GRACE_PERIOD_MS` | **Có** | `60000` | Thời gian ân hạn mất kết nối tính bằng mili-giây (chuẩn 60000ms = 60 giây). Sau thời gian này nếu người chơi không khôi phục phiên (F5/Reconnect Token), Bot AI sẽ tự động tiếp quản lượt chơi. |
| `PORT` | Không (Mặc định 3000) | `3000` | Cổng dịch vụ HTTP phục vụ endpoint `/health` kiểm tra sức khỏe container và điều phối qua Nginx upstream `app_http`. |

### 5.1 Kiểm Chứng Cơ Chế Bắt Lỗi Môi Trường
Nếu thiếu biến `NODE_ENV`:
```
[Server] Fatal bootstrap error: Error: NODE_ENV is required
```
Nếu thiếu biến `WSS_PORT`:
```
[Server] Fatal bootstrap error: Error: WSS_PORT is required
```
Nếu thiếu biến `GRACE_PERIOD_MS`:
```
[Server] Fatal bootstrap error: Error: GRACE_PERIOD_MS is required
```

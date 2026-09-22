# VTCoOn — Game Cờ Tỷ Phú 3D Việt Nam

Trò chơi bàn cờ tỷ phú bất động sản 3D trực tuyến lấy bối cảnh các tỉnh thành Việt Nam. Dự án phát triển theo kiến trúc **Server-Authoritative FSM**, hiển thị đồ họa 3D phong cách diorama ngoài trời rực rỡ qua **React Three Fiber (R3F)** và đồng bộ trạng thái thời gian thực qua **WebSocket**.

---

## 🌟 Tính Năng Nổi Bật

- **Sa bàn 3D sống động**: 40 ô cờ tương ứng các tỉnh thành, bến xe, tiện ích của Việt Nam; xúc xắc 3D vật lý, mô hình nhà phố và khách sạn phong cách Metropolis diorama.
- **Bộ não máy chủ tối thượng (Server-Authoritative FSM)**: Toàn bộ luật chơi, di chuyển, thu tiền thuê và logic mua bán được kiểm soát tập trung ở server, chống gian lận.
- **Đồng bộ Realtime siêu tốc**: Kết nối WebSocket đồng bộ payload dạng Sparse Diff (< 10KB/lần gửi), hỗ trợ cơ chế tự động kết nối lại (Grace Period 60s).
- **Hệ sinh thái tài chính đa dạng**:
  - Đấu giá công khai thời gian thực (Online Auction).
  - Thương lượng, hoán đổi tài sản giữa người chơi (P2P Trade).
  - Cầm cố, chuộc tài sản, thẻ Khí Vận & Cơ Hội mang bản sắc Việt.
  - Tự động bổ sung Bot AI thông minh khi thiếu người chơi.
- **Cổng Quản Trị Trực Tiếp (Admin Portal)**: Bảng điều khiển giám sát phòng chơi, chỉ số tài chính, telemetry và can thiệp ván đấu tại `/#/admin`.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 19, React Three Fiber (Three.js), Tailwind CSS v4, Zustand.
- **Backend**: Node.js (TypeScript Strict Mode), WebSocket (`ws`), Native HTTP.
- **Triển khai & Mạng**: Docker & Docker Compose, Nginx Reverse Proxy, Ngrok / Cloudflared Tunnel.
- **Chất Lượng & Kiểm Thử**: Vitest (hơn 280+ living test suites, 100% Pass), Quality Gates tự động.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

### Yêu Cầu Tiên Quyết
- **Node.js** >= 20.x
- **npm** >= 10.x
- **Docker & Docker Compose** (nếu triển khai qua container)

### 1. Chạy Môi Trường Phát Triển (Local Dev)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Tạo file cấu hình môi trường
cp .env.example .env

# 3. Khởi chạy dev server (Frontend & Server)
npm run dev
```

Trình duyệt mở tại: `http://localhost:5173`

---

### 2. Triển Khai Bằng Docker (Production)

Toàn bộ dịch vụ (Game Server, Nginx Reverse Proxy, Ngrok Tunnel) đã được đóng gói sẵn trong Docker Compose:

```bash
# 1. Khởi chạy và build container
docker compose up -d --build

# 2. Kiểm tra trạng thái dịch vụ
docker compose ps
```

- **Cổng Game (HTTP)**: `http://localhost:3000` (hoặc qua Nginx `http://localhost:80`)
- **WebSocket (WSS)**: `ws://localhost:3001` (hoặc qua Nginx `ws://localhost/rooms/`)
- **Trang Quản Trị (Admin Portal)**: `http://localhost:3000/#/admin`

---

## ⚙️ Cấu Hình Môi Trường (`.env`)

Sao chép từ `.env.example` và tùy chỉnh các biến sau:

| Biến Môi Trường | Mặc Định | Ý Nghĩa |
| :--- | :--- | :--- |
| `PORT` | `3000` | Cổng HTTP của Game Server |
| `WSS_PORT` | `3001` | Cổng WebSocket của Game Server |
| `GRACE_PERIOD_MS` | `60000` | Thời gian chờ kết nối lại (ms) |
| `VTCOON_ADMIN_SECRET` | *(bắt buộc)* | Mật mã đăng nhập trang Admin Portal |
| `MAX_CONCURRENT_ROOMS`| `50` | Giới hạn số phòng hoạt động đồng thời |
| `NGROK_AUTHTOKEN` | *(tùy chọn)* | Token ngrok nếu cần mở cổng ra Internet |
| `NGROK_DOMAIN` | *(tùy chọn)* | Tên miền tĩnh ngrok đã đăng ký |

> ⚠️ **Bảo Mật**: File `.env` chứa mật mã nhạy cảm và đã được đưa vào `.gitignore`. Tuyệt đối không commit file `.env` lên GitHub.

---

## 🧪 Lệnh Kiểm Thử & Kiểm Soát Chất Lượng

Dự án áp dụng quy trình kiểm soát chất lượng nghiêm ngặt (Quality Gate):

```bash
# Chạy toàn bộ unit & integration tests
npm test

# Kiểm tra giao diện, type checking và lint UI/UX
npm run lint:ui
npx tsc --noEmit

# Chạy toàn bộ cổng kiểm duyệt chất lượng trước khi bàn giao
npm run gate
```

---

## 📁 Cấu Trúc Thư Mục Chính

```text
vtcoon/
├── src/
│   ├── domain/        # FSM lõi, bảng cờ, kinh tế, quy tắc nghiệp vụ thuần túy
│   ├── server/        # WebSocket server, RoomManager, Bot AI, AdminManager
│   └── client/        # Giao diện R3F 3D, âm thanh Howler, HUD, Modals, Stores
├── nginx/             # Cấu hình reverse proxy và chứng chỉ SSL
├── tests/             # 280+ living test suites (domain, server, client, contracts)
├── docs/              # Tài liệu kiến trúc, ADR, Design system và Domain gotchas
├── docker-compose.yml # Cấu hình triển khai multi-container
└── package.json       # Dependencies và scripts dự án
```

---

## 📄 Bản Quyền & Giấy Phép

Dự án thuộc quyền sở hữu riêng của tác giả. Mọi quyền được bảo lưu.

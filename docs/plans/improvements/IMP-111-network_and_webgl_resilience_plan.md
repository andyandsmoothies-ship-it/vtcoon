# KẾ HOẠCH KỸ THUẬT: KIỂM TRA ĐỘ CHỊU TẢI RỚT MẠNG 60S & RÒ RỈ BỘ NHỚ WEBGL (IMP-111)

> **Mã số**: IMP-111  
> **Tên**: Network 60s Grace Period Resilience & WebGL Memory Leak Audit  
> **Phạm vi**: `src/server/network/`, `src/server/session_manager.ts`, `src/client/3d/`, `tests/contracts/audit_network_webgl_resilience.test.ts`  
> **Tiêu chuẩn áp dụng**: GEMINI.md, Universal 4-Facet Behavioral Matrix, O(1) Cache Bounds, ASD-STE100  

---

## 1. MỤC TIÊU & BỐI CẢNH

Rà soát và lượng hóa hai chỉ số chất lượng phi chức năng (NFR) cốt lõi của VTCOON:
1. **Hạng mục 3 (Network 60s Grace Period Resilience)**:
   - Cơ chế bảo lưu trạng thái khi ngắt kết nối mạng bất ngờ (WiFi/4G drop, browser refresh).
   - Kích hoạt thời gian ân hạn 60 giây (`GRACE_PERIOD_MS = 60_000`).
   - Cấp phát và đối soát mã khôi phục UUID v4 ngẫu nhiên, gắn định danh phòng và người chơi.
   - Chuyển giao Bot tiếp quản tự động (`BotEngine.takeover`, `isBot = true`) khi quá 60s để triệt tiêu deadlock.
   - Bảo toàn slot Host người thật trong sảnh chờ khi chưa bắt đầu ván đấu.
2. **Hạng mục 4 (WebGL Memory Leak & Resource Disposal)**:
   - Chứng minh trần O(1) của các cache texture (`tileTextureCache` <= 40, `standeeTextureCache` <= 40, `tileImageCache` <= 40, `mascotTextureCache` <= 20).
   - Khả năng giải phóng bộ nhớ (`clearMascotTextureCache`).
   - Lượng hóa VRAM tĩnh của bàn cờ (40.0 MB cho 40 ô CanvasTexture 512x512, 1.25 MB cho linh vật; tổng <= 41.25 MB < 45 MB budget).
   - Triệt tiêu FBO churn nhờ `ContactShadows frames={1}` và `multisampling: 0`.
   - Kiểm chứng 1.000 biến động FSM liên tục không gây rò rỉ bộ nhớ Heap (< 10 MB).

---

## 2. MA TRẬN KIỂM THỬ HỢP ĐỒNG (14 ATOMIC TESTS)

| Mã Test | Mô Tả Hành Vi Kiểm Thử | Trạng Thái |
| :--- | :--- | :---: |
| `TC-AUDIT-NET.01` | Khi socket đứt, kích hoạt ân hạn 60s, chuyển session sang GracePeriod và phát sóng `PLAYER_GRACE` (secondsLeft = 60) | 🟢 PASS |
| `TC-AUDIT-NET.02` | Cấp phát Reconnect Token UUID v4 duy nhất và bảo toàn ánh xạ với người chơi | 🟢 PASS |
| `TC-AUDIT-NET.03` | Người chơi kết nối lại trong 60s: hủy bộ đếm ân hạn và khôi phục trạng thái an toàn (idempotent) | 🟢 PASS |
| `TC-AUDIT-NET.04` | Phòng thủ token giả mạo: Từ chối token không tồn tại với lý do `TOKEN_INVALID` | 🟢 PASS |
| `TC-AUDIT-NET.05` | Phòng thủ token sai phòng: Từ chối token hợp lệ của phòng A khi gửi vào phòng B (`TOKEN_INVALID`) | 🟢 PASS |
| `TC-AUDIT-NET.06` | Hết hạn 60s: Đánh dấu `TOKEN_EXPIRED`, chuyển session `Disconnected` và gọi Bot tiếp quản | 🟢 PASS |
| `TC-AUDIT-NET.07` | Phòng chưa bắt đầu: Host rớt mạng không bị Bot tiếp quản làm hỏng sảnh chờ (`isBot = false`) | 🟢 PASS |
| `TC-AUDIT-NET.08` | Độ bền chịu tải: 50 chu kỳ disconnect-reconnect liên tiếp hoàn tất < 100ms | 🟢 PASS |
| `TC-AUDIT-WGL.01` | Bất biến trần bộ nhớ đệm Mascot Texture: Hỗ trợ hàm dọn rác `clearMascotTextureCache()` an toàn | 🟢 PASS |
| `TC-AUDIT-WGL.02` | PostProcessingPipeline: `multisampling = 0` bảo vệ trần FBO và VRAM | 🟢 PASS |
| `TC-AUDIT-WGL.03` | PostProcessingPipeline: Cấu hình ánh sáng dịu chống quá nhiệt GPU (`aoIntensity = 0.38, bloomIntensity = 0.20`) | 🟢 PASS |
| `TC-AUDIT-WGL.04` | Tính toán định lượng trần VRAM: 40 ô cờ x 512x512 CanvasTexture = 40.0 MB <= 45 MB budget | 🟢 PASS |
| `TC-AUDIT-WGL.05` | Tính toán định lượng trần VRAM linh vật: 20 tổ hợp x 128x128 = 1.25 MB <= 2.0 MB budget | 🟢 PASS |
| `TC-AUDIT-WGL.06` | Kiểm tra độ ổn định bộ nhớ Heap: 1.000 biến động FSM liên tục tăng < 10 MB | 🟢 PASS |

---

## 3. QUY TRÌNH THỰC HIỆN 3 TRẠM

1. **Trạm 1 (RED Contract Test)**: Viết suite kiểm thử `tests/contracts/audit_network_webgl_resilience.test.ts`.
2. **Trạm 2 (GREEN Implementation)**: Khớp chuẩn thuộc tính `room.roomCode` và chữ ký `createPlayer(id)`. Toàn bộ 14/14 tests chuyển trạng thái PASS trong 9ms.
3. **Trạm 3 (Physical Disk Review & Verification)**: Chạy toàn bộ cụm test mạng & WebGL (77 tests), kiểm tra `npx tsc --noEmit` (0 lỗi), `npm run lint:ui` (0 lỗi), và container HTTP 200 OK.

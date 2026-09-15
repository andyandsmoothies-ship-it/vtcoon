# [IMP-60] Báo Cáo Nghiệm Thu Hệ Thống Kinh Tế Động Theo Số Người Chơi, Chuẩn Hóa Nhịp Thở & Cứu Nguy AFK An Toàn

- **Mã Ticket**: `IMP-60`
- **Ngày Hoàn Thành**: 2026-09-14
- **Trạng Thái**: SHIPPED & VERIFIED (Quy Trình 3 Trạm Đạt Chuẩn 100%)

---

## 1. Tóm Tắt Kết Quả Triển Khai

| Hạng Mục | Trước Cải Tiến | Sau Cải Tiến (IMP-60) | Lợi Ích Trải Nghiệm Người Chơi |
| :--- | :--- | :--- | :--- |
| **Quy Mô Vốn Khởi Điểm** | Cố định 15.000 Tr. cho mọi quy mô bàn đấu (2, 3, 4 người) | Động hóa theo số người chơi: 2 người = 25.000 Tr., 3 người = 20.000 Tr., 4 người = 18.000 Tr. | Đảm bảo đủ thanh khoản để hoàn thành ván đấu 30 vòng, mua đất và xây dựng công trình C1-C3 |
| **Trần Thuế Tài Sản Vượt GO** | Không áp trần, sở hữu nhiều đất bị phạt thuế > 2.800 Tr. khiến lương GO bị âm | Khóa trần tối đa 1.000 Tr. (`GO_PROPERTY_TAX_CAP = 1_000`, tương đương 50% `GO_BONUS`) | Lương thực nhận khi qua ô GO luôn dương tối thiểu +1.000 Tr., không còn nghịch lý càng giàu càng nghèo |
| **Nhịp Thở Thời Gian (Pacing)** | Gấp gáp (15s - 25s), người chơi không kịp đọc bảng giá và thẻ cơ hội | Chuẩn hóa: WaitingRoll 25s, ActionPhase 35s, HosePhase 25s, PropertyManagement 30s, AuctionPhase 20s, InsolvencyPhase 45s | Nhịp chơi thư thái, đủ thời gian tư duy chiến thuật tài phiệt |
| **Cứu Nguy AFK Trong Insolvency** | Hết 25s lập tức cưỡng chế phá sản (`INTENT_BANKRUPTCY`), xóa sổ người chơi còn nhiều đất | Thuật toán `executeInsolvencyAfkRecovery` 2 bước: (1) Hạ cấp công trình C1-C3 -> C0 hoàn tiền 50% theo Even-Downgrade; (2) Thế chấp ô đất thô rẻ nhất tăng dần đến khi balance >= 0 | Bảo vệ tài sản người chơi khi rớt mạng/idle, không bao giờ phá sản khi còn công trình hoặc đất thế chấp được |
| **Nút Chiếu Sáng TopBar** | Biểu tượng `[⏱️ Tự Động]` gây hiểu nhầm thành chế độ Bot đánh hộ | Biểu tượng thời tiết `[🌤️ Ánh Sáng: Tự Động]` | Minh bạch ý nghĩa chuyển đổi chế độ chiếu sáng Ngày/Đêm |
| **Chống Trùng Lặp Intent Khi 00:00** | Client gửi intent tự động đồng thời với Server Timeout Scheduler | Client kiểm tra cờ `isConnected === true` để nhường máy chủ điều phối tự động | Triệt tiêu hoàn toàn race condition và cảnh báo xung đột intent trên mạng |

---

## 2. Minh Chứng Kiểm Thử & Thẩm Định Độc Lập

1. **Bộ Kiểm Thử Hợp Đồng (`tests/contracts/imp60_dynamic_economy_and_afk_safety.test.ts`)**:
   - `22/22 PASSED` (100% GREEN trong 11ms).
   - Kiểm chứng trọn vẹn 4 khía cạnh ma trận hành vi:
     * *Facet 1 (Boundary)*: Vốn động 25k (2p), 20k (3p), 18k (4p); trần thuế GO 1.000 Tr.; nhịp thở timeout 20s - 45s; watchdog stall 60s.
     * *Facet 2 (State Reactivity)*: Thuế GO khấu trừ có trần; TopBar nhãn `🌤️ Ánh Sáng: Tự Động`; Client không phát trùng intent khi `isConnected === true`.
     * *Facet 3 (Resource Disposal & Safe AFK Recovery)*: Tự động hạ cấp công trình hoàn tiền trước; thế chấp ô rẻ nhất tiếp theo; lặp đến khi số dư >= 0; TurnOrchestrator kết thúc lượt an toàn.
     * *Facet 4 (Error Defense & Bankruptcy Fallback)*: Phát lệnh phá sản chỉ khi toàn bộ công trình đã hạ cấp về 0 VÀ toàn bộ đất đã bị thế chấp; từ chối thế chấp trùng lặp.
2. **Kiểm Thử Hồi Quy Toàn Hệ Thống (`npm test`)**:
   - `163/163 Test Files PASSED` (100% GREEN).
   - `2.412/2.412 Tests PASSED` (0 failures).
   - Cập nhật đồng bộ các bộ test dòng tiền lớn (`milestone_deep_audit_hotfix`, `auction_reconnect_grace_period`, `user_reported_gameplay_flow`, `production_resilience`, `multiplayer_stress_flow`, `multiplayer_gameplay_flow`, `golden_gameplay_flow`, `fsm_golden_engine`).
3. **Kiểm Tra Cổng Chất Lượng (`npm run gate:quick`)**:
   - `tsc --noEmit`: 0 TypeScript errors.
   - `lint:ui`: 0 violations.
   - `lint:slop`: PASS.
   - `lint:dup`: 1.62% duplicated lines (ngân sách < 2.5%).
   - `lint:assets`: 0.33 MB / 2.5 MB (15/15 mô hình 3D đạt chuẩn).

---

## 3. Invariants Đã Được Lưu Vào `docs/domain/gotchas.md`

- **Gotcha #82**: `[ECONOMY/PACING/AFK] Bất Biến Kinh Tế Động, Trần Thuế GO & Cứu Nguy AFK Bằng Thế Chấp (IMP-60)`:
  - Vốn khởi điểm động: 2 người = 25.000 Tr., 3 người = 20.000 Tr., 4 người = 18.000 Tr. khi `startGame`. Fallback `INITIAL_BALANCE = 15.000 Tr.` bảo tồn cho các instance đơn lẻ.
  - Trần thuế tài sản qua GO: Tối đa `GO_PROPERTY_TAX_CAP = 1_000 Tr.`, bảo đảm dòng tiền thực nhận qua GO tối thiểu +1.000 Tr.
  - Pacing timeouts: WaitingRoll 25s, ActionPhase 35s, HosePhase 25s, PropertyManagement 30s, AuctionPhase 20s, InsolvencyPhase 45s; Watchdog `maxTurnStallMs = 60_000ms`.
  - Cứu nguy AFK an toàn: `executeInsolvencyAfkRecovery` thực hiện 2 bước (hạ cấp công trình C1-C3 -> C0 hoàn 50% tiền, sau đó thế chấp ô đất rẻ nhất tăng dần đến khi balance >= 0, chỉ phá sản khi cạn kiệt toàn bộ).
  - TopBar nút ánh sáng: `🌤️ Ánh Sáng: Tự Động`.

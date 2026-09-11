# [KẾ HOẠCH CẢI TIẾN IMP-02] HỆ THỐNG BOT AI ĐA TẦNG THÍCH ỨNG & THẨM ĐỊNH 1.000 VÁN (5 GIAI ĐOẠN)

## 1. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

Phiên bản Bot AI ban đầu chỉ hành xử theo các con số cố định (cược cứng, mua đất cứng, không biết tính rủi ro phía trước, phá sản mù quáng). Điều này làm giảm tính cạnh tranh của game cờ tỷ phú VTCOON.

Mục tiêu của IMP-02 là nâng cấp trí thông minh nhân tạo của Bot thành Hệ thống Đa Tầng Thích Ứng (Adaptive Multi-tier Engine), ứng dụng triết lý từ `docs/ai_native_sdlc_master_guide.md`:
- Động hóa toàn bộ quyết định tài chính.
- Tự động điều chỉnh theo 3 tính cách (Aggressive, Balanced, Passive).
- Cứu nợ tuần tự 5 bước bảo toàn tài sản ròng.
- Kiểm chứng khả năng vận hành không bế tắc qua 1.000 ván cờ mô phỏng thực tế.

---

## 2. KIẾN TRÚC 4 TẦNG & PHÂN RÃ 5 GIAI ĐOẠN

```text
[Bàn Cờ & Xúc Xắc 2D6]
          │
          ▼
[Giai Đoạn 1: Threat Forecaster] ────► Quét 12 ô, tính E(Loss), sinh safetyBuffer
          │
          ▼
[Giai Đoạn 2: Valuation Engine]  ────► Định giá động: Giá gốc + Độc quyền + Chặn + Nhịp ván + Jitter
          │
          ▼
[Giai Đoạn 3: Solvency Solver]   ────► Cứu nợ 5 bước & Tự động nâng cấp nhà Even-Building
          │
          ▼
[Giai Đoạn 4: Tactical Engine]   ────► Đấu giá trần maxBid, Dọa giá Bluffing, Cược HOSE theo freeCash
          │
          ▼
[Giai Đoạn 5: Chaos Monkey Sim]  ────► Thẩm định 1.000 ván cờ, 3 Bất Biến Vĩ Mô (Deadlock = 0.00%)
```

### Giai Đoạn 1: Quét Rủi Ro 2D6 & Tính Toán Đệm An Toàn (Threat Forecaster)
- **Tệp mới**: `src/domain/bot/threat_forecaster.ts`, `src/domain/bot/bot_types.ts`.
- **Nghiệp vụ**:
  * Sử dụng bảng phân phối xác suất 2D6 chuẩn từ 2 đến 12 (ví dụ: điểm 7 là 16.67%, điểm 2 & 12 là 2.78%).
  * Quét 12 ô phía trước vị trí hiện tại của Bot; tính toán tổn thất kỳ vọng `E(Loss) = Tổng(Xác suất * Tiền thuê hoặc Tiền phạt)`.
  * Tính toán đệm an toàn `safetyBuffer = E(Loss) * Hệ số tính cách` (Aggressive x0.8, Balanced x1.2, Passive x1.6).

### Giai Đoạn 2: Định Giá Động Bất Động Sản (Valuation Engine)
- **Tệp mới**: `src/domain/bot/valuation_engine.ts`.
- **Nghiệp vụ**:
  * Định giá dựa trên 4 thành phần:
    1. Giá niêm yết cơ sở (Base Price).
    2. Điểm độc quyền (Monopoly Premium: x2.8 đối với ô cuối cùng tạo bộ màu, x3.2 đối với ô đắt đỏ).
    3. Điểm chặn đối thủ (Blocker Premium: x2.2 khi ngăn đối thủ hoàn thành bộ màu).
    4. Nhịp vòng đấu: Vòng 1-10 ưu tiên tích lũy đất; Vòng 11-20 ưu tiên xây nhà; Vòng 21-30 phạt thanh khoản mỏng.
    5. Jitter ngẫu hứng ±12% triệt tiêu tính đoán trước của thuật toán.

### Giai Đoạn 3: Tự Động Nâng Cấp Even-Building & Cứu Vãn Phá Sản (Solvency Solver)
- **Tệp mới & can thiệp**: `src/domain/bot/solvency_solver.ts`, `src/domain/bot/bot_engine.ts`.
- **Nghiệp vụ**:
  * Tự động xây nhà C1-C3 trong `PropertyManagement` khi số dư tiền mặt vượt ngưỡng đệm an toàn (`balance >= buildCost + safetyBuffer`), tuân thủ nghiêm ngặt nguyên tắc Even-Building.
  * Cây quyết định cứu nợ 5 bước khi rơi vào tình trạng âm tiền:
    - Bước 1: Hạ cấp nhà ở các ô đất lẻ (thu hồi 50% chi phí).
    - Bước 2: Thế chấp ô đất lẻ chưa xây nhà có tiền thuê thấp nhất.
    - Bước 3: Hạ cấp nhà trong bộ màu theo nguyên tắc Even-Downgrade.
    - Bước 4: Thế chấp ô đất trong bộ màu.
    - Bước 5: Phá sản bất khả kháng khi đã cạn kiệt tài sản.

### Giai Đoạn 4: Đấu Giá Chiến Thuật & Đầu Tư Sàn HOSE Thích Ứng
- **Tệp can thiệp**: `src/domain/bot/bot_engine.ts`, `src/server/room_manager.ts`, `src/server/network/bot_turn_scheduler.ts`.
- **Nghiệp vụ**:
  * Đấu giá: Tính giá trần `maxBid = Math.min(estimatedValue, balance - safetyBuffer * 0.5)`. Cho phép Bot Aggressive dọa giá đối thủ (Bluffing); chủ động rút lui an toàn khi vượt trần.
  * Cược sàn chứng khoán HOSE co dãn theo lượng tiền nhàn rỗi khả dụng `freeCash = balance - safetyBuffer`: từ cược 500 Tr. đến 3.000 Tr. hoặc bỏ qua khi `freeCash < 1.000 Tr.`

### Giai Đoạn 5: Kiểm Toán Tổng Thể & Thẩm Định 1.000 Ván với Chaos Monkey
- **Tệp can thiệp**: `tests/simulation/chaos_monkey_simulator.test.ts`.
- **Nghiệp vụ**:
  * Tích hợp bộ thu thập chỉ số chiến thuật (`TacticalMetricsCollector`): Upgrade metrics, Solvency recovery metrics, Auction participation metrics.
  * Kiểm chứng 3 Bất Biến Vĩ Mô:
    1. Liveness Invariant: 0.00% Deadlock, 100% ván kết thúc hợp lệ.
    2. Cash Conservation Invariant: Rò rỉ Kho Bạc = 0 Tr. VNĐ (`Δ = 0`).
    3. Finite Balances Invariant: Không chứa `NaN` hay `Infinity`.

---

## 3. RÀNG BUỘC KỸ THUẬT & NGHIỆM THU

- Giới hạn dòng mã 5-Tier: Toàn bộ các file logic miền của Bot (`threat_forecaster.ts`, `valuation_engine.ts`, `solvency_solver.ts`, `bot_engine.ts`) <= 400 LOC.
- File kiểm thử Simulator <= 600 LOC.
- Zero Dirty Casts, 100% PASS trên vitest và tsc.

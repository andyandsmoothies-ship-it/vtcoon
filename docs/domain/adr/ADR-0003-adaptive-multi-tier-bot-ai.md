# ADR-0003: KIẾN TRÚC BOT AI ĐA TẦNG THÍCH ỨNG (ADAPTIVE MULTI-TIER BOT AI)

- **Trạng Thái**: Chấp Nhận (Accepted / Implemented)
- **Ngày Quyết Định**: 2026-09-11
- **Phạm Vi**: `src/domain/bot/`, `src/server/room_manager.ts`, `tests/simulation/`
- **Kế Hoạch & Báo Cáo Liên Quan**: `docs/plans/improvements/IMP-02-adaptive-multi-tier-bot-engine_plan.md`, `docs/reports/improvements/IMP-02-adaptive-bot-simulation_report.md`

---

## 1. BỐI CẢNH (CONTEXT)

Trong các phiên bản ban đầu, Bot AI vận hành bằng các điều kiện rẽ nhánh đơn giản với các con số cố định (hardcoded thresholds):
- Mua đất mù quáng khi có đủ tiền, không quan tâm 12 ô phía trước có chuỗi khách sạn đối thủ.
- Luôn phá sản ngay lập tức khi số dư âm tiền, không biết thế chấp hay hạ cấp công trình để giải cứu dòng tiền.
- Từ chối tham gia đấu giá hoặc luôn bỏ qua (Pass mù quáng).
- Cược sàn chứng khoán HOSE theo số tiền cố định (500 Tr. hoặc 1.000 Tr.) bất kể dòng tiền đang dồi dào hay kiệt quệ.

Hệ quả là Bot AI rất dễ bị người chơi bắt bài, nhanh chóng vỡ nợ sau vài vòng quay, làm suy giảm nghiêm trọng trải nghiệm game bàn cờ thương mại cao cấp.

---

## 2. QUYẾT ĐỊNH KIẾN TRÚC (DECISION)

Chúng tôi quyết định thay thế toàn bộ logic cứng bằng **Hệ Thống Ra Quyết Định Đa Tầng Thích Ứng (Adaptive Multi-tier Decision Engine)** gồm 4 tầng tính toán thời gian thực và 1 tầng kiểm chứng mô phỏng:

```text
[Xúc Xắc 2D6] ──► [Tầng 1: Threat Forecaster]
                         │ (Quét 12 ô, tính E(Loss), sinh safetyBuffer)
                         ▼
                   [Tầng 2: Valuation Engine]
                         │ (Định giá BĐS: Gốc + Độc quyền + Chặn đối thủ + Nhịp ván + Jitter ±12%)
                         ▼
                   [Tầng 3: Solvency Solver]
                         │ (Cứu nợ 5 bước: Hạ cấp lẻ ➔ Thế chấp lẻ ➔ Hạ cấp bộ màu ➔ Thế chấp bộ màu)
                         ▼
                   [Tầng 4: Tactical Bot Engine]
                         │ (Nâng cấp Even-Building, Đấu giá & Dọa giá, Đầu tư HOSE theo freeCash)
                         ▼
                   [Tầng 5: Chaos Monkey Simulator] ──► [1.000 Ván Headless / 0.00% Deadlock]
```

### Chi tiết các tầng kiến trúc:

1. **Tầng 1: Dự Báo Nguy Cơ & Đệm An Toàn (`threat_forecaster.ts`)**:
   - Sử dụng bảng phân phối xác suất 2D6 chuẩn (tổng 36 biến cố: điểm 7 là 16.67%, điểm 2 & 12 là 2.78%).
   - Quét 12 ô phía trước quân cờ của Bot; tính toán tổn thất kỳ vọng:
     `E(Loss) = Tổng(Xác suất * Tiền thuê hoặc Tiền phạt)`.
   - Sinh ra đệm an toàn `safetyBuffer = E(Loss) * personalityMultiplier` (Aggressive x0.8, Balanced x1.2, Passive x1.6).
2. **Tầng 2: Định Giá Động Bất Động Sản (`valuation_engine.ts`)**:
   - Giá trị định giá BĐS không cố định mà biến thiên theo trạng thái trận đấu:
     `estimatedValue = basePrice * monopolyMultiplier * blockerMultiplier * liquidityPenalty * (1 + jitter)`.
   - Thưởng hoàn thành bộ màu (Monopoly): x2.8 đến x3.2.
   - Thưởng đòn chặn đối thủ (Blocker): x2.2 khi ngăn đối thủ có bộ màu.
   - Nhịp vòng đấu 30 vòng: Vòng đầu ưu tiên mua gom đất; vòng cuối phạt thanh khoản mỏng. Jitter ngẫu hứng ±12% triệt tiêu tính đoán trước.
3. **Tầng 3: Cứu Nợ Tuần Tự & Nâng Cấp Even-Building (`solvency_solver.ts`)**:
   - Xây nhà tự động trong `PropertyManagement` khi `balance >= buildCost + safetyBuffer`, tuân thủ nghiêm ngặt nguyên tắc Even-Building.
   - Cây quyết định cứu nợ 5 bước khi số dư âm tiền:
     * Bước 1: Hạ cấp nhà ở ô đất lẻ.
     * Bước 2: Thế chấp ô đất lẻ chưa xây có tiền thuê thấp nhất.
     * Bước 3: Hạ cấp nhà trong bộ màu theo Even-Downgrade.
     * Bước 4: Thế chấp ô đất trong bộ màu.
     * Bước 5: Phá sản bất khả kháng khi đã cạn kiệt tài sản.
4. **Tầng 4: Đấu Giá Chiến Thuật & Cược Sàn HOSE Thích Ứng (`bot_engine.ts`)**:
   - Đấu giá: Xác định trần giá `maxBid = Math.min(estimatedValue, balance - safetyBuffer * 0.5)`. Cho phép Bot Aggressive dọa giá đối thủ (Bluffing); chủ động Pass khi vượt trần.
   - Sàn HOSE: Co dãn theo dòng tiền nhàn rỗi `freeCash = balance - safetyBuffer`: từ 500 Tr. đến 3.000 Tr., hoặc bỏ qua khi `freeCash < 1.000 Tr.`
5. **Tầng 5: Thẩm Định Mô Phỏng Headless Chaos Monkey (`chaos_monkey_simulator.test.ts`)**:
   - Chạy 1.000 ván cờ mô phỏng 4 Bot AI đa tính cách trong môi trường in-memory 0ms.
   - Kiểm chứng 3 Bất Biến Vĩ Mô: Liveness (0.00% Deadlock), Cash Conservation (Rò rỉ Kho Bạc = 0 Tr. VNĐ), Finite Balances (Không NaN/Infinity).

---

## 3. HỆ QUẢ (CONSEQUENCES)

### Tích cực:
- Nâng tầm trí thông minh Bot AI ngang tầm game cờ tỷ phú thương mại quốc tế.
- Tỷ lệ giải cứu thoát hiểm phá sản đạt 94.68% (cứu thoát 8.119 vụ trong 8.575 sự cố).
- Triệt tiêu 100% hiện tượng kẹt lượt (0.00% Deadlock qua 114.069 lượt đi).
- Toàn bộ các tệp logic miền đều tuân thủ chặt chẽ giới hạn dòng mã Tier 1 (<= 400 LOC) và Tier 4 (<= 600 LOC).

### Tiêu cực / Đánh đổi:
- Khối lượng tính toán mỗi lượt đi của Bot tăng nhẹ (khoảng vài mili-giây trên Server); tuy nhiên hoàn toàn không ảnh hưởng tới hiệu năng mạng do chạy bất đồng bộ với nhịp trễ 800ms.

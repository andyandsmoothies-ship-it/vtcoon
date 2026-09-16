# KẾ HOẠCH CẢI TIẾN IMP-113 & IMP-114: TỐI ƯU THẺ HOÁN ĐỔI, ĐỘT PHÁ GIAO DỊCH P2P & XẢ QUỸ KHO BẠC

> **Mã cải tiến**: IMP-113 (Swap Card Fallback & Proactive P2P Bot Trading) & IMP-114 (Treasury Public Stimulus & Macro Fiscal Policy)  
> **Trọng tài phê duyệt**: Người dùng duyệt thực thi Gói 2 và Gói 3  
> **Mục tiêu**: Nâng cấp toàn diện cơ chế gameplay sau kết quả thực nghiệm 3.000 ván.

---

## 1. MỤC TIÊU & BỐI CẢNH (PROBLEM STATEMENT)

Sau 3.000 ván mô phỏng thực tế (1.000 ván x 3 kịch bản bàn 2, 3, 4 người):
1. **Thẻ Khí Vận `CC_SWAP_PROJECT` (Hoán đổi dự án C0)** có tỷ lệ No-Op cao từ 68% đến 73% do điều kiện cần cả người rút thẻ và đối thủ cùng sở hữu ô C0 không thỏa mãn trong giai đoạn giữa và cuối trận.
2. **Giao dịch P2P của Bot ở bàn 4 người**: Tỷ lệ hình thành bộ màu độc quyền giảm xuống 57.9% do đất đai bị phân tán cho 4 người. Bot Balanced chào mua hoàn thành bộ màu (Monopoly Gap) chỉ với giá 1.25x giá gốc, trong khi Bot Balanced người bán lại đòi hỏi >= 1.8x giá gốc, dẫn đến đàm phán P2P độc quyền hầu như luôn thất bại.
3. **Kho Bạc tích lũy khổng lồ không lối thoát**: Kho Bạc hút từ 12.372 Tr. VNĐ đến 18.915 Tr. VNĐ cuối trận mà không có cơ chế xả quỹ, khiến thanh khoản bị rút cạn và thiếu các cú lội ngược dòng cho người chơi yếu thế.

---

## 2. GIẢI PHÁP KỸ THUẬT (TECHNICAL DESIGN)

### A. Gói 2 (IMP-113): Tối Ưu Thẻ Hoán Đổi & Đột Phá Giao Dịch P2P Bot

1. **Thẻ `CC_SWAP_PROJECT` (Khí Vận)**:
   - *Luồng chính*: Người rút có C0 và đối thủ có C0 -> Hoán đổi 2 ô đất C0 như thiết kế gốc.
   - *Fallback A (Người rút có C0, đối thủ không có C0)*: Tự động nâng cấp miễn phí lên C1 cho 1 ô C0 của người rút (Trợ cấp hoàn thiện dự án).
   - *Fallback B (Đối thủ có C0, người rút không có C0)*:
     - Nếu người rút đủ tiền (>= 130% giá gốc): Cưỡng chế mua lại ô C0 đó với giá 130% thị trường và chuyển quyền sở hữu.
     - Nếu không đủ tiền: Nhận 800 Tr. VNĐ trợ cấp tái cấu trúc từ Kho Bạc (Treasury).
   - *Fallback C (Cả 2 đều không có C0)*: Nhận 1.000 Tr. VNĐ trợ cấp cơ cấu danh mục từ Kho Bạc.
   - *Bảo đảm*: 0% No-Op (100% các lần rút đều phát sinh dòng tiền hoặc quyền lợi tài sản).

2. **Đột Phá Giao Dịch P2P Bot (`src/domain/bot/bot_trade.ts`)**:
   - `calculateTradeOfferPrice`: Khi bot phát hiện Monopoly Gap từ vòng 6 trở đi:
     - Aggressive: 1.75x giá gốc.
     - Balanced: 1.55x giá gốc.
     - Passive: 1.35x giá gốc.
   - `evaluateBotTradeAcceptance`:
     - Bot Balanced chấp thuận bán ô đất đơn lẻ (không làm vỡ bộ màu của mình) khi đối thủ trả giá >= 1.5x giá gốc, hoặc khi số dư tiền mặt của mình dưới 2.000 Tr. VNĐ.
   - `findEligibleBotTrade`:
     - Từ vòng 10 trở đi, giảm cooldown đàm phán tạo bộ màu độc quyền từ 2 vòng xuống 1 vòng.

### B. Gói 3 (IMP-114): Cơ Chế Xả Quỹ Kho Bạc Kích Cầu Kinh Tế Vĩ Mô

1. **Module Độc Lập `src/domain/treasury_stimulus.ts`**:
   - Hàm `processTreasuryStimulus(room: Room): TreasuryStimulusResult | null`.
   - Ngưỡng kích hoạt: `room.treasury >= 10.000 Tr. VNĐ` khi chuyển vòng chơi mới (`next === 0` trong `turn_loop.ts`).
   - Mức giải ngân: Đúng 20% quỹ Kho Bạc hiện có (`disbursement = Math.floor(room.treasury * 0.20)`).
   - Đối tượng thụ hưởng: 1 hoặc 2 người chơi có tiền mặt thấp nhất (chưa phá sản), chia đều số tiền giải ngân.
   - Bất biến:
     `room.treasury_after = room.treasury_before - totalDistributed`.
     `room.treasury >= 0` luôn đúng.
     Bảo tồn 100% dòng tiền (Zero Treasury Leakage).

---

## 3. LỘ TRÌNH THỰC THI (3-STATION EXECUTION)

- **Trạm 1 (RED Contract Test)**:
  - `tests/domain/imp113_swap_project_and_p2p_trading.test.ts` (>= 18 atomic tests).
  - `tests/domain/imp114_treasury_public_stimulus.test.ts` (>= 15 atomic tests).
  - Chứng minh Business RED.
- **Trạm 2 (GREEN Implementation)**:
  - Tạo mới `src/domain/treasury_stimulus.ts`.
  - Cập nhật `src/domain/chance_card_handlers.ts`.
  - Cập nhật `src/domain/bot/bot_trade.ts`.
  - Cập nhật `src/server/turn_loop.ts`.
  - Toàn bộ test suites đạt 100% GREEN.
- **Trạm 3 (Physical Disk Review & Re-Benchmark)**:
  - Kiểm tra đĩa vật lý, module limits <= 400 LOC.
  - Chạy lại benchmark 3.000 ván, đối chiếu số liệu trước/sau.

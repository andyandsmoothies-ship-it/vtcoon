# KẾ HOẠCH CẢI TIẾN IMP-118: KHẮC PHỤC TÊ LIỆT ĐÀM PHÁN BOT P2P, TỐI ƯU CHUỘC ĐẤT ĐỘC QUYỀN, CẮT GIẢM TRỢ CẤP GO CUỐI TRẬN & HẠ SÀN ĐẤU GIÁ

> **Mã cải tiến**: IMP-118 (Bot P2P Trade Unfreeze, Monopoly-Focused Redeem, Late-Game GO Subsidy Taper & Auction Floor Optimization)  
> **Căn cứ quyết định**: Kiểm toán vi mô và mô phỏng 3.900 ván đấu phát hiện 6.607/6.607 đề xuất P2P Trade Bot bị từ chối 100%, kèm lạm phát 62.500 Tr./ván tiền lương GO và 25% đất vô chủ bàn 2P bị phát mãi  
> **Mục tiêu**: Kích hoạt đàm phán P2P thành công (~20%), tăng số bộ màu độc quyền từ 0.9 lên 3.6+ bộ/ván, gia tăng tỷ lệ knock-out phá sản tự nhiên từ 2% lên 8%+, giảm tỷ lệ phát mãi đấu giá bàn 2P xuống < 5%.

---

## 1. PHÂN TÍCH BLAST RADIUS & NGUY CƠ TÁC ĐỘNG (PRE-FLIGHT BLAST RADIUS AUDIT)

- **Mức độ rủi ro**: Slice-Bound (Ảnh hưởng logic đàm phán `bot_trade.ts`, context Server `room_manager.ts`, `room_property_coordinator.ts`, chuộc đất `bot_redeem.ts`, lương GO `room.ts`, `turn_loop.ts` và khởi điểm đấu giá `auction_manager.ts`).
- **Tác động trực tiếp**:
  1. `src/server/room_manager.ts`: Bổ sung `botPersonalities: this.botPersonalities` vào đối tượng trả về của `getContext(roomCode)`.
  2. `src/server/room_property_coordinator.ts`: Trong `coordTrade`, tra cứu đúng key `${ctx.room.roomCode}:${sellerId}` từ `botPersonalities`, fallback về `BotPersonality.Balanced` thay vì `Aggressive`.
  3. `src/domain/bot/bot_trade.ts`: Điều chỉnh ngưỡng chấp thuận `evaluateBotTradeAcceptance` cho Bot Aggressive (hạ từ 2.5x xuống 1.6x - 1.75x) và Bot Passive/Balanced tương thích với mức giá chào mua thực tế của Bot mua đất (1.35x - 1.75x).
  4. `src/domain/bot/bot_redeem.ts`: Bổ sung trọng số ưu tiên vượt trội (`priorityScore += 1000`) cho các ô đất thế chấp thuộc nhóm màu mà Bot đang nắm giữ hoặc giúp hoàn thiện bộ màu độc quyền.
  5. `src/domain/room.ts`: Bổ sung hàm tính lương GO theo thang vòng đấu `calculateGoSalary(roundCount)`. Vòng 1..20 = 2.000 Tr.; Vòng 21..30 = 1.500 Tr.; Vòng 31+ = 1.000 Tr. VNĐ.
  6. `src/server/turn_loop.ts` & `src/domain/property_manager.ts` & `src/client/offline_landing.ts`: Truyền `roundCount` vào logic nhận lương GO.
  7. `src/server/auction_manager.ts`: Đấu giá đất vô chủ khởi điểm ở 80% niêm yết (`Math.floor(listPrice * 0.80)`), phân biệt với đấu giá phát mãi nợ (70%).
- **Đối tượng tiêu thụ hạ tầng**:
  - `TurnOrchestrator`, `IntentDispatcher`, `BotEngine`, `SolvencySolver`, `AuctionModal`.
- **Phương án phòng thủ xấu nhất**:
  - Bảo toàn 100% 4.534 automated tests hiện có, không làm phát sinh rò rỉ Kho Bạc ($\Delta = 0$).
  - Mọi phép tính tiền tệ sử dụng `Math.floor` / `Math.round` đảm bảo số nguyên.

---

## 2. MA TRẬN YÊU CẦU KỸ THUẬT CHI TIẾT (TECHNICAL SPECIFICATION)

### Chốt 1: Khắc Phục Tê Liệt Đàm Phán Bot P2P (P0)
- Trong `src/server/room_manager.ts`: Cập nhật `getContext` trả về `{ room, reg, sm, botPersonalities: this.botPersonalities }`.
- Trong `src/server/room_property_coordinator.ts`:
  ```ts
  const botPers = ctx.botPersonalities?.get(`${ctx.room.roomCode}:${sellerId}`)
    ?? ctx.botPersonalities?.get(sellerId)
    ?? BotPersonality.Balanced;
  ```
- Trong `src/domain/bot/bot_trade.ts`:
  * Bot Aggressive: Chấp nhận bán khi `offerPrice >= Math.round(1.75 * basePrice)` hoặc khi `sellerBot.balance < 2000 && offerPrice >= Math.round(1.55 * basePrice)`.
  * Bot Balanced: Giữ nguyên ngưỡng `offerPrice >= Math.round(1.5 * basePrice)` (khớp với mức chào mua 1.55x ở V4+).
  * Bot Passive: Chấp nhận bán ô đất lẻ không thuộc màu của mình khi `offerPrice >= Math.round(1.35 * basePrice)` để tái cấu trúc vốn tiền mặt.

### Chốt 2: Tối Ưu Thứ Tự Chuộc Đất Thế Chấp Cho Bộ Màu Độc Quyền (P1)
- Trong `src/domain/bot/bot_redeem.ts`:
  * Phân tích các ô đang bị thế chấp (`mortgagedProperties`).
  * Nếu ô đất thế chấp nằm trong nhóm màu mà Bot đang sở hữu tất cả các ô còn lại, gán trọng số ưu tiên cao nhất (`priorityScore += 1000`).
  * Bot sẽ ưu tiên dồn tiền chuộc ô đất này trước bất kỳ ô đất lẻ nào khác.

### Chốt 3: Cắt Giảm Trợ Cấp Lương GO Cuối Trận (Late-Game Subsidy Taper) (P1)
- Trong `src/domain/room.ts`:
  ```ts
  export function calculateGoSalary(roundCount: number = 1): number {
    if (roundCount >= 31) return 1000;
    if (roundCount >= 21) return 1500;
    return 2000;
  }
  ```
- Đồng bộ hóa trong `turn_loop.ts`, `property_manager.ts`, `offline_landing.ts`.

### Chốt 4: Hạ Sàn Khởi Điểm Đấu Giá Đất Vô Chủ Xuống 80% (P2)
- Khi kích hoạt đấu giá từ chối mua (`handleDecline`), thiết lập `startingBid = Math.floor(listPrice * 0.8)`.
- Đấu giá cưỡng chế vỡ nợ (Insolvency Liquidation) vẫn giữ nguyên 70% theo SSOT.

---

## 3. LỘ TRÌNH THỰC THI 3 TRẠM (3-STATION PIPELINE)

1. **Trạm 1 (RED Contract Test - `qa-tester`)**:
   - Tạo `tests/contracts/imp118_bot_p2p_unfreeze_and_pacing.test.ts` (>= 18 atomic tests).
   - Chứng minh Business RED trên 4 chốt kỹ thuật.
   - FORBIDDEN sửa đổi `src/**`.
2. **Trạm 2 (GREEN Implementation - `implementer`)**:
   - Viết mã nguồn tối thiểu trong `src/**` chuyển xanh 100% tests.
   - Bảo toàn 226/226 suites (4.534+ tests PASS), 0 lỗi `tsc`, 0 lỗi `lint:ui`.
3. **Trạm 3 (Thẩm Định Độc Lập - `spec-reviewer` & `code-reviewer`)**:
   - Chạy kiểm nghiệm thực tế 3.900 ván và kiểm toán vi mô 100 ván.
   - Ghi nhận Gotcha #152 vào `docs/domain/gotchas.md`.
   - Lập báo cáo `IMP-118-report.md` và cập nhật `docs/master_roadmap.md`.

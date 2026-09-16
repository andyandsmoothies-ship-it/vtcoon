# [KẾ HOẠCH CẢI TIẾN IMP-82] Trí Tuệ Đàm Phán Bot P2P Tinh Tế, Nhịp Độ TopBar & Watchdog Đấu Giá

> **Mã số**: IMP-82  
> **Phân hệ**: `[BOT]`, `[UI]`, `[NET]`, `[TELEMETRY]`  
> **Mục tiêu**: Nâng cấp trí tuệ Bot AI đàm phán mua/đổi đất tinh tế như người chơi thật (giải quyết triệt để vấn đề không có nhà C1–C3 sau 29 vòng), hiển thị TopBar trực quan khi Bot đang tính toán, và triệt tiêu cảnh báo sai lệch `TURN_STALLED` khi phiên đấu giá kéo dài.

---

## 1. Bối Cảnh & Vấn Đề Gốc Rễ

### 1.1. Hiện trạng ván đấu 29 vòng không có nhà cao ốc (C1–C3)
- Tại ván đấu `VTCOON` (Vòng 29/30), 4 người chơi mua rải rác đất trên bàn cờ. Không ai sở hữu trọn vẹn bất kỳ nhóm màu nào (`hasMonopoly = false`).
- Theo luật VTCOON & Monopoly, người chơi chỉ được xây nhà khi sở hữu toàn bộ nhóm màu.
- Do các Bot hiện tại hoàn toàn **không có hành vi đàm phán mua/đổi đất (P2P Trade)**, cục diện đất đai bị phân mảnh vĩnh viễn suốt 29 vòng đấu, dẫn tới 0 ngôi nhà nào được xây dựng.

### 1.2. Đồng hồ TopBar gây ảo giác kẹt lượt
- Khi Bot thực hiện lượt đi qua Web Worker / Network Pacing, đồng hồ đếm ngược trên TopBar hiển thị số đỏ `00:00` nhấp nháy, gây hiểu lầm rằng ván đấu đã bị hết giờ hoặc đứng hình.

### 1.3. Cảnh báo Watchdog giả mạo khi đấu giá
- Phiên đấu giá tài sản có thể kéo dài qua nhiều lượt trả giá giữa người chơi và các bot (> 45s), khiến `watchdogMonitor.checkTurnStall` kích hoạt cảnh báo sai `TURN_STALLED`, hiển thị nút đỏ `Cảnh Báo (1)`.

---

## 2. Kiến Trúc & Sơ Đồ Khối Luồng Đàm Phán Bot Tinh Tế

```
[Phase: PropertyManagement]
           │
           ▼
[Có thể Nâng cấp BĐS?] ──(Có)──► [INTENT_UPGRADE]
           │ (Không)
           ▼
[Có thể Chuộc BĐS cầm cố?] ──(Có)──► [INTENT_REDEEM]
           │ (Không)
           ▼
[Kiểm tra Monopoly Gap (N-1 ô)] 
           │
     (Tìm thấy GapCell)
           ▼
[Tính toán Giá Mua & Đệm An Toàn] 
 (FreeCash >= SafetyBuffer + OfferPrice)
           │
           ▼
[Đánh giá Chấp thuận từ Người Bán (Bot / Human)]
   - Aggressive: Chặn độc quyền, chỉ bán nếu giá cực hời (>= 2.0x - 2.5x)
   - Balanced: Cân nhắc ROI & EV, bán ô lẻ nếu giá >= 1.25x - 1.4x
   - Passive: Cần tiền mặt, sẵn sàng bán nếu giá >= 1.1x - 1.25x
           │
           ├──(Chấp thuận)──► [INTENT_TRADE_OFFER] ──► [executeP2PTrade]
           │                                                 │
           └──(Từ chối)                                      ▼
                 │                                   [Thành lập Độc Quyền!]
                 ▼                                   (Lượt sau kích hoạt Xây Nhà C1-C3)
         [INTENT_END_TURN]
```

---

## 3. Đặc Tả Chi Tiết 4 Phân Hệ (Universal 4-Facet Matrix)

### Phân hệ 1: Nhận diện Mảnh Ghép Độc Quyền (Monopoly Gap Detection) & Định Giá Bất Đối Xứng
- **Thuật toán tìm Gap**: Quét toàn bộ 8 nhóm màu. Xác định nhóm màu mà Bot đang sở hữu $N-1$ ô (ví dụ: sở hữu 2/3 ô nhóm Cam/Đỏ/Vàng hoặc 1/2 ô Xanh Đậm).
- **Định vị Chủ sở hữu**: Ô còn thiếu (`gapCell`) phải thuộc quyền sở hữu của người chơi khác (chưa phá sản, ô không bị cầm cố, không có công trình).
- **Định giá theo tính cách của Bên Mua**:
  * `Aggressive`: Sẵn sàng trả cao ($1.3\times - 1.5\times$ giá gốc) để đoạt mảnh ghép chiến lược.
  * `Balanced`: Trả giá hợp lý ($1.15\times - 1.3\times$ giá gốc).
  * `Passive`: Trả giá vừa phải ($1.0\times - 1.15\times$ giá gốc).
- **Ràng buộc Đệm An Toàn (`safetyBuffer`)**: `bot.balance - offerPrice >= threat.safetyBuffer`. Không bao giờ tự đẩy mình vào nguy cơ phá sản chỉ để mua đất.

### Phân hệ 2: Trí Tuệ Thẩm Định Của Bên Bán (Seller Bot Acceptance & Kingmaking Defense)
- Khi nhận được đề xuất mua đất từ người chơi khác (Bot hoặc Human):
  * **Chặn độc quyền đối thủ**: Nếu bán ô đất này sẽ giúp người mua đạt độc quyền:
    - `Aggressive`: Từ chối tuyệt đối, trừ khi người mua trả giá cắt cổ ($\ge 2.5\times$ giá gốc) và bản thân đang thiếu tiền mặt trầm trọng.
    - `Balanced`: Từ chối nếu người mua đang dẫn đầu tài sản (chặn Kingmaking). Chấp thuận nếu giá hời ($\ge 1.8\times$ giá gốc) và bản thân có nhiều tài sản khác.
    - `Passive`: Chấp thuận nếu giá $\ge 1.4\times$ giá gốc và số dư hiện tại thấp hơn đệm an toàn.
  * **Thanh lý ô đất đơn lẻ (Orphan Tile)**: Nếu ô đất không nằm trong kế hoạch độc quyền của bản thân:
    - Bán để lấy vốn kinh doanh với giá từ $1.1\times - 1.35\times$ giá gốc.

### Phân hệ 3: Tích hợp Nhịp Độ (Pacing & Cooldown) & FSM PropertyManagement
- Cooldown: Mỗi Bot chỉ gửi tối đa 1 đề xuất đàm phán mỗi 2 vòng đấu (tránh spam giao dịch).
- Tích hợp vào `bot_engine.ts` tại `TurnPhase.PropertyManagement`: nếu không có nâng cấp/chuộc đất, kiểm tra đàm phán trước khi kết thúc lượt.
- Khi giao dịch thành công, thông báo được ghi nhận vào `activity_store` và hiển thị trên bảng tin.

### Phân hệ 4: Trải Nghiệm TopBar Khi Lượt Bot & Nới Trần Watchdog Đấu Giá
- **TopBar**: Khi `currentTurnPlayer.isBot === true`, hiển thị `🤖 Đang tính...` với màu chữ vàng hổ phách trung tính (`text-amber-700 font-semibold text-xs md:text-sm`), không nhấp nháy đỏ `00:00`.
- **Watchdog Monitor**: Trong `checkTurnStall`, nếu ván đấu đang trong phiên đấu giá (`isInAuction: true`), nâng giới hạn kẹt lượt lên 90.000ms (90 giây) và bỏ qua kiểm tra `timeRemaining <= -5`.

---

## 4. Kế Hoạch Triển Khai Theo Quy Trình 3 Trạm

- **Trạm 1 (RED Contract Test)**: `qa-tester` tạo `tests/contracts/imp82_bot_trading_and_pacing.test.ts` với 16 atomic tests bao quát 4 phân hệ. Chứng minh Inversion Gate (RED).
- **Trạm 2 (GREEN Implementation)**: `implementer` tạo `src/domain/bot/bot_trade.ts`, nối vào `src/domain/bot/bot_engine.ts`, `src/server/room_property_coordinator.ts`, cập nhật `top_bar.tsx` và `watchdog_monitor.ts`. Đưa 16 tests sang GREEN.
- **Trạm 3 (Physical Disk Review)**: `spec-reviewer` đối soát vật lý trên đĩa, kiểm tra LOC, verify test suites và ký duyệt SIGN-OFF.

---

## 5. Kế Hoạch Thẩm Định & Verification
- `npm run gate:quick`: 0 lỗi TypeScript, 0 lỗi UI lint, LOC <= 400 (Core) / <= 500 (UI).
- `npx vitest run tests/contracts/imp82_bot_trading_and_pacing.test.ts`: 16/16 PASS.
- `npm test`: 187/187 test suites PASS 100%.
- Cập nhật Gotcha #109/#110 vào `docs/domain/gotchas.md`.

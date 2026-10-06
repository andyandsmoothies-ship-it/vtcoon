# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION) — REVISION 2
# TICKET: IMP-277A — Nâng Giá Mua Hai Ô Tiện Ích EVN & Viettel Từ 1.500 Lên 2.000 Tr. VNĐ

> **Mã Nhiệm Vụ:** IMP-277A (Micro-Slice Thuần Domain SSOT Nâng Giá Tiện Ích)  
> **Phân hệ mục tiêu:** `domain-core`  
> **Phân loại rủi ro:** Tier 2 Micro-Slice (Lean Plan Specification, <= 220 lines, Delta <= 5 LOC, 1 file in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 10 atomic tests, >= 8 mutants killed, Pure Logic Waiver = `true` (Không thay đổi layout DOM trong phân hệ này)

---

## 0. KHẢO SÁT BỀ MẶT MÃ NGUỒN & ĐIỂM BẮT ĐẦU (SURFACE INVENTORY & LOC BASELINE)

### 0.1 Danh Sách Tệp Mục Tiêu & Dòng Mã Thực Tế Trên Đĩa
* **Target physical file**: `src/domain/property_data.ts` (97 lines, Tier 1 limit: 400 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp277a_utility_price_2000.test.ts` (New file to be created in Station 1/2) — **Safe**.
* **Target physical file**: `tests/domain/valuation_engine.test.ts` (285 lines, Living test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts` (482 lines, Living test limit: 600 lines) — **Safe**.
* **Target physical file**: `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts` (325 lines, Living test limit: 600 lines) — **Safe**.

### 0.2 Bảng Thống Kê Delta LOC Dự Kiến
| File | Current LOC | Expected LOC | Delta LOC | Status |
| :--- | :---: | :---: | :---: | :---: |
| `src/domain/property_data.ts` | 97 | 97 | 0 (Modify 2 lines) | Safe |
| `tests/contracts/imp277a_utility_price_2000.test.ts` | 0 | ~170 | +170 lines | Safe |
| `tests/domain/valuation_engine.test.ts` | 285 | 285 | 0 (Modify 3 lines) | Safe |
| `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts` | 482 | 482 | 0 (Modify 10 lines) | Safe |
| `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts` | 325 | 325 | 0 (Modify 2 lines) | Safe |
| **Tổng Delta Production (`src/**`)** | — | — | **0 net LOC** (<= 50 LOC) | **Pass Micro-Slice** |

### 0.3 Phân Định Phạm Vi & Ranh Giới Phân Hệ (Scope Conservation Mandate)
1. [`src/domain/property_data.ts#L39-L40`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/domain/property_data.ts#L39-L40) — **MODIFY (Target 1)**: Nâng `price: 1500` lên `price: 2000` cho ô 12 (EVN) và ô 28 (Viettel). Giữ nguyên `rent0: 1000`.
2. [`tests/domain/valuation_engine.test.ts#L267-L269`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/domain/valuation_engine.test.ts#L267-L269) — **MODIFY**: Cập nhật `basePrice` thành 2000 và `estimatedValue` thành 2800 (pacing 1.4x).
3. [`tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts) — **MODIFY (Vá toàn diện cả 2 vị trí)**:
   - Dòng 195–208 (TC-227.07): Cập nhật giá sàn phát mãi 70% từ 1050 lên 1400 ($2000 \times 0.70$).
   - Dòng 294–310 (TC-227.11): Cập nhật `AuctionModal` hiển thị Giá gốc `2.000` và Giá khởi điểm `1.000`.
4. [`tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts#L130-L131`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts#L130-L131) — **MODIFY**: Cập nhật tỷ lệ cán cân đàm phán thành `Bạn đưa: 60%` và `Đối tác: 40%`.
5. **Đồng bộ nhãn sa bàn 3D (Phân hệ `client-3d`) — Cam kết Chained-Slices**:
   - `src/client/3d/tile_texture_data.ts#L42,L60` (`price: 1500` -> `2000`).
   - *Quy chuẩn phân lập Subsystem Boundary*: IMP-277A và IMP-277B là **cặp vé song hành liên hoàn (Chained-Slices)**. Sau khi IMP-277A hoàn tất, tiến hành ngay IMP-277B, cấm release riêng rẽ tránh lệch pha:  
     👉 **`[DEFERRED TO TICKET-IMP-277B: Đồng Bộ Nhãn Giá 2.000 Trên Sa Bàn 3D tile_texture_data.ts Theo Subsystem Boundary Mandate]`**.
6. **Tệp điều chỉnh tiền đề UI TopBar từ lượt trước (Bảo toàn môi trường làm việc)**:
   - `src/client/ui/market_event_ticker.tsx`
   - `src/client/ui/top_bar.tsx`
   - `tests/contracts/imp237_mobile_viewport_harmonics.test.ts`
   - `tests/contracts/imp267_active_market_event_carousel.test.ts`

---

## 1. BẢN THIẾT KẾ KIẾN TRÚC & BẤT BIẾN NGHIỆP VỤ (ARCHITECTURAL INVARIANTS)

### 1.1 Cơ Chế Nghiệp Vụ Nâng Giá Tiện Ích
* **Bối cảnh**: Hai ô Tiện ích (Ô 12: EVN Điện Lực & Ô 28: Viettel 5G) có ROI thu hồi vốn lên tới 66.7% chỉ sau 1 lần dẫm ở mức giá 1.500 Tr. Nâng giá mua niêm yết lên **2.000 Tr. VNĐ** giúp đưa ROI về 50%, đồng bộ ngưỡng vốn với Đường Sắt (2.000 Tr.) và giữ tổng chi phí thâu tóm + nâng cấp 2 ô ở mức 6.000 Tr. VNĐ (vừa vặn trong biên an toàn vốn đầu game).

### 1.2 Bất Biến Miền (Domain Invariants)
* **Bất biến 1 (Utility Base Price SSOT)**: Nguồn thẩm quyền `PROPERTY_DEEDS.get(12)?.price` và `PROPERTY_DEEDS.get(28)?.price` trả về chính xác 2.000 Tr. VNĐ.
* **Bất biến 2 (Mortgage Loan Cascade)**: Hạn mức vay thế chấp tự động tính theo tỷ lệ 50%: `Math.floor(price * 0.5) = 1.000` Tr. VNĐ.
* **Bất biến 3 (Starting Bid Auction Cascade)**: Giá khởi điểm sàn đấu giá tự động tính theo tỷ lệ 50%: `Math.floor(price * 0.5) = 1.000` Tr. VNĐ.
* **Bất biến 4 (Foreclosure Treasury Sàn 70%)**: Giá phát mãi cưỡng chế Kho Bạc khi toàn bộ người chơi bỏ lượt tự động tính theo tỷ lệ 70%: `Math.floor(price * 0.70) = 1.400` Tr. VNĐ.
* **Bất biến 5 (Utility Rent Invariance)**: Biểu cước cơ sở `rent0` giữ nguyên 1.000 Tr. VNĐ, bảo toàn 100% quy tắc kinh tế tại IMP-214.
* **Bất biến 6 (Bot Valuation Cascade)**: Thuật toán định giá Bot AI (`evaluateTileValuation`) tự động ghi nhận `basePrice = 2000`, giá trị ước tính vòng 1 (hệ số 1.4) đạt 2.800 Tr. VNĐ.
* **Bất biến 7 (P2P Floor Boundary)**: Sàn giao dịch P2P đất sạch áp dụng mức sàn 70% giá gốc: $2.000 \times 0.70 = 1.400$ Tr. VNĐ. Mọi đề xuất dưới 1.400 Tr. đều bị từ chối với lý do `PRICE_BELOW_FLOOR`.
* **Bất biến 8 (Redemption Conservation)**: Giải chấp ô tiện ích thu hồi nợ gốc 1.000 Tr. và phí phạt 10% (100 Tr.), tổng trừ 1.100 Tr. của người chơi và nộp đúng 100 Tr. vào Kho Bạc (`Treasury`).

---

## 2. NHIỆM VỤ THỰC THI CHI TIẾT (EXACT IMPLEMENTATION TASKS)

### Task 1: Cập Nhật Bảng Giá Niêm Yết Tiện Ích Trong `property_data.ts`
* **Target physical file**: `src/domain/property_data.ts`
* **Mô tả**: Tăng giá mua ô 12 và 28 từ 1500 lên 2000 Tr. VNĐ.

```typescript
<<<<
  // Utility — phí phẳng cố định (IMP-214)
  [12, { price: 1500, rent0: 1000 }],
  [28, { price: 1500, rent0: 1000 }],
====
  // Utility — phí phẳng cố định (IMP-214, nâng giá IMP-277A)
  [12, { price: 2000, rent0: 1000 }],
  [28, { price: 2000, rent0: 1000 }],
>>>>
```

### Task 2: Điều Chỉnh Kỳ Vọng Fixture Trong `tests/domain/valuation_engine.test.ts`
* **Target physical file**: `tests/domain/valuation_engine.test.ts`
* **Mô tả**: Cập nhật `basePrice` thành 2000 và `estimatedValue` thành 2800.

```typescript
<<<<
      // Dien Luc EVN (o 12, gia 1500) o vong 1: 1500 * 1.4 = 2100
      const utilVal = evaluateTileValuation(12, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(utilVal.basePrice).toBe(1500);
      expect(utilVal.estimatedValue).toBe(2100);
====
      // Dien Luc EVN (o 12, gia 2000) o vong 1: 2000 * 1.4 = 2800
      const utilVal = evaluateTileValuation(12, bot, room, registry, stateMap, BotPersonality.Balanced, 0);
      expect(utilVal.basePrice).toBe(2000);
      expect(utilVal.estimatedValue).toBe(2800);
>>>>
```

### Task 3a: Điều Chỉnh Giá Sàn Phát Mãi TC-227.07 Trong `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Target physical file**: `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Mô tả**: Cập nhật giá sàn phát mãi 70% từ 1050 lên 1400 cho ô 12.

```typescript
<<<<
      // Giá sàn phát mãi 70% của 1500 là 1050
      const calls = infoSpy.mock.calls
        .map((c) => {
          try {
            return JSON.parse(String(c[0])) as { event?: string; delta?: { foreclosureRate?: number; foreclosurePrice?: number } };
          } catch {
            return null;
          }
        })
        .filter((c) => c?.event === 'AUCTION_FORECLOSED');

      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0]?.delta?.foreclosureRate).toBe(0.70);
      expect(calls[0]?.delta?.foreclosurePrice).toBe(1050);
====
      // Giá sàn phát mãi 70% của 2000 là 1400
      const calls = infoSpy.mock.calls
        .map((c) => {
          try {
            return JSON.parse(String(c[0])) as { event?: string; delta?: { foreclosureRate?: number; foreclosurePrice?: number } };
          } catch {
            return null;
          }
        })
        .filter((c) => c?.event === 'AUCTION_FORECLOSED');

      expect(calls.length).toBeGreaterThanOrEqual(1);
      expect(calls[0]?.delta?.foreclosureRate).toBe(0.70);
      expect(calls[0]?.delta?.foreclosurePrice).toBe(1400);
>>>>
```

### Task 3b: Điều Chỉnh Mức Bid TC-227.09 Trong `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Target physical file**: `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Mô tả**: Khi ô 12 có startingBid là 1000, nâng bid của bot_4 từ 800 lên 1100.

```typescript
<<<<
      // bot_4 là người cuối cùng chưa pass, đặt giá hợp lệ
      mgr.handleAuctionBid(room.roomCode, 'bot_4', 800);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.winnerId).toBe('bot_4');
      expect(lastRes?.winningBid).toBe(800);
====
      // bot_4 là người cuối cùng chưa pass, đặt giá hợp lệ (>= startingBid 1000)
      mgr.handleAuctionBid(room.roomCode, 'bot_4', 1100);

      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      const lastRes = mgr.getLastAuctionResult(room.roomCode);
      expect(lastRes?.winnerId).toBe('bot_4');
      expect(lastRes?.winningBid).toBe(1100);
>>>>
```

### Task 3c: Điều Chỉnh Hiển Thị AuctionModal TC-227.11 Trong `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Target physical file**: `tests/contracts/imp227_auction_solo_deadlock_and_label_semantics.test.ts`
* **Mô tả**: Cập nhật Giá gốc 2.000 và Giá khởi điểm 1.000 cho ô 12.

```typescript
<<<<
    it('[TC-227.11/MSS][UC-IMP227] AuctionModal Hero Header: Render đồng thời cả Giá gốc: 1.500 Tr. và Giá khởi điểm: 750 Tr., không mâu thuẫn ngữ nghĩa với giá thầu hiện tại', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 12, // EVN, basePrice = 1500
          currentBid: 1250,
          startingBid: 750,
          highestBidderId: 'player_1',
          timeRemaining: 15,
        })
      );

      // Phải có cả Giá gốc và Giá khởi điểm, giá khởi điểm là 750 (50% của 1500)
      expect(html).toContain('Giá gốc:');
      expect(html).toContain('1.500');
      expect(html).toContain('Giá khởi điểm:');
      expect(html).toContain('750');
    });
====
    it('[TC-227.11/MSS][UC-IMP227] AuctionModal Hero Header: Render đồng thời cả Giá gốc: 2.000 Tr. và Giá khởi điểm: 1.000 Tr., không mâu thuẫn ngữ nghĩa với giá thầu hiện tại', () => {
      const html = renderToStaticMarkup(
        React.createElement(AuctionModal, {
          cellIndex: 12, // EVN, basePrice = 2000
          currentBid: 1250,
          startingBid: 1000,
          highestBidderId: 'player_1',
          timeRemaining: 15,
        })
      );

      // Phải có cả Giá gốc và Giá khởi điểm, giá khởi điểm là 1000 (50% của 2000)
      expect(html).toContain('Giá gốc:');
      expect(html).toContain('2.000');
      expect(html).toContain('Giá khởi điểm:');
      expect(html).toContain('1.000');
    });
>>>>
```

### Task 4: Điều Chỉnh Kỳ Vọng Fixture Trong `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`
* **Target physical file**: `tests/client/imp202_trade_modal_ergonomics_overhaul.test.ts`
* **Mô tả**: Khi ô 12 giá 2000, tỷ lệ phân chia Bạn đưa 3000 / Đối tác 2000 đổi thành 60% / 40%.

```typescript
<<<<
      expect(html).toContain('Bạn đưa: 67%');
      expect(html).toContain('Đối tác: 33%');
====
      expect(html).toContain('Bạn đưa: 60%');
      expect(html).toContain('Đối tác: 40%');
>>>>
```

---

## 3. THIẾT KẾ KIỂM THỬ HỢP ĐỒNG (STATION 1 CONTRACT TEST SPECIFICATIONS)
* **Target physical file**: `tests/contracts/imp277a_utility_price_2000.test.ts` (New file to be created in Station 1/2)

* TC-277A.01 [UC-IMP277A/MSS]: Given ô 12 EVN và ô 28 Viettel trong PROPERTY_DEEDS, When tra cứu price, Then cả 2 ô đều trả về giá niêm yết chính xác bằng 2000.
* TC-277A.02 [UC-IMP277A/MSS]: Given ô 12 EVN và ô 28 Viettel trong PROPERTY_DEEDS, When tra cứu rent0, Then cả 2 ô đều bảo toàn cước cơ sở chính xác bằng 1000.
* TC-277A.03 [UC-IMP277A/MSS]: Given ô 12 chưa thế chấp thuộc quyền sở hữu người chơi, When gọi mortgageProperty, Then số dư người chơi tăng chính xác 1000 và khoản nợ thế chấp ghi nhận 1000.
* TC-277A.04 [UC-IMP277A/MSS]: Given ô 28 chưa thế chấp thuộc quyền sở hữu người chơi, When gọi mortgageProperty, Then số dư người chơi tăng chính xác 1000 và khoản nợ thế chấp ghi nhận 1000.
* TC-277A.05 [UC-IMP277A/MSS]: Given người chơi từ chối mua ô 12 mở phiên đấu giá, When gọi handleDecline, Then startingBid của phiên đấu giá ghi nhận chính xác 1000.
* TC-277A.06 [UC-IMP277A/MSS]: Given người chơi từ chối mua ô 28 mở phiên đấu giá, When gọi handleDecline, Then startingBid của phiên đấu giá ghi nhận chính xác 1000.
* TC-277A.07 [UC-IMP277A/MSS]: Given bot AI thẩm định ô 12 ở vòng 1, When gọi evaluateTileValuation, Then kết quả trả về basePrice = 2000 và estimatedValue = 2800.
* TC-277A.08 [UC-IMP277A/A1]: Given người chơi dừng chân tại ô 12 có balance = 1999, When gọi handleBuyProperty, Then kết quả trả về result bằng INSUFFICIENT_FUNDS.
* TC-277A.09 [UC-IMP277A/A2]: Given ô 12 đất sạch chào bán P2P giá 1399 dưới sàn 70% của 2000, When gọi validateP2PTrade, Then trả về valid false kèm reason bằng PRICE_BELOW_FLOOR.
* TC-277A.10 [UC-IMP277A/MSS]: Given ô 12 đang thế chấp với nợ gốc 1000 và balance đủ 1100, When gọi redeemProperty, Then balance trừ đúng 1100 và Kho Bạc tăng đúng 100 tiền lãi.

---

## 4. QUY TRÌNH CHỐT CHẶN CƠ HỌC & NGHIỆM THU
1. **Kiểm tra Plan tự động**: `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_277A_UTILITY_PRICE_2000.md --auto-sign`
2. **Cổng Human Gate**: User duyệt "đồng ý".
3. **Trạm 1 (RED)**: Tạo `tests/contracts/imp277a_utility_price_2000.test.ts` chứng minh fail vì runtime assertions (giá hiện tại là 1500).
4. **Trạm 2 (GREEN)**: Thực hiện Task 1, 2, 3a, 3b, 4 làm xanh 100% tests.
5. **Chốt chặn Fast Pre-Filter & Scope**:
   - `npm run prefilter -- src/domain/property_data.ts`
   - `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_277A_UTILITY_PRICE_2000.md`
6. **Kiểm toán bằng chứng & Bàn giao**.

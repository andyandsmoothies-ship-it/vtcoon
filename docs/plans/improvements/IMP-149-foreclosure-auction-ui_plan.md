# Kế Hoạch IMP-149 (Phiên Bản Nâng Cấp V3): Đại Tu Nhận Diện Đấu Giá Phát Mãi Cưỡng Chế 70% & Radar Bắt Đáy Nợ Xấu (Foreclosure Auction UI & Distressed Asset Radar)

> **Mục tiêu:** Vá triệt để toàn bộ 4 điểm mù thiết kế ban đầu và 4 điểm phản biện kỹ thuật sâu sắc, bảo đảm trải nghiệm đấu giá phát mãi nợ xấu chuẩn mực, không vỡ layout mobile, và bảo đảm tính toàn vẹn dữ liệu từ Server tới Client.  
> **Căn cứ phản biện đĩa cứng:**  
> 1. *Điểm mù Server State:* `insolvency_manager.ts` và `turn_loop.ts` quên lưu `startingBid` vào `auctions.set()`.  
> 2. *Rủi ro Layout Mobile:* Bổ sung badge vào header `AuctionDistrictCard` có nguy cơ vỡ layout trên màn hình hẹp 360px.  
> 3. *Thông điệp Gõ Búa:* Bổ sung thông điệp cá nhân hóa khi người xem chính là Con Nợ được giải cứu.  
> 4. *Độ tin cậy Giá Sàn:* Phòng chống triệt để tình trạng lệch giá gốc khi `deed.price` chưa nạp kịp.

---

## 1. Thiết Kế Kỹ Thuật Chi Tiết (Technical Specifications V3)

### 1.1. Chuẩn Hóa Server State & DTO WebSocket
1. **Tại `src/server/insolvency_manager.ts#L75-L82`:**
   - Bổ sung `startingBid` vào object `auctions.set(roomCode, { ... })`:
   ```typescript
   auctions.set(roomCode, {
     cellIndex,
     declinedPlayerId: playerId,
     highestBid: startingBid,
     startingBid, // [IMP-149] Bắt buộc lưu để session_manager đọc được
     passedPlayers: new Set<string>(),
     insolvencyPlayerId: playerId,
   });
   ```
2. **Tại `src/server/turn_loop.ts#L73-L79` (Đấu giá thu hồi đất unbuilt 50%):**
   - Bổ sung `startingBid` vào `auctions.set(roomCode, { ... })`:
   ```typescript
   auctions.set(roomCode, {
     cellIndex,
     declinedPlayerId: '',
     highestBid: startingBid,
     startingBid, // [IMP-149] Lưu giá sàn 50%
     passedPlayers: new Set<string>(),
   });
   ```
3. **Tại `src/server/session_manager.ts`:**
   - Mở rộng `AuctionPayload`:
   ```typescript
   export interface AuctionPayload {
     readonly cellIndex: number;
     readonly currentBid: number;
     readonly highestBidderId: string | null;
     readonly timeRemaining: number;
     readonly startingBid?: number;
     readonly declinedPlayerId?: string;
     readonly hasPassed?: boolean;
     readonly insolvencyPlayerId?: string;
     readonly isForeclosure?: boolean;
   }
   ```
   - Trong `buildDeltaFromRoom`: Chuyển tiếp `session.startingBid` xuống delta payload.

### 1.2. Mở Rộng Client Store Type
Tại `src/client/store/game_store_types.ts`:
- Bổ sung `startingBid?: number;` vào `ModalPayloadMap['auction']`.

### 1.3. Đại Tu Giao Diện & Bảo Vệ Layout Mobile
1. **Bảo vệ Layout Header Mobile tại `AuctionDistrictCard` (`src/client/ui/modals/auction_district_card.tsx`):**
   - Nhận prop `isForeclosure?: boolean`.
   - Để **không làm vỡ dòng header 360px**, badge bắt đáy `-30%` được tích hợp công thái học:
     - Nếu đã có badge chiến lược (ví dụ: `👑 CƠ HỘI ĐỘC QUYỀN`), gắn kèm tag phụ `(-30%)` hoặc hiển thị badge bắt đáy với kích thước thu gọn `text-[8px] px-1 py-0.5 shrink-0 bg-rose-100 text-rose-900 border border-rose-400`.
     - Đặt giới hạn `max-w` và `truncate` chuẩn xác, đảm bảo không bao giờ đẩy chip `X/Y Ô CỦA BẠN` xuống hàng thứ 3.
2. **Cá nhân hóa thông điệp gõ búa tại `AuctionModal` (`src/client/ui/modals/auction_modal.tsx`):**
   - Khi kết thúc phiên phát mãi (`isConcluded && isForeclosure`):
     - Nếu người xem chính là con nợ (`myId && insolvencyPlayerId === myId`):
       `"{displayName} đã trúng đấu giá giải cứu {tên_ô} với giá {finalPrice}. Khoản tiền này đã được cấn trừ vào nợ của bạn!"`
     - Nếu người xem là đối thủ:
       `"{displayName} đã trúng đấu giá giải cứu {tên_ô} với giá {finalPrice}!"`
3. **Thông điệp đúng ngữ cảnh khi con nợ bị cấm đấu giá:**
   - Khi `isDeclinedPlayer && isForeclosure`:
     `"Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình."`
   - Khi `isDeclinedPlayer && !isForeclosure`:
     `"Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá..."`
4. **Banner giải cứu nợ hiển thị tên con nợ:**
   - Tra cứu tên con nợ từ `playersInfo[insolvencyPlayerId]`.
   - Header: `TÀI SẢN PHÁT MẠI THANH LÝ NỢ {debtorName ? `• ${debtorName}` : ''}`.
   - Nội dung banner:
     - Con nợ xem: `"Đang phát mãi giá sàn 70% để thu hồi vốn trả nợ cho bạn. Tiền thặng dư (nếu có) sẽ được hoàn trả."`
     - Đối thủ xem: `"Khởi điểm chỉ 70% giá niêm yết (giải cứu nợ cho ${debtorName}). Cơ hội bắt đáy sinh lời!"`
5. **Hiển thị giá sàn chống trễ dữ liệu deed:**
   - Tính toán chặt chẽ:
     ```typescript
     const basePrice = deed?.price ?? (startingBid ? Math.round(startingBid / 0.70) : currentBid);
     const floorPrice = startingBid ?? Math.floor(basePrice * 0.70);
     ```
   - Hiển thị: `Giá gốc: ~{formatCurrency(basePrice)}~ ➔ Giá sàn: {formatCurrency(floorPrice)} (-30%)`.

---

## 2. Danh Sách Tệp Triển Khai Kỹ Thuật (Proposed Changes)

#### [MODIFY] [insolvency_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/insolvency_manager.ts)
- Bổ sung `startingBid` vào `auctions.set()` tại dòng 75-81.

#### [MODIFY] [turn_loop.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/turn_loop.ts)
- Bổ sung `startingBid` vào `auctions.set()` tại dòng 73-78.

#### [MODIFY] [session_manager.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/server/session_manager.ts)
- Bổ sung `startingBid?: number;` vào `AuctionPayload` và `buildDeltaFromRoom`.

#### [MODIFY] [game_store_types.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/store/game_store_types.ts)
- Bổ sung `startingBid?: number;` vào `ModalPayloadMap['auction']`.

#### [MODIFY] [auction_district_card.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_district_card.tsx)
- Bổ sung `isForeclosure?: boolean` vào props.
- Tích hợp nhãn bắt đáy `-30%` chống vỡ layout mobile (360px).

#### [MODIFY] [auction_modal.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/auction_modal.tsx)
- Bổ sung `startingBid?: number` vào props.
- Sửa thông điệp con nợ, banner có tên con nợ, thông điệp gõ búa cá nhân hóa cho con nợ, truyền `isForeclosure` cho radar, và hiển thị giá sàn chuẩn xác.

#### [MODIFY] [modal_host.tsx](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/modals/modal_host.tsx)
- Chuyển tiếp `startingBid` từ `modalPayload` vào `AuctionModal`.

#### [MODIFY] [imp149_foreclosure_auction_ui.test.ts](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/imp149_foreclosure_auction_ui.test.ts)
- Mở rộng bộ kiểm thử hợp đồng bao phủ toàn bộ 4 cải tiến mới.

---

## 3. Kế Hoạch Nghiệm Thu (Verification Plan)

### Automated Tests
1. `npx vitest run tests/client/imp149_foreclosure_auction_ui.test.ts` ➔ 100% PASS.
2. `npx vitest run tests/client/auction_modal.test.ts tests/server/foreclosure_auction_all_pass.test.ts tests/server/audit_insolvency.test.ts` ➔ 100% PASS.
3. `npm run lint:ui` ➔ 0 vi phạm (đặc biệt không vi phạm rule responsive và token styling).
4. `npm run lint:slop` ➔ 0 vi phạm.
5. `npx tsc --noEmit` ➔ 0 lỗi type.

### Manual Verification
- Kiểm tra render trên viewport mobile 360px: Đảm bảo header `AuctionDistrictCard` không bị gãy 3 dòng.
- Kiểm tra hiển thị góc nhìn con nợ: Thông báo cưỡng chế nợ đúng và thông điệp gõ búa cấn trừ nợ chính xác.

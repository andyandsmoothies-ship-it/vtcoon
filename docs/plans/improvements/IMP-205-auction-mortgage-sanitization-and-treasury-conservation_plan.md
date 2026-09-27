# [PLAN] IMP-205: Làm Sạch Thế Chấp Khi Đấu Giá & Bảo Toàn Kho Bạc Bất Biến (Auction Mortgage Sanitization & Treasury Conservation)

> **Mã Ticket**: IMP-205  
> **Phân loại**: Tier 2 (Full Rigor - Server FSM, Auction Lifecycle, Treasury Invariant & Client Property Tracker)  
> **Trạng thái thẩm định**: HARDENED_APPROVED (Đã tiếp thu và khắc phục 100% khuyến nghị từ `plan-griller`)  
> **Mục tiêu**: 
> 1. Triệt tiêu vòng lặp vô tận thu hồi & đấu giá đất dự án treo (`CC_SLOW_BUILD`): sau khi đất bị thu hồi hoặc trúng đấu giá, trường `unbuiltRounds` phải bị xóa bỏ (`delete unbuiltRounds` -> `undefined`) thay vì reset về `0`. Thêm `break;` chống đè session và bổ sung `endTime`, `currentBid`.
> 2. Bàn giao BĐS sạch (Clean Title) khi trúng đấu giá: Đất phát mãi, thu hồi, hoặc đấu giá từ chối mua khi có người trúng phải được giải trừ thế chấp nguyên tử (`isMortgaged = false`, dọn dẹp `mortgagedProperties` và `mortgageLoans` của cựu chủ sở hữu) trong phạm vi phòng chơi chuẩn xác (`stateMap` từ `RoomManager`, triệt tiêu `knownStateMaps` đa phòng).
> 3. Bảo toàn quỹ Kho Bạc (Treasury Conservation): Tiền trúng đấu giá đất công/thu hồi/từ chối mua bắt buộc phải nộp vào Kho Bạc (`room.treasury += winningBid`). Trường hợp phát mãi BĐS thế chấp của con nợ, Kho Bạc được ưu tiên thu hồi nợ gốc trước (`treasuryPayoff = Math.min(winningBid, loan)`), phần thặng dư mới hoàn trả cho con nợ.
> 4. Chặn log giả lập thế chấp/chuộc đất trên Client: `detectCellMortgage` xác định `ownerId` hợp lệ, bỏ qua giải chấp ma khi ô đất vô chủ hoặc đổi chủ qua đấu giá (`isOwnerChanged`).

---

### I. CÁC TỆP MỤC TIÊU & NGÂN SÁCH LOC (Physical File Baseline)

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Delta | Dự Kiến Sau Sửa | Ngưỡng Cho Phép |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `src/server/turn_loop.ts` | Tier 1 (Domain/Server/Logic) | **288** | +12 | **300** | <= 400 (Ceiling: 550) |
| `src/server/auction_manager.ts` | Tier 1 (Domain/Server/Logic) | **244** | +30 | **274** | <= 400 (Ceiling: 550) |
| `src/server/room_manager.ts` | Tier 1 (Domain/Server/Logic) | **532** | 0 | **532** | Zero-Delta Seam (Truyền stateMap vào bid, pass, close) |
| `src/client/network/activity_property_tracker.ts` | Tier 1 (Client Tracker) | **237** | +4 | **241** | <= 400 (Ceiling: 550) |
| `tests/contracts/imp205_auction_mortgage_sanitization_and_treasury_conservation.test.ts` | Test Suite | 0 (Mới) | +420 | **420** | <= 600 |

---

### II. KIẾN TRÚC VÒNG ĐỜI DỮ LIỆU & BẢO TOÀN TÀI CHÍNH (Data Architecture)

```
[CC_SLOW_BUILD kích hoạt trên ô C0]
          │
          ▼ (unbuiltRounds = 1)
[Vòng 1 & 2: Chưa nâng cấp -> unbuiltRounds tăng 1 -> 2 -> 3]
          │
          ▼
[Vòng 3: processUnbuiltRounds thu hồi ô đất]
  1. registry.delete(cellIndex) (Về sở hữu Nhà nước/Kho Bạc)
  2. Dọn dẹp cựu chủ sở hữu:
     - current.mortgagedProperties lọc bỏ cellIndex
     - delete current.mortgageLoans[cellIndex]
  3. stateMap:
     - isMortgaged = false
     - delete unbuiltRounds (KHÔNG reset về 0!)
  4. Mở AuctionSession:
     - startingBid = 50%, highestBid = startingBid, currentBid = startingBid
     - endTime = Date.now() + 20_000
     - break; (Chống đè session nếu có nhiều ô cùng hạn)
          │
          ▼
[Sàn đấu giá diễn ra: Người chơi trả giá (VD: 1.700 Tr)]
          │
          ▼
[handleAuctionClose: Búa gõ kết thúc phiên (Nhận stateMap của phòng)]
  1. winner.balance -= winningBid (-1.700 Tr)
  2. registry.set(cellIndex, winner.id)
  3. Bàn giao sạch trong phạm vi phòng (Sanitize Property State):
     - stateMap.get(cellIndex): isMortgaged = false, delete unbuiltRounds
     - Quét toàn bộ players trong phòng: xóa sạch cellIndex khỏi mortgagedProperties
  4. Bảo toàn Kho Bạc (Treasury Conservation):
     - Nếu session.insolvencyPlayerId:
       * outstandingLoan = insolventPlayer.mortgageLoans?.[cellIndex] ?? 0
       * delete insolventPlayer.mortgageLoans[cellIndex]
       * loanPayoff = Math.min(winningBid, outstandingLoan)
       * room.treasury += loanPayoff (Ưu tiên thu nợ gốc)
       * insolventPlayer.balance += (winningBid - loanPayoff) (Hoàn trả thặng dư)
     - Nếu KHÔNG CÓ insolvencyPlayerId (đất từ chối mua, đất thu hồi, đất fire sale):
       * room.treasury += winningBid (+1.700 Tr)
  5. Client nhận delta sạch:
     - cell.ownerId = winner.id, cell.isMortgaged = false
     - isOwnerChanged = true -> bỏ qua phát sinh log chuộc đất ma
     - Watchdog ghi nhận chính xác 100%, không vi phạm bất biến!
```

---

### III. BẢN ĐỒ THẤT BẠI TRƯỚC SỬA (Failure Modes Enumerated)

1. **Failure Mode 1 (Infinite Seizure Loop)**: `turn_loop.ts` đặt `unbuiltRounds: 0` khi thu hồi. Vì `0 !== undefined`, hàm `processUnbuiltRounds` tiếp tục đếm `0 -> 1 -> 2 -> 3` và thu hồi lại BĐS sau 2 vòng chơi liên tiếp, khiến người chơi bị mất đất lặp đi lặp lại.
2. **Failure Mode 2 (Treasury Drain / Leaking Auction Proceeds)**: Khi đấu giá đất không có chủ (từ chối mua hoặc thu hồi dự án treo), người thắng bị trừ `winningBid` nhưng Kho Bạc không được cộng tiền. Hệ thống mất trắng khoản tiền đấu giá.
3. **Failure Mode 3 (Phantom Mortgage & Trapped Asset)**: Khi ô đất từng bị thế chấp trước khi thu hồi, cờ `isMortgaged: true` vẫn lưu trong `stateMap`. Người thắng nhận ô đất bị thế chấp ngầm, Client phát hiện chuyển đổi trạng thái sinh log giả "đã thế chấp vào ngân hàng (+600)" và khóa quyền thu tiền thuê.
4. **Failure Mode 4 (Ghost Debt Retention & Unbacked Write-Off)**: Cựu chủ sở hữu sau khi bị thu hồi đất vẫn giữ `cellIndex` trong `mortgagedProperties` hoặc `mortgageLoans`. Hoặc khi đấu giá tài sản thế chấp của con nợ, con nợ vừa giữ tiền vay vừa nhận trọn tiền bán đấu giá mà không hoàn trả nợ gốc cho Kho Bạc.
5. **Failure Mode 5 (Cross-Room Mutation Leak)**: `stateMap` không được truyền qua các hàm `handleAuctionBid` và `handleAuctionPass` khiến `handleAuctionClose` fallback sang `knownStateMaps` toàn cục làm mất cờ thế chấp của các phòng chơi khác.

---

### IV. CHI TIẾT TRIỂN KHAI VẬT LÝ (Concrete Implementation Directives)

#### 1. `src/server/turn_loop.ts` (L65-L95)
```ts
    if (nextRounds > 2) {
      // Thu hồi ô đất và mở auction 50%
      registry.delete(cellIndex);
      const nextState: PropertyState = { ...state, isMortgaged: false };
      delete (nextState as { unbuiltRounds?: number }).unbuiltRounds;
      stateMap.set(cellIndex, nextState);

      if (current.mortgagedProperties?.includes(cellIndex)) {
        current.mortgagedProperties = current.mortgagedProperties.filter((c) => c !== cellIndex);
      }
      if (current.mortgageLoans?.[cellIndex] !== undefined) {
        delete current.mortgageLoans[cellIndex];
      }

      const deed = PROPERTY_DEEDS.get(cellIndex);
      if (deed) {
        const startingBid = Math.floor(deed.price * 0.50);
        auctions.set(roomCode, {
          cellIndex,
          declinedPlayerId: '',
          highestBid: startingBid,
          startingBid,
          currentBid: startingBid,
          endTime: Date.now() + 20_000,
          passedPlayers: new Set<string>(),
        });
        room.phase = TurnPhase.AuctionPhase;
      }
      break; // [P2-DEFENSE] Chỉ mở 1 auction tại một thời điểm, chống đè session
    }
```

#### 2. `src/server/auction_manager.ts` (L90-L195)
- Mở rộng chữ ký `handleAuctionBid` và `handleAuctionPass` nhận `stateMap?: PropertyStateMap`:
```ts
export function handleAuctionBid(
  room: Room | undefined,
  session: AuctionSession | undefined,
  playerId: string,
  amount: number,
  registry?: PropertyRegistry,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
...
  if (shouldClose) {
    handleAuctionClose(room, session, registry, auctions, roomCode, stateMap);
  }
...
}

export function handleAuctionPass(
  room: Room | undefined,
  session: AuctionSession | undefined,
  playerId: string,
  registry?: PropertyRegistry,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
  stateMap?: PropertyStateMap,
): { success: boolean; reason?: string } {
...
  if (shouldClose) {
    handleAuctionClose(room, session, registry, auctions, roomCode, stateMap);
  }
...
}
```
- Trong `handleAuctionClose`:
```ts
  if (session.highestBidder) {
    const winner = room.players.find((p) => p.id === session.highestBidder);
    if (winner && winner.balance >= session.highestBid) {
      winner.balance -= session.highestBid;
      registry?.set(session.cellIndex, winner.id);
      winnerId = session.highestBidder;
      winningBid = session.highestBid;

      if (stateMap) {
        const st = stateMap.get(session.cellIndex);
        if (st) {
          st.isMortgaged = false;
          delete (st as { unbuiltRounds?: number }).unbuiltRounds;
        }
      }

      for (const p of room.players) {
        if (p.mortgagedProperties?.includes(session.cellIndex)) {
          p.mortgagedProperties = p.mortgagedProperties.filter((c) => c !== session.cellIndex);
        }
      }

      if (session.insolvencyPlayerId) {
        const insolventPlayer = room.players.find((p) => p.id === session.insolvencyPlayerId);
        if (insolventPlayer) {
          const outstandingLoan = insolventPlayer.mortgageLoans?.[session.cellIndex] ?? 0;
          if (insolventPlayer.mortgageLoans) {
            delete insolventPlayer.mortgageLoans[session.cellIndex];
          }

          if (!insolventPlayer.bankrupt) {
            // [TREASURY-INVARIANT] Ưu tiên thu hồi nợ gốc thế chấp cho Kho Bạc
            const loanPayoff = Math.min(winningBid, outstandingLoan);
            const surplus = winningBid - loanPayoff;
            if (loanPayoff > 0) {
              room.treasury = (room.treasury ?? 0) + loanPayoff;
            }
            insolventPlayer.balance += surplus;
            if (insolventPlayer.balance >= 0) {
              room.phase = TurnPhase.PropertyManagement;
            }
          } else {
            room.treasury = (room.treasury ?? 0) + winningBid;
          }
        }
      } else {
        // [TREASURY-CONSERVATION] Đấu giá từ chối mua, thu hồi dự án treo, hoặc fire sale
        room.treasury = (room.treasury ?? 0) + winningBid;
      }
    }
  }
```

#### 3. `src/server/room_manager.ts` (L178, L188, L200)
- Chuyển `this.propertyStates.get(roomCode)` vào:
  - L178: `handleAuctionBid(..., this.propertyStates.get(roomCode))`
  - L188: `handleAuctionPass(..., this.propertyStates.get(roomCode))`
  - L200: `handleAuctionClose(..., this.propertyStates.get(roomCode))`

#### 4. `src/client/network/activity_property_tracker.ts` (L90-L105 & L195)
- Trong `detectCellMortgage`:
```ts
export function detectCellMortgage(
  cell: CellDelta,
  wasMortgaged: boolean,
  nextState: GameState,
  prevState: GameState,
  isOwnerChanged: boolean = false,
): { entry: ActivityLogEntry; isMortgaged: boolean; amount: number; ownerId: string } | null {
  if (cell.isMortgaged === undefined || cell.isMortgaged === wasMortgaged) return null;
  const ownerId = cell.ownerId ?? Object.keys(nextState.playersInfo).find((id) =>
    nextState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  // Bỏ qua giải chấp ma khi BĐS vô chủ hoặc được bàn giao sạch nợ cho chủ mới từ đấu giá
  if (!cell.isMortgaged && (!ownerId || isOwnerChanged)) return null;
```
- Trong `processCellMortgageDiff`:
```ts
  const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
    prevState.playersInfo[id]?.ownedProperties.includes(cell.index),
  );
  const isOwnerChanged = cell.ownerId !== undefined && cell.ownerId !== prevOwnerId;
  const mg = detectCellMortgage(cell, wasMortgaged, nextState, prevState, isOwnerChanged);
```

---

### V. MA TRẬN KIỂM THỬ TRẠM 1 (Station 1 Test Matrix: 19 Atomic Tests)

Tạo file: `tests/contracts/imp205_auction_mortgage_sanitization_and_treasury_conservation.test.ts`

- **Facet 1: Vòng lặp đếm vòng unbuiltRounds**
  1. `[TC-IMP205.01/MSS]` Thu hồi ô đất khi unbuiltRounds > 2 xóa bỏ hoàn toàn unbuiltRounds (`delete state.unbuiltRounds`).
  2. `[TC-IMP205.02/MSS]` Ô đất sau khi bị thu hồi và mua lại không bị đếm tiếp unbuiltRounds ở các lượt tiếp theo.
  3. `[TC-IMP205.03/MSS]` Ô đất không có unbuiltRounds không bị kích hoạt thu hồi sau 3 vòng chơi.
  4. `[TC-IMP205.04/MSS]` Phiên đấu giá thu hồi đất treo có đầy đủ `endTime` (+20s) và `currentBid`.
  5. `[TC-IMP205.05/MSS]` Người chơi có >= 2 ô đất treo cùng đến hạn chỉ mở 1 phiên đấu giá (lệnh `break;` bảo vệ).
- **Facet 2: Làm sạch thế chấp khi trúng đấu giá**
  6. `[TC-IMP205.06/MSS]` Người trúng đấu giá ô đất từng bị thế chấp nhận BĐS với `isMortgaged = false`.
  7. `[TC-IMP205.07/MSS]` Cựu chủ sở hữu có ô đất bị thu hồi bị xóa `cellIndex` khỏi `mortgagedProperties`.
  8. `[TC-IMP205.08/MSS]` Cựu chủ sở hữu có ô đất bị thu hồi bị xóa nợ trong `mortgageLoans`.
  9. `[TC-IMP205.09/MSS]` Người trúng đấu giá không bị gán nợ vào `mortgagedProperties` hoặc `mortgageLoans`.
- **Facet 3: Bảo toàn quỹ Kho Bạc (Treasury Conservation)**
  10. `[TC-IMP205.10/MSS]` Đấu giá đất từ chối mua nộp 100% tiền thắng đấu giá vào `room.treasury`.
  11. `[TC-IMP205.11/MSS]` Đấu giá đất thu hồi dự án treo nộp 100% tiền thắng đấu giá vào `room.treasury`.
  12. `[TC-IMP205.12/MSS]` Đấu giá cưỡng chế người chơi phá sản (bankrupt = true) nộp tiền vào `room.treasury`.
  13. `[TC-IMP205.13/MSS]` Đấu giá trả nợ (bankrupt = false): Kho Bạc thu nợ gốc thế chấp trước, con nợ chỉ nhận thặng dư.
  14. `[TC-IMP205.14/MSS]` Tổng lượng tiền toàn phòng trước và sau đấu giá đất công giữ nguyên không đổi (`Actual Delta = 0`).
- **Facet 4: Đồng bộ trạng thái Client & Activity Log**
  15. `[TC-IMP205.15/MSS]` Client nhận delta trúng đấu giá không sinh log thế chấp ma `đã thế chấp vào ngân hàng (+600)`.
  16. `[TC-IMP205.16/MSS]` Ô đất chuyển về vô chủ không sinh log chuộc lại đất ma cho chủ cũ.
  17. `[TC-IMP205.17/MSS]` Người chơi thắng đấu giá BĐS từng thế chấp chỉ có log đấu giá, không có log chuộc đất.
- **Facet 5: Phòng thủ biên & Cô lập phòng chơi**
  18. `[TC-IMP205.18/MSS]` Đấu giá kết thúc tại Phòng 1 không làm ảnh hưởng trạng thái thế chấp của cùng ô tại Phòng 2.
  19. `[TC-IMP205.19/MSS]` [Adversarial Inversion] Nếu `unbuiltRounds` bị gán = 0 thay vì xóa, test chứng minh lỗi đếm lặp xuất hiện.

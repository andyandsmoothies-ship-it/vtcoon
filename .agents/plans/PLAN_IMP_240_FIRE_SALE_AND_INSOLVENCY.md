# IMPLEMENTATION PLAN: IMP-240-FIRE-SALE-AND-INSOLVENCY-RESILIENCE (Revision 2)
## Hoàn Thiện Quy Trình Đấu Giá Phát Mãi 0đ & Bảo Toàn Vòng Đời Chuyển Nhượng Phá Sản

> **Ticket ID**: `IMP-240-FIRE-SALE-AND-INSOLVENCY-RESILIENCE`  
> **Source Audit**: [`docs/reports/audits/AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/audits/AUDIT_FIRE_SALE_0D_AND_GAMEPLAY_LOG_DEFECTS.md)  
> **Classification**: Tier 2 (Full Rigor — Server FSM, Wire Serialization, UI Modal Flow, >50 LOC)  
> **Grilling Report**: [`PLAN_AUDIT_IMP_240_FIRE_SALE_AND_INSOLVENCY.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP_240_FIRE_SALE_AND_INSOLVENCY.md)  
> **Target Files (11 files)**:
> 1. `src/domain/room.ts` (Entity Model: `pendingInsolvencyCreditorId`, `pendingInsolvencyDebtorId`, `fireSaleDebtorId`)
> 2. `src/server/insolvency_manager.ts` (Creditor Tracking, Effective Bank Check, Solvent Cleanup, Non-Bankrupt Creditor Guard)
> 3. `src/server/turn_loop.ts` (Landing Rent Creditor Binding & Turn Transition State Purge)
> 4. `src/server/bond_manager.ts` (Fire Sale `insolvencyPlayerId` Wire Serialization & Multi-Collateral Debtor Retention)
> 5. `src/server/auction_manager.ts` (Fire Sale Queue Debtor ID Propagation & Teardown)
> 6. `src/server/network/afk_recovery.ts` (AFK Solvency Recovery Cleanup & Debtor-Guarded Creditor Intent)
> 7. `src/server/room_property_coordinator.ts` (Mortgage & Downgrade Insolvency Recovery Teardown)
> 8. `src/client/store/game_store_types.ts` (Client Modal Payload Interface: `isFireSale`)
> 9. `src/client/ui/modals/modal_host.tsx` (Prop Forwarding: `isFireSale`, `isBankrupt`)
> 10. `src/client/ui/modals/auction_modal.tsx` (Mobile Viewport Height, Bankrupt Spectator Guard, Auto-Bid Disable, Non-Bankrupt Close)
> 11. `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts` (NEW Contract Suite, >= 15 atomic tests)  

---

### 1. DIRECTIVE CLOSURE TABLE (BẢNG ĐỐI CHIẾU 1:1 CHỈ THỊ PLAN-GRILLER)

| Mã Chỉ Thị | Mức Độ | Tệp Nguồn & Tọa Độ | Nội Dung Chỉ Thị & Yêu Cầu Kỹ Thuật | Tọa Độ Giải Quyết Trong Plan Rev 2 |
| :---: | :---: | :--- | :--- | :--- |
| **DIR-01** | **P1** | `auction_modal.tsx#L346-354` | **Specification Mirage**: Biến `myPlayer` không tồn tại trong scope của `AuctionModal`. Phải truyền prop `isBankrupt?: boolean` hoặc tính `isMyPlayerBankrupt` an toàn từ `myId` và `playersInfo`. | Đã thêm prop `isBankrupt?: boolean` vào `AuctionModalProps` (Bước 10.1), truyền `isBankrupt={myPlayer?.bankrupt}` từ `modal_host.tsx` (Bước 9), và tính `isMyPlayerBankrupt` (Bước 10.2). Triệt tiêu 100% `myPlayer`. |
| **DIR-02** | **P1** | `room_property_coordinator.ts#L44-47,L71-74`<br>`afk_recovery.ts#L138-141`<br>`turn_loop.ts#L309-335` | **Transient State Leak**: `pendingInsolvencyCreditorId` và `pendingInsolvencyDebtorId` không bị dọn dẹp khi người chơi tự thoát nợ qua Thế chấp, Hạ cấp, AFK, hoặc chuyển lượt. Phải bổ sung `delete` và kiểm tra đối chiếu debtor ID. | Đã bổ sung `delete room.pendingInsolvencyCreditorId; delete room.pendingInsolvencyDebtorId;` tại `coordMortgage` (Bước 7.1), `coordDowngrade` (Bước 7.2), `afk_recovery.ts` (Bước 6), và đầu hàm `advanceTurnToNextPlayer` (Bước 3.2). Kiểm tra `pendingInsolvencyDebtorId === playerId` khi phá sản. |
| **DIR-03** | **P1** | `insolvency_manager.ts#L168-183` | **Incomplete Pipeline Station**: Snippet `declareBankruptcy` chỉ định nghĩa `effectiveCreditorId` nhưng để lại `else if (creditorId === 'BANK')` khiến phá sản nợ Bank không có intent bị rơi vào nhánh xóa sạch BĐS. | Mở rộng Bước 2.3 bao trùm dòng 168: chuyển thành `else if (effectiveCreditorId === 'BANK')`, đảm bảo mọi con nợ Ngân Hàng đều kích hoạt đấu giá phát mãi. |
| **DIR-04** | **P1** | `bond_manager.ts#L225-240` | **Debtor Tracking Loss**: `processBondTurnTransition` đưa tài sản vào `room.fireSaleQueue` nhưng quên gán `room.fireSaleDebtorId = player.id;`, làm mất dấu con nợ ở các ô đấu giá từ thứ 2 trở đi. | Bổ sung `room.fireSaleDebtorId = player.id;` ngay sau `room.fireSaleQueue = cells;` trong `bond_manager.ts` (Bước 4.2). |
| **DIR-05** | **P1** | `insolvency_manager.ts#L188-190` | **Terminal Entity Leak**: Tra cứu chủ nợ thiếu điều kiện `!p.bankrupt`, khiến BĐS và tiền mặt có thể bị chuyển giao cho một người chơi đã phá sản. | Cập nhật tra cứu thành: `room.players.find((p) => p.id === effectiveCreditorId && !p.bankrupt)` trong Bước 2.3. |
| **DIR-06** | **P2** | `auction_modal.tsx#L398,L401,L449` | **Actor Inversion / Spectator Leak**: Người chơi phá sản vẫn có thể bấm nút Auto-Bid và chân modal vẫn hiện nút `✕ Rút Lui` thay vì `✕ Đóng / Xem Bàn Cờ`. | Thêm `isMyPlayerBankrupt` vào điều kiện disable Auto-Bid (Bước 10.4) và đổi nút footer thành `✕ Đóng / Xem Bàn Cờ` khi `(isDeclinedPlayer \|\| isMyPlayerBankrupt)` (Bước 10.4). |
| **DIR-07** | **P2** | `PLAN_IMP_240_FIRE_SALE_AND_INSOLVENCY.md` | **Mechanical Format Divergence**: Định dạng tiêu đề các bước dùng `Tệp:` khiến script `node scripts/audit_plan.mjs` không quét được. | Chuẩn hóa 100% tiêu đề các bước thành `**Target physical file**: <path>` theo chuẩn chính quy. |

---

### 2. BẢNG ĐỐI CHIẾU LỖ HỔNG PHÁP Y (FORENSIC DEFECT RESOLUTION MATRIX)

| Mã Lỗi | Tên Lỗ Hổng & Tệp Nguồn | Nguyên Nhân Gốc Rễ (Physical Root Cause) | Giải Pháp Kỹ Thuật Triệt Để |
| :--- | :--- | :--- | :--- |
| **DEF-01** | **Rớt Prop `isFireSale`**<br>`modal_host.tsx:258`<br>`game_store_types.ts:136` | `ModalPayloadMap['auction']` thiếu `isFireSale?: boolean`. `modal_host.tsx` không truyền prop `isFireSale` vào `<AuctionModal />`. Modal nhận `undefined` nên render `+100, +200, +500` thay vì `[0, 50, 100]`. | Khai báo `isFireSale?: boolean` vào client store types; truyền `isFireSale={payload.isFireSale}` tại `modal_host.tsx`. Bật nút cược 0đ cho người chơi còn dung môi. |
| **DEF-02** | **Rò Rỉ Trạng Thái Con Nợ**<br>`auction_manager.ts:240`<br>`bond_manager.ts:167,225` | Khi duyệt `fireSaleQueue`, `handleStartFireSaleAuction` bị gọi thiếu tham số `bankruptPlayerId` hoặc `room.fireSaleDebtorId` không được set khi vỡ nợ trái phiếu. Khiến `declinedPlayerId` fallback thành `''` và `session.insolvencyPlayerId` không được set. Client đánh giá `isDeclinedPlayer = false`. | Lưu `room.fireSaleDebtorId` khi đưa tài sản vào `fireSaleQueue` (cả ở phá sản và trái phiếu); truyền `room.fireSaleDebtorId` trong `auction_manager.ts:240`; set `session.insolvencyPlayerId = bankruptPlayerId`. |
| **DEF-03** | **Cắt Cụt Bot AI 4 Trên Mobile**<br>`auction_modal.tsx:296` | Container danh sách người chơi bị kẹp cứng `max-h-16` (64px) trên mobile viewport kết hợp `[&::-webkit-scrollbar]:hidden`. 4 người chơi chiếm >100px nên người thứ 4 bị giấu tiệt. | Nâng chiều cao container cơ sở lên `max-h-28 sm:max-h-32 md:max-h-36`; chuyển sang thanh cuộn mỏng tinh tế (`scrollbar-thin`) thay vì ẩn hoàn toàn. |
| **DEF-04** | **Con Nợ Phá Sản Vẫn Thấy Nút Cược**<br>`auction_modal.tsx:347` | Khi người chơi đã `bankrupt: true`, nếu `isDeclinedPlayer` bị false do mạng hoặc desync, modal vẫn render cụm nút cược 3 cấp bị xám xịt thay vì thông báo giải thích. | Bổ sung guard Defense-in-depth: `(isDeclinedPlayer \|\| isMyPlayerBankrupt)` render banner Spectator: *"Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi."* |
| **DEF-05** | **Xóa Sạch BĐS Về Null Thay Vì Sang Tên Cho Chủ Nợ**<br>`turn_loop.ts:218`<br>`insolvency_manager.ts:184`<br>`afk_recovery.ts:143` | `checkInsolvency` không lưu chủ nợ khi trừ tiền thuê ô đất; `afk_recovery` dispatch `INTENT_BANKRUPTCY` không kèm `creditorId`. `declareBankruptcy` rơi vào nhánh `else` gọi `registry.delete()` xóa sạch đất thành vô chủ. | Lưu `room.pendingInsolvencyCreditorId` & `pendingInsolvencyDebtorId` lúc dính nợ thuê; `declareBankruptcy` ưu tiên `creditorId ?? room.pendingInsolvencyCreditorId`, sang tên toàn bộ đất cho chủ nợ theo đúng luật game. |

---

### 3. KIẾN TRÚC MỤC TIÊU (TARGET ARCHITECTURE)

```
[Sự Cố Dính Nợ Thuê / Đáo Hạn Trái Phiếu]
  │
  ├─► [turn_loop.ts / bond_manager.ts]
  │     └─► Ghi nhận room.pendingInsolvencyCreditorId = landlordId, room.pendingInsolvencyDebtorId = playerId
  │     └─► Khóa tài sản đảm bảo vào room.fireSaleQueue, gán room.fireSaleDebtorId = playerId
  │
  ├─► [insolvency_manager.ts / afk_recovery.ts / room_property_coordinator.ts]
  │     ├─► Trường hợp tự cứu vãn (Thế chấp / Bán nhà / AFK Mortgage):
  │     │     └─► Balance >= 0 -> delete room.pendingInsolvencyCreditorId, delete room.pendingInsolvencyDebtorId
  │     │
  │     └─► Trường hợp Tuyên Bố Phá Sản:
  │           └─► declareBankruptcy(effectiveCreditorId)
  │                 ├─► Nợ Người Chơi: Sang tên BĐS không thế chấp cho Chủ Nợ (!p.bankrupt)
  │                 ├─► Nợ Ngân Hàng: Kích hoạt đấu giá phát mãi 70% giá sàn
  │                 └─► Dọn dẹp: delete room.pendingInsolvencyCreditorId, delete room.pendingInsolvencyDebtorId
  │
  ├─► [session_manager.ts (Wire)]
  │     └─► Broadcast AuctionPayload { isFireSale: true, insolvencyPlayerId, declinedPlayerId }
  │
  └─► [Client UI Pipeline]
        ├─► game_store_types.ts -> ModalPayloadMap['auction'].isFireSale
        ├─► modal_host.tsx -> <AuctionModal isFireSale={payload.isFireSale} isBankrupt={myPlayer?.bankrupt} />
        └─► auction_modal.tsx:
              ├─► Con nợ / Bankrupt (isMyPlayerBankrupt): Chuyển Spectator Mode (ẩn nút cược, hiện banner, tắt Auto-Bid)
              ├─► Đối thủ còn lại: calculateAuctionIncrements -> [0, 50, 100] (Có nút 0đ)
              └─► Danh sách người chơi: max-h-28 (Hiện trọn vẹn 4/4 đại gia trên Mobile)
```

---

### 4. ĐỊNH MỨC NGÂN SÁCH DÒNG MÃ (PHYSICAL LOC BUDGET REPORT)

Đo đạc vật lý độc quyền qua `node scripts/check_loc.mjs`:

| Tệp Vật Lý Trên Đĩa | Phân Tầng (Tier) | Baseline Vật Lý | Dự Báo Delta | LOC Sau Sửa | Trạng Thái Ngân Sách |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `src/domain/room.ts` | Tier 1 (Domain Model) | **275** | +3 | 278 | ✔️ An Toàn (Ceiling 400) |
| `src/server/insolvency_manager.ts` | Tier 1 (Server FSM) | **284** | +11 | 295 | ✔️ An Toàn (Ceiling 400) |
| `src/server/turn_loop.ts` | Tier 1 (Server Loop) | **335** | +4 | 339 | ⚠️ Cảnh báo an toàn (339 <= 400) |
| `src/server/bond_manager.ts` | Tier 1 (Server Logic) | **241** | +2 | 243 | ✔️ An Toàn (Ceiling 400) |
| `src/server/auction_manager.ts` | Tier 1 (Server Logic) | **271** | +3 | 274 | ✔️ An Toàn (Ceiling 400) |
| `src/server/network/afk_recovery.ts` | Tier 1 (Server Network) | **218** | +4 | 222 | ✔️ An Toàn (Ceiling 400) |
| `src/server/room_property_coordinator.ts` | Tier 1 (Server Logic) | **355** | +4 | 359 | ⚠️ Cảnh báo an toàn (359 <= 400) |
| `src/client/store/game_store_types.ts` | Tier 1 (Client Types) | **386** | +1 | 387 | ⚠️ Cảnh báo an toàn (387 <= 400) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI Modal Host) | **471** | +2 | 473 | ⚠️ Cảnh báo an toàn (473 <= 500) |
| `src/client/ui/modals/auction_modal.tsx` | Tier 2 (UI Modal) | **462** | +8 | 470 | ⚠️ Cảnh báo an toàn (470 <= 500) |
| `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts` | Test Suite (Mới) | **0** (Mới) | +210 | 210 | ✔️ An Toàn (Ceiling 600) |

---

### 5. BẢN ĐẶC TẢ THỰC THI CHI TIẾT (DROP-IN IMPLEMENTATION SNIPPETS)

#### BƯỚC 1: Bổ Sung Trường Vòng Đời Phá Sản Vào `src/domain/room.ts`
**Target physical file**: `src/domain/room.ts`  
Vị trí: Dòng 198-204

```typescript
<<<<
  lastTargetTradeOfferRound?: Record<string, number>;
  activeMacroGroup?:          ColorGroup;
  fireSaleQueue?:             number[];
  lastDiplomaticEvent?:       { playerId: string; landlordId: string; cellIndex: number; savedRent: number } | null;
====
  lastTargetTradeOfferRound?: Record<string, number>;
  activeMacroGroup?:          ColorGroup;
  fireSaleQueue?:             number[];
  fireSaleDebtorId?:          string;
  pendingInsolvencyCreditorId?: string;
  pendingInsolvencyDebtorId?:   string;
  lastDiplomaticEvent?:       { playerId: string; landlordId: string; cellIndex: number; savedRent: number } | null;
>>>>
```

---

#### BƯỚC 2: Cập Nhật Xử Lý Nợ & Sang Tên BĐS Trong `src/server/insolvency_manager.ts`
**Target physical file**: `src/server/insolvency_manager.ts`  

**Bước 2.1: Ghi nhận chủ nợ & con nợ trong `checkInsolvency` (Dòng 12-21)**
```typescript
<<<<
export function checkInsolvency(room: Room): void {
  const player = room.players[room.currentPlayerIndex];
  if (!player || player.balance >= 0) return;

  room.phase = TurnPhase.InsolvencyPhase;

  console.info(JSON.stringify({
    event: 'INSOLVENCY_TRIGGERED', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId: player.id, balance: player.balance },
  }));
}
====
export function checkInsolvency(room: Room, creditorId?: string): void {
  const player = room.players[room.currentPlayerIndex];
  if (!player || player.balance >= 0) return;

  if (creditorId && creditorId !== player.id) {
    room.pendingInsolvencyCreditorId = creditorId;
    room.pendingInsolvencyDebtorId = player.id;
  }
  room.phase = TurnPhase.InsolvencyPhase;

  console.info(JSON.stringify({
    event: 'INSOLVENCY_TRIGGERED', correlationId: room.roomCode,
    timestamp: Date.now(), delta: { playerId: player.id, balance: player.balance, creditorId: room.pendingInsolvencyCreditorId },
  }));
}
>>>>
```

**Bước 2.2: Xóa cờ nợ khi tự phục hồi dung môi trong `liquidateAssets` (Dòng 100-103)**
```typescript
<<<<
  if (player.balance >= 0 && room.phase === TurnPhase.InsolvencyPhase) {
    room.phase = TurnPhase.PropertyManagement;
  }
====
  if (player.balance >= 0 && room.phase === TurnPhase.InsolvencyPhase) {
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyDebtorId;
    room.phase = TurnPhase.PropertyManagement;
  }
>>>>
```

**Bước 2.3: Sang tên cho chủ nợ, xử lý nợ ngân hàng & dọn dẹp cờ nợ trong `declareBankruptcy` (Dòng 131-168)**
```typescript
<<<<
  const collateralCells = new Set<number>();
  if (player.bondContract?.isActive) {
    for (const cell of player.bondContract.collateralCells) {
      collateralCells.add(cell);
      registry.delete(cell);
      stateMap.delete(cell);
      room.fireSaleQueue ??= [];
      room.fireSaleQueue.push(cell);
    }
    player.bondContract = null;
  }

  const creditor = creditorId && creditorId !== 'BANK'
    ? room.players.find((p) => p.id === creditorId)
    : undefined;

  if (creditor) {
    // Nhánh 1: Nợ người chơi khác -> sang tên toàn bộ đất và tiền mặt cho chủ nợ
    if (player.balance > 0) {
      creditor.balance += player.balance;
    }
    for (const [cellIndex, owner] of Array.from(registry.entries())) {
      if (owner === playerId) {
        if (collateralCells.has(cellIndex)) continue;
        registry.set(cellIndex, creditor.id);
        if (player.mortgagedProperties?.includes(cellIndex)) {
          creditor.mortgagedProperties ??= [];
          if (!creditor.mortgagedProperties.includes(cellIndex)) {
            creditor.mortgagedProperties.push(cellIndex);
          }
          if (player.mortgageLoans?.[cellIndex] !== undefined) {
            creditor.mortgageLoans ??= {};
            creditor.mortgageLoans[cellIndex] = player.mortgageLoans[cellIndex];
          }
        }
      }
    }
  } else if (creditorId === 'BANK') {
====
  const collateralCells = new Set<number>();
  if (player.bondContract?.isActive) {
    for (const cell of player.bondContract.collateralCells) {
      collateralCells.add(cell);
      registry.delete(cell);
      stateMap.delete(cell);
      room.fireSaleQueue ??= [];
      room.fireSaleQueue.push(cell);
    }
    room.fireSaleDebtorId = playerId;
    player.bondContract = null;
  }

  const effectiveCreditorId = creditorId ?? (room.pendingInsolvencyDebtorId === playerId ? room.pendingInsolvencyCreditorId : undefined);
  delete room.pendingInsolvencyCreditorId;
  delete room.pendingInsolvencyDebtorId;

  const creditor = effectiveCreditorId && effectiveCreditorId !== 'BANK'
    ? room.players.find((p) => p.id === effectiveCreditorId && !p.bankrupt)
    : undefined;

  if (creditor) {
    // Nhánh 1: Nợ người chơi khác -> sang tên toàn bộ đất và tiền mặt cho chủ nợ
    if (player.balance > 0) {
      creditor.balance += player.balance;
    }
    for (const [cellIndex, owner] of Array.from(registry.entries())) {
      if (owner === playerId) {
        if (collateralCells.has(cellIndex)) continue;
        registry.set(cellIndex, creditor.id);
        if (player.mortgagedProperties?.includes(cellIndex)) {
          creditor.mortgagedProperties ??= [];
          if (!creditor.mortgagedProperties.includes(cellIndex)) {
            creditor.mortgagedProperties.push(cellIndex);
          }
          if (player.mortgageLoans?.[cellIndex] !== undefined) {
            creditor.mortgageLoans ??= {};
            creditor.mortgageLoans[cellIndex] = player.mortgageLoans[cellIndex];
          }
        }
      }
    }
  } else if (effectiveCreditorId === 'BANK') {
>>>>
```

---

#### BƯỚC 3: Liên Kết Chủ Nợ & Dọn Dẹp Đầu Lượt Trong `src/server/turn_loop.ts`
**Target physical file**: `src/server/turn_loop.ts`  

**Bước 3.1: Ghi nhận landlordId khi nợ tiền thuê đất (Dòng 217-219)**
```typescript
<<<<
  // UC-053: Kiem tra mat kha nang thanh toan neu so du am sau khi thu thue / lai / phi
  if (current.balance < 0) checkInsolvency(room);
====
  // UC-053: Kiem tra mat kha nang thanh toan neu so du am sau khi thu thue / lai / phi
  if (current.balance < 0) {
    const landlordId = reg ? reg.get(newPos) : undefined;
    checkInsolvency(room, landlordId);
  }
>>>>
```

**Bước 3.2: Dọn dẹp trạng thái nợ cũ khi chuyển lượt tiếp theo (Dòng 309-312)**
```typescript
<<<<
export function advanceTurnToNextPlayer(room: Room, rng: () => number = Math.random): void {
  const total = room.players.length;
====
export function advanceTurnToNextPlayer(room: Room, rng: () => number = Math.random): void {
  delete room.pendingInsolvencyCreditorId;
  delete room.pendingInsolvencyDebtorId;
  const total = room.players.length;
>>>>
```

---

#### BƯỚC 4: Bổ Sung `insolvencyPlayerId` & Debtor Tracking Trong `src/server/bond_manager.ts`
**Target physical file**: `src/server/bond_manager.ts`  

**Bước 4.1: Bổ sung `insolvencyPlayerId` vào session đấu giá (Dòng 167-176)**
```typescript
<<<<
  const session: AuctionSession = {
    cellIndex,
    declinedPlayerId: bankruptPlayerId ?? '',
    highestBid: 0,
    startingBid: 0,
    currentBid: 0,
    passedPlayers: new Set<string>(),
    endTime: Date.now() + 10_000,
    isFireSale: true,
  };
====
  const session: AuctionSession = {
    cellIndex,
    declinedPlayerId: bankruptPlayerId ?? '',
    highestBid: 0,
    startingBid: 0,
    currentBid: 0,
    passedPlayers: new Set<string>(),
    endTime: Date.now() + 10_000,
    isFireSale: true,
    insolvencyPlayerId: bankruptPlayerId,
  };
>>>>
```

**Bước 4.2: Lưu giữ debtor ID khi đưa nhiều tài sản đảm bảo vào hàng đợi phát mãi (Dòng 225-227)**
```typescript
<<<<
  room.fireSaleQueue = cells;
  player.bondContract = null;
====
  room.fireSaleQueue = cells;
  room.fireSaleDebtorId = player.id;
  player.bondContract = null;
>>>>
```

---

#### BƯỚC 5: Truyền Debtor ID Trong Hàng Đợi Phát Mãi `src/server/auction_manager.ts`
**Target physical file**: `src/server/auction_manager.ts`  
Vị trí: Dòng 237-247

```typescript
<<<<
  // Xử lý hàng đợi phát mãi
  if (room.fireSaleQueue && room.fireSaleQueue.length > 0) {
    const nextCell = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, nextCell, auctions, roomCode);
    return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
  }
  if (room.fireSaleQueue && room.fireSaleQueue.length === 0) {
    delete room.fireSaleQueue;
    advanceTurnToNextPlayer(room);
    return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
  }
====
  // Xử lý hàng đợi phát mãi
  if (room.fireSaleQueue && room.fireSaleQueue.length > 0) {
    const nextCell = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, nextCell, auctions, roomCode, room.fireSaleDebtorId);
    return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
  }
  if (room.fireSaleQueue && room.fireSaleQueue.length === 0) {
    delete room.fireSaleQueue;
    delete room.fireSaleDebtorId;
    advanceTurnToNextPlayer(room);
    return { winnerId, winningBid, cellIndex: session.cellIndex, isForeclosure: !winnerId };
  }
>>>>
```

---

#### BƯỚC 6: Xử Lý AFK Phá Sản & Solvency Teardown Trong `src/server/network/afk_recovery.ts`
**Target physical file**: `src/server/network/afk_recovery.ts`  
Vị trí: Dòng 138-145

```typescript
<<<<
  if (player.balance >= 0) {
    room.phase = TurnPhase.PropertyManagement;
    return { rescued: true, bankrupt: false };
  }

  rooms.handlePlayerIntent(roomCode, playerId, { type: 'INTENT_BANKRUPTCY' });
  return { rescued: false, bankrupt: true };
====
  if (player.balance >= 0) {
    delete room.pendingInsolvencyCreditorId;
    delete room.pendingInsolvencyDebtorId;
    room.phase = TurnPhase.PropertyManagement;
    return { rescued: true, bankrupt: false };
  }

  const effectiveCreditorId = room.pendingInsolvencyDebtorId === playerId ? room.pendingInsolvencyCreditorId : undefined;
  rooms.handlePlayerIntent(roomCode, playerId, {
    type: 'INTENT_BANKRUPTCY',
    creditorId: effectiveCreditorId,
  });
  return { rescued: false, bankrupt: true };
>>>>
```

---

#### BƯỚC 7: Xóa Cờ Nợ Khi Thoát Nợ Qua Thế Chấp / Hạ Cấp Trong `src/server/room_property_coordinator.ts`
**Target physical file**: `src/server/room_property_coordinator.ts`  

**Bước 7.1: Xóa cờ nợ khi thế chấp thành công đưa balance >= 0 (Dòng 43-48)**
```typescript
<<<<
  const res = mortgageProperty(ctx.room, playerId, cellIndex, ctx.reg, ctx.sm);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase) {
    const p = ctx.room.players.find((pl) => pl.id === playerId);
    if (p && p.balance >= 0) ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
====
  const res = mortgageProperty(ctx.room, playerId, cellIndex, ctx.reg, ctx.sm);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase) {
    const p = ctx.room.players.find((pl) => pl.id === playerId);
    if (p && p.balance >= 0) {
      delete ctx.room.pendingInsolvencyCreditorId;
      delete ctx.room.pendingInsolvencyDebtorId;
      ctx.room.phase = TurnPhase.PropertyManagement;
    }
  }
  return res;
>>>>
```

**Bước 7.2: Xóa cờ nợ khi hạ cấp nhà đưa balance >= 0 (Dòng 71-76)**
```typescript
<<<<
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
====
  const res = handleDowngrade(player, ctx.room.phase, cellIndex, ctx.reg, ctx.sm, roomCode, options, ctx.room);
  if (res.success && ctx.room.phase === TurnPhase.InsolvencyPhase && player && player.balance >= 0) {
    delete ctx.room.pendingInsolvencyCreditorId;
    delete ctx.room.pendingInsolvencyDebtorId;
    ctx.room.phase = TurnPhase.PropertyManagement;
  }
  return res;
>>>>
```

---

#### BƯỚC 8: Mở Rộng Interface Modal Payload Trong `src/client/store/game_store_types.ts`
**Target physical file**: `src/client/store/game_store_types.ts`  
Vị trí: Dòng 133-137

```typescript
<<<<
    isForeclosure?: boolean;
    startingBid?: number;
    highestBid?: number;
    highestBidder?: string;
  };
====
    isForeclosure?: boolean;
    isFireSale?: boolean;
    startingBid?: number;
    highestBid?: number;
    highestBidder?: string;
  };
>>>>
```

---

#### BƯỚC 9: Truyền Prop `isFireSale` & `isBankrupt` Trong `src/client/ui/modals/modal_host.tsx`
**Target physical file**: `src/client/ui/modals/modal_host.tsx`  
Vị trí: Dòng 256-261

```tsx
<<<<
            winnerId={payload.winnerId}
            finalPrice={payload.finalPrice}
            isForeclosure={payload.isForeclosure}
            insolvencyPlayerId={payload.insolvencyPlayerId}
            onClose={() => { useGameStore.getState().dismissAuction(payload.cellIndex); }}
====
            winnerId={payload.winnerId}
            finalPrice={payload.finalPrice}
            isForeclosure={payload.isForeclosure}
            isFireSale={payload.isFireSale}
            insolvencyPlayerId={payload.insolvencyPlayerId}
            isBankrupt={myPlayer?.bankrupt}
            onClose={() => { useGameStore.getState().dismissAuction(payload.cellIndex); }}
>>>>
```

---

#### BƯỚC 10: Mở Rộng Viewport Mobile, Guard Spectator & Disable Auto-Bid Trong `src/client/ui/modals/auction_modal.tsx`
**Target physical file**: `src/client/ui/modals/auction_modal.tsx`  

**Bước 10.1: Bổ sung prop `isBankrupt?: boolean` vào interface (Dòng 27-31)**
```tsx
<<<<
  readonly isForeclosure?: boolean;
  readonly isFireSale?: boolean;
  readonly insolvencyPlayerId?: string;
  readonly playersInfo?: Record<string, Partial<PlayerInfo>>;
  readonly levelMap?: Record<number, number>;
====
  readonly isForeclosure?: boolean;
  readonly isFireSale?: boolean;
  readonly isBankrupt?: boolean;
  readonly insolvencyPlayerId?: string;
  readonly playersInfo?: Record<string, Partial<PlayerInfo>>;
  readonly levelMap?: Record<number, number>;
>>>>
```

**Bước 10.2: Destructure `isBankrupt` và tính toán `isMyPlayerBankrupt` an toàn (Dòng 52-56 & Dòng 82-96)**
```tsx
<<<<
  isForeclosure = false,
  isFireSale = false,
  insolvencyPlayerId,
  playersInfo: propPlayersInfo,
====
  isForeclosure = false,
  isFireSale = false,
  isBankrupt = false,
  insolvencyPlayerId,
  playersInfo: propPlayersInfo,
>>>>
```

```tsx
<<<<
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = propPlayersInfo ?? (Object.keys(storePlayersInfo ?? {}).length > 0 ? storePlayersInfo : useGameStore.getState().playersInfo);
  const debtor = insolvencyPlayerId ? playersInfo?.[insolvencyPlayerId] : undefined;
  const debtorName = debtor?.name;
  const [autoBid, setAutoBid] = useState<boolean>(false);

  // Xử lý tự động đặt giá nếu bật Auto-Bid
  useEffect(() => {
    if (autoBid && !isConcluded && !isLeading && !hasPassed && !isDeclinedPlayer && onBid) {
      const minBid = increments[0];
      if (minBid !== undefined && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isConcluded, isLeading, hasPassed, isDeclinedPlayer, currentBid, increments, myBalance, onBid]);
====
  const storePlayersInfo = useGameStore((s) => s.playersInfo);
  const playersInfo = propPlayersInfo ?? (Object.keys(storePlayersInfo ?? {}).length > 0 ? storePlayersInfo : useGameStore.getState().playersInfo);
  const isMyPlayerBankrupt = isBankrupt || Boolean(myId && (playersInfo?.[myId]?.bankrupt || playersInfo?.[myId]?.isBankrupt));
  const debtor = insolvencyPlayerId ? playersInfo?.[insolvencyPlayerId] : undefined;
  const debtorName = debtor?.name;
  const [autoBid, setAutoBid] = useState<boolean>(false);

  // Xử lý tự động đặt giá nếu bật Auto-Bid
  useEffect(() => {
    if (autoBid && !isConcluded && !isLeading && !hasPassed && !isDeclinedPlayer && !isMyPlayerBankrupt && onBid) {
      const minBid = increments[0];
      if (minBid !== undefined && (myBalance === undefined || minBid <= myBalance)) {
        onBid(minBid);
      }
    }
  }, [autoBid, isConcluded, isLeading, hasPassed, isDeclinedPlayer, isMyPlayerBankrupt, currentBid, increments, myBalance, onBid]);
>>>>
```

**Bước 10.3: Nâng chiều cao container danh sách người chơi trên mobile (Dòng 296)**
```tsx
<<<<
            <div className="space-y-0.5 sm:space-y-1 max-h-16 sm:max-h-28 md:max-h-32 overflow-y-auto pr-1 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
====
            <div className="space-y-0.5 sm:space-y-1 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
>>>>
```

**Bước 10.4: Defense-in-depth cho spectator phá sản, disable Auto-Bid và đổi nút footer (Dòng 346-354 & 395-458)**
```tsx
<<<<
        {/* Trạng thái & Các nút nâng giá nhanh */}
        {isDeclinedPlayer ? (
          <div className="p-1.5 sm:p-2.5 bg-amber-100 rounded-xl text-center border border-amber-300">
            <p className="text-[11px] sm:text-xs font-bold text-amber-900 leading-tight">
              {isForeclosure
                ? 'Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình.'
                : 'Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...'}
            </p>
          </div>
====
        {/* Trạng thái & Các nút nâng giá nhanh */}
        {(isDeclinedPlayer || isMyPlayerBankrupt) ? (
          <div className="p-1.5 sm:p-2.5 bg-amber-100 rounded-xl text-center border border-amber-300">
            <p className="text-[11px] sm:text-xs font-bold text-amber-900 leading-tight">
              {isMyPlayerBankrupt
                ? 'Bạn đã phá sản và đang theo dõi phiên đấu giá tài sản phát mãi.'
                : isForeclosure
                ? 'Tài sản của bạn đang được phát mãi cưỡng chế để cấn trừ nợ xấu. Bạn không thể tự đấu giá tài sản của chính mình.'
                : 'Bạn đã từ chối mua ô đất này (Luật game cấm tham gia đấu giá). Đang chờ các đối thủ khác đặt giá...'}
            </p>
          </div>
>>>>
```

```tsx
<<<<
        {/* Footer: Công tắc Tự động đặt giá & Nút Hành Động (Single Row Grid 2 cột đối xứng) */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 sm:pt-2 border-t border-amber-300/80">
          <button
            type="button"
            onClick={() => setAutoBid((prev) => !prev)}
            disabled={hasPassed || isDeclinedPlayer || isConcluded}
            data-testid="auction-autobid-btn"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              hasPassed || isDeclinedPlayer || isConcluded
                ? 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed shadow-none'
                : autoBid
                  ? 'bg-amber-500 text-amber-950 font-black border-amber-700 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] cursor-pointer'
                  : 'bg-[#F7F2E7] text-slate-700 border-slate-300 hover:bg-amber-100 cursor-pointer shadow-xs active:translate-y-[1px]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-900 animate-pulse' : 'bg-slate-400'}`} />
            <span>{autoBid ? 'TỰ ĐỘNG ĐẶT GIÁ: BẬT' : 'TỰ ĐỘNG ĐẶT GIÁ: TẮT'}</span>
          </button>

          {isConcluded ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-concluded-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : hasPassed ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-passed-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đã Rút Lui • Đóng
            </button>
          ) : isDeclinedPlayer ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-declined-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : isLeading ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-leading-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : (
            <button
              type="button"
              data-testid="auction-pass-btn"
              onClick={() => onPass?.()}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Rút Lui
            </button>
          )}
        </div>
====
        {/* Footer: Công tắc Tự động đặt giá & Nút Hành Động (Single Row Grid 2 cột đối xứng) */}
        <div className="grid grid-cols-2 gap-2 pt-1.5 sm:pt-2 border-t border-amber-300/80">
          <button
            type="button"
            onClick={() => setAutoBid((prev) => !prev)}
            disabled={hasPassed || isDeclinedPlayer || isMyPlayerBankrupt || isConcluded}
            data-testid="auction-autobid-btn"
            className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
              hasPassed || isDeclinedPlayer || isMyPlayerBankrupt || isConcluded
                ? 'bg-slate-200 text-slate-400 border-slate-300 opacity-50 cursor-not-allowed shadow-none'
                : autoBid
                  ? 'bg-amber-500 text-amber-950 font-black border-amber-700 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] cursor-pointer'
                  : 'bg-[#F7F2E7] text-slate-700 border-slate-300 hover:bg-amber-100 cursor-pointer shadow-xs active:translate-y-[1px]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoBid ? 'bg-amber-900 animate-pulse' : 'bg-slate-400'}`} />
            <span>{autoBid ? 'TỰ ĐỘNG ĐẶT GIÁ: BẬT' : 'TỰ ĐỘNG ĐẶT GIÁ: TẮT'}</span>
          </button>

          {isConcluded ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-concluded-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : hasPassed ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-passed-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-slate-700 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_3px_0_0_#94a3b8] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đã Rút Lui • Đóng
            </button>
          ) : (isDeclinedPlayer || isMyPlayerBankrupt) ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-declined-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 shadow-[0_3px_0_0_#d97706] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : isLeading ? (
            <button
              type="button"
              onClick={onClose}
              data-testid="auction-leading-close-btn"
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-amber-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 shadow-[0_3px_0_0_#b45309] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Đóng / Xem Bàn Cờ
            </button>
          ) : (
            <button
              type="button"
              data-testid="auction-pass-btn"
              onClick={() => onPass?.()}
              className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-black text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 shadow-[0_3px_0_0_#fca5a5] active:translate-y-[2px] transition-all cursor-pointer whitespace-nowrap"
            >
              ✕ Rút Lui
            </button>
          )}
        </div>
>>>>
```

---

### BỘ KIỂM THỬ HỢP ĐỒNG (STATION 1 QA CONTRACT TESTS)

#### BƯỚC 11: Xây Dựng Suite Test Hợp Đồng Mới `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts`
**Target physical file**: `tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts` (Tệp mới)  
Bao gồm >= 15 atomic tests, Universal 5-Facet Matrix (Zero loops in `it()`, Zero static checklist tests):
- `TC-FS.01/MSS` [Facet-1]: Phiên đấu giá phát mãi `handleStartFireSaleAuction` khởi tạo `startingBid: 0`, `isFireSale: true`, `insolvencyPlayerId`.
- `TC-FS.02/MSS` [Facet-1]: `calculateAuctionIncrements(0, true, false)` trả về chính xác `[0, 50, 100]`.
- `TC-FS.03/MSS` [Facet-1]: Khi đã có người đặt giá (`hasBidder = true`), `calculateAuctionIncrements(0, true, true)` trả về các bước giá tăng dần.
- `TC-FS.04/Boundary` [Facet-2]: Người sở hữu tài sản phát mãi (`bankruptPlayerId`) bị cấm đặt giá (`isDeclinedPlayer = true`).
- `TC-FS.05/Boundary` [Facet-2]: Người chơi đã phá sản (`isMyPlayerBankrupt = true`) không được render cụm nút cược, hiển thị thông báo spectator, và tắt Auto-Bid.
- `TC-FS.06/Lifecycle` [Facet-3]: Khi ô đất đầu tiên trong `fireSaleQueue` kết thúc, ô tiếp theo nhận đúng `room.fireSaleDebtorId`.
- `TC-FS.07/Lifecycle` [Facet-3]: Khi `fireSaleQueue` hết, `room.fireSaleDebtorId` và `room.fireSaleQueue` được dọn dẹp sạch sẽ (teardown).
- `TC-FS.08/AssetTransfer` [Facet-4]: Người chơi `p1` phá sản vì nợ tiền thuê của `p2`, toàn bộ BĐS không thế chấp của `p1` được sang tên cho `p2`.
- `TC-FS.09/AssetTransfer` [Facet-4]: Tài sản đảm bảo trái phiếu của `p1` KHÔNG sang tên cho `p2` mà chuyển vào `fireSaleQueue`.
- `TC-FS.10/AFKRecovery` [Facet-4]: Khi người chơi AFK trong `InsolvencyPhase`, `executeInsolvencyAfkRecovery` dispatch bankruptcy kèm `pendingInsolvencyCreditorId` nếu debtor trùng khớp.
- `TC-FS.11/Wire` [Facet-5]: `session_manager.ts` serialize `isFireSale: true` và `insolvencyPlayerId` vào delta.
- `TC-FS.12/UI` [Facet-5]: `modal_host.tsx` chuyển tiếp đúng prop `isFireSale` và `isBankrupt` vào `<AuctionModal />`.
- `TC-FS.13/SolvencyRecovery` [Facet-5]: Khi người chơi tự thế chấp cứu nguy thành công (`balance >= 0`), `room.pendingInsolvencyCreditorId` và `room.pendingInsolvencyDebtorId` được xóa bỏ.
- `TC-FS.14/SolvencyRecovery` [Facet-5]: Khi người chơi tự hạ cấp nhà cứu nguy thành công (`balance >= 0`), `room.pendingInsolvencyCreditorId` và `room.pendingInsolvencyDebtorId` được xóa bỏ.
- `TC-FS.15/CleanState` [Facet-5]: Phá sản do nợ Ngân Hàng (`effectiveCreditorId === 'BANK'`) đưa tài sản vào đấu giá thanh lý bình thường.
- `TC-FS.16/TerminalEntity` [Facet-4]: Khi chủ nợ `p2` đã phá sản (`p2.bankrupt === true`), BĐS không được sang tên cho `p2` mà rơi vào thanh lý an toàn.
- `TC-FS.17/TurnAdvance` [Facet-3]: Khi chuyển sang lượt người chơi tiếp theo qua `advanceTurnToNextPlayer`, các cờ `pendingInsolvencyCreditorId` và `pendingInsolvencyDebtorId` cũ bị xóa sạch.

---

### 6. QUY TRÌNH 4 TRẠM KHÉP KÍN (4-STATION CLOSED-LOOP PIPELINE)

```
🚦 [ACTIVATE 4-STATION CLOSED-LOOP PIPELINE]
├── Trạm 1 (Station 1 RED): qa-tester viết tests/contracts/fire_sale_and_insolvency_lifecycle.test.ts (>= 15 tests) & chứng minh fail
├── Trạm 2 (Station 2 GREEN): implementer áp dụng snippets vào 10 file nguồn
├── Trạm 2.5 (Fast Pre-Filter): scout quét tsc, check:loc, no dirty casts
├── Trạm 3 (Review Funnel): 
│   ├── Phase 3.1: spec-reviewer (100% Spec Reconciliation)
│   └── Phase 3.2: code-reviewer (Anti-slop, no memory leaks)
└── Trạm 4 (Adversarial Sentinel): chaos-sentinel thẩm định Wire-to-Core & Mutation Parity
```

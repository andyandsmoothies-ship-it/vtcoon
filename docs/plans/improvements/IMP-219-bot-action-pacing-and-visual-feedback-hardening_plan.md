# KẾ HOẠCH TRIỂN KHAI: IMP-219 — BOT ACTION PACING & VISUAL FEEDBACK HARDENING (REVISION N+2)

> **Mã Tính Năng**: IMP-219  
> **Tên Tính Năng**: Minh Bạch Hóa Thông Báo Thao Tác Của Bot & Tối Ưu Nhịp Độ Bàn Cờ (Bot Action Pacing & Visual Feedback Hardening)  
> **Phân Loại Rủi Ro**: Tier 2 (Full Rigor — Turn Orchestrator Delay, Activity Badge Dispatcher & Client UX)  
> **Bảng Kiểm Soát Ngân Sách LOC Vật Lý (Đã Hiệu Chỉnh Khớp 100% Đĩa Cứng)**:  
> • `src/client/store/game_store_types.ts`: Hiện tại **382 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +2 dòng = 384 LOC)  
> • `src/client/store/activity_store.ts`: Hiện tại **139 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +2 dòng = 141 LOC)  
> • `src/client/network/activity_property_tracker.ts`: Hiện tại **244 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +10 dòng = 254 LOC)  
> • `src/client/network/activity_badge_dispatcher.ts`: Hiện tại **245 LOC** (Trần Cứng Hợp Đồng `TC-193.16` $\le 300$ LOC, Dự kiến: +22 dòng = 267 LOC $\le 300$)  
> • `src/client/network/activity_financial_tracker.ts`: Hiện tại **315 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +16 dòng = 331 LOC $\le 400$)  
> • `src/client/network/activity_tracker.ts`: Hiện tại **325 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +12 dòng = 337 LOC $\le 400$)  
> • `src/client/ui/transaction_formula.ts`: Hiện tại **77 LOC** (Trần Tier 2 $\le 500$ LOC, Dự kiến: Delta = 0 dòng = 77 LOC)  
> • `src/client/ui/transaction_narrative.ts`: Hiện tại **261 LOC** (Trần Cứng Hợp Đồng `TC-194.18` $\le 280$ LOC, Dự kiến: +6 dòng = 267 LOC $\le 280$)  
> • `src/server/network/turn_orchestrator.ts`: Hiện tại **342 LOC** (Trần Tier 1 $\le 400$ LOC, Dự kiến: +16 dòng = 358 LOC $\le 400$)  

---

## 1. BỐI CẢNH & NGUYÊN NHÂN GỐC RỄ (ROOT CAUSE ANALYSIS)

Người chơi phản ánh trong quá trình trải nghiệm:
> *"Tôi thấy có một số thao tác của bot đang thể hiện quá nhanh làm tôi khó nhận ra, một số còn không hiện thông báo pop up, mặc dù đa số đã tốt."*

Qua điều tra mã nguồn vật lý và báo cáo thẩm định Zero-Trust của `plan-griller` (`.agents/audit/PLAN_AUDIT_IMP219.md`), 4 nguyên nhân kỹ thuật cốt lõi gồm:

1. **Vết Đứt Gãy Thông Báo Nổi Giao Dịch P2P (Missing P2P Trade Badges) & Ghost Rent Trap**:
   - Trong `src/client/network/activity_property_tracker.ts#L29-L43`: Khi một ô đất đổi chủ mà có `prevOwnerId` (giao dịch P2P giữa Bot với Bot hoặc Bot với Người), hàm `detectCellTrade` lại gán `type: 'buy'` với `amount: undefined`.
   - Tại `src/client/network/activity_badge_dispatcher.ts#L85-L95`: `handleBuyBadge` chạy regex `đã mua (.+?) với giá` $\to$ không khớp, dẫn đến `amount = 0`, sinh ra Floating Badge: *"Mua [Tên ô]"* với số tiền `0đ`, che giấu hoàn toàn bên bán và giá trị giao dịch. Đồng thời `BADGE_HANDLERS` thiếu hoàn toàn mục `trade`.
   - ĐẶC BIỆT (P1 Ghost Rent): Trong `activity_financial_tracker.ts`, `matchRentTransactions` quét các biến động số dư tiền mặt của Bên mua và Bên bán trong giao dịch P2P và nhận định nhầm thành tiền thuê nhà (Rent)! Cần đưa `buyerId` và `sellerId` vào `handledPayerIds`/`handledReceiverIds` trước khi chạy `matchRentTransactions`.
2. **Bỏ Sót Kết Quả Sàn Chứng Khoán HOSE (`hose`) & Nguy Cơ Lặp Badge (Transient Leak Hazard)**:
   - Tại `src/client/network/activity_financial_tracker.ts#L301`: Sự kiện biến động tài chính từ sàn HOSE bị gán `type: 'system'` và bị `BADGE_HANDLERS` bỏ rơi.
   - Khi chuyển sang `type: 'hose'`, vì `delta.lastHoseResult` tồn tại trên `room` suốt pha `PropertyManagement`, các delta kế tiếp (nâng cấp nhà, thế chấp) sẽ lặp lại việc sinh badge nếu không có khóa chống trùng lặp `lastProcessedHoseKey`.
3. **Thiếu Bước Đệm Thị Giác Khi Bot Bỏ Mua Đất ➔ Chuyển Ngay Sang Đấu Giá (Trừ Phát Mãi Nợ)**:
   - Khi Bot dẫm ô đất trống và quyết định không mua (`INTENT_DECLINE`), máy chủ lập tức kích hoạt `TurnPhase.AuctionPhase`. Màn hình người chơi giật mở Modal Đấu Giá mà không có thông báo trung gian giải thích tại sao ô này bị đấu giá.
   - Cần bắt sự kiện Bot bỏ mua trong `detectAuctionActivities` để hiển thị narrative *"Bot 1 đã bỏ qua Phố Huế ➔ Mở Đấu Giá"*, loại trừ các trường hợp phát mãi nợ (`!isForeclosure && !insolvencyPlayerId`).
4. **Thiếu "Nhịp Thở" (Breathing Room) Sau Khi Bot Nâng Cấp Công Trình & Bẫy Xóa Cờ Sớm (Premature Teardown)**:
   - Trong pha `PropertyManagement`, sau khi Bot đặt lệnh nâng cấp nhà (`INTENT_UPGRADE`), Bot lập tức gọi `INTENT_END_TURN` ở micro-step tiếp theo khiến người chơi không kịp quan sát công trình mới mọc trên bàn cờ 3D.
   - Cần bổ sung cờ `botJustUpgraded` trong `TurnOrchestrator` để cấp độ trễ `BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500ms`.
   - BẢO VỆ CHỐNG BẪY XÓA SỚM: `orchestrate(roomCode)` luôn gọi `clearRoom(roomCode)` ở đầu hàm (L163). Do đó, TUYỆT ĐỐI KHÔNG xóa `botJustUpgraded` trong `clearRoom`. Cờ chỉ được xóa khi tiêu thụ trong `scheduleBotStep` hoặc giải phóng rò rỉ trong `destroyRoom`.

---

## 2. KIẾN TRÚC GIẢI PHÁP (ARCHITECTURE & COMPONENT DESIGN)

```
[Server TurnOrchestrator: botJustUpgraded Tracker]
  │  Đọc SSOT PropertyStateMap trước và sau stepBotTurn:
  │  nextLevelSum > prevLevelSum -> this.botJustUpgraded.set(roomCode, true)
  │  orchestrate(roomCode) gọi clearRoom (KHÔNG xóa botJustUpgraded)
  │  scheduleBotStep(roomCode) nhận diện cờ -> xóa cờ (self-clearing) và cấp delay 1500ms
  │  destroyRoom(roomCode) dọn dẹp chống rò rỉ bộ nhớ
  ▼
[Client ActivityPropertyTracker]
  │  processCellOwnerDiff: Lấy prevOwner từ prevState.playersInfo và tính prevOwnerName
  │  detectCellTrade: Phân biệt 3 luồng:
  │    1. Mua trực tiếp Ngân Hàng (type: 'buy')
  │    2. Thắng Đấu Giá (type: 'auction')
  │    3. Chuyển Nhượng P2P (type: 'trade', targetPlayerId: prevOwnerId, targetPlayerName: prevOwnerName)
  ▼
[Client ActivityFinancialTracker: Ghost Rent & HOSE Dedup Guard]
  │  Trước matchRentTransactions: Trích xuất các ô P2P trong context.boughtCellIndices,
  │  đưa buyerId & prevOwnerId vào handledPayerIds & handledReceiverIds chống Ghost Rent.
  │  HOSE: Dùng lastProcessedHoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}` chống lặp badge.
  │  Gán type: 'hose' (thay vì 'system')
  ▼
[Client ActivityTracker: detectAuctionActivities]
  │  Bắt delta.auction có declinedPlayerId là Bot VÀ (!isForeclosure && !insolvencyPlayerId)
  │  -> phát entry type 'auction'
  ▼
[Client ActivityBadgeDispatcher: BADGE_HANDLERS]
  │  + trade: handleTradeBadge (Bắn thẻ song phương: Bên mua nhận BĐS, Bên bán chuyển nhượng)
  │  + hose: handleHoseBadge (Bắn thẻ HOSE từ delta.lastHoseResult)
  │  + auction: handleAuctionBadge (Hỗ trợ cả thông báo Bot bỏ qua đất ➔ Mở đấu giá)
  ▼
[UI Overlay: FloatingBadge & Narrative]
  │  Hiển thị chuẩn công thái học 3 tầng DOM, không che lấp sa bàn 3D
  │  Compact inline cases trong transaction_narrative.ts (Delta <= +6 LOC, tổng <= 267 LOC <= 280)
  │  Narrative: "Bạn nhận Phố Huế từ Bot 1" / "Bot 1 bỏ qua Phố Huế để mở đấu giá" (Zero Stutter)
```

---

## 3. ĐOẠN MÃ THAY THẾ CHÍNH XÁC (EXACT DROP-IN SNIPPETS)

### Snippet 3.1: Mở Rộng `FloatingActionType` và `ActivityLogType`
**Tệp**: `src/client/store/game_store_types.ts` (L88-L92)
```typescript
  | 'mortgage'
  | 'unmortgage'
  | 'diplomatic'
  | 'trade'
  | 'decline_auction'
  | 'general';
```

**Tệp**: `src/client/store/activity_store.ts` (L15-L18)
```typescript
  | 'unmortgage'
  | 'bankrupt'
  | 'trade'
  | 'hose'
  | 'system';
```

---

### Snippet 3.2: Cập Nhật `detectCellTrade` & Điểm Gọi `processCellOwnerDiff`
**Tệp**: `src/client/network/activity_property_tracker.ts` (L20-L55 và L150-L165)

Thay thế hàm `detectCellTrade`:
```typescript
export function detectCellTrade(
  cell: CellDelta,
  prevOwnerId: string | undefined,
  buyerName: string,
  buyerColor?: string,
  winningBid?: number,
  prevOwnerName?: string,
): ActivityLogEntry {
  const cellName = getCellName(cell.index);
  const price = PROPERTY_DEEDS.get(cell.index)?.price;
  const isDirectBuy = !prevOwnerId;

  let message: string;
  let amount: number | undefined;
  let type: 'buy' | 'auction' | 'trade' = 'buy';

  if (winningBid !== undefined) {
    message = `${buyerName} đã thắng đấu giá ${cellName} với giá ${formatCurrency(winningBid)}`;
    amount = -winningBid;
    type = 'auction';
  } else if (isDirectBuy) {
    message = `${buyerName} đã mua ${cellName}${price ? ` với giá ${formatCurrency(price)}` : ''}`;
    if (price) amount = -price;
    type = 'buy';
  } else {
    const sellerStr = prevOwnerName ? ` từ ${prevOwnerName}` : '';
    message = `${buyerName} đã nhận chuyển nhượng ${cellName}${sellerStr}`;
    type = 'trade';
  }

  return {
    id: `${type}_${Date.now()}_${cell.index}_${cell.ownerId}`,
    timestamp: Date.now(),
    type,
    message,
    playerId: cell.ownerId ?? undefined,
    playerName: buyerName,
    ...(prevOwnerId ? { targetPlayerId: prevOwnerId, targetPlayerName: prevOwnerName } : {}),
    ...(amount !== undefined ? { amount } : {}),
    cellIndex: cell.index,
    ...(buyerColor ? { playerTokenColor: buyerColor } : {}),
  };
}
```

Và thay thế dòng 150-165 trong `processCellOwnerDiff`:
```typescript
    const buyer = nextState.playersInfo[cell.ownerId] ?? prevState.playersInfo[cell.ownerId];
    const prevOwner = prevOwnerId ? (prevState.playersInfo[prevOwnerId] ?? nextState.playersInfo[prevOwnerId]) : undefined;
    const prevOwnerName = prevOwner ? getPlayerName(prevOwner, prevOwnerId) : undefined;
    const modalAuction =
      prevState.activeModal === 'auction' && prevState.modalPayload && 'cellIndex' in prevState.modalPayload
        ? (prevState.modalPayload as { cellIndex?: number; currentBid?: number; highestBid?: number })
        : undefined;
    const auction = prevState.auction ?? modalAuction;
    const isAuctionForThisCell = auction?.cellIndex === cell.index;
    const winningBid = isAuctionForThisCell ? (auction.highestBid ?? auction.currentBid) : undefined;

    entries.push(detectCellTrade(cell, prevOwnerId, getPlayerName(buyer, cell.ownerId), buyer?.tokenColor, winningBid, prevOwnerName));
    boughtCellIndices.push(cell.index);
```

---

### Snippet 3.3: Cập Nhật `activity_financial_tracker.ts` (Chặn Ghost Rent & Chống Lặp HOSE)
**Tệp**: `src/client/network/activity_financial_tracker.ts`

1. Xuất biến và hàm reset deduplication cho HOSE:
```typescript
let lastProcessedHoseKey: string | null = null;
export function resetHoseActivityTracker(): void {
  lastProcessedHoseKey = null;
}
```

2. Trước `matchRentTransactions` (sau khối xử lý `buyoutCellIndices`, L272), bổ sung bộ lọc chặn Ghost Rent cho P2P Trade:
```typescript
  if (context.boughtCellIndices && delta.cells) {
    for (const boughtIndex of context.boughtCellIndices) {
      const cellDelta = delta.cells.find((c) => c.index === boughtIndex);
      if (!cellDelta?.ownerId) continue;
      const prevOwnerId = Object.keys(prevState.playersInfo).find((id) =>
        prevState.playersInfo[id]?.ownedProperties.includes(boughtIndex),
      );
      if (prevOwnerId && prevOwnerId !== cellDelta.ownerId) {
        handledPayerIds.add(cellDelta.ownerId);
        handledReceiverIds.add(prevOwnerId);
      }
    }
  }
```

3. Cập nhật khối xử lý HOSE (L284-L310) sang `type: 'hose'` và áp dụng deduplication key:
```typescript
  if (delta.lastHoseResult) {
    const hr = delta.lastHoseResult;
    const hoseKey = `${hr.playerId}_${hr.timestamp}_${hr.roll}`;
    if (lastProcessedHoseKey !== hoseKey) {
      lastProcessedHoseKey = hoseKey;
      const pInfo = nextState.playersInfo[hr.playerId] ?? prevState.playersInfo[hr.playerId];
      const pName = hr.playerName ?? getPlayerName(pInfo, hr.playerId);
      const multiplierPct = Math.round((hr.multiplier - 1) * 100);
      const sign = multiplierPct > 0 ? `+${multiplierPct}%` : multiplierPct < 0 ? `${multiplierPct}%` : 'Hòa vốn';
      const outcomeLabel =
        hr.profit > 0
          ? `Lãi +${formatCurrency(hr.profit)}`
          : hr.profit < 0
          ? `Lỗ -${formatCurrency(Math.abs(hr.profit))}`
          : 'Hòa vốn';
      const icon = hr.profit > 0 ? '📈' : hr.profit < 0 ? '📉' : '⚖️';

      entries.push({
        id: `hose_${hr.timestamp}_${hr.playerId}`,
        timestamp: hr.timestamp,
        type: 'hose',
        message: `${icon} [HOSE] ${pName} đầu tư ${formatCurrency(hr.stake)} ➔ Khớp lệnh Mặt ${hr.roll} (${sign}): Thu về ${formatCurrency(hr.payout)} (${outcomeLabel})`,
        playerId: hr.playerId,
        playerName: pName,
        amount: hr.profit,
        ...(pInfo?.tokenColor ? { playerTokenColor: pInfo.tokenColor } : {}),
      });
      handledPayerIds.add(hr.playerId);
      handledReceiverIds.add(hr.playerId);
    }
  }
```

---

### Snippet 3.4: Bắt Sự Kiện Bot Bỏ Mua Trong `detectAuctionActivities` (Loại Trừ Phát Mãi Nợ)
**Tệp**: `src/client/network/activity_tracker.ts` (L150-L175)
```typescript
  if (
    delta.auction &&
    !delta.auction.isForeclosure &&
    !delta.auction.insolvencyPlayerId &&
    (!prevStateOrNextState.auction || prevStateOrNextState.auction.cellIndex !== delta.auction.cellIndex) &&
    delta.auction.declinedPlayerId
  ) {
    const nextState = maybeNextState ?? prevStateOrNextState;
    const declId = delta.auction.declinedPlayerId;
    const declPlayer = nextState.playersInfo[declId];
    if (declPlayer?.isBot) {
      const declName = getPlayerName(declPlayer, declId);
      const cellName = getCellName(delta.auction.cellIndex);
      return [{
        id: `decline_auction_${Date.now()}_${delta.auction.cellIndex}`,
        timestamp: Date.now(),
        type: 'auction',
        message: `${declName} đã bỏ qua ${cellName} ➔ Mở Đấu Giá`,
        playerId: declId,
        playerName: declName,
        cellIndex: delta.auction.cellIndex,
        ...(declPlayer.tokenColor ? { playerTokenColor: declPlayer.tokenColor } : {}),
      }];
    }
  }
```

Và xuất khẩu `resetHoseActivityTracker` từ `activity_tracker.ts`:
```typescript
export { resetHoseActivityTracker } from './activity_financial_tracker.js';
```

---

### Snippet 3.5: Cập Nhật `activity_badge_dispatcher.ts` (Gọn $\le 22$ Dòng, Giữ Trần $\le 300$ LOC)
**Tệp**: `src/client/network/activity_badge_dispatcher.ts`

1. Thêm `handleTradeBadge` và `handleHoseBadge`:
```typescript
export function handleTradeBadge(act: ActivityLogEntry, state: GameState): void {
  const cell = act.cellIndex !== undefined ? getCellName(act.cellIndex) : 'BĐS';
  const bId = act.playerId ?? '', sId = act.targetPlayerId;
  const bName = act.playerName || (bId ? state.playersInfo[bId]?.name : 'Người chơi');
  const sName = act.targetPlayerName || (sId ? state.playersInfo[sId]?.name : 'đối tác');
  if (bId) state.addFloatingText({ text: cell, type: FloatingTextType.Reward, playerId: bId, actionType: 'trade', title: `${bName} nhận ${cell} từ ${sName}`, targetPlayerId: sId, targetPlayerName: sName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P' });
  if (sId) state.addFloatingText({ text: cell, type: FloatingTextType.Penalty, playerId: sId, actionType: 'trade', title: `${sName} nhượng ${cell} cho ${bName}`, targetPlayerId: bId, targetPlayerName: bName, cellIndex: act.cellIndex, formula: 'Chuyển nhượng quyền sở hữu P2P' });
}

export function handleHoseBadge(act: ActivityLogEntry, state: GameState, delta?: DeltaPayload): void {
  const profit = act.amount ?? 0;
  const hr = delta?.lastHoseResult;
  state.addFloatingText({
    text: `${profit >= 0 ? '+' : ''}${formatCurrency(profit)}`,
    type: profit >= 0 ? FloatingTextType.Reward : FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'hose',
    title: act.message,
    formula: hr ? `Khớp lệnh sàn HOSE: Mặt ${hr.roll}` : 'Giao dịch sàn chứng khoán HOSE',
  });
}
```

2. Cập nhật `handleAuctionBadge` hỗ trợ cả thông báo Bot bỏ qua đất:
```typescript
function handleAuctionBadge(act: ActivityLogEntry, state: GameState): void {
  const cellName = act.cellIndex !== undefined ? getCellName(act.cellIndex) : '';
  if (act.id.startsWith('decline_auction') || act.message.includes('bỏ qua')) {
    state.addFloatingText({
      text: cellName, type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
      actionType: 'decline_auction', title: act.message, cellIndex: act.cellIndex,
      formula: 'Từ chối mua quyền sử dụng đất',
    });
    return;
  }
  const isWin = act.id.startsWith('auction_win') || act.message.includes('trúng đấu giá') || act.message.includes('Búa gõ');
  if (!isWin) return;
  const amount = act.amount !== undefined ? -Math.abs(act.amount) : 0;
  state.addFloatingText({
    text: formatCurrency(amount), type: FloatingTextType.Penalty, playerId: act.playerId ?? '',
    actionType: 'auction_win', title: cellName ? `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc` : 'Thắng đấu giá BĐS ➔ Nộp Kho Bạc', cellIndex: act.cellIndex,
  });
}
```

3. Đăng ký vào `BADGE_HANDLERS` và luân chuyển `delta`:
```typescript
const BADGE_HANDLERS: Record<string, (act: ActivityLogEntry, state: GameState, delta?: DeltaPayload) => void> = {
  rent: handleRentBadge,
  buy: handleBuyBadge,
  upgrade: handleUpgradeBadge,
  tax: handleTaxBadge,
  bail: handleBailBadge,
  mortgage: handleMortgageBadge,
  unmortgage: handleUnmortgageBadge,
  auction: handleAuctionBadge,
  trade: handleTradeBadge,
  hose: handleHoseBadge,
  card: (act, state) => {
    if (act.id.startsWith('ma_buyout')) handleMaBuyoutBadge(act, state);
  },
};
```
Trong `dispatchActivityFloatingBadges`:
```typescript
  for (const act of activities) {
    BADGE_HANDLERS[act.type]?.(act, state, delta);
  }
```

---

### Snippet 3.6: Cập Nhật `transaction_narrative.ts` (Compact Inline, Tăng $\le 6$ Dòng, Giữ Trần $\le 280$ LOC)
**Tệp**: `src/client/ui/transaction_narrative.ts`

1. Bổ sung icon vào dòng 42:
```typescript
  auction_win: '🔨', hose: '📊', teleport: '✈️', audit_jail: '🚨', ma_buyout: '🤝',
  diplomatic: '🤝', bankrupt: '🚨', trade: '🤝', decline_auction: '🔨',
```

2. Bổ sung formatters vào `ACTION_REASON_FORMATTERS` (L113-L115):
```typescript
  trade: (item) => item.title || 'Chuyển nhượng BĐS P2P',
  decline_auction: (item) => item.title || 'Bỏ qua BĐS ➔ Mở đấu giá',
```

3. Bổ sung case tự nhiên trong `resolveTransactionNarrative` (L169 - Compact inline, Zero Stutter):
```typescript
    case 'trade':
      category = 'GIAO DỊCH P2P'; icon = '🤝'; verb = isPositive ? 'nhận' : 'chuyển nhượng';
      target = `${cellName || 'BĐS'} ${isPositive ? 'từ ' + targetName : 'cho ' + targetName}`;
      break;
    case 'decline_auction':
      category = 'ĐẤU GIÁ CÔNG KHAI'; icon = '🔨'; verb = 'bỏ qua'; target = `${cellName || 'BĐS'} để mở đấu giá`;
      break;
```

---

### Snippet 3.7: Nhịp Thở Quan Sát Bot Nâng Cấp (`TurnOrchestrator` — Chống Bẫy Xóa Sớm)
**Tệp**: `src/server/network/turn_orchestrator.ts`

1. Xuất khẩu hằng số:
```typescript
export const BOT_UPGRADE_OBSERVATION_DELAY_MS = 1500;
```

2. Khai báo thuộc tính trong class `TurnOrchestrator`:
```typescript
private readonly botJustUpgraded = new Map<string, boolean>();
```

3. Trong `scheduleBotStep`:
```typescript
    const hasUpgradeDelay = this.botJustUpgraded.get(roomCode) === true;
    if (hasUpgradeDelay) {
      this.botJustUpgraded.delete(roomCode);
    }
    const delayMs = hasUpgradeDelay
      ? BOT_UPGRADE_OBSERVATION_DELAY_MS
      : calculateBotStepDelay(room, this.botTurnDelayMs);
```

4. Khi gọi `this.rooms.stepBotTurn(roomCode)`:
```typescript
        const prevLevelSum = Array.from(this.rooms.getPropertyStates(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
        this.rooms.stepBotTurn(roomCode);
        const nextLevelSum = Array.from(this.rooms.getPropertyStates(roomCode)?.values() ?? []).reduce((acc, st) => acc + (st.level ?? 0), 0);
        if (nextLevelSum > prevLevelSum) {
          this.botJustUpgraded.set(roomCode, true);
        }
```

5. Trong `destroyRoom` (CHỈ xóa khi hủy phòng chống rò rỉ bộ nhớ; KHÔNG xóa trong `clearRoom`):
```typescript
  destroyRoom(roomCode: string): void {
    this.clearRoom(roomCode);
    this.clearAuctionSettleTimer(roomCode);
    this.activeTimers.delete(roomCode);
    this.deadlines.delete(roomCode);
    this.auctionSettleTimers.delete(roomCode);
    this.botJustUpgraded.delete(roomCode);
  }
```

---

## 4. MA TRẬN 16 ATOMIC CONTRACT TESTS (STATION 1)

**Tệp kiểm thử**: `tests/contracts/imp219_bot_action_pacing_and_visual_feedback.test.ts`

- **Facet 1: Phân Định Rạch Ròi Sự Kiện Giao Dịch P2P** ([TC-219.01] - [TC-219.04])
  - `[TC-219.01/MSS][UC-IMP219]` `detectCellTrade`: Khi có `prevOwnerId`, sinh entry có `type: 'trade'`, `targetPlayerId`, và message chứa tên bên bán.
  - `[TC-219.02/MSS][UC-IMP219]` `detectCellTrade`: Khi mua trực tiếp từ Ngân Hàng (`!prevOwnerId`), bảo toàn `type: 'buy'`, `amount: -price`.
  - `[TC-219.03/MSS][UC-IMP219]` `detectCellTrade`: Khi thắng đấu giá (`winningBid !== undefined`), sinh `type: 'auction'`, `amount: -winningBid`.
  - `[TC-219.04/MSS][UC-IMP219]` `handleTradeBadge`: Sinh FloatingTextItem song phương cho cả bên mua (Reward: nhận BĐS) và bên bán (Penalty: chuyển BĐS).
- **Facet 2: Phản Hồi Thị Giác Sàn Chứng Khoán HOSE & Chống Lặp Badge** ([TC-219.05] - [TC-219.07])
  - `[TC-219.05/MSS][UC-IMP219]` `activity_financial_tracker`: Khi `delta.lastHoseResult` xuất hiện, gán entry `type: 'hose'` thay vì `system`.
  - `[TC-219.06/MSS][UC-IMP219]` `handleHoseBadge`: Khi khớp lệnh thắng, đọc từ `delta.lastHoseResult`, sinh FloatingTextItem loại `Reward` với text mang dấu `+`.
  - `[TC-219.07/MSS][UC-IMP219]` `handleHoseBadge`: Khi khớp lệnh lỗ, sinh FloatingTextItem loại `Penalty` với text mang dấu `-`.
- **Facet 3: Thông Báo Bot Bỏ Qua Đất ➔ Kích Hoạt Đấu Giá & Loại Trừ Phát Mãi** ([TC-219.08] - [TC-219.10])
  - `[TC-219.08/MSS][UC-IMP219]` `detectAuctionActivities`: Khi `delta.auction` xuất hiện với `declinedPlayerId` là Bot, sinh ActivityLogEntry loại `auction` với thông báo bỏ qua; ngược lại nếu là phát mãi nợ (`isForeclosure: true` hoặc có `insolvencyPlayerId`) thì không sinh entry bỏ qua đất.
  - `[TC-219.09/MSS][UC-IMP219]` `handleAuctionBadge`: Nhận diện entry bỏ qua đất và sinh FloatingBadge mang `actionType: 'decline_auction'`.
  - `[TC-219.10/MSS][UC-IMP219]` `resolveTransactionNarrative`: Sinh câu hoàn chỉnh tự nhiên không lặp từ (`Bot 1 bỏ qua Phố Huế để mở đấu giá`).
- **Facet 4: Tối Ưu Nhịp Thở Quan Sát Nâng Cấp Công Trình** ([TC-219.11] - [TC-219.13])
  - `[TC-219.11/MSS][UC-IMP219]` `TurnOrchestrator`: Khi phát hiện Bot vừa nâng cấp công trình (`nextLevelSum > prevLevelSum`), bước kế tiếp nhận delay `BOT_UPGRADE_OBSERVATION_DELAY_MS` (1500ms).
  - `[TC-219.12/MSS][UC-IMP219]` `botJustUpgraded` được bảo toàn qua `clearRoom()` và chỉ tự động dọn dẹp sau khi tiêu thụ trong `scheduleBotStep` hoặc khi gọi `destroyRoom`.
  - `[TC-219.13/MSS][UC-IMP219]` `BOT_UPGRADE_OBSERVATION_DELAY_MS` được xuất khẩu tập trung (= 1500ms).
- **Facet 5: Chống Tiền Thuê Ma, Khử Trùng Lặp HOSE & Kiểm Tra Hành Vi Runtime** ([TC-219.14] - [TC-219.16])
  - `[TC-219.14/MSS][UC-IMP219]` Chống Ghost Rent: Trong giao dịch P2P chuyển nhượng có tiền mặt, `detectFinancialAndStatusActivities` không phát sinh log tiền thuê (`rent`) giữa bên mua và bên bán.
  - `[TC-219.15/MSS][UC-IMP219]` Khử trùng lặp HOSE: Nhiều gói delta kế tiếp trong pha `PropertyManagement` chứa cùng một `lastHoseResult` chỉ phát sinh 1 log duy nhất; gọi `resetHoseActivityTracker` cho phép nhận diện lại.
  - `[TC-219.16/MSS][UC-IMP219]` `dispatchActivityFloatingBadges`: Tích hợp đầy đủ `trade`, `hose`, và `decline_auction`, điều phối chính xác các thẻ nổi vào `state.addFloatingText`.

---

## 5. DỰ PHÒNG CHỐNG THẤT BẠI (FAILURE MODES & DEFENSES)

1. **FM1: Va chạm đè lấn thông báo nổi (Toast Stacking Collision)**:
   - *Biện pháp*: Bọc trong `state.addFloatingText` có cơ chế xếp hàng tự nhiên của `useGameStore`.
2. **FM2: Bẫy xóa sớm cờ nhịp thở (`clearRoom` Premature Teardown)**:
   - *Biện pháp*: Tuyệt đối không xóa trong `clearRoom`. Cờ chỉ được xóa khi tiêu thụ trong `scheduleBotStep` hoặc giải phóng rò rỉ trong `destroyRoom`.
3. **FM3: Tiền thuê ma (Ghost Rent) trong giao dịch P2P**:
   - *Biện pháp*: Đưa `cellDelta.ownerId` và `prevOwnerId` vào `handledPayerIds`/`handledReceiverIds` trước khi gọi `matchRentTransactions`.
4. **FM4: Bắn trùng lặp kết quả HOSE**:
   - *Biện pháp*: Quản lý khóa deduplication `${hr.playerId}_${hr.timestamp}_${hr.roll}` và cung cấp hàm `resetHoseActivityTracker()`.
5. **FM5: Vỡ Trần Ngân Sách LOC Kế Thừa (`TC-193.16` & `TC-194.18`)**:
   - *Biện pháp*: Viết compact inline formatters và switch cases, giữ `transaction_narrative.ts` $\le 267$ dòng (trần 280) và `activity_badge_dispatcher.ts` $\le 267$ dòng (trần 300).

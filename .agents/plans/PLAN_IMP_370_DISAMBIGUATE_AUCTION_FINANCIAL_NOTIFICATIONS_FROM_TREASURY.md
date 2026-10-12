# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE (LEAN PLAN SPECIFICATION)
# TICKET: IMP-370 — Hardening Auction Dispatchers Deduplication & Event CTA Affordance

> **Mã Nhiệm Vụ:** IMP-370 (Hardening Auction Dispatchers Deduplication & Event CTA Affordance)  
> **Phân hệ mục tiêu:** `client-ui` (Tier 2 UI/Views & Natural Narrative Presentation)  
> **Phân loại rủi ro:** Tier 1 Micro-Slice (Lean Plan Specification, <= 180 lines, Delta <= 30 LOC in `src/**`)  
> **Chỉ tiêu kiểm thử:** Scaled Floor >= 10 atomic tests, Pure Logic Waiver = `true` (Pure algorithmic string parsing & UI badge resolution)  

---

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-370`
- **Subsystem**: `client-ui` (Tier 2 UI/Views & Activity Presentation)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/network/activity_badge_dispatcher.ts` (Refactor)
  - **Target physical file**: `src/client/events/subscribers/property_market_badge_handler.ts` (Refactor)
  - **Target physical file**: `src/client/ui/modals/event_card_visuals.ts` (Refactor)
  - **Target physical file**: `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` (Refactor)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/ui/notification_deduplicator.ts`
  - `src/client/store/game_store.ts`
  - `src/client/ui/transaction_narrative.ts`
  - `src/client/ui/floating_numbers.tsx`

---

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Domain/FSM/Server) | 193 | 200 | +7 | <= 400 | Safe |
| `src/client/events/subscribers/property_market_badge_handler.ts` | Tier 1 (Domain/FSM/Server) | 198 | 199 | +1 | <= 400 | Safe |
| `src/client/ui/modals/event_card_visuals.ts` | Tier 2 (UI/3D/Views) | 324 | 327 | +3 | <= 500 | Safe |
| `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` | Living Test | 130 | 130 | 0 | <= 600 | Safe |

---

## 3. Implementation Steps

### Station 1: Red Contract Test Specifications
**Target physical file**: `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts`
- TC-370.01 [UC-IMP370/MSS]: Given floating text item with actionType auction_win, When resolveTransactionNarrative is executed, Then returns narrative verb "thanh toán" and target without "Kho Bạc".
- TC-370.02 [UC-IMP370/MSS]: Given floating text item with text "-2.350", When rendered in FloatingBadge, Then amount pill displays clean positive string "2.350" without negative sign.
- TC-370.03 [UC-IMP370/MSS]: Given floating text item with actionType unmortgage, When resolveTransactionNarrative is executed, Then returns detail containing "Ngân Hàng" and not "Kho Bạc".
- TC-370.04 [UC-IMP370/MSS]: Given floating text item with actionType unmortgage, When resolveFormulaText is executed, Then returns formula pointing to Ngân Hàng instead of Kho Bạc.
- TC-370.05 [UC-IMP370/MSS]: Given floating text item with actionType bail, When resolveTransactionNarrative is executed, Then returns target without "Kho Bạc".
- TC-370.06 [UC-IMP370/MSS]: Given floating text item with actionType auction_win, When resolveFriendlyReason is executed, Then returns friendly title without "Kho Bạc".
- TC-370.07 [UC-IMP370/MSS]: Given activity log entry with auction_win, When handleAuctionWinBadge is executed, Then floating text title omits Kho Bạc and sets groupId.
- TC-370.08 [UC-IMP370/MSS]: Given synthesized event AUCTION_WON, When property market badge handler processes it, Then floating text title omits Kho Bạc and sets groupId.
- TC-370.09 [UC-IMP370/MSS]: Given multiple auction win items with same groupId, When deduplicateFloatingTexts is executed, Then returns exactly one deduplicated item.
- TC-370.10 [UC-IMP370/MSS]: Given cardId MC_FIRE_INSPECTION and effectDelta 0, When getCardCtaButtonText is executed, Then returns Tiếp Tục (Miễn Phạt) 🧯.

---

### Station 2: Implementation (GREEN)

#### Task 1: Clean Auction Dispatcher Title & Add GroupId in `activity_badge_dispatcher.ts`
**Target physical file**: `src/client/network/activity_badge_dispatcher.ts`
```typescript
<<<<
  if (!act.id.startsWith('auction_win') && !act.message.includes('trúng đấu giá') && !act.message.includes('Búa gõ')) return;
  state.addFloatingText({ text: formatCurrency(act.amount !== undefined ? -Math.abs(act.amount) : 0), type: FloatingTextType.Penalty, playerId: act.playerId ?? '', actionType: 'auction_win', title: cellName ? `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc` : 'Thắng đấu giá BĐS ➔ Nộp Kho Bạc', cellIndex: act.cellIndex });
====
  if (!act.id.startsWith('auction_win') && !act.message.includes('trúng đấu giá') && !act.message.includes('Búa gõ')) return;
  state.addFloatingText({
    text: formatCurrency(act.amount !== undefined ? -Math.abs(act.amount) : 0),
    type: FloatingTextType.Penalty,
    playerId: act.playerId ?? '',
    actionType: 'auction_win',
    title: cellName ? `Thắng đấu giá ${cellName}` : 'Thắng đấu giá BĐS',
    cellIndex: act.cellIndex,
    groupId: act.cellIndex !== undefined ? `auction_win_${act.cellIndex}` : undefined,
  });
>>>>
```

#### Task 2: Clean Auction Badge Title & Add GroupId in `property_market_badge_handler.ts`
**Target physical file**: `src/client/events/subscribers/property_market_badge_handler.ts`
```typescript
<<<<
      const cellName = getCellName(event.cellIndex);
      vfx.getState().triggerPawnReaction(event.winnerId, 'victory_spin', 600);
      state.addFloatingText({
        text: formatCurrency(-event.winningBid),
        type: FloatingTextType.Penalty,
        playerId: event.winnerId,
        actionType: 'auction_win',
        title: `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc`,
        cellIndex: event.cellIndex,
      });
      break;
====
      const cellName = getCellName(event.cellIndex);
      vfx.getState().triggerPawnReaction(event.winnerId, 'victory_spin', 600);
      state.addFloatingText({
        text: formatCurrency(-event.winningBid),
        type: FloatingTextType.Penalty,
        playerId: event.winnerId,
        actionType: 'auction_win',
        title: `Thắng đấu giá ${cellName}`,
        cellIndex: event.cellIndex,
        groupId: `auction_win_${event.cellIndex}`,
      });
      break;
>>>>
```

#### Task 3: Poka-Yoke CTA Button Label for Zero Penalty PCCC in `event_card_visuals.ts`
**Target physical file**: `src/client/ui/modals/event_card_visuals.ts`
```typescript
<<<<
export function getCardCtaButtonText(cardId?: string, effectDelta?: number): string {
  if (cardId === ChanceCardId.CC_MA_FORCE) {
    if (typeof effectDelta === 'number' && effectDelta > 0) {
      return 'Nhận Trợ Cấp M&A • Đóng';
    }
    return 'Đã Thâu Tóm BĐS • Đóng';
  }
  if (cardId && KNOWN_CARD_CTA_BUTTONS[cardId]) {
    return KNOWN_CARD_CTA_BUTTONS[cardId];
  }
  return 'Đã Hiểu / Tiếp Tục';
}
====
export function getCardCtaButtonText(cardId?: string, effectDelta?: number): string {
  if (cardId === ChanceCardId.CC_MA_FORCE) {
    if (typeof effectDelta === 'number' && effectDelta > 0) {
      return 'Nhận Trợ Cấp M&A • Đóng';
    }
    return 'Đã Thâu Tóm BĐS • Đóng';
  }
  if (cardId === MarketCardId.MC_FIRE_INSPECTION && typeof effectDelta === 'number' && effectDelta === 0) {
    return 'Tiếp Tục (Miễn Phạt) 🧯';
  }
  if (cardId && KNOWN_CARD_CTA_BUTTONS[cardId]) {
    return KNOWN_CARD_CTA_BUTTONS[cardId];
  }
  return 'Đã Hiểu / Tiếp Tục';
}
>>>>
```

---

### Station 3: Pre-Filter & Visual Evidence Verification
- Chạy `npm run prefilter -- src/client/network/activity_badge_dispatcher.ts src/client/events/subscribers/property_market_badge_handler.ts src/client/ui/modals/event_card_visuals.ts`
- Chạy `node scripts/check_scope.mjs`
- Chạy `npm run sentinel -- --ticket IMP-370 --test tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts`
- Chạy `node scripts/check_evidence.mjs IMP-370`

---

## 4. Definition of Done (DoD) & Stopping Boundary
1. 10/10 bài test trong `tests/contracts/imp370_auction_and_financial_notification_clarity.test.ts` chuyển sang màu XANH (PASS).
2. Khi cả `activity_badge_dispatcher` và `property_market_badge_handler` cùng kích hoạt sự kiện đấu giá, `deduplicateFloatingTexts` chỉ giữ lại đúng 1 toast duy nhất có cùng `groupId: auction_win_${cellIndex}`.
3. Hoàn toàn không còn chữ `➔ Nộp Kho Bạc` trong các thông báo trúng đấu giá BĐS.
4. Thẻ PCCC khi `effectDelta === 0` hiển thị chính xác nút `"Tiếp Tục (Miễn Phạt) 🧯"`.
5. Đạt chuẩn Station 3 Pre-filter (typecheck, LOC limits, zero dirty casts). DỪNG NGAY sau khi hoàn thành Station 4 evidence audit.

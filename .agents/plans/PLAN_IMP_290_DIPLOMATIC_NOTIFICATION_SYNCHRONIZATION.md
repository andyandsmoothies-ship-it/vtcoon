# Implementation Plan: Ticket IMP-290 — Synchronize Diplomatic Card Notification

**Ticket ID**: `IMP-290`  
**Focus**: Standardize Diplomatic Card (`CC_DIPLOMATIC`) notifications in `FloatingBadge` to match existing financial patterns (`{Chủ thể} {Động từ} [{Viên pill}] {Đối tượng tác động}` + `[Căn cứ/Công thức]`).

---

## 1. Problem Statement & Architecture

### Current Glitch & Cognitive Dissonance
When a tenant lands on an opponent's property with `CC_DIPLOMATIC`:
- `handleDiplomaticEventBadge` produces `text: '+6.000 Tr.'` with `type: FloatingTextType.Reward`.
- `resolveTransactionNarrative` generates `verb = 'kích hoạt'`, `target = 'Thẻ Ngoại Giao'`.
- `FloatingBadge` combines these into: `"Bạn kích hoạt [+6.000 Tr.] Thẻ Ngoại Giao"` with emerald green pill styling.
- **Impact**: Players mistake the green `+6.000 Tr.` pill for cash credited to their wallet, causing confusion when balance remains unchanged. Furthermore, the phrasing is grammatically jarring and inconsistent with all other transaction badges.

### Target Synchronized Pattern
- **Tenant (`ev.playerId`)**:
  - `Line 1 (Flow)`: `[🤝] {Chủ thể} được miễn [{Số tiền} Tr.] tiền thuê {Tên Ô} của {Chủ đất}` (e.g. `"Bạn được miễn [6.000 Tr.] tiền thuê Khánh Hòa của bot_2"`).
  - `Pill Styling`: Sky blue (`bg-sky-50 text-sky-700 border-sky-300`) with no `+` sign.
  - `Line 2 (Formula)`: `"Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS"`.
- **Landlord (`ev.landlordId`)**:
  - `Line 1 (Flow)`: `[🤝] {Chủ thể} miễn thu [-{Số tiền} Tr.] tiền thuê {Tên Ô} cho {Khách thuê}` (e.g. `"bot_2 miễn thu [-6.000 Tr.] tiền thuê Khánh Hòa cho Bạn"`).
  - `Pill Styling`: Rose red (`bg-rose-50 text-rose-700 border-rose-300`).
  - `Line 2 (Formula)`: `"Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê"`.

---

## 2. Test Specifications (Station 1 RED)

Contract test file: `tests/contracts/imp290_diplomatic_notification_synchronization.test.ts` (new)

- **TC-290.01 [UC-IMP290/MSS]**: Given diplomatic event for tenant, When handleDiplomaticEventBadge is called, Then tenant badge is emitted with text '6.000 Tr.' without plus sign and actionType 'diplomatic'.
- **TC-290.02 [UC-IMP290/MSS]**: Given diplomatic event for landlord, When handleDiplomaticEventBadge is called, Then landlord badge is emitted with text '-6.000 Tr.' and type FloatingTextType.Penalty.
- **TC-290.03 [UC-IMP290/MSS]**: Given tenant floating item and player info, When resolveTransactionNarrative is executed, Then narrative returns verb 'được miễn' and target 'tiền thuê Khánh Hòa của bot_2'.
- **TC-290.04 [UC-IMP290/MSS]**: Given landlord floating item and player info, When resolveTransactionNarrative is executed, Then narrative returns verb 'miễn thu' and target 'tiền thuê Khánh Hòa cho bot_1'.
- **TC-290.05 [UC-IMP290/MSS]**: Given tenant diplomatic item, When FloatingBadge is rendered, Then amount pill container contains text-sky-700 and bg-sky-50 protective styling.
- **TC-290.06 [UC-IMP290/MSS]**: Given legacy diplomatic item with leading plus in text, When FloatingBadge is rendered, Then amount pill text strips leading plus sign.
- **TC-290.07 [UC-IMP290/MSS]**: Given tenant diplomatic item, When FloatingBadge formula is checked, Then formula text renders 'Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS'.
- **TC-290.08 [UC-IMP290/MSS]**: Given landlord diplomatic item, When FloatingBadge formula is checked, Then formula text renders 'Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê'.

---

## 3. Implementation Details (Station 2 GREEN)

### Target Physical Files

**Target physical file**: `src/client/network/activity_badge_dispatcher.ts`
- In `handleDiplomaticEventBadge`:
  - Change tenant `text` from `+${amt} Tr.` to `${amt} Tr.`.

**Target physical file**: `src/client/ui/transaction_narrative.ts`
- In `resolveTransactionNarrative` case `'diplomatic'`:
  - For tenant:
    - `verb = 'được miễn'`.
    - `target = cellName ? `tiền thuê ${cellName} của ${targetName}` : `tiền thuê của ${targetName}`;`
    - `detail = `(Miễn 100% tiền thuê ${cellName || 'BĐS'} - Tiết kiệm ${amountText})`;`
  - For landlord:
    - `verb = 'miễn thu'`.
    - `target = cellName ? `tiền thuê ${cellName} cho ${targetName}` : `tiền thuê cho ${targetName}`;`
    - `detail = `(Khách dùng Thẻ Ngoại Giao - Hụt thu ${amountText})`;`

**Target physical file**: `src/client/ui/floating_numbers.tsx`
- In `FloatingBadge`:
  - Add pill style for `item.actionType === 'diplomatic' && narrative.isPositive`: `'bg-sky-50 text-sky-700 border-sky-300'`.
  - Strip leading `+` in diplomatic pill display: `{item.actionType === 'diplomatic' && narrative.isPositive ? narrative.amountText : item.text}`.
- In `FloatingNumbersOverlay`:
  - Ensure banner-card mobile responsiveness preserves `isOlderWithBanner` logic (`Boolean(latestMilestone) && displayItems.length > 1 && index === 0`).

**Target physical file (new)**: `tests/contracts/imp290_diplomatic_notification_synchronization.test.ts`

---

## 4. Mechanical Verification Checklist
1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_290_DIPLOMATIC_NOTIFICATION_SYNCHRONIZATION.md --auto-sign`
2. Station 1 RED: verify tests fail on runtime assertions.
3. Station 2 GREEN: all 8 tests pass + `imp196` and `imp216` tests pass.
4. `npm run prefilter -- src/client/network/activity_badge_dispatcher.ts src/client/ui/transaction_narrative.ts src/client/ui/floating_numbers.tsx tests/contracts/imp290_diplomatic_notification_synchronization.test.ts`
5. `npm run check:scope`
6. `npm run report -- IMP-290`

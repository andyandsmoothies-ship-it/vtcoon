# Plan IMP-322: Global Event Banner for Board-Wide Cards

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-322`
- **Subsystem**: `client-ui` (Tier 2 Client UI & Tier 1 Network Delta)
- **Problem Statement**:
  1. **Silent Global Disruption**: When board-wide event cards are triggered (e.g. `MC_MEGA_CONCERT` moving all players to a service venue, `MC_FIRE_INSPECTION` fining all property owners, `MC_RATE_HIKE`, etc.), `syncEventCard` in `apply_delta.ts` currently omits notifications if the card was drawn by the local player (`turnPlayerId !== myPid`).
  2. **Fleeting & Under-Categorized Notice**: When triggered by a bot, the notification is given a brief 2500ms duration and a generic category, disappearing before players realize why their pawns were moved or balances decreased.
- **Architectural Solution**:
  1. In `src/client/store/game_store_subtypes.ts`, add `readonly isBoardWide?: boolean;` to `FloatingTextItem`.
  2. In `src/client/network/apply_delta.ts`, introduce `BOARD_WIDE_CARDS` set and `isBoardWideCard` predicate covering board-wide market cards.
  3. In `syncEventCard`, remove the `turnPlayerId !== myPid` exclusion so all clients display the banner; set `isBoardWide: true`, prioritize `card.effectDetail`, and extend display duration to 5000ms for board-wide cards (4000ms for standard event cards).
  4. In `src/client/ui/floating_numbers.tsx`, update `MilestoneBanner` to recognize `isBoardWide`, display category `'SỰ KIỆN TOÀN BÀN CỜ'` with icon `'📢'`, render with prominent global banner styling, and expose `data-testid="global-event-banner"`.
- **Direct Scope**:
  - `src/client/store/game_store_subtypes.ts`
  - `src/client/network/apply_delta.ts`
  - `src/client/ui/floating_numbers.tsx`
  - `tests/client/imp322_global_event_banner.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/store/game_store.ts`
  - `src/client/network/activity_go_extractor.ts`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/network/activity_rent_matcher.ts`
  - `src/client/ui/transaction_formula.ts`
  - `src/server/insolvency_manager.ts`
  - `src/server/room_manager.ts`
  - `src/server/room_property_coordinator.ts`
  - `tests/server/imp318_off_turn_debtor_downgrade.test.ts`
  - `tests/client/imp319_causal_notification_clarity.test.ts`
  - `tests/server/imp320_fsm_restoration_and_deep_coordinator.test.ts`
  - `tests/client/imp321_mortgage_interest_go_disclosure.test.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/store/game_store_subtypes.ts` | Tier 1 (Domain/Server/Logic) | 218 | 219 | +1 | <= 400 | ✔️ Safe |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/Server/Logic) | 215 | 229 | +14 | <= 400 | ✔️ Safe |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI/3D/Views) | 353 | 360 | +7 | <= 500 | ✔️ Safe |
| `tests/client/imp322_global_event_banner.test.ts` | Living Test | 0 | ~160 | +160 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp322_global_event_banner.test.ts` (Tệp mới)

Test Specifications:
- TC-322.01 [UC-GLOB-BAN/MSS]: Given MC_MEGA_CONCERT event card, When isBoardWideCard is queried, Then returns true identifying board-wide scope.
- TC-322.02 [UC-GLOB-BAN/MSS]: Given delta with MC_MEGA_CONCERT drawn by bot_4, When syncEventCard executes, Then adds floating text with isBoardWide=true, 5000ms duration, and prioritized effectDetail.
- TC-322.03 [UC-GLOB-BAN/MSS]: Given delta with board-wide card drawn by local player (myPid), When syncEventCard executes, Then adds floating text without dropping notification.
- TC-322.04 [UC-GLOB-BAN/A1]: Given standard non-board-wide event card, When syncEventCard executes, Then sets isBoardWide=false and 4000ms duration.
- TC-322.05 [UC-GLOB-BAN/MSS]: Given floating text item with isBoardWide=true, When MilestoneBanner renders, Then renders with testid 'global-event-banner' and category 'SỰ KIỆN TOÀN BÀN CỜ'.
- TC-322.06 [UC-GLOB-BAN/A2]: Given MilestoneBanner with standard market card, When rendered, Then maintains category 'SỰ KIỆN THỊ TRƯỜNG' and testid 'event-card-notification-banner'.

### Station 2: Implementation (GREEN)

#### Task 2.1: Extend FloatingTextItem in `game_store_subtypes.ts`
**Target physical file**: `src/client/store/game_store_subtypes.ts`

```typescript
<<<<
  readonly formula?: string;
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles';
  readonly groupId?: string;
}
====
  readonly formula?: string;
  readonly bailKind?: 'voluntary' | 'forced' | 'doubles';
  readonly groupId?: string;
  readonly isBoardWide?: boolean;
}
>>>>
```

#### Task 2.2: Add Board-Wide Predicate & Sync in `apply_delta.ts`
**Target physical file**: `src/client/network/apply_delta.ts`

```typescript
<<<<
  if (card && card.cardId && card.cardId !== prevCard?.cardId) {
    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
    const turnPlayerId = card.drawnBy ?? card.playerId ?? delta?.currentTurnPlayerId ?? delta?.diceRollerId ?? state.currentTurnPlayerId;
    if (turnPlayerId && turnPlayerId !== myPid) {
      state.addFloatingText({
        actionType: card.cardType ?? 'chance',
        playerId: turnPlayerId,
        title: card.title,
        text: card.description || card.effectDetail || '',
        type: (card.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
        durationMs: 2500,
      });
    }
  }
====
  if (card && card.cardId && card.cardId !== prevCard?.cardId) {
    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
    const turnPlayerId = card.drawnBy ?? card.playerId ?? delta?.currentTurnPlayerId ?? delta?.diceRollerId ?? state.currentTurnPlayerId ?? myPid;
    const isBoardWide = isBoardWideCard(card.cardId);
    state.addFloatingText({
      actionType: card.cardType ?? 'chance',
      playerId: turnPlayerId,
      title: card.title,
      text: card.effectDetail || card.description || '',
      type: (card.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
      durationMs: isBoardWide ? 5000 : 4000,
      isBoardWide,
    });
  }
>>>>
```

```typescript
<<<<
export function syncEventCard(
====
export const BOARD_WIDE_CARDS: ReadonlySet<string> = new Set([
  'MC_MEGA_CONCERT', 'MC_FIRE_INSPECTION', 'MC_RATE_HIKE',
  'MC_FREEZE_TRADE', 'MC_ANTI_SPECULATE', 'MC_FUEL_SURGE',
  'MC_CREDIT_STIMULUS', 'MC_PUBLIC_INVEST', 'MC_COASTAL_STORM',
  'MC_PEAK_TOURISM', 'MC_CASINO_PILOT', 'MC_NIGHT_ECONOMY',
  'MC_ALCOHOL_CHECK', 'MC_LAND_FEVER', 'MC_URBAN_PLANNING',
  'MC_UTILITY_DOUBLE',
]);

export function isBoardWideCard(cardId?: string): boolean {
  return Boolean(cardId && BOARD_WIDE_CARDS.has(cardId));
}

export function syncEventCard(
>>>>
```

#### Task 2.3: Upgrade MilestoneBanner in `floating_numbers.tsx`
**Target physical file**: `src/client/ui/floating_numbers.tsx`

```typescript
<<<<
  const isEventCard = item.actionType === 'chance' || item.actionType === 'market';
  const testId = isEventCard ? 'event-card-notification-banner' : 'milestone-celebration-banner';
  const borderShadowStyle = item.actionType === 'market'
    ? 'border-cyan-500/80 shadow-md shadow-cyan-900/10'
    : item.actionType === 'bankrupt'
    ? 'border-rose-500/80 shadow-md shadow-rose-900/10'
    : 'border-amber-500/80 shadow-md shadow-amber-900/10';
====
  const isBoardWide = Boolean(item.isBoardWide);
  const isEventCard = item.actionType === 'chance' || item.actionType === 'market';
  const testId = isBoardWide
    ? 'global-event-banner'
    : isEventCard
    ? 'event-card-notification-banner'
    : 'milestone-celebration-banner';
  const borderShadowStyle = isBoardWide
    ? 'border-indigo-500/90 shadow-lg shadow-indigo-900/15 bg-gradient-to-r from-amber-50/95 via-white to-indigo-50/95'
    : item.actionType === 'market'
    ? 'border-cyan-500/80 shadow-md shadow-cyan-900/10'
    : item.actionType === 'bankrupt'
    ? 'border-rose-500/80 shadow-md shadow-rose-900/10'
    : 'border-amber-500/80 shadow-md shadow-amber-900/10';
>>>>
```

```typescript
<<<<
  const resolveCategory = () => {
    switch (item.actionType) {
      case 'market': return 'SỰ KIỆN THỊ TRƯỜNG';
      case 'chance': return 'THẺ CƠ HỘI';
====
  const resolveCategory = () => {
    if (isBoardWide) return 'SỰ KIỆN TOÀN BÀN CỜ';
    switch (item.actionType) {
      case 'market': return 'SỰ KIỆN THỊ TRƯỜNG';
      case 'chance': return 'THẺ CƠ HỘI';
>>>>
```

### Station 3: Verification & Mechanical Gates
- Fast Pre-Filter: `npm run prefilter -- src/client/store/game_store_subtypes.ts src/client/network/apply_delta.ts src/client/ui/floating_numbers.tsx tests/client/imp322_global_event_banner.test.ts`
- Live Sentinel & Mutation Gate: `npm run sentinel -- --ticket IMP-322 --test tests/client/imp322_global_event_banner.test.ts`
- Scope Auditor: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_322_GLOBAL_EVENT_BANNER.md`
- Comprehensive Evidence Audit: `node scripts/check_evidence.mjs IMP-322`

# Lean Plan: IMP-445 Collapsible Mini Player HUD & Board Visibility Rail

> **Ticket:** `IMP-445`  
> **Classification:** Tier 2 UI & Tactile Ergonomics Architecture  
> **Subsystem Boundaries:** `src/client/ui/`, `src/client/store/`, `tests/contracts/`  
> **Adversarial Hardening:** Hardened against [ADV-01] to [ADV-07] from `.agents/audit/PLAN_CHALLENGE_IMP-445.md`.

---

## 1. Principles Applied

- **[View-Model Seam Extraction]** -> Pure compact chip formatting and layout extracted into `player_hud_mini_chips.tsx`, keeping `player_hud_list.tsx` lightweight and safely below Tier 2 ceilings.
- **[Equivalence-Partition Testing]** -> Contract suite verifies full vs compact container widths, aria attributes, active turn borders, bankrupt states, and cash labels across boundary conditions.
- **[Poka-Yoke Domain Affordance]** -> Collapse button provides touch target >= 44px (`min-h-[44px] min-w-[44px]` per Pillar V Gotchas), directional chevron (`◀` / `▶`), and explicit `aria-expanded` and `aria-label`.
- **[100% DTO & Call-Site Wiring]** -> Wire store slice `isPlayerHudCompact` and action `togglePlayerHudCompact` directly to production DOM trigger and drawer width. Uses SSOT `PlayerHudInfo` (`balance`, `tokenColor`, `bankrupt`).
- **[Dropped Requirements & Anti-Phantom Complexity]** -> Fixed rail toggle only; no free-form drag-and-drop windows or layout customization.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/store/game_store_state_types.ts` | Tier 3 (Types) | 200 | 204 | +4 | 800 | Safe |
| `src/client/store/game_store.ts` | Tier 1 (Logic) | 195 | 199 | +4 | 400 | Safe |
| `src/client/ui/player_hud_mini_chips.tsx` | Tier 2 (UI - New) | 0 | 65 | +65 | 500 | Safe |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (UI) | 38 | 62 | +24 | 500 | Safe |
| `tests/contracts/imp445_full_board_overview_and_collapsible_hud.test.ts` | Living Test (New) | 0 | 180 | +180 | 600 | Safe |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-445.01: Collapsible Player HUD Rail Invariant]**:
   - `player_hud_list.tsx` renders a toggle button `data-testid="player-hud-collapse-btn"`.
   - When `isPlayerHudCompact` is false (Full mode): Container width is `w-44 sm:w-48 md:w-64 max-w-[calc(100vw-6rem)]`, rendering full `PlayerCard` items.
   - When `isPlayerHudCompact` is true (Compact mode): Container width is constrained to `w-14 sm:w-16` (<= 64px), freeing >= 190px of horizontal space on desktop (and >= 120px on mobile) to fully reveal eastern tiles #24–#30 and corner #30 (Lệnh Thanh Tra).
   - [ADV-04]: Forbid Tailwind `fixed` class on `PlayerHudList` and collapse button (preserves `imp201` and `imp205` living assertions).

2. **[INV-445.02: Mini Avatar Chip Affordance Invariant]**:
   - In compact mode, `player_hud_mini_chips.tsx` consumes `PlayerHudInfo` ([ADV-01]) and renders each player as a tactile button `data-testid="player-mini-chip-[playerId]"`.
   - Displays avatar circle with `player.tokenColor` (fallback `#38BDF8`), active turn pulsing border when `player.id === currentTurnPlayerId`, and formatted balance (`13.2M` or `120k`).
   - [ADV-06]: If `player.bankrupt` is true, renders with `opacity-40 grayscale` and displays `💀 Phá sản`.
   - Clicking any mini chip invokes `onExpand` to toggle back to full view.

3. **[INV-445.03: Reactive Store Wire & Isolation Seam]**:
   - `game_store_state_types.ts` declares `isPlayerHudCompact: boolean` and `togglePlayerHudCompact: () => void`.
   - [ADV-02]: `INITIAL_GAME_STATE` initializes `isPlayerHudCompact: false`. Test suites clean up with `afterEach(() => useGameStore.setState({ isPlayerHudCompact: false }))` to prevent singleton pollution.

4. **[INV-445.04: Touch Ergonomics & Pointer-Events Invariant]**:
   - [ADV-03]: `player-hud-collapse-btn` enforces Pillar V Gotchas `min-h-[44px] min-w-[44px]` touch target floor.
   - [ADV-05]: Collapse button explicitly defines `pointer-events-auto` to prevent clicks passing through to 3D canvas.
   - [ADV-07]: Chevron mapping on east flank: `isPlayerHudCompact ? '◀' : '▶'` with explicit `aria-expanded={!isPlayerHudCompact}` and `aria-label`.

---

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)

- ❌ **NO Draggable Floating Windows**: Fixed right-edge rail collapse only.
- ❌ **NO Dynamic 3D Board Scaling**: 3D board geometry remains strictly 18x18.
- ❌ **NO Complex CSS Animation Libraries**: Clean Tailwind transitions (`transition-all duration-300`).
- ❌ **NO Cross-Subsystem Bundling**: 3D overview elevation tuning is cleanly segregated to follow-up ticket IMP-446.

---

## 5. Specification for New File: `src/client/ui/player_hud_mini_chips.tsx`

```typescript
import React from 'react';
import type { PlayerHudInfo } from '../store/game_store_types.js';

export interface PlayerHudMiniChipsProps {
  readonly playerList: readonly PlayerHudInfo[];
  readonly currentTurnPlayerId?: string | null;
  readonly onExpand?: () => void;
}

export function formatCompactBalance(balance: number): string {
  const abs = Math.abs(balance);
  const sign = balance < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  return `${sign}${Math.round(abs / 1_000)}k`;
}

export function PlayerHudMiniChips({
  playerList,
  currentTurnPlayerId,
  onExpand,
}: PlayerHudMiniChipsProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-2 w-full items-end" data-testid="player-hud-mini-chips-container">
      {playerList.map((player) => {
        const isCurrentTurn = player.id === currentTurnPlayerId;
        const formattedCash = formatCompactBalance(player.balance);
        const isBankrupt = Boolean(player.bankrupt);

        return (
          <button
            key={player.id}
            type="button"
            data-testid={`player-mini-chip-${player.id}`}
            onClick={onExpand}
            title={`${player.name} (${isBankrupt ? 'Phá sản' : formattedCash})`}
            aria-label={`${player.name}, ${isBankrupt ? 'đã phá sản' : formattedCash}`}
            className={`min-h-[44px] min-w-[44px] flex flex-col items-center justify-center p-1 rounded-xl backdrop-blur-md transition-all cursor-pointer pointer-events-auto ${
              isBankrupt
                ? 'opacity-40 grayscale bg-slate-900/60 border border-slate-800'
                : isCurrentTurn
                ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                : 'bg-slate-900/80 border border-slate-700'
            }`}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
              style={{ backgroundColor: player.tokenColor || '#38BDF8' }}
            >
              {player.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-300 mt-0.5">
              {isBankrupt ? '💀' : formattedCash}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

### Call-Site Wiring in Consumer `src/client/ui/player_hud_list.tsx`
- **Target physical file**: `src/client/ui/player_hud_list.tsx`
- Production Consumer: `player_hud_list.tsx` imports and renders `PlayerHudMiniChips` when `isPlayerHudCompact` is true, passing `playerList: playerList as PlayerHudInfo[]`, `currentTurnPlayerId`, and `onExpand={togglePlayerHudCompact}`.

---

## 6. Station 1 Test Contracts (`tests/contracts/imp445_full_board_overview_and_collapsible_hud.test.ts`)

- `TC-445.01` `[UC-STORE-COMPACT-TOGGLE/MSS]`: Given `game_store`, When dispatching action to toggle compact HUD, Then toggles `isPlayerHudCompact` boolean state deterministically and cleans up in `afterEach`.
- `TC-445.02` `[UC-PLAYER-HUD-RAIL-WIDTH/MSS]`: Given `PlayerHudList`, When `isPlayerHudCompact` is false, Then renders container with `w-44 sm:w-48 md:w-64`; When true, renders compact rail `w-14 sm:w-16` without Tailwind `fixed` class.
- `TC-445.03` `[UC-MINI-CHIPS-RENDERING-AND-A11Y/MSS]`: Given `PlayerHudMiniChips` with 4 players (including active and bankrupt), When rendered, Then outputs mini chips with `PlayerHudInfo` balance, `tokenColor`, and bankrupt indicators.
- `TC-445.04` `[UC-COLLAPSE-AFFORDANCE-AND-CHEVRON/MSS]`: Given collapse toggle button, When inspecting DOM attributes, Then exposes `data-testid="player-hud-collapse-btn"`, `pointer-events-auto`, touch target `min-h-[44px] min-w-[44px]`, and chevron `◀` / `▶`.
- `TC-445.05` `[UC-RELATIONAL-WIDTH-AND-SPACE-SAVING/MSS]`: Given compact vs full mode dimensions, When comparing CSS boundaries, Then compact rail is strictly <= 64px, freeing >= 190px on desktop and >= 120px on mobile.

---

## 7. Station 3 Verification & Stopping Criteria (DoD)

- Fast Pre-Filter: `npm run prefilter -- src/client/store/game_store.ts src/client/ui/player_hud_list.tsx src/client/ui/player_hud_mini_chips.tsx tests/contracts/imp445_full_board_overview_and_collapsible_hud.test.ts`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_445_FULL_BOARD_OVERVIEW_AND_COLLAPSIBLE_HUD.md`
- Visual Capture: `node scripts/visual_capture.mjs --ticket IMP-445 --scenario board_ownership_monopoly`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-445 --test tests/contracts/imp445_full_board_overview_and_collapsible_hud.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-445`
- Definition of Done:
  - 100% contract tests pass GREEN.
  - Zero regression across all living player HUD tests (`imp201`, `imp205`, `imp251`, `imp372`, `imp430`).
  - Chaos Sentinel kills 100% mutants.
  - `docs/FEATURE_MAP.md` updated and <= 30 KB.

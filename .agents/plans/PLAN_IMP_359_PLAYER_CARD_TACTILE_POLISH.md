# Plan IMP-359: Player Card Tactile Polish, TopBar Leave Clearance & Dual-Viewport Hard Gate (Ticket IMP-359)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope**: Shipped Bot Camera catch-up boost and mobile portrait framing (IMP-358).
- **Craft Audit & Problem Statement**:
  1. **Unowned Dot Contrast Inconsistency**: Unowned property dots use `bg-slate-100/70`. On active turn card (`bg-amber-50/70`), unowned dots appear as opaque grayish-white solid pills, causing confusion as if properties were already owned at Turn 1/40.
  2. **Active Turn Card Background Distortion**: `bg-amber-50/70` alters chromatic perception of Brown, Orange, and Yellow dots.
  3. **Player Card Height Bloat**: Stacking cash and net worth into a 2-tier column on mobile inflated 4-card HUD height to 442px/740px (60% screen height), suffocating the 3D board view.
  4. **TopBar Leave Button Clipping**: On mobile 360px, TopBar right cluster overflows by >50px, completely cutting off the `leave-room-button` behind `overflow-hidden`. On desktop, `sm:max-w-4xl` (896px) clamped the capsule while contents required 927px, causing the leave button to stick out past the right capsule border into empty space.
  5. **Conversation-Only Promise Gap**: UI verification lacked a hard mechanical gate in `scripts/check_evidence.mjs` to block sign-off when Dual-Viewport screenshots are missing or when elements overflow.
- **Architectural Remediation**:
  1. **Consistent Hollow Dot Styling**: Change unowned dots to `UNOWNED_DOT_CLASS = 'border border-slate-300 bg-transparent'`.
  2. **Active Turn Opaque Card Base**: Retain consistent `#FFFDF8` card background on active/inactive cards, signaling active turn strictly through `border-amber-500 ring-2 ring-amber-400 shadow-[0_6px_0_0_#0f172a]`.
  3. **Inline Single-Row Card Header**: Display both cash and net worth side-by-side on a single horizontal row (`flex items-center justify-end gap-1`) with `PlayerNetWorthBadge` using `inline-flex` (`text-[10px]` on mobile, `text-[11px]` on desktop), maintaining mobile card height at <= 98px and preventing the 50px HUD bloat.
  4. **TopBar Responsive Clearance & Desktop Width Expansion**: Gracefully collapse secondary `quick-rules-topbar-btn` on ultra-narrow viewports (<400px) with `hidden min-[400px]:inline-flex sm:inline-flex`, expand desktop max-width from `sm:max-w-4xl` to `sm:max-w-5xl` (1024px) to fully enclose the leave button within the white capsule, equalize container horizontal padding (`min-[360px]:px-2 sm:px-4`), and add `shrink-0` to the leave icon.
  5. **Mechanical Dual-Viewport Enforcement**: Upgrade `scripts/check_evidence.mjs` to fail (exit 1) if modified UI/3D files lack both `_desktop` and `_mobile` screenshots, or if the leave button pokes outside the topbar capsule.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-359`
- **Subsystem**: `client-ui` (Tier 2 UI Views)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/ui/player_net_worth_badge.tsx` (Tệp mới)
  - **Target physical file**: `src/client/ui/player_card.tsx` (Refactor)
  - **Target physical file**: `src/client/ui/top_bar.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp359_player_card_tactile_polish.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/domain/board_config.ts`, `src/domain/theme.ts`, `src/client/ui/ui_helpers.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/ui/player_net_worth_badge.tsx` | Tier 2 (UI/3D/Views) | 18 | 18 | 0 | <= 500 | Safe |
| `src/client/ui/player_card.tsx` | Tier 2 (UI/3D/Views) | 398 | 398 | 0 | <= 500 | Safe |
| `src/client/ui/top_bar.tsx` | Tier 2 (UI/3D/Views) | 267 | 267 | 0 | <= 500 | Safe |
| `tests/client/imp359_player_card_tactile_polish.test.ts` | Living Test | 102 | 102 | 0 | <= 600 | Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write contract tests in `tests/client/imp359_player_card_tactile_polish.test.ts`:
  - TC-359.01 [UC-POLISH-ACTIVE-BG/MSS]: Given active turn PlayerCard, When rendered, Then background is `#FFFDF8` and ring is `ring-amber-400`.
  - TC-359.02 [UC-POLISH-NET-WORTH-MOBILE/MSS]: Given player on desktop viewport, When rendered, Then net worth indicator `data-testid="player-net-worth"` displays parenthesized format.
  - TC-359.03 [UC-POLISH-HOLLOW-DOT/MSS]: Given unowned property cells in PlayerCard, When rendered, Then dot cell contains `bg-transparent` and preserves `border-slate-300`.
  - TC-359.04 [UC-POLISH-INFRA-HOLLOW-DOT/MSS]: Given unowned railroad and utility cells in PlayerCard, When rendered, Then dot cells contain `bg-transparent`.
  - TC-359.05 [UC-POLISH-NET-WORTH-BADGE/MSS]: Given PlayerNetWorthBadge component, When rendered with netWorth, Then renders parenthesized format inline on both mobile and desktop.
  - TC-359.06 [UC-POLISH-TOPBAR-LEAVE-CLEARANCE/MSS]: Given TopBar rendered on screen, When rendered, Then quick-rules-topbar-btn collapses on narrow mobile with hidden min-[400px]:inline-flex.
  - TC-359.07 [UC-POLISH-TOPBAR-CONTAINER-PADDING/MSS]: Given TopBar container, When rendered, Then horizontal padding is symmetric min-[360px]:px-2 preventing right-side button drift.
  - TC-359.08 [UC-POLISH-TOPBAR-LEAVE-SHRINK/MSS]: Given TopBar leave-room-button, When rendered, Then icon has shrink-0 to prevent narrow viewport distortion.
  - TC-359.09 [UC-POLISH-TOPBAR-DESKTOP-CAPSULE/MSS]: Given TopBar container on desktop, When rendered, Then container enforces max-width sm:max-w-5xl fully enclosing leave-room-button.

### Station 2: Implementation (GREEN)

#### Task 2.1: Code Specification for PlayerNetWorthBadge
**Target physical file**: `src/client/ui/player_net_worth_badge.tsx` (Tệp mới)

```typescript
export interface PlayerNetWorthBadgeProps {
  readonly netWorth: number;
}
```

#### Task 2.2: Refactor PlayerCard Component
**Target physical file**: `src/client/ui/player_card.tsx`

```tsx
<<<<
        className="flex items-center justify-end gap-1.5 shrink-0 text-right"
====
        className="flex items-center justify-end gap-1 shrink-0 text-right"
>>>>
```

#### Task 2.3: Refactor TopBar Component
**Target physical file**: `src/client/ui/top_bar.tsx`

```tsx
<<<<
        className="pointer-events-auto relative flex items-center justify-between gap-1 min-[360px]:gap-1.5 sm:gap-3 md:gap-4 bg-[#FFFDF8] border border-slate-300/80 shadow-lg shadow-slate-900/10 rounded-2xl p-1.5 sm:p-2 pl-1.5 pr-2 min-[360px]:px-2 sm:px-4 w-full sm:w-auto max-w-[calc(100vw-0.75rem)] sm:max-w-4xl text-slate-900 select-none"
====
        className="pointer-events-auto relative flex items-center justify-between gap-1 min-[360px]:gap-1.5 sm:gap-3 md:gap-4 bg-[#FFFDF8] border border-slate-300/80 shadow-lg shadow-slate-900/10 rounded-2xl p-1.5 sm:p-2 pl-1.5 pr-2 min-[360px]:px-2 sm:px-4 w-full sm:w-auto max-w-[calc(100vw-0.75rem)] sm:max-w-5xl text-slate-900 select-none"
>>>>
```

### Station 3: Verification
- Fast pre-filter: `npm run prefilter -- src/client/ui/player_card.tsx src/client/ui/player_net_worth_badge.tsx src/client/ui/top_bar.tsx`
- Run living regression suites:
  - `npx vitest run tests/client/imp173_player_card_property_clusters.test.ts`
  - `npx vitest run tests/client/imp187_player_card_compact_hud.test.ts`
  - `npx vitest run tests/client/imp228_subtle_property_trading_indicators.test.ts`
  - `npx vitest run tests/contracts/imp251_player_hud_viewport_harmonics.test.ts`
  - `npx vitest run tests/contracts/imp238_mobile_typography_and_micro_ergonomics.test.ts`
  - `npx vitest run tests/client/imp323_ingame_quick_rules.test.ts`
  - `npx vitest run tests/contracts/imp201_topbar_overflow_and_hud_fixes.test.ts`
  - `npx vitest run tests/contracts/imp190_specialized_devices_and_camera_snap.test.ts`
  - `npx vitest run tests/client/imp359_player_card_tactile_polish.test.ts`
- Physical visual capture verification: `npm run capture:visual -- --ticket IMP-359 --dual-viewport --scenario dice_rolling`
- Comprehensive evidence check: `node scripts/check_evidence.mjs 359`

# PLAN_IMP_451: Desktop Viewport Ergonomics & Holistic Non-Occlusion Architecture

## 1. Principles Applied
- **[Spatial AABB / Non-Occlusion]** -> Constrain `PlayerHudList` to `md:w-56` (224px sweet spot) with `max-h-full overflow-y-auto scrollbar-none`, preserving parent `overflow-hidden` to prevent click hijacking over `ActionDock`.
- **[View-Model Seam Extraction]** -> Smart Accordion in `player_card.tsx` replaces `hidden sm:flex` with unified `hidden` vs `flex` controlled by `isExpanded`, eliminating forced desktop card expansion.
- **[Equivalence-Partition Testing]** -> Contract suite verifies: (1) 4-player visible mounting parity under 532px height, (2) Smart accordion collapse on desktop without `sm:flex` override, (3) Retained WCAG 2.2 AA 24x24px close button and focus rings, (4) Living test contract modernization across 3 suites.
- **[Dropped Requirements & Anti-Phantom Complexity]** -> Strictly preserve existing text templates, formulas, and close button contracts without adding complex window managers or dragging handlers.
- **[100% DTO & Call-Site Wiring]** -> Wire frosted parchment glassmorphism and compact layout rules directly into production UI components.

## 2. Target Files & Scope
> **Harness Modification Scope**: `[HARNESS_MUTATION_AUTHORIZED]` declared for `scripts/sentinel_probes/IMP-451.json` (Chaos Sentinel targeted probe specification).

| Physical File | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/player_card.tsx` | Tier 2 (UI) | 226 | 226 | 0 | 500 | Safe |
| `src/client/ui/player_hud_list.tsx` | Tier 2 (UI) | 52 | 52 | 0 | 500 | Safe |
| `src/client/ui/hud_container.tsx` | Tier 2 (UI) | 135 | 135 | 0 | 500 | Safe |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI) | 368 | 368 | 0 | 500 | Safe |
| `tests/client/chunky_hud_layout.test.ts` | Living Tests | 434 | 434 | 0 | 600 | Modernized |
| `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts` | Living Tests | 301 | 301 | 0 | 600 | Modernized |
| `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts` | Living Tests | 256 | 256 | 0 | 600 | Modernized |
| `tests/client/imp451_desktop_viewport_ergonomics.test.ts` | Living Tests (New) | 167 | 167 | 0 | 600 | Safe |

## 3. Physical Surface Area & Root Cause
- **Surface Area**: `src/client/ui/player_card.tsx`, `src/client/ui/player_hud_list.tsx`, `src/client/ui/hud_container.tsx`, `src/client/ui/floating_numbers.tsx`.
- **Root Cause**:
  1. **Tailwind `sm:flex` Trap & Player Overflow**: In `player_card.tsx#L209`, `hidden sm:flex` unconditionally forces 28 property dots open on all desktop screens (`sm:` >= 640px), inflating 4 cards to ~352px. During trades, `isTradingParty` inflates both sides to > 400px.
  2. **Click Hijacking Hazard**: Changing parent container to `overflow-visible` would cause cards to spill over and intercept clicks on `ActionDock` and `InlineBotTradeStrip`.
  3. **Eastern Board Tile Occlusion**: Desktop player cards are 256px wide (`md:w-64`) with opaque white styling, covering eastern tiles #22–#29.
  4. **Bulky Left Toast Stacking**: In `floating_numbers.tsx`, stacked cards at `md:left-4 md:top-20` reach ~230px height, covering western tiles #10–#13.

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)
- ❌ **NO Sub-24px Touch Target**: Retains `min-w-[24px] min-h-[24px]` and `focus-visible:ring-2` on close button to strictly adhere to WCAG 2.2 SC 2.5.8 and preserve living tests in `imp253` and `imp278`.
- ❌ **NO `overflow-visible` on Middle Container**: Middle flex wrapper retains `overflow-hidden` to guarantee zero click interception on `ActionDock` and `InlineBotTradeStrip`.
- ❌ **NO Narrow `md:w-52` Squeeze**: Replaced with `md:w-56` (224px sweet spot) to preserve 10+ characters for player names alongside overdraft pills.
- ❌ **NO Text Structure or Formula Mutation**: User explicitly mandated "không chỉnh sửa cấu trúc text của tôi". All narrative keys, formulas, and labels remain 100% untouched.

## 5. Specification for Modifications & Call-Site Wiring
### 5.1 `src/client/ui/player_card.tsx`
- Accordion & Tailwind `sm:flex` Remediation:
  - Define unified `isExpanded = isCurrentTurn || (isTradingParty && isUserExpanded) || isUserExpanded`.
  - Replace `${!isExpandedOnMobile ? 'hidden sm:flex' : 'flex'}` with `${!isExpanded ? 'hidden' : 'flex'}` on `player-property-clusters`. Removes `sm:flex` override so desktop non-active players collapse to ~36px.
  - Retain `title={`Thấu chi: còn ${player.overdraftRoundsLeft ?? 3} vòng`}` and keep responsive text format to preserve `chunky_hud_layout.test.ts`.

### 5.2 `src/client/ui/player_hud_list.tsx`
- Width Sweet Spot & Internal Scroll Hygiene:
  - Update width class from `md:w-64` to `md:w-56` (224px sweet spot).
  - Add `max-h-full overflow-y-auto scrollbar-none` to `PlayerHudList` aside container to ensure internal smooth scrolling without breaking out of bounds.

### 5.3 `src/client/ui/hud_container.tsx`
- Anti-Click-Hijacking Layout:
  - Preserve `overflow-hidden` on middle container ([hud_container.tsx#L76](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/ui/hud_container.tsx#L76)), ensuring `PlayerCard` never overlaps `ActionDock` or `InlineBotTradeStrip`.

### 5.4 `src/client/ui/floating_numbers.tsx`
- Compact Frosted Glassmorphism with WCAG 2.2 AA Hit Target:
  - In `FloatingBadge`, use `bg-[#FFFDF8]/90 backdrop-blur-md border border-slate-300/80 text-slate-900 shadow-md` with compact padding `px-2.5 py-1`.
  - Retain accessible close button with full WCAG 2.2 AA target size:
    `min-w-[24px] min-h-[24px] text-[10px] text-slate-400 hover:text-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400` with `aria-label="Đóng thông báo"`.
  - Preserve 100% of user text structures, wording, formulas, and labels verbatim.

### 5.5 Living Contract Modernization Protocol
- In `tests/client/imp372_mobile_ergonomics_and_toast_deescalation.test.ts` and `tests/client/imp373_player_card_tap_expand_and_trade_dual_inspection.test.ts`: modernize test assertions from `hidden sm:flex` to `hidden`.
- In `tests/client/chunky_hud_layout.test.ts`: verify negative balance and overdraft label compatibility under plan authorization.

## 6. Station 1 Test Specifications
- `tests/client/imp451_desktop_viewport_ergonomics.test.ts`:
  - `[TC-451.01/MSS][UC-IMP451/MSS][Facet-1/Boundary]`: Given non-active player on desktop, When `PlayerCard` renders, Then property dots container contains `hidden` and does not contain `sm:flex`.
  - `[TC-451.02/MSS][UC-IMP451/MSS][Facet-2/Reactivity]`: Given active turn player on desktop, When `PlayerCard` renders, Then property dots container contains `flex` without `hidden`.
  - `[TC-451.03/MSS][UC-IMP451/MSS][Facet-1/Boundary]`: Given desktop viewport, When `PlayerHudList` renders, Then container width is constrained by `md:w-56` and contains `overflow-y-auto`.
  - `[TC-451.04/MSS][UC-IMP451/MSS][Facet-3/Ergonomics]`: Given middle hud container, When `HudContainer` renders, Then middle wrapper retains `overflow-hidden` preventing click interception on `ActionDock`.
  - `[TC-451.05/MSS][UC-IMP451/MSS][Facet-3/Ergonomics]`: Given active toasts on desktop, When `FloatingBadge` renders, Then '✕' button maintains `min-w-[24px]` and `min-h-[24px]` with WCAG AA focus rings.
  - `[TC-451.06/MSS][UC-IMP451/MSS][Facet-4/Text-Parity]`: Given transaction item, When `FloatingBadge` renders, Then 100% text structure and narrative content are preserved verbatim.

## 7. Definition of Done (DoD) & Verification
1. 100% passing tests in `tests/client/imp451_desktop_viewport_ergonomics.test.ts` (6/6 tests).
2. All living test suites pass with 0 regressions (`chunky_hud_layout`, `imp372`, `imp373`, `imp201`, `imp253`, `imp450`).
3. All 4 player cards visible on desktop with zero vertical clipping under 532px viewport height.
4. Mechanical prefilter passes with 0 errors (`npm run prefilter`).
5. Physical visual verification via `node scripts/capture_visual_evidence.mjs --ticket IMP-451 --scenario player_hud_compact` and `node scripts/check_evidence.mjs IMP-451`.

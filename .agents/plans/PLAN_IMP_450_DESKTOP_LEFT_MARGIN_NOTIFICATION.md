# Lean Plan: IMP-450 Desktop Left Margin Notification Streamlining & Zero-Occlusion Ergonomics

> **Ticket:** `IMP-450`  
> **Classification:** Tier 2 Desktop UI/UX & Spatial Ergonomics Architecture  
> **Subsystem Boundaries:** `src/client/ui/`, `tests/client/`, `tests/contracts/`  
> **Source Problem:** On Desktop overview camera, notification toasts (`FloatingNumbersOverlay`) pop up over northern tiles #14–#20 (Bến Xe, Cái Mép, Ô #20) causing severe visual occlusion of pawns and dice rolls.

---

## 1. Principles Applied

- **[Spatial AABB / Non-Occlusion]** -> Relocate Desktop notification stack from center-right (`md:right-[18.5rem]`) to the Top-Left safe triangular void (`md:left-4 md:max-w-[280px]`), decoupling desktop top offset from `activeMarketCount` (`md:top-20` fixed) to keep toasts strictly within $Y \le 168\text{px}$, leaving $\ge 44\text{px}$ clearance above western board tiles ($Y_{edge} \ge 212\text{px}$).
- **[View-Model Seam Extraction]** -> Pure CSS responsive classes separate mobile centered flow (`left-1/2 -translate-x-1/2`) from desktop left-anchored layout (`md:left-4 md:right-auto md:translate-x-0 md:items-start md:flex`).
- **[Equivalence-Partition Testing]** -> Contract suite verifies: (1) Desktop left-margin positioning classes and alignment, (2) Compact card dimensions and border styling, (3) 100% text structure preservation under user negative constraint, (4) Non-collision with northern board tiles and pawns, (5) Centered modal overlay state.
- **[Dropped Requirements & Anti-Phantom Complexity]** -> Strictly preserve existing text templates and formulas without adding draggable toast coordinates, unrequested user toggles, or new animation libraries.
- **[100% DTO & Call-Site Wiring]** -> Wire compact container classes directly into `FloatingNumbersOverlay` and verify production consumption by `HudContainer`.
- **[HARNESS_MUTATION_AUTHORIZED]** -> Preserves targeted AST mutation rules in `scripts/sentinel_probes/IMP-450.json` for Chaos Sentinel sensitivity verification.

---

## 2. Target Files & LOC Accounting

| Target File | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/ui/floating_numbers.tsx` | Tier 2 (UI) | 373 | 377 | +4 | 500 | Safe |
| `src/client/ui/market_event_ticker.tsx` | Tier 2 (UI) | 164 | 164 | 0 | 500 | Safe |
| `tests/contracts/imp253_floating_toast_ergonomics.test.ts` | Living Tests | 324 | 324 | 0 | 600 | Modernized |
| `tests/contracts/imp_uiux_engine_convergence.test.ts` | Living Tests | 482 | 482 | 0 | 600 | Modernized |
| `tests/client/imp450_desktop_left_margin_notification.test.ts` | Living Tests (New) | 0 | 180 | +180 | 600 | Safe |

---

## 3. Core Contract Invariants

1. **[INV-450.01: Desktop Left-Margin Safe Void Positioning Invariant]**:
   - In `src/client/ui/floating_numbers.tsx`:
   - Replace `md:left-auto md:right-[18.5rem]` with `md:left-4 md:right-auto md:translate-x-0 md:items-start md:max-w-[280px]`. Retain `md:flex` for living regex compatibility.
   - Decouple desktop top offset in `stackTopClass`: on desktop (`md:`), maintain a fixed ceiling of `md:top-20` (80px) instead of cascading down to `md:top-44`, ensuring notifications never push down into western tiles #11–#14 ($Y \in [195, 283]\text{px}$).
   - On Mobile viewports (`< 768px`), retain existing bottom/top centered responsive flow (`left-1/2 -translate-x-1/2`) with zero regression.
   - When `activeModal !== null`, center `MilestoneBanner` at top (`left-1/2 -translate-x-1/2 md:top-16`) to prevent overlap with modal headers.

2. **[INV-450.02: Compact Card Ergonomics & Zero-Text-Mutation Invariant]**:
   - In `src/client/ui/floating_numbers.tsx`:
   - Refine `FloatingBadge` container padding to `px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-900/20 bg-[#FFFDF8]/95 backdrop-blur-xs select-none shadow-[0_2px_0_0_#0f172a]`.
   - Prevent text clipping: replace `truncate` with `line-clamp-2 break-words` on `milestone-card-title` and `transaction-formula-line`.
   - **STRICTLY PRESERVE 100% of user text structures, wording, formulas, and labels**: `narrative.subject`, `narrative.verb`, `narrative.amountText`, `narrative.target`, `narrative.formula`, `narrative.icon`, and dismiss button `✕`. Zero text pruning or formula alterations.

3. **[INV-450.03: Market Event Ticker Lateral Clearance Invariant]**:
   - In `src/client/ui/market_event_ticker.tsx`:
   - Adjust responsive width to `sm:max-w-md md:max-w-md lg:max-w-xl xl:max-w-2xl` to ensure centered market cards reserve safe lateral space from the left margin notifications on 768px–1024px viewports.

4. **[INV-450.04: Living Contract Modernization Protocol]**:
   - In `tests/contracts/imp253_floating_toast_ergonomics.test.ts`:
   - Modernize `TC-IMP253.01` to assert `md:left-4` and `md:translate-x-0`.
   - Modernize `TC-IMP253.04..06` to assert fixed ceiling `md:top-20`.
   - Modernize `TC-IMP253.16` to assert `md:items-start`.
   - In `tests/contracts/imp_uiux_engine_convergence.test.ts`:
   - Modernize `TC-CONV-11` to assert `md:left-4`, `md:right-auto`, and `md:translate-x-0`.

5. **[INV-450.05: Anti-TIDD & Zero Dirty Casts]**:
   - Zero `as any` or `@ts-ignore`. Public interfaces remain clean without test-only props.

---

## 4. Explicitly Dropped Requirements (Sean Goedecke Rule)

- ❌ **NO Text Structure or Formula Truncation**: User explicitly mandated "không chỉnh sửa cấu trúc text của tôi". All narrative keys (`subject`, `verb`, `amountText`, `target`, `formula`, `icon`) and text templates remain 100% untouched.
- ❌ **NO Draggable Coordinates or User Settings**: Toast position is deterministically anchored to the safe Top-Left void on desktop without introducing localStorage preferences or drag handlers.
- ❌ **NO Desktop Toast Hiding / Silencing**: Notifications remain fully visible on desktop; relocated out of the 3D board diagonal path.
- ❌ **NO Custom Animation Libraries**: Standard Tailwind transitions (`animate-in fade-in duration-200`) suffice.

---

## 5. Specification for Modifications & Call-Site Wiring

### 5.1 `src/client/ui/floating_numbers.tsx`
- Layout Container Rules:
  - Container classes: replace `md:left-auto md:right-[18.5rem]` and `md:items-end` and `md:max-w-md` with `md:left-4 md:right-auto md:translate-x-0 md:items-start md:max-w-[280px] md:flex`.
  - Item wrapper classes: add `md:justify-start` to `w-full flex justify-start sm:justify-center md:justify-start`.
  - `stackTopClass`: on desktop, keep fixed `md:top-20` (or `md:top-16` when modal open) without stepping down into tiles #11–#14.
  - Multi-line wrap: update `truncate` to `line-clamp-2 break-words` on `milestone-card-title` and `transaction-formula-line`.
  - Badge container classes: update padding from `px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl border border-slate-300` to `px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-slate-900/20 bg-[#FFFDF8]/95 backdrop-blur-xs select-none shadow-[0_2px_0_0_#0f172a]`.
  - All text child nodes, spans, testids (`transaction-flow-line`, `floating-amount-pill`, `transaction-formula-line`), and close button `✕` remain identical.

### 5.2 `src/client/ui/market_event_ticker.tsx`
- Responsive Width Rules:
  - In container className, update width constraints to `sm:max-w-md md:max-w-md lg:max-w-xl xl:max-w-2xl` to ensure safe lateral separation from left-margin notifications.

---

## 6. Station 1 Test Specifications

- `tests/client/imp450_desktop_left_margin_notification.test.ts`:
  - `[TC-450.01/MSS][UC-IMP450/MSS][Facet-1/Boundary]`: Given Desktop viewport, When `FloatingNumbersOverlay` renders, Then container contains `md:left-4`, `md:right-auto`, `md:translate-x-0`, `md:items-start`, and `md:flex`.
  - `[TC-450.02/MSS][UC-IMP450/MSS][Facet-1/Boundary]`: Given Desktop viewport, When notifications are displayed, Then container width is constrained by `md:max-w-[280px]`.
  - `[TC-450.03/MSS][UC-IMP450/MSS][Facet-2/Reactivity]`: Given active transaction item, When `FloatingBadge` renders, Then 100% text structure and narrative content preserved verbatim across subject, verb, amount pill, target, and formula lines.
  - `[TC-450.04/A1][UC-IMP450/A1][Facet-3/Ergonomics]`: Given Mobile viewport (< 768px), When notifications are displayed, Then mobile preserves bottom-centered placement (`left-1/2 -translate-x-1/2`) without desktop interference.
  - `[TC-450.05/MSS][UC-IMP450/MSS][Facet-4/Spatial-Frustum]`: Given 1280x800 desktop camera diorama, When toasts are rendered at Top-Left, Then toast bounding box ($X \in [16, 296]\text{px}$, $Y \le 168\text{px}$) has zero overlap with board tiles #11–#20 ($Y_{edge} \ge 212\text{px}$).
  - `[TC-450.06/A2][UC-IMP450/A2][Facet-1/Boundary]`: Given activeModal is open, When MilestoneBanner renders, Then banner remains centered (`left-1/2 -translate-x-1/2`) at top.

- Visual Scenario Verification:
  - `npm run capture:visual -- --ticket IMP-450 --scenario notifications_financial`
  - `node scripts/check_evidence.mjs IMP-450`
  - Definition of Done (DoD): Zero test regressions, Sentinel mutation pass, and dual-viewport visual capture verified.

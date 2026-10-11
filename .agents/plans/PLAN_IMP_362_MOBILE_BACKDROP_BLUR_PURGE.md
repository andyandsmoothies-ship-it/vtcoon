# Plan IMP-362: Mobile Backdrop Blur Purge for WebKit Compositor Stall Elimination (Ticket IMP-362)

## 0. Context & Architectural Rationale
- **Prior In-Flight Scope**:
  - Ticket IMP-361 implemented iOS WebGL performance tuning: iOS Phone Retina DPR clamping (0.75–0.82), WebGL context hints (`powerPreference: 'high-performance'`, `precision: 'mediump'`), and adaptive step-up bounds.
- **Problem Statement & Physical Reality (Bottleneck 3)**:
  - On mobile devices (particularly WebKit WKWebView on iOS), CSS `backdrop-filter: blur(...)` causes an immediate GPU pipeline serialization and framebuffer readback stall on every frame.
  - The compositor must pause the WebGL render loop, copy the canvas backbuffer to system RAM, execute a Gaussian blur filter kernel, and blend it back with the DOM element.
  - Elements like `ActionDock` sit persistently on top of the 3D canvas on every single frame, turning a 60 FPS WebGL scene into an interrupted, thermally throttled 30–45 FPS experience on mobile.
- **Architectural Solution (Dual-Layer Defense)**:
  1. **Global Media Query Purge (`src/client/index.css`)**: Apply `@media (max-width: 767px) { *, ::before, ::after { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; } }`. Completely shuts down all compositor readback stalls on mobile screens (< 768px) across the entire application with zero JS runtime overhead.
  2. **Responsive Tailwind Blur on Persistent HUD (`src/client/ui/action_dock.tsx`)**: Transition `backdrop-blur-sm` to `backdrop-blur-none md:backdrop-blur-sm`. Background `bg-[#FFFDF8]/95` is 95% opaque ivory, maintaining high contrast and tactile elegance without GPU overhead.
  3. **High-Contrast Modal Dimming (`src/client/ui/modals/modal_backdrop.tsx`)**: Transition `backdrop-blur-xs` to `backdrop-blur-none md:backdrop-blur-xs` and adjust opacity from `bg-slate-950/60` to `bg-slate-950/80 md:bg-slate-950/60`, ensuring modal dialogs remain punchy and focused on mobile without blur.
  4. **Desktop Visual Preservation**: Desktop viewports (>= 768px) and high-end iPads maintain 100% full-fidelity glassmorphism.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-362`
- **Subsystem**: `client-ui` (Tier 2 UI Components & Tier 3 Global Styles)
- **Direct Scope (Physical Files)**:
  - **Target physical file**: `src/client/index.css` (Refactor)
  - **Target physical file**: `src/client/ui/action_dock.tsx` (Refactor)
  - **Target physical file**: `src/client/ui/modals/modal_backdrop.tsx` (Refactor)
  - **Target physical file**: `tests/client/imp362_mobile_blur_purge.test.ts` (Tệp mới)
- **Referenced Contracts / Stable Boundaries**:
  - `src/client/ui/market_event_ticker.tsx`
  - `src/client/ui/activity_feed_sidebar.tsx`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/index.css` | Tier 3 (Static Config) | 129 | 140 | +11 | <= 800 | Safe (< 300 LOC) |
| `src/client/ui/action_dock.tsx` | Tier 2 (UI/3D/Views) | 395 | 395 | 0 | <= 500 | Safe (< 400 LOC) |
| `src/client/ui/modals/modal_backdrop.tsx` | Tier 2 (UI/3D/Views) | 103 | 103 | 0 | <= 500 | Safe (< 300 LOC) |
| `tests/client/imp362_mobile_blur_purge.test.ts` | Living Test | 0 | 120 | +120 | <= 600 | 🆕 Tệp mới |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
- Write living contract test suite in `tests/client/imp362_mobile_blur_purge.test.ts`:
  - TC-362.01 [UC-BLUR-PURGE-CSS/MSS]: Given mobile viewport max-width 767px styles, When inspecting stylesheet rules, Then verifies backdrop-filter is disabled for mobile viewports.
  - TC-362.02 [UC-ACTION-DOCK-RESPONSIVE-BLUR/MSS]: Given ActionDock navigation HUD rendered for mobile and desktop, When calling ActionDock, Then renders container with backdrop-blur-none and desktop variant md:backdrop-blur-sm.
  - TC-362.03 [UC-MODAL-BACKDROP-RESPONSIVE-BLUR/MSS]: Given ModalBackdrop component with center orientation, When calling ModalBackdrop, Then renders container with backdrop-blur-none and desktop variant md:backdrop-blur-xs.
  - TC-362.04 [UC-MODAL-BACKDROP-CONTRAST/MSS]: Given ModalBackdrop component rendered without blur, When calling ModalBackdrop, Then provides enhanced mobile backdrop opacity bg-slate-950/80 and desktop opacity md:bg-slate-950/60.
  - TC-362.05 [UC-MODAL-BACKDROP-FULLSCREEN/MSS]: Given ModalBackdrop component in fullScreen mode, When calling ModalBackdrop, Then does not apply any backdrop-blur classes preserving pointer-events-none layout.

### Station 2: Implementation (GREEN)

#### Task 1: Global Mobile Blur Purge in `src/client/index.css`
**Target physical file**: `src/client/index.css`
```css
<<<<
@media (prefers-reduced-motion: reduce) {
  .animate-float-up-fade,
  .animate-emote-pop,
  .animate-in,
  .animate-dice-shake {
    animation: none !important;
    transition: none !important;
  }
}
====
@media (prefers-reduced-motion: reduce) {
  .animate-float-up-fade,
  .animate-emote-pop,
  .animate-in,
  .animate-dice-shake {
    animation: none !important;
    transition: none !important;
  }
}

/* Mobile WebKit GPU Compositor Stall Defense: Purge backdrop-filter blur on mobile viewports (< 768px) */
@media (max-width: 767px) {
  *,
  ::before,
  ::after {
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }
}
>>>>
```

#### Task 2: Action Dock Responsive Blur in `src/client/ui/action_dock.tsx`
**Target physical file**: `src/client/ui/action_dock.tsx`
```tsx
<<<<
      <nav
        className="relative pointer-events-auto flex items-center justify-center gap-1.5 min-[360px]:gap-2 md:gap-3 bg-[#FFFDF8]/95 backdrop-blur-sm border border-slate-300/80 shadow-lg shadow-slate-900/10 rounded-2xl p-1.5 sm:p-2.5 px-2 min-[360px]:px-3 sm:px-5 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar"
        aria-label="Thanh điều khiển tác vụ"
      >
====
      <nav
        className="relative pointer-events-auto flex items-center justify-center gap-1.5 min-[360px]:gap-2 md:gap-3 bg-[#FFFDF8]/95 backdrop-blur-none md:backdrop-blur-sm border border-slate-300/80 shadow-lg shadow-slate-900/10 rounded-2xl p-1.5 sm:p-2.5 px-2 min-[360px]:px-3 sm:px-5 max-w-[calc(100vw-1rem)] overflow-x-auto no-scrollbar"
        aria-label="Thanh điều khiển tác vụ"
      >
>>>>
```

#### Task 3: Modal Backdrop Responsive Blur & Mobile Contrast in `src/client/ui/modals/modal_backdrop.tsx`
**Target physical file**: `src/client/ui/modals/modal_backdrop.tsx`
```tsx
<<<<
  const backdropClasses = fullScreen
    ? 'fixed inset-0 bg-slate-950/60 z-50 flex items-stretch justify-stretch p-0 pointer-events-none select-none'
    : center
    ? 'fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-2.5 sm:p-4 pointer-events-auto select-none'
    : 'fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center md:justify-end p-2.5 sm:p-4 md:pr-10 pointer-events-auto select-none';
====
  const backdropClasses = fullScreen
    ? 'fixed inset-0 bg-slate-950/60 z-50 flex items-stretch justify-stretch p-0 pointer-events-none select-none'
    : center
    ? 'fixed inset-0 bg-slate-950/80 md:bg-slate-950/60 backdrop-blur-none md:backdrop-blur-xs z-50 flex items-center justify-center p-2.5 sm:p-4 pointer-events-auto select-none'
    : 'fixed inset-0 bg-slate-950/80 md:bg-slate-950/60 z-50 flex items-center justify-center md:justify-end p-2.5 sm:p-4 md:pr-10 pointer-events-auto select-none';
>>>>
```

### Station 3: Verification & Mechanical Gates
- Run Fast Pre-Filter: `npm run prefilter -- src/client/index.css src/client/ui/action_dock.tsx src/client/ui/modals/modal_backdrop.tsx tests/client/imp362_mobile_blur_purge.test.ts`
- Run Scope Audit: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_362_MOBILE_BACKDROP_BLUR_PURGE.md --staged`
- Physical Visual Verification: `node scripts/capture_visual_evidence.mjs --ticket IMP-362 --dual`
- Run Evidence Audit: `node scripts/check_evidence.mjs IMP-362`

### Station 4: Definition of Done (DoD) & Stopping Criteria
- All 5 contract tests in `tests/client/imp362_mobile_blur_purge.test.ts` pass 100%.
- Zero regression across existing UI suites: `npx vitest run tests/client/ui04_business_modals.test.ts tests/client/ui_action_dock_helpers.test.ts`.
- Zero dirty casts (`as any`, `as unknown as`).
- Hard stopping boundary enforced upon passing all Station 3 gates and capturing dual-viewport evidence.

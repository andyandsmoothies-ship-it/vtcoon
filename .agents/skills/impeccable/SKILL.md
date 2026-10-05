---
name: impeccable
description: High-craft tactile 2D UI/UX design, review, and polish skill for commercial games under Antigravity 2.0. Directs critique, audit, polish, optimize workflows, motion budget, and tactile shadows. Integrates 24-command Impeccable engine and launcher CLI.
---

# TACTILE 2D UI/UX DESIGN SKILL (IMPECCABLE STANDARD)

## 1. SESSION CONTEXT SETUP

At the start of any session involving 2D UI/UX design, styling, or auditing, run the launcher once to load project context (`PRODUCT.md`, `DESIGN.md`, surface brief):

```cmd
cmd /c .agents\skills\impeccable\scripts\impeccable.cmd context
```

*Notes*:
- Pass a target file path via `--target <path>` (e.g. `--target src/client/ui/player_card.tsx`).
- The launcher connects to the standalone `impeccable-engine` binary on Windows x64.

---

## 2. TACTILE LUXURY PHILOSOPHY

The **Impeccable** standard ensures 2D UI matches commercial game quality, synchronizing aesthetically with the 3D React Three Fiber (R3F) board in `vtcoon`.

1. **Physical Weight & Tactile Snap**: UI elements (Title Deed cards, buttons, control trays, modals) are not flat 2D planes. They must feel like precision-crafted objects with physical weight and crisp tactile snap.
2. **Zero Administrative Form Syndrome**: Ban administrative dashboard styling, 2000s-era forms, and dense spreadsheet layouts.
3. **Progressive Disclosure**: Detailed technical guidelines are indexed in reference documents:
   - Motion & Easing: [`reference/motion_budget.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/motion_budget.md)
   - Multi-layer Shadows & Buttons: [`reference/tactile_shadows.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/tactile_shadows.md)
   - Quality Floor: [`reference/craft-floor.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft-floor.md)

---

## 3. FOUR CORE WORKFLOWS

### 1. `/impeccable critique` - Adversarial Visual Review
- **Objective**: Act as an adversarial UI critic inspecting every pixel on the 2D surface.
- **Steps**:
  1. Identify screen context and target UI components.
  2. Analyze 4 facets: Tactile Depth, Visual Hierarchy, Palette & Contrast, Motion & Micro-interactions.
  3. Compile up to 8 physical defects (P1-P8), citing anti-pattern names and viewport breakpoints (`@360px`, `@768px`, `@1440px`).
  4. Issue a single disposition verdict: `recapture | rebuild | fix | ship`.
  5. Identify `keep` items (core strengths to preserve).

### 2. `/impeccable audit` - Source & Layout Quality Gate
- **Objective**: Scan code and layout structure to detect anti-patterns before release.
- **Steps**:
  1. Run internal UI linter: `npm run lint:ui`.
  2. Verify zero occurrences of forbidden anti-patterns:
     - `border-accent-on-rounded`: Directional border on rounded elements causing corner distortion.
     - `bounce-easing`: Rubber-band overshoot > 1.0.
     - `gray-on-color`: Dark gray text placed on saturated backgrounds.
     - `gradient-text`: Low-contrast clipped gradient text reducing legibility.
     - `undersized-ui-text`: Functional or button text < 11px.
     - `first-viewport-column-overflow`: Column height pushing action footers below viewport fold.
     - `cramped-padding` & `text-overflow`: Truncation failure or padding < 8px on narrow screens.
     - `nested-cards`: Excessive card-in-card containers creating visual mud.
     - `unlayered-css-reset`: CSS reset outside `@layer base` overriding `@layer utilities`.
     - `corner-clearance-violation`: Inner element spacing to rounded corner less than radius $R$.
  3. Verify accessibility: Tap targets $\ge 44 \times 44\text{px}$ (`min-h-[44px] min-w-[44px]`), visible focus ring (`focus-visible:ring-2`), and responsive support from `@360px` to `@1440px`.

### 3. `/impeccable polish` - Tactile Luxury Refinement
- **Objective**: Elevate functional UI into a tactile, high-end experience.
- **Steps**:
  1. Replace asymmetric bottom borders (`border-b-4`) with multi-layer drop shadows:
     `shadow-[0_4px_0_0_#color] active:shadow-[0_1px_0_0_#color] active:translate-y-[3px]`
  2. Add micro-rim lights to accentuate physical volume:
     `border border-white/10 ring-1 ring-white/5` or `ring-1 ring-amber-400/20`
  3. Standardize typography: Solid high-contrast text over fragile gradient clips.
  4. Integrate tactile sound cues and micro-interaction states on click, press, and card flip.

### 4. `/impeccable optimize` - 2D Rendering Performance
- **Objective**: Maintain locked 60 FPS without inducing layout thrashing or stutter in the R3F Canvas.
- **Steps**:
  1. Enforce motion budget: 100ms - 350ms (max 500ms for macro screens).
  2. Animate only GPU-accelerated properties: `transform` and `opacity`.
  3. Eliminate broad re-renders via fine-grained state isolation (Zustand selectors, React memo).
  4. Honor user accessibility settings: `prefers-reduced-motion`.

---

## 4. ANTI-PATTERNS & REMEDIATION REFERENCE

| Anti-Pattern | Manifestation | Why Forbidden | Standard Remediation |
| :--- | :--- | :--- | :--- |
| **`border-accent-on-rounded`** | `rounded-xl border-b-4 border-amber-600` | Asymmetric border widths distort CSS corner radius | Multi-layer drop shadow: `shadow-[0_4px_0_0_#d97706] active:translate-y-[3px]` |
| **`bounce-easing`** | `animate-bounce` or `cubic-bezier` with overshoot > 1.0 | Toy-like, unstable animation disrupting financial legibility | Crisp luxury easing: `cubic-bezier(0.16, 1, 0.3, 1)` |
| **`gray-on-color`** | `bg-amber-400 text-slate-950` | Muddy contrast, lacks tonal harmony | Crisp white (`text-white`) or deep tone (`text-amber-950`) |
| **`gradient-text`** | `bg-clip-text text-transparent bg-gradient-...` | Jagged font rendering and weak readability | Solid contrast: `text-amber-400 font-black tracking-tight` |
| **`undersized-ui-text`** | `text-[9px]`, `text-[10px]` on action labels or buttons | Illegible on mobile, breaks readability floor | Minimum font floor `text-[11px]` (prefer `text-xs font-bold`) |
| **`first-viewport-column-overflow`** | Unscrolled tall column pushing actions below fold | Breaks player reaction loop on vertical displays | Sticky action footer at container root, scrollable data body |
| **`cramped-padding`** | Text touching card borders (`p-0.5`) or overflow without `truncate` | Visual clutter, clipped text on 360px displays | Minimum `px-2` to `px-3`, enforce `truncate` with `min-w-0` in flex blocks |
| **`nested-cards`** | Gray card inside gray card (`bg-slate-100` inside `bg-slate-50`) | Visual mud, dilutes emphasis of 3D board | Flatten hierarchy with whitespace, subtle dividers, or high-contrast backdrops |
| **`physical-horizontal-overflow`** | $\ge 4$ buttons packed into 1 horizontal row exceeding 296px | Overflows boundary or crushes touch targets | Calculate $W_{\text{net}} \le 296\text{px}$, split into 2 ergonomic tiers |
| **`dummy-attribute-test-bypass`** | Injecting `data-legacy-style` to satisfy obsolete test assertions | Hides regressions, creates accidental passes | Reconcile outdated test assertions per Specification Evolution |

---

## 5. 24 IMPECCABLE ENGINE COMMANDS TABLE

| Command | Category | Description | Reference |
| :--- | :--- | :--- | :--- |
| `craft [feature]` | Build | Alias for full visual world creation | [`reference/craft.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft.md) |
| `shape [feature]` | Build | UX/UI planning prior to code implementation | [`reference/shape.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/shape.md) |
| `init` | Build | Persist durable product context into PRODUCT.md | [`reference/init.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/init.md) |
| `document` | Build | Extract DESIGN.md from existing codebase | [`reference/document.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/document.md) |
| `extract [target]` | Build | Extract reusable design tokens and components | [`reference/extract.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/extract.md) |
| `critique [target]` | Evaluate | Evaluate UX design with heuristic scoring | [`reference/critique.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/critique.md) |
| `audit [target]` | Evaluate | Verify technical quality (a11y, perf, responsive) | [`reference/audit.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/audit.md) · native: [`reference/audit.native.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/audit.native.md) |
| `polish [target]` | Refine | Refine tactile finish prior to delivery | [`reference/polish.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/polish.md) |
| `bolder [target]` | Refine | Inject character into timid, safe designs | [`reference/bolder.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/bolder.md) |
| `quieter [target]` | Refine | Moderate noisy, visually overwhelming layouts | [`reference/quieter.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/quieter.md) |
| `distill [target]` | Refine | Strip design to core essence; purge fluff | [`reference/distill.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/distill.md) |
| `harden [target]` | Refine | Production standardization: error states, i18n, boundaries | [`reference/harden.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/harden.md) |
| `onboard [target]` | Refine | Design first-run onboarding, empty states, triggers | [`reference/onboard.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/onboard.md) |
| `animate [target]` | Enhance | Add purposeful motion, timing, and rhythm | [`reference/animate.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/animate.md) |
| `colorize [target]` | Enhance | Apply strategic color hierarchy to bland UI | [`reference/colorize.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/colorize.md) |
| `typeset [target]` | Enhance | Perfect typography hierarchy, sizing, and contrast | [`reference/typeset.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/typeset.md) |
| `layout [target]` | Enhance | Calibrate whitespace, alignment, and cadence | [`reference/layout.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/layout.md) |
| `delight [target]` | Enhance | Add micro-delight and emotional touchpoints | [`reference/delight.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/delight.md) |
| `overdrive [target]` | Enhance | Push beyond conventional constraints | [`reference/overdrive.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/overdrive.md) |
| `clarify [target]` | Fix | Clarify microcopy, labels, and error guidance | [`reference/clarify.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/clarify.md) |
| `adapt [target]` | Fix | Adapt across device sizes and viewports | [`reference/adapt.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/adapt.md) · native: [`reference/adapt.native.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/adapt.native.md) |
| `optimize [target]` | Fix | Profile and optimize 2D rendering efficiency | [`reference/optimize.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/optimize.md) |
| `live` | Iterate | Live browser inspection: pick elements, generate variants | [`reference/live.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/live.md) |
| `generate [spec]` | Iterate | Agent-driven live variant generation without manual picking | [`reference/generate.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/generate.md) |

---

## 6. REFERENCE DIRECTORY INDEX

When implementing or refining UI, reference these detailed guides:
- **Motion Budget & Easing**: [`reference/motion_budget.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/motion_budget.md)
- **Multi-layer Tactile Shadows**: [`reference/tactile_shadows.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/tactile_shadows.md)
- **Craft Floor & Invariants**: [`reference/craft-floor.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/craft-floor.md)
- **Surface Modes & Decomposition**: [`reference/mode-operate.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/mode-operate.md), [`reference/region-map.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/region-map.md)
- **Plan & Asset Review**: [`reference/component-review.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/skills/impeccable/reference/component-review.md)
- **Overall Design System**: [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md) or [`DESIGN.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/DESIGN.md)

---

## 7. HUD DESIGN INVARIANT: GLANCEABLE HUD VS DASHBOARD TRAP

- **Dashboard Trap Prohibited**: In fast-paced games (15-30s turns), players cannot stop to scroll or swipe notifications. Never collapse notifications into flat generic icons or bury them in drawer menus.
- **Glanceable HUD Principle**: Do not hide information; condense it into peripheral math formulas and compact metrics (`🔥 Land: Rent x2.5`, `🚂 4 Stations: Fee x2`). Maintain fixed strip height $\le 44\text{px}$, allowing players to absorb total game state in 0.5s with **zero clicks, zero swipes**.


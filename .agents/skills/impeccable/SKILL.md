---
name: impeccable
description: High-craft tactile 2D UI/UX design, review, and polish skill for commercial games under Antigravity 2.0. Directs critique, audit, polish, optimize workflows, motion budget, and tactile shadows. Pure-prompting Impeccable Lite standard with zero external binary dependencies.
---

# TACTILE 2D UI/UX DESIGN SKILL (IMPECCABLE LITE STANDARD)

## 1. SESSION CONTEXT SETUP (ZERO-BINARY ARCHITECTURE)

Impeccable Lite operates purely via cognitive heuristics, AST linter rules, and design constraints without requiring external Rust binaries, browser extension daemons, or background port listeners.

When starting a 2D UI/UX task:
1. Consult the project design system in [`DESIGN.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/DESIGN.md) or [`docs/domain/design.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/design.md).
2. Reference the Viewport Ergonomics Gotchas: [`docs/domain/gotchas/ui_ergonomics.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/domain/gotchas/ui_ergonomics.md).
3. Validate mechanical conformance at any time via:
```bash
npm run lint:ui
```

---

## 2. TACTILE LUXURY PHILOSOPHY

The **Impeccable Lite** standard ensures 2D UI matches commercial game quality, synchronizing aesthetically with the 3D React Three Fiber (R3F) diorama in `vtcoon`.

1. **Physical Weight & Tactile Snap**: UI elements (Title Deed cards, buttons, control trays, modals) are not flat 2D planes. They must feel like precision-crafted physical objects with weight, bevels, and crisp mechanical travel.
2. **Zero Administrative Form Syndrome**: Ban administrative dashboard styling, 2000s-era forms, dense spreadsheet tables, and gray-card-in-gray-card nesting.
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
  1. Run mechanical UI linter: `npm run lint:ui`.
  2. Verify zero occurrences of forbidden anti-patterns:
     - `border-accent-on-rounded`: Directional border on rounded elements causing corner distortion.
     - `bounce-easing`: Rubber-band overshoot > 1.0.
     - `gray-on-color`: Dark gray text placed on saturated backgrounds.
     - `gradient-text`: Low-contrast clipped gradient text reducing legibility.
     - `undersized-ui-text`: Functional or button text < 11px.
     - `first-viewport-column-overflow`: Column height pushing action footers below viewport fold.
     - `cramped-padding` & `text-overflow`: Truncation failure or padding < 8px on narrow screens.
     - `nested-cards`: Excessive card-in-card containers creating visual mud.
     - `side-tab`: Thick directional border on one card edge (AI tell).
     - `clipped-overflow-container`: `overflow-hidden` clipping interactive popovers/tooltips.
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

## 4. 10 ANTI-PATTERNS & REMEDIATION REFERENCE

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
| **`side-tab`** | `border-l-4 border-blue-500` on card container | Unbalanced aesthetic, stereotypical AI-generated UI tell | Use subtle accent chip, soft pill badge, or layered box-shadow |
| **`clipped-overflow-container`** | `overflow-hidden` container clipping popover/tooltip | Breaks interactive dropdowns, tooltips, or negative margin bevels | Use `overflow-visible` or portal overlays outside clip boundary |

---

## 5. THE 6 CORE DESIGN VERBS (COGNITIVE HEURISTICS)

Instead of maintaining brittle 24-command binary tooling, invoke these 6 high-leverage cognitive verbs during UI design and review:

1. **`distill`**: Strip clutter to the core essence. Purge redundant borders, reduce container nesting, collapse nested cards into clean whitespace, and remove decorative elements that do not serve gameplay comprehension.
2. **`bolder`**: Inject character and confidence into timid designs. Amplify typographic weight, increase contrast between primary CTAs and secondary links, and apply tactile drop shadows with definite mechanical depth.
3. **`quieter`**: Tame visual noise and chaotic layouts. Tone down excessive background saturation, soften secondary text labels, and collapse secondary metrics into glanceable inline formulas.
4. **`harden`**: Bulletproof layout against edge cases. Test at extreme viewport widths (`@360px` to `@1440px`), enforce $\ge 44\times 44\text{px}$ touch targets, add overflow truncation guards (`min-w-0 truncate`), and handle long i18n text strings.
5. **`typeset`**: Perfect typography hierarchy. Enforce font size floor ($\ge 11\text{px}$), balance line heights, tighten tracking on uppercase headers (`tracking-wider text-xs font-bold`), and eliminate unreadable gradient text clips.
6. **`delight`**: Infuse tactile micro-interactions. Add mechanical button press physics (`active:translate-y-[2px] active:shadow-none`), smooth luxury easing curves, and subtle audio/haptic cues on user interaction.

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


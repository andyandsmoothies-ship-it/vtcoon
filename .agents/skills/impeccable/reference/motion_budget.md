# MOTION BUDGET & EASING SPECIFICATION

Deep technical reference for the `impeccable` skill in `vtcoon`.

---

## 1. MOTION BUDGET PRINCIPLES

Motion in commercial games serves tactile feedback and state change notification; it must never stall gameplay or waste player time. All 2D animations must strictly adhere to the motion budget:

| Interaction / Scope | Duration Budget | Intent & Feel |
| :--- | :--- | :--- |
| **Instant Feedback (Micro-press)** | `100ms - 150ms` | Button pressed (`active`), dice bounce, cell selection. Immediate mechanical elasticity. |
| **Secondary Elements (Tooltips, Badges, Tabs)** | `150ms - 250ms` | Hints appearing, modal tab switching, avatar hover. Snappy, non-blocking. |
| **Primary Modals (Modals, Drawers, Sheets)** | `250ms - 350ms` | Opening/closing Title Deeds, HOSE Exchange, Auction Room. Grounded, poised, zero floating lag. |
| **Macro Screens (Victory, Bankruptcy, Major Alerts)** | `350ms - 500ms` | Winner crown sequence, game over overlay. Dramatic but strictly capped at 500ms. |

> **Budget Ceiling Warning**: Any 2D interface animation exceeding 500ms is considered a performance defect that degrades high-tempo competitive gameplay.

---

## 2. EASING CURVES SPECIFICATION

### Strictly Forbidden: Toy-Like Bounce (`bounce-easing`)
- **Forbidden**: CSS `animate-bounce`.
- **Forbidden**: `cubic-bezier(p1, p2, p3, p4)` curves with overshoot `p2 > 1.0` or `p4 > 1.0` (e.g. `cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Rationale**: Rubber-band bouncing introduces visual jitter, blurring financial text and action buttons when players need quick comprehension.

### Mandatory: Crisp Luxury Easing
- **Standard VTCOON Curve**:
  ```css
  cubic-bezier(0.16, 1, 0.3, 1)
  ```
- **Technical Attributes**:
  - **Ultra-Fast Launch** (`0.16`): Near-instant response in the initial 20ms.
  - **Precision Deceleration** (`1.0`): Smoothly settles at target position with zero overshoot.
  - **Solid Mechanical Stop** (`0.3, 1`): Firm arrival feel, mimicking precision-milled hardware.

### Tailwind / CSS Configuration Example:
```css
/* Crisp and smooth modal entrance animation */
@keyframes popInSmooth {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(6px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-enter {
  animation: popInSmooth 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 3. RENDERING OPTIMIZATION FOR REACT THREE FIBER (R3F)

1. **GPU-Accelerated Properties Only**:
   - Animate `transform: translate(...) / scale(...)` and `opacity`.
   - Never animate `width`, `height`, `margin`, `padding`, `top`, or `left` on HUD or floating modals to avoid layout reflows and Canvas frame drops.
2. **Support Reduced Motion (`prefers-reduced-motion`)**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

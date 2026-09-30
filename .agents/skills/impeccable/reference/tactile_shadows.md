# TACTILE SHADOWS & ELEVATION SPECIFICATION

Deep technical reference for the `impeccable` skill in `vtcoon`.

---

## 1. THE CORNER WARPING DEFECT (`border-accent-on-rounded`)

In rudimentary CSS implementations, developers often mimic a 3D button press by applying a thick bottom border:
```html
<!-- DEFECT: 4px bottom border on rounded element -->
<button class="rounded-xl bg-amber-500 border-b-4 border-amber-700">
  Buy Property
</button>
```

### Why this is a severe anti-pattern:
1. **Corner Warping**: The CSS `border-radius` calculation assumes uniform border thickness across edges. When one edge has 4px while the other three have 0px or 1px, bottom corners warp into asymmetric, sharp bevels.
2. **Missing Z-axis Tactile Depth**: On `:active`, a `border-b-4` cannot replicate authentic physical compression along the Z-axis.

---

## 2. MULTI-LAYER TACTILE ELEVATION FORMULA

Instead of asymmetric borders, Impeccable uses **hard-edge elevation drop shadows** paired with active translation:

### Core Tailwind CSS Pattern:
```html
<button class="
  px-4 py-2.5 rounded-xl font-bold
  border border-[border_color]
  shadow-[0_4px_0_0_#depth_color]
  active:shadow-[0_1px_0_0_#depth_color]
  active:translate-y-[3px]
  transition-all
">
  Buy Property
</button>
```

### Tactile Mechanics:
1. `shadow-[0_4px_0_0_#depth_color]`: Renders a 4px footing that adheres to `rounded-xl` without corner distortion.
2. `active:translate-y-[3px]`: On click/press, translates the button downward by 3px.
3. `active:shadow-[0_1px_0_0_#depth_color]`: Decreases footing thickness from 4px to 1px, replicating mechanical switch depression.

---

## 3. COLOR PALETTE REFERENCE FOR IN-GAME CONTROLS

### 1. Primary Action / Confirm Investment (Teal / Emerald Luxury)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-b from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 border border-teal-800 shadow-[0_4px_0_0_#115e59] active:shadow-[0_1px_0_0_#115e59] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400">
  Confirm Investment
</button>
```

### 2. High Stakes / Auction Bid / Upgrade (Amber / Gold Tycoon)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-black text-amber-950 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 border border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
  Place Bid
</button>
```

### 3. Danger / Pass / Mortgage / Bankruptcy (Rose / Crimson Crisis)
```html
<button class="min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-rose-300 hover:text-rose-100 bg-rose-950/80 hover:bg-rose-900/90 border border-rose-700/60 shadow-[0_4px_0_0_#9f1239] active:shadow-[0_1px_0_0_#9f1239] active:translate-y-[3px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400">
  Pass / Mortgage
</button>
```

---

## 4. MULTI-LAYER AMBIENT DEPTH FOR MODALS & CARDS

For large cards like Title Deeds or the HOSE Exchange:
- **Layer 1 (Ambient Shadow)**: `shadow-2xl shadow-black/80` (elevates element off 3D board).
- **Layer 2 (Contact Footing)**: `shadow-[0_4px_0_0_#0f172a]` (anchors card baseline).
- **Layer 3 (Rim Light)**: `ring-1 ring-white/10` or `ring-1 ring-amber-400/20` (highlights tempered-glass edges).
- **Layer 4 (Material Surface)**: `bg-slate-900/95 backdrop-blur-md border border-slate-700/60`.

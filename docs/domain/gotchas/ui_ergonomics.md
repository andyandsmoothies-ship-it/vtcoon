# PILLAR V: 2D UI & VIEWPORT ERGONOMICS

> **Scope**: `src/client/ui/`, `src/client/components/`, `src/client/modal_host.tsx`, `src/client/hud_container.tsx`  
> **Gotchas SSOT Rule**: Concise architectural invariant rulebook. Anti-Changelog: Keep technical formulas, limits, and negative constraints; omit narrative stories. Size ceiling: <= 15 KB.

---

1. **Mobile 360px 3-Tier Ergonomic Hierarchy**:
   - Financial decision modals partition into 3 tiers: Row 1 (Financial buffer: wallet/deficit balance) $\rightarrow$ Row 2 (Primary CTA action: Buy/Mortgage) $\rightarrow$ Row 3 (Escape action pair: Dismiss Deficit vs Decline/Pass).

2. **Touch Targets Floor**:
   - Every interactive touch target MUST be $\ge 44\text{px}$ (`min-h-[44px]`); primary CTA buttons MUST be $\ge 48\text{px}$ (`min-h-[48px]`).

3. **Root-Level Sticky Action Footer**:
   - Modal action button clusters MUST be direct children of the root container (`sticky bottom-0`), never nested within inner scroll containers.

4. **10 Impeccable Anti-Pattern Filters & Quality Floor**:
   - FORBIDDEN: (1) `border-accent-on-rounded` (asymmetric border on rounded corner), (2) `bounce-easing` (rubber-band overshoot > 1.0), (3) `gray-on-color` (muddy dark text on saturated chromatic bg), (4) `gradient-text` (clipped gradient legibility break), (5) `undersized-ui-text` (< 11px on interactive labels), (6) `first-viewport-column-overflow` (column pushing action CTA below vertical fold), (7) `cramped-padding` (padding < 8px without `min-w-0 truncate`), (8) `nested-cards` (gray card inside gray card visual mud), (9) `side-tab` (stereotypical AI thick left/right edge border), (10) `clipped-overflow-container` (`overflow-hidden` clipping interactive popovers/tooltips). Enforced mechanically via `npm run lint:ui`.
   - UI Review & Polish MUST leverage the 6 Core Cognitive Verbs: `distill` (strip visual clutter/nesting), `bolder` (assertive CTA hierarchy & mechanical drop shadows), `quieter` (soften peripheral data & tone down noise), `harden` (bulletproof bounds at 360px & touch floor >= 44px), `typeset` (typography scale & contrast floor), `delight` (tactile press travel `active:translate-y-[2px]`).

5. **Strict Intent Callback Isolation**:
   - Action buttons dispatching server intents (`onBuy`, `onPass`, `onBid`) are FORBIDDEN from using silent fallback to UI closing handlers (`onPass ?? onClose`). UI dismissal buttons call `onClose` separately.

6. **Authoritative State Shadowing Prohibition**:
   - When Host/Container provides an authoritative affordance helper (`resolvePurchaseAffordance`), callers are FORBIDDEN from precalculating booleans and passing overrides (`canBuy`) through modal payloads.

7. **A11y Attribute Co-Evolution**:
   - Updating UI labels/titles requires updating 100% of corresponding `aria-label`/`aria-description` attributes, verified in unit tests.

8. **Mobile Real Estate 360px Grid Action Standard**:
   - Portfolio action clusters (`PropertyPortfolioModal`) align to 2-column grid `grid grid-cols-2 gap-1.5`. Primary action (Mortgage/Redeem) occupies `col-span-2 min-h-[44px]`; secondary actions occupy `col-span-1 min-h-[44px]`. Typography floor $\ge 11\text{px}$. Tactile chips require 3D bevels (`shadow-[0_2px_0_0_...]`) and mechanical travel `active:translate-y-[2px]`.

9. **Financial Notification 3-Tier Hierarchy & Full-Width Standard**:
   - Mobile financial change cards (`FloatingBadge`) expand near full-width (`w-[calc(100vw-1.5rem)] max-w-sm sm:max-w-md`), centered `left-1/2 -translate-x-1/2`.
   - 3-tier structure: Tier 1 (Icon + Category + Dismiss `✕`); Tier 2 (Formula/cause `data-testid="transaction-formula-line"`); Tier 3 (Natural phrasing flow line `data-testid="transaction-flow-line"`).
   - Fee constants (`TELECOM_DATA_FEE = 150`, `MIN_BAIL_AMOUNT = 500`, `BAIL_NET_WORTH_RATIO = 0.10`) reside centrally in `src/domain/property_rent.ts`.

10. **Cross-Platform Viewport & Safari Zoom Immunity**:
    - **Safari Auto-Zoom Immunity**: Mobile input fields MUST declare font size $\ge 16\text{px}$ (`text-base sm:text-sm`) to prevent iOS Safari auto-zoom from decentering the 3D diorama.
    - **Dynamic Viewport (`dvh`)**: Full-screen modals prioritize dynamic `dvh` units (`h-[88dvh] max-h-[92dvh] min-h-0 sm:min-h-[480px]`).
    - **Backdrop Clearance**: Drawers (`ActivityFeedSidebar`) cap width to `w-[85vw] max-w-xs`, preserving $\ge 15\text{vw}$ backdrop clearance for tap-to-dismiss.
    - **Zero Truncate Conflicts**: FORBIDDEN combining `truncate` with `line-clamp-*`. Use `line-clamp-2 break-words`.

11. **Trade Modal Ergonomics & Symmetrical 2x2 Valuation Grid**:
    - **Adaptive Grid**: P2P partner selector uses adaptive CSS grids `grid-cols-${count}` across 360px viewports (zero horizontal overflow).
    - **Monopoly Synergy Pinning**: Properties completing an opponent's color monopoly MUST be pinned top under `⭐ MONOPOLY OPPORTUNITY (WIN-WIN)`.
    - **Symmetrical 2x2 Grid**: Standardize pricing tiers: Buy (100% Base, 120% Fair, 150% Attractive, 200% Compulsory) and Sell (70% Floor, 100% Base, 120% Standard, 150% Big Win).

12. **ModalHost Stateless Modals & Empty Payload Invariant**:
    - Asset management modals (`portfolio`) query Zustand stores directly. `ModalHost` MUST NOT early-abort with `if (!modalPayload) return null;` when `activeModal === 'portfolio'`, ensuring instant opening with empty payloads.

13. **Actionable Contextual Feedback & Subcomponents**:
    - Error messages format as `${title}: ${description} 👉 ${actionHint}` when `actionHint` is present.
    - WS error handlers only surface errors for the local player (`msg.playerId === myPlayerId || msg.type === 'ERROR'`), with 1500ms anti-spam throttling per `reasonCode`.
    - Bond issuance tab provides a 3-criterion checklist card (Net Worth $\ge 3,000$, Unencumbered Properties $\ge 2$, In Turn / Debt Recovery `isTurnValid`).

14. **Property Trading Indicators & Tailwind Purge Immunity**:
    - Avoid arbitrary template string colors (`ring-offset-[#FFFDF8]`) purged at build time. Use static Tailwind class `ring-offset-1` with inline CSS variable: `style={{ '--tw-ring-offset-color': '#FFFDF8' }}`.
    - Store updates to `modalPayload` MUST execute outside React state updater callbacks.
    - Missing `localPlayerId` returns an empty set rather than falling back to hardcoded strings like `'p1'`.

15. **Conditional Formula Rendering in Financial Badges**:
    - The formula line `data-testid="transaction-formula-line"` is ONLY rendered when `Boolean(narrative.formula?.trim()) === true`. Direct transactions (`buy`, `upgrade`) return empty string `''`, cleanly collapsing badge to 2 tiers.

16. **Compulsory Buyout Target Selection & Subsidy Invariants**:
    - `isEligibleForCompulsoryBuyout` excludes properties pledged as bond collateral. Default selects most affordable property with 30s expiration.
    - Subsidies: 1,000 M VND (opponents own zero C0 tiles); 800 M VND (liquidity salvage when player cannot afford cheapest). Direct P2P buyouts transfer cash from Buyer to Seller ($\Delta\text{Treasury} = 0$).

17. **Auction Leading Bidder Dismiss Affordance**:
    - When player holds highest bid (`highestBidderId === myId`), footer button switches from `[✕ Withdraw]` (`onPass`) to `[✕ Close / View Board]` (`onClose`). Reverts to `[✕ Withdraw]` when outbid.
    - Server `handleAuctionPass` preserves the invariant: rejecting leading bidder withdrawals with `HIGHEST_BIDDER_CANNOT_PASS`.

18. **Headless Visual Capture HUD Mounting Lifecycle**:
    - To capture in-game HUD components via headless CDP, initialize match state: `window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester'); window.__lobbyStore.getState().setGameStarted(true);`.

19. **Spatial Ground Truth & Non-Collision Proof**:
    - Layout dimensions MUST derive from real DOM bounding boxes (`getBoundingClientRect()`); mental math is FORBIDDEN.
    - Floating badges anchor to layout flow (below HUD or `bottom-[8rem]` above ActionDock). Desktop safe offset `md:right-[18.5rem]`.
    - Tests must assert non-intersecting bounding box ranges or verify actual visual screenshots at 360x740, 360x640, and 1280x800.

20. **Carousel, Stepper & Touch Area Standards**:
    - Visual elements smaller than 44px MUST use CSS Hit-Slop (e.g. `after:absolute after:-inset-1.5`) to satisfy the $\ge 44\times 44\text{px}$ touch target floor.
    - Horizontal scroll containers apply CSS mask gradients to soften edges.
    - Stepper CTAs ("Next ➔") require an adjacent fast-dismiss escape action ("Skip & Close All").

21. **Poka-Yoke UI Affordance Invariant**:
    - Zero independent UI cost/condition calculations. Button disabled states and displayed costs MUST derive directly from Domain Validators (`canUpgradeProperty`, `canBuyProperty` -> `evaluation { canDo, cost, blockedReason }`).

22. **Modal Dismissal Ownership Invariant (Server Trigger — Client Dismiss)**:
    - Server only broadcasts signals to open modals via delta (`pendingTransitWheel`, `lastEventCard`).
    - Animated modals (Wheel, Card, Dice) may ONLY be dismissed by explicit player confirmation or turn advance. Auto-closing modals solely because a delta field transitions to `null` is FORBIDDEN.

23. **Modal Preservation in Multi-Step Workflows**:
    - Auto-insolvency modal listeners must check `currentModal !== 'portfolio'`. When player manually closes the portfolio modal, ActionDock transforms to `🚨 Emergency Debt Relief` as a stable manual re-entry anchor.

24. **Exemption vs Wallet Inflow Semantic Distinction**:
    - Exemption / saved expense pills (`savedRent`) MUST use sky blue protective styling (`bg-sky-50 text-sky-700 border-sky-300`). FORBIDDEN using emerald green (reserved exclusively for actual cash deposits).
    - Exemption amounts MUST omit the `+` prefix (`6,000 M`, not `+6,000 M`).

25. **Tactile Corner Arc & Margin Symmetry Standard**:
    - **Corner Arc Buffer ($\text{Clearance} \ge R + 4\text{px}$)**: Container with corner radius $R$ requires internal children to maintain clearance to outer edge $\ge R + 4\text{px}$ (e.g. for `rounded-2xl` $R=16\text{px}$, minimum clearance is $\ge 20\text{px}$).
    - **Margin Symmetry**: Horizontal control bars MUST balance left and right margins: $|\text{margin}_{left} - \text{margin}_{right}| \le 8\text{px}$ on Desktop.

26. **Device Sniffing Dependency Injection Invariant**:
    - Leaf or deep UI child components are FORBIDDEN from directly importing and executing global device sniffers (`isMobileHardware`, `isPhoneHardware`, `isIOSPhone`) inside rendering loops or nested subtrees. Platform capabilities and hardware tiers MUST be injected deterministically via top-level Component Props or a centralized Context/store selector. Contract and unit test suites MUST verify mobile vs desktop variants purely via prop/context configuration without monkey-patching globals or using `vi.spyOn` on device detection modules.

27. **React Component State Modeling Invariant (Pit of Success & Anti-Boolean Soup)**:
    - **`useState` Boundary**: Allowed exclusively for single, isolated, atomic values (e.g. single text input string, simple local accordion open/close boolean).
    - **`useReducer` / Discriminated Union Mandate**: When a component coordinates $\ge 2$ interdependent variables or manages an asynchronous lifecycle (loading, error, success, editing, submitting, multi-step wizards), managing state via independent `useState` booleans ("boolean soup") is STRICTLY FORBIDDEN.
    - Components MUST model state as a Discriminated/Tagged Union (`type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string }`) and drive transitions via a pure reducer function (`useReducer` or dedicated UI store). This makes illegal states unrepresentable, eliminates UI desync, and enables zero-DOM instant contract testing of pure reducer logic.

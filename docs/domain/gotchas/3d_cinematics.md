# PILLAR VI: 3D GRAPHICS, SHADERS & CINEMATOGRAPHY

> **Scope**: `src/client/3d/`, `src/client/game_canvas.tsx`, `scripts/capture_visual_evidence.mjs`  
> **Gotchas SSOT Rule**: Concise architectural invariant rulebook. Anti-Changelog: Keep technical formulas, limits, and negative constraints; omit narrative stories. Size ceiling: <= 20 KB.

---

1. **5-Layer Ocean Depth Stack & Zero-Alloc Shader Uniforms**:
   - **5-Layer Z-Fighting Separation**: Ocean water separates into 5 vertical tiers: (1) Abyss trench bottom $Y = -0.420$ `#0C4A6E`; (2) Mid-ocean depth $Y = -0.310$ `#0369A1`; (3) Primary GPU Gerstner surface $Y = -0.300$ `TropicalWater`; (4) Turquoise board skirt $Y = -0.298$ `#06B6D4`; (5) Shoreline surf foam band $Y = -0.292$ `#FFFFFF`. Adjacent tiers maintain $\Delta Y \ge 0.002\text{m} - 0.010\text{m}$ separation.
   - **Zero-Alloc Uniforms & Lifecycle**: Reuse static `Color.lerp` and `Vector3.lerp` buffers inside render loops without allocating `new Color()`. Dispose material and geometry on unmount.

2. **Living Diorama Micro-FSM & 3D Spatial Continuity**:
   - **Zero Mid-Air Teleportation ($C^1$ Continuity)**: Fauna animation phase transitions (`CIRCLING` $\rightarrow$ `LANDING`) MUST anchor landing start point to terminal circling coordinates (`landingFromRef`), never snapping to origin.
   - **Zero React Re-render at 60 FPS**: Continuous animations (wave bobbing, wing flapping, beacon rotation) MUST operate via `useRef` and Three.js object mutations in `useSafeFrame`. Calling `setState` at 60 FPS is strictly forbidden.
   - **Shadow Budget Isolation**: Micro-fauna meshes (seagulls, boats) are forbidden from enabling `castShadow` to preserve mobile GPU fillrate.

3. **Atmospheric Exposure Adaptation & Foliage Wind Sway**:
   - **Tone Mapping Pupil Adaptation**: Update `gl.toneMappingExposure` via pure function `lerpExposure` (Day: 1.00, Sunset: 1.06, Night: 1.14, Auction Spotlight: 0.94), guarded by `Number.isFinite` to prevent `NaN` flashes.
   - **Theatrical Auction Fog**: During auctions (`isAuctionActive`), pull atmospheric fog to `near = 18.0m`, `far = 55.0m`, synchronously lerping `scene.fog` and `scene.background` toward deep slate `#0F172A`.
   - **Instanced Foliage Wind Sway**: Inside `useSafeFrame`, only update tilt across 3 canopy tiers (`PALM_TIER_SWAY_FACTORS = { 1: 0.6, 2: 0.8, 3: 1.0 }`), keeping trunks stationary with zero allocations in the frame loop.

4. **Auction Theatrical FX & Dual-Layer Vignette**:
   - **Bid Flash Reaction**: New highest bid triggers light burst decaying quadratically $(1 - t/d)^2$ over $0.35$s. Read selector directly via `useGameStore((s) => s.auction?.currentBid ?? 0)`.
   - **Champagne Bloom & Vignette**: On `isAuctionActive = true`, lower `bloomThreshold` to $1.2$ and raise `vignetteDarkness` to $0.35$.
   - **Dual-Layer 2D Vignette**: In `CinematicOverlay`, separate into 2 gradient divs (Cyan and Slate `rgba(15, 23, 42, 0.70)`), transitioning via CSS `opacity duration-500 ease-out`.

5. **Dynamic Depth of Field (Tilt-Shift Macro) & Focal Grounding**:
   - **Motion & Overview Crispness Gate**: During pawn motion (`isPawnAnimating = true`) or dice roll (`isRolling = true`), DoF MUST be fully disabled (`bokehScale = 0.0`). Overview angle also disables DoF for pin-sharp tile clarity.
   - **GameOver Modal DoF Leak Guard**: On match conclusion (`activeModal === 'game_over'`), disable DoF (`DOF_PROFILES.off`) and reset focal target to `[0, 0, 0]`.
   - **Dynamic Optical Focal Target**: Focal coordinates (`dofTarget`) calculate dynamically via `resolveDofTarget`: track tile coordinates `cellPosition(targetCell)` during inspection, and track central podium `[0, 3.0, 0]` during auctions.
   - **Optical Scale Hierarchy**: Auctions use `bokehScale = 0.45`, `focusRange = 6.0m`. Tile inspection uses `bokehScale = 0.28`, `focusRange = 9.0m`.

6. **HCMC Metro Line 1 Viaduct Architecture & AST Contracts**:
   - **JSX Direct Ordering**: In `DioramaBallastBed`, the 4 primary ballast meshes (`#475569`) MUST reside first directly under `<group>` to satisfy contract string-slice windows (`TC-RBWS01.02-04`).
   - **Direct Children & Shadow Budget**: At least 4 railroad tie meshes (`#451A03`) MUST be direct children of `<group data-testid="diorama-model-railroad">`. Disable `castShadow` on ties, ballast, piers, and railings.

7. **3D Spline Kinematics Arc-Length Calibration**:
   - **Arc-Length Verification**: Kinematic rail splines (`CatmullRomCurve3`) must verify: (1) Total circumference `curve.getLength() \in [50.0m, 58.0m]` (`TC-IMP134.01`); (2) Station stopping points at progress 0.12 (South) and 0.62 (North) align with platforms (error $< 0.3\text{m}$).

8. **Curved Viaduct Modular Geometry & Static Precomputation**:
   - **Module-Level Static Geometry**: 32 curved girder segments and 16 piers MUST be precomputed once at module scope (`buildViaductGeometry()`), eliminating GC churn in frame loops.

9. **3D Spline Centripetal Parameterization & Ballast De-collision**:
   - **Centripetal Spline**: Waypoint paths (`TRACK_POINTS`) MUST use `'centripetal'` with `tension = 0.15` to limit tangent variation to $< 6.0^\circ$ and eliminate $45^\circ$ corner kinks. Viaduct requires 96 segments. Ground ballast meshes truncate to $10.6\text{m}$ to eliminate protruding corner overlap.

10. **Physical Visual Evidence & Anti-AST-Hallucination Gate**:
    - **Visual Defects Invisible to AST**: Polygon clipping, spline cusping, and layout overflows cannot be verified via AST string assertions.
    - **Mandatory Screenshot Prerequisite**: Any UI/3D ticket MUST execute `npm run capture:visual -- --ticket <ID>` prior to Station 3. Subagents must VETO if physical screenshots are missing.

11. **Three.js Euler Yaw Gimbal Clamp**:
    - **Euler Order 'YXZ'**: Default rotation order `'XYZ'` clamps Y-yaw to $[-\pi/2, \pi/2]$, causing gimbal flip on North-facing tiles ($180^\circ$). MUST use `'YXZ'` order: `new THREE.Euler(0, 0, 0, 'YXZ').setFromQuaternion(quat)`.

12. **Zero Raw DOM Elements Inside R3F Canvas Without `<SafeHtml>`**:
    - **Physical Crash**: Placing raw HTML tags (`div`, `span`, `p`, `button`) as children of Three.js components crashes fataly on real browsers (`Span is not part of the THREE namespace!`).
    - **Invariant**: Raw HTML inside Three.js trees MUST be wrapped with `<SafeHtml>` (delegating to `@react-three/drei` `<Html>` on browsers, `React.Fragment` in SSR).

13. **In-Action Visual Evidence & Camera Telemetry**:
    - **In-Action Capture Prerequisite**: Features modifying kinematics, cameras, dice, or pawns MUST be captured in-action via `--scenario` in `capture_visual_evidence.mjs` (e.g. `--scenario camera_chase_normal`). Idle overview screenshots (elevation $Y > 22$) are FORBIDDEN as evidence for dynamic features.
    - **Camera Telemetry**: Extract coordinates from `window.__threeCamera` into `.agents/evidence/camera_telemetry_[ticket]_[viewport].json`.

14. **Dual-Platform 3D Performance & Mobile Thermal Throttling**:
    - **2-Tier Architecture**: Desktop (Full Fidelity) vs Mobile (Performance & Thermal First).
    - **Explicit Prop Propagation**: Propagate `isMobile` explicitly down component trees. Subcomponents must not execute redundant device sniffers.
    - **Mobile Micro-Animation Freeze**: On `isMobile === true`, freeze non-essential background animations (traffic, cruisers, boats, birds) to keep mobile draw calls $\le 45$.
    - **Contact Shadows Omission**: `ContactShadows` renders exclusively on Desktop (`{!isMobile && <ContactShadows />}`).

15. **Spatial Kinematics Corner Banking & Dual-Vector Continuity**:
    - **Transient vs Landing Gate**: Corner banking only activates while pawns traverse intermediate corners ($v > 0$). When $v = 0$ (landing destination), camera snaps perpendicular to tile facade. Bank both `position` and `target` synchronously.

16. **Cinematic Spline Flight & Macro Game Phase Scaling**:
    - **Seaward Peak Radius ($R \ge 22\text{m}$)**: Go-to-Jail circular flight path curves outside board ($|Z| \ge 22.0\text{m}$) to eliminate center mesh clipping.
    - **Monotonic Phase Progression**: Camera altitude across match acts ($P_1$: 25.3m, $P_2$: 22.0m, $P_3$: 18.5m) obeys monotonic non-decreasing progression $P_{\text{eff}} = \max(P_{\text{prev}}, P_{\text{rounds}}, P_{\text{buildings}})$.

17. **OrbitControls Slerp & Gesture Break-on-Touch**:
    - **Spherical Orbit Slerp**: Return from free-roam uses spherical orbit slerp ($|\Delta\theta| \le \pi, \phi \in [0.02, \pi - 0.02]$).
    - **Break-on-Touch**: Touching screen to interrupt soft return sets `justBrokeSoftReturnRef` and returns early.
    - **Permanent Beacon Mounting**: Mount locator beacon permanently via `<group visible={isVisible}>`. Returning `null` triggers GPU shader reallocation churn.

18. **Cinematic Camera Arbitration & Preemption**:
    - **Inspection Grace Period**: 800ms grace period after free panning holds camera position. Preempts immediately upon priority events: modal open, tile focus, dice roll, or turn advance. Driver resolver uses primitive boolean scalars.

19. **Optical Lens Trigonometry & Screen-Space Target Framing**:
    - **Lens Trigonometry**: Calculate vertical lens trigonometry: $\tan(vFOV / 2) = \tan(hFOV_{\text{base}} / 2) / \max(0.42, aspect)$, scaling $38^\circ \to 48^\circ$ (`pawn_chase`) on mobile portrait. Camera target elevates to building center of mass ($Y = 0.85\text{m}$). Bot chase boost engages `speed: 7.2`.

20. **Mobile Water Shader LOD, Vertex Fresnel & TBDR Depth Buffer**:
    - **TBDR Depth Buffer**: Transparent ocean water MUST maintain `transparent: true` and `depthWrite: false` across all platforms to prevent early-Z depth clipping of shoreline foam.
    - **Vertex-Evaluated Fresnel**: Evaluating `vFresnel` in the vertex shader elides 75%–80% fragment ALU and avoids FP16 mantissa overflow ($> 65,504$). Purge unused varying registers.

21. **R3F Transient Unmount & Shader Churn Invariant**:
    - FORBIDDEN returning `null` when `useFrame` is registered. Use `<group visible={...}>` to prevent GPU buffer and shader reallocation churn.

22. **Anti-Conjectural Root Cause & Diagnostic Telemetry**:
    - FORBIDDEN resolving visual glitches solely by inspecting `.tsx` source code. Use diagnostic observability tools (`?debug=3d`, layer toggles, live telemetry) in Station 0.5 to isolate the physical cause.

23. **Interaction Dead Man's Switch & Gesture Resilience**:
    - Trapped pointer collections (`activePointersRef`) MUST clear on `window.blur` and `document.hidden`. Inactivity TTL > 3000ms auto-purges trapped pointers to restore frameloop cooldown.

24. **Volumetric Mobile Terrain & Anti-Z-Fighting**:
    - **Zero 2D Planar Stacking on Mobile**: On mobile 16-bit depth buffers, flat 2D geometries MUST NOT be stacked with $\Delta Y < 0.02\text{m}$ ($2\text{cm}$).
    - **Volumetric Extrusions**: Use solid 3D geometries (`cylinderGeometry`, `boxGeometry`) with physical height $\ge 0.02\text{m}$. Omit flat fake contact shadow planes on mobile.
    - **Clearances**: Facade trimmings project forward $\ge 0.006\text{m}$ ($6\text{mm}$). Inter-volume embedding $\ge 0.002\text{m}$ ($2\text{mm}$). Road markings use `polygonOffset: true` (factor -1.0, units -4.0). Translucent headlight fans require `depthWrite: false`.

25. **Spatial Separation: Board Toy Indicators vs. Peripheral Diorama**:
    - Decoupled Subsystems: Board toy buildings ($Z = -0.80\text{m}$, property levels) and peripheral diorama buildings ($Z \approx -1.35\text{m}$, urban miniature context) are distinct entities. Disabling toy buildings when diorama buildings exist is forbidden.

26. **R3F Procedural BufferGeometry Singleton & VRAM Leak Invariant**:
    - Static procedural geometries MUST be pre-baked once as module-level singletons (`export const GEOM = ...`). Dynamic geometries belong in `useMemo` with disposal hooks. Zero inline `new *Geometry()` in JSX.

27. **Call-Site Grounded Draw Call Accounting & Unlit Materials**:
    - Draw call metrics MUST be verified at the top-level production call-site, accounting for parent prop suppressions. Meshes using `MeshBasicMaterial` MUST NOT declare `receiveShadow` or `castShadow`.

28. **Desktop Bay Sanctuaries & Stepped Podium Invariant**:
    - **Frustum & Clearance**: Outer edge clearance $\ge 10.60\text{m}$ ($\max(|X|, |Z|) - R_{\text{lagoon}} \ge 10.60\text{m}$) outside board outer edge $\pm 10.15\text{m}$. Sited on West/North flanks ($X \le -12\text{m}$ or $Z \le -12\text{m}$) within `overview` frustum (`|ndcX| <= 0.85, |ndcY| <= 0.82`), with zero foreground South/East occlusion.
    - **Stepped Stacking**: Upward tapering ($W_{\text{lower}} > W_{\text{upper}}$) with ascending elevations and $\ge 0.02\text{m}$ inter-volume embedding. Mount real `.glb` monuments via `<SafeGLTFModel fallback={null} />`.
    - **Mobile Zero-Allocation**: Desktop Ultra components MUST be gated by `!isMobile` and short-circuit `useMemo` to `null` on mobile (0 mobile draw calls, 0 allocations).

29. **Overview Camera Bottom-Dock Clearance & Contact Occlusion**:
    - **Cell 0 GO Clearance**: On desktop overview (1280x800), to prevent fixed bottom action docks (`fixed bottom-4`, height $\sim 64\text{px}$) from occluding the South tile label (Cell 0 Khởi Hành at $[+7.0, 0, +7.0]$), camera look-at center target requires a forward bias ($Z_{\text{target}} \ge +0.3\text{m}$) or pitch angle $\ge 40.0^\circ$ (baseline $38.6^\circ$).

30. **Standardized R3F Test Seam & Fixture Invariant**:
    - FORBIDDEN creating bespoke local mocks of `@react-three/fiber` or Three.js frame loops across test files. All R3F lifecycle, `useFrame`, and WebGL context simulation MUST use the centralized test seam `tests/helpers/r3f_test_harness.ts`. Pure 3D math and view-model transforms must be tested in isolation without headless WebGL initialization.


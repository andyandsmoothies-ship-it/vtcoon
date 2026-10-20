# PLAN: IMP-448 Desktop Post-Processing Crispness & Anti-Flicker Hardening

> **Phân hệ mục tiêu:** `client-3d`

## 1. Problem Statement & Root Cause
- **Problem**:
  1. On desktop browsers (specifically Edge / Chromium on Windows), the game screen appears excessively bright, washed-out, and blurry ("quá sáng nhìn nhòe").
  2. The 3D viewport exhibits a subtle, periodic flickering or pulsing ("màn hình chớp chớp nhẹ, nhẹ hơn hiện tượng z fighting trên android").
  3. Under certain post-processing combinations, the entire 3D diorama canvas clears to transparent/solid cyan sky due to an ANGLE shader division-by-zero / NaN error in screen-space ambient occlusion (N8AO).
- **Root Cause**:
  1. **N8AO & Logarithmic Depth Buffer Incompatibility**: `game_canvas.tsx` enables `logarithmicDepthBuffer: true` to prevent Z-fighting on mobile and diagonal camera angles. `N8AOPostPass` reconstructs world positions assuming standard linear depth. Under Windows ANGLE / DirectX, non-linear depth values cause N8AO's fragment shader to output NaN across all pixels, clearing the WebGL canvas to alpha 0 (cyan CSS background).
  2. **SelectiveBloom Threshold & Lightless Pass Misconfiguration**: `game_canvas.tsx` passed `enableSelectiveBloom={!isMobileDevice}`. `SelectiveBloom` has an aggressively low threshold ($0.45$ vs standard Bloom $2.5$), causing standard white tiles, sand, and water textures to bloom uncontrollably into a washed-out blur. Furthermore, no `lights` prop was passed to `SelectiveBloom`.
  3. **Telemetry Re-render & Unstable Vector Churn (Flicker Culprit)**: `ActivePostProcessingPipeline` subscribed reactively to `useTelemetryStore((s) => s.metrics.fps)`, re-rendering every 500ms. On each 500ms render, a fresh `new Vector3()` was instantiated and passed to `<DepthOfField target={...}>`, causing continuous camera focal target resets. Additionally, dead `passes` calculation in `ActivePostProcessingPipeline` ran every 500ms while `children` bypassed it.
  4. **`autoClear={false}` Stale Buffer Leak**: `<EffectComposer autoClear={false}>` prevented WebGLRenderer from clearing buffers before rendering each frame, resulting in stale pixel bleeding and ghosting.
- **Decision & Hardening Directives (Post-Challenge ADV-01..ADV-05)**:
  1. **[ADV-01] Retract Exposure Mutation & Modernize Living Test**: Preserve `toneMappingExposure: 1.08` in `game_canvas.tsx#L185` (protecting `TC-3D.03`). Formally include `tests/client/anti_aliasing_and_visual_crispness.test.ts` to modernize `TC-IMP34.19` (`autoClear === true`).
  2. **[ADV-02] Zero-Churn DepthOfField Target**: Retain `target={targetVector}` continuously on `<DepthOfField>` with `useMemo` memoization. Do NOT pass `target={undefined}` conditionally (which flips `autoFocus` and thrashes 6 WebGL RenderTargets on modal open/close, violating `TC-3D.19`). Rely on `bokehScale={enableDof ? resolvedBokehScale : 0}` and `focusRange` ($320.0$ when DoF is off).
  3. **[ADV-03] Wire Logarithmic Depth Guard in Pipeline**: In `ActivePostProcessingPipeline`, inspect `gl.capabilities.logarithmicDepthBuffer`. If active, automatically force `resolvedEnableAo = false` at the engine facade level, in addition to passing `enableAo={false}` from `game_canvas.tsx`.
  4. **[ADV-04] Standard High-Threshold Bloom**: In `game_canvas.tsx`, pass `enableSelectiveBloom={false}` so desktop uses standard global Bloom ($2.5$ threshold, $0.20$ intensity, `mipmapBlur={!isMobile}`) eliminating tile washout while preserving gold crest accents.
  5. **[ADV-05] Single-Sourced Pass Construction & Thin Facade**: Cleanly refactor `PostProcessingPipeline` into a 6-line thin facade forwarding props to `<ActivePostProcessingPipeline {...props} />` without outer Vector3 instantiation or redundant outer `renderPostProcessingPasses` call. Decouple reactive telemetry FPS subscription from pipeline. Set `<EffectComposer autoClear={true}>`.

[HARNESS_MUTATION_AUTHORIZED]: scripts/sentinel_probes/IMP-448.json

## 2. Target Files & LOC Budget

| Target Physical File | Type | Existing LOC | Budgeted LOC | Description |
| -------------------- | ---- | ------------ | ------------ | ----------- |
| `src/client/game_canvas.tsx` | Canvas Root | 253 | ~255 | Pass `enableAo={false}`, `enableSelectiveBloom={false}`; retain `toneMappingExposure: 1.08` |
| `src/client/3d/post_processing_pipeline.tsx` | Post-Processing | 379 | ~370 | Thin facade, wire `logarithmicDepthBuffer` guard, memoize `targetVector`, set `autoClear={true}`, decouple FPS |
| `tests/client/anti_aliasing_and_visual_crispness.test.ts` | Living Test | 213 | ~215 | Modernize `TC-IMP34.19` (`autoClear === true`) per Living Contract Migration Protocol |
| `tests/helpers/r3f_test_harness.ts` | Test Seam | 196 | ~200 | Add optional `capabilities` property to `MockR3FGl` |
| `tests/contracts/imp256_selective_bloom_pipeline.test.ts` | Living Test | 330 | ~335 | Modernize `getElementChildren` to execute `ActivePostProcessingPipeline` via `renderToStaticMarkup` |
| `tests/contracts/threejs_pipeline_hardening.test.ts` | Living Test | 270 | ~280 | Modernize `getElementChildren` to execute `ActivePostProcessingPipeline` |

## 3. Core Contract Invariants (1 per Distinct Rule)
1. **INV-448.01 (Logarithmic Depth & N8AO NaN Crash Prevention)**: When `enableAo` is false or `gl.capabilities.logarithmicDepthBuffer` is active, `PostProcessingPipeline` MUST omit or bypass the `N8AO` pass, preventing ANGLE shader NaN crashes from erasing the 3D scene into blank transparent canvas.
2. **INV-448.02 (Anti-Flicker & Telemetry Decoupling Invariant)**: `ActivePostProcessingPipeline` MUST NOT reactively re-render on every 500ms telemetry FPS tick. On desktop, `isBloomActive` is stably initialized to `true` (unless explicitly overridden via props), eliminating the 500ms jitter loop.
3. **INV-448.03 (Zero-Churn DepthOfField Memoization)**: `targetVector` MUST be memoized via `useMemo` in `ActivePostProcessingPipeline` and stably bound to `<DepthOfField target={targetVector}>` to protect `TC-3D.19/ZeroDofChurn` without re-allocating 6 WebGL RenderTargets on modal open/close. Zero blur is enforced via `bokehScale={enableDof ? resolvedBokehScale : 0}` and `focusRange` ($320.0$ when DoF is off).
4. **INV-448.04 (Buffer Integrity & Clean Frame Clearing)**: `<EffectComposer autoClear={true}>` MUST be set to `true` instead of `false`, preventing stale frame pixel accumulation and ghosting artifacts.
5. **INV-448.05 (Anti-Blowout Bloom & Tone Mapping Harmonization)**: In `game_canvas.tsx`, `enableSelectiveBloom={false}` ensures desktop uses standard global Bloom with safe `bloomThreshold >= 2.0` (default 2.5), `bloomIntensity <= 0.22`, and `mipmapBlur={!isMobile}`, delivering a crisp, high-definition tabletop Indochine diorama without washed-out or bloomed text.

## 4. Explicitly Dropped Requirements (Sean Goedecke Invariant)
- **NO re-architecting Three.js depth buffer to linear**: Logarithmic depth buffer is strictly retained across all platforms to prevent Z-fighting on mobile and oblique camera angles (Pillar gotchas).
- **NO bespoke WebGL shader overrides for N8AO**: N8AO is disabled cleanly on desktop rather than attempting to patch N8AO's internal GLSL shaders for logarithmic depth.
- **NO dynamic light tracking arrays for SelectiveBloom**: Standard global Bloom with high threshold ($2.5$) delivers identical visual accents with zero layer-isolation overhead.
- **NO conditional DepthOfField target flipping**: `target={targetVector}` is kept permanently bound to avoid GPU memory reallocation thrashing.

## 5. Principles Applied
- `[View-Model Seam Extraction]` -> Pure calculations `calculateDofConfig`, `resolveDofTarget`, and `calculateDynamicBloomThreshold` remain clean pure seams.
- `[Equivalence-Partition Testing]` -> `enableDof: true` vs `enableDof: false` partitions verified alongside desktop vs mobile bloom configurations.
- `[Relational Multi-Point Assertion]` -> Verifies non-constant covariance of postprocessing passes across different prop configurations.
- `[Ephemeral TTL / Dead Man's Switch]` -> Stable memoization and elimination of reactive 500ms jitter eliminates frame-loop churn.
- `[Dropped Requirements & Anti-Phantom Complexity]` -> Dropped complex N8AO depth-reconstruction shaders and bespoke light tracking in favor of rock-solid global Bloom.

## 6. Specification for Modifications & Call-Site Wiring

### Modifications in `src/client/game_canvas.tsx`
- In `<PostProcessingPipeline>` call-site (both lobby and in-game):
  - Pass `enableAo={false}` to prevent N8AO logarithmic depth crash.
  - Pass `enableSelectiveBloom={false}` to avoid lightless 0.45-threshold bloom blowout.
  - Retain `toneMappingExposure: 1.08` in Canvas `gl` (protecting `TC-3D.03`).

### Modifications in `src/client/3d/post_processing_pipeline.tsx`
- In `renderPostProcessingPasses`:
  ```tsx
  passes.push(
    <DepthOfField
      key="dof"
      target={targetVector}
      focusRange={dofFocusRange}
      bokehScale={enableDof ? resolvedBokehScale : 0}
    />
  );
  ```
- In `ActivePostProcessingPipeline`:
  - Read `gl.capabilities.logarithmicDepthBuffer`:
    `const { gl } = useThree();`
    `const isLogarithmicDepth = Boolean(gl?.capabilities?.logarithmicDepthBuffer);`
    `const effectiveEnableAo = enableAo && !isLogarithmicDepth;`
  - Remove reactive `useSafeTelemetryFps()` subscription:
    `const currentFps = fps !== undefined ? fps : 60;`
  - Memoize `targetVector`:
    `const targetVector = useMemo(() => new Vector3(dofTarget[0], dofTarget[1], dofTarget[2]), [dofTarget[0], dofTarget[1], dofTarget[2]]);`
  - Set `<EffectComposer multisampling={multisampling} autoClear={true}>`.

### Modifications in `tests/client/anti_aliasing_and_visual_crispness.test.ts`
- In `TC-IMP34.19`:
  - Update assertion from `expect(props.autoClear).toBe(false)` to `expect(props.autoClear).toBe(true)` with comment citing INV-448.04 anti-ghosting hardening.

## 7. Station 1 Test Contracts (`tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`)
- `TC-448.01` `[UC-DOF-ZERO-CHURN-TARGET/MSS]`: Given `enableDof = false`, When rendering passes, Then DepthOfField receives stable `target` Vector3 and `bokehScale === 0`, protecting TC-3D.19 without unmounting effect.
- `TC-448.02` `[UC-DOF-ACTIVE-SCALE/MSS]`: Given `enableDof = true`, When rendering passes, Then DepthOfField receives active `bokehScale > 0` matching configuration.
- `TC-448.03` `[UC-AO-BYPASS-SAFETY/MSS]`: Given `enableAo = false` or `isLogarithmicDepth = true`, When evaluating passes, Then N8AO is excluded from the pass list, preventing logarithmic depth NaN WebGL crashes.
- `TC-448.04` `[UC-EFFECT-COMPOSER-AUTO-CLEAR/MSS]`: Given `ActivePostProcessingPipeline`, When rendered, Then EffectComposer receives `autoClear === true` to guarantee clean frame-by-frame buffer clearing.
- `TC-448.05` `[UC-CALL-SITE-WIRING-CANVAS/MSS]`: Given `GameCanvas` call-sites, When inspecting props passed to `PostProcessingPipeline`, Then verifies `enableAo === false` and `enableSelectiveBloom === false` preventing desktop blowout and crash.
- `TC-448.06` `[UC-RELATIONAL-COVARIANCE/MSS]`: Given differing `enableDof` inputs ($x_1 \neq x_2$), When inspecting DepthOfField bokehScale props, Then returns distinct outputs ($f(\text{true}) \neq f(\text{false})$).

## 8. Station 3 Verification & Stopping Criteria (DoD)
- Fast Pre-Filter: `npm run prefilter -- src/client/game_canvas.tsx src/client/3d/post_processing_pipeline.tsx tests/client/anti_aliasing_and_visual_crispness.test.ts tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`
- Scope Confinement: `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_448_DESKTOP_POST_PROCESSING_CRISPNESS_AND_ANTI_FLICKER.md`
- Visual Capture: `node scripts/capture_visual_evidence.mjs --ticket IMP-448 --dual-viewport --scenario default`
- Chaos Sentinel: `npm run sentinel -- --ticket IMP-448 --test tests/contracts/imp448_desktop_post_processing_crispness_and_anti_flicker.test.ts`
- Evidence Audit: `node scripts/check_evidence.mjs IMP-448`
- Definition of Done:
  - 100% contract tests pass GREEN.
  - Zero regression across existing post-processing living tests (`tests/client/anti_aliasing_and_visual_crispness.test.ts`, `tests/contracts/imp256_selective_bloom_pipeline.test.ts`, `tests/contracts/threejs_pipeline_hardening.test.ts`).
  - Dual-viewport screenshots (1280x800 desktop and 360x740 mobile) captured with physical evidence showing crisp tabletop board without blowout, NaN erasing, or blur.
  - Chaos Sentinel kills 100% mutants targeting the call-site wiring and DoF target guard.
  - `docs/FEATURE_MAP.md` updated and <= 30 KB.

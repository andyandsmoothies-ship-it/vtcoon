# Lean Plan: IMP-425 GPU VRAM Lifecycle Concurrent & Discarded Render Leak Guard

> **Ticket:** `IMP-425`  
> **Classification:** Tier 1 Domain/Hooks (3D Resource Management)  
> **Subsystem Boundaries:** `src/client/3d/hooks/`, `tests/client/`  
> **Primary Goals:** Eliminate premature WebGL resource disposal in React 18/19 StrictMode while preserving synchronous unmount contracts for living suites and maintaining 100% backward compatibility for production consumers (`CentralHologram`).

---

## 1. Principles Applied

- **[Resource Disposal & Cache Hygiene]** -> Dissect physical Three.js WebGL allocation lifecycle: uncommitted renders hold 0 GPU VRAM; avoid wall-clock timers that pin memory or cause premature disposal under Suspense.
- **[Seam Discipline]** -> Zero Anti-TIDD test-only exports. The public interface is the test boundary; test lifecycle via observable component contracts and Three.js prototypes.
- **[StrictMode & Remount Resilience]** -> Scope microtask deferral strictly to the initial mount turn to absorb StrictMode simulated unmount/remount, while executing true settled unmount and dependency invalidations synchronously.
- **[100% DTO & Call-Site Wiring]** -> Preserve 100% backward compatibility for production consumers (`CentralHologram`, `penthouse_hologram.tsx`).
- **[Relational Multi-Point Assertion]** -> Contract test asserts StrictMode remount preservation, true settled unmount disposal, dependency transition, and CentralHologram wiring.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/hooks/use_managed_geometry.ts` | Tier 1 Domain/Hooks | 121 | 121 | ~0 | 400 | Safe (Concurrent & StrictMode Guard) |
| `tests/client/imp421_gpu_vram_lifecycle_hooks.test.ts` | Living Test | 213 | 213 | ~0 | 600 | Safe (Preserved 100% Green) |
| `tests/client/imp425_gpu_vram_concurrent_lifecycle.test.ts` | Living Test | 272 | 272 | ~0 | 600 | Safe (New StrictMode Contract Suite) |

---

## 3. Core Contract Invariants & Architectural Seams

1. **[INV-425.01: Initial-Mount StrictMode Absorption via Scoped Microtask Deferral]**:
   - React StrictMode simulates unmount/remount exclusively during the initial mount turn (Commit -> Cleanup -> Remount in same synchronous cycle).
   - During the initial mount turn (`isSettledMounted = false`), effect cleanup defers disposal to a microtask. If remount occurs in the same synchronous cycle, the remount effect cancels the pending disposal.
   - Once the initial mount turn completes (`isSettledMounted = true`), all subsequent unmount cleanups and dependency changes dispose **synchronously**, fully preserving existing synchronous `act(() => root.unmount())` test contracts (`imp421`).

2. **[INV-425.02: Zero Wall-Clock Timers & Suspense Safety]**:
   - Zero wall-clock timers (`setTimeout`). Three.js uncommitted renders hold 0 GPU VRAM (WebGL buffer allocation only happens during `WebGLRenderer.render()`). Abandoned render allocations are native JS CPU memory, collected by V8 GC upon fiber drop.
   - Eliminates the premature disposal hazard under React 19 `<Suspense>` boundaries (`main.tsx#L218`, `safe_gltf_model.tsx#L286`) where async loads exceed wall-clock timeouts.
   - When a component re-renders with new dependencies, the prior uncommitted resource is swapped and cleaned up within the hook lifecycle without global timer leaks.

3. **[INV-425.03: Idempotent Disposal & Anti-TIDD Boundary]**:
   - `disposeResource` maintains a `WeakSet` (`disposedRegistry`) recording only **physically executed** disposals. Calling `disposeResource` multiple times is strictly idempotent (0 duplicate disposal calls, 0 throws).
   - Zero test-only exports (`getUncommittedResourceCount`, `flushUncommittedDisposables`). Public surface remains strictly: `DisposableResource`, `isDisposable`, `disposeResource`, `useManagedDisposable`, `useManagedBufferGeometry`, `useManagedCanvasTexture`.
   - 100% backward compatible with `CentralHologram` (`src/client/3d/penthouse_hologram.tsx`).

---

## 4. Contract Test Scenarios (Station 2 Specification)

- **TC-425.01 [UC-STRICT-MODE-RESILIENCE/MSS]**: Given a component wrapped in React StrictMode simulation (mount -> unmount -> remount in initial turn), When remounted, Then resource is not disposed prematurely and remains valid for rendering.
- **TC-425.02 [UC-SETTLED-UNMOUNT-SYNCHRONOUS/MSS]**: Given a settled mounted component, When truly unmounted via root.unmount(), Then resource.dispose() is invoked synchronously without microtask delay (preserving imp421 contract).
- **TC-425.03 [UC-DEPENDENCY-SYNCHRONOUS-DISPOSAL/MSS]**: Given a committed component, When hook dependencies change, Then prior resource is safely disposed synchronously and new resource is committed.
- **TC-425.04 [UC-IDEMPOTENT-DISPOSAL-GUARD/A1]**: Given an active disposable resource, When disposeResource is invoked multiple times, Then underlying .dispose() is executed exactly once without throwing.
- **TC-425.05 [UC-SUSPENSE-SAFETY-NO-WALL-CLOCK/MSS]**: Given a component rendered before an async boundary, When commit is delayed, Then resource is not prematurely destroyed by an arbitrary timer before mount.
- **TC-425.06 [UC-CENTRAL-HOLOGRAM-COMPATIBILITY/MSS]**: Given CentralHologram consuming useManagedBufferGeometry and useManagedCanvasTexture, When component unmounts, Then both particle geometry and hud texture are actively disposed.

---

## 5. Definition of Done (DoD)

- [ ] Plan audited and signed via `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_425_GPU_VRAM_CONCURRENT_LIFECYCLE.md --auto-sign`.
- [ ] Adversarial challenge resolved and signed in `.agents/audit/PLAN_CHALLENGE_IMP-425.md`.
- [ ] Station 2: `tests/client/imp425_gpu_vram_concurrent_lifecycle.test.ts` authored (Semantic RED verified).
- [ ] Station 2.5: Implementation complete in `src/client/3d/hooks/use_managed_geometry.ts` (All tests GREEN).
- [ ] `npm run prefilter -- src/client/3d/hooks/use_managed_geometry.ts tests/client/imp425_gpu_vram_concurrent_lifecycle.test.ts` passes exit 0.
- [ ] Living test suite `tests/client/imp421_gpu_vram_lifecycle_hooks.test.ts` (6/6 tests) passes 100% with zero regressions.
- [ ] Comprehensive evidence recorded and verified via `node scripts/check_evidence.mjs imp-425`.

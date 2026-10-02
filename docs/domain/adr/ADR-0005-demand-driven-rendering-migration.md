# ADR-0005: Demand-Driven Rendering Migration (frameloop="demand")

## Status
**Draft — Deferred. Not scheduled. Tracked in Tech Debt Ledger.**

Prerequisite: IMP-241 (post-processing pipeline) and IMP-242 (pawn geometry) must ship first.

---

## Context

R3F defaults to `frameloop="always"` — GPU renders at 60 FPS even when the scene is fully static. For a turn-based board game, ~80–90% of runtime is static. Continuous rendering wastes battery and generates heat on mobile devices (NFR violation).

Switching to `frameloop="demand"` is not a single-line change. It is an **architectural migration** requiring coordinated changes across 7 subsystems before a single prop update is safe.

---

## Subsystem Inventory (7 systems that must be migrated)

Each system below currently drives rendering via `useFrame` or continuous loops. All must be migrated before `frameloop="demand"` is safe to enable.

| # | Subsystem | File | Current Dependency | Migration Action |
|---|---|---|---|---|
| 1 | `TropicalWater` | `tropical_water.tsx` | `useSafeFrame` — increments `uTime` uniform every frame | Move `uTime` to internal `requestAnimationFrame` + call `invalidate()` on each tick, OR accept frozen water in sleep state (Low-Power Mode) |
| 2 | `TimeOfDayLighting` | `time_of_day_lighting.tsx` | `useSafeFrame` — lerps colors, exposure, fog every frame | Decouple render loop from business logic. Call `invalidate()` during active phase transitions only (e.g. 5s day→night window). Idle between transitions. |
| 3 | `AdaptiveDprController` | `adaptive_dpr_controller.tsx` | `useFrame` — samples FPS every frame | FPS = 0 when canvas is idle, breaking DPR logic. Needs alternative sampling source (e.g. `performance.now()` delta from last `invalidate` call). |
| 4 | `PawnAnimator` | `pawn_animator.tsx` | `useFrame` — drives position lerp every frame | Call `invalidate()` while animation is active. Stop when pawn reaches destination. |
| 5 | `CameraStateMachine` | Camera logic | `useFrame` — lerps camera position | Call `invalidate()` continuously while camera is lerping. Stop on arrival. |
| 6 | `ScreenShake` | VFX store / camera | Duration-based frame loop | Call `invalidate()` for the shake duration, then stop. |
| 7 | `AuctionParticleEngine` | Particle system | Particle lifetime loop | Call `invalidate()` while particles are alive. Stop when all particles expire. |

---

## Trigger Mechanism

Do **not** scatter `invalidate()` calls across individual components. Use a central registry:

```typescript
// Proposed: AnimationOrchestrator (new module)
// Components register/unregister animation activity.
// Orchestrator calls invalidate() via useFrame when registry > 0 subscribers.

const orchestrator = {
  subscribers: new Set<string>(),
  register(id: string)   { this.subscribers.add(id);    },
  unregister(id: string) { this.subscribers.delete(id); },
  isActive()             { return this.subscribers.size > 0; },
};
```

**Rule:** Any component that drives visual change must `register` on mount/animation-start and `unregister` on unmount/animation-end. The orchestrator's `useFrame` loop calls `invalidate()` if `isActive()`. This is the single source of truth for "should the canvas render this frame?"

**Ambient animations** (water, day/night) use a separate lightweight internal `requestAnimationFrame` loop that runs outside R3F — they update uniforms independently and call `invalidate()` themselves without blocking the orchestrator.

---

## Sleep Criteria

The canvas is considered **sleeping** (safe to skip render) when all of the following are true:

```typescript
const isSceneSleeping =
  orchestrator.subscribers.size === 0 &&  // no registered animators
  !isCameraLerping &&                      // camera at rest
  !hasActiveParticles &&                   // no live particles
  !isDiceRolling &&                        // dice physics settled
  ambientFpsTarget === 0;                  // ambient animations not requesting frames
```

When `isSceneSleeping === true`, the orchestrator stops calling `invalidate()`. R3F renders only on explicit user interaction (click, hover triggers `invalidate()` via event handlers).

---

## Ambient Animation Fallback

Two options for `TropicalWater` and `TimeOfDayLighting` during sleep:

**Option A — Freeze (Low-Power Mode)**
Accept that water and sky freeze when scene is sleeping. Resume on first `invalidate()`. Acceptable for short idle periods (< 5s). Visible stutter on wake-up.

**Option B — Decoupled rAF (Recommended)**
Water and lighting run their own minimal `requestAnimationFrame` loop that **only updates uniforms** (CPU-side) and calls R3F `invalidate()` at a reduced rate (e.g. 10 FPS). Canvas renders at 10 FPS ambient, full 60 FPS on interaction. No stutter on wake-up. Cost: one rAF per ambient subsystem.

**Decision deferred** — both options are valid depending on target device tier. Must be benchmarked before implementation.

---

## Consequences

**Positive**
- ~90% GPU reduction during idle turns
- Battery and thermal improvement on mobile (meets NFR)
- Enables future background-tab sleep (`document.visibilitychange` already guarded in `PerfTelemetryTracker`)

**Negative**
- Any new 3D component added without `register/unregister` will silently produce static frames — invisible bug requiring discipline
- Ambient animation quality degrades in Option A
- Migration sprint estimate: 2–3 sprints with full test coverage for "canvas wake-up" on user interaction

---

## Implementation Gate

This ADR moves to **Accepted** only when:
1. All 7 subsystems above have a concrete migration plan with drop-in snippets
2. `AnimationOrchestrator` module spec is written and reviewed
3. Ambient animation fallback option is decided (A or B)
4. A dedicated ticket with Station 1–4 pipeline is created

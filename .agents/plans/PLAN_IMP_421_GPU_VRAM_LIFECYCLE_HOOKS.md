# PLAN_IMP_421: GPU VRAM Lifecycle & Managed Three.js Resource Hooks

## 1. Context & Architectural Goal
- **Source Strategy**: SDLC Hardening V6.0 Pillar 4 — GPU VRAM Lifecycle & Managed Three.js Resource Hooks.
- **Classification**: Tier 1.5 Resource Management Hooks & 3D Lifecycle.
- **Subsystem Boundary Isolation**: Strictly confined to `src/client/3d/` (`client-3d` subsystem).
- **Problems**:
  1. Three.js `BufferGeometry` and `CanvasTexture` instances allocate dedicated WebGL buffers and texture memory on the GPU that are not managed by standard JavaScript garbage collection.
  2. In long-running game sessions or dynamic component mounts/unmounts (such as HUD screens, hologram particles, and procedural meshes), manual disposal is error-prone and leads to GPU memory accumulation and WebGL context loss on mobile hardware.
- **Architectural Solution & Seam Discipline**:
  1. Build managed resource hooks `useManagedBufferGeometry` and `useManagedCanvasTexture` in `src/client/3d/hooks/use_managed_geometry.ts`.
  2. Implement safe disposal helper `disposeResource` and core hook `useManagedDisposable` using React `useMemo` and `useEffect` cleanup.
  3. Wire directly into production consumer `CentralHologram` in `src/client/3d/penthouse_hologram.tsx`, eliminating bespoke boilerplate and preventing VRAM leaks.
  4. Satisfy Wiring Parity Invariant: Contract test verifies both hook lifecycle mechanics and physical production call-site consumer wiring.

### Principles Applied
- **Resource Disposal & Cache Hygiene** -> Guarantees automatic `.dispose()` execution on unmount and dependency changes, preventing VRAM leaks on mobile GPUs.
- **View-Model Seam Extraction** -> Decouples GPU buffer/texture lifecycle management from specific 3D mesh rendering JSX.
- **100% DTO & Call-Site Wiring** -> Wires `useManagedBufferGeometry` and `useManagedCanvasTexture` directly into `CentralHologram` in `penthouse_hologram.tsx`.
- **Equivalence-Partition Testing** -> Partitions test matrix across unmount disposal, dependency change disposal, error/null guards, and consumer wiring.
- **Relational Multi-Point Assertion** -> Asserts distinct reference generation and disposal ordering across state transitions to defeat constant-return hardcoding.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/3d/hooks/use_managed_geometry.ts` | Tier 1 (Hooks) | 0 | 75 | +75 | 400 | Safe (New File) |
| `src/client/3d/penthouse_hologram.tsx` | Tier 2 (3D Visuals) | 276 | 268 | -8 | 500 | Safe (Call-Site Consumer) |
| `tests/client/imp421_gpu_vram_lifecycle_hooks.test.ts` | Living Test | 0 | 165 | +165 | 600 | Safe (New Contract Suite) |

---

## 3. Drop-In Replacement Snippets & New Code Specifications

### **Target physical file**: `src/client/3d/hooks/use_managed_geometry.ts` (New)

```typescript
import { useEffect, useMemo, type DependencyList } from 'react';
import type { BufferGeometry, CanvasTexture } from 'three';

export interface DisposableResource {
  dispose(): void;
}

export function isDisposable(value: unknown): value is DisposableResource {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  return 'dispose' in value && typeof Reflect.get(value, 'dispose') === 'function';
}

export function disposeResource(res: unknown): boolean {
  if (isDisposable(res)) {
    try {
      res.dispose();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function useManagedDisposable<T extends DisposableResource>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null {
  const resource = useMemo(() => {
    try {
      return factory() ?? null;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    return () => {
      if (resource) {
        disposeResource(resource);
      }
    };
  }, [resource]);

  return resource;
}

export function useManagedBufferGeometry<T extends BufferGeometry>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null {
  return useManagedDisposable<T>(factory, deps);
}

export function useManagedCanvasTexture<T extends CanvasTexture = CanvasTexture>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null {
  return useManagedDisposable<T>(factory, deps);
}
```

### **Target physical file**: `src/client/3d/penthouse_hologram.tsx`

```typescript
<<<<
import { generateHologramScreenTexture } from './penthouse_texture_generator';
====
import { generateHologramScreenTexture } from './penthouse_texture_generator';
import { useManagedBufferGeometry, useManagedCanvasTexture } from './hooks/use_managed_geometry';
>>>>
```

### **Target physical file**: `src/client/3d/penthouse_hologram.tsx`

```typescript
<<<<
  const hudScreenTexture = useMemo(() => generateHologramScreenTexture(), []);

  const particleGeometry = useMemo(() => {
    const geo = new BufferGeometry();
    const positions = generateLaserNanoParticles(120);
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      if (typeof hudScreenTexture?.dispose === 'function') {
        hudScreenTexture.dispose();
      }
      particleGeometry.dispose();
    };
  }, [hudScreenTexture, particleGeometry]);
====
  const hudScreenTexture = useManagedCanvasTexture(() => generateHologramScreenTexture(), []);

  const particleGeometry = useManagedBufferGeometry(() => {
    const geo = new BufferGeometry();
    const positions = generateLaserNanoParticles(120);
    geo.setAttribute('position', new BufferAttribute(positions, 3));
    return geo;
  }, []);
>>>>
```

---

## 4. Station 1 Contract Test Specifications (Lean Invariants)

- **TC-421.01 [UC-MANAGED-RESOURCE-UNMOUNT-DISPOSAL/MSS]**: Given a component mounting `useManagedBufferGeometry`, When unmounting the component, Then `.dispose()` is invoked exactly once on the created BufferGeometry.
- **TC-421.02 [UC-MANAGED-RESOURCE-DEPS-DISPOSAL/MSS]**: Given a component using `useManagedBufferGeometry` with reactive dependencies, When the dependency changes, Then the prior geometry is disposed and replaced by the newly created geometry.
- **TC-421.03 [UC-MANAGED-TEXTURE-UNMOUNT-DISPOSAL/MSS]**: Given a component mounting `useManagedCanvasTexture`, When unmounting the component, Then `.dispose()` is called on the CanvasTexture.
- **TC-421.04 [UC-MANAGED-TEXTURE-DEPS-DISPOSAL/MSS]**: Given a component using `useManagedCanvasTexture` with reactive inputs, When inputs change, Then the previous texture is disposed while the new texture is retained.
- **TC-421.05 [UC-MANAGED-RESOURCE-SAFETY-GUARDS/A1]**: Given invalid factory return values or already-disposed resources, When calling `disposeResource` or `useManagedDisposable`, Then handles gracefully without throwing unhandled exceptions.
- **TC-421.06 [UC-MANAGED-RESOURCE-CONSUMER-WIRING/MSS]**: Given the `CentralHologram` component in `penthouse_hologram.tsx`, When inspecting its call-site implementation, Then proves direct consumer wiring of `useManagedBufferGeometry` and `useManagedCanvasTexture`.

---

## 5. Regression Verification Plan

Execute the contract test alongside living penthouse suites:
```bash
npx --yes vitest run tests/client/imp421_gpu_vram_lifecycle_hooks.test.ts tests/client/penthouse_hologram.test.ts
```

Execute evidence audit:
```bash
node scripts/check_evidence.mjs imp-421
```

---

## 6. Definition of Done (DoD) & Stopping Criteria

1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_421_GPU_VRAM_LIFECYCLE_HOOKS.md --auto-sign` passes with 0 defects.
2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_421_GPU_VRAM_LIFECYCLE_HOOKS.md` passes with 0 scope leaks.
3. `npm run prefilter -- src/client/3d/hooks/use_managed_geometry.ts src/client/3d/penthouse_hologram.tsx tests/client/imp421_gpu_vram_lifecycle_hooks.test.ts` passes with 0 warnings/errors.
4. All living penthouse and 3D test suites pass 100% green.
5. `node scripts/check_evidence.mjs imp-421` passes with 0 failures.

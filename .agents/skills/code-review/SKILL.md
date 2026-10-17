---
name: code-review
description: Comprehensive deep code review guidance for React, TypeScript, Performance/Memory Leaks, Concurrency/Race Conditions, and Universal Code Quality Anti-Patterns. Use during Station 3.2 Deep Architecture & Anti-Slop Audit.
---

# Code Review Skill (VTCOON Enterprise & Game Engine Edition)

This skill provides deep, actionable code review criteria specifically tuned for high-performance React, Three.js (R3F), TypeScript, and deterministic event-driven game architecture.

---

## 1. Core Review Pillars & Reference Guides

When auditing pull requests, diffs, or Station 3.2 implementation slices, consult the specialized reference guides:

| Domain | Reference Guide | Key Inspection Points |
| :--- | :--- | :--- |
| **React 18/19** | [`reference/react.md`](reference/react.md) | Hook rules, `useEffect` anti-patterns (no derived state in effects), stale closures, missing cleanup functions, re-render cascades, correct `useMemo`/`useCallback` usage. |
| **TypeScript 5.x** | [`reference/typescript.md`](reference/typescript.md) | Type narrowing, discriminated unions, `as const`, avoiding unsafe widening casts (`as EnumUnion`), exhaustive switch checking, immutability. |
| **Performance & Leaks** | [`reference/performance-review-guide.md`](reference/performance-review-guide.md) | Web Vitals, Three.js resource disposal (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`), memory retention in closures/listeners, render loop allocations (`useFrame`). |
| **Concurrency & Race** | [`reference/cross-cutting/async-concurrency-patterns.md`](reference/cross-cutting/async-concurrency-patterns.md) | Concurrent socket delta vs local state races, unhandled promise rejections, task/timer leaks, TOCTOU in balance/asset transactions. |
| **Universal Quality** | [`reference/code-quality-universal.md`](reference/code-quality-universal.md) | Code reuse audit, parameter sprawl, leaky abstractions, stringly-typed code, no-op updates, redundant state. |
| **Common Bugs** | [`reference/common-bugs-checklist.md`](reference/common-bugs-checklist.md) | Off-by-one errors, null/undefined navigation, event listener leakage, boundary condition traps. |
| **Error Handling** | [`reference/cross-cutting/error-handling-principles.md`](reference/cross-cutting/error-handling-principles.md) | Fail-fast, structured domain errors, zero silent error swallowing (`try {} catch {}`). |
| **Architecture** | [`reference/architecture-review-guide.md`](reference/architecture-review-guide.md) | SOLID, high cohesion / low coupling, clean dependency direction. |

---

## 2. The 5 Fatal Micro-Inspection Checklists

Reviewers MUST actively audit the following 5 fatal bug vectors before approving any code slice:

### ① React Lifecycle & Hook Hygiene
- [ ] **No Derived State in Effects**: If state can be computed from props or existing state, compute it directly during rendering (or via `useMemo`), never in a `useEffect`.
- [ ] **Mandatory Effect Cleanup**: Any `useEffect` or subscription subscribing to DOM events, sockets, timers, or animation frames MUST return a clean tear-down function.
- [ ] **No Inline Allocations in 60 FPS Render Loops**: Inside `useFrame` or frequently rendered components, forbid `new Vector3()`, inline arrow functions, or object allocations that trigger GC pauses.

### ② TypeScript & Type Safety
- [ ] **Zero Dirty Casts**: Strictly zero `as any` or `as unknown as T`.
- [ ] **No Unsafe Widening Casts**: Forbid casting a generic `string` directly to a domain union (`status as GamePhase`). Mandate runtime type guards or registry membership checks.
- [ ] **Discriminated Unions for Polymorphic Payloads**: Network envelopes, action intents, and floating text events must use discriminated unions with exhaustive `switch` cases.

### ③ Concurrency & Race Hazards
- [ ] **Asynchronous State Interleaving**: If an async operation takes $\ge 1$ tick, does a subsequent state mutation or socket event cause a race condition or stale overwrite?
- [ ] **Dead Man's Switch / Ephemeral TTL**: Every transient lock (`isRolling`, `isPawnAnimating`, modal guards) must have an authoritative timeout (3s–5s) to prevent permanent UI lockouts on aborted flows.
- [ ] **TOCTOU Guard**: Economic transactions (purchases, mortgages, trades) must validate conditions at the moment of execution, not rely solely on stale UI validation.

### ④ Memory & Resource Disposal
- [ ] **Three.js Disposal Discipline**: Any dynamically instantiated textures, canvas generators, materials, or geometries must be cached (singleton/pool) or explicitly disposed on unmount.
- [ ] **Timer Hygiene**: Every `setTimeout` or `setInterval` handle must be tracked and cleared on component unmount or state transition.

### ⑤ Anti-Slop & Deep Modules
- [ ] **No Micro-Splintering**: Logic files $< 30$ LOC created solely to evade LOC ceilings are forbidden.
- [ ] **No 1-line Middle-Man Proxies**: Functions that merely pass arguments through without validation or transformation are forbidden.
- [ ] **100% Presentation Wire**: Every new domain method, prop, or parameter must be actively wired and consumed at a live production call-site, not just in unit tests.

---

## 3. Severity Tiers & Anti-Rubber-Stamping Directive

All findings must be classified into 3 standardized tiers:

- 🔴 **`[BLOCKER]` (or `[blocking]`)**: Logic bugs, race conditions, memory leaks, missing cleanup, unhandled errors, or architectural violations. **MUST REJECT / BLOCK MERGE**.
- 🟡 **`[HIGH]` (or `[important]`)**: Performance degradation risks, missing type guards, code smell anti-patterns (derived state in effects, parameter sprawl). Requires resolution or explicit justification.
- 🟢 **`[NIT]` (or `[suggestion]`)**: Minor naming improvements, optional refactor recommendations, non-blocking.

> [!CAUTION]
> **Anti-Rubber-Stamping Mandate**:
> Recording "0 detected" across all severity tiers without proof is strictly forbidden when reviewing code containing hooks, async logic, or state transitions.
> The reviewer **MUST provide explicit Proof of Safety** detailing why the code is immune to the 5 Fatal Vectors above.

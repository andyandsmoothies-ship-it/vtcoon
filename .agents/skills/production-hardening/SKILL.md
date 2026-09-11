---
name: production-hardening
description: Practical 5-gate framework to take any software application (Web, API, Microservice, Game, Mobile, CLI) from MVP to Production-Ready 1.0. Enforces Blast Radius Expansion, Chaos/Stress Simulation, Edge Hardening, Asset & Payload Budgets, IMP Cycle, Docker Packaging, Healthz endpoints, and Rollback resilience. Use whenever the user asks to "harden", "prepare for production", "audit production readiness", "deploy v1.0", "fuzz test", or "stress test".
---

# Production Hardening & Go-Live Protocol (v1.0 Ready)

## 1. The Blast Radius Dial (Maturity Ladder)

Software matures through 3 distinct risk levels. Do not mix their standards:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        THE 3-TIER MATURITY LADDER                                      │
├─────────────────────────┬────────────────────────────┬─────────────────────────────────┤
│ LEVEL 1: SPIKE / PROTOTYPE│ LEVEL 2: MVP FOUNDATION   │ LEVEL 3: PRODUCTION READY 1.0   │
├─────────────────────────┼────────────────────────────┼─────────────────────────────────┤
│ • Blast Radius: Isolated│ • Blast Radius: Slice-bound│ • Blast Radius: Global (Public) │
│ • Role: Non-Tech PO     │ • Approach: Feature Slices │ • Approach: 5 Production Gates  │
│ • Focus: UX & Behavior  │ • TDD: Golden Path E2E     │ • Focus: Resilience, Security,  │
│ • No enterprise grilling│ • Code: Anti-Slop, No-Op = 0│   Concurrency, Scale, Telemetry │
└─────────────────────────┴────────────────────────────┴─────────────────────────────────┘
```

> [!WARNING]
> **The Prototype Trap (Ricci Research)**: Calling code a "prototype" only lowers the agent's risk estimate during interrogation. It does NOT make buggy code safe. Before public deployment, code MUST pass the 5 Production Gates below to expand its protective blast radius.

---

## 2. The 5 Production Gates

### Gate 1: Chaos & Invariant Stress Testing (Headless Simulation)
- **Problem**: Unit tests test isolated turns or single API calls. Production systems break under long-running state accumulation, concurrent interactions, and memory leaks.
- **Protocol**:
  1. Build a headless runner with zero UI delays (0ms tick).
  2. Simulate 1.000+ continuous user sessions or game rounds with random agent actions.
  3. Assert **Global Invariants** at every turn:
     - *Liveness*: Deadlock rate = 0.00% (No state machine or worker hangs).
     - *Conservation Law*: Sum of all balances + treasury + escrow = Initial Total (Zero money leaks / zero dropped transactions).
     - *Finite State*: No `NaN`, `null`, or `Infinity` in accumulated counters.
     - *Memory Baseline*: Heap growth flatlines after warm-up (Zero uncollected event listeners).

### Gate 2: Edge Hardening & Anti-Abuse (Concurrency & Network Resilience)
- **Intent Mutex / Single-Threaded Sequence**:
  - Wrap concurrent mutations per room/tenant in a Mutex (`intentMutex.runExclusive()`).
  - Eliminate race conditions in bidding, seat claiming, inventory decrement, and balance transfers.
- **Rate Limiting & Anti-Spam**:
  - Enforce request throttling (e.g., max 10 actions/sec per client).
  - Out-of-turn actions or spam clicks rejected with structured Reason Code (`OUT_OF_TURN`, `RATE_LIMITED`).
- **Disconnection & Reconnection Grace Window**:
  - Token-based session recovery (e.g., LocalStorage JWT/UUID).
  - 60-second grace period before forfeiting or handing over to Bot AI.
- **Network Boundary Defense**:
  - Strict CORS origin validation and WebSocket origin checks.
  - Zero hardcoded secrets: All keys in `.env.production` with strict startup validation (`validateEnv()`).

### Gate 3: Production Performance & Asset Budgets
- **Bundle & Chunk Budget**:
  - Main JS bundle < 350KB gzip. Dynamic imports (`React.lazy`) for modals, 3D canvases, and heavy charts.
  - Tree-shaking audit: Zero unused icon libraries or full lodash imports.
- **Network Payload Budget**:
  - Delta synchronization payload < 10KB per tick. Compress state deltas; never send full world state every frame.
- **Frame Rate & Latency Targets**:
  - 60 FPS sustained on client (R3F/Canvas/Flutter). Zero JSON parsing or heavy math on the main thread.
  - Server Intent response time <= 50ms (p95).

### Gate 4: Ad-hoc Continuous Improvement Lifecycle (IMP Cycle)
- **Rule**: When refining game feel, UX juice, AI intelligence, or fixing systemic bugs post-MVP, NEVER make ad-hoc unrecorded edits.
- **Traceability Chain**:
  1. Technical Plan: `docs/plans/improvements/IMP-[ID]-[slug]_plan.md`.
  2. Experimental Report: `docs/reports/improvements/IMP-[ID]-[slug]_report.md`.
  3. Architectural Decision Record: `docs/domain/adr/ADR-[NNNN]-[slug].md` (if system design shifts).
  4. Registry: Register in Section 4 of `docs/master_roadmap.md`.

### Gate 5: Production Packaging, Healthz & Rollback
- **Multi-Stage Dockerfile**:
  - Stage 1: Build & test.
  - Stage 2: Minimal non-root runtime image (Alpine/Distroless).
- **Observability & Health Probes**:
  - `/healthz`: Shallow liveness probe (HTTP 200).
  - `/livez`: Deep readiness probe (DB connected, WSS socket pool responsive).
  - Structured Logging: `{ event, correlationId, timestamp, delta, reasonCode }`. Zero empty catches.
- **Graceful Shutdown**:
  - On `SIGTERM`/`SIGINT`: Stop accepting new connections, drain active sessions within 30 seconds, close sockets cleanly, then exit.
- **Rollback Playbook**:
  - Fast-rollback command documented: previous container image tag or commit hash known before release.

---

## 3. Production Readiness Checklist

Before signing off v1.0, verify all 5 gates:

| Gate | Verification Check | Expected Evidence |
| :---: | :--- | :--- |
| **1** | Chaos Monkey 1.000 runs | `0.00% Deadlock`, `Invariants preserved (Δ = 0)` |
| **2** | Concurrency Mutex & Rate Limit | Out-of-turn/spam tests reject with Reason Codes |
| **3** | Bundle & Payload audit | Main chunk < 500KB, Delta < 10KB, 60 FPS verified |
| **4** | Ad-hoc improvements logged | Plans in `docs/plans/`, Reports in `docs/reports/` |
| **5** | Docker & Health probe | `docker build` succeeds, `/healthz` returns 200, Graceful exit works |

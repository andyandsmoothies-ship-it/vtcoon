# Plan IMP-330: GameEventNarrativeSynthesizer Core & Financial Narrative Decoupling (Candidate 1 - Slice 1)

## 0. Auto-Slicing Protocol Roadmap (Candidate 1: Event Narrative Architecture)
- **Slice 1 (`IMP-330`)**: Pure `GameEventNarrativeSynthesizer` interface, typed event taxonomy, subtractive net-delta balance reconstruction, and rent/salary synthesis.
- **Slice 2 (`IMP-331`)**: Property, auction, and trading narrative synthesis consolidation.
- **Slice 3 (`IMP-332`)**: Presentation subscriber decoupling (Audio/3D/UI event bus) & `apply_delta` transport purification.

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-330`
- **Subsystem**: `client-events` (Tier 1 Client Pure Domain & Event Calculation)
- **Problem Statement**:
  1. **Seam Leakage in Network Layer**: `src/client/network/` contains 8 `activity_*` files (~1,527 LOC) handling high-level narrative parsing, audio scheduling, 3D pawn delays, and floating badges.
  2. **Net-Delta Collision Trap (Gotcha 8)**: Simultaneous GO salary and rent landing results in net balance delta diffs that swallow salary if not subtractively reconstructed.
  3. **Dual-SSOT Hierarchy (Gotcha 10)**: Priority must be explicit: `delta` is authoritative for transactional mutations; `prevState` for pre-move context; `nextState` only for supplementary metadata.
  4. **Adversarial Hardening Directives**:
     - Nonexistent `delta.timestamp`: Resolved to `options?.baseTimestamp ?? delta.tick ?? 0`.
     - Incarceration teleport guard: Suppress phantom GO salary when `isSentToAudit` is true.
     - Polarity inversion: Migrate player between receivers and payers during subtractive reconstruction.
     - Zero net shift: Seed players with `diff = 0` when `checkPassedGo` is true.
     - Anti-TIDD seam discipline: Wire `synthesizeGameEvents` into `src/client/network/activity_rent_matcher.ts`.
- **Architectural Solution**:
  1. **Pure Deep Module**: Create `src/client/events/game_event_synthesizer.ts` with signature:
     `synthesizeGameEvents(prevState: GameState, nextState: GameState, delta: DeltaPayload, options?: SynthesizerOptions): readonly SynthesizedGameEvent[]`.
  2. **Strong Typed Taxonomy**: Define `SynthesizedGameEvent` discriminated unions in `src/client/events/game_event_types.ts`.
  3. **Zero Side-Effect Guarantee**: Module is 100% in-process and deterministic with zero imports from `AudioEngine`, `SoundEngine`, `ui_helpers`, or Zustand stores.
- **Direct Scope**:
  - `src/client/events/game_event_types.ts` (Physical lines: 85)
  - `src/client/events/game_event_synthesizer.ts` (Physical lines: 14)
  - `src/client/network/activity_rent_matcher.ts` (Physical lines: 267)
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts` (New)
- **Baseline Working Tree Dependencies**:
  - `src/client/network/activity_go_extractor.ts`
  - `src/domain/property_rent.ts`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/game_event_types.ts` | Tier 1 (Domain/Types) | 85 | 85 | 0 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_synthesizer.ts` | Tier 1 (Domain/Logic) | 14 | 14 | 0 | <= 400 | ✔️ Safe |
| `src/client/network/activity_rent_matcher.ts` | Tier 1 (Domain/Logic) | 267 | 267 | 0 | <= 400 | ✔️ Safe |
| `tests/client/imp330_game_event_narrative_synthesizer.test.ts` | Living Test | 0 | 360 | +360 | <= 600 | ✔️ Safe |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp330_game_event_narrative_synthesizer.test.ts` (Tệp mới)

Test Specifications:
- TC-330.01 [UC-SYNTH/MSS]: Given previous and next game state with rent payment, When synthesizeGameEvents is called, Then returns typed RENT_PAID event with payerId, receiverId, cellIndex, and amount.
- TC-330.02 [UC-SYNTH/A1]: Given player passing GO with property tax and mortgage interest deductions, When synthesizeGameEvents is called, Then returns GO_SALARY event with gross salary, structured deductions, and net amount.
- TC-330.03 [UC-SYNTH/A2]: Given diplomatic card exemption in delta.lastDiplomaticEvent, When synthesizeGameEvents is called, Then returns DIPLOMATIC_WAIVER event with landlordId and waivedAmount.
- TC-330.04 [UC-SYNTH/A3]: Given multi-tenant port fee sharing (CC_PORT_EXCLUSIVE), When synthesizeGameEvents is called, Then returns PORT_SPLIT_RENT event with both receivers and equal split amounts.
- TC-330.05 [UC-SYNTH/A4]: Given empty delta without balance or position shifts, When synthesizeGameEvents is called, Then returns empty array without unnecessary allocations.
- TC-330.06 [UC-SYNTH/A5]: Given insolvent debtor paying partial rent before bankruptcy, When synthesizeGameEvents is called, Then returns structured PARTIAL_RENT event with remainingDebt calculated via resolveRent.
- TC-330.07 [UC-SYNTH/A6]: Given player simultaneously passing GO (+2000 salary) and landing on opponent property (-2500 rent) producing net delta diff -500, When synthesizeGameEvents is called, Then reconstructs subtractive balance emitting both GO_SALARY (+2000) and RENT_PAID (-2500) events in causal order.
- TC-330.08 [UC-SYNTH/A7]: Given government and telecom fees (Land Tax Cell 4, Bail Cell 10, Telecom Data Cell 28), When synthesizeGameEvents is called, Then returns FEE_PAID with receiverId and cellIndex attribution.
- TC-330.09 [UC-SYNTH/A8]: Given player passing GO (+2000) and landing on rent (-1500) producing net positive diff +500 in receivers, When synthesizeGameEvents is called, Then polarity inverts player from receivers to payers and emits both GO_SALARY and RENT_PAID.
- TC-330.10 [UC-SYNTH/A9]: Given player passing GO (+2000) and landing on rent (-2000) producing zero net diff, When synthesizeGameEvents is called, Then seeds player and emits both GO_SALARY and RENT_PAID without dropping.
- TC-330.11 [UC-SYNTH/A10]: Given player teleported to audit (cell 30 to cell 10) satisfying checkPassedGo with isSentToAudit true, When synthesizeGameEvents is called, Then suppresses phantom GO salary event.

### Station 2: Implementation (GREEN)
#### Task 1: Complete Event Types in `game_event_types.ts`
**Target physical file**: `src/client/events/game_event_types.ts`
- Maintain `SynthesizedGameEventType` and discriminated unions with structured deductions and receiver attribution.

#### Task 2: Implement Pure Synthesizer in `game_event_synthesizer.ts`
**Target physical file**: `src/client/events/game_event_synthesizer.ts`
- Implement `synthesizeGameEvents(prevState, nextState, delta, options)`:
  1. Guard `isSentToAudit` to suppress phantom GO salary on incarceration.
  2. Upfront GO extraction and subtractive balance reconstruction with bidirectional polarity migration and zero-net-shift seeding.
  3. Extract government fees and Telecom Data Viettel (Cell 28 receiver attribution).
  4. Multi-tier rent matching (1-1 match, port split rent, insolvent partial rent with `resolveRent` nominal rent lookup, diplomatic waiver via `lastDiplomaticEvent`).
  5. Causal ordering: `[GO_SALARY, FEE_PAID, RENT_PAID/PARTIAL_RENT/PORT_SPLIT_RENT]`.
  6. Timestamp fallback: `options?.baseTimestamp ?? delta.tick ?? 0`.

#### Task 3: Wire Transitional Consumer in `activity_rent_matcher.ts`
**Target physical file**: `src/client/network/activity_rent_matcher.ts`
- Re-export `synthesizeGameEvents` to guarantee non-orphan production status under Anti-TIDD.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/events/game_event_types.ts src/client/events/game_event_synthesizer.ts src/client/network/activity_rent_matcher.ts tests/client/imp330_game_event_narrative_synthesizer.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_330_GAME_EVENT_NARRATIVE_SYNTHESIZER.md`.

### Station 4: Evidence & Verification
- Execute test suite: `npx vitest run tests/client/imp330_game_event_narrative_synthesizer.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-330 --test tests/client/imp330_game_event_narrative_synthesizer.test.ts --src src/client/events/game_event_synthesizer.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-330`.
- Synthesize delivery report: `npm run report -- IMP-330`.

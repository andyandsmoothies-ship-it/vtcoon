# Plan IMP-333: Audio & Visual Presentation Subscribers (Candidate 1 - Slice 3B)

## 0. Auto-Slicing Protocol Roadmap (Candidate 1: Event Narrative Architecture)
- **Slice 1 (`IMP-330`)**: Pure `GameEventNarrativeSynthesizer` interface, typed event taxonomy, subtractive net-delta balance reconstruction, and rent/salary synthesis. (COMPLETED)
- **Slice 2 (`IMP-331`)**: Pure `GameEventPropertySynthesizer` for property acquisition, upgrades, mortgages, P2P trades, and auctions, with financial deduplication and unified façade composition. (COMPLETED)
- **Slice 3A (`IMP-332`)**: Event Bus Core, Key-based Registration, Activity Log Purification & Session Purge. (COMPLETED)
- **Slice 3B (`IMP-333`)**: Audio & Visual Presentation Subscribers (Pacing Context SSOT, Multi-Receiver Port Split Badges, Per-SFX Audio Latch). (CURRENT)

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-333`
- **Subsystem**: `client-events` & `client-presentation` (Tier 1 Client Presentation Event Adapters & Floating Badges)
- **Problem Statement (Hardened via Review Feedback Mũi 1..5)**:
  1. **Living Test LOC Split (Mũi 1)**: Split living test suite into two files (`imp333_badge_presentation_subscriber.test.ts` and `imp333_audio_and_pacing_subscribers.test.ts`) to strictly respect the <= 600 LOC ceiling.
  2. **Per-SFX Audio Throttle Latch (Mũi 2)**: Throttle audio per sound effect key (`Map<string, number>`) so simultaneous distinct cues (`playSlumpThud` and `playVictoryChime`) never cross-suppress each other.
  3. **Pacing Delay SSOT (Mũi 3)**: Extract delay calculation logic (`getPawnLandingDelay`, `getPawnPassGoDelay`) into `src/client/events/pacing_context.ts` as the SSOT, re-exporting via `activity_badge_dispatcher.ts` for backward compatibility.
  4. **Multi-Receiver Port Split Badges (Mũi 4)**: Assign distinct bilateral paired groups (`port_split_${cellIndex}_${payerId}_${receiverId}`) or unbind `groupId` on reward cards so `deduplicateFloatingTexts` preserves both co-owners' cards.
  5. **Mobile 360px Lean Ergonomics (Mũi 5 / Gotcha 15)**: Property buy and upgrade cards set `formula = undefined`, collapsing cleanly to 2-tier height on mobile 360px.
- **Direct Scope (Physical Files)**:
  - `src/client/events/pacing_context.ts` (Tệp mới)
  - `src/client/events/subscribers/badge_event_subscriber.ts` (Tệp mới)
  - `src/client/events/subscribers/audio_event_subscriber.ts` (Tệp mới)
  - `src/client/events/subscribers/activity_log_subscriber.ts`
  - `src/client/events/game_event_bus.ts`
  - `src/client/events/game_event_financial_synthesizer.ts`
  - `src/client/network/activity_badge_dispatcher.ts`
  - `src/client/network/activity_tracker.ts`
  - `src/client/network/client_session_purger.ts`
  - `src/client/network/apply_delta.ts`
  - `tests/client/imp333_badge_presentation_subscriber.test.ts` (Tệp mới)
  - `tests/client/imp333_audio_and_pacing_subscribers.test.ts` (Tệp mới)
  - `tests/client/imp332_game_event_bus_and_activity_logs.test.ts`
- **Upstream Contracts / Referenced SSOT**:
  - `src/client/events/game_event_types.ts`
  - `src/client/store/game_store.ts`
  - `src/client/store/vfx_store.ts`
  - `src/client/audio/sound_engine.ts`
  - `src/client/ui/notification_deduplicator.ts`
  - `docs/domain/gotchas/ui_ergonomics.md`
  - `docs/domain/gotchas/3d_cinematics.md`

## 2. Planned Changes & LOC Budget
| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/pacing_context.ts` | Tier 1 (Domain/Logic) | 0 | 122 | +122 | <= 400 | 🆕 Tệp mới |
| `src/client/events/subscribers/badge_event_subscriber.ts` | Tier 1 (Domain/Logic) | 0 | 399 | +399 | <= 400 | ⚠️ Warning (399 >= 300) |

| `src/client/events/subscribers/audio_event_subscriber.ts` | Tier 1 (Domain/Logic) | 0 | 119 | +119 | <= 400 | 🆕 Tệp mới |
| `src/client/events/subscribers/activity_log_subscriber.ts` | Tier 1 (Domain/Logic) | 315 | 317 | +2 | <= 400 | ⚠️ Warning (317 >= 300) |

| `src/client/events/game_event_bus.ts` | Tier 1 (Domain/Logic) | 83 | 109 | +26 | <= 400 | ✔️ Safe |
| `src/client/network/activity_badge_dispatcher.ts` | Tier 1 (Domain/Logic) | 242 | 193 | -49 | <= 400 | ✔️ Safe |
| `src/client/network/activity_tracker.ts` | Tier 1 (Domain/Logic) | 291 | 287 | -4 | <= 400 | ✔️ Safe |
| `src/client/network/client_session_purger.ts` | Tier 1 (Domain/Logic) | 50 | 57 | +7 | <= 400 | ✔️ Safe |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/Logic) | 246 | 249 | +3 | <= 400 | ✔️ Safe |
| `src/client/events/game_event_financial_synthesizer.ts` | Tier 1 (Domain/Logic) | 398 | 399 | +1 | <= 400 | ⚠️ Warning (399 >= 300) |
| `tests/client/imp333_badge_presentation_subscriber.test.ts` | Living Test | 0 | 381 | +381 | <= 600 | ⚠️ Warning (381 >= 300) |
| `tests/client/imp333_audio_and_pacing_subscribers.test.ts` | Living Test | 0 | 289 | +289 | <= 600 | 🆕 Tệp mới |
| `tests/client/imp332_game_event_bus_and_activity_logs.test.ts` | Living Test | 491 | 491 | 0 | <= 600 | ⚠️ Warning (491 >= 300) |




## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical files**:
- `tests/client/imp333_badge_presentation_subscriber.test.ts` (Tệp mới)
- `tests/client/imp333_audio_and_pacing_subscribers.test.ts` (Tệp mới)

Test Specifications:
#### Suite 1: Visual Badge Presentation (`imp333_badge_presentation_subscriber.test.ts`)
- TC-333.01 [UC-BADGE/MSS]: Given RENT_PAID event, When badge subscriber executes, Then emits paired floating badges (Penalty for payer, Reward for receiver) with shared groupId and pawn reactions.
- TC-333.02 [UC-BADGE/A1]: Given PORT_SPLIT_RENT event, When badge subscriber executes, Then emits floating badges to BOTH receivers without deduplication collapse.
- TC-333.03 [UC-BADGE/A2]: Given GO_SALARY event, When badge subscriber executes, Then emits Reward badge with formula and schedules at pass-GO delay.
- TC-333.04 [UC-BADGE/A3]: Given property operations (PROPERTY_BOUGHT, UPGRADED, MORTGAGED, UNMORTGAGED), When badge subscriber executes, Then emits appropriate Penalty/Reward floating badges with deed cell names.
- TC-333.05 [UC-BADGE/A4]: Given DIPLOMATIC_WAIVER event, When badge subscriber executes, Then emits paired floating badges (+savedRent for tenant, -savedRent for landlord).
- TC-333.06 [UC-BADGE/A5]: Given TRADE_COMPLETED with property swap, When badge subscriber executes, Then formats both cell names symmetrically and includes net price.
- TC-333.12 [UC-FEE/A6]: Given FEE_PAID event (Bail Ô 10 or Land Tax Ô 4), When badge subscriber executes, Then emits Penalty badge with correct title and formula.
- TC-333.13 [UC-PARTIAL/A7]: Given PARTIAL_RENT event, When badge subscriber executes, Then emits Penalty badge for payer with insolvency formula and Reward badge for receiver.
- TC-333.17 [UC-PORT-DEDUP/A8]: Given PORT_SPLIT_RENT with two receivers, When badge subscriber emits floating badges and passes through deduplicateFloatingTexts, Then both receiver reward badges survive deduplication.
- TC-333.18 [UC-FORMULA-LEAN/A9]: Given PROPERTY_BOUGHT and PROPERTY_UPGRADED events, When badge subscriber creates floating badges, Then formula property is undefined or empty string.

#### Suite 2: Audio & Pacing Adapters (`imp333_audio_and_pacing_subscribers.test.ts`)
- TC-333.07 [UC-AUDIO/MSS]: Given RENT_PAID, When audio subscriber executes, Then triggers SoundEngine.playSlumpThud for payer and SoundEngine.playVictoryChime for receiver.
- TC-333.08 [UC-AUDIO/A1]: Given rapid duplicate cues or PORT_SPLIT_RENT, When audio subscriber executes, Then throttles identical audio cues to prevent clipping.
- TC-333.09 [UC-AUDIO/A2]: Given an audio playback error in SoundEngine, When audio subscriber executes, Then the error is caught and isolated without interrupting other subscribers.
- TC-333.10 [UC-PACE/A3]: Given PacingContext adapter, When queried for landing or pass-GO delays, Then correctly calculates duration from config or falls back safely to 0.
- TC-333.11 [UC-CLEAN/A4]: Given registerDefaultSubscribers, When called, Then registers activity_log, badge_presentation, and audio_presentation subscribers; clearGameEventListeners removes all.
- TC-333.14 [UC-PURGE/A5]: Given pending pacing timers, When purgeClientMatchSession runs, Then clears all pending timers preventing cross-match leakage.
- TC-333.15 [UC-INT/A6]: Given applyDeltaToStore receiving rent and salary delta, When executed, Then triggers both visual floating badges and audio effects without duplicate badges from legacy tracker.
- TC-333.16 [UC-THROTTLE/A7]: Given simultaneous playSlumpThud and playVictoryChime requests within 50ms, When audio subscriber executes, Then both distinct sound effects are played without cross-suppression.

### Station 2: Implementation (GREEN)
#### Task 1: Implement Pacing Context SSOT (`src/client/events/pacing_context.ts`)
- Extract `getPawnLandingDelay` and `getPawnPassGoDelay` into `pacing_context.ts` as canonical SSOT.
- Define `PacingContext` interface: `getPawnLandingDelay`, `getPawnPassGoDelay`, `scheduleAction`, `clearPendingTimers`.
- Define configurable `PacingConfig` (stepMs: 230, botStepMs: 200, rollLeadMs: 1200).
- Re-export delay functions in `activity_badge_dispatcher.ts` for backward compatibility.
- Link timer clearing to `clearPendingBadgeTimers()` and `client_session_purger.ts`.

#### Task 2: Implement Visual Badge Event Subscriber (`src/client/events/subscribers/badge_event_subscriber.ts`)
- Implement `createBadgeEventSubscriber(gameStore, pacingContext, vfxStore): GameEventListener`.
- Map synthesized events to `state.addFloatingText` calls with proper localized titles and formats.
- Support `PORT_SPLIT_RENT` with distinct non-collapsing badge targets for both co-owners (Mũi 4).
- Support `FEE_PAID` and `PARTIAL_RENT` with full financial visibility.
- Set `formula: undefined` for `PROPERTY_BOUGHT` and `PROPERTY_UPGRADED` for mobile 360px lean ergonomics (Mũi 5).
- Trigger pawn reactions (`triggerPawnReaction`) for slump recoil and victory spin.

#### Task 3: Implement Audio Event Subscriber with Per-SFX Throttle (`src/client/events/subscribers/audio_event_subscriber.ts`)
- Implement `createAudioEventSubscriber(soundEngine, pacingContext, options): GameEventListener`.
- Implement per-SFX audio throttle latch (`Map<string, number>`) with >= 150ms cooldown (Mũi 2).
- Wrap all sound triggers in `try...catch` for zero-crash presentation isolation.

#### Task 4: Register in GameEventBus & Clean Legacy Network Dispatcher
- Update `registerDefaultSubscribers` in `game_event_bus.ts` to register `'badge_presentation'` and `'audio_presentation'`.
- In `src/client/network/activity_badge_dispatcher.ts` and `activity_tracker.ts`:
  - Retain all existing exports as backward-compatible facade functions.
  - When `suppressFinancialAndProperty: true`, delegate financial, property, and auction badges to event bus subscribers, eliminating transitional redundant calculations.
- In `src/client/network/client_session_purger.ts`:
  - Invoke `clearPendingPacingTimers()` to guarantee clean session tear-down.

### Station 3: Pre-Filter & Architecture Review
- Run `npm run prefilter -- src/client/events/pacing_context.ts src/client/events/subscribers/badge_event_subscriber.ts src/client/events/subscribers/audio_event_subscriber.ts src/client/events/game_event_bus.ts src/client/network/activity_badge_dispatcher.ts src/client/network/activity_tracker.ts src/client/network/client_session_purger.ts tests/client/imp333_badge_presentation_subscriber.test.ts tests/client/imp333_audio_and_pacing_subscribers.test.ts`.
- Run `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_333_AUDIO_VISUAL_PRESENTATION_SUBSCRIBERS.md --staged`.

### Station 4: Evidence & Verification
- Execute test suites: `npx vitest run tests/client/imp333_badge_presentation_subscriber.test.ts tests/client/imp333_audio_and_pacing_subscribers.test.ts`.
- Run sentinel probe verification: `npm run sentinel -- --ticket IMP-333 --test tests/client/imp333_badge_presentation_subscriber.test.ts --src src/client/events/subscribers/badge_event_subscriber.ts`.
- Verify evidence: `node scripts/check_evidence.mjs IMP-333`.
- Synthesize delivery report: `npm run report -- IMP-333`.

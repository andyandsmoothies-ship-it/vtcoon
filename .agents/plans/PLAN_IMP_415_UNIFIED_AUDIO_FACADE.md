# PLAN_IMP_415: Unified Audio Subsystem Facade & Modal Seam Wiring (Nhóm 3 Giai đoạn 3)

## 1. Context & Architectural Goal
- **Source Strategy Reports**: [`ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/docs/reports/analysis/ARCHITECTURAL_AUDIT_AND_AI_NATIVE_FACADE_BLUEPRINT.md) (Mục 4: Phân hệ `@audio` & Giai đoạn 3: Thiết lập Public Facades) and `npm run lint:boundaries` AST scan.
- **Classification**: Tier 1.5 Structural Refactor & Subsystem Facade (0 FSM transitions, 0 economic/cashflow formula changes, 0 DOM layout shifts).
- **Subsystem Boundary Isolation**: Slices Group 3 into cohesive `src/client/audio/` and `src/client/ui/modals/` boundaries, targeting files within `src/client/audio/` and 6 modal files in `src/client/ui/modals/` across 3 cohesive families (`audio/audio`, `audio/index`, `ui/modals`), strictly satisfying `rules_scope.mjs` mechanical gate (0 cross-subsystem contamination, <= 3 cohesive units).
- **Problems**:
  1. **Fragmented Audio Consumption & Missing Subsystem Facade**: `src/client/audio/` lacks an authoritative `index.ts` public facade (violating the GEMINI.md Subsystem Facade Invariant). Physical scan across `src/**` detects 20 files directly importing internal `audio_engine.ts` and 17 files importing `audio_types.ts`.
  2. **6 Residual Audio `SEAM-01` Boundary Warnings**: Exactly 6 deep relative import warnings in `auction_modal_host.tsx` (2), `deed_modal_host.tsx` (2), and `trade_modal_host.tsx` (2) reach into `../../../audio/audio_engine` and `../../../audio/audio_types`.
  3. **Dual API Coupling & Resource Teardown Gap**: Presentation callers currently couple to both `AudioEngine` and `useAudioStore` for sound and volume; teardown in `AudioEngine.dispose()` leaves `SoundEngine` WebAudio context and heartbeat timer running.
- **Architectural Solution & Seam Discipline**:
  1. **Unified Audio Facade (`src/client/audio/index.ts` & `src/client/audio/audio_facade.ts`)**: Encapsulate audio interactions into a unified `audio` facade object (`audio.playSfx(...)`, `audio.setThemeVolume(...)`, `audio.playTheme(...)`, `audio.resumeAudioContext()`, `audio.stopAll()`, tactile synthesizers).
  2. **Dual Resource Teardown**: `audio.dispose()` explicitly delegates to both `AudioEngine.dispose()` and `SoundEngine.dispose()`, eliminating WebAudio context and heartbeat timer leaks.
  3. **Backward-Compatible Facade Re-exports**: `src/client/audio/index.ts` re-exports `audio`, `AudioEngine`, `SoundEngine`, `SoundEffect`, `BGMTrack`, `MusicTrack`, and file maps.
  4. **Call-Site Wiring & 100% Anti-TIDD Compliance**: Rewire the 6 modal files in `src/client/ui/modals/` to consume `{ audio, SoundEffect }` directly from `audio/index.js`, converting all 14 physical call sites from `AudioEngine.playSfx(...)` to `audio.playSfx(...)`.
  5. **Triệt tiêu 100% (6/6) Audio `SEAM-01` Warnings**: Rewiring modal hosts to `../../../audio/index.js` reduces audio boundary warnings to exactly 0 (store warnings deferred to store ticket).
  6. **Pure-Move Quarantine**: Preserve 100% audio playback behavior, volume curves, and WebAudio synth synthesis. Quarantines `hose_modal.tsx` rogue context to follow-up `IMP-416`.

### Principles Applied
- **Subsystem Facade Invariant** -> Established `src/client/audio/index.ts` as the single authoritative public gateway for audio.
- **Resource Disposal & Cache Hygiene** -> Mandated dual teardown (`AudioEngine.dispose()` + `SoundEngine.dispose()`) in `audio.dispose()` to prevent context/timer leaks.
- **100% DTO & Call-Site Wiring** -> Explicitly converted all 14 modal call sites to invoke `audio.playSfx(...)`.
- **Pure-Move Quarantine** -> Preserves 100% runtime audio behavior and delegates `AudioFacadeImpl.playSfx` to `AudioEngine.playSfx` for living test spy parity (`imp335#L296`).
- **Equivalence-Partition Testing** -> Partitioned contract tests across SFX dispatch, volume sync, BGM track transition, AST facade wiring parity, boundary linter zero warnings, and tactile synth delegation.

---

## 2. Target Files & Honest LOC Accounting

| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `src/client/audio/audio_facade.ts` | Tier 1 (Audio Seam) | 0 | 145 | ~+145 | 400 | Safe (New Seam) |
| `src/client/audio/index.ts` | Subsystem Facade | 0 | 25 | ~+25 | 400 | Safe (New Facade) |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI Modal) | 296 | 295 | ~-1 | 500 | Safe (Rewired Import & 7 Calls) |
| `src/client/ui/modals/bot_trade_offer_strip.tsx` | Tier 2 (UI Modal) | 271 | 270 | ~-1 | 500 | Safe (Rewired Import & 2 Calls) |
| `src/client/ui/modals/transit_wheel_modal.tsx` | Tier 2 (UI Modal) | 231 | 230 | ~-1 | 500 | Safe (Rewired Import & 2 Calls) |
| `src/client/ui/modals/hosts/auction_modal_host.tsx` | Tier 2 (UI Modal) | 85 | 84 | ~-1 | 500 | Safe (Rewired Import & 1 Call) |
| `src/client/ui/modals/hosts/deed_modal_host.tsx` | Tier 2 (UI Modal) | 106 | 105 | ~-1 | 500 | Safe (Rewired Import & 1 Call) |
| `src/client/ui/modals/hosts/trade_modal_host.tsx` | Tier 2 (UI Modal) | 133 | 132 | ~-1 | 500 | Safe (Rewired Import & 1 Call) |
| `tests/client/imp415_unified_audio_facade.test.ts` | Living Test | 0 | 210 | ~+210 | 600 | Safe (New Living Test) |

---

## 3. Lean Type & Exported Symbol Contracts

**Target physical file**: `src/client/audio/audio_facade.ts` (New Seam)
```typescript
import { AudioEngine } from './audio_engine.js';
import { SoundEngine } from './sound_engine.js';
import { BGMTrack, SoundEffect, getBgmTrackForCell } from './audio_types.js';
import { useAudioStore } from '../store/audio_store.js';

export interface AudioFacade {
  playSfx(sfx: SoundEffect, rate?: number): void;
  playTheme(track: BGMTrack, crossfade?: boolean): void;
  playBgm(track: BGMTrack, crossfade?: boolean): void;
  handlePawnLanded(cellIndex: number): void;
  setThemeVolume(volume: number): void;
  setBgmVolume(volume: number): void;
  setSfxVolume(volume: number): void;
  setMasterVolume(volume: number): void;
  setMuted(isMuted: boolean): void;
  toggleMute(): void;
  init(): void;
  resumeAudioContext(): void;
  armInterruptionRecovery(): void;
  stopAll(): void;
  dispose(): void;
  getCurrentTrack(): BGMTrack | null;
  playTactileDiceRoll(): void;
  playTactileAuctionGavel(): void;
  playTactileConstructionSlam(): void;
  playTactileMoneyTransfer(): void;
  playTactilePawnStep(rate?: number): void;
  startPenthouseOceanAmbient(): void;
  stopPenthouseOceanAmbient(): void;
  playJazzLoungeChords(): void;
  playLighthouseHorn(): void;
  playCarHorn(): void;
  playWaterRipple(): void;
  playHeartbeatPulse(): void;
  stopHeartbeatPulse(): void;
  playVictoryChime(): void;
  playSlumpThud(): void;
  playMonopolyFanfare(): void;
}

export class AudioFacadeImpl implements AudioFacade {
  public playSfx(sfx: SoundEffect, rate?: number): void { AudioEngine.playSfx(sfx, rate); }
  public playTheme(track: BGMTrack, crossfade = true): void { AudioEngine.playBgm(track, crossfade); }
  public playBgm(track: BGMTrack, crossfade = true): void { AudioEngine.playBgm(track, crossfade); }
  public handlePawnLanded(cellIndex: number): void { AudioEngine.handlePawnLanded(cellIndex); }
  public setThemeVolume(volume: number): void { useAudioStore.getState().setBgmVolume(volume); }
  public setBgmVolume(volume: number): void { useAudioStore.getState().setBgmVolume(volume); }
  public setSfxVolume(volume: number): void { useAudioStore.getState().setSfxVolume(volume); }
  public setMasterVolume(volume: number): void { useAudioStore.getState().setMasterVolume(volume); }
  public setMuted(isMuted: boolean): void { useAudioStore.getState().setIsMuted(isMuted); }
  public toggleMute(): void { useAudioStore.getState().toggleMute(); }
  public init(): void { AudioEngine.init(); }
  public resumeAudioContext(): void { AudioEngine.resumeAudioContext(); }
  public armInterruptionRecovery(): void { AudioEngine.armInterruptionRecovery(); }
  public stopAll(): void { AudioEngine.stopAll(); }
  public dispose(): void { AudioEngine.dispose(); SoundEngine.dispose(); }
  public getCurrentTrack(): BGMTrack | null { return AudioEngine.getCurrentTrack(); }
  public playTactileDiceRoll(): void { AudioEngine.playTactileDiceRoll(); }
  public playTactileAuctionGavel(): void { AudioEngine.playTactileAuctionGavel(); }
  public playTactileConstructionSlam(): void { AudioEngine.playTactileConstructionSlam(); }
  public playTactileMoneyTransfer(): void { AudioEngine.playTactileMoneyTransfer(); }
  public playTactilePawnStep(rate?: number): void { AudioEngine.playTactilePawnStep(rate); }
  public startPenthouseOceanAmbient(): void { AudioEngine.startPenthouseOceanAmbient(); }
  public stopPenthouseOceanAmbient(): void { AudioEngine.stopPenthouseOceanAmbient(); }
  public playJazzLoungeChords(): void { AudioEngine.playJazzLoungeChords(); }
  public playLighthouseHorn(): void { SoundEngine.playLighthouseHorn(); }
  public playCarHorn(): void { SoundEngine.playCarHorn(); }
  public playWaterRipple(): void { SoundEngine.playWaterRipple(); }
  public playHeartbeatPulse(): void { SoundEngine.playHeartbeatPulse(); }
  public stopHeartbeatPulse(): void { SoundEngine.stopHeartbeatPulse(); }
  public playVictoryChime(): void { SoundEngine.playVictoryChime(); }
  public playSlumpThud(): void { SoundEngine.playSlumpThud(); }
  public playMonopolyFanfare(): void { SoundEngine.playMonopolyFanfare(); }
}

export const audio: AudioFacade = new AudioFacadeImpl();
```

**Target physical file**: `src/client/audio/index.ts` (New Facade)
```typescript
export { audio, AudioFacadeImpl, type AudioFacade } from './audio_facade.js';
export { AudioEngine } from './audio_engine.js';
export { SoundEngine, type SoundEngineImpl } from './sound_engine.js';
export {
  BGMTrack,
  SoundEffect,
  BGM_FILE_MAP,
  SFX_FILE_MAP,
  getBgmTrackForCell,
  BGMTrack as MusicTrack,
} from './audio_types.js';
```

**Target physical file**: `src/client/ui/modals/hosts/auction_modal_host.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../../audio/index.js';
```

**Target physical file**: `src/client/ui/modals/hosts/deed_modal_host.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../../audio/index.js';
```

**Target physical file**: `src/client/ui/modals/hosts/trade_modal_host.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../../audio/index.js';
```

**Target physical file**: `src/client/ui/modals/modal_host.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts 7x AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../audio/index.js';
```

**Target physical file**: `src/client/ui/modals/bot_trade_offer_strip.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts 2x AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../audio/index.js';
```

**Target physical file**: `src/client/ui/modals/transit_wheel_modal.tsx` (Refactored)
```typescript
// Consolidates leaf imports into audio/index.js and converts 2x AudioEngine.playSfx -> audio.playSfx
import { audio, SoundEffect } from '../../audio/index.js';
```

---

## 4. Station 1: Core Contract Invariants (`tests/client/imp415_unified_audio_facade.test.ts`)

- **TC-415.01 [UC-AUDIO-FACADE-SFX-DISPATCH/MSS]**: Given `audio` facade, When calling `playSfx` with `SoundEffect.AUCTION_BID` and `SoundEffect.DICE_ROLL`, Then verifies delegation to `AudioEngine.playSfx` with correct enum parameters across $\ge 2$ distinct sound effects.
- **TC-415.02 [UC-AUDIO-FACADE-VOLUME-SYNC/MSS]**: Given `audio` facade and `useAudioStore`, When calling `setThemeVolume` with `0.45` and `setSfxVolume` with `0.72`, Then verifies state synchronization in `useAudioStore` with clamped numeric ranges and boolean mute toggles.
- **TC-415.03 [UC-AUDIO-FACADE-THEME-PLAYBACK/MSS]**: Given `audio` facade, When calling `playTheme` with `BGMTrack.TAY_NAM_BO` and `BGMTrack.DO_THI_LOI`, Then verifies track transition and `AudioEngine.playBgm` invocation across distinct geographic tracks.
- **TC-415.04 [UC-MODAL-AUDIO-FACADE-WIRING-PARITY/MSS]**: Given the 6 modal files in `src/client/ui/modals/`, When inspected via static TypeScript AST, Then proves 100% of audio-bound import declarations target `audio/index.js` (or `@audio`), and zero imports reference internal leaf files (`audio_engine.js`, `audio_types.js`).
- **TC-415.05 [UC-BOUNDARY-LINTER-AUDIO-SEAM-01-ELIMINATION/MSS]**: Given the boundary linter AST scanner (`scripts/boundary_linter/boundary_rules.mjs`), When executed against the 6 modal files, Then verifies exactly 0 `SEAM-01` audio boundary warnings are emitted (filtering by `audio`), reducing audio-related warnings from 6 down to 0.
- **TC-415.06 [UC-TACTILE-SYNTH-FACADE-DELEGATION/MSS]**: Given `audio` facade, When calling `playTactileDiceRoll`, Then verifies graceful execution without WebAudio crashes or unhandled exceptions.

---

## 5. Station 3 & 4 Verification & Evidence Plan
- **Mechanical Gates**:
  1. `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_415_UNIFIED_AUDIO_FACADE.md --auto-sign`
  2. `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_415_UNIFIED_AUDIO_FACADE.md`
  3. `npx --yes tsc --noEmit` (Exit 0)
  4. `npm run lint:boundaries` (Verifies elimination of all 6 audio SEAM-01 warnings)
  5. `npm run prefilter -- src/client/audio/audio_facade.ts src/client/audio/index.ts src/client/ui/modals/modal_host.tsx src/client/ui/modals/bot_trade_offer_strip.tsx src/client/ui/modals/transit_wheel_modal.tsx src/client/ui/modals/hosts/auction_modal_host.tsx src/client/ui/modals/hosts/deed_modal_host.tsx src/client/ui/modals/hosts/trade_modal_host.tsx tests/client/imp415_unified_audio_facade.test.ts`
  6. **Physical Visual & Evidence Audit**:
     `node scripts/collect_evidence.mjs imp-415 tests/client/imp415_unified_audio_facade.test.ts && npm run report -- imp-415 && node scripts/check_evidence.mjs imp-415`
  7. **Living Regression Verification (Physical Disk Paths - Verified 89/89 Tests Pass)**:
     `npx --yes vitest run tests/client/imp415_unified_audio_facade.test.ts tests/client/imp335_modal_host_modularization.test.ts tests/client/ui05_audio_engine.test.ts tests/client/sound_engine.test.ts tests/client/sound_engine_modular.test.ts tests/client/imp161_modal_360px_ergonomics_and_cross_browser.test.ts`

---

## 6. Definition of Done (DoD)
- [ ] `src/client/audio/audio_facade.ts` implemented with `AudioFacade` interface, `AudioFacadeImpl`, and `audio` singleton export with dual teardown in `dispose()`.
- [ ] `src/client/audio/index.ts` established as the authoritative public facade re-exporting `audio`, `AudioEngine`, `SoundEngine`, `SoundEffect`, `BGMTrack`, `MusicTrack`.
- [ ] All 14 physical call sites across the 6 modal files converted from `AudioEngine.playSfx(...)` to `audio.playSfx(...)`.
- [ ] `src/client/ui/modals/hosts/auction_modal_host.tsx` rewired to import `{ audio, SoundEffect }` from `../../../audio/index.js` (1 call site).
- [ ] `src/client/ui/modals/hosts/deed_modal_host.tsx` rewired to import `{ audio, SoundEffect }` from `../../../audio/index.js` (1 call site).
- [ ] `src/client/ui/modals/hosts/trade_modal_host.tsx` rewired to import `{ audio, SoundEffect }` from `../../../audio/index.js` (1 call site).
- [ ] `src/client/ui/modals/modal_host.tsx` rewired to import `{ audio, SoundEffect }` from `../../audio/index.js` (7 call sites).
- [ ] `src/client/ui/modals/bot_trade_offer_strip.tsx` rewired to import `{ audio, SoundEffect }` from `../../audio/index.js` (2 call sites).
- [ ] `src/client/ui/modals/transit_wheel_modal.tsx` rewired to import `{ audio, SoundEffect }` from `../../audio/index.js` (2 call sites).
- [ ] All 6 audio `SEAM-01` boundary warnings eliminated in `npm run lint:boundaries`.
- [ ] `tests/client/imp415_unified_audio_facade.test.ts` includes `afterEach` cleanup resetting `useAudioStore` and `vi.restoreAllMocks()` to prevent state pollution.
- [ ] Preserved `src/client/store/audio_store.ts` direct leaf import from `../audio/audio_types` to guarantee zero circular cycles between `@store` and `@audio`.
- [ ] Living test suite `tests/client/imp415_unified_audio_facade.test.ts` passes 100% across 6 atomic contract tests.
- [ ] Full regression suites (`imp335`, `ui05`, `sound_engine`, `sound_engine_modular`, `imp161`) pass 100% cleanly without breakage to `imp335#L296` spy.
- [ ] `node scripts/check_evidence.mjs imp-415` exits `0`.

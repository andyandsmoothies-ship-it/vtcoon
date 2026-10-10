# Plan IMP-346: Presentation Subscribers Expansion & Delta Decoupling

## 0. Context & Prior In-Flight Scope (Uncommitted)
- **Prior In-Flight Scope (Uncommitted)**:
  - `docs/reports/uat/uat_game_2_players_step_by_step.md`
  - `tests/client/imp330_game_event_narrative_synthesizer.test.ts`
  - `tests/client/imp322_global_event_banner.test.ts`
  - `src/client/network/client_session_purger.ts`
  - `src/client/store/game_store.ts`
  - `src/client/ui/transaction_narrative.ts`
  - `tests/client/anti_aliasing_and_visual_crispness.test.ts`

## 1. Metadata & Architecture Boundary
- **Ticket ID**: `IMP-346`
- **Subsystem**: `client-state`
- **Problem Statement**:
  1. `apply_delta.ts` called legacy `trackDeltaActivities` purely for card/transit floating text and SFX (`CARD_DRAW`).
  2. `apply_delta.ts#L52` executed `AudioEngine.playSfx(SoundEffect.DICE_ROLL)` directly, causing acoustic phasing with `dice_tray.tsx`.
  3. `apply_delta.ts#L201-210` contained inline `state.addFloatingText` calls inside `syncEventCard`, splitting presentation logic.
  4. `audio_event_subscriber.ts` and `property_market_badge_handler.ts` lacked listeners for kinematic events.
- **Architectural Solution**:
  1. **Audio Presentation Expansion via DI Seam**: Wire `EVENT_CARD_DRAWN` (`engine.playCardFlip()`) and `TRANSIT_WHEEL_LANDED` (`playSlumpThud`/`playVictoryChime`) strictly via injected `SoundEngineImpl` (zero static `AudioEngine`).
  2. **Unified Badge Presentation in PropertyMarketHandler**: Wire `EVENT_CARD_DRAWN` (bot toast 2500ms, board-wide 5000ms) and `TRANSIT_WHEEL_LANDED` (using `formatTransitWheelBroadcast`) into `property_market_badge_handler.ts`.
  3. **Delta Pipeline Decoupling**: Remove `trackDeltaActivities`, `useActivityStore`, inline dice SFX, and inline card FloatingText from `apply_delta.ts`.
  4. **Backward Compatibility**: Preserve `activity_tracker.ts` intact for legacy contract test suites.
- **Direct Scope (Physical Files)**:
  - `src/client/events/subscribers/audio_event_subscriber.ts`
  - `src/client/events/subscribers/property_market_badge_handler.ts`
  - `src/client/network/apply_delta.ts`
  - `tests/client/imp346_delta_presentation_decoupling.test.ts` (New)

## 2. Planned Changes & LOC Budget

| Target physical file | Tier Classification | Baseline LOC | Target LOC | Delta | Hard Ceiling | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `src/client/events/subscribers/audio_event_subscriber.ts` | Tier 1 (Domain/Server/Logic) | 119 | 132 | +13 | <= 400 | ✔️ Safe |
| `src/client/events/subscribers/property_market_badge_handler.ts` | Tier 1 (Domain/Server/Logic) | 154 | 200 | +46 | <= 400 | ✔️ Safe |
| `src/client/network/apply_delta.ts` | Tier 1 (Domain/Server/Logic) | 255 | 231 | -24 | <= 400 | ✔️ Safe |
| `tests/client/imp346_delta_presentation_decoupling.test.ts` | Living Test | 0 | 250 | +250 | <= 600 | 🆕 Tệp mới (✔️ Safe) |

## 3. Implementation Steps

### Station 1: Contract Testing (RED)
**Target physical file**: `tests/client/imp346_delta_presentation_decoupling.test.ts` (Tệp mới)

Test Specifications:
- TC-346.01 [UC-AUDIO/MSS]: Given synthesized EVENT_CARD_DRAWN event, When listener in createAudioEventSubscriber executes, Then triggers card flip sound via injected soundEngine.
- TC-346.02 [UC-AUDIO/A1]: Given synthesized TRANSIT_WHEEL_LANDED with FLIGHT_DELAY, When listener in createAudioEventSubscriber executes, Then triggers slump thud sound via injected soundEngine.
- TC-346.03 [UC-AUDIO/A2]: Given synthesized TRANSIT_WHEEL_LANDED with SPEED_BOOST, When listener in createAudioEventSubscriber executes, Then triggers victory chime sound via injected soundEngine.
- TC-346.04 [UC-BADGE/MSS]: Given synthesized EVENT_CARD_DRAWN event for bot player, When createBadgeEventSubscriber listener executes, Then adds 2500ms FloatingText notification.
- TC-346.05 [UC-BADGE/A1]: Given synthesized EVENT_CARD_DRAWN event for board-wide card, When createBadgeEventSubscriber listener executes, Then adds 5000ms FloatingText notification.
- TC-346.06 [UC-BADGE/A2]: Given synthesized EVENT_CARD_DRAWN event for human player with personal card, When createBadgeEventSubscriber listener executes, Then yields to EventCardModal without duplicate floating text.
- TC-346.07 [UC-BADGE/A3]: Given synthesized TRANSIT_WHEEL_LANDED event, When createBadgeEventSubscriber listener executes, Then adds transit FloatingText formatted via formatTransitWheelBroadcast.
- TC-346.08 [UC-DECOUPLE/MSS]: Given DeltaPayload with dice and card events, When calling applyDeltaToStore, Then dispatches synthesized events through GameEventBus without legacy tracking.

### Station 2: Minimal Production Implementation (GREEN)

#### Task 1: Expand Audio Presentation Subscriber via Injected Engine
**Target physical file**: `src/client/events/subscribers/audio_event_subscriber.ts`

```typescript
<<<<
      case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        break;
      }

      default:
====
      case SynthesizedGameEventType.DIPLOMATIC_WAIVER: {
        const delay = pacingContext?.getPawnLandingDelay(event.payerId) ?? 0;
        scheduleOrPlay(delay, 'victory_chime', () => engine.playVictoryChime());
        scheduleOrPlay(delay, 'slump_thud', () => engine.playSlumpThud());
        break;
      }

      case SynthesizedGameEventType.EVENT_CARD_DRAWN: {
        scheduleOrPlay(0, 'card_draw', () => engine.playCardFlip());
        break;
      }

      case SynthesizedGameEventType.TRANSIT_WHEEL_LANDED: {
        const isDelay = event.outcome === 'FLIGHT_DELAY';
        scheduleOrPlay(0, 'transit_land', () => {
          if (isDelay) engine.playSlumpThud(); else engine.playVictoryChime();
        });
        break;
      }

      default:
>>>>
```

#### Task 2: Expand Property & Market Badge Handler
**Target physical file**: `src/client/events/subscribers/property_market_badge_handler.ts`

```typescript
<<<<
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
====
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import { useLobbyStore } from '../../store/lobby_store.js';
import { BOARD_WIDE_CARDS } from '../../network/apply_delta.js';
import { formatTransitWheelBroadcast, TransitWheelOutcome } from '../../../domain/transit_wheel.js';
>>>>
```

```typescript
<<<<
    case SynthesizedGameEventType.AUCTION_WON: {
      const cellName = getCellName(event.cellIndex);
      vfx.getState().triggerPawnReaction(event.winnerId, 'victory_spin', 600);
      state.addFloatingText({
        text: formatCurrency(-event.winningBid),
        type: FloatingTextType.Penalty,
        playerId: event.winnerId,
        actionType: 'auction_win',
        title: `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc`,
        cellIndex: event.cellIndex,
      });
      break;
    }

    default:
====
    case SynthesizedGameEventType.AUCTION_WON: {
      const cellName = getCellName(event.cellIndex);
      vfx.getState().triggerPawnReaction(event.winnerId, 'victory_spin', 600);
      state.addFloatingText({
        text: formatCurrency(-event.winningBid),
        type: FloatingTextType.Penalty,
        playerId: event.winnerId,
        actionType: 'auction_win',
        title: `Thắng đấu giá ${cellName} ➔ Nộp Kho Bạc`,
        cellIndex: event.cellIndex,
      });
      break;
    }

    case SynthesizedGameEventType.EVENT_CARD_DRAWN: {
      const myPid = useLobbyStore.getState().myPlayerId || 'p1';
      const isBoardWide = BOARD_WIDE_CARDS.has(event.cardId);
      const isBotCard = Boolean(event.playerId && event.playerId !== myPid);
      if (isBoardWide || isBotCard) {
        state.addFloatingText({
          actionType: event.cardType ?? 'chance',
          playerId: event.playerId,
          title: event.title,
          text: event.description || '',
          type: (event.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
          durationMs: isBoardWide ? 5000 : 2500,
          isBoardWide,
        });
      }
      break;
    }

    case SynthesizedGameEventType.TRANSIT_WHEEL_LANDED: {
      const isDelay = event.outcome === TransitWheelOutcome.FLIGHT_DELAY;
      const pName = resolvePlayerName(context, event.playerId);
      const stName = getCellName(event.cellIndex);
      const targetName = event.targetCell !== undefined ? getCellName(event.targetCell) : undefined;
      const text = formatTransitWheelBroadcast({
        outcome: event.outcome,
        playerName: pName,
        stationName: stName,
        targetCellName: targetName,
        payout: event.payout,
        boostSteps: event.boostSteps,
      });
      state.addFloatingText({
        text,
        type: isDelay ? FloatingTextType.Penalty : FloatingTextType.Bonus,
        playerId: event.playerId,
        actionType: 'transit',
        title: 'VÒNG XOAY VẬN TẢI',
        cellIndex: event.targetCell ?? event.cellIndex,
        durationMs: 4000,
      });
      break;
    }

    default:
>>>>
```

#### Task 3: Decouple Network Delta from Legacy Activity Trackers
**Target physical file**: `src/client/network/apply_delta.ts`

```typescript
<<<<
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import { useActivityStore } from '../store/activity_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { trackDeltaActivities } from './activity_tracker.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';
====
import { useGameStore, type GameState, FloatingTextType } from '../store/game_store.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { BOARD_SIZE, TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';
import { AudioEngine } from '../audio/audio_engine.js';
import { SoundEffect } from '../audio/audio_types.js';
import { handleDeltaTelemetry } from '../telemetry/telemetry_delta_hook.js';
>>>>
```

```typescript
<<<<
  state.triggerDiceRoll([dice[0], dice[1]], delta.diceSeq);
  try { AudioEngine.playSfx(SoundEffect.DICE_ROLL); } catch (err) { console.warn('[applyDelta] AudioEngine.playSfx error:', err); }
}
====
  state.triggerDiceRoll([dice[0], dice[1]], delta.diceSeq);
}
>>>>
```

```typescript
<<<<
    trackDeltaActivities(delta, state, nextState, useActivityStore, {
      suppressFinancialAndProperty: true,
      suppressKinematicLogging: true,
    });
    handleDeltaTelemetry(delta, state, nextState);
====
    handleDeltaTelemetry(delta, state, nextState);
>>>>
```

```typescript
<<<<
  if (card && card.cardId && card.cardId !== prevCard?.cardId) {
    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
    const turnPlayerId = card.drawnBy ?? card.playerId ?? delta?.currentTurnPlayerId ?? delta?.diceRollerId ?? state.currentTurnPlayerId ?? myPid;
    const isBoardWide = isBoardWideCard(card.cardId);
    if (isBoardWide || turnPlayerId !== myPid) {
      state.addFloatingText({
        actionType: card.cardType ?? 'chance',
        playerId: turnPlayerId,
        title: card.title,
        text: card.effectDetail || card.description || '',
        type: (card.effectDelta ?? 0) >= 0 ? FloatingTextType.Bonus : FloatingTextType.Penalty,
        durationMs: isBoardWide ? 5000 : 2500,
        isBoardWide,
      });
    }
  }
}
====
}
>>>>
```

### Station 3: Pre-Filter & Mechanical Gates
- `npm run prefilter -- src/client/events/subscribers/audio_event_subscriber.ts src/client/events/subscribers/property_market_badge_handler.ts src/client/network/apply_delta.ts tests/client/imp346_delta_presentation_decoupling.test.ts`
- `node scripts/check_scope.mjs .agents/plans/PLAN_IMP_346_DELTA_PRESENTATION_DECOUPLING.md`

### Station 4: Physical Evidence & Regression Verification
- `npm test -- tests/client/imp346_delta_presentation_decoupling.test.ts`
- `npm run sentinel -- --ticket IMP-346 --test tests/client/imp346_delta_presentation_decoupling.test.ts`
- `node scripts/check_evidence.mjs IMP-346`

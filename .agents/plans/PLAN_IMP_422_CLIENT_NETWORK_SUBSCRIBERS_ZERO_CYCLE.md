# Implementation Plan: IMP-422 Client Network Subscribers & Event Bus Zero-Cycle

## 1. Physical Surface Area & Baselines
- Physical Targets:
  - `src/client/network/room_config_helpers.ts` (NEW, Tier 1 Seam <= 50 LOC)
  - `src/client/events/game_event_bus_types.ts` (NEW, Tier 1 Seam <= 40 LOC)
  - `src/client/events/event_card_constants.ts` (NEW, Tier 1 Seam <= 25 LOC)
  - `src/client/network/trade_offer_tracker.ts` (NEW, Tier 1 Seam <= 35 LOC)
  - `src/client/store/lobby_store.ts` (Physical: 278 LOC)
  - `src/client/offline_landing.ts` (Physical: 213 LOC)
  - `src/client/network/client_session_purger.ts` (Physical: 59 LOC)
  - `src/client/network/apply_delta.ts` (Physical: 250 LOC)
  - `src/client/network/activity_tracker.ts` (Physical: 294 LOC)
  - `src/client/events/game_event_bus.ts` (Physical: 109 LOC)
  - `src/client/events/subscribers/property_market_badge_handler.ts` (Physical: 200 LOC)
  - `src/client/events/subscribers/activity_log_subscriber.ts` (Physical: 350 LOC)
  - `src/client/events/subscribers/badge_event_subscriber.ts` (Physical: 294 LOC)
  - `src/client/events/subscribers/audio_event_subscriber.ts` (Physical: 133 LOC)
  - `src/client/events/subscribers/badge_financial_helpers.ts` (Physical: 122 LOC)
  - `src/client/events/subscribers/activity_log_financial_formatter.ts` (Physical: 126 LOC)
  - `src/client/ui/modals/bot_trade_offer_strip.tsx` (Physical: 271 LOC)
- Test Suite: `tests/client/imp422_client_network_subscribers_zero_cycle.test.ts` (NEW)

### Principles Applied
- **View-Model Seam Extraction** -> Extract `room_config_helpers.ts`, `game_event_bus_types.ts`, `event_card_constants.ts`, and `trade_offer_tracker.ts` as pure leaf modules.
- **100% DTO & Call-Site Wiring** -> Wire `myPlayerId` from `useLobbyStore` through `GameEventContext` in `apply_delta.ts` down to `handleMarketBadges` in `property_market_badge_handler.ts`.
- **Resource Disposal & Cache Hygiene** -> Static FIFO-100 tracker in `trade_offer_tracker.ts` purged deterministically by `client_session_purger.ts`.
- **Equivalence-Partition Testing** -> Verify room code generation, event bus DAG dispatch, badge attribution, and cycle elimination.

---

## 2. Core Contract Invariants (Station 1 Spec)
1. **INV-422.01 (Zero Client SCC Cycle)**: Tarjan's strongly connected components algorithm on `src/client/**` returns 0 multi-file cycles.
2. **INV-422.02 (Pure Room Config Seam)**: `createNewRoomConfig(isHost)` generates deterministic room codes matching `/^[A-Z0-9]{6}$/` and assigns `p1` for host, `p2` for guest without importing `lobby_store.ts`.
3. **INV-422.03 (Event Bus DAG Flow)**: `game_event_bus.ts` imports subscribers; subscribers import only `game_event_bus_types.ts`, establishing a strict unidirectional DAG.
4. **INV-422.04 (Player Identity Attribution)**: `handleMarketBadges` extracts `myPlayerId` from `GameEventContext`, correctly identifying bot cards vs local cards for non-host players (`p2`, `p3`, `p4`).
5. **INV-422.05 (Static Trade Offer Purge)**: `purgeClientMatchSession()` resets `resolvedTradeOfferIds` via static call to `resetTradeOfferResolutions()` in `trade_offer_tracker.ts`.
6. **INV-422.06 (Activity Tracker Options Seam)**: `trackDeltaActivities` consumes `options.myPlayerId` without importing `lobby_store.ts`.

---

## 3. Physical File Replacement Specifications

**Target physical file**: `src/client/network/room_config_helpers.ts` (NEW)
```typescript
import { generateRandomAnimalName } from '../../domain/ai_player_names.js';

export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VT';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getInitialLobbyConfig(search?: string): {
  roomCode: string | null;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  const loc = typeof window !== 'undefined' ? window.location : null;
  const searchStr = search ?? loc?.search ?? '';
  const hash = (loc as { hash?: string } | null)?.hash ?? '';

  if (searchStr.includes('admin=true') || hash.includes('admin') || hash.includes('/admin')) {
    return { roomCode: 'VTADMN', playerId: 'admin', isHost: false, playerName: 'Admin' };
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(searchStr || window.location.search) : null;
  const roomParam = params?.get('room');
  if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
    const code = roomParam.toUpperCase();
    const isStoredHost = typeof window !== 'undefined' && window.sessionStorage?.getItem(`vtcoon_host_${code}`) === 'true';
    const isHost = isStoredHost || params?.get('host') === 'true';
    const targetPid = isHost ? 'p1' : 'p2';
    return {
      roomCode: code,
      playerId: targetPid,
      isHost,
      playerName: generateRandomAnimalName([], `${code}_${targetPid}`),
    };
  }

  return { roomCode: null, playerId: '', isHost: false, playerName: '' };
}

export function createNewRoomConfig(isHost = true): {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  const randomCode = generateRandomRoomCode();
  const targetPid = isHost ? 'p1' : 'p2';
  if (typeof window !== 'undefined') {
    window.sessionStorage?.setItem(`vtcoon_host_${randomCode}`, 'true');
    window.history?.replaceState(null, '', `?room=${randomCode}`);
  }
  return {
    roomCode: randomCode,
    playerId: targetPid,
    isHost,
    playerName: generateRandomAnimalName([], `${randomCode}_${targetPid}`),
  };
}
```

**Target physical file**: `src/client/events/game_event_bus_types.ts` (NEW)
```typescript
import type { GameState } from '../store/game_store.js';
import type { DeltaPayload } from '../../domain/protocol/index.js';
import type { SynthesizedGameEvent } from './game_event_types.js';

export interface GameEventContext {
  readonly prevState: GameState;
  readonly nextState: GameState;
  readonly delta: DeltaPayload;
  readonly myPlayerId?: string;
}

export type GameEventListener = (
  events: readonly SynthesizedGameEvent[],
  context: GameEventContext
) => void;
```

**Target physical file**: `src/client/events/event_card_constants.ts` (NEW)
```typescript
export const BOARD_WIDE_CARDS: ReadonlySet<string> = new Set([
  'MC_MEGA_CONCERT', 'MC_FIRE_INSPECTION', 'MC_RATE_HIKE',
  'MC_FREEZE_TRADE', 'MC_ANTI_SPECULATE', 'MC_FUEL_SURGE',
  'MC_CREDIT_STIMULUS', 'MC_PUBLIC_INVEST', 'MC_COASTAL_STORM',
  'MC_PEAK_TOURISM', 'MC_CASINO_PILOT', 'MC_NIGHT_ECONOMY',
  'MC_ALCOHOL_CHECK', 'MC_LAND_FEVER', 'MC_URBAN_PLANNING',
  'MC_UTILITY_DOUBLE',
  'CC_FRANCHISE', 'CC_CONTRACT_PENALTY', 'CC_PORT_EXCLUSIVE',
  'CC_MA_FORCE', 'CC_SWAP_PROJECT',
]);

export function isBoardWideCard(cardId?: string): boolean {
  return Boolean(cardId && BOARD_WIDE_CARDS.has(cardId));
}
```

**Target physical file**: `src/client/network/trade_offer_tracker.ts` (NEW)
```typescript
const MAX_RESOLVED_ENTRIES = 100;
const resolvedTradeOfferIds = new Set<string>();

export function markTradeOfferResolved(offerId: string): boolean {
  if (!offerId || resolvedTradeOfferIds.has(offerId)) {
    return false;
  }
  if (resolvedTradeOfferIds.size >= MAX_RESOLVED_ENTRIES) {
    const oldest = resolvedTradeOfferIds.values().next().value;
    if (oldest) resolvedTradeOfferIds.delete(oldest);
  }
  resolvedTradeOfferIds.add(offerId);
  return true;
}

export function resetTradeOfferResolutions(): void {
  resolvedTradeOfferIds.clear();
}
```

**Target physical file**: `src/client/store/lobby_store.ts`
```typescript
<<<<
import { createNewRoomConfig } from '../offline_landing';
====
import { createNewRoomConfig } from '../network/room_config_helpers.js';
>>>>
```

**Target physical file**: `src/client/offline_landing.ts`
```typescript
<<<<
export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export function generateRandomRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'VT';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getInitialLobbyConfig(search?: string): {
  roomCode: string | null;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  // Admin guard: không chạy replaceState cho Admin URL
  const loc = typeof window !== 'undefined' ? window.location : null;
  const searchStr = search ?? loc?.search ?? '';
  const hash = (loc as { hash?: string } | null)?.hash ?? '';
  if (searchStr.includes('admin=true') || hash.includes('admin') || hash.includes('/admin')) {
    return { roomCode: 'VTADMN', playerId: 'admin', isHost: false, playerName: 'Admin' };
  }

  const params = typeof window !== 'undefined' ? new URLSearchParams(searchStr || window.location.search) : null;
  const roomParam = params?.get('room');
  if (roomParam && /^[A-Z0-9]{6}$/i.test(roomParam)) {
    const code = roomParam.toUpperCase();
    const isStoredHost = typeof window !== 'undefined' && window.sessionStorage?.getItem(`vtcoon_host_${code}`) === 'true';
    const isHost = isStoredHost || params?.get('host') === 'true';
    const targetPid = isHost ? 'p1' : 'p2';
    return {
      roomCode: code,
      playerId: targetPid,
      isHost,
      playerName: generateRandomAnimalName([], `${code}_${targetPid}`),
    };
  }

  return {
    roomCode: null,
    playerId: '',
    isHost: false,
    playerName: '',
  };
}

export function createNewRoomConfig(isHost = true): {
  roomCode: string;
  playerId: string;
  isHost: boolean;
  playerName: string;
} {
  const randomCode = generateRandomRoomCode();
  const targetPid = isHost ? 'p1' : 'p2';
  if (typeof window !== 'undefined') {
    window.sessionStorage?.setItem(`vtcoon_host_${randomCode}`, 'true');
    window.history?.replaceState(null, '', `?room=${randomCode}`);
  }
  return {
    roomCode: randomCode,
    playerId: targetPid,
    isHost,
    playerName: generateRandomAnimalName([], `${randomCode}_${targetPid}`),
  };
}
====
export * from './network/room_config_helpers.js';
>>>>
```

**Target physical file**: `src/client/network/client_session_purger.ts`
```typescript
<<<<
import { resetTradeOfferResolutions } from '../ui/modals/bot_trade_offer_strip.js';
====
import { resetTradeOfferResolutions } from './trade_offer_tracker.js';
>>>>
```

**Target physical file**: `src/client/network/apply_delta.ts`
```typescript
<<<<
export const BOARD_WIDE_CARDS: ReadonlySet<string> = new Set([
  'MC_MEGA_CONCERT', 'MC_FIRE_INSPECTION', 'MC_RATE_HIKE',
  'MC_FREEZE_TRADE', 'MC_ANTI_SPECULATE', 'MC_FUEL_SURGE',
  'MC_CREDIT_STIMULUS', 'MC_PUBLIC_INVEST', 'MC_COASTAL_STORM',
  'MC_PEAK_TOURISM', 'MC_CASINO_PILOT', 'MC_NIGHT_ECONOMY',
  'MC_ALCOHOL_CHECK', 'MC_LAND_FEVER', 'MC_URBAN_PLANNING',
  'MC_UTILITY_DOUBLE',
  'CC_FRANCHISE', 'CC_CONTRACT_PENALTY', 'CC_PORT_EXCLUSIVE',
  'CC_MA_FORCE', 'CC_SWAP_PROJECT',
]);

export function isBoardWideCard(cardId?: string): boolean {
  return Boolean(cardId && BOARD_WIDE_CARDS.has(cardId));
}
====
export * from '../events/event_card_constants.js';
>>>>
```
```typescript
<<<<
        dispatchGameEvents(events, {
          prevState: state,
          nextState,
          delta,
        });
====
        dispatchGameEvents(events, {
          prevState: state,
          nextState,
          delta,
          myPlayerId: useLobbyStore.getState().myPlayerId,
        });
>>>>
```

**Target physical file**: `src/client/network/activity_tracker.ts`
```typescript
<<<<
import { useLobbyStore } from '../store/lobby_store.js';
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
====
import { useActivityStore, type ActivityLogEntry } from '../store/activity_store.js';
>>>>
```
```typescript
<<<<
export interface TrackDeltaActivitiesOptions {
  readonly suppressFinancialAndProperty?: boolean;
  readonly suppressKinematicLogging?: boolean;
}
====
export interface TrackDeltaActivitiesOptions {
  readonly suppressFinancialAndProperty?: boolean;
  readonly suppressKinematicLogging?: boolean;
  readonly myPlayerId?: string;
}
>>>>
```
```typescript
<<<<
    const myPid = useLobbyStore.getState().myPlayerId || 'p1';
====
    const myPid = options?.myPlayerId || 'p1';
>>>>
```

**Target physical file**: `src/client/events/game_event_bus.ts`
```typescript
<<<<
export interface GameEventContext {
  readonly prevState: GameState;
  readonly nextState: GameState;
  readonly delta: DeltaPayload;
}

export type GameEventListener = (
  events: readonly SynthesizedGameEvent[],
  context: GameEventContext,
) => void;
====
export type { GameEventContext, GameEventListener } from './game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/events/subscribers/property_market_badge_handler.ts`
```typescript
<<<<
import type { GameEventContext } from '../game_event_bus.js';
import type { PacingContext } from '../pacing_context.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import { useLobbyStore } from '../../store/lobby_store.js';
import { BOARD_WIDE_CARDS } from '../../network/apply_delta.js';
====
import type { GameEventContext } from '../game_event_bus_types.js';
import type { PacingContext } from '../pacing_context.js';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { formatCurrency } from '../../ui/ui_helpers.js';
import { isBoardWideCard } from '../event_card_constants.js';
>>>>
```
```typescript
<<<<
    case SynthesizedGameEventType.EVENT_CARD_DRAWN: {
      const myPid = useLobbyStore.getState().myPlayerId || 'p1';
      const isBoardWide = BOARD_WIDE_CARDS.has(event.cardId);
====
    case SynthesizedGameEventType.EVENT_CARD_DRAWN: {
      const myPid = context.myPlayerId || 'p1';
      const isBoardWide = isBoardWideCard(event.cardId);
>>>>
```

**Target physical file**: `src/client/events/subscribers/activity_log_subscriber.ts`
```typescript
<<<<
import type { GameEventContext, GameEventListener } from '../game_event_bus.js';
====
import type { GameEventContext, GameEventListener } from '../game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/events/subscribers/badge_event_subscriber.ts`
```typescript
<<<<
import type { GameEventContext, GameEventListener } from '../game_event_bus.js';
====
import type { GameEventContext, GameEventListener } from '../game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/events/subscribers/audio_event_subscriber.ts`
```typescript
<<<<
import type { GameEventListener } from '../game_event_bus.js';
====
import type { GameEventListener } from '../game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/events/subscribers/badge_financial_helpers.ts`
```typescript
<<<<
import type { GameEventContext } from '../game_event_bus.js';
====
import type { GameEventContext } from '../game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/events/subscribers/activity_log_financial_formatter.ts`
```typescript
<<<<
import type { GameEventContext } from '../game_event_bus.js';
====
import type { GameEventContext } from '../game_event_bus_types.js';
>>>>
```

**Target physical file**: `src/client/ui/modals/bot_trade_offer_strip.tsx`
```typescript
<<<<
const MAX_RESOLVED_ENTRIES = 100;
const resolvedTradeOfferIds = new Set<string>();

/**
 * Sentinel FIFO-100: Ghi nhận và khóa offerId đề xuất giao dịch bot.
 * Trả về true nếu đề xuất mới được ghi nhận thành công, false nếu đã được giải quyết trước đó.
 */
export function markTradeOfferResolved(offerId: string): boolean {
  if (!offerId || resolvedTradeOfferIds.has(offerId)) {
    return false;
  }
  if (resolvedTradeOfferIds.size >= MAX_RESOLVED_ENTRIES) {
    const oldest = resolvedTradeOfferIds.values().next().value;
    if (oldest) resolvedTradeOfferIds.delete(oldest);
  }
  resolvedTradeOfferIds.add(offerId);
  return true;
}

export function resetTradeOfferResolutions(): void {
  resolvedTradeOfferIds.clear();
}
====
import {
  markTradeOfferResolved,
  resetTradeOfferResolutions,
} from '../../network/trade_offer_tracker.js';
export { markTradeOfferResolved, resetTradeOfferResolutions };
>>>>
```

---

## 4. Contract Test Suite Specification (`tests/client/imp422_client_network_subscribers_zero_cycle.test.ts`)
- **TC-422.01 [UC-IMP422/MSS]**: Given the entire set of TypeScript files in `src/client/**`, When Tarjan's SCC cycle detection algorithm is executed, Then 0 multi-file strongly connected circular components are found.
- **TC-422.02 [UC-IMP422/MSS]**: Given a request to initialize room configuration for host and guest, When `createNewRoomConfig(true)` and `createNewRoomConfig(false)` are called, Then valid 6-character room codes starting with `VT` are generated and player IDs `p1` and `p2` are assigned respectively.
- **TC-422.03 [UC-IMP422/MSS]**: Given a `GameEventBus` instance with registered default subscribers, When game events are dispatched with `context.myPlayerId`, Then listeners receive the events and context without circular module dependency errors.
- **TC-422.04 [UC-IMP422/MSS]**: Given an `EVENT_CARD_DRAWN` event and `context.myPlayerId = 'p2'`, When `handleMarketBadges` is executed for a card drawn by `p2`, Then a floating text badge is successfully added to the game state.
- **TC-422.05 [UC-IMP422/MSS]**: Given trade offer resolution entries recorded via `markTradeOfferResolved`, When `purgeClientMatchSession` is executed, Then `resetTradeOfferResolutions` clears the FIFO-100 tracker registry.
- **TC-422.06 [UC-IMP422/MSS]**: Given a delta with event cards and `options.myPlayerId = 'p2'`, When `trackDeltaActivities` is executed, Then activity logs correctly reflect the player's identity without importing `lobby_store.ts`.

---

## 5. Definition of Done (DoD)
- `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_422_CLIENT_NETWORK_SUBSCRIBERS_ZERO_CYCLE.md` exits 0.
- All 17 target files match specifications with zero dirty casts (`as any`).
- `tests/client/imp422_client_network_subscribers_zero_cycle.test.ts` passes 100% GREEN.
- `npm run lint:boundaries` proves `[SCC-1]` has been completely eliminated.
- All existing living contract tests (e.g. `imp280_trade_offer_dual_dispatch_guard.test.ts`) pass without regressions.
- `node scripts/check_evidence.mjs IMP-422` passes 100% physical verification.

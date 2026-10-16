/**
 * Client Store Facade — Authoritative single entrypoint for reactive client stores.
 * Decouples presentation consumers from internal store leaf files.
 */

// Game Store & Core Timing Constants
export {
  useGameStore,
  FLOATING_TEXT_DURATION_MS,
  EVENT_BANNER_DURATION_MS,
  TRANSACTION_POPUP_DURATION_MS,
  MAX_FLOATING_TEXTS,
} from './game_store.js';

export * from './game_store_types.js';

// Lobby Store & Contracts
export { useLobbyStore } from './lobby_store.js';
export {
  type LobbyState,
  type LobbySlot,
  type LobbyReasonCode,
  MAX_LOBBY_SLOTS,
  ROOM_CODE_REGEX,
  BotPersonality,
} from './lobby_types.js';

// Environment Store & Contracts
export {
  useEnvironmentStore,
  type EnvironmentState,
  type TimeOfDayPhase,
  type TimeOfDayMode,
  type LightingPreset,
  TIME_OF_DAY_PRESETS,
  AUTO_CYCLE_DURATION_SECONDS,
  calculatePhaseFromProgress,
  calculateAviationStrobe,
  calculateLaserRotation,
  getNextTimeOfDayMode,
} from './environment_store.js';

// VFX Store & Contracts
export {
  useVfxStore,
  type VfxState,
  type ActiveSlam,
  type PawnReactionState,
  SLAM_DEFAULT_DURATION_MS,
  SLAM_IMPACT_DELAY_MS,
} from './vfx_store.js';

// Activity Store & Contracts
export {
  useActivityStore,
  type ActivityStoreState,
  type ActivityLogEntry,
  type ActivityLogType,
  type ActivityFilterType,
  MAX_ACTIVITY_LOGS,
} from './activity_store.js';

// Audio Store & Contracts
export {
  useAudioStore,
  type AudioState,
} from './audio_store.js';

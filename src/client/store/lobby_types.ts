// [TC-NET02.1/MSS] Lobby Types & Data Definitions
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import { PLAYER_TOKEN_PALETTE } from '../../domain/theme';
import { BotPersonality } from '../../domain/bot/bot_engine';
export { BotPersonality } from '../../domain/bot/bot_engine';

export const MAX_LOBBY_SLOTS = 4;
export const ROOM_CODE_REGEX = /^[A-Z0-9]{6}$/;

export type LobbyReasonCode =
  | 'INVALID_ROOM_CODE'
  | 'INVALID_PLAYER_ID'
  | 'ROOM_NOT_FOUND'
  | 'ROOM_FULL'
  | 'NOT_HOST'
  | 'NOT_ENOUGH_PLAYERS'
  | 'PLAYERS_NOT_READY'
  | 'SLOT_CONFLICT'
  | 'INVALID_SLOT'
  | 'ROOM_STARTED'
  | 'PLAYER_ALREADY_IN_ROOM'
  | 'CANNOT_REMOVE_HOST';

export const BOT_PERSONALITIES: readonly BotPersonality[] = [
  BotPersonality.Balanced,
  BotPersonality.Aggressive,
  BotPersonality.Passive,
] as const;

export function getNextBotPersonality(current: BotPersonality): BotPersonality {
  if (current === BotPersonality.Balanced) return BotPersonality.Aggressive;
  if (current === BotPersonality.Aggressive) return BotPersonality.Passive;
  return BotPersonality.Balanced;
}

export interface LobbySlot {
  readonly slotIndex: number;
  readonly playerId: string | null;
  readonly playerName: string;
  readonly tokenColor: string;
  readonly isHost: boolean;
  readonly isReady: boolean;
  readonly isBot: boolean;
  readonly botPersonality?: BotPersonality;
  readonly isOccupied: boolean;
}

export function createEmptySlot(index: number): LobbySlot {
  return {
    slotIndex: index,
    playerId: null,
    playerName: `Chờ người chơi ${index + 1}...`,
    tokenColor: PLAYER_TOKEN_PALETTE[index % PLAYER_TOKEN_PALETTE.length] ?? '#38BDF8',
    isHost: false,
    isReady: false,
    isBot: false,
    isOccupied: false,
  };
}

export function createDefaultSlots(): readonly LobbySlot[] {
  return Array.from({ length: MAX_LOBBY_SLOTS }, (_, i) => createEmptySlot(i));
}

export interface LobbyState {
  readonly roomCode: string | null;
  readonly myPlayerId: string;
  readonly isHost: boolean;
  readonly isReady: boolean;
  readonly gameStarted: boolean;
  readonly slots: readonly LobbySlot[];
  readonly errorReason: LobbyReasonCode | null;

  // Actions
  readonly initLobby: (roomCode: string, playerId: string, isHost: boolean, playerName?: string) => boolean;
  readonly setRoomCode: (code: string | null) => void;
  readonly toggleMyReady: () => void;
  readonly setPlayerReady: (playerId: string, isReady: boolean) => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly addGuestPlayer: (playerId: string, playerName: string) => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly removePlayer: (playerId: string) => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly toggleBotSlot: (slotIndex: number, personality?: BotPersonality) => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly cycleBotPersonality: (slotIndex: number) => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly canStartGame: () => { readonly canStart: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly startGame: () => { readonly success: boolean; readonly reasonCode?: LobbyReasonCode };
  readonly setGameStarted: (started: boolean) => void;
  readonly resetLobby: () => void;
}

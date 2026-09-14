// [UI-S01/MSS][UI-S03/MSS][UI-S04/MSS] Game Store Types, Interfaces & Payloads
import type { EventCardInfo } from '../../domain/room';

export interface PawnAnimationState {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell?: number;
  readonly waypoints: readonly number[];
  readonly currentIndex?: number;
  readonly isAnimating: boolean;
  readonly isBot?: boolean;
}

export interface PawnMoveTask {
  readonly playerId: string;
  readonly fromCell: number;
  readonly targetCell: number;
  readonly waypoints: readonly number[];
  readonly isBot?: boolean;
}

export interface PlayerHudInfo {
  readonly id: string;
  readonly name: string;
  readonly balance: number;
  readonly tokenColor: string;
  readonly ownedProperties: readonly number[];
  readonly mortgagedProperties?: readonly number[];
  readonly mortgageLoans?: Record<number, number>;
  readonly inAudit?: boolean;
  readonly auditTurnsLeft?: number;
  readonly skipNextTurn?: boolean;
  readonly consecutiveDoubles?: number;
  readonly bankrupt?: boolean;
  readonly isBot?: boolean;
  readonly overdraftRoundsLeft?: number;
}

export interface ActiveEmote {
  readonly playerId: string;
  readonly emoteId: string;
  readonly timestamp: number;
}

export enum FloatingTextType {
  Reward = 'reward',
  Penalty = 'penalty',
}

export interface FloatingTextItem {
  readonly id: string;
  readonly text: string;
  readonly type: FloatingTextType;
  readonly playerId: string;
  readonly timestamp: number;
}

export type ActiveModalType = 'deed' | 'auction' | 'trade' | 'event' | 'hose' | 'insolvency' | 'game_over' | null;

export interface ModalPayloadMap {
  deed: { cellIndex: number; canBuy?: boolean };
  auction: {
    cellIndex: number;
    currentBid: number;
    highestBidderId: string | null;
    timeRemaining: number;
    hasPassed?: boolean;
    declinedPlayerId?: string;
  };
  trade: {
    targetPlayerId: string;
    offeredProperties: number[];
    requestedProperties: number[];
    cashOffer: number;
    cashRequest: number;
  };
  event: {
    cardType: 'chance' | 'market';
    cardId: string;
    title: string;
    description: string;
    effectDelta?: number;
  };
  hose: {
    minStake?: number;
    maxStake?: number;
    currentStake?: number;
    lastDiceRoll?: number;
    lastPayout?: number;
  };
  insolvency: {
    playerId: string;
    deficit: number;
  };
  game_over: {
    leaderboard: ReadonlyArray<{ readonly id: string; readonly netWorth: number }>;
  };
}

export interface PendingPawnMove {
  readonly playerId: string;
  readonly targetCell: number;
  readonly fromCell: number;
}

export interface LastLandedPawn {
  readonly playerId: string;
  readonly cellIndex: number;
  readonly timestamp: number;
}

export interface GameState {
  readonly levelMap: Record<number, 0 | 1 | 2 | 3>;
  readonly playerPositions: Record<string, number>;
  readonly visualPositions: Record<string, number>;
  readonly dice: [number, number];
  readonly isRolling: boolean;
  readonly hasRolledThisTurn: boolean;
  readonly lastDiceSeq?: number;
  readonly activePawnAnimation: PawnAnimationState | null;
  readonly pawnAnimationQueue: readonly PawnMoveTask[];
  readonly pendingPawnMove: PendingPawnMove | null;
  readonly lastLandedPawn: LastLandedPawn | null;

  // UI-03 HUD Financial & Turn States
  readonly playersInfo: Record<string, PlayerHudInfo>;
  readonly currentTurnPlayerId: string | null;
  readonly turnTimeRemaining: number;
  readonly treasuryPool: number;
  readonly roundNumber: number;
  readonly maxRounds: number;

  // UI-04 Business Modals State
  readonly activeModal: ActiveModalType;
  readonly modalPayload: ModalPayloadMap[keyof ModalPayloadMap] | null;
  readonly lastEventCard: EventCardInfo | null;
  readonly auction?: {
    readonly cellIndex: number;
    readonly highestBid?: number;
    readonly currentBid?: number;
    readonly highestBidder?: string;
    readonly highestBidderId?: string | null;
  } | null;

  // UI-05 Social Emotes & Micro-VFX
  readonly activeEmotes: Record<string, ActiveEmote>;
  readonly floatingTexts: readonly FloatingTextItem[];

  setLastEventCard: (card: EventCardInfo | null) => void;
  setLevelMap: (map: Record<number, 0 | 1 | 2 | 3>) => void;
  setPlayerPositions: (positions: Record<string, number>) => void;
  setVisualPositions: (positions: Record<string, number>) => void;
  setDice: (dice: [number, number]) => void;
  setIsRolling: (isRolling: boolean) => void;
  setHasRolledThisTurn: (hasRolled: boolean) => void;
  setLastDiceSeq: (seq: number | undefined) => void;
  triggerDiceRoll: (dice: [number, number], diceSeq?: number) => void;
  setPendingPawnMove: (move: PendingPawnMove | null) => void;
  enqueuePawnMove: (task: PawnMoveTask) => void;
  processPawnQueue: () => void;
  startPawnMove: (playerId: string, targetCell: number, fromCell?: number, isBot?: boolean) => void;
  completePawnMove: (playerId: string) => void;
  clearActivePawnAnimation: () => void;

  // UI-03 HUD Actions
  setPlayersInfo: (players: Record<string, PlayerHudInfo>) => void;
  updatePlayerInfo: (playerId: string, partial: Partial<PlayerHudInfo>) => void;
  setCurrentTurnPlayerId: (playerId: string | null) => void;
  setTurnTimeRemaining: (seconds: number) => void;
  decrementTurnTimer: () => void;
  setTreasuryPool: (amount: number) => void;
  setRoundInfo: (round: number, maxRounds?: number) => void;

  // UI-04 Business Modals Actions
  openModal: <T extends keyof ModalPayloadMap>(type: T, payload: ModalPayloadMap[T]) => void;
  closeModal: () => void;
  updateModalPayload: <T extends keyof ModalPayloadMap>(patch: Partial<ModalPayloadMap[T]>) => void;

  // UI-05 Social Emotes & Micro-VFX Actions
  triggerEmote: (playerId: string, emoteId: string) => void;
  clearEmote: (playerId: string) => void;
  addFloatingText: (item: Omit<FloatingTextItem, 'id' | 'timestamp'> & { id?: string }) => void;
  removeFloatingText: (id: string) => void;
  clearExpiredFloatingTexts: (now?: number) => void;
}

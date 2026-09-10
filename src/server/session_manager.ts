import type { Room } from '../domain/room';
import { BOARD_SIZE, TurnPhase } from '../domain/room';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager';
import type { AuctionSession } from './auction_manager';

export const HEARTBEAT_INTERVAL_MS = 5_000;
export const GRACE_PERIOD_MS       = 60_000;

export enum SessionState {
  Connected    = 'Connected',
  GracePeriod  = 'GracePeriod',
  Disconnected = 'Disconnected',
}

export interface Session {
  readonly id: string;
  state:       SessionState;
  lastPongAt:  number;
}

export interface CellDelta {
  readonly index:          number;
  readonly ownerId?:       string | null;
  readonly level?:         number;
  readonly isETC?:         boolean;
  readonly isMortgaged?:   boolean;
  readonly unbuiltRounds?: number;
}

export interface PlayerDelta {
  readonly id:                  string;
  readonly position:            number;
  readonly balance:             number;
  readonly bankrupt?:           boolean;
  readonly isBot?:              boolean;
  readonly overdraftRoundsLeft?: number;
  readonly inAudit?:            boolean;
  readonly auditTurnsLeft?:     number;
  readonly skipNextTurn?:       boolean;
  readonly consecutiveDoubles?: number;
}

export interface AuctionPayload {
  readonly cellIndex: number;
  readonly currentBid: number;
  readonly highestBidderId: string | null;
  readonly timeRemaining: number;
  readonly declinedPlayerId?: string;
  readonly hasPassed?: boolean;
}

export interface DeltaPayload {
  readonly tick:                 number;
  readonly cells:                ReadonlyArray<CellDelta>;
  readonly players?:             ReadonlyArray<PlayerDelta>;
  readonly currentPlayerIndex?:  number;
  readonly currentTurnPlayerId?: string;
  readonly dice?:                readonly [number, number];
  readonly auction?:             AuctionPayload | null;
}

export function buildDeltaFromRoom(
  room: Room,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  tick: number,
  auctions?: Map<string, AuctionSession>,
): DeltaPayload {
  const mortgagedSet = new Set<number>();
  for (const player of room.players) {
    for (const cellIndex of player.mortgagedProperties ?? []) {
      mortgagedSet.add(cellIndex);
    }
  }

  const cells: CellDelta[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const ownerId = registry.get(i) ?? null;
    const state = stateMap.get(i);
    const isM = mortgagedSet.has(i);

    const cellDelta: CellDelta = {
      index: i,
      ownerId,
      ...(state?.level !== undefined ? { level: state.level } : {}),
      ...(state?.isETC ? { isETC: true } : {}),
      ...(isM ? { isMortgaged: true } : {}),
      ...(state?.unbuiltRounds ? { unbuiltRounds: state.unbuiltRounds } : {}),
    };
    cells.push(cellDelta);
  }

  const players: PlayerDelta[] = room.players.map((p) => ({
    id: p.id,
    position: p.position,
    balance: p.balance,
    ...(p.bankrupt ? { bankrupt: true } : {}),
    ...(p.isBot ? { isBot: true } : {}),
    ...(p.overdraftRoundsLeft ? { overdraftRoundsLeft: p.overdraftRoundsLeft } : {}),
    ...(p.auditTurnsLeft > 0 ? { inAudit: true } : { inAudit: false }),
    ...(p.auditTurnsLeft !== undefined ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
    ...(p.skipNextTurn !== undefined ? { skipNextTurn: p.skipNextTurn } : {}),
    ...(p.consecutiveDoubles !== undefined ? { consecutiveDoubles: p.consecutiveDoubles } : {}),
  }));

  let auction: AuctionPayload | null | undefined = undefined;
  if (room.phase === TurnPhase.AuctionPhase && auctions) {
    const session = auctions.get(room.roomCode);
    if (session) {
      const timeRemaining = session.endTime
        ? Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))
        : 0;
      auction = {
        cellIndex: session.cellIndex,
        currentBid: session.highestBid,
        highestBidderId: session.highestBidder ?? null,
        timeRemaining,
        declinedPlayerId: session.declinedPlayerId,
      };
    }
  } else if (auctions) {
    auction = null;
  }

  const currentTurnPlayer = room.players[room.currentPlayerIndex];
  return buildDeltaPayload({
    tick,
    cells,
    players,
    currentPlayerIndex: room.currentPlayerIndex,
    currentTurnPlayerId: currentTurnPlayer?.id,
    dice: room.lastDice,
    ...(auction !== undefined ? { auction } : {}),
  });
}

export function buildDeltaPayload(options: {
  tick: number;
  cells: ReadonlyArray<CellDelta>;
  players?: ReadonlyArray<PlayerDelta>;
  currentPlayerIndex?: number;
  currentTurnPlayerId?: string;
  dice?: readonly [number, number];
  auction?: AuctionPayload | null;
}): DeltaPayload;
export function buildDeltaPayload(options: {
  tick: number;
  room: Room;
  registry: PropertyRegistry;
  stateMap: PropertyStateMap;
  auctions?: Map<string, AuctionSession>;
}): DeltaPayload;
export function buildDeltaPayload(
  tick: number,
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload;
export function buildDeltaPayload(
  tickOrOptions:
    | number
    | {
        tick: number;
        cells: ReadonlyArray<CellDelta>;
        players?: ReadonlyArray<PlayerDelta>;
        currentPlayerIndex?: number;
        currentTurnPlayerId?: string;
        dice?: readonly [number, number];
        auction?: AuctionPayload | null;
      }
    | { tick: number; room: Room; registry: PropertyRegistry; stateMap: PropertyStateMap; auctions?: Map<string, AuctionSession> },
  cells?: ReadonlyArray<CellDelta>,
  players?: ReadonlyArray<PlayerDelta>,
): DeltaPayload {
  if (typeof tickOrOptions === 'object') {
    if ('room' in tickOrOptions) {
      return buildDeltaFromRoom(
        tickOrOptions.room,
        tickOrOptions.registry,
        tickOrOptions.stateMap,
        tickOrOptions.tick,
        tickOrOptions.auctions,
      );
    }
    return {
      tick: tickOrOptions.tick,
      cells: tickOrOptions.cells.map((c) => ({ ...c })),
      ...(tickOrOptions.players !== undefined ? { players: tickOrOptions.players.map((p) => ({ ...p })) } : {}),
      ...(tickOrOptions.currentPlayerIndex !== undefined ? { currentPlayerIndex: tickOrOptions.currentPlayerIndex } : {}),
      ...(tickOrOptions.currentTurnPlayerId !== undefined ? { currentTurnPlayerId: tickOrOptions.currentTurnPlayerId } : {}),
      ...(tickOrOptions.dice !== undefined ? { dice: tickOrOptions.dice } : {}),
      ...(tickOrOptions.auction !== undefined ? { auction: tickOrOptions.auction } : {}),
    };
  }
  return {
    tick: tickOrOptions,
    cells: (cells ?? []).map((c) => ({ ...c })),
    ...(players !== undefined ? { players: players.map((p) => ({ ...p })) } : {}),
  };
}


export class SessionManager {
  private readonly sessions = new Map<string, Session>();
  private lastDelta: DeltaPayload | undefined = undefined;

  addSession(id: string): Session {
    const session: Session = {
      id,
      state:      SessionState.Connected,
      lastPongAt: Date.now(),
    };
    this.sessions.set(id, session);
    return session;
  }

  removeSession(id: string): void {
    this.sessions.delete(id);
  }

  handlePong(id: string): void {
    const session = this.sessions.get(id);
    if (session === undefined) return;
    session.state      = SessionState.Connected;
    session.lastPongAt = Date.now();
  }

  checkHeartbeats(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      const elapsed = now - session.lastPongAt;
      if (elapsed > GRACE_PERIOD_MS) {
        session.state = SessionState.Disconnected;
        this.sessions.delete(id);
      } else if (elapsed > HEARTBEAT_INTERVAL_MS) {
        session.state = SessionState.GracePeriod;
      }
    }
  }

  getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  broadcastDelta(payload: DeltaPayload): void {
    this.lastDelta = {
      tick: payload.tick,
      cells: payload.cells.map((c) => ({ ...c })),
      ...(payload.players !== undefined
        ? { players: payload.players.map((p) => ({ ...p })) }
        : {}),
      ...(payload.currentPlayerIndex !== undefined
        ? { currentPlayerIndex: payload.currentPlayerIndex }
        : {}),
      ...(payload.currentTurnPlayerId !== undefined
        ? { currentTurnPlayerId: payload.currentTurnPlayerId }
        : {}),
      ...(payload.dice !== undefined ? { dice: payload.dice } : {}),
      ...(payload.auction !== undefined ? { auction: payload.auction } : {}),
    };
  }

  getLastDelta(): DeltaPayload | undefined {
    return this.lastDelta;
  }
}

// [UC-IMP142] Pending Trade Manager for Bot-to-Human Trade Negotiation
export interface ResolvedOfferRecord {
  readonly roomCode: string;
  readonly responderPlayerId: string;
  readonly accept: boolean;
  readonly resolvedAt: number;
}

export interface PendingTradeSession {
  readonly offerId: string;
  readonly roomCode: string;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly basePrice: number;
  readonly createdAt: number;
  readonly expiresAt: number;
  readonly offeredCellIndex?: number;
  readonly targetPlayerId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'cancelled';
}

export class PendingTradeManager {
  private readonly sessionsByRoom = new Map<string, PendingTradeSession>();
  private readonly sessionsByOfferId = new Map<string, PendingTradeSession>();
  private readonly recentlyResolvedOffers = new Map<string, ResolvedOfferRecord>();
  private static readonly RESOLVED_TTL_MS = 5000;

  private pruneExpiredResolvedOffers(now: number = Date.now()): void {
    for (const [offerId, record] of this.recentlyResolvedOffers) {
      if (now - record.resolvedAt > PendingTradeManager.RESOLVED_TTL_MS) {
        this.recentlyResolvedOffers.delete(offerId);
        continue;
      }
      break;
    }
  }

  getRecentlyResolved(roomCode: string, playerId: string, offerId: string): ResolvedOfferRecord | undefined {
    this.pruneExpiredResolvedOffers();
    const record = this.recentlyResolvedOffers.get(offerId);
    if (!record) return undefined;
    if (record.roomCode !== roomCode || record.responderPlayerId !== playerId) return undefined;
    return record;
  }

  isRecentlyResolved(roomCode: string, playerId: string, offerId: string, accept: boolean): boolean {
    const record = this.getRecentlyResolved(roomCode, playerId, offerId);
    return record !== undefined && record.accept === accept;
  }

  clearResolvedOffersForRoom(roomCode: string): void {
    for (const [offerId, record] of this.recentlyResolvedOffers) {
      if (record.roomCode === roomCode) {
        this.recentlyResolvedOffers.delete(offerId);
        continue;
      }
    }
  }

  createSession(
    roomCode: string,
    buyerId: string,
    sellerId: string,
    cellIndex: number,
    price: number,
    basePrice: number,
    durationMs: number = 15_000,
    offeredCellIndex?: number,
    targetPlayerId?: string,
  ): PendingTradeSession {
    const now = Date.now();
    const offerId = `trade_${roomCode}_${now}_${Math.random().toString(36).slice(2, 7)}`;
    const session: PendingTradeSession = {
      offerId,
      roomCode,
      buyerId,
      sellerId,
      cellIndex,
      price,
      basePrice,
      createdAt: now,
      expiresAt: now + durationMs,
      status: 'pending',
      ...(offeredCellIndex !== undefined ? { offeredCellIndex } : {}),
      ...(targetPlayerId !== undefined ? { targetPlayerId } : {}),
    };
    this.sessionsByRoom.set(roomCode, session);
    this.sessionsByOfferId.set(offerId, session);
    return session;
  }

  getSession(roomCode: string): PendingTradeSession | undefined {
    return this.sessionsByRoom.get(roomCode);
  }

  getSessionByOfferId(offerId: string): PendingTradeSession | undefined {
    return this.sessionsByOfferId.get(offerId);
  }

  hasSession(roomCode: string): boolean {
    const session = this.sessionsByRoom.get(roomCode);
    return session !== undefined && session.status === 'pending';
  }

  resolveSession(roomCode: string, offerId: string, accept: boolean, responderPlayerId?: string): PendingTradeSession | undefined {
    const session = this.sessionsByOfferId.get(offerId) ?? this.sessionsByRoom.get(roomCode);
    if (!session || session.offerId !== offerId) return undefined;
    if (session.status !== 'pending') return undefined;

    session.status = accept ? 'accepted' : 'rejected';
    this.sessionsByOfferId.delete(session.offerId);
    this.sessionsByRoom.delete(roomCode);

    const now = Date.now();
    this.pruneExpiredResolvedOffers(now);
    const resolvedBy = responderPlayerId ?? session.sellerId;
    this.recentlyResolvedOffers.set(offerId, {
      roomCode,
      responderPlayerId: resolvedBy,
      accept,
      resolvedAt: now,
    });

    return session;
  }

  cancelSession(roomCode: string, playerId?: string): boolean {
    const session = this.sessionsByRoom.get(roomCode);
    if (!session || session.status !== 'pending') return false;

    if (playerId && session.buyerId !== playerId && session.sellerId !== playerId) {
      return false;
    }

    session.status = 'cancelled';
    this.sessionsByOfferId.delete(session.offerId);
    this.sessionsByRoom.delete(roomCode);
    return true;
  }

  checkTimeout(roomCode: string, currentTime: number = Date.now()): { timeout: boolean; session?: PendingTradeSession } {
    const session = this.sessionsByRoom.get(roomCode);
    if (!session || session.status !== 'pending') {
      return { timeout: false };
    }

    if (currentTime >= session.expiresAt) {
      session.status = 'timeout';
      this.sessionsByOfferId.delete(session.offerId);
      this.sessionsByRoom.delete(roomCode);
      return { timeout: true, session };
    }

    return { timeout: false, session };
  }

  clearSession(roomCode: string): void {
    const session = this.sessionsByRoom.get(roomCode);
    if (session) {
      this.sessionsByRoom.delete(roomCode);
      this.sessionsByOfferId.delete(session.offerId);
    }
  }
}

export const pendingTradeManager = new PendingTradeManager();

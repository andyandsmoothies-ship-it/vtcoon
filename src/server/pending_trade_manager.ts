// [UC-IMP142] Pending Trade Manager for Bot-to-Human Trade Negotiation
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
  status: 'pending' | 'accepted' | 'rejected' | 'timeout' | 'cancelled';
}

export class PendingTradeManager {
  private readonly sessionsByRoom = new Map<string, PendingTradeSession>();
  private readonly sessionsByOfferId = new Map<string, PendingTradeSession>();

  createSession(
    roomCode: string,
    buyerId: string,
    sellerId: string,
    cellIndex: number,
    price: number,
    basePrice: number,
    durationMs: number = 15_000,
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

  resolveSession(roomCode: string, offerId: string, accept: boolean): PendingTradeSession | undefined {
    const session = this.sessionsByOfferId.get(offerId) ?? this.sessionsByRoom.get(roomCode);
    if (!session || session.offerId !== offerId) return undefined;
    if (session.status !== 'pending') return undefined;

    session.status = accept ? 'accepted' : 'rejected';
    this.sessionsByRoom.delete(roomCode);
    return session;
  }

  cancelSession(roomCode: string, playerId?: string): boolean {
    const session = this.sessionsByRoom.get(roomCode);
    if (!session || session.status !== 'pending') return false;

    if (playerId && session.buyerId !== playerId && session.sellerId !== playerId) {
      return false;
    }

    session.status = 'cancelled';
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

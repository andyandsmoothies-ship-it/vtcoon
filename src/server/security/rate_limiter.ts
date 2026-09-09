// [UC-SEC-002/MSS] Rate Limiter per Socket — Sliding Window & Chống Gian Lận (Abuse Defense)
import type { WebSocket } from 'ws';

export interface RateLimiterOptions {
  readonly maxRequestsPerWindow?: number; // Mặc định: 10 msg/s
  readonly windowMs?: number;             // Mặc định: 1000ms (1 giây)
  readonly lockoutDurationMs?: number;    // Mặc định: 5000ms (5 giây tạm khóa)
  readonly maxViolations?: number;        // Mặc định: 3 lần vi phạm
  readonly violationWindowMs?: number;    // Mặc định: 60000ms (60 giây)
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly reasonCode?: 'RATE_LIMIT_EXCEEDED' | 'ABUSE_DETECTED';
  readonly kick?: boolean;
}

interface SocketRateRecord {
  timestamps: number[];
  violationTimestamps: number[];
  lockoutUntil: number;
  lockedMessagesCount: number;
  isAbused?: boolean;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly lockoutDurationMs: number;
  private readonly maxViolations: number;
  private readonly violationWindowMs: number;
  private readonly records = new Map<string, SocketRateRecord>();
  private readonly socketIds = new WeakMap<WebSocket, string>();
  private nextSocketId = 1;

  constructor(options?: RateLimiterOptions) {
    this.maxRequests = options?.maxRequestsPerWindow ?? 10;
    this.windowMs = options?.windowMs ?? 1000;
    this.lockoutDurationMs = options?.lockoutDurationMs ?? 5000;
    this.maxViolations = options?.maxViolations ?? 3;
    this.violationWindowMs = options?.violationWindowMs ?? 60000;
  }

  getSocketId(socket: WebSocket | string): string {
    if (typeof socket === 'string') return socket;
    let id = this.socketIds.get(socket);
    if (!id) {
      id = `sock_${this.nextSocketId++}`;
      this.socketIds.set(socket, id);
    }
    return id;
  }

  checkLimit(socket: WebSocket | string, now: number = Date.now()): RateLimitResult {
    const socketId = this.getSocketId(socket);
    let record = this.records.get(socketId);
    if (!record) {
      record = { timestamps: [], violationTimestamps: [], lockoutUntil: 0, lockedMessagesCount: 0 };
      this.records.set(socketId, record);
    }

    if (record.isAbused) {
      return { allowed: false, reasonCode: 'ABUSE_DETECTED', kick: true };
    }

    this.pruneExpiredViolations(record, now);

    if (now < record.lockoutUntil) {
      return this.handleLockedMessage(record, socketId, now);
    }

    record.lockedMessagesCount = 0;
    return this.handleActiveWindow(record, socketId, now);
  }

  private pruneExpiredViolations(record: SocketRateRecord, now: number): void {
    record.violationTimestamps = record.violationTimestamps.filter((t) => now - t < this.violationWindowMs);
  }

  private handleLockedMessage(record: SocketRateRecord, socketId: string, now: number): RateLimitResult {
    record.lockedMessagesCount++;
    if (record.lockedMessagesCount >= this.maxRequests) {
      record.lockedMessagesCount = 0;
      record.violationTimestamps.push(now);
      if (record.violationTimestamps.length >= this.maxViolations) {
        record.isAbused = true;
        this.logAbuse(socketId, now);
        return { allowed: false, reasonCode: 'ABUSE_DETECTED', kick: true };
      }
    }
    return { allowed: false, reasonCode: 'RATE_LIMIT_EXCEEDED', kick: false };
  }

  private handleActiveWindow(record: SocketRateRecord, socketId: string, now: number): RateLimitResult {
    record.timestamps = record.timestamps.filter((t) => now - t < this.windowMs);

    if (record.timestamps.length >= this.maxRequests) {
      record.violationTimestamps.push(now);
      record.lockoutUntil = now + this.lockoutDurationMs;
      const count = record.timestamps.length + 1;
      this.logRateLimitHit(socketId, count, now);

      if (record.violationTimestamps.length >= this.maxViolations) {
        record.isAbused = true;
        this.logAbuse(socketId, now);
        return { allowed: false, reasonCode: 'ABUSE_DETECTED', kick: true };
      }

      return { allowed: false, reasonCode: 'RATE_LIMIT_EXCEEDED', kick: false };
    }

    record.timestamps.push(now);
    return { allowed: true };
  }

  private logRateLimitHit(socketId: string, count: number, timestamp: number): void {
    console.warn(JSON.stringify({
      event: 'RATE_LIMIT_HIT',
      socketId,
      count,
      timestamp,
    }));
  }

  private logAbuse(socketId: string, timestamp: number): void {
    console.warn(JSON.stringify({
      event: 'ABUSE_DETECTED',
      socketId,
      timestamp,
    }));
  }

  cleanup(socket: WebSocket | string): void {
    const socketId = typeof socket === 'string' ? socket : this.socketIds.get(socket);
    if (socketId) {
      this.records.delete(socketId);
    }
  }

  reset(socket: WebSocket | string): void {
    const socketId = this.getSocketId(socket);
    this.records.delete(socketId);
  }
}

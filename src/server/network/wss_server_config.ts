// Configuration interface for WssServer
import type { RoomManager } from '../room_manager.js';
import type { SessionManager } from '../session_manager.js';
import type { IntentMutex } from './intent_mutex.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { RateLimiter, RateLimiterOptions } from '../security/rate_limiter.js';
import type { EnvelopeValidator } from '../security/envelope_validator.js';
import type { IntentGuard } from '../security/intent_guard.js';

export interface WssServerConfig {
  readonly port: number;
  readonly roomManager?: RoomManager;
  readonly sessionManager?: SessionManager;
  readonly intentMutex?: IntentMutex;
  readonly reconnectManager?: ReconnectManager;
  readonly rateLimiter?: RateLimiter;
  readonly envelopeValidator?: EnvelopeValidator;
  readonly intentGuard?: IntentGuard;
  readonly rateLimiterOptions?: RateLimiterOptions;
  readonly gracePeriodMs?: number;
  readonly abandonedTimeoutMs?: number;
  readonly cleanupIntervalMs?: number;
  readonly turnTimeoutMs?: number;
}

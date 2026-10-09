// [IMP-307] WSS Server Lifecycle, Termination, and Heartbeat Operations
import { WebSocket, type WebSocketServer } from 'ws';
import type { SocketRegistry } from './socket_registry.js';
import { type SessionManager, SessionState, HEARTBEAT_INTERVAL_MS } from '../session_manager.js';
import type { ReconnectManager } from './reconnect_manager.js';
import type { TurnOrchestrator } from './turn_orchestrator.js';
import type { TurnWatchdog } from './turn_watchdog.js';
import type { RoomManager } from '../room_manager.js';
import type { DeltaBroadcaster } from './delta_broadcaster.js';
import type { IntentMutex } from './intent_mutex.js';
import type { AdminManager } from './admin_manager.js';
import type { RoomFinishSummary } from '../logging/persistent_room_logger.js';
import type { RoomCleanupScheduler } from '../room_cleanup_scheduler.js';
import type { WsServerMessage } from './network_types.js';

export interface HeartbeatSweepDeps {
  readonly sockets: SocketRegistry;
  readonly sessions: SessionManager;
  readonly reconnects: ReconnectManager;
  readonly sendSafe: (socket: WebSocket, msg: WsServerMessage) => void;
}

export interface RoomCloserDeps {
  readonly closingRooms: Set<string>;
  readonly turnOrchestrator: TurnOrchestrator;
  readonly turnWatchdog: TurnWatchdog;
  readonly sockets: SocketRegistry;
  readonly reconnects: ReconnectManager;
  readonly rooms: RoomManager;
  readonly sessions: SessionManager;
  readonly broadcaster: DeltaBroadcaster;
  readonly intentMutex: IntentMutex;
  readonly adminManager: AdminManager;
}

export interface GameOverSummaryDeps {
  readonly rooms: RoomManager;
  readonly broadcast: (roomCode: string, msg: WsServerMessage) => void;
  readonly adminManager: AdminManager;
  readonly closeRoom: (roomCode: string, summary?: RoomFinishSummary) => void;
}

export interface ShutdownServerDeps {
  readonly heartbeatTimer: ReturnType<typeof setInterval>;
  readonly cleanupScheduler: RoomCleanupScheduler;
  readonly turnWatchdog: TurnWatchdog;
  readonly reconnects: ReconnectManager;
  readonly rooms: RoomManager;
  readonly turnOrchestrator: TurnOrchestrator;
  readonly wss: WebSocketServer;
}

export function performHeartbeatSweep(deps: HeartbeatSweepDeps): void {
  for (const [s, info] of deps.sockets.getAllBoundSockets()) {
    deps.sendSafe(s, { type: 'PING', roomCode: info.roomCode });
  }
  deps.sessions.checkHeartbeats();
  for (const [sock, info] of deps.sockets.getAllBoundSockets()) {
    const s = deps.sessions.getSession(info.playerId);
    if (s && s.state === SessionState.GracePeriod) {
      if (sock.readyState === WebSocket.OPEN) {
        const elapsed = Date.now() - s.lastPongAt;
        if (elapsed > 2 * HEARTBEAT_INTERVAL_MS) {
          try {
            sock.close(1001, 'HEARTBEAT_TIMEOUT');
          } catch {
            /* safe-ignore */
          }
        }
      } else if (!deps.reconnects.isPlayerInGrace(info.roomCode, info.playerId)) {
        deps.reconnects.startGracePeriod(info.roomCode, info.playerId);
      }
    }
  }
}

export function closeRoomWithCleanup(deps: RoomCloserDeps, roomCode: string, summary?: RoomFinishSummary): void {
  if (deps.closingRooms.has(roomCode)) return;
  deps.closingRooms.add(roomCode);
  try {
    deps.turnOrchestrator.destroyRoom(roomCode);
    deps.turnWatchdog.clearRoom(roomCode);
    deps.sockets.clearRoomSockets(roomCode);
    deps.reconnects.clearRoom(roomCode);
    const room = deps.rooms.getRoom(roomCode);
    if (room) {
      for (const p of room.players) deps.sessions.removeSession(p.id);
    }
    const playerCount = room?.players.length ?? 1;
    deps.broadcaster.clearRoom(roomCode);
    deps.intentMutex.clear(roomCode);
    deps.rooms.closeRoom(roomCode);
    deps.adminManager.handleRoomClosed(roomCode, {
      status: summary?.status ?? 'TERMINATED',
      winner: summary?.winner,
      endTime: summary?.endTime ?? Date.now(),
      playerCount: summary?.playerCount ?? playerCount,
    });
  } finally {
    deps.closingRooms.delete(roomCode);
  }
}

export function broadcastGameOverSummary(
  deps: GameOverSummaryDeps,
  roomCode: string,
  leaderboard?: Array<{ id: string; netWorth: number }>,
): void {
  const rankings = leaderboard ?? deps.rooms.getRankings(roomCode);
  deps.broadcast(roomCode, { type: 'GAME_OVER', roomCode, leaderboard: rankings });
  deps.adminManager.recordRoomEvent(roomCode, {
    source: 'SYSTEM',
    action: 'GAME_OVER_SUMMARY',
    payloadSummary: `Ván đấu kết thúc. Người thắng: ${rankings[0]?.id ?? 'Không xác định'}`,
  });
  deps.closeRoom(roomCode, { status: 'FINISHED', winner: rankings[0]?.id });
}

export function shutdownWssServer(deps: ShutdownServerDeps): Promise<void> {
  clearInterval(deps.heartbeatTimer);
  deps.cleanupScheduler.stop();
  deps.turnWatchdog.stop();
  deps.reconnects.clear();
  for (const rc of deps.rooms.getAllRoomCodes()) {
    deps.turnOrchestrator.destroyRoom(rc);
    deps.rooms.clearRoomTimers(rc);
  }
  for (const client of deps.wss.clients) {
    try {
      client.close(1001, 'SERVER_SHUTDOWN');
    } catch {
      /* safe-ignore */
    }
  }
  return new Promise((resolve, reject) => {
    deps.wss.close((err) => {
      if (err && (err.message?.includes('not running') || err.message?.includes('closed'))) {
        resolve();
      } else if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// [IMP-307] Living Contract Tests: WSS Server Lifecycle, Termination, and Heartbeat Sweep
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocket, WebSocketServer } from 'ws';
import {
  performHeartbeatSweep,
  closeRoomWithCleanup,
  broadcastGameOverSummary,
  shutdownWssServer,
  type HeartbeatSweepDeps,
  type RoomCloserDeps,
  type GameOverSummaryDeps,
  type ShutdownServerDeps,
} from '../../src/server/network/wss_server_lifecycle.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { SessionManager, SessionState } from '../../src/server/session_manager.js';
import { SocketRegistry } from '../../src/server/network/socket_registry.js';
import { IntentMutex } from '../../src/server/network/intent_mutex.js';
import { TurnOrchestrator } from '../../src/server/network/turn_orchestrator.js';
import { TurnWatchdog } from '../../src/server/network/turn_watchdog.js';
import { DeltaBroadcaster } from '../../src/server/network/delta_broadcaster.js';
import { AdminManager } from '../../src/server/network/admin_manager.js';
import { ReconnectManager } from '../../src/server/network/reconnect_manager.js';
import { RoomCleanupScheduler } from '../../src/server/room_cleanup_scheduler.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

async function createLiveSocketPair(): Promise<{
  wss: WebSocketServer;
  serverSocket: WebSocket;
  clientSocket: WebSocket;
  cleanup: () => Promise<void>;
}> {
  const wss = new WebSocketServer({ port: 0 });
  await new Promise<void>((resolve) => wss.once('listening', resolve));
  const addr = wss.address();
  const port = typeof addr === 'object' && addr !== null ? addr.port : 0;

  const [serverSocket, clientSocket] = await Promise.all([
    new Promise<WebSocket>((resolve) => wss.once('connection', resolve)),
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}`);
      ws.once('open', () => resolve(ws));
      ws.once('error', reject);
    }),
  ]);

  const cleanup = async () => {
    try { clientSocket.terminate(); } catch {}
    try { serverSocket.terminate(); } catch {}
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  };

  return { wss, serverSocket, clientSocket, cleanup };
}

describe('Station 1 Contract Tests: WssServerLifecycle', () => {
  let rooms: RoomManager;
  let sessions: SessionManager;
  let sockets: SocketRegistry;
  let intentMutex: IntentMutex;
  let broadcaster: DeltaBroadcaster;
  let turnOrchestrator: TurnOrchestrator;
  let turnWatchdog: TurnWatchdog;
  let adminManager: AdminManager;
  let reconnects: ReconnectManager;
  let roomCode: string;

  beforeEach(() => {
    rooms = new RoomManager(12345);
    sessions = new SessionManager();
    sockets = new SocketRegistry();
    intentMutex = new IntentMutex();
    broadcaster = new DeltaBroadcaster(rooms, sessions, () => {});
    turnOrchestrator = new TurnOrchestrator({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: () => {},
    });
    turnWatchdog = new TurnWatchdog({
      rooms,
      intentMutex,
      broadcaster,
      onGameOver: () => {},
      onScheduleNextTurn: () => {},
    });
    adminManager = new AdminManager({
      roomManager: rooms,
    });
    reconnects = new ReconnectManager({
      rooms,
      sessions,
      broadcaster,
      broadcast: () => {},
    });

    const room = rooms.createRoom('p1');
    roomCode = room.roomCode;
    rooms.joinRoom(roomCode, 'p2');
    sessions.addSession('p1');
    sessions.addSession('p2');
  });

  it('TC-WLC.01 [UC-WLC/MSS] closeRoomWithCleanup systematically destroys room resources', () => {
    const closingRooms = new Set<string>();
    const deps: RoomCloserDeps = {
      closingRooms,
      turnOrchestrator,
      turnWatchdog,
      sockets,
      reconnects,
      rooms,
      sessions,
      broadcaster,
      intentMutex,
      adminManager,
    };

    closeRoomWithCleanup(deps, roomCode, { status: 'TERMINATED' });

    expect(rooms.getRoom(roomCode)).toBeUndefined();
    expect(sessions.getSession('p1')).toBeUndefined();
    expect(sessions.getSession('p2')).toBeUndefined();
    expect(closingRooms.has(roomCode)).toBe(false);
  });

  it('TC-WLC.02 [UC-WLC/A1] closeRoomWithCleanup prevents re-entrancy when room is already closing', () => {
    const closingRooms = new Set<string>([roomCode]);
    const destroySpy = vi.spyOn(turnOrchestrator, 'destroyRoom');
    const deps: RoomCloserDeps = {
      closingRooms,
      turnOrchestrator,
      turnWatchdog,
      sockets,
      reconnects,
      rooms,
      sessions,
      broadcaster,
      intentMutex,
      adminManager,
    };

    closeRoomWithCleanup(deps, roomCode);

    expect(destroySpy).not.toHaveBeenCalled();
    expect(rooms.getRoom(roomCode)).toBeDefined();
  });

  it('TC-WLC.03 [UC-WLC/MSS] closeRoomWithCleanup notifies adminManager with provided summary', () => {
    const closingRooms = new Set<string>();
    const adminSpy = vi.spyOn(adminManager, 'handleRoomClosed');
    const deps: RoomCloserDeps = {
      closingRooms,
      turnOrchestrator,
      turnWatchdog,
      sockets,
      reconnects,
      rooms,
      sessions,
      broadcaster,
      intentMutex,
      adminManager,
    };

    closeRoomWithCleanup(deps, roomCode, { status: 'FINISHED', winner: 'p1' });

    expect(adminSpy).toHaveBeenCalledWith(
      roomCode,
      expect.objectContaining({ status: 'FINISHED', winner: 'p1' }),
    );
  });

  it('TC-WLC.04 [UC-WLC/MSS] closeRoomWithCleanup defaults status to TERMINATED without summary', () => {
    const closingRooms = new Set<string>();
    const adminSpy = vi.spyOn(adminManager, 'handleRoomClosed');
    const deps: RoomCloserDeps = {
      closingRooms,
      turnOrchestrator,
      turnWatchdog,
      sockets,
      reconnects,
      rooms,
      sessions,
      broadcaster,
      intentMutex,
      adminManager,
    };

    closeRoomWithCleanup(deps, roomCode);

    expect(adminSpy).toHaveBeenCalledWith(
      roomCode,
      expect.objectContaining({ status: 'TERMINATED' }),
    );
  });

  it('TC-WLC.05 [UC-WLC/MSS] broadcastGameOverSummary broadcasts GAME_OVER message and winner', () => {
    const broadcastMessages: WsServerMessage[] = [];
    const closeSpy = vi.fn();
    const deps: GameOverSummaryDeps = {
      rooms,
      broadcast: (_rc, msg) => broadcastMessages.push(msg),
      adminManager,
      closeRoom: closeSpy,
    };

    broadcastGameOverSummary(deps, roomCode, [{ id: 'p1', netWorth: 5000 }]);

    expect(broadcastMessages).toHaveLength(1);
    expect(broadcastMessages[0]?.type).toBe('GAME_OVER');
    expect(closeSpy).toHaveBeenCalledWith(roomCode, { status: 'FINISHED', winner: 'p1' });
  });

  it('TC-WLC.06 [UC-WLC/MSS] broadcastGameOverSummary falls back to room rankings when omitted', () => {
    const broadcastMessages: WsServerMessage[] = [];
    const closeSpy = vi.fn();
    const deps: GameOverSummaryDeps = {
      rooms,
      broadcast: (_rc, msg) => broadcastMessages.push(msg),
      adminManager,
      closeRoom: closeSpy,
    };

    broadcastGameOverSummary(deps, roomCode);

    expect(broadcastMessages).toHaveLength(1);
    expect(closeSpy).toHaveBeenCalled();
  });

  it('TC-WLC.07 [UC-WLC/MSS] performHeartbeatSweep dispatches PING to all bound sockets', async () => {
    const pair = await createLiveSocketPair();
    try {
      const sentMessages: WsServerMessage[] = [];
      sockets.bind(roomCode, 'p1', pair.serverSocket);

      const deps: HeartbeatSweepDeps = {
        sockets,
        sessions,
        reconnects,
        sendSafe: (_s, msg) => sentMessages.push(msg),
      };

      performHeartbeatSweep(deps);

      expect(sentMessages).toHaveLength(1);
      expect(sentMessages[0]?.type).toBe('PING');
    } finally {
      await pair.cleanup();
    }
  });

  it('TC-WLC.08 [UC-WLC/MSS] performHeartbeatSweep checks heartbeats on session manager', () => {
    const checkSpy = vi.spyOn(sessions, 'checkHeartbeats');
    const deps: HeartbeatSweepDeps = {
      sockets,
      sessions,
      reconnects,
      sendSafe: vi.fn(),
    };

    performHeartbeatSweep(deps);

    expect(checkSpy).toHaveBeenCalled();
  });

  it('TC-WLC.09 [UC-WLC/MSS] performHeartbeatSweep starts grace period when socket is not open', async () => {
    const pair = await createLiveSocketPair();
    try {
      sockets.bind(roomCode, 'p1', pair.serverSocket);
      pair.serverSocket.terminate();

      const session = sessions.getSession('p1');
      if (session) {
        session.state = SessionState.GracePeriod;
      }

      const startGraceSpy = vi.spyOn(reconnects, 'startGracePeriod');
      const deps: HeartbeatSweepDeps = {
        sockets,
        sessions,
        reconnects,
        sendSafe: vi.fn(),
      };

      performHeartbeatSweep(deps);

      expect(startGraceSpy).toHaveBeenCalledWith(roomCode, 'p1');
    } finally {
      await pair.cleanup();
    }
  });

  it('TC-WLC.10 [UC-WLC/MSS] shutdownWssServer cleans up schedulers and closes wss server', async () => {
    const timer = setInterval(() => {}, 10000);
    const cleanupScheduler = new RoomCleanupScheduler({
      roomManager: rooms,
      timeoutMs: 60000,
      intervalMs: 30000,
      onCleanup: () => {},
    });
    const stopCleanupSpy = vi.spyOn(cleanupScheduler, 'stop');
    const stopWatchdogSpy = vi.spyOn(turnWatchdog, 'stop');
    const clearReconnectsSpy = vi.spyOn(reconnects, 'clear');

    const pair = await createLiveSocketPair();
    try {
      const deps: ShutdownServerDeps = {
        heartbeatTimer: timer,
        cleanupScheduler,
        turnWatchdog,
        reconnects,
        rooms,
        turnOrchestrator,
        wss: pair.wss,
      };

      await shutdownWssServer(deps);

      expect(stopCleanupSpy).toHaveBeenCalled();
      expect(stopWatchdogSpy).toHaveBeenCalled();
      expect(clearReconnectsSpy).toHaveBeenCalled();
    } finally {
      clearInterval(timer);
      await pair.cleanup();
    }
  });
});

// [TC-224.01/MSS..TC-224.16/MSS][UC-IMP224] IMP-224: Auto-Solvency & Corporate Bond Wire Envelope Contract Test Suite
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WebSocket } from 'ws';
import * as EnvelopeValidatorModule from '../../src/server/security/envelope_validator.js';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator.js';
import { IntentGuard } from '../../src/server/security/intent_guard.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { WssServer } from '../../src/server/network/wss_server.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import { TurnPhase } from '../../src/domain/room.js';
import type { WsServerMessage } from '../../src/server/network/network_types.js';

function getServerPort(server: WssServer): number {
  const wss = (server as any).wss;
  const addr = wss.address();
  if (typeof addr === 'object' && addr !== null && 'port' in addr) {
    return addr.port;
  }
  throw new Error('Server address/port is not available');
}

function openClientSocket(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.once('open', () => resolve(ws));
    ws.once('error', reject);
  });
}

function closeSocket(ws: WebSocket): Promise<void> {
  if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    ws.once('close', () => resolve());
    ws.close();
  });
}

const PRE_EXISTING_21_PAYLOADS: Array<{ type: 'INTENT'; roomCode: string; playerId: string; intent: Record<string, unknown> }> = [
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_UPGRADE', cellIndex: 1 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_UPGRADE_UTILITY', cellIndex: 12 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_DOWNGRADE', cellIndex: 1 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_MORTGAGE', cellIndex: 1 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_REDEEM', cellIndex: 1 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_ROLL' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_BUY' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_BUY_PROPERTY' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_DECLINE' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_BID', amount: 500 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_AUCTION_PASS' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_UPGRADE_ETC' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_TRADE_OFFER', sellerId: 'player_1', buyerId: 'player_2', cellIndex: 1, price: 500 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_RESPOND_TRADE_OFFER', offerId: 'offer_test_1', accept: true } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_END_TURN' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_INVEST', stake: 100 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_SKIP' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_BAIL_OUT' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_BANKRUPTCY' } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_EXECUTE_COMPULSORY_BUYOUT', cellIndex: 1 } },
  { type: 'INTENT', roomCode: 'VT8888', playerId: 'player_1', intent: { type: 'INTENT_DECLINE_COMPULSORY_BUYOUT' } },
];

const EXPECTED_24_INTENTS = [
  'INTENT_ROLL', 'INTENT_BUY', 'INTENT_BUY_PROPERTY', 'INTENT_DECLINE', 'INTENT_BID',
  'INTENT_AUCTION_PASS', 'INTENT_UPGRADE', 'INTENT_UPGRADE_ETC', 'INTENT_UPGRADE_UTILITY',
  'INTENT_DOWNGRADE', 'INTENT_MORTGAGE', 'INTENT_REDEEM', 'INTENT_TRADE_OFFER',
  'INTENT_RESPOND_TRADE_OFFER', 'INTENT_END_TURN', 'INTENT_INVEST', 'INTENT_SKIP',
  'INTENT_BAIL_OUT', 'INTENT_BANKRUPTCY', 'INTENT_EXECUTE_COMPULSORY_BUYOUT',
  'INTENT_DECLINE_COMPULSORY_BUYOUT', 'INTENT_AUTO_SOLVENCY', 'INTENT_ISSUE_BOND',
  'INTENT_REPAY_BOND',
] as const;

describe('[TC-224.01..16/MSS][UC-IMP224] Auto-Solvency & Corporate Bond Wire Envelope Suite', () => {
  let activeServer: WssServer | undefined;
  let activeSocket: WebSocket | undefined;

  afterEach(async () => {
    if (activeSocket) {
      await closeSocket(activeSocket);
      activeSocket = undefined;
    }
    if (activeServer) {
      await activeServer.close();
      activeServer = undefined;
    }
    vi.restoreAllMocks();
  });

  // =========================================================================
  // FACET 1: Auto-Solvency Intent Envelope Validation (4 tests)
  // =========================================================================
  describe('Facet 1: Auto-Solvency Intent Envelope Validation', () => {
    it('[TC-224.01/MSS][UC-IMP224][Facet-1/AutoSolvencyValid] EnvelopeValidator chấp thuận gói tin INTENT_AUTO_SOLVENCY hợp lệ với success: true', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result.success).toBe(true);
    });

    it('[TC-224.02/MSS][UC-IMP224][Facet-1/AutoSolvencyStructure] Kết quả validate giữ nguyên vẹn roomCode VT8888, playerId player_1 và intent.type INTENT_AUTO_SOLVENCY', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result.success).toBe(true);
      if (result.success && result.message.type === 'INTENT') {
        expect(result.message.roomCode).toBe('VT8888');
        expect(result.message.playerId).toBe('player_1');
        expect(result.message.intent.type).toBe('INTENT_AUTO_SOLVENCY');
      }
    });

    it('[TC-224.03/MSS][UC-IMP224][Facet-1/MissingRoomCodeRejected] Gói tin INTENT_AUTO_SOLVENCY thiếu roomCode bị từ chối với INVALID_ENVELOPE', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        playerId: 'player_1',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result).toEqual({ success: false, reasonCode: 'INVALID_ENVELOPE' });
    });

    it('[TC-224.04/MSS][UC-IMP224][Facet-1/MissingPlayerIdRejected] Gói tin INTENT_AUTO_SOLVENCY thiếu playerId bị từ chối với INVALID_ENVELOPE', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result).toEqual({ success: false, reasonCode: 'INVALID_ENVELOPE' });
    });
  });

  // =========================================================================
  // FACET 2: Corporate Bond Wire Protocol Parity (5 tests)
  // =========================================================================
  describe('Facet 2: Corporate Bond Wire Protocol Parity', () => {
    it('[TC-224.05/MSS][UC-IMP224][Facet-2/IssueBondNoTranche] EnvelopeValidator chấp thuận INTENT_ISSUE_BOND không trancheId và dispatch phát hành thành công hợp đồng trái phiếu', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_ISSUE_BOND' },
      };

      const valRes = validator.validateEnvelope(payload);
      expect(valRes.success).toBe(true);

      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;
      const p1 = room.players[0]!;
      p1.balance = -500;
      roomMgr.getRegistry(room.roomCode)?.set(5, 'player_1');
      roomMgr.getRegistry(room.roomCode)?.set(15, 'player_1');

      const dispatchRes = roomMgr.handlePlayerIntent(room.roomCode, 'player_1', { type: 'INTENT_ISSUE_BOND' });
      expect(dispatchRes.success).toBe(true);
      expect(p1.bondContract?.isActive).toBe(true);
      expect(p1.bondContract?.principal).toBeGreaterThan(0);
    });

    it('[TC-224.06/MSS][UC-IMP224][Facet-2/IssueBondWithValidTranche] EnvelopeValidator chấp thuận INTENT_ISSUE_BOND với trancheId hợp lệ BondTrancheId.ALL_IN', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_ISSUE_BOND', trancheId: BondTrancheId.ALL_IN },
      };

      const result = validator.validateEnvelope(payload);
      expect(result.success).toBe(true);
    });

    it('[TC-224.07a/MSS][UC-IMP224][Facet-2/IssueBondInvalidStringTranche] INTENT_ISSUE_BOND với trancheId là chuỗi không hợp lệ bị từ chối với INVALID_ENVELOPE', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_ISSUE_BOND', trancheId: 'UNKNOWN_TRANCHE' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result).toEqual({ success: false, reasonCode: 'INVALID_ENVELOPE' });
    });

    it('[TC-224.07b/MSS][UC-IMP224][Facet-2/IssueBondNegativeNumberTranche] INTENT_ISSUE_BOND với trancheId là số âm -1 bị từ chối với INVALID_VALUE bởi number sanity guard', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_ISSUE_BOND', trancheId: -1 },
      };

      const result = validator.validateEnvelope(payload);
      expect(result).toEqual({ success: false, reasonCode: 'INVALID_VALUE' });
    });

    it('[TC-224.08/MSS][UC-IMP224][Facet-2/RepayBondValid] EnvelopeValidator chấp thuận INTENT_REPAY_BOND hợp lệ', () => {
      const validator = new EnvelopeValidator();
      const payload = {
        type: 'INTENT',
        roomCode: 'VT8888',
        playerId: 'player_1',
        intent: { type: 'INTENT_REPAY_BOND' },
      };

      const result = validator.validateEnvelope(payload);
      expect(result.success).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: Out-of-Turn & Role Symmetry Defense (4 tests)
  // =========================================================================
  describe('Facet 3: Out-of-Turn & Role Symmetry Defense', () => {
    it('[TC-224.09/MSS][UC-IMP224][Facet-3/IntentGuardCurrentTurn] IntentGuard cho phép INTENT_AUTO_SOLVENCY khi người chơi là current turn trong InsolvencyPhase', () => {
      const guard = new IntentGuard();
      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const guardRes = guard.validate(room, 'player_1', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(guardRes.allowed).toBe(true);
      expect(guardRes.playerId).toBe('player_1');
    });

    it('[TC-224.10/MSS][UC-IMP224][Facet-3/IntentGuardOutOfTurn] IntentGuard từ chối INTENT_AUTO_SOLVENCY với OUT_OF_TURN nếu người chơi không phải current turn', () => {
      const guard = new IntentGuard();
      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const guardRes = guard.validate(room, 'player_2', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(guardRes.allowed).toBe(false);
      expect(guardRes.reasonCode).toBe('OUT_OF_TURN');
    });

    it('[TC-224.11a/MSS][UC-IMP224][Facet-3/IntentGuardBankrupt] IntentGuard từ chối INTENT_AUTO_SOLVENCY với OUT_OF_TURN nếu người chơi đã phá sản', () => {
      const guard = new IntentGuard();
      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;
      room.players[0]!.bankrupt = true;

      const guardRes = guard.validate(room, 'player_1', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(guardRes.allowed).toBe(false);
      expect(guardRes.reasonCode).toBe('OUT_OF_TURN');
    });

    it('[TC-224.11b/MSS][UC-IMP224][Facet-3/RepayBondInsolvencyReject] Trong InsolvencyPhase, người chơi gửi INTENT_REPAY_BOND qua dispatchPlayerIntent bị từ chối với INVALID_PHASE', () => {
      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;

      const res = dispatchPlayerIntent(roomMgr, room.roomCode, 'player_1', { type: 'INTENT_REPAY_BOND' });
      expect(res.success).toBe(false);
      expect(res.reason).toBe('INVALID_PHASE');
    });
  });

  // =========================================================================
  // FACET 4: End-to-End WebSocket Dispatch Integration (3 tests)
  // Dynamic Ephemeral Port: 0
  // =========================================================================
  describe('Facet 4: End-to-End WebSocket Dispatch Integration', () => {
    it('[TC-224.12/MSS][UC-IMP224][Facet-4/WssConnectionAutoSolvency] Mở WebSocket thật tới WssServer (port 0), gửi raw JSON INTENT_AUTO_SOLVENCY trong InsolvencyPhase, không nhận lại lỗi INVALID_INTENT', async () => {
      activeServer = new WssServer({ port: 0 });
      const port = getServerPort(activeServer);

      const roomMgr = activeServer.getRoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;
      const p1 = room.players[0]!;
      p1.balance = -300;
      roomMgr.getRegistry(room.roomCode)?.set(1, 'player_1');

      activeSocket = await openClientSocket(port);
      const incomingErrors: WsServerMessage[] = [];
      activeSocket.on('message', (data) => {
        try {
          const parsed = JSON.parse(data.toString()) as WsServerMessage;
          if (parsed.type === 'ERROR') incomingErrors.push(parsed);
        } catch { /* safe-ignore */ }
      });

      activeSocket.send(JSON.stringify({
        type: 'INTENT',
        roomCode: room.roomCode,
        playerId: 'player_1',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      }));

      await new Promise((resolve) => setTimeout(resolve, 80));

      const invalidIntentErr = incomingErrors.find((m) => (m as any).reasonCode === 'INVALID_INTENT');
      expect(invalidIntentErr).toBeUndefined();
    });

    it('[TC-224.13/MSS][UC-IMP224][Facet-4/AutoSolvencyExecutionRecovery] Khi người chơi âm tiền trong InsolvencyPhase, gửi INTENT_AUTO_SOLVENCY kích hoạt thành công hạ cấp/thế chấp và đưa room.phase sang PropertyManagement', () => {
      const roomMgr = new RoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;
      const p1 = room.players[0]!;
      p1.balance = -200;
      roomMgr.getRegistry(room.roomCode)?.set(1, 'player_1');

      const res = dispatchPlayerIntent(roomMgr, room.roomCode, 'player_1', { type: 'INTENT_AUTO_SOLVENCY' });
      expect(res.success).toBe(true);
      expect(p1.balance).toBeGreaterThanOrEqual(0);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-224.14/MSS][UC-IMP224][Facet-4/DeltaBroadcastTriggered] Sau khi xử lý INTENT_AUTO_SOLVENCY thành công, DeltaBroadcaster gửi delta cập nhật số dư mới và trạng thái tài sản đến client', async () => {
      activeServer = new WssServer({ port: 0 });
      const port = getServerPort(activeServer);

      const roomMgr = activeServer.getRoomManager();
      const room = roomMgr.createRoom('player_1');
      roomMgr.joinRoom(room.roomCode, 'player_2');
      roomMgr.startGame(room.roomCode);
      room.phase = TurnPhase.InsolvencyPhase;
      room.currentPlayerIndex = 0;
      const p1 = room.players[0]!;
      p1.balance = -200;
      roomMgr.getRegistry(room.roomCode)?.set(1, 'player_1');

      const broadcastSpy = vi.spyOn(activeServer.getDeltaBroadcaster(), 'broadcastRoomDelta');

      activeSocket = await openClientSocket(port);
      activeSocket.send(JSON.stringify({
        type: 'INTENT',
        roomCode: room.roomCode,
        playerId: 'player_1',
        intent: { type: 'INTENT_AUTO_SOLVENCY' },
      }));

      await new Promise((resolve) => setTimeout(resolve, 80));

      expect(broadcastSpy).toHaveBeenCalledWith(room.roomCode);
    });
  });

  // =========================================================================
  // FACET 5: Bidirectional Closed-Loop Parity & Regression (2 tests)
  // =========================================================================
  describe('Facet 5: Bidirectional Closed-Loop Parity & Regression', () => {
    it('[TC-224.15/MSS][UC-IMP224][Facet-5/PreExistingIntentsIntegrity] 21 intents trước đó (INTENT_ROLL, INTENT_BUY, INTENT_UPGRADE...) vẫn được EnvelopeValidator chấp thuận 100%', () => {
      const validator = new EnvelopeValidator();
      const rejectedIntents = PRE_EXISTING_21_PAYLOADS
        .filter((payload) => !validator.validateEnvelope(payload).success)
        .map((payload) => payload.intent.type);

      expect(PRE_EXISTING_21_PAYLOADS).toHaveLength(21);
      expect(rejectedIntents).toEqual([]);
    });

    it('[TC-224.16/MSS][UC-IMP224][Facet-5/ClosedLoopIntentParity] Đối soát 2 chiều chuẩn xác danh sách 24 intents: EXPECTED_24_INTENTS có mặt trong VALID_INTENTS, kích thước 24, và 100% được dispatchPlayerIntent hỗ trợ', () => {
      const exportedValidIntents = (EnvelopeValidatorModule as { VALID_INTENTS?: Set<string> }).VALID_INTENTS;

      expect(exportedValidIntents).toBeDefined();
      expect(exportedValidIntents?.size).toBe(24);

      const missingInValidator = EXPECTED_24_INTENTS.filter((type) => !exportedValidIntents?.has(type));
      expect(missingInValidator).toEqual([]);

      const roomMgr = new RoomManager();
      const unsupportedInDispatch = Array.from(exportedValidIntents ?? []).filter((type) => {
        const dummyIntent = {
          type,
          cellIndex: 0,
          amount: 0,
          stake: 0,
          sellerId: 'player_1',
          buyerId: 'player_2',
          price: 0,
          offerId: 'offer_1',
          accept: true,
        };
        const res = dispatchPlayerIntent(roomMgr, 'NON_EXISTENT_ROOM', 'player_1', dummyIntent as any);
        return res.reason === 'INVALID_INTENT';
      });
      expect(unsupportedInDispatch).toEqual([]);
    });
  });
});

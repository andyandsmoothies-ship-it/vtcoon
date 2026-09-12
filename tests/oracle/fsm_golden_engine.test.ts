// [UC-GAME-001..055/ORACLE] Oracle Goldens for FSM Game Engine Determinism
// Traceability: ADR-0001 (FSM Architecture), PRNG Seed Reproducibility, DeltaPayload Sync
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { RoomManager } from '../../src/server/room_manager';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';

export interface FsmGoldenSnapshot {
  readonly stepIndex: number;
  readonly event: string;
  readonly actor: string;
  readonly tick: number;
  readonly turnPhase: string;
  readonly currentPlayerIndex: number;
  readonly currentTurnPlayerId?: string;
  readonly dice?: readonly [number, number];
  readonly players: Array<{
    readonly id: string;
    readonly position: number;
    readonly balance: number;
    readonly bankrupt?: boolean;
    readonly inAudit?: boolean;
    readonly auditTurnsLeft?: number;
  }>;
  readonly auction?: {
    readonly cellIndex: number;
    readonly currentBid: number;
    readonly highestBidderId: string | null;
  } | null;
  readonly ownedCells: Array<{
    readonly index: number;
    readonly ownerId: string | null;
    readonly level?: number;
    readonly isETC?: boolean;
    readonly isMortgaged?: boolean;
  }>;
}

export function sanitizeDeltaToSnapshot(
  stepIndex: number,
  event: string,
  actor: string,
  delta: DeltaPayload,
): FsmGoldenSnapshot {
  return {
    stepIndex,
    event,
    actor,
    tick: delta.tick,
    turnPhase: delta.turnPhase ?? 'UNKNOWN',
    currentPlayerIndex: delta.currentPlayerIndex ?? 0,
    currentTurnPlayerId: delta.currentTurnPlayerId,
    dice: delta.dice,
    players: (delta.players ?? []).map((p) => ({
      id: p.id,
      position: p.position,
      balance: p.balance,
      ...(p.bankrupt ? { bankrupt: true } : {}),
      ...(p.inAudit ? { inAudit: true } : {}),
      ...(p.auditTurnsLeft ? { auditTurnsLeft: p.auditTurnsLeft } : {}),
    })),
    auction: delta.auction
      ? {
          cellIndex: delta.auction.cellIndex,
          currentBid: delta.auction.currentBid,
          highestBidderId: delta.auction.highestBidderId,
        }
      : delta.auction === null
      ? null
      : undefined,
    ownedCells: delta.cells
      .filter((c) => c.ownerId !== null && c.ownerId !== undefined)
      .map((c) => ({
        index: c.index,
        ownerId: c.ownerId ?? null,
        ...(c.level !== undefined ? { level: c.level } : {}),
        ...(c.isETC ? { isETC: true } : {}),
        ...(c.isMortgaged ? { isMortgaged: true } : {}),
      })),
  };
}

export function runDeterministicFsmSimulation(seed: number): FsmGoldenSnapshot[] {
  const mgr = new RoomManager(seed);
  const room = mgr.createRoom('P1');
  mgr.joinRoom(room.roomCode, 'P2');
  mgr.startGame(room.roomCode);

  let tick = 0;
  const snapshots: FsmGoldenSnapshot[] = [];

  const record = (event: string, actor: string) => {
    tick += 1;
    const delta = mgr.createDelta(room.roomCode, tick);
    if (!delta) throw new Error(`Cannot extract delta at tick ${tick}`);
    snapshots.push(sanitizeDeltaToSnapshot(snapshots.length, event, actor, delta));
  };

  // Step 0: Khởi tạo game
  record('GAME_STARTED', 'SYSTEM');

  // Step 1: P1 tung xúc xắc (seed 42 bắt đầu từ ô 34 -> tổng 7 -> ô 1 Cần Thơ)
  room.players[0]!.position = 34;
  mgr.handleRollDice(room.roomCode, 'P1');
  record('P1_ROLL_DICE', 'P1');

  // Step 2: P1 mua ô 1 (Cần Thơ)
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  record('P1_BUY_CELL_1', 'P1');

  // Step 3: P1 kết thúc lượt -> chuyển sang P2
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  record('P1_END_TURN', 'P1');

  // Step 4: P2 tung xúc xắc (bắt đầu từ 30 -> tổng 11 -> ô 1 trả phí thuê cho P1)
  room.players[1]!.position = 30;
  mgr.handleRollDice(room.roomCode, 'P2');
  record('P2_ROLL_DICE_PAY_RENT', 'P2');

  // Step 5: P2 kết thúc lượt -> chuyển lại P1
  mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  record('P2_END_TURN', 'P2');

  // Step 6: P1 tung xúc xắc (bắt đầu từ 37 -> tổng 6 -> ô 3 An Giang)
  room.players[0]!.position = 37;
  mgr.handleRollDice(room.roomCode, 'P1');
  record('P1_ROLL_DICE_LAND_CELL_3', 'P1');

  // Step 7: P1 mua ô 3 tạo Độc quyền Nâu (Monopoly)
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BUY' });
  record('P1_BUY_CELL_3_MONOPOLY', 'P1');

  // Step 8: P1 nâng cấp ô 1 lên Shophouse C1
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_UPGRADE', cellIndex: 1 });
  record('P1_UPGRADE_CELL_1_C1', 'P1');

  // Step 9: P1 kết thúc lượt -> chuyển sang P2
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_END_TURN' });
  record('P1_END_TURN', 'P1');

  // Step 10: P2 tung xúc xắc (bắt đầu từ 39 -> tổng 6 -> ô 5 Cảng Long Thành)
  room.players[1]!.position = 39;
  mgr.handleRollDice(room.roomCode, 'P2');
  record('P2_ROLL_DICE_LAND_CELL_5', 'P2');

  // Step 11: P2 từ chối mua -> kích hoạt Đấu Giá Tự Động (AuctionPhase)
  mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_DECLINE' });
  record('P2_DECLINE_TRIGGER_AUCTION', 'P2');

  // Step 12: P1 đặt giá đấu 1.200
  mgr.handlePlayerIntent(room.roomCode, 'P1', { type: 'INTENT_BID', amount: 1_200 });
  record('P1_BID_AUCTION_1200', 'P1');

  // Step 13: Đóng phiên đấu giá -> P1 trúng đấu giá ô 5
  mgr.handleAuctionClose(room.roomCode);
  record('AUCTION_CLOSED_P1_WINS', 'SYSTEM');

  // Step 14: P2 kết thúc lượt -> chuyển về P1
  mgr.handlePlayerIntent(room.roomCode, 'P2', { type: 'INTENT_END_TURN' });
  record('P2_END_TURN', 'P2');

  return snapshots;
}

describe('[ORACLE-GOLDEN/MSS] FSM Game Engine Determinism & DeltaPayload Golden Oracle', () => {
  const GOLDEN_FILE_PATH = path.resolve(__dirname, 'goldens', 'fsm_golden_stream.json');

  it('tái hiện chuỗi chuyển trạng thái FSM với PRNG seed cố định và khớp 100% byte-for-byte với Golden Snapshot', () => {
    const snapshots = runDeterministicFsmSimulation(42);
    const actualJson = JSON.stringify(snapshots, null, 2) + '\n';

    expect(fs.existsSync(GOLDEN_FILE_PATH), 'Golden snapshot file must exist').toBe(true);
    const expectedGoldenJson = fs.readFileSync(GOLDEN_FILE_PATH, 'utf-8');
    expect(actualJson).toBe(expectedGoldenJson);
  });

  it('xác thực tính tất định tuyệt đối: 2 phiên chạy độc lập cùng seed 42 tạo ra chuỗi delta byte-for-byte đồng nhất', () => {
    const runA = runDeterministicFsmSimulation(42);
    const runB = runDeterministicFsmSimulation(42);

    const jsonA = JSON.stringify(runA, null, 2);
    const jsonB = JSON.stringify(runB, null, 2);

    expect(jsonA).toBe(jsonB);
  });

  it('nguyên tắc nghịch đảo đối kháng (Adversarial Inversion): khác seed phải tạo chuỗi chuyển dịch phân kỳ ngay lập tức', () => {
    const runDefault = runDeterministicFsmSimulation(42);
    const runDivergent = runDeterministicFsmSimulation(999);

    const jsonDefault = JSON.stringify(runDefault, null, 2);
    const jsonDivergent = JSON.stringify(runDivergent, null, 2);

    expect(jsonDefault).not.toBe(jsonDivergent);
  });
});

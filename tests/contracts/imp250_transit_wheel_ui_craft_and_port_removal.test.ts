// [CONTRACT TEST] IMP-250: Transit Wheel 5 kết quả (bỏ NEXT_PORT) + góc dừng kim + chốt chặn vỡ nợ second-hop
import { describe, it, expect } from 'vitest';
import { createRoom, TurnPhase, ActionRejectReason, type Room, type Player } from '../../src/domain/room.js';
import type { PropertyRegistry } from '../../src/domain/property_manager.js';
import {
  TransitWheelOutcome,
  TRANSIT_WHEEL_CONFIGS,
  evaluateTransitWheelOutcome,
  getWheelTargetDeg,
  findSafeHaven,
} from '../../src/domain/transit_wheel.js';
import * as transitWheelDomain from '../../src/domain/transit_wheel.js';
import { handleSpinTransitWheel } from '../../src/server/transit_wheel_handler.js';

function setupRoom(startCell: number, balance: number): { room: Room; player: Player } {
  const room = createRoom('p1', 'ROOM_IMP250');
  room.started = true;
  room.phase = TurnPhase.PropertyManagement;
  room.treasury = 1000;
  room.roundCount = 1;
  const player = room.players[0]!;
  player.position = startCell;
  player.balance = balance;
  player.hasSpunTransitThisTurn = false;
  room.pendingTransitWheel = { playerId: player.id, cellIndex: startCell, timestamp: Date.now() };
  return { room, player };
}

describe('[CONTRACT] IMP-250: Transit Wheel 5 outcomes', () => {
  describe('Facet 1: Domain model', () => {
    it('[UC-IMP250/MSS] [TC-TW250.01] Enum và cấu hình không còn NEXT_PORT, đúng 5 kết quả', () => {
      const outcomes: string[] = TRANSIT_WHEEL_CONFIGS.map((c) => c.outcome);
      expect(Object.values(TransitWheelOutcome)).toHaveLength(5);
      expect(outcomes).not.toContain('NEXT_PORT');
      expect(outcomes).toHaveLength(5);
    });

    it('[UC-IMP250/MSS] [TC-TW250.02] Tổng trọng số bằng 100', () => {
      const sum = TRANSIT_WHEEL_CONFIGS.reduce((acc, c) => acc + c.weight, 0);
      expect(sum).toBe(100);
    });

    it.each([
      [0.0, TransitWheelOutcome.SPEED_BOOST],
      [0.349, TransitWheelOutcome.SPEED_BOOST],
      [0.35, TransitWheelOutcome.SAFE_HAVEN],
      [0.549, TransitWheelOutcome.SAFE_HAVEN],
      [0.55, TransitWheelOutcome.CASH_BACK],
      [0.749, TransitWheelOutcome.CASH_BACK],
      [0.75, TransitWheelOutcome.PASS_GO_FLIGHT],
      [0.849, TransitWheelOutcome.PASS_GO_FLIGHT],
      [0.85, TransitWheelOutcome.FLIGHT_DELAY],
      [0.999, TransitWheelOutcome.FLIGHT_DELAY],
    ])('[UC-IMP250/MSS] [TC-TW250.03] evaluateTransitWheelOutcome(%f) trả %s', (roll, expected) => {
      expect(evaluateTransitWheelOutcome(roll)).toBe(expected);
    });

    it('[UC-IMP250/MSS] [TC-TW250.04] Mỗi cấu hình có icon, shortLabelVi và màu hex duy nhất', () => {
      const colors = TRANSIT_WHEEL_CONFIGS.map((c) => c.color);
      expect(TRANSIT_WHEEL_CONFIGS.every((c) => c.icon.length > 0 && c.shortLabelVi.length > 0)).toBe(true);
      expect(colors.every((c) => /^#[0-9a-f]{6}$/i.test(c))).toBe(true);
      expect(new Set(colors).size).toBe(colors.length);
    });

    it('[UC-IMP250/MSS] [TC-TW250.05] TRANSIT_CELLS và findNextPort không còn là export production', () => {
      expect(Object.keys(transitWheelDomain)).not.toContain('findNextPort');
      expect(Object.keys(transitWheelDomain)).not.toContain('TRANSIT_CELLS');
    });

    it('[UC-IMP250/MSS] [TC-TW250.12] findSafeHaven đưa về BĐS gần nhất hoặc an toàn ở lại trạm khi chưa sở hữu đất', () => {
      expect(findSafeHaven(5, [12, 28])).toBe(12);
      expect(findSafeHaven(35, [5, 12])).toBe(5);
      expect(findSafeHaven(5, [])).toBe(5);
      expect(findSafeHaven(5)).toBe(5);
      expect(findSafeHaven(39, [])).toBe(39);
    });
  });

  describe('Facet 2: Góc dừng kim chỉ hướng', () => {
    it.each([0, 1, 2, 3, 4])('[UC-IMP250/MSS] [TC-TW250.06] Tâm nan %i dừng đúng vị trí 12 giờ', (idx) => {
      const deg = getWheelTargetDeg(idx, 5);
      const centerAfterSpin = (deg + idx * 72 + 36) % 360;
      expect(centerAfterSpin).toBe(0);
    });

    it('[UC-IMP250/MSS] [TC-TW250.07] Góc dừng luôn quay thêm tối thiểu 5 vòng', () => {
      expect(getWheelTargetDeg(0, 5)).toBeGreaterThanOrEqual(1800);
    });
  });

  describe('Facet 3: Handler', () => {
    it('[UC-IMP250/MSS] [TC-TW250.08] SPEED_BOOST (roll 0.15) tiến theo xúc xắc 1D6 từ ô 5', () => {
      const { room, player } = setupRoom(5, 1000);
      let step = 0;
      const res = handleSpinTransitWheel(room, player.id, new Map(), new Map(), () => (++step === 1 ? 0.15 : 0.5));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(player.position).toBe(9);
    });

    it('[UC-IMP250/A1] [TC-TW250.09] Từ chối quay khi không có pendingTransitWheel', () => {
      const { room, player } = setupRoom(5, 1000);
      room.pendingTransitWheel = null;
      const res = handleSpinTransitWheel(room, player.id, new Map(), new Map(), () => 0.15);
      expect(res.success, JSON.stringify(res)).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
    });

    it('[UC-IMP250/A2] [TC-TW250.10] Khóa hasSpunTransitThisTurn và xóa pendingTransitWheel sau khi quay', () => {
      const { room, player } = setupRoom(5, 1000);
      handleSpinTransitWheel(room, player.id, new Map(), new Map(), () => 0.9);
      expect(player.hasSpunTransitThisTurn).toBe(true);
      expect(room.pendingTransitWheel).toBeNull();
    });

    it('[UC-IMP250/A3] [TC-TW250.11] Second-hop vào ô Thị Trường làm số dư âm (phí Viettel) chuyển InsolvencyPhase', () => {
      const { room, player } = setupRoom(15, 0);
      const p2: Player = { ...player, id: 'p2', name: 'P2', balance: 5000, position: 0, ownedProperties: [28] };
      room.players = [player, p2];
      room.currentPlayerIndex = 0;
      const registry: PropertyRegistry = new Map([[28, 'p2']]);
      let step = 0;
      const res = handleSpinTransitWheel(room, player.id, registry, new Map(), () => (++step === 1 ? 0.15 : 0.2));
      expect(res.outcome).toBe(TransitWheelOutcome.SPEED_BOOST);
      expect(player.position).toBe(17);
      expect(player.balance).toBeLessThan(0);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });
  });
});

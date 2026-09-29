// [TC-226.01/MSS..TC-226.16/MSS][UC-IMP226]
// Contract Test Suite: Escalating Audit Bailout & Transparent ActionDock Affordance (IMP-226)
// Universal 5-Facet Behavioral Matrix & Detroit Classical Assertions:
// Facet 1: Tier Boundaries (TC-226.01..TC-226.04)
// Facet 2: Server Bail Execution & Penalty Transitions (TC-226.05..TC-226.08)
// Facet 3: Counter Lifecycle & Pipeline Propagation (TC-226.09..TC-226.10)
// Facet 4: ActionDock Ergonomics & Labels (TC-226.11..TC-226.14)
// Facet 5: Activity Log / Floating Badge & Bot Parity (TC-226.15..TC-226.16)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { calculateBailAmount } from '../../src/domain/property_rent.js';
import { createRoom, createPlayer, TurnPhase, type Player } from '../../src/domain/room.js';
import { sendToAudit, handleBailOut, handleAuditTurnTransition } from '../../src/server/audit_manager.js';
import { buildDeltaFromRoom, type PlayerDelta } from '../../src/server/session_manager.js';
import { isPlayerEqual } from '../../src/server/network/delta_broadcaster.js';
import { executeSafeAfkAction } from '../../src/server/network/afk_recovery.js';
import { RoomManager } from '../../src/server/room_manager.js';
import { applyPlayerDeltas, type DeltaPayload } from '../../src/client/network/apply_delta_players.js';
import { useGameStore } from '../../src/client/store/game_store.js';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types.js';
import { ActionDock } from '../../src/client/ui/action_dock.js';
import { processPayerFee, type BalanceDelta, type PropertyFinancialContext } from '../../src/client/network/activity_rent_matcher.js';
import { decideAuditBailout } from '../../src/domain/bot/bot_audit.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

describe('[TC-226.01/MSS..TC-226.16/MSS][UC-IMP226] Escalating Audit Bailout & Dock Affordance Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      currentTurnPlayerId: 'p1',
      hasRolledThisTurn: false,
      isRolling: false,
      dice: [1, 2],
      activeModal: null,
      activeModifiers: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 5_000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
          auditTurnsLeft: 0,
          consecutiveDoubles: 0,
        },
      },
    });
  });

  // =========================================================================
  // Facet 1: Tier Boundaries (Biên độ chế tài tái phạm)
  // =========================================================================
  describe('Facet 1: Tier Boundaries', () => {
    it('[TC-226.01/MSS][UC-IMP226] calculateBailAmount(1) trả về 500 Tr. VNĐ cho lần đầu vi phạm', () => {
      const amount = calculateBailAmount(1);
      expect(amount).toBe(500);
    });

    it('[TC-226.02/MSS][UC-IMP226] calculateBailAmount(2) trả về 1.000 Tr. VNĐ cho lần tái phạm thứ hai', () => {
      const amount = calculateBailAmount(2);
      expect(amount).toBe(1_000);
    });

    it('[TC-226.03/MSS][UC-IMP226] calculateBailAmount(3) và calculateBailAmount(5) trả về trần 2.000 Tr. VNĐ cho các lần tái phạm tiếp theo', () => {
      const amount3 = calculateBailAmount(3);
      const amount5 = calculateBailAmount(5);
      expect(amount3).toBe(2_000);
      expect(amount5).toBe(2_000);
    });

    it('[TC-226.04/MSS][UC-IMP226] calculateBailAmount(undefined) và calculateBailAmount(0) an toàn trả về 500 Tr. VNĐ (Fallback Guard)', () => {
      const amountUndef = calculateBailAmount(undefined);
      const amountZero = calculateBailAmount(0);
      expect(amountUndef).toBe(500);
      expect(amountZero).toBe(500);
    });
  });

  // =========================================================================
  // Facet 2: Server Bail Execution & Penalty Transitions (Thi hành máy chủ & Chế tài cưỡng chế)
  // =========================================================================
  describe('Facet 2: Server Bail Execution & Penalty Transitions', () => {
    it('[TC-226.05/MSS][UC-IMP226] Người chơi vào trạm lần 1 nộp bảo lãnh: trừ chính xác 500 Tr., Kho Bạc tăng 500 Tr., xóa án kiểm toán (auditTurnsLeft = 0)', () => {
      const room = Object.assign(createRoom('ROOM_226_01', 'p1'), { started: true, treasury: 1_000 });
      const p1 = Object.assign(room.players[0]!, { balance: 5_000, auditTurnsLeft: 3, auditCount: 1 });
      const res = handleBailOut(room, p1.id, false);

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(4_500);
      expect(room.treasury).toBe(1_500);
      expect(p1.auditTurnsLeft).toBe(0);
    });

    it('[TC-226.06/MSS][UC-IMP226] Người chơi tái phạm lần 2 (auditCount = 2) nộp bảo lãnh: trừ chính xác 1.000 Tr., Kho Bạc tăng 1.000 Tr.', () => {
      const room = Object.assign(createRoom('ROOM_226_02', 'p1'), { started: true, treasury: 1_000 });
      const p1 = Object.assign(room.players[0]!, { balance: 5_000, auditTurnsLeft: 3, auditCount: 2 });
      const res = handleBailOut(room, p1.id, false);

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(4_000);
      expect(room.treasury).toBe(2_000);
    });

    it('[TC-226.07/MSS][UC-IMP226] Người chơi tái phạm lần 3 (auditCount = 3) nộp bảo lãnh: trừ chính xác 2.000 Tr.', () => {
      const room = Object.assign(createRoom('ROOM_226_03', 'p1'), { started: true, treasury: 1_000 });
      const p1 = Object.assign(room.players[0]!, { balance: 5_000, auditTurnsLeft: 3, auditCount: 3 });
      const res = handleBailOut(room, p1.id, false);

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(3_000);
      expect(room.treasury).toBe(3_000);
    });

    it('[TC-226.08/MSS][UC-IMP226] Hết 3 lượt không ra đôi tại lần 2: handleAuditTurnTransition tự động phạt cưỡng chế đúng 1.000 Tr. nộp Kho Bạc', () => {
      const room = Object.assign(createRoom('ROOM_226_04', 'p1'), { treasury: 500 });
      const p1 = Object.assign(room.players[0]!, { balance: 5_000, auditTurnsLeft: 1, auditCount: 2 });
      handleAuditTurnTransition(room, p1);

      expect(p1.auditTurnsLeft).toBe(0);
      expect(p1.balance).toBe(4_000);
      expect(room.treasury).toBe(1_500);
    });

    it('[TC-226.17/MSS][UC-IMP226] AFK Auto-Recovery Blast Radius: Người chơi ở Trạm Kiểm Toán lần 2 (auditCount = 2) AFK qua executeSafeAfkAction ➔ cưỡng chế phạt đúng 1.000 Tr. nộp Kho Bạc', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const p1 = room.players[0]!;
      p1.position = 10;
      p1.inAudit = true;
      p1.auditTurnsLeft = 1;
      p1.auditCount = 2;
      p1.balance = 5_000;
      room.treasury = 500;
      room.phase = TurnPhase.PropertyManagement;

      executeSafeAfkAction(mgr, room.roomCode, TurnPhase.PropertyManagement, p1.id);

      expect(p1.auditTurnsLeft).toBe(0);
      expect(p1.inAudit).toBe(false);
      expect(p1.balance).toBe(4_000); // 5.000 - 1.000 (khung lần 2)
      expect(room.treasury).toBe(1_500); // 500 + 1.000
    });

    it('[TC-226.18/MSS][UC-IMP226] AFK Auto-Recovery Blast Radius: Tái phạm lần 3 (auditCount = 3) AFK hết lượt khi số dư không đủ ➔ phạt trần 2.000 Tr. làm âm vốn và chuyển sang InsolvencyPhase', () => {
      const mgr = new RoomManager(42);
      const room = mgr.createRoom('p1');
      mgr.joinRoom(room.roomCode, 'p2');
      mgr.startGame(room.roomCode);

      const p1 = room.players[0]!;
      p1.position = 10;
      p1.inAudit = true;
      p1.auditTurnsLeft = 1;
      p1.auditCount = 3;
      p1.balance = 800; // Không đủ 2.000
      room.treasury = 500;
      room.phase = TurnPhase.PropertyManagement;

      executeSafeAfkAction(mgr, room.roomCode, TurnPhase.PropertyManagement, p1.id);

      expect(p1.auditTurnsLeft).toBe(0);
      expect(p1.balance).toBe(800 - 2_000); // -1.200 (âm vốn)
      expect(room.treasury).toBe(2_500); // 500 + 2.000
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });
  });

  // =========================================================================
  // Facet 3: Counter Lifecycle & Pipeline Propagation (Vòng đời auditCount & Đồng bộ hóa toàn tuyến)
  // =========================================================================
  describe('Facet 3: Counter Lifecycle & Pipeline Propagation', () => {
    it('[TC-226.09/MSS][UC-IMP226] auditCount chỉ tăng trong sendToAudit, không bị tăng đúp khi gọi handleBailOut hoặc handleAuditTurnTransition', () => {
      const room = Object.assign(createRoom('ROOM_226_05', 'p1'), { started: true });
      const p1 = Object.assign(room.players[0]!, { auditCount: 0, balance: 5_000 });

      sendToAudit(room, p1.id);
      expect(p1.auditCount).toBe(1);

      handleBailOut(room, p1.id, false);
      expect(p1.auditCount).toBe(1);

      handleAuditTurnTransition(room, p1);
      expect(p1.auditCount).toBe(1);
    });

    it('[TC-226.10/MSS][UC-IMP226] auditCount được truyền từ Room.player ➔ PlayerDelta (session_manager) ➔ buildSparseDelta (delta_broadcaster) ➔ applyDeltaPlayers ➔ PlayerHudInfo', () => {
      const room = Object.assign(createRoom('ROOM_226_06', 'p1'), { started: true });
      const p1 = Object.assign(room.players[0]!, { auditCount: 2 });

      const delta = buildDeltaFromRoom(room);
      const pDelta = delta.players?.find((p) => p.id === p1.id);
      expect(pDelta?.auditCount).toBe(2);

      const pDelta1: PlayerDelta = { id: 'p1', position: 0, balance: 1_000, auditCount: 1 };
      const pDelta2: PlayerDelta = { id: 'p1', position: 0, balance: 1_000, auditCount: 2 };
      const isSame = isPlayerEqual(pDelta1, pDelta2);
      expect(isSame).toBe(false);

      const playersInfoMap: Record<string, PlayerHudInfo> = {};
      const deltaPayload: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [{ id: 'p1', position: 0, balance: 1_000, auditCount: 2 }],
      };
      applyPlayerDeltas(
        deltaPayload,
        useGameStore.getState(),
        playersInfoMap,
        false,
      );
      expect(playersInfoMap['p1']?.auditCount).toBe(2);
    });
  });

  // =========================================================================
  // Facet 4: ActionDock Ergonomics & Labels (Minh bạch nút bấm & Công thái học)
  // =========================================================================
  describe('Facet 4: ActionDock Ergonomics & Labels', () => {
    it('[TC-226.11/MSS][UC-IMP226] Lần 1: ActionDock hiển thị nhãn Bảo Lãnh (500) và disabled = false khi balance >= 500', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 600,
            tokenColor: '#EF4444',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 3,
            auditCount: 1,
            bankrupt: false,
          },
        },
      });

      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));
      const bailoutBtn = html.match(/<button[^>]*data-testid="bailout-btn"[^>]*>[\s\S]*?<\/button>/)
        ?? html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/);

      expect(bailoutBtn).not.toBeNull();
      expect(bailoutBtn![0]).toContain('Bảo Lãnh (500)');
      expect(bailoutBtn![0]).not.toContain('disabled=""');
    });

    it('[TC-226.12/MSS][UC-IMP226] Lần 2: ActionDock hiển thị nhãn Bảo Lãnh - Lần 2 (1.000), khóa nút nếu balance = 700 (< 1000)', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 700,
            tokenColor: '#EF4444',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 3,
            auditCount: 2,
            bankrupt: false,
          },
        },
      });

      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));
      const bailoutBtn = html.match(/<button[^>]*data-testid="bailout-btn"[^>]*>[\s\S]*?<\/button>/)
        ?? html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/);

      expect(bailoutBtn).not.toBeNull();
      expect(bailoutBtn![0]).toContain('Bảo Lãnh - Lần 2 (1.000)');
      expect(bailoutBtn![0]).toContain('disabled=""');
    });

    it('[TC-226.13/MSS][UC-IMP226] Lần 3+: ActionDock hiển thị nhãn Bảo Lãnh - Tái Phạm (2.000) và tooltip giải thích chi tiết', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 3_000,
            tokenColor: '#EF4444',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 3,
            auditCount: 3,
            bankrupt: false,
          },
        },
      });

      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));
      const bailoutBtn = html.match(/<button[^>]*data-testid="bailout-btn"[^>]*>[\s\S]*?<\/button>/)
        ?? html.match(/<button[^>]*aria-label="[^"]*bảo lãnh[^"]*"[^>]*>[\s\S]*?<\/button>/);

      expect(bailoutBtn).not.toBeNull();
      expect(bailoutBtn![0]).toContain('Bảo Lãnh - Tái Phạm (2.000)');
      expect(bailoutBtn![0]).toContain('title="Nộp 2.000 bảo lãnh tái phạm (Lần 3) để rời trạm ngay"');
    });

    it('[TC-226.14/MSS][UC-IMP226] Trên Mobile viewport: Nút bảo lãnh ActionDock đạt sàn diện tích chạm >= 44px (min-h-[44px] min-w-[44px]) và có data-testid="bailout-btn"', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'p1',
        hasRolledThisTurn: false,
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 2_000,
            tokenColor: '#EF4444',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 3,
            auditCount: 2,
            bankrupt: false,
          },
        },
      });

      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1', isMyTurn: true }));
      expect(html).toContain('data-testid="bailout-btn"');
      const btnTag = html.match(/<button[^>]*data-testid="bailout-btn"[^>]*>/)?.[0] ?? '';
      expect(btnTag).toContain('min-w-[44px]');
      expect(btnTag).toContain('min-h-[44px]');
      expect(html).toContain('sm:hidden text-xs font-bold');
    });
  });

  // =========================================================================
  // Facet 5: Activity Log / Floating Badge & Bot Parity (Nhật ký dòng tiền & Trí tuệ Bot)
  // =========================================================================
  describe('Facet 5: Activity Log / Floating Badge & Bot Parity', () => {
    it('[TC-226.15/MSS][UC-IMP226] Khớp matchRentTransactions ghi nhận đúng mô tả Bảo Lãnh Tái Phạm (Lần 2) khi người chơi tái phạm nộp 1.000 Tr. rời trạm', () => {
      const payer: BalanceDelta = { id: 'p1', diff: -1_000 };
      const context: PropertyFinancialContext = {
        boughtCellIndices: [],
        upgradedCells: [],
        mortgagedCells: [],
        unmortgagedCells: [],
      };
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Chủ Tịch Hưng',
            balance: 5_000,
            tokenColor: '#EF4444',
            ownedProperties: [],
            inAudit: true,
            auditTurnsLeft: 2,
            auditCount: 2,
          },
        },
      });
      const prevState = useGameStore.getState();
      const delta: DeltaPayload = {
        tick: 1,
        cells: [],
        players: [{ id: 'p1', position: 10, balance: 4_000 }],
      };

      const entry = processPayerFee(payer, context, delta, prevState);
      expect(entry).not.toBeNull();
      expect(entry?.type).toBe('bail');
      expect(entry?.message).toContain('Bảo Lãnh Tái Phạm (Lần 2)');
    });

    it('[TC-226.16/MSS][UC-IMP226] decideAuditBailout trong bot_audit.ts nhận diện chính xác chi phí 1.000 Tr. cho Bot tái phạm lần 2 và từ chối bảo lãnh khi số dư không đủ đệm an toàn', () => {
      const room = Object.assign(createRoom('ROOM_BOT_226', 'bot_1'), { started: true });
      const bot: Player = Object.assign(room.players[0]!, {
        isBot: true,
        position: 10,
        auditTurnsLeft: 2,
        auditCount: 2,
        balance: 1_200,
      });
      const registry: PropertyRegistry = new Map();
      const stateMap: PropertyStateMap = new Map();

      // Bot balance is 1.200. With escalating bail (tier 2 = 1.000), remaining balance is 200 < minBuffer (300).
      // Bot must decline bailout (return false). Legacy code with 500 would see 1.200 - 500 = 700 >= 300 and return true.
      const decision = decideAuditBailout(bot, room, registry, stateMap);
      expect(decision).toBe(false);
    });
  });
});

// [CONTRACT TEST] IMP-220: Tái Cơ Cấu Nợ & Đồng Bộ Cứu Nguy Tự Động
// Traceability Tags: [TC-220.01/MSS..TC-220.16/MSS] & [UC-IMP220]
// Universal 5-Facet Behavioral Matrix & Adversarial Inversion Gate Verification
// Strictly confined to tests/** (Zero modifications to src/**)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { RoomManager } from '../../src/server/room_manager.js';
import { dispatchPlayerIntent } from '../../src/server/intent_dispatcher.js';
import { TurnPhase } from '../../src/domain/room.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import { BondTrancheId } from '../../src/domain/bond_types.js';
import { BondIssuanceTab } from '../../src/client/ui/modals/bond_issuance_tab.js';
import { InsolvencyBanner } from '../../src/client/ui/modals/insolvency_banner.js';
import { resolveActionableNotification } from '../../src/client/ui/actionable_notification.js';
import { useGameStore } from '../../src/client/store/game_store.js';

// Tree traversal helper for React vdom elements (defined outside it() to enforce zero loops inside tests)
function findVNode(node: any, predicate: (n: any) => boolean): any {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      const res = findVNode(child, predicate);
      if (res) return res;
    }
  } else if (children) {
    return findVNode(children, predicate);
  }
  return null;
}

function findAllVNodes(node: any, predicate: (n: any) => boolean): any[] {
  if (!node) return [];
  const results: any[] = [];
  if (predicate(node)) results.push(node);
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      results.push(...findAllVNodes(child, predicate));
    }
  } else if (children) {
    results.push(...findAllVNodes(children, predicate));
  }
  return results;
}

function setupInsolvencyRoom() {
  const mgr = new RoomManager();
  const room = mgr.createRoom('player_alpha');
  mgr.joinRoom(room.roomCode, 'player_beta');
  mgr.startGame(room.roomCode);

  room.phase = TurnPhase.InsolvencyPhase;
  room.currentPlayerIndex = 0;

  const reg = mgr.getRegistry(room.roomCode)!;
  const sm = mgr.getPropertyStates(room.roomCode)!;

  // Deeds: cell 1 (600), cell 3 (600), cell 31 (3000), cell 32 (3000) -> sum 7200
  reg.set(1, 'player_alpha');
  reg.set(3, 'player_alpha');
  reg.set(31, 'player_alpha');
  reg.set(32, 'player_alpha');

  const p1 = room.players[0]!;
  p1.balance = -1200; // netWorth = 7200 - 1200 = 6000
  p1.mortgagedProperties = [];

  const p2 = room.players[1]!;
  p2.balance = 10_000;
  p2.mortgagedProperties = [];

  return { mgr, room, reg, sm, p1, p2 };
}

describe('[TC-220.01/MSS..TC-220.16/MSS][UC-IMP220] Insolvency Corporate Bond & Auto-Solvency Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      currentTurnPlayerId: 'player_alpha',
      levelMap: {},
      playersInfo: {},
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (Biên & Pha Insolvency) (TC-220.01 - TC-220.04c)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Biên & Pha Insolvency)', () => {
    it('[TC-220.01/MSS][UC-IMP220] Cho phép INTENT_ISSUE_BOND khi phòng chơi ở TurnPhase.InsolvencyPhase', () => {
      const { mgr, room } = setupInsolvencyRoom();
      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(true);
      expect(res.reason).toBeUndefined();
    });

    it('[TC-220.02/MSS][UC-IMP220] Phát hành trái phiếu đưa balance >= 0 tự động chuyển FSM sang PropertyManagement', () => {
      const { mgr, room, p1 } = setupInsolvencyRoom();
      p1.balance = -500; // netWorth = 7200 - 500 = 6700, principal = floor(6700 * 0.20) = 1340 -> balance = +840

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(840);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-220.03/MSS][UC-IMP220] Phát hành trái phiếu nhưng balance < 0 vẫn duy trì InsolvencyPhase (cho phép tiếp tục thế chấp)', () => {
      const { mgr, room, p1 } = setupInsolvencyRoom();
      p1.balance = -2000; // netWorth = 7200 - 2000 = 5200, principal = floor(5200 * 0.20) = 1040 -> balance = -960

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(true);
      expect(p1.balance).toBe(-960);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
    });

    it('[TC-220.04a/MSS][UC-IMP220] Từ chối phát hành trái phiếu khi netWorth < BOND_MIN_NET_WORTH trong Insolvency -> trả về reason BOND_NOT_ELIGIBLE', () => {
      const { mgr, room, p1 } = setupInsolvencyRoom();
      p1.balance = -5000; // netWorth = 7200 - 5000 = 2200 < 3000

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.BOND_NOT_ELIGIBLE);
    });

    it('[TC-220.04b/MSS][UC-IMP220] Từ chối phát hành trái phiếu khi unmortgagedCells.length < BOND_MIN_PROPERTIES trong Insolvency -> trả về reason BOND_NOT_ELIGIBLE', () => {
      const { mgr, room, reg, p1 } = setupInsolvencyRoom();
      reg.clear();
      reg.set(39, 'player_alpha'); // Price 4000
      p1.balance = -500; // netWorth = 4000 - 500 = 3500 >= 3000, nhưng chỉ có 1 BĐS sạch (< 2)

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.BOND_NOT_ELIGIBLE);
    });

    it('[TC-220.04c/MSS][UC-IMP220] Từ chối phát hành trái phiếu khi totalCollateralValue < principal * collateralRatio -> trả về reason BOND_NOT_ELIGIBLE', () => {
      const { mgr, room, reg, sm, p1 } = setupInsolvencyRoom();
      reg.clear();
      reg.set(1, 'player_alpha'); // Price 600
      reg.set(3, 'player_alpha'); // Price 600
      sm.set(1, { level: 3 }); // deed price 600 * 4 = 2400
      sm.set(3, { level: 3 }); // deed price 600 * 4 = 2400
      p1.balance = -100; // netWorth = 4800 - 100 = 4700

      // EXPANSION: loanRatio 0.40, collateralRatio 1.20
      // principal = floor(4700 * 0.40) = 1880 -> requiredCollateral = floor(1880 * 1.20) = 2256
      // Tổng giá gốc ô 1 + ô 3 = 1200 < 2256
      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.EXPANSION,
      });

      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.BOND_NOT_ELIGIBLE);
    });
  });

  // =========================================================================
  // FACET 2: TOUCH TARGETS & ACCESSIBILITY (Công Thái Học & Sàn Chạm) (TC-220.05 - 07)
  // =========================================================================
  describe('Facet 2: Touch Targets & Accessibility', () => {
    it('[TC-220.05/MSS][UC-IMP220] Nút phát hành trái phiếu trong BondIssuanceTab đạt sàn chạm >= 46px (min-h-[46px]) và có data-testid="issue-bond-btn"', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BondIssuanceTab({
          balance: 5000,
          isMyTurn: true,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 3,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const issueBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'issue-bond-btn');
      expect(issueBtn).toBeDefined();
      expect(issueBtn?.props?.className).toContain('min-h-[46px]');
    });

    it('[TC-220.06/MSS][UC-IMP220] Toàn bộ 3 thẻ gói tranche trong BondIssuanceTab đạt min-h-[46px] (giải quyết triệt để TC-212.14)', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BondIssuanceTab({
          balance: 5000,
          isMyTurn: true,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 3,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const trancheBtns = findAllVNodes(
        vdom,
        (n) => n?.type === 'button' && n?.props?.['data-testid'] !== 'issue-bond-btn',
      );
      expect(trancheBtns).toHaveLength(3);
      expect(trancheBtns[0]?.props?.className).toContain('min-h-[46px]');
      expect(trancheBtns[1]?.props?.className).toContain('min-h-[46px]');
      expect(trancheBtns[2]?.props?.className).toContain('min-h-[46px]');
    });

    it('[TC-220.07/MSS][UC-IMP220] Hiển thị thẻ cảnh báo bond-blocked-notice khi không đủ điều kiện phát hành', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BondIssuanceTab({
          balance: -500,
          isMyTurn: true,
          playerNetWorth: 1000,
          unmortgagedPropertiesCount: 1,
        });
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const notice = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'bond-blocked-notice');
      expect(notice).toBeDefined();
      expect(notice?.props?.['data-testid']).toBe('bond-blocked-notice');
    });
  });

  // =========================================================================
  // FACET 3: FORMATTING & BADGES (Huy Hiệu & Nhãn Nút Cứu Nguy) (TC-220.08 - 10)
  // =========================================================================
  describe('Facet 3: Formatting & Badges', () => {
    it('[TC-220.08/MSS][UC-IMP220] Khi isInInsolvency = true, hiển thị huy hiệu tái cơ cấu nợ data-testid="bond-insolvency-restructuring-badge"', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BondIssuanceTab({
          balance: -1000,
          isMyTurn: true,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 3,
          isInInsolvency: true,
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const badge = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'bond-insolvency-restructuring-badge');
      expect(badge).toBeDefined();
      expect(badge?.props?.['data-testid']).toBe('bond-insolvency-restructuring-badge');
    });

    it('[TC-220.09/MSS][UC-IMP220] Nhãn nút phát hành đổi sang CỨU NGUY TÀI CHÍNH: PHÁT HÀNH... khi người chơi âm tiền (isInInsolvency = true)', () => {
      let vdom: any;
      function TestWrapper() {
        vdom = BondIssuanceTab({
          balance: -1000,
          isMyTurn: true,
          playerNetWorth: 5000,
          unmortgagedPropertiesCount: 3,
          isInInsolvency: true,
        } as any);
        return vdom;
      }
      renderToStaticMarkup(React.createElement(TestWrapper));

      const issueBtn = findVNode(vdom, (n) => n?.props?.['data-testid'] === 'issue-bond-btn');
      expect(issueBtn).toBeDefined();
      expect(String(issueBtn?.props?.children)).toContain('CỨU NGUY TÀI CHÍNH: PHÁT HÀNH');
    });

    it('[TC-220.10/MSS][UC-IMP220] InsolvencyBanner bổ sung hướng dẫn phát hành trái phiếu doanh nghiệp', () => {
      const html = renderToStaticMarkup(
        React.createElement(InsolvencyBanner, {
          playerId: 'player_alpha',
          deficit: 1000,
          playerName: 'Chủ Tịch Sài Thành',
        })
      );

      expect(html).toContain('phát hành trái phiếu doanh nghiệp');
    });
  });

  // =========================================================================
  // FACET 4: ACTIONABLE NOTIFICATION MAPPING (Ánh Xạ Thông Báo Lỗi) (TC-220.11 - 13)
  // =========================================================================
  describe('Facet 4: Actionable Notification Mapping', () => {
    it('[TC-220.11/MSS][UC-IMP220] resolveActionableNotification(ActionRejectReason.BOND_NOT_ELIGIBLE) trả về thông tin chi tiết (chứa 3.000 và 2 bất động sản)', () => {
      const notif = resolveActionableNotification(ActionRejectReason.BOND_NOT_ELIGIBLE);

      expect(notif.title).toBe('Chưa Đủ Điều Kiện Phát Hành Trái Phiếu');
      expect(notif.description).toContain('3.000');
      expect(notif.description).toContain('2 bất động sản');
    });

    it('[TC-220.12/MSS][UC-IMP220] resolveActionableNotification(CANNOT_RECOVER) trả về hướng dẫn gợi ý trái phiếu doanh nghiệp', () => {
      const cannotRecoverCode = (ActionRejectReason as any).CANNOT_RECOVER ?? 'CANNOT_RECOVER';
      const notif = resolveActionableNotification(cannotRecoverCode);

      expect(notif.title).toBe('Không Thể Cân Đối Tài Chính Tự Động');
      expect(notif.actionHint).toContain('trái phiếu doanh nghiệp');
    });

    it('[TC-220.13/MSS][UC-IMP220] resolveActionableNotification(ActionRejectReason.BOND_COLLATERAL_LOCKED) trả về cảnh báo tài sản bảo đảm', () => {
      const notif = resolveActionableNotification(ActionRejectReason.BOND_COLLATERAL_LOCKED);

      expect(notif.title).toBe('Tài Sản Bảo Đảm Trái Phiếu');
      expect(notif.description).toContain('tài sản bảo đảm cho hợp đồng trái phiếu');
    });
  });

  // =========================================================================
  // FACET 5: INVARIANT & ROLE SYMMETRY & STATE TRANSITIONS (TC-220.14 - 16)
  // =========================================================================
  describe('Facet 5: Invariant & Role Symmetry & State Transitions', () => {
    it('[TC-220.14/MSS][UC-IMP220] Sau khi phát hành trái phiếu, INTENT_AUTO_SOLVENCY không thế chấp các ô đất bảo đảm (collateralCells)', () => {
      const { mgr, room, reg, p1 } = setupInsolvencyRoom();
      reg.clear();
      reg.set(1, 'player_alpha'); // Price 600
      reg.set(3, 'player_alpha'); // Price 600
      reg.set(39, 'player_alpha'); // Price 4000
      p1.balance = -1000; // netWorth = 5200 - 1000 = 4200

      // Phát hành WORKING_CAPITAL (20% NW = 840, required collateral 840 -> cells 1, 3 bị khóa làm collateral)
      const issueRes = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });
      expect(issueRes.success).toBe(true);

      // Chạy INTENT_AUTO_SOLVENCY giải cứu số dư còn thâm hụt
      const autoRes = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_AUTO_SOLVENCY',
      });
      expect(autoRes.success).toBe(true);
      expect(p1.mortgagedProperties).not.toContain(1);
      expect(p1.mortgagedProperties).not.toContain(3);
      expect(p1.mortgagedProperties).toContain(39);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
    });

    it('[TC-220.15/MSS][UC-IMP220] Off-Turn Hijack Guard: Người chơi ngoài lượt gửi INTENT_ISSUE_BOND trong InsolvencyPhase bị từ chối với NOT_YOUR_TURN và bảo lưu nguyên vẹn trạng thái Insolvency của người chơi hiện tại', () => {
      const { mgr, room, p1, p2 } = setupInsolvencyRoom();
      p1.balance = -1000;
      p2.balance = 10_000;

      const res = dispatchPlayerIntent(mgr, room.roomCode, 'player_beta', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });

      expect(res.success).toBe(false);
      expect(res.reason).toBe(ActionRejectReason.NOT_YOUR_TURN);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);
      expect(p1.balance).toBe(-1000);
    });

    it('[TC-220.16/MSS][UC-IMP220] Tái cơ cấu nhiều bước (Multi-Step Restructuring): Người chơi âm nặng, phát hành trái phiếu (+3.000 Tr) duy trì InsolvencyPhase, sau đó thế chấp BĐS đưa số dư >= 0 -> FSM tự động chuyển sang PropertyManagement', () => {
      const { mgr, room, reg, p1 } = setupInsolvencyRoom();
      reg.clear();
      // Gán danh mục đất sạch tổng giá gốc 19.500:
      // cells 1, 3, 6, 8 (tổng 3200) làm tài sản bảo đảm cho 3000 vốn vay trái phiếu
      // cell 39 (giá 4000, giá trị thế chấp 2000) làm tài sản tự do
      reg.set(1, 'player_alpha'); // 600
      reg.set(3, 'player_alpha'); // 600
      reg.set(6, 'player_alpha'); // 1000
      reg.set(8, 'player_alpha'); // 1000
      reg.set(11, 'player_alpha'); // 1400
      reg.set(13, 'player_alpha'); // 1400
      reg.set(19, 'player_alpha'); // 2000
      reg.set(21, 'player_alpha'); // 2200
      reg.set(24, 'player_alpha'); // 2400
      reg.set(31, 'player_alpha'); // 3000
      reg.set(39, 'player_alpha'); // 4000 (tổng: 19.600)
      p1.balance = -4600; // netWorth = 19.600 - 4.600 = 15.000

      // Bước 1: Phát hành trái phiếu (+3.000 Tr), số dư lên -1.600 Tr -> vẫn duy trì InsolvencyPhase
      const issueRes = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_ISSUE_BOND',
        trancheId: BondTrancheId.WORKING_CAPITAL,
      });
      expect(issueRes.success).toBe(true);
      expect(p1.balance).toBe(-1600);
      expect(room.phase).toBe(TurnPhase.InsolvencyPhase);

      // Bước 2: Thế chấp ô đất 39 (+2.000 Tr), số dư lên +400 Tr -> FSM tự động chuyển sang PropertyManagement
      const mortgageRes = dispatchPlayerIntent(mgr, room.roomCode, 'player_alpha', {
        type: 'INTENT_MORTGAGE',
        cellIndex: 39,
      });
      expect(mortgageRes.success).toBe(true);
      expect(p1.balance).toBe(400);
      expect(room.phase).toBe(TurnPhase.PropertyManagement);
      expect(p1.bondContract?.isActive).toBe(true);
    });
  });
});

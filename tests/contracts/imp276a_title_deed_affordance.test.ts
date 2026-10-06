// [TC-276A.01/MSS..TC-276A.12/MSS][UC-IMP276A] Universal 5-Facet Contract Suite:
// IMP-276A: Title Deed Affordance & Anti-Ghost Upgrade (Đồng Bộ Giá Nâng Cấp, Rent Table & Turn/Phase Guard)
// Reference: .agents/plans/PLAN_IMP_276A_TITLE_DEED_AFFORDANCE.md (Revision 2)
// Domain Invariants: docs/domain/gotchas.md (Pillars I, II, V, VII)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain & Client Modules under test
import { useGameStore } from '../../src/client/store/game_store.js';
import { TurnPhase } from '../../src/domain/room.js';
import {
  resolveTitleDeedModalState,
  type AffordancePlayer,
  type UpgradeActionEvaluation,
} from '../../src/client/ui/modals/title_deed_affordance.js';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal.js';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer.js';
import { DeedModalHost } from '../../src/client/ui/modals/hosts/deed_modal_host.js';

// Module augmentation to allow future props without dirty casts in contract tests
declare module '../../src/client/ui/modals/title_deed_modal.js' {
  interface TitleDeedModalProps {
    readonly upgradeCosts?: readonly number[];
  }
}

interface TitleDeedAffordanceResult {
  readonly owner?: unknown;
  readonly isOwner: boolean;
  readonly isMortgaged: boolean;
  readonly ownerName?: string;
  readonly currentLevel: 0 | 1 | 2 | 3;
  readonly upgradeCost: number;
  readonly upgradeCosts?: readonly number[];
  readonly upgradeEvaluation?: UpgradeActionEvaluation;
  readonly hasUpgrades: boolean;
  readonly isUtility: boolean;
  readonly isRailroad: boolean;
  readonly isUpgradedUtility: boolean;
  readonly isETC: boolean;
  readonly hasMonopoly: boolean;
  readonly upgradeBlockedReason?: string;
  readonly downgradeBlockedReason?: string;
  readonly canBuy: boolean;
  readonly isBuyOpportunity: boolean;
  readonly shortfall: number;
  readonly canCoverWithMortgage: boolean;
  readonly totalMortgageCapacity: number;
}

describe('[CONTRACT-TEST][TC-276A/MSS][UC-IMP276A] Title Deed Affordance & Anti-Ghost Upgrade Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      playersInfo: {},
      levelMap: {},
      propertyStates: {},
      turnPhase: TurnPhase.WaitingRoll,
      currentTurnPlayerId: 'p1',
      activeModifiers: [],
    });
  });

  // ==========================================================================
  // FACET 1: Boundary & Range (Cost Multiplier Calculation & Fallbacks)
  // ==========================================================================
  describe('Facet 1: Boundary & Range', () => {
    it('[TC-276A.01/MSS][UC-IMP276A] Given ô 19 C0 có MC_RATE_HIKE (remainingRounds = 2), When gọi resolveTitleDeedModalState, Then trả về upgradeCost = 1200 và upgradeCosts = [1200, 1800, 2400]', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        activeModifiers: [{ type: 'MC_RATE_HIKE', remainingRounds: 2 }],
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeCost).toBe(1200);
      expect(res.upgradeCosts).toEqual([1200, 1800, 2400]);
    });

    it('[TC-276A.02/MSS][UC-IMP276A] Given ô 19 C0 khi activeModifiers là undefined hoặc [], When gọi resolveTitleDeedModalState, Then trả về upgradeCost = 1000 và upgradeCosts = [1000, 1500, 2000]', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        activeModifiers: [],
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeCost).toBe(1000);
      expect(res.upgradeCosts).toEqual([1000, 1500, 2000]);
    });
  });

  // ==========================================================================
  // FACET 2: State Reactivity & Cycle Teardown (Turn & Phase Guard)
  // ==========================================================================
  describe('Facet 2: State Reactivity & Cycle Teardown', () => {
    it('[TC-276A.03/MSS][UC-IMP276A] Given ô 19 C0 người chơi sở hữu trọn bộ màu cam nhưng currentTurnPlayerId !== myId, When gọi resolveTitleDeedModalState, Then trả về upgradeBlockedReason = "Chưa đến lượt của bạn"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      const p2: AffordancePlayer = {
        id: 'p2',
        name: 'Opponent',
        balance: 5000,
        ownedProperties: [],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1, p2 },
        currentTurnPlayerId: 'p2',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeBlockedReason).toBe('Chưa đến lượt của bạn');
    });

    it('[TC-276A.04/MSS][UC-IMP276A] Given ô 19 C0 đúng lượt chơi nhưng turnPhase === "WaitingRoll", When gọi resolveTitleDeedModalState, Then trả về upgradeBlockedReason = "Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        currentTurnPlayerId: 'p1',
        turnPhase: 'WaitingRoll',
      });

      expect(res.upgradeBlockedReason).toBe('Chỉ có thể nâng cấp trong giai đoạn Quản Lý Tài Sản');
    });
  });

  // ==========================================================================
  // FACET 3: Resource Disposal & Solvency (Solvency Check Under Rate Hike)
  // ==========================================================================
  describe('Facet 3: Resource Disposal & Solvency', () => {
    it('[TC-276A.05/MSS][UC-IMP276A] Given ô 19 C0 đúng lượt chơi, đúng pha PropertyManagement nhưng balance = 1100 < 1200, When gọi resolveTitleDeedModalState, Then trả về upgradeBlockedReason = "Cần 1200 Tr. VNĐ để nâng cấp"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 1100,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        activeModifiers: [{ type: 'MC_RATE_HIKE', remainingRounds: 2 }],
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeCost).toBe(1200);
      expect(res.upgradeBlockedReason).toBe('Cần 1200 Tr. VNĐ để nâng cấp');
    });

    it('[TC-276A.06/MSS][UC-IMP276A] Given ô 19 C0 đúng lượt chơi, đúng pha PropertyManagement và balance = 1200 >= 1200, When gọi resolveTitleDeedModalState, Then trả về upgradeBlockedReason = undefined', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 1200,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        activeModifiers: [{ type: 'MC_RATE_HIKE', remainingRounds: 2 }],
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeCost).toBe(1200);
      expect(res.upgradeBlockedReason).toBeUndefined();
    });
  });

  // ==========================================================================
  // FACET 4: Error Defense & Invariant Precedence (Rules Precede Solvency)
  // ==========================================================================
  describe('Facet 4: Error Defense & Invariant Precedence', () => {
    it('[TC-276A.07/A1][UC-IMP276A] Given ô 19 C0 người chơi chưa sở hữu đủ nhóm màu cam (thiếu ô 16), When gọi resolveTitleDeedModalState, Then upgradeBlockedReason ưu tiên giữ nguyên "Cần sở hữu trọn bộ màu trước khi nâng cấp" dù balance = 0', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 0,
        ownedProperties: [18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeBlockedReason).toBe('Cần sở hữu trọn bộ màu trước khi nâng cấp');
    });

    it('[TC-276A.08/A2][UC-IMP276A] Given ô 19 C0 đủ bộ màu nhưng ô 18 bị thế chấp, When gọi resolveTitleDeedModalState, Then upgradeBlockedReason ưu tiên giữ nguyên "Không thể nâng cấp khi nhóm có ô thế chấp"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
        mortgagedProperties: [18],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeBlockedReason).toBe('Không thể nâng cấp khi nhóm có ô thế chấp');
    });

    it('[TC-276A.09/MSS][UC-IMP276A] Given ô 19 đã đạt Cấp 3 tối đa, When gọi resolveTitleDeedModalState, Then trả về upgradeCost = 0 và upgradeBlockedReason = "Đã đạt cấp độ tối đa"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      const res: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        levelMap: { 19: 3 },
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      expect(res.upgradeCost).toBe(0);
      expect(res.upgradeBlockedReason).toBe('Đã đạt cấp độ tối đa');
    });
  });

  // ==========================================================================
  // FACET 5: Cross-Coupling Blast Radius & Component Parity
  // ==========================================================================
  describe('Facet 5: Cross-Coupling Blast Radius & Component Parity', () => {
    it('[TC-276A.10/MSS][UC-IMP276A] Given ô Utility (ô 12) và Railroad (ô 5), When gọi resolveTitleDeedModalState, Then bảo toàn nguyên vẹn chi phí và lý do chặn đặc quyền của Utility và Railroad', () => {
      const pUtility: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [12],
      };
      const utilityState: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        myPlayer: pUtility,
        playersInfo: { p1: pUtility },
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });
      expect(utilityState.upgradeCost).toBe(1000);
      expect(utilityState.upgradeBlockedReason).toBe('Cần sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) để nâng cấp');

      const pRailroad: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [5, 15],
      };
      const railroadState: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        myPlayer: pRailroad,
        playersInfo: { p1: pRailroad },
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });
      expect(railroadState.upgradeCost).toBe(3000);
    });

    it('[TC-276A.11/MSS][UC-IMP276A] Given ô 19 C0 dưới MC_RATE_HIKE, When render DeedModalHost với deedState, Then TitleDeedRentTable hiển thị Nâng cấp: +1.200 và TitleDeedActionFooter hiển thị (+1.200) (đồng bộ 100%, triệt tiêu Visual Split-Brain)', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 5000,
        ownedProperties: [16, 18, 19],
      };
      useGameStore.setState({
        activeModifiers: [{ type: 'MC_RATE_HIKE' as any, remainingRounds: 2 }],
        turnPhase: TurnPhase.PropertyManagement,
        currentTurnPlayerId: 'p1',
      });

      const html = renderToStaticMarkup(
        React.createElement(DeedModalHost, {
          payload: { cellIndex: 19 },
          myId: 'p1',
          myPlayer: p1 as any,
          playersInfo: { p1: p1 as any },
          closeModal: () => {},
          updateModalPayload: () => {},
        })
      );

      expect(html).toContain('Nâng cấp: +1.200');
      expect(html).toContain('(+1.200)');
    });


    it('[TC-276A.12/MSS][UC-IMP276A] Given ô 19 C0 dưới MC_RATE_HIKE và balance = 1100, When render TitleDeedActionFooter với deedState, Then nút nâng cấp hiển thị (+1.200) và thuộc tính disabled = true kèm title = "Cần 1200 Tr. VNĐ để nâng cấp"', () => {
      const p1: AffordancePlayer = {
        id: 'p1',
        name: 'Tester',
        balance: 1100,
        ownedProperties: [16, 18, 19],
      };
      const deedState: TitleDeedAffordanceResult = resolveTitleDeedModalState({
        cellIndex: 19,
        myId: 'p1',
        myPlayer: p1,
        playersInfo: { p1 },
        activeModifiers: [{ type: 'MC_RATE_HIKE', remainingRounds: 2 }],
        currentTurnPlayerId: 'p1',
        turnPhase: 'PropertyManagement',
      });

      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          hasUpgrades: true,
          currentLevel: 0,
          upgradeCost: deedState.upgradeCost,
          upgradeBlockedReason: deedState.upgradeBlockedReason,
          onUpgrade: () => {},
        })
      );

      expect(html).toContain('(+1.200)');
      expect(html).toContain('disabled=""');
      expect(html).toContain('title="Cần 1200 Tr. VNĐ để nâng cấp"');
    });
  });
});


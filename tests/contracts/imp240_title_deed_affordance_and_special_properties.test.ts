// [TC-IMP240.01/MSS..TC-IMP240.18/MSS][UC-IMP240] Universal 5-Facet Contract Suite:
// IMP-240: Title Deed Affordance & Special Properties Transparency Overhaul
// (Đại tu tính minh bạch và nút hành động Sổ Đỏ cho Tiện ích, Hạ tầng và Dịch vụ)
// Reference: docs/plans/improvements/IMP-240-title-deed-affordance-and-special-properties-transparency-overhaul_plan.md
// Domain Invariants: docs/domain/gotchas.md (Pillars I, II, IV, V)

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Server & Domain Models
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config.js';
import { PROPERTY_DEEDS } from '../../src/domain/property_data.js';
import type { Player } from '../../src/domain/types.js';
import { TurnPhase, type Room, createRoom } from '../../src/domain/room.js';
import {
  buildDeltaFromRoom,
  type DeltaPayload,
  type CellDelta,
  type PropertyRegistry,
  type PropertyStateMap,
} from '../../src/server/session_manager.js';
import { buildSparseDelta } from '../../src/server/network/delta_broadcaster.js';
import type { PlayerIntent } from '../../src/server/intent_dispatcher.js';

// Client Store & Modals
import { useGameStore } from '../../src/client/store/game_store.js';
import {
  resolveTitleDeedModalState,
  resolveEvenBuildRules,
  type AffordancePlayer,
} from '../../src/client/ui/modals/title_deed_affordance.js';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal.js';
import {
  TitleDeedActionFooter,
  type TitleDeedActionFooterProps,
} from '../../src/client/ui/modals/title_deed_action_footer.js';
import {
  TitleDeedRentTable,
  type TitleDeedRentTableProps,
} from '../../src/client/ui/modals/title_deed_rent_table.js';
import { ModalHost } from '../../src/client/ui/modals/modal_host.js';

declare module '../../src/client/ui/modals/title_deed_affordance.js' {
  interface AffordancePlayer {
    readonly tokenColor?: string;
  }
}

declare module '../../src/domain/property_data.js' {
  interface PropertyDeed {
    readonly rents?: readonly number[];
  }
}

// ============================================================================
// Clean VNode Inspector Harness (Zero Dirty Casts)
// ============================================================================
interface InspectableVNode {
  type?: unknown;
  props?: {
    children?: InspectableVNode | readonly InspectableVNode[] | string | number | null;
    'data-testid'?: string;
    onClick?: () => void;
    onUpgrade?: () => void;
    title?: string;
    disabled?: boolean;
    [key: string]: unknown;
  };
}

function findVNode(node: InspectableVNode | null, predicate: (n: InspectableVNode) => boolean): InspectableVNode | null {
  if (!node) return null;
  if (predicate(node)) return node;
  const children = node.props?.children;
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'object' && child !== null) {
        const res = findVNode(child as InspectableVNode, predicate);
        if (res) return res;
      }
    }
  } else if (children && typeof children === 'object') {
    return findVNode(children as InspectableVNode, predicate);
  }
  return null;
}

describe('[CONTRACT-TEST][TC-IMP240/MSS][UC-IMP240] Title Deed Affordance & Special Properties Transparency Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: null,
      modalPayload: null,
      playersInfo: {},
      levelMap: {},
      propertyStates: {},
      turnPhase: TurnPhase.WaitingRoll,
      currentTurnPlayerId: 'p1',
    });
  });

  // ==========================================================================
  // FACET 1: Core Functionality & Happy Paths (TC-IMP240.01..04)
  // ==========================================================================
  describe('Facet 1: Core Functionality & Happy Paths', () => {
    it('[TC-IMP240.01/MSS][UC-IMP240] EVN Ô 12 và Viettel Ô 28 hiển thị nút nâng cấp Smart Grid / 5G khi sở hữu và đủ tiền', () => {
      const deedState12 = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Đại Gia Điện Lực', balance: 5000, ownedProperties: [12] },
        },
      });
      expect(deedState12.hasUpgrades).toBe(true);
      expect(deedState12.ownerName).toBe('Đại Gia Điện Lực');

      const html12 = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          cellIndex: 12,
          isUtility: true,
          hasUpgrades: true,
          upgradeCost: 1000,
          onUpgrade: vi.fn(),
        })
      );
      expect(html12).toContain('Nâng Cấp Smart Grid (+1.000 Tr.)');
    });

    it('[TC-IMP240.02/MSS][UC-IMP240] 4 ô Hạ Tầng hiển thị nút Kích Hoạt ETC khi sở hữu >= 2 ga và tính đúng chi phí 1.500 Tr. x N ga', () => {
      const deedState2 = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Trùm Vận Tải', balance: 10000, ownedProperties: [5, 15] },
        },
      });
      expect(deedState2.hasUpgrades).toBe(true);
      expect(deedState2.upgradeCost).toBe(3000); // 1500 * 2

      const deedState3 = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Trùm Vận Tải', balance: 10000, ownedProperties: [5, 15, 25] },
        },
      });
      expect(deedState3.upgradeCost).toBe(4500); // 1500 * 3

      const deedState4 = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Trùm Vận Tải', balance: 10000, ownedProperties: [5, 15, 25, 35] },
        },
      });
      expect(deedState4.upgradeCost).toBe(6000); // 1500 * 4

      const html5 = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          cellIndex: 5,
          isRailroad: true,
          hasUpgrades: true,
          upgradeCost: 3000,
          onUpgrade: vi.fn(),
        })
      );
      expect(html5).toContain('Kích Hoạt ETC (+3.000 Tr.)');
    });

    it('[TC-IMP240.03/MSS][UC-IMP240] TitleDeedModal dispatch INTENT_UPGRADE_UTILITY khi người chơi bấm nâng cấp Tiện ích', () => {
      const onIntent = vi.fn();
      useGameStore.setState({
        activeModal: 'deed',
        modalPayload: { cellIndex: 12 },
        playersInfo: {
          p1: { id: 'p1', name: 'Chủ Tịch EVN', balance: 10000, ownedProperties: [12], tokenColor: '#10b981' },
        },
      });

      let hostVNode: InspectableVNode | null = null;
      renderToStaticMarkup(
        React.createElement(() => {
          hostVNode = ModalHost({ localPlayerId: 'p1', onIntent }) as InspectableVNode;
          return hostVNode as React.ReactElement;
        })
      );

      const deedModalNode = findVNode(hostVNode, (n) => n?.type === TitleDeedModal);
      deedModalNode?.props?.onUpgrade?.();

      expect(onIntent).toHaveBeenCalledWith({ type: 'INTENT_UPGRADE_UTILITY', cellIndex: 12 });
    });

    it('[TC-IMP240.04/MSS][UC-IMP240] TitleDeedModal dispatch INTENT_UPGRADE_ETC khi người chơi bấm nâng cấp Hạ tầng', () => {
      const onIntent = vi.fn();
      useGameStore.setState({
        activeModal: 'deed',
        modalPayload: { cellIndex: 5 },
        playersInfo: {
          p1: { id: 'p1', name: 'Chủ Tịch Ga Sài Gòn', balance: 10000, ownedProperties: [5, 15], tokenColor: '#3b82f6' },
        },
      });

      let hostVNode: InspectableVNode | null = null;
      renderToStaticMarkup(
        React.createElement(() => {
          hostVNode = ModalHost({ localPlayerId: 'p1', onIntent }) as InspectableVNode;
          return hostVNode as React.ReactElement;
        })
      );

      const deedModalNode = findVNode(hostVNode, (n) => n?.type === TitleDeedModal);
      deedModalNode?.props?.onUpgrade?.();

      expect(onIntent).toHaveBeenCalledWith({ type: 'INTENT_UPGRADE_ETC', cellIndex: 5 });
    });
  });

  // ==========================================================================
  // FACET 2: Edge Cases & Boundaries (TC-IMP240.05..08)
  // ==========================================================================
  describe('Facet 2: Edge Cases & Boundaries', () => {
    it('[TC-IMP240.05/A1][UC-IMP240] EVN Ô 12 và Viettel Ô 28 không hiển thị cảnh báo Cần sở hữu trọn bộ màu trước khi nâng cấp', () => {
      const state12Single = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12] },
        playersInfo: {
          p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12] },
        },
      });
      expect(state12Single.upgradeBlockedReason).not.toContain('trọn bộ màu');
      expect(state12Single.upgradeBlockedReason).toBe('Cần sở hữu trọn bộ cả 2 Tiện ích (EVN & Viettel) để nâng cấp');

      const state12Monopoly = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] },
        playersInfo: {
          p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [12, 28] },
        },
      });
      expect(state12Monopoly.upgradeBlockedReason).toBeUndefined();
    });

    it('[TC-IMP240.06/A2][UC-IMP240] 4 ô Hạ Tầng không hiển thị cảnh báo trọn bộ màu và yêu cầu sở hữu từ 2 ô Hạ Tầng để nâng cấp ETC', () => {
      const state1Ga = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [5] },
        },
      });
      expect(state1Ga.upgradeBlockedReason).not.toContain('trọn bộ màu');
      expect(state1Ga.upgradeBlockedReason).toBe('Cần sở hữu từ 2 ô Hạ Tầng trở lên để nâng cấp ETC');

      const state2Ga = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        myPlayer: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [5, 15] },
        playersInfo: {
          p1: { id: 'p1', name: 'Tester', balance: 5000, ownedProperties: [5, 15] },
        },
      });
      expect(state2Ga.upgradeBlockedReason).toBeUndefined();
    });

    it('[TC-IMP240.07/A3][UC-IMP240] Nút nâng cấp Utility bị disabled khi số dư người chơi < 1.000 Tr. kèm upgradeBlockedReason phản ánh thiếu tiền', () => {
      const deedState = resolveTitleDeedModalState({
        cellIndex: 12,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Tester Nghèo', balance: 500, ownedProperties: [12, 28] },
        },
      });
      expect(deedState.upgradeBlockedReason).toContain('1.000 Tr.');

      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          cellIndex: 12,
          isUtility: true,
          hasUpgrades: true,
          upgradeCost: 1000,
          upgradeBlockedReason: deedState.upgradeBlockedReason,
          onUpgrade: vi.fn(),
        })
      );
      expect(html).toContain('disabled');
    });

    it('[TC-IMP240.08/A4][UC-IMP240] Nút nâng cấp ETC bị disabled khi người chơi chỉ sở hữu 1 ga kèm upgradeBlockedReason phản ánh yêu cầu >= 2 ga', () => {
      const deedState = resolveTitleDeedModalState({
        cellIndex: 5,
        myId: 'p1',
        playersInfo: {
          p1: { id: 'p1', name: 'Tester Một Ga', balance: 5000, ownedProperties: [5] },
        },
      });
      expect(deedState.upgradeBlockedReason).toContain('Cần sở hữu từ 2 ô Hạ Tầng');

      const html = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          cellIndex: 5,
          isRailroad: true,
          hasUpgrades: true,
          upgradeCost: 1500,
          upgradeBlockedReason: deedState.upgradeBlockedReason,
          onUpgrade: vi.fn(),
        })
      );
      expect(html).toContain('disabled');
    });
  });

  // ==========================================================================
  // FACET 3: Terminology & Data Sanity (TC-IMP240.09..12)
  // ==========================================================================
  describe('Facet 3: Terminology & Data Sanity', () => {
    it('[TC-IMP240.09/MSS][UC-IMP240] TitleDeedRentTable của EVN Ô 12 hiển thị thông tin thu cước điện thụ động qua ô GO', () => {
      const deed = PROPERTY_DEEDS.get(12);
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 12,
          isUtility: true,
          isRailroad: false,
          rents: deed?.rents ?? [1000, 2500, 3500],
          upgradeCosts: deed?.upgradeCosts ?? [0, 0, 0],
        })
      );
      expect(html).toContain('ĐẶC QUYỀN MẠNG LƯỚI ĐIỆN QUỐC GIA');
      expect(html).toContain('C1: 100 Tr., C2: 200 Tr., C3: 300 Tr.');
    });

    it('[TC-IMP240.10/MSS][UC-IMP240] TitleDeedRentTable của Viettel Ô 28 hiển thị thông tin thu cước data di động 150 Tr.', () => {
      const deed = PROPERTY_DEEDS.get(28);
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 28,
          isUtility: true,
          isRailroad: false,
          rents: deed?.rents ?? [1000, 2500, 3500],
          upgradeCosts: deed?.upgradeCosts ?? [0, 0, 0],
        })
      );
      expect(html).toContain('ĐẶC QUYỀN VIỄN THÔNG VỆ TINH');
      expect(html).toContain('150 Tr. VNĐ');
    });

    it('[TC-IMP240.11/MSS][UC-IMP240] TitleDeedRentTable của 4 ô Hạ Tầng hiển thị thông tin Gói Cảng Thông Minh & ETC (+50%)', () => {
      const deed = PROPERTY_DEEDS.get(5);
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 5,
          isRailroad: true,
          isUtility: false,
          rents: deed?.rents ?? [250, 500, 1000, 2000],
          upgradeCosts: deed?.upgradeCosts ?? [0, 0, 0],
        })
      );
      expect(html).toContain('GÓI CẢNG THÔNG MINH &amp; ETC');
      expect(html).toContain('+50%');
    });

    it('[TC-IMP240.12/MSS][UC-IMP240] TitleDeedRentTable của 4 ô Dịch Vụ hiển thị huy hiệu Phụ Thu 1D6 và Giữ Chân Mất Lượt', () => {
      const deed = PROPERTY_DEEDS.get(6);
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 6,
          isRailroad: false,
          isUtility: false,
          rents: deed?.rents ?? [200, 600, 1500, 3000],
          upgradeCosts: deed?.upgradeCosts ?? [1000, 1000, 1000],
        })
      );
      expect(html).toContain('Phụ thu 1D6');
      expect(html).toContain('Giữ Chân Mất Lượt');
    });
  });

  // ==========================================================================
  // FACET 4: Regression Prevention (TC-IMP240.13..15)
  // ==========================================================================
  describe('Facet 4: Regression Prevention', () => {
    it('[TC-IMP240.13/MSS][UC-IMP240] Các ô Đô Thị và Nghỉ Dưỡng có nhóm màu vẫn tuân thủ 100% quy tắc xây dựng đều tay (Even-Building)', () => {
      const rulesUnmonopolized = resolveEvenBuildRules({
        isOwner: true,
        isMortgaged: false,
        hasAllProperties: false,
        hasAnyGroupMortgaged: false,
        currentLevel: 0,
        cellIndex: 1,
        groupCells: [1, 3],
        levelMap: { 1: 0, 3: 0 },
      });
      expect(rulesUnmonopolized.upgradeBlockedReason).toBe('Cần sở hữu trọn bộ màu trước khi nâng cấp');

      const rulesLagging = resolveEvenBuildRules({
        isOwner: true,
        isMortgaged: false,
        hasAllProperties: true,
        hasAnyGroupMortgaged: false,
        currentLevel: 1,
        cellIndex: 1,
        groupCells: [1, 3],
        levelMap: { 1: 1, 3: 0 },
      });
      expect(rulesLagging.upgradeBlockedReason).toContain('Quy tắc xây dựng đều tay');
    });

    it('[TC-IMP240.14/MSS][UC-IMP240] CellDelta và session_manager serialize đầy đủ cả isETC và isUpgradedUtility', () => {
      const room: Room = createRoom('p1', 'ROOM_SERIALIZE');
      const registry: PropertyRegistry = new Map([[12, 'p1'], [5, 'p1']]);
      const stateMap: PropertyStateMap = new Map([
        [12, { level: 0, isUpgradedUtility: true }],
        [5, { level: 0, isETC: true }],
      ]);

      const delta = buildDeltaFromRoom(room, registry, stateMap);
      const cell12 = delta.cells.find((c) => c.index === 12);
      const cell5 = delta.cells.find((c) => c.index === 5);

      expect(cell12?.isUpgradedUtility).toBe(true);
      expect(cell5?.isETC).toBe(true);
    });

    it('[TC-IMP240.15/MSS][UC-IMP240] delta_broadcaster phát hiện chính xác biến động và tombstone của isUpgradedUtility và isETC', () => {
      const prevDelta: DeltaPayload = {
        roomCode: 'ROOM_TOMBSTONE',
        tick: 1,
        cells: [
          { index: 12, ownerId: 'p1', level: 0, isUpgradedUtility: true },
          { index: 5, ownerId: 'p1', level: 0, isETC: true },
        ],
        players: [],
      };
      const nextDelta: DeltaPayload = {
        roomCode: 'ROOM_TOMBSTONE',
        tick: 2,
        cells: [
          { index: 12, ownerId: null, level: 0 },
          { index: 5, ownerId: null, level: 0 },
        ],
        players: [],
      };

      const sparse = buildSparseDelta(prevDelta, nextDelta);
      const tombstone12 = sparse.cells.find((c) => c.index === 12);
      const tombstone5 = sparse.cells.find((c) => c.index === 5);

      expect(tombstone12?.isUpgradedUtility).toBe(false);
      expect(tombstone5?.isETC).toBe(false);
    });
  });

  // ==========================================================================
  // FACET 5: Dual-Viewport & Ergonomics Integrity (TC-IMP240.16..18)
  // ==========================================================================
  describe('Facet 5: Dual-Viewport & Ergonomics Integrity', () => {
    it('[TC-IMP240.16/MSS][UC-IMP240] Các card thông tin đặc quyền hiển thị với text-[11px] và container an toàn trên mobile', () => {
      const html12 = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 12,
          isUtility: true,
          isRailroad: false,
          rents: [1000, 2500, 3500],
          upgradeCosts: [0, 0, 0],
        })
      );
      expect(html12).toContain('bg-amber-50/90 border border-amber-300 text-slate-800 text-[11px]');

      const html5 = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 5,
          isRailroad: true,
          isUtility: false,
          rents: [250, 500, 1000, 2000],
          upgradeCosts: [0, 0, 0],
        })
      );
      expect(html5).toContain('bg-blue-50/90 border border-blue-300 text-slate-800 text-[11px]');
    });

    it('[TC-IMP240.17/MSS][UC-IMP240] TitleDeedActionFooter chặn thế chấp minh bạch đối với ô Tiện ích hoặc Hạ tầng đã nâng cấp đặc quyền', () => {
      const htmlUtil = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          currentLevel: 0,
          isUpgradedUtility: true,
        })
      );
      expect(htmlUtil).toContain('title="Bất động sản đã nâng cấp đặc quyền không thể thế chấp"');

      const htmlRail = renderToStaticMarkup(
        React.createElement(TitleDeedActionFooter, {
          isOwned: true,
          isOwner: true,
          isMortgaged: false,
          currentLevel: 0,
          isETC: true,
        })
      );
      expect(htmlRail).toContain('title="Bất động sản đã nâng cấp đặc quyền không thể thế chấp"');
    });

    it('[TC-IMP240.18/MSS][UC-IMP240] Khi ô Tiện ích hoặc Hạ tầng đã được nâng cấp, TitleDeedRentTable hiển thị badge xác nhận trạng thái', () => {
      const htmlUtil = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 12,
          isUtility: true,
          isRailroad: false,
          isUpgradedUtility: true,
          rents: [1000, 2500, 3500],
          upgradeCosts: [0, 0, 0],
        })
      );
      expect(htmlUtil).toContain('ĐÃ NÂNG CẤP');

      const htmlRail = renderToStaticMarkup(
        React.createElement(TitleDeedRentTable, {
          cellIndex: 5,
          isRailroad: true,
          isUtility: false,
          isETC: true,
          rents: [250, 500, 1000, 2000],
          upgradeCosts: [0, 0, 0],
        })
      );
      expect(htmlRail).toContain('ĐÃ KÍCH HOẠT (+50%)');
    });
  });
});

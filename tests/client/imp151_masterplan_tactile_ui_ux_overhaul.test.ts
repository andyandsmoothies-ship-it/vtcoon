// [TC-IMP151/MSS][UC-GAME-009][IMP-151] Contract Test Suite for Urban Masterplan & 8-District Monopoly Radar Tactile UI/UX Overhaul
// (Sa Bàn Quy Hoạch Đô Thị & Radar 8 Phân Khu Độc Quyền — Chuẩn Tactile Antigravity 2.0)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it(), 20 atomic tests)
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MasterplanModal, type MasterplanModalProps } from '../../src/client/ui/modals/masterplan_modal';
import {
  MasterplanDistrictCard,
} from '../../src/client/ui/modals/masterplan_components';
import { DISTRICT_GROUPS } from '../../src/client/ui/modals/masterplan_constants';

/**
 * Extended props interface for MasterplanModal anticipating IMP-151 tactile capabilities
 */
export interface ExtendedMasterplanModalProps extends MasterplanModalProps {
  readonly myPlayerId?: string;
  readonly districtFilter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly initialFilter?: 'all' | 'near-monopoly' | 'monopoly' | 'vacant';
  readonly onQuickTrade?: (tradePayload: {
    readonly targetPlayerId: string;
    readonly offeredProperties: readonly number[];
    readonly requestedProperties: readonly number[];
    readonly cashOffer: number;
    readonly cashRequest: number;
  }) => void;
  readonly onSelectCell?: (cellIndex: number) => void;
}

/**
 * Helper to traverse React VDOM nodes to find target elements by predicate
 */
function findElementByProp(node: any, predicate: (props: any) => boolean): any {
  if (!node || typeof node !== 'object') return null;
  if (node.props && predicate(node.props)) return node;
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElementByProp(child, predicate);
      if (found) return found;
    }
  }
  if (node.props && node.props.children) {
    return findElementByProp(node.props.children, predicate);
  }
  return null;
}

function renderMasterplan(props: ExtendedMasterplanModalProps = {}): string {
  return renderToStaticMarkup(
    React.createElement(MasterplanModal as React.ComponentType<ExtendedMasterplanModalProps>, props)
  );
}

// Realistic test fixtures adhering to Saigon / Hanoi investor themes
const MOCK_PLAYERS_INFO: Record<string, any> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#c0392b',
    avatar: '🦁',
    ownedProperties: [1, 6, 8],
    mortgagedProperties: [],
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2980b9',
    avatar: '🦅',
    ownedProperties: [9, 11],
    mortgagedProperties: [11],
  },
  p3: {
    id: 'p3',
    name: 'Công Tử Bạc Liêu',
    tokenColor: '#27ae60',
    avatar: '🐯',
    ownedProperties: [],
    mortgagedProperties: [],
  },
};

function renderDistrictCard(
  districtId: string,
  players = MOCK_PLAYERS_INFO,
  myPlayerId?: string,
  customOwnership?: any
): string {
  const district = DISTRICT_GROUPS.find((d) => d.id === districtId)!;
  return renderToStaticMarkup(
    React.createElement(MasterplanDistrictCard, {
      district,
      players,
      myPlayerId,
      getCellOwnership: customOwnership ?? ((cellIndex: number) => {
        let owner: any = null;
        for (const p of Object.values(players)) {
          if ((p as any)?.ownedProperties?.includes(cellIndex)) {
            owner = p;
            break;
          }
        }
        return { owner, isMortgaged: false, level: 0 };
      }),
    })
  );
}

describe('[IMP-151: Trạm 1 RED] Urban Masterplan Tactile UI/UX Overhaul & 8-District Monopoly Radar', () => {

  // =========================================================================
  // Facet 1: Boundary & Layout (Vỏ modal rounded-3xl kem ngà, tactile shadow, ribbon, capsule switcher, filter cuộn ngang)
  // =========================================================================
  describe('Facet 1: Boundary & Layout', () => {
    it('[TC-IMP151.01/MSS][UC-GAME-009][IMP-151][Facet-1/Boundary] Vỏ ngoài Modal mang bo tròn rounded-3xl và nền kem ngà #FFFDF9', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });
      const modalMatch = html.match(/<div[^>]*data-testid="masterplan-modal"[^>]*class="([^"]*)"/)?.[1] ?? '';

      expect(modalMatch).toContain('rounded-3xl');
      expect(modalMatch).toMatch(/bg-\[#FFFDF9\]|#FFFDF9/i);
    });

    it('[TC-IMP151.02/MSS][UC-GAME-009][IMP-151][Facet-1/Boundary] Vỏ ngoài Modal thỏa mãn regex bóng đổ tactile /shadow-\\[0_\\d+px_0_0_#\\w+\\]/ (khớp với TC-132.18)', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });
      const modalMatch = html.match(/<div[^>]*data-testid="masterplan-modal"[^>]*class="([^"]*)"/)?.[1] ?? '';

      expect(modalMatch).toMatch(/shadow-\[0_\d+px_0_0_#\w+\]/);
    });

    it('[TC-IMP151.03/MSS][UC-GAME-009][IMP-151][Facet-1/Boundary] Mỗi thẻ phân khu MasterplanDistrictCard có dải ruy-băng phân khu mang backgroundColor: district.hexColor', () => {
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: () => ({ owner: null, isMortgaged: false, level: 0 }),
      });

      const ribbon = findElementByProp(
        vdom,
        (p: any) => p['data-testid'] === 'district-ribbon' || p['data-testid'] === 'district-color-ribbon'
      );
      expect(ribbon).not.toBeNull();
      expect(ribbon?.props?.style?.backgroundColor).toBe(districtXanhDaTroi.hexColor);
    });

    it('[TC-IMP151.04/MSS][UC-GAME-009][IMP-151][Facet-1/Boundary] Header modal sở hữu nền kem ngà bg-[#FBF8F1] với viền hổ phách mờ border-amber-900/10', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });
      const headerMatch = html.match(/<header[^>]*class="([^"]*)"/)?.[1] ?? '';

      expect(headerMatch).toContain('bg-[#FBF8F1]');
      expect(headerMatch).toMatch(/border-amber/);
    });

    it('[TC-IMP151.05/MSS][UC-GAME-009][IMP-151][Facet-1/Boundary] MasterplanModal tinh giản không còn render thanh lọc phân loại (Filter Bar)', () => {
      const html = renderMasterplan({
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).not.toContain('data-testid="district-filter-bar"');
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Natural Language (Slot pills, vacant dashed, huy hiệu 2/3, 👑 Độc Quyền, tokenColor, thế chấp)
  // =========================================================================
  describe('Facet 2: State Reactivity & Natural Language', () => {
    it('[TC-IMP151.06/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Thanh tiến độ phân đoạn district-progress-bar-{id} sử dụng các slot pills cách nhau (gap-1.5 hoặc gap-1), chiều cao đồng bộ', () => {
      const html = renderDistrictCard('XanhDaTroi');
      const progressBarMatch = html.match(/<div[^>]*data-testid="district-progress-bar-XanhDaTroi"[^>]*class="([^"]*)"/)?.[1] ?? '';

      expect(progressBarMatch).toMatch(/gap-(1|1\.5)/);
      expect(progressBarMatch).toMatch(/h-(2\.5|3|3\.5|4)/);
    });

    it('[TC-IMP151.07/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Slot trống trong thanh tiến độ mang thuộc tính data-vacant="true" và viền nét đứt', () => {
      const html = renderDistrictCard('Hong');
      const vacantSegment = html.match(/<div[^>]*data-testid="district-progress-segment-13"[^>]*class="([^"]*)"[^>]*>/)?.[0] ?? '';

      expect(vacantSegment).toContain('data-vacant="true"');
      expect(vacantSegment).toContain('border-dashed');
    });

    it('[TC-IMP151.08/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Khi phân khu sắp độc quyền, huy hiệu trạng thái hiển thị ⚡ Sắp Độc Quyền VÀ bảo tồn chuỗi tỉ lệ 2/3 (khớp TC-132.09)', () => {
      const html = renderDistrictCard('XanhDaTroi');

      expect(html).toContain('⚡ Sắp Độc Quyền');
      expect(html).toMatch(/data-near-monopoly="true"[^>]*>[\s\S]*?2\/3[\s\S]*?<\/span>/);
    });

    it('[TC-IMP151.09/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Khi phân khu độc quyền, hiển thị huy hiệu 👑 Độc Quyền kèm tên chủ sở hữu', () => {
      const monopolyPlayers = {
        ...MOCK_PLAYERS_INFO,
        p1: { ...MOCK_PLAYERS_INFO.p1, ownedProperties: [1, 3, 6, 8, 9] },
      };
      const html = renderDistrictCard('XanhDaTroi', monopolyPlayers);

      expect(html).toContain('data-monopoly="true"');
      expect(html).toMatch(/👑\s*Độc Quyền.*Đại Gia Sài Gòn/);
    });

    it('[TC-IMP151.10/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Container hàng BĐS data-testid="district-cell-{cellIndex}" giữ thuộc tính style chứa owner.tokenColor (khớp TC-137.09)', () => {
      const html = renderDistrictCard('XanhDaTroi');

      expect(html).toMatch(/data-testid="district-cell-6"[^>]*style="[^"]*#c0392b/);
    });

    it('[TC-IMP151.11/MSS][UC-GAME-009][IMP-151][Facet-2/Reactivity] Hàng BĐS đang thế chấp hiển thị rõ nhãn thế chấp 🔒 Thế Chấp và data-mortgaged="true"', () => {
      const html = renderDistrictCard('Hong', MOCK_PLAYERS_INFO, undefined, (cellIndex: number) => {
        if (cellIndex === 11) return { owner: MOCK_PLAYERS_INFO.p2, isMortgaged: true, level: 0 };
        return { owner: null, isMortgaged: false, level: 0 };
      });
      const mortgagedCell = html.match(/<div[^>]*data-testid="district-cell-11"[^>]*>[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

      expect(mortgagedCell).toContain('data-mortgaged="true"');
      expect(mortgagedCell).toContain('🔒 Thế Chấp');
    });
  });

  // =========================================================================
  // Facet 3: Disposal & Actionability (Clickable row, stopPropagation nút trade & view, touch targets)
  // =========================================================================
  describe('Facet 3: Disposal & Actionability', () => {
    it('[TC-IMP151.12/MSS][UC-GAME-009][IMP-151][Facet-3/Disposal] Hàng BĐS là clickable row: nhấp vào hàng BĐS kích hoạt onSelectCell(cellIndex) và onClose()', () => {
      const onSelectCell = vi.fn();
      const onClose = vi.fn();
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: () => ({ owner: null, isMortgaged: false, level: 0 }),
        onSelectCell,
        onClose,
      });

      const row = findElementByProp(vdom, (p: any) => p['data-testid'] === 'district-cell-6');
      expect(row).not.toBeNull();
      expect(row?.props?.onClick).toBeDefined();

      row?.props?.onClick?.();
      expect(onSelectCell).toHaveBeenCalledWith(6);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP151.13/MSS][UC-GAME-009][IMP-151][Facet-3/Disposal] Nút [🤝] (quick-trade-btn) có cơ chế chặn event bubbling (e.stopPropagation()): chỉ gọi onQuickTrade, KHÔNG kích hoạt onSelectCell hay onClose', () => {
      const onQuickTrade = vi.fn();
      const onSelectCell = vi.fn();
      const onClose = vi.fn();
      const stopPropagation = vi.fn();
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: (cellIndex: number) => {
          if (cellIndex === 9) return { owner: MOCK_PLAYERS_INFO.p2, isMortgaged: false, level: 0 };
          return { owner: null, isMortgaged: false, level: 0 };
        },
        myPlayerId: 'p1',
        onQuickTrade,
        onSelectCell,
        onClose,
      });

      const quickTradeBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'quick-trade-btn-9');
      expect(quickTradeBtn).not.toBeNull();

      quickTradeBtn?.props?.onClick?.({ stopPropagation });
      expect(stopPropagation).toHaveBeenCalledTimes(1);
      expect(onQuickTrade).toHaveBeenCalledTimes(1);
      expect(onSelectCell).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('[TC-IMP151.14/MSS][UC-GAME-009][IMP-151][Facet-3/Disposal] Nút [👁️] (view-cell-btn) có cơ chế chặn event bubbling (e.stopPropagation()): gọi đúng onSelectCell(cellIndex) và onClose()', () => {
      const onSelectCell = vi.fn();
      const onClose = vi.fn();
      const stopPropagation = vi.fn();
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: () => ({ owner: null, isMortgaged: false, level: 0 }),
        onSelectCell,
        onClose,
      });

      const viewBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'view-cell-btn-6');
      expect(viewBtn).not.toBeNull();

      viewBtn?.props?.onClick?.({ stopPropagation });
      expect(stopPropagation).toHaveBeenCalledTimes(1);
      expect(onSelectCell).toHaveBeenCalledWith(6);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('[TC-IMP151.15/MSS][UC-GAME-009][IMP-151][Facet-3/Disposal] Nút [👁️] và nút [🤝] đạt chuẩn touch target tối thiểu min-h-[36px] min-w-[36px] kèm tooltip title', () => {
      const html = renderDistrictCard('XanhDaTroi', MOCK_PLAYERS_INFO, 'p1', (cellIndex: number) => {
        if (cellIndex === 6) return { owner: MOCK_PLAYERS_INFO.p1, isMortgaged: false, level: 0 };
        if (cellIndex === 9) return { owner: MOCK_PLAYERS_INFO.p2, isMortgaged: false, level: 0 };
        return { owner: null, isMortgaged: false, level: 0 };
      });

      expect(html).toMatch(/data-testid="view-cell-btn-6"[^>]*min-h-\[36px\]/);
      expect(html).toMatch(/data-testid="view-cell-btn-6"[^>]*title=/);
      expect(html).toMatch(/data-testid="quick-trade-btn-9"[^>]*min-h-\[36px\]/);
      expect(html).toMatch(/data-testid="quick-trade-btn-9"[^>]*title=/);
    });

    it('[TC-IMP151.18/MSS][UC-GAME-009][IMP-151][Facet-3/Disposal] Consumer-side: Nhấp vào hàng BĐS có chủ kích hoạt đúng onSelectCell với cellIndex tương ứng và đóng modal', () => {
      const onSelectCell = vi.fn();
      const onClose = vi.fn();
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: (cellIndex: number) => {
          if (cellIndex === 6) return { owner: MOCK_PLAYERS_INFO.p1, isMortgaged: false, level: 0 };
          return { owner: null, isMortgaged: false, level: 0 };
        },
        onSelectCell,
        onClose,
      });

      const row = findElementByProp(vdom, (p: any) => p['data-testid'] === 'district-cell-6');
      expect(row).not.toBeNull();

      row?.props?.onClick?.();
      expect(onSelectCell).toHaveBeenCalledWith(6);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Facet 4: Error Defense & Contract Integrity (Kế thừa testids, 0 exception, fallback ô trống)
  // =========================================================================
  describe('Facet 4: Error Defense & Contract Integrity', () => {
    it('[TC-IMP151.16a/MSS][UC-GAME-009][IMP-151][Facet-4/ErrorDefense] Bảo toàn các testids cấp modal: masterplan-modal, masterplan-blueprint-grid', () => {
      const html = renderMasterplan({
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="masterplan-modal"');
      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
      expect(html).not.toContain('data-testid="tab-districts"');
    });

    it('[TC-IMP151.16b/MSS][UC-GAME-009][IMP-151][Facet-4/ErrorDefense] Bảo toàn các testids cấp ô và hành động kế thừa: district-progress-bar-{id}, district-cell-{cellIndex}, view-cell-btn-{cellIndex}, quick-trade-btn-{cellIndex}', () => {
      const html = renderDistrictCard('XanhDaTroi', MOCK_PLAYERS_INFO, 'p1');

      expect(html).toContain('data-testid="district-progress-bar-XanhDaTroi"');
      expect(html).toContain('data-testid="district-cell-6"');
      expect(html).toContain('data-testid="view-cell-btn-6"');
      expect(html).toContain('data-testid="quick-trade-btn-9"');
    });

    it('[TC-IMP151.17/MSS][UC-GAME-009][IMP-151][Facet-4/ErrorDefense] Modal render an toàn 0 exception khi playersInfo = {} và propertyStates = {}', () => {
      let html = '';
      expect(() => {
        html = renderMasterplan({ playersInfo: {}, propertyStates: {} });
      }).not.toThrow();
      expect(html).toContain('data-testid="masterplan-modal"');
    });

    it('[TC-IMP151.19/MSS][UC-GAME-009][IMP-151][Facet-4/ErrorDefense] Thẻ phân khu xử lý an toàn 0 crash khi toàn bộ các ô trong phân khu đều là đất trống', () => {
      const districtNau = DISTRICT_GROUPS.find((d) => d.id === 'Nau')!;
      let markup = '';
      expect(() => {
        markup = renderToStaticMarkup(
          React.createElement(MasterplanDistrictCard, {
            district: districtNau,
            players: {},
            getCellOwnership: () => ({ owner: null, isMortgaged: false, level: 0 }),
          })
        );
      }).not.toThrow();
      expect(markup).toContain('data-district="Nau"');
    });

    it('[TC-IMP151.20/MSS][UC-GAME-009][IMP-151][Facet-4/ErrorDefense] Thẻ phân khu an toàn khi propertyStates tham chiếu ownerId không tồn tại trong playersInfo', () => {
      let markup = '';
      expect(() => {
        markup = renderDistrictCard('XanhDaTroi', {}, undefined, (cellIndex: number) => {
          if (cellIndex === 6) return { owner: { id: 'ghost_player_99', name: 'Ghost', tokenColor: '#fff' }, isMortgaged: false, level: 0 };
          return { owner: null, isMortgaged: false, level: 0 };
        });
      }).not.toThrow();
      expect(markup).toContain('data-testid="district-cell-6"');
    });
  });
});

// [TC-IMP137/MSS][UC-GAME-009][IMP-137] Contract Test Suite for Urban Masterplan District Monopoly Radar Overhaul
// (Sa Bàn Quy Hoạch Đô Thị: Radar Phân Khu & Độc Quyền Trực Quan)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MasterplanModal, type MasterplanModalProps } from '../../src/client/ui/modals/masterplan_modal';
import {
  MasterplanDistrictCard,
  type MasterplanDistrictCardProps,
} from '../../src/client/ui/modals/masterplan_components';
import { DISTRICT_GROUPS } from '../../src/client/ui/modals/masterplan_constants';

/**
 * Extended props interface for MasterplanModal anticipating IMP-137 capabilities
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

describe('[IMP-137: Trạm 1 RED] Urban Masterplan District Monopoly Radar Overhaul', () => {

  // =========================================================================
  // Facet 1: Boundary & Layout (Mặc định phân khu, fallback sa bàn, filter bar, progress bar)
  // =========================================================================
  describe('Facet 1: Boundary & Layout', () => {
    it('[TC-IMP137.01/MSS][UC-GAME-009][IMP-137][Facet-1/Boundary] Mặc định mở tab "districts" khi không truyền initialTab và không có selectedCellIndex', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toContain('data-testid="masterplan-districts-grid"');
      expect(html).not.toContain('data-testid="masterplan-blueprint-grid"');
    });

    it('[TC-IMP137.02/A1][UC-GAME-009][IMP-137][Facet-1/Boundary] Fallback mở tab "blueprint" khi có selectedCellIndex để bảo toàn Inspector Card', () => {
      const html = renderMasterplan({
        selectedCellIndex: 1,
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
      expect(html).toContain('data-testid="masterplan-cell-inspector"');
    });

    it('[TC-IMP137.03/MSS][UC-GAME-009][IMP-137][Facet-1/Boundary] Hiển thị thanh lọc phân loại (Filter Bar) với 4 bộ lọc: Tất Cả, Sắp Độc Quyền, Đã Độc Quyền, Còn Đất Trống', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="district-filter-bar"');
      expect(html).toMatch(/Tất Cả.*Sắp Độc Quyền.*Đã Độc Quyền.*Còn Đất Trống/s);
    });

    it('[TC-IMP137.04/MSS][UC-GAME-009][IMP-137][Facet-1/Boundary] Mỗi phân khu render thanh tiến độ phân đoạn data-testid="district-progress-bar" với số phân đoạn bằng đúng district.cellIndices.length', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="district-progress-bar-XanhDaTroi"');
      expect(html).toContain('data-testid="district-progress-segment-6"');
      expect(html).toContain('data-testid="district-progress-segment-8"');
      expect(html).toContain('data-testid="district-progress-segment-9"');
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Monopoly Radar (Tiến độ màu sắc, huy hiệu, tint màu, lọc)
  // =========================================================================
  describe('Facet 2: State Reactivity & Monopoly Radar', () => {
    it('[TC-IMP137.05/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Phân đoạn tiến độ hiển thị đúng màu tokenColor của chủ sở hữu hoặc màu xám nhạt khi còn trống', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toMatch(/data-testid="district-progress-segment-11"[^>]*#2980b9/);
      expect(html).toMatch(/data-testid="district-progress-segment-13"[^>]*(bg-slate-200|#e2e8f0|data-vacant)/);
    });

    it('[TC-IMP137.06/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Khi một người chơi sở hữu N-1 ô (ví dụ 2/3 ô Đông Nam Bộ), hiển thị huy hiệu ⚡ Sắp Độc Quyền', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('⚡ Sắp Độc Quyền');
      expect(html).toContain('data-near-monopoly="true"');
    });

    it('[TC-IMP137.07/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Khi phân khu đã trọn bộ độc quyền, hiển thị huy hiệu 👑 Độc Quyền kèm tên chủ sở hữu', () => {
      const monopolyPlayers = {
        ...MOCK_PLAYERS_INFO,
        p1: { ...MOCK_PLAYERS_INFO.p1, ownedProperties: [1, 3, 6, 8] },
      };
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: monopolyPlayers,
      });

      expect(html).toContain('data-monopoly="true"');
      expect(html).toMatch(/👑\s*Độc Quyền.*Đại Gia Sài Gòn/);
    });

    it('[TC-IMP137.08/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Khi phân khu chưa ai mua ô nào, hiển thị nhãn trạng thái đất trống', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="district-status-vacant-Cam"');
      expect(html).toMatch(/Đất Trống|Chưa Có Chủ/i);
    });

    it('[TC-IMP137.09/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Thẻ ô BĐS đã có chủ được phủ nhẹ màu nhận diện của chủ sở hữu qua style background/border', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toMatch(/data-testid="district-cell-6"[^>]*style="[^"]*#c0392b/);
    });

    it('[TC-IMP137.10/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Tên chủ sở hữu trên thẻ ô BĐS không bị giới hạn cứng max-w-[50px]', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).not.toContain('max-w-[50px]');
    });

    it('[TC-IMP137.11/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Lọc theo tab Sắp Độc Quyền chỉ hiển thị các phân khu thỏa mãn điều kiện gần độc quyền', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
        districtFilter: 'near-monopoly',
      });

      expect(html).toContain('data-district="XanhDaTroi"');
      expect(html).not.toContain('data-district="Cam"');
    });

    it('[TC-IMP137.12/MSS][UC-GAME-009][IMP-137][Facet-2/Reactivity] Lọc theo tab Còn Đất Trống chỉ hiển thị các phân khu còn ô chưa bán', () => {
      const monopolyPlayers = {
        ...MOCK_PLAYERS_INFO,
        p1: { ...MOCK_PLAYERS_INFO.p1, ownedProperties: [1, 3] },
      };
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: monopolyPlayers,
        districtFilter: 'vacant',
      });

      expect(html).toContain('data-district="Cam"');
      expect(html).not.toContain('data-district="Nau"');
    });
  });

  // =========================================================================
  // Facet 3: Disposal & Actionability (Nút đổi đất nhanh, nút soi ô sa bàn)
  // =========================================================================
  describe('Facet 3: Disposal & Actionability', () => {
    it('[TC-IMP137.13/MSS][UC-GAME-009][IMP-137][Facet-3/Disposal] Nút [🤝] hoặc data-testid="quick-trade-btn-{cellIndex}" chỉ hiển thị cho ô của đối thủ (owner.id !== myPlayerId)', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
        myPlayerId: 'p1',
      });

      expect(html).not.toContain('data-testid="quick-trade-btn-6"');
      expect(html).toContain('data-testid="quick-trade-btn-9"');
    });

    it('[TC-IMP137.14/MSS][UC-GAME-009][IMP-137][Facet-3/Disposal] Nhấp nút Đổi Đất gọi onQuickTrade hoặc openModal("trade", ...) truyền đủ 5 trường bắt buộc với requestedProperties: [cellIndex]', () => {
      const onQuickTrade = vi.fn();
      const districtXanhDaTroi = DISTRICT_GROUPS.find((d) => d.id === 'XanhDaTroi')!;
      const vdom = (MasterplanDistrictCard as any)({
        district: districtXanhDaTroi,
        players: MOCK_PLAYERS_INFO,
        getCellOwnership: (cellIndex: number) => {
          if (cellIndex === 6 || cellIndex === 8) return { owner: MOCK_PLAYERS_INFO.p1, isMortgaged: false, level: 0 };
          if (cellIndex === 9) return { owner: MOCK_PLAYERS_INFO.p2, isMortgaged: false, level: 0 };
          return { owner: null, isMortgaged: false, level: 0 };
        },
        myPlayerId: 'p1',
        onQuickTrade,
      });

      const quickTradeBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'quick-trade-btn-9');
      expect(quickTradeBtn).not.toBeNull();
      quickTradeBtn?.props?.onClick?.();

      expect(onQuickTrade).toHaveBeenCalledWith({
        targetPlayerId: 'p2',
        offeredProperties: [],
        requestedProperties: [9],
        cashOffer: 0,
        cashRequest: 0,
      });
    });

    it('[TC-IMP137.15/MSS][UC-GAME-009][IMP-137][Facet-3/Disposal] Nút [👁️] hoặc data-testid="view-cell-btn-{cellIndex}" gọi onSelectCell (truyền cellIndex) và kích hoạt onClose để giải phóng modal lộ sa bàn 3D', () => {
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
        myPlayerId: 'p1',
        onSelectCell,
        onClose,
      });

      const viewBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'view-cell-btn-6');
      expect(viewBtn).not.toBeNull();
      viewBtn?.props?.onClick?.();

      expect(onSelectCell).toHaveBeenCalledWith(6);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // Facet 4: Error Defense & Invariants (0 Exception, kế thừa selector, touch target)
  // =========================================================================
  describe('Facet 4: Error Defense & Invariants', () => {
    it('[TC-IMP137.16/MSS][UC-GAME-009][IMP-137][Facet-4/ErrorDefense] Render an toàn 0 exception khi playersInfo rỗng hoặc propertyStates rỗng', () => {
      const html = renderMasterplan({
        playersInfo: {},
        propertyStates: {},
      });

      expect(html).toContain('data-testid="masterplan-modal"');
      expect(html).toContain('data-testid="masterplan-districts-grid"');
    });

    it('[TC-IMP137.17/MSS][UC-GAME-009][IMP-137][Facet-4/ErrorDefense] Bảo toàn các selector kế thừa: data-testid="tab-districts", data-testid="masterplan-districts-grid", data-district="Nau", data-district="Railroad", data-district="Utility"', () => {
      const html = renderMasterplan({ initialTab: 'districts' });

      expect(html).toContain('data-testid="tab-districts"');
      expect(html).toContain('data-testid="masterplan-districts-grid"');
      expect(html).toContain('data-district="Nau"');
      expect(html).toMatch(/data-district="Railroad".*data-district="Utility"/s);
    });

    it('[TC-IMP137.18/MSS][UC-GAME-009][IMP-137][Facet-4/ErrorDefense] Các nút hành động [👁️] và [🤝] đạt chuẩn touch target tối thiểu min-h-[36px] min-w-[36px] kèm tooltip title', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO,
        myPlayerId: 'p1',
      });

      expect(html).toMatch(/data-testid="view-cell-btn-6"[^>]*min-h-\[36px\]/);
      expect(html).toMatch(/data-testid="view-cell-btn-6"[^>]*title=/);
      expect(html).toMatch(/data-testid="quick-trade-btn-9"[^>]*min-h-\[36px\]/);
      expect(html).toMatch(/data-testid="quick-trade-btn-9"[^>]*title=/);
    });
  });
});

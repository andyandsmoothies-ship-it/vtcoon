// [TC-152/MSS][UC-GAME-009][IMP-152] Contract Test Suite for Masterplan Filter Tabs Empty State & Smooth Navigation Polish
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it(), 15 atomic tests)
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MasterplanModal, type MasterplanModalProps } from '../../src/client/ui/modals/masterplan_modal';
import * as Components from '../../src/client/ui/modals/masterplan_components';
import { DISTRICT_GROUPS, type DistrictGroupDef } from '../../src/client/ui/modals/masterplan_constants';

/**
 * Extended props interface anticipating IMP-152 empty state & filter enhancements
 */
export interface ExtendedMasterplanModalProps extends MasterplanModalProps {
  readonly districts?: readonly DistrictGroupDef[];
  readonly onFilterChange?: (filter: 'all' | 'near-monopoly' | 'monopoly' | 'vacant') => void;
}

/**
 * Traversal helper to find React elements in a VDOM tree matching predicate
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

// Realistic fixtures reflecting Saigon & Hanoi tycoon profiles
const MOCK_PLAYERS_INFO: Record<string, any> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#c0392b',
    avatar: '🦁',
    ownedProperties: [],
    mortgagedProperties: [],
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2980b9',
    avatar: '🦅',
    ownedProperties: [],
    mortgagedProperties: [],
  },
};

describe('[IMP-152: Trạm 1 RED] Masterplan Filter Tabs Empty State & Smooth Navigation Polish', () => {

  // =========================================================================
  // Facet 1: Boundary & Range (Badge Counters Accuracy)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Badge Counters Accuracy)', () => {
    it('[TC-152.01/MSS][UC-GAME-009][IMP-152][Facet-1/Boundary] Ban đầu chưa ai sở hữu BĐS: badge all=10, near-monopoly=0, monopoly=0, vacant=10', () => {
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: MOCK_PLAYERS_INFO });

      const allBadge = html.match(/<span[^>]*data-testid="district-filter-badge-all"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const nearMonopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-near-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const monopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const vacantBadge = html.match(/<span[^>]*data-testid="district-filter-badge-vacant"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();

      expect(allBadge).toBe('10');
      expect(nearMonopolyBadge).toBe('0');
      expect(monopolyBadge).toBe('0');
      expect(vacantBadge).toBe('10');
    });

    it('[TC-152.02/MSS][UC-GAME-009][IMP-152][Facet-1/Boundary] P1 sở hữu cận kề độc quyền ô Nâu (totalCells - 1): badge near-monopoly=1, monopoly=0', () => {
      const nau = DISTRICT_GROUPS.find((d) => d.id === 'Nau')!;
      const targetIndices = nau.cellIndices.slice(0, Math.max(1, nau.cellIndices.length - 1));
      const players = {
        p1: {
          ...MOCK_PLAYERS_INFO.p1,
          ownedProperties: targetIndices,
        },
      };
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: players });

      const nearMonopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-near-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const monopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();

      expect(nearMonopolyBadge).toBe('1');
      expect(monopolyBadge).toBe('0');
    });

    it('[TC-152.03/MSS][UC-GAME-009][IMP-152][Facet-1/Boundary] P1 sở hữu trọn bộ ô Nâu (toàn bộ totalCells): badge near-monopoly=0, monopoly=1', () => {
      const nau = DISTRICT_GROUPS.find((d) => d.id === 'Nau')!;
      const players = {
        p1: {
          ...MOCK_PLAYERS_INFO.p1,
          ownedProperties: [...nau.cellIndices],
        },
      };
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: players });

      const nearMonopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-near-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const monopolyBadge = html.match(/<span[^>]*data-testid="district-filter-badge-monopoly"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();

      expect(nearMonopolyBadge).toBe('0');
      expect(monopolyBadge).toBe('1');
    });

    it('[TC-152.04/MSS][UC-GAME-009][IMP-152][Facet-1/Boundary] Khi toàn bộ 28 BĐS/Hạ tầng/Tiện ích đã có chủ: badge vacant=0, all=10', () => {
      const allPurchasableIndices = DISTRICT_GROUPS.flatMap((d) => d.cellIndices);
      const players = {
        p1: {
          ...MOCK_PLAYERS_INFO.p1,
          name: 'Trùm Địa Ốc',
          ownedProperties: allPurchasableIndices,
        },
      };
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: players });

      const vacantBadge = html.match(/<span[^>]*data-testid="district-filter-badge-vacant"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();
      const allBadge = html.match(/<span[^>]*data-testid="district-filter-badge-all"[^>]*>([\s\S]*?)<\/span>/)?.[1]?.trim();

      expect(vacantBadge).toBe('0');
      expect(allBadge).toBe('10');
    });

    it('[TC-152.05/MSS][UC-GAME-009][IMP-152][Facet-1/Boundary] Mỗi badge số lượng sở hữu attribute data-testid="district-filter-badge-${id}" với kiểu dáng capsule rõ ràng', () => {
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: MOCK_PLAYERS_INFO });

      const filterIds = ['all', 'near-monopoly', 'monopoly', 'vacant'] as const;
      const allExist = filterIds.every((id) => html.includes(`data-testid="district-filter-badge-${id}"`));
      expect(allExist).toBe(true);

      const allBadgeTag = html.match(/<span[^>]*data-testid="district-filter-badge-all"[^>]*class="([^"]*)"/)?.[1] ?? '';
      expect(allBadgeTag).toMatch(/rounded-(full|xl|2xl|md)/);
      expect(allBadgeTag).toMatch(/px-(1|1\.5|2|2\.5)/);
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity (Empty State Rendering)
  // =========================================================================
  describe('Facet 2: State Reactivity (Empty State Rendering)', () => {
    it('[TC-152.06/MSS][UC-GAME-009][IMP-152][Facet-2/Reactivity] Khi activeFilter=near-monopoly và count=0: render data-testid="masterplan-empty-state" với icon 🛡️ và tiêu đề Chưa Có Phân Khu Cận Kề Độc Quyền', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'near-monopoly',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="masterplan-empty-state"');
      expect(html).toContain('🛡️');
      expect(html).toContain('Chưa Có Phân Khu Cận Kề Độc Quyền');
    });

    it('[TC-152.07/MSS][UC-GAME-009][IMP-152][Facet-2/Reactivity] Khi activeFilter=monopoly và count=0: render tiêu đề chứa Chưa Có Phân Khu Nào Đạt Độc Quyền và icon 🏛️', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'monopoly',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="masterplan-empty-state"');
      expect(html).toContain('🏛️');
      expect(html).toContain('Chưa Có Phân Khu Nào Đạt Độc Quyền');
    });

    it('[TC-152.08/MSS][UC-GAME-009][IMP-152][Facet-2/Reactivity] Khi activeFilter=vacant và count=0: render tiêu đề chứa Toàn Bộ Đô Thị Đã Được Phủ Kín! và icon 🏙️', () => {
      const allPurchasableIndices = DISTRICT_GROUPS.flatMap((d) => d.cellIndices);
      const players = {
        p1: {
          ...MOCK_PLAYERS_INFO.p1,
          ownedProperties: allPurchasableIndices,
        },
      };
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'vacant',
        playersInfo: players,
      });

      expect(html).toContain('data-testid="masterplan-empty-state"');
      expect(html).toContain('🏙️');
      expect(html).toContain('Toàn Bộ Đô Thị Đã Được Phủ Kín!');
    });

    it('[TC-152.09/MSS][UC-GAME-009][IMP-152][Facet-2/Reactivity] Khi activeFilter=all mà không có data: render fallback tiêu đề Không Có Dữ Liệu Phân Khu và icon 🗺️', () => {
      const EmptyState = (Components as any).MasterplanEmptyState;
      const html = EmptyState
        ? renderToStaticMarkup(React.createElement(EmptyState, { activeFilter: 'all', onReset: vi.fn(), totalDistricts: 0 }))
        : renderMasterplan({ initialTab: 'districts', initialFilter: 'all', districts: [] });

      expect(html).toContain('data-testid="masterplan-empty-state"');
      expect(html).toContain('🗺️');
      expect(html).toContain('Không Có Dữ Liệu Phân Khu');
    });
  });

  // =========================================================================
  // Facet 3: Interaction & Wayfinding (CTA & State Reset)
  // =========================================================================
  describe('Facet 3: Interaction & Wayfinding (CTA & State Reset)', () => {
    it('[TC-152.10/MSS][UC-GAME-009][IMP-152][Facet-3/Wayfinding] Khung Empty State chứa nút CTA data-testid="masterplan-empty-reset-btn" với nhãn text chứa Xem Tất Cả 10 Phân Khu', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'monopoly',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      const btnMatch = html.match(/<button[^>]*data-testid="masterplan-empty-reset-btn"[^>]*>([\s\S]*?)<\/button>/)?.[0] ?? '';
      expect(btnMatch).toContain('data-testid="masterplan-empty-reset-btn"');
      expect(btnMatch).toContain('Xem Tất Cả 10 Phân Khu');
    });

    it('[TC-152.11/MSS][UC-GAME-009][IMP-152][Facet-3/Wayfinding] Khi click vào data-testid="masterplan-empty-reset-btn", kích hoạt callback onReset để hoàn nguyên bộ lọc về all', () => {
      const EmptyState = (Components as any).MasterplanEmptyState;
      expect(EmptyState).toBeDefined();

      const onReset = vi.fn();
      const vdom = (EmptyState as any)({
        activeFilter: 'monopoly',
        totalDistricts: 10,
        onReset,
      });

      const resetBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'masterplan-empty-reset-btn');
      expect(resetBtn).not.toBeNull();
      resetBtn?.props?.onClick?.();
      expect(onReset).toHaveBeenCalledTimes(1);
    });

    it('[TC-152.12/MSS][UC-GAME-009][IMP-152][Facet-3/Wayfinding] Nút CTA reset hoạt động thành công kể cả khi component mount với prop districtFilter="monopoly" (chống state deadlock)', () => {
      const onFilterChange = vi.fn();
      const html = renderMasterplan({
        initialTab: 'districts',
        districtFilter: 'monopoly',
        onFilterChange,
        playersInfo: MOCK_PLAYERS_INFO,
      });

      // Component mount với districtFilter="monopoly" phải render Empty State khi không có monopoly
      expect(html).toContain('data-testid="masterplan-empty-state"');
      expect(html).toContain('data-testid="masterplan-empty-reset-btn"');

      // Kiểm tra EmptyState component contract chống deadlock
      const EmptyState = (Components as any).MasterplanEmptyState;
      expect(EmptyState).toBeDefined();

      const onReset = vi.fn();
      const vdom = (EmptyState as any)({
        activeFilter: 'monopoly',
        onReset,
        totalDistricts: 10,
      });
      const resetBtn = findElementByProp(vdom, (p: any) => p['data-testid'] === 'masterplan-empty-reset-btn');
      expect(resetBtn?.props?.onClick).toBeDefined();
    });
  });

  // =========================================================================
  // Facet 4: Layout Budget & Disposal / Safety
  // =========================================================================
  describe('Facet 4: Layout Budget & Disposal / Safety', () => {
    it('[TC-152.13/MSS][UC-GAME-009][IMP-152][Facet-4/LayoutBudget] Thẻ Empty State mang class col-span-full và min-h-[260px] để cân đối giao diện', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'monopoly',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      const emptyStateMatch = html.match(/<div[^>]*data-testid="masterplan-empty-state"[^>]*class="([^"]*)"/)?.[1] ?? '';
      expect(emptyStateMatch).toContain('col-span-full');
      expect(emptyStateMatch).toContain('min-h-[260px]');
    });

    it('[TC-152.14/MSS][UC-GAME-009][IMP-152][Facet-4/LayoutBudget] Nút reset CTA và các nút tab đạt tiêu chuẩn touch target (min-h-[44px] hoặc min-h-[36px])', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        initialFilter: 'monopoly',
        playersInfo: MOCK_PLAYERS_INFO,
      });

      const resetBtnClass = html.match(/<button[^>]*data-testid="masterplan-empty-reset-btn"[^>]*class="([^"]*)"/)?.[1] ?? '';
      const filterAllClass = html.match(/<button[^>]*data-testid="district-filter-all"[^>]*class="([^"]*)"/)?.[1] ?? '';

      expect(resetBtnClass).toMatch(/min-h-\[(36px|44px)\]/);
      expect(filterAllClass).toMatch(/min-h-\[(36px|44px)\]/);
    });

    it('[TC-152.15/MSS][UC-GAME-009][IMP-152][Facet-4/Safety] Chuyển đổi tab không ném ngoại lệ TypeError scrollTo is not a function trong môi trường JSDOM', () => {
      const origWindow = (globalThis as any).window;
      (globalThis as any).window = {}; // Simulate JSDOM / Node where scrollTo is undefined

      try {
        expect(() => {
          renderMasterplan({ initialTab: 'blueprint', playersInfo: MOCK_PLAYERS_INFO });
          renderMasterplan({ initialTab: 'districts', playersInfo: MOCK_PLAYERS_INFO });
          renderMasterplan({ initialTab: 'districts', initialFilter: 'near-monopoly', playersInfo: MOCK_PLAYERS_INFO });
        }).not.toThrow();
      } finally {
        (globalThis as any).window = origWindow;
      }
    });
  });
});

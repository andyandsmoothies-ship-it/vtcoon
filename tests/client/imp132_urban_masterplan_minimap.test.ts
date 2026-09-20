// [TC-132/MSS][UC-GAME-009][IMP-132] Contract Test Suite for Urban Masterplan Minimap (Sa Bàn Quy Hoạch Đô Thị)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())
import { describe, it, expect, beforeAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getDeedDisplayInfo } from '../../src/client/ui/modals/modal_helpers';

let MasterplanModal: React.ComponentType<any> | null = null;
let importError: Error | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore
    const mod = await import('../../src/client/ui/modals/masterplan_modal.js');
    MasterplanModal = mod.MasterplanModal ?? mod.default ?? null;
  } catch (err: any) {
    try {
      // @ts-ignore
      const modFallback = await import('../../src/client/ui/modals/masterplan_modal');
      MasterplanModal = modFallback.MasterplanModal ?? modFallback.default ?? null;
    } catch (fallbackErr: any) {
      importError = fallbackErr;
      MasterplanModal = null;
    }
  }
});

function renderMasterplan(props: Record<string, any> = {}): string {
  expect(
    MasterplanModal,
    `[RED GATE] MasterplanModal component is not yet implemented or exported in src/client/ui/modals/masterplan_modal.js: ${importError?.message ?? 'Module missing'}`
  ).toBeTruthy();
  return renderToStaticMarkup(React.createElement(MasterplanModal!, props));
}

// Realistic test fixtures
const MOCK_PLAYERS_INFO = {
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
};

describe('[IMP-132: Trạm 1 RED] Urban Masterplan Minimap Contract Tests', () => {

  // =========================================================================
  // Facet 1: Boundary & Grid Geometry (40 Ô Khép Kín & Ma Trận 8 Phân Khu)
  // =========================================================================
  describe('Facet 1: Boundary & Grid Geometry', () => {
    it('[TC-132.01/MSS][UC-GAME-009] Lưới sa bàn 11x11 render đúng 40 ô chu vi với data-testid="masterplan-blueprint-grid"', () => {
      const html = renderMasterplan({ initialTab: 'blueprint' });
      const cellMatches = html.match(/data-testid="masterplan-cell-\d+"/g);

      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
      expect(cellMatches?.length).toBe(40);
    });

    it('[TC-132.02/A1][UC-GAME-009] Ô góc 00 (Khởi Hành GO) xuất hiện duy nhất 1 lần không trùng lặp', () => {
      const html = renderMasterplan({ initialTab: 'blueprint' });
      const matches = html.match(/data-testid="masterplan-cell-0"/g);

      expect(matches?.length).toBe(1);
    });

    it('[TC-132.02/A2][UC-GAME-009] Ô góc 10 (Trạm Kiểm Toán) xuất hiện duy nhất 1 lần không trùng lặp', () => {
      const html = renderMasterplan({ initialTab: 'blueprint' });
      const matches = html.match(/data-testid="masterplan-cell-10"/g);

      expect(matches?.length).toBe(1);
    });

    it('[TC-132.02/A3][UC-GAME-009] Ô góc 20 (Nghỉ Dưỡng Miễn Phí) xuất hiện duy nhất 1 lần không trùng lặp', () => {
      const html = renderMasterplan({ initialTab: 'blueprint' });
      const matches = html.match(/data-testid="masterplan-cell-20"/g);

      expect(matches?.length).toBe(1);
    });

    it('[TC-132.02/A4][UC-GAME-009] Ô góc 30 (Lệnh Thanh Tra Thuế) xuất hiện duy nhất 1 lần không trùng lặp', () => {
      const html = renderMasterplan({ initialTab: 'blueprint' });
      const matches = html.match(/data-testid="masterplan-cell-30"/g);

      expect(matches?.length).toBe(1);
    });

    it('[TC-132.03/MSS][UC-GAME-009] Tab 8 Phân Khu render đầy đủ 8 nhóm màu BĐS với data-testid="masterplan-districts-grid"', () => {
      const html = renderMasterplan({ initialTab: 'districts' });

      expect(html).toContain('data-testid="masterplan-districts-grid"');
      expect(html).toContain('data-district="Nau"');
      expect(html).toContain('data-district="XanhDaTroi"');
      expect(html).toContain('data-district="Tim"');
    });

    it('[TC-132.04/MSS][UC-GAME-009] Tab 8 Phân Khu bao gồm cả mục Hạ Tầng Giao Thông (4 Ga) và Tiện Ích Quốc Gia (2 Nhà máy)', () => {
      const html = renderMasterplan({ initialTab: 'districts' });

      expect(html).toContain('data-district="Railroad"');
      expect(html).toContain('data-district="Utility"');
      expect(html).toContain('Long Thành');
      expect(html).toContain('EVN');
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & Ownership / Monopoly Mapping
  // =========================================================================
  describe('Facet 2: State Reactivity & Ownership / Monopoly Mapping', () => {
    it('[TC-132.05/MSS][UC-GAME-009] Ô đất chưa ai mua hiển thị giá niêm yết 600 Tr. và viền nét đứt border-dashed', () => {
      const html = renderMasterplan({
        initialTab: 'blueprint',
        playersInfo: {},
        propertyStates: { 1: { ownerId: null, level: 0, isMortgaged: false } },
      });

      expect(html).toContain('600');
      expect(html).toContain('border-dashed');
    });

    it('[TC-132.06/MSS][UC-GAME-009] Ô đất đã có chủ sở hữu hiển thị màu token hoặc avatar tương ứng của người chơi', () => {
      const html = renderMasterplan({
        initialTab: 'blueprint',
        playersInfo: MOCK_PLAYERS_INFO,
        propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
      });

      expect(html).toContain('#c0392b');
      expect(html).toContain('🦁');
    });

    it('[TC-132.07/MSS][UC-GAME-009] Ô đất đã nâng cấp hiển thị chip cấp độ C1, C2, C3 tương ứng từ levelMap', () => {
      const html = renderMasterplan({
        initialTab: 'blueprint',
        playersInfo: MOCK_PLAYERS_INFO,
        levelMap: { 1: 1, 6: 2, 8: 3 },
      });

      expect(html).toContain('C1');
      expect(html).toContain('C2');
      expect(html).toContain('C3');
    });

    it('[TC-132.08/MSS][UC-GAME-009] Ô đất đang thế chấp hiển thị cảnh báo thế chấp hoặc biểu tượng thế chấp', () => {
      const html = renderMasterplan({
        initialTab: 'blueprint',
        playersInfo: MOCK_PLAYERS_INFO,
        propertyStates: { 11: { ownerId: 'p2', level: 0, isMortgaged: true } },
      });

      expect(html).toMatch(/Thế Chấp|🔒|data-mortgaged="true"/);
    });

    it('[TC-132.09/MSS][UC-GAME-009] Tính toán chính xác tiến trình độc quyền nhóm màu 2/3 cho P1 giữ Bình Dương và Đồng Nai', () => {
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: MOCK_PLAYERS_INFO, // P1 owns 6, 8 (2/3 of XanhDaTroi: 6, 8, 9)
      });

      expect(html).toContain('2/3');
    });

    it('[TC-132.10/MSS][UC-GAME-009] Khi một nhóm màu đã độc quyền 3/3 ô hiển thị huy hiệu độc quyền Monopoly / Vương miện', () => {
      const monopolyPlayers = {
        p1: {
          ...MOCK_PLAYERS_INFO.p1,
          ownedProperties: [6, 8, 9], // full XanhDaTroi monopoly
        },
      };
      const html = renderMasterplan({
        initialTab: 'districts',
        playersInfo: monopolyPlayers,
      });

      expect(html).toMatch(/Độc Quyền|Monopoly|👑|data-monopoly="true"/);
    });
  });

  // =========================================================================
  // Facet 3: Navigation & Inspector Containment (Khử Bẫy Văng Modal)
  // =========================================================================
  describe('Facet 3: Navigation & Inspector Containment', () => {
    it('[TC-132.11/MSS][UC-GAME-009] Khi chọn 1 ô trong modal, hiển thị Inspector Card nội bộ data-testid="masterplan-cell-inspector"', () => {
      const html = renderMasterplan({
        selectedCellIndex: 1,
      });

      expect(html).toContain('data-testid="masterplan-cell-inspector"');
    });

    it('[TC-132.12/MSS][UC-GAME-009] Inspector Card hiển thị đầy đủ tên BĐS Cần Thơ, giá mua 600 và biểu phí dừng chân từ getDeedDisplayInfo', () => {
      const deedInfo = getDeedDisplayInfo(1);
      expect(deedInfo).not.toBeNull();

      const html = renderMasterplan({
        selectedCellIndex: 1,
      });

      expect(html).toContain('Cần Thơ');
      expect(html).toContain('600');
      expect(html).toContain(String(deedInfo?.rents[0]));
    });

    it('[TC-132.13/MSS][UC-GAME-009] Nút chuyển đổi Tab giữa Sa Bàn 40 Ô và 8 Phân Khu hiển thị đầy đủ bộ điều hướng', () => {
      const html = renderMasterplan();

      expect(html).toContain('data-testid="tab-blueprint"');
      expect(html).toContain('data-testid="tab-districts"');
      expect(html).toMatch(/Sa Bàn|Blueprint/i);
      expect(html).toMatch(/8 Phân Khu|Districts/i);
    });

    it('[TC-132.14/MSS][UC-GAME-009] MasterplanModal hỗ trợ prop initialTab districts để mở trực tiếp tab 8 Phân Khu', () => {
      const html = renderMasterplan({ initialTab: 'districts' });

      expect(html).toContain('data-testid="masterplan-districts-grid"');
      expect(html).not.toContain('data-testid="masterplan-blueprint-grid"');
    });

    it('[TC-132.15/MSS][UC-GAME-009] Nút đóng modal render data-testid="masterplan-close-btn" và aria-label="Đóng"', () => {
      const html = renderMasterplan({ onClose: () => {} });

      expect(html).toContain('data-testid="masterplan-close-btn"');
      expect(html).toContain('aria-label="Đóng"');
    });
  });

  // =========================================================================
  // Facet 4: Error Defense & Responsive Invariants
  // =========================================================================
  describe('Facet 4: Error Defense & Responsive Invariants', () => {
    it('[TC-132.16/MSS][UC-GAME-009] Khi playersInfo rỗng hoặc levelMap rỗng, modal vẫn render an toàn 0 unhandled exception', () => {
      const html = renderMasterplan({
        playersInfo: {},
        levelMap: {},
        propertyStates: {},
      });

      expect(html).toContain('data-testid="masterplan-modal"');
    });

    it('[TC-132.17/MSS][UC-GAME-009] Touch target cho các nút chuyển tab và nút đóng đạt chuẩn tối thiểu min-h-[44px] hoặc min-w-[44px]', () => {
      const html = renderMasterplan();

      expect(html).toMatch(/min-h-\[44px\]|min-w-\[44px\]|h-11|h-12|p-3/);
    });

    it('[TC-132.18/MSS][UC-GAME-009] Hộp thoại modal tuân thủ tactile depth với khung viền mực đậm và đổ bóng vật lý', () => {
      const html = renderMasterplan();

      expect(html).toContain('role="dialog"');
      expect(html).toMatch(/border-2|border-slate/);
      expect(html).toMatch(/shadow-\[0_\d+px_0_0_#\w+\]/);
    });
  });
});

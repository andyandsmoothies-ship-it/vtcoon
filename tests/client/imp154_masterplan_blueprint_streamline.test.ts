// [TC-IMP154/MSS][UC-GAME-009][IMP-154] Contract Test Suite for Urban Masterplan Minimap Streamline & Blueprint Focus
// (Tinh Giản Bản Đồ Quy Hoạch Đô Thị — Loại Bỏ Tab 8 Phân Khu & Chuyên Biệt Sa Bàn 40 Ô)
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MasterplanModal } from '../../src/client/ui/modals/masterplan_modal';

function renderMasterplan(props: Record<string, any> = {}): string {
  return renderToStaticMarkup(React.createElement(MasterplanModal, props));
}

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
};

describe('[IMP-154: Trạm 1 RED] Urban Masterplan Minimap Streamline & Blueprint Focus', () => {

  // =========================================================================
  // Facet 1: Boundary & Streamlined Layout (Khử bỏ hoàn toàn Tab 8 Phân Khu)
  // =========================================================================
  describe('Facet 1: Boundary & Streamlined Layout', () => {
    it('[TC-IMP154.01/MSS][UC-GAME-009] MasterplanModal mặc định render Sa Bàn 40 Ô với data-testid="masterplan-blueprint-grid"', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
      expect(html).toContain('data-testid="masterplan-modal"');
    });

    it('[TC-IMP154.02/MSS][UC-GAME-009] Header không còn chứa nút tab-districts ("8 Phân Khu & Độc Quyền")', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).not.toContain('data-testid="tab-districts"');
      expect(html).not.toContain('8 Phân Khu &amp; Độc Quyền');
      expect(html).not.toContain('8 Phân Khu');
    });

    it('[TC-IMP154.03/MSS][UC-GAME-009] Body không còn chứa lưới phân khu data-testid="masterplan-districts-grid"', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).not.toContain('data-testid="masterplan-districts-grid"');
    });

    it('[TC-IMP154.04/MSS][UC-GAME-009] Body không còn chứa thanh lọc phân loại data-testid="district-filter-bar"', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).not.toContain('data-testid="district-filter-bar"');
    });

    it('[TC-IMP154.05/A1][UC-GAME-009] Khi truyền initialTab="districts", modal vẫn an toàn hiển thị Sa Bàn 40 Ô (Fallback an toàn)', () => {
      const html = renderMasterplan({ initialTab: 'districts', playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
      expect(html).not.toContain('data-testid="masterplan-districts-grid"');
    });
  });

  // =========================================================================
  // Facet 2: State Reactivity & 40-Cell Blueprint Fidelity
  // =========================================================================
  describe('Facet 2: State Reactivity & 40-Cell Blueprint Fidelity', () => {
    it('[TC-IMP154.06/MSS][UC-GAME-009] Lưới sa bàn 11x11 chứa đủ 40 ô chu vi từ ô 0 đến ô 39', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });
      const cellMatches = html.match(/data-testid="masterplan-cell-\d+"/g);

      expect(cellMatches?.length).toBe(40);
    });

    it('[TC-IMP154.07/MSS][UC-GAME-009] Ô đã có chủ hiển thị tokenColor và avatar của chủ sở hữu', () => {
      const html = renderMasterplan({
        playersInfo: MOCK_PLAYERS_INFO,
        propertyStates: { 1: { ownerId: 'p1', level: 0, isMortgaged: false } },
      });

      expect(html).toContain('#c0392b');
      expect(html).toContain('🦁');
    });

    it('[TC-IMP154.08/MSS][UC-GAME-009] Ô thế chấp hiển thị biểu tượng ổ khóa đỏ 🔒', () => {
      const html = renderMasterplan({
        playersInfo: MOCK_PLAYERS_INFO,
        propertyStates: { 11: { ownerId: 'p2', level: 0, isMortgaged: true } },
      });

      expect(html).toContain('🔒');
    });

    it('[TC-IMP154.09/MSS][UC-GAME-009] Vùng tâm đô thị hiển thị Báo Cáo Đầu Tư Toàn Đô Thị khi chưa chọn ô nào', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toContain('BÁO CÁO ĐẦU TƯ TOÀN ĐÔ THỊ');
      expect(html).toContain('Đại Gia Sài Gòn');
      expect(html).toContain('Tỷ Phú Hà Thành');
    });

    it('[TC-IMP154.10/MSS][UC-GAME-009] Vùng tâm đô thị hiển thị MasterplanInspectorCard khi có selectedCellIndex', () => {
      const html = renderMasterplan({
        selectedCellIndex: 1,
        playersInfo: MOCK_PLAYERS_INFO,
      });

      expect(html).toContain('data-testid="masterplan-cell-inspector"');
      expect(html).toContain('Cần Thơ');
    });
  });

  // =========================================================================
  // Facet 3: Disposal & Navigation Simplicity
  // =========================================================================
  describe('Facet 3: Disposal & Navigation Simplicity', () => {
    it('[TC-IMP154.11/MSS][UC-GAME-009] Nút đóng modal vẫn hoạt động với data-testid="masterplan-close-btn" và aria-label="Đóng"', () => {
      const html = renderMasterplan({ onClose: () => {} });

      expect(html).toContain('data-testid="masterplan-close-btn"');
      expect(html).toContain('aria-label="Đóng"');
    });

    it('[TC-IMP154.12/MSS][UC-GAME-009] Subtitle hiển thị chính xác tiến độ bán BĐS (Đã bán X/28 BĐS)', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toMatch(/Đã bán \d+\/28 BĐS/);
    });

    it('[TC-IMP154.13/MSS][UC-GAME-009] Header giữ nguyên layout sạch, không bị lệch hàng do bỏ tab', () => {
      const html = renderMasterplan({ playersInfo: MOCK_PLAYERS_INFO });

      expect(html).toContain('BẢN ĐỒ QUY HOẠCH ĐÔ THỊ');
      expect(html).toContain('🗺️');
    });
  });

  // =========================================================================
  // Facet 4: Error Defense & Responsive Invariants
  // =========================================================================
  describe('Facet 4: Error Defense & Responsive Invariants', () => {
    it('[TC-IMP154.14/MSS][UC-GAME-009] Khi playersInfo rỗng hoặc levelMap rỗng, modal vẫn render an toàn 0 unhandled exception', () => {
      const html = renderMasterplan({
        playersInfo: {},
        levelMap: {},
        propertyStates: {},
      });

      expect(html).toContain('data-testid="masterplan-modal"');
      expect(html).toContain('data-testid="masterplan-blueprint-grid"');
    });

    it('[TC-IMP154.15/MSS][UC-GAME-009] Modal duy trì khung viền tactile depth chuẩn Antigravity 2.0', () => {
      const html = renderMasterplan();

      expect(html).toContain('role="dialog"');
      expect(html).toMatch(/border-2|border-slate/);
      expect(html).toMatch(/shadow-\[0_\d+px_0_0_#\w+\]/);
    });
  });
});

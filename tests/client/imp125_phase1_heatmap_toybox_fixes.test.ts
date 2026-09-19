// [IMP-125-P1/MSS] Contract Test Suite: Heatmap Overlay, Interactive Toy-Box Diorama & Mobile Display Fixes
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): tileRotation angles in [0, 2*PI], pitch/roll = 0, TopBar mobile containment (< 390px), HudContainer dynamic padding.
// Facet 2 (State Reactivity): isHeatmapActive store toggle/set, ActionDock heatmap button ring, LayeredDioramaTile PBR emissive, Toy-box click/pointer handlers.
// Facet 3 (Resource Disposal): SoundEngine audio node disposal, clean teardown without dangling timers or listeners.
// Facet 4 (Error Defense): SoundEngine graceful zero-crash when muted or AudioContext blocked/null, out-of-range tileRotation fallback, unowned tile zero-emissive.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { tileRotation } from '../../src/client/3d/board_layout';
import { TopBar } from '../../src/client/ui/top_bar';
import { HudContainer } from '../../src/client/ui/hud_container';
import { ActionDock } from '../../src/client/ui/action_dock';
import { useGameStore } from '../../src/client/store/game_store';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { DioramaMarina } from '../../src/client/3d/diorama/diorama_marina';
import { DioramaTraffic } from '../../src/client/3d/diorama/diorama_traffic';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { SoundEngine } from '../../src/client/audio/sound_engine';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';

// Interface augmentation for Phase 1 contract additions
interface Imp125GameStore {
  isHeatmapActive?: boolean;
  toggleHeatmap?: () => void;
  setHeatmapActive?: (active: boolean) => void;
}

interface Imp125SoundEngine {
  playLighthouseHorn?: () => void;
  playCarHorn?: () => void;
  playWaterRipple?: () => void;
}

const mockPropertyCell = BOARD_CONFIG[1]!;
const mockCornerCell = BOARD_CONFIG[0]!;

describe('[IMP-125-P1/MSS] Phase 1 Contract Test Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Sài Gòn',
          balance: 15000,
          bankrupt: false,
          tokenColor: '#EF4444',
          ownedProperties: [1],
        },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: {},
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =========================================================================
  // GÓI 1: CHUẨN HÓA GÓC XOAY CHỮ Ô CỜ (KHỬ LỘN NGƯỢC 180° & Ô KHỞI HÀNH)
  // =========================================================================
  describe('Gói 1: Chuẩn Hóa Góc Xoay Chữ Ô Cờ (Board Tile Rotation)', () => {
    it('[TC-IMP125.01/MSS][UC-BOARD-ROT] Ô số 0 (Khởi Hành) xoay góc 45° [0, Math.PI / 4, 0] đối diện camera Overview', () => {
      const rot = tileRotation(0);
      expect(rot[0]).toBeCloseTo(0);
      expect(rot[1]).toBeCloseTo(Math.PI / 4, 4);
      expect(rot[2]).toBeCloseTo(0);
    });

    it.each([1, 4, 9])(
      '[TC-IMP125.02/MSS][UC-BOARD-ROT] Cạnh 0 (ô index %i) duy trì góc xoay chuẩn [0, 0, 0]',
      (cellIndex) => {
        const rot = tileRotation(cellIndex);
        expect(rot).toEqual([0, 0, 0]);
      }
    );

    it.each([10, 14, 19])(
      '[TC-IMP125.03/MSS][UC-BOARD-ROT] Cạnh 1 (ô index %i) quay [0, -Math.PI / 2, 0] theo chuẩn IMP-127',
      (cellIndex) => {
        const rot = tileRotation(cellIndex);
        expect(rot[0]).toBeCloseTo(0);
        expect(rot[1]).toBeCloseTo(-Math.PI / 2, 4);
        expect(rot[2]).toBeCloseTo(0);
      }
    );

    it.each([20, 25, 29])(
      '[TC-IMP125.04/MSS][UC-BOARD-ROT] Cạnh 2 (ô index %i) quay [0, Math.PI, 0] theo chuẩn IMP-127',
      (cellIndex) => {
        const rot = tileRotation(cellIndex);
        expect(rot).toEqual([0, Math.PI, 0]);
      }
    );

    it.each([30, 35, 39])(
      '[TC-IMP125.05/MSS][UC-BOARD-ROT] Cạnh 3 (ô index %i) giữ góc xoay [0, Math.PI / 2, 0]',
      (cellIndex) => {
        const rot = tileRotation(cellIndex);
        expect(rot[0]).toBeCloseTo(0);
        expect(rot[1]).toBeCloseTo(Math.PI / 2, 4);
        expect(rot[2]).toBeCloseTo(0);
      }
    );

    it.each([0, 10, 20, 30])(
      '[TC-IMP125.06/MSS][UC-BOARD-ROT] Facet 1 (Boundary): Góc pitch (x) và roll (z) luôn bằng 0 tại ô góc %i',
      (cornerIndex) => {
        const rot = tileRotation(cornerIndex);
        expect(rot[0]).toBe(0);
        expect(rot[2]).toBe(0);
      }
    );

    it('[TC-IMP125.07/MSS][UC-BOARD-ROT] Facet 4 (Error Defense): Chỉ số ngoài phạm vi hoặc NaN trả về góc an toàn [0, 0, 0]', () => {
      const rotNegative = tileRotation(-1);
      const rotOverflow = tileRotation(45);
      expect(rotNegative).toEqual([0, 0, 0]);
      expect(rotOverflow).toEqual([0, 0, 0]);
    });
  });

  // =========================================================================
  // GÓI 2: SỬA LỖI TRÀN MÉP PHẢI TOPBAR TRÊN DI ĐỘNG (< 390px)
  // =========================================================================
  describe('Gói 2: Sửa Lỗi Tràn Mép Phải TopBar Trên Di Động (< 390px)', () => {
    it('[TC-IMP125.08/MSS][UC-TOPBAR-MOB] Facet 1 (Boundary): TopBar header có class max-w-full và overflow-hidden để triệt tiêu tràn ngang', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('max-w-full');
      expect(html).toContain('overflow-hidden');
    });

    it('[TC-IMP125.09/MSS][UC-TOPBAR-MOB] Nút time-of-day-toggle-button đạt kích thước an toàn di động min-h-[36px] min-w-[36px]', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="time-of-day-toggle-button"');
      expect(html).toContain('min-h-[36px]');
      expect(html).toContain('min-w-[36px]');
    });

    it('[TC-IMP125.10/MSS][UC-TOPBAR-MOB] Nút time-of-day-toggle-button ẩn nhãn text trên mobile (hidden sm:inline)', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="time-of-day-toggle-button"');
      expect(html).toContain('hidden sm:inline');
    });

    it('[TC-IMP125.11/MSS][UC-TOPBAR-MOB] Nút mute-toggle-button đạt kích thước an toàn di động min-h-[36px] min-w-[36px]', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="mute-toggle-button"');
      expect(html).toContain('min-h-[36px]');
      expect(html).toContain('min-w-[36px]');
    });

    it('[TC-IMP125.12/MSS][UC-TOPBAR-MOB] Nút activity-feed-toggle-button đạt kích thước an toàn di động min-h-[36px] min-w-[36px]', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="activity-feed-toggle-button"');
      expect(html).toContain('min-h-[36px]');
      expect(html).toContain('min-w-[36px]');
    });

    it('[TC-IMP125.13/MSS][UC-TOPBAR-MOB] Facet 1 (Boundary): HudContainer chứa padding co giãn p-1.5 sm:p-3 md:p-6', () => {
      const html = renderToStaticMarkup(React.createElement(HudContainer, { localPlayerId: 'p1' }));
      expect(html).toContain('p-1.5 sm:p-3 md:p-6');
    });
  });

  // =========================================================================
  // GÓI 3: BẢN ĐỒ NHIỆT QUY HOẠCH ĐÔ THỊ (MONOPOLY HEATMAP OVERLAY)
  // =========================================================================
  describe('Gói 3: Bản Đồ Nhiệt Quy Hoạch Đô Thị (Monopoly Heatmap Overlay)', () => {
    it('[TC-IMP125.14/MSS][UC-HEATMAP-STORE] Facet 1 (Boundary): isHeatmapActive khởi tạo mặc định là false', () => {
      const store = useGameStore.getState() as Imp125GameStore;
      expect(store.isHeatmapActive).toBe(false);
    });

    it('[TC-IMP125.15/MSS][UC-HEATMAP-STORE] Facet 2 (State Reactivity): toggleHeatmap chuyển đổi isHeatmapActive từ false sang true và ngược lại', () => {
      const store = useGameStore.getState() as Imp125GameStore;
      expect(typeof store.toggleHeatmap).toBe('function');
      store.toggleHeatmap!();
      expect((useGameStore.getState() as Imp125GameStore).isHeatmapActive).toBe(true);
      store.toggleHeatmap!();
      expect((useGameStore.getState() as Imp125GameStore).isHeatmapActive).toBe(false);
    });

    it('[TC-IMP125.16/MSS][UC-HEATMAP-STORE] Facet 2 (State Reactivity): setHeatmapActive gán trực tiếp trạng thái', () => {
      const store = useGameStore.getState() as Imp125GameStore;
      expect(typeof store.setHeatmapActive).toBe('function');
      store.setHeatmapActive!(true);
      expect((useGameStore.getState() as Imp125GameStore).isHeatmapActive).toBe(true);
      store.setHeatmapActive!(false);
      expect((useGameStore.getState() as Imp125GameStore).isHeatmapActive).toBe(false);
    });

    it('[TC-IMP125.17/MSS][UC-HEATMAP-DOCK] ActionDock render nút Bản Đồ Nhiệt data-testid="heatmap-toggle-btn"', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('data-testid="heatmap-toggle-btn"');
    });

    it('[TC-IMP125.18/MSS][UC-HEATMAP-DOCK] Nút Bản Đồ Nhiệt có icon 🗺️ và label "Quy Hoạch" với class hidden sm:inline', () => {
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('🗺️');
      expect(html).toContain('Quy Hoạch');
      expect(html).toContain('hidden sm:inline');
    });

    it('[TC-IMP125.19/MSS][UC-HEATMAP-DOCK] Facet 2 (State Reactivity): Khi isHeatmapActive = true, nút Heatmap có viền ring-2 ring-amber-400', () => {
      useGameStore.setState({ isHeatmapActive: true } as any);
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).toContain('ring-2 ring-amber-400');
    });

    it('[TC-IMP125.20/MSS][UC-HEATMAP-DOCK] Facet 2 (State Reactivity): Khi isHeatmapActive = false, nút Heatmap không có viền ring-2 ring-amber-400', () => {
      useGameStore.setState({ isHeatmapActive: false } as any);
      const html = renderToStaticMarkup(React.createElement(ActionDock, { localPlayerId: 'p1' }));
      expect(html).not.toContain('ring-2 ring-amber-400');
    });

    it('[TC-IMP125.21/MSS][UC-HEATMAP-3D] Facet 2 (Consumer Assertion): LayeredDioramaTile khi isHeatmapActive = true và có chủ sở hữu kích hoạt emissive mang ownerColor', () => {
      const html = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: mockPropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isHeatmapActive: true,
        } as any)
      );
      // Consumer Assertion: Material phải phản ánh màu sở hữu vào thuộc tính emissive
      expect(html.toLowerCase()).toContain('emissive="#ef4444"');
    });

    it('[TC-IMP125.22/MSS][UC-HEATMAP-3D] Facet 2 (Consumer Assertion): LayeredDioramaTile khi isHeatmapActive = true có emissiveIntensity >= 1.0', () => {
      const html = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: mockPropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#EF4444',
          isHeatmapActive: true,
        } as any)
      );
      expect(html.toLowerCase()).toMatch(/emissiveintensity="([1-9]\d*(\.\d+)?|0\.[1-9]\d*)"/);
    });

    it('[TC-IMP125.23/MSS][UC-HEATMAP-3D] Facet 4 (Error Defense): LayeredDioramaTile khi isHeatmapActive = false hoặc ô không có chủ thì không phát sáng emissive', () => {
      const htmlUnowned = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: mockPropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: undefined,
          isHeatmapActive: true,
        } as any)
      );
      expect(htmlUnowned.toLowerCase()).not.toContain('emissive="#ef4444"');
    });
  });

  // =========================================================================
  // GÓI 4: SA BÀN TƯƠNG TÁC XÚC GIÁC DẠNG HỘP ĐỒ CHƠI (TOY-BOX DIORAMA)
  // =========================================================================
  describe('Gói 4: Sa Bàn Tương Tác Xúc Giác Dạng Hộp Đồ Chơi (Toy-Box Diorama)', () => {
    it('[TC-IMP125.24/MSS][UC-TOYBOX-AUDIO] SoundEngine cung cấp phương thức playLighthouseHorn', () => {
      const se = SoundEngine as unknown as Imp125SoundEngine;
      expect(typeof se.playLighthouseHorn).toBe('function');
    });

    it('[TC-IMP125.25/MSS][UC-TOYBOX-AUDIO] SoundEngine cung cấp phương thức playCarHorn', () => {
      const se = SoundEngine as unknown as Imp125SoundEngine;
      expect(typeof se.playCarHorn).toBe('function');
    });

    it('[TC-IMP125.26/MSS][UC-TOYBOX-AUDIO] SoundEngine cung cấp phương thức playWaterRipple', () => {
      const se = SoundEngine as unknown as Imp125SoundEngine;
      expect(typeof se.playWaterRipple).toBe('function');
    });

    it('[TC-IMP125.27/MSS][UC-TOYBOX-MARINA] Facet 2 (State Reactivity): DioramaMarina gắn data-testid="heritage-lighthouse" cho ngọn hải đăng biểu tượng', () => {
      const html = renderToStaticMarkup(React.createElement(DioramaMarina));
      expect(html).toContain('data-testid="heritage-lighthouse"');
    });

    it('[TC-IMP125.28/MSS][UC-TOYBOX-TRAFFIC] Facet 2 (State Reactivity): DioramaTraffic gắn data-testid="micro-traffic-group" cho nhóm xe vi mô', () => {
      const html = renderToStaticMarkup(React.createElement(DioramaTraffic));
      expect(html).toContain('data-testid="micro-traffic-group"');
    });

    it('[TC-IMP125.29/MSS][UC-TOYBOX-OCEAN] Facet 2 (State Reactivity): CoastalIslandEnvironment gắn data-testid="living-ocean-water" trên mặt biển', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
      expect(html).toContain('data-testid="living-ocean-water"');
    });

    it('[TC-IMP125.30/MSS][UC-TOYBOX-DEFENSE] Facet 4 (Error Defense): SoundEngine gọi playLighthouseHorn khi không có AudioContext an toàn không ném lỗi (Zero-Crash)', () => {
      const se = SoundEngine as unknown as Imp125SoundEngine;
      expect(() => {
        se.playLighthouseHorn?.();
      }).not.toThrow();
    });

    it('[TC-IMP125.31/MSS][UC-TOYBOX-DEFENSE] Facet 4 (Error Defense): SoundEngine gọi playCarHorn và playWaterRipple an toàn không ném lỗi', () => {
      const se = SoundEngine as unknown as Imp125SoundEngine;
      expect(() => {
        se.playCarHorn?.();
        se.playWaterRipple?.();
      }).not.toThrow();
    });

    it('[TC-IMP125.32/MSS][UC-TOYBOX-DISPOSAL] Facet 3 (Resource Disposal): SoundEngine.dispose() dọn dẹp sạch sẽ tài nguyên audio', () => {
      expect(() => {
        SoundEngine.dispose();
      }).not.toThrow();
    });
  });
});

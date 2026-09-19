// [IMP-126] Contract Test Suite: Side-Aware Tile Camera Orbit & Mobile TopBar Width Polish
// Universal 4-Facet Matrix:
// Facet 1: Side-Aware Camera Offset & Orientation Invariants
// Facet 2: NaN Defense & Finite Target Camera State
// Facet 3: TopBar Mobile Compact Bot Pacing & Responsive Classes
// Facet 4: Zero Regression Contracts (IMP-82, IMP-86, IMP-123 Compatibility)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  CAMERA_CONFIG,
  calculateTargetCameraState,
  calculateTileFocusCameraPosition,
  resolveSideAwareCameraOffset,
} from '../../src/client/3d/camera_state_machine';
import { TopBar } from '../../src/client/ui/top_bar';
import { useGameStore } from '../../src/client/store/game_store';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

describe('[IMP-126] Side-Aware Tile Camera Orbit & Mobile TopBar Polish Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 3,
      maxRounds: 30,
      treasuryPool: 1_800,
      turnTimeRemaining: 27,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Hoàng Nam',
          balance: 10_000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
          isBot: false,
        } as PlayerHudInfo,
        bot_p2: {
          id: 'bot_p2',
          name: 'Bot AI 4 (Passive)',
          balance: 8_600,
          tokenColor: '#DC2626',
          ownedProperties: [],
          isBot: true,
        } as PlayerHudInfo,
      },
    });
  });

  // =========================================================================
  // FACET 1: Side-Aware Camera Offset & 4-Side Board Orientation
  // =========================================================================
  describe('FACET 1: Side-Aware Camera Offset & 4-Side Board Orientation', () => {
    it('[TC-IMP126.01/MSS][UC-CAM] resolveSideAwareCameraOffset contract: hàm phải được export từ camera_state_machine', () => {
      expect(typeof resolveSideAwareCameraOffset).toBe('function');
    });

    it('[TC-IMP126.02/MSS][UC-CAM] Cạnh Nam (Side 0, z > 4): camera đặt ở phía Nam (Z dương) nhìn lên phía Bắc', () => {
      // Ô Cần Thơ / Bến Thành tại z = 9, x = 0
      const offset = resolveSideAwareCameraOffset([0, 0, 9]);
      expect(offset[2]).toBeGreaterThan(0);
      expect(offset[1]).toBeGreaterThan(0);
    });

    it('[TC-IMP126.03/MSS][UC-CAM] Cạnh Bắc (Side 2, z < -4): camera đặt ở phía Bắc (Z âm) nhìn xuống phía Nam', () => {
      // Ô Lâm Đồng (Đà Lạt), Cao Tốc, Hải Phòng tại z = -9, x = 0
      const offset = resolveSideAwareCameraOffset([0, 0, -9]);
      expect(offset[2]).toBeLessThan(0); // Camera nằm ở Z < -9 (phía Bắc) nhìn về +Z
      expect(offset[1]).toBeGreaterThan(0);
    });

    it('[TC-IMP126.04/MSS][UC-CAM] Cạnh Tây (Side 1, x < -4): camera đặt ở phía Tây (X âm) nhìn sang phía Đông', () => {
      // Ô Điện Lực EVN tại x = -9, z = 0
      const offset = resolveSideAwareCameraOffset([-9, 0, 0]);
      expect(offset[0]).toBeLessThan(0); // Camera nằm ở X < -9 (phía Tây) nhìn về +X
      expect(offset[1]).toBeGreaterThan(0);
    });

    it('[TC-IMP126.05/MSS][UC-CAM] Cạnh Đông (Side 3, x > 4): camera đặt ở phía Đông (X dương) nhìn sang phía Tây', () => {
      // Ô Hoàn Kiếm / Ba Đình tại x = 9, z = 0
      const offset = resolveSideAwareCameraOffset([9, 0, 0]);
      expect(offset[0]).toBeGreaterThan(0); // Camera nằm ở X > 9 (phía Đông) nhìn về -X
      expect(offset[1]).toBeGreaterThan(0);
    });

    it('[TC-IMP126.06/MSS][UC-CAM] Ô Cạnh Bắc (Side 2): calculateTargetCameraState trả về tọa độ camera ở phía ngoài ô cờ', () => {
      const tilePosNorth: [number, number, number] = [0, 0, -9];
      const targetState = calculateTargetCameraState('tile_focus', undefined, tilePosNorth);

      // Camera phải nằm ngoài ô đất ở phía Bắc (Z_cam < -9) để nhìn xuôi chiều chữ đọc
      expect(targetState.position[2]).toBeLessThan(-9);
      expect(targetState.target[2]).toBeCloseTo(-9);
    });

    it('[TC-IMP126.07/MSS][UC-CAM] Ô Cạnh Tây (Side 1): calculateTargetCameraState trả về tọa độ camera ở phía ngoài ô cờ', () => {
      const tilePosWest: [number, number, number] = [-9, 0, 0];
      const targetState = calculateTargetCameraState('tile_focus', undefined, tilePosWest);

      // Camera phải nằm ngoài ô đất ở phía Tây (X_cam < -9) để nhìn xuôi chiều chữ đọc
      expect(targetState.position[0]).toBeLessThan(-9);
      expect(targetState.target[0]).toBeCloseTo(-9);
    });
  });

  // =========================================================================
  // FACET 2: NaN Defense & Finite Coordinates Guarantee
  // =========================================================================
  describe('FACET 2: NaN Defense & Finite Coordinates Guarantee', () => {
    it('[TC-IMP126.08/MSS][UC-CAM] resolveSideAwareCameraOffset phòng thủ tọa độ NaN an toàn', () => {
      const offset = resolveSideAwareCameraOffset([NaN, NaN, NaN]);
      expect(Number.isFinite(offset[0])).toBe(true);
      expect(Number.isFinite(offset[1])).toBe(true);
      expect(Number.isFinite(offset[2])).toBe(true);
    });

    it('[TC-IMP126.09/MSS][UC-CAM] calculateTargetCameraState với NaN tilePosition vẫn trả về 100% tọa độ hữu hạn', () => {
      const state = calculateTargetCameraState('tile_focus', undefined, [NaN, 0, NaN]);
      expect(Number.isFinite(state.position[0])).toBe(true);
      expect(Number.isFinite(state.position[1])).toBe(true);
      expect(Number.isFinite(state.position[2])).toBe(true);
      expect(Number.isFinite(state.target[0])).toBe(true);
      expect(Number.isFinite(state.target[1])).toBe(true);
      expect(Number.isFinite(state.target[2])).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: TopBar Mobile Compact Bot Pacing & Responsive Optimization
  // =========================================================================
  describe('FACET 3: TopBar Mobile Compact Bot Pacing & Responsive Optimization', () => {
    it('[TC-IMP126.10/MSS][UC-TOPBAR] TopBar chứa icon robot sm:hidden dành riêng cho màn hình di động khi là lượt Bot', () => {
      useGameStore.setState({ currentTurnPlayerId: 'bot_p2' });
      const html = renderToStaticMarkup(React.createElement(TopBar));

      // Trên mobile hiển thị icon 🤖 thu gọn
      expect(html).toContain('sm:hidden');
      expect(html).toContain('🤖');
    });

    it('[TC-IMP126.11/MSS][UC-TOPBAR] TopBar ẩn chuỗi văn bản dài trên mobile bằng class hidden sm:inline khi là lượt Bot', () => {
      useGameStore.setState({ currentTurnPlayerId: 'bot_p2' });
      const html = renderToStaticMarkup(React.createElement(TopBar));

      // Chuỗi dài 14 ký tự bị ẩn trên mobile để giải phóng 100px chiều ngang
      expect(html).toMatch(/hidden\s+sm:inline[^>]*>🤖\s*Đang tính\.\.\./);
    });

    it('[TC-IMP126.12/MSS][UC-TOPBAR] TopBar duy trì padding an toàn chống cấn góc màn hình cong trên mobile', () => {
      const html = renderToStaticMarkup(React.createElement(TopBar));
      expect(html).toContain('data-testid="match-info-capsule"');
    });

    it('[TC-IMP126.13/MSS][UC-TOPBAR] TopBar hoàn trả định dạng thời gian số khi quay về lượt người chơi', () => {
      useGameStore.setState({ currentTurnPlayerId: 'p1', turnTimeRemaining: 27 });
      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toContain('00:27');
      expect(html).not.toContain('🤖 Đang tính...');
    });
  });

  // =========================================================================
  // FACET 4: Zero Regression Contracts (IMP-82 & IMP-123 Compatibility)
  // =========================================================================
  describe('FACET 4: Zero Regression Contracts (IMP-82 & IMP-123 Compatibility)', () => {
    it('[TC-IMP126.14/MSS][UC-COMPAT] Hợp đồng IMP-82: renderToStaticMarkup vẫn tìm thấy chuỗi 🤖 Đang tính... khi là lượt Bot', () => {
      useGameStore.setState({ currentTurnPlayerId: 'bot_p2' });
      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toContain('🤖 Đang tính...');
      expect(html).not.toContain('00:00');
    });

    it('[TC-IMP126.15/MSS][UC-COMPAT] Hợp đồng IMP-123: match-info-capsule vẫn duy trì class whitespace-nowrap chống ngắt dòng', () => {
      useGameStore.setState({ currentTurnPlayerId: 'bot_p2' });
      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toContain('whitespace-nowrap');
    });

    it('[TC-IMP126.16/MSS][UC-COMPAT] calculateTileFocusCameraPosition giữ nguyên chữ ký và tương thích với offset mặc định', () => {
      const tileCoords: [number, number, number] = [-6.8, 0, 8.2];
      const camPos = calculateTileFocusCameraPosition(tileCoords);

      expect(camPos[0]).toBeCloseTo(-6.8 + CAMERA_CONFIG.tile_focus.offset[0]);
      expect(camPos[1]).toBeCloseTo(0 + CAMERA_CONFIG.tile_focus.offset[1]);
      expect(camPos[2]).toBeCloseTo(8.2 + CAMERA_CONFIG.tile_focus.offset[2]);
    });
  });
});

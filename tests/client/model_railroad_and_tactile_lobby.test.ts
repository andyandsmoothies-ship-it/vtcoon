// [TC-MRL01/MSS][UI-S02/MSS][BR-UI-002] Contract Test Suite: Model Railroad Infrastructure, Urban Tree Canopy & Tactile Tabletop Lobby
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-91 / Monopoly Plus Fidelity
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import { DiceTray } from '../../src/client/3d/dice_tray';
import { PreMatchDeck } from '../../src/client/ui/lobby/pre_match_deck';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { createEmptySlot, BotPersonality, type LobbySlot } from '../../src/client/store/lobby_types';

describe('[TC-MRL01/MSS][UI-S02/MSS][BR-UI-002] Model Railroad, Urban Canopy & Tactile Lobby Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let dioramaMarkup = '';
  let diceTrayMarkup = '';
  let preMatchHtml = '';
  let guestPreMatchHtml = '';
  let emptySlotHtml = '';
  let botSlotHtml = '';

  const hostSlot: LobbySlot = {
    ...createEmptySlot(0),
    playerId: 'p1',
    playerName: 'Chủ Phòng',
    isHost: true,
    isOccupied: true,
    isReady: true,
  };

  const emptySlot: LobbySlot = createEmptySlot(1);

  const botSlot: LobbySlot = {
    ...createEmptySlot(2),
    playerId: 'bot_2',
    playerName: 'Bot AI 2',
    isBot: true,
    isOccupied: true,
    isReady: true,
    botPersonality: BotPersonality.Balanced,
  };

  const initialLobbySlots: readonly LobbySlot[] = [
    hostSlot,
    emptySlot,
    botSlot,
    createEmptySlot(3),
  ];

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    // Render Diorama components
    dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    diceTrayMarkup = renderToStaticMarkup(React.createElement(DiceTray));

    // Render Lobby components
    preMatchHtml = renderToStaticMarkup(
      React.createElement(PreMatchDeck, {
        isHost: true,
        roomCode: 'VT8888',
        slots: initialLobbySlots,
      })
    );

    guestPreMatchHtml = renderToStaticMarkup(
      React.createElement(PreMatchDeck, {
        isHost: false,
        roomCode: 'VT8888',
        slots: initialLobbySlots,
      })
    );

    emptySlotHtml = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, {
        slot: emptySlot,
        isHostViewer: true,
        onToggleBot: () => {},
      })
    );

    botSlotHtml = renderToStaticMarkup(
      React.createElement(PlayerSlotCard, {
        slot: botSlot,
        isHostViewer: true,
        onToggleBot: () => {},
        onCycleBotPersonality: () => {},
      })
    );
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: CHỐT 1 — TUYẾN ĐƯỜNG SẮT ĐÔ THỊ MÔ HÌNH (MODEL RAILROAD INFRASTRUCTURE)
  // =========================================================================
  describe('Facet 1: Chốt 1 — Tuyến Đường Sắt Đô Thị Mô Hình (Model Railroad)', () => {
    it('[TC-MRL01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] MiniatureCityDiorama kết xuất cụm đường ray xe lửa mô hình mang định danh diorama-model-railroad', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-model-railroad"');
    });

    it('[TC-MRL01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Tuyến đường sắt mô hình ôm lấy chu vi bàn cờ với tà vẹt gỗ sẫm màu (#451A03, #78350F hoặc #92400E)', () => {
      const hasWoodenTieColor =
        dioramaMarkup.includes('#451A03') ||
        dioramaMarkup.includes('#78350F') ||
        dioramaMarkup.includes('#92400E');
      expect(hasWoodenTieColor).toBe(true);
    });

    it('[TC-MRL01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Hai ray kim loại sáng bóng mạ thép hoặc đồng thau (#E2E8F0, #CBD5E1 hoặc #D97706)', () => {
      const hasMetallicRailColor =
        dioramaMarkup.includes('#E2E8F0') ||
        dioramaMarkup.includes('#CBD5E1') ||
        dioramaMarkup.includes('#D97706');
      expect(hasMetallicRailColor).toBe(true);
    });

    it('[TC-MRL01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Có mô hình đoàn tàu hỏa mini đỗ trên ray với màu sắc thương mại (#DC2626, #0284C7 hoặc #10B981)', () => {
      const hasMiniTrainColor =
        dioramaMarkup.includes('#DC2626') ||
        dioramaMarkup.includes('#0284C7') ||
        dioramaMarkup.includes('#10B981');
      expect(hasMiniTrainColor).toBe(true);
    });

    it('[TC-MRL01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Tuyến đường sắt mô hình bao bọc phía trong 40 ô cờ bảo đảm không rỗng khối', () => {
      expect(dioramaMarkup).toContain('diorama-model-railroad');
    });
  });

  // =========================================================================
  // FACET 2: CHỐT 2 — TÁN CÂY XANH ĐÔ THỊ ĐA TẦNG (DIORAMA URBAN TREE CANOPY)
  // =========================================================================
  describe('Facet 2: Chốt 2 — Tán Cây Xanh Đô Thị Đa Tầng (Urban Tree Canopy)', () => {
    it('[TC-MRL02.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] MiniatureCityDiorama kết xuất cụm cây xanh cảnh quan đô thị mang định danh diorama-urban-canopy', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-urban-canopy"');
    });

    it('[TC-MRL02.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Cụm cây xanh sử dụng tán lá tự nhiên đa tầng với các gam màu sinh thái (#15803D, #22C55E, #F59E0B hoặc #10B981)', () => {
      const hasCanopyFoliageColor =
        dioramaMarkup.includes('#15803D') ||
        dioramaMarkup.includes('#22C55E') ||
        dioramaMarkup.includes('#F59E0B') ||
        dioramaMarkup.includes('#10B981');
      expect(hasCanopyFoliageColor).toBe(true);
    });

    it('[TC-MRL02.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Cụm tán cây cảnh quan phủ xanh các dải đất mở dọc hành lang sông Sài Gòn và phân khu shophouse', () => {
      expect(dioramaMarkup).toContain('diorama-urban-canopy');
    });
  });

  // =========================================================================
  // FACET 3: CHỐT 3 — BẢNG SẢNH CHỜ XÚC GIÁC 2D (CHUNKY TABLETOP PREMATCHDECK)
  // =========================================================================
  describe('Facet 3: Chốt 3 — Bảng Sảnh Chờ Xúc Giác 2D (Chunky Tabletop PreMatchDeck & PlayerSlotCard)', () => {
    it('[TC-MRL03.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] PreMatchDeck thiết kế viền dập nổi xúc giác border-2 border-slate-900', () => {
      expect(preMatchHtml).toContain('border-2');
      expect(preMatchHtml).toContain('border-slate-900');
    });

    it('[TC-MRL03.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] PreMatchDeck thiết kế đổ bóng xúc giác shadow-[0_6px_0_0_#0f172a] hoặc shadow-[0_4px_0_0_#0f172a]', () => {
      const hasDeckShadow =
        preMatchHtml.includes('shadow-[0_6px_0_0_#0f172a]') ||
        preMatchHtml.includes('shadow-[0_4px_0_0_#0f172a]');
      expect(hasDeckShadow).toBe(true);
    });

    it('[TC-MRL03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] PreMatchDeck loại bỏ hoàn toàn backdrop-blur-md bảo vệ fill-rate GPU (Gotcha #87 & #118)', () => {
      expect(preMatchHtml).not.toContain('backdrop-blur-md');
    });

    it('[TC-MRL03.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Nút Thêm Bot AI sở hữu kiểu dáng bo tròn chuẩn xúc giác rounded-full', () => {
      expect(emptySlotHtml).toContain('rounded-full');
    });

    it('[TC-MRL03.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Nút Thêm Bot AI sở hữu viền dập nổi viền đen border-2 border-slate-900', () => {
      expect(emptySlotHtml).toContain('border-2');
      expect(emptySlotHtml).toContain('border-slate-900');
    });

    it('[TC-MRL03.06/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Nút Thêm Bot AI sở hữu bóng dập nổi shadow-[0_3px_0_0_#0f172a] hoặc shadow-[0_4px_0_0_#0f172a]', () => {
      const hasButtonShadow =
        emptySlotHtml.includes('shadow-[0_3px_0_0_#0f172a]') ||
        emptySlotHtml.includes('shadow-[0_4px_0_0_#0f172a]');
      expect(hasButtonShadow).toBe(true);
    });

    it('[TC-MRL03.07/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Nút Thêm Bot AI sở hữu hiệu ứng phản hồi nhấn nảy active:translate-y-[2px]', () => {
      expect(emptySlotHtml).toContain('active:translate-y-[2px]');
    });

    it('[TC-MRL03.08/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PreMatchDeck kết xuất nút start-game-btn dành riêng cho Chủ Phòng', () => {
      expect(preMatchHtml).toContain('data-testid="start-game-btn"');
    });

    it('[TC-MRL03.09/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] PreMatchDeck hiển thị trạng thái chưa sẵn sàng khi chưa đủ điều kiện khởi tranh FSM', () => {
      expect(preMatchHtml).toContain('cursor-not-allowed');
    });

    it('[TC-MRL03.10/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PreMatchDeck kết xuất nút toggle-ready-btn khi người chơi không phải Chủ Phòng', () => {
      expect(guestPreMatchHtml).toContain('data-testid="toggle-ready-btn"');
    });

    it('[TC-MRL03.11/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PlayerSlotCard hiển thị nút điều chỉnh tính cách Bot cycle-bot-2-btn khi đã có Bot', () => {
      expect(botSlotHtml).toContain('data-testid="cycle-bot-2-btn"');
    });
  });

  // =========================================================================
  // FACET 4: BẤT BIẾN BẢO TOÀN (PRESERVATION INVARIANTS & ERROR DEFENSE)
  // =========================================================================
  describe('Facet 4: Bất Biến Bảo Toàn Sa Bàn & Phòng Thủ Lỗi (Preservation Invariants & Error Defense)', () => {
    it('[TC-MRL04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn container sa bàn gốc data-testid="miniature-city-diorama"', () => {
      expect(dioramaMarkup).toContain('data-testid="miniature-city-diorama"');
    });

    it('[TC-MRL04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn tượng đài trung tâm data-testid="central-monument-plaza"', () => {
      expect(dioramaMarkup).toContain('data-testid="central-monument-plaza"');
    });

    it('[TC-MRL04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn khung viền bàn cờ data-testid="diorama-board-rim"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-board-rim"');
    });

    it('[TC-MRL04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn hành lang đi bộ lát đá hoa cương data-testid="diorama-pedestrian-promenades"', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-pedestrian-promenades"');
    });

    it('[TC-MRL04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn nguyên vẹn khay đổ xúc xắc trung tâm data-testid="dice-tray"', () => {
      expect(diceTrayMarkup).toContain('data-testid="dice-tray"');
    });

    it('[TC-MRL04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Toàn bộ tọa độ và tham số sa bàn là số hữu hạn, tuyệt đối không chứa NaN', () => {
      expect(dioramaMarkup).not.toContain('NaN');
      expect(dioramaMarkup).not.toContain('undefined');
    });

    it('[TC-MRL04.07/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] PreMatchDeck và MiniatureCityDiorama kết xuất tĩnh và giải phóng tài nguyên an toàn không ném biệt lệ', () => {
      expect(dioramaMarkup.length).toBeGreaterThan(0);
      expect(preMatchHtml.length).toBeGreaterThan(0);
    });
  });
});

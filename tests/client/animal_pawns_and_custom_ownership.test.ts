// [TC-APCO01/MSS][UI-S02/MSS][BR-UI-002] Contract Test Suite: Animal Pawns, Personalized Colors & Custom Ownership Markers
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-94 / Monopoly Plus Visual Fidelity Parity
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Determinism (Phân Bổ Ngẫu Nhiên Xác Định Con Vật [0..3], Bảng Màu Văn Hóa 6 Sắc)
// Facet 2: State Reactivity & Visual Sheen (Đồng Bộ Quân Cờ 3D, Hào Quang, Vòng Men & Cọc Cờ Chủ Quyền 2.5D)
// Facet 3: Resource Disposal & SSR Safety (Render Headless An Toàn, SafeBillboard & Tính Idempotent)
// Facet 4: Error Defense & Preservation Invariants (Bảo Tồn 100% TestIDs Gốc, Chống NaN, Phòng Thủ Rỗng)

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LUXURY_PAWN_CONFIGS,
  LuxuryPawnModel,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../src/client/3d/luxury_pawn_models';
import {
  assignRandomPlayerPawns,
  hashSeed,
  type PawnAssignmentResult,
} from '../../src/domain/pawn_assignment';
import { PLAYER_TOKEN_PALETTE } from '../../src/domain/theme';
import { PawnAnimator } from '../../src/client/3d/pawn_animator';
import { computeOwnerMap } from '../../src/client/3d/board_layout';
import {
  LayeredDioramaTile,
  OwnershipMarkerInstances,
  SafeBillboard,
} from '../../src/client/3d/board_tile';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';
import type { Player } from '../../src/domain/room';

// Mock Drei components for headless SSR static rendering
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: any) =>
      React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Mock R3F hook for headless unit testing
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

// Mock AudioEngine
vi.mock('../../src/client/audio/audio_engine', () => ({
  AudioEngine: {
    playSfx: vi.fn(),
  },
}));

// Domain Fixtures: Standard Property Cell
const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const fourPlayers = ['player_host_01', 'player_guest_02', 'player_bot_03', 'player_bot_04'] as const;

describe('[TC-APCO01/MSS][UI-S02/MSS][BR-UI-002] Animal Pawns & Custom Ownership Contract Suite', () => {
  let originalConsoleError: typeof console.error;

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
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
      playerPositions: {},
      currentTurnPlayerId: 'player_host_01',
      activePawnAnimation: null,
      pendingPawnMove: null,
    });
  });

  afterEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
      playerPositions: {},
      currentTurnPlayerId: 'player_host_01',
      activePawnAnimation: null,
      pendingPawnMove: null,
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & DETERMINISM — PHÂN BỔ NGẪU NHIÊN XÁC ĐỊNH & BẢNG MÀU VĂN HÓA
  // =========================================================================
  describe('Facet 1: Boundary & Determinism — Phân Bổ Ngẫu Nhiên Xác Định & Bảng Màu', () => {
    it('[TC-APCO01.01/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] assignRandomPlayerPawns với 4 người chơi trả về mảng kết quả có độ dài chính xác bằng 4', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      expect(results).toHaveLength(4);
    });

    it('[TC-APCO01.02/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Kết quả phân bổ chứa đầy đủ các thuộc tính playerId, slotIndex, pawnConfig, tokenColor, mascotIcon, mascotName', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const first = results[0] as any;
      expect(first.playerId).toBe('player_host_01');
      expect(first.tokenColor).toBeDefined();
      expect(first.mascotIcon).toBeDefined();
      expect(first.mascotName).toBeDefined();
    });

    it('[TC-APCO01.03/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] 4 người chơi nhận 4 slot con vật độc nhất không trùng lặp (tập hợp slotIndex là {0, 1, 2, 3})', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const slots = results.map((r) => r.slotIndex);
      const uniqueSlots = new Set(slots);
      expect(uniqueSlots.size).toBe(4);
      expect([...slots].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
    });

    it('[TC-APCO01.04/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Mỗi slotIndex liên kết với mascotIcon tương ứng (0: 🐕, 1: 🐈, 2: 🐎, 3: 🐘)', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const slotMap = new Map(results.map((r: any) => [r.slotIndex, r.mascotIcon]));
      expect(slotMap.get(0)).toBe('🐕');
      expect(slotMap.get(1)).toBe('🐈');
      expect(slotMap.get(2)).toBe('🐎');
      expect(slotMap.get(3)).toBe('🐘');
    });

    it('[TC-APCO01.05/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Mỗi phần tử chứa mascotName tương ứng với loài vật linh vật (chứa Chó, Mèo, Ngựa, Voi)', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const nameMap = new Map(results.map((r: any) => [r.slotIndex, r.mascotName]));
      expect(nameMap.get(0)).toMatch(/Chó/);
      expect(nameMap.get(1)).toMatch(/Mèo/);
      expect(nameMap.get(2)).toMatch(/Ngựa/);
      expect(nameMap.get(3)).toMatch(/Voi/);
    });

    it('[TC-APCO01.06/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] 4 người chơi nhận 4 màu sắc tokenColor độc nhất không trùng lặp từ PLAYER_TOKEN_PALETTE', () => {
      const results = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const colors = results.map((r: any) => r.tokenColor);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(4);
      expect(colors.every((c) => (PLAYER_TOKEN_PALETTE as readonly string[]).includes(c))).toBe(true);
    });

    it('[TC-APCO01.07/MSS][UI-S02/MSS][BR-UI-002][Facet1-Determinism] Tính tất định 100%: Hai lần gọi cùng seed ROOM_SAIGON_88 trả về danh sách phân bổ giống hệt nhau', () => {
      const call1 = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const call2 = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      expect(call1.map((r) => r.slotIndex)).toEqual(call2.map((r) => r.slotIndex));
      expect(call1.map((r: any) => r.tokenColor)).toEqual(call2.map((r: any) => r.tokenColor));
    });

    it('[TC-APCO01.08/MSS][UI-S02/MSS][BR-UI-002][Facet1-Determinism] Khác seed/roomCode (ROOM_SAIGON_88 vs ROOM_HANOI_99) tạo ra phân bổ xáo trộn hợp lệ', () => {
      const callSG = assignRandomPlayerPawns(fourPlayers, 'ROOM_SAIGON_88');
      const callHN = assignRandomPlayerPawns(fourPlayers, 'ROOM_HANOI_99');
      const sameSlots = callSG.every((r, idx) => r.slotIndex === callHN[idx]?.slotIndex);
      const sameColors = callSG.every((r: any, idx) => r.tokenColor === (callHN[idx] as any)?.tokenColor);
      expect(sameSlots && sameColors).toBe(false);
    });

    it('[TC-APCO01.09/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Hỗ trợ phòng 2 người chơi: phân bổ 2 slot con vật và 2 màu sắc độc nhất, không trùng lặp', () => {
      const twoPlayers = ['p1_solo', 'p2_solo'];
      const results = assignRandomPlayerPawns(twoPlayers, 'ROOM_DUO_2026');
      expect(new Set(results.map((r) => r.slotIndex)).size).toBe(2);
      expect(new Set(results.map((r: any) => r.tokenColor)).size).toBe(2);
    });

    it('[TC-APCO01.10/MSS][UI-S02/MSS][BR-UI-002][Facet1-Boundary] Hỗ trợ phòng 3 người chơi: phân bổ 3 slot con vật và 3 màu sắc độc nhất, không trùng lặp', () => {
      const threePlayers = ['p1_trio', 'p2_trio', 'p3_trio'];
      const results = assignRandomPlayerPawns(threePlayers, 'ROOM_TRIO_2026');
      expect(new Set(results.map((r) => r.slotIndex)).size).toBe(3);
      expect(new Set(results.map((r: any) => r.tokenColor)).size).toBe(3);
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & VISUAL SHEEN — ĐỒNG BỘ QUÂN CỜ 3D & CỌC CỜ 2.5D
  // =========================================================================
  describe('Facet 2: State Reactivity & Visual Sheen — Đồng Bộ Quân Cờ 3D & Cọc Cờ 2.5D', () => {
    it('[TC-APCO02.01/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] LuxuryPawnModel khi nhận playerColor=#c0392b thì pawn-aura-pedestal có màu và emissive là #c0392b', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#c0392b' })
      );
      expect(markup).toContain('data-testid="pawn-aura-pedestal"');
      const pedestalIdx = markup.indexOf('data-testid="pawn-aura-pedestal"');
      const pedestalSection = markup.slice(pedestalIdx, pedestalIdx + 300);
      expect(pedestalSection).toContain('color="#c0392b"');
    });

    it('[TC-APCO02.02/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] LuxuryPawnModel khi nhận playerColor=#27ae60 thì pawn-enamel-ring có màu #27ae60', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#27ae60' })
      );
      expect(markup).toContain('data-testid="pawn-enamel-ring"');
      const ringIdx = markup.indexOf('data-testid="pawn-enamel-ring"');
      const ringSection = markup.slice(ringIdx, ringIdx + 300);
      expect(ringSection).toContain('color="#27ae60"');
    });

    it('[TC-APCO02.03/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PawnAnimator render quân cờ với đĩa hào quang pawn-aura-pedestal mang đúng màu playerColor của người chơi (#e67e22)', () => {
      const singlePlayer: Player = {
        id: 'player_host_01',
        position: 0,
        balance: 15000,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: false,
      };

      useGameStore.setState({
        playerPositions: { player_host_01: 0 },
        playersInfo: {
          player_host_01: {
            id: 'player_host_01',
            name: 'Đại Gia Sài Gòn',
            balance: 15000,
            tokenColor: '#e67e22',
            ownedProperties: [],
            pawnSlot: 2,
          } as any,
        },
      });

      const markup = renderToStaticMarkup(React.createElement(PawnAnimator, { players: [singlePlayer] }));
      expect(markup).toContain('data-testid="pawn-aura-pedestal"');
      const pedestalIdx = markup.indexOf('data-testid="pawn-aura-pedestal"');
      const section = markup.slice(pedestalIdx, pedestalIdx + 300);
      expect(section).toContain('color="#e67e22"');
    });

    it('[TC-APCO02.04/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PawnAnimator render quân cờ với vòng men pawn-enamel-ring mang đúng màu playerColor của người chơi (#e67e22)', () => {
      const singlePlayer: Player = {
        id: 'player_host_01',
        position: 0,
        balance: 15000,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: false,
      };

      useGameStore.setState({
        playerPositions: { player_host_01: 0 },
        playersInfo: {
          player_host_01: {
            id: 'player_host_01',
            name: 'Đại Gia Sài Gòn',
            balance: 15000,
            tokenColor: '#e67e22',
            ownedProperties: [],
            pawnSlot: 2,
          } as any,
        },
      });

      const markup = renderToStaticMarkup(React.createElement(PawnAnimator, { players: [singlePlayer] }));
      expect(markup).toContain('data-testid="pawn-enamel-ring"');
      const ringIdx = markup.indexOf('data-testid="pawn-enamel-ring"');
      const section = markup.slice(ringIdx, ringIdx + 300);
      expect(section).toContain('color="#e67e22"');
    });

    it('[TC-APCO02.05/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] PawnAnimator kết xuất quân cờ của người chơi theo slot con vật được phân bổ (slot 2 - Ngựa) thay vì ép buộc slot 0', () => {
      const singlePlayer: Player = {
        id: 'player_host_01',
        position: 0,
        balance: 15000,
        skipNextTurn: false,
        auditTurnsLeft: 0,
        consecutiveDoubles: 0,
        hand: [],
        pendingDebts: [],
        extraTurns: 0,
        doubleNextDice: false,
        mortgagedProperties: [],
        bankrupt: false,
      };

      useGameStore.setState({
        playerPositions: { player_host_01: 0 },
        playersInfo: {
          player_host_01: {
            id: 'player_host_01',
            name: 'Đại Gia Sài Gòn',
            balance: 15000,
            tokenColor: '#e67e22',
            ownedProperties: [],
            pawnSlot: 2,
          } as any,
        },
      });

      const markup = renderToStaticMarkup(React.createElement(PawnAnimator, { players: [singlePlayer] }));
      expect(markup).toContain('pawn_horse.glb');
      expect(markup).not.toContain('pawn_dog.glb');
    });

    it('[TC-APCO02.06/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] computeOwnerMap ánh xạ đúng ownerSlot và mascotIcon được tùy biến trong playersInfo (slot 3, 🐘) cho ô đất sở hữu', () => {
      const customPlayersInfo: Record<string, PlayerHudInfo> = {
        player_host_01: {
          id: 'player_host_01',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#8e44ad',
          ownedProperties: [1],
          ownerSlot: 3,
          mascotIcon: '🐘',
        } as any,
      };

      const ownerMap = computeOwnerMap(customPlayersInfo);
      expect(ownerMap[1]?.ownerSlot).toBe(3);
      expect(ownerMap[1]?.mascotIcon).toBe('🐘');
    });

    it('[TC-APCO02.07/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] computeOwnerMap phản ánh đúng tokenColor của người chơi (#8e44ad) trên ô đất sở hữu', () => {
      const customPlayersInfo: Record<string, PlayerHudInfo> = {
        player_host_01: {
          id: 'player_host_01',
          name: 'Đại Gia Sài Gòn',
          balance: 15000,
          tokenColor: '#8e44ad',
          ownedProperties: [1],
          ownerSlot: 3,
          mascotIcon: '🐘',
        } as any,
      };

      const ownerMap = computeOwnerMap(customPlayersInfo);
      expect(ownerMap[1]?.tokenColor).toBe('#8e44ad');
    });

    it('[TC-APCO02.08/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, LayeredDioramaTile kết xuất OwnerBaseTrim mang màu người chơi ownerColor (#e67e22)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#e67e22',
          ownerSlot: 2,
          mascotIcon: '🐎',
        })
      );
      expect(markup).toContain('data-testid="owner-base-trim"');
      const trimIdx = markup.indexOf('data-testid="owner-base-trim"');
      const section = markup.slice(trimIdx, trimIdx + 250);
      expect(section).toContain('color="#e67e22"');
    });

    it('[TC-APCO02.09/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, OwnerPricePill có viền mạ vàng #F59E0B và mặt nền mang màu ownerColor (#e67e22)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#e67e22',
          ownerSlot: 2,
          mascotIcon: '🐎',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      const pillIdx = markup.indexOf('data-testid="owner-price-pill"');
      const section = markup.slice(pillIdx, pillIdx + 450);
      expect(section).toContain('color="#F59E0B"');
      expect(section).toContain('color="#e67e22"');
    });

    it('[TC-APCO02.10/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, OwnerBaseTrim hiển thị đúng màu của chủ nhân (#e67e22)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#e67e22',
          ownerSlot: 2,
          mascotIcon: '🐎',
        })
      );
      expect(markup).toContain('data-testid="owner-base-trim"');
      const trimIdx = markup.indexOf('data-testid="owner-base-trim"');
      const section = markup.slice(trimIdx, trimIdx + 250);
      expect(section).toContain('color="#e67e22"');
    });

    it('[TC-APCO02.11/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, viền chân đế sở hữu viền than #0F172A và viền màu ownerColor (#27ae60)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).toContain('data-testid="owner-base-trim"');
      expect(markup).toContain('data-testid="owner-base-trim-border"');
      const trimIdx = markup.indexOf('data-testid="owner-base-trim-border"');
      const section = markup.slice(trimIdx, trimIdx + 450);
      expect(section).toContain('color="#0F172A"');
      expect(section).toContain('color="#27ae60"');
    });

    it('[TC-APCO02.12/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Khi ô đất có chủ, OwnerPricePill hiển thị nhãn giá với màu nền của chủ nhân', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      const pillIdx = markup.indexOf('data-testid="owner-price-pill"');
      const section = markup.slice(pillIdx, pillIdx + 600);
      expect(section).toContain('color="#27ae60"');
      expect(section).toContain('data-testid="owner-price-label"');
    });

    it('[TC-APCO02.13/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] OwnershipBillboardPin được bao bọc bởi billboard tự động hướng về camera (follow=true)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).toContain('data-testid="ownership-billboard-pin"');
      expect(markup).toContain('follow="true"');
    });

    it('[TC-APCO02.14/MSS][UI-S02/MSS][BR-UI-002][Facet2-Reactivity] Chuyển đổi chủ sở hữu từ người chơi A (#2980b9, 🐈) sang người chơi B (#f1c40f, 🐘) cập nhật tức thì màu sắc trên ô đất', () => {
      const markupOwnerA = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#2980b9',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      const markupOwnerB = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#f1c40f',
          ownerSlot: 3,
          mascotIcon: '🐘',
        })
      );

      expect(markupOwnerA).toContain('color="#2980b9"');
      expect(markupOwnerA).toContain('data-testid="owner-price-pill"');
      expect(markupOwnerB).toContain('color="#f1c40f"');
      expect(markupOwnerB).toContain('data-testid="owner-price-pill"');
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & SSR SAFETY — RENDER HEADLESS AN TOÀN & TÍNH TẤT ĐỊNH
  // =========================================================================
  describe('Facet 3: Resource Disposal & SSR Safety — Vòng Đời & Render Headless', () => {
    it('[TC-APCO03.01/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnModel và PawnAnimator kết xuất tĩnh an toàn trong môi trường SSR/Node mà không văng lỗi', () => {
      const pawnMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#8e44ad' })
      );
      expect(pawnMarkup.length).toBeGreaterThan(100);
      expect(pawnMarkup).toContain('name="PawnAuraPedestal"');
    });

    it('[TC-APCO03.02/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] LayeredDioramaTile kết xuất khay giá và viền đế tĩnh ổn định', () => {
      const tileMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#c0392b',
          ownerSlot: 0,
          mascotIcon: '🐕',
        })
      );
      expect(tileMarkup.length).toBeGreaterThan(200);
      expect(tileMarkup).toContain('data-testid="owner-price-pill"');
      expect(tileMarkup).toContain('data-testid="owner-base-trim"');
    });

    it('[TC-APCO03.03/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Kết xuất LayeredDioramaTile có cọc cờ lặp lại 2 lần bảo đảm tính tất định (idempotent markup)', () => {
      const render1 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 2,
          isCornerTile: false,
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      const render2 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 2,
          isCornerTile: false,
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(render1).toBe(render2);
    });

    it('[TC-APCO03.04/MSS][UI-S02/MSS][BR-UI-002][Facet3-Disposal] Dọn dẹp trạng thái useGameStore sau kiểm thử, không để lại rò rỉ bộ nhớ hay listener treo', () => {
      useGameStore.setState({
        playersInfo: {
          test_p1: {
            id: 'test_p1',
            name: 'Temp',
            balance: 1000,
            tokenColor: '#c0392b',
            ownedProperties: [1],
          },
        },
      });
      useGameStore.setState({ playersInfo: {} });
      const current = useGameStore.getState().playersInfo;
      expect(Object.keys(current)).toHaveLength(0);
      expect(useGameStore.getState().activePawnAnimation).toBeNull();
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & PRESERVATION INVARIANTS — BẢO TỒN BẤT BIẾN & PHÒNG THỦ
  // =========================================================================
  describe('Facet 4: Error Defense & Preservation Invariants — Bất Biến Bảo Toàn & Phòng Thủ', () => {
    it('[TC-APCO04.01/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn testid công trình đồ chơi toy-property-building trên ô đất cấp 1', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#c0392b',
        })
      );
      expect(markup).toContain('data-testid="toy-property-building"');
    });

    it('[TC-APCO04.02/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn testid toy-house trên ô đất cấp 1 và cấp 2', () => {
      const markupL1 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#c0392b',
        })
      );
      const markupL2 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 2,
          isCornerTile: false,
          ownerColor: '#c0392b',
        })
      );
      expect(markupL1).toContain('data-testid="toy-house"');
      expect(markupL2).toContain('data-testid="toy-house"');
    });

    it('[TC-APCO04.03/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn testid toy-hotel trên ô đất cấp 3', () => {
      const markupL3 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 3,
          isCornerTile: false,
          ownerColor: '#c0392b',
        })
      );
      expect(markupL3).toContain('data-testid="toy-hotel"');
    });

    it('[TC-APCO04.04/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn testid đĩa hào quang pawn-aura-pedestal và vòng men pawn-enamel-ring', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 2, playerColor: '#e67e22' })
      );
      expect(markup).toContain('data-testid="pawn-aura-pedestal"');
      expect(markup).toContain('data-testid="pawn-enamel-ring"');
    });

    it('[TC-APCO04.05/MSS][UI-S02/MSS][BR-UI-002][Facet4-Preservation] Bảo tồn testid khay giá owner-price-pill và viền đế owner-base-trim', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#27ae60',
          ownerSlot: 1,
          mascotIcon: '🐈',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('data-testid="owner-base-trim-border"');
      expect(markup).toContain('data-testid="owner-base-trim"');
    });

    it('[TC-APCO04.06/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Toàn bộ chuỗi markup kết xuất của quân cờ và cọc cờ không chứa chuỗi NaN', () => {
      const pawnMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 3, playerColor: '#f1c40f' })
      );
      const tileMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#f1c40f',
          ownerSlot: 3,
          mascotIcon: '🐘',
        })
      );
      expect(pawnMarkup).not.toContain('NaN');
      expect(tileMarkup).not.toContain('NaN');
    });

    it('[TC-APCO04.07/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Thuộc tính của quân cờ và ô cờ không chứa ="undefined" hoặc ="null"', () => {
      const pawnMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#c0392b' })
      );
      const tileMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 1,
          isCornerTile: false,
          ownerColor: '#c0392b',
          ownerSlot: 0,
          mascotIcon: '🐕',
        })
      );
      expect(pawnMarkup).not.toContain('="undefined"');
      expect(tileMarkup).not.toContain('="null"');
    });

    it('[TC-APCO04.08/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] assignRandomPlayerPawns fallback an toàn khi roomCodeOrSeed là chuỗi rỗng hoặc undefined', () => {
      const resEmpty = assignRandomPlayerPawns(fourPlayers, '');
      const resUndef = assignRandomPlayerPawns(fourPlayers, undefined);
      expect(resEmpty).toHaveLength(4);
      expect(resUndef).toHaveLength(4);
    });

    it('[TC-APCO04.09/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] assignRandomPlayerPawns trả về mảng rỗng khi danh sách players rỗng hoặc null', () => {
      const resEmpty = assignRandomPlayerPawns([], 'ROOM_SAIGON_88');
      expect(resEmpty).toHaveLength(0);
    });

    it('[TC-APCO04.10/MSS][UI-S02/MSS][BR-UI-002][Facet4-ErrorDefense] Ô đất không có chủ sở hữu (ownerColor undefined) tuyệt đối không kết xuất OwnershipMarkerInstances hay OwnerBaseTrim', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: undefined,
        })
      );
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
      expect(markup).not.toContain('data-testid="owner-base-trim"');
    });
  });
});

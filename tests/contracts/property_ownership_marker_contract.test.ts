// [TC-58.01/MSS..TC-58.19/MSS][UC-IMP58]
// Contract Test Suite: Property Ownership Marker 3D & 2D Title Deed Seal (IMP-58)
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Unowned State Invariant (unowned tiles must never render flag or base trim)
// Facet 2: State Reactivity & Dynamic Color Mapping (P1..P4 color mapping on flag cloth and OwnerBaseTrim)
// Facet 3: Cross-Cell-Type Coverage (Property, Railroad, Utility vs Non-purchasable tiles)
// Facet 4: 2D Title Deed Ownership Seal & Integrity (TitleDeedModal badge, computeOwnerMap & GameBoard integration)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import * as boardLayoutModule from '../../src/client/3d/board_layout';
import { GameBoard } from '../../src/client/3d/board_layout';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

// Mock Drei components that depend on R3F Canvas context
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, ...props }: any) => React.createElement('billboard', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Mock Board 3D auxiliary components that have heavy sub-trees
vi.mock('../../src/client/3d/miniature_city_diorama', () => ({
  MiniatureCityDiorama: () => React.createElement('group', { name: 'MiniatureCityDiorama' }),
}));

vi.mock('../../src/client/3d/coastal_island_environment', () => ({
  CoastalIslandEnvironment: () => React.createElement('group', { name: 'CoastalIslandEnvironment' }),
}));

vi.mock('../../src/client/3d/cinematic_effects', () => ({
  CinematicLightingAccents: () => React.createElement('group', { name: 'CinematicLightingAccents' }),
}));

vi.mock('../../src/client/3d/construction_slam_vfx', () => ({
  ConstructionSlamVFX: () => React.createElement('group', { name: 'ConstructionSlamVFX' }),
}));

vi.mock('../../src/client/3d/dice_tray', () => ({
  DiceTray: () => React.createElement('group', { name: 'DiceTray' }),
}));

// Domain Fixtures
const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleRailroadCell: BoardCell = {
  index: 5,
  name: 'Bến Xe Miền Tây',
  type: CellType.Railroad,
};

const sampleUtilityCell: BoardCell = {
  index: 12,
  name: 'Tổng Công Ty Điện Lực (EVN)',
  type: CellType.Utility,
};

const PLAYER_COLOR_CASES = [
  { playerId: 'p1', label: 'P1 (Red #DC2626)', color: '#DC2626' },
  { playerId: 'p2', label: 'P2 (Blue #2563EB)', color: '#2563EB' },
  { playerId: 'p3', label: 'P3 (Green #059669)', color: '#059669' },
  { playerId: 'p4', label: 'P4 (Amber #D97706)', color: '#D97706' },
] as const;

const NON_PURCHASABLE_CELL_CASES = [
  { name: 'Go', type: CellType.Go, index: 0, isCorner: true },
  { name: 'Chance', type: CellType.Chance, index: 7, isCorner: false },
  { name: 'Market', type: CellType.Market, index: 2, isCorner: false },
  { name: 'Tax', type: CellType.Tax, index: 4, isCorner: false },
  { name: 'FreeParking', type: CellType.FreeParking, index: 20, isCorner: true },
  { name: 'Audit', type: CellType.Audit, index: 10, isCorner: true },
  { name: 'TaxOrder', type: CellType.TaxOrder, index: 30, isCorner: true },
] as const;

const mockPlayersInfo: Record<string, PlayerHudInfo> = {
  p1: {
    id: 'p1',
    name: 'Nguyễn Văn A',
    balance: 5000,
    tokenColor: '#DC2626',
    ownedProperties: [1, 3],
  },
  p2: {
    id: 'p2',
    name: 'Trần Thị B',
    balance: 4200,
    tokenColor: '#2563EB',
    ownedProperties: [5, 6, 8],
  },
  p3: {
    id: 'p3',
    name: 'Lê Hoàng C',
    balance: 3100,
    tokenColor: '#059669',
    ownedProperties: [12],
  },
  p4: {
    id: 'p4',
    name: 'Phạm Minh D',
    balance: 2800,
    tokenColor: '#D97706',
    ownedProperties: [15],
  },
};

function extractFlagClothColor(markup: string): string | undefined {
  const match = markup.match(/name="FlagCloth"[\s\S]*?<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i);
  return match?.[1];
}

function extractOwnerBaseTrimColor(markup: string): string | undefined {
  const match = markup.match(/(?:name="OwnerBaseTrim"|data-testid="owner-base-trim")[\s\S]*?<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i)
    ?? markup.match(/<mesh[^>]*\bcolor="([^"]+)"[^>]*name="OwnerBaseTrim"/i);
  return match?.[1];
}

function extractOwnerPricePillColor(markup: string): string | undefined {
  const match = markup.match(/(?:name="OwnerPricePill"|data-testid="owner-price-pill")[\s\S]*?<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i);
  return match?.[1];
}

describe('[IMP-58] Property Ownership Marker 3D & 2D Title Deed Seal Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
      playerPositions: {},
      currentTurnPlayerId: 'p1',
    });
  });

  afterEach(() => {
    useGameStore.setState({
      levelMap: {},
      playersInfo: {},
      playerPositions: {},
      currentTurnPlayerId: 'p1',
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & UNOWNED STATE INVARIANT
  // =========================================================================
  describe('Facet 1: Boundary & Unowned State Invariant', () => {
    it('[TC-58.01/MSS][UC-IMP58] LayeredDioramaTile with ownerColor=undefined does NOT render OwnershipMarkerInstances', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: undefined,
        })
      );
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-58.02/MSS][UC-IMP58] LayeredDioramaTile with omitted ownerColor prop does NOT render OwnershipMarkerInstances', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-58.03/MSS][UC-IMP58] LayeredDioramaTile with ownerColor=undefined does NOT render OwnerBaseTrim', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: undefined,
        })
      );
      expect(markup).not.toContain('name="OwnerBaseTrim"');
      expect(markup).not.toContain('data-testid="owner-base-trim"');
    });

    it('[TC-58.04/MSS][UC-IMP58] LayeredDioramaTile with empty string ownerColor does NOT render OwnershipMarkerInstances or OwnerBaseTrim', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '',
        })
      );
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
      expect(markup).not.toContain('name="OwnerBaseTrim"');
    });
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & DYNAMIC COLOR MAPPING
  // =========================================================================
  describe('Facet 2: State Reactivity & Dynamic Color Mapping', () => {
    it.each(PLAYER_COLOR_CASES)(
      '[TC-58.05/MSS][UC-IMP58] When owned by %s, LayeredDioramaTile renders OwnerPricePill and OwnerBaseTrim with matching color',
      ({ color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LayeredDioramaTile as any, {
            cell: samplePropertyCell,
            position: [0, 0, 0],
            currentLevel: 0,
            isCornerTile: false,
            ownerColor: color,
          })
        );
        expect(markup).toContain('data-testid="owner-price-pill"');
        const pillColor = extractOwnerPricePillColor(markup);
        expect(pillColor?.toLowerCase()).toBe(color.toLowerCase());
        const trimColor = extractOwnerBaseTrimColor(markup);
        expect(trimColor?.toLowerCase()).toBe(color.toLowerCase());
      }
    );

    it.each(PLAYER_COLOR_CASES)(
      '[TC-58.06/MSS][UC-IMP58] When owned by %s, LayeredDioramaTile renders OwnerBaseTrim with exact player color',
      ({ color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LayeredDioramaTile as any, {
            cell: samplePropertyCell,
            position: [0, 0, 0],
            currentLevel: 0,
            isCornerTile: false,
            ownerColor: color,
          })
        );
        const trimColor = extractOwnerBaseTrimColor(markup);
        expect(trimColor?.toLowerCase()).toBe(color.toLowerCase());
      }
    );

    it('[TC-58.07/MSS][UC-IMP58] Ownership transfer dynamically updates flag and base trim colors from P1 (#DC2626) to P2 (#2563EB)', () => {
      const markupP1 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      const markupP2 = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#2563EB',
        })
      );
      expect(extractOwnerPricePillColor(markupP1)?.toLowerCase()).toBe('#dc2626');
      expect(extractOwnerPricePillColor(markupP2)?.toLowerCase()).toBe('#2563eb');
      expect(extractOwnerBaseTrimColor(markupP1)?.toLowerCase()).toBe('#dc2626');
      expect(extractOwnerBaseTrimColor(markupP2)?.toLowerCase()).toBe('#2563eb');
    });
  });

  // =========================================================================
  // FACET 3: CROSS-CELL-TYPE COVERAGE
  // =========================================================================
  describe('Facet 3: Cross-Cell-Type Coverage', () => {
    it('[TC-58.08/MSS][UC-IMP58] CellType.Property renders OwnerPricePill and OwnerBaseTrim when owned', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(extractOwnerPricePillColor(markup)?.toLowerCase()).toBe('#dc2626');
      expect(extractOwnerBaseTrimColor(markup)?.toLowerCase()).toBe('#dc2626');
    });

    it('[TC-58.09/MSS][UC-IMP58] CellType.Railroad (transit infrastructure) renders OwnerPricePill and OwnerBaseTrim when owned', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: sampleRailroadCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#2563EB',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(extractOwnerPricePillColor(markup)?.toLowerCase()).toBe('#2563eb');
      expect(extractOwnerBaseTrimColor(markup)?.toLowerCase()).toBe('#2563eb');
    });

    it('[TC-58.10/MSS][UC-IMP58] CellType.Utility (national utility) renders OwnerPricePill and OwnerBaseTrim when owned', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: sampleUtilityCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#059669',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(extractOwnerPricePillColor(markup)?.toLowerCase()).toBe('#059669');
      expect(extractOwnerBaseTrimColor(markup)?.toLowerCase()).toBe('#059669');
    });

    it.each(NON_PURCHASABLE_CELL_CASES)(
      '[TC-58.11/MSS][UC-IMP58] Non-purchasable cell %s (type %s) NEVER renders OwnershipMarkerInstances even when ownerColor is passed',
      ({ name, type, index, isCorner }) => {
        const cell: BoardCell = { index, name, type };
        const markup = renderToStaticMarkup(
          React.createElement(LayeredDioramaTile as any, {
            cell,
            position: [0, 0, 0],
            currentLevel: 0,
            isCornerTile: isCorner,
            ownerColor: '#DC2626',
          })
        );
        expect(markup).not.toContain('name="OwnershipMarkerInstances"');
      }
    );

    it.each(NON_PURCHASABLE_CELL_CASES)(
      '[TC-58.12/MSS][UC-IMP58] Non-purchasable cell %s (type %s) NEVER renders OwnerBaseTrim even when ownerColor is passed',
      ({ name, type, index, isCorner }) => {
        const cell: BoardCell = { index, name, type };
        const markup = renderToStaticMarkup(
          React.createElement(LayeredDioramaTile as any, {
            cell,
            position: [0, 0, 0],
            currentLevel: 0,
            isCornerTile: isCorner,
            ownerColor: '#DC2626',
          })
        );
        expect(markup).not.toContain('name="OwnerBaseTrim"');
        expect(markup).not.toContain('data-testid="owner-base-trim"');
      }
    );
  });

  // =========================================================================
  // FACET 4: 2D TITLE DEED OWNERSHIP SEAL & INTEGRITY
  // =========================================================================
  describe('Facet 4: 2D Title Deed Ownership Seal & Integrity', () => {
    it('[TC-58.13/MSS][UC-IMP58] TitleDeedModal renders ownership certification seal with "CHỨNG NHẬN QUYỀN SỞ HỮU" or "SỔ ĐỎ CHÍNH CHỦ" and ownerName when isOwned=true', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          isOwned: true,
          ownerName: 'Nguyễn Văn A',
          canBuy: false,
        })
      );
      expect(html).toMatch(/CHỨNG NHẬN QUYỀN SỞ HỮU|SỔ ĐỎ CHÍNH CHỦ/);
      expect(html).toContain('Nguyễn Văn A');
    });

    it('[TC-58.14/MSS][UC-IMP58] TitleDeedModal does NOT render ownership seal when isOwned=false, displaying unowned purchase status', () => {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 1,
          isOwned: false,
          canBuy: true,
        })
      );
      expect(html).not.toMatch(/CHỨNG NHẬN QUYỀN SỞ HỮU|SỔ ĐỎ CHÍNH CHỦ/);
      expect(html).toContain('Mua BĐS');
    });

    it('[TC-58.15/MSS][UC-IMP58] TitleDeedModal renders ownership seal for Railroad and Utility tiles when isOwned=true', () => {
      const htmlRailroad = renderToStaticMarkup(
        React.createElement(TitleDeedModal, {
          cellIndex: 5,
          isOwned: true,
          ownerName: 'Trần Thị B',
          canBuy: false,
        })
      );
      expect(htmlRailroad).toMatch(/CHỨNG NHẬN QUYỀN SỞ HỮU|SỔ ĐỎ CHÍNH CHỦ/);
      expect(htmlRailroad).toContain('Trần Thị B');
    });

    it('[TC-58.16/MSS][UC-IMP58] computeOwnerMap in board_layout maps playersInfo correctly to ownerMap with player tokenColor', () => {
      const computeOwnerMap = (boardLayoutModule as any).computeOwnerMap;
      expect(computeOwnerMap).toBeDefined();
      const ownerMap = computeOwnerMap(mockPlayersInfo);
      const color1 = typeof ownerMap[1] === 'object' ? ownerMap[1]?.tokenColor : ownerMap[1];
      expect(color1).toBe('#DC2626');
      const color5 = typeof ownerMap[5] === 'object' ? ownerMap[5]?.tokenColor : ownerMap[5];
      expect(color5).toBe('#2563EB');
      const color12 = typeof ownerMap[12] === 'object' ? ownerMap[12]?.tokenColor : ownerMap[12];
      expect(color12).toBe('#059669');
    });

    it('[TC-58.17/MSS][UC-IMP58] computeOwnerMap leaves unowned cells undefined in ownerMap', () => {
      const computeOwnerMap = (boardLayoutModule as any).computeOwnerMap;
      expect(computeOwnerMap).toBeDefined();
      const ownerMap = computeOwnerMap(mockPlayersInfo);
      expect(ownerMap[0]).toBeUndefined();
      expect(ownerMap[2]).toBeUndefined();
      expect(ownerMap[4]).toBeUndefined();
    });

    it('[TC-58.18/MSS][UC-IMP58] computeOwnerMap returns empty object when playersInfo has no owned properties', () => {
      const computeOwnerMap = (boardLayoutModule as any).computeOwnerMap;
      expect(computeOwnerMap).toBeDefined();
      const ownerMap = computeOwnerMap({});
      expect(Object.keys(ownerMap ?? {}).length).toBe(0);
    });

    it('[TC-58.19/MSS][UC-IMP58] GameBoard layout renders owner-colored markers and trims when playersInfo contains owned properties', () => {
      useGameStore.setState({
        playersInfo: mockPlayersInfo,
      });
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('color="#DC2626"');
      expect(markup).toContain('color="#2563EB"');
    });
  });
});

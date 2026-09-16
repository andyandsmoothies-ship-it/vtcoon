// [TC-83.01/MSS..TC-83.38/A8][UC-IMP83]
// Contract Test Suite: IMP-83 Silver Animal Pawns and 2.5D Billboard Ownership Flag
// Universal 4-Facet Behavioral Matrix:
// Facet 1: PBR Silver Animal Pawns Synchronization (LUXURY_PAWN_CONFIGS 4 slots: #E2E8F0, metalness >= 0.9, roughness <= 0.15, icons 🐕 🐈 🐎 🐘, scale [1.0, 1.0, 1.0])
// Facet 2: Deterministic Random Pawn Allocation (assignRandomPlayerPawns collision-free shuffle seeded by roomCode)
// Facet 3: 2.5D Billboard Ownership Pin & Totem Pillar Preservation (OwnershipMarkerInstances contains <Billboard follow={true}>, OwnershipBillboardPin, preserving FlagPole, FlagCloth, MascotCrestShield)
// Facet 4: Error Defense & Fallback Boundary (slotIndex out-of-bounds, empty roomCode/players, level <0 or >3 clamping, undefined ownerColor)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LUXURY_PAWN_CONFIGS,
  LuxuryPawnModel,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../src/client/3d/luxury_pawn_models';
import { OwnershipMarkerInstances } from '../../src/client/3d/board_tile';

// Mock Drei components for SSR renderToStaticMarkup verification
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, follow = true, ...props }: any) =>
      React.createElement('billboard', { follow: String(follow), ...props }, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});

// Dynamic Station 1 (RED Contract) -> Station 2 (GREEN Implementation) module loader
export interface PawnAssignmentResult {
  readonly playerId: string;
  readonly slotIndex: number;
  readonly pawnConfig?: LuxuryPawnConfig;
}

export type AssignRandomPlayerPawnsFn = (
  players: readonly (string | { id: string })[],
  roomCodeOrSeed?: string
) => readonly PawnAssignmentResult[];

let assignRandomPlayerPawns: AssignRandomPlayerPawnsFn | undefined;

try {
  // @ts-ignore
  const pawnMod = await import('../../src/client/3d/luxury_pawn_models');
  if (typeof pawnMod.assignRandomPlayerPawns === 'function') {
    assignRandomPlayerPawns = pawnMod.assignRandomPlayerPawns;
  }
} catch {
  // Station 1: RED
}

if (!assignRandomPlayerPawns) {
  try {
    // @ts-ignore
    const domainMod = await import('../../src/domain/pawn_assignment');
    if (typeof domainMod.assignRandomPlayerPawns === 'function') {
      assignRandomPlayerPawns = domainMod.assignRandomPlayerPawns;
    }
  } catch {
    // Station 1: RED
  }
}

// 4 Silver Animal Pawn Definitions (IMP-83 Spec)
const SILVER_ANIMAL_CASES = [
  {
    slot: 0,
    name: 'Tượng Chó Bạc Phú Quý',
    animal: 'Chó',
    icon: '🐕',
    expectedColor: '#E2E8F0',
    minMetalness: 0.9,
    maxRoughness: 0.15,
    expectedScale: [1.0, 1.0, 1.0] as const,
  },
  {
    slot: 1,
    name: 'Tượng Mèo Bạc May Mắn',
    animal: 'Mèo',
    icon: '🐈',
    expectedColor: '#E2E8F0',
    minMetalness: 0.9,
    maxRoughness: 0.15,
    expectedScale: [1.0, 1.0, 1.0] as const,
  },
  {
    slot: 2,
    name: 'Tượng Ngựa Bạc Phong Vân',
    animal: 'Ngựa',
    icon: '🐎',
    expectedColor: '#E2E8F0',
    minMetalness: 0.9,
    maxRoughness: 0.15,
    expectedScale: [1.0, 1.0, 1.0] as const,
  },
  {
    slot: 3,
    name: 'Tượng Voi Bạc Thịnh Vượng',
    animal: 'Voi',
    icon: '🐘',
    expectedColor: '#E2E8F0',
    minMetalness: 0.9,
    maxRoughness: 0.15,
    expectedScale: [1.0, 1.0, 1.0] as const,
  },
] as const;

// Helper to extract FlagPole cylinder height
function extractTotemPillarHeight(markup: string): number | null {
  const poleMatch = markup.match(
    /(?:name="FlagPole"|name="TotemPillar"|data-testid="totem-pillar")[\s\S]*?<cylindergeometry[^>]*\bargs="([^"]+)"/i
  );
  if (!poleMatch || !poleMatch[1]) return null;
  const parts = poleMatch[1].split(',').map((p) => parseFloat(p.trim()));
  return parts[2] ?? null;
}

// Helper to extract FlagCloth standard material color
function extractFlagClothColor(markup: string): string | undefined {
  const match = markup.match(/name="FlagCloth"[\s\S]*?<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i);
  return match?.[1];
}

describe('[TC-83][UC-IMP83] IMP-83 Silver Animal Pawns and Billboard Flag Contract Suite', () => {
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

  // =========================================================================
  // FACET 1: PBR SILVER ANIMAL PAWNS SYNCHRONIZATION
  // =========================================================================
  describe('Facet 1: PBR Silver Animal Pawns Synchronization', () => {
    it('[TC-83.01/MSS][UC-IMP83] LUXURY_PAWN_CONFIGS defines exactly 4 slots corresponding to 4 players', () => {
      expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    });

    it.each(SILVER_ANIMAL_CASES)(
      '[TC-83.02..05/MSS][UC-IMP83] LUXURY_PAWN_CONFIGS slot %s (%s) has silver PBR color "#E2E8F0"',
      ({ slot, expectedColor }) => {
        const config = LUXURY_PAWN_CONFIGS[slot];
        expect(config).toBeDefined();
        expect(config?.color.toUpperCase()).toBe(expectedColor.toUpperCase());
      }
    );

    it.each(SILVER_ANIMAL_CASES)(
      '[TC-83.06..09/MSS][UC-IMP83] LUXURY_PAWN_CONFIGS slot %s (%s) satisfies silver PBR specular properties (metalness >= 0.9, roughness <= 0.15)',
      ({ slot, minMetalness, maxRoughness }) => {
        const config = LUXURY_PAWN_CONFIGS[slot];
        expect(config).toBeDefined();
        expect(config?.metalness).toBeGreaterThanOrEqual(minMetalness);
        expect(config?.roughness).toBeLessThanOrEqual(maxRoughness);
      }
    );

    it.each(SILVER_ANIMAL_CASES)(
      '[TC-83.10..13/MSS][UC-IMP83] LUXURY_PAWN_CONFIGS slot %s (%s) represents the required animal icon %s',
      ({ slot, icon }) => {
        const config = LUXURY_PAWN_CONFIGS[slot];
        expect(config).toBeDefined();
        expect(config?.icon).toBe(icon);
      }
    );

    it.each(SILVER_ANIMAL_CASES)(
      '[TC-83.14..17/MSS][UC-IMP83] LUXURY_PAWN_CONFIGS slot %s (%s) has normalized uniform scale [1.0, 1.0, 1.0]',
      ({ slot, expectedScale }) => {
        const config = LUXURY_PAWN_CONFIGS[slot];
        expect(config).toBeDefined();
        expect(Array.from(config?.scale ?? [])).toEqual(Array.from(expectedScale));
      }
    );
  });

  // =========================================================================
  // FACET 2: DETERMINISTIC RANDOM PAWN ALLOCATION
  // =========================================================================
  describe('Facet 2: Deterministic Random Pawn Allocation', () => {
    it('[TC-83.18/MSS][UC-IMP83] assignRandomPlayerPawns allocates all 4 slots without duplication across 4 players in a room', () => {
      expect(assignRandomPlayerPawns).toBeDefined();
      const players = ['player_1', 'player_2', 'player_3', 'player_4'];
      const results = assignRandomPlayerPawns!(players, 'VTCOON_ROOM_SEED_01');
      expect(results).toHaveLength(4);
      const allocatedSlots = results.map((r) => r.slotIndex);
      expect(new Set(allocatedSlots).size).toBe(4);
      expect([...allocatedSlots].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
    });

    it('[TC-83.19/MSS][UC-IMP83] assignRandomPlayerPawns produces deterministic assignment when given identical roomCode/seed', () => {
      expect(assignRandomPlayerPawns).toBeDefined();
      const players = ['p1', 'p2', 'p3', 'p4'];
      const firstRun = assignRandomPlayerPawns!(players, 'CONSISTENT_SEED_XYZ');
      const secondRun = assignRandomPlayerPawns!(players, 'CONSISTENT_SEED_XYZ');
      expect(firstRun.map((r) => r.slotIndex)).toEqual(secondRun.map((r) => r.slotIndex));
    });

    it('[TC-83.20/MSS][UC-IMP83] assignRandomPlayerPawns supports player object format preserving playerId', () => {
      expect(assignRandomPlayerPawns).toBeDefined();
      const playerObjects = [{ id: 'user_a' }, { id: 'user_b' }, { id: 'user_c' }, { id: 'user_d' }];
      const results = assignRandomPlayerPawns!(playerObjects, 'ROOM_OBJ_TEST');
      expect(results.map((r) => r.playerId)).toEqual(['user_a', 'user_b', 'user_c', 'user_d']);
      const slots = results.map((r) => r.slotIndex);
      expect(new Set(slots).size).toBe(4);
    });

    it('[TC-83.21/MSS][UC-IMP83] assignRandomPlayerPawns generates valid collision-free slots for 2 or 3 player rooms', () => {
      const twoPlayers = ['p_alpha', 'p_beta'];
      const results = assignRandomPlayerPawns!(twoPlayers, 'ROOM_DUO_TEST');
      expect(results).toHaveLength(2);
      expect(results[0]?.slotIndex).not.toBe(results[1]?.slotIndex);
      expect([0, 1, 2, 3]).toContain(results[0]?.slotIndex);
      expect([0, 1, 2, 3]).toContain(results[1]?.slotIndex);
    });
  });

  // =========================================================================
  // FACET 3: 2.5D BILLBOARD OWNERSHIP PIN & TOTEM PRESERVATION
  // =========================================================================
  describe('Facet 3: 2.5D Billboard Ownership Pin & Totem Preservation', () => {
    it('[TC-83.22/MSS][UC-IMP83] OwnershipMarkerInstances renders 2.5D Billboard component with follow={true}', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: 1,
        })
      );
      expect(markup).toContain('<billboard');
      expect(markup).toContain('follow="true"');
    });

    it('[TC-83.23/MSS][UC-IMP83] OwnershipMarkerInstances renders Billboard pin node with identifier OwnershipBillboardPin', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: 1,
        })
      );
      const hasBillboardPin =
        markup.includes('name="OwnershipBillboardPin"') ||
        markup.includes('data-testid="ownership-billboard-pin"');
      expect(hasBillboardPin).toBe(true);
    });

    it('[TC-83.24/MSS][UC-IMP83] OwnershipMarkerInstances preserves FlagCloth pennant carrying owner color', () => {
      const targetColor = '#2563EB';
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: targetColor,
          ownerSlot: 1,
          level: 1,
        })
      );
      expect(markup).toContain('name="FlagCloth"');
      const clothColor = extractFlagClothColor(markup);
      expect(clothColor?.toLowerCase()).toBe(targetColor.toLowerCase());
    });

    it('[TC-83.25/MSS][UC-IMP83] OwnershipMarkerInstances preserves FlagPole totem pillar structure (height >= 0.4m)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#059669',
          ownerSlot: 2,
          level: 2,
        })
      );
      expect(markup).toContain('name="FlagPole"');
      const height = extractTotemPillarHeight(markup);
      expect(height).not.toBeNull();
      expect(height!).toBeGreaterThanOrEqual(0.4);
    });

    it('[TC-83.26/MSS][UC-IMP83] OwnershipMarkerInstances preserves MascotCrestShield carrying owner color', () => {
      const targetColor = '#D97706';
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: targetColor,
          ownerSlot: 3,
          level: 0,
        })
      );
      const hasShield =
        markup.includes('name="MascotCrestShield"') ||
        markup.includes('data-testid="mascot-crest-shield"');
      expect(hasShield).toBe(true);
      expect(markup.toLowerCase()).toContain(targetColor.toLowerCase());
    });

    it.each(SILVER_ANIMAL_CASES)(
      '[TC-83.27..30/MSS][UC-IMP83] OwnershipMarkerInstances for slot %s renders the corresponding animal icon %s (%s)',
      ({ slot, icon, expectedColor }) => {
        const markup = renderToStaticMarkup(
          React.createElement(OwnershipMarkerInstances, {
            ownerColor: expectedColor,
            ownerSlot: slot,
            level: 1,
          })
        );
        expect(markup).toContain(icon);
      }
    );
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & FALLBACK BOUNDARY
  // =========================================================================
  describe('Facet 4: Error Defense & Fallback Boundary', () => {
    it('[TC-83.31/A1][UC-IMP83] getPawnConfigBySlot with negative slotIndex (-1) safely defaults to slot 0 (🐕 Chó)', () => {
      const fallbackConfig = getPawnConfigBySlot(-1);
      expect(fallbackConfig).toBeDefined();
      expect(fallbackConfig.slot).toBe(0);
      expect(fallbackConfig.icon).toBe('🐕');
    });

    it.each([4, 99, 1000])(
      '[TC-83.32/A2][UC-IMP83] getPawnConfigBySlot with out-of-range slotIndex (%s) safely defaults to slot 0 (🐕 Chó)',
      (outSlot) => {
        const fallbackConfig = getPawnConfigBySlot(outSlot);
        expect(fallbackConfig).toBeDefined();
        expect(fallbackConfig.slot).toBe(0);
        expect(fallbackConfig.icon).toBe('🐕');
      }
    );

    it.each([NaN, Infinity, -Infinity])(
      '[TC-83.33/A3][UC-IMP83] getPawnConfigBySlot with non-finite slotIndex (%s) safely defaults to slot 0 (🐕 Chó)',
      (invalidSlot) => {
        const fallbackConfig = getPawnConfigBySlot(invalidSlot);
        expect(fallbackConfig).toBeDefined();
        expect(fallbackConfig.slot).toBe(0);
        expect(fallbackConfig.icon).toBe('🐕');
      }
    );

    it('[TC-83.34/A4][UC-IMP83] assignRandomPlayerPawns with empty roomCode executes safely without throwing', () => {
      expect(assignRandomPlayerPawns).toBeDefined();
      const results = assignRandomPlayerPawns!(['p1', 'p2'], '');
      expect(results).toHaveLength(2);
      expect(typeof results[0]?.slotIndex).toBe('number');
    });

    it('[TC-83.35/A5][UC-IMP83] assignRandomPlayerPawns with empty players array returns empty array', () => {
      expect(assignRandomPlayerPawns).toBeDefined();
      const results = assignRandomPlayerPawns!([], 'ROOM_EMPTY');
      expect(results).toEqual([]);
    });

    it('[TC-83.36/A6][UC-IMP83] OwnershipMarkerInstances clamps negative level (-2) to level 0 (zero tier rings)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: -2,
        })
      );
      expect(markup).not.toContain('name="TierRing_1"');
      expect(markup).not.toContain('name="TierIndicatorRings"');
    });

    it('[TC-83.37/A7][UC-IMP83] OwnershipMarkerInstances clamps overflow level (10) to level 3 (maximum 3 tier rings)', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: 10,
        })
      );
      expect(markup).toContain('name="TierRing_3"');
      expect(markup).not.toContain('name="TierRing_4"');
    });

    it('[TC-83.38/A8][UC-IMP83] OwnershipMarkerInstances handles undefined ownerColor with safe fallback color', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances, {
          ownerColor: undefined,
          ownerSlot: 0,
          level: 1,
        })
      );
      expect(markup).toContain('name="FlagCloth"');
      expect(markup.toLowerCase()).toContain('#dc2626');
    });
  });
});

// [TC-82.01/MSS..TC-82.26/A7][UC-IMP82]
// Contract Test Suite: Die-Cast Pawns and 3D Ownership Totem (IMP-82)
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Unowned State Invariant (unowned tile: no OwnerBaseTrim or Totem; owned: OwnerBaseTrim thickness >= 0.08m & border #0F172A)
// Facet 2: 3D Ownership Totem Pillar & Mascot Shield Reactivity (pillar height >= 0.4m, MascotCrestShield displaying mascot 🏰/⛵/🚗/🐎 & FlagCloth in owner color)
// Facet 3: Die-Cast Metal Tokens Synchronization (LUXURY_PAWN_CONFIGS 4 slots, metal-plated base with player enamel ring, 4 GLBs < 150KB)
// Facet 4: Error Defense & Fallback Resilience (slotIndex -1, 4, 99, ownerColor empty/undefined, level bounds clamping)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { LayeredDioramaTile, OwnershipMarkerInstances } from '../../src/client/3d/board_tile';
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
} from '../../src/client/3d/luxury_pawn_models';
import { CellType, ColorGroup, type BoardCell } from '../../src/domain/board_config';

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

// Domain Fixtures
const samplePropertyCell: BoardCell = {
  index: 1,
  name: 'Cần Thơ (Cái Răng)',
  type: CellType.Property,
  colorGroup: ColorGroup.Nau,
};

const sampleNonPurchasableCell: BoardCell = {
  index: 0,
  name: 'Xuất Phát (GO)',
  type: CellType.Go,
};

const MASCOT_SLOT_CASES = [
  { slot: 0, icon: '🏰', name: 'Tượng Tháp Landmark Hoàng Gia', color: '#DC2626' },
  { slot: 1, icon: '⛵', name: 'Tượng Du Thuyền Vịnh Biển', color: '#2563EB' },
  { slot: 2, icon: '🚗', name: 'Tượng Xe Cổ Cổ Điển', color: '#059669' },
  { slot: 3, icon: '🐎', name: 'Tượng Ngựa Chiến Kỳ Hạm', color: '#D97706' },
] as const;

const GLB_FILE_CASES = [
  { slot: 0, fileName: 'pawn_tower.glb' },
  { slot: 1, fileName: 'pawn_yacht.glb' },
  { slot: 2, fileName: 'pawn_car.glb' },
  { slot: 3, fileName: 'pawn_horse.glb' },
] as const;

// Helper: Extract boxGeometry height (Y thickness) from OwnerBaseTrim
function extractOwnerBaseTrimThickness(markup: string): number | null {
  const trimBlockMatch = markup.match(/(?:name="OwnerBaseTrim"|data-testid="owner-base-trim")[\s\S]*?<\/mesh>/i);
  if (!trimBlockMatch) return null;
  const argsMatch = trimBlockMatch[0].match(/<boxgeometry[^>]*\bargs="([^"]+)"/i);
  if (!argsMatch) return null;
  const rawArgs = argsMatch[1];
  if (!rawArgs) return null;
  const parts = rawArgs.split(',').map((p) => parseFloat(p.trim()));
  return parts[1] ?? null;
}

// Helper: Extract cylinderGeometry height from FlagPole or TotemPillar
function extractTotemPillarHeight(markup: string): number | null {
  const poleMatch = markup.match(/(?:name="FlagPole"|name="TotemPillar"|data-testid="totem-pillar")[\s\S]*?<cylindergeometry[^>]*\bargs="([^"]+)"/i);
  if (!poleMatch) return null;
  const rawArgs = poleMatch[1];
  if (!rawArgs) return null;
  const parts = rawArgs.split(',').map((p) => parseFloat(p.trim()));
  // cylinderGeometry args: [radiusTop, radiusBottom, height, radialSegments]
  return parts[2] ?? null;
}

// Helper: Extract flag cloth color from FlagCloth mesh
function extractFlagClothColor(markup: string): string | undefined {
  const match = markup.match(/name="FlagCloth"[\s\S]*?<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i);
  return match?.[1];
}

describe('[TC-82][UC-IMP82] IMP-82 Die-Cast Pawns and 3D Ownership Totem Contract Suite', () => {
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
  // FACET 1: BOUNDARY & UNOWNED STATE INVARIANT
  // =========================================================================
  describe('Facet 1: Boundary & Unowned State Invariant', () => {
    it('[TC-82.01/MSS][UC-IMP82] Unowned property cell with ownerColor=undefined renders neither OwnerBaseTrim nor OwnershipMarkerInstances', () => {
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
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-82.02/MSS][UC-IMP82] Unowned property cell with empty string ownerColor renders neither OwnerBaseTrim nor OwnershipMarkerInstances', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '',
        })
      );
      expect(markup).not.toContain('name="OwnerBaseTrim"');
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-82.03/MSS][UC-IMP82] Non-purchasable cell (e.g. GO) never renders OwnerBaseTrim or Totem even if ownerColor is supplied', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: sampleNonPurchasableCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: true,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).not.toContain('name="OwnerBaseTrim"');
      expect(markup).not.toContain('name="OwnershipMarkerInstances"');
    });

    it('[TC-82.04/MSS][UC-IMP82] Owned property cell renders OwnerBaseTrim with physical thickness >= 0.08m', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).toContain('name="OwnerBaseTrim"');
      const thickness = extractOwnerBaseTrimThickness(markup);
      expect(thickness).not.toBeNull();
      expect(thickness!).toBeGreaterThanOrEqual(0.08);
    });

    it('[TC-82.05/MSS][UC-IMP82] Owned property cell renders dark slate border #0F172A on OwnerBaseTrim frame', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile as any, {
          cell: samplePropertyCell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      const hasBorderIndicator =
        markup.includes('name="OwnerBaseTrimBorder"') ||
        markup.includes('data-testid="owner-base-trim-border"') ||
        markup.toLowerCase().includes('color="#0f172a"');
      expect(hasBorderIndicator).toBe(true);
      expect(markup.toLowerCase()).toContain('#0f172a');
    });
  });

  // =========================================================================
  // FACET 2: 3D OWNERSHIP TOTEM PILLAR & MASCOT SHIELD REACTIVITY
  // =========================================================================
  describe('Facet 2: 3D Ownership Totem Pillar & Mascot Shield Reactivity', () => {
    it('[TC-82.06/MSS][UC-IMP82] OwnershipMarkerInstances renders totem pillar with height >= 0.4m', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances as any, {
          ownerColor: '#DC2626',
          level: 1,
        })
      );
      const pillarHeight = extractTotemPillarHeight(markup);
      expect(pillarHeight).not.toBeNull();
      expect(pillarHeight!).toBeGreaterThanOrEqual(0.4);
    });

    it('[TC-82.07/MSS][UC-IMP82] OwnershipMarkerInstances renders FlagCloth pennant carrying exact owner color', () => {
      const targetColor = '#2563EB';
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances as any, {
          ownerColor: targetColor,
          level: 1,
        })
      );
      expect(markup).toContain('name="FlagCloth"');
      const flagColor = extractFlagClothColor(markup);
      expect(flagColor?.toLowerCase()).toBe(targetColor.toLowerCase());
    });

    it('[TC-82.08/MSS][UC-IMP82] OwnershipMarkerInstances renders circular MascotCrestShield element', () => {
      const markup = renderToStaticMarkup(
        React.createElement(OwnershipMarkerInstances as any, {
          ownerColor: '#DC2626',
          ownerSlot: 0,
          level: 0,
        })
      );
      const hasMascotShield =
        markup.includes('name="MascotCrestShield"') ||
        markup.includes('data-testid="mascot-crest-shield"');
      expect(hasMascotShield).toBe(true);
    });

    it.each(MASCOT_SLOT_CASES)(
      '[TC-82.09..12/MSS][UC-IMP82] OwnershipMarkerInstances for slot %s displays mascot icon %s (%s)',
      ({ slot, icon, color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(OwnershipMarkerInstances as any, {
            ownerColor: color,
            ownerSlot: slot,
            mascotIcon: icon,
            level: 1,
          })
        );
        expect(markup).toContain(icon);
      }
    );
  });

  // =========================================================================
  // FACET 3: DIE-CAST METAL TOKENS SYNCHRONIZATION
  // =========================================================================
  describe('Facet 3: Die-Cast Metal Tokens Synchronization', () => {
    it('[TC-82.13/MSS][UC-IMP82] LUXURY_PAWN_CONFIGS defines exactly 4 player slots (0 to 3)', () => {
      expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    });

    it.each(MASCOT_SLOT_CASES)(
      '[TC-82.14/MSS][UC-IMP82] LUXURY_PAWN_CONFIGS slot %s meets die-cast PBR standard (metalness >= 0.8, roughness <= 0.2)',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot];
        expect(config).toBeDefined();
        expect(config?.metalness).toBeGreaterThanOrEqual(0.8);
        expect(config?.roughness).toBeLessThanOrEqual(0.2);
      }
    );

    it.each(GLB_FILE_CASES)(
      '[TC-82.15/MSS][UC-IMP82] GLB model %s is binary glTF (0x46546C67) with size strictly < 150KB budget',
      ({ fileName }) => {
        const filePath = path.resolve(process.cwd(), 'public/models/pawns', fileName);
        const stats = fs.statSync(filePath);
        expect(stats.size).toBeLessThan(150 * 1024);

        const buffer = fs.readFileSync(filePath);
        const magic = buffer.readUInt32LE(0);
        // 0x46546C67 is ASCII 'glTF' in little-endian
        expect(magic).toBe(0x46546C67);
      }
    );

    it('[TC-82.16/MSS][UC-IMP82] LuxuryPawnModel renders metal-plated base geometry with aura and enamel rings', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel as any, { slotIndex: 0 })
      );
      expect(markup.toLowerCase()).toContain('<cylindergeometry');
      expect(markup).toContain('data-testid="pawn-aura-pedestal"');
      expect(markup).toContain('data-testid="pawn-enamel-ring"');
    });

    it.each(MASCOT_SLOT_CASES)(
      '[TC-82.17/MSS][UC-IMP82] LuxuryPawnModel slot %s renders EnamelRing matching player color %s',
      ({ slot, color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LuxuryPawnModel as any, {
            slotIndex: slot,
            playerColor: color,
          })
        );
        const hasEnamelRing =
          markup.includes('name="EnamelRing"') ||
          markup.includes('data-testid="pawn-enamel-ring"');
        expect(hasEnamelRing).toBe(true);
        expect(markup.toLowerCase()).toContain(color.toLowerCase());
      }
    );
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & FALLBACK RESILIENCE
  // =========================================================================
  describe('Facet 4: Error Defense & Fallback Resilience', () => {
    it('[TC-82.18/A1][UC-IMP82] getPawnConfigBySlot with negative slotIndex (-1) safely defaults to slot 0', () => {
      const fallbackConfig = getPawnConfigBySlot(-1);
      expect(fallbackConfig).toBeDefined();
      expect(fallbackConfig.slot).toBe(0);
      expect(fallbackConfig.icon).toBe(LUXURY_PAWN_CONFIGS[0]?.icon);
    });

    it.each([4, 99, 1000])(
      '[TC-82.19/A2][UC-IMP82] getPawnConfigBySlot with out-of-range slotIndex (%s) safely defaults to slot 0',
      (outSlot) => {
        const fallbackConfig = getPawnConfigBySlot(outSlot);
        expect(fallbackConfig).toBeDefined();
        expect(fallbackConfig.slot).toBe(0);
        expect(fallbackConfig.name).toBe(LUXURY_PAWN_CONFIGS[0]?.name);
      }
    );

    it.each([NaN, Infinity, -Infinity])(
      '[TC-82.20/A3][UC-IMP82] getPawnConfigBySlot with non-finite slotIndex (%s) safely defaults to slot 0',
      (invalidSlot) => {
        const fallbackConfig = getPawnConfigBySlot(invalidSlot);
        expect(fallbackConfig).toBeDefined();
        expect(fallbackConfig.slot).toBe(0);
      }
    );

    it.each([-1, 99, NaN])(
      '[TC-82.21/A4][UC-IMP82] LuxuryPawnModel with invalid slotIndex (%s) renders safely without throwing',
      (badSlot) => {
        expect(() => {
          renderToStaticMarkup(
            React.createElement(LuxuryPawnModel as any, { slotIndex: badSlot })
          );
        }).not.toThrow();
      }
    );

    it('[TC-82.22/A5][UC-IMP82] OwnershipMarkerInstances with undefined or empty ownerColor defaults safely without throwing', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(OwnershipMarkerInstances as any, {
            ownerColor: undefined,
            level: 0,
          })
        );
      }).not.toThrow();
    });

    it.each([-1, -5, -99])(
      '[TC-82.23/A6][UC-IMP82] OwnershipMarkerInstances with negative level (%s) clamps to 0 tier rings',
      (negativeLevel) => {
        const markup = renderToStaticMarkup(
          React.createElement(OwnershipMarkerInstances as any, {
            ownerColor: '#DC2626',
            level: negativeLevel,
          })
        );
        expect(markup).not.toContain('name="TierRing_1"');
        expect(markup).not.toContain('name="TierIndicatorRings"');
      }
    );

    it.each([4, 10, 99])(
      '[TC-82.24/A7][UC-IMP82] OwnershipMarkerInstances with excessive level (%s) clamps to maximum 3 tier rings',
      (excessiveLevel) => {
        const markup = renderToStaticMarkup(
          React.createElement(OwnershipMarkerInstances as any, {
            ownerColor: '#DC2626',
            level: excessiveLevel,
          })
        );
        expect(markup).toContain('name="TierRing_1"');
        expect(markup).toContain('name="TierRing_2"');
        expect(markup).toContain('name="TierRing_3"');
        expect(markup).not.toContain('name="TierRing_4"');
      }
    );
  });
});

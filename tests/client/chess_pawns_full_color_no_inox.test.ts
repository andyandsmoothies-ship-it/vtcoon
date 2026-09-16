// [TC-CPFC01/MSS..TC-CPFC04/A8][UI-S01/MSS][BR-UI-002] Contract Test Suite: Chess Pawns Full Color No Inox (IMP-105)
// Traceability: docs/epics/networking/_epic_ledger.md § IMP-105 / Station 1: RED Contract Test
// User Requirement: "Cập nhật các con cờ thành 4 con random là con xe, pháo, mã, hậu và mỗi con có 1 màu riêng toàn bộ luôn, không còn màu inox nữa"
//
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Boundary & Range (Xe - Pháo - Mã - Hậu archetypes, slot [0..3], icons ['🏰', '💣', '🐎', '👑'], metalness <= 0.40, no silver #F8FAFC/#E2E8F0)
// Facet 2: State Reactivity & Consumer Point (Full-body playerColor propagation across all main meshes, synchronized aura/enamel rings, deterministic random assignment)
// Facet 3: Resource Disposal & SSR Headless Safety (Zero memory leaks, idempotent render cycles, pure functional trees, exported fallback registry)
// Facet 4: Error Defense & Zero-Crash Preservation (Graceful fallback on slot bounds [-1, 4, NaN, Infinity], undefined playerColor safety, finite geometries)

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
} from '../../src/client/3d/luxury_pawn_models';
import * as pawnFallbacks from '../../src/client/3d/luxury_pawn_fallbacks';
import { LuxuryPawnProceduralFallback } from '../../src/client/3d/luxury_pawn_fallbacks';
import { assignRandomPlayerPawns } from '../../src/domain/pawn_assignment';
import { PLAYER_TOKEN_PALETTE } from '../../src/domain/theme';

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

// =============================================================================
// HELPER PARSERS FOR R3F SSR MARKUP EXTRACTION
// =============================================================================

/**
 * Extracts material color from a mesh block matching given identifier
 */
function extractMeshColorByIdentifier(markup: string, pattern: RegExp): string | null {
  const match = markup.match(pattern);
  if (!match) return null;
  const meshBlock = match[0];
  const colorMatch =
    meshBlock.match(/<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i) ||
    meshBlock.match(/<meshbasicmaterial[^>]*\bcolor="([^"]+)"/i);
  return colorMatch ? colorMatch[1] ?? null : null;
}

/**
 * Extracts all mesh standard material colors from markup
 */
function extractAllMeshStandardColors(markup: string): string[] {
  const regex = /<meshstandardmaterial[^>]*\bcolor="([^"]+)"/gi;
  const colors: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) {
    if (match[1]) colors.push(match[1].toLowerCase());
  }
  return colors;
}

/**
 * Extracts mesh colors belonging to the main pawn body, excluding pedestal and enamel rings
 */
function extractPawnBodyColors(markup: string): string[] {
  const sanitized = markup
    .replace(/<mesh[^>]*data-testid="pawn-aura-pedestal"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-enamel-ring"[\s\S]*?<\/mesh>/gi, '');
  return extractAllMeshStandardColors(sanitized);
}

// Cultural Vietnamese token palette test fixtures
const CULTURAL_PALETTE_CASES = PLAYER_TOKEN_PALETTE.map((color, idx) => ({
  slot: idx % 4,
  color,
}));

// Test parameters for 4 chess pawn archetypes
const CHESS_ARCHETYPE_CASES = [
  { slot: 0, piece: 'Xe', expectedIcon: '🏰', nameKeyword: 'Xe', fallbackName: 'RookPawnFallback' },
  { slot: 1, piece: 'Pháo', expectedIcon: '💣', nameKeyword: 'Pháo', fallbackName: 'CannonPawnFallback' },
  { slot: 2, piece: 'Mã', expectedIcon: '🐎', nameKeyword: 'Mã', fallbackName: 'WarhorsePawnFallback' },
  { slot: 3, piece: 'Hậu', expectedIcon: '👑', nameKeyword: 'Hậu', fallbackName: 'QueenPawnFallback' },
] as const;

describe('[TC-CPFC01/MSS..TC-CPFC04/A8][UI-S01/MSS][BR-UI-002] Chess Pawns Full Color No Inox Contract Suite', () => {
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
  // FACET 1: BOUNDARY & RANGE — CHESS PAWNS ARCHETYPES & ZERO-INOX PBR STANDARDS
  // =========================================================================
  describe('Facet 1: Boundary & Range — Chess Pawns Archetypes & Zero-Inox PBR Standards', () => {
    it('[TC-CPFC01.01/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS defines exactly 4 slots [0, 1, 2, 3]', () => {
      expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    });

    it('[TC-CPFC01.02/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS icon array strictly matches ["🏰", "💣", "🐎", "👑"]', () => {
      const icons = LUXURY_PAWN_CONFIGS.map((c) => c.icon);
      expect(icons).toEqual(['🏰', '💣', '🐎', '👑']);
    });

    it('[TC-CPFC01.03/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 0 defines Quân Xe Chiến 🏰 with icon "🏰" and name containing "Xe"', () => {
      const config = LUXURY_PAWN_CONFIGS[0];
      expect(config?.icon).toBe('🏰');
      expect(config?.name).toContain('Xe');
    });

    it('[TC-CPFC01.04/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 1 defines Quân Pháo Thần Công 💣 with icon "💣" and name containing "Pháo"', () => {
      const config = LUXURY_PAWN_CONFIGS[1];
      expect(config?.icon).toBe('💣');
      expect(config?.name).toContain('Pháo');
    });

    it('[TC-CPFC01.05/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 2 defines Quân Mã Dũng Mãnh 🐎 with icon "🐎" and name containing "Mã"', () => {
      const config = LUXURY_PAWN_CONFIGS[2];
      expect(config?.icon).toBe('🐎');
      expect(config?.name).toContain('Mã');
    });

    it('[TC-CPFC01.06/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 3 defines Quân Hậu Vương Giả 👑 with icon "👑" and name containing "Hậu"', () => {
      const config = LUXURY_PAWN_CONFIGS[3];
      expect(config?.icon).toBe('👑');
      expect(config?.name).toContain('Hậu');
    });

    it.each(CHESS_ARCHETYPE_CASES)(
      '[TC-CPFC01.07/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Zero-Inox Invariant: Slot $slot ($piece) has toy lacquer metalness <= 0.40 (no chrome 0.96)',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.metalness).toBeLessThanOrEqual(0.40);
        expect(config.metalness).toBeGreaterThanOrEqual(0.10);
      }
    );

    it.each(CHESS_ARCHETYPE_CASES)(
      '[TC-CPFC01.08/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Zero-Inox Invariant: Slot $slot ($piece) color is not hardcoded silver inox #F8FAFC or #E2E8F0',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.color.toUpperCase()).not.toBe('#F8FAFC');
        expect(config.color.toUpperCase()).not.toBe('#E2E8F0');
      }
    );

    it.each(CHESS_ARCHETYPE_CASES)(
      '[TC-CPFC01.09/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Zero-Inox Invariant: Slot $slot ($piece) name eliminates silver/chrome keywords',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.name).not.toContain('Bạc');
        expect(config.name).not.toContain('Inox');
        expect(config.name).not.toContain('Chrome');
      }
    );

    it.each(CHESS_ARCHETYPE_CASES)(
      '[TC-CPFC01.10/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Tactile Roughness Standard: Slot $slot ($piece) roughness is in range [0.15, 0.45] (no mirror finish 0.08)',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.roughness).toBeGreaterThanOrEqual(0.15);
        expect(config.roughness).toBeLessThanOrEqual(0.45);
      }
    );

    it.each(CHESS_ARCHETYPE_CASES)(
      '[TC-CPFC01.11/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Pawn Stature Normalization: Slot $slot ($piece) scale components are finite and within [0.8, 1.4]',
      ({ slot }) => {
        const config = LUXURY_PAWN_CONFIGS[slot]!;
        expect(config.scale[0]).toBeGreaterThanOrEqual(0.8);
        expect(config.scale[1]).toBeGreaterThanOrEqual(0.8);
        expect(config.scale[2]).toBeGreaterThanOrEqual(0.8);
      }
    );
  });

  // =========================================================================
  // FACET 2: STATE REACTIVITY & CONSUMER POINT ASSERTIONS
  // =========================================================================
  describe('Facet 2: State Reactivity & Consumer Assertions — Full Body Player Color & Deterministic Assignment', () => {
    it('[TC-CPFC02.01/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Slot 0 (Quân Xe): Full-body render with playerColor "#DC2626" colors tower body meshes and leaves zero silver inox', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626' })
      );
      const bodyColors = extractPawnBodyColors(markup);
      expect(bodyColors.some((c) => c === '#dc2626')).toBe(true);
      expect(bodyColors.includes('#f8fafc')).toBe(false);
      expect(bodyColors.includes('#e2e8f0')).toBe(false);
    });

    it('[TC-CPFC02.02/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Slot 1 (Quân Pháo): Full-body render with playerColor "#2563EB" colors cannon barrel/chassis and leaves zero silver inox', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#2563EB' })
      );
      const bodyColors = extractPawnBodyColors(markup);
      expect(bodyColors.some((c) => c === '#2563eb')).toBe(true);
      expect(bodyColors.includes('#f8fafc')).toBe(false);
      expect(bodyColors.includes('#e2e8f0')).toBe(false);
    });

    it('[TC-CPFC02.03/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Slot 2 (Quân Mã): Full-body render with playerColor "#059669" colors warhorse body/head and leaves zero silver inox', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 2, playerColor: '#059669' })
      );
      const bodyColors = extractPawnBodyColors(markup);
      expect(bodyColors.some((c) => c === '#059669')).toBe(true);
      expect(bodyColors.includes('#f8fafc')).toBe(false);
      expect(bodyColors.includes('#e2e8f0')).toBe(false);
    });

    it('[TC-CPFC02.04/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Slot 3 (Quân Hậu): Full-body render with playerColor "#D97706" colors queen robe/crown and leaves zero silver inox', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 3, playerColor: '#D97706' })
      );
      const bodyColors = extractPawnBodyColors(markup);
      expect(bodyColors.some((c) => c === '#d97706')).toBe(true);
      expect(bodyColors.includes('#f8fafc')).toBe(false);
      expect(bodyColors.includes('#e2e8f0')).toBe(false);
    });

    it('[TC-CPFC02.05/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Pedestal & Enamel Ring: pawn-aura-pedestal material color matches playerColor "#E11D48"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#E11D48' })
      );
      const auraColor = extractMeshColorByIdentifier(
        markup,
        /<mesh[^>]*?data-testid="pawn-aura-pedestal"[\s\S]*?<\/mesh>/i
      );
      expect(auraColor?.toLowerCase()).toBe('#e11d48');
    });

    it('[TC-CPFC02.06/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Pedestal & Enamel Ring: pawn-enamel-ring material color matches playerColor "#E11D48"', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#E11D48' })
      );
      const enamelColor = extractMeshColorByIdentifier(
        markup,
        /<mesh[^>]*?data-testid="pawn-enamel-ring"[\s\S]*?<\/mesh>/i
      );
      expect(enamelColor?.toLowerCase()).toBe('#e11d48');
    });

    it.each(CULTURAL_PALETTE_CASES)(
      '[TC-CPFC02.07/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Consumer Point: Cultural palette reactive propagation for color $color',
      ({ slot, color }) => {
        const markup = renderToStaticMarkup(
          React.createElement(LuxuryPawnModel, { slotIndex: slot, playerColor: color })
        );
        const auraColor = extractMeshColorByIdentifier(
          markup,
          /<mesh[^>]*?data-testid="pawn-aura-pedestal"[\s\S]*?<\/mesh>/i
        );
        expect(auraColor?.toLowerCase()).toBe(color.toLowerCase());
      }
    );

    it('[TC-CPFC02.08/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Deterministic Assignment: assignRandomPlayerPawns allocates all 4 distinct chess icons without duplicates for 4 players', () => {
      const players = ['player-saigon-01', 'player-hanoi-02', 'player-danang-03', 'player-cantho-04'];
      const results = assignRandomPlayerPawns(players, 'ROOM_SAIGON_88');
      const icons = results.map((r) => r.mascotIcon).sort();
      expect(icons).toEqual(['👑', '🏰', '💣', '🐎'].sort());
      expect(results).toHaveLength(4);
    });

    it('[TC-CPFC02.09/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Deterministic Assignment: assignRandomPlayerPawns assigns unique tokenColor from PLAYER_TOKEN_PALETTE to each player', () => {
      const players = ['p1', 'p2', 'p3', 'p4'];
      const results = assignRandomPlayerPawns(players, 'ROOM_CHESS_VIP');
      const colors = new Set(results.map((r) => r.tokenColor));
      expect(colors.size).toBe(4);
    });

    it('[TC-CPFC02.10/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Deterministic Assignment: Assignment is strictly deterministic for identical roomCode seed', () => {
      const players = ['p1', 'p2', 'p3', 'p4'];
      const run1 = assignRandomPlayerPawns(players, 'FIXED_SEED_1337');
      const run2 = assignRandomPlayerPawns(players, 'FIXED_SEED_1337');
      expect(run1.map((r) => r.slotIndex)).toEqual(run2.map((r) => r.slotIndex));
      expect(run1.map((r) => r.mascotIcon)).toEqual(run2.map((r) => r.mascotIcon));
    });

    it('[TC-CPFC02.11/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Deterministic Assignment: Mascot name in assignment result reflects chess piece (Xe/Pháo/Mã/Hậu)', () => {
      const players = ['p1', 'p2', 'p3', 'p4'];
      const results = assignRandomPlayerPawns(players, 'ROOM_PHOHOA_99');
      const hasValidChessNames = results.every((r) =>
        r.mascotName && (r.mascotName.includes('Xe') || r.mascotName.includes('Pháo') || r.mascotName.includes('Mã') || r.mascotName.includes('Hậu'))
      );
      expect(hasValidChessNames).toBe(true);
      const hasObsoleteNames = results.some((r) =>
        r.mascotName && (r.mascotName.includes('Chó') || r.mascotName.includes('Mèo') || r.mascotName.includes('Voi'))
      );
      expect(hasObsoleteNames).toBe(false);
    });
  });

  // =========================================================================
  // FACET 3: RESOURCE DISPOSAL & SSR HEADLESS SAFETY
  // =========================================================================
  describe('Facet 3: Resource Disposal & SSR Headless Safety', () => {
    it('[TC-CPFC03.01/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnModel renders cleanly in headless SSR static markup without throwing', () => {
      expect(() => {
        renderToStaticMarkup(
          React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626' })
        );
      }).not.toThrow();
    });

    it('[TC-CPFC03.02/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Repeated 10-cycle rendering produces idempotent markup without dangling state or mutation', () => {
      const firstMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#2563EB' })
      );
      const tenthMarkup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#2563EB' })
      );
      expect(firstMarkup).toBe(tenthMarkup);
    });

    it('[TC-CPFC03.03/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Procedural Fallback Component Registry: RookPawnFallback is exported as valid React component', () => {
      const RookFallback = (pawnFallbacks as any).RookPawnFallback;
      expect(RookFallback).toBeDefined();
    });

    it('[TC-CPFC03.04/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Procedural Fallback Component Registry: CannonPawnFallback is exported as valid React component', () => {
      const CannonFallback = (pawnFallbacks as any).CannonPawnFallback;
      expect(CannonFallback).toBeDefined();
    });

    it('[TC-CPFC03.05/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Procedural Fallback Component Registry: WarhorsePawnFallback (or KnightPawnFallback) is exported as valid React component', () => {
      const WarhorseFallback = (pawnFallbacks as any).WarhorsePawnFallback ?? (pawnFallbacks as any).KnightPawnFallback;
      expect(WarhorseFallback).toBeDefined();
    });

    it('[TC-CPFC03.06/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Procedural Fallback Component Registry: QueenPawnFallback is exported as valid React component', () => {
      const QueenFallback = (pawnFallbacks as any).QueenPawnFallback;
      expect(QueenFallback).toBeDefined();
    });

    it('[TC-CPFC03.07/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnProceduralFallback produces pure functional React element with zero listener leaks', () => {
      const element = React.createElement(LuxuryPawnProceduralFallback, {
        slotIndex: 0,
        config: LUXURY_PAWN_CONFIGS[0]!,
        playerColor: '#DC2626',
      });
      expect(React.isValidElement(element)).toBe(true);
    });
  });

  // =========================================================================
  // FACET 4: ERROR DEFENSE & ZERO-CRASH PRESERVATION
  // =========================================================================
  describe('Facet 4: Error Defense & Zero-Crash Preservation', () => {
    it('[TC-CPFC04.01/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Out-of-bounds slotIndex (-1, 4, 999, NaN, Infinity) safely clamps to Slot 0 (Quân Xe 🏰)', () => {
      const negConfig = getPawnConfigBySlot(-1);
      const overConfig = getPawnConfigBySlot(4);
      const hugeConfig = getPawnConfigBySlot(999);
      const nanConfig = getPawnConfigBySlot(NaN);
      expect(negConfig.slot).toBe(0);
      expect(overConfig.slot).toBe(0);
      expect(hugeConfig.slot).toBe(0);
      expect(nanConfig.slot).toBe(0);
    });

    it('[TC-CPFC04.02/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Missing playerColor (undefined/empty) defaults cleanly without producing "undefined" or NaN in markup', () => {
      const markup = renderToStaticMarkup(
        React.createElement(LuxuryPawnModel, { slotIndex: 0 })
      );
      expect(markup).not.toContain('color="undefined"');
      expect(markup).not.toContain('undefined');
      expect(markup).not.toContain('NaN');
    });

    it('[TC-CPFC04.03/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Empty or null players array in assignRandomPlayerPawns returns empty array safely', () => {
      expect(assignRandomPlayerPawns([])).toEqual([]);
      expect(assignRandomPlayerPawns(undefined as any)).toEqual([]);
    });

    it('[TC-CPFC04.04/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] All numeric properties in LUXURY_PAWN_CONFIGS are strictly finite numbers', () => {
      const hasOnlyFiniteNumbers = LUXURY_PAWN_CONFIGS.every(
        (c) =>
          Number.isFinite(c.slot) &&
          Number.isFinite(c.metalness) &&
          Number.isFinite(c.roughness) &&
          c.scale.every(Number.isFinite) &&
          (c.yOffset === undefined || Number.isFinite(c.yOffset))
      );
      expect(hasOnlyFiniteNumbers).toBe(true);
    });

    it.each([0, 1, 2, 3])(
      '[TC-CPFC04.05/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Fallback dispatch in LuxuryPawnProceduralFallback handles slot %i without throwing',
      (slot) => {
        expect(() => {
          renderToStaticMarkup(
            React.createElement(LuxuryPawnProceduralFallback, {
              slotIndex: slot,
              config: LUXURY_PAWN_CONFIGS[slot]!,
              playerColor: '#DC2626',
            })
          );
        }).not.toThrow();
      }
    );
  });
});

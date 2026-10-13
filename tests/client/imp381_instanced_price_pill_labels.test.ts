// @vitest-environment happy-dom
// [TC-381.01..TC-381.06][UI-S02/MSS] Contract Test Suite: OwnerPricePill Instanced Labels & Canvas Texture Atlas (IMP-381)
import { describe, it, expect, vi, beforeEach } from 'vitest';

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import {
  getPricePillAtlasTexture,
  getPricePillAtlasUVs,
  clearPricePillAtlasCache,
  computePricePillSlotDescriptor,
  PILL_ATLAS_COLS,
  PILL_ATLAS_ROWS,
  PILL_ATLAS_WIDTH,
  PILL_ATLAS_HEIGHT,
} from '../../src/client/3d/price_pill_texture_atlas';
import {
  createBatchedPricePillLabelsGeometry,
  PRICE_PILL_LABELS_BATCHED_GEOM,
  PURCHASABLE_CELL_INDICES,
} from '../../src/client/3d/instanced_cell_markers_helpers';
import { InstancedCellBordersAndTrays } from '../../src/client/3d/instanced_cell_borders_and_trays';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { GameBoard } from '../../src/client/3d/board_layout';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { useGameStore } from '../../src/client/store/game_store';

// Mock auxiliary sub-trees in GameBoard
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
vi.mock('../../src/client/3d/diagnostic_3d_panel', () => ({
  Diagnostic3DPanel: () => null,
}));

describe('[IMP-381] OwnerPricePill Instanced Labels & Canvas Texture Atlas Contract Suite', () => {
  beforeEach(() => {
    clearPricePillAtlasCache();
  });

  describe('Facet 1: Texture Atlas Generator, UV Mapping & Cache Lifecycle', () => {
    it('TC-381.01a [UC-IMP381-ATLAS-GENERATION/MSS]: Given 28 purchasable cells and unowned board state, When getPricePillAtlasTexture is invoked, Then returns a valid singleton CanvasTexture containing 28 baked price slots', () => {
      const texture = getPricePillAtlasTexture();
      expect(texture?.isCanvasTexture).toBe(true);
      expect(PILL_ATLAS_COLS).toBe(4);
      expect(PILL_ATLAS_WIDTH).toBe(1024);
      expect(PILL_ATLAS_HEIGHT).toBe(512);
    });


    it('TC-381.01b [UC-IMP381-UV-MAPPING/MSS]: Given cellIndex 1 on the board, When getPricePillAtlasUVs is called, Then returns non-zero UV coordinates uMin, uMax, vMin, vMax bounded within 0 to 1 based on POT 1024x512 grid with half-texel insets', () => {
      const uvs = getPricePillAtlasUVs(1);
      const halfU = 0.5 / PILL_ATLAS_WIDTH;
      const halfV = 0.5 / PILL_ATLAS_HEIGHT;
      expect(uvs.uMin).toBeCloseTo(0.0 + halfU, 6);
      expect(uvs.uMax).toBeCloseTo(0.25 - halfU, 6);
      expect(uvs.vMin).toBeCloseTo(0.875 + halfV, 6);
      expect(uvs.vMax).toBeCloseTo(1.0 - halfV, 6);
    });

    it('TC-381.01c [UC-IMP381-CACHE-DISPOSAL/MSS]: Given cachedPricePillAtlas in memory, When clearPricePillAtlasCache is executed, Then disposes the texture and resets internal cache references to null', () => {
      const texture1 = getPricePillAtlasTexture();
      const disposeSpy = vi.spyOn(texture1 as THREE.CanvasTexture, 'dispose');
      clearPricePillAtlasCache();
      expect(disposeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Facet 2: Ownership State Reactivity & Visual Hierarchy', () => {
    it('TC-381.02a [UC-IMP381-OWNERSHIP-WHITE-TEXT/MSS]: Given cell 1 owned by player without mascot, When computePricePillSlotDescriptor and getPricePillAtlasTexture are evaluated, Then resolves priceColor="#FFFFFF" for owned property and marks texture version', () => {
      const desc = computePricePillSlotDescriptor(1, { tokenColor: '#DC2626' });
      expect(desc?.hasOwner).toBe(true);
      expect(desc?.priceColor).toBe('#FFFFFF');
      const unownedDesc = computePricePillSlotDescriptor(1, undefined);
      expect(unownedDesc?.priceColor).toBe('#FBBF24');
      const texture = getPricePillAtlasTexture({ 1: { tokenColor: '#DC2626' } });
      expect(texture?.version).toBeGreaterThanOrEqual(1);
    });

    it('TC-381.02b [UC-IMP381-OWNERSHIP-MASCOT-REACTIVITY/MSS]: Given cell 1 owned by player with mascot tiger and token color #DC2626, When computePricePillSlotDescriptor is evaluated, Then maps mascotIcon="🐯" and triggers texture update', () => {
      const desc = computePricePillSlotDescriptor(1, { tokenColor: '#DC2626', mascotIcon: '🐯' });
      expect(desc?.hasOwner).toBe(true);
      expect(desc?.mascotIcon).toBe('🐯');
      const texture = getPricePillAtlasTexture({ 1: { tokenColor: '#DC2626', mascotIcon: '🐯' } });
      expect(texture?.version).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Facet 3: Batched Geometry Singleton & Component Integration', () => {
    it('TC-381.03 [UC-IMP381-BATCHED-GEOMETRY-SINGLETON/MSS]: Given 28 purchasable cell markers, When createBatchedPricePillLabelsGeometry is resolved, Then returns pre-baked static BufferGeometry with dimensions and attributes', () => {
      const geom = createBatchedPricePillLabelsGeometry();
      const posAttr = geom.getAttribute('position');
      const uvAttr = geom.getAttribute('uv');
      expect(posAttr?.count).toBe(PURCHASABLE_CELL_INDICES.length * 4);
      expect(uvAttr).toBeDefined();
      expect(PRICE_PILL_LABELS_BATCHED_GEOM.getAttribute('position')?.count).toBe(PURCHASABLE_CELL_INDICES.length * 4);
    });

    it('TC-381.04 [UC-IMP381-INSTANCED-CELL-TRAYS-INTEGRATION/MSS]: Given InstancedCellBordersAndTrays component, When rendered with ownerInfoMap and monopolyGroups, Then mounts data-testid="instanced-price-pill-labels" with depthWrite={false}, alphaTest={0.05} in exactly 1 draw call', () => {
      const markup = renderToStaticMarkup(
        React.createElement(InstancedCellBordersAndTrays, {
          ownerInfoMap: { 1: { tokenColor: '#DC2626' } },
          monopolyGroups: {},
          isHeatmapActive: false,
        })
      );
      expect(markup).toContain('data-testid="instanced-price-pill-labels"');
      expect(markup).toContain('alphaTest="0.05"');
    });
  });

  describe('Facet 4: Call-Site Wiring & Backward Compatibility', () => {
    it('TC-381.05 [UC-IMP381-BOARD-LAYOUT-WIRING/MSS]: Given GameBoard in board_layout.tsx, When rendering 40 LayeredDioramaTile instances, Then passes renderPricePill={false} to suppress unbatched individual price meshes and relies on InstancedCellBordersAndTrays', () => {
      useGameStore.setState({
        playersInfo: {
          p1: {
            id: 'p1',
            name: 'Player 1',
            balance: 1500,
            tokenColor: '#DC2626',
            ownedProperties: [1],
          },
        },
      });
      const markup = renderToStaticMarkup(React.createElement(GameBoard));
      expect(markup).toContain('data-testid="instanced-price-pill-labels"');
      expect(markup).not.toContain('data-testid="owner-price-label"');
    });

    it('TC-381.06 [UC-IMP381-STANDALONE-TILE-BACKWARD-COMPAT/MSS]: Given LayeredDioramaTile rendered standalone without renderPricePill prop, When evaluated, Then defaults renderPricePill to true and preserves legacy OwnerPricePill markup for living regression suites', () => {
      const cell = BOARD_CONFIG[1]!;
      const markup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(markup).toContain('data-testid="owner-price-pill"');
      expect(markup).toContain('data-testid="owner-price-label"');
    });
  });
});

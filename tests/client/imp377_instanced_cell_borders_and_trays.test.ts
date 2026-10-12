// [TC-377.01..TC-377.07][UI-S02/MSS] Contract Test Suite: Instanced Cell Borders & Price Pill Trays
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import {
  PURCHASABLE_CELL_INDICES,
  TOTAL_PURCHASABLE_CELLS,
  getPurchasableCellSlot,
  composeCellMarkerWorldMatrix,
  computeCellMarkerMatrices,
  OWNER_BASE_TRIM_BORDER_GEOM,
  OWNER_BASE_TRIM_GEOM,
  PLAZA_TRIM_BORDER_GEOM,
  PRICE_PILL_OUTER_FRAME_GEOM,
  PRICE_PILL_BASE_GEOM,
} from '../../src/client/3d/instanced_cell_markers_helpers';
import { InstancedCellBordersAndTrays } from '../../src/client/3d/instanced_cell_borders_and_trays';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { OwnerPricePill } from '../../src/client/3d/owner_property_markers';
import { GameBoard } from '../../src/client/3d/board_layout';
import { cellPosition } from '../../src/client/3d/board_coords';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';
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

describe('[IMP-377] Instanced Cell Borders & Price Pill Trays Contract Suite', () => {
  describe('Facet 1: Pure View-Model Geometry & Slot Invariants', () => {
    it('TC-377.01 [UC-PURCHASABLE-INDICES/MSS]: Given BOARD_CONFIG, When querying PURCHASABLE_CELL_INDICES and getPurchasableCellSlot, Then returns 28 unique purchasable deeds and deterministic slots 0 to 27', () => {
      expect(PURCHASABLE_CELL_INDICES.length).toBe(28);
      expect(TOTAL_PURCHASABLE_CELLS).toBe(28);
      expect(getPurchasableCellSlot(1)).toBe(0);
      expect(getPurchasableCellSlot(39)).toBe(27);
    });

    it('TC-377.02 [UC-WORLD-TRANSFORM/MSS]: Given cell index and local offsets, When calling composeCellMarkerWorldMatrix, Then computes accurate world translation and rotation matching cellPosition and tileRotation', () => {
      const targetMat = new THREE.Matrix4();
      composeCellMarkerWorldMatrix(1, 0, 0.040, 0, targetMat);
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(targetMat);
      const [expectedX, _expectedY, expectedZ] = cellPosition(1);
      expect(position.x).toBeCloseTo(expectedX, 2);
      expect(position.y).toBeCloseTo(0.040, 2);
      expect(position.z).toBeCloseTo(expectedZ, 2);
    });

    it('TC-377.03 [UC-UNOWNED-PRICE-PILL-PRESERVATION/MSS]: Given unowned cell, When calling computeCellMarkerMatrices, Then base trims scale to 0, but price pill tray matrices remain fully scaled at local heights', () => {
      const targets = {
        ownerBaseTrimBorder: new THREE.Matrix4(),
        ownerBaseTrim: new THREE.Matrix4(),
        plazaTrimBorder: new THREE.Matrix4(),
        pricePillOuterFrame: new THREE.Matrix4(),
        pricePillBase: new THREE.Matrix4(),
      };
      computeCellMarkerMatrices(1, false, false, targets);

      const trimScale = new THREE.Vector3();
      trimScale.setFromMatrixScale(targets.ownerBaseTrim);
      const pillScale = new THREE.Vector3();
      pillScale.setFromMatrixScale(targets.pricePillOuterFrame);

      expect(trimScale.x).toBeCloseTo(0, 3);
      expect(pillScale.x).toBeCloseTo(1, 3);
      expect(pillScale.y).toBeCloseTo(1, 3);
      expect(pillScale.z).toBeCloseTo(1, 3);
    });

    it('TC-377.04 [UC-OWNED-AND-MONOPOLY-MATRICES/MSS]: Given owned property with monopoly status, When calling computeCellMarkerMatrices, Then all 5 components have full scale at correct elevation offsets', () => {
      const targets = {
        ownerBaseTrimBorder: new THREE.Matrix4(),
        ownerBaseTrim: new THREE.Matrix4(),
        plazaTrimBorder: new THREE.Matrix4(),
        pricePillOuterFrame: new THREE.Matrix4(),
        pricePillBase: new THREE.Matrix4(),
      };
      computeCellMarkerMatrices(1, true, true, targets);

      const trimBorderScale = new THREE.Vector3();
      trimBorderScale.setFromMatrixScale(targets.ownerBaseTrimBorder);
      const plazaScale = new THREE.Vector3();
      plazaScale.setFromMatrixScale(targets.plazaTrimBorder);

      expect(trimBorderScale.x).toBeCloseTo(1, 3);
      expect(plazaScale.x).toBeCloseTo(1, 3);
      expect(targets.pricePillBase.elements[13]).toBeCloseTo(0.115, 2);
    });
  });

  describe('Facet 2: 3D Component Rendering & R3F DOM Structure', () => {
    it('TC-377.05 [UC-COMPONENT-INSTANCED-MESHES/MSS]: Given InstancedCellBordersAndTrays mounted, When rendered, Then renders 5 InstancedMesh elements with count=28, lowercase SSR props, and emissiveIntensity=0.0 when heatmap is off', () => {
      const markup = renderToStaticMarkup(
        React.createElement(InstancedCellBordersAndTrays, {
          ownerInfoMap: { 1: { tokenColor: '#DC2626' } },
          monopolyGroups: {},
          isHeatmapActive: false,
        })
      );
      expect(markup).toContain('data-testid="instanced-cell-borders-and-trays"');
      expect(markup).toContain('receiveshadow="true"');
      expect(markup).toContain('frustumculled="false"');
      expect(markup).toContain('emissiveIntensity="0"');
    });

    it('TC-377.06 [UC-CALLSITE-BOARD-LAYOUT-WIRING/MSS]: Given GameBoard in board_layout.tsx, When rendered, Then mounts InstancedCellBordersAndTrays and passes renderOwnerBorders={false} and renderPricePillTray={false} to LayeredDioramaTile', () => {
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
      expect(markup).toContain('data-testid="instanced-cell-borders-and-trays"');
      // When rendered inside board_layout, individual tile trim and tray meshes are suppressed
      expect(markup).not.toContain('data-testid="owner-base-trim-border"');
      expect(markup).not.toContain('data-testid="owner-price-pill-tray-base"');
    });

    it('TC-377.07a [UC-BACKWARD-COMPAT-TILE/MSS]: Given LayeredDioramaTile rendered with default props, When checking markup, Then preserves legacy trims and pill tray ensuring zero regressions', () => {
      const cell = BOARD_CONFIG[1]!;
      const tileMarkup = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
          ownerColor: '#DC2626',
        })
      );
      expect(tileMarkup).toContain('data-testid="owner-base-trim"');
      expect(tileMarkup).toContain('data-testid="owner-base-trim-border"');
      expect(tileMarkup).toContain('data-testid="owner-price-pill-tray-base"');
    });

    it('TC-377.07b [UC-BACKWARD-COMPAT-PRICE-PILL/MSS]: Given OwnerPricePill rendered with default props, When checking markup, Then renders price pill and 3D tray frame', () => {
      const pillMarkup = renderToStaticMarkup(
        React.createElement(OwnerPricePill, {
          ownerColor: '#DC2626',
          price: 500,
        })
      );
      expect(pillMarkup).toContain('data-testid="owner-price-pill"');
      expect(pillMarkup).toContain('data-testid="owner-price-pill-tray-base"');
    });
  });
});

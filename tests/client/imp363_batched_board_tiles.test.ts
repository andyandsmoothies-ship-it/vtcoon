// [UI-S02/MSS][IMP-363] Living Contract Tests for Batched Board Tiles & WebKit Draw Call IPC Optimization
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createBatchedTileSurfacesGeometry,
  createBatchedTileBasesGeometry,
  resolveCellFromBoardClick,
  BatchedBoardTiles,
} from '../../src/client/3d/batched_board_tiles';
import { LayeredDioramaTile, tierColor } from '../../src/client/3d/board_tile';
import { BOARD_CONFIG } from '../../src/domain/board_config';

describe('IMP-363: Board Tiles Merged Batching & WebKit Draw Call IPC Optimization', () => {
  it('TC-363.01 [UC-BATCHED-GEOM/MSS] createBatchedTileSurfacesGeometry returns merged BufferGeometry with attributes', () => {
    const geom = createBatchedTileSurfacesGeometry(false);
    expect(geom).toBeDefined();
    expect(geom.getAttribute('position')).toBeDefined();
    expect(geom.getAttribute('uv')).toBeDefined();
  });

  it('TC-363.02 [UC-BATCHED-BASES/MSS] createBatchedTileBasesGeometry returns standard and corner bases geometries', () => {
    const bases = createBatchedTileBasesGeometry(false);
    expect(bases.standardBases).toBeDefined();
    expect(bases.cornerBases).toBeDefined();
    expect(bases.standardBases.getAttribute('position')).toBeDefined();
    expect(bases.cornerBases.getAttribute('position')).toBeDefined();
  });

  it('TC-363.03 [UC-CLICK-RAYCAST/MSS] resolveCellFromBoardClick accurately resolves perimeter cells and rejects void center', () => {
    // Cell 0 is at [9, 0, 9] (Corner GO)
    expect(resolveCellFromBoardClick(9.0, 9.0)).toBe(0);
    // Cell 1 is at [7.2, 0, 9]
    expect(resolveCellFromBoardClick(7.2, 9.0)).toBe(1);
    // Center diorama void (< 7.6) returns -1
    expect(resolveCellFromBoardClick(0.0, 0.0)).toBe(-1);
    // Outside board (> 10.5) returns -1
    expect(resolveCellFromBoardClick(15.0, 15.0)).toBe(-1);
  });

  it('TC-363.04 [UC-BATCHED-COMPONENT/MSS] BatchedBoardTiles renders 3 consolidated meshes for surfaces and bases', () => {
    const markup = renderToStaticMarkup(
      React.createElement(BatchedBoardTiles, { isMobile: false })
    );
    expect(markup).toContain('data-testid="batched-board-tiles"');
    expect(markup).toContain('data-testid="batched-tile-surfaces"');
    expect(markup).toContain('data-testid="batched-standard-bases"');
    expect(markup).toContain('data-testid="batched-corner-bases"');
  });

  it('TC-363.05 [UC-LAYERED-TILE-PROP-PARITY/MSS] LayeredDioramaTile with renderBasePlinth=false and renderAtlasSurface=false omits static meshes', () => {
    const cell = BOARD_CONFIG[1]; // Standard tile 1 (Hàm Nghi)
    if (!cell) throw new Error('Missing cell 1');
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [7.2, 0, 9.0],
        currentLevel: 0,
        isCornerTile: false,
        renderBasePlinth: false,
        renderAtlasSurface: false,
      })
    );
    expect(markup).not.toContain('#EDE5D8');
    expect(markup).not.toContain('color="#1E293B"');
  });

  it('TC-363.06 [UC-RETRO-COMPATIBILITY/MSS] LayeredDioramaTile with default props preserves 100% legacy base and surface markup', () => {
    const cell = BOARD_CONFIG[1];
    if (!cell) throw new Error('Missing cell 1');
    const markup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [7.2, 0, 9.0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    expect(markup).toContain('#EDE5D8');
  });

  it('TC-363.07 [UC-TIER-COLOR/MSS] tierColor returns gold #D4AF37 for level 3 and teal #008080 for other levels', () => {
    expect(tierColor(3)).toBe('#D4AF37');
    expect(tierColor(2)).toBe('#008080');
    expect(tierColor(0)).toBe('#008080');
  });
});

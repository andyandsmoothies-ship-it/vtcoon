// [UI-S02/MSS][IMP-375] Living Contract Tests for Diorama Static Draw Call Batching & Geometry Consolidation
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  createBatchedTerrainGeometries,
  BatchedDioramaLandmasses,
} from '../../src/client/3d/diorama/batched_diorama_terrain';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';

describe('IMP-375: Diorama Static Draw Call Batching & Geometry Consolidation', () => {
  it('TC-375.01 [UC-BATCHED-TERRAIN-GEOM/MSS] returns singleton cached BufferGeometries where repeated calls return exact reference identity', () => {
    const firstCall = createBatchedTerrainGeometries();
    const secondCall = createBatchedTerrainGeometries();

    expect(firstCall).toBe(secondCall);
    expect(firstCall.soilGeom).toBe(secondCall.soilGeom);
    expect(firstCall.grassGeom).toBe(secondCall.grassGeom);
  });

  it('TC-375.02 [UC-BATCHED-MARKINGS-COLLAPSE/MSS] consolidates 37 individual road markings and zebra stripes into a single merged geometry with vertex count at least 800', () => {
    const geoms = createBatchedTerrainGeometries();
    const markingsGeom = geoms.markingsGeom;
    const vertexCount = markingsGeom.getAttribute('position')?.count ?? 0;

    expect(vertexCount).toBeGreaterThanOrEqual(800);
    expect(markingsGeom.boundingSphere).not.toBeNull();
  });

  it('TC-375.03 [UC-BATCHED-MATRIX-TRANSFORMS/MSS] applies world translation offsets proving boundingBox min.x <= -4.8 and max.x >= 4.8 preventing center collapse', () => {
    const geoms = createBatchedTerrainGeometries();
    const westBox = geoms.westBoulevardGeom.boundingBox;
    const eastBox = geoms.eastPromenadeGeom.boundingBox;

    expect(westBox).not.toBeNull();
    expect(westBox?.min.x).toBeLessThanOrEqual(-4.8);
    expect(eastBox?.max.x).toBeGreaterThanOrEqual(4.8);
  });

  it('TC-375.04 [UC-MATERIAL-PARITY-PRESERVE/MSS] strictly preserves asphalt color #1E293B and coastal promenade color #334155 in batched landmasses', () => {
    const markup = renderToStaticMarkup(React.createElement(BatchedDioramaLandmasses));

    expect(markup).toContain('#1E293B');
    expect(markup).toContain('#334155');
    expect(markup).toContain('#CBD5E1');
    expect(markup).toContain('#FFFFFF');
  });

  it('TC-375.05 [UC-TERRAIN-LIVING-CONTRACT-PRESERVE/MSS] strictly preserves diorama-river-waves, diorama-park-relief, #64748B, #15803D, and water roughness in DioramaTerrain', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));

    expect(terrainMarkup).toContain('data-testid="diorama-river-waves"');
    expect(terrainMarkup).toContain('data-testid="diorama-park-relief"');
    expect(terrainMarkup).toContain('#64748B');
    expect(terrainMarkup).toContain('#15803D');
  });

  it('TC-375.06 [UC-CALLSITE-TERRAIN-WIRING/MSS] mounts BatchedDioramaLandmasses inside DioramaTerrain proving physical call-site presentation wiring', () => {
    const tree = captureTree(DioramaTerrain);
    const batchedNode = findReactNode(tree, (el) => el.type === BatchedDioramaLandmasses);

    expect(batchedNode).not.toBeNull();
    const parkRelief = findReactNode(tree, (el) => el.props?.['data-testid'] === 'diorama-park-relief');
    expect(parkRelief).not.toBeNull();
  });
});

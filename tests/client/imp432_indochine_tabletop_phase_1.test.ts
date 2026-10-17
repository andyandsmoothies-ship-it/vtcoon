// @vitest-environment happy-dom
// [TC-432/MSS][IMP-432] Contract Test Suite: Indochine Tabletop Phase 1: Asphalt Road Purge & Executive Chassis Refinement
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { analyzeModelFile } from '../../scripts/optimize_assets.mjs';
import { BOARD_CHASSIS_MODEL_URL } from '../../src/client/3d/board_layout';
import { BatchedDioramaLandmasses } from '../../src/client/3d/diorama/batched_diorama_terrain';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import {
  MiniatureCityDiorama,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';
import '../helpers/r3f_test_harness';

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  RoundedBox: ({ children, ...props }: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('group', { ...props, 'data-drei': 'RoundedBox' }, children),
}));

export interface BatchedDioramaLandmassesProps {
  readonly isSereneTabletop?: boolean;
  readonly showRoads?: boolean;
}

export interface DioramaTerrainProps {
  readonly isSereneTabletop?: boolean;
}

interface GlbBoundsResult {
  readonly width: number;
  readonly depth: number;
}

function inspectGlbBounds(filePath: string): GlbBoundsResult {
  const fs = process.getBuiltinModule('node:fs');
  const fd = fs.openSync(filePath, 'r');
  try {
    const headerBuf = Buffer.alloc(20);
    fs.readSync(fd, headerBuf, 0, 20, 0);
    const jsonLen = headerBuf.readUInt32LE(12);
    const jsonBuf = Buffer.alloc(jsonLen);
    fs.readSync(fd, jsonBuf, 0, jsonLen, 20);
    const gltf = JSON.parse(jsonBuf.toString('utf8')) as {
      accessors?: Array<{ min?: number[]; max?: number[] }>;
    };
    const posAccessor = gltf.accessors?.[0];
    const minX = posAccessor?.min?.[0] ?? 0;
    const maxX = posAccessor?.max?.[0] ?? 0;
    const minZ = posAccessor?.min?.[2] ?? 0;
    const maxZ = posAccessor?.max?.[2] ?? 0;
    return {
      width: maxX - minX,
      depth: maxZ - minZ,
    };
  } finally {
    fs.closeSync(fd);
  }
}

describe('IMP-432: Indochine Tabletop Phase 1: Asphalt Road Purge & Executive Chassis Refinement', () => {
  it('TC-432.01 [UC-CHASSIS-PHYSICAL-ASSET-BOUNDS/MSS] verifies walnut chassis asset exists with file size <= 32KB, triangles <= 700, and bounds >= 22m', () => {
    const modelsRoot = path.resolve(process.cwd(), 'public/models');
    const chassisRelativePath = BOARD_CHASSIS_MODEL_URL.replace(/^\//, '');
    const chassisPath = path.resolve(process.cwd(), 'public', chassisRelativePath);

    const analysis = analyzeModelFile(chassisPath, modelsRoot);
    const bounds = inspectGlbBounds(chassisPath);

    expect(analysis.passed).toBe(true);
    expect(analysis.sizeBytes).toBeLessThanOrEqual(32 * 1024);
    expect(analysis.triangles).toBeLessThanOrEqual(700);
    expect(bounds.width >= 22.0 && bounds.depth >= 22.0).toBe(true);
  });

  it('TC-432.02 [UC-SERENE-TERRAIN-ASPHALT-PURGE/MSS] suppresses asphalt and road markings while retaining pristine green grass and soil when isSereneTabletop is true', () => {
    const markup = renderToStaticMarkup(
      React.createElement<BatchedDioramaLandmassesProps>(BatchedDioramaLandmasses, { isSereneTabletop: true })
    );

    expect(markup).not.toContain('#1E293B');
    expect(markup).not.toContain('#FFFFFF');
    expect(markup).toContain('#15803D');
    expect(markup.includes('#78350F') || markup.includes('#D4C5A3')).toBe(true);
  });

  it('TC-432.03a [UC-TERRAIN-BACKWARD-COMPATIBILITY/MSS] retains legacy asphalt, promenade, curb, and markings when rendered with zero props for test parity', () => {
    const markup = renderToStaticMarkup(
      React.createElement<BatchedDioramaLandmassesProps>(BatchedDioramaLandmasses)
    );

    expect(markup).toContain('#1E293B');
    expect(markup).toContain('#334155');
    expect(markup).toContain('#CBD5E1');
    expect(markup).toContain('#FFFFFF');
  });

  it('TC-432.03b [UC-TERRAIN-BACKWARD-COMPATIBILITY/A1] preserves road asphalt and lane markings when showRoads is explicitly set to true', () => {
    const markup = renderToStaticMarkup(
      React.createElement<BatchedDioramaLandmassesProps>(BatchedDioramaLandmasses, { showRoads: true })
    );

    expect(markup).toContain('#1E293B');
    expect(markup).toContain('#FFFFFF');
  });

  it('TC-432.04 [UC-DIORAMA-TERRAIN-PROP-FORWARDING/MSS] forwards isSereneTabletop prop from DioramaTerrain to child BatchedDioramaLandmasses', () => {
    const tree = captureTree<DioramaTerrainProps>(DioramaTerrain, { isSereneTabletop: true });
    const batchedNode = findReactNode<BatchedDioramaLandmassesProps>(
      tree,
      (el) => el.type === BatchedDioramaLandmasses
    );

    expect(batchedNode).not.toBeNull();
    expect(batchedNode?.props?.isSereneTabletop).toBe(true);
  });

  it('TC-432.05a [UC-MINIATURE-CITY-DIORAMA-WIRING/MSS] passes isSereneTabletop true to DioramaTerrain when MiniatureCityDiorama isDesktopLean is true', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isDesktopLean: true });
    const terrainNode = findReactNode<DioramaTerrainProps>(
      tree,
      (el) => el.type === DioramaTerrain
    );

    expect(terrainNode).not.toBeNull();
    expect(terrainNode?.props?.isSereneTabletop).toBe(true);
  });

  it('TC-432.05b [UC-MINIATURE-CITY-DIORAMA-WIRING/A1] passes isSereneTabletop true to DioramaTerrain when MiniatureCityDiorama isMobile is true', () => {
    const tree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isMobile: true });
    const terrainNode = findReactNode<DioramaTerrainProps>(
      tree,
      (el) => el.type === DioramaTerrain
    );

    expect(terrainNode).not.toBeNull();
    expect(terrainNode?.props?.isSereneTabletop).toBe(true);
  });
});

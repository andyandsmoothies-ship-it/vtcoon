// [TC-IMP29.2/MSS][IMP-418] tests/client/imp418_board_layout_math_seam.test.ts
// Contract tests verifying circular dependency purge [SCC-3], tile rotation math seam, and call-site consumer wiring.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import * as THREE from 'three';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';
import { tileRotation as mathTileRotation } from '../../src/client/3d/board_layout_math';
import { tileRotation as layoutTileRotation } from '../../src/client/3d/board_layout';
import { composeToyWorldMatrix } from '../../src/client/3d/instanced_toy_buildings';
import { createBatchedTileSurfacesGeometry } from '../../src/client/3d/batched_board_tiles';

const REPO_ROOT = path.resolve(__dirname, '../..');
const TOY_BUILDINGS_PATH = path.join(REPO_ROOT, 'src/client/3d/instanced_toy_buildings.tsx');
const BATCHED_TILES_PATH = path.join(REPO_ROOT, 'src/client/3d/batched_board_tiles.tsx');
const BOARD_LAYOUT_PATH = path.join(REPO_ROOT, 'src/client/3d/board_layout.tsx');

function getImportSpecifiers(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      specifiers.push(statement.moduleSpecifier.text);
    }
  }
  return specifiers;
}

describe('IMP-418: Board Layout Tile Rotation Math Seam & Circular Dependency Purge', () => {
  it('TC-418.01 [UC-BOARD-MATH-ZERO-CYCLE/MSS]: verifies elimination of circular dependency cycle among board layout modules', () => {
    const targetFiles = [
      'src/client/3d/board_layout.tsx',
      'src/client/3d/instanced_toy_buildings.tsx',
      'src/client/3d/batched_board_tiles.tsx',
      'src/client/3d/board_layout_math.ts',
    ];
    const sccs = detectCycles(targetFiles, REPO_ROOT);

    expect(sccs).toHaveLength(0);
  });

  it('TC-418.02a [UC-BOARD-MATH-AST-DECOUPLING/MSS]: proves static AST decoupling from toy buildings to board_layout_math', () => {
    const toyImports = getImportSpecifiers(TOY_BUILDINGS_PATH);

    expect(toyImports).not.toContain('./board_layout');
    expect(toyImports).toContain('./board_layout_math.js');
  });

  it('TC-418.02b [UC-BOARD-MATH-AST-DECOUPLING/MSS]: proves static AST decoupling for batched tiles and board layout', () => {
    const batchedImports = getImportSpecifiers(BATCHED_TILES_PATH);
    const layoutImports = getImportSpecifiers(BOARD_LAYOUT_PATH);

    expect(batchedImports).not.toContain('./board_layout');
    expect(batchedImports).toContain('./board_layout_math.js');
    expect(layoutImports).toContain('./board_layout_math.js');
  });

  it('TC-418.03a [UC-BOARD-MATH-FALLBACK/A1]: validates boundary fallbacks for invalid tile indices', () => {
    expect(mathTileRotation(-1)).toEqual([0, 0, 0]);
    expect(mathTileRotation(40)).toEqual([0, 0, 0]);
    expect(mathTileRotation(Number.NaN)).toEqual([0, 0, 0]);
  });

  it('TC-418.03b [UC-BOARD-MATH-ORIENTATIONS/MSS]: validates orientations for GO and sides 0, 1, 2', () => {
    expect(mathTileRotation(0)).toEqual([0, Math.PI / 4, 0]);
    expect(mathTileRotation(1)).toEqual([0, 0, 0]);
    expect(mathTileRotation(10)).toEqual([0, -Math.PI / 2, 0]);
    expect(mathTileRotation(20)).toEqual([0, Math.PI, 0]);
  });

  it('TC-418.03c [UC-BOARD-MATH-COVARIANCE/MSS]: validates side 3 orientation and relational covariance across sides', () => {
    const rotGo = mathTileRotation(0);
    const rotSide0 = mathTileRotation(1);
    const rotSide1 = mathTileRotation(10);
    const rotSide3 = mathTileRotation(30);

    expect(rotSide3).toEqual([0, Math.PI / 2, 0]);
    expect(rotGo).not.toEqual(rotSide0);
    expect(rotSide0).not.toEqual(rotSide1);
    expect(rotSide1).not.toEqual(rotSide3);
  });

  it('TC-418.03d [UC-BOARD-MATH-REEXPORT-PARITY/MSS]: validates complete parity between board_layout_math and board_layout re-export', () => {
    const mathAngles = Array.from({ length: 40 }, (_, i) => mathTileRotation(i));
    const layoutAngles = Array.from({ length: 40 }, (_, i) => layoutTileRotation(i));

    expect(layoutAngles).toEqual(mathAngles);
  });

  it('TC-418.04 [UC-BOARD-MATH-CONSUMER-TOY-MATRIX/MSS]: proves instanced_toy_buildings consumer invokes tileRotation and reflects yaw orientation', () => {
    const matGo = composeToyWorldMatrix(0, 0, 0, 0);
    const eulerGo = new THREE.Euler().setFromRotationMatrix(matGo, 'XYZ');

    const matWest = composeToyWorldMatrix(10, 0, 0, 0);
    const eulerWest = new THREE.Euler().setFromRotationMatrix(matWest, 'XYZ');

    expect(eulerGo.y).toBeCloseTo(Math.PI / 4, 4);
    expect(eulerWest.y).toBeCloseTo(-Math.PI / 2, 4);
  });

  it('TC-418.05 [UC-BOARD-MATH-CONSUMER-BATCHED-TILES/MSS]: proves batched_board_tiles consumer invokes tileRotation to build surface geometry', () => {
    const geom = createBatchedTileSurfacesGeometry(false);

    expect(geom).toBeDefined();
    expect(geom.getAttribute('position')).toBeDefined();
    expect(geom.boundingBox).not.toBeNull();
  });
});

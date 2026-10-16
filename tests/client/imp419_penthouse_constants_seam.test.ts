// [TC-P3.1/MSS][IMP-419] tests/client/imp419_penthouse_constants_seam.test.ts
// Contract tests verifying circular dependency purge [SCC-2], penthouse constants seam, and call-site consumer wiring.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';
import {
  PENTHOUSE_DIMENSIONS as SEAM_DIMENSIONS,
  PENTHOUSE_COLORS as SEAM_COLORS,
} from '../../src/client/3d/penthouse_constants';
import {
  PENTHOUSE_DIMENSIONS as SCENE_DIMENSIONS,
  PENTHOUSE_COLORS as SCENE_COLORS,
} from '../../src/client/3d/penthouse_lobby_scene';
import { PenthouseEnclosure } from '../../src/client/3d/penthouse_enclosure';
import { captureTree, findReactNode } from '../helpers/threejs_test_utils';

const REPO_ROOT = path.resolve(__dirname, '../..');
const ENCLOSURE_PATH = path.join(REPO_ROOT, 'src/client/3d/penthouse_enclosure.tsx');
const SCENE_PATH = path.join(REPO_ROOT, 'src/client/3d/penthouse_lobby_scene.tsx');

function getImportAndExportSpecifiers(filePath: string): { imports: string[]; exports: string[] } {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
  const imports: string[] = [];
  const exports: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      imports.push(statement.moduleSpecifier.text);
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier && ts.isStringLiteral(statement.moduleSpecifier)) {
      exports.push(statement.moduleSpecifier.text);
    }
  }
  return { imports, exports };
}

describe('IMP-419: Penthouse Lobby Theme Constants Seam & Zero Cycle', () => {
  it('TC-419.01 [UC-PENTHOUSE-CONSTANTS-ZERO-CYCLE/MSS]: verifies elimination of circular dependency cycle between penthouse modules', () => {
    const targetFiles = [
      'src/client/3d/penthouse_lobby_scene.tsx',
      'src/client/3d/penthouse_enclosure.tsx',
      'src/client/3d/penthouse_constants.ts',
    ];
    const sccs = detectCycles(targetFiles, REPO_ROOT);

    expect(sccs).toHaveLength(0);
  });

  it('TC-419.02a [UC-PENTHOUSE-CONSTANTS-AST-DECOUPLING/MSS]: proves static AST decoupling from penthouse_enclosure to constants seam', () => {
    const { imports } = getImportAndExportSpecifiers(ENCLOSURE_PATH);

    expect(imports).not.toContain('./penthouse_lobby_scene');
    expect(imports).toContain('./penthouse_constants.js');
  });

  it('TC-419.02b [UC-PENTHOUSE-CONSTANTS-AST-DECOUPLING/MSS]: proves penthouse_lobby_scene re-exports constants from seam', () => {
    const { exports } = getImportAndExportSpecifiers(SCENE_PATH);

    expect(exports).toContain('./penthouse_constants.js');
  });

  it('TC-419.03a [UC-PENTHOUSE-CONSTANTS-DIMENSIONS-PARITY/MSS]: validates architectural dimension parity and core table metrics', () => {
    expect(SEAM_DIMENSIONS).toEqual(SCENE_DIMENSIONS);
    expect(SEAM_DIMENSIONS.tableRadius).toBe(1.8);
    expect(SEAM_DIMENSIONS.tableHeight).toBe(0.95);
  });

  it('TC-419.03b [UC-PENTHOUSE-CONSTANTS-DIMENSIONS-BOUNDS/MSS]: validates chair placement and proportional spatial bounds', () => {
    expect(SEAM_DIMENSIONS.chairDistance).toBe(2.45);
    expect(SEAM_DIMENSIONS.ceilingHeight).toBe(4.8);
    expect(SEAM_DIMENSIONS.carpetRadius).toBeGreaterThan(SEAM_DIMENSIONS.chairDistance);
    expect(SEAM_DIMENSIONS.roomRadius).toBeGreaterThan(SEAM_DIMENSIONS.carpetRadius);
  });

  it('TC-419.03c [UC-PENTHOUSE-CONSTANTS-COLOR-PARITY/MSS]: validates PBR color palette parity and base surface colors', () => {
    expect(SEAM_COLORS).toEqual(SCENE_COLORS);
    expect(SEAM_COLORS.marbleFloor).toBe('#0B0F19');
    expect(SEAM_COLORS.carpet).toBe('#1E293B');
  });

  it('TC-419.03d [UC-PENTHOUSE-CONSTANTS-ACCENT-COLORS/MSS]: validates metallic trim, hologram accents, and contrast diversity', () => {
    expect(SEAM_COLORS.goldBezel).toBe('#F59E0B');
    expect(SEAM_COLORS.walnutTrim).toBe('#3E2723');
    expect(SEAM_COLORS.hologramCyan).toBe('#06B6D4');
    expect(SEAM_COLORS.marbleFloor).not.toEqual(SEAM_COLORS.wallMarble);
  });

  it('TC-419.04a [UC-PENTHOUSE-CONSTANTS-CONSUMER-COLORS/MSS]: proves penthouse_enclosure runtime execution renders marble floor and carpet PBR colors', () => {
    const tree = captureTree(PenthouseEnclosure);
    expect(tree).not.toBeNull();

    const marbleNode = findReactNode(tree, (node) => node.props?.color === SEAM_COLORS.marbleFloor);
    const carpetNode = findReactNode(tree, (node) => node.props?.color === SEAM_COLORS.carpet);

    expect(marbleNode).not.toBeNull();
    expect(carpetNode).not.toBeNull();
  });

  it('TC-419.04b [UC-PENTHOUSE-CONSTANTS-CONSUMER-DIMENSIONS/MSS]: proves penthouse_enclosure runtime execution applies carpet radius and ceiling height geometry', () => {
    const tree = captureTree(PenthouseEnclosure);
    expect(tree).not.toBeNull();

    const carpetGeomNode = findReactNode(
      tree,
      (node) => Array.isArray(node.props?.args) && node.props.args[0] === SEAM_DIMENSIONS.carpetRadius
    );
    const ceilingNode = findReactNode(
      tree,
      (node) => Array.isArray(node.props?.position) && node.props.position[1] === SEAM_DIMENSIONS.ceilingHeight + 0.5
    );

    expect(carpetGeomNode).not.toBeNull();
    expect(ceilingNode).not.toBeNull();
  });
});

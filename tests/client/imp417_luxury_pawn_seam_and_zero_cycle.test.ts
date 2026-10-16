// [TC-IMP29.2/MSS][IMP-417] tests/client/imp417_luxury_pawn_seam_and_zero_cycle.test.ts
// Contract tests verifying circular dependency purge [SCC-2] and direct domain import decoupling.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';
import {
  LandmarkTowerPawnFallback,
  BayYachtPawnFallback,
  ClassicCarPawnFallback,
} from '../../src/client/3d/legacy_pawn_fallbacks';
import {
  RookPawnFallback,
  CannonPawnFallback,
  WarhorsePawnFallback,
  QueenPawnFallback,
  disposeTallChessGeometries,
} from '../../src/client/3d/luxury_pawn_fallbacks';
import { LUXURY_PAWN_CONFIGS } from '../../src/domain';

const REPO_ROOT = path.resolve(__dirname, '../..');
const LEGACY_FALLBACKS_PATH = path.join(REPO_ROOT, 'src/client/3d/legacy_pawn_fallbacks.tsx');
const LUXURY_FALLBACKS_PATH = path.join(REPO_ROOT, 'src/client/3d/luxury_pawn_fallbacks.tsx');

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

describe('IMP-417: Luxury Pawn Models Seam & Circular Dependency Purge', () => {
  it('TC-417.01 [UC-PAWN-SEAM-ZERO-CYCLE/MSS]: verifies elimination of circular dependency cycle [SCC-2]', () => {
    const targetFiles = [
      'src/client/3d/legacy_pawn_fallbacks.tsx',
      'src/client/3d/luxury_pawn_fallbacks.tsx',
      'src/client/3d/luxury_pawn_models.tsx',
    ];
    const sccs = detectCycles(targetFiles, REPO_ROOT);

    expect(sccs).toHaveLength(0);
  });

  it('TC-417.02 [UC-PAWN-CONFIGS-IMPORT-DECOUPLING/MSS]: proves static AST decoupling from luxury_pawn_models to domain facade', () => {
    const legacyImports = getImportSpecifiers(LEGACY_FALLBACKS_PATH);
    const luxuryImports = getImportSpecifiers(LUXURY_FALLBACKS_PATH);

    expect(legacyImports).not.toContain('./luxury_pawn_models');
    expect(luxuryImports).not.toContain('./luxury_pawn_models');
    expect(legacyImports).toContain('../../domain');
    expect(luxuryImports).toContain('../../domain');
  });

  it('TC-417.03 [UC-PAWN-FALLBACK-RUNTIME-INTEGRITY/MSS]: validates procedural fallback components instantiate valid elements with domain configs', () => {
    const rookConfig = LUXURY_PAWN_CONFIGS[0];
    const cannonConfig = LUXURY_PAWN_CONFIGS[1];
    const horseConfig = LUXURY_PAWN_CONFIGS[2];
    const queenConfig = LUXURY_PAWN_CONFIGS[3];
    if (!rookConfig || !cannonConfig || !horseConfig || !queenConfig) {
      throw new Error('Expected 4 luxury pawn configs in domain SSOT');
    }

    const rookElem = RookPawnFallback({ config: rookConfig });
    const cannonElem = CannonPawnFallback({ config: cannonConfig });
    const horseElem = WarhorsePawnFallback({ config: horseConfig });
    const queenElem = QueenPawnFallback({ config: queenConfig });

    expect(React.isValidElement(rookElem)).toBe(true);
    expect(React.isValidElement(cannonElem)).toBe(true);
    expect(React.isValidElement(horseElem)).toBe(true);
    expect(React.isValidElement(queenElem)).toBe(true);

    disposeTallChessGeometries();
  });

  it('TC-417.03b [UC-LEGACY-FALLBACK-RUNTIME-INTEGRITY/MSS]: validates legacy slot fallback components instantiate valid elements', () => {
    const hostConfig = LUXURY_PAWN_CONFIGS[0];
    const yachtConfig = LUXURY_PAWN_CONFIGS[1];
    const carConfig = LUXURY_PAWN_CONFIGS[2];
    if (!hostConfig || !yachtConfig || !carConfig) {
      throw new Error('Expected 3 luxury pawn configs in domain SSOT');
    }

    const landmarkElem = LandmarkTowerPawnFallback({ config: hostConfig });
    const yachtElem = BayYachtPawnFallback({ config: yachtConfig });
    const carElem = ClassicCarPawnFallback({ config: carConfig });

    expect(React.isValidElement(landmarkElem)).toBe(true);
    expect(React.isValidElement(yachtElem)).toBe(true);
    expect(React.isValidElement(carElem)).toBe(true);
  });
});

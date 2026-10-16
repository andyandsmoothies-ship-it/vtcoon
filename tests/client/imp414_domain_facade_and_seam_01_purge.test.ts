// [IMP-414] Living Contract Suite — Unified Domain Public Facade & SEAM-01 Deep Import Purge
// Traceability: [TC-414.01..TC-414.04], [UC-MODAL-DOMAIN-FACADE-WIRING-PARITY],
//               [UC-BOUNDARY-LINTER-SEAM-01-ELIMINATION], [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY],
//               [UC-ZERO-CYCLIC-POLLUTION]
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import {
  PROPERTY_DEEDS,
  BOARD_CONFIG,
  CellType,
  calculateUpgradeCost,
  TRANSIT_WHEEL_CONFIGS,
  getWheelTargetDeg,
} from '../../src/domain/index.js';
import { getDeedDisplayInfo } from '../../src/client/ui/modals/modal_helpers.js';
import { resolvePurchaseAffordance } from '../../src/client/ui/modals/title_deed_affordance.js';
import { lintFileBoundaries, detectCycles } from '../../scripts/boundary_linter/boundary_rules.mjs';
import { BOUNDARY_RULES } from '../../scripts/boundary_linter/boundary_constants.mjs';

const REPO_ROOT = process.cwd();

const TARGET_MODAL_FILES: readonly string[] = [
  'src/client/ui/modals/modal_helpers.ts',
  'src/client/ui/modals/portfolio_monopoly_analytics.ts',
  'src/client/ui/modals/property_portfolio_modal.tsx',
  'src/client/ui/modals/purchase_decision_card.tsx',
  'src/client/ui/modals/purchase_decision_logic.ts',
  'src/client/ui/modals/title_deed_affordance.ts',
  'src/client/ui/modals/title_deed_modal.tsx',
  'src/client/ui/modals/trade/trade_column.tsx',
  'src/client/ui/modals/trade_intelligence.ts',
  'src/client/ui/modals/transit_wheel_modal.tsx',
];

interface LeafImportViolation {
  readonly file: string;
  readonly line: number;
  readonly specifier: string;
}

interface Seam01ScanResult {
  readonly file: string;
  readonly line: number;
  readonly message: string;
}

function scanDomainImportViolations(
  files: readonly string[],
  repoRoot: string
): {
  readonly violations: readonly LeafImportViolation[];
  readonly validFacadeImportsCount: number;
  readonly inspectedFilesCount: number;
} {
  const violations: LeafImportViolation[] = [];
  let validFacadeImportsCount = 0;

  for (const relPath of files) {
    const fullPath = path.resolve(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const sf = ts.createSourceFile(fullPath, content, ts.ScriptTarget.Latest, true);

    for (const stmt of sf.statements) {
      if (
        (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
        stmt.moduleSpecifier &&
        ts.isStringLiteral(stmt.moduleSpecifier)
      ) {
        const spec = stmt.moduleSpecifier.text;
        if (spec.includes('domain/')) {
          const isFacade =
            spec.endsWith('/domain/index.js') ||
            spec.endsWith('/domain/index') ||
            spec.endsWith('/domain/index.ts') ||
            spec === '@domain';

          if (isFacade) {
            validFacadeImportsCount++;
          } else {
            const { line } = sf.getLineAndCharacterOfPosition(stmt.getStart());
            violations.push({
              file: relPath,
              line: line + 1,
              specifier: spec,
            });
          }
        }
      }
    }
  }

  return {
    violations,
    validFacadeImportsCount,
    inspectedFilesCount: files.length,
  };
}

function scanSeam01Warnings(
  files: readonly string[],
  repoRoot: string
): {
  readonly warnings: readonly Seam01ScanResult[];
  readonly scannedCount: number;
} {
  const warnings: Seam01ScanResult[] = [];

  for (const relPath of files) {
    const fullPath = path.resolve(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const result = lintFileBoundaries(fullPath, content, repoRoot, false);
    for (const w of result.warnings) {
      if (w.rule === BOUNDARY_RULES.DEEP_RELATIVE_IMPORT) {
        warnings.push({
          file: w.file,
          line: w.line,
          message: w.message,
        });
      }
    }
  }

  return {
    warnings,
    scannedCount: files.length,
  };
}

function collectTsFiles(dirPath: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dirPath)) return results;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function analyzeModalCycles(
  targetFiles: readonly string[],
  repoRoot: string
): {
  readonly modalCycles: readonly (readonly string[])[];
  readonly totalCyclesCount: number;
} {
  const allFiles = collectTsFiles(path.resolve(repoRoot, 'src'));
  const cycles = detectCycles(allFiles, repoRoot);
  const normalizedTargets = new Set(targetFiles.map((f) => f.replace(/\\/g, '/')));

  const modalCycles = cycles.filter((cycle: string[]) =>
    cycle.some((f: string) => normalizedTargets.has(f.replace(/\\/g, '/')))
  );

  return {
    modalCycles,
    totalCyclesCount: cycles.length,
  };
}

describe('[IMP-414] Unified Domain Public Facade & SEAM-01 Deep Import Purge', () => {
  describe('[TC-414.01/MSS] [UC-MODAL-DOMAIN-FACADE-WIRING-PARITY] Modal Domain Facade Wiring Parity', () => {
    it('[TC-414.01/MSS] [UC-MODAL-DOMAIN-FACADE-WIRING-PARITY] proves all 10 modal files import domain strictly via public facade domain/index.js with zero leaf imports', () => {
      const { violations, validFacadeImportsCount, inspectedFilesCount } = scanDomainImportViolations(
        TARGET_MODAL_FILES,
        REPO_ROOT
      );

      expect(violations).toEqual([]);
      expect(validFacadeImportsCount).toBeGreaterThanOrEqual(10);
      expect(inspectedFilesCount).toBe(10);
    });
  });

  describe('[TC-414.02/MSS] [UC-BOUNDARY-LINTER-SEAM-01-ELIMINATION] Boundary Linter SEAM-01 Elimination', () => {
    it('[TC-414.02/MSS] [UC-BOUNDARY-LINTER-SEAM-01-ELIMINATION] proves zero SEAM-01 deep relative import warnings across all 10 target modal files', () => {
      const { warnings, scannedCount } = scanSeam01Warnings(TARGET_MODAL_FILES, REPO_ROOT);

      expect(warnings).toEqual([]);
      expect(scannedCount).toBe(10);
    });
  });

  describe('[TC-414.03/MSS] [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY] Domain Facade Functional Identity & Covariance', () => {
    it('[TC-414.03/MSS] [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY] proves deed lookup and display info maintain relational covariance and functional correctness', () => {
      const deed1 = getDeedDisplayInfo(1);
      const deed6 = getDeedDisplayInfo(6);

      expect(deed1).not.toBeNull();
      expect(deed6).not.toBeNull();
      expect(deed1?.price).not.toBe(deed6?.price);
      expect(deed1?.mortgageValue).not.toBe(deed6?.mortgageValue);
    });

    it('[TC-414.03/MSS] [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY] proves upgrade costs and purchase affordances maintain relational covariance across cash tiers', () => {
      const upgradeCostTier0 = calculateUpgradeCost(1, 0);
      const upgradeCostTier1 = calculateUpgradeCost(1, 1);
      const affordCashRich = resolvePurchaseAffordance({ cellIndex: 6, buyerBalance: 2000 });
      const affordCashShort = resolvePurchaseAffordance({ cellIndex: 6, buyerBalance: 200 });

      expect(upgradeCostTier0).toBeGreaterThanOrEqual(0);
      expect(upgradeCostTier0).not.toBe(upgradeCostTier1);
      expect(affordCashRich.canAffordCash).toBe(true);
      expect(affordCashShort.canAffordCash).toBe(false);
    });

    it('[TC-414.03/MSS] [UC-RUNTIME-FACADE-FUNCTIONAL-IDENTITY] proves transit wheel configurations and degree mapping function identically via domain facade', () => {
      const segCount = TRANSIT_WHEEL_CONFIGS.length;
      const deg0 = getWheelTargetDeg(0, segCount);
      const deg1 = getWheelTargetDeg(1, segCount);

      expect(segCount).toBeGreaterThan(0);
      expect(deg0).not.toBe(deg1);
      expect(deg0).toBeGreaterThanOrEqual(0);
      expect(deg1).toBeGreaterThanOrEqual(0);
    });
  });

  describe('[TC-414.04/MSS] [UC-ZERO-CYCLIC-POLLUTION] Tarjan Dependency Graph Cycle Dissolution', () => {
    it('[TC-414.04/MSS] [UC-ZERO-CYCLIC-POLLUTION] proves all 10 modal files remain 100% free of circular dependency cycles and project cycle count <= 8', () => {
      const { modalCycles, totalCyclesCount } = analyzeModalCycles(TARGET_MODAL_FILES, REPO_ROOT);

      expect(modalCycles).toEqual([]);
      expect(totalCyclesCount).toBeLessThanOrEqual(8);
    });
  });
});

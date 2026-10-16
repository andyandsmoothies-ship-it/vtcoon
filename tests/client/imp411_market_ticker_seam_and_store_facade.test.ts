// [IMP-411] Living Contract Suite — Market Event Ticker Seam & Client Store Public Facade
// Traceability: [TC-411.01..TC-411.04], [UC-MARKET-EVENT-HELPERS-FORMATTING], [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS],
//               [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY], [UC-BACKWARD-COMPATIBILITY-RE-EXPORT-PARITY]
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

import { MarketCardId, ChanceCardId } from '../../src/domain/event_card_types.js';
import {
  ALL_MARKET_TITLES,
  ACTIVE_MARKET_EFFECT_SUMMARIES,
  ACTIVE_MARKET_COMPACT_FORMULAS,
  resolveMarketIcon,
  resolveMarketTitle,
  resolveMarketShortTag,
  resolveMarketEffectSummary,
  resolveMarketCompactFormula,
} from '../../src/client/ui/market_event_helpers.js';

import * as HelpersModule from '../../src/client/ui/market_event_helpers.js';
import * as TickerModule from '../../src/client/ui/market_event_ticker.js';
import { getHeroStatStyles } from '../../src/client/ui/modals/event_card_visuals.js';

import {
  useGameStore,
  useLobbyStore,
  useEnvironmentStore,
  useActivityStore,
  FLOATING_TEXT_DURATION_MS,
  MAX_FLOATING_TEXTS,
  calculatePhaseFromProgress,
  MAX_ACTIVITY_LOGS,
} from '../../src/client/store/index.js';

const REPO_ROOT = process.cwd();

/**
 * Extracts import/export string specifiers from TypeScript source code.
 */
function parseImportSpecifiers(sourceText: string): string[] {
  const sf = ts.createSourceFile('temp.ts', sourceText, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];
  for (const stmt of sf.statements) {
    if (
      (ts.isImportDeclaration(stmt) || ts.isExportDeclaration(stmt)) &&
      stmt.moduleSpecifier &&
      ts.isStringLiteral(stmt.moduleSpecifier)
    ) {
      specifiers.push(stmt.moduleSpecifier.text);
    }
  }
  return specifiers;
}

/**
 * Recursively collects TypeScript files in a directory.
 */
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

/**
 * Scans internal modules across events, network, telemetry, and store for illegal facade imports.
 */
function scanInternalModulesForFacadeImports(): { violations: string[]; fileCount: number } {
  const eventsDir = path.resolve(REPO_ROOT, 'src/client/events');
  const networkDir = path.resolve(REPO_ROOT, 'src/client/network');
  const telemetryDir = path.resolve(REPO_ROOT, 'src/client/telemetry');
  const storeDir = path.resolve(REPO_ROOT, 'src/client/store');

  const filesToScan = [
    ...collectTsFiles(eventsDir),
    ...collectTsFiles(networkDir),
    ...collectTsFiles(telemetryDir),
    ...collectTsFiles(storeDir).filter((f) => path.basename(f) !== 'index.ts'),
  ];

  const violations: string[] = [];

  for (const filePath of filesToScan) {
    const content = fs.readFileSync(filePath, 'utf8');
    const specifiers = parseImportSpecifiers(content);
    const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');

    for (const spec of specifiers) {
      const isStoreRelativeIndex =
        relPath.startsWith('src/client/store/') &&
        (spec === './index.js' || spec === './index' || spec === '../store/index.js' || spec === '../store/index');

      const isExternalFacadeImport =
        spec.includes('client/store/index') ||
        spec.includes('../store/index') ||
        spec.includes('../../store/index') ||
        spec === '@store';

      if (isStoreRelativeIndex || isExternalFacadeImport) {
        violations.push(`${relPath} illegally imports from store facade: '${spec}'`);
      }
    }
  }

  return { violations, fileCount: filesToScan.length };
}

describe('IMP-411: Market Event Ticker Seam & Client Store Public Facade Suite', () => {
  describe('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] Pure Calculations & Formatting', () => {
    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market titles for macro cycles and market cards', () => {
      expect(resolveMarketTitle('MACRO_LAND_FEVER')).toBe('Sốt Đất Vĩ Mô');
      expect(resolveMarketTitle(MarketCardId.MC_PUBLIC_INVEST)).toBe('Đẩy Mạnh Đầu Tư Công');
      expect(resolveMarketTitle(MarketCardId.MC_COASTAL_STORM)).toBe('Bão Lũ Duyên Hải');
      expect(resolveMarketTitle(MarketCardId.MC_RATE_HIKE)).toBe('Tăng Lãi Suất Tín Dụng');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market titles for chance cards and fallback cases', () => {
      expect(resolveMarketTitle(ChanceCardId.CC_PORT_EXCLUSIVE)).toBe('Hợp Tác Độc Quyền Cảng Quốc Tế');
      expect(resolveMarketTitle('')).toBe('Sự Kiện Thị Trường');
      expect(resolveMarketTitle('UNKNOWN_CUSTOM_CARD')).toBe('UNKNOWN_CUSTOM_CARD');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market short tags for policy badges', () => {
      expect(resolveMarketShortTag('MACRO_LAND_FEVER')).toBe('Sốt Đất');
      expect(resolveMarketShortTag(MarketCardId.MC_PUBLIC_INVEST)).toBe('Đầu Tư Công');
      expect(resolveMarketShortTag(MarketCardId.MC_COASTAL_STORM)).toBe('Bão Lũ');
      expect(resolveMarketShortTag(MarketCardId.MC_RATE_HIKE)).toBe('Tăng Lãi Suất');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market short tags for chance cards and unknown fallbacks', () => {
      expect(resolveMarketShortTag(ChanceCardId.CC_PORT_EXCLUSIVE)).toBe('Cảng Biển');
      expect(resolveMarketShortTag('')).toBe('Sự Kiện');
      expect(resolveMarketShortTag('UNKNOWN_TYPE')).toBe('Sự Kiện');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market effect summaries for public investment and storm', () => {
      expect(resolveMarketEffectSummary(MarketCardId.MC_PUBLIC_INVEST)).toBe(
        'Nhân đôi cước vận tải tại 4 Ga Tàu trên toàn bàn cờ.',
      );
      expect(resolveMarketEffectSummary(MarketCardId.MC_COASTAL_STORM)).toBe(
        'Miễn 100% tiền thuê tại các ô ven biển; dừng chân mất lượt.',
      );
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves market effect summaries for rate hike, macro cycle, and chance cards', () => {
      expect(resolveMarketEffectSummary(MarketCardId.MC_RATE_HIKE)).toBe(
        'Tăng 20% chi phí xây nhà C1-C3 và thu lãi vay thế chấp 10% khi qua GO.',
      );
      expect(resolveMarketEffectSummary('MACRO_LAND_FEVER')).toBe(
        'Sốt đất vĩ mô: Thuê x2.5 (+150%) và giảm 25% chi phí xây dựng cho nhóm màu.',
      );
      expect(resolveMarketEffectSummary(ChanceCardId.CC_PORT_EXCLUSIVE)).toBe(
        'Trích nhận 50% phí cảng từ người chơi dừng chân tại các ô Cảng biển.',
      );
      expect(resolveMarketEffectSummary('UNKNOWN_TYPE')).toBe(
        'Chính sách vĩ mô tác động toàn bộ thị trường',
      );
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves compact formula summaries for HUD banners', () => {
      expect(resolveMarketCompactFormula('MACRO_LAND_FEVER')).toBe('Thuê x2.5, Xây nhà -25%');
      expect(resolveMarketCompactFormula(MarketCardId.MC_PUBLIC_INVEST)).toBe('4 Ga Tàu: Nhân đôi cước');
      expect(resolveMarketCompactFormula(MarketCardId.MC_COASTAL_STORM)).toBe('Ven biển: Miễn thuê, mất lượt');
      expect(resolveMarketCompactFormula(MarketCardId.MC_RATE_HIKE)).toBe('Xây nhà +20%, Lãi vay 10%');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves compact formula summaries for chance cards and unknown fallbacks', () => {
      expect(resolveMarketCompactFormula(ChanceCardId.CC_PORT_EXCLUSIVE)).toBe('Cảng biển: Hưởng 50% cước');
      expect(resolveMarketCompactFormula('')).toBe('Chính sách vĩ mô tác động toàn bộ thị trường');
      expect(resolveMarketCompactFormula('UNKNOWN_TYPE')).toBe('Chính sách vĩ mô tác động toàn bộ thị trường');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] resolves themed icons with safe emoji fallbacks', () => {
      expect(resolveMarketIcon(MarketCardId.MC_PUBLIC_INVEST)).toBe('🏗️');
      expect(resolveMarketIcon(MarketCardId.MC_COASTAL_STORM)).toBe('🌀');
      expect(resolveMarketIcon('MACRO_LAND_FEVER')).toBe('🌋');
      expect(resolveMarketIcon('UNKNOWN_TYPE')).toBe('🎴');
    });

    it('[TC-411.01/MSS] [UC-MARKET-EVENT-HELPERS-FORMATTING] verifies all market dictionary constants are populated as non-empty records', () => {
      expect(Object.keys(ALL_MARKET_TITLES).length).toBeGreaterThanOrEqual(18);
      expect(Object.keys(ACTIVE_MARKET_EFFECT_SUMMARIES).length).toBeGreaterThanOrEqual(18);
      expect(Object.keys(ACTIVE_MARKET_COMPACT_FORMULAS).length).toBeGreaterThanOrEqual(18);
    });
  });

  describe('[TC-411.02/MSS] [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS] Dissolution of Circular Dependency [SCC-6]', () => {
    it('[TC-411.02/MSS] [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS] helper parseImportSpecifiers correctly handles empty and non-import source files', () => {
      expect(parseImportSpecifiers('')).toEqual([]);
      expect(parseImportSpecifiers('const a = 1; // no imports')).toEqual([]);
    });

    it('[TC-411.02/MSS] [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS] ensures event_card_visuals.ts does not import from market_event_ticker', () => {
      const visualsPath = path.resolve(REPO_ROOT, 'src/client/ui/modals/event_card_visuals.ts');
      const content = fs.readFileSync(visualsPath, 'utf8');
      const specifiers = parseImportSpecifiers(content);
      const hasTickerImport = specifiers.some((s) => s.includes('market_event_ticker'));
      const styles = getHeroStatStyles('info');
      expect(styles.badge).toBe('bg-sky-100 text-sky-950 border border-sky-400');
      expect(hasTickerImport).toBe(false);
    });

    it('[TC-411.02/MSS] [UC-ZERO-CYCLIC-DEPENDENCY-TICKER-VISUALS] ensures event_card_visuals.ts imports from market_event_helpers', () => {
      const visualsPath = path.resolve(REPO_ROOT, 'src/client/ui/modals/event_card_visuals.ts');
      const content = fs.readFileSync(visualsPath, 'utf8');
      const specifiers = parseImportSpecifiers(content);
      const hasHelpersImport = specifiers.some((s) => s.includes('market_event_helpers'));
      expect(hasHelpersImport).toBe(true);
    });
  });

  describe('[TC-411.03/MSS] [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY] Client Store Facade Confinement & Integrity', () => {
    it('[TC-411.03/MSS] [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY] exports authoritative Zustand hooks and timing constants from store facade', () => {
      expect(typeof useGameStore).toBe('function');
      expect(typeof useLobbyStore).toBe('function');
      expect(FLOATING_TEXT_DURATION_MS).toBe(2200);
      expect(MAX_FLOATING_TEXTS).toBe(6);
    });

    it('[TC-411.03/MSS] [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY] exports authoritative environment and activity store utilities from store facade', () => {
      expect(typeof useEnvironmentStore).toBe('function');
      expect(calculatePhaseFromProgress(0.1)).toBe('day');
      expect(typeof useActivityStore).toBe('function');
      expect(MAX_ACTIVITY_LOGS).toBe(50);
    });

    it('[TC-411.03/MSS] [UC-STORE-FACADE-CONFINEMENT-AND-HOOK-INTEGRITY] mechanically verifies internal events, network, telemetry, and internal stores never import from store facade', () => {
      const scanResult = scanInternalModulesForFacadeImports();
      expect(scanResult.violations).toEqual([]);
      expect(scanResult.fileCount).toBeGreaterThanOrEqual(50);
    });
  });

interface TickerContractExports {
  readonly ALL_MARKET_TITLES?: Readonly<Record<string, string>>;
  readonly ACTIVE_MARKET_EFFECT_SUMMARIES?: Readonly<Record<string, string>>;
  readonly ACTIVE_MARKET_COMPACT_FORMULAS?: Readonly<Record<string, string>>;
  readonly resolveMarketIcon?: (type: string) => string;
  readonly resolveMarketTitle?: (type: string) => string;
  readonly resolveMarketShortTag?: (type: string) => string;
  readonly resolveMarketEffectSummary?: (type: string) => string;
  readonly resolveMarketCompactFormula?: (type: string) => string;
}

const tickerExports: TickerContractExports = TickerModule;

  describe('[TC-411.04/MSS] [UC-BACKWARD-COMPATIBILITY-RE-EXPORT-PARITY] Re-export Backward Compatibility Parity', () => {
    it('[TC-411.04/MSS] [UC-BACKWARD-COMPATIBILITY-RE-EXPORT-PARITY] maintains exact referential identity for formatting functions', () => {
      expect(tickerExports.resolveMarketTitle).toBe(HelpersModule.resolveMarketTitle);
      expect(tickerExports.resolveMarketShortTag).toBe(HelpersModule.resolveMarketShortTag);
      expect(tickerExports.resolveMarketEffectSummary).toBe(HelpersModule.resolveMarketEffectSummary);
      expect(tickerExports.resolveMarketCompactFormula).toBe(HelpersModule.resolveMarketCompactFormula);
    });

    it('[TC-411.04/MSS] [UC-BACKWARD-COMPATIBILITY-RE-EXPORT-PARITY] maintains exact referential identity for icon resolver and data dictionaries', () => {
      expect(tickerExports.resolveMarketIcon).toBe(HelpersModule.resolveMarketIcon);
      expect(tickerExports.ALL_MARKET_TITLES).toBe(HelpersModule.ALL_MARKET_TITLES);
      expect(tickerExports.ACTIVE_MARKET_EFFECT_SUMMARIES).toBe(HelpersModule.ACTIVE_MARKET_EFFECT_SUMMARIES);
      expect(tickerExports.ACTIVE_MARKET_COMPACT_FORMULAS).toBe(HelpersModule.ACTIVE_MARKET_COMPACT_FORMULAS);
    });
  });
});

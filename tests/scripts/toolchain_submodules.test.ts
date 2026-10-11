import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { loadTargetedProbes, parseCliArgs } from '../../scripts/sentinel/probe_config_loader.mjs';
import { runRealMutationProbe, testSourceMutantSafely } from '../../scripts/sentinel/source_mutant_injector.mjs';
import {
  findSourceFiles,
  extractTestLines,
  parseTargetFiles
} from '../../scripts/plan_audit/plan_markdown_parser.mjs';
import { auditDropInSnippets } from '../../scripts/plan_audit/plan_snippet_verifier.mjs';
import {
  collectLocWarnings,
  collectVisualScreenshots
} from '../../scripts/report/report_station_collector.mjs';
import { renderSpecReview } from '../../scripts/report/report_markdown_renderer.mjs';
import { parseCaptureArgs } from '../../scripts/visual_capture/viewport_capture_runner.mjs';
import { categorizeFile, SLOP_RULES } from '../../scripts/slop_linter/slop_constants.mjs';
import { lintSlopContent } from '../../scripts/lint_slop.mjs';

describe('Toolchain Submodules Contract Test Suite (IMP-353)', () => {
  describe('Sentinel Submodule (scripts/sentinel/)', () => {
    it('[TC-353.01/MSS] loadTargetedProbes loads targeted mutant rules for existing ticket', () => {
      const probes = loadTargetedProbes('IMP-347');
      expect(Array.isArray(probes)).toBe(true);
      expect(probes?.length).toBeGreaterThan(0);
      expect(probes?.[0]).toHaveProperty('target');
      expect(probes?.[0]).toHaveProperty('replacement');
    });

    it('[TC-353.02/A1] loadTargetedProbes returns undefined for non-existent ticket without crashing', () => {
      const probes = loadTargetedProbes('IMP-9999-DOES-NOT-EXIST');
      expect(probes).toBeUndefined();
    });

    it('[TC-353.03/A2] runRealMutationProbe returns BLOCKED status when arguments are missing', () => {
      const result = runRealMutationProbe('', '', 'IMP-TEST');
      expect(result.status).toBe('BLOCKED: MISSING_ARGS');
      expect(result.mutantsTested).toBe(0);
    });

    it('[TC-353.04/A3] testSourceMutantSafely safely aborts when target file does not exist', () => {
      const res = testSourceMutantSafely('non_existent_file.ts', '===', '!==', 'vitest run');
      expect(res.tested).toBe(false);
      expect(res.killed).toBe(false);
    });
  });

  describe('Plan Audit Submodule (scripts/plan_audit/)', () => {
    it('[TC-353.05/MSS] extractTestLines extracts TC test specifications from markdown string', () => {
      const sampleMarkdown = `
### Station 1: Contract Testing (RED)
- TC-999.01 [UC-TEST/MSS]: Given condition A, When event B occurs, Then assert outcome C.
- TC-999.02 [UC-TEST/A1]: Given condition D, When event E occurs, Then assert outcome F.
      `;
      const testLines = extractTestLines(sampleMarkdown);
      expect(testLines.length).toBe(2);
      expect(testLines[0]).toContain('TC-999.01');
      expect(testLines[1]).toContain('TC-999.02');
    });

    it('[TC-353.06/A1] parseTargetFiles identifies newly declared and existing files', () => {
      const samplePlan = `
| Target physical file | Tier |
| \`src/domain/new_module.ts\` (Tệp mới) | Tier 1 |
| \`src/server/existing_file.ts\` | Tier 1 |
      `;
      const fileRegex = /\|\s*`([^`]+)`\s*(?:\(([^)]+)\))?\s*\|/g;
      const targetMap = parseTargetFiles(samplePlan, fileRegex);
      expect(targetMap.has('src/domain/new_module.ts')).toBe(true);
      expect(targetMap.get('src/domain/new_module.ts')).toBe(true);
      expect(targetMap.has('src/server/existing_file.ts')).toBe(true);
      expect(targetMap.get('src/server/existing_file.ts')).toBe(false);
    });

    it('[TC-353.07/A2] findSourceFiles returns empty array for non-existent directory', () => {
      const files = findSourceFiles('non_existent_dir_9999');
      expect(files).toEqual([]);
    });

    it('[TC-353.07B/MSS] auditDropInSnippets fails if existing production file has 0 snippets', () => {
      const targetMap = new Map<string, boolean>([
        ['src/server/room_manager.ts', false]
      ]);
      const res = auditDropInSnippets(
        '# Some plan without snippets',
        /Target file/g,
        /`{3,}<<<<[\s\S]*?====[\s\S]*?>>>>`{3,}/g,
        new Map(),
        () => [],
        () => 0,
        targetMap
      );
      expect(res.errors).toBe(1);
      expect(res.checkedSnippets).toBe(0);
    });
  });

  describe('Report Generator Submodule (scripts/report/)', () => {
    it('[TC-353.08/MSS] renderSpecReview produces valid markdown with ticket metadata', () => {
      const reviewMd = renderSpecReview({
        ticketId: 'IMP-353',
        planTitle: 'Toolchain Submodules Unit Tests',
        planSubsystem: 'harness-toolchain',
        today: '2026-10-10',
        srcFiles: ['scripts/sentinel/probe_config_loader.mjs'],
        contractFile: 'tests/scripts/toolchain_submodules.test.ts',
        snapshotData: null,
        contractTestCount: 9,
        contractAssertCount: 18,
        repoRoot: process.cwd()
      });
      expect(reviewMd).toContain('# 📋 SPECIFICATION INTEGRITY REPORT: IMP-353');
      expect(reviewMd).toContain('Toolchain Submodules Unit Tests');
      expect(reviewMd).toContain('**Status**: **APPROVED** 🏆');
    });

    it('[TC-353.09/A1] collectVisualScreenshots returns null for missing screenshot paths', () => {
      const { desktopImg, mobileImg } = collectVisualScreenshots(process.cwd(), 'imp_nonexistent', 'imp_nonexistent');
      expect(desktopImg).toBeNull();
      expect(mobileImg).toBeNull();
    });
  });

  describe('Visual Capture Submodule (scripts/visual_capture/)', () => {
    it('[TC-353.10/MSS] parseCaptureArgs returns standard defaults when no flags provided', () => {
      const opts = parseCaptureArgs();
      expect(opts.ticket).toBe('MANUAL');
      expect(opts.name).toBe('full_board');
      expect(opts.dualViewport).toBe(false);
      expect(opts.waitMs).toBe(5000);
    });
  });

  describe('Slop Linter Submodule (scripts/slop_linter/)', () => {
    it('[TC-353.11/MSS] categorizeFile categorizes paths into proper SDLC tiers', () => {
      expect(categorizeFile('src/domain/bot/bot_negotiation_brain.ts')).toBe('TIER1_LOGIC');
      expect(categorizeFile('src/client/ui/action_dock.tsx')).toBe('TIER2_UI');
      expect(categorizeFile('src/client/3d/tile_icons.ts')).toBe('TIER3_STATIC');
    });

    it('[TC-353.12/A1] lintSlopContent detects dirty casts via TypeScript AST', () => {
      const dirtyCode = 'const val = (x ' + 'as ' + 'any).toString();';
      const { errors } = lintSlopContent(dirtyCode, 'src/domain/test_dirty.ts');
      expect(errors.some((e) => e.rule === SLOP_RULES.ZERO_DIRTY_CASTS)).toBe(true);
    });
  });
});

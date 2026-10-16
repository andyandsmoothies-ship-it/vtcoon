import { describe, it, expect, vi } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import { parseTargetFiles } from '../../scripts/plan_audit/plan_markdown_parser.mjs';
import { formatReport, measureFile } from '../../scripts/check_loc.mjs';
import { lintSlopContent } from '../../scripts/lint_slop.mjs';
import { auditVisualAndTelemetry } from '../../scripts/evidence_audit/audit_visual_and_telemetry.mjs';
import { auditReportsAndSSOT } from '../../scripts/evidence_audit/audit_reports_and_ssot.mjs';
import { extractContractTestCounts } from '../../scripts/report/report_git_inspector.mjs';

describe('[UC-424] SDLC Toolchain & Guardrails Hardening V6.1', () => {
  it('TC-424.01 [UC-PARSER-TABLE/MSS]: parseTargetFiles parses target files from Markdown table rows and flags isNew', () => {
    const fileTargetRegex = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;
    const planMarkdown = `
# Sample Plan
## 2. Target Files & Honest LOC Accounting
| File Path | Tier | Current LOC | Expected LOC | Net Delta | Max Allowed | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`scripts/audit_plan.mjs\` | Harness | 166 | 175 | +9 | 200 | Safe |
| \`tests/scripts/imp424_new.test.ts\` | Living Test | 0 | 100 | +100 | 600 | Safe (New Seam) |
`;

    const targetFiles = parseTargetFiles(planMarkdown, fileTargetRegex);
    expect(targetFiles.has('scripts/audit_plan.mjs')).toBe(true);
    expect(targetFiles.get('scripts/audit_plan.mjs')).toBe(false);
    expect(targetFiles.has('tests/scripts/imp424_new.test.ts')).toBe(true);
    expect(targetFiles.get('tests/scripts/imp424_new.test.ts')).toBe(true);
  });

  it('TC-424.02 [UC-ZERO-TARGET-GATE/MSS]: parseTargetFiles returns empty map when plan has no target files', () => {
    const fileTargetRegex = /(?:\*\*Target physical file\*\*|\*\*Target File\*\*|Target physical file|Target file):\s*[`']?([^\n`']+\.[a-zA-Z0-9]+)[`']?([^\n]*)/gi;
    const emptyPlan = `# Empty Plan\nNo target files declared anywhere.`;

    const targetFiles = parseTargetFiles(emptyPlan, fileTargetRegex);
    expect(targetFiles.size).toBe(0);
  });

  it('TC-424.03 [UC-VISUAL-WAIVER/MSS]: auditVisualAndTelemetry auto-grants isReExportSeamWaiver for pure type/export UI diffs', () => {
    const evidence = {
      ticketId: 'IMP-424',
      targetFiles: ['src/client/ui/modals/trade_constants.ts'],
      pureLogicWaiver: false,
      isReExportSeamWaiver: true,
      reExportSeamWaiverReason: 'Pure constants seam with 0 JSX elements or CSS classes',
    };
    const errors = auditVisualAndTelemetry(evidence, process.cwd(), 'imp-424', '.agents/evidence/chaos_sentinel_imp-424.json');
    expect(errors.some((e) => e.includes('Zero-Blindness Violation'))).toBe(false);
  });

  it('TC-424.04 [UC-TEST-COUNT-EXTRACTION/MSS]: extractContractTestCounts extracts exact test counts without comment inflation', () => {
    const repoRoot = process.cwd();
    const fixtureTestPath = 'tests/scripts/fixtures_sample_commented.test.ts';
    const absPath = path.resolve(repoRoot, fixtureTestPath);
    const sampleContent = `
// it('commented test', () => { expect(1).toBe(1); });
/* it('block commented test', () => { expect(2).toBe(2); }); */
it('active real test', () => { expect(3).toBe(3); });
`;
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, sampleContent, 'utf8');

    try {
      const counts = extractContractTestCounts(repoRoot, fixtureTestPath, 'IMP-TEST', {
        testCount: 1,
        assertCount: 1,
      });
      expect(counts.testCount).toBe(1);
    } finally {
      if (fs.existsSync(absPath)) fs.unlinkSync(absPath);
    }
  });

  it('TC-424.05 [UC-FEATURE-MAP-BUFFER/MSS]: auditReportsAndSSOT physically enforces early warning buffer (>=28.5KB) and hard ceiling (>30KB)', () => {
    const tempDir = fs.mkdtempSync(path.join(process.cwd(), '.tmp-ssot-'));
    const docsDir = path.join(tempDir, 'docs');
    const featureMapFile = path.join(docsDir, 'FEATURE_MAP.md');
    fs.mkdirSync(docsDir, { recursive: true });

    const evidence = {
      ticketId: 'IMP-SSOT-TEST',
      targetFiles: ['src/domain/game.ts'],
      pureLogicWaiver: true,
    };

    try {
      // Case 1: Hard Error when >= 30.0 KB (30.5 KB)
      fs.writeFileSync(featureMapFile, 'A'.repeat(Math.floor(30.5 * 1024)), 'utf8');
      const errorsOverflow = auditReportsAndSSOT(evidence, tempDir, 'IMP-SSOT-TEST', '.agents/evidence/test.json');
      const hasHardError = errorsOverflow.some((e: string) => e.includes('exceeding the 30KB SSOT ceiling'));
      expect(hasHardError).toBe(true);

      // Case 2: Early Warning Buffer when 28.5 KB <= size < 30.0 KB (29.0 KB)
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      fs.writeFileSync(featureMapFile, 'B'.repeat(Math.floor(29.0 * 1024)), 'utf8');
      const errorsBuffer = auditReportsAndSSOT(evidence, tempDir, 'IMP-SSOT-TEST', '.agents/evidence/test.json');
      const hasCeilingError = errorsBuffer.some((e: string) => e.includes('exceeding the 30KB SSOT ceiling'));
      expect(hasCeilingError).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('[FEATURE_MAP EARLY WARNING BUFFER]'));
      warnSpy.mockRestore();

      // Case 3: Clean Pass when < 28.5 KB (27.0 KB)
      fs.writeFileSync(featureMapFile, 'C'.repeat(Math.floor(27.0 * 1024)), 'utf8');
      const errorsClean = auditReportsAndSSOT(evidence, tempDir, 'IMP-SSOT-TEST', '.agents/evidence/test.json');
      expect(errorsClean.some((e: string) => e.includes('exceeding the 30KB SSOT ceiling'))).toBe(false);
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('TC-424.06 [UC-AST-NO-FS-IN-CLIENT-TESTS/MSS]: lintSlopContent rejects fs.readFileSync/fs.existsSync inside tests/client/**', () => {
    const testContent = `
import fs from 'node:fs';
describe('test', () => {
  it('reads file directly', () => {
    const code = fs.readFileSync('src/client/something.ts', 'utf8');
    expect(code).toContain('export');
  });
});
`;
    const result = lintSlopContent(testContent, 'tests/client/imp_sample_wiring.test.ts');
    const hasFsViolation = result.errors.some((e: { rule: string }) => e.rule === 'no-fs-in-client-tests');
    expect(hasFsViolation).toBe(true);
  });

  it('TC-424.07 [UC-LOC-HARD-LOCK/MSS]: check_loc formatReport enforces hard lock at 349 LOC for activity_log_subscriber.ts', () => {
    const mockMeasurement = {
      filePath: 'src/client/events/subscribers/activity_log_subscriber.ts',
      exists: true,
      tierKey: 'TIER1_LOGIC',
      totalLines: 350,
      nonEmptySloc: 315,
    };
    const { hasError, markdown } = formatReport([mockMeasurement]);
    expect(hasError).toBe(true);
    expect(markdown).toContain('HARD ERROR');
  });

  it('TC-424.08 [UC-SLOP-BLACKLIST/MSS]: auditReportsAndSSOT catches real-world slop phrases without overfitted regex qualifiers', () => {
    const evidence = { ticketId: 'IMP-999', tier: '1.5', pureLogicWaiver: true };
    const tempReportDir = path.join(process.cwd(), 'docs', 'reports', 'improvements');
    const tempReportFile = path.join(tempReportDir, 'IMP-999-test-report_report.md');
    fs.mkdirSync(tempReportDir, { recursive: true });

    // Historical slop sentences from IMP-422 without brittle qualifiers:
    // 1) "Bộ nhớ & Timer: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ." (no "trên client")
    // 2) "cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập." (no "trên vé State")
    const slopContent = `
# BÁO CÁO NGHIỆM THU TICKET IMP-999
Bộ nhớ & Timer: Không rò rỉ listener, không bỏ sót timer cleanup, an toàn đa luồng/bất đồng bộ.
cung cấp đầy đủ bằng chứng vật lý từ mã nguồn, kiểm thử, hình ảnh trực quan đến biên bản kiểm toán độc lập.
`.repeat(5);

    fs.writeFileSync(tempReportFile, slopContent, 'utf8');

    try {
      const errors = auditReportsAndSSOT(evidence, process.cwd(), 'IMP-999', '.agents/evidence/test.json');
      const hasSlopError = errors.some((e: string) => e.includes('Banned Slop Word Violation'));
      const hasVisualError = errors.some((e: string) => e.includes('False Visual Claim Violation'));
      expect(hasSlopError).toBe(true);
      expect(hasVisualError).toBe(true);
    } finally {
      if (fs.existsSync(tempReportFile)) fs.unlinkSync(tempReportFile);
    }
  });
});

/**
 * tests/scripts/toolchain_declarations.d.ts
 * 
 * TypeScript module declarations for ESM toolchain scripts imported in Vitest contract tests.
 */

declare module '*scripts/sentinel/probe_config_loader.mjs' {
  export function parseCliArgs(): {
    ticketId: string;
    testPath?: string;
    srcPath?: string;
    is3D: boolean;
    rawArgs: string[];
  };
  export function loadTargetedProbes(tid: string): Array<{
    target: string;
    replacement: string;
    file?: string;
  }> | undefined;
}

declare module '*scripts/sentinel/source_mutant_injector.mjs' {
  export function cleanupStaleBackups(targetDir: string): void;
  export function testSourceMutantSafely(
    filePath: string,
    targetPattern: string | RegExp,
    replacement: string,
    testCmd: string
  ): { tested: boolean; killed: boolean };
  export function runRealMutationProbe(
    testPath: string,
    srcPath: string,
    ticketId: string
  ): {
    status: string;
    mutantsTested: number;
    killed: number;
    survived: number;
    sourceLevelMutantsTested: number;
  };
}

declare module '*scripts/plan_audit/plan_markdown_parser.mjs' {
  export function findSourceFiles(dir: string): string[];
  export function checkTicketCollision(planBasename: string, plansDir: string): void;
  export function parseTargetFiles(planContent: string, fileTargetRegex: RegExp): Map<string, boolean>;
  export function parseFileSnippets(
    planContent: string,
    fileTargetRegex: RegExp,
    snippetRegex: RegExp
  ): { fileSnippetsMap: Map<string, string[]>; snippetDeltaByFile: Map<string, number> };
  export function extractTestLines(planContent: string): string[];
}

declare module '*scripts/report/report_station_collector.mjs' {
  export function collectLocWarnings(
    repoRoot: string,
    srcFiles: string[]
  ): Array<{ file: string; name: string; loc: number; warn: number; ceiling: number; tierName: string }>;
  export function collectVisualScreenshots(
    repoRoot: string,
    ticketLower: string,
    ticketClean: string
  ): { desktopImg: string | null; mobileImg: string | null };
  export function parseStation0(auditDir: string, ticketId: string, contractTestCount: number): Record<string, unknown>;
  export function parseStation1(evidenceDir: string, auditDir: string, ticketId: string, contractTestCount: number): Record<string, unknown>;
  export function parseStation3Reviews(auditDir: string, ticketId: string): Record<string, unknown>;
  export function parseStation4Chaos(evidenceDir: string, ticketId: string): Record<string, unknown>;
}

declare module '*scripts/report/report_markdown_renderer.mjs' {
  export function renderSpecReview(data: Record<string, unknown>): string;
  export function renderComprehensiveReportMarkdown(data: Record<string, unknown>): string;
}

declare module '*scripts/visual_capture/viewport_capture_runner.mjs' {
  export function parseCaptureArgs(): {
    ticket: string;
    url: string;
    name: string;
    crop: unknown;
    waitMs: number;
    port: number;
    debugPort: number;
    dualViewport: boolean;
    scenario: unknown;
    scenarioExpr: unknown;
    assertCameraY: unknown;
    help: boolean;
  };
  export function executeDualViewportCapture(params: Record<string, unknown>): Promise<void>;
  export function executeSingleViewportCapture(params: Record<string, unknown>): Promise<void>;
}

declare module '*scripts/slop_linter/slop_constants.mjs' {
  export const SLOP_RULES: Record<string, string>;
  export const TIER_BUDGETS: Record<string, { maxWarn: number; maxError: number }>;
  export function categorizeFile(filePath: string): string;
  export function getSourceFiles(dir: string, fileList?: string[]): string[];
}

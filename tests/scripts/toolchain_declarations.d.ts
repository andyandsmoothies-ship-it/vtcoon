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

declare module '*scripts/plan_audit/plan_snippet_verifier.mjs' {
  export function auditDropInSnippets(
    planContent: string,
    fileTargetRegex: RegExp,
    snippetRegex: RegExp,
    fileSnippetsMap: Map<string, string[]>,
    findSourceFiles: (dir: string) => string[],
    auditPlanSnippetHygiene: (relPath: string, targetChunk: string, replacementChunk: string, priorSnippets: string[]) => number,
    targetFiles?: Map<string, boolean>
  ): { errors: number; checkedSnippets: number };
  export function auditNewFileDeclarations(
    targetFiles: Map<string, boolean>,
    planContent: string,
    fileTargetRegex: RegExp,
    snippetRegex: RegExp,
    findSourceFiles: (dir: string) => string[]
  ): number;
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

declare module '*scripts/log_analyzer/board_cell_names.mjs' {
  export const BOARD_CELL_NAMES: readonly string[];
  export function getCellLabel(index: number | undefined): string;
}

declare module '*scripts/log_analyzer/flight_recorder_analyzer.mjs' {
  export function analyzeFlightRecorder(dump: unknown, options?: { verbose?: boolean; timeline?: boolean }): {
    overview: Record<string, unknown>;
    violations: readonly unknown[];
    players: readonly Array<{ id: string; startBalance: number; endBalance: number; netChange: number; status: string; finalPos: number }>;
    timelineEvents: readonly Array<{ tick: number; type: string; message: string }>;
    bankruptcyInvestigations: readonly Array<{ tick: number; debtor: string; deficit: number; creditor: string; note: string }>;
    propertyEvents: readonly Array<{ tick: number; cellIndex: number; label: string; ownerId: string; level: number }>;
    userIntentsByType: Record<string, number>;
  };
  export function formatConsoleReport(analysis: Record<string, unknown>, options?: { verbose?: boolean; timeline?: boolean }): string;
}

declare module '*scripts/plan_audit/worktree_scope_resolver.mjs' {
  export function extractTicketTag(filename: string): string;
  export function extractPriorTicketsFiles(
    currentPlanPath?: string,
    currentRegisteredFiles?: Set<string>
  ): Map<string, string>;
  export function detectActiveSliceId(repoRoot: string): string | null;
}

declare module '*scripts/evidence_audit/evidence_resolver.mjs' {
  export function resolveEvidenceFile(rawArg: string): string;
}

declare module '*scripts/doctor/system_env.mjs' {
  export function checkSystemEnvironment(): Array<{
    category: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
    details?: string;
  }>;
}

declare module '*scripts/doctor/network_ports.mjs' {
  export function probePort(port: number, host?: string): Promise<{ port: number; available: boolean; error?: string }>;
  export function verifyDynamicPort0(): Promise<{ success: boolean; allocatedPort?: number; error?: string }>;
  export function checkNetworkPorts(): Promise<Array<{
    category: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
    details?: string;
  }>>;
}

declare module '*scripts/doctor/workspace_integrity.mjs' {
  export function findFilesRecursively(dir: string, predicate: (name: string) => boolean, maxDepth?: number): string[];
  export function checkWorkspaceIntegrity(repoRoot?: string): Array<{
    category: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
    details?: string;
  }>;
}

declare module '*scripts/doctor/graphics_context.mjs' {
  export function checkGraphicsContext(repoRoot?: string): Array<{
    category: string;
    name: string;
    status: 'PASS' | 'WARN' | 'FAIL';
    message: string;
    details?: string;
  }>;
}

declare module '*scripts/doctor.mjs' {
  export function runDoctor(repoRoot?: string): Promise<boolean>;
}

declare module '*scripts/harness/managed_process.mjs' {
  export function answersPort(port: number, host?: string, timeoutMs?: number): Promise<boolean>;
  export function answersHttp(url: string, timeoutMs: number, signal?: AbortSignal): Promise<boolean>;
  export function killAllManagedProcesses(): void;
  export class ManagedProcess {
    constructor(
      label: string,
      command: {
        executable: string;
        args?: string[];
        cwd?: string;
        env?: Record<string, string>;
        startupTimeout?: number;
        shutdownTimeout?: number;
        reuseExisting?: boolean;
        log?: string;
      },
      readiness?: { readyUrl?: string; readyPort?: number },
      projectRoot?: string
    );
    readonly label: string;
    readonly spawned: boolean;
    readonly isReused: boolean;
    readonly processId: number | undefined;
    start(signal?: AbortSignal): Promise<void>;
    stop(timeout?: number): Promise<void>;
  }
}

declare module '*scripts/sentinel/stall_guard.mjs' {
  export const DEFAULT_EPHEMERAL_KEYS: string[];
  export function filterEphemeralState(state: unknown, ignoreKeys?: string[]): string;
  export function detectStateProgress(prevState: unknown, nextState: unknown, ignoreKeys?: string[]): boolean;
  export class StallGuard {
    constructor(options?: { maxStalledSteps?: number; ignoreKeys?: string[] });
    readonly maxStalledSteps: number;
    readonly history: Array<{
      action: string;
      error?: string;
      phase?: string;
      progress: boolean;
      timestamp: number;
      details?: Record<string, unknown>;
    }>;
    recordStep(entry: {
      action: string;
      error?: string | Error;
      phase?: string;
      state?: Record<string, unknown>;
      pageChanged?: boolean;
      progress?: boolean;
      details?: Record<string, unknown>;
    }): boolean;
    isStalled(): boolean;
    getStallSummary(): string;
    reset(): void;
  }
  export function createStallGuard(options?: { maxStalledSteps?: number; ignoreKeys?: string[] }): StallGuard;
}

declare module '*scripts/blender/resolve_blender.mjs' {
  export interface ResolveBlenderOptions {
    env?: Record<string, string | undefined>;
    platform?: string;
    existsSyncFn?: (p: string) => boolean;
    execFileSyncFn?: (bin: string, args: string[], options?: unknown) => string | Buffer;
    whichFn?: ((cmd: string) => string | null) | null;
  }

  export interface BlenderResolution {
    exists: boolean;
    path: string | null;
    version: string | null;
    source: 'env' | 'candidate' | 'path' | 'none';
  }

  export interface RunBlenderOptions extends ResolveBlenderOptions {
    dryRun?: boolean;
    resolveFn?: (options?: ResolveBlenderOptions) => BlenderResolution;
    timeoutMs?: number;
    cwd?: string;
    stdio?: string;
  }

  export interface DryRunBlenderResult {
    executed: boolean;
    binary: string;
    args: string[];
  }

  export function resolveBlenderExecutable(options?: ResolveBlenderOptions): BlenderResolution;
  export function formatBlenderDiagnosticInstructions(platform?: string): string;
  export function runBlenderPythonScript(
    scriptPath: string,
    scriptArgs: string[] | undefined,
    options: RunBlenderOptions & { dryRun: true }
  ): DryRunBlenderResult;
  export function runBlenderPythonScript(
    scriptPath: string,
    scriptArgs?: string[],
    options?: RunBlenderOptions
  ): unknown;
}

declare module '*scripts/resolve_blender.mjs' {
  export interface ResolveBlenderOptions {
    env?: Record<string, string | undefined>;
    platform?: string;
    existsSyncFn?: (p: string) => boolean;
    execFileSyncFn?: (bin: string, args: string[], options?: unknown) => string | Buffer;
    whichFn?: ((cmd: string) => string | null) | null;
  }

  export interface BlenderResolution {
    exists: boolean;
    path: string | null;
    version: string | null;
    source: 'env' | 'candidate' | 'path' | 'none';
  }

  export interface RunBlenderOptions extends ResolveBlenderOptions {
    dryRun?: boolean;
    resolveFn?: (options?: ResolveBlenderOptions) => BlenderResolution;
    timeoutMs?: number;
    cwd?: string;
    stdio?: string;
  }

  export interface DryRunBlenderResult {
    executed: boolean;
    binary: string;
    args: string[];
  }

  export function resolveBlenderExecutable(options?: ResolveBlenderOptions): BlenderResolution;
  export function formatBlenderDiagnosticInstructions(platform?: string): string;
  export function runBlenderPythonScript(
    scriptPath: string,
    scriptArgs: string[] | undefined,
    options: RunBlenderOptions & { dryRun: true }
  ): DryRunBlenderResult;
  export function runBlenderPythonScript(
    scriptPath: string,
    scriptArgs?: string[],
    options?: RunBlenderOptions
  ): unknown;
}

declare module '*scripts/plan_audit/rules_spatial_bounds.mjs' {
  export interface AuditSpatialBoundsOptions {
    isLegacyBaseline?: boolean;
  }

  export interface SpatialBoundsAuditResult {
    errors: string[];
    warnings: string[];
    checkedCount: number;
  }

  export function auditDualBoundSpatialAssertions(
    testContent: string,
    filePath?: string,
    options?: AuditSpatialBoundsOptions
  ): SpatialBoundsAuditResult;
}

declare module '*scripts/lint_spatial_bounds.mjs' {
  export interface AuditSpatialBoundsOptions {
    isLegacyBaseline?: boolean;
  }

  export interface SpatialBoundsAuditResult {
    errors: string[];
    warnings: string[];
    checkedCount: number;
  }

  export function auditDualBoundSpatialAssertions(
    testContent: string,
    filePath?: string,
    options?: AuditSpatialBoundsOptions
  ): SpatialBoundsAuditResult;
}

declare module '*scripts/plan_audit/rules_surface.mjs' {
  export interface TargetSurfaceProbeResult {
    path: string;
    exists: boolean;
    physicalLines?: number;
    sloc?: number;
    srcCallers?: string[];
    testCallers?: string[];
    ambientAugmentations?: string[];
  }

  export function auditAmbientModuleAugmentation(
    targetFiles: Map<string, boolean>,
    planContent: string
  ): number;

  export function probeTargetFilesSurface(
    targetFilePaths: string[]
  ): TargetSurfaceProbeResult[];
}

declare module '*scripts/plan_audit/rules_testing.mjs' {
  export function auditGhostTestPaths(
    planContent: string,
    repoRoot?: string,
    planFilename?: string
  ): number;
}

declare module '*scripts/slop_linter/slop_constants.mjs' {
  export const SLOP_RULES: Record<string, string>;
  export const TIER_BUDGETS: Record<string, { maxWarn: number; maxError: number }>;
  export function categorizeFile(filePath: string): string;
  export function getSourceFiles(dir: string, extensions?: string[]): string[];
}

declare module '*scripts/check_loc.mjs' {
  export interface FileMeasurement {
    filePath: string;
    exists: boolean;
    tierKey: string;
    totalLines: number;
    nonEmptySloc: number;
  }
  export function measureFile(filePath: string): FileMeasurement;
  export function formatReport(results: FileMeasurement[]): { markdown: string; hasError: boolean };
}

declare module '*scripts/evidence_audit/audit_visual_and_telemetry.mjs' {
  export function auditVisualAndTelemetry(
    evidence: Record<string, any>,
    repoRoot: string,
    targetArg: string,
    evidencePath: string
  ): string[];
}

declare module '*scripts/report/report_git_inspector.mjs' {
  export function extractContractTestCounts(
    repoRoot: string,
    contractFile: string,
    ticketId?: string,
    snapshotData?: any
  ): { testCount: number; assertCount: number };
}

declare module '*scripts/evidence_audit/audit_reports_and_ssot.mjs' {
  export function auditReportsAndSSOT(
    evidence: Record<string, any>,
    repoRoot: string,
    targetArg: string,
    evidencePath: string
  ): string[];
}


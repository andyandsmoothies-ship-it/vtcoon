export interface SlopViolation {
  rule: string;
  file: string;
  line: number;
  message: string;
}

export interface SlopLinterResult {
  success: boolean;
  errors: SlopViolation[];
  warnings: SlopViolation[];
}

export declare const SLOP_RULES: {
  readonly ZERO_SWALLOWED_CATCH: 'zero-swallowed-catch';
  readonly ZERO_DIRTY_CASTS: 'zero-dirty-casts';
  readonly FILE_LOC_BUDGET: 'file-loc-budget';
  readonly FUNCTION_LOC_BUDGET: 'function-loc-budget';
};

export declare const TIER_BUDGETS: {
  readonly TIER1_LOGIC: { maxWarn: number; maxError: number };
  readonly TIER2_UI: { maxWarn: number; maxError: number };
  readonly TIER3_STATIC: { maxWarn: number; maxError: number };
};

export declare function categorizeFile(filePath: string): 'TIER1_LOGIC' | 'TIER2_UI' | 'TIER3_STATIC';

export declare function getSourceFiles(dir: string, fileList?: string[]): string[];

export declare function lintSlopContent(
  content: string,
  filePath?: string,
): { errors: SlopViolation[]; warnings: SlopViolation[] };

export declare function runSlopLinter(targetDir?: string): SlopLinterResult;

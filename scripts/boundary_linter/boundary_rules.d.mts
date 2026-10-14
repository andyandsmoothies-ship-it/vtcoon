export interface BoundaryViolation {
  readonly file: string;
  readonly line: number;
  readonly rule: string;
  readonly message: string;
  readonly target?: string;
}

export declare function resolveImport(containingFile: string, importSpecifier: string): string | null;

export declare function lintFileBoundaries(
  filePath: string,
  content: string,
  repoRoot: string,
  isStrict?: boolean
): {
  errors: BoundaryViolation[];
  warnings: BoundaryViolation[];
  resolvedImports?: string[];
};

export declare function detectCycles(
  files: string[],
  repoRoot: string
): string[][];

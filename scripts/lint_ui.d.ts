export interface Violation {
  rule: string;
  file: string;
  line: number;
  col: number;
  snippet: string;
  advice: string;
}

export interface LinterResult {
  totalViolations: number;
  fileCount: number;
  violations: Violation[];
}

export interface ClassMatch {
  value: string;
  index: number;
}

export declare const RULES: {
  readonly BORDER_ACCENT_ON_ROUNDED: 'border-accent-on-rounded';
  readonly BOUNCE_EASING: 'bounce-easing';
  readonly GRAY_ON_COLOR: 'gray-on-color';
  readonly GRADIENT_TEXT: 'gradient-text';
};

export declare function stripComments(code: string): string;

export declare function extractClassStrings(code: string): ClassMatch[];

export declare function lintContent(content: string, filePath?: string): Violation[];

export declare function runLinter(targetDir?: string): LinterResult;

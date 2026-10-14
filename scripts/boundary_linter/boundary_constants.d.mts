export declare const BOUNDARY_RULES: {
  readonly CLIENT_IMPORTS_SERVER: string;
  readonly DEEP_RELATIVE_IMPORT: string;
  readonly CIRCULAR_DEPENDENCY: string;
};

export declare const KNOWN_LEGACY_CLIENT_SERVER_VIOLATIONS: Set<string>;

export declare function normalizeRelPath(p: string): string;

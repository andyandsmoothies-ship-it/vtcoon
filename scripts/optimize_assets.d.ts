export type AssetCategory = 'pawns' | 'buildings' | 'vehicles' | 'landmarks';

export interface AssetCategoryBudget {
  maxBytes: number;
  maxTriangles: number;
  label: string;
}

export interface ModelAnalysisResult {
  filePath: string;
  relPath: string;
  category: string;
  label: string;
  sizeBytes: number;
  maxBytes: number;
  triangles: number | null;
  maxTriangles: number;
  passed: boolean;
}

export interface AssetBudgetReport {
  passed: boolean;
  totalBytes: number;
  maxTotalBytes: number;
  totalPassed: boolean;
  filesCount: number;
  results: ModelAnalysisResult[];
}

export declare const ASSET_BUDGETS: {
  TOTAL_MAX_BYTES: number;
  CATEGORIES: Record<AssetCategory, AssetCategoryBudget>;
};

export declare function detectCategory(filePath: string): string;
export declare function countGltfTriangles(gltf: unknown): number;
export declare function parseGlbTriangles(buffer: Buffer): number | null;
export declare function findModelFiles(dirPath: string, files?: string[]): string[];
export declare function analyzeModelFile(filePath: string, rootDir: string): ModelAnalysisResult;
export declare function checkAssetBudgets(targetDir?: string): AssetBudgetReport;
export declare function runCli(): boolean;

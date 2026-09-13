#!/usr/bin/env node

/**
 * scripts/optimize_assets.mjs
 * 
 * VTCOON 3D Asset Budget Controller (IMP-29)
 * Enforces file size and triangle count budgets for 3D glTF/GLB models.
 * 
 * Invariants (GEMINI.md & IMP-29):
 * - Total initial model payload: <= 2.5 MB
 * - Luxury Pawns: <= 150 KB, <= 1,200 triangles
 * - Buildings C1-C3: <= 100 KB, <= 800 triangles
 * - Micro Vehicles: <= 30 KB, <= 400 triangles
 * - Landmarks: <= 200 KB, <= 1,500 triangles
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ASSET_BUDGETS = {
  TOTAL_MAX_BYTES: 2.5 * 1024 * 1024, // 2.5 MB
  CATEGORIES: {
    pawns: {
      maxBytes: 150 * 1024,
      maxTriangles: 1200,
      label: 'Quân Cờ VIP (Pawns)',
    },
    buildings: {
      maxBytes: 100 * 1024,
      maxTriangles: 800,
      label: 'Công Trình C1-C3 (Buildings)',
    },
    vehicles: {
      maxBytes: 30 * 1024,
      maxTriangles: 400,
      label: 'Vi Giao Thông (Vehicles)',
    },
    landmarks: {
      maxBytes: 200 * 1024,
      maxTriangles: 1500,
      label: 'Danh Thắng Di Sản (Landmarks)',
    },
  },
};

/**
 * Detects model category from its relative or absolute path.
 * Directory hierarchy takes precedence over loose filename matching.
 */
export function detectCategory(filePath) {
  const norm = filePath.replace(/\\/g, '/').toLowerCase();
  if (norm.includes('/pawns/')) return 'pawns';
  if (norm.includes('/buildings/')) return 'buildings';
  if (norm.includes('/vehicles/')) return 'vehicles';
  if (norm.includes('/landmarks/')) return 'landmarks';

  const filename = path.basename(norm);
  if (filename.includes('pawn')) return 'pawns';
  if (filename.includes('building')) return 'buildings';
  if (filename.includes('vehicle')) return 'vehicles';
  if (filename.includes('landmark')) return 'landmarks';
  return 'unknown';
}

/**
 * Counts triangles from glTF JSON metadata.
 * Supports Mode 4 (TRIANGLES), Mode 5 (TRIANGLE_STRIP), and Mode 6 (TRIANGLE_FAN).
 */
export function countGltfTriangles(gltf) {
  if (!gltf || !Array.isArray(gltf.meshes)) return 0;
  const accessors = gltf.accessors || [];
  let total = 0;

  for (const mesh of gltf.meshes) {
    if (!Array.isArray(mesh.primitives)) continue;
    for (const prim of mesh.primitives) {
      const mode = prim.mode !== undefined ? prim.mode : 4;
      let count = 0;

      if (prim.indices !== undefined && accessors[prim.indices]) {
        count = accessors[prim.indices].count || 0;
      } else if (prim.attributes?.POSITION !== undefined && accessors[prim.attributes.POSITION]) {
        count = accessors[prim.attributes.POSITION].count || 0;
      }

      if (mode === 4) {
        // TRIANGLES
        total += Math.floor(count / 3);
      } else if (mode === 5 || mode === 6) {
        // TRIANGLE_STRIP (5) or TRIANGLE_FAN (6)
        total += Math.max(0, count - 2);
      }
    }
  }
  return total;
}

/**
 * Extracts triangle count from binary .glb buffer.
 */
export function parseGlbTriangles(buffer) {
  if (!buffer || buffer.length < 20) return null;
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) return null; // 'glTF'

  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  if (chunkType !== 0x4e4f534a) return null; // 'JSON'
  if (buffer.length < 20 + chunkLength) return null;

  try {
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const gltf = JSON.parse(jsonStr);
    return countGltfTriangles(gltf);
  } catch (err) {
    console.warn(`[AssetBudget] Failed to parse GLB JSON chunk: ${err.message}`);
    return null;
  }
}

/**
 * Recursively scans directory for .glb and .gltf files.
 */
export function findModelFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) return files;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      findModelFiles(full, files);
    } else if (entry.name.endsWith('.glb') || entry.name.endsWith('.gltf')) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Analyzes a single model file against budgets.
 */
export function analyzeModelFile(filePath, rootDir) {
  const stat = fs.statSync(filePath);
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const category = detectCategory(filePath);
  const limits = ASSET_BUDGETS.CATEGORIES[category] ?? {
    maxBytes: 150 * 1024,
    maxTriangles: 1200,
    label: 'Chưa phân loại (Unknown)',
  };

  let triangles = null;
  if (filePath.endsWith('.glb')) {
    const buf = fs.readFileSync(filePath);
    triangles = parseGlbTriangles(buf);
  } else if (filePath.endsWith('.gltf')) {
    try {
      const gltf = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      triangles = countGltfTriangles(gltf);
    } catch (err) {
      console.warn(`[AssetBudget] Failed to parse GLTF JSON: ${err.message}`);
    }
  }

  const bytePassed = stat.size <= limits.maxBytes;
  const triPassed = triangles === null || triangles <= limits.maxTriangles;
  const passed = bytePassed && triPassed;

  return {
    filePath,
    relPath,
    category,
    label: limits.label,
    sizeBytes: stat.size,
    maxBytes: limits.maxBytes,
    triangles,
    maxTriangles: limits.maxTriangles,
    passed,
  };
}

/**
 * Executes full asset budget verification.
 */
export function checkAssetBudgets(targetDir) {
  const root = targetDir || path.resolve(process.cwd(), 'public/models');
  const files = findModelFiles(root);
  let totalBytes = 0;
  const results = [];

  for (const file of files) {
    const info = analyzeModelFile(file, root);
    totalBytes += info.sizeBytes;
    results.push(info);
  }

  const totalPassed = totalBytes <= ASSET_BUDGETS.TOTAL_MAX_BYTES;
  const allFilesPassed = results.every((r) => r.passed);
  const passed = totalPassed && allFilesPassed;

  return {
    passed,
    totalBytes,
    maxTotalBytes: ASSET_BUDGETS.TOTAL_MAX_BYTES,
    totalPassed,
    filesCount: files.length,
    results,
  };
}

/**
 * CLI execution handler.
 */
export function runCli() {
  console.log('=== VTCOON 3D ASSET BUDGET CONTROLLER (IMP-29) ===\n');
  const modelsDir = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : path.resolve(process.cwd(), 'public/models');
  const report = checkAssetBudgets(modelsDir);

  if (report.filesCount === 0) {
    console.log(`✓ 0 tệp mô hình trong ${modelsDir}. Sẵn sàng nạp tài nguyên.`);
    return true;
  }

  console.log(`Đã quét ${report.filesCount} tệp mô hình 3D:`);
  for (const r of report.results) {
    const sizeKb = (r.sizeBytes / 1024).toFixed(1);
    const maxKb = (r.maxBytes / 1024).toFixed(0);
    const triStr = r.triangles !== null ? `${r.triangles}/${r.maxTriangles} tris` : 'triangles: N/A';
    const status = r.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  [${status}] ${r.relPath} (${sizeKb} KB / ${maxKb} KB, ${triStr}) - ${r.label}`);
  }

  const totalMb = (report.totalBytes / (1024 * 1024)).toFixed(2);
  const maxMb = (report.maxTotalBytes / (1024 * 1024)).toFixed(1);
  console.log(`\nTổng dung lượng: ${totalMb} MB / ${maxMb} MB (Ngân sách ban đầu)`);

  if (!report.passed) {
    console.error('\n✗ CẢNH BÁO: Phát hiện vi phạm ngân sách kỹ thuật tài nguyên 3D!');
    return false;
  }

  console.log('\n✓ Toàn bộ mô hình 3D đạt chuẩn ngân sách kỹ thuật thương mại.');
  return true;
}

const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMainModule) {
  const success = runCli();
  process.exit(success ? 0 : 1);
}

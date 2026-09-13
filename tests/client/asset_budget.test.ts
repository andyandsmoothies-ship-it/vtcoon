// [TC-IMP29.1/MSS] Test Suite: 3D Asset Budget Controller & Linter
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import {
  ASSET_BUDGETS,
  detectCategory,
  countGltfTriangles,
  parseGlbTriangles,
  analyzeModelFile,
  checkAssetBudgets,
} from '../../scripts/optimize_assets.mjs';

describe('[TC-IMP29.1/MSS] 3D Asset Budget Controller (IMP-29)', () => {
  it('ASSET_BUDGETS cấu hình chính xác theo đặc tả kỹ thuật IMP-29', () => {
    expect(ASSET_BUDGETS.TOTAL_MAX_BYTES).toBe(2.5 * 1024 * 1024); // 2.5 MB

    expect(ASSET_BUDGETS.CATEGORIES.pawns?.maxBytes).toBe(150 * 1024); // 150 KB
    expect(ASSET_BUDGETS.CATEGORIES.pawns?.maxTriangles).toBe(1200);

    expect(ASSET_BUDGETS.CATEGORIES.buildings?.maxBytes).toBe(100 * 1024); // 100 KB
    expect(ASSET_BUDGETS.CATEGORIES.buildings?.maxTriangles).toBe(800);

    expect(ASSET_BUDGETS.CATEGORIES.vehicles?.maxBytes).toBe(30 * 1024); // 30 KB
    expect(ASSET_BUDGETS.CATEGORIES.vehicles?.maxTriangles).toBe(400);

    expect(ASSET_BUDGETS.CATEGORIES.landmarks?.maxBytes).toBe(200 * 1024); // 200 KB
    expect(ASSET_BUDGETS.CATEGORIES.landmarks?.maxTriangles).toBe(1500);
  });

  it('detectCategory phân loại chính xác theo đường dẫn thư mục', () => {
    expect(detectCategory('public/models/pawns/tower_p1.glb')).toBe('pawns');
    expect(detectCategory('public/models/buildings/shophouse_c1.glb')).toBe('buildings');
    expect(detectCategory('public/models/vehicles/bus_saigon.glb')).toBe('vehicles');
    expect(detectCategory('public/models/landmarks/ben_thanh.glb')).toBe('landmarks');
    expect(detectCategory('public/textures/wood.png')).toBe('unknown');
  });

  it('countGltfTriangles tính toán chính xác số tam giác cho indexed mesh', () => {
    const gltf = {
      accessors: [
        { count: 36 }, // 36 indices = 12 triangles (box)
      ],
      meshes: [
        {
          primitives: [
            { indices: 0, mode: 4 },
          ],
        },
      ],
    };

    expect(countGltfTriangles(gltf)).toBe(12);
  });

  it('countGltfTriangles tính toán chính xác số tam giác cho non-indexed mesh', () => {
    const gltf = {
      accessors: [
        { count: 18 }, // 18 positions = 6 triangles
      ],
      meshes: [
        {
          primitives: [
            { attributes: { POSITION: 0 }, mode: 4 },
          ],
        },
      ],
    };

    expect(countGltfTriangles(gltf)).toBe(6);
  });

  it('countGltfTriangles xử lý an toàn đối với dữ liệu rỗng hoặc sai cấu trúc', () => {
    expect(countGltfTriangles(null)).toBe(0);
    expect(countGltfTriangles({})).toBe(0);
    expect(countGltfTriangles({ meshes: [] })).toBe(0);
  });

  it('parseGlbTriangles trích xuất tam giác từ binary GLB hợp lệ', () => {
    const gltfJson = JSON.stringify({
      accessors: [{ count: 9 }],
      meshes: [{ primitives: [{ indices: 0 }] }],
    });

    const jsonBuffer = Buffer.from(gltfJson, 'utf8');
    const totalLength = 12 + 8 + jsonBuffer.length;
    const glbBuffer = Buffer.alloc(totalLength);

    // Header
    glbBuffer.writeUInt32LE(0x46546c67, 0); // 'glTF'
    glbBuffer.writeUInt32LE(2, 4);          // version 2
    glbBuffer.writeUInt32LE(totalLength, 8);

    // Chunk 0 (JSON)
    glbBuffer.writeUInt32LE(jsonBuffer.length, 12);
    glbBuffer.writeUInt32LE(0x4e4f534a, 16); // 'JSON'
    jsonBuffer.copy(glbBuffer, 20);

    const tris = parseGlbTriangles(glbBuffer);
    expect(tris).toBe(3); // 9 / 3 = 3
  });

  it('parseGlbTriangles trả về null khi buffer hỏng hoặc không đúng chuẩn GLB', () => {
    expect(parseGlbTriangles(Buffer.alloc(10))).toBeNull();
    expect(parseGlbTriangles(Buffer.from('Not a GLB file'))).toBeNull();
  });

  it('checkAssetBudgets trên public/models hiện tại đạt chuẩn ngân sách kỹ thuật (<= 2.5MB)', () => {
    const report = checkAssetBudgets();
    expect(report.passed).toBe(true);
    expect(report.totalPassed).toBe(true);
    expect(report.totalBytes).toBeLessThanOrEqual(ASSET_BUDGETS.TOTAL_MAX_BYTES);
    expect(report.filesCount).toBeGreaterThanOrEqual(4);
  });

  it('detectCategory ưu tiên phân cấp thư mục thay vì tên tệp chứa từ khóa ngẫu nhiên', () => {
    expect(detectCategory('public/models/landmarks/pawn_memorial.glb')).toBe('landmarks');
    expect(detectCategory('public/models/vehicles/building_patrol.glb')).toBe('vehicles');
  });

  it('countGltfTriangles tính toán chính xác số tam giác cho Mode 5 (TRIANGLE_STRIP) và Mode 6 (TRIANGLE_FAN)', () => {
    const gltfStrip = {
      accessors: [{ count: 8 }],
      meshes: [{ primitives: [{ indices: 0, mode: 5 }] }],
    };
    expect(countGltfTriangles(gltfStrip)).toBe(6); // 8 - 2 = 6

    const gltfFan = {
      accessors: [{ count: 10 }],
      meshes: [{ primitives: [{ indices: 0, mode: 6 }] }],
    };
    expect(countGltfTriangles(gltfFan)).toBe(8); // 10 - 2 = 8
  });

  it('analyzeModelFile đọc và tính toán tam giác chính xác cho tệp .gltf JSON', () => {
    const tmpDir = path.resolve(process.cwd(), '.agents/tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const gltfPath = path.join(tmpDir, 'test_pawn.gltf');
    const gltfData = {
      accessors: [{ count: 15 }],
      meshes: [{ primitives: [{ indices: 0, mode: 4 }] }],
    };
    fs.writeFileSync(gltfPath, JSON.stringify(gltfData), 'utf8');

    try {
      const result = analyzeModelFile(gltfPath, tmpDir);
      expect(result.category).toBe('pawns');
      expect(result.triangles).toBe(5); // 15 / 3 = 5
      expect(result.passed).toBe(true);
    } finally {
      if (fs.existsSync(gltfPath)) {
        fs.unlinkSync(gltfPath);
      }
    }
  });

  it('[Adversarial] analyzeModelFile phát hiện vi phạm khi tệp vượt ngân sách', () => {
    const tmpDir = path.resolve(process.cwd(), '.agents/tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const oversizedPath = path.join(tmpDir, 'test_oversized_vehicle.glb');
    // Vehicles limit is 30 KB. Write 40 KB file.
    fs.writeFileSync(oversizedPath, Buffer.alloc(40 * 1024));

    try {
      const result = analyzeModelFile(oversizedPath, tmpDir);
      expect(result.category).toBe('vehicles');
      expect(result.sizeBytes).toBe(40 * 1024);
      expect(result.passed).toBe(false); // Exceeds 30 KB
    } finally {
      if (fs.existsSync(oversizedPath)) {
        fs.unlinkSync(oversizedPath);
      }
    }
  });
});

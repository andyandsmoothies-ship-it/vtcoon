// [TC-IMP32/MSS][UC-IMP32] Contract Test Suite: Executive Tabletop & Coastal Island Metropolis Diorama Master Plan (IMP-32)
// Enforces 6 Core Commitments: Depth Layer Stack 8 Tầng, Bài Trừ Dát Vàng/Neon, Cọc Cờ Sở Hữu, Tone Mapping AgX + N8AO halfRes, GPU Wave Shader
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { DEPTH_LAYER_STACK, GameBoard } from '../../src/client/3d/board_layout';
import * as BoardTileModule from '../../src/client/3d/board_tile';
import { PostProcessingPipeline, DEFAULT_PIPELINE_CONFIG } from '../../src/client/3d/post_processing_pipeline';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';

describe('[TC-IMP32/MSS][UC-IMP32] Executive Tabletop & Coastal Island Metropolis Diorama Contract Tests', () => {
  const rootDir = process.cwd();
  const boardLayoutPath = path.resolve(rootDir, 'src', 'client', '3d', 'board_layout.tsx');
  const proceduralBuildingPath = path.resolve(rootDir, 'src', 'client', '3d', 'procedural_building.tsx');
  const boardTilePath = path.resolve(rootDir, 'src', 'client', '3d', 'board_tile.tsx');
  const postProcessingPath = path.resolve(rootDir, 'src', 'client', '3d', 'post_processing_pipeline.tsx');
  const coastalEnvPath = path.resolve(rootDir, 'src', 'client', '3d', 'coastal_island_environment.tsx');

  // =========================================================================
  // COMMITMENT 1: DEPTH LAYER STACK 8 TẦNG & KHAI TỬ THẢM CỎ XANH #22C55E
  // =========================================================================
  it('[TC-IMP32.1/MSS] board_layout.tsx export DEPTH_LAYER_STACK 8 tang tu -0.350 den +0.025 va loai bo hoan toan mesh co #22C55E', () => {
    const stack = DEPTH_LAYER_STACK as Record<string, number | undefined>;

    // 1. Kiểm tra 8 tầng cao độ bất biến (Khóa chết Z-Fighting)
    expect(stack.WALNUT_TABLE_Y).toBe(-0.350);
    expect(stack.LAGOON_WATER_Y ?? stack.OCEAN_Y).toBe(-0.150);
    expect(stack.SHORELINE_SAND_Y ?? stack.RIVER_BED_Y).toBe(-0.060);
    expect(stack.TERRAIN_BASE_Y).toBe(0.000);
    expect(stack.TILE_BORDER_Y).toBe(0.012);
    expect(stack.TILE_SURFACE_Y).toBe(0.018);
    expect(stack.PAWN_HALO_Y).toBe(0.020);
    expect(stack.STANDEE_BASE_Y).toBe(0.025);

    // 2. Kiểm tra mã nguồn board_layout.tsx KHÔNG còn chứa thảm cỏ xanh thô thiển #22C55E
    const layoutSource = fs.readFileSync(boardLayoutPath, 'utf-8');
    expect(layoutSource).not.toContain('#22C55E');
    expect(layoutSource).not.toContain('args={[6.5, 0.01, 15.2]}');

    // 3. GameBoard phải là React Component hợp lệ
    expect(typeof GameBoard).toBe('function');
  });

  // =========================================================================
  // COMMITMENT 2: KHAI TỬ GoldenGlowVFX & TRIỆT TIÊU NEON EMISSIVE LÒE LOẸT
  // =========================================================================
  it('[TC-IMP32.2/MSS] procedural_building.tsx khong chua GoldenGlowVFX va khong chua emissive neon (> 0.5 ban ngay)', () => {
    const buildingSource = fs.readFileSync(proceduralBuildingPath, 'utf-8');

    // 1. Không chứa import hay thẻ JSX GoldenGlowVFX
    expect(buildingSource).not.toContain('GoldenGlowVFX');
    expect(buildingSource).not.toContain('./golden_glow_vfx');

    // 2. Không chứa emissive neon lóa mắt (> 0.5 khi ban ngày / không điều kiện ngày đêm)
    // Regex tìm các thuộc tính emissiveIntensity có giá trị lớn hơn 0.5 mà không có điều kiện isNight
    const matches = buildingSource.match(/emissiveIntensity=\{([0-9.]+)\}/g) ?? [];
    for (const match of matches) {
      const val = parseFloat(match.replace(/[^0-9.]/g, ''));
      expect(val).toBeLessThanOrEqual(0.5);
    }

    // 3. ProceduralBuilding component phải hoạt động và trả về JSX
    expect(typeof ProceduralBuilding).toBe('function');
  });

  // =========================================================================
  // COMMITMENT 3: CỌC CỜ SỞ HỮU VẬT LÝ (OwnershipMarkerInstances)
  // =========================================================================
  it('[TC-IMP32.3/MSS] board_tile.tsx export hoac render OwnershipMarkerInstances voi cọc cờ kim loại & vải cờ', () => {
    const tileSource = fs.readFileSync(boardTilePath, 'utf-8');

    // 1. Module phải chứa cấu trúc OwnershipMarkerInstances hoặc cọc cờ sở hữu
    const hasOwnershipInstances =
      tileSource.includes('OwnershipMarkerInstances') ||
      tileSource.includes('ownershipMarkerInstances') ||
      typeof (BoardTileModule as Record<string, unknown>).OwnershipMarkerInstances === 'function';
    expect(hasOwnershipInstances).toBe(true);

    // 2. Kiểm tra sự hiện diện của cấu hình cọc cờ kim loại (Brass) và lá cờ đại gia
    expect(
      tileSource.includes('FlagPole') ||
      tileSource.includes('flagPole') ||
      tileSource.includes('cylinderGeometry')
    ).toBe(true);
    expect(
      tileSource.includes('FlagCloth') ||
      tileSource.includes('flagCloth') ||
      tileSource.includes('setColorAt')
    ).toBe(true);
  });

  // =========================================================================
  // COMMITMENT 4: POST-PROCESSING PIPELINE (AgX Tone Mapping & N8AO halfRes)
  // =========================================================================
  it('[TC-IMP32.4/MSS] post_processing_pipeline.tsx cau hinh AgX Tone Mapping va N8AO halfRes: true', () => {
    const ppSource = fs.readFileSync(postProcessingPath, 'utf-8');

    // 1. Phải cấu hình AgX Tone Mapping (thay thế ACES Filmic để chống cháy highlight)
    const hasAgXToneMapping =
      ppSource.includes('AgX') ||
      ppSource.includes('AGX') ||
      ppSource.includes('AgXToneMapping');
    expect(hasAgXToneMapping).toBe(true);
    expect(ppSource).not.toContain('ToneMappingMode.ACES_FILMIC');

    // 2. N8AO phải bật halfRes để tối ưu hiệu năng mobile
    const hasHalfRes =
      ppSource.includes('halfRes') ||
      (DEFAULT_PIPELINE_CONFIG as Record<string, unknown>).aoHalfRes === true;
    expect(hasHalfRes).toBe(true);

    // 3. PostProcessingPipeline component phải sẵn sàng
    expect(typeof PostProcessingPipeline).toBe('function');
  });

  // =========================================================================
  // COMMITMENT 5: KHAI TỬ VÒNG LẶP CPU Float32Array CHO HOẠT ẢNH SÓNG BIỂN
  // =========================================================================
  it('[TC-IMP32.5/MSS] coastal_island_environment.tsx khong su dung vong lap CPU Float32Array cap nhat song moi frame', () => {
    const envSource = fs.readFileSync(coastalEnvPath, 'utf-8');

    // 1. Tuyệt đối không còn vòng lặp CPU Float32Array (for k += 3) trong useSafeFrame
    expect(envSource).not.toContain('pos.array instanceof Float32Array');
    expect(envSource).not.toContain('for (let k = 0; k < len; k += 3)');

    // 2. Sóng biển phải được chuyển sang GPU shader hoặc wave vertex shader
    const hasGpuShaderOrWave =
      envSource.includes('shaderMaterial') ||
      envSource.includes('onBeforeCompile') ||
      envSource.includes('Gerstner') ||
      envSource.includes('waveShader');
    expect(hasGpuShaderOrWave).toBe(true);

    // 3. CoastalIslandEnvironment functional component hợp lệ
    expect(typeof CoastalIslandEnvironment).toBe('function');
  });

  // =========================================================================
  // COMMITMENT 6: KHUNG BÀN GỖ ÓC CHÓ THƯỢNG LƯU (WALNUT TABLETOP) TẠI y = -0.350
  // =========================================================================
  it('[TC-IMP32.6/MSS] board_layout.tsx tich hop Khung Ban Go Oc Cho (Walnut Tabletop) tai y = -0.350 voi mau #2B1D14', () => {
    const layoutSource = fs.readFileSync(boardLayoutPath, 'utf-8');

    // 1. Phải tích hợp bàn gỗ óc chó Walnut Tabletop
    const hasWalnutTable =
      layoutSource.includes('Walnut') ||
      layoutSource.includes('walnut') ||
      layoutSource.includes('Tabletop') ||
      layoutSource.includes('tabletop');
    expect(hasWalnutTable).toBe(true);

    // 2. Bàn gỗ phải sử dụng bảng màu gỗ óc chó Dark Walnut #2B1D14 và cao độ -0.350
    expect(layoutSource).toContain('#2B1D14');
    expect(layoutSource).toContain('-0.35');
  });
});

// [TC-IMP30/MSS] [UC-IMP30] Test Suite: Dense Metropolis Architecture & Tropical Coastline Overhaul
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import {
  CAMERA_CONFIG,
  calculateTargetCameraState,
  resolveCameraMode,
} from '../../src/client/3d/camera_state_machine';

describe('[TC-IMP30/MSS] [UC-IMP30] Retropoly Metropolis & Living Coastal Architecture Overhaul', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('[TC-IMP30/MSS-01] [UC-IMP30] board_layout.tsx không còn import hoặc mount <CenterpieceWater /> và đã loại bỏ thành hộp gỗ gụ cùng bệ kè nổi chiếm đất trung tâm', () => {
    const boardLayoutPath = path.resolve(process.cwd(), 'src/client/3d/board_layout.tsx');
    const boardLayoutSource = fs.readFileSync(boardLayoutPath, 'utf-8');

    // 1. Loại bỏ vĩnh viễn CenterpieceWater khỏi bàn cờ phẳng
    expect(boardLayoutSource, 'board_layout.tsx không được import CenterpieceWater').not.toContain('CenterpieceWater');
    expect(boardLayoutSource, 'board_layout.tsx không được render thẻ <CenterpieceWater').not.toContain('<CenterpieceWater');

    // 2. Loại bỏ bệ kè nổi bo xám 21.4 x 0.24 x 21.4 tách lìa hòn đảo
    expect(boardLayoutSource, 'board_layout.tsx phải loại bỏ bệ kè nổi RoundedBox args={[21.4, 0.24, 21.4]}').not.toContain('args={[21.4, 0.24, 21.4]}');

    // 3. Loại bỏ khung nẹp kim loại nổi cũ
    expect(boardLayoutSource, 'board_layout.tsx phải loại bỏ khung nẹp kim loại cũ args={[20.72, 0.04, 20.72]}').not.toContain('args={[20.72, 0.04, 20.72]}');

    // 4. Kiểm tra dice_tray.tsx không còn 4 cạnh thành hộp gỗ gụ cao 0.24m giam xúc xắc chiếm đất trung tâm
    const diceTrayPath = path.resolve(process.cwd(), 'src/client/3d/dice_tray.tsx');
    const diceTraySource = fs.readFileSync(diceTrayPath, 'utf-8');
    expect(diceTraySource, 'dice_tray.tsx phải loại bỏ thành hộp gỗ gụ args={[4.0, 0.24, 0.2]}').not.toContain('args={[4.0, 0.24, 0.2]}');
    expect(diceTraySource, 'dice_tray.tsx không được giữ thành quảng trường gỗ gụ').not.toContain('Thành quảng trường: Gỗ gụ hoàng gia');
  });

  it('[TC-IMP30/MSS-02] [UC-IMP30] Khóa cứng cấu hình cao độ Depth Layer Stack triệt tiêu Z-Fighting (TERRAIN_BASE_Y, TILE_BORDER_Y, TILE_SURFACE_Y, STANDEE_BASE_Y)', async () => {
    let boardLayoutModule: any = null;
    try {
      boardLayoutModule = await import('../../src/client/3d/board_layout');
    } catch {
      boardLayoutModule = null;
    }

    const terrainBaseY = boardLayoutModule?.TERRAIN_BASE_Y ?? boardLayoutModule?.DEPTH_LAYER_STACK?.TERRAIN_BASE_Y;
    const tileBorderY = boardLayoutModule?.TILE_BORDER_Y ?? boardLayoutModule?.DEPTH_LAYER_STACK?.TILE_BORDER_Y;
    const tileSurfaceY = boardLayoutModule?.TILE_SURFACE_Y ?? boardLayoutModule?.DEPTH_LAYER_STACK?.TILE_SURFACE_Y;
    const standeeBaseY = boardLayoutModule?.STANDEE_BASE_Y ?? boardLayoutModule?.DEPTH_LAYER_STACK?.STANDEE_BASE_Y;

    // Khẳng định giá trị chuẩn xác của 4 mốc phân tầng vật lý
    expect(terrainBaseY, 'TERRAIN_BASE_Y (Nền địa hình chính) phải được định nghĩa bằng 0.000').toBe(0.000);
    expect(tileBorderY, 'TILE_BORDER_Y (Viền móng ô cờ) phải được định nghĩa bằng 0.012').toBe(0.012);
    expect(tileSurfaceY, 'TILE_SURFACE_Y (Mặt trên 40 ô cờ & đại lộ) phải được định nghĩa bằng 0.018').toBe(0.018);
    expect(standeeBaseY, 'STANDEE_BASE_Y (Thềm móng Standee / Shophouse) phải được định nghĩa bằng 0.025').toBe(0.025);

    // Consumer-Side Assertion: Khẳng định phân tầng cao độ tăng dần đều không có xung đột Z-buffer (Zero Z-Fighting)
    expect(tileBorderY! - terrainBaseY!, 'Viền móng phải cao hơn nền địa hình ít nhất 0.010 đơn vị').toBeGreaterThanOrEqual(0.010);
    expect(tileSurfaceY! - tileBorderY!, 'Mặt ô cờ phải cao hơn viền móng ít nhất 0.005 đơn vị').toBeGreaterThanOrEqual(0.005);
    expect(standeeBaseY! - tileSurfaceY!, 'Thềm Standee phải cao hơn mặt ô cờ ít nhất 0.005 đơn vị').toBeGreaterThanOrEqual(0.005);
  });

  it('[TC-IMP30/MSS-03] [UC-IMP30] Kiểm chứng sự tồn tại và khả năng khởi tạo của 2 module độc lập mới: HorizonMountainRange và TropicalPalmsCluster', async () => {
    const mountainPath = path.resolve(process.cwd(), 'src/client/3d/horizon_mountain_range.tsx');
    const palmsPath = path.resolve(process.cwd(), 'src/client/3d/tropical_palms_cluster.tsx');

    // 1. Kiểm tra sự tồn tại vật lý của tệp trên đĩa
    expect(fs.existsSync(mountainPath), 'Tệp src/client/3d/horizon_mountain_range.tsx phải tồn tại trên đĩa').toBe(true);
    expect(fs.existsSync(palmsPath), 'Tệp src/client/3d/tropical_palms_cluster.tsx phải tồn tại trên đĩa').toBe(true);

    // 2. Kiểm tra module export hợp lệ
    let mountainModule: any = null;
    try {
      mountainModule = await import('../../src/client/3d/horizon_mountain_range');
    } catch {
      mountainModule = null;
    }

    let palmsModule: any = null;
    try {
      palmsModule = await import('../../src/client/3d/tropical_palms_cluster');
    } catch {
      palmsModule = null;
    }

    expect(mountainModule?.HorizonMountainRange, 'HorizonMountainRange phải được export từ horizon_mountain_range.tsx').toBeDefined();
    expect(typeof mountainModule?.HorizonMountainRange, 'HorizonMountainRange phải là React Functional Component').toBe('function');

    expect(palmsModule?.TropicalPalmsCluster, 'TropicalPalmsCluster phải được export từ tropical_palms_cluster.tsx').toBeDefined();
    expect(typeof palmsModule?.TropicalPalmsCluster, 'TropicalPalmsCluster phải là React Functional Component').toBe('function');
  });

  it('[TC-IMP30/MSS-04] [UC-IMP30] Cấu hình Camera dice_roll trong camera_state_machine.ts ngắm chính xác tọa độ sàn diễn xúc xắc mới', () => {
    // 1. Kiểm tra thông số bất biến trong CAMERA_CONFIG.dice_roll
    expect(CAMERA_CONFIG.dice_roll.position, 'CAMERA_CONFIG.dice_roll.position phải khớp [2.5, 2.8, 7.2]').toEqual([2.5, 2.8, 7.2]);
    expect(CAMERA_CONFIG.dice_roll.target, 'CAMERA_CONFIG.dice_roll.target phải khớp [0.0, 0.25, 3.8]').toEqual([0.0, 0.25, 3.8]);
    expect(CAMERA_CONFIG.dice_roll.fov, 'CAMERA_CONFIG.dice_roll.fov phải là 36').toBe(36);

    // 2. Consumer-Side Assertion: Kiểm tra tính toán vị trí camera khi máy quay ở chế độ dice_roll
    const targetState = calculateTargetCameraState('dice_roll');
    expect(targetState.position, 'Target state position phải khớp tọa độ cấu hình mới').toEqual([2.5, 2.8, 7.2]);
    expect(targetState.target, 'Target state target phải bám theo tọa độ sàn diễn xúc xắc mới').toEqual([0.0, 0.25, 3.8]);
    expect(targetState.fov).toBe(36);

    // 3. Khẳng định FSM giữ mode overview khi xúc xắc đang gieo (triệt tiêu zoom giật lag)
    const resolved = resolveCameraMode({
      isRolling: true,
      isPawnAnimating: false,
      activeModal: null,
    });
    expect(resolved).toBe('overview');
  });

  it('[TC-IMP30/MSS-05] [UC-IMP30] MiniatureCityDiorama render an toàn trong test/headless qua renderToStaticMarkup và tích hợp mã màu kiến trúc Retropoly', () => {
    const html = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    expect(html, 'MiniatureCityDiorama phải render thành công chuỗi HTML').toBeDefined();
    expect(html).toContain('data-testid="miniature-city-diorama"');

    // Kiểm tra bảng mã màu kiến trúc Retropoly chuẩn thương mại trong các chi tiết diorama:
    // 1. #FEF08A: Tường Shophouse Indochine (Vàng kem Pháp)
    expect(html, 'Diorama phải tích hợp màu tường Shophouse Indochine #FEF08A').toContain('#FEF08A');
    // 2. #EA580C: Mái ngói đất nung đỏ cam Chợ Lớn xưa
    expect(html, 'Diorama phải tích hợp màu mái ngói đất nung #EA580C').toContain('#EA580C');
    // 3. #38BDF8: Cao ốc kính sapphire phản chiếu bầu trời xanh
    expect(html, 'Diorama phải tích hợp kính Sapphire cao ốc #38BDF8').toContain('#38BDF8');
    // 4. #1E293B: Đại lộ trải nhựa sẫm bóng mịn
    expect(html, 'Diorama phải tích hợp nhựa đường sẫm #1E293B').toContain('#1E293B');
  });

  it('[TC-IMP30/MSS-06] [UC-IMP30] Kiểm tra trần kích thước tệp (Hiến pháp GEMINI.md <= 400 LOC và <= 300 LOC sau phân rã)', () => {
    // 1. coastal_island_environment.tsx <= 300 LOC sau khi đã phân rã núi và dừa
    const coastalPath = path.resolve(process.cwd(), 'src/client/3d/coastal_island_environment.tsx');
    expect(fs.existsSync(coastalPath), 'src/client/3d/coastal_island_environment.tsx phải tồn tại').toBe(true);
    const coastalContent = fs.readFileSync(coastalPath, 'utf-8');
    const coastalLines = coastalContent.split('\n').length;
    expect(
      coastalLines,
      `coastal_island_environment.tsx sau phân rã phải <= 300 LOC (hiện tại: ${coastalLines} LOC)`
    ).toBeLessThanOrEqual(300);

    // 2. horizon_mountain_range.tsx <= 400 LOC (và lý tưởng <= 120 LOC)
    const mountainPath = path.resolve(process.cwd(), 'src/client/3d/horizon_mountain_range.tsx');
    expect(fs.existsSync(mountainPath), 'src/client/3d/horizon_mountain_range.tsx phải tồn tại').toBe(true);
    const mountainContent = fs.readFileSync(mountainPath, 'utf-8');
    const mountainLines = mountainContent.split('\n').length;
    expect(
      mountainLines,
      `horizon_mountain_range.tsx phải <= 400 LOC (hiện tại: ${mountainLines} LOC)`
    ).toBeLessThanOrEqual(400);

    // 3. tropical_palms_cluster.tsx <= 400 LOC (và lý tưởng <= 100 LOC)
    const palmsPath = path.resolve(process.cwd(), 'src/client/3d/tropical_palms_cluster.tsx');
    expect(fs.existsSync(palmsPath), 'src/client/3d/tropical_palms_cluster.tsx phải tồn tại').toBe(true);
    const palmsContent = fs.readFileSync(palmsPath, 'utf-8');
    const palmsLines = palmsContent.split('\n').length;
    expect(
      palmsLines,
      `tropical_palms_cluster.tsx phải <= 400 LOC (hiện tại: ${palmsLines} LOC)`
    ).toBeLessThanOrEqual(400);
  });
});

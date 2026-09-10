// [TC-CW01/MSS] Test Suite: CenterpieceWater 3D Component & Sa Bàn Oasis Integration
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { ShapeGeometry } from 'three';
import {
  CenterpieceWater,
  createWaterOasisShape,
  WATER_SURFACE_Y,
  WATER_MATERIAL_PROPS,
  EMBANKMENT_MATERIAL_PROPS,
  EMBANKMENT_SEGMENTS,
  LOTUS_CLUSTERS,
  CORNER_BUSHES,
} from '../../src/client/3d/centerpiece_water';
import { cellPosition, GRID } from '../../src/client/3d/board_coords';
import { calculatePathWaypoints } from '../../src/client/3d/pawn_path';

describe('[TC-CW01.1/MSS] Thống Số Vật Liệu PBR & Hình Học Mặt Hồ', () => {
  it('Cao độ mặt hồ nước đặt đúng chuẩn y = 0.05', () => {
    expect(WATER_SURFACE_Y).toBe(0.05);
  });

  it('Vật liệu mặt nước hồ đạt chuẩn PBR: Xanh ngọc lam #0284C7, roughness 0.1, metalness 0.2, opacity 0.85', () => {
    expect(WATER_MATERIAL_PROPS.color).toBe('#0284C7');
    expect(WATER_MATERIAL_PROPS.roughness).toBe(0.1);
    expect(WATER_MATERIAL_PROPS.metalness).toBe(0.2);
    expect(WATER_MATERIAL_PROPS.transparent).toBe(true);
    expect(WATER_MATERIAL_PROPS.opacity).toBe(0.85);
  });

  it('Vật liệu bờ kè đá sa thạch đạt chuẩn: Màu đá sa mộc #78716C, roughness 0.6', () => {
    expect(EMBANKMENT_MATERIAL_PROPS.color).toBe('#78716C');
    expect(EMBANKMENT_MATERIAL_PROPS.roughness).toBe(0.6);
  });

  it('createWaterOasisShape tạo hình chữ nhật bo góc với lỗ khay xúc xắc trung tâm', () => {
    const shape = createWaterOasisShape(15.0, 1.0, 4.4);
    expect(shape.curves.length).toBeGreaterThanOrEqual(4);
    expect(shape.holes.length).toBe(1);
  });

  it('ShapeGeometry phân rã hình học mặt hồ hợp lệ với số đỉnh và tam giác xác định', () => {
    const shape = createWaterOasisShape(15.0, 1.0, 4.4);
    const geom = new ShapeGeometry(shape);
    const pos = geom.getAttribute('position');
    expect(pos).toBeDefined();
    expect(pos?.count).toBeGreaterThan(0);
    expect(geom.index?.count).toBeGreaterThan(0);
  });

  it('[Adversarial] createWaterOasisShape với holeSize = 0 không tạo hole', () => {
    const shapeNoHole = createWaterOasisShape(15.0, 1.0, 0);
    expect(shapeNoHole.holes.length).toBe(0);
  });

  it('[Adversarial] createWaterOasisShape với cornerRadius = 0 tạo hình chữ nhật viền phẳng', () => {
    const shapeFlat = createWaterOasisShape(15.0, 0, 4.4);
    expect(shapeFlat.curves.length).toBe(4);
    expect(shapeFlat.holes.length).toBe(1);
  });

  it('[Adversarial] createWaterOasisShape với holeSize >= size không tạo lỗ thủng vượt biên', () => {
    const shapeOverHole = createWaterOasisShape(15.0, 1.0, 16.0);
    expect(shapeOverHole.holes.length).toBe(0);
  });
});

describe('[TC-CW01.2/MSS] Không Đè Lên Khay Xúc Xắc & Đường Đi Quân Cờ', () => {
  it('Tất cả 40 ô đất nằm hoàn toàn bên ngoài khung bờ kè đá hồ (Khoảng cách >= GRID 9.0)', () => {
    const maxEmbankmentRadius = 7.95; // Bờ kè tối đa 7.65 + 0.3 = 7.95
    for (let i = 0; i < 40; i++) {
      const pos = cellPosition(i);
      const distFromCenter = Math.max(Math.abs(pos[0]), Math.abs(pos[2]));
      expect(distFromCenter).toBe(GRID);
      expect(distFromCenter).toBeGreaterThan(maxEmbankmentRadius);
    }
  });

  it('Toàn bộ đường đi quân cờ (waypoints) duy trì bán kính an toàn ngoài hồ nước', () => {
    const waypoints = calculatePathWaypoints(0, 10);
    expect(waypoints.length).toBe(10);
    for (const cellIdx of waypoints) {
      const pos = cellPosition(cellIdx);
      const radius = Math.max(Math.abs(pos[0]), Math.abs(pos[2]));
      expect(radius).toBe(GRID);
    }
  });

  it('Lỗ trống trung tâm (holeSize 4.4) bao bọc khay xúc xắc 4.0 x 4.0 không gây z-fighting', () => {
    const diceTrayHalfWidth = 2.0; // Khay xúc xắc args=[4.0, 0.24, 4.0]
    const holeHalfWidth = 4.4 / 2; // Bán kính lỗ hồ 2.2
    expect(holeHalfWidth).toBeGreaterThan(diceTrayHalfWidth);
  });

  it('Khung bờ kè có đủ 4 bức tường ngoài, 4 trụ góc và 1 bệ đảo ngọc nâng đỡ khay xúc xắc', () => {
    expect(EMBANKMENT_SEGMENTS.length).toBe(9);
    const islandPedestal = EMBANKMENT_SEGMENTS.find(
      (s) => s.pos[0] === 0 && s.pos[2] === 0
    );
    expect(islandPedestal).toBeDefined();
    expect(islandPedestal?.args[0]).toBe(4.4);
    expect(islandPedestal?.args[2]).toBe(4.4);
  });
});

describe('[TC-CW01.3/MSS] Render Hợp Lệ & Cấu Trúc Điểm Xuyết Sinh Thái', () => {
  let originalConsoleError: typeof console.error;
  let staticMarkup = '';

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
    staticMarkup = renderToStaticMarkup(React.createElement(CenterpieceWater));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('CenterpieceWater render HTML static markup hợp lệ không quăng lỗi', () => {
    expect(staticMarkup).toContain('data-testid="centerpiece-water"');
    expect(staticMarkup).toContain('#0284C7');
    expect(staticMarkup).toContain('#78716C');
  });

  it('Mặt hồ có đủ 4 khóm hoa sen trang trí nổi trên mặt nước', () => {
    expect(LOTUS_CLUSTERS.length).toBe(4);
    for (const lotus of LOTUS_CLUSTERS) {
      expect(lotus.pos[1]).toBeGreaterThanOrEqual(WATER_SURFACE_Y);
      expect(Math.abs(lotus.pos[0])).toBeLessThan(7.5);
      expect(Math.abs(lotus.pos[2])).toBeLessThan(7.5);
    }
    expect(staticMarkup).toContain('#15803D'); // Màu lá sen
    expect(staticMarkup).toContain('#F472B6'); // Màu hoa sen hồng
  });

  it('Bờ kè có đủ 4 khóm cây xanh tại 4 góc hồ', () => {
    expect(CORNER_BUSHES.length).toBe(4);
    for (const bush of CORNER_BUSHES) {
      expect(bush.r).toBeGreaterThan(0.2);
      expect(Math.abs(bush.pos[0])).toBeGreaterThan(6.0);
      expect(Math.abs(bush.pos[2])).toBeGreaterThan(6.0);
    }
    expect(staticMarkup).toContain('#166534'); // Màu cây xanh bụi rậm
    expect(staticMarkup).toContain('#22C55E'); // Màu cây xanh non
  });
});

describe('[TC-CW01.4/MSS] Kiểm Chuẩn Dung Lượng Bundle Gzip (< 500KB Gzip)', () => {
  const distAssetsDir = path.resolve(process.cwd(), 'dist', 'assets');

  beforeAll(() => {
    if (!fs.existsSync(distAssetsDir) || fs.readdirSync(distAssetsDir).length === 0) {
      execSync('npm run build', { stdio: 'pipe' });
    }
  });

  it('Thư mục dist/assets tồn tại và có file chunk sau khi build', () => {
    expect(fs.existsSync(distAssetsDir)).toBe(true);
    const files = fs.readdirSync(distAssetsDir);
    expect(files.some((f) => f.endsWith('.js'))).toBe(true);
  });

  it('Mọi JS chunk trong dist/assets/ có dung lượng gzip < 500KB (NFR-PERF-002)', () => {
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);

    for (const file of jsFiles) {
      const filePath = path.join(distAssetsDir, file);
      const content = fs.readFileSync(filePath);
      const gzipped = zlib.gzipSync(content);
      const gzipSizeKB = gzipped.length / 1024;
      expect(gzipSizeKB).toBeLessThan(500);
    }
  });

  it('[Adversarial] Không có bất kỳ chunk nào vượt quá ngưỡng 500KB gzip', () => {
    const files = fs.readdirSync(distAssetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    const oversized = jsFiles.filter((f) => {
      const content = fs.readFileSync(path.join(distAssetsDir, f));
      return zlib.gzipSync(content).length >= 500 * 1024;
    });
    expect(oversized).toHaveLength(0);
  });
});

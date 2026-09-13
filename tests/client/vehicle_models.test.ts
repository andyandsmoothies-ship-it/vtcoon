// [TC-IMP29.4/MSS] Test Suite: 3D Vehicle Models Overhaul & SafeGLTFModel Integration
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import path from 'node:path';
import fs from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DioramaTraffic,
  VEHICLE_MODEL_URLS,
  getVehicleModelUrl,
} from '../../src/client/3d/diorama/diorama_traffic';
import { CoastalPatrolBoat } from '../../src/client/3d/coastal_patrol_boat';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { analyzeModelFile, checkAssetBudgets, ASSET_BUDGETS } from '../../scripts/optimize_assets.mjs';

describe('[TC-IMP29.4/MSS] 3D Vehicle Models Overhaul & SafeGLTFModel Integration', () => {
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

  it('VEHICLE_MODEL_URLS cấu hình đầy đủ 6 loại phương tiện đô thị và hàng hải chuẩn', () => {
    expect(VEHICLE_MODEL_URLS).toBeDefined();
    expect(VEHICLE_MODEL_URLS.sedan).toBe('/models/vehicles/vehicle_sedan.glb');
    expect(VEHICLE_MODEL_URLS.taxi).toBe('/models/vehicles/vehicle_taxi.glb');
    expect(VEHICLE_MODEL_URLS.bus).toBe('/models/vehicles/vehicle_bus.glb');
    expect(VEHICLE_MODEL_URLS.van).toBe('/models/vehicles/vehicle_van.glb');
    expect(VEHICLE_MODEL_URLS.boat).toBe('/models/vehicles/vehicle_boat.glb');
    expect(VEHICLE_MODEL_URLS.container).toBe('/models/vehicles/vehicle_container.glb');
  });

  it('getVehicleModelUrl phân giải chính xác mô hình theo từng chủng loại xe vi mô', () => {
    expect(getVehicleModelUrl('bus')).toBe(VEHICLE_MODEL_URLS.bus);
    expect(getVehicleModelUrl('taxi')).toBe(VEHICLE_MODEL_URLS.taxi);
    expect(getVehicleModelUrl('van')).toBe(VEHICLE_MODEL_URLS.van);
    expect(getVehicleModelUrl('sedan')).toBe(VEHICLE_MODEL_URLS.sedan);
    expect(getVehicleModelUrl('suv')).toBe(VEHICLE_MODEL_URLS.sedan);
    expect(getVehicleModelUrl('sports')).toBe(VEHICLE_MODEL_URLS.sedan);
  });

  it('DioramaTraffic render an toàn trong môi trường test/headless qua SafeGLTFModel', () => {
    const html = renderToStaticMarkup(React.createElement(DioramaTraffic));
    expect(html).toBeDefined();
    expect(html).toContain('data-testid="diorama-traffic"');
    // Kiểm tra bảo toàn các màu sắc và đèn báo hiệu giao thông trong fallback
    expect(html).toContain('#F59E0B'); // Xe buýt vàng
    expect(html).toContain('#0284C7'); // Sedan Sapphire
    expect(html).toContain('#FEF08A'); // Đèn LED vàng
  });

  it('CoastalPatrolBoat render an toàn trong môi trường test/headless qua SafeGLTFModel', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalPatrolBoat));
    expect(html).toBeDefined();
    expect(html).toContain('data-testid="coastal-patrol-boat"');
    expect(html).toContain('#F8FAFC'); // Thân tàu vỏ trắng
    expect(html).toContain('#EA580C'); // Vạch sọc cam cảnh sát biển
    expect(html).toContain('#FFFFFF'); // Bọt rẽ sóng
  });

  it('CoastalIslandEnvironment tích hợp SafeGLTFModel cho tàu container', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
    expect(html).toBeDefined();
    expect(html).toContain('#DC2626'); // Thân tàu container đáy đỏ
    expect(html).toContain('#FFFFFF'); // Bọt nước rẽ sóng đuôi tàu container
  });

  it('Đầy đủ 6 tệp mô hình .glb phương tiện tồn tại trong public/models/vehicles và đạt chuẩn ngân sách kỹ thuật', () => {
    const vehiclesDir = path.resolve(process.cwd(), 'public/models/vehicles');
    const vehicleFiles = [
      'vehicle_sedan.glb',
      'vehicle_taxi.glb',
      'vehicle_bus.glb',
      'vehicle_van.glb',
      'vehicle_boat.glb',
      'vehicle_container.glb',
    ];

    for (const file of vehicleFiles) {
      const fullPath = path.join(vehiclesDir, file);
      expect(fs.existsSync(fullPath), `Tệp mô hình ${file} phải tồn tại trên đĩa`).toBe(true);

      const analysis = analyzeModelFile(fullPath, vehiclesDir);
      expect(analysis.category).toBe('vehicles');
      expect(analysis.sizeBytes).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.vehicles.maxBytes);
      if (analysis.triangles !== null) {
        expect(analysis.triangles).toBeLessThanOrEqual(ASSET_BUDGETS.CATEGORIES.vehicles.maxTriangles);
      }
      expect(analysis.passed).toBe(true);
    }
  });

  it('Tổng ngân sách toàn bộ kho tài nguyên 3D (ít nhất 13 mô hình) <= 2.5 MB', () => {
    const report = checkAssetBudgets();
    expect(report.passed).toBe(true);
    expect(report.totalPassed).toBe(true);
    expect(report.totalBytes).toBeLessThanOrEqual(ASSET_BUDGETS.TOTAL_MAX_BYTES);
    expect(report.filesCount).toBeGreaterThanOrEqual(13);
  });
});

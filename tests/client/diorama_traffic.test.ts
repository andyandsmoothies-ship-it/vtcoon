// [UI-S02/MSS] DioramaTraffic & Autonomous Micro-Traffic Test Suite
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DioramaTraffic, MICRO_VEHICLES } from '../../src/client/3d/diorama/diorama_traffic';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';

describe('[UI-S02/MSS] DioramaTraffic — Autonomous Micro-Traffic System', () => {
  let originalConsoleError: typeof console.error;
  let trafficMarkup = '';

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
    trafficMarkup = renderToStaticMarkup(React.createElement(DioramaTraffic));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('DioramaTraffic render static markup hợp lệ có testid', () => {
    expect(trafficMarkup).toContain('data-testid="diorama-traffic"');
  });

  it('Quản lý danh sách 7 xe tí hon gồm xe buýt vàng/đỏ, ô tô cá nhân nhiều màu và taxi', () => {
    expect(MICRO_VEHICLES.length).toBeGreaterThanOrEqual(6);
    expect(MICRO_VEHICLES.length).toBeLessThanOrEqual(8);

    const vehicleTypes = MICRO_VEHICLES.map((v) => v.type);
    expect(vehicleTypes).toContain('bus');
    expect(vehicleTypes).toContain('sedan');
    expect(vehicleTypes).toContain('suv');
    expect(vehicleTypes).toContain('sports');
    expect(vehicleTypes).toContain('taxi');
    expect(vehicleTypes).toContain('van');
  });

  it('Phân bổ đủ 2 làn di chuyển đối ứng: làn ngoài và làn trong', () => {
    const outerVehicles = MICRO_VEHICLES.filter((v) => v.track === 'outer');
    const innerVehicles = MICRO_VEHICLES.filter((v) => v.track === 'inner');
    expect(outerVehicles.length).toBeGreaterThanOrEqual(3);
    expect(innerVehicles.length).toBeGreaterThanOrEqual(3);
  });

  it('Mỗi xe có đầy đủ thân vỏ đặc trưng màu sắc và đèn pha LED vi mô rọi sáng mặt đường', () => {
    // Màu các phương tiện
    expect(trafficMarkup).toContain('#F59E0B'); // Xe buýt vàng Sài Gòn
    expect(trafficMarkup).toContain('#DC2626'); // Xe buýt đỏ VinBus
    expect(trafficMarkup).toContain('#0284C7'); // Sedan Sapphire
    expect(trafficMarkup).toContain('#F8FAFC'); // SUV Bạch Kim
    expect(trafficMarkup).toContain('#EA580C'); // Coupe Cam
    expect(trafficMarkup).toContain('#10B981'); // Taxi Xanh Mai Linh
    expect(trafficMarkup).toContain('#EAB308'); // Xe tải vàng DHL

    // Đèn pha LED vàng vi mô rọi mặt đường & đèn hậu đỏ
    expect(trafficMarkup).toContain('#FEF08A'); // LED headlight
    expect(trafficMarkup).toContain('#EF4444'); // Taillight
    expect(trafficMarkup).toContain('#0F172A'); // Kính cabin tối màu
    expect(trafficMarkup).toContain('#1E293B'); // Lốp xe cao su
  });

  it('MiniatureCityDiorama tích hợp DioramaTraffic thành công', () => {
    const dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    expect(dioramaMarkup).toContain('data-testid="diorama-traffic"');
  });

  it('Các phương tiện trên cùng một làn có vận tốc đồng nhất và giãn cách an toàn chống va chạm bóng ma', () => {
    const outerVehicles = MICRO_VEHICLES.filter((v) => v.track === 'outer');
    const outerSpeed = outerVehicles[0]?.speed;
    expect(outerVehicles.every((v) => v.speed === outerSpeed)).toBe(true);

    const innerVehicles = MICRO_VEHICLES.filter((v) => v.track === 'inner');
    const innerSpeed = innerVehicles[0]?.speed;
    expect(innerVehicles.every((v) => v.speed === innerSpeed)).toBe(true);

    // Kiểm tra giãn cách offset an toàn (> 0.20 vòng)
    const sortedOuterOffsets = [...outerVehicles.map((v) => v.offset)].sort((a, b) => a - b);
    for (let i = 1; i < sortedOuterOffsets.length; i++) {
      expect((sortedOuterOffsets[i] ?? 0) - (sortedOuterOffsets[i - 1] ?? 0)).toBeGreaterThanOrEqual(0.2);
    }
  });
});

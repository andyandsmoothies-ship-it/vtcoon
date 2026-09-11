// [TC-PB01/MSS] Test Suite: ProceduralBuilding 3D Architectural Tiers C0-C3
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';

describe('[TC-PB01.1/MSS] 4 Cấp Độ Kiến Trúc 3D Thể Tích (Tiers C0-C3)', () => {
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

  it('Cấp 0 (Đất trống / Quy hoạch) kết xuất đủ 4 cọc mốc sọc đỏ trắng và dây mạ vàng', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0, groupColor: '#DC2626' }));
    expect(markup).toContain('#DC2626'); // Sọc sơn đỏ phản quang
    expect(markup).toContain('#F8FAFC'); // Cọc bê tông trắng
    expect(markup).toContain('#F59E0B'); // Dây mạ vàng mốc chỉ giới
    expect(markup).toContain('#78350F'); // Cọc gỗ cắm biển mốc
    expect(markup).toContain('#FEF3C7'); // Biển cọc gỗ
  });

  it('Cấp 1 (Nhà phố Đông Dương) kết xuất tường vàng kem, cửa gụ và mái ngói đất nung', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 1, groupColor: '#16A34A' }));
    expect(markup).toContain('#475569'); // Chân móng đá bệ xám
    expect(markup).toContain('#FEF3C7'); // Thân nhà vàng kem
    expect(markup).toContain('#451A03'); // Cửa gỗ gụ
    expect(markup).toContain('#B91C1C'); // Mái ngói đỏ đất nung
    expect(markup).toContain('#16A34A'); // Biển hiệu mang màu nhóm đất
  });

  it('Cấp 2 (Tổ hợp cao ốc Sapphire) kết xuất kính Sapphire, lam chắn nắng và đế nhóm đất', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 2, groupColor: '#2563EB' }));
    expect(markup).toContain('#0284C7'); // Kính Sapphire PBR
    expect(markup).toContain('#CBD5E1'); // Lam nhôm chắn nắng Titan
    expect(markup).toContain('#2563EB'); // Khối đế mang màu nhóm đất
  });

  it('Cấp 3 (Landmark Hoàng Kim) kết xuất tháp đôi, Skybridge và chóp vàng Champagne', () => {
    const markup = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 3, groupColor: '#D97706' }));
    expect(markup).toContain('#1E293B'); // Bệ cẩm thạch đen chân tháp
    expect(markup).toContain('#38BDF8'); // Cầu kính Skybridge
    expect(markup).toContain('#F59E0B'); // Đỉnh kim tự tháp mạ vàng 24K
    expect(markup).toContain('#FBBF24'); // Kim thu lôi đón sáng
  });

  it('[Adversarial] level thay đổi cập nhật chính xác cấu trúc hình học tương ứng', () => {
    const c0 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    const c1 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 1 }));
    const c2 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 2 }));
    const c3 = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 3 }));

    expect(c0).not.toContain('#38BDF8'); // C0 không có Skybridge
    expect(c1).not.toContain('#38BDF8'); // C1 không có Skybridge
    expect(c2).not.toContain('#451A03'); // C2 không có cửa gỗ gụ
    expect(c3).toContain('#38BDF8');     // C3 có Skybridge
  });
});

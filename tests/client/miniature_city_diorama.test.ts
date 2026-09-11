// [TC-MCD01/MSS] Test Suite: MiniatureCityDiorama & Central Sunken Plaza
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { DioramaBridges } from '../../src/client/3d/diorama/diorama_bridges';
import { DioramaStadium } from '../../src/client/3d/diorama/diorama_stadium';
import { DioramaFerrisWheel } from '../../src/client/3d/diorama/diorama_ferris_wheel';
import { DioramaContainerPort } from '../../src/client/3d/diorama/diorama_container_port';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaMarina } from '../../src/client/3d/diorama/diorama_marina';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import { DioramaMicroLife } from '../../src/client/3d/diorama/diorama_microlife';
import { DiceTray } from '../../src/client/3d/dice_tray';

describe('[TC-MCD01.1/MSS] Sa Bàn Đô Thị Liền Khối (Unified Diorama)', () => {
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
    staticMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('MiniatureCityDiorama render static markup hợp lệ có testid', () => {
    expect(staticMarkup).toContain('data-testid="miniature-city-diorama"');
  });

  it('DioramaTerrain kết xuất đủ 2 bán đảo Đông/Tây và 4 lối cầu thang quảng trường', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    expect(terrainMarkup).toContain('#D4C5A3'); // Sa thạch ngà
    expect(terrainMarkup).toContain('#2D5A27'); // Thảm cỏ rêu tự nhiên
    expect(terrainMarkup).toContain('#334155'); // Nhựa đường Đại lộ Trục Tây
    expect(terrainMarkup).toContain('#CBD5E1'); // Bậc thềm đá hoa cương
  });

  it('DioramaBridges kết xuất Cầu Ba Son (dây văng) và Cầu Long Biên (vòm thép)', () => {
    const bridgesMarkup = renderToStaticMarkup(React.createElement(DioramaBridges));
    expect(bridgesMarkup).toContain('#F8FAFC'); // Trụ tháp Ba Son titan
    expect(bridgesMarkup).toContain('#E2E8F0'); // Dây văng rẻ quạt
    expect(bridgesMarkup).toContain('#78350F'); // Giàn thép Cầu Long Biên
    expect(bridgesMarkup).toContain('#57534E'); // Mố đá sa thạch rêu phong
  });

  it('DioramaStadium kết xuất đấu trường oval với sân cỏ kẻ sọc và đèn LED', () => {
    const stadiumMarkup = renderToStaticMarkup(React.createElement(DioramaStadium));
    expect(stadiumMarkup).toContain('#166534'); // Lòng sân thể thao
    expect(stadiumMarkup).toContain('#15803D'); // Sọc cỏ thi đấu
    expect(stadiumMarkup).toContain('#DC2626'); // Ghế ngồi khán đài
    expect(stadiumMarkup).toContain('#E0F2FE'); // Đèn LED thể thao
  });

  it('DioramaMarina kết xuất bến du thuyền điêu khắc và ngọn hải đăng di sản', () => {
    const marinaMarkup = renderToStaticMarkup(React.createElement(DioramaMarina));
    expect(marinaMarkup).toContain('#854D0E'); // Cầu cảng gỗ
    expect(marinaMarkup).toContain('#F8FAFC'); // Du thuyền trắng sứ
    expect(marinaMarkup).toContain('#0284C7'); // Kính buồng lái sapphire
    expect(marinaMarkup).toContain('#FEF08A'); // Thấu kính đèn biển Fresnel
  });

  it('DioramaSkyline kết xuất Tháp Bitexco sân đỗ trực thăng, biệt thự vườn và cây xanh', () => {
    const skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));
    expect(skylineMarkup).toContain('#F59E0B'); // Sân đỗ trực thăng & kim thu lôi
    expect(skylineMarkup).toContain('#38BDF8'); // Kính cao ốc Sapphire
    expect(skylineMarkup).toContain('#B91C1C'); // Ngói đất nung biệt thự
    expect(skylineMarkup).toContain('#166534'); // Tán cây đa tầng
  });

  it('DioramaMicroLife kết xuất xe buýt tí hon và ca-nô lướt sóng', () => {
    const microLifeMarkup = renderToStaticMarkup(React.createElement(DioramaMicroLife));
    expect(microLifeMarkup).toContain('#F59E0B'); // Xe buýt vàng tí hon
    expect(microLifeMarkup).toContain('#DC2626'); // Xe hơi đỏ
    expect(microLifeMarkup).toContain('#F8FAFC'); // Ca-nô trắng
  });

  it('DioramaFerrisWheel kết xuất vòng đu quay, chân trụ A và cabin sắc màu', () => {
    const ferrisMarkup = renderToStaticMarkup(React.createElement(DioramaFerrisWheel));
    expect(ferrisMarkup).toContain('data-testid="diorama-ferris-wheel"');
    expect(ferrisMarkup).toContain('#EF4444'); // Cabin đỏ
    expect(ferrisMarkup).toContain('#F59E0B'); // Trục quay hoàng kim
    expect(ferrisMarkup).toContain('#F8FAFC'); // Vành bánh xe
  });

  it('DioramaContainerPort kết xuất cần cẩu giàn gantry và bãi container đa sắc', () => {
    const portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    expect(portMarkup).toContain('data-testid="diorama-container-port"');
    expect(portMarkup).toContain('#EA580C'); // Cần cẩu giàn màu cam
    expect(portMarkup).toContain('#0284C7'); // Container xanh Maersk
    expect(portMarkup).toContain('#15803D'); // Container xanh lá Evergreen
    expect(portMarkup).toContain('#FACC15'); // Vạch an toàn bến cảng
  });

  it('DioramaHeritageDistrict kết xuất Chợ Bến Thành tháp đồng hồ và Nhà Thờ Đức Bà gạch đỏ', () => {
    const heritageMarkup = renderToStaticMarkup(React.createElement(DioramaHeritageDistrict));
    expect(heritageMarkup).toContain('data-testid="diorama-heritage-district"');
    expect(heritageMarkup).toContain('#FDE047'); // Chân tháp đồng hồ Bến Thành
    expect(heritageMarkup).toContain('#B45309'); // Tường gạch nung đỏ Nhà Thờ
    expect(heritageMarkup).toContain('#0284C7'); // Kính màu cửa sổ hoa hồng
    expect(heritageMarkup).toContain('#F59E0B'); // Thánh giá đồng thau
  });
});

describe('[TC-MCD01.2/MSS] Quảng Trường Trung Tâm Chìm (Central Sunken Plaza - DiceTray)', () => {
  it('DiceTray render bậc đá cẩm thạch giật cấp và họa tiết la bàn hoàng kim', () => {
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).toContain('data-testid="dice-tray"');
    expect(trayMarkup).toContain('#94A3B8'); // Bậc đá cẩm thạch tầng 1
    expect(trayMarkup).toContain('#CBD5E1'); // Bậc đá cẩm thạch tầng 2
    expect(trayMarkup).toContain('#064E3B'); // Sàn nỉ xanh hoàng gia
    expect(trayMarkup).toContain('#F59E0B'); // Vòng la bàn khảm đồng
  });
});

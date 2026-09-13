import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  return {
    ...actual,
    Billboard: ({ children, ...props }: any) => React.createElement('billboard', props, children),
    Image: ({ scale, ...props }: any) =>
      React.createElement('drei-image', {
        ...props,
        scale: Array.isArray(scale) ? scale.join(',') : scale,
      }),
  };
});
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { LayeredDioramaTile, OwnershipMarkerInstances, StandeeBillboard } from '../../src/client/3d/board_tile';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { READY_TILES } from '../../src/client/assets/tile_assets';

describe('[TC-IMP33/MSS] Nhóm 1: Thẻ Sổ Đỏ (TitleDeedModal) — Diorama Art Showcase Banner', () => {
  beforeEach(() => {
    READY_TILES.clear();
  });

  afterEach(() => {
    READY_TILES.clear();
  });

  it('[TC-IMP33/MSS-01] TitleDeedModal kết xuất thẻ img với URL WebP cho ô 01 (Cần Thơ) khi nằm trong READY_TILES', () => {
    READY_TILES.add(1);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('src="/assets/tiles/tile_01.webp"');
  });

  it('[TC-IMP33/MSS-02] TitleDeedModal kết xuất thẻ img với URL WebP cho ô 39 (Sài Gòn) khi nằm trong READY_TILES', () => {
    READY_TILES.add(39);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 39,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('src="/assets/tiles/tile_39.webp"');
  });

  it('[TC-IMP33/MSS-03] Thẻ img của Diorama Banner mang thuộc tính alt khớp tên địa danh', () => {
    READY_TILES.add(1);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('alt="Cần Thơ (Cái Răng)"');
  });

  it('[TC-IMP33/MSS-04] Khung Diorama Art Banner mang phong cách xúc giác với nền kính tối và viền kim loại mảnh', () => {
    READY_TILES.add(1);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('bg-slate-950/60');
    expect(html).toContain('border-amber-400/25');
  });

  it('[TC-IMP33/MSS-05] Khung Diorama Art Banner áp dụng chiều cao xúc giác responsive h-32 sm:h-36', () => {
    READY_TILES.add(1);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('h-32');
    expect(html).toContain('sm:h-36');
  });

  it('[TC-IMP33/MSS-06] Ảnh Diorama áp dụng đổ bóng nổi drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]', () => {
    READY_TILES.add(1);
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]');
  });

  it('[TC-IMP33/MSS-07] TitleDeedModal hiển thị fallback an toàn khi ô không nằm trong READY_TILES', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('data-testid="diorama-fallback"');
    expect(html).not.toContain('<img');
  });

  it('[TC-IMP33/MSS-08] Fallback an toàn cho ô Hạ tầng giao thông hiển thị icon văn hóa phù hợp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 5,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('data-testid="diorama-fallback"');
    expect(html).toContain('🚊');
  });

  it('[TC-IMP33/MSS-08b] Fallback an toàn cho ô Tiện ích quốc gia hiển thị biểu tượng ⚡ và tiêu đề Tiện Ích Quốc Gia', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 12,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('data-testid="diorama-fallback"');
    expect(html).toContain('⚡');
    expect(html).toContain('Tiện Ích Quốc Gia');
  });

  it('[TC-IMP33/MSS-08c] Fallback an toàn cho ô Di sản BĐS thông thường hiển thị biểu tượng 🏛️', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('data-testid="diorama-fallback"');
    expect(html).toContain('🏛️');
    expect(html).toContain('Di Sản &amp; Bất Động Sản');
  });

  it('[TC-IMP33/MSS-08d] TitleDeedModal xử lý an toàn không văng lỗi khi chuyển đổi ô không có Sổ Đỏ (Rule of Hooks defense)', () => {
    const htmlInvalid = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 0, // GO tile - không có Sổ Đỏ
        canBuy: false,
        isOwned: false,
      })
    );
    expect(htmlInvalid).toContain('Không tìm thấy thông tin Sổ Đỏ cho ô #0');
  });
});

describe('[TC-IMP33/MSS] Nhóm 2: Ô Hạ Tầng Cố Định (board_tile.tsx) — Kích Hoạt StandeeBillboard', () => {
  const INFRASTRUCTURE_INDICES = [5, 12, 15, 25, 28, 35] as const;

  beforeEach(() => {
    READY_TILES.clear();
  });

  afterEach(() => {
    READY_TILES.clear();
  });

  it.each(INFRASTRUCTURE_INDICES)(
    '[TC-IMP33/MSS-09.%i] Ô hạ tầng cố định #%i kích hoạt StandeeBillboard khi có trong READY_TILES',
    (cellIndex) => {
      READY_TILES.add(cellIndex);
      const cell = BOARD_CONFIG[cellIndex]!;
      const html = renderToStaticMarkup(
        React.createElement(LayeredDioramaTile, {
          cell,
          position: [0, 0, 0],
          currentLevel: 0,
          isCornerTile: false,
        })
      );
      expect(html).toContain(`url="/assets/tiles/tile_${String(cellIndex).padStart(2, '0')}.webp"`);
    }
  );

  it('[TC-IMP33/MSS-10] Ô phi hạ tầng phi kinh tế (như GO #0) không kích hoạt StandeeBillboard', () => {
    READY_TILES.add(0);
    const cell = BOARD_CONFIG[0]!;
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      })
    );
    expect(html).not.toContain('url="/assets/tiles/tile_00.webp"');
  });

  it('[TC-IMP33/MSS-11] StandeeBillboard hạ tầng cố định áp dụng tỷ lệ thu nhỏ thanh thoát scale 0.85 (hoặc 0.78 theo IMP-35)', () => {
    READY_TILES.add(5);
    const cell = BOARD_CONFIG[5]!;
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    expect(html).toMatch(/scale="(?:0\.85,0\.85|0\.78,0\.78)"/);
  });

  it('[TC-IMP33/MSS-12] StandeeBillboard hạ tầng cố định hạ thấp cao độ position y=0.45 để không che chữ', () => {
    READY_TILES.add(5);
    const cell = BOARD_CONFIG[5]!;
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: false,
      })
    );
    expect(html).toMatch(/position="0,0\.45,(?:0|0\.58)"/);
  });

  it('[TC-IMP33/MSS-12b] StandeeBillboard phòng vệ an toàn không văng ngoại lệ khi nhận ô phi tài sản kinh tế', () => {
    expect(() => {
      renderToStaticMarkup(
        React.createElement(StandeeBillboard, {
          cellIndex: 0,
        })
      );
    }).not.toThrow();
  });
});

describe('[TC-IMP33/MSS] Nhóm 3: Cọc Cờ Sở Hữu (OwnershipMarkerInstances) — Chỉ Dấu Cấp Độ C0..C3', () => {
  it('[TC-IMP33/MSS-13] Cấp độ C0 (level=0) không kết xuất vòng đai phân cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 0,
      })
    );
    expect(html).not.toContain('name="TierIndicatorRings"');
  });

  it('[TC-IMP33/MSS-14] Cấp độ C1 (level=1) kết xuất đúng 1 vòng đai kim loại chỉ thị cấp độ', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 1,
      })
    );
    expect(html).toContain('name="TierIndicatorRings"');
    expect(html).toContain('name="TierRing_1"');
    expect(html).not.toContain('name="TierRing_2"');
  });

  it('[TC-IMP33/MSS-15] Cấp độ C2 (level=2) kết xuất đúng 2 vòng đai kim loại chỉ thị cấp độ', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 2,
      })
    );
    expect(html).toContain('name="TierRing_1"');
    expect(html).toContain('name="TierRing_2"');
    expect(html).not.toContain('name="TierRing_3"');
  });

  it('[TC-IMP33/MSS-16] Cấp độ C3 (level=3) kết xuất đủ 3 vòng đai kim loại hoàng kim', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 3,
      })
    );
    expect(html).toContain('name="TierRing_1"');
    expect(html).toContain('name="TierRing_2"');
    expect(html).toContain('name="TierRing_3"');
  });

  it('[TC-IMP33/MSS-17] Vòng đai cấp độ mang vật liệu kim loại ánh vàng metalness 0.9 và màu hoàng kim #F59E0B', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 1,
      })
    );
    expect(html).toContain('color="#F59E0B"');
    expect(html).toContain('metalness="0.9"');
  });

  it('[TC-IMP33/MSS-18] LayeredDioramaTile chuyển prop currentLevel tới OwnershipMarkerInstances', () => {
    const cell = BOARD_CONFIG[1]!; // Property cell
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell,
        position: [0, 0, 0],
        currentLevel: 2,
        isCornerTile: false,
      })
    );
    expect(html).toContain('name="TierRing_1"');
    expect(html).toContain('name="TierRing_2"');
  });

  it('[TC-IMP33/MSS-19] OwnershipMarkerInstances kẹp chặt ngưỡng an toàn cấp độ (level > 3 tối đa 3 vòng đai)', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: 4,
      })
    );
    expect(html).toContain('name="TierRing_3"');
    expect(html).not.toContain('name="TierRing_4"');
  });

  it('[TC-IMP33/MSS-20] OwnershipMarkerInstances xử lý an toàn mức cấp độ âm (level < 0 không có vòng đai)', () => {
    const html = renderToStaticMarkup(
      React.createElement(OwnershipMarkerInstances, {
        ownerColor: '#DC2626',
        level: -1,
      })
    );
    expect(html).not.toContain('name="TierIndicatorRings"');
  });
});

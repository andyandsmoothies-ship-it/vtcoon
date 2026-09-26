// [TC-IMP140/MSS] Test Suite IMP-140: Tối Ưu Tải Ảnh Nền BĐS & Đại Tu UI/UX Thẻ Sổ Đỏ (Title Deed Card Overhaul)
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import * as tileAssetsModule from '../../src/client/assets/tile_assets';
import {
  preloadTileAssets,
  READY_TILES,
} from '../../src/client/assets/tile_assets';
import { MarketCardId } from '../../src/domain/event_card_types';

interface MockImageInstance {
  src: string;
  crossOrigin: string;
}

describe('[UC-IMP140] Title Deed UI/UX & Asset Preloading Contract Tests', () => {
  let createdImages: MockImageInstance[] = [];
  const originalWindow = (globalThis as any).window;
  const originalImage = (globalThis as any).Image;

  class SpyImage {
    src = '';
    crossOrigin = '';
    constructor() {
      createdImages.push(this);
    }
  }

  beforeEach(() => {
    createdImages = [];
    (globalThis as any).window = {};
    (globalThis as any).Image = SpyImage;
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).Image = originalImage;
  });

  it('[TC-140.01/MSS][UC-IMP140][Facet-4/ErrorDefense] preloadBaseTileImages tự động bỏ qua khi ở môi trường test runner (isTestEnv = true), không khởi tạo Image ảo', () => {
    const fn = (tileAssetsModule as Record<string, any>).preloadBaseTileImages;
    expect(typeof fn).toBe('function');
    fn();
    expect(createdImages).toHaveLength(0);
  });

  it('[TC-140.02/MSS][UC-IMP140][Facet-2/Reactivity] preloadBaseTileImages(true) kích hoạt nạp đúng 28 ảnh base tiles khi force = true (mock globalThis.Image spy)', () => {
    const fn = (tileAssetsModule as Record<string, any>).preloadBaseTileImages;
    expect(typeof fn).toBe('function');
    fn(true);
    expect(createdImages).toHaveLength(28);
    expect(createdImages[0]?.src).toContain('/assets/tiles/tile_01.webp');
  });

  it('[TC-140.03/MSS][UC-IMP140][Facet-1/Boundary] preloadTileAssets() giữ nguyên vẹn 112 URLs và không sinh side-effect new Image()', () => {
    const urls = preloadTileAssets();
    expect(urls).toHaveLength(112);
    expect(createdImages).toHaveLength(0);
  });

  it('[TC-140.04/MSS][UC-IMP140][Facet-2/Reactivity] TitleDeedModal / TitleDeedArtShowcase chứa thuộc tính loading="eager" và decoding="async"', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('loading="eager"');
    expect(html).toContain('decoding="async"');
  });

  it('[TC-140.05/MSS][UC-IMP140][Facet-1/Boundary] TitleDeedArtShowcase kết xuất đầy đủ thẻ <img> kèm drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] trong SSR', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('data-testid="diorama-art-banner"');
    expect(html).toContain('drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]');
    expect(html).toContain('<img');
  });

  it('[TC-140.06/MSS][UC-IMP140][Facet-2/Reactivity] TitleDeedArtShowcase chứa Shimmer Skeleton underlay (data-testid="art-shimmer-skeleton") cho trạng thái nạp ảnh', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('data-testid="art-shimmer-skeleton"');
  });

  it('[TC-140.07/MSS][UC-IMP140][Facet-4/ErrorDefense] TitleDeedArtShowcase hiển thị fallback diorama an toàn (data-testid="diorama-fallback") khi không có ảnh', () => {
    READY_TILES.delete(1);
    try {
      const html = renderToStaticMarkup(
        React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
      );
      expect(html).toContain('data-testid="diorama-fallback"');
      expect(html).toContain('🏛️');
    } finally {
      READY_TILES.add(1);
    }
  });

  it('[TC-140.08/MSS][UC-IMP140][Facet-1/Boundary] Nút đóng Sổ Đỏ bảo toàn min-w-[48px] min-h-[48px], aria-label="Đóng Sổ Đỏ", và ký tự ✕', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: () => {},
      })
    );
    expect(html).toContain('aria-label="Đóng Sổ Đỏ"');
    expect(html).toContain('min-w-[48px] min-h-[48px]');
    expect(html).toContain('✕');
  });

  it('[TC-140.09/MSS][UC-IMP140][Facet-2/Reactivity] Nút đóng Sổ Đỏ sử dụng top-1/2 -translate-y-1/2 căn giữa theo phương thẳng đứng', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: () => {},
      })
    );
    expect(html).toContain('top-1/2 -translate-y-1/2');
  });

  it('[TC-140.10/MSS][UC-IMP140][Facet-1/Boundary] Header ruy-băng bảo tồn đầy đủ class px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a]');
  });

  it('[TC-140.11/MSS][UC-IMP140][Facet-1/Boundary] Thân modal bảo tồn flex-1 min-h-0 overflow-y-auto pr-1 cho phép cuộn mượt mà trên màn hình nhỏ', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('flex-1 min-h-0 overflow-y-auto pr-1');
  });

  it('[TC-140.12/MSS][UC-IMP140][Facet-1/Boundary] Hiển thị chính xác giá niêm yết và giá trị thế chấp với format tiền tệ VNĐ trong pill container', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('Giá niêm yết');
    expect(html).toContain('600');
    expect(html).toContain('300');
  });

  it('[TC-140.13/MSS][UC-IMP140][Facet-2/Reactivity] Hiển thị biểu phí C0–C3 với highlight cấp công trình hiện tại hoặc x2 Độc Quyền', () => {
    const monopolyHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, hasMonopoly: true, canBuy: true, isOwned: false })
    );
    expect(monopolyHtml).toContain('x2 ĐỘC QUYỀN');

    const levelHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, currentLevel: 2, isOwned: true, isOwner: true })
    );
    expect(levelHtml).toContain('C2');
    expect(levelHtml).toContain('Khách Sạn');
  });

  it('[TC-140.14/MSS][UC-IMP140][Facet-1/Boundary] Hiển thị biểu phí 4 Ga vận tải cho ô Railroad (cellIndex: 5, 15, 25, 35)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 5, canBuy: true, isOwned: false })
    );
    expect(html).toContain('Hạ Tầng Giao Thông');
    expect(html).toContain('Biểu Phí Theo Số Ga Sở Hữu');
    expect(html).toContain('4 Ga');
  });

  it('[TC-140.15/MSS][UC-IMP140][Facet-1/Boundary] Hiển thị công thức cước dịch vụ xúc xắc cho ô Utility (cellIndex: 12, 28)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 12, canBuy: true, isOwned: false })
    );
    expect(html).toContain('Tiện Ích Quốc Gia');
    expect(html).toContain('4× điểm xúc xắc');
  });

  it('[TC-140.16/MSS][UC-IMP140][Facet-1/Boundary] Nút Mua BĐS và Bỏ Qua bảo toàn touch target min-h-[48px], active:translate-y-[3px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('min-h-[48px]');
    expect(html).toContain('active:translate-y-[3px]');
    expect(html).toContain('Mua BĐS');
    expect(html).toContain('Bỏ Qua');
  });

  it('[TC-140.17/MSS][UC-IMP140][Facet-2/Reactivity] Trạng thái đã sở hữu bảo toàn các nút Nâng Cấp, Hạ Cấp, Thế Chấp, Giải Chấp', () => {
    const ownerHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        currentLevel: 1,
        upgradeCost: 450,
        onUpgrade: () => {},
        onDowngrade: () => {},
        onMortgage: () => {},
      })
    );
    expect(ownerHtml).toContain('Nâng Cấp');
    expect(ownerHtml).toContain('Hạ Cấp');
    expect(ownerHtml).toContain('Thế Chấp');

    const mortgagedHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: true,
        onRedeem: () => {},
      })
    );
    expect(mortgagedHtml).toContain('Giải Chấp');
  });

  it('[TC-140.18/MSS][UC-IMP140][Facet-3/Disposal] Bảo tồn con dấu Sổ Đỏ chính chủ ownership-certificate-seal và badge thị trường market-modifier-badge', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        ownerName: 'Nhà Đầu Tư Hải Phòng',
        activeModifiers: [
          {
            type: MarketCardId.MC_PEAK_TOURISM,
            remainingRounds: 2,
            affectedCells: [1],
          },
        ],
      })
    );
    expect(html).toContain('data-testid="ownership-certificate-seal"');
    expect(html).toContain('SỔ ĐỎ CHÍNH CHỦ');
    expect(html).toContain('data-testid="market-modifier-badge"');
  });

  it('[TC-140.19/MSS][UC-IMP140][Facet-3/Disposal] Trạng thái carousel sổ đỏ giải phóng an toàn khi chỉ sở hữu 1 tài sản hoặc không phải chính chủ', () => {
    const singlePropertyHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        ownedProperties: [1],
      })
    );
    expect(singlePropertyHtml).not.toContain('data-testid="title-deed-carousel"');

    const notOwnerHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: false,
        ownedProperties: [1, 3],
      })
    );
    expect(notOwnerHtml).not.toContain('data-testid="title-deed-carousel"');
  });

  it('[TC-140.20/MSS][UC-IMP140][Facet-4/ErrorDefense] Xử lý an toàn khi cellIndex không tồn tại hoặc thị trường đóng băng giao dịch MC_FREEZE_TRADE', () => {
    const invalidHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 999 })
    );
    expect(invalidHtml).toContain('Không tìm thấy thông tin Sổ Đỏ cho ô #999');

    const frozenHtml = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        isTradeFrozen: true,
      })
    );
    expect(frozenHtml).toContain('Thị Trường Đóng Băng');
  });
});

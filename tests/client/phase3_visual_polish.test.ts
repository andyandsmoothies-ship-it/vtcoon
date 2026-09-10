// [TC-P3/MSS] Test Suite Giai Đoạn 3: Dọn Sạch Không Gian 3D, Triệt Tiêu 404 Console & Polish Giao Diện Sổ Đỏ
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import {
  calculateStandeeElevation,
  standeeWebpCache,
  clearStandeeWebpCache,
  loadStandeeWebp,
  useSmartStandeeTexture,
} from '../../src/client/3d/board_tile';
import { getStandeeTexture } from '../../src/client/3d/tile_texture_generator';
import { preloadTileAssets, getAllTileAssetUrls } from '../../src/client/assets/tile_assets';
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';

describe('[TC-P3.1/MSS] TitleDeedModal Layout Polish & Chống Tràn Màn Hình Mobile', () => {
  it('Thẻ bao ngoài container có max-h-[90vh] md:max-h-[85vh] và flex flex-col', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('max-h-[90vh]');
    expect(html).toContain('md:max-h-[85vh]');
    expect(html).toContain('flex flex-col');
    expect(html).toContain('overflow-hidden');
    expect(html).toContain('data-testid="title-deed-modal"');
  });

  it('Thẻ header có pr-14 pl-14 chống đè chữ lên nút đóng ✕ và nút đóng đạt touch target 48px', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: () => {},
      })
    );
    expect(html).toContain('pr-14 pl-14');
    expect(html).toContain('shrink-0');
    expect(html).toContain('break-words');
    expect(html).toContain('aria-label="Đóng Sổ Đỏ"');
    expect(html).toContain('min-w-[48px] min-h-[48px]');
    expect(html).toContain('✕');
  });

  it('Phần thân chi tiết có flex-1 min-h-0 overflow-y-auto pr-1 cho phép cuộn độc lập', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('flex-1 min-h-0 overflow-y-auto pr-1');
  });

  it('Các nút hành động Mua BĐS và Bỏ Qua đạt chuẩn touch target min-h-[48px] và whitespace-nowrap', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('Mua BĐS');
    expect(html).toContain('Bỏ Qua');
    expect(html).toContain('min-h-[48px] whitespace-nowrap');
  });

  it('Trạng thái đã sở hữu: nút Giải Chấp, Thế Chấp và Đóng đều có min-h-[48px] và whitespace-nowrap', () => {
    const htmlOwned = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: true,
        ownerName: 'Đại Gia Sài Gòn',
        onMortgage: () => {},
        onRedeem: () => {},
        onClose: () => {},
      })
    );
    expect(htmlOwned).toContain('Giải Chấp');
    expect(htmlOwned).toContain('Đóng');
    expect(htmlOwned).toContain('✓ Đã Sở Hữu (Đại Gia Sài Gòn)');
    expect(htmlOwned).toContain('min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs bg-amber-600');
    expect(htmlOwned).toContain('min-h-[48px] whitespace-nowrap px-4 py-2 rounded-xl font-bold text-slate-300');
  });

  it('Nút Giải Chấp hiển thị khi có onRedeem mà không cần truyền onMortgage', () => {
    const htmlRedeemOnly = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: true,
        onRedeem: () => {},
        onClose: () => {},
      })
    );
    expect(htmlRedeemOnly).toContain('Giải Chấp');
  });

  it('Modal dự phòng cho ô không phải BĐS (cellIndex: 0) có nút Đóng đạt min-h-[48px]', () => {
    const htmlFallback = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 0, onClose: () => {} })
    );
    expect(htmlFallback).toContain('Không tìm thấy thông tin Sổ Đỏ cho ô #0');
    expect(htmlFallback).toContain('min-h-[48px]');
  });

  it('Địa danh tên dài không bị tràn khung hay vỡ giao diện', () => {
    // Ô 39: TP.HCM (Quận 1 - Nguyễn Huệ)
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 39, canBuy: true, isOwned: false })
    );
    expect(html).toContain('TP.HCM (Quận 1 - Nguyễn Huệ)');
    expect(html).toContain('pr-14 pl-14');
    expect(html).toContain('break-words');
  });
});

describe('[TC-P3.2/MSS] StandeeBillboard 3D Mesh Polish — Gỡ Tấm Biển Trắng Che Bàn Cờ', () => {
  const boardTilePath = path.resolve(process.cwd(), 'src', 'client', '3d', 'board_tile.tsx');
  const boardTileSource = fs.readFileSync(boardTilePath, 'utf-8');

  it('Không còn chứa thẻ mesh nền trắng đục (#FFFFFF) che khuất bàn cờ 3D', () => {
    // Tấm biển cũ: <mesh castShadow><planeGeometry args={[1.0, 1.05]} /><meshBasicMaterial color="#FFFFFF" /></mesh>
    expect(boardTileSource).not.toContain('<meshBasicMaterial color="#FFFFFF" />');
    expect(boardTileSource).not.toContain('planeGeometry args={[1.0, 1.05]}');
  });

  it('Mesh Standee icon được tinh chỉnh kích thước 0.7 x 0.75 thanh thoát', () => {
    expect(boardTileSource).toContain('planeGeometry args={[0.7, 0.75]}');
  });

  it('Standee icon sử dụng meshStandardMaterial với transparent và alphaTest={0.05}', () => {
    expect(boardTileSource).toContain('transparent');
    expect(boardTileSource).toContain('alphaTest={0.05}');
    expect(boardTileSource).toContain('roughness={0.25}');
  });

  it('Hoạt ảnh nhấp nhô điều hòa calculateStandeeElevation vẫn được giữ nguyên vẹn', () => {
    const y0 = calculateStandeeElevation(0, { omega: 2.0, amplitude: 0.04, baseHeight: 0.72 });
    expect(y0).toBeCloseTo(0.72, 4);
    const yMax = calculateStandeeElevation(Math.PI / 4, { omega: 2.0, amplitude: 0.04, baseHeight: 0.72 });
    expect(yMax).toBeCloseTo(0.76, 4);
  });
});

describe('[TC-P3.3/MSS] Triệt Tiêu 36 Lỗi 404 Console & Standee Procedural Generation', () => {
  let createdImages: any[] = [];
  const originalWindow = (globalThis as any).window;
  const originalImage = (globalThis as any).Image;

  class SpyImage {
    src = '';
    crossOrigin = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor() {
      createdImages.push(this);
    }
  }

  beforeEach(() => {
    clearStandeeWebpCache();
    createdImages = [];
    (globalThis as any).window = {};
    (globalThis as any).Image = SpyImage;
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).Image = originalImage;
  });

  it('preloadTileAssets không khởi tạo 112 thẻ new Image() ảo gây 404 mạng', () => {
    const urls = preloadTileAssets();
    expect(urls).toHaveLength(112);
    // Số thẻ Image được tạo phải là 0
    expect(createdImages).toHaveLength(0);
    expect(urls).toEqual(getAllTileAssetUrls());
  });

  it('loadStandeeWebp giải quyết an toàn tức thời trả về null mà không gọi new Image() ngoại mạng', () => {
    const onResolve = vi.fn();
    loadStandeeWebp(10, onResolve);
    // Không có instance Image nào được tạo ra
    expect(createdImages).toHaveLength(0);
    expect(onResolve).toHaveBeenCalledWith(null);
    expect(standeeWebpCache.get(10)).toBeNull();
  });

  it('getStandeeTexture tạo texture procedural Canvas 2D độ nét cao mà không gọi new Image()', () => {
    // Mock document & canvas cho môi trường Node
    const mockCtx = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      textBaseline: '',
      beginPath: vi.fn(),
      roundRect: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      quadraticCurveTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => mockCtx),
    };

    (globalThis as any).document = {
      createElement: vi.fn((tag: string) => (tag === 'canvas' ? mockCanvas : {})),
    };

    const texture = getStandeeTexture(1);
    expect(texture).toBeInstanceOf(CanvasTexture);
    expect(texture?.colorSpace).toBe(SRGBColorSpace);

    // Không có bất kỳ instance Image nào được tạo
    expect(createdImages).toHaveLength(0);

    // useSmartStandeeTexture trả về Texture này trong React component
    let hookTexture: Texture | null = null;
    function TestHookComponent(): React.ReactElement | null {
      hookTexture = useSmartStandeeTexture(1);
      return null;
    }
    renderToStaticMarkup(React.createElement(TestHookComponent));
    expect(hookTexture).toBe(texture);
    expect(createdImages).toHaveLength(0);

    // Dọn dẹp mock document
    delete (globalThis as any).document;
  });

  it('Cache Standee hoạt động an toàn và không có side effects', () => {
    expect(standeeWebpCache.size).toBe(0);
    standeeWebpCache.set(99, null);
    expect(standeeWebpCache.get(99)).toBeNull();
    clearStandeeWebpCache();
    expect(standeeWebpCache.size).toBe(0);
  });
});

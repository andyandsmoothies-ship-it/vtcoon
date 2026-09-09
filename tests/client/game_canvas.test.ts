import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Texture, SRGBColorSpace } from 'three';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { cellPosition, GameCanvas } from '../../src/client/game_canvas';
import {
  loadStandeeWebp,
  standeeWebpCache,
  clearStandeeWebpCache,
  getStandeeWebpUrl,
} from '../../src/client/3d/board_tile';

describe('[UC-GAME-009/MSS] Game Canvas - Tien dieu kien va Cau truc', () => {
  it('BOARD_CONFIG co du 40 o de dung Canvas', () => {
    expect(BOARD_CONFIG).toHaveLength(40);
  });

  it('moi o co name khong rong de hien thi label', () => {
    for (const cell of BOARD_CONFIG) {
      expect(cell.name.length).toBeGreaterThan(0);
    }
  });

  it('cellPosition(0) tra ve tuple [number, number, number]', () => {
    const pos = cellPosition(0);
    expect(pos).toHaveLength(3);
    expect(typeof pos[0]).toBe('number');
    expect(typeof pos[1]).toBe('number');
    expect(typeof pos[2]).toBe('number');
  });

  it('cellPosition tinh vi tri hop le cho moi index 0-39', () => {
    for (let i = 0; i < 40; i++) {
      const pos = cellPosition(i);
      expect(pos).toHaveLength(3);
      expect(Number.isFinite(pos[0])).toBe(true);
      expect(Number.isFinite(pos[1])).toBe(true);
      expect(Number.isFinite(pos[2])).toBe(true);
    }
  });

  it('GameCanvas duoc export duoi dang React Functional Component', () => {
    expect(typeof GameCanvas).toBe('function');
  });
});

describe('[UI-S01/PBR] Smart Standee Asset Loader - Lifecycle & Resilient Fallback', () => {
  let createdImages: any[] = [];
  const originalWindow = (globalThis as any).window;
  const originalImage = (globalThis as any).Image;

  class MockImage {
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
    (globalThis as any).Image = MockImage;
  });

  afterEach(() => {
    (globalThis as any).window = originalWindow;
    (globalThis as any).Image = originalImage;
  });

  it('nạp ảnh WebP thành công: sinh Texture sRGB, bật needsUpdate và lưu cache', () => {
    const onResolve = vi.fn();
    loadStandeeWebp(1, onResolve);

    expect(createdImages).toHaveLength(1);
    const img = createdImages[0];
    expect(img.src).toBe(getStandeeWebpUrl(1));
    expect(img.crossOrigin).toBe('anonymous');

    // Kích hoạt onload
    img.onload();

    expect(onResolve).toHaveBeenCalledTimes(1);
    const firstCall = onResolve.mock.calls[0];
    expect(firstCall).toBeDefined();
    const loadedTexture = firstCall![0];
    expect(loadedTexture).toBeInstanceOf(Texture);
    expect((loadedTexture as Texture).version).toBeGreaterThan(0);
    expect((loadedTexture as Texture).colorSpace).toBe(SRGBColorSpace);
    expect(standeeWebpCache.get(1)).toBe(loadedTexture);
  });

  it('nạp ảnh WebP thất bại (404/error): fallback về null và lưu cache để tránh lặp request', () => {
    const onResolve = vi.fn();
    loadStandeeWebp(2, onResolve);

    expect(createdImages).toHaveLength(1);
    const img = createdImages[0];

    // Kích hoạt onerror
    img.onerror();

    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith(null);
    expect(standeeWebpCache.get(2)).toBeNull();
  });

  it('cache hit: trả về kết quả đồng bộ ngay lập tức và không tạo thêm instance Image mới', () => {
    const existingTex = new Texture();
    standeeWebpCache.set(5, existingTex);

    const onResolve = vi.fn();
    loadStandeeWebp(5, onResolve);

    expect(createdImages).toHaveLength(0);
    expect(onResolve).toHaveBeenCalledTimes(1);
    expect(onResolve).toHaveBeenCalledWith(existingTex);
  });

  it('hủy đăng ký khi unmount: không gọi callback nếu component unmount trước khi ảnh tải xong', () => {
    const onResolve = vi.fn();
    const cancel = loadStandeeWebp(7, onResolve);

    expect(createdImages).toHaveLength(1);
    const img = createdImages[0];

    // Component unmount
    cancel();

    // Image hoàn tất sau khi unmount
    img.onload();

    expect(onResolve).not.toHaveBeenCalled();
    // Cache vẫn được lưu an toàn cho lần mount tiếp theo
    expect(standeeWebpCache.get(7)).toBeInstanceOf(Texture);
  });
});
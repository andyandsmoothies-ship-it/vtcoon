// [UI-S01/MSS][IMP-186] Procedural Canvas Texture generator for 40 VTCoOn board tiles & Standees with Mobile LOD & Jetsam Defense
import { CanvasTexture, SRGBColorSpace, LinearFilter, LinearMipmapLinearFilter } from 'three';
import {
  TILE_METADATA_MAP,
  type TileMetadata,
} from './tile_texture_data';
import { drawIcon } from './tile_icons';
import { CORNER_DRAWERS, drawGoCorner } from './corner_tile_art';
import { isMobileHardware, isPhoneHardware, isTabletDevice } from './device_detect';
import {
  hasTileArt,
  getBannerTextColor,
  drawTileHeader,
  drawTileArt,
  drawFooter,
  drawPriceTrayFooter,
} from './tile_texture_drawers';

export { hasTileArt, getBannerTextColor, drawPriceTrayFooter };

const desktopTileTextureCache = new Map<number, CanvasTexture>();
const mobileTileTextureCache = new Map<number, CanvasTexture>();
const desktopStandeeTextureCache = new Map<number, CanvasTexture>();
const mobileStandeeTextureCache = new Map<number, CanvasTexture>();
const tileImageCache = new Map<number, HTMLImageElement>();

/**
 * Tạo Canvas Texture cho ô cờ thường với độ phân giải theo thiết bị (Desktop 1024x1360 vs Mobile 512x680)
 */
function createStandardTileTexture(
  index: number,
  meta: TileMetadata,
  isMobile = isMobileHardware(),
): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const width = isMobile ? 512 : 1024;
  const height = isMobile ? 680 : 1360;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(isMobile ? 2 : 4, isMobile ? 2 : 4);

  drawTileHeader(ctx, meta, index);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = isMobile ? 2 : 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  drawTileArt(ctx, index, meta, texture, tileImageCache);
  drawFooter(ctx, meta, index);

  texture.needsUpdate = true;
  return texture;
}

/**
 * Tạo Canvas Texture cho 4 ô góc đặc biệt (Desktop 1024x1024 vs Mobile 512x512)
 */
function createCornerTileTexture(index: number, isMobile = isMobileHardware()): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const size = isMobile ? 512 : 1024;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(size / 384, size / 384);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const drawer = CORNER_DRAWERS[index] ?? drawGoCorner;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = isMobile ? 2 : 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
    const cachedImg = tileImageCache.get(index);
    if (!cachedImg) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `/assets/tiles/tile_${String(index).padStart(2, '0')}.webp`;
      tileImageCache.set(index, img);
      drawer(ctx);
      img.onload = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, size, size);
        ctx.scale(size / 384, size / 384);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        drawer(ctx, img);
        ctx.restore();
        texture.needsUpdate = true;
      };
      img.onerror = () => {
        drawer(ctx);
      };
    } else if (cachedImg.complete && cachedImg.naturalWidth > 0) {
      drawer(ctx, cachedImg);
    } else {
      drawer(ctx);
    }
  } else {
    drawer(ctx);
  }

  texture.needsUpdate = true;
  return texture;
}

/**
 * Lấy hoặc sinh mới Canvas Texture cho 40 ô cờ với phân tách bộ đệm Desktop / Mobile
 */
export function getTileTexture(index: number, isMobile = isPhoneHardware()): CanvasTexture | null {
  const useMobile = isMobile && !isTabletDevice();
  const cache = useMobile ? mobileTileTextureCache : desktopTileTextureCache;
  if (cache.has(index)) {
    return cache.get(index)!;
  }

  const isCorner = index === 0 || index === 10 || index === 20 || index === 30;
  const texture = isCorner
    ? createCornerTileTexture(index, useMobile)
    : createStandardTileTexture(
        index,
        TILE_METADATA_MAP[index] ?? {
          title: `Ô ${index}`,
          subtitle: '',
          bannerColor: '#64748B',
          category: 'BÀN CỜ',
          icon: 'default',
        },
        useMobile,
      );

  if (texture) {
    cache.set(index, texture);
  }
  return texture;
}

/**
 * Lấy hoặc sinh mới Canvas Texture 2.5D cho Standee Billboard (512 x 512)
 */
export function getStandeeTexture(index: number, isMobile = isPhoneHardware()): CanvasTexture | null {
  const useMobile = isMobile && !isTabletDevice();
  const cache = useMobile ? mobileStandeeTextureCache : desktopStandeeTextureCache;
  if (cache.has(index)) {
    return cache.get(index)!;
  }
  if (typeof document === 'undefined') return null;

  const meta = TILE_METADATA_MAP[index];
  if (!meta) return null;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(2, 2);

  // Vẽ biểu tượng văn hóa đặc trưng bản địa
  drawIcon(ctx, meta.icon, 128, 105, meta.bannerColor, 2.2);

  // Tên công trình / danh mục trên Standee
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.title, 128, 195);

  if (meta.subtitle) {
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(meta.subtitle, 128, 218);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = useMobile ? 2 : 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  cache.set(index, texture);
  return texture;
}

function disposeTextureMap(cache: Map<number, CanvasTexture>): void {
  for (const tex of cache.values()) {
    if (tex) {
      if (tex.image && typeof tex.image === 'object' && 'width' in tex.image) {
        (tex.image as HTMLCanvasElement).width = 0;
        (tex.image as HTMLCanvasElement).height = 0;
      }
      if (typeof tex.dispose === 'function') tex.dispose();
    }
  }
  cache.clear();
}

/**
 * Xóa cache texture cho môi trường test, WebGL context loss và hot-reload
 */
export function clearTileTextureCache(): void {
  disposeTextureMap(desktopTileTextureCache);
  disposeTextureMap(mobileTileTextureCache);
  disposeTextureMap(desktopStandeeTextureCache);
  disposeTextureMap(mobileStandeeTextureCache);
  tileImageCache.clear();
}

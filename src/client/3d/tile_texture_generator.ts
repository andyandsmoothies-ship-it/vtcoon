// [UI-S01/MSS] High-definition procedural Canvas Texture generator for 40 VTCoOn board tiles & Standees
import { CanvasTexture, SRGBColorSpace, LinearFilter, LinearMipmapLinearFilter } from 'three';
import {
  TILE_METADATA_MAP,
  formatPriceLabel,
  isPropertyTile,
  isInfrastructureTile,
  type TileMetadata,
} from './tile_texture_data';
import { drawIcon } from './tile_icons';
import { ALL_28_STAND_TILES } from '../assets/tile_assets';
import { CORNER_DRAWERS, drawGoCorner } from './corner_tile_art';

const tileTextureCache = new Map<number, CanvasTexture>();
const standeeTextureCache = new Map<number, CanvasTexture>();
const tileImageCache = new Map<number, HTMLImageElement>();

const SPECIAL_TILE_INDICES: readonly number[] = [0, 2, 4, 7, 10, 17, 20, 22, 30, 33, 36, 38] as const;

export function hasTileArt(index: number): boolean {
  return ALL_28_STAND_TILES.includes(index) || SPECIAL_TILE_INDICES.includes(index);
}

export function getBannerTextColor(bannerColor: string): string {
  const hex = bannerColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.85 ? '#090D1A' : '#FFFFFF';
}

function drawPropertyHeader(ctx: CanvasRenderingContext2D, meta: TileMetadata): void {
  ctx.fillStyle = meta.bannerColor;
  ctx.fillRect(0, 0, 256, 56);

  const textColor = getBannerTextColor(meta.bannerColor);
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3.0;
  ctx.strokeText(meta.title, 128, 28);
  ctx.fillStyle = textColor;
  ctx.fillText(meta.title, 128, 28);

  ctx.fillStyle = '#020617';
  ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.subtitle, 128, 74);
}

function drawNonPropertyHeader(ctx: CanvasRenderingContext2D, meta: TileMetadata, index: number): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.title, 128, 30);

  ctx.fillStyle = '#475569';
  ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.subtitle, 128, 62);

  if (isInfrastructureTile(index)) {
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 82);
    ctx.lineTo(224, 82);
    ctx.stroke();
  }
}

/**
 * Tạo Header cho ô cờ: 22 ô nhà đất có dải băng màu, 14 ô phi nhà đất nền ngà chữ than đen
 */
function drawTileHeader(ctx: CanvasRenderingContext2D, meta: TileMetadata, index: number): void {
  ctx.fillStyle = '#F3EEDF';
  ctx.fillRect(0, 0, 256, 340);

  if (isPropertyTile(index)) {
    drawPropertyHeader(ctx, meta);
  } else {
    drawNonPropertyHeader(ctx, meta, index);
  }
}

function drawSpecialCategoryFrame(ctx: CanvasRenderingContext2D, meta: TileMetadata): void {
  const styles: Record<string, { bg: string; stroke: string }> = {
    'VẬN MAY': { bg: '#FFF7ED', stroke: '#FDBA74' },
    'CƠ CHẾ': { bg: '#F0FDFA', stroke: '#5EEAD4' },
    'NGÂN SÁCH': { bg: '#FFF1F2', stroke: '#FDA4AF' },
    'TÀI CHÍNH': { bg: '#F0F9FF', stroke: '#7DD3FC' },
  };
  const config = meta.category ? styles[meta.category] : undefined;
  if (config) {
    ctx.fillStyle = config.bg;
    ctx.fillRect(10, 94, 236, 172);
    ctx.strokeStyle = config.stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 102, 220, 156);
    drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 2.0);
  } else {
    drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
  }
}

function drawTileArt(
  ctx: CanvasRenderingContext2D,
  index: number,
  meta: TileMetadata,
  texture: CanvasTexture
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(10, 94, 236, 172);
  ctx.clip();

  if (typeof window !== 'undefined' && typeof Image !== 'undefined' && hasTileArt(index)) {
    const cachedImg = tileImageCache.get(index);
    if (!cachedImg) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `/assets/tiles/tile_${String(index).padStart(2, '0')}.webp`;
      tileImageCache.set(index, img);
      img.onload = () => {
        ctx.save();
        ctx.fillStyle = '#F3EEDF';
        ctx.fillRect(10, 94, 236, 172);
        ctx.beginPath();
        ctx.rect(10, 94, 236, 172);
        ctx.clip();
        ctx.drawImage(img, 20, 97, 216, 166);
        ctx.restore();
        texture.needsUpdate = true;
      };
      img.onerror = () => {
        drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
      };
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    } else if (cachedImg.complete && cachedImg.naturalWidth > 0) {
      ctx.drawImage(cachedImg, 20, 97, 216, 166);
    } else {
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    }
  } else {
    drawSpecialCategoryFrame(ctx, meta);
  }
  ctx.restore();
}

function getActionBadgeTheme(category?: string): { bg: string; text: string } {
  switch (category) {
    case 'VẬN MAY': return { bg: '#EA580C', text: '#FFFFFF' };
    case 'CƠ CHẾ': return { bg: '#0D9488', text: '#FFFFFF' };
    case 'NGÂN SÁCH': return { bg: '#E11D48', text: '#FFFFFF' };
    case 'TÀI CHÍNH': return { bg: '#0284C7', text: '#FFFFFF' };
    default: return { bg: '#090D1A', text: '#FBBF24' };
  }
}

function drawActionBadgeFooter(ctx: CanvasRenderingContext2D, meta: TileMetadata): void {
  const actionText = meta.actionLabel ?? meta.priceLabel;
  if (!actionText) return;

  const theme = getActionBadgeTheme(meta.category);
  ctx.fillStyle = theme.bg;
  ctx.beginPath();
  ctx.roundRect(20, 274, 216, 50, 12);
  ctx.fill();

  ctx.fillStyle = theme.text;
  ctx.font = '900 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(actionText, 128, 300);
}

function drawPriceTrayFooter(ctx: CanvasRenderingContext2D, price?: number): void {
  const priceText = formatPriceLabel(price);
  if (!priceText) return;

  ctx.fillStyle = '#090D1A';
  ctx.beginPath();
  ctx.roundRect(22, 274, 212, 50, 12);
  ctx.fill();

  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(priceText, 128, 300);
}

function drawTileFooter(ctx: CanvasRenderingContext2D, meta: TileMetadata, index: number): void {
  if (isPropertyTile(index) || isInfrastructureTile(index)) {
    drawPriceTrayFooter(ctx, meta.price);
  } else {
    drawActionBadgeFooter(ctx, meta);
  }

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  ctx.strokeRect(2, 2, 252, 336);
}

/**
 * Tạo Canvas Texture cho ô cờ thường với độ phân giải cao HiDPI 4x (1024 x 1360)
 */
function createStandardTileTexture(index: number, meta: TileMetadata): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(4, 4);

  drawTileHeader(ctx, meta, index);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  drawTileArt(ctx, index, meta, texture);
  drawTileFooter(ctx, meta, index);

  texture.needsUpdate = true;
  return texture;
}



/**
 * Tạo Canvas Texture cho 4 ô góc đặc biệt với độ phân giải cao HiDPI (1024 x 1024)
 */
function createCornerTileTexture(index: number): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(1024 / 384, 1024 / 384);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const drawer = CORNER_DRAWERS[index] ?? drawGoCorner;

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 16;
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
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.scale(1024 / 384, 1024 / 384);
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
 * Lấy hoặc sinh mới Canvas Texture cho 40 ô cờ
 */
export function getTileTexture(index: number): CanvasTexture | null {
  if (tileTextureCache.has(index)) {
    return tileTextureCache.get(index)!;
  }

  const isCorner = index === 0 || index === 10 || index === 20 || index === 30;
  const texture = isCorner
    ? createCornerTileTexture(index)
    : createStandardTileTexture(index, TILE_METADATA_MAP[index] ?? {
        title: `Ô ${index}`,
        subtitle: '',
        bannerColor: '#64748B',
        category: 'BÀN CỜ',
        icon: 'default',
      });

  if (texture) {
    tileTextureCache.set(index, texture);
  }
  return texture;
}

/**
 * Lấy hoặc sinh mới Canvas Texture 2.5D cho Standee Billboard (512 x 512)
 */
export function getStandeeTexture(index: number): CanvasTexture | null {
  if (standeeTextureCache.has(index)) {
    return standeeTextureCache.get(index)!;
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
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  standeeTextureCache.set(index, texture);
  return texture;
}

/**
 * Xóa cache texture cho môi trường test và hot-reload
 */
export function clearTileTextureCache(): void {
  tileTextureCache.clear();
  standeeTextureCache.clear();
}

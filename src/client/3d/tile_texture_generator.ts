// [UI-S01/MSS] High-definition procedural Canvas Texture generator for 40 VTCoOn board tiles & Standees
import { CanvasTexture, SRGBColorSpace, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { TILE_METADATA_MAP, formatPriceLabel, type TileMetadata } from './tile_texture_data';
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
  return luminance > 0.6 ? '#090D1A' : '#FFFFFF';
}

/**
 * Tạo Canvas Texture cho ô cờ thường với độ phân giải cao HiDPI 4x (1024 x 1360)
 */
function createStandardTileTexture(index: number, meta: TileMetadata): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  // HiDPI 4x Resolution (1024 x 1360) cho chữ và vector sắc nét tuyệt đối
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Tỷ lệ tọa độ 4x giữ nguyên logic vẽ 256x340
  ctx.scale(4, 4);

  // 1. Nền giấy da ngà thượng hạng (Aged Parchment / Warm Ivory dịu mắt, chống lóa)
  ctx.fillStyle = '#F3EEDF';
  ctx.fillRect(0, 0, 256, 340);


  // 2. Dải màu nhận diện vùng
  ctx.fillStyle = meta.bannerColor;
  ctx.fillRect(0, 0, 256, 56);

  // 3. Tên tỉnh thành / địa danh chính nằm tại y = 28
  // Double Draw viền than đen đanh nét chống lóa mắt
  ctx.strokeStyle = '#050814';
  ctx.lineWidth = 3.5;
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeText(meta.title, 128, 28);
  ctx.fillStyle = getBannerTextColor(meta.bannerColor);
  ctx.fillText(meta.title, 128, 28);

  // Phụ đề (Địa danh chi tiết / Công trình) nằm tại y = 74
  ctx.fillStyle = '#020617';
  ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.subtitle, 128, 74);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  // 4. Biểu tượng di sản văn hóa / Tranh độc bản bản địa (Khung: y = 94..266, h = 172)
  ctx.save();
  ctx.beginPath();
  ctx.rect(10, 94, 236, 172);
  ctx.clip();

  if (typeof window !== 'undefined' && typeof Image !== 'undefined' && hasTileArt(index)) {
    const cachedImg = tileImageCache.get(index);
    const targetW = 216;
    const targetH = 166;
    const dx = (256 - targetW) / 2; // dx = 20
    const dy = 97;

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
        ctx.drawImage(img, dx, dy, targetW, targetH);
        ctx.restore();
        texture.needsUpdate = true;
      };
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    } else if (cachedImg.complete && cachedImg.naturalWidth > 0) {
      ctx.drawImage(cachedImg, dx, dy, targetW, targetH);
    } else {
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    }
  } else {
    // Nền nghệ thuật danh mục cho ô đặc biệt không phải BĐS
    if (meta.category === 'VẬN MAY') {
      // Ô Cơ Hội: Thẻ bài vận khí với viền cam hoàng gia
      ctx.fillStyle = '#FFF7ED';
      ctx.fillRect(10, 94, 236, 172);
      ctx.strokeStyle = '#FDBA74';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 102, 220, 156);
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 2.0);
    } else if (meta.category === 'CƠ CHẾ') {
      // Ô Thị Trường: Rương cơ chế trên nền ngọc bích dịu mắt
      ctx.fillStyle = '#F0FDFA';
      ctx.fillRect(10, 94, 236, 172);
      ctx.strokeStyle = '#5EEAD4';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 102, 220, 156);
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 2.0);
    } else if (meta.category === 'NGÂN SÁCH') {
      // Ô Lệ Phí Đất: Khung công chứng sắc son hành chính
      ctx.fillStyle = '#FFF1F2';
      ctx.fillRect(10, 94, 236, 172);
      ctx.strokeStyle = '#FDA4AF';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 102, 220, 156);
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 2.0);
    } else if (meta.category === 'TÀI CHÍNH') {
      // Ô Sàn HOSE: Sàn giao dịch sắc lam tài chính hiện đại
      ctx.fillStyle = '#F0F9FF';
      ctx.fillRect(10, 94, 236, 172);
      ctx.strokeStyle = '#7DD3FC';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 102, 220, 156);
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 2.0);
    } else {
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    }
  }
  ctx.restore();

  // 5. Khay giá niêm yết ở cạnh ngoài (y = 274..324, h = 50)
  const priceText = meta.priceLabel ?? formatPriceLabel(meta.price);
  if (priceText) {
    ctx.fillStyle = '#090D1A';
    ctx.beginPath();
    ctx.roundRect(22, 274, 212, 50, 12);
    ctx.fill();

    ctx.fillStyle = '#FBBF24';
    ctx.font = '900 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(priceText, 128, 300);
  }

  // Viền tinh tế bao quanh
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 5;
  ctx.strokeRect(2, 2, 252, 336);

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

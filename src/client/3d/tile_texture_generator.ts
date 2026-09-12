// [UI-S01/MSS] High-definition procedural Canvas Texture generator for 40 VTCoOn board tiles & Standees
import { CanvasTexture, SRGBColorSpace, LinearFilter, LinearMipmapLinearFilter } from 'three';
import { TILE_METADATA_MAP, formatPriceLabel, type TileMetadata } from './tile_texture_data';
import { drawIcon } from './tile_icons';

const tileTextureCache = new Map<number, CanvasTexture>();
const standeeTextureCache = new Map<number, CanvasTexture>();

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

  // 1. Nền giấy da ngà thượng hạng (Aged Parchment / Ivory Cream)
  ctx.fillStyle = '#E8DFCE';
  ctx.fillRect(0, 0, 256, 340);

  // 2. Dải màu nhận diện vùng (Top Banner - hướng tâm bàn cờ)
  ctx.fillStyle = meta.bannerColor;
  ctx.fillRect(0, 0, 256, 70);

  // Nhãn loại hình bất động sản / vùng miền
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.category, 128, 35);

  // 3. Tên tỉnh thành / địa danh chính (Tương phản cao tuyệt đối)
  ctx.fillStyle = '#090D1A';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.title, 128, 108);

  // Phụ đề (Địa danh chi tiết / Công trình)
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(meta.subtitle, 128, 138);

  // 4. Biểu tượng văn hóa bản địa ở trung tâm ô cờ
  drawIcon(ctx, meta.icon, 128, 205, meta.bannerColor, 1.25);

  // 5. Khay giá niêm yết ở cạnh ngoài
  const priceText = meta.priceLabel ?? formatPriceLabel(meta.price);
  if (priceText) {
    ctx.fillStyle = '#090D1A';
    ctx.beginPath();
    ctx.roundRect(22, 274, 212, 50, 12);
    ctx.fill();

    ctx.fillStyle = '#FBBF24';
    ctx.font = '900 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(priceText, 128, 300);
  }

  // Viền tinh tế bao quanh
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 336);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function drawGoCorner(ctx: CanvasRenderingContext2D): void {
  // Ô 0: Khởi Hành (GO)
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(0, 0, 384, 384);
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText('XUẤT PHÁT', 192, 60);

  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 42px sans-serif';
  ctx.fillText('KHỞI HÀNH (GO)', 192, 130);

  // Mũi tên vàng chỉ hướng đi (hướng sang trái dọc bàn cờ về phía Cần Thơ)
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.moveTo(274, 200);
  ctx.lineTo(144, 200);
  ctx.lineTo(144, 180);
  ctx.lineTo(100, 215);
  ctx.lineTo(144, 250);
  ctx.lineTo(144, 230);
  ctx.lineTo(274, 230);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#34D399';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('+2.000 Tr.', 192, 295);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('KHI QUA Ô', 192, 335);

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 376, 376);
}

function drawAuditCorner(ctx: CanvasRenderingContext2D): void {
  // Ô 10: Trạm Kiểm Toán & Thanh Tra
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(0, 0, 384, 384);
  ctx.fillStyle = '#FCA5A5';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('TRẠM KIỂM TOÁN', 192, 65);

  ctx.fillStyle = '#EF4444';
  ctx.font = '900 38px sans-serif';
  ctx.fillText('THANH TRA', 192, 140);

  drawIcon(ctx, 'shield', 192, 220, '#F87171', 2.0);

  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('VÀO THĂM / TẠM GIAM', 192, 310);

  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 376, 376);
}

function drawResortCorner(ctx: CanvasRenderingContext2D): void {
  // Ô 20: Nghỉ Dưỡng Miễn Phí
  ctx.fillStyle = '#064E3B';
  ctx.fillRect(0, 0, 384, 384);
  ctx.fillStyle = '#6EE7B7';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('BẾN DỪNG CHÂN', 192, 65);

  ctx.fillStyle = '#FDE68A';
  ctx.font = '900 38px sans-serif';
  ctx.fillText('NGHỈ DƯỠNG', 192, 140);

  drawIcon(ctx, 'sun', 192, 220, '#FCD34D', 2.0);

  ctx.fillStyle = '#A7F3D0';
  ctx.font = '900 24px sans-serif';
  ctx.fillText('MIỄN PHÍ DỪNG BƯỚC', 192, 310);

  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 376, 376);
}

function drawTaxOrderCorner(ctx: CanvasRenderingContext2D): void {
  // Ô 30: Lệnh Thanh Tra Thuế
  ctx.fillStyle = '#450A0A';
  ctx.fillRect(0, 0, 384, 384);
  ctx.fillStyle = '#FECACA';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('LỆNH TÒA ÁN', 192, 65);

  ctx.fillStyle = '#EF4444';
  ctx.font = '900 38px sans-serif';
  ctx.fillText('THANH TRA THUẾ', 192, 140);

  drawIcon(ctx, 'gavel', 192, 220, '#FCA5A5', 2.0);

  ctx.fillStyle = '#FCA5A5';
  ctx.font = '900 22px sans-serif';
  ctx.fillText('ĐẾN Ô KIỂM TOÁN (10)', 192, 310);

  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 8;
  ctx.strokeRect(4, 4, 376, 376);
}

const CORNER_DRAWERS: Readonly<Record<number, (ctx: CanvasRenderingContext2D) => void>> = {
  0: drawGoCorner,
  10: drawAuditCorner,
  20: drawResortCorner,
  30: drawTaxOrderCorner,
};

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
  drawer(ctx);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
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

  // Tên công trình / văn hóa dưới chân Standee
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.subtitle || meta.title, 128, 205);

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

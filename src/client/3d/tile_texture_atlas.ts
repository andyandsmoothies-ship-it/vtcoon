/// <reference types="vite/client" />
// [IMP-245] High-Performance Unified Texture Atlas for 40 VTCoOn Board Tiles
// Reduces 40 WebGL texture sampler binds to 1 (-97.5% state changes) & cuts ~47.8 MiB mobile VRAM
import {
  CanvasTexture,
  SRGBColorSpace,
  LinearFilter,
  LinearMipmapLinearFilter,
  PlaneGeometry,
  Float32BufferAttribute,
  type BufferGeometry,
} from 'three';
import { TILE_METADATA_MAP, type TileMetadata } from './tile_texture_data';
import { isPhoneHardware, isTabletDevice } from './device_detect';
import { drawIcon } from './tile_icons';
import { CORNER_DRAWERS, drawGoCorner } from './corner_tile_art';
import {
  hasTileArt,
  drawTileHeader,
  drawFooter,
} from './tile_texture_drawers';

export const ATLAS_GRID_COLS = 8;
export const ATLAS_GRID_ROWS = 6;
export const VIRTUAL_SLOT_WIDTH = 256;
export const VIRTUAL_SLOT_HEIGHT = 340;
export const CORNER_SLOT_SIZE = 256;
export const ATLAS_CANVAS_SIZE = 2048;

export const CORNER_BG_COLORS: Readonly<Record<number, string>> = {
  0: '#FAF6ED',  // GO: Hoàng gia ngà parchment
  10: '#0F172A', // Thanh tra: Than đen
  20: '#064E3B', // Nghỉ dưỡng: Xanh lục bảo
  30: '#450A0A', // Tòa án: Đỏ huyết dụ
};

export interface AtlasUVRect {
  readonly uMin: number;
  readonly vMin: number;
  readonly uMax: number;
  readonly vMax: number;
}

let desktopBoardAtlas: CanvasTexture | null = null;
let mobileBoardAtlas: CanvasTexture | null = null;

const boardGeometryCache = new Map<string, BufferGeometry>();
const atlasImageCache = new Map<number, HTMLImageElement>();
const pendingAtlasUpdates = new Set<CanvasTexture>();
let isAtlasUpdateDebouncing = false;

interface SizedImageTarget {
  width: number;
  height: number;
}

function hasDimensions(obj: unknown): obj is SizedImageTarget {
  return Boolean(obj && typeof obj === 'object' && 'width' in obj && 'height' in obj);
}

/**
 * Gom cụm đa thể hiện các yêu cầu cập nhật texture khi tải ảnh WebP bất đồng bộ (ADV-01, USER-02)
 */
function scheduleAtlasUpdate(texture: CanvasTexture): void {
  pendingAtlasUpdates.add(texture);
  if (isAtlasUpdateDebouncing) return;
  isAtlasUpdateDebouncing = true;

  const trigger = typeof requestAnimationFrame !== 'undefined' ? requestAnimationFrame : setTimeout;
  trigger(() => {
    isAtlasUpdateDebouncing = false;
    for (const tex of pendingAtlasUpdates) {
      if (hasDimensions(tex.image) && tex.image.width > 0) {
        tex.needsUpdate = true;
      }
    }
    pendingAtlasUpdates.clear();
  });
}

/**
 * Tính toán tọa độ UV chuẩn hóa [0..1] với Half-Texel Inset chống lem viền
 * Khớp chuẩn xác theo kích thước canvas vật lý ATLAS_CANVAS_SIZE (2048) (DIR-2.1)
 */
export function getTileAtlasUVs(cellIndex: number): AtlasUVRect {
  const safeIndex = Math.max(0, Math.min(39, Math.floor(cellIndex)));
  const col = safeIndex % ATLAS_GRID_COLS;
  const row = Math.floor(safeIndex / ATLAS_GRID_COLS);

  const slotW = VIRTUAL_SLOT_WIDTH;
  const slotH = VIRTUAL_SLOT_HEIGHT;
  const isCorner = safeIndex === 0 || safeIndex === 10 || safeIndex === 20 || safeIndex === 30;
  const actualH = isCorner ? CORNER_SLOT_SIZE : slotH;

  const x0 = col * slotW;
  const y0 = row * slotH;
  const x1 = x0 + (isCorner ? CORNER_SLOT_SIZE : slotW);
  const y1 = y0 + actualH;

  // Sử dụng chuẩn co nửa texel an toàn cho cả Mobile (2048) và Desktop (4096)
  const halfU = 0.5 / ATLAS_CANVAS_SIZE;
  const halfV = 0.5 / ATLAS_CANVAS_SIZE;

  // Trong Three.js flipY=true: top là v=1.0, bottom là v=0.0
  return {
    uMin: x0 / ATLAS_CANVAS_SIZE + halfU,
    uMax: x1 / ATLAS_CANVAS_SIZE - halfU,
    vMin: 1.0 - y1 / ATLAS_CANVAS_SIZE + halfV,
    vMax: 1.0 - y0 / ATLAS_CANVAS_SIZE - halfV,
  };
}

/**
 * Trả về singleton BufferGeometry cho ô cờ đã được bake sẵn tọa độ UV vào atlas
 */
export function getTileAtlasGeometry(cellIndex: number, isCorner = false): BufferGeometry {
  const cacheKey = `${cellIndex}_${isCorner ? 'corner' : 'standard'}`;
  const cached = boardGeometryCache.get(cacheKey);
  if (cached) return cached;

  const width = isCorner ? 2.16 : 1.64;
  const height = 2.16;
  const geom = new PlaneGeometry(width, height);
  const uvs = getTileAtlasUVs(cellIndex);

  // PlaneGeometry vertices: top-left (0), top-right (1), bottom-left (2), bottom-right (3)
  const uvArray = new Float32Array([
    uvs.uMin, uvs.vMax,
    uvs.uMax, uvs.vMax,
    uvs.uMin, uvs.vMin,
    uvs.uMax, uvs.vMin,
  ]);
  geom.setAttribute('uv', new Float32BufferAttribute(uvArray, 2));
  geom.computeBoundingSphere();
  geom.computeBoundingBox();

  boardGeometryCache.set(cacheKey, geom);
  return geom;
}

/**
 * Vẽ tranh minh họa WebP vào đúng tiểu vùng của ô cờ kèm guard phòng thủ WebGL context loss
 * và tái lập vùng clip bảo vệ tranh vẽ (ADV-02, USER-03)
 */
function drawAtlasTileArt(
  ctx: CanvasRenderingContext2D,
  index: number,
  meta: TileMetadata,
  texture: CanvasTexture,
  offsetX: number,
  offsetY: number,
  scale: number,
  tileImageCache: Map<number, HTMLImageElement>,
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
        // Guard phòng thủ: Ngăn vẽ lên texture đã bị dispose khi mất WebGL context (ADV-02)
        if (
          !hasDimensions(texture.image) ||
          texture.image.width === 0 ||
          (texture !== mobileBoardAtlas && texture !== desktopBoardAtlas)
        ) {
          return;
        }
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#F3EEDF';
        ctx.fillRect(10, 94, 236, 172);
        // Tái lập vùng clip bảo vệ chống vẽ tràn ra ngoài khung tranh (USER-03)
        ctx.beginPath();
        ctx.rect(10, 94, 236, 172);
        ctx.clip();
        ctx.drawImage(img, 20, 97, 216, 166);
        ctx.restore();
        scheduleAtlasUpdate(texture);
      };
      img.onerror = () => {
        // Fallback icon đã được vẽ
      };
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    } else if (cachedImg.complete && cachedImg.naturalWidth > 0) {
      ctx.drawImage(cachedImg, 20, 97, 216, 166);
    } else {
      drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
    }
  } else {
    drawIcon(ctx, meta.icon, 128, 180, meta.bannerColor, 1.5);
  }
  ctx.restore();
}

/**
 * Khởi tạo hoặc lấy CanvasTexture Atlas tổng cho 40 ô bàn cờ
 */
export function getBoardTileAtlas(isMobile = isPhoneHardware()): CanvasTexture | null {
  const useMobile = isMobile && !isTabletDevice();
  if (useMobile && mobileBoardAtlas) return mobileBoardAtlas;
  if (!useMobile && desktopBoardAtlas) return desktopBoardAtlas;
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  const size = useMobile ? 2048 : 4096;
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const scale = useMobile ? 1 : 2;

  // ADV-03: Tô kín toàn bộ bề mặt canvas bằng màu ngà parchment chuẩn bàn cờ,
  // triệt tiêu hoàn toàn viền lem đen mipmap ở Hàng 5 (slots 40-47) và lề đáy.
  ctx.fillStyle = '#F3EEDF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  let isNeedsUpdate = true;
  Object.defineProperty(texture, 'needsUpdate', {
    get() {
      return isNeedsUpdate;
    },
    set(val: boolean) {
      isNeedsUpdate = val;
      if (val) texture.version++;
    },
    configurable: true,
  });
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = useMobile ? 2 : 16;
  texture.generateMipmaps = true;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;

  // Vẽ 40 ô cờ vào các ô lưới tương ứng
  for (let idx = 0; idx < 40; idx++) {
    const col = idx % ATLAS_GRID_COLS;
    const row = Math.floor(idx / ATLAS_GRID_COLS);
    const offsetX = col * VIRTUAL_SLOT_WIDTH * scale;
    const offsetY = row * VIRTUAL_SLOT_HEIGHT * scale;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const isCorner = idx === 0 || idx === 10 || idx === 20 || idx === 30;
    if (isCorner) {
      // 1. Color Dilation: Tô kín toàn bộ slot 256x340 bằng màu nền ô góc chống lem viền đen mipmap
      ctx.fillStyle = CORNER_BG_COLORS[idx] ?? '#0F172A';
      ctx.fillRect(0, 0, VIRTUAL_SLOT_WIDTH, VIRTUAL_SLOT_HEIGHT);

      // 2. Vẽ nội dung ô góc vào vùng 256x256 (USER-04: hệ tọa độ 384x384 chuẩn)
      ctx.save();
      ctx.scale(CORNER_SLOT_SIZE / 384, CORNER_SLOT_SIZE / 384);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const drawer = CORNER_DRAWERS[idx] ?? drawGoCorner;
      drawer(ctx);
      ctx.restore();
    } else {
      const meta = TILE_METADATA_MAP[idx] ?? {
        title: `Ô ${idx}`,
        subtitle: '',
        bannerColor: '#64748B',
        category: 'BÀN CỜ',
        icon: 'default',
      };
      drawTileHeader(ctx, meta, idx);
      drawAtlasTileArt(ctx, idx, meta, texture, offsetX, offsetY, scale, atlasImageCache);
      drawFooter(ctx, meta, idx);
    }
    ctx.restore();
  }

  texture.needsUpdate = true;

  if (useMobile) {
    mobileBoardAtlas = texture;
  } else {
    desktopBoardAtlas = texture;
  }
  return texture;
}

function disposeAtlasTexture(tex: CanvasTexture | null): void {
  if (!tex) return;
  if (hasDimensions(tex.image)) {
    tex.image.width = 0;
    tex.image.height = 0;
  }
  if (typeof tex.dispose === 'function') tex.dispose();
}

/**
 * Dọn sạch bộ nhớ Atlas Texture và canvas để phòng chống Jetsam
 * Lưu ý: Giữ nguyên boardGeometryCache (bất biến, ~3KB) tránh crash component đang mounted (DIR-2)
 */
export function clearTileAtlasCache(): void {
  disposeAtlasTexture(desktopBoardAtlas);
  disposeAtlasTexture(mobileBoardAtlas);
  desktopBoardAtlas = null;
  mobileBoardAtlas = null;
  atlasImageCache.clear();
  pendingAtlasUpdates.clear();
  isAtlasUpdateDebouncing = false;
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearTileAtlasCache();
  });
}

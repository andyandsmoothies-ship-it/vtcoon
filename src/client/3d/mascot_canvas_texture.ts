import { useMemo } from 'react';
import { CanvasTexture } from 'three';

const textureCache = new Map<string, CanvasTexture>();

/**
 * Xóa sạch bộ nhớ đệm Mascot Texture (phục vụ dọn rác và unit test cô lập)
 */
export function clearMascotTextureCache(): void {
  for (const tex of textureCache.values()) {
    if (tex && typeof tex.dispose === 'function') tex.dispose();
  }
  textureCache.clear();
}

/**
 * Tạo và trả về CanvasTexture chứa icon/biểu tượng linh vật chibi với bộ nhớ đệm tức thời.
 * Phòng thủ SSR hoàn toàn khi chạy trong môi trường Node.js / Headless.
 */
export function getMascotCanvasTexture(icon: string, bgColor?: string): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const key = `${icon}_${bgColor ?? 'transparent'}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, 128, 128);

  if (bgColor && bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(64, 64, 56, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '84px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 64, 68);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  let needsUpdateFlag = true;
  Object.defineProperty(texture, 'needsUpdate', {
    get: () => needsUpdateFlag,
    set: (val: boolean) => {
      needsUpdateFlag = val;
      if (val) texture.version++;
    },
    configurable: true,
    enumerable: true,
  });
  textureCache.set(key, texture);
  return texture;
}

/**
 * Hook tiện ích React cho CanvasTexture linh vật, tự động memoize theo icon và màu nền.
 */
export function useMascotCanvasTexture(icon: string, bgColor?: string): CanvasTexture | null {
  return useMemo(() => getMascotCanvasTexture(icon, bgColor), [icon, bgColor]);
}

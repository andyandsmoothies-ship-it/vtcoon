// [IMP-62] Procedural Facade Texture Generator for Miniature Diorama Highrises & Shophouses
import * as THREE from 'three';

let highriseCache: THREE.Texture | null = null;
let shophouseCache: THREE.Texture | null = null;

function createDataFallbackTexture(): THREE.Texture {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  data.fill(220);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 4);
  tex.needsUpdate = true;
  return tex;
}

function drawHighriseCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  try {
    const grad = ctx.createLinearGradient?.(0, 0, 0, height);
    if (grad?.addColorStop) {
      grad.addColorStop(0, '#F8FAFC');
      grad.addColorStop(0.5, '#E2E8F0');
      grad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#E2E8F0';
    }
  } catch {
    ctx.fillStyle = '#E2E8F0';
  }
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  const cols = 4;
  const rows = 8;
  const cw = width / cols;
  const rh = height / rows;

  const glassTones = ['#93C5FD', '#BAE6FD', '#E0F2FE'];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      ctx.strokeRect(c * cw + 2, r * rh + 2, cw - 4, rh - 4);
      ctx.fillStyle = glassTones[(c + r) % glassTones.length]!;
      ctx.fillRect(c * cw + 3, r * rh + 3, cw - 6, rh - 6);
    }
  }
}

function generateHighriseTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) drawHighriseCanvas(ctx, 256, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.repeat.set(2, 4);
  return tex;
}

function drawShophouseCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.fillStyle = '#FEF08A';
  ctx.fillRect(0, 0, width, height);

  const cols = 2;
  const rows = 3;
  const cw = width / cols;
  const rh = height / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw + 12;
      const y = r * rh + 16;
      const w = cw - 24;
      const h = rh - 24;

      ctx.fillStyle = '#065F46';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = '#047857';
      const louverCount = 5;
      const lh = h / (louverCount + 1);
      for (let l = 1; l <= louverCount; l++) {
        ctx.fillRect(x + 2, y + l * lh, w - 4, 3);
      }
    }
  }
}

function generateShophouseTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (ctx) drawShophouseCanvas(ctx, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.repeat.set(2, 2);
  return tex;
}

export function createHighriseFacadeTexture(): THREE.Texture {
  if (highriseCache) return highriseCache;
  if (typeof document === 'undefined') {
    highriseCache = createDataFallbackTexture();
    return highriseCache;
  }
  highriseCache = generateHighriseTexture();
  return highriseCache;
}

export function createShophouseFacadeTexture(): THREE.Texture {
  if (shophouseCache) return shophouseCache;
  if (typeof document === 'undefined') {
    shophouseCache = createDataFallbackTexture();
    return shophouseCache;
  }
  shophouseCache = generateShophouseTexture();
  return shophouseCache;
}

export function clearFacadeTextureCache(): void {
  if (highriseCache) {
    highriseCache.dispose();
    highriseCache = null;
  }
  if (shophouseCache) {
    shophouseCache.dispose();
    shophouseCache = null;
  }
}

export function clearTextureCaches(): void {
  clearFacadeTextureCache();
}

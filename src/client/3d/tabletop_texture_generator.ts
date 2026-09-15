// [IMP-62] Procedural Walnut Wood Tabletop & Roughness Map Generator
import * as THREE from 'three';

let walnutDiffuseCache: THREE.Texture | null = null;
let walnutRoughnessCache: THREE.Texture | null = null;

function createDataFallbackTexture(grayLevel: number): THREE.Texture {
  const size = 16;
  const data = new Uint8Array(size * size * 4);
  data.fill(grayLevel);
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  tex.needsUpdate = true;
  return tex;
}

function drawWalnutDiffuseCanvas(ctx: CanvasRenderingContext2D, size: number): void {
  try {
    const grad = ctx.createLinearGradient?.(0, 0, size, 0);
    if (grad?.addColorStop) {
      grad.addColorStop(0, '#2D1B14');
      grad.addColorStop(0.3, '#3B231A');
      grad.addColorStop(0.7, '#452A1E');
      grad.addColorStop(1, '#2D1B14');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = '#2D1B14';
    }
  } catch {
    ctx.fillStyle = '#2D1B14';
  }
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#1E110C';
  ctx.lineWidth = 2;
  const rings = 24;
  for (let i = 0; i < rings; i++) {
    const y = (i / rings) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + 12, size * 0.7, y - 12, size, y + 4);
    ctx.stroke();
  }

  // Pores and fine grain
  ctx.strokeStyle = 'rgba(25, 14, 10, 0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < rings * 2; i++) {
    const y = (i / (rings * 2)) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + 2);
    ctx.stroke();
  }
}

function generateWalnutDiffuseTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) drawWalnutDiffuseCanvas(ctx, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.repeat.set(4, 4);
  return tex;
}

function drawWalnutRoughnessCanvas(ctx: CanvasRenderingContext2D, size: number): void {
  ctx.fillStyle = '#484848'; // baseline ~0.28 roughness
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#282828';
  ctx.lineWidth = 2;
  const rings = 24;
  for (let i = 0; i < rings; i++) {
    const y = (i / rings) * size;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(size * 0.3, y + 12, size * 0.7, y - 12, size, y + 4);
    ctx.stroke();
  }
}

function generateWalnutRoughnessTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) drawWalnutRoughnessCanvas(ctx, 512);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.repeat.set(4, 4);
  return tex;
}

export function createWalnutTabletopTexture(): THREE.Texture {
  if (walnutDiffuseCache) return walnutDiffuseCache;
  if (typeof document === 'undefined') {
    walnutDiffuseCache = createDataFallbackTexture(60);
    return walnutDiffuseCache;
  }
  walnutDiffuseCache = generateWalnutDiffuseTexture();
  return walnutDiffuseCache;
}

export function createWalnutRoughnessTexture(): THREE.Texture {
  if (walnutRoughnessCache) return walnutRoughnessCache;
  if (typeof document === 'undefined') {
    walnutRoughnessCache = createDataFallbackTexture(72);
    return walnutRoughnessCache;
  }
  walnutRoughnessCache = generateWalnutRoughnessTexture();
  return walnutRoughnessCache;
}

export function clearTabletopTextureCache(): void {
  if (walnutDiffuseCache) {
    walnutDiffuseCache.dispose();
    walnutDiffuseCache = null;
  }
  if (walnutRoughnessCache) {
    walnutRoughnessCache.dispose();
    walnutRoughnessCache = null;
  }
}

export function clearTextureCaches(): void {
  clearTabletopTextureCache();
}

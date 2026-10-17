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

export interface DongSonCanvasGradient {
  addColorStop(offset: number, color: string): void;
}

export interface DongSonCanvasRenderingContext {
  beginPath(): void;
  arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
  stroke(): void;
  fill(): void;
  fillRect(x: number, y: number, w: number, h: number): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  closePath(): void;
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  createRadialGradient?(x0: number, y0: number, r0: number, x1: number, y1: number, r1: number): DongSonCanvasGradient;
  fillStyle: string | DongSonCanvasGradient | CanvasPattern;
  strokeStyle: string | DongSonCanvasGradient | CanvasPattern;
  lineWidth: number;
}

let cachedDongSonTexture: THREE.CanvasTexture | null = null;

export function drawDongSonMedallion(ctx: DongSonCanvasRenderingContext, size: number): void {
  const center = size / 2;
  const radius = size * 0.48;

  // 1. Imperial Royal Emerald / Obsidian Marble radial gradient base plate
  if (typeof ctx.createRadialGradient === 'function') {
    const baseGrad = ctx.createRadialGradient(center, center, 0, center, center, radius);
    baseGrad.addColorStop(0, '#064E3B');
    baseGrad.addColorStop(0.7, '#04382A');
    baseGrad.addColorStop(1, '#022C22');
    ctx.fillStyle = baseGrad;
  } else {
    ctx.fillStyle = '#064E3B';
  }
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  // 2. Outer antique gold rim
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = size * 0.015;
  ctx.stroke();

  // 3. Concentric geometric decorative bands in gleaming gold
  const bandRadii = [0.88, 0.72, 0.58, 0.42, 0.28];
  ctx.lineWidth = size * 0.005;
  ctx.strokeStyle = '#D4AF37';
  for (const rFrac of bandRadii) {
    ctx.beginPath();
    ctx.arc(center, center, radius * rFrac, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 4. Central 14-point Sunburst Star with gold gradient
  const starRadius = radius * 0.24;
  const innerStarRadius = radius * 0.08;
  const rays = 14;
  if (typeof ctx.createRadialGradient === 'function') {
    const starGrad = ctx.createRadialGradient(center, center, 0, center, center, starRadius);
    starGrad.addColorStop(0, '#FEF08A');
    starGrad.addColorStop(0.5, '#FDE047');
    starGrad.addColorStop(1, '#D4AF37');
    ctx.fillStyle = starGrad;
  } else {
    ctx.fillStyle = '#D4AF37';
  }
  ctx.beginPath();
  for (let i = 0; i < rays * 2; i++) {
    const angle = (i * Math.PI) / rays - Math.PI / 2;
    const r = i % 2 === 0 ? starRadius : innerStarRadius;
    const x = center + Math.cos(angle) * r;
    const y = center + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // 5. Flying Lac birds motif band in gold
  const birdRadius = radius * 0.65;
  const birdCount = 10;
  ctx.fillStyle = '#D4AF37';
  for (let i = 0; i < birdCount; i++) {
    const angle = (i * 2 * Math.PI) / birdCount;
    ctx.save();
    ctx.translate(center + Math.cos(angle) * birdRadius, center + Math.sin(angle) * birdRadius);
    ctx.rotate(angle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-size * 0.015, -size * 0.01);
    ctx.lineTo(size * 0.02, 0);
    ctx.lineTo(-size * 0.015, size * 0.01);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
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
  if (cachedDongSonTexture) {
    cachedDongSonTexture.dispose();
    cachedDongSonTexture = null;
  }
}

export function clearTextureCaches(): void {
  clearTabletopTextureCache();
}

export function createDongSonPlazaTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedDongSonTexture) return cachedDongSonTexture;

  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawDongSonMedallion(ctx, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  cachedDongSonTexture = texture;
  return cachedDongSonTexture;
}



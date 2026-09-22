// [IMP-162] W3C Canvas roundRect Polyfill for Safari & Legacy WebKit
// Conforms to W3C CanvasRenderingContext2D & Path2D specification:
// - Normalizes negative width & height (shifts origin & flips signs)
// - Validates non-negative finite radii (supports 1 to 4 radii)
// - Scales adjacent radii proportionally if they exceed bounding dimensions
// - Draws smooth rounded rectangle path via arcTo

function parseRadii(radii?: number | number[]): [number, number, number, number] {
  if (radii === undefined) {
    return [0, 0, 0, 0];
  }
  if (typeof radii === 'number') {
    if (!Number.isFinite(radii) || radii < 0) {
      throw new RangeError('Failed to execute roundRect: radius must be a non-negative number');
    }
    return [radii, radii, radii, radii];
  }
  if (Array.isArray(radii)) {
    if (radii.length === 0 || radii.length > 4) {
      throw new RangeError('Failed to execute roundRect: 1-4 radii required');
    }
    for (const r of radii) {
      if (typeof r !== 'number' || !Number.isFinite(r) || r < 0) {
        throw new RangeError('Failed to execute roundRect: radius must be a non-negative number');
      }
    }
    if (radii.length === 1) {
      const r0 = radii[0] ?? 0;
      return [r0, r0, r0, r0];
    }
    if (radii.length === 2) {
      const r0 = radii[0] ?? 0;
      const r1 = radii[1] ?? 0;
      return [r0, r1, r0, r1];
    }
    if (radii.length === 3) {
      const r0 = radii[0] ?? 0;
      const r1 = radii[1] ?? 0;
      const r2 = radii[2] ?? 0;
      return [r0, r1, r2, r1];
    }
    return [radii[0] ?? 0, radii[1] ?? 0, radii[2] ?? 0, radii[3] ?? 0];
  }
  throw new RangeError('Failed to execute roundRect: radius must be a non-negative number');
}

export function roundRectPolyfill(
  this: any,
  x: number,
  y: number,
  w: number,
  h: number,
  radii?: number | number[]
): void {
  // 1. Normalize negative dimensions according to W3C specification
  if (w < 0) {
    x += w;
    w = -w;
  }
  if (h < 0) {
    y += h;
    h = -h;
  }

  // 2. Parse and validate radii
  let [rTL, rTR, rBR, rBL] = parseRadii(radii);

  // 3. Proportional scaling when adjacent radii exceed bounding dimensions
  const topSum = rTL + rTR;
  const bottomSum = rBR + rBL;
  const leftSum = rTL + rBL;
  const rightSum = rTR + rBR;

  let scale = 1;
  if (topSum > w && topSum > 0) scale = Math.min(scale, w / topSum);
  if (bottomSum > w && bottomSum > 0) scale = Math.min(scale, w / bottomSum);
  if (leftSum > h && leftSum > 0) scale = Math.min(scale, h / leftSum);
  if (rightSum > h && rightSum > 0) scale = Math.min(scale, h / rightSum);

  if (scale < 1) {
    rTL *= scale;
    rTR *= scale;
    rBR *= scale;
    rBL *= scale;
  }

  // 4. Construct path via arcTo sequence
  this.moveTo(x + rTL, y);
  this.arcTo(x + w, y, x + w, y + h, rTR);
  this.arcTo(x + w, y + h, x, y + h, rBR);
  this.arcTo(x, y + h, x, y, rBL);
  this.arcTo(x, y, x + w, y, rTL);
  this.closePath();
}

/**
 * Installs roundRect polyfill on CanvasRenderingContext2D and Path2D if missing.
 * SSR-safe: handles environments where window, document, or canvas classes are undefined.
 */
export function installCanvasRoundRectPolyfill(): void {
  if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    (CanvasRenderingContext2D.prototype as any).roundRect = roundRectPolyfill;
  }
  if (typeof Path2D !== 'undefined' && !Path2D.prototype.roundRect) {
    (Path2D.prototype as any).roundRect = roundRectPolyfill;
  }
}

// Auto-install on module load in browser-like environments
if (typeof window !== 'undefined' || typeof CanvasRenderingContext2D !== 'undefined') {
  installCanvasRoundRectPolyfill();
}

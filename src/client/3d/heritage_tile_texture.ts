// [UI-S05/MSS] HeritageTileTexture — Procedural Canvas Texture Generator for Indochine Encaustic Tiles
// Generates vintage Saigon - Cho Lon 4-fold symmetrical encaustic cement tile patterns for district courtyards
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

let cachedEncausticTexture: CanvasTexture | null = null;

/**
 * Vẽ hoa văn gạch bông Đông Dương (Indochine 4-fold symmetry) lên canvas context 2D
 * An toàn với mọi môi trường test headless nhờ chỉ sử dụng các hàm canvas tiêu chuẩn
 */
function drawIndochineEncausticTilePattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): void {
  const cx = w / 2;
  const cy = h / 2;
  const unit = Math.min(w, h);

  if (typeof ctx.save === 'function') ctx.save();

  // 1. Nền gạch men ngà cổ điển (Classic Ivory Cement Plinth)
  ctx.fillStyle = '#FDFBF7';
  ctx.fillRect(0, 0, w, h);

  // 2. Viền đôi hình học góc phố Chợ Lớn (Double Geometric Border)
  ctx.strokeStyle = '#1E3A8A'; // Colonial navy blue
  ctx.lineWidth = unit * 0.024;
  ctx.strokeRect(unit * 0.04, unit * 0.04, unit * 0.92, unit * 0.92);

  ctx.strokeStyle = '#D97706'; // Colonial ochre yellow
  ctx.lineWidth = unit * 0.012;
  ctx.strokeRect(unit * 0.07, unit * 0.07, unit * 0.86, unit * 0.86);

  // 4 góc tam giác ngọc bích (4-Corner Jade Accents)
  const pad = unit * 0.07;
  const cSize = unit * 0.12;
  ctx.fillStyle = '#047857'; // Jade green

  // Góc trên-trái
  ctx.beginPath();
  ctx.moveTo(pad, pad);
  ctx.lineTo(pad + cSize, pad);
  ctx.lineTo(pad, pad + cSize);
  ctx.lineTo(pad, pad);
  ctx.fill();

  // Góc trên-phải
  ctx.beginPath();
  ctx.moveTo(w - pad, pad);
  ctx.lineTo(w - pad - cSize, pad);
  ctx.lineTo(w - pad, pad + cSize);
  ctx.lineTo(w - pad, pad);
  ctx.fill();

  // Góc dưới-trái
  ctx.beginPath();
  ctx.moveTo(pad, h - pad);
  ctx.lineTo(pad + cSize, h - pad);
  ctx.lineTo(pad, h - pad - cSize);
  ctx.lineTo(pad, h - pad);
  ctx.fill();

  // Góc dưới-phải
  ctx.beginPath();
  ctx.moveTo(w - pad, h - pad);
  ctx.lineTo(w - pad - cSize, h - pad);
  ctx.lineTo(w - pad, h - pad - cSize);
  ctx.lineTo(w - pad, h - pad);
  ctx.fill();

  // 3. Họa tiết lá đan xen hình thoi 45 độ (Interlocking Rhombus Leaf)
  for (let d = 0; d < 4; d++) {
    const diag = Math.PI / 4 + (d * Math.PI) / 2;
    const innerR = unit * 0.09;
    const outerR = unit * 0.32;
    const midR = unit * 0.20;
    const spread = 0.24;

    ctx.fillStyle = '#B45309'; // Terracotta ochre
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = unit * 0.008;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(diag) * innerR, cy + Math.sin(diag) * innerR);
    ctx.lineTo(cx + Math.cos(diag - spread) * midR, cy + Math.sin(diag - spread) * midR);
    ctx.lineTo(cx + Math.cos(diag) * outerR, cy + Math.sin(diag) * outerR);
    ctx.lineTo(cx + Math.cos(diag + spread) * midR, cy + Math.sin(diag + spread) * midR);
    ctx.lineTo(cx + Math.cos(diag) * innerR, cy + Math.sin(diag) * innerR);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Hoa thị 4 cánh đối xứng trung tâm (Central 4-petal Medallion)
  const petalLength = unit * 0.33;
  const spread = 0.28;
  const midR = unit * 0.18;

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    ctx.fillStyle = i % 2 === 0 ? '#1E3A8A' : '#047857';
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = unit * 0.008;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle - spread) * midR, cy + Math.sin(angle - spread) * midR);
    ctx.lineTo(cx + Math.cos(angle) * petalLength, cy + Math.sin(angle) * petalLength);
    ctx.lineTo(cx + Math.cos(angle + spread) * midR, cy + Math.sin(angle + spread) * midR);
    ctx.lineTo(cx, cy);
    ctx.fill();
    ctx.stroke();
  }

  // 5. Tâm hoa tròn ngọc bích (Central Jade Hub)
  ctx.beginPath();
  ctx.arc(cx, cy, unit * 0.08, 0, Math.PI * 2);
  ctx.fillStyle = '#FEF3C7';
  ctx.fill();
  ctx.strokeStyle = '#1E3A8A';
  ctx.lineWidth = unit * 0.014;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, unit * 0.035, 0, Math.PI * 2);
  ctx.fillStyle = '#D97706';
  ctx.fill();

  if (typeof ctx.restore === 'function') ctx.restore();
}

/**
 * Sinh CanvasTexture 512x512 hoa văn gạch bông cổ điển Sài Gòn - Chợ Lớn xưa
 * Trả về null an toàn nếu chạy trong môi trường headless/SSR không có DOM
 */
export function createHeritageEncausticTileTexture(): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  if (!canvas.width) canvas.width = 512;
  if (!canvas.height) canvas.height = 512;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  drawIndochineEncausticTilePattern(ctx, canvas.width, canvas.height);

  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Lấy texture gạch bông với cơ chế memoized cache
 */
export function getHeritageEncausticTileTexture(): CanvasTexture | null {
  if (cachedEncausticTexture) {
    return cachedEncausticTexture;
  }
  cachedEncausticTexture = createHeritageEncausticTileTexture();
  return cachedEncausticTexture;
}

/**
 * Xóa cache phục vụ kiểm thử đơn vị
 */
export function clearHeritageTileTextureCache(): void {
  if (cachedEncausticTexture && typeof cachedEncausticTexture.dispose === 'function') {
    cachedEncausticTexture.dispose();
  }
  cachedEncausticTexture = null;
}

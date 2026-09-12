// [UI-S04/MSS] EventCardTexture — HiDPI Procedural Canvas Texture Generator for 3D Event Cards
// Generates Dong Son Bronze Drum / Imperial Dragon Back Texture and High-Readability FinTech Front Texture
import { CanvasTexture, SRGBColorSpace } from 'three';
import { formatCurrency } from '../ui/ui_helpers';

export interface EventCardTextureData {
  readonly cardType: 'chance' | 'market';
  readonly cardId: string;
  readonly title: string;
  readonly description: string;
  readonly effectDelta?: number;
}

/**
 * Vẽ hoa văn Trống đồng Đông Sơn mạ vàng hoàng gia lên canvas 2D
 */
function drawDongSonBronzeDrumPattern(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  goldColor: string
): void {
  ctx.save();
  ctx.strokeStyle = goldColor;
  ctx.fillStyle = goldColor;
  ctx.lineWidth = 1.5;

  // 1. Mặt trời trung tâm (14 tia sáng)
  const rays = 14;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < rays; i++) {
    const angle = (i * Math.PI * 2) / rays;
    const innerR = radius * 0.15;
    const outerR = radius * 0.32;
    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Hạt tam giác tia sáng
    const tipAngle = angle + Math.PI / rays;
    const tipR = radius * 0.28;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(tipAngle) * tipR, cy + Math.sin(tipAngle) * tipR, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Các vòng tròn đồng tâm với họa tiết chấm dãi và răng cưa
  const circles = [0.42, 0.56, 0.72, 0.88];
  circles.forEach((ratio, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, radius * ratio, 0, Math.PI * 2);
    ctx.stroke();

    // Điểm xuyết hoa văn vòng tròn
    const dotCount = 18 + idx * 8;
    for (let j = 0; j < dotCount; j++) {
      const dotAngle = (j * Math.PI * 2) / dotCount;
      const dotR = radius * (ratio - 0.05);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(dotAngle) * dotR, cy + Math.sin(dotAngle) * dotR, 1.0, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // 3. Đàn Chim Lạc bay ngược chiều kim đồng hồ ở vành ngoài
  const birdCount = 6;
  const birdR = radius * 0.8;
  for (let b = 0; b < birdCount; b++) {
    const bAngle = (b * Math.PI * 2) / birdCount;
    const bx = cx + Math.cos(bAngle) * birdR;
    const by = cy + Math.sin(bAngle) * birdR;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(bAngle + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-7, 2);
    ctx.quadraticCurveTo(0, -5, 8, -2);
    ctx.quadraticCurveTo(2, 4, -7, 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Sinh Texture Mặt Lưng thẻ bài (Back Face)
 * Thẻ Cơ Hội: Nền Ngọc Bích sẫm (#064E3B / #022C22)
 * Thẻ Thị Trường: Nền Nhung Đỏ sẫm (#450A0A / #881337)
 */
export function generateEventCardBackTexture(
  cardType: 'chance' | 'market'
): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1426;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(4, 4);
  const w = 256;
  const h = 356.5;

  const isChance = cardType === 'chance';

  // 1. Nền chuyển sắc Hoàng gia (Ngọc bích sẫm vs Nhung đỏ Ruby)
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.9);
  if (isChance) {
    bgGrad.addColorStop(0, '#065F46'); // Emerald green
    bgGrad.addColorStop(0.6, '#044332');
    bgGrad.addColorStop(1, '#022C22'); // Dark jade
  } else {
    bgGrad.addColorStop(0, '#881337'); // Crimson ruby
    bgGrad.addColorStop(0.6, '#5E0D25');
    bgGrad.addColorStop(1, '#3B0715'); // Velvet dark wine
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Viền kim loại đôi mạ vàng Champagne
  const goldGrad = ctx.createLinearGradient(0, 0, w, h);
  goldGrad.addColorStop(0, '#FEF08A');
  goldGrad.addColorStop(0.3, '#F59E0B');
  goldGrad.addColorStop(0.7, '#D97706');
  goldGrad.addColorStop(1, '#FBBF24');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3.5;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 1;
  ctx.strokeRect(13, 13, w - 26, h - 26);

  // 4 góc uốn góc nghệ thuật Đông Sơn
  const cornerSize = 14;
  const corners: ReadonlyArray<readonly [number, number]> = [
    [13, 13],
    [w - 13 - cornerSize, 13],
    [13, h - 13 - cornerSize],
    [w - 13 - cornerSize, h - 13 - cornerSize],
  ];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(cx, cy, cornerSize, 2);
    ctx.fillRect(cx, cy, 2, cornerSize);
  });

  // 3. Trống đồng Đông Sơn mạ vàng trung tâm
  drawDongSonBronzeDrumPattern(ctx, w / 2, h / 2, 85, '#FDE047');

  // 4. Nhãn phong thủy & văn hóa mặt lưng
  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ VIỆT NAM THỊNH VƯỢNG ★', w / 2, 36);
  ctx.fillText(isChance ? '✦ VẬN KHÍ KHỞI SINH ✦' : '✦ THỊ TRƯỜNG BIẾN ĐỘNG ✦', w / 2, h - 28);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Sinh Texture Mặt Chính thẻ bài (Front Face)
 */
export function generateEventCardFrontTexture(
  data: EventCardTextureData
): CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1426;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(4, 4);
  const w = 256;
  const h = 356.5;

  const isChance = data.cardType === 'chance';

  // 1. Nền đá phiến sẫm Obsidian cao cấp
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#0F172A');
  bgGrad.addColorStop(0.5, '#1E293B');
  bgGrad.addColorStop(1, '#090D1A');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Viền mạ kim loại vàng
  const goldGrad = ctx.createLinearGradient(0, 0, w, h);
  goldGrad.addColorStop(0, '#FEF08A');
  goldGrad.addColorStop(0.35, '#F59E0B');
  goldGrad.addColorStop(0.65, '#D97706');
  goldGrad.addColorStop(1, '#FBBF24');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.strokeStyle = isChance ? '#06B6D4' : '#F59E0B';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, w - 24, h - 24);

  // 3. Ribbon Header dập nổi
  const ribbonColor = isChance ? '#0891B2' : '#B45309';
  ctx.fillStyle = ribbonColor;
  ctx.beginPath();
  ctx.roundRect(16, 16, w - 32, 42, 6);
  ctx.fill();
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(isChance ? '★ PHIẾU CƠ HỘI ĐỊA ỐC ★' : '★ PHIẾU THỊ TRƯỜNG VĨ MÔ ★', w / 2, 32);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(isChance ? 'CƠ HỘI' : 'KHÍ VẬN THỊ TRƯỜNG', w / 2, 48);

  // 4. Biểu tượng Huy hiệu Hologram trung tâm
  const iconY = 100;
  ctx.fillStyle = isChance ? 'rgba(6, 182, 212, 0.15)' : 'rgba(245, 158, 11, 0.15)';
  ctx.beginPath();
  ctx.arc(w / 2, iconY, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = isChance ? '#22D3EE' : '#FBBF24';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = '28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(isChance ? '⚡' : '🏛️', w / 2, iconY);
  ctx.textBaseline = 'alphabetic';

  // 5. Tiêu đề sự kiện dập nổi
  ctx.save();
  ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#F8FAFC';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  wrapText(ctx, data.title.toUpperCase(), w / 2, 156, w - 40, 16);
  ctx.restore();

  // 6. Mô tả sự kiện
  ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#CBD5E1';
  ctx.textAlign = 'center';
  wrapText(ctx, data.description, w / 2, 205, w - 44, 15);

  // 7. Badge biến động tài chính (+/- VNĐ)
  if (typeof data.effectDelta === 'number' && data.effectDelta !== 0) {
    const isGain = data.effectDelta > 0;
    const deltaY = 282;
    ctx.fillStyle = isGain ? 'rgba(5, 150, 105, 0.25)' : 'rgba(225, 29, 72, 0.25)';
    ctx.beginPath();
    ctx.roundRect(24, deltaY, w - 48, 32, 8);
    ctx.fill();
    ctx.strokeStyle = isGain ? '#10B981' : '#F43F5E';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.fillStyle = isGain ? '#34D399' : '#FB7185';
    ctx.textAlign = 'center';
    const sign = isGain ? '+' : '';
    ctx.fillText(`${isGain ? 'THƯỞNG' : 'PHẠT'}: ${sign}${formatCurrency(data.effectDelta)}`, w / 2, deltaY + 20);
  }

  // Footer nhãn bảo chứng
  ctx.font = 'italic 8px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#64748B';
  ctx.textAlign = 'center';
  ctx.fillText('VTCOON · CHÍNH THỨC BAN HÀNH', w / 2, h - 18);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const words = text.split(' ');
  let line = '';
  let curY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + (line ? ' ' : '') + words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, curY);
      line = words[n] ?? '';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, curY);
}

// [TC-P3.1/MSS] PenthouseTextureGenerator — Bộ sinh CanvasTexture cho Hậu cảnh Hoàng hôn & Màn hình HUD Holographic
import { CanvasTexture, SRGBColorSpace } from 'three';

export function generateHologramScreenTexture(): CanvasTexture {
  if (typeof document === 'undefined') {
    return new CanvasTexture({} as HTMLCanvasElement);
  }
  try {
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function') {
      return new CanvasTexture({} as HTMLCanvasElement);
    }
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new CanvasTexture(canvas);

  const grad = ctx.createLinearGradient(0, 0, 0, 320);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 304);

  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, 484, 292);

  ctx.fillStyle = '#FBBF24';
  ctx.font = '900 24px -apple-system, sans-serif';
  ctx.fillText('VTCOON • BÁN ĐẢO BIỂN ĐẢO', 28, 48);

  ctx.fillStyle = '#38BDF8';
  ctx.font = 'bold 13px -apple-system, sans-serif';
  ctx.fillText('HỆ THỐNG SA BÀN 3D QUỐC TẾ 2026', 28, 72);

  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(28, 92, 230, 180);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.fillRect(32, 96, 222, 172);

  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 11px -apple-system, sans-serif';
  ctx.fillText('40 Ô CỜ ĐỊA ỐC CAO CẤP', 40, 120);
  ctx.fillText('LANDMARK HOÀNG KIM C3', 40, 145);
  ctx.fillText('CẢNG CÁT LÁI & MARINA', 40, 170);

  ctx.strokeStyle = '#F59E0B';
  ctx.strokeRect(280, 92, 204, 180);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.1)';
  ctx.fillRect(284, 96, 196, 172);

  ctx.fillStyle = '#FEF08A';
  ctx.font = '900 14px -apple-system, sans-serif';
  ctx.fillText('VIP PENTHOUSE', 300, 130);
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '11px -apple-system, sans-serif';
  ctx.fillText('TẦNG 80 • VIEW VỊNH BIỂN', 300, 155);
  ctx.fillText('SỨC CHỨA: 4 ĐẠI GIA', 300, 175);
  ctx.fillText('TRẠNG THÁI: TRỰC TUYẾN', 300, 195);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch {
    return new CanvasTexture({} as HTMLCanvasElement);
  }
}

export function generateSunsetBackdropTexture(): CanvasTexture {
  if (typeof document === 'undefined') {
    return new CanvasTexture({} as HTMLCanvasElement);
  }
  try {
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function') {
      return new CanvasTexture({} as HTMLCanvasElement);
    }
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new CanvasTexture(canvas);

  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#1E1B4B');
  skyGrad.addColorStop(0.32, '#831843');
  skyGrad.addColorStop(0.65, '#EA580C');
  skyGrad.addColorStop(0.85, '#FBBF24');
  skyGrad.addColorStop(1.0, '#0F172A');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 1024, 512);

  const sunGrad = ctx.createRadialGradient(380, 360, 10, 380, 360, 130);
  sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
  sunGrad.addColorStop(0.25, 'rgba(254, 240, 138, 0.85)');
  sunGrad.addColorStop(0.6, 'rgba(249, 115, 22, 0.45)');
  sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(380, 360, 130, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.quadraticCurveTo(240, 390, 460, 430);
  ctx.quadraticCurveTo(680, 465, 1024, 410);
  ctx.lineTo(1024, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#FDE68A';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  for (let i = 0; i < 110; i++) {
    const lx = (i * 37) % 1024;
    const ly = 398 + (i * 19) % 52;
    ctx.fillRect(lx, ly, 2.2, 2.2);
  }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch {
    return new CanvasTexture({} as HTMLCanvasElement);
  }
}

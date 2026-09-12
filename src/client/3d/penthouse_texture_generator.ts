// [TC-P3.1/MSS] PenthouseTextureGenerator — Bộ sinh CanvasTexture cho Hậu cảnh Hoàng hôn & Màn hình HUD Holographic
import { CanvasTexture, SRGBColorSpace } from 'three';

function createFallbackCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = (typeof document !== 'undefined' && typeof document.createElement === 'function')
    ? document.createElement('canvas')
    : ({} as HTMLCanvasElement);
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export function generateHologramScreenTexture(): CanvasTexture {
  if (typeof document === 'undefined') {
    return new CanvasTexture(createFallbackCanvas(512, 320));
  }
  try {
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function') {
      return new CanvasTexture(createFallbackCanvas(512, 320));
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
    return new CanvasTexture(createFallbackCanvas(512, 320));
  }
}

export function generateSunsetBackdropTexture(): CanvasTexture {
  if (typeof document === 'undefined') {
    return new CanvasTexture(createFallbackCanvas(1024, 512));
  }
  try {
    const canvas = document.createElement('canvas');
    if (!canvas || typeof canvas.getContext !== 'function') {
      return new CanvasTexture(createFallbackCanvas(1024, 512));
    }
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new CanvasTexture(canvas);

    // 1. Dải màu trời hoàng hôn vịnh biển chuyển từ tím thẫm sang ráng chiều vàng óng
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 420);
    skyGrad.addColorStop(0, '#130E26');
    skyGrad.addColorStop(0.28, '#581C87');
    skyGrad.addColorStop(0.52, '#9D174D');
    skyGrad.addColorStop(0.72, '#EA580C');
    skyGrad.addColorStop(0.88, '#F59E0B');
    skyGrad.addColorStop(1.0, '#FEF08A');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 420);

    // 2. Dải mây chiều tím thẫm hòa ráng hoàng hôn vàng óng
    ctx.fillStyle = 'rgba(88, 28, 135, 0.35)';
    ctx.beginPath();
    ctx.ellipse(260, 180, 220, 32, -0.05, 0, Math.PI * 2);
    ctx.ellipse(780, 220, 260, 36, 0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(234, 88, 12, 0.28)';
    ctx.beginPath();
    ctx.ellipse(420, 260, 280, 28, -0.02, 0, Math.PI * 2);
    ctx.ellipse(140, 290, 180, 22, 0.03, 0, Math.PI * 2);
    ctx.fill();

    // 3. Vầng thái dương lặn với quầng sáng rực rỡ
    const sunGrad = ctx.createRadialGradient(380, 350, 8, 380, 350, 150);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    sunGrad.addColorStop(0.2, 'rgba(254, 240, 138, 0.9)');
    sunGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.5)');
    sunGrad.addColorStop(0.85, 'rgba(234, 88, 12, 0.15)');
    sunGrad.addColorStop(1, 'rgba(234, 88, 12, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(380, 350, 150, 0, Math.PI * 2);
    ctx.fill();

    // 4. Mặt nước vịnh biển hoàng hôn chuyển sắc sâu thẳm
    const seaGrad = ctx.createLinearGradient(0, 410, 0, 512);
    seaGrad.addColorStop(0, '#0F172A');
    seaGrad.addColorStop(0.4, '#091528');
    seaGrad.addColorStop(1.0, '#020617');
    ctx.fillStyle = seaGrad;
    ctx.fillRect(0, 410, 1024, 102);

    // 5. Đường chân trời cao ốc đô thị & bán đảo vịnh biển
    ctx.fillStyle = '#080D1A';
    ctx.beginPath();
    ctx.moveTo(0, 415);
    const buildings = [
      { x: 30, w: 28, h: 45 },
      { x: 65, w: 22, h: 65 },
      { x: 92, w: 35, h: 50 },
      { x: 180, w: 26, h: 80 },
      { x: 212, w: 40, h: 95 },
      { x: 260, w: 24, h: 60 },
      { x: 520, w: 30, h: 70 },
      { x: 558, w: 45, h: 105 },
      { x: 610, w: 32, h: 85 },
      { x: 650, w: 25, h: 55 },
      { x: 730, w: 38, h: 75 },
      { x: 775, w: 50, h: 110 },
      { x: 835, w: 30, h: 90 },
      { x: 875, w: 26, h: 65 },
      { x: 920, w: 44, h: 80 },
    ];
    for (const b of buildings) {
      ctx.rect(b.x, 415 - b.h, b.w, b.h);
    }
    ctx.moveTo(0, 418);
    ctx.quadraticCurveTo(240, 395, 460, 422);
    ctx.quadraticCurveTo(680, 445, 1024, 412);
    ctx.lineTo(1024, 512);
    ctx.lineTo(0, 512);
    ctx.closePath();
    ctx.fill();

    // Viền sáng ráng chiều phản chiếu trên đỉnh đồi
    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Ánh đèn thành phố lung linh (Twinkling city lights)
    for (let i = 0; i < 160; i++) {
      const lx = (i * 41 + 13) % 1024;
      const ly = 340 + (i * 17) % 75;
      const colorPick = i % 5 === 0 ? '#38BDF8' : i % 3 === 0 ? '#F59E0B' : '#FEF08A';
      ctx.fillStyle = colorPick;
      ctx.fillRect(lx, ly, 1.8, 1.8);
    }

    // Đèn hải đăng và ăng-ten tháp chớp đỏ
    for (const b of buildings) {
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(b.x + b.w / 2 - 1, 415 - b.h - 8, 2, 2);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w / 2, 415 - b.h);
      ctx.lineTo(b.x + b.w / 2, 415 - b.h - 8);
      ctx.stroke();
    }

    // 7. Mặt biển hoàng hôn lấp lánh sóng ánh vàng (Glitter specular shimmer)
    for (let j = 0; j < 90; j++) {
      const waveY = 416 + j * 1.1;
      const waveXCenter = 380 + Math.sin(j * 0.4) * 50;
      const waveWidth = 30 + j * 3.8;
      const waveGrad = ctx.createLinearGradient(waveXCenter - waveWidth, 0, waveXCenter + waveWidth, 0);
      waveGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
      waveGrad.addColorStop(0.5, `rgba(254, 240, 138, ${Math.max(0.1, 0.7 - j * 0.006)})`);
      waveGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.strokeStyle = waveGrad;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(waveXCenter - waveWidth / 2, waveY);
      ctx.lineTo(waveXCenter + waveWidth / 2, waveY);
      ctx.stroke();
    }

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  } catch {
    return new CanvasTexture(createFallbackCanvas(1024, 512));
  }
}

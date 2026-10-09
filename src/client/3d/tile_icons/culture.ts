import type { IconRenderer } from './types';

function renderDragon(ctx: CanvasRenderingContext2D): void {
  // Cầu Rồng Đà Nẵng uốn lượn sông Hàn
  ctx.beginPath();
  ctx.moveTo(-22, 12);
  ctx.quadraticCurveTo(-12, -10, 0, 8);
  ctx.quadraticCurveTo(12, -12, 22, 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, 4, 5, 0, Math.PI * 2);
  ctx.fill();
}

function renderLotus(ctx: CanvasRenderingContext2D): void {
  // Búp sen vàng Làng Sen Nghệ An
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.quadraticCurveTo(-14, 0, 0, 16);
  ctx.quadraticCurveTo(14, 0, 0, -16);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-4, -6);
  ctx.quadraticCurveTo(-22, -2, -12, 14);
  ctx.quadraticCurveTo(-2, 12, -4, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(4, -6);
  ctx.quadraticCurveTo(22, -2, 12, 14);
  ctx.quadraticCurveTo(2, 12, 4, -6);
  ctx.fill();
}

function renderMountain(ctx: CanvasRenderingContext2D): void {
  // Quần thể danh thắng Tràng An Ninh Bình
  ctx.beginPath();
  ctx.moveTo(-24, 18);
  ctx.lineTo(-12, -14);
  ctx.lineTo(0, 4);
  ctx.lineTo(14, -18);
  ctx.lineTo(24, 18);
  ctx.closePath();
  ctx.fill();
}

function renderPine(ctx: CanvasRenderingContext2D): void {
  // Đồi thông Đà Lạt Lâm Đồng
  ctx.beginPath();
  ctx.moveTo(-10, -18);
  ctx.lineTo(0, -2);
  ctx.lineTo(-5, -2);
  ctx.lineTo(4, 14);
  ctx.lineTo(-16, 14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(8, -10);
  ctx.lineTo(16, 2);
  ctx.lineTo(12, 2);
  ctx.lineTo(18, 14);
  ctx.lineTo(2, 14);
  ctx.closePath();
  ctx.fill();
}

function renderLighthouse(ctx: CanvasRenderingContext2D): void {
  // Ngọn Hải Đăng Vũng Tàu vươn cao
  ctx.beginPath();
  ctx.moveTo(-8, 20);
  ctx.lineTo(-4, -10);
  ctx.lineTo(4, -10);
  ctx.lineTo(8, 20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -12, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(7, -14);
  ctx.lineTo(22, -22);
  ctx.moveTo(-7, -14);
  ctx.lineTo(-22, -22);
  ctx.stroke();
}

function renderIsland(ctx: CanvasRenderingContext2D): void {
  // Hòn Trống Mái Sầm Sơn Thanh Hóa
  ctx.beginPath();
  ctx.ellipse(-8, 0, 7, 16, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, 2, 8, 14, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-18, 16, 36, 5);
}

function renderKite(ctx: CanvasRenderingContext2D): void {
  // Cánh diều lướt ván Mũi Né Bình Thuận
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(16, -4);
  ctx.lineTo(0, 18);
  ctx.lineTo(-16, -4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(0, 18);
  ctx.moveTo(-16, -4);
  ctx.lineTo(16, -4);
  ctx.stroke();
}

function renderPho(ctx: CanvasRenderingContext2D): void {
  // Bát ẩm thực Hải Phòng phố đêm
  ctx.beginPath();
  ctx.arc(0, 2, 18, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(-6, 18, 12, 4);
  ctx.beginPath();
  ctx.moveTo(-8, -4);
  ctx.quadraticCurveTo(-12, -12, -8, -18);
  ctx.moveTo(0, -4);
  ctx.quadraticCurveTo(-4, -14, 0, -20);
  ctx.moveTo(8, -4);
  ctx.quadraticCurveTo(4, -12, 8, -18);
  ctx.stroke();
}

function renderSun(ctx: CanvasRenderingContext2D): void {
  // Mặt trời Nghỉ Dưỡng Miễn Phí
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x1 = Math.cos(angle) * 14;
    const y1 = Math.sin(angle) * 14;
    const x2 = Math.cos(angle) * 20;
    const y2 = Math.sin(angle) * 20;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

function renderEco(ctx: CanvasRenderingContext2D): void {
  // Mầm cây sinh thái Hưng Yên Văn Giang
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, -6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.quadraticCurveTo(-18, -14, -12, 2);
  ctx.quadraticCurveTo(-2, 0, 0, -6);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.quadraticCurveTo(18, -10, 12, 6);
  ctx.quadraticCurveTo(2, 4, 0, -2);
  ctx.fill();
}

export const CULTURE_ICONS: Readonly<Record<string, IconRenderer>> = {
  dragon: renderDragon,
  lotus: renderLotus,
  mountain: renderMountain,
  pine: renderPine,
  lighthouse: renderLighthouse,
  island: renderIsland,
  kite: renderKite,
  pho: renderPho,
  sun: renderSun,
  eco: renderEco,
};

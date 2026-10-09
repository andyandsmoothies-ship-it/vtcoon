import type { IconRenderer } from './types';

function renderTower(ctx: CanvasRenderingContext2D): void {
  // Tháp Bitexco Quận 1 búp sen vươn cao & sân đỗ trực thăng
  ctx.beginPath();
  ctx.moveTo(-10, 22);
  ctx.lineTo(-12, 0);
  ctx.quadraticCurveTo(-10, -18, 0, -24);
  ctx.quadraticCurveTo(10, -18, 12, 0);
  ctx.lineTo(10, 22);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(8, -4, 9, 3, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function renderTurtle(ctx: CanvasRenderingContext2D): void {
  // Tháp Rùa Hồ Gươm Hoàn Kiếm 3 tầng cổ kính
  ctx.fillRect(-16, 12, 32, 10);
  ctx.fillRect(-12, 0, 24, 10);
  ctx.fillRect(-8, -10, 16, 8);
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(-4, -10);
  ctx.lineTo(4, -10);
  ctx.closePath();
  ctx.fill();
}

function renderLotusTower(ctx: CanvasRenderingContext2D): void {
  // Tháp Trầm Hương Nha Trang cánh sen
  ctx.beginPath();
  ctx.moveTo(-6, 20);
  ctx.lineTo(-12, 4);
  ctx.quadraticCurveTo(-8, -12, 0, -22);
  ctx.quadraticCurveTo(8, -12, 12, 4);
  ctx.lineTo(6, 20);
  ctx.closePath();
  ctx.fill();
}

function renderCham(ctx: CanvasRenderingContext2D): void {
  // Tháp Chăm Quy Nhơn Bình Định
  ctx.fillRect(-14, 8, 28, 12);
  ctx.fillRect(-10, -4, 20, 12);
  ctx.fillRect(-6, -14, 12, 10);
  ctx.beginPath();
  ctx.moveTo(0, -22);
  ctx.lineTo(-3, -14);
  ctx.lineTo(3, -14);
  ctx.closePath();
  ctx.fill();
}

function renderGate(ctx: CanvasRenderingContext2D): void {
  // Cổng Ngọ Môn Cố Đô Huế
  ctx.fillRect(-18, 4, 36, 14);
  ctx.beginPath();
  ctx.arc(0, 18, 8, Math.PI, 0);
  ctx.fillStyle = '#0F172A';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22, 4);
  ctx.lineTo(0, -6);
  ctx.lineTo(22, 4);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.lineTo(0, -18);
  ctx.lineTo(16, -6);
  ctx.closePath();
  ctx.fill();
}

function renderTemple(ctx: CanvasRenderingContext2D): void {
  // Miếu Bà Chúa Xứ Châu Đốc An Giang
  ctx.fillRect(-16, 6, 32, 12);
  ctx.beginPath();
  ctx.moveTo(-22, 6);
  ctx.lineTo(0, -6);
  ctx.lineTo(22, 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-16, -6);
  ctx.lineTo(0, -18);
  ctx.lineTo(16, -6);
  ctx.closePath();
  ctx.fill();
}

function renderHalong(ctx: CanvasRenderingContext2D): void {
  // Cánh buồm nâu Vịnh Hạ Long Quảng Ninh
  ctx.beginPath();
  ctx.moveTo(-14, 18);
  ctx.lineTo(-14, -18);
  ctx.quadraticCurveTo(8, -6, -14, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-20, 16);
  ctx.lineTo(20, 16);
  ctx.stroke();
}

export const LANDMARK_ICONS: Readonly<Record<string, IconRenderer>> = {
  tower: renderTower,
  turtle: renderTurtle,
  lotus_tower: renderLotusTower,
  cham: renderCham,
  gate: renderGate,
  temple: renderTemple,
  halong: renderHalong,
};

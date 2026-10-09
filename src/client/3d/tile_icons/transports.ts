import type { IconRenderer } from './types';

function renderBoat(ctx: CanvasRenderingContext2D): void {
  // Xuồng ba lá Cái Răng & gợn sóng miền Tây
  ctx.beginPath();
  ctx.moveTo(-22, 2);
  ctx.quadraticCurveTo(0, 16, 22, 2);
  ctx.quadraticCurveTo(0, 7, -22, 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -12);
  ctx.lineTo(12, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-10, 14, 5, 0, Math.PI);
  ctx.arc(10, 14, 5, 0, Math.PI);
  ctx.stroke();
}

function renderPlane(ctx: CanvasRenderingContext2D): void {
  // Máy bay cất cánh Cảng HKQT (Long Thành, Nội Bài)
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(4, -8);
  ctx.lineTo(24, 0);
  ctx.lineTo(24, 5);
  ctx.lineTo(4, 2);
  ctx.lineTo(3, 14);
  ctx.lineTo(10, 18);
  ctx.lineTo(10, 21);
  ctx.lineTo(0, 19);
  ctx.lineTo(-10, 21);
  ctx.lineTo(-10, 18);
  ctx.lineTo(-3, 14);
  ctx.lineTo(-4, 2);
  ctx.lineTo(-24, 5);
  ctx.lineTo(-24, 0);
  ctx.lineTo(-4, -8);
  ctx.closePath();
  ctx.fill();
}

function renderHighway(ctx: CanvasRenderingContext2D): void {
  // Tuyến Cao Tốc Bắc - Nam
  ctx.beginPath();
  ctx.moveTo(-8, -18);
  ctx.lineTo(-20, 20);
  ctx.lineTo(20, 20);
  ctx.lineTo(8, -18);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(0, -2);
  ctx.moveTo(0, 4);
  ctx.lineTo(0, 16);
  ctx.stroke();
}

function renderBridge(ctx: CanvasRenderingContext2D): void {
  // Cầu Ba Son (Cầu Thủ Thiêm 2) TP. Thủ Đức
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.lineTo(22, 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(10, 14);
  ctx.lineTo(0, -20);
  ctx.lineTo(-3, -20);
  ctx.lineTo(7, 14);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(-18, 14);
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 14);
  ctx.moveTo(0, -4);
  ctx.lineTo(-2, 14);
  ctx.stroke();
}

function renderGondola(ctx: CanvasRenderingContext2D): void {
  // Thuyền Gondola Grand World Phú Quốc
  ctx.beginPath();
  ctx.moveTo(-22, 6);
  ctx.quadraticCurveTo(0, 18, 22, -2);
  ctx.lineTo(24, -12);
  ctx.lineTo(20, -12);
  ctx.quadraticCurveTo(0, 12, -22, 6);
  ctx.closePath();
  ctx.fill();
}

function renderRoller(ctx: CanvasRenderingContext2D): void {
  // Vòng lượn siêu tốc Safari Đồng Nai
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, 18);
  ctx.lineTo(18, -18);
  ctx.stroke();
}

export const TRANSPORT_ICONS: Readonly<Record<string, IconRenderer>> = {
  boat: renderBoat,
  plane: renderPlane,
  highway: renderHighway,
  bridge: renderBridge,
  gondola: renderGondola,
  roller: renderRoller,
};

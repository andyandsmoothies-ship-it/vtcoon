import type { IconRenderer } from './types';

function renderBolt(ctx: CanvasRenderingContext2D): void {
  // Tia sét Tập Đoàn Điện Lực EVN
  ctx.beginPath();
  ctx.moveTo(4, -22);
  ctx.lineTo(-14, 0);
  ctx.lineTo(-2, 0);
  ctx.lineTo(-6, 22);
  ctx.lineTo(14, -2);
  ctx.lineTo(2, -2);
  ctx.closePath();
  ctx.fill();
}

function renderSignal(ctx: CanvasRenderingContext2D): void {
  // Viettel 5G trụ phát sóng viễn thông
  ctx.beginPath();
  ctx.moveTo(0, 20);
  ctx.lineTo(0, -14);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -14, 10, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.arc(0, -14, 18, -Math.PI * 0.75, -Math.PI * 0.25);
  ctx.stroke();
}

function renderBull(ctx: CanvasRenderingContext2D): void {
  // Sàn Chứng Khoán HOSE biểu đồ nến tăng
  ctx.fillRect(-18, 4, 8, 16);
  ctx.fillRect(-6, -6, 8, 26);
  ctx.fillRect(6, -18, 8, 38);
  ctx.beginPath();
  ctx.moveTo(-18, 2);
  ctx.lineTo(18, -20);
  ctx.stroke();
}

function renderChance(ctx: CanvasRenderingContext2D): void {
  // Dấu hỏi chấm may rủi Phiếu Cơ Hội
  ctx.font = '900 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 0, 2);
}

function renderChest(ctx: CanvasRenderingContext2D): void {
  // Rương cơ chế Thị Trường
  ctx.fillRect(-16, -2, 32, 18);
  ctx.beginPath();
  ctx.arc(0, -2, 16, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.strokeRect(-4, 2, 8, 8);
}

function renderChip(ctx: CanvasRenderingContext2D): void {
  // Vi mạch công nghệ cao Cầu Giấy Hà Nội
  ctx.fillRect(-12, -12, 24, 24);
  ctx.beginPath();
  [-8, 0, 8].forEach((x) => {
    ctx.moveTo(x, -18);
    ctx.lineTo(x, -12);
    ctx.moveTo(x, 12);
    ctx.lineTo(x, 18);
  });
  [-8, 0, 8].forEach((y) => {
    ctx.moveTo(-18, y);
    ctx.lineTo(-12, y);
    ctx.moveTo(12, y);
    ctx.lineTo(18, y);
  });
  ctx.stroke();
}

function renderCrane(ctx: CanvasRenderingContext2D): void {
  // Cần cẩu bốc dỡ Cảng Nước Sâu Cái Mép
  ctx.beginPath();
  ctx.moveTo(-14, 20);
  ctx.lineTo(-4, -14);
  ctx.lineTo(4, -14);
  ctx.lineTo(14, 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-22, -14);
  ctx.lineTo(22, -14);
  ctx.stroke();
  ctx.fillRect(8, -10, 8, 8);
}

function renderFlag(ctx: CanvasRenderingContext2D): void {
  // Cờ xuất phát Khởi Hành GO
  ctx.beginPath();
  ctx.moveTo(-10, 20);
  ctx.lineTo(-10, -20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-10, -20);
  ctx.lineTo(16, -10);
  ctx.lineTo(-10, 0);
  ctx.closePath();
  ctx.fill();
}

function renderGavel(ctx: CanvasRenderingContext2D): void {
  // Búa thẩm phán Lệnh Thanh Tra Thuế
  ctx.beginPath();
  ctx.moveTo(-12, -6);
  ctx.lineTo(12, -6);
  ctx.lineTo(12, -18);
  ctx.lineTo(-12, -18);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-3, -6, 6, 22);
  ctx.fillRect(-16, 16, 32, 5);
}

function renderGolf(ctx: CanvasRenderingContext2D): void {
  // Gậy & bóng golf Bình Dương
  ctx.beginPath();
  ctx.moveTo(-6, -18);
  ctx.lineTo(8, 14);
  ctx.lineTo(16, 14);
  ctx.lineTo(14, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-8, 14, 5, 0, Math.PI * 2);
  ctx.fill();
}

function renderShield(ctx: CanvasRenderingContext2D): void {
  // Khiên bảo hộ Trạm Kiểm Toán & Thanh Tra
  ctx.beginPath();
  ctx.moveTo(-16, -16);
  ctx.lineTo(16, -16);
  ctx.lineTo(14, 2);
  ctx.quadraticCurveTo(0, 20, 0, 20);
  ctx.quadraticCurveTo(-14, 2, -16, 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(0, 10);
  ctx.moveTo(-8, -2);
  ctx.lineTo(8, -2);
  ctx.stroke();
}

function renderTax(ctx: CanvasRenderingContext2D): void {
  // Túi thuế Đăng Ký Đất Đai
  ctx.beginPath();
  ctx.arc(0, 6, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(8, -8);
  ctx.lineTo(4, -16);
  ctx.lineTo(-4, -16);
  ctx.closePath();
  ctx.fill();
}

export function renderDefault(ctx: CanvasRenderingContext2D): void {
  // Biểu tượng kim cương / huy hiệu mặc định
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-16, 0);
  ctx.closePath();
  ctx.fill();
}

export const SYSTEM_ICONS: Readonly<Record<string, IconRenderer>> = {
  bolt: renderBolt,
  signal: renderSignal,
  bull: renderBull,
  chance: renderChance,
  chest: renderChest,
  chip: renderChip,
  crane: renderCrane,
  flag: renderFlag,
  gavel: renderGavel,
  golf: renderGolf,
  shield: renderShield,
  tax: renderTax,
  default: renderDefault,
};

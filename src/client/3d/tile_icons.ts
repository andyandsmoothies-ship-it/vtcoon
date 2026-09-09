// [UI-S01/MSS] Vietnamese Cultural 2D Vector Icons for 40 VTCoOn Board Tiles & Standees
// SSOT: docs/domain/design.md, src/client/3d/tile_texture_data.ts

export type IconRenderer = (ctx: CanvasRenderingContext2D) => void;

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

function renderDefault(ctx: CanvasRenderingContext2D): void {
  // Biểu tượng kim cương / huy hiệu mặc định
  ctx.beginPath();
  ctx.moveTo(0, -16);
  ctx.lineTo(16, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(-16, 0);
  ctx.closePath();
  ctx.fill();
}

export const ICON_RENDERERS: Readonly<Record<string, IconRenderer>> = {
  boat: renderBoat,
  plane: renderPlane,
  tower: renderTower,
  turtle: renderTurtle,
  dragon: renderDragon,
  lotus: renderLotus,
  mountain: renderMountain,
  pine: renderPine,
  lighthouse: renderLighthouse,
  lotus_tower: renderLotusTower,
  highway: renderHighway,
  bolt: renderBolt,
  signal: renderSignal,
  bull: renderBull,
  bridge: renderBridge,
  cham: renderCham,
  chance: renderChance,
  chest: renderChest,
  chip: renderChip,
  crane: renderCrane,
  eco: renderEco,
  flag: renderFlag,
  gate: renderGate,
  gavel: renderGavel,
  golf: renderGolf,
  gondola: renderGondola,
  halong: renderHalong,
  island: renderIsland,
  kite: renderKite,
  pho: renderPho,
  roller: renderRoller,
  shield: renderShield,
  sun: renderSun,
  tax: renderTax,
  temple: renderTemple,
  default: renderDefault,
};

export function drawIcon(
  ctx: CanvasRenderingContext2D,
  icon: string,
  cx: number,
  cy: number,
  color: string,
  scale = 1.0
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const renderer = ICON_RENDERERS[icon] ?? renderDefault;
  renderer(ctx);
  ctx.restore();
}

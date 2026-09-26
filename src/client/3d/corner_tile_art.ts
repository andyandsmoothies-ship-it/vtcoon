// [UI-S01/MSS][IMP-70] Procedural Canvas Artwork for 4 Corner Tiles (GO, Audit, Resort, Tax Order)
import { drawIcon } from './tile_icons';

export function drawGoCorner(ctx: CanvasRenderingContext2D, img?: HTMLImageElement): void {
  // Ô 0: Khởi Hành (GO) — Nền giấy ngà hoàng gia & hoa văn Đông Sơn
  ctx.fillStyle = '#FAF6ED';
  ctx.fillRect(0, 0, 384, 384);

  // Họa tiết vòng tròn mặt trời Trống Đồng Đông Sơn đồng tâm tinh tế
  ctx.strokeStyle = '#EBD8B8';
  ctx.lineWidth = 2;
  [45, 80, 115, 150].forEach((r) => {
    ctx.beginPath();
    ctx.arc?.(192, 192, r, 0, Math.PI * 2);
    ctx.stroke();
  });

  // Khung viền đôi mạ vàng hoàng gia
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 372, 372);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 360, 360);

  // Dải ruy băng xuất phát
  ctx.fillStyle = '#92400E';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('★ BẮT ĐẦU VÒNG CHƠI ★', 192, 38);

  // Cổng chào khải hoàn môn Art Deco & tiêu đề
  ctx.fillStyle = '#0F172A';
  ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('KHỞI HÀNH', 192, 82);

  ctx.fillStyle = '#D97706';
  ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('✦ GO ✦', 192, 116);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(40, 134, 304, 132, 10) : ctx.rect(40, 134, 304, 132);
    ctx.clip();
    ctx.drawImage(img, 40, 134, 304, 132);
    ctx.restore();
  } else {
    // Mũi tên 3D vàng kim nổi bật chỉ hướng xuất phát sang trái về phía Cần Thơ
    ctx.fillStyle = '#B45309';
    ctx.beginPath();
    ctx.moveTo(280, 195);
    ctx.lineTo(135, 195);
    ctx.lineTo(135, 168);
    ctx.lineTo(85, 210);
    ctx.lineTo(135, 252);
    ctx.lineTo(135, 225);
    ctx.lineTo(280, 225);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(276, 190);
    ctx.lineTo(135, 190);
    ctx.lineTo(135, 165);
    ctx.lineTo(88, 205);
    ctx.lineTo(135, 245);
    ctx.lineTo(135, 220);
    ctx.lineTo(276, 220);
    ctx.closePath();
    ctx.fill();
  }

  // Khay tiền thưởng dập nổi màu ngọc lục bảo
  ctx.fillStyle = '#047857';
  ctx.beginPath();
  ctx.roundRect(50, 275, 284, 52, 12);
  ctx.fill();

  ctx.fillStyle = '#ECFDF5';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('+2.000', 192, 301);

  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('KHI QUA Ô', 192, 348);
}

export function drawAuditCorner(ctx: CanvasRenderingContext2D, img?: HTMLImageElement): void {
  // Ô 10: Trạm Kiểm Toán & Thanh Tra — Sảnh kiểm toán đá hoa cương trang nghiêm
  ctx.fillStyle = '#141E33';
  ctx.fillRect(0, 0, 384, 384);

  // Tiêu đề cơ quan thanh tra uy nghiêm
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TRẠM KIỂM TOÁN', 192, 44);

  ctx.fillStyle = '#F87171';
  ctx.font = '900 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('THANH TRA', 192, 78);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(24, 100, 336, 136, 10) : ctx.rect(24, 100, 336, 136);
    ctx.clip();
    ctx.drawImage(img, 24, 100, 336, 136);
    ctx.restore();
  } else {
    // Hàng cột trụ La Mã cổ điển hai bên cánh
    [-1, 1].forEach((dir) => {
      const cx = dir === -1 ? 40 : 344;
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 16, 28, 32, 10);
      ctx.fillRect(cx - 16, 230, 32, 10);
      ctx.fillStyle = '#334155';
      ctx.fillRect(cx - 12, 38, 24, 192);
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      [-6, 0, 6].forEach((ox) => {
        ctx.beginPath();
        ctx.moveTo(cx + ox, 38);
        ctx.lineTo(cx + ox, 230);
        ctx.stroke();
      });
    });

    ctx.fillStyle = '#334155';
    ctx.fillRect(24, 20, 336, 12);
    drawIcon(ctx, 'shield', 192, 165, '#F59E0B', 2.2);

    ctx.strokeStyle = '#FEF08A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(176, 160);
    ctx.lineTo(208, 160);
    ctx.moveTo(192, 150);
    ctx.lineTo(192, 172);
    ctx.stroke();
  }

  // Phân định rõ 2 phân khu: VÀO THĂM (trái) và TẠM GIAM (phải)
  // 1. Phân khu Vào Thăm (Hành lang ngoài - An toàn)
  ctx.fillStyle = '#065F46';
  ctx.beginPath();
  ctx.roundRect(26, 248, 160, 68, 10);
  ctx.fill();
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#6EE7B7';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('VÀO THĂM', 106, 272);
  ctx.fillStyle = '#D1FAE5';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('(Chỉ Đi Ngang)', 106, 296);

  // 2. Phân khu Tạm Giam (Song sắt nội khu - Bị Phạt)
  ctx.fillStyle = '#7F1D1D';
  ctx.beginPath();
  ctx.roundRect(198, 248, 160, 68, 10);
  ctx.fill();
  ctx.strokeStyle = '#F87171';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Song sắt nhà giam
  ctx.strokeStyle = '#94A3B8';
  ctx.lineWidth = 2;
  [215, 235, 255, 301, 321, 341].forEach((bx) => {
    ctx.beginPath();
    ctx.moveTo(bx, 250);
    ctx.lineTo(bx, 314);
    ctx.stroke();
  });

  ctx.fillStyle = '#FCA5A5';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('TẠM GIAM', 278, 272);
  ctx.fillStyle = '#FEE2E2';
  ctx.font = 'bold 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('(Nộp Phạt 500)', 278, 296);

  // Chú thích đáy
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('VÀO THĂM / TẠM GIAM', 192, 345);

  // Khung viền đôi đỏ đô & bạc
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 372, 372);
  ctx.strokeStyle = '#64748B';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 360, 360);
}

export function drawResortCorner(ctx: CanvasRenderingContext2D, img?: HTMLImageElement): void {
  // Ô 20: Nghỉ Dưỡng Miễn Phí — Phong cảnh vịnh biển ngọc bích nhiệt đới Phú Quốc
  ctx.fillStyle = '#E0F2FE';
  ctx.fillRect(0, 0, 384, 384);

  // Tiêu đề bến dừng chân
  ctx.fillStyle = '#0369A1';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('BẾN DỪNG CHÂN', 192, 42);

  ctx.fillStyle = '#065F46';
  ctx.font = '900 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('NGHỈ DƯỠNG', 192, 82);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(24, 102, 336, 172, 10) : ctx.rect(24, 102, 336, 172);
    ctx.clip();
    ctx.drawImage(img, 24, 102, 336, 172);
    ctx.restore();
  } else {
    // Mặt biển xanh ngọc bích
    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.bezierCurveTo(90, 115, 190, 145, 280, 125);
    ctx.bezierCurveTo(330, 115, 360, 125, 384, 120);
    ctx.lineTo(384, 270);
    ctx.lineTo(0, 270);
    ctx.closePath();
    ctx.fill();

    // Bọt sóng biển trắng
    ctx.strokeStyle = '#BAE6FD';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, 130);
    ctx.bezierCurveTo(90, 115, 190, 145, 280, 125);
    ctx.bezierCurveTo(330, 115, 360, 125, 384, 120);
    ctx.stroke();

    // Bờ cát vàng nhiệt đới mịn màng
    ctx.fillStyle = '#FDE68A';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    ctx.bezierCurveTo(120, 215, 240, 265, 384, 230);
    ctx.lineTo(384, 384);
    ctx.lineTo(0, 384);
    ctx.closePath();
    ctx.fill();

    // Thân cây dừa cong vươn ra biển
    ctx.strokeStyle = '#78350F';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(330, 265);
    ctx.quadraticCurveTo(345, 180, 305, 130);
    ctx.stroke();

    // Tán lá dừa nhiệt đới xanh mát
    ctx.fillStyle = '#15803D';
    [-1.2, -0.6, 0, 0.6, 1.2].forEach((ang) => {
      ctx.beginPath();
      ctx.ellipse(305 + Math.cos(ang) * 28, 130 + Math.sin(ang) * 20, 26, 8, ang, 0, Math.PI * 2);
      ctx.fill();
    });

    // Cánh buồm trắng ngoài khơi
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(110, 160);
    ctx.lineTo(125, 135);
    ctx.lineTo(125, 160);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(105, 160, 24, 3);

    // Mặt trời vàng rạng rỡ góc trời
    drawIcon(ctx, 'sun', 70, 75, '#F59E0B', 1.8);
  }

  // Badge miễn phí dừng bước
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(46, 285, 292, 50, 12);
  ctx.fill();

  ctx.fillStyle = '#ECFDF5';
  ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('MIỄN PHÍ DỪNG BƯỚC', 192, 310);

  ctx.fillStyle = '#065F46';
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('KHÔNG MẤT TIỀN THUÊ', 192, 355);

  // Khung viền xanh ngọc & vàng cát
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 372, 372);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 12, 360, 360);
}

export function drawTaxOrderCorner(ctx: CanvasRenderingContext2D, img?: HTMLImageElement): void {
  // Ô 30: Lệnh Thanh Tra Thuế — Trát lệnh thanh tra tư pháp viền son dát vàng
  ctx.fillStyle = '#2A0808';
  ctx.fillRect(0, 0, 384, 384);

  // Khổ giấy trát lệnh tư pháp nền ngà cổ điển
  ctx.fillStyle = '#FDF8EE';
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(20, 20, 344, 344, 12) : ctx.rect(20, 20, 344, 344);
  ctx.fill();

  // Viền hoa văn son vàng trát lệnh
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 28, 328, 328);
  ctx.strokeStyle = '#D97706';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, 316, 316);

  // Tiêu đề lệnh tòa án
  ctx.fillStyle = '#991B1B';
  ctx.font = '900 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('LỆNH TÒA ÁN', 192, 58);

  ctx.fillStyle = '#DC2626';
  ctx.font = '900 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('THANH TRA THUẾ', 192, 98);

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(40, 114, 304, 154, 10) : ctx.rect(40, 114, 304, 154);
    ctx.clip();
    ctx.drawImage(img, 40, 114, 304, 154);
    ctx.restore();
  } else {
    // Búa thẩm phán gõ đệm đồng uy quyền
    drawIcon(ctx, 'gavel', 192, 175, '#B91C1C', 2.4);

    // Mũi tên dẫn hướng cưỡng chế về Ô 10
    ctx.fillStyle = '#DC2626';
    ctx.beginPath();
    ctx.moveTo(270, 235);
    ctx.lineTo(130, 235);
    ctx.lineTo(130, 220);
    ctx.lineTo(95, 245);
    ctx.lineTo(130, 270);
    ctx.lineTo(130, 255);
    ctx.lineTo(270, 255);
    ctx.closePath();
    ctx.fill();
  }

  // Badge dẫn giải về trạm kiểm toán
  ctx.fillStyle = '#991B1B';
  ctx.beginPath();
  ctx.roundRect(40, 280, 304, 52, 10);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('ĐẾN Ô KIỂM TOÁN (10)', 192, 306);

  ctx.fillStyle = '#78350F';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('DI CHUYỂN NGAY • KHÔNG NHẬN GO', 192, 350);

  // Khung viền ngoài đỏ son tư pháp
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 372, 372);
}

export const CORNER_DRAWERS: Readonly<Record<number, (ctx: CanvasRenderingContext2D, img?: HTMLImageElement) => void>> = {
  0: drawGoCorner,
  10: drawAuditCorner,
  20: drawResortCorner,
  30: drawTaxOrderCorner,
};

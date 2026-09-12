// [UI-S04/MSS] AuctionDeedTexture — HiDPI 2D Canvas Texture Generator for 3D Collector Card
import { CanvasTexture, SRGBColorSpace } from 'three';
import { formatCurrency } from '../ui/ui_helpers';

/**
 * Sinh Texture bề mặt thẻ bài 3D Sổ Đỏ tỷ lệ vàng HiDPI (chữ dập nổi mạ vàng, không rườm rà hành chính)
 */
export function generateAuctionDeedTexture(
  cellIndex: number,
  name: string,
  ribbonColor: string,
  price: number,
  currentBid: number
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

  // 1. Nền phiến đá đen Obsidian sang trọng (Luxury Dark Slate)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, '#090D1A');
  bgGrad.addColorStop(0.5, '#0F172A');
  bgGrad.addColorStop(1, '#050814');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // 2. Viền kim loại kép mạ vàng Champagne dập nổi
  const goldGrad = ctx.createLinearGradient(0, 0, w, h);
  goldGrad.addColorStop(0, '#FEF08A');
  goldGrad.addColorStop(0.3, '#F59E0B');
  goldGrad.addColorStop(0.7, '#D97706');
  goldGrad.addColorStop(1, '#FBBF24');

  ctx.strokeStyle = goldGrad;
  ctx.lineWidth = 3;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // 3. Header Ribbon phân khu BĐS cao cấp
  ctx.fillStyle = ribbonColor;
  ctx.beginPath();
  ctx.roundRect(14, 14, w - 28, 64, 8);
  ctx.fill();
  ctx.strokeStyle = '#FEF08A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FEF08A';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ BẤT ĐỘNG SẢN DANH GIÁ VTCOON ★', w / 2, 30);

  // 4. Nhãn tên đường dập nổi chữ kim loại vàng (bỏ văn bản hành chính dài dòng)
  ctx.save();
  ctx.font = '900 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(name.toUpperCase(), w / 2, 56);
  ctx.strokeStyle = '#FDE047';
  ctx.lineWidth = 0.8;
  ctx.strokeText(name.toUpperCase(), w / 2, 56);
  ctx.restore();

  // 5. Khung kính ngắm Hologram trung tâm (nơi mô hình 3D Sapphire Landmark xoay nhẹ)
  ctx.save();
  ctx.strokeStyle = '#06B6D4';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w / 2, 150, 48, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(w / 2, 150, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
  ctx.beginPath();
  ctx.arc(w / 2, 150, 47, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 6. Nhãn thông số quy hoạch tối giản
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`MÃ VỊ TRÍ QUY HOẠCH: #${cellIndex.toString().padStart(2, '0')}`, w / 2, 222);

  // 7. Bảng thông tin giá khởi điểm & giá đấu hiện tại phong cách Cyber-Luxury
  ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.beginPath();
  ctx.roundRect(18, 236, w - 36, 56, 8);
  ctx.fill();
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 9px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('GIÁ KHỞI ĐIỂM:', 28, 256);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#E2E8F0';
  ctx.font = 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText(formatCurrency(price), w - 28, 256);

  ctx.fillStyle = '#FDE047';
  ctx.textAlign = 'left';
  ctx.font = 'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillText('GIÁ ĐẤU HIỆN TẠI:', 28, 278);
  ctx.textAlign = 'right';
  ctx.font = '900 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = '#FBBF24';
  ctx.fillText(formatCurrency(currentBid), w - 28, 278);

  // 8. Huy hiệu bảo chứng độc quyền dưới chân thẻ
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath();
  ctx.roundRect(32, 308, w - 64, 28, 14);
  ctx.fill();

  ctx.fillStyle = '#0F172A';
  ctx.font = '900 10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ THẺ SỞ HỮU TOÀN QUYỀN ★', w / 2, 326);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

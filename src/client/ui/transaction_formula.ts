// [IMP-216] Transaction Formula Descriptor Submodule
import type { FloatingTextItem } from '../store/game_store.js';
import {
  TELECOM_DATA_FEE,
  MIN_BAIL_AMOUNT,
  GO_PROPERTY_TAX_CAP,
} from '../../domain/property_rent.js';

export function resolveFormulaText(
  item: FloatingTextItem,
  cellName: string,
  isPositive: boolean,
): string {
  if (typeof item.formula === 'string') return item.formula.trim();
  if (item.formula === null) return '';

  switch (item.actionType) {
    case 'bail':
      if (item.bailKind === 'forced' || item.title?.includes('Hết 3 lượt') || item.title?.includes('bắt buộc') || item.title?.includes('Cưỡng chế')) {
        return 'Hết 3 lượt không ra đôi: Phạt bảo lãnh bắt buộc';
      }
      return `Bảo lãnh sớm: 10% tài sản ròng (Sàn ${MIN_BAIL_AMOUNT} Tr.)`;
    case 'audit_jail':
      if (item.bailKind === 'doubles' || item.title?.includes('đôi') || item.text === '0 Tr.' || item.text === '+0 Tr.') {
        return 'Gieo xúc xắc đôi: Thoát kiểm toán miễn phí';
      }
      return 'Bị tạm giữ tại Trạm Kiểm Toán';
    case 'tax':
      if (item.cellIndex === 4 || item.title?.includes('Đất Đai')) {
        return 'Lệ phí trước bạ: 10% tiền mặt (Tối đa 2.000 Tr.)';
      }
      if (item.title?.includes('vượt GO') || item.title?.includes('tài sản')) {
        return `Thuế tài sản qua GO (Tối đa ${(GO_PROPERTY_TAX_CAP ?? 1000).toLocaleString('vi-VN')} Tr.)`;
      }
      return 'Nộp ngân sách theo quy định Kho Bạc';
    case 'rent_pay':
    case 'rent_receive': {
      if (item.cellIndex === 12 || item.title?.includes('EVN') || item.title?.includes('điện')) {
        return 'Hóa đơn tiền điện EVN khi qua ô Khởi Hành';
      }
      if (item.cellIndex === 28 || item.title?.includes('Viettel') || item.title?.includes('viễn thông') || item.title?.includes('data')) {
        return `Cước data viễn thông Viettel (${TELECOM_DATA_FEE} Tr.)`;
      }
      if (item.title?.includes('Độc quyền') || item.title?.includes('x2')) {
        const rawTitle = item.title?.replace(/^Độc\s+quyền\s+nhóm\s+màu\s*(?:\(x2\s+tiền\s+thuê\))?:\s*/i, '').replace(/^Tiền\s+thuê\s*/i, '').trim();
        return `Độc quyền nhóm màu (x2 tiền thuê): ${cellName || rawTitle || 'BĐS'}`;
      }
      const effectiveCell = cellName || item.title?.replace(/^Tiền\s+thuê\s*/i, '').trim() || '';
      return effectiveCell ? `Tiền thuê lưu trú tại ${effectiveCell}` : 'Tiền thuê lưu trú BĐS';
    }
    case 'salary':
      return 'Hoàn thành 1 vòng: Thưởng lương qua ô Khởi Hành';
    case 'buy':
      return '';
    case 'upgrade':
      return '';
    case 'mortgage':
      return 'Vay vốn tín dụng ngân hàng (50% giá trị đất)';
    case 'unmortgage':
      return 'Chuộc lại đất thế chấp (Gốc + 10% phí Kho Bạc)';
    case 'diplomatic':
      if (item.title?.includes('Hụt thu') || item.title?.includes('Khách dùng')) {
        return 'Khách dùng Thẻ Ngoại Giao: Hụt thu tiền thuê';
      }
      return 'Đặc quyền ngoại giao: Miễn 100% tiền thuê BĐS';
    case 'auction_win':
      return 'Thắng phiên đấu giá công khai BĐS';
    case 'hose':
      return isPositive ? 'Chi trả cổ tức từ sàn HOSE' : 'Đầu tư mua chứng khoán HOSE';
    case 'stimulus':
      return 'Nhận gói trợ cấp an sinh từ Quỹ Kho Bạc';
    case 'debt_relief':
      return 'Hoàn tất thanh toán nợ: Thoát bờ vực phá sản';
    default:
      return item.title || 'Biến động tài chính theo quy định';
  }
}

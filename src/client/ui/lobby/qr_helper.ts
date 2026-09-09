// [TC-NET02.3/MSS] QR Code Generator Helper — Tạo mã QR và liên kết mời vào phòng
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import QRCode from 'qrcode';
import { ROOM_CODE_REGEX } from '../../store/lobby_types';

export interface QrRenderOptions {
  readonly margin?: number;
  readonly width?: number;
  readonly darkColor?: string;
  readonly lightColor?: string;
}

export const DEFAULT_QR_OPTIONS: QrRenderOptions = {
  margin: 2,
  width: 220,
  darkColor: '#0f172a', // Slate 900
  lightColor: '#ffffff',
} as const;

/**
 * Sinh chuỗi SVG của mã QR.
 * Hoạt động thuần JavaScript trên cả Node.js (test) và Browser (runtime),
 * không phụ thuộc vào HTMLCanvasElement.
 */
export async function generateQrSvg(
  text: string,
  options?: QrRenderOptions
): Promise<string> {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error('Nội dung mã QR không được để trống');
  }

  const merged = { ...DEFAULT_QR_OPTIONS, ...options };
  return QRCode.toString(trimmed, {
    type: 'svg',
    margin: merged.margin,
    width: merged.width,
    color: {
      dark: merged.darkColor,
      light: merged.lightColor,
    },
  });
}

/**
 * Chuyển đổi chuỗi SVG thành Data URL để gán vào thẻ <img src="..." />.
 */
export async function generateQrDataUrl(
  text: string,
  options?: QrRenderOptions
): Promise<string> {
  const svgString = await generateQrSvg(text, options);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

/**
 * Sinh liên kết URL mời vào phòng đấu hợp lệ.
 */
export function buildRoomInviteUrl(roomCode: string, origin?: string): string {
  const code = roomCode.trim().toUpperCase();
  if (!ROOM_CODE_REGEX.test(code)) {
    throw new Error('Mã phòng không hợp lệ (phải gồm đúng 6 ký tự chữ hoa hoặc số)');
  }
  const base =
    origin ??
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://vtcoon.vn');
  return `${base}/?room=${encodeURIComponent(code)}`;
}

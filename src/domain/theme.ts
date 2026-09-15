// Design Tokens — Bảng màu ngữ nghĩa theo design.md (Văn hoá Việt Nam)
// Nguồn: docs/domain/design.md — Hệ thống màu 8 sắc bản địa

/** Màu bề mặt ô bàn cờ (nền tối trung tính) */
export const BOARD_SURFACE = '#2a2a3e' as const;

/**
 * Bảng màu quân cờ người chơi — 6 sắc văn hóa Việt Nam.
 * Thứ tự: Đỏ Đô, Xanh Da Trời, Xanh Lục Bảo, Cam Nắng, Tím Hoàng Gia, Vàng Ánh Kim
 */
export const PLAYER_TOKEN_PALETTE = [
  '#c0392b', // Đỏ Đô (Crimson Red)      — Cạnh 3: Thanh Hóa, Nghệ An, Ninh Bình
  '#2980b9', // Xanh Da Trời (Sky Blue)  — Cạnh 1: Bình Dương, Đồng Nai, Vũng Tàu
  '#27ae60', // Xanh Lục Bảo (Emerald)   — Cạnh 4: Hưng Yên, Hà Nội, Hoàn Kiếm
  '#e67e22', // Cam Nắng (Warm Orange)   — Cạnh 2: Bình Định, Huế, Đà Nẵng
  '#8e44ad', // Tím Hoàng Gia (Royal Purple)— Cạnh 4: TP.Thủ Đức, Q.Nguyễn Huệ
  '#f1c40f', // Vàng Ánh Kim (Golden)    — Cạnh 3: Hải Phòng, Phú Quốc, Hạ Long
] as const;

import { ColorGroup } from './board_config';

/** Bảng màu HEX nhận diện nhóm đất — SSOT: docs/domain/design.md */
export const COLOR_GROUP_HEX: Record<ColorGroup, string> = {
  [ColorGroup.Nau]:        '#8B5E3C',
  [ColorGroup.XanhDaTroi]: '#2980b9',
  [ColorGroup.Hong]:       '#FF6B6B',
  [ColorGroup.Cam]:        '#FF8C42',
  [ColorGroup.Do]:         '#C0392B',
  [ColorGroup.Vang]:       '#F1C40F',
  [ColorGroup.XanhLa]:     '#27AE60',
  [ColorGroup.Tim]:        '#8E44AD',
} as const;

/**
 * [IMP-61] Bảng thiết kế đồ chơi cờ bàn xúc xắc cổ điển (Tabletop Theme SSOT)
 * Nguồn: Retropoly & Monopoly Plus Tabletop reference.
 * Tone giấy ngà sáng cổ điển, mực in đen đậm, thảm nỉ cờ bàn, nút bấm đồ chơi xúc giác.
 */
export const TABLETOP_THEME = {
  cardBg: '#FFFDF8',
  cardBgWarm: '#F7F2E7',
  cardBorder: '#1E293B',
  cardShadow: 'shadow-[0_6px_0_0_#0f172a]',
  textInkDark: '#0F172A',
  textInkMuted: '#475569',
  feltMatBlue: 'bg-blue-950/80 border-2 border-blue-500/60',
  feltMatRed: 'bg-rose-950/80 border-2 border-rose-500/60',
  btnEmerald: {
    bg: 'bg-emerald-500 hover:bg-emerald-600',
    text: 'text-white font-bold',
    shadow: 'shadow-[0_4px_0_0_#065f46]',
    border: 'border-2 border-emerald-700',
  },
  btnAmber: {
    bg: 'bg-amber-500 hover:bg-amber-600',
    text: 'text-white font-bold',
    shadow: 'shadow-[0_4px_0_0_#b45309]',
    border: 'border-2 border-amber-700',
  },
  btnPaper: {
    bg: 'bg-[#FFFDF8] hover:bg-[#F7F2E7]',
    text: 'text-slate-900 font-bold',
    shadow: 'shadow-[0_4px_0_0_#0f172a]',
    border: 'border-2 border-slate-900',
  },
} as const;


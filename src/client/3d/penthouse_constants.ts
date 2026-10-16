// [TC-P3.1/MSS][IMP-419] penthouse_constants.ts — Hằng số kiến trúc & Bảng màu Penthouse Lounge

export const PENTHOUSE_DIMENSIONS = {
  tableRadius: 1.8,
  tableHeight: 0.95,
  carpetRadius: 3.4,
  chairDistance: 2.45,
  ceilingHeight: 4.8,
  roomRadius: 12,
} as const;

export const PENTHOUSE_COLORS = {
  marbleFloor: '#0B0F19',
  carpet: '#1E293B',
  goldBezel: '#F59E0B',
  walnutTrim: '#3E2723',
  chairLeather: '#D4C5B9',
  chairLeg: '#D97706',
  hologramCyan: '#06B6D4',
  hologramAmber: '#F59E0B',
  sunsetGlow: '#FB923C',
  wallMarble: '#F1F5F9',
  coveWarm: '#FDE047',
} as const;

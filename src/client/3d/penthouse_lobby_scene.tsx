// [TC-P3.1/MSS][IMP-21] PenthouseLobbyScene — Cầu nối tương thích ngược & Re-export SunnyIslandLobbyScene
// Duy trì 100% hợp đồng API và hằng số kiến trúc để tương thích ngược toàn diện
export { generateHologramScreenTexture, generateSunsetBackdropTexture } from './penthouse_texture_generator';
export { PenthouseEnclosure, PenthouseEnclosure as PenthouseArchitecture } from './penthouse_enclosure';
export { LuxuryPawnModel, LUXURY_PAWN_CONFIGS } from './luxury_pawn_models';
export { CentralHologram, calculateHologramBob, calculateRadarRingRotations, HOLOGRAM_COLORS } from './penthouse_hologram';
export {
  SEAT_ANGLES_DEG,
  calculateSeatPosition,
  calculateSeatRotationY,
  calculateAvatarBob,
  SUNNY_LOBBY_CAMERA_CONFIG,
  SUNNY_LOBBY_COLORS,
  SunnyIslandLobbyScene,
  SunnyIslandLobbyScene as PenthouseLobbyScene,
} from './sunny_island_lobby_scene';

export const PENTHOUSE_CAMERA_CONFIG = {
  initialPosition: [3.8, 3.2, 5.2] as const,
  target: [-0.2, 1.15, -0.3] as const,
  minDistance: 3.5,
  maxDistance: 9.5,
  minPolarAngle: Math.PI / 4.5,
  maxPolarAngle: Math.PI / 2.1,
} as const;

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

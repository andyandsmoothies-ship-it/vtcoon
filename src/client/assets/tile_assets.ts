// [UI-S02/MSS] Tile Asset Manager & Preloader — Resolves DEBT-UI01-01
// Manages standard 512x512 WebP URLs for all 28 property tiles x 4 levels
import { PROPERTY_DEEDS } from '../../domain/property_data';

export type PropertyLevel = 0 | 1 | 2 | 3;
export const PROPERTY_LEVELS: readonly PropertyLevel[] = [0, 1, 2, 3] as const;

export const PURCHASABLE_TILE_INDICES: readonly number[] = Array.from(
  PROPERTY_DEEDS.keys()
).sort((a, b) => a - b);

export function getTileAssetUrl(tileIndex: number, level: number): string {
  if (!Number.isInteger(level) || level < 0 || level > 3) {
    throw new Error(`Invalid property level: ${level}. Must be 0, 1, 2, or 3.`);
  }
  if (!PROPERTY_DEEDS.has(tileIndex)) {
    throw new Error(`Invalid tile index: ${tileIndex}. Not a purchasable property tile.`);
  }
  const paddedId = String(tileIndex).padStart(2, '0');
  return `/assets/tiles/tile_${paddedId}_lvl${level}.webp`;
}

export function getAllTileAssetUrls(): string[] {
  const urls: string[] = [];
  for (const tileIndex of PURCHASABLE_TILE_INDICES) {
    for (const level of PROPERTY_LEVELS) {
      urls.push(getTileAssetUrl(tileIndex, level));
    }
  }
  return urls;
}

export function preloadTileAssets(): string[] {
  // [Phase 3 Visual Polish] Tra ve danh sach URLs ma khong khoi tao Image ao gay 404
  return getAllTileAssetUrls();
}


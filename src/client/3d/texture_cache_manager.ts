// [IMP-162] Centralized 3D Texture Cache Manager for WebGL Context Loss & Memory Leak Defense
import { clearTileTextureCache } from './tile_texture_generator';
import { clearStandeeWebpCache } from './board_tile';
import { clearMascotTextureCache } from './mascot_canvas_texture';
import { clearHeritageTileTextureCache } from './heritage_tile_texture';
import { clearPriceTextureCache } from './owner_property_markers';
import { clearEmoteCanvasCache } from './pawn_animator';

/**
 * Disposes all GPU texture allocations and clears texture caches across all 3D subsystems.
 * Triggered on WebGL context restoration and component unmount.
 */
export function clearAll3DTextureCaches(): void {
  clearTileTextureCache();
  clearStandeeWebpCache();
  clearMascotTextureCache();
  clearHeritageTileTextureCache();
  clearPriceTextureCache();
  clearEmoteCanvasCache();
}

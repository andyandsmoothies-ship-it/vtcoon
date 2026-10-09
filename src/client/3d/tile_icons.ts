// [UI-S01/MSS] Vietnamese Cultural 2D Vector Icons for 40 VTCoOn Board Tiles & Standees
// SSOT: docs/domain/design.md, src/client/3d/tile_texture_data.ts

import type { IconRenderer } from './tile_icons/types';
import { TRANSPORT_ICONS } from './tile_icons/transports';
import { LANDMARK_ICONS } from './tile_icons/landmarks';
import { CULTURE_ICONS } from './tile_icons/culture';
import { SYSTEM_ICONS, renderDefault } from './tile_icons/systems';

export type { IconRenderer } from './tile_icons/types';

export const ICON_RENDERERS: Readonly<Record<string, IconRenderer>> = {
  ...TRANSPORT_ICONS,
  ...LANDMARK_ICONS,
  ...CULTURE_ICONS,
  ...SYSTEM_ICONS,
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

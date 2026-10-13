import { CanvasTexture } from 'three';
import { BOARD_CONFIG, CellType } from '../../domain/board_config';
import { PROPERTY_DEEDS } from '../../domain/property_data';
import { formatPriceLabel, TILE_METADATA_MAP } from './tile_texture_data';

export const PILL_ATLAS_COLS = 4;
export const PILL_ATLAS_ROWS = 8;
export const PILL_ATLAS_WIDTH = 1024;
export const PILL_ATLAS_HEIGHT = 512;
export const PILL_SLOT_WIDTH = PILL_ATLAS_WIDTH / PILL_ATLAS_COLS;
export const PILL_SLOT_HEIGHT = PILL_ATLAS_HEIGHT / PILL_ATLAS_ROWS;

const ATLAS_PURCHASABLE_CELL_INDICES: readonly number[] = BOARD_CONFIG
  .filter((c) => c.type === CellType.Property || c.type === CellType.Railroad || c.type === CellType.Utility)
  .map((c) => c.index);

const ATLAS_INDEX_TO_SLOT: ReadonlyMap<number, number> = new Map(
  ATLAS_PURCHASABLE_CELL_INDICES.map((cellIdx, slot) => [cellIdx, slot])
);

export interface PricePillAtlasUVRect {
  readonly uMin: number;
  readonly vMin: number;
  readonly uMax: number;
  readonly vMax: number;
}

export function getPricePillAtlasUVs(cellIndex: number): PricePillAtlasUVRect {
  const rawSlot = ATLAS_INDEX_TO_SLOT.get(cellIndex);
  const slot = rawSlot !== undefined ? rawSlot : Math.max(0, cellIndex);
  const col = slot % PILL_ATLAS_COLS;
  const row = Math.floor(slot / PILL_ATLAS_COLS);
  const halfU = 0.5 / PILL_ATLAS_WIDTH;
  const halfV = 0.5 / PILL_ATLAS_HEIGHT;
  return {
    uMin: col / PILL_ATLAS_COLS + halfU,
    uMax: (col + 1) / PILL_ATLAS_COLS - halfU,
    vMin: 1.0 - (row + 1) / PILL_ATLAS_ROWS + halfV,
    vMax: 1.0 - row / PILL_ATLAS_ROWS - halfV,
  };
}

let cachedAtlasTexture: CanvasTexture | null = null;
let cachedCanvas: HTMLCanvasElement | null = null;
let lastSerializedState: string = '';

export interface PricePillSlotVisualDescriptor {
  readonly slot: number;
  readonly cellIndex: number;
  readonly priceText: string;
  readonly priceColor: string;
  readonly mascotIcon?: string;
  readonly hasOwner: boolean;
}

export function computePricePillSlotDescriptor(
  cellIndex: number,
  ownerInfo?: { tokenColor?: string; mascotIcon?: string }
): PricePillSlotVisualDescriptor | null {
  const slot = ATLAS_INDEX_TO_SLOT.get(cellIndex);
  if (slot === undefined) return null;
  const hasOwner = Boolean(ownerInfo?.tokenColor && ownerInfo.tokenColor.length > 0);
  const price = PROPERTY_DEEDS.get(cellIndex)?.price ?? TILE_METADATA_MAP[cellIndex]?.price;
  const priceText = formatPriceLabel(price);
  const priceColor = hasOwner ? '#FFFFFF' : '#FBBF24';
  return {
    slot,
    cellIndex,
    priceText,
    priceColor,
    mascotIcon: ownerInfo?.mascotIcon,
    hasOwner,
  };
}

export function renderPricePillAtlasCanvas(
  canvas: HTMLCanvasElement,
  ownerInfoMap?: Record<number, { tokenColor: string; mascotIcon?: string }>
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, PILL_ATLAS_WIDTH, PILL_ATLAS_HEIGHT);

  ATLAS_PURCHASABLE_CELL_INDICES.forEach((cellIndex) => {
    const desc = computePricePillSlotDescriptor(cellIndex, ownerInfoMap?.[cellIndex]);
    if (!desc) return;

    const col = desc.slot % PILL_ATLAS_COLS;
    const row = Math.floor(desc.slot / PILL_ATLAS_COLS);
    const startX = col * PILL_SLOT_WIDTH;
    const startY = row * PILL_SLOT_HEIGHT;

    if (desc.hasOwner && desc.mascotIcon) {
      ctx.save();
      ctx.font = '28px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(desc.mascotIcon, startX + 38, startY + 32);
      ctx.restore();

      ctx.save();
      ctx.font = '900 28px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = desc.priceColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(desc.priceText, startX + 140, startY + 32);
      ctx.restore();
    } else {
      ctx.save();
      ctx.font = '900 32px "Segoe UI", Roboto, sans-serif';
      ctx.fillStyle = desc.priceColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(desc.priceText, startX + 128, startY + 32);
      ctx.restore();
    }
  });
}

export function getPricePillAtlasTexture(
  ownerInfoMap?: Record<number, { tokenColor: string; mascotIcon?: string }>
): CanvasTexture | null {
  if (typeof document === 'undefined') return null;

  const currentState = JSON.stringify(ownerInfoMap ?? {});

  if (cachedAtlasTexture && cachedCanvas) {
    if (currentState !== lastSerializedState) {
      renderPricePillAtlasCanvas(cachedCanvas, ownerInfoMap);
      cachedAtlasTexture.needsUpdate = true;
      lastSerializedState = currentState;
    }
    return cachedAtlasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = PILL_ATLAS_WIDTH;
  canvas.height = PILL_ATLAS_HEIGHT;
  cachedCanvas = canvas;

  renderPricePillAtlasCanvas(canvas, ownerInfoMap);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  cachedAtlasTexture = texture;
  lastSerializedState = currentState;
  return texture;
}

export function clearPricePillAtlasCache(): void {
  if (cachedAtlasTexture && typeof cachedAtlasTexture.dispose === 'function') {
    cachedAtlasTexture.dispose();
  }
  cachedAtlasTexture = null;
  cachedCanvas = null;
  lastSerializedState = '';
}

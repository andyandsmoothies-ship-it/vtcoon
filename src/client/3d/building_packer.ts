// [UI-S02/MSS][IMP-258] 3D Miniature Bin-Packing for Procedural Property Stacking
// Adapted from Heapscape spatial.js: packBoxes

export interface BoxItem {
  readonly id: string;
  readonly size: readonly [number, number, number]; // [width (x), height (y), depth (z)]
}

export interface PackedSlot {
  readonly position: [number, number, number];
  readonly size: [number, number, number];
}

export interface PackBoxesOptions {
  readonly gap?: number;
  readonly maxLotBounds?: readonly [number, number];
  readonly center?: boolean;
  readonly baseAnchoredY?: boolean;
  readonly preferredWidth?: number;
}

export interface PackBoxesResult {
  readonly slots: ReadonlyMap<string, PackedSlot>;
  readonly extent: readonly [number, number, number];
  readonly scale: number;
}

export function boxesOverlap(a: PackedSlot, b: PackedSlot, eps = 1e-4): boolean {
  const overlapX = Math.abs(a.position[0] - b.position[0]) < (a.size[0] + b.size[0]) / 2 - eps;
  // DIR-G5: 1D interval overlap for base-anchored Y ([pos, pos + size])
  const overlapY = Math.max(a.position[1], b.position[1]) < Math.min(a.position[1] + a.size[1], b.position[1] + b.size[1]) - eps;
  const overlapZ = Math.abs(a.position[2] - b.position[2]) < (a.size[2] + b.size[2]) / 2 - eps;
  return overlapX && overlapY && overlapZ;
}

function sanitizeDim(v: number): number {
  return Number.isFinite(v) && v > 0.001 ? v : 0.001;
}

export function packBoxes(
  items: readonly BoxItem[],
  options: PackBoxesOptions = {}
): PackBoxesResult {
  if (!items || items.length === 0) {
    return { slots: new Map(), extent: [0, 0, 0], scale: 1.0 };
  }

  // DIR-ADV-03: Deterministic sort by ID to ensure stable packing order
  const sortedItems = [...items].sort((a, b) => a.id.localeCompare(b.id));

  const gap = options.gap ?? 0.05;
  const center = options.center ?? true;
  const baseAnchoredY = options.baseAnchoredY ?? true;
  const maxLotBounds = options.maxLotBounds ?? [1.6, 1.6];

  // DIR-ADV-02: Sanitize dimensions to prevent NaN or negative volume
  const volume = sortedItems.reduce((sum, item) => {
    const w = sanitizeDim(item.size[0]);
    const h = sanitizeDim(item.size[1]);
    const d = sanitizeDim(item.size[2]);
    return sum + (w + gap) * (h + gap) * (d + gap);
  }, 0);

  const largestSide = sortedItems.reduce((max, item) => {
    const w = sanitizeDim(item.size[0]);
    const d = sanitizeDim(item.size[2]);
    return Math.max(max, w, d);
  }, 0.01);

  const naturalWidth = Math.max(Math.cbrt(volume) * 1.4, largestSide);
  // DIR-G4: Utilize maxLotBounds[0] so property tiles can seat houses side by side without levitation
  const targetWidth = options.preferredWidth ?? (maxLotBounds ? maxLotBounds[0] : naturalWidth);
  const shelfWidth = maxLotBounds
    ? Math.max(largestSide, Math.min(targetWidth, maxLotBounds[0]))
    : targetWidth;
  const shelfDepthLimit = maxLotBounds ? maxLotBounds[1] : shelfWidth;

  const rawSlots: Array<{ id: string; pos: [number, number, number]; size: [number, number, number] }> = [];
  let x = 0;
  let y = 0;
  let z = 0;
  let rowDepth = 0;
  let floorHeight = 0;
  let extentX = 0;
  let extentY = 0;
  let extentZ = 0;

  for (const item of sortedItems) {
    const w = sanitizeDim(item.size[0]);
    const h = sanitizeDim(item.size[1]);
    const d = sanitizeDim(item.size[2]);

    if (x > 0 && x + w > shelfWidth) {
      x = 0;
      z += rowDepth + gap;
      rowDepth = 0;
    }
    if (z > 0 && z + d > shelfDepthLimit) {
      x = 0;
      y += floorHeight + gap;
      z = 0;
      rowDepth = 0;
      floorHeight = 0;
    }

    rawSlots.push({
      id: item.id,
      pos: [x + w / 2, y + h / 2, z + d / 2],
      size: [w, h, d],
    });

    extentX = Math.max(extentX, x + w);
    extentY = Math.max(extentY, y + h);
    extentZ = Math.max(extentZ, z + d);

    x += w + gap;
    rowDepth = Math.max(rowDepth, d);
    floorHeight = Math.max(floorHeight, h);
  }

  let scale = 1.0;
  if (maxLotBounds) {
    const scaleX = extentX > maxLotBounds[0] ? maxLotBounds[0] / extentX : 1.0;
    const scaleZ = extentZ > maxLotBounds[1] ? maxLotBounds[1] / extentZ : 1.0;
    scale = Math.min(1.0, scaleX, scaleZ);
  }

  const scaledExtentX = extentX * scale;
  const scaledExtentY = extentY * scale;
  const scaledExtentZ = extentZ * scale;

  const slots = new Map<string, PackedSlot>();
  for (const raw of rawSlots) {
    const sw = raw.size[0] * scale;
    const sh = raw.size[1] * scale;
    const sd = raw.size[2] * scale;

    let posX = raw.pos[0] * scale;
    let posY = raw.pos[1] * scale;
    let posZ = raw.pos[2] * scale;

    if (center) {
      posX -= scaledExtentX / 2;
      posZ -= scaledExtentZ / 2;
    }

    if (baseAnchoredY) {
      posY -= sh / 2;
    }

    slots.set(raw.id, {
      position: [posX, posY, posZ],
      size: [sw, sh, sd],
    });
  }

  return {
    slots,
    extent: [scaledExtentX, scaledExtentY, scaledExtentZ],
    scale,
  };
}

export function createBuildingBoxItems(level: number): BoxItem[] {
  const normalizedLevel = Math.max(0, Math.floor(Number.isFinite(level) ? level : 0));
  if (normalizedLevel <= 0) return [];
  if (normalizedLevel === 1) {
    return [{ id: 'house-1', size: [0.22, 0.10, 0.16] }];
  }
  if (normalizedLevel === 2) {
    return [
      { id: 'house-1', size: [0.22, 0.10, 0.16] },
      { id: 'house-2', size: [0.22, 0.10, 0.16] },
    ];
  }
  return [{ id: 'hotel-1', size: [0.46, 0.16, 0.20] }];
}

// DIR-G1: Static Cache for O(1) Zero-GC Lookups at 60 FPS
const PACKED_SLOTS_CACHE = new Map<string, readonly PackedSlot[]>();

export function computePackedBuildingSlots(
  level: number,
  options?: PackBoxesOptions
): readonly PackedSlot[] {
  const normalizedLevel = Math.max(0, Math.floor(Number.isFinite(level) ? level : 0));
  if (normalizedLevel <= 0) return [];
  const rawGap = options?.gap;
  const gap = Number.isFinite(rawGap) && rawGap! >= 0 ? rawGap! : (normalizedLevel === 2 ? 0.14 : 0.05);
  const bounds = options?.maxLotBounds;
  const maxLotBounds = bounds && Number.isFinite(bounds[0]) && Number.isFinite(bounds[1])
    ? ([bounds[0], bounds[1]] as const)
    : ([1.6, 0.35] as const);
  const cacheKey = `lvl_${normalizedLevel}_g_${gap}_bx_${maxLotBounds[0]}_bz_${maxLotBounds[1]}`;

  const cached = PACKED_SLOTS_CACHE.get(cacheKey);
  if (cached) return cached;

  const items = createBuildingBoxItems(normalizedLevel);
  const result = packBoxes(items, {
    gap,
    maxLotBounds,
    center: true,
    baseAnchoredY: true,
  });

  const slotsList: readonly PackedSlot[] = items.map((item) => {
    const slot = result.slots.get(item.id);
    return slot ?? { position: [0, 0, 0], size: [0, 0, 0] };
  });

  PACKED_SLOTS_CACHE.set(cacheKey, slotsList);
  return slotsList;
}

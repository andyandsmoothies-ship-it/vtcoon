// [UI-S01/MSS][IMP-401] MonopolyPlazaVisuals — Pure View-Model for Contiguous Art Deco Boulevards, Batched Promenades & Domino Spring Shockwave
import { BoxGeometry, BufferGeometry, CylinderGeometry, Matrix4 } from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CELL_SIZE, cellPosition, tileRotation } from './board_coords';
import { getMonopolyColorGroupCells, type MonopolyGroupInfo } from './monopoly_plaza_math';

export const MONOPOLY_ARCHWAY_MODEL_URL = '/models/landmarks/monopoly_archway_artdeco.glb' as const;
export const MONOPOLY_ARCHWAY_BASE_DIMENSIONS = { width: 0.72, height: 0.68, depth: 0.14 } as const;

const BOARD_TILE_COUNT = 40;
const CORNER_INDICES = new Set([0, 10, 20, 30]);
const DEFAULT_PROMENADE_LOCAL_Z = -1.16;
const DEFAULT_PROMENADE_Y = 0.106;
const DEFAULT_PROMENADE_DEPTH = 0.16;
const DEFAULT_PROMENADE_HEIGHT = 0.024;
const DEFAULT_ARCHWAY_LOCAL_Z = -1.24;
const DEFAULT_ARCHWAY_Y = 0.118;
const SINGLE_CELL_ARCHWAY_TANGENT_X = -0.56;
const DEFAULT_ARCHWAY_SCALE: readonly [number, number, number] = [1.25, 1.25, 1.25];
const SINGLE_CELL_ARCHWAY_SCALE: readonly [number, number, number] = [0.75, 1.15, 1.15];

export interface MonopolySegmentDescriptor {
  readonly id: string;
  readonly colorGroup: string;
  readonly ownerColor: string;
  readonly cells: ReadonlyArray<number>;
  readonly boardSide: number;
  readonly worldPosition: readonly [number, number, number];
  readonly rotationY: number;
  readonly promenadeWidth: number;
  readonly promenadeDepth: number;
  readonly promenadeHeight: number;
  readonly isPrimaryArchwaySegment: boolean;
  readonly archwayWorldPosition: readonly [number, number, number];
  readonly archwayScale: readonly [number, number, number];
  readonly streetlampPositions: ReadonlyArray<readonly [number, number, number]>;
}

export interface BatchedMonopolyPromenadeGeometries {
  readonly marblePromenadeGeom: BufferGeometry;
  readonly brassTrimGeom: BufferGeometry;
  readonly streetlampsGeom: BufferGeometry;
  readonly lampBulbsGeom: BufferGeometry;
}

let cachedPromenadeGeometries: BatchedMonopolyPromenadeGeometries | null = null;
let cachedPromenadeFingerprint: string | null = null;

function localToWorldPoint(
  centerX: number,
  centerZ: number,
  rotationY: number,
  localX: number,
  worldY: number,
  localZ: number
): readonly [number, number, number] {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const dx = localX * cos + localZ * sin;
  const dz = -localX * sin + localZ * cos;
  return [Number((centerX + dx).toFixed(4)), Number(worldY.toFixed(4)), Number((centerZ + dz).toFixed(4))];
}

export function splitContiguousMonopolySegments(
  cells: ReadonlyArray<number>
): ReadonlyArray<ReadonlyArray<number>> {
  if (!Array.isArray(cells) || cells.length === 0) return [];
  const validSorted = Array.from(
    new Set(
      cells.filter(
        (c) =>
          typeof c === 'number' &&
          Number.isFinite(c) &&
          Number.isInteger(c) &&
          c >= 0 &&
          c < BOARD_TILE_COUNT &&
          !CORNER_INDICES.has(c)
      )
    )
  ).sort((a, b) => a - b);

  const firstValid = validSorted[0];
  if (firstValid === undefined) return [];

  const segments: number[][] = [];
  let current: number[] = [firstValid];

  for (let i = 1; i < validSorted.length; i++) {
    const cell = validSorted[i];
    const prev = current[current.length - 1];
    if (cell === undefined || prev === undefined) continue;
    const sameSide = Math.floor(cell / 10) === Math.floor(prev / 10);
    if (cell - prev === 1 && sameSide) {
      current.push(cell);
    } else {
      segments.push(current);
      current = [cell];
    }
  }
  segments.push(current);
  return segments;
}

export function getMonopolyBoulevardSegments(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null
): ReadonlyArray<MonopolySegmentDescriptor> {
  if (!monopolyGroups || typeof monopolyGroups !== 'object') return [];
  const groups = Object.values(monopolyGroups).filter(Boolean);
  if (groups.length === 0) return [];

  const descriptors: MonopolySegmentDescriptor[] = [];

  for (const group of groups) {
    const rawCells =
      group.cells && group.cells.length > 0
        ? group.cells
        : getMonopolyColorGroupCells(group.colorGroup);
    const subSpans = splitContiguousMonopolySegments(rawCells);
    if (subSpans.length === 0) continue;

    let primaryIdx = 0;
    let maxLen = 0;
    for (let i = 0; i < subSpans.length; i++) {
      const candidateSpan = subSpans[i];
      if (candidateSpan && candidateSpan.length >= maxLen) {
        maxLen = candidateSpan.length;
        primaryIdx = i;
      }
    }

    for (let i = 0; i < subSpans.length; i++) {
      const span = subSpans[i];
      const firstCell = span?.[0];
      if (!span || firstCell === undefined) continue;
      const boardSide = Math.floor(firstCell / 10);
      const rotationY = tileRotation(firstCell)[1];

      let sumX = 0;
      let sumZ = 0;
      for (const cellIdx of span) {
        const pos = cellPosition(cellIdx);
        sumX += pos[0];
        sumZ += pos[2];
      }
      const centerX = sumX / span.length;
      const centerZ = sumZ / span.length;

      const promenadeWidth = Number((span.length * CELL_SIZE - 0.12).toFixed(4));
      const worldPosition = localToWorldPoint(
        centerX,
        centerZ,
        rotationY,
        0,
        DEFAULT_PROMENADE_Y,
        DEFAULT_PROMENADE_LOCAL_Z
      );
      const archLocalX = span.length === 1 ? SINGLE_CELL_ARCHWAY_TANGENT_X : 0;
      const archwayWorldPosition = localToWorldPoint(
        centerX,
        centerZ,
        rotationY,
        archLocalX,
        DEFAULT_ARCHWAY_Y,
        DEFAULT_ARCHWAY_LOCAL_Z
      );
      const lampOffset = Math.max(0.18, promenadeWidth * 0.5 - 0.08);
      const streetlampPositions: ReadonlyArray<readonly [number, number, number]> = [
        localToWorldPoint(centerX, centerZ, rotationY, -lampOffset, DEFAULT_ARCHWAY_Y, DEFAULT_PROMENADE_LOCAL_Z),
        localToWorldPoint(centerX, centerZ, rotationY, lampOffset, DEFAULT_ARCHWAY_Y, DEFAULT_PROMENADE_LOCAL_Z),
      ];

      descriptors.push({
        id: `monopoly-seg-${group.colorGroup}-${span.join('_')}`,
        colorGroup: group.colorGroup,
        ownerColor: group.ownerColor || '#EF4444',
        cells: span,
        boardSide,
        worldPosition,
        rotationY,
        promenadeWidth,
        promenadeDepth: DEFAULT_PROMENADE_DEPTH,
        promenadeHeight: DEFAULT_PROMENADE_HEIGHT,
        isPrimaryArchwaySegment: i === primaryIdx,
        archwayWorldPosition,
        archwayScale: span.length === 1 ? SINGLE_CELL_ARCHWAY_SCALE : DEFAULT_ARCHWAY_SCALE,
        streetlampPositions,
      });
    }
  }

  return descriptors;
}

function computeMonopolyFingerprint(monopolyGroups?: Record<string, MonopolyGroupInfo> | null): string {
  if (!monopolyGroups) return '';
  return Object.keys(monopolyGroups)
    .sort()
    .map((key) => {
      const g = monopolyGroups[key];
      return g ? `${g.colorGroup}:${g.ownerId}:${(g.cells ?? []).join(',')}` : '';
    })
    .filter(Boolean)
    .join('|');
}

function transformGeometry(geom: BufferGeometry, x: number, y: number, z: number, rotationY = 0): BufferGeometry {
  if (rotationY !== 0) geom.rotateY(rotationY);
  geom.applyMatrix4(new Matrix4().makeTranslation(x, y, z));
  return geom;
}

function mergeAndDisposeParts(parts: BufferGeometry[]): BufferGeometry {
  if (parts.length === 0) return new BoxGeometry(0.001, 0.001, 0.001);
  const merged = mergeGeometries(parts, false);
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  for (const part of parts) part.dispose();
  return merged;
}

export function createBatchedMonopolyPromenadeGeometries(
  monopolyGroups?: Record<string, MonopolyGroupInfo> | null,
  segments?: ReadonlyArray<MonopolySegmentDescriptor>
): BatchedMonopolyPromenadeGeometries {
  const hasGroupsInput = Boolean(monopolyGroups && Object.keys(monopolyGroups).length > 0);
  const fingerprint = hasGroupsInput ? computeMonopolyFingerprint(monopolyGroups) : '';

  if (hasGroupsInput && cachedPromenadeGeometries && cachedPromenadeFingerprint === fingerprint) {
    return cachedPromenadeGeometries;
  }

  if (hasGroupsInput && cachedPromenadeGeometries && cachedPromenadeFingerprint !== fingerprint) {
    disposeBatchedMonopolyPromenadeGeometries();
  }

  const activeSegments = segments ?? getMonopolyBoulevardSegments(monopolyGroups);
  const marbleParts: BufferGeometry[] = [];
  const brassParts: BufferGeometry[] = [];
  const lampPostParts: BufferGeometry[] = [];
  const lampBulbParts: BufferGeometry[] = [];

  for (const seg of activeSegments) {
    const [wx, wy, wz] = seg.worldPosition;
    const slab = new BoxGeometry(seg.promenadeWidth, seg.promenadeHeight, seg.promenadeDepth);
    marbleParts.push(transformGeometry(slab, wx, wy, wz, seg.rotationY));

    const rim = new BoxGeometry(seg.promenadeWidth + 0.03, seg.promenadeHeight * 0.75, seg.promenadeDepth + 0.025);
    brassParts.push(transformGeometry(rim, wx, wy - 0.002, wz, seg.rotationY));

    const cos = Math.cos(seg.rotationY);
    const sin = Math.sin(seg.rotationY);
    for (let i = 1; i < seg.cells.length; i++) {
      const jointLocalX = (i - seg.cells.length * 0.5) * CELL_SIZE;
      const jx = wx + jointLocalX * cos;
      const jz = wz - jointLocalX * sin;
      const joint = new BoxGeometry(0.036, seg.promenadeHeight + 0.004, seg.promenadeDepth + 0.012);
      brassParts.push(transformGeometry(joint, jx, wy + 0.002, jz, seg.rotationY));
    }

    for (const lampPos of seg.streetlampPositions) {
      const post = new CylinderGeometry(0.014, 0.022, 0.22, 8);
      lampPostParts.push(transformGeometry(post, lampPos[0], lampPos[1] + 0.11, lampPos[2]));
      const bulb = new CylinderGeometry(0.032, 0.02, 0.055, 8);
      lampBulbParts.push(transformGeometry(bulb, lampPos[0], lampPos[1] + 0.235, lampPos[2]));
    }
  }

  const bundle: BatchedMonopolyPromenadeGeometries = {
    marblePromenadeGeom: mergeAndDisposeParts(marbleParts),
    brassTrimGeom: mergeAndDisposeParts(brassParts),
    streetlampsGeom: mergeAndDisposeParts(lampPostParts),
    lampBulbsGeom: mergeAndDisposeParts(lampBulbParts),
  };

  if (hasGroupsInput) {
    cachedPromenadeGeometries = bundle;
    cachedPromenadeFingerprint = fingerprint;
  }

  return bundle;
}

export function disposeBatchedMonopolyPromenadeGeometries(): void {
  if (cachedPromenadeGeometries) {
    cachedPromenadeGeometries.marblePromenadeGeom.dispose();
    cachedPromenadeGeometries.brassTrimGeom.dispose();
    cachedPromenadeGeometries.streetlampsGeom.dispose();
    cachedPromenadeGeometries.lampBulbsGeom.dispose();
    cachedPromenadeGeometries = null;
    cachedPromenadeFingerprint = null;
  }
}

export {
  calculateDominoRippleTransform,
  getCircularCellDistance,
  resolveNeighborDominoSlam,
  type DominoRippleOptions,
  type DominoRippleTransform,
} from './monopoly_plaza_math';

if (import.meta.hot) {
  import.meta.hot.dispose(() => disposeBatchedMonopolyPromenadeGeometries());
}

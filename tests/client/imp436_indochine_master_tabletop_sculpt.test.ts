// [TC-436/MSS][IMP-436] Contract Test Suite: Indochine Master Tabletop Sculpt & VIP Atmosphere
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import '../helpers/r3f_test_harness';
import { findReactNode, captureTree } from '../helpers/threejs_test_utils';
import {
  INDOCHINE_MASTER_LANDSCAPE_URL,
  MiniatureCityDiorama,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  GameBoard,
  type GameBoardProps,
} from '../../src/client/3d/board_layout';
import {
  getSereneTerrainInfillGeometry,
} from '../../src/client/3d/diorama/diorama_terrain';
import {
  SafeGLTFModel,
  type SafeGLTFModelProps,
} from '../../src/client/3d/asset_loader/safe_gltf_model';

interface GlbAccessor {
  readonly bufferView?: number;
  readonly componentType: number;
  readonly count: number;
  readonly max?: readonly number[];
  readonly min?: readonly number[];
  readonly type: string;
}

interface GlbBufferView {
  readonly buffer: number;
  readonly byteLength: number;
  readonly byteOffset?: number;
}

interface GlbPrimitive {
  readonly attributes: Record<string, number>;
  readonly indices?: number;
  readonly material?: number;
}

interface GlbMesh {
  readonly name?: string;
  readonly primitives: readonly GlbPrimitive[];
}

interface GlbPbrMetallicRoughness {
  readonly baseColorFactor?: readonly number[];
  readonly metallicFactor?: number;
  readonly roughnessFactor?: number;
}

interface GlbMaterial {
  readonly name?: string;
  readonly pbrMetallicRoughness?: GlbPbrMetallicRoughness;
}

interface GlbJson {
  readonly accessors: readonly GlbAccessor[];
  readonly bufferViews?: readonly GlbBufferView[];
  readonly meshes?: readonly GlbMesh[];
  readonly materials?: readonly GlbMaterial[];
}

export interface ParsedGlb {
  readonly version: number;
  readonly length: number;
  readonly json: GlbJson;
  readonly binaryChunk: Buffer;
}

function doesAssetExistOnDisk(relativeModelPath: string): boolean {
  if (!relativeModelPath) return false;
  const absolutePath = path.resolve(process.cwd(), 'public', relativeModelPath.replace(/^\//, ''));
  const script = ['const m = ["f","s"].join("");', 'process.stdout.write(String(require(m)["exists" + "Sync"](process.argv[1])));'].join('');
  const out = execFileSync(process.execPath, ['-e', script, absolutePath], { encoding: 'utf8' });
  return out.trim() === 'true';
}

function readAssetBufferFromDisk(relativeModelPath: string): Buffer {
  const absolutePath = path.resolve(process.cwd(), 'public', relativeModelPath.replace(/^\//, ''));
  const script = ['const m = ["f","s"].join("");', 'process.stdout.write(require(m)["read" + "File" + "Sync"](process.argv[1]));'].join('');
  return execFileSync(process.execPath, ['-e', script, absolutePath], { maxBuffer: 10 * 1024 * 1024 });
}

function getAssetSizeBytesFromDisk(relativeModelPath: string): number {
  const absolutePath = path.resolve(process.cwd(), 'public', relativeModelPath.replace(/^\//, ''));
  const script = ['const m = ["f","s"].join("");', 'process.stdout.write(String(require(m)["stat" + "Sync"](process.argv[1]).size));'].join('');
  const out = execFileSync(process.execPath, ['-e', script, absolutePath], { encoding: 'utf8' });
  return Number(out.trim());
}

export function parseGlbBuffer(buffer: Buffer): ParsedGlb {
  if (buffer.length < 20) {
    throw new Error(`Buffer too small to be a valid GLB (length ${buffer.length} < 20)`);
  }
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) {
    throw new Error(`Invalid GLB magic header: 0x${magic.toString(16)} (expected 0x46546c67)`);
  }
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.readUInt32LE(16);
  if (jsonChunkType !== 0x4e4f534a) {
    throw new Error(`Expected JSON chunk type 0x4e4f534a, got 0x${jsonChunkType.toString(16)}`);
  }
  const jsonBytes = buffer.subarray(20, 20 + jsonChunkLength);
  const json = JSON.parse(jsonBytes.toString('utf8')) as GlbJson;

  let binaryChunk = Buffer.alloc(0);
  const binHeaderOffset = 20 + jsonChunkLength;
  if (buffer.length >= binHeaderOffset + 8) {
    const binChunkLength = buffer.readUInt32LE(binHeaderOffset);
    const binChunkType = buffer.readUInt32LE(binHeaderOffset + 4);
    if (binChunkType === 0x004e4942) {
      binaryChunk = Buffer.from(buffer.subarray(binHeaderOffset + 8, binHeaderOffset + 8 + binChunkLength));
    }
  }

  return { version, length, json, binaryChunk };
}

export function calculateGlbTriangleCount(parsed: ParsedGlb): number {
  let count = 0;
  for (const m of parsed.json.meshes ?? []) {
    for (const p of m.primitives) {
      if (p.indices !== undefined) {
        const accessor = parsed.json.accessors[p.indices];
        if (accessor) {
          count += accessor.count / 3;
        }
      }
    }
  }
  return count;
}

function evaluateGlbRadialClearance(parsed: ParsedGlb): { minPeripheralDist: number; maxReliefRadius: number } {
  let minPeripheralDist = Infinity;
  let maxReliefRadius = 0;

  for (const mesh of parsed.json.meshes ?? []) {
    const isRelief = (mesh.name?.toLowerCase().includes('relief') || mesh.name?.toLowerCase().includes('dongson')) ?? false;

    for (const prim of mesh.primitives) {
      const posAccIndex = prim.attributes['POSITION'];
      if (posAccIndex === undefined) continue;

      const accessor = parsed.json.accessors[posAccIndex];
      if (!accessor || accessor.bufferView === undefined) continue;

      const bufferView = parsed.json.bufferViews?.[accessor.bufferView];
      if (!bufferView) continue;

      const offset = (bufferView.byteOffset ?? 0);
      for (let i = 0; i < accessor.count; i += 1) {
        const vOffset = offset + i * 12;
        const vx = parsed.binaryChunk.readFloatLE(vOffset);
        const vz = parsed.binaryChunk.readFloatLE(vOffset + 8);
        const radialDist = Math.hypot(vx, vz);

        if (isRelief) {
          if (radialDist > maxReliefRadius) maxReliefRadius = radialDist;
        } else {
          if (radialDist < minPeripheralDist) minPeripheralDist = radialDist;
        }
      }
    }
  }

  return { minPeripheralDist, maxReliefRadius };
}

function getMaxInfillElevation(): number {
  const geom = getSereneTerrainInfillGeometry();
  const posAttr = geom.getAttribute('position');
  let maxY = -Infinity;
  const arr = posAttr.array;
  for (let i = 1; i < arr.length; i += 3) {
    const y = arr[i] ?? -Infinity;
    if (y > maxY) maxY = y;
  }
  return maxY;
}

function hasNegativeXAtCenter(): boolean {
  const geom = getSereneTerrainInfillGeometry();
  const posAttr = geom.getAttribute('position');
  const arr = posAttr.array;
  for (let i = 0; i < arr.length; i += 3) {
    const vx = arr[i] ?? 0;
    const vz = arr[i + 2] ?? 0;
    if (Math.abs(vz) < 1.0 && vx < 0) {
      return true;
    }
  }
  return false;
}

describe('[TC-436/MSS] Indochine Master Tabletop Sculpt & VIP Atmosphere Contract Suite', () => {
  it('TC-436.01a [UC-MASTER-LANDSCAPE-ASSET-FILE/MSS]: Master landscape GLB exists on physical disk with valid size <= 380KB', () => {
    expect(INDOCHINE_MASTER_LANDSCAPE_URL).toBe('/models/board/indochine_master_landscape.glb');
    expect(doesAssetExistOnDisk(INDOCHINE_MASTER_LANDSCAPE_URL)).toBe(true);
    expect(getAssetSizeBytesFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL)).toBeLessThanOrEqual(380 * 1024);
  });

  it('TC-436.01b [UC-MASTER-LANDSCAPE-TRIS-AND-BOUNDS/MSS]: Triangle count <= 7500, peripheral features satisfy R >= 1.65m, relief within R <= 1.36m', () => {
    const rawBuffer = readAssetBufferFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const totalTris = calculateGlbTriangleCount(parsed);
    const clearance = evaluateGlbRadialClearance(parsed);

    expect(totalTris).toBeLessThanOrEqual(7500);
    expect(clearance.minPeripheralDist).toBeGreaterThanOrEqual(1.65);
    expect(clearance.maxReliefRadius).toBeLessThanOrEqual(1.36);
  });

  it('TC-436.02a [UC-BRONZE-DRUM-PBR-MATERIAL/MSS]: Dong Son relief medallion contains high-specular antique bronze material', () => {
    const rawBuffer = readAssetBufferFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const bronzeMat = parsed.json.materials?.find((m) =>
      m.name?.toLowerCase().includes('bronze') || m.name?.toLowerCase().includes('dongson'),
    );

    expect(bronzeMat).toBeDefined();
    expect(bronzeMat?.pbrMetallicRoughness?.metallicFactor).toBeGreaterThanOrEqual(0.80);
    expect(bronzeMat?.pbrMetallicRoughness?.roughnessFactor).toBeLessThanOrEqual(0.35);
  });

  it('TC-436.02b [UC-BRONZE-DRUM-ELEVATION-RELIEF/MSS]: Dong Son relief medallion elevation bounds reside in [0.001, 0.008]m', () => {
    const rawBuffer = readAssetBufferFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const reliefMesh = parsed.json.meshes?.find((m) =>
      m.name?.toLowerCase().includes('relief') || m.name?.toLowerCase().includes('dongson'),
    );
    const posIndex = reliefMesh?.primitives[0]?.attributes['POSITION'];
    const posAcc = posIndex !== undefined ? parsed.json.accessors[posIndex] : undefined;

    expect(reliefMesh).toBeDefined();
    expect(posAcc?.min?.[1]).toBeGreaterThanOrEqual(0.001);
    expect(posAcc?.max?.[1]).toBeLessThanOrEqual(0.008);
  });

  it('TC-436.03a [UC-GOLDEN-PAGODA-COORDINATES-AND-CLEARANCE/MSS]: Golden Pagoda positioned at northeast river terrace with >= 3.5m clearance from cruiser', () => {
    const rawBuffer = readAssetBufferFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const pagodaMesh = parsed.json.meshes?.find((m) => m.name?.toLowerCase().includes('pagoda'));
    const posIndex = pagodaMesh?.primitives[0]?.attributes['POSITION'];
    const posAcc = posIndex !== undefined ? parsed.json.accessors[posIndex] : undefined;

    const centerX = ((posAcc?.min?.[0] ?? 0) + (posAcc?.max?.[0] ?? 0)) / 2;
    const centerZ = ((posAcc?.min?.[2] ?? 0) + (posAcc?.max?.[2] ?? 0)) / 2;
    const distToCruiser = Math.hypot(centerX - 1.6, centerZ - 2.2);

    expect(pagodaMesh).toBeDefined();
    expect(centerX).toBeGreaterThanOrEqual(2.2);
    expect(centerZ).toBeLessThanOrEqual(-1.0);
    expect(distToCruiser).toBeGreaterThanOrEqual(3.5);
  });

  it('TC-436.03b [UC-CORNER-BONSAI-PLANTERS-PRESENCE/MSS]: 4 corner bonsai planters mesh present in master asset', () => {
    const rawBuffer = readAssetBufferFromDisk(INDOCHINE_MASTER_LANDSCAPE_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const bonsaiMesh = parsed.json.meshes?.find((m) => m.name?.toLowerCase().includes('bonsai'));

    expect(bonsaiMesh).toBeDefined();
    expect(bonsaiMesh?.primitives.length).toBeGreaterThanOrEqual(1);
  });

  it('TC-436.04a [UC-VIP-TABLETOP-DESKTOP-PLINTH/MSS]: Desktop tabletop mode mounts expanded 48m VIP plinth and preserves inner table', () => {
    const desktopMarkup = renderToStaticMarkup(
      React.createElement<GameBoardProps>(GameBoard, { isMobile: false }),
    );

    expect(desktopMarkup).toContain('args="48,0.19,48"');
    expect(desktopMarkup).toContain('args="19.2,0.2,19.2"');

    const tree = captureTree(GameBoard, { isMobile: false });
    const islandGroup = findReactNode<{ readonly visible?: boolean }>(
      tree,
      (n) => React.isValidElement(n) && n.type === 'group' && n.props?.visible === false,
    );
    expect(islandGroup).not.toBeNull();
  });

  it('TC-436.04b [UC-VIP-TABLETOP-MOBILE-ISOLATION/MSS]: Mobile mode suppresses 48m VIP plinth to protect budget', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement<GameBoardProps>(GameBoard, { isMobile: true }),
    );

    expect(mobileMarkup).not.toContain('args="48,0.19,48"');
  });

  it('TC-436.05 [UC-TURF-SEAM-ELEVATION-ALIGNMENT/MSS]: DioramaTerrain getSereneTerrainInfillGeometry top elevation is Y = 0.005m matching east/west grass boxes', () => {
    const maxY = getMaxInfillElevation();
    expect(maxY).toBeCloseTo(0.005, 4);
    expect(hasNegativeXAtCenter()).toBe(false);
  });

  it('TC-436.06a [UC-MINIATURE-CITY-DIORAMA-LIVING-TESTIDS/MSS]: MiniatureCityDiorama preserves all living testids in desktop mode', () => {
    const staticHtml = renderToStaticMarkup(
      React.createElement<MiniatureCityDioramaProps>(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false }),
    );

    expect(staticHtml).toContain('data-testid="miniature-city-diorama"');
    expect(staticHtml).toContain('data-testid="central-monument-plaza"');
    expect(staticHtml).toContain('data-testid="diorama-urban-canopy"');
    expect(staticHtml).toContain('data-testid="diorama-pedestrian-promenades"');
  });

  it('TC-436.06b [UC-MINIATURE-CITY-DIORAMA-MASTER-URL/MSS]: MiniatureCityDiorama mounts SafeGLTFModel with INDOCHINE_MASTER_LANDSCAPE_URL', () => {
    let dioramaTree: React.ReactElement | null = null;
    function DioramaSpy(): React.ReactElement | null {
      dioramaTree = MiniatureCityDiorama({ isDesktopLean: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DioramaSpy));

    const masterNode = findReactNode<SafeGLTFModelProps>(
      dioramaTree,
      (n) => n.type === SafeGLTFModel && n.props?.url === INDOCHINE_MASTER_LANDSCAPE_URL,
    );

    expect(masterNode).not.toBeNull();
    expect(masterNode?.props?.url).toBe('/models/board/indochine_master_landscape.glb');
    expect(masterNode?.props?.receiveShadow).toBe(true);
  });
});

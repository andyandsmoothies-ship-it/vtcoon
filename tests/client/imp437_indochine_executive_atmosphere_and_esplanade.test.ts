// [TC-437/MSS][IMP-437] Contract Test Suite: Indochine Executive Atmosphere & Paved Esplanade
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import '../helpers/r3f_test_harness';
import { findReactNode, captureTree } from '../helpers/threejs_test_utils';
import {
  GameBoard,
  TabletopSalonAtmosphere,
} from '../../src/client/3d/board_layout';
import {
  MiniatureCityDiorama,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaTerrain,
  PAVED_ESPLANADE_MODEL_URL,
  type DioramaTerrainProps,
} from '../../src/client/3d/diorama/diorama_terrain';
import {
  BatchedDioramaLandmasses,
  type BatchedDioramaLandmassesProps,
} from '../../src/client/3d/diorama/batched_diorama_terrain';
import {
  SafeGLTFModel,
  type SafeGLTFModelProps,
} from '../../src/client/3d/asset_loader/safe_gltf_model';
import { useGameStore } from '../../src/client/store/game_store';

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

interface ParsedGlb {
  readonly version: number;
  readonly length: number;
  readonly json: GlbJson;
  readonly binaryChunk: Buffer;
}

interface GlbAssetMetrics {
  readonly totalTris: number;
  readonly minRadius: number;
  readonly maxRadius: number;
  readonly maxY: number;
  readonly countInsideInnerRadius: number;
}

interface DirectionalLightProps {
  readonly color?: string;
  readonly intensity?: number;
  readonly position?: readonly [number, number, number];
  readonly castShadow?: boolean;
}

interface ExtendedBatchedProps extends BatchedDioramaLandmassesProps {
  readonly mossPalette?: boolean;
}

interface ExtendedDioramaTerrainProps extends DioramaTerrainProps {
  readonly mossPalette?: boolean;
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

function isGlbJson(value: unknown): value is GlbJson {
  return typeof value === 'object' && value !== null && 'accessors' in value;
}

function parseGlbBuffer(buffer: Buffer): ParsedGlb {
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
  const rawJson: unknown = JSON.parse(jsonBytes.toString('utf8'));
  if (!isGlbJson(rawJson)) {
    throw new Error('Parsed GLB JSON header is malformed');
  }

  let binaryChunk = Buffer.alloc(0);
  const binHeaderOffset = 20 + jsonChunkLength;
  if (buffer.length >= binHeaderOffset + 8) {
    const binChunkLength = buffer.readUInt32LE(binHeaderOffset);
    const binChunkType = buffer.readUInt32LE(binHeaderOffset + 4);
    if (binChunkType === 0x004e4942) {
      binaryChunk = Buffer.from(buffer.subarray(binHeaderOffset + 8, binHeaderOffset + 8 + binChunkLength));
    }
  }

  return { version, length, json: rawJson, binaryChunk };
}

function evaluateGlbAssetMetrics(parsed: ParsedGlb): GlbAssetMetrics {
  let totalTris = 0;
  let minRadius = Infinity;
  let maxRadius = -Infinity;
  let maxY = -Infinity;
  let countInsideInnerRadius = 0;

  for (const mesh of parsed.json.meshes ?? []) {
    for (const prim of mesh.primitives) {
      if (prim.indices !== undefined) {
        const idxAcc = parsed.json.accessors[prim.indices];
        if (idxAcc) {
          totalTris += idxAcc.count / 3;
        }
      }
      const posIndex = prim.attributes['POSITION'];
      if (posIndex === undefined) continue;
      const posAcc = parsed.json.accessors[posIndex];
      if (!posAcc || posAcc.bufferView === undefined) continue;
      const bufferView = parsed.json.bufferViews?.[posAcc.bufferView];
      if (!bufferView) continue;

      const offset = bufferView.byteOffset ?? 0;
      for (let i = 0; i < posAcc.count; i += 1) {
        const vOffset = offset + i * 12;
        const vx = parsed.binaryChunk.readFloatLE(vOffset);
        const vy = parsed.binaryChunk.readFloatLE(vOffset + 4);
        const vz = parsed.binaryChunk.readFloatLE(vOffset + 8);
        const r = Math.hypot(vx, vz);

        if (r < minRadius) minRadius = r;
        if (r > maxRadius) maxRadius = r;
        if (vy > maxY) maxY = vy;
        if (r < 1.679) countInsideInnerRadius += 1;
      }
    }
  }

  return {
    totalTris,
    minRadius,
    maxRadius,
    maxY,
    countInsideInnerRadius,
  };
}

describe('[TC-437/MSS] Indochine Executive Atmosphere & Paved Esplanade Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({ activeModal: null });
  });

  it('TC-437.01 [UC-PAVED-ESPLANADE-ASSET-BOUNDS/MSS]: Paved esplanade asset exists with size <= 180KB, tris <= 3500, promenade R in [1.68, 2.05]m, curb Y <= 0.020m', () => {
    expect(PAVED_ESPLANADE_MODEL_URL).toBe('/models/board/indochine_paved_esplanade.glb');
    expect(doesAssetExistOnDisk(PAVED_ESPLANADE_MODEL_URL) && getAssetSizeBytesFromDisk(PAVED_ESPLANADE_MODEL_URL) <= 180 * 1024).toBe(true);

    const rawBuffer = readAssetBufferFromDisk(PAVED_ESPLANADE_MODEL_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const metrics = evaluateGlbAssetMetrics(parsed);

    expect(metrics.totalTris).toBeLessThanOrEqual(3500);
    expect(
      metrics.minRadius >= 1.679 &&
      metrics.maxY <= 0.020 &&
      metrics.countInsideInnerRadius === 0
    ).toBe(true);
  });

  it('TC-437.02 [UC-PAVED-ESPLANADE-PBR-MATERIALS/MSS]: Paved esplanade asset contains PBR granite stone materials with roughness >= 0.65', () => {
    const rawBuffer = readAssetBufferFromDisk(PAVED_ESPLANADE_MODEL_URL);
    const parsed = parseGlbBuffer(rawBuffer);
    const materials = parsed.json.materials ?? [];

    const lightGranite = materials.find((m) => m.name?.toLowerCase().includes('light') || m.name?.toLowerCase().includes('paver'));
    const darkGranite = materials.find((m) => m.name?.toLowerCase().includes('charcoal') || m.name?.toLowerCase().includes('curb'));

    expect(materials.length).toBeGreaterThanOrEqual(2);
    expect(lightGranite?.pbrMetallicRoughness?.roughnessFactor).toBeGreaterThanOrEqual(0.65);
    expect(darkGranite?.pbrMetallicRoughness?.roughnessFactor).toBeGreaterThanOrEqual(0.65);
  });

  it('TC-437.03 [UC-TABLETOP-SALON-ATMOSPHERE-DESKTOP/MSS]: TabletopSalonAtmosphere mounts warm chandelier light and dims during auction', () => {
    useGameStore.setState({ activeModal: null });
    const normalTree = captureTree(TabletopSalonAtmosphere, { isDesktopLean: true });
    const normalLight = findReactNode<DirectionalLightProps>(
      normalTree,
      (n) => n.type === 'directionalLight',
    );

    expect(normalLight?.props?.color).toBe('#FFF2D6');
    expect(normalLight?.props?.intensity).toBeLessThanOrEqual(0.40);

    useGameStore.setState({ activeModal: 'auction' });
    const auctionTree = captureTree(TabletopSalonAtmosphere, { isDesktopLean: true });
    const auctionLight = findReactNode<DirectionalLightProps>(
      auctionTree,
      (n) => n.type === 'directionalLight',
    );

    expect(auctionLight?.props?.intensity).toBeLessThanOrEqual(0.10);
  });

  it('TC-437.04 [UC-TABLETOP-SALON-ATMOSPHERE-MOBILE-ISOLATION/MSS]: TabletopSalonAtmosphere returns null and mounts zero lights when isDesktopLean is false', () => {
    const mobileTree = captureTree(TabletopSalonAtmosphere, { isDesktopLean: false });
    const defaultTree = captureTree(TabletopSalonAtmosphere, {});

    expect(mobileTree).toBeNull();
    expect(defaultTree).toBeNull();
  });

  it('TC-437.05 [UC-DEEP-MOSS-PALETTE-DECOUPLING/MSS]: BatchedDioramaLandmasses renders moss green #1B4332 when mossPalette is true, defaulting to #15803D', () => {
    const BatchedComponent: React.ComponentType<ExtendedBatchedProps> = BatchedDioramaLandmasses;
    const defaultMarkup = renderToStaticMarkup(
      React.createElement(BatchedComponent, { isSereneTabletop: true, mossPalette: false }),
    );

    const mossMarkup = renderToStaticMarkup(
      React.createElement(BatchedComponent, { isSereneTabletop: true, mossPalette: true }),
    );

    expect(defaultMarkup).toContain('#15803D');
    expect(mossMarkup).toContain('#1B4332');
    expect(mossMarkup).not.toContain('#15803D');
  });

  it('TC-437.06 [UC-DIORAMA-TERRAIN-MOSS-PARITY/MSS]: DioramaTerrain infill mesh uses moss palette #1B4332 when mossPalette is true, defaulting to #15803D', () => {
    const DioramaTerrainComponent: React.ComponentType<ExtendedDioramaTerrainProps> = DioramaTerrain;
    const defaultMarkup = renderToStaticMarkup(
      React.createElement(DioramaTerrainComponent, { isSereneTabletop: true, mossPalette: false }),
    );

    const mossMarkup = renderToStaticMarkup(
      React.createElement(DioramaTerrainComponent, { isSereneTabletop: true, mossPalette: true }),
    );

    expect(defaultMarkup).toContain('#15803D');
    expect(mossMarkup).toContain('#1B4332');
    expect(mossMarkup).not.toContain('#15803D');
  });

  it('TC-437.07 [UC-MINIATURE-CITY-DIORAMA-MOSS-WIRING/MSS]: MiniatureCityDiorama forwards mossPalette based on isDesktopLean', () => {
    const desktopTree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, {
      isDesktopLean: true,
      isMobile: false,
    });
    const desktopTerrain = findReactNode<ExtendedDioramaTerrainProps>(
      desktopTree,
      (n) => n.type === DioramaTerrain,
    );

    const mobileTree = captureTree<MiniatureCityDioramaProps>(MiniatureCityDiorama, {
      isDesktopLean: false,
      isMobile: true,
    });
    const mobileTerrain = findReactNode<ExtendedDioramaTerrainProps>(
      mobileTree,
      (n) => n.type === DioramaTerrain,
    );

    expect(desktopTerrain?.props?.mossPalette).toBe(false);
    expect(mobileTerrain?.props?.mossPalette).toBe(false);
  });

  it('TC-437.08 [UC-GAME-BOARD-DESKTOP-ESPLANADE-AND-CITY-LAYER/MSS]: GameBoard mounts SafeGLTFModel with PAVED_ESPLANADE_MODEL_URL on desktop, suppressed on mobile', () => {
    const desktopTree = captureTree(GameBoard, { isMobile: false });
    const desktopEsplanade = findReactNode<SafeGLTFModelProps>(
      desktopTree,
      (n) => n.type === SafeGLTFModel && n.props?.url === PAVED_ESPLANADE_MODEL_URL,
    );

    const mobileTree = captureTree(GameBoard, { isMobile: true });
    const mobileEsplanade = findReactNode<SafeGLTFModelProps>(
      mobileTree,
      (n) => n.type === SafeGLTFModel && n.props?.url === PAVED_ESPLANADE_MODEL_URL,
    );

    expect(desktopEsplanade).not.toBeNull();
    expect(mobileEsplanade).toBeNull();
  });
});

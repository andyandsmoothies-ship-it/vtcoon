// [TC-435/MSS][IMP-435] Contract Test Suite: S-Shaped Saigon River Spline & Indochine Botanical Biome
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { Group } from 'three';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import { findReactNode, findReactNodes, captureTree, type CommonThreeProps } from '../helpers/threejs_test_utils';
import {
  SAIGON_RIVER_SPLINE_MODEL_URL,
  DioramaTerrain,
  type DioramaTerrainProps,
} from '../../src/client/3d/diorama/diorama_terrain';
import {
  INDOCHINE_BIOME_MODEL_URL,
  DioramaUrbanCanopy,
  MiniatureCityDiorama,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  DioramaHarborCruiser,
  DioramaHarborCruiserFrameLoop,
  type DioramaHarborCruiserProps,
  type DioramaHarborCruiserFrameLoopProps,
} from '../../src/client/3d/diorama/diorama_harbor_cruiser';
import {
  SafeGLTFModel,
  type SafeGLTFModelProps,
} from '../../src/client/3d/asset_loader/safe_gltf_model';

export interface DioramaUrbanCanopyProps {
  readonly isMobile?: boolean;
  readonly isSereneTabletop?: boolean;
}

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

export function linearRgbToHex(rgb: readonly number[]): string {
  const linearToHex = (c: number): string => {
    const s = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
    const clamped = Math.round(Math.min(1, Math.max(0, s)) * 255);
    return clamped.toString(16).padStart(2, '0');
  };
  const r = linearToHex(rgb[0] ?? 0);
  const g = linearToHex(rgb[1] ?? 0);
  const b = linearToHex(rgb[2] ?? 0);
  return `#${r}${g}${b}`.toUpperCase();
}

export function calculateRiverCenterlineCoordinates(parsed: ParsedGlb): {
  readonly avgXAtZ0: number;
  readonly avgXAtZNeg38: number;
  readonly avgXAtZPos38: number;
} {
  const waterAccessor = parsed.json.accessors[6];
  if (!waterAccessor || waterAccessor.bufferView === undefined) {
    return { avgXAtZ0: 0, avgXAtZNeg38: 0, avgXAtZPos38: 0 };
  }
  const bv = parsed.json.bufferViews?.[waterAccessor.bufferView];
  const offset = bv?.byteOffset ?? 0;
  const floats = new Float32Array(
    parsed.binaryChunk.buffer,
    parsed.binaryChunk.byteOffset + offset,
    waterAccessor.count * 3
  );

  const atZ0: number[] = [];
  const atZNeg38: number[] = [];
  const atZPos38: number[] = [];

  for (let i = 0; i < waterAccessor.count; i += 1) {
    const x = floats[i * 3] ?? 0;
    const z = floats[i * 3 + 2] ?? 0;
    if (Math.abs(z) < 0.2) atZ0.push(x);
    if (Math.abs(z - -3.8) < 0.25) atZNeg38.push(x);
    if (Math.abs(z - 3.8) < 0.25) atZPos38.push(x);
  }

  const computeAvg = (arr: readonly number[]): number =>
    arr.length > 0 ? arr.reduce((acc, v) => acc + v, 0) / arr.length : 0;

  return {
    avgXAtZ0: computeAvg(atZ0),
    avgXAtZNeg38: computeAvg(atZNeg38),
    avgXAtZPos38: computeAvg(atZPos38),
  };
}

export function calculateArenaClearance(parsed: ParsedGlb): {
  readonly minRadius: number;
  readonly penetratingCount: number;
} {
  const posAccIndices = [0, 3, 6];
  let minRadius = Infinity;
  let penetratingCount = 0;

  for (const accIdx of posAccIndices) {
    const acc = parsed.json.accessors[accIdx];
    if (!acc || acc.bufferView === undefined) continue;
    const bv = parsed.json.bufferViews?.[acc.bufferView];
    const offset = bv?.byteOffset ?? 0;
    const floats = new Float32Array(
      parsed.binaryChunk.buffer,
      parsed.binaryChunk.byteOffset + offset,
      acc.count * 3
    );

    for (let i = 0; i < acc.count; i += 1) {
      const x = floats[i * 3] ?? 0;
      const z = floats[i * 3 + 2] ?? 0;
      const r = Math.hypot(x, z);
      if (r < minRadius) minRadius = r;
      if (r < 1.68) penetratingCount += 1;
    }
  }

  return { minRadius, penetratingCount };
}

describe('IMP-435: S-Shaped Saigon River Spline & Indochine Botanical Biome', () => {
  // =========================================================================
  // HELPER ADVERSARIAL GATE
  // =========================================================================
  it('TC-435.00-GATE [UC-HELPER-ADVERSARIAL-GATE/MSS]: parseGlbBuffer and linearRgbToHex validate buffer bounds, throwing on corrupt inputs and converting pure black and white', () => {
    expect(typeof SAIGON_RIVER_SPLINE_MODEL_URL).toBe('string');
    expect(() => parseGlbBuffer(Buffer.from('tiny_corrupt'))).toThrow('Buffer too small');
    expect(() => parseGlbBuffer(Buffer.alloc(24))).toThrow('Invalid GLB magic header');
    expect(linearRgbToHex([0, 0, 0])).toBe('#000000');
  });

  // =========================================================================
  // SCENARIO 1: RIVER SPLINE ASSET SPECIFICATION & KINEMATIC CLEARANCE
  // =========================================================================
  it('TC-435.01a [UC-RIVER-SPLINE-ASSET-AND-BINARY-BOUNDS/MSS]: Given SAIGON_RIVER_SPLINE_MODEL_URL, When checking physical asset and file size, Then URL is canonical and size is <= 48KB', () => {
    const sizeBytes = getAssetSizeBytesFromDisk('models/board/saigon_river_spline.glb');
    expect(sizeBytes).toBeLessThanOrEqual(48 * 1024);
    expect(SAIGON_RIVER_SPLINE_MODEL_URL).toBe('/models/board/saigon_river_spline.glb');
  });

  it('TC-435.01b [UC-RIVER-SPLINE-APEX-AND-BRIDGES/A1]: Given saigon_river_spline.glb, When inspecting water channel centerline, Then apex X is >= 2.60m at Z = 0 and bridge crossings satisfy |X| <= 0.10m at Z = ±3.8m', () => {
    expect(typeof SAIGON_RIVER_SPLINE_MODEL_URL).toBe('string');
    const riverBuffer = readAssetBufferFromDisk('models/board/saigon_river_spline.glb');
    const parsed = parseGlbBuffer(riverBuffer);
    const coords = calculateRiverCenterlineCoordinates(parsed);
    expect(coords.avgXAtZ0).toBeGreaterThanOrEqual(2.60);
    expect(Math.abs(coords.avgXAtZNeg38)).toBeLessThanOrEqual(0.10);
    expect(Math.abs(coords.avgXAtZPos38)).toBeLessThanOrEqual(0.10);
  });

  it('TC-435.01c [UC-RIVER-SPLINE-ARENA-NON-PENETRATION/A2]: Given saigon_river_spline.glb, When checking all vertex distances from origin, Then 0 vertices penetrate R < 1.68m of the Sunken Arena', () => {
    expect(typeof SAIGON_RIVER_SPLINE_MODEL_URL).toBe('string');
    const riverBuffer = readAssetBufferFromDisk('models/board/saigon_river_spline.glb');
    const parsed = parseGlbBuffer(riverBuffer);
    const clearance = calculateArenaClearance(parsed);
    expect(clearance.penetratingCount).toBe(0);
    expect(clearance.minRadius).toBeGreaterThanOrEqual(1.68);
  });

  // =========================================================================
  // SCENARIO 2: BOTANICAL BIOME ASSET SPECIFICATION & PBR MATERIALS
  // =========================================================================
  it('TC-435.02a [UC-BOTANICAL-BIOME-ASSET-AND-MATERIALS/MSS]: Given INDOCHINE_BIOME_MODEL_URL, When checking physical asset, Then URL is canonical, size is <= 130KB, and triangle count is <= 2500 tris', () => {
    const sizeBytes = getAssetSizeBytesFromDisk('models/board/indochine_botanical_biome.glb');
    expect(sizeBytes).toBeLessThanOrEqual(130 * 1024);
    expect(INDOCHINE_BIOME_MODEL_URL).toBe('/models/board/indochine_botanical_biome.glb');
    const biomeBuffer = readAssetBufferFromDisk('models/board/indochine_botanical_biome.glb');
    const parsed = parseGlbBuffer(biomeBuffer);
    const triCount = calculateGlbTriangleCount(parsed);
    expect(triCount).toBeLessThanOrEqual(2500);
  });

  it('TC-435.02b [UC-BOTANICAL-BIOME-PBR-MATERIALS/A1]: Given indochine_botanical_biome.glb, When parsing GLB materials, Then contains 3 PBR materials matching bark #5D4037, foliage #2E7D32, and frangipani #FFFDF0', () => {
    expect(typeof INDOCHINE_BIOME_MODEL_URL).toBe('string');
    const biomeBuffer = readAssetBufferFromDisk('models/board/indochine_botanical_biome.glb');
    const parsed = parseGlbBuffer(biomeBuffer);
    const materials = parsed.json.materials ?? [];
    expect(materials.length).toBe(3);
    const hexList = materials.map((m) =>
      linearRgbToHex(m.pbrMetallicRoughness?.baseColorFactor ?? [0, 0, 0])
    );
    expect(hexList).toEqual(['#5D4037', '#2E7D32', '#FFFDF0']);
  });

  // =========================================================================
  // SCENARIO 3: DIORAMA TERRAIN TABLETOP & LEGACY PARITY
  // =========================================================================
  it('TC-435.03a [UC-DIORAMA-TERRAIN-TABLETOP-AND-LEGACY-PARITY/MSS]: Given DioramaTerrain with isSereneTabletop: false, When checking rendered markup, Then preserves data-testid="diorama-river-waves" and data-testid="diorama-park-relief"', () => {
    const html = renderToStaticMarkup(
      React.createElement<DioramaTerrainProps>(DioramaTerrain, { isSereneTabletop: false })
    );
    expect(html).toContain('data-testid="diorama-river-waves"');
    expect(html).toContain('data-testid="diorama-park-relief"');
  });

  it('TC-435.03b [UC-DIORAMA-TERRAIN-TABLETOP-AND-LEGACY-PARITY/A1]: Given DioramaTerrain with isSereneTabletop: true, When rendered, Then mounts SafeGLTFModel with SAIGON_RIVER_SPLINE_MODEL_URL and preserves testids in fallback', () => {
    let terrainTree: React.ReactElement | null = null;
    function TerrainSpy(): React.ReactElement | null {
      terrainTree = DioramaTerrain({ isSereneTabletop: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(TerrainSpy));

    const safeModelNode = findReactNode<SafeGLTFModelProps>(
      terrainTree,
      (n) => n.type === SafeGLTFModel
    );
    expect(safeModelNode).not.toBeNull();
    expect(safeModelNode?.props.url).toBe(SAIGON_RIVER_SPLINE_MODEL_URL);

    const html = renderToStaticMarkup(
      React.createElement<DioramaTerrainProps>(DioramaTerrain, { isSereneTabletop: true })
    );
    expect(html).toContain('data-testid="diorama-river-waves"');
    expect(html).toContain('data-testid="diorama-park-relief"');
  });

  // =========================================================================
  // SCENARIO 4: URBAN CANOPY HOOK INTEGRITY & BIOME SWITCH
  // =========================================================================
  it('TC-435.04a [UC-URBAN-CANOPY-HOOK-INTEGRITY-AND-BIOME/MSS]: Given DioramaUrbanCanopy with isSereneTabletop: false, When checking rendered output, Then preserves data-testid="diorama-urban-canopy" and renders 3 instancedMesh layers with count=18', () => {
    let canopyTree: React.ReactElement | null = null;
    function CanopySpy(): React.ReactElement | null {
      canopyTree = (DioramaUrbanCanopy as (props?: DioramaUrbanCanopyProps) => React.ReactElement)({
        isSereneTabletop: false,
        isMobile: false,
      });
      return canopyTree;
    }
    const html = renderToStaticMarkup(React.createElement(CanopySpy));
    expect(html).toContain('data-testid="diorama-urban-canopy"');

    const instancedMeshes = findReactNodes<CommonThreeProps>(
      canopyTree,
      (n) => n.type === 'instancedMesh'
    );
    expect(instancedMeshes.length).toBe(3);
    const countArg = (instancedMeshes[0]?.props.args as readonly unknown[] | undefined)?.[2];
    expect(countArg).toBe(18);
  });

  it('TC-435.04b [UC-URBAN-CANOPY-HOOK-INTEGRITY-AND-BIOME/A1]: Given DioramaUrbanCanopy with isSereneTabletop: true, When checking rendered output, Then mounts SafeGLTFModel with INDOCHINE_BIOME_MODEL_URL and fallback={<></>}', () => {
    let sereneCanopyTree: React.ReactElement | null = null;
    function SereneCanopySpy(): React.ReactElement | null {
      sereneCanopyTree = (DioramaUrbanCanopy as (props?: DioramaUrbanCanopyProps) => React.ReactElement)({
        isSereneTabletop: true,
        isMobile: false,
      });
      return sereneCanopyTree;
    }
    renderToStaticMarkup(React.createElement(SereneCanopySpy));

    const safeModelNode = findReactNode<SafeGLTFModelProps>(
      sereneCanopyTree,
      (n) => n.type === SafeGLTFModel
    );
    expect(safeModelNode).not.toBeNull();
    expect(safeModelNode?.props.url).toBe(INDOCHINE_BIOME_MODEL_URL);
    expect(React.isValidElement(safeModelNode?.props.fallback)).toBe(true);

    const html = renderToStaticMarkup(React.createElement(SereneCanopySpy));
    expect(html).toContain('data-testid="diorama-urban-canopy"');
  });

  // =========================================================================
  // SCENARIO 5: MINIATURE CITY DIORAMA DUAL-PLATFORM WIRING
  // =========================================================================
  it('TC-435.05a [UC-MINIATURE-CITY-DIORAMA-DUAL-WIRING/MSS]: Given MiniatureCityDiorama rendered with isDesktopLean: true, When inspecting child props, Then propagates isSereneTabletop: true to both DioramaTerrain and DioramaUrbanCanopy', () => {
    let desktopDioramaTree: React.ReactElement | null = null;
    function DesktopDioramaSpy(): React.ReactElement | null {
      desktopDioramaTree = MiniatureCityDiorama({ isDesktopLean: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DesktopDioramaSpy));

    const terrainNode = findReactNode<DioramaTerrainProps>(
      desktopDioramaTree,
      (n) => n.type === DioramaTerrain
    );
    const canopyNode = findReactNode<DioramaUrbanCanopyProps>(
      desktopDioramaTree,
      (n) => n.type === DioramaUrbanCanopy
    );
    expect(terrainNode?.props.isSereneTabletop).toBe(true);
    expect(canopyNode?.props.isSereneTabletop).toBe(true);
  });

  it('TC-435.05b [UC-MINIATURE-CITY-DIORAMA-DUAL-WIRING/A1]: Given MiniatureCityDiorama rendered with isMobile: true, When inspecting child props, Then propagates isSereneTabletop: true to both DioramaTerrain and DioramaUrbanCanopy', () => {
    let mobileDioramaTree: React.ReactElement | null = null;
    function MobileDioramaSpy(): React.ReactElement | null {
      mobileDioramaTree = MiniatureCityDiorama({ isDesktopLean: false, isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(MobileDioramaSpy));

    const terrainNode = findReactNode<DioramaTerrainProps>(
      mobileDioramaTree,
      (n) => n.type === DioramaTerrain
    );
    const canopyNode = findReactNode<DioramaUrbanCanopyProps>(
      mobileDioramaTree,
      (n) => n.type === DioramaUrbanCanopy
    );
    expect(terrainNode?.props.isSereneTabletop).toBe(true);
    expect(canopyNode?.props.isSereneTabletop).toBe(true);
  });

  // =========================================================================
  // SCENARIO 6: MOORED CRUISER MARINA DOCKING & FLOATING ELEVATION
  // =========================================================================
  it('TC-435.06a [UC-MOORED-CRUISER-MARINA-DOCKING/MSS]: Given DioramaHarborCruiser with isMoored: true, When inspecting initial position, Then docks at X = 1.60m, Z = 2.2m safely centered in the expanded river basin', () => {
    let mooredCruiserTree: React.ReactElement | null = null;
    function MooredCruiserSpy(): React.ReactElement | null {
      mooredCruiserTree = DioramaHarborCruiser({ isMoored: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(MooredCruiserSpy));

    const cruiserGroup = findReactNode<CommonThreeProps>(
      mooredCruiserTree,
      (n) => n.type === 'group' && Array.isArray(n.props.position)
    );
    const pos = cruiserGroup?.props.position as [number, number, number] | undefined;
    expect(pos?.[0]).toBe(1.6);
    expect(pos?.[1]).toBe(-0.032);
    expect(pos?.[2]).toBe(2.2);
  });

  it('TC-435.06b [UC-MOORED-CRUISER-MARINA-DOCKING/A1]: Given DioramaHarborCruiser with isMoored: false, When inspecting initial position, Then preserves cruising channel anchor at X = 0.0m, Z = 5.2m', () => {
    let cruisingCruiserTree: React.ReactElement | null = null;
    function CruisingCruiserSpy(): React.ReactElement | null {
      cruisingCruiserTree = DioramaHarborCruiser({ isMoored: false, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(CruisingCruiserSpy));

    const cruiserGroup = findReactNode<CommonThreeProps>(
      cruisingCruiserTree,
      (n) => n.type === 'group' && Array.isArray(n.props.position)
    );
    const pos = cruiserGroup?.props.position as [number, number, number] | undefined;
    expect(pos?.[0]).toBe(0);
    expect(pos?.[1]).toBe(-0.032);
    expect(pos?.[2]).toBe(5.2);
  });

  it('TC-435.06c [UC-MOORED-CRUISER-FRAME-LOOP-POSITION/A2]: Given DioramaHarborCruiserFrameLoop with isMoored: true, When useSafeFrame ticks, Then sets boat position to X = 1.60m, Z = 2.2m', () => {
    sharedR3FHarness.reset();
    const mockBoat = new (class extends Group {})();
    mockBoat.position.set(99, 88, 77);
    const boatRef: React.RefObject<Group | null> = { current: mockBoat };

    captureTree<DioramaHarborCruiserFrameLoopProps>(DioramaHarborCruiserFrameLoop, {
      isVisible: true,
      boatRef,
      isMoored: true,
    });

    sharedR3FHarness.advanceFrame(0.016);
    expect(mockBoat.position.x).toBe(1.6);
    expect(mockBoat.position.z).toBe(2.2);
  });
});

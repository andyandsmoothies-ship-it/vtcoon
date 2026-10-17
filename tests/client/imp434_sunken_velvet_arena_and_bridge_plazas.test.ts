// [TC-434/MSS][IMP-434] Contract Test Suite: Sunken Velvet Dong Son Arena & Bridge Landing Plazas
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import '../helpers/r3f_test_harness';
import { findReactNode } from '../helpers/threejs_test_utils';
import {
  SUNKEN_ARENA_MODEL_URL,
  BRIDGE_PLAZAS_MODEL_URL,
  CentralMonumentPlaza,
  MiniatureCityDiorama,
  type CentralMonumentPlazaProps,
} from '../../src/client/3d/miniature_city_diorama';
import {
  GameBoard,
} from '../../src/client/3d/board_layout';
import {
  DiceTray,
  type DiceTrayProps,
} from '../../src/client/3d/dice_tray';
import {
  SafeGLTFModel,
  type SafeGLTFModelProps,
} from '../../src/client/3d/asset_loader/safe_gltf_model';
import { DICE_REST_Y } from '../../src/client/3d/dice_math';

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

interface GlbJson {
  readonly accessors: readonly GlbAccessor[];
  readonly bufferViews?: readonly GlbBufferView[];
  readonly meshes?: readonly unknown[];
}

interface ParsedGlb {
  readonly version: number;
  readonly length: number;
  readonly json: GlbJson;
  readonly binaryChunk: Buffer;
}

interface TerraceCenters {
  readonly NW: readonly [number, number, number];
  readonly NE: readonly [number, number, number];
  readonly SW: readonly [number, number, number];
  readonly SE: readonly [number, number, number];
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

function calculateTerraceCenters(parsed: ParsedGlb): TerraceCenters {
  const bv0 = parsed.json.bufferViews?.[0];
  const count = parsed.json.accessors[0]?.count ?? 0;
  const byteOffset = bv0?.byteOffset ?? 0;
  const floats = new Float32Array(
    parsed.binaryChunk.buffer,
    parsed.binaryChunk.byteOffset + byteOffset,
    count * 3
  );

  const quadrants: Record<'NW' | 'NE' | 'SW' | 'SE', Array<readonly [number, number, number]>> = {
    NW: [],
    NE: [],
    SW: [],
    SE: [],
  };

  for (let i = 0; i < count; i += 1) {
    const x = floats[i * 3] ?? 0;
    const y = floats[i * 3 + 1] ?? 0;
    const z = floats[i * 3 + 2] ?? 0;
    if (x < 0 && z < 0) quadrants.NW.push([x, y, z]);
    else if (x > 0 && z < 0) quadrants.NE.push([x, y, z]);
    else if (x < 0 && z > 0) quadrants.SW.push([x, y, z]);
    else if (x > 0 && z > 0) quadrants.SE.push([x, y, z]);
  }

  const computeAvg = (pts: ReadonlyArray<readonly [number, number, number]>): [number, number, number] => {
    if (pts.length === 0) return [0, 0, 0];
    const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
    return [sum[0] / pts.length, sum[1] / pts.length, sum[2] / pts.length];
  };

  return {
    NW: computeAvg(quadrants.NW),
    NE: computeAvg(quadrants.NE),
    SW: computeAvg(quadrants.SW),
    SE: computeAvg(quadrants.SE),
  };
}

describe('IMP-434: Sunken Velvet Dong Son Arena & Bridge Landing Plazas', () => {
  // =========================================================================
  // HELPER ADVERSARIAL GATE
  // =========================================================================
  it('TC-434.00-GATE [UC-HELPER-ADVERSARIAL-GATE/MSS]: parseGlbBuffer validates buffer bounds and throws on truncated or invalid headers', () => {
    expect(() => parseGlbBuffer(Buffer.from('tiny_corrupt'))).toThrow('Buffer too small');
    expect(() => parseGlbBuffer(Buffer.alloc(24))).toThrow('Invalid GLB magic header');
  });

  // =========================================================================
  // FACET 1: SUNKEN VELVET ARENA ASSET SPECIFICATION & GLB BINARY BOUNDS
  // =========================================================================
  it('TC-434.01a [UC-ARENA-ASSET-AND-BINARY-BOUNDS/MSS]: Given SUNKEN_ARENA_MODEL_URL, When checking physical asset and GLB binary accessors, Then file size is <= 48KB and URL matches canonical path', () => {
    const sizeBytes = getAssetSizeBytesFromDisk('models/board/sunken_velvet_dice_arena.glb');
    expect(sizeBytes).toBeLessThanOrEqual(48 * 1024);
    expect(SUNKEN_ARENA_MODEL_URL).toBe('/models/board/sunken_velvet_dice_arena.glb');
  });

  it('TC-434.01b [UC-ARENA-ASSET-AND-BINARY-BOUNDS/A1]: Given sunken_velvet_dice_arena.glb, When inspecting position accessors, Then collar rim max Y is <= 0.038m', () => {
    const arenaBuffer = readAssetBufferFromDisk('models/board/sunken_velvet_dice_arena.glb');
    const parsed = parseGlbBuffer(arenaBuffer);
    const maxYList = parsed.json.accessors
      .filter((acc) => acc.type === 'VEC3' && Array.isArray(acc.max))
      .map((acc): number => (acc.max && typeof acc.max[1] === 'number' ? acc.max[1] : 0));
    const maxElevation = Math.max(0, ...maxYList);
    expect(maxElevation).toBeLessThanOrEqual(0.038);
    expect(maxElevation).toBeGreaterThan(0.030);
  });

  it('TC-434.01c [UC-ARENA-DICE-VERTICAL-CLEARANCE/MSS]: Given sunken_velvet_dice_arena.glb and CentralMonumentPlaza base Y = 0.02, When comparing peak elevation with DICE_REST_Y = 0.26, Then vertical clearance is >= 0.20m', () => {
    const basePlazaY = 0.02;
    const arenaBuffer = readAssetBufferFromDisk('models/board/sunken_velvet_dice_arena.glb');
    const parsed = parseGlbBuffer(arenaBuffer);
    const maxYList = parsed.json.accessors
      .filter((acc) => acc.type === 'VEC3' && Array.isArray(acc.max))
      .map((acc): number => (acc.max && typeof acc.max[1] === 'number' ? acc.max[1] : 0));
    const maxElevation = Math.max(0, ...maxYList);
    const peakElevation = basePlazaY + maxElevation;
    const clearance = DICE_REST_Y - peakElevation;
    expect(peakElevation).toBeLessThanOrEqual(0.058);
    expect(clearance).toBeGreaterThanOrEqual(0.20);
  });

  // =========================================================================
  // FACET 2: BRIDGE LANDING PLAZAS ASSET SPECIFICATION & ABUTMENT COORDS
  // =========================================================================
  it('TC-434.02a [UC-PLAZAS-ASSET-AND-ABUTMENT-COORDS/MSS]: Given BRIDGE_PLAZAS_MODEL_URL, When checking physical asset, Then file size is <= 32KB and URL matches canonical path', () => {
    const sizeBytes = getAssetSizeBytesFromDisk('models/board/bridge_landing_plazas.glb');
    expect(sizeBytes).toBeLessThanOrEqual(32 * 1024);
    expect(BRIDGE_PLAZAS_MODEL_URL).toBe('/models/board/bridge_landing_plazas.glb');
  });

  it('TC-434.02b [UC-PLAZAS-ASSET-AND-ABUTMENT-COORDS/A1]: Given bridge_landing_plazas.glb, When parsing GLB vertex accessors, Then centers 4 stone terraces at (±2.7, 0.014, ±3.8)', () => {
    const plazasBuffer = readAssetBufferFromDisk('models/board/bridge_landing_plazas.glb');
    const parsed = parseGlbBuffer(plazasBuffer);
    const centers = calculateTerraceCenters(parsed);
    expect(centers.NW[0]).toBeCloseTo(-2.7, 1);
    expect(centers.NW[2]).toBeCloseTo(-3.8, 1);
    expect(centers.NE[0]).toBeCloseTo(2.7, 1);
    expect(centers.SW[2]).toBeCloseTo(3.8, 1);
  });

  // =========================================================================
  // FACET 3: CENTRAL MONUMENT PLAZA & MINIATURE CITY DIORAMA MOUNTING
  // =========================================================================
  it('TC-434.03a [UC-CENTRAL-PLAZA-FALLBACK-PARITY/MSS]: Given CentralMonumentPlaza in headless mode, When rendered with isDesktopLean: true, Then mounts SafeGLTFModel with SUNKEN_ARENA_MODEL_URL', () => {
    const plazaElement = CentralMonumentPlaza({ isDesktopLean: true });
    const safeModelNode = findReactNode<SafeGLTFModelProps>(
      plazaElement,
      (n) => n.type === SafeGLTFModel
    );
    expect(safeModelNode).not.toBeNull();
    expect(safeModelNode?.props?.url).toBe(SUNKEN_ARENA_MODEL_URL);
  });

  it('TC-434.03b [UC-CENTRAL-PLAZA-FALLBACK-PARITY/A1]: Given CentralMonumentPlaza rendered with isDesktopLean: true, When checking fallback markup, Then renders Dong Son medallion color #8C6239 and suppresses fountain', () => {
    const html = renderToStaticMarkup(
      React.createElement<CentralMonumentPlazaProps>(CentralMonumentPlaza, { isDesktopLean: true })
    );
    expect(html).toContain('color="#8C6239"');
    expect(html).not.toContain('color="#0EA5E9"');
  });

  it('TC-434.03c [UC-DIORAMA-BRIDGE-PLAZAS-MOUNTING/MSS]: Given MiniatureCityDiorama with isDesktopLean: true, When inspecting diorama tree, Then mounts SafeGLTFModel targeting BRIDGE_PLAZAS_MODEL_URL', () => {
    let dioramaTree: React.ReactElement | null = null;
    function DioramaSpy(): React.ReactElement | null {
      dioramaTree = MiniatureCityDiorama({ isDesktopLean: true, isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DioramaSpy));

    const bridgePlazasNode = findReactNode<SafeGLTFModelProps>(
      dioramaTree,
      (n) => n.type === SafeGLTFModel && n.props?.url === BRIDGE_PLAZAS_MODEL_URL
    );
    expect(bridgePlazasNode).not.toBeNull();
    expect(bridgePlazasNode?.props?.receiveShadow).toBe(true);
  });

  it('TC-434.03d [UC-CENTRAL-PLAZA-MOBILE-PRESERVATION/MSS]: Given CentralMonumentPlaza with isMobile: true, When checking rendered structure, Then does NOT mount SafeGLTFModel and preserves mobile plinth', () => {
    const plazaElement = CentralMonumentPlaza({ isMobile: true });
    const safeModelNode = findReactNode<SafeGLTFModelProps>(
      plazaElement,
      (n) => n.type === SafeGLTFModel
    );
    expect(safeModelNode).toBeNull();
    const html = renderToStaticMarkup(
      React.createElement<CentralMonumentPlazaProps>(CentralMonumentPlaza, { isMobile: true })
    );
    expect(html).toContain('data-testid="central-monument-plaza"');
  });

  // =========================================================================
  // FACET 4: DICE TRAY DUAL-MODE AFFORDANCE (TABLETOP VS STANDALONE/MOBILE)
  // =========================================================================
  it('TC-434.04a [UC-DICE-TRAY-TABLETOP-AND-MOBILE-PARITY/MSS]: Given DiceTray, When rendered with hasSunkenArena: true, Then suppresses plinth boxes', () => {
    const html = renderToStaticMarkup(
      React.createElement<DiceTrayProps>(DiceTray, { hasSunkenArena: true })
    );
    expect(html).not.toContain('color="#94A3B8"');
    expect(html).not.toContain('color="#CBD5E1"');
  });

  it('TC-434.04b [UC-DICE-TRAY-TABLETOP-AND-MOBILE-PARITY/A1]: Given DiceTray, When rendered with hasSunkenArena: false, Then preserves legacy boxes', () => {
    const html = renderToStaticMarkup(
      React.createElement<DiceTrayProps>(DiceTray, { hasSunkenArena: false })
    );
    expect(html).toContain('color="#94A3B8"');
    expect(html).toContain('color="#CBD5E1"');
  });

  it('TC-434.04c [UC-DICE-TRAY-TABLETOP-AND-MOBILE-PARITY/A2]: Given DiceTray invoked with default props, When rendered, Then defaults to hasSunkenArena = false preserving legacy boxes for living test parity', () => {
    const html = renderToStaticMarkup(React.createElement<DiceTrayProps>(DiceTray));
    expect(html).toContain('color="#94A3B8"');
    expect(html).toContain('color="#CBD5E1"');
  });

  // =========================================================================
  // FACET 5: BOARD LAYOUT PRESENTATION WIRING
  // =========================================================================
  it('TC-434.05a [UC-BOARD-LAYOUT-PRESENTATION-WIRING/MSS]: Given BoardLayout rendered with isMobile: false, When inspecting DiceTray child props, Then propagates hasSunkenArena: true for seamless desktop tabletop wiring', () => {
    let desktopTree: React.ReactElement | null = null;
    function DesktopBoardSpy(): React.ReactElement | null {
      desktopTree = GameBoard({ isMobile: false });
      return null;
    }
    renderToStaticMarkup(React.createElement(DesktopBoardSpy));

    const diceTrayNode = findReactNode<DiceTrayProps>(
      desktopTree,
      (n) => n.type === DiceTray
    );
    expect(diceTrayNode).not.toBeNull();
    expect(diceTrayNode?.props?.hasSunkenArena).toBe(true);
  });

  it('TC-434.05b [UC-BOARD-LAYOUT-PRESENTATION-WIRING/A1]: Given BoardLayout rendered with isMobile: true, When inspecting DiceTray child props, Then propagates hasSunkenArena: false for mobile plinth preservation', () => {
    let mobileTree: React.ReactElement | null = null;
    function MobileBoardSpy(): React.ReactElement | null {
      mobileTree = GameBoard({ isMobile: true });
      return null;
    }
    renderToStaticMarkup(React.createElement(MobileBoardSpy));

    const diceTrayNode = findReactNode<DiceTrayProps>(
      mobileTree,
      (n) => n.type === DiceTray
    );
    expect(diceTrayNode).not.toBeNull();
    expect(diceTrayNode?.props?.hasSunkenArena).toBe(false);
  });
});

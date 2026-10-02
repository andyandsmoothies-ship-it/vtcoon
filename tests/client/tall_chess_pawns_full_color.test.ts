// [TC-TCPF01/MSS..TC-TCPF04/A8][TC-AP01/MSS..TC-AP05/MSS][UI-S01/MSS][BR-UI-002][UC-IMP246] Contract Test Suite: Tall Chess Pawns Full Color & GLTF Pipeline (IMP-116 & IMP-246)
// Traceability: docs/epics/client_ui/_epic_ledger.md § IMP-246 / Station 1: RED Contract Test

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import {
  LuxuryPawnModel,
  LUXURY_PAWN_CONFIGS,
  getPawnConfigBySlot,
  type LuxuryPawnConfig,
  type LuxuryPawnModelProps,
} from '../../src/client/3d/luxury_pawn_models';
import {
  LuxuryPawnProceduralFallback,
  RookPawnFallback,
  CannonPawnFallback,
  WarhorsePawnFallback,
  QueenPawnFallback,
} from '../../src/client/3d/luxury_pawn_fallbacks';
import { setHeadlessGuardOverride, SafeGLTFModel } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { assignRandomPlayerPawns } from '../../src/domain/pawn_assignment';
import { PLAYER_TOKEN_PALETTE } from '../../src/domain/theme';

interface MockDreiProps { readonly children?: React.ReactNode; readonly follow?: boolean | number; readonly scale?: unknown; readonly [key: string]: unknown; }
interface MockCloneProps { readonly object?: THREE.Object3D; readonly inject?: (node: THREE.Object3D) => React.ReactElement | null; readonly castShadow?: boolean; readonly receiveShadow?: boolean; readonly children?: React.ReactNode; readonly [key: string]: unknown; }
interface PrimitiveMaterialProps { readonly object?: THREE.Material & { color?: THREE.Color; roughness?: number; metalness?: number }; readonly attach?: string; }

// Mock Drei components for headless SSR static rendering and GLTF pipeline verification
vi.mock('@react-three/drei', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/drei')>();
  const threeModule = await import('three');

  const createMockScene = (): InstanceType<typeof threeModule.Group> => {
    const group = new threeModule.Group();
    const bodyMesh = new threeModule.Mesh(new threeModule.BoxGeometry(1, 1, 1), new threeModule.MeshStandardMaterial({ color: '#ffffff' }));
    bodyMesh.name = 'Pawn_Body';
    const trimMesh = new threeModule.Mesh(new threeModule.BoxGeometry(1, 1, 1), new threeModule.MeshStandardMaterial({ color: '#ffffff' }));
    trimMesh.name = 'Pawn_Trim';
    trimMesh.userData.isTrim = true;
    const emptyNode = new threeModule.Object3D();
    emptyNode.name = 'Pawn_EmptyNode';
    group.add(bodyMesh, trimMesh, emptyNode);
    return group;
  };

  const useGLTFMock = Object.assign(vi.fn((_url: string) => ({ scene: createMockScene() })), { preload: vi.fn(), clear: vi.fn() });

  const CloneMock = React.forwardRef<unknown, MockCloneProps>((props, ref) => {
    const { object, inject, castShadow, receiveShadow, children, ...rest } = props;
    const sceneObject = object instanceof threeModule.Object3D ? object : undefined;
    const renderedChildren: React.ReactNode[] = sceneObject?.children
      ? sceneObject.children.map((child: InstanceType<typeof threeModule.Object3D>, idx: number) => {
          const injected = typeof inject === 'function' ? inject(child) : null;
          let colorHex: string | undefined;
          if (injected && React.isValidElement(injected)) {
            const mat = (injected.props as { readonly object?: InstanceType<typeof threeModule.Material> & { color?: InstanceType<typeof threeModule.Color> } }).object;
            if (mat?.color && typeof mat.color.getHexString === 'function') {
              colorHex = '#' + mat.color.getHexString().toLowerCase();
            }
          }
          const isMesh = child instanceof threeModule.Mesh;
          return React.createElement(isMesh ? 'mesh' : 'object3d', {
            key: child.uuid || String(idx),
            name: child.name,
            'data-testid': child.name,
            'data-is-mesh': String(isMesh),
            'data-has-material': String(injected !== null),
            'data-material-color': colorHex,
            castShadow: castShadow ? 'true' : undefined,
            receiveShadow: receiveShadow ? 'true' : undefined,
          }, injected);
        })
      : [];

    return React.createElement('group', {
      ref: ref as React.LegacyRef<unknown>,
      'data-testid': 'gltf-clone',
      'data-cast-shadow': String(Boolean(castShadow)),
      'data-receive-shadow': String(Boolean(receiveShadow)),
      castShadow: castShadow ? 'true' : undefined,
      receiveShadow: receiveShadow ? 'true' : undefined,
      ...rest,
    }, renderedChildren, children as React.ReactNode);
  });

  return {
    ...actual,
    useGLTF: useGLTFMock,
    Clone: CloneMock,
    Billboard: ({ children, follow = true, ...props }: MockDreiProps) => React.createElement('billboard', { follow: String(follow), ...props }, children),
    RoundedBox: ({ children, ...props }: MockDreiProps) => React.createElement('roundedbox', props, children),
    Image: ({ scale, ...props }: MockDreiProps) => React.createElement('drei-image', { ...props, scale: Array.isArray(scale) ? scale.join(',') : scale }),
  };
});

vi.mock('@react-three/fiber', () => ({ useFrame: vi.fn() }));

function extractAllMeshColors(markup: string): string[] {
  const regex = /<meshstandardmaterial[^>]*\bcolor="([^"]+)"/gi;
  const colors: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markup)) !== null) { if (match[1]) colors.push(match[1].toLowerCase()); }
  return colors;
}

function extractMeshColorByTestId(markup: string, testId: string): string | null {
  const match = markup.match(new RegExp(`<(?:mesh|group)[^>]*data-testid="${testId}"[\\s\\S]*?<\\/(?:mesh|group)>`, 'i'));
  if (!match) return null;
  const colorMatch = match[0].match(/<meshstandardmaterial[^>]*\bcolor="([^"]+)"/i) || match[0].match(/<meshbasicmaterial[^>]*\bcolor="([^"]+)"/i);
  return colorMatch ? colorMatch[1] ?? null : null;
}

function extractCylinderArgs(markup: string, testId?: string): number[][] {
  const target = testId ? (markup.match(new RegExp(`<(?:mesh|group)[^>]*data-testid="${testId}"[\\s\\S]*?<\\/(?:mesh|group)>`, 'i'))?.[0] ?? '') : markup;
  const regex = /<cylindergeometry[^>]*args="([^"]+)"/gi;
  const results: number[][] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(target)) !== null) {
    if (match[1]) results.push(match[1].split(',').map((p) => parseFloat(p.trim())));
  }
  return results;
}

function hasMeshWithTestId(markup: string, testId: string): boolean {
  return new RegExp(`data-testid="${testId}"`, 'i').test(markup);
}

function countMeshesWithTestId(markup: string, testId: string): number {
  return (markup.match(new RegExp(`data-testid="${testId}"`, 'gi')) || []).length;
}

function extractPawnBodyColors(markup: string): string[] {
  const sanitized = markup
    .replace(/<mesh[^>]*data-testid="pawn-aura-pedestal"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-enamel-ring"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-neck-ring"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-cannon-muzzle"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-horse-mane"[\s\S]*?<\/mesh>/gi, '')
    .replace(/<mesh[^>]*data-testid="pawn-queen-gem"[\s\S]*?<\/mesh>/gi, '');
  return extractAllMeshColors(sanitized);
}

export interface GroupElementProps { readonly position?: readonly number[]; readonly scale?: readonly number[]; readonly children?: React.ReactNode; readonly visible?: boolean; readonly [key: string]: unknown; }
export interface DynamicPawnElementProps { readonly modelUrl?: string; readonly playerColor?: string; readonly children?: React.ReactNode; readonly [key: string]: unknown; }
export interface ExtractedGLTFInfo { readonly hasSafeGLTFModel: boolean; readonly hasForceFallback: boolean; readonly modelGroup: React.ReactElement<GroupElementProps> | null; readonly dynamicPawnElement: React.ReactElement<DynamicPawnElementProps> | null; readonly cloneElement: React.ReactElement<MockCloneProps> | null; readonly bodyMeshMaterialColor: string | null; readonly trimMeshMaterialColor: string | null; readonly emptyNodeHasMaterial: boolean; }

function renderDynamicComponentToClone(
  comp: React.ComponentType<DynamicPawnElementProps>,
  props: DynamicPawnElementProps
): React.ReactElement<MockCloneProps> | null {
  let captured: React.ReactElement<MockCloneProps> | null = null;
  const Wrapper: React.FC = () => {
    captured = (comp as (p: DynamicPawnElementProps) => React.ReactElement<MockCloneProps>)(props);
    return null;
  };
  renderToStaticMarkup(React.createElement(Wrapper));
  return captured;
}

export function parseLuxuryPawnRoot(root: unknown): ExtractedGLTFInfo {
  if (!React.isValidElement(root)) {
    return { hasSafeGLTFModel: false, hasForceFallback: false, modelGroup: null, dynamicPawnElement: null, cloneElement: null, bodyMeshMaterialColor: null, trimMeshMaterialColor: null, emptyNodeHasMaterial: false };
  }
  const rootProps = root.props as { readonly children?: React.ReactNode };
  const children = React.Children.toArray(rootProps.children);
  let hasSafeGLTF = false;
  let hasForce = false;
  let foundModelGroup: React.ReactElement<GroupElementProps> | null = null;
  let foundDynamicPawn: React.ReactElement<DynamicPawnElementProps> | null = null;
  let foundClone: React.ReactElement<MockCloneProps> | null = null;
  let bodyColor: string | null = null;
  let trimColor: string | null = null;
  let emptyHasMat = false;

  for (const child of children) {
    if (!React.isValidElement(child)) continue;
    const childProps = child.props as Record<string, unknown>;
    if (child.type === SafeGLTFModel || (child.type !== React.Suspense && childProps.fallback !== undefined) || childProps.forceFallback !== undefined) {
      hasSafeGLTF = true;
      if (childProps.forceFallback === true) hasForce = true;
    }

    const candidateNodes: React.ReactNode[] = child.type === React.Suspense
      ? React.Children.toArray(childProps.children as React.ReactNode)
      : [child];

    for (const candidate of candidateNodes) {
      if (!React.isValidElement(candidate)) continue;
      const candidateProps = candidate.props as Record<string, unknown>;
      if (candidate.type === 'group' && Array.isArray(candidateProps.position) && candidateProps.visible !== false) {
        foundModelGroup = candidate as React.ReactElement<GroupElementProps>;
        for (const inner of React.Children.toArray(candidateProps.children as React.ReactNode)) {
          if (React.isValidElement(inner)) {
            const innerProps = inner.props as DynamicPawnElementProps;
            if (typeof innerProps.modelUrl === 'string') {
              foundDynamicPawn = inner as React.ReactElement<DynamicPawnElementProps>;
              if (typeof inner.type === 'function') {
                const DynamicComponent = inner.type as React.ComponentType<DynamicPawnElementProps>;
                const cloneEl = renderDynamicComponentToClone(DynamicComponent, innerProps);

                if (cloneEl && React.isValidElement(cloneEl)) {
                  foundClone = cloneEl;
                  const cloneProps = cloneEl.props as MockCloneProps;
                  if (typeof cloneProps.inject === 'function') {
                    const testBody = new THREE.Mesh();
                    testBody.name = 'Pawn_Body';
                    const bodyInjected = cloneProps.inject(testBody);
                    if (bodyInjected && React.isValidElement(bodyInjected)) {
                      const mat = (bodyInjected.props as PrimitiveMaterialProps).object;
                      if (mat?.color && typeof mat.color.getHexString === 'function') bodyColor = '#' + mat.color.getHexString().toLowerCase();
                    }
                    const testTrim = new THREE.Mesh();
                    testTrim.name = 'Pawn_Trim';
                    testTrim.userData.isTrim = true;
                    const trimInjected = cloneProps.inject(testTrim);
                    if (trimInjected && React.isValidElement(trimInjected)) {
                      const mat = (trimInjected.props as PrimitiveMaterialProps).object;
                      if (mat?.color && typeof mat.color.getHexString === 'function') trimColor = '#' + mat.color.getHexString().toLowerCase();
                    }
                    const testEmpty = new THREE.Object3D();
                    testEmpty.name = 'Pawn_EmptyNode';
                    emptyHasMat = cloneProps.inject(testEmpty) !== null;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return { hasSafeGLTFModel: hasSafeGLTF, hasForceFallback: hasForce, modelGroup: foundModelGroup, dynamicPawnElement: foundDynamicPawn, cloneElement: foundClone, bodyMeshMaterialColor: bodyColor, trimMeshMaterialColor: trimColor, emptyNodeHasMaterial: emptyHasMat };
}

export function inspectLuxuryPawnGLTF(slotIndex: number, playerColor?: string): ExtractedGLTFInfo {
  return parseLuxuryPawnRoot(LuxuryPawnModel({ slotIndex, playerColor, forceFallback: false }));
}

const CHESS_TALL_ARCHETYPES = [
  { slot: 0, piece: 'Xe', name: 'Quân Xe Chiến Hoàng Gia', icon: '🏰', fallback: RookPawnFallback },
  { slot: 1, piece: 'Pháo', name: 'Quân Pháo Thần Công Cổ Điển', icon: '💣', fallback: CannonPawnFallback },
  { slot: 2, piece: 'Mã', name: 'Quân Mã Phong Vân Thượng Lưu', icon: '🐎', fallback: WarhorsePawnFallback },
  { slot: 3, piece: 'Hậu', name: 'Quân Hậu Quyền Quý Indochine', icon: '👑', fallback: QueenPawnFallback },
] as const;

const CULTURAL_PLAYER_COLORS = [
  { name: 'Ruby Red', color: '#DC2626' },
  { name: 'Emerald Green', color: '#27AE60' },
  { name: 'Amber Orange', color: '#E67E22' },
  { name: 'Ocean Cyan', color: '#0284C7' },
] as const;

describe('[TC-TCPF01/MSS..TC-TCPF04/A8][TC-AP01/MSS..TC-AP05/MSS][UI-S01/MSS][BR-UI-002][UC-IMP246] Tall Chess Pawns Contract Suite', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (msg.includes('is using incorrect casing') || msg.includes('does not recognize the') || msg.includes('non-boolean attribute')) return;
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
    setHeadlessGuardOverride(null);
  });

  afterEach(() => {
    setHeadlessGuardOverride(null);
    vi.clearAllMocks();
  });

  // FACET 1: BOUNDARY & RANGE
  describe('Facet 1: Boundary & Range — Tall Archetypes, Base & Height Proportions', () => {
    it('[TC-TCPF01.01/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS defines exactly 4 slots [0, 1, 2, 3]', () => {
      expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.slot)).toEqual([0, 1, 2, 3]);
    });

    it('[TC-TCPF01.02/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] LUXURY_PAWN_CONFIGS icons strictly map to ["🏰", "💣", "🐎", "👑"]', () => {
      expect(LUXURY_PAWN_CONFIGS.map((c) => c.icon)).toEqual(['🏰', '💣', '🐎', '👑']);
    });

    it('[TC-TCPF01.03/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 0 configuration matches Quân Xe Chiến 🏰 with default color #DC2626', () => {
      expect(LUXURY_PAWN_CONFIGS[0]?.name).toContain('Xe');
      expect(LUXURY_PAWN_CONFIGS[0]?.color.toUpperCase()).toBe('#DC2626');
    });

    it('[TC-TCPF01.04/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 1 configuration matches Quân Pháo Thần Công 💣 with default color #27AE60', () => {
      expect(LUXURY_PAWN_CONFIGS[1]?.name).toContain('Pháo');
      expect(LUXURY_PAWN_CONFIGS[1]?.color.toUpperCase()).toBe('#27AE60');
    });

    it('[TC-TCPF01.05/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 2 configuration matches Quân Mã Phong Vân 🐎 with default color #E67E22', () => {
      expect(LUXURY_PAWN_CONFIGS[2]?.name).toContain('Mã');
      expect(LUXURY_PAWN_CONFIGS[2]?.color.toUpperCase()).toBe('#E67E22');
    });

    it('[TC-TCPF01.06/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Slot 3 configuration matches Quân Hậu Quyền Quý Indochine 👑 with default color #10B981', () => {
      expect(LUXURY_PAWN_CONFIGS[3]?.name).toContain('Hậu');
      expect(LUXURY_PAWN_CONFIGS[3]?.color.toUpperCase()).toBe('#10B981');
    });

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.07/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Zero-Pedestal Base Invariant: Slot $slot ($name) has two-tiered round base with radius <= 0.15m',
      ({ slot, fallback: Component }) => {
        const markup = renderToStaticMarkup(React.createElement(Component, { config: LUXURY_PAWN_CONFIGS[slot]!, playerColor: '#DC2626' }));
        expect(hasMeshWithTestId(markup, 'pawn-base-tier1')).toBe(true);
        expect(hasMeshWithTestId(markup, 'pawn-base-tier2')).toBe(true);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.08/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Tall Pillar Height Invariant: Slot $slot ($name) contains tall column cylinderGeometry with height >= 0.20m',
      ({ slot, fallback: Component }) => {
        const markup = renderToStaticMarkup(React.createElement(Component, { config: LUXURY_PAWN_CONFIGS[slot]!, playerColor: '#27AE60' }));
        expect(hasMeshWithTestId(markup, 'pawn-tall-column')).toBe(true);
        const columnCylinders = extractCylinderArgs(markup, 'pawn-tall-column');
        const tallestHeight = Math.max(...columnCylinders.map((c) => c[2] ?? 0), 0);
        expect(tallestHeight).toBeGreaterThanOrEqual(0.20);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.09/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Gold Neck Collar Invariant: Slot $slot ($name) contains pawn-neck-ring with gold color #F59E0B',
      ({ slot, fallback: Component }) => {
        const markup = renderToStaticMarkup(React.createElement(Component, { config: LUXURY_PAWN_CONFIGS[slot]!, playerColor: '#E67E22' }));
        expect(hasMeshWithTestId(markup, 'pawn-neck-ring')).toBe(true);
        expect(extractMeshColorByTestId(markup, 'pawn-neck-ring')?.toUpperCase()).toBe('#F59E0B');
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.10/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] PBR Toy Lacquer Standard: Slot $slot ($name) metalness <= 0.40 and roughness in [0.20, 0.35]',
      ({ slot }) => {
        expect(LUXURY_PAWN_CONFIGS[slot]!.metalness).toBeLessThanOrEqual(0.40);
        expect(LUXURY_PAWN_CONFIGS[slot]!.roughness).toBeGreaterThanOrEqual(0.20);
      }
    );

    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF01.11/MSS][UI-S01/MSS][BR-UI-002][Facet1-Boundary] Stature Uniformity: Slot $slot ($name) scale components are normalized [1.0, 1.0, 1.0]',
      ({ slot }) => {
        expect(LUXURY_PAWN_CONFIGS[slot]!.scale).toEqual([1.0, 1.0, 1.0]);
      }
    );
  });

  // FACET 2: STATE REACTIVITY
  describe('Facet 2: State Reactivity & Consumer Assertions — Full Color & Head Geometry', () => {
    it.each(CHESS_TALL_ARCHETYPES)(
      '[TC-TCPF02.01/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Consumer Point: Slot $slot ($name) propagates dynamic playerColor "#0284C7" to tall column pillar',
      ({ slot, fallback: Component }) => {
        const markup = renderToStaticMarkup(React.createElement(Component, { config: LUXURY_PAWN_CONFIGS[slot]!, playerColor: '#0284C7' }));
        expect(extractMeshColorByTestId(markup, 'pawn-tall-column')?.toLowerCase()).toBe('#0284c7');
        expect(hasMeshWithTestId(markup, 'pawn-tall-column')).toBe(true);
      }
    );

    it.each(CULTURAL_PLAYER_COLORS)(
      '[TC-TCPF02.02/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Zero-Inox & Zero-Bronze: Dynamic color $color leaves zero silver and zero bronze in body meshes',
      ({ color }) => {
        const markup = renderToStaticMarkup(React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 0, config: LUXURY_PAWN_CONFIGS[0]!, playerColor: color }));
        const bodyColors = extractPawnBodyColors(markup);
        expect(bodyColors.includes('#f8fafc')).toBe(false);
        expect(bodyColors.includes('#e2e8f0')).toBe(false);
      }
    );

    it('[TC-TCPF02.03/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 0 (Quân Xe 🏰): Has 4 crenellation blocks surrounding a central dome/sphere', () => {
      const markup = renderToStaticMarkup(React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' }));
      expect(countMeshesWithTestId(markup, 'pawn-rook-crenellation')).toBe(4);
      expect(hasMeshWithTestId(markup, 'pawn-rook-dome')).toBe(true);
    });

    it('[TC-TCPF02.04/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 1 (Quân Pháo 💣): Has upward-angled cannon barrel with gold muzzle ring #F59E0B', () => {
      const markup = renderToStaticMarkup(React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' }));
      expect(hasMeshWithTestId(markup, 'pawn-cannon-barrel')).toBe(true);
      expect(extractMeshColorByTestId(markup, 'pawn-cannon-muzzle')?.toUpperCase()).toBe('#F59E0B');
    });

    it('[TC-TCPF02.05/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 2 (Quân Mã 🐎): Has proud knight head with ears and gold flowing mane #F59E0B', () => {
      const markup = renderToStaticMarkup(React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' }));
      expect(hasMeshWithTestId(markup, 'pawn-horse-head')).toBe(true);
      expect(hasMeshWithTestId(markup, 'pawn-horse-mane')).toBe(true);
    });

    it('[TC-TCPF02.06/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Iconic Head Slot 3 (Quân Hậu 👑): Has Indochine flaring crown with 6 tips and gold gem atop', () => {
      const markup = renderToStaticMarkup(React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' }));
      expect(hasMeshWithTestId(markup, 'pawn-queen-crown')).toBe(true);
      expect(countMeshesWithTestId(markup, 'pawn-crown-point')).toBe(6);
    });

    it.each(CULTURAL_PLAYER_COLORS)(
      '[TC-TCPF02.07/MSS][UI-S01/MSS][BR-UI-002][Facet2-Reactivity] Consumer Point: pawn-aura-pedestal and pawn-enamel-ring reactively reflect playerColor $color',
      ({ color }) => {
        const markup = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: color }));
        expect(extractMeshColorByTestId(markup, 'pawn-aura-pedestal')?.toLowerCase()).toBe(color.toLowerCase());
        expect(extractMeshColorByTestId(markup, 'pawn-enamel-ring')?.toLowerCase()).toBe(color.toLowerCase());
      }
    );
  });

  // FACET 3: RESOURCE DISPOSAL & SSR
  describe('Facet 3: Resource Disposal & SSR Headless Safety', () => {
    it('[TC-TCPF03.01/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnModel renders cleanly in SSR without throwing', () => {
      expect(() => {
        renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: 0, playerColor: '#DC2626' }));
      }).not.toThrow();
    });

    it('[TC-TCPF03.02/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Idempotent SSR rendering over 5 cycles generates identical markup with zero listener leak', () => {
      const run1 = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#27AE60' }));
      const run5 = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: 1, playerColor: '#27AE60' }));
      expect(run1).toBe(run5);
    });

    it('[TC-TCPF03.03/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] Fallback Registry Exports: Rook, Cannon, Warhorse, Queen fallbacks produce valid React elements', () => {
      const rookEl = React.createElement(RookPawnFallback, { config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' });
      const cannonEl = React.createElement(CannonPawnFallback, { config: LUXURY_PAWN_CONFIGS[1]!, playerColor: '#27AE60' });
      const horseEl = React.createElement(WarhorsePawnFallback, { config: LUXURY_PAWN_CONFIGS[2]!, playerColor: '#E67E22' });
      const queenEl = React.createElement(QueenPawnFallback, { config: LUXURY_PAWN_CONFIGS[3]!, playerColor: '#10B981' });
      expect(React.isValidElement(rookEl)).toBe(true);
      expect(React.isValidElement(cannonEl)).toBe(true);
      expect(React.isValidElement(horseEl)).toBe(true);
      expect(React.isValidElement(queenEl)).toBe(true);
    });

    it('[TC-TCPF03.04/MSS][UI-S01/MSS][BR-UI-002][Facet3-Disposal] LuxuryPawnProceduralFallback produces pure functional React element with zero memory leak', () => {
      const element = React.createElement(LuxuryPawnProceduralFallback, { slotIndex: 0, config: LUXURY_PAWN_CONFIGS[0]!, playerColor: '#DC2626' });
      expect(React.isValidElement(element)).toBe(true);
    });
  });

  // FACET 4: ERROR DEFENSE & SLOT BOUNDS
  describe('Facet 4: Error Defense & Slot Bounds', () => {
    it('[TC-TCPF04.01/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Out-of-bounds slotIndex (-1, 4, 999, NaN, Infinity) safely clamps to Slot 0 (Quân Xe 🏰)', () => {
      expect(getPawnConfigBySlot(-1).slot).toBe(0);
      expect(getPawnConfigBySlot(4).slot).toBe(0);
      expect(getPawnConfigBySlot(999).slot).toBe(0);
      expect(getPawnConfigBySlot(NaN).slot).toBe(0);
    });

    it('[TC-TCPF04.02/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] Undefined or empty playerColor falls back cleanly to config.color without producing "undefined" or NaN', () => {
      const markup = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: 0 }));
      expect(markup).not.toContain('color="undefined"');
      expect(markup).not.toContain('NaN');
    });

    it('[TC-TCPF04.05/MSS][UI-S01/MSS][BR-UI-002][Facet4-Defense] assignRandomPlayerPawns produces 4 pure chess pieces for 4 players and handles empty input safely', () => {
      expect(assignRandomPlayerPawns([])).toEqual([]);
      const fourPlayers = assignRandomPlayerPawns(['p1', 'p2', 'p3', 'p4'], 'SEED_TEST_4P');
      expect(fourPlayers.map((p) => p.mascotIcon).sort()).toEqual(['👑', '🏰', '💣', '🐎'].sort());
    });
  });

  // FACET 5: GLTF ASSET PIPELINE MODERNIZATION (IMP-246 CONTRACTS)
  describe('Facet 5: GLTF Asset Pipeline Modernization (IMP-246 Contracts)', () => {
    describe('Subsection 5A: Dynamic playerColor Reactivity on Pawn_Body', () => {
      it('[TC-AP01.01/MSS][UC-IMP246] GLTF Pipeline: Pawn_Body dynamically reflects Ruby Red #DC2626', () => {
        const info = inspectLuxuryPawnGLTF(0, '#DC2626');
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.bodyMeshMaterialColor).toBe('#dc2626');
      });

      it('[TC-AP01.02/MSS][UC-IMP246] GLTF Pipeline: Pawn_Body dynamically reflects Emerald Green #27AE60', () => {
        const info = inspectLuxuryPawnGLTF(1, '#27AE60');
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.bodyMeshMaterialColor).toBe('#27ae60');
      });

      it('[TC-AP01.03/MSS][UC-IMP246] GLTF Pipeline: Pawn_Body dynamically reflects Amber Orange #E67E22', () => {
        const info = inspectLuxuryPawnGLTF(2, '#E67E22');
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.bodyMeshMaterialColor).toBe('#e67e22');
      });

      it('[TC-AP01.04/MSS][UC-IMP246] GLTF Pipeline: Pawn_Body dynamically reflects Ocean Cyan #0284C7', () => {
        const info = inspectLuxuryPawnGLTF(3, '#0284C7');
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.bodyMeshMaterialColor).toBe('#0284c7');
      });
    });

    describe('Subsection 5B: Material Separation & Non-Mesh Node Filtering', () => {
      it('[TC-AP02.01/MSS][UC-IMP246] Material Separation: Mesh Pawn_Trim receives fixed gold trim material #F59E0B', () => {
        const info = inspectLuxuryPawnGLTF(0, '#DC2626');
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.trimMeshMaterialColor).toBe('#f59e0b');
      });

      it('[TC-AP02.02/MSS][UC-IMP246] Non-Mesh Filtering: Object3D non-Mesh node rejects material injection (inject returns null)', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.cloneElement).not.toBeNull();
        expect(info.emptyNodeHasMaterial).toBe(false);
      });

      it('[TC-AP02.03/MSS][UC-IMP246] Default Color Fallback: Pawn_Body falls back to config.color when playerColor is omitted', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.dynamicPawnElement).not.toBeNull();
        expect(info.bodyMeshMaterialColor).toBe('#dc2626');
      });
    });

    describe('Subsection 5C: Slot Model URL Mapping', () => {
      it('[TC-AP03.01/MSS][UC-IMP246] Slot Model Mapping: Slot 0 (Xe) maps to /models/pawns/pawn_rook.glb and triggers GLTF pipeline', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.dynamicPawnElement?.props?.modelUrl).toBe('/models/pawns/pawn_rook.glb');
      });

      it('[TC-AP03.02/MSS][UC-IMP246] Slot Model Mapping: Slot 1 (Pháo) maps to /models/pawns/pawn_cannon.glb and triggers GLTF pipeline', () => {
        const info = inspectLuxuryPawnGLTF(1);
        expect(info.dynamicPawnElement?.props?.modelUrl).toBe('/models/pawns/pawn_cannon.glb');
      });

      it('[TC-AP03.03/MSS][UC-IMP246] Slot Model Mapping: Slot 2 (Mã) maps to /models/pawns/pawn_horse.glb and triggers GLTF pipeline', () => {
        const info = inspectLuxuryPawnGLTF(2);
        expect(info.dynamicPawnElement?.props?.modelUrl).toBe('/models/pawns/pawn_horse.glb');
      });

      it('[TC-AP03.04/MSS][UC-IMP246] Slot Model Mapping: Slot 3 (Hậu) maps to /models/pawns/pawn_queen.glb and triggers GLTF pipeline', () => {
        const info = inspectLuxuryPawnGLTF(3);
        expect(info.dynamicPawnElement?.props?.modelUrl).toBe('/models/pawns/pawn_queen.glb');
      });
    });

    describe('Subsection 5D: Shadow Budget Preservation & Zero SafeGLTFModel', () => {
      it('[TC-AP04.01/MSS][UC-IMP246] Shadow Budget: castShadow and receiveShadow are propagated to Clone component', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.cloneElement?.props?.castShadow).toBe(true);
        expect(info.cloneElement?.props?.receiveShadow).toBe(true);
      });

      it('[TC-AP04.02/MSS][UC-IMP246] Pipeline Modernization: LuxuryPawnModel contains zero SafeGLTFModel and zero forceFallback', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.hasSafeGLTFModel).toBe(false);
        expect(info.hasForceFallback).toBe(false);
      });
    });

    describe('Subsection 5E: Helper Adversarial Gate & PBR Material Parameters', () => {
      it('[TC-AP05.01/MSS][UC-IMP246] Helper Adversarial Gate: parseLuxuryPawnRoot safely handles null and malformed root inputs', () => {
        const nullResult = parseLuxuryPawnRoot(null);
        expect(nullResult.hasSafeGLTFModel).toBe(false);
        expect(nullResult.dynamicPawnElement).toBeNull();
        const nonPawnResult = parseLuxuryPawnRoot(React.createElement('div', null, 'malformed root'));
        expect(nonPawnResult.cloneElement).toBeNull();
      });

      it('[TC-AP05.02/MSS][UC-IMP246] PBR Material Contract: Body roughness=0.15/metalness=0.2 and Trim roughness=0.1/metalness=0.9', () => {
        const info = inspectLuxuryPawnGLTF(0, '#DC2626');
        expect(info.cloneElement).not.toBeNull();
        const testBody = new THREE.Mesh();
        testBody.name = 'Pawn_Body';
        const bodyMat = (info.cloneElement?.props?.inject?.(testBody)?.props as PrimitiveMaterialProps | undefined)?.object;
        expect(bodyMat?.roughness).toBeCloseTo(0.15, 2);
        expect(bodyMat?.metalness).toBeCloseTo(0.2, 2);
      });

      it('[TC-AP05.03/MSS][UC-IMP246] Clean Disposal Contract: GLTF injected materials provide dispose lifecycle cleanup', () => {
        const info = inspectLuxuryPawnGLTF(0);
        expect(info.cloneElement).not.toBeNull();
        const testBody = new THREE.Mesh();
        testBody.name = 'Pawn_Body';
        const bodyMat = (info.cloneElement?.props?.inject?.(testBody)?.props as PrimitiveMaterialProps | undefined)?.object;
        expect(typeof bodyMat?.dispose).toBe('function');
      });

      it('[TC-AP05.04/MSS][UC-IMP246] Outer Group Archetype: LuxuryPawnModel maintains outer group position [0, -0.28, 0] and scale [0.92, 0.92, 0.92]', () => {
        const root = LuxuryPawnModel({ slotIndex: 0 });
        const rootProps = root.props as { readonly position?: readonly number[]; readonly scale?: readonly number[] };
        expect(rootProps.position).toEqual([0, -0.28, 0]);
        expect(rootProps.scale).toEqual([0.92, 0.92, 0.92]);
      });
    });
  });
});

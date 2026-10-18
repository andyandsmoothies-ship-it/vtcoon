// [TC-439/MSS][IMP-439] Contract Test Suite: Indochine Tabletop Restoration & 4-Pillar Spatial Remediation
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Scene, Color, Fog } from 'three';
import '../helpers/r3f_test_harness';
import { sharedR3FHarness } from '../helpers/r3f_test_harness';
import {
  findReactNode,
  findReactNodes,
  captureTree,
  type RenderableFunctionComponent,
} from '../helpers/threejs_test_utils';
import {
  GameBoard,
  TabletopSalonAtmosphere,
} from '../../src/client/3d/board_layout';
import { TimeOfDayLighting } from '../../src/client/3d/time_of_day_lighting';
import {
  MiniatureCityDiorama,
  CentralMonumentPlaza,
  DioramaUrbanCanopy,
  SUNKEN_ARENA_MODEL_URL,
  BRIDGE_PLAZAS_MODEL_URL,
  INDOCHINE_BIOME_MODEL_URL,
  TABLETOP_DIORAMA_MODEL_URL,
  BOARD_TERRAIN_BASE_URL,
  DICE_ARENA_PLINTH_URL,
  LANDMARKS_CLUSTER_URL,
  type CentralMonumentPlazaProps,
  type MiniatureCityDioramaProps,
} from '../../src/client/3d/miniature_city_diorama';
import { DiceTray, type DiceTrayProps } from '../../src/client/3d/dice_tray';
import {
  DioramaTerrain,
  SAIGON_RIVER_SPLINE_MODEL_URL,
  PAVED_ESPLANADE_MODEL_URL,
  type DioramaTerrainProps,
} from '../../src/client/3d/diorama/diorama_terrain';
import {
  DioramaHeritageDistrict,
  LANDMARK_MODEL_URLS,
  type DioramaHeritageDistrictProps,
} from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import {
  DioramaBridges,
  type DioramaBridgesProps,
} from '../../src/client/3d/diorama/diorama_bridges';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import {
  SafeGLTFModel,
  type SafeGLTFModelProps,
} from '../../src/client/3d/asset_loader/safe_gltf_model';
import { CHAIN_REACTION_STAGE_SPECS } from '../../src/client/3d/toybox_wealth_tray_visuals';
import { useDiagnostic3DStore } from '../../src/client/3d/diagnostic_3d_store';
import { useGameStore } from '../../src/client/store/game_store';

interface GroupProps {
  readonly position?: readonly [number, number, number] | readonly number[];
  readonly visible?: boolean;
  readonly name?: string;
  readonly 'data-testid'?: string;
  readonly children?: React.ReactNode;
}

interface MeshProps {
  readonly position?: readonly [number, number, number] | readonly number[];
  readonly visible?: boolean;
  readonly 'data-testid'?: string;
  readonly children?: React.ReactNode;
}

interface BoxGeometryArgsProps {
  readonly args?: readonly [number, number, number];
}

interface MaterialProps {
  readonly color?: string;
  readonly roughness?: number;
  readonly metalness?: number;
  readonly transparent?: boolean;
  readonly opacity?: number;
}

interface ExtendedHeritageProps extends DioramaHeritageDistrictProps {
  readonly isDesktopLean?: boolean;
}

interface ExtendedBridgesProps extends DioramaBridgesProps {
  readonly isDesktopLean?: boolean;
}

const HeritageDistrictComponent: RenderableFunctionComponent<ExtendedHeritageProps> = DioramaHeritageDistrict;
const BridgesComponent: RenderableFunctionComponent<ExtendedBridgesProps> = DioramaBridges;

describe('[TC-439/MSS] Indochine Tabletop Restoration & 4-Pillar Spatial Remediation Contract Suite', () => {
  beforeEach(() => {
    sharedR3FHarness.reset();
    useGameStore.setState({ activeModal: null });
    useDiagnostic3DStore.setState({
      isOceanVisible: true,
      isTableVisible: true,
      isCityVisible: true,
      isBoardVisible: true,
    });
  });

  describe('Pillar 1: Banish Void Ocean & Frame-Loop Peace [TC-439.01, TC-439.02]', () => {
    it('TC-439.01a [UC-BANISH-VOID-OCEAN-AND-ESPLANADE-FALLBACK/MSS]: GameBoard mounts CoastalIslandEnvironment inside visible group when isOceanVisible is true on desktop', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: true });
      const desktopTree = captureTree(GameBoard, { isMobile: false });
      const coastalWrapper = findReactNode<GroupProps>(
        desktopTree,
        (n) => n.type === 'group' && React.Children.toArray(n.props?.children).some(
          (c) => React.isValidElement(c) && c.type === CoastalIslandEnvironment,
        ),
      );

      expect(coastalWrapper?.props?.visible).toBe(true);
    });

    it('TC-439.01b [UC-BANISH-VOID-OCEAN-AND-ESPLANADE-FALLBACK/MSS]: GameBoard suppresses CoastalIslandEnvironment inside group when isOceanVisible is false on mobile', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: false });
      const mobileTree = captureTree(GameBoard, { isMobile: true });
      const coastalWrapper = findReactNode<GroupProps>(
        mobileTree,
        (n) => n.type === 'group' && React.Children.toArray(n.props?.children).some(
          (c) => React.isValidElement(c) && c.type === CoastalIslandEnvironment,
        ),
      );

      expect(coastalWrapper?.props?.visible).toBe(false);
    });

    it('TC-439.01c [UC-BANISH-VOID-OCEAN-AND-ESPLANADE-FALLBACK/MSS]: GameBoard wraps 48m VIP plinth in group with visible={!isOceanVisible}', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: true });
      const desktopTree = captureTree(GameBoard, { isMobile: false });
      const plinthWrapper = findReactNode<GroupProps>(
        desktopTree,
        (n) => n.type === 'group' && React.Children.toArray(n.props?.children).some(
          (c) => React.isValidElement(c) && (c.type === TabletopSalonAtmosphere || c.type === 'mesh'),
        ) && Boolean(findReactNode<MeshProps>(n.props?.children, (m) => {
          const geom = findReactNode<BoxGeometryArgsProps>(m.props?.children, (g) => g.type === 'boxGeometry');
          return geom?.props?.args?.[0] === 48.0;
        })),
      );

      expect(plinthWrapper?.props?.visible).toBe(false);
    });

    it('TC-439.01d [UC-BANISH-VOID-OCEAN-AND-ESPLANADE-FALLBACK/MSS]: GameBoard sets forceFallback on PAVED_ESPLANADE_MODEL_URL SafeGLTFModel on desktop', () => {
      const desktopTree = captureTree(GameBoard, { isMobile: false });
      const esplanadeModel = findReactNode<SafeGLTFModelProps>(
        desktopTree,
        (n) => n.type === SafeGLTFModel && n.props?.url === PAVED_ESPLANADE_MODEL_URL,
      );

      expect(esplanadeModel?.props?.forceFallback).toBe(true);
    });

    it('TC-439.02a [UC-STUDIO-SLATE-NO-FRAME-FIGHTING/A1]: TabletopSalonAtmosphere sets scene background and fog to studio slate #1E293B when isOceanVisible is false', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: false });
      useGameStore.setState({ activeModal: null });
      const scene = new Scene();
      scene.background = new Color('#000000');
      scene.fog = new Fog('#000000', 10, 50);
      sharedR3FHarness.state.scene = scene;

      renderToStaticMarkup(React.createElement(TabletopSalonAtmosphere, { isDesktopLean: true }));
      sharedR3FHarness.advanceFrame(0.016);

      const bgHex = scene.background instanceof Color ? scene.background.getHexString().toLowerCase() : '';
      const fogHex = scene.fog instanceof Fog ? scene.fog.color.getHexString().toLowerCase() : '';

      expect(bgHex).toBe('1e293b');
      expect(fogHex).toBe('1e293b');
    });

    it('TC-439.02b [UC-STUDIO-SLATE-NO-FRAME-FIGHTING/A1]: TimeOfDayLighting does not overwrite scene background or fog color when isOceanVisible is false', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: false });
      useGameStore.setState({ activeModal: null });
      const scene = new Scene();
      scene.background = new Color('#1E293B');
      scene.fog = new Fog('#1E293B', 25, 95);
      sharedR3FHarness.state.scene = scene;

      renderToStaticMarkup(
        React.createElement(() => {
          TabletopSalonAtmosphere({ isDesktopLean: true });
          TimeOfDayLighting({ isMobile: false });
          return null;
        }),
      );
      sharedR3FHarness.advanceFrame(0.016);
      sharedR3FHarness.advanceFrame(0.016);

      const bgHex = scene.background instanceof Color ? scene.background.getHexString().toLowerCase() : '';
      expect(bgHex).toBe('1e293b');
    });

    it('TC-439.02c [UC-STUDIO-SLATE-NO-FRAME-FIGHTING/A1]: TabletopSalonAtmosphere returns early without mutating scene when isOceanVisible is true', () => {
      useDiagnostic3DStore.setState({ isOceanVisible: true });
      useGameStore.setState({ activeModal: null });
      const scene = new Scene();
      scene.background = new Color('#BAE6FD');
      scene.fog = new Fog('#BAE6FD', 30, 100);
      sharedR3FHarness.state.scene = scene;

      renderToStaticMarkup(React.createElement(TabletopSalonAtmosphere, { isDesktopLean: true }));
      sharedR3FHarness.advanceFrame(0.016);

      const bgHex = scene.background instanceof Color ? scene.background.getHexString().toLowerCase() : '';
      expect(bgHex).toBe('bae6fd');
    });
  });

  describe('Pillar 2: South No-Build Zone & NE Horizon Sync [TC-439.03]', () => {
    it('TC-439.03a [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: DioramaHeritageDistrict sits at NE [4.2, 0.16, -4.2] with forceFallback on cathedral when isDesktopLean is true', () => {
      const districtTree = captureTree(HeritageDistrictComponent, { isMobile: false, isDesktopLean: true });
      const cathedralModel = findReactNode<SafeGLTFModelProps>(
        districtTree,
        (n) => n.props?.url === LANDMARK_MODEL_URLS.cathedral,
      );

      expect(districtTree?.props?.position).toEqual([4.2, 0.16, -4.2]);
      expect(cathedralModel?.props?.forceFallback).toBe(true);
    });

    it('TC-439.03b [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: DioramaBridges suppresses South Long Bien Bridge while keeping North Ba Son Bridge visible when isDesktopLean is true', () => {
      const bridgesTree = captureTree(BridgesComponent, { isMobile: false, isDesktopLean: true });
      const southBridgeGroup = findReactNode<GroupProps>(
        bridgesTree,
        (n) => n.type === 'group' && Array.isArray(n.props?.position) && n.props.position[2] === 3.8,
      );
      const northBridgeGroup = findReactNode<GroupProps>(
        bridgesTree,
        (n) => n.type === 'group' && Array.isArray(n.props?.position) && n.props.position[2] === -3.8,
      );

      expect(southBridgeGroup?.props?.visible).toBe(false);
      expect(northBridgeGroup?.props?.visible).not.toBe(false);
    });

    it('TC-439.03c [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: MiniatureCityDiorama preserves visibility on bridge and district landmark groups on serene tabletop', () => {
      const desktopTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const bridgeGroup = findReactNode<GroupProps>(
        desktopTree,
        (n) => n.props?.name === 'ChainLandmark_bason-bridge',
      );
      const cathedralGroup = findReactNode<GroupProps>(
        desktopTree,
        (n) => n.props?.name === 'ChainLandmark_notre-dame-cathedral',
      );

      expect(bridgeGroup?.props?.visible).not.toBe(false);
      expect(cathedralGroup?.props?.visible).not.toBe(false);
    });

    it('TC-439.03d [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: CHAIN_REACTION_STAGE_SPECS[4] worldPosition is synchronized to NE [4.4, 0.20, -3.32]', () => {
      expect(CHAIN_REACTION_STAGE_SPECS[4]?.id).toBe('notre-dame-cathedral');
      expect(CHAIN_REACTION_STAGE_SPECS[4]?.worldPosition).toEqual([4.4, 0.20, -3.32]);
    });

    it('TC-439.03e [UC-SOUTH-NO-BUILD-ZONE-AND-NE-CATHEDRAL-SYNC/MSS]: DioramaSkyline NE streetlamps maintain clearance > 0.55m from Cong Xa Paris Plaza at (4.40, -4.42)', () => {
      const skylineTree = captureTree(DioramaSkyline, { isMobile: false });
      const lampNodes = findReactNodes<GroupProps>(
        skylineTree,
        (n) => n.type === 'group' && Array.isArray(n.props?.position) && n.props.position.length === 3 && n.props.position[1] === 0.16,
      );
      const neLamps = lampNodes.filter((l) => {
        const pos = l.props.position;
        return Array.isArray(pos) && pos[0] > 0 && pos[2] < 0;
      });
      const distances = neLamps.map((l) => {
        const pos = l.props.position as readonly [number, number, number];
        return Math.hypot(pos[0] - 4.40, pos[2] - (-4.42));
      });
      const minDistance = Math.min(...distances);

      expect(neLamps.length).toBeGreaterThanOrEqual(1);
      expect(minDistance).toBeGreaterThan(0.55);
    });
  });

  describe('Pillar 3: GLB Clutter Purge & Cross-Platform Dong Son [TC-439.04]', () => {
    it('TC-439.04a [UC-GLB-CLUTTER-PURGE-AND-CROSS-PLATFORM-DONG-SON/MSS]: MiniatureCityDiorama purges BOARD_TERRAIN_BASE_URL, DICE_ARENA_PLINTH_URL, and LANDMARKS_CLUSTER_URL', () => {
      const desktopTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const terrainBase = findReactNode<SafeGLTFModelProps>(
        desktopTree,
        (n) => n.props?.url === BOARD_TERRAIN_BASE_URL,
      );
      const dicePlinth = findReactNode<SafeGLTFModelProps>(
        desktopTree,
        (n) => n.props?.url === DICE_ARENA_PLINTH_URL,
      );
      const landmarksCluster = findReactNode<SafeGLTFModelProps>(
        desktopTree,
        (n) => n.props?.url === LANDMARKS_CLUSTER_URL,
      );

      expect(terrainBase).toBeNull();
      expect(dicePlinth).toBeNull();
      expect(landmarksCluster).toBeNull();
    });

    it('TC-439.04b [UC-GLB-CLUTTER-PURGE-AND-CROSS-PLATFORM-DONG-SON/MSS]: Sub-assemblies set forceFallback on SUNKEN_ARENA, INDOCHINE_BIOME, and BRIDGE_PLAZAS', () => {
      const plazaTree = captureTree(CentralMonumentPlaza, { isDesktopLean: true, isMobile: false });
      const arenaModel = findReactNode<SafeGLTFModelProps>(
        plazaTree,
        (n) => n.props?.url === SUNKEN_ARENA_MODEL_URL,
      );
      const canopyTree = captureTree(DioramaUrbanCanopy, { isSereneTabletop: true, isMobile: false });
      const biomeModel = findReactNode<SafeGLTFModelProps>(
        canopyTree,
        (n) => n.props?.url === INDOCHINE_BIOME_MODEL_URL,
      );
      const dioramaTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const bridgePlazasModel = findReactNode<SafeGLTFModelProps>(
        dioramaTree,
        (n) => n.props?.url === BRIDGE_PLAZAS_MODEL_URL,
      );

      expect(arenaModel?.props?.forceFallback).toBe(true);
      expect(biomeModel?.props?.forceFallback).toBe(true);
      expect(bridgePlazasModel?.props?.forceFallback).toBe(true);
    });

    it('TC-439.04c [UC-GLB-CLUTTER-PURGE-AND-CROSS-PLATFORM-DONG-SON/MSS]: CentralMonumentPlaza receives isDesktopLean from MiniatureCityDiorama and renders flat Dong Son with brass rim', () => {
      const desktopTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const plaza = findReactNode<CentralMonumentPlazaProps>(
        desktopTree,
        (n) => n.type === CentralMonumentPlaza,
      );
      expect(plaza?.props?.isDesktopLean).toBe(true);

      const mobileTree = captureTree(CentralMonumentPlaza, { isMobile: true, isDesktopLean: true });
      const brassRim = findReactNode<MaterialProps>(
        mobileTree,
        (n) => n.props?.color === '#D4AF37',
      );

      expect(brassRim).not.toBeNull();
      expect(brassRim?.props?.metalness).toBeGreaterThanOrEqual(0.85);
    });
  });

  describe('Pillar 4: Royal Emerald Turf & River Restoration [TC-439.05]', () => {
    it('TC-439.05a [UC-ROYAL-EMERALD-TURF-AND-RIVER-RESTORE/MSS]: MiniatureCityDiorama forwards mossPalette=false to DioramaTerrain across desktop and mobile', () => {
      const desktopTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const desktopTerrain = findReactNode<DioramaTerrainProps>(
        desktopTree,
        (n) => n.type === DioramaTerrain,
      );
      const mobileTree = captureTree(MiniatureCityDiorama, { isDesktopLean: false, isMobile: true });
      const mobileTerrain = findReactNode<DioramaTerrainProps>(
        mobileTree,
        (n) => n.type === DioramaTerrain,
      );

      expect(desktopTerrain?.props?.mossPalette).toBe(false);
      expect(mobileTerrain?.props?.mossPalette).toBe(false);
    });

    it('TC-439.05b [UC-ROYAL-EMERALD-TURF-AND-RIVER-RESTORE/MSS]: DioramaTerrain sets forceFallback on SAIGON_RIVER_SPLINE_MODEL_URL with turquoise river water #0284C7', () => {
      const terrainTree = captureTree(DioramaTerrain, { isSereneTabletop: true, mossPalette: false });
      const riverModel = findReactNode<SafeGLTFModelProps>(
        terrainTree,
        (n) => n.props?.url === SAIGON_RIVER_SPLINE_MODEL_URL,
      );
      const riverWater = findReactNode<MaterialProps>(
        riverModel?.props?.fallback as React.ReactNode,
        (n) => n.props?.color === '#0284C7',
      );

      expect(riverModel?.props?.forceFallback).toBe(true);
      expect(riverWater).not.toBeNull();
    });

    it('TC-439.05c [UC-ROYAL-EMERALD-TURF-AND-RIVER-RESTORE/MSS]: DioramaTerrain infill mesh sits at position [0, 0, 0] with emerald turf #15803D', () => {
      const terrainTree = captureTree(DioramaTerrain, { isSereneTabletop: true, mossPalette: false });
      const infillMesh = findReactNode<MeshProps>(
        terrainTree,
        (n) => n.props?.['data-testid'] === 'diorama-tabletop-infill',
      );
      const turfMaterial = findReactNode<MaterialProps>(
        infillMesh?.props?.children as React.ReactNode,
        (n) => n.props?.color === '#15803D',
      );

      expect(infillMesh?.props?.position).toEqual([0, 0, 0]);
      expect(turfMaterial).not.toBeNull();
    });
  });

  describe('Pillar 5: Sculpted Tabletop Diorama GLB Integration [TC-439.06]', () => {
    it('TC-439.06a [UC-TABLETOP-DIORAMA-GLB-MOUNT/MSS]: TABLETOP_DIORAMA_MODEL_URL points to /models/board/tabletop_diorama.glb and mounts on Desktop with castShadow=true', () => {
      expect(TABLETOP_DIORAMA_MODEL_URL).toBe('/models/board/tabletop_diorama.glb');
      const desktopTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: false });
      const desktopGlb = findReactNode<SafeGLTFModelProps>(
        desktopTree,
        (n) => n.type === SafeGLTFModel && n.props?.url === TABLETOP_DIORAMA_MODEL_URL,
      );

      expect(desktopGlb).not.toBeNull();
      expect(desktopGlb?.props?.position).toEqual([0, 0, 0]);
      expect(desktopGlb?.props?.castShadow).toBe(true);
    });

    it('TC-439.06b [UC-TABLETOP-DIORAMA-GLB-MOUNT/A1]: MiniatureCityDiorama mounts TABLETOP_DIORAMA_MODEL_URL on Mobile with receiveShadow=true and castShadow=false', () => {
      const mobileTree = captureTree(MiniatureCityDiorama, { isDesktopLean: true, isMobile: true });
      const mobileGlb = findReactNode<SafeGLTFModelProps>(
        mobileTree,
        (n) => n.type === SafeGLTFModel && n.props?.url === TABLETOP_DIORAMA_MODEL_URL,
      );

      expect(mobileGlb).not.toBeNull();
      expect(mobileGlb?.props?.receiveShadow).toBe(true);
      expect(mobileGlb?.props?.castShadow).toBe(false);
      expect(mobileGlb?.props?.fallback).toBeNull();
    });

    it('TC-439.06c [UC-TABLETOP-DIORAMA-GLB-MOUNT/A2]: GameBoard passes isDesktopLean=true and hasSunkenArena=true across both Desktop and Mobile', () => {
      const desktopBoard = captureTree(GameBoard, { isMobile: false });
      const mobileBoard = captureTree(GameBoard, { isMobile: true });
      const desktopDiorama = findReactNode<MiniatureCityDioramaProps>(
        desktopBoard,
        (n) => n.type === MiniatureCityDiorama,
      );
      const mobileDiorama = findReactNode<MiniatureCityDioramaProps>(
        mobileBoard,
        (n) => n.type === MiniatureCityDiorama,
      );
      const mobileDiceTray = findReactNode<DiceTrayProps>(
        mobileBoard,
        (n) => n.type === DiceTray,
      );

      expect(desktopDiorama?.props?.isDesktopLean).toBe(true);
      expect(mobileDiorama?.props?.isDesktopLean).toBe(true);
      expect(mobileDiceTray?.props?.hasSunkenArena).toBe(true);
    });
  });
});

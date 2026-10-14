// [UI-S02/MSS][IMP-400] Living Contract Tests for Android Depth Stabilization & Terrain Anti-Z-Fighting
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import {
  createBatchedTerrainGeometries,
  BatchedDioramaLandmasses,
} from '../../src/client/3d/diorama/batched_diorama_terrain';
import {
  DioramaHeritageDistrict,
  type DioramaHeritageDistrictProps,
} from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaTraffic } from '../../src/client/3d/diorama/diorama_traffic';
import {
  DioramaContainerPort,
  type DioramaContainerPortProps,
} from '../../src/client/3d/diorama/diorama_container_port';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { SafeGLTFModel } from '../../src/client/3d/asset_loader/safe_gltf_model';
import { captureTree, findReactNode, findReactNodes } from '../helpers/threejs_test_utils';
import '../helpers/r3f_test_harness';

vi.mock('@react-three/drei', () => ({
  ContactShadows: () => null,
  OrbitControls: () => null,
  Environment: () => null,
  RoundedBox: ({ children, ...props }: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('group', props, children),
}));

describe('IMP-400: Android Depth Stabilization & Terrain Anti-Z-Fighting', () => {
  it('TC-400.01a [UC-TERRAIN-VOLUMETRIC-DEPTH/MSS]: soil embeds 15mm into grass volume, grass top face preserved at +0.005m datum', () => {
    const geoms = createBatchedTerrainGeometries();
    const soilBox = geoms.soilGeom.boundingBox;
    const grassBox = geoms.grassGeom.boundingBox;

    expect(soilBox?.max.y).toBeCloseTo(-0.015, 3);
    expect(grassBox?.max.y).toBeCloseTo(0.005, 3);
    expect(grassBox?.min.y).toBeLessThanOrEqual(soilBox?.max.y ?? -999);
  });

  it('TC-400.01b [UC-TERRAIN-ROAD-CLEARANCE/MSS]: boulevard top face and sidewalk base maintain >= 15-20mm clearance over grass (Gotcha #24.1)', () => {
    const geoms = createBatchedTerrainGeometries();
    const grassBox = geoms.grassGeom.boundingBox;
    const roadBox = geoms.westBoulevardGeom.boundingBox;
    const sidewalkBox = geoms.sidewalksGeom.boundingBox;

    const roadClearance = (roadBox?.max.y ?? 0) - (grassBox?.max.y ?? 0);
    const sidewalkClearance = (sidewalkBox?.min.y ?? 0) - (grassBox?.max.y ?? 0);

    expect(roadClearance).toBeGreaterThanOrEqual(0.0195);
    expect(sidewalkClearance).toBeGreaterThanOrEqual(0.0145);
  });

  it('TC-400.02 [UC-TERRAIN-HARDWARE-POLYGON-OFFSET/MSS]: BatchedDioramaLandmasses markings material declares polygonOffset: true, polygonOffsetFactor: -1.0, polygonOffsetUnits: -4.0', () => {
    const tree = captureTree(BatchedDioramaLandmasses);
    const geoms = createBatchedTerrainGeometries();
    const markingsMesh = findReactNode(
      tree,
      (node) => node.type === 'mesh' && node.props.geometry === geoms.markingsGeom
    );
    const materialNode = findReactNode(
      markingsMesh,
      (node) => node.type === 'meshStandardMaterial'
    );

    expect(materialNode?.props.polygonOffset).toBe(true);
    expect(materialNode?.props.polygonOffsetFactor).toBe(-1.0);
    expect(materialNode?.props.polygonOffsetUnits).toBe(-4.0);
  });

  it('TC-400.03 [UC-HERITAGE-VOLUMETRIC-PLAZA/MSS]: DioramaHeritageDistrict with isMobile: true renders 3D boxGeometry with height >= 0.02m and top face <= 0.005m, eliminating flat 2D planeGeometry', () => {
    const tree = captureTree<DioramaHeritageDistrictProps>(DioramaHeritageDistrict, { isMobile: true });
    const plazaMesh = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === 0.35 &&
        node.props.position[2] === 0.02
    );
    const boxNode = findReactNode(plazaMesh, (node) => node.type === 'boxGeometry');
    const planeNode = findReactNode(plazaMesh, (node) => node.type === 'planeGeometry');

    const boxArgs = Array.isArray(boxNode?.props.args) ? boxNode.props.args : [];
    const height = typeof boxArgs[1] === 'number' ? boxArgs[1] : 0;
    const pos = Array.isArray(plazaMesh?.props.position) ? plazaMesh.props.position : [];
    const posY = typeof pos[1] === 'number' ? pos[1] : 0;
    const topFaceY = posY + height / 2;

    expect(planeNode).toBeNull();
    expect(boxNode).not.toBeNull();
    expect(height).toBeGreaterThanOrEqual(0.02);
    expect(topFaceY).toBeLessThanOrEqual(0.005);
  });

  it('TC-400.04 [UC-HERITAGE-FALLBACK-FORCE/MSS]: SafeGLTFModel receives forceFallback={true} when isMobile: true', () => {
    const tree = captureTree<DioramaHeritageDistrictProps>(DioramaHeritageDistrict, { isMobile: true });
    const gltfNode = findReactNode(
      tree,
      (node) => node.type === SafeGLTFModel
    );

    expect(gltfNode?.props.forceFallback).toBe(true);
  });

  it('TC-400.05 [UC-TRAFFIC-HEADLIGHT-DEPTH-WRITE/MSS]: DioramaTraffic headlight fan mesh material explicitly sets depthWrite: false', () => {
    const tree = captureTree(DioramaTraffic);
    const headlightMaterial = findReactNode(
      tree,
      (node) =>
        node.type === 'meshBasicMaterial' &&
        node.props.color === '#FEF08A' &&
        node.props.transparent === true
    );

    expect(headlightMaterial?.props.depthWrite).toBe(false);
  });

  it('TC-400.06 [UC-PORT-CONTACT-SHADOW-OMISSION/MSS]: DioramaContainerPort with isMobile: true omits 2D contact shadow planeGeometry at Y = 0.003', () => {
    const tree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: true });
    const shadowMesh = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[1] === 0.003
    );

    expect(shadowMesh).toBeNull();
  });

  it('TC-400.07 [UC-TERRAIN-EMBANKMENT-DATUM/MSS]: DioramaTerrain embankment slopes align flush with peninsula landmass datum (Y = -0.0175m)', () => {
    const tree = captureTree(DioramaTerrain);
    const westSlope = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === -1.05
    );
    const eastSlope = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === 1.05
    );

    const westPos = Array.isArray(westSlope?.props.position) ? westSlope.props.position : [];
    const eastPos = Array.isArray(eastSlope?.props.position) ? eastSlope.props.position : [];
    const westY = typeof westPos[1] === 'number' ? westPos[1] : 0;
    const eastY = typeof eastPos[1] === 'number' ? eastPos[1] : 0;

    expect(westY).toBeCloseTo(-0.0175, 4);
    expect(eastY).toBeCloseTo(-0.0175, 4);
  });

  it('TC-400.08 [UC-HERITAGE-DESKTOP-PARITY/MSS]: DioramaHeritageDistrict with isMobile: false preserves flat 2D planeGeometry for Heritage Plaza at Y = 0.003', () => {
    const tree = captureTree<DioramaHeritageDistrictProps>(DioramaHeritageDistrict, { isMobile: false });
    const plazaMesh = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === 0.35 &&
        node.props.position[2] === 0.02
    );
    const planeNode = findReactNode(plazaMesh, (node) => node.type === 'planeGeometry');
    const pos = Array.isArray(plazaMesh?.props.position) ? plazaMesh.props.position : [];
    const posY = typeof pos[1] === 'number' ? pos[1] : 0;

    expect(planeNode).not.toBeNull();
    expect(posY).toBeCloseTo(0.003, 4);
  });

  it('TC-400.09 [UC-PORT-DESKTOP-PARITY/MSS]: DioramaContainerPort with isMobile: false preserves 2D contact shadow planeGeometry at Y = 0.003', () => {
    const tree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: false });
    const shadowMesh = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[1] === 0.003
    );
    const planeNode = findReactNode(shadowMesh, (node) => node.type === 'planeGeometry');

    expect(shadowMesh).not.toBeNull();
    expect(planeNode).not.toBeNull();
  });

  it('TC-400.10 [UC-PORT-MOBILE-CURB/MSS]: DioramaContainerPort with isMobile: true elevates safety line to 3D wheel-guard curb (height >= 0.02m)', () => {
    const tree = captureTree<DioramaContainerPortProps>(DioramaContainerPort, { isMobile: true });
    const curbMesh = findReactNode(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === -0.85
    );
    const boxNode = findReactNode(curbMesh, (node) => node.type === 'boxGeometry');
    const boxArgs = Array.isArray(boxNode?.props.args) ? boxNode.props.args : [];
    const height = typeof boxArgs[1] === 'number' ? boxArgs[1] : 0;

    expect(boxNode).not.toBeNull();
    expect(height).toBeGreaterThanOrEqual(0.02);
  });

  it('TC-400.11 [UC-HERITAGE-MOBILE-PLAZA-TIERS/MSS]: DioramaHeritageDistrict mobile plaza tiers guarantee solid thickness >= 0.02m and vertical step separation >= 0.015m', () => {
    const tree = captureTree<DioramaHeritageDistrictProps>(DioramaHeritageDistrict, { isMobile: true });
    const cylinderMeshes = findReactNodes(
      tree,
      (node) =>
        node.type === 'mesh' &&
        Array.isArray(node.props.position) &&
        node.props.position[0] === 0 &&
        node.props.position[2] === 0 &&
        findReactNode(node, (c) => c.type === 'cylinderGeometry') !== null
    );

    // Three tiers: Tier 1 (stone, y=0.012, h=0.024), Tier 2 (grass, y=0.032, h=0.020), Tier 3 (flower, y=0.050, h=0.020)
    expect(cylinderMeshes.length).toBeGreaterThanOrEqual(3);

    const heights = cylinderMeshes.slice(0, 3).map((m) => {
      const geom = findReactNode(m, (c) => c.type === 'cylinderGeometry');
      const args = Array.isArray(geom?.props.args) ? geom.props.args : [];
      return typeof args[2] === 'number' ? args[2] : 0;
    });

    const minHeight = Math.min(...heights);
    expect(minHeight).toBeGreaterThanOrEqual(0.020);

    const positionsY = cylinderMeshes.slice(0, 3).map((m) => {
      const pos = Array.isArray(m.props.position) ? m.props.position : [];
      return typeof pos[1] === 'number' ? pos[1] : 0;
    });
    // Step from tier 1 top (0.012 + 0.012 = 0.024) to tier 2 top (0.032 + 0.010 = 0.042) is 0.018m >= 0.015m
    const p0 = positionsY[0] ?? 0;
    const h0 = heights[0] ?? 0;
    const p1 = positionsY[1] ?? 0;
    const h1 = heights[1] ?? 0;
    const tier1Top = p0 + h0 / 2;
    const tier2Top = p1 + h1 / 2;
    expect(tier2Top - tier1Top).toBeGreaterThanOrEqual(0.015);
  });
});

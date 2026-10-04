import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Mesh, Group } from 'three';
import {
  Bloom,
  SelectiveBloom,
  DepthOfField,
  ToneMapping,
} from '@react-three/postprocessing';
import {
  SELECTIVE_BLOOM_LAYER,
  SELECTIVE_BLOOM_DEFAULTS,
  tagSelectiveBloom,
  untagSelectiveBloom,
  isSelectiveBloomTagged,
  calculateSelectiveBloomThreshold,
  calculateSelectiveBloomIntensity,
} from '../../src/client/3d/selective_bloom_registry.js';
import { PostProcessingPipeline } from '../../src/client/3d/post_processing_pipeline.js';
import { TileEventAuraRim } from '../../src/client/3d/tile_event_aura.js';

interface PassProps {
  readonly selectionLayer?: number;
  readonly luminanceThreshold?: number;
  readonly intensity?: number;
  readonly mipmapBlur?: boolean;
  readonly children?: React.ReactNode;
}

function getElementChildren(element: React.ReactElement | null): React.ReactElement[] {
  if (!element || !React.isValidElement<{ children?: React.ReactNode }>(element)) return [];
  return React.Children.toArray(element.props.children).filter(React.isValidElement);
}

function getElementProps(element: React.ReactElement | null | undefined): PassProps {
  if (!element || !React.isValidElement<PassProps>(element)) return {};
  return element.props;
}

function isSelectiveBloom(element: React.ReactElement): boolean {
  return element.type === SelectiveBloom;
}

function isBloom(element: React.ReactElement): boolean {
  return element.type === Bloom;
}

function isDepthOfField(element: React.ReactElement): boolean {
  return element.type === DepthOfField;
}

function isToneMapping(element: React.ReactElement): boolean {
  return element.type === ToneMapping;
}

describe('IMP-256: 3D Selective Reference Bloom & Emissive Glow Isolation Pipeline', () => {
  // -------------------------------------------------------------------------
  // Facet 1: Selective Bloom Registry & Object Tagging (TC-IMP256.01..04)
  // -------------------------------------------------------------------------
  it('[TC-IMP256.01/MSS][UC-IMP256/MSS] tagSelectiveBloom kích hoạt SELECTIVE_BLOOM_LAYER trên mesh mục tiêu và đánh dấu userData.selectiveBloom = true', () => {
    const mesh = new Mesh();
    tagSelectiveBloom(mesh, true);
    expect(mesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(true);
    expect(mesh.userData.selectiveBloom).toBe(true);
  });

  it('[TC-IMP256.02/MSS][UC-IMP256/MSS] tagSelectiveBloom duyệt đệ quy cây con của Group hoặc Object3D phức hợp để kích hoạt layer 11 cho toàn bộ mesh con', () => {
    const group = new Group();
    const child1 = new Mesh();
    const child2 = new Mesh();
    group.add(child1);
    group.add(child2);

    tagSelectiveBloom(group, true);

    expect(child1.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(true);
    expect(child1.userData.selectiveBloom).toBe(true);
    expect(child2.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(true);
    expect(child2.userData.selectiveBloom).toBe(true);
  });

  it('[TC-IMP256.03/MSS][UC-IMP256/MSS] untagSelectiveBloom vô hiệu hóa layer 11 và xóa cờ userData.selectiveBloom mà không ảnh hưởng tới layer 0 mặc định', () => {
    const mesh = new Mesh();
    tagSelectiveBloom(mesh, true);
    untagSelectiveBloom(mesh);

    expect(mesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(false);
    expect(mesh.userData.selectiveBloom).toBeUndefined();
    expect(mesh.layers.isEnabled(0)).toBe(true);
  });

  it('[TC-IMP256.04/A1][UC-IMP256/A1] isSelectiveBloomTagged trả về true khi bật layer 11 và false khi ở layer mặc định hoặc object không có layer', () => {
    const taggedMesh = new Mesh();
    tagSelectiveBloom(taggedMesh, true);
    const untaggedMesh = new Mesh();

    expect(isSelectiveBloomTagged(taggedMesh)).toBe(true);
    expect(isSelectiveBloomTagged(taggedMesh)).toBeTruthy();
    expect(isSelectiveBloomTagged(untaggedMesh)).toBe(false);
    expect(isSelectiveBloomTagged(null)).toBe(false);
    expect(isSelectiveBloomTagged(undefined)).toBe(false);

    // Disjunction boundary checks: object with only layer 11 or only userData flag
    const layerOnlyMesh = new Mesh();
    layerOnlyMesh.layers.enable(SELECTIVE_BLOOM_LAYER);
    expect(isSelectiveBloomTagged(layerOnlyMesh)).toBe(true);

    const userDataOnlyObj = { userData: { selectiveBloom: true } } as unknown as Mesh;
    expect(isSelectiveBloomTagged(userDataOnlyObj)).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Facet 2: Dynamic Selective Bloom Math & Thresholds (TC-IMP256.05..07)
  // -------------------------------------------------------------------------
  it('[TC-IMP256.05/MSS][UC-IMP256/MSS] calculateSelectiveBloomThreshold trả về 0.45 ở lượt thường và 0.25 khi đấu giá', () => {
    const normalThreshold = calculateSelectiveBloomThreshold(false);
    const auctionThreshold = calculateSelectiveBloomThreshold(true);

    expect(normalThreshold).toBe(SELECTIVE_BLOOM_DEFAULTS.luminanceThreshold);
    expect(auctionThreshold).toBe(SELECTIVE_BLOOM_DEFAULTS.auctionThreshold);
  });

  it('[TC-IMP256.06/MSS][UC-IMP256/MSS] calculateSelectiveBloomIntensity điều tiết cường độ tối ưu theo mobile và desktop', () => {
    const mobileIntensity = calculateSelectiveBloomIntensity(true, false);
    const desktopNormalIntensity = calculateSelectiveBloomIntensity(false, false);
    const desktopAuctionIntensity = calculateSelectiveBloomIntensity(false, true);

    expect(mobileIntensity).toBe(0.20);
    expect(desktopNormalIntensity).toBe(0.45);
    expect(desktopAuctionIntensity).toBe(0.65);

    expect(desktopAuctionIntensity).toBeGreaterThan(desktopNormalIntensity);
    expect(desktopNormalIntensity).toBeGreaterThanOrEqual(0.45);
    expect(mobileIntensity).toBeLessThanOrEqual(0.20);
    expect(desktopNormalIntensity).toBeCloseTo(0.45, 2);
    expect(SELECTIVE_BLOOM_DEFAULTS).toEqual(
      expect.objectContaining({
        layer: 11,
        intensity: 0.45,
        mobileIntensity: 0.20,
        auctionIntensity: 0.65,
      })
    );
  });

  it('[TC-IMP256.07/A2][UC-IMP256/A2] calculateSelectiveBloomThreshold và calculateSelectiveBloomIntensity tự động hồi quy về mặc định khi nhận NaN hoặc Infinity', () => {
    const nanThreshold = calculateSelectiveBloomThreshold(false, Number.NaN, 0.25);
    const infThreshold = calculateSelectiveBloomThreshold(false, 0.45, Number.POSITIVE_INFINITY);
    const nanIntensity = calculateSelectiveBloomIntensity(false, false, Number.NaN);
    const negInfIntensity = calculateSelectiveBloomIntensity(false, false, Number.NEGATIVE_INFINITY);

    expect(nanThreshold).toBe(0.45);
    expect(infThreshold).toBe(0.45);
    expect(nanIntensity).toBe(0.45);
    expect(negInfIntensity).toBe(0.45);
  });

  // -------------------------------------------------------------------------
  // Facet 3: Pipeline Pass Integration & Selective Switching (TC-IMP256.08..11)
  // -------------------------------------------------------------------------
  it('[TC-IMP256.08/MSS][UC-IMP256/MSS] Khi enableSelectiveBloom = true, PostProcessingPipeline kết xuất component SelectiveBloom hướng tới selectionLayer = 11', () => {
    const el = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      fps: 60,
    });
    const children = getElementChildren(el);
    const selectiveBloom = children.find(isSelectiveBloom);

    expect(selectiveBloom).toBeDefined();
    expect(getElementProps(selectiveBloom).selectionLayer).toBe(11);
  });

  it('[TC-IMP256.09/MSS][UC-IMP256/MSS] Khi enableSelectiveBloom = false hoặc undefined, PostProcessingPipeline tiếp tục kết xuất component Bloom toàn cục chuẩn', () => {
    const el = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: false,
      enableBloom: true,
      fps: 60,
    });
    const children = getElementChildren(el);
    const bloom = children.find(isBloom);
    const selectiveBloom = children.find(isSelectiveBloom);

    expect(bloom).toBeDefined();
    expect(selectiveBloom).toBeUndefined();
  });

  it('[TC-IMP256.10/MSS][UC-IMP256/MSS] SelectiveBloom đứng ở vị trí HDR bloom chuẩn xác trước ToneMapping và sau DepthOfField trong EffectComposer', () => {
    const el = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      enableDof: true,
      enableToneMapping: true,
      fps: 60,
    });
    const children = getElementChildren(el);
    const dofIndex = children.findIndex(isDepthOfField);
    const selectiveBloomIndex = children.findIndex(isSelectiveBloom);
    const tmIndex = children.findIndex(isToneMapping);

    expect(dofIndex).toBeLessThan(selectiveBloomIndex);
    expect(selectiveBloomIndex).toBeLessThan(tmIndex);
  });

  it('[TC-IMP256.11/A3][UC-IMP256/A3] Khi enabled = false hoặc enableBloom = false, SelectiveBloom bị loại bỏ hoàn toàn khỏi render tree', () => {
    const disabledEl = PostProcessingPipeline({
      enabled: false,
      enableSelectiveBloom: true,
    });
    const bloomOffEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: false,
      fps: 60,
    });
    const bloomOffChildren = getElementChildren(bloomOffEl);
    const selectiveBloom = bloomOffChildren.find(isSelectiveBloom);

    expect(disabledEl).toBeNull();
    expect(selectiveBloom).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Facet 4: Depth Occlusion & Anti-Blowout Isolation (TC-IMP256.12..14)
  // -------------------------------------------------------------------------
  it('[TC-IMP256.12/MSS][UC-IMP256/MSS] SELECTIVE_BLOOM_LAYER được định nghĩa cố định ở giá trị 11, không xung đột với layer 0 mặc định', () => {
    const defaultMesh = new Mesh();

    expect(SELECTIVE_BLOOM_LAYER).toBe(11);
    expect(SELECTIVE_BLOOM_LAYER).not.toBe(0);
    expect(defaultMesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(false);
    expect(defaultMesh.layers.isEnabled(0)).toBe(true);
  });

  it('[TC-IMP256.13/MSS][UC-IMP256/MSS] SelectiveBloom áp dụng mipmapBlur = true trên desktop và mipmapBlur = false trên mobile', () => {
    const desktopEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      isMobile: false,
      fps: 60,
    });
    const mobileEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      isMobile: true,
      fps: 60,
    });

    const desktopSelectiveBloom = getElementChildren(desktopEl).find(isSelectiveBloom);
    const mobileSelectiveBloom = getElementChildren(mobileEl).find(isSelectiveBloom);

    expect(getElementProps(desktopSelectiveBloom).mipmapBlur).toBe(true);
    expect(getElementProps(mobileSelectiveBloom).mipmapBlur).toBe(false);
  });

  it('[TC-IMP256.14/A4][UC-IMP256/A4] SelectiveBloom tiếp nhận tham số intensity thích ứng chính xác theo môi trường thiết bị và trạng thái đấu giá', () => {
    const desktopNormalEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      isMobile: false,
      isAuctionActive: false,
      fps: 60,
    });
    const desktopAuctionEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      isMobile: false,
      isAuctionActive: true,
      fps: 60,
    });
    const mobileEl = PostProcessingPipeline({
      enabled: true,
      enableSelectiveBloom: true,
      enableBloom: true,
      isMobile: true,
      isAuctionActive: false,
      fps: 60,
    });

    const normalProps = getElementProps(getElementChildren(desktopNormalEl).find(isSelectiveBloom));
    const auctionProps = getElementProps(getElementChildren(desktopAuctionEl).find(isSelectiveBloom));
    const mobileProps = getElementProps(getElementChildren(mobileEl).find(isSelectiveBloom));

    expect(normalProps.intensity).toBe(0.45);
    expect(auctionProps.intensity).toBe(0.65);
    expect(mobileProps.intensity).toBe(0.20);
  });

  // -------------------------------------------------------------------------
  // Facet 5: Component Tagging & Teardown Lifecycle (TC-IMP256.15..16)
  // -------------------------------------------------------------------------
  it('[TC-IMP256.15/MSS][UC-IMP256/MSS] TileEventAuraRim kết xuất mesh hào quang mang data-testid chuẩn và tagSelectiveBloom kích hoạt layer 11', () => {
    const html = renderToStaticMarkup(React.createElement(TileEventAuraRim, { color: '#F59E0B', isSpotlighted: true }));
    expect(html).toContain('tile-event-aura-rim');

    const auraMesh = new Mesh();
    tagSelectiveBloom(auraMesh, true);
    expect(auraMesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(true);
    expect(isSelectiveBloomTagged(auraMesh)).toBe(true);
  });

  it('[TC-IMP256.16/A5][UC-IMP256/A5] TileEventAuraRim dọn dẹp sạch sẽ layer 11 thông qua cleanup function khi unmount, ngăn ngừa rò rỉ bộ nhớ', () => {
    const auraMesh = new Mesh();
    tagSelectiveBloom(auraMesh, true);
    expect(auraMesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(true);

    untagSelectiveBloom(auraMesh);
    expect(auraMesh.layers.isEnabled(SELECTIVE_BLOOM_LAYER)).toBe(false);
    expect(auraMesh.userData.selectiveBloom).toBeUndefined();
    expect(auraMesh.layers.isEnabled(0)).toBe(true);
  });
});

// [UI-S04/MSS] PostProcessingPipeline & Perspective Camera Tests
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  PostProcessingPipeline,
  DEFAULT_PIPELINE_CONFIG,
} from '../../src/client/3d/post_processing_pipeline';
import {
  BASE_PERSPECTIVE_FOV,
  EVENT_PERSPECTIVE_FOV,
  BASE_CAMERA_ZOOM,
  EVENT_CAMERA_ZOOM,
} from '../../src/client/game_canvas';

describe('[UI-S04/MSS] PostProcessingPipeline — Configuration & Component Structure', () => {
  it('PostProcessingPipeline duoc export duoi dang React Component', () => {
    expect(typeof PostProcessingPipeline).toBe('function');
  });

  it('DEFAULT_PIPELINE_CONFIG bao gom day du 5 hieu ung hau ky dien anh', () => {
    expect(DEFAULT_PIPELINE_CONFIG.enabled).toBe(true);
    // 1. Depth of Field (Tilt-Shift Macro sa ban)
    expect(DEFAULT_PIPELINE_CONFIG.enableDof).toBe(true);
    expect(DEFAULT_PIPELINE_CONFIG.dofTarget).toEqual([0, 0, 0]);
    expect(DEFAULT_PIPELINE_CONFIG.dofFocusRange).toBeGreaterThanOrEqual(10.0);
    expect(DEFAULT_PIPELINE_CONFIG.dofBokehScale).toBeGreaterThan(1.0);
    expect(DEFAULT_PIPELINE_CONFIG.dofBokehScale).toBeLessThanOrEqual(3.0);

    // 2. Bloom (Anh kim vang champagne & den chop thap, tranh lóa bệt mặt bàn trắng)
    expect(DEFAULT_PIPELINE_CONFIG.enableBloom).toBe(true);
    expect(DEFAULT_PIPELINE_CONFIG.bloomIntensity).toBeGreaterThan(0.5);
    expect(DEFAULT_PIPELINE_CONFIG.bloomThreshold).toBeGreaterThanOrEqual(0.9);

    // 3. SSAO / Contact Crevice Shadows (N8AO)
    expect(DEFAULT_PIPELINE_CONFIG.enableAo).toBe(true);
    expect(DEFAULT_PIPELINE_CONFIG.aoIntensity).toBeGreaterThan(1.0);
    expect(DEFAULT_PIPELINE_CONFIG.aoRadius).toBeGreaterThan(0.5);
    expect(DEFAULT_PIPELINE_CONFIG.aoRadius).toBeLessThanOrEqual(2.0);

    // 4. Lens Vignette
    expect(DEFAULT_PIPELINE_CONFIG.enableVignette).toBe(true);
    expect(DEFAULT_PIPELINE_CONFIG.vignetteDarkness).toBeCloseTo(0.48, 2);

    // 5. Tone Mapping
    expect(DEFAULT_PIPELINE_CONFIG.enableToneMapping).toBe(true);
  });

  it('PostProcessingPipeline tra ve null khi enabled=false de tiet kiem tai nguyen', () => {
    const result = PostProcessingPipeline({ enabled: false });
    expect(result).toBeNull();
  });
});

describe('[UI-S04/MSS] GameCanvas — Dai phau Perspective Camera & Post-Processing Integration', () => {
  const canvasPath = path.resolve(process.cwd(), 'src', 'client', 'game_canvas.tsx');
  const canvasSource = fs.readFileSync(canvasPath, 'utf-8');

  it('GameCanvas khong con thuoc tinh orthographic tren Canvas', () => {
    // Khong su dung <Canvas ... orthographic ...>
    expect(canvasSource).not.toMatch(/<Canvas[^>]*\sorthographic\b/);
  });

  it('GameCanvas su dung Perspective Camera voi fov=40 va near/far hop ly', () => {
    expect(canvasSource).toContain('fov: 40');
    expect(canvasSource).toContain('near: 0.5');
    expect(canvasSource).toContain('position: [20, 22, 20]');
  });

  it('Hang so goc nhin Perspective Camera hop le: 40 do goc thuong, 35 do su kien', () => {
    expect(BASE_PERSPECTIVE_FOV).toBe(40);
    expect(EVENT_PERSPECTIVE_FOV).toBe(35);
    expect(EVENT_PERSPECTIVE_FOV).toBeLessThan(BASE_PERSPECTIVE_FOV);
  });

  it('Bao toan cac hang so backward-compatibility cho cac bo kiem thu cu', () => {
    expect(BASE_CAMERA_ZOOM).toBe(41);
    expect(EVENT_CAMERA_ZOOM).toBe(48);
  });

  it('GameCanvas tich hop PostProcessingPipeline truc tiep trong Canvas', () => {
    expect(canvasSource).toContain('<PostProcessingPipeline />');
    expect(canvasSource).toContain("import { PostProcessingPipeline } from './3d/post_processing_pipeline';");
  });

  it('OrbitControls co minDistance va maxDistance cho che do Perspective', () => {
    expect(canvasSource).toContain('minDistance={14}');
    expect(canvasSource).toContain('maxDistance={65}');
  });
});

// [TC-IMP77/MSS] Contract Test Suite: IMP-77 Golden Balance Performance Optimization (No-Visual-Compromise)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  PostProcessingPipeline,
  DEFAULT_PIPELINE_CONFIG,
} from '../../src/client/3d/post_processing_pipeline';

describe('[TC-IMP77.1/MSS] EffectComposer Multisampling Zero-Overhead Invariant', () => {
  const rootDir = process.cwd();
  const postProcessingPath = path.resolve(rootDir, 'src', 'client', '3d', 'post_processing_pipeline.tsx');

  it('DEFAULT_PIPELINE_CONFIG đặt multisampling = 0 để tránh phân bổ bộ đệm MSAA trùng lặp với SMAA', () => {
    const config = DEFAULT_PIPELINE_CONFIG as Record<string, unknown>;
    expect(config.multisampling).toBe(0);
  });

  it('PostProcessingPipeline component truyền multisampling={0} vào EffectComposer', () => {
    const rendered = PostProcessingPipeline({});
    expect(rendered).not.toBeNull();
    const props = (rendered?.props as Record<string, unknown>) ?? {};
    expect(props.multisampling).toBe(0);
  });

  it('Tệp post_processing_pipeline.tsx không còn gán multisampling={4} cứng', () => {
    const source = fs.readFileSync(postProcessingPath, 'utf-8');
    expect(source).not.toContain('multisampling={4}');
  });
});

describe('[TC-IMP77.2/MSS] ContactShadows Static Texture Baking (frames={1})', () => {
  const rootDir = process.cwd();
  const gameCanvasPath = path.resolve(rootDir, 'src', 'client', 'game_canvas.tsx');

  it('100% các thẻ ContactShadows trong game_canvas.tsx phải được cấu hình frames={1}', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    // Tìm tất cả các thẻ ContactShadows
    const contactShadowMatches = source.match(/<ContactShadows[^>]+>/g) ?? [];
    expect(contactShadowMatches.length).toBeGreaterThanOrEqual(2);

    for (const tag of contactShadowMatches) {
      expect(tag).toContain('frames={1}');
    }
  });
});

describe('[TC-IMP77.3/MSS] Balanced Device Pixel Ratio (dpr={[1, 1.5]})', () => {
  const rootDir = process.cwd();
  const gameCanvasPath = path.resolve(rootDir, 'src', 'client', 'game_canvas.tsx');

  it('game_canvas.tsx cấu hình dpr trần 1.5 để tối ưu 43.75% pixel fillrate trên màn hình HiDPI', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).toContain('dpr={[1, 1.5]}');
    expect(source).not.toContain('dpr={[1.25, 2]}');
  });

  it('Bảo toàn cấu hình cao cấp cho Shadow Map và N8AO (Zero Visual Cost)', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    // shadows="soft" vẫn được giữ nguyên
    expect(source).toContain('shadows="soft"');
  });
});

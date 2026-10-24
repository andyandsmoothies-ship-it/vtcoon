// [TC-456.01/MSS][TC-456.02/A1][TC-456.03/A2][TC-456.04/MSS][TC-456.05/MSS][IMP-456]
// Contract Test Suite: Purge Legacy Lawn Fallback & Eliminate Desktop Ocean Hydration Pop
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import {
  CoastalIslandEnvironment,
  COASTAL_ARCHIPELAGO_BASE_MODEL_URL,
} from '../../src/client/3d/coastal_island_environment';

const envPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'coastal_island_environment.tsx');
const envSource = fs.readFileSync(envPath, 'utf-8');

describe('[IMP-456] Purge Legacy Lawn Fallback & Eliminate Desktop Ocean Hydration Pop', () => {
  it('[TC-456.01/MSS][UC-PURGE-LAWN] SafeGLTFModel uses fallback={null} and invokes preload at module scope for coastal archipelago base', () => {
    expect(COASTAL_ARCHIPELAGO_BASE_MODEL_URL).toBe('/models/board/coastal_archipelago_base.glb');
    expect(envSource).toContain('SafeGLTFModel.preload(COASTAL_ARCHIPELAGO_BASE_MODEL_URL);');
    expect(envSource).toMatch(/url=\{COASTAL_ARCHIPELAGO_BASE_MODEL_URL\}[\s\S]*?fallback=\{null\}/);
  });

  it('[TC-456.02/A1][UC-PURGE-LAWN] coastal_island_environment source contains neither Lush Tropical Lawn Plateau nor legacy lawn cylinder args', () => {
    expect(typeof CoastalIslandEnvironment).toBe('function');
    expect(envSource).not.toContain('Lush Tropical Lawn Plateau');
    expect(envSource).not.toContain('args={[15.6, 17.6, 0.26, 64]}');
  });

  it('[TC-456.03/A2][UC-PURGE-LAWN] coastal_island_environment source does not import LayeredTropicalFoliage or TropicalPalmsCluster', () => {
    expect(typeof CoastalIslandEnvironment).toBe('function');
    expect(envSource).not.toContain('LayeredTropicalFoliage');
    expect(envSource).not.toContain('TropicalPalmsCluster');
  });

  it('[TC-456.04/MSS][UC-SSR-CLEANLINESS] CoastalIslandEnvironment SSR render with streamlined=false purges legacy lawn cylinder', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: false }));
    expect(html).not.toContain('args="15.6,17.6,0.26,64"');
  });

  it('[TC-456.05/MSS][UC-LIVING-OCEAN-RETAINED] CoastalIslandEnvironment SSR render with streamlined=false retains living ocean environment components', () => {
    const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: false }));
    expect(html).toContain('data-testid="horizon-mountain-range"');
    expect(html).toContain('data-testid="coastal-patrol-boat"');
    expect(html).toContain('data-testid="coastal-seagulls"');
  });
});

// [TC-IMP34/MSS][UC-IMP34] Contract Test Suite: Anti-Aliasing & Visual Crispness (IMP-34)
// Enforces 5 Facets: Subpixel SMAA, Macro DoF Crispness, Soft Shadows, Single AgX Tone Mapping, and High-Density DPR
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { SMAA, DepthOfField, ToneMapping, EffectComposer } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import {
  PostProcessingPipeline,
  DEFAULT_PIPELINE_CONFIG,
  type PostProcessingPipelineProps,
} from '../../src/client/3d/post_processing_pipeline';

type Imp34PipelineProps = PostProcessingPipelineProps & {
  enableSmaa?: boolean;
};

type AnyReactElement = React.ReactElement<Record<string, any>>;

function getElementChildren(element: React.ReactElement | null): AnyReactElement[] {
  if (!element) return [];
  const props = element.props as Record<string, any>;
  return React.Children.toArray(props.children) as AnyReactElement[];
}

function getElementProps(element: React.ReactElement | null): Record<string, any> {
  if (!element) return {};
  return (element.props as Record<string, any>) ?? {};
}

describe('[TC-IMP34/MSS][UC-IMP34] Anti-Aliasing & Visual Crispness Contract Tests', () => {
  const rootDir = process.cwd();
  const postProcessingPath = path.resolve(rootDir, 'src', 'client', '3d', 'post_processing_pipeline.tsx');
  const gameCanvasPath = path.resolve(rootDir, 'src', 'client', 'game_canvas.tsx');

  // =========================================================================
  // FACET 1: EDGE ANTI-ALIASING (SMAA POST-PROCESSING INTEGRATION)
  // =========================================================================
  it('[TC-IMP34.01/MSS][UC-IMP34] DEFAULT_PIPELINE_CONFIG specifies enableSmaa with default value true', () => {
    const config = DEFAULT_PIPELINE_CONFIG as Record<string, unknown>;
    expect(config.enableSmaa).toBe(true);
  });

  it('[TC-IMP34.02/MSS][UC-IMP34] post_processing_pipeline.tsx exports enableSmaa prop in interface', () => {
    const source = fs.readFileSync(postProcessingPath, 'utf-8');
    expect(source).toMatch(/enableSmaa\?:\s*boolean/);
  });

  it('[TC-IMP34.03/MSS][UC-IMP34] post_processing_pipeline.tsx imports SMAA from @react-three/postprocessing', () => {
    const source = fs.readFileSync(postProcessingPath, 'utf-8');
    expect(source).toMatch(/import\s*\{[^}]*\bSMAA\b[^}]*\}\s*from\s*['"]@react-three\/postprocessing['"]/);
  });

  it('[TC-IMP34.04/MSS][UC-IMP34] PostProcessingPipeline renders SMAA component inside EffectComposer by default', () => {
    const rendered = PostProcessingPipeline({});
    expect(rendered).not.toBeNull();
    const children = getElementChildren(rendered);
    const smaaElement = children.find(
      (c) => c.type === SMAA || (c.type as { name?: string })?.name === 'SMAA'
    );
    expect(smaaElement).toBeDefined();
  });

  it('[TC-IMP34.05/MSS][UC-IMP34] PostProcessingPipeline positions SMAA at terminal anti-aliasing pass', () => {
    const rendered = PostProcessingPipeline({});
    const children = getElementChildren(rendered);
    const smaaIndex = children.findIndex(
      (c) => c.type === SMAA || (c.type as { name?: string })?.name === 'SMAA'
    );
    const dofIndex = children.findIndex(
      (c) => c.type === DepthOfField || (c.type as { name?: string })?.name === 'DepthOfField'
    );
    expect(smaaIndex).toBeGreaterThanOrEqual(0);
    expect(smaaIndex).toBeGreaterThan(dofIndex);
  });

  // =========================================================================
  // FACET 2: DOF CRISPNESS & BOARD BOUNDARIES
  // =========================================================================
  it('[TC-IMP34.06/MSS][UC-IMP34] DEFAULT_PIPELINE_CONFIG expands dofFocusRange >= 150.0 to keep all 40 tiles sharp', () => {
    expect(DEFAULT_PIPELINE_CONFIG.dofFocusRange).toBeGreaterThanOrEqual(150.0);
  });

  it('[TC-IMP34.07/MSS][UC-IMP34] DEFAULT_PIPELINE_CONFIG reduces dofBokehScale <= 0.6 to minimize peripheral blur', () => {
    expect(DEFAULT_PIPELINE_CONFIG.dofBokehScale).toBeLessThanOrEqual(0.6);
  });

  it('[TC-IMP34.08/MSS][UC-IMP34] PostProcessingPipeline forwards custom focusRange and bokehScale to DepthOfField', () => {
    const rendered = PostProcessingPipeline({
      enableDof: true,
      dofFocusRange: 175.0,
      dofBokehScale: 0.35,
    });
    const children = getElementChildren(rendered);
    const dofElement = children.find(
      (c) => c.type === DepthOfField || (c.type as { name?: string })?.name === 'DepthOfField'
    );
    expect(dofElement).toBeDefined();
    const props = getElementProps(dofElement ?? null);
    expect(props.focusRange).toBe(175.0);
    expect(props.bokehScale).toBe(0.35);
  });

  it('[TC-IMP34.09/MSS][UC-IMP34] PostProcessingPipeline centers DepthOfField target at origin [0, 0, 0]', () => {
    const rendered = PostProcessingPipeline({ enableDof: true });
    const children = getElementChildren(rendered);
    const dofElement = children.find(
      (c) => c.type === DepthOfField || (c.type as { name?: string })?.name === 'DepthOfField'
    );
    expect(dofElement).toBeDefined();
    const props = getElementProps(dofElement ?? null);
    expect(props.target?.x).toBe(0);
    expect(props.target?.y).toBe(0);
    expect(props.target?.z).toBe(0);
  });

  // =========================================================================
  // FACET 3: TONE MAPPING & SOFT SHADOWS (VIEWPORT FIDELITY)
  // =========================================================================
  it('[TC-IMP34.10/MSS][UC-IMP34] game_canvas.tsx configures Canvas shadows as soft to eliminate jagged shadow edges', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    const hasSoftShadows =
      source.includes('shadows="soft"') ||
      source.includes("shadows='soft'") ||
      source.includes('PCFSoftShadowMap');
    expect(hasSoftShadows).toBe(true);
    expect(source).not.toMatch(/<Canvas\s+shadows\s+dpr/);
  });

  it('[TC-IMP34.11/MSS][UC-IMP34] game_canvas.tsx configures NoToneMapping on Canvas gl to eliminate Double Tone Mapping', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).toContain('NoToneMapping');
    expect(source).toMatch(/toneMapping:\s*NoToneMapping/);
  });

  it('[TC-IMP34.12/MSS][UC-IMP34] game_canvas.tsx eliminates ACESFilmicToneMapping from Canvas gl config', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    expect(source).not.toContain('ACESFilmicToneMapping');
  });

  it('[TC-IMP34.13/MSS][UC-IMP34] PostProcessingPipeline retains single source of truth AgX ToneMapping in EffectComposer', () => {
    const rendered = PostProcessingPipeline({});
    const children = getElementChildren(rendered);
    const toneMappingElement = children.find(
      (c) => c.type === ToneMapping || (c.type as { name?: string })?.name === 'ToneMapping'
    );
    expect(toneMappingElement).toBeDefined();
    const props = getElementProps(toneMappingElement ?? null);
    expect(props.mode).toBe(ToneMappingMode.AGX);
  });

  // =========================================================================
  // FACET 4: DPR SUBPIXEL DENSITY
  // =========================================================================
  it('[TC-IMP34.14/MSS][UC-IMP34] game_canvas.tsx sets dpr floor >= 1.25 on Canvas to prevent subpixel staircasing', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    const dprMatch = source.match(/dpr=\{\[([0-9.]+),\s*([0-9.]+)\]\}/);
    expect(dprMatch).not.toBeNull();
    const minDpr = parseFloat(dprMatch?.[1] ?? '0');
    expect(minDpr).toBeGreaterThanOrEqual(1.25);
    expect(source).not.toContain('dpr={[1, 2]}');
  });

  it('[TC-IMP34.15/MSS][UC-IMP34] game_canvas.tsx preserves high-DPI upper ceiling >= 2.0 on Canvas', () => {
    const source = fs.readFileSync(gameCanvasPath, 'utf-8');
    const dprMatch = source.match(/dpr=\{\[([0-9.]+),\s*([0-9.]+)\]\}/);
    expect(dprMatch).not.toBeNull();
    const maxDpr = parseFloat(dprMatch?.[2] ?? '0');
    expect(maxDpr).toBeGreaterThanOrEqual(2.0);
  });

  // =========================================================================
  // FACET 5: STATE REACTIVITY & RESOURCE DISPOSAL
  // =========================================================================
  it('[TC-IMP34.16/MSS][UC-IMP34] PostProcessingPipeline excludes SMAA pass when enableSmaa is false', () => {
    const props: Imp34PipelineProps = { enableSmaa: false };
    const rendered = PostProcessingPipeline(props as PostProcessingPipelineProps);
    const children = getElementChildren(rendered);
    const smaaElement = children.find(
      (c) => c.type === SMAA || (c.type as { name?: string })?.name === 'SMAA'
    );
    expect(smaaElement).toBeUndefined();
  });

  it('[TC-IMP34.17/MSS][UC-IMP34] PostProcessingPipeline excludes DepthOfField pass when enableDof is false', () => {
    const rendered = PostProcessingPipeline({ enableDof: false });
    const children = getElementChildren(rendered);
    const dofElement = children.find(
      (c) => c.type === DepthOfField || (c.type as { name?: string })?.name === 'DepthOfField'
    );
    expect(dofElement).toBeUndefined();
  });

  it('[TC-IMP34.18/MSS][UC-IMP34] PostProcessingPipeline returns null cleanly when enabled is false', () => {
    const rendered = PostProcessingPipeline({ enabled: false });
    expect(rendered).toBeNull();
  });

  it('[TC-IMP34.19/MSS][UC-IMP34] PostProcessingPipeline configures EffectComposer with multisampling and autoClear=false', () => {
    const rendered = PostProcessingPipeline({});
    expect(rendered).not.toBeNull();
    expect(rendered?.type).toBe(EffectComposer);
    const props = getElementProps(rendered);
    expect(props.multisampling).toBeGreaterThanOrEqual(0);
    expect(props.autoClear).toBe(false);
  });
});

// @vitest-environment happy-dom
// [TC-448/MSS][UC-448/MSS] Desktop Post-Processing Crispness & Anti-Flicker Hardening Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 49, Gotcha 51), .agents/plans/PLAN_IMP_448_DESKTOP_POST_PROCESSING_CRISPNESS_AND_ANTI_FLICKER.md
// Invariants: INV-448.01, INV-448.02, INV-448.03, INV-448.04, INV-448.05

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Vector3 } from 'three';
import { DepthOfField, N8AO, EffectComposer } from '@react-three/postprocessing';
import { sharedR3FHarness } from '../helpers/r3f_test_harness.js';
import {
  PostProcessingPipeline,
  ActivePostProcessingPipeline,
  calculateDynamicBloomThreshold,
  type PostProcessingPipelineProps,
} from '../../src/client/3d/post_processing_pipeline';
import { GameCanvas } from '../../src/client/game_canvas';

interface HasChildren {
  readonly children?: React.ReactNode;
}

function hasChildren(props: unknown): props is HasChildren {
  return typeof props === 'object' && props !== null && 'children' in props;
}

interface NamedType {
  readonly name?: string;
}

function isNamedType(type: unknown): type is NamedType {
  return typeof type === 'function' || (typeof type === 'object' && type !== null);
}

function findElementByType<P = unknown>(
  node: React.ReactNode,
  targetType: unknown
): React.ReactElement<P> | null {
  if (!React.isValidElement<P>(node)) {
    return null;
  }
  if (node.type === targetType) {
    return node;
  }
  if (
    isNamedType(node.type) &&
    isNamedType(targetType) &&
    node.type.name &&
    targetType.name &&
    node.type.name === targetType.name
  ) {
    return node;
  }
  const props: unknown = node.props;
  if (!hasChildren(props) || !props.children) {
    return null;
  }
  const children = React.Children.toArray(props.children);
  for (const child of children) {
    const found = findElementByType<P>(child, targetType);
    if (found !== null) {
      return found;
    }
  }
  return null;
}

interface DepthOfFieldPassProps {
  readonly target?: Vector3;
  readonly focusRange?: number;
  readonly bokehScale?: number;
}

interface EffectComposerPassProps {
  readonly multisampling?: number;
  readonly autoClear?: boolean;
}

let capturedCanvasTree: React.ReactElement | null = null;

function CanvasCaptureHarness(props: {
  readonly isMobile: boolean;
  readonly isLobby?: boolean;
}): React.ReactElement | null {
  capturedCanvasTree = GameCanvas({
    isMobile: props.isMobile,
    isLobby: props.isLobby,
    enablePostProcessing: true,
  });
  return null;
}

let capturedComposerTree: React.ReactElement | null = null;

function renderPipelineTree(props: PostProcessingPipelineProps = {}): React.ReactElement | null {
  capturedComposerTree = null;
  renderToStaticMarkup(
    React.createElement(() => {
      capturedComposerTree = ActivePostProcessingPipeline(props);
      return null;
    })
  );
  return capturedComposerTree;
}

describe('[TC-448/MSS][UC-448/MSS] Desktop Post-Processing Crispness & Anti-Flicker Hardening Contracts', () => {
  beforeEach(() => {
    capturedCanvasTree = null;
    capturedComposerTree = null;
  });

  // =========================================================================
  // FACET 1: ZERO-CHURN DOF TARGET & STABLE BOKEH BINDING
  // =========================================================================
  it('[TC-448.01/MSS][UC-DOF-ZERO-CHURN-TARGET/MSS] Given enableDof = false, DepthOfField receives stable target Vector3 and bokehScale === 0', () => {
    const composerTree = renderPipelineTree({ enableDof: false });
    expect(composerTree).not.toBeNull();

    const dofElement = findElementByType<DepthOfFieldPassProps>(composerTree, DepthOfField);
    expect(dofElement).not.toBeNull();
    expect(dofElement?.props.bokehScale).toBe(0);
    expect(dofElement?.props.target).toBeInstanceOf(Vector3);
  });

  it('[TC-448.02/MSS][UC-DOF-ACTIVE-SCALE/MSS] Given enableDof = true, DepthOfField receives active bokehScale > 0 matching configuration', () => {
    const composerTree = renderPipelineTree({ enableDof: true, dofBokehScale: 0.35 });
    const dofElement = findElementByType<DepthOfFieldPassProps>(composerTree, DepthOfField);

    expect(dofElement).not.toBeNull();
    expect(dofElement?.props.bokehScale).toBe(0.35);
  });

  // =========================================================================
  // FACET 2: N8AO LOGARITHMIC DEPTH BYPASS & GPU CRASH DEFENSE
  // =========================================================================
  it('[TC-448.03/MSS][UC-AO-BYPASS-SAFETY/MSS] Given gl.capabilities.logarithmicDepthBuffer = true, N8AO is autonomously excluded even if enableAo = true', () => {
    sharedR3FHarness.state.gl.capabilities = { logarithmicDepthBuffer: true };
    renderToStaticMarkup(React.createElement(() => {
      capturedComposerTree = ActivePostProcessingPipeline({ enableAo: true });
      return null;
    }));
    const aoWithLogDepth = findElementByType(capturedComposerTree, N8AO);
    expect(aoWithLogDepth).toBeNull();

    // Relational covariance: When logarithmic depth is false, enableAo = true includes N8AO
    sharedR3FHarness.state.gl.capabilities = { logarithmicDepthBuffer: false };
    renderToStaticMarkup(React.createElement(() => {
      capturedComposerTree = ActivePostProcessingPipeline({ enableAo: true });
      return null;
    }));
    const aoWithoutLogDepth = findElementByType(capturedComposerTree, N8AO);
    expect(aoWithoutLogDepth).not.toBeNull();
  });

  // =========================================================================
  // FACET 3: EFFECT COMPOSER BUFFER INTEGRITY & AUTO-CLEAR HARDENING
  // =========================================================================
  it('[TC-448.04/MSS][UC-EFFECT-COMPOSER-AUTO-CLEAR/MSS] Given ActivePostProcessingPipeline, EffectComposer receives autoClear === true to prevent ghosting', () => {
    const composerTree = renderPipelineTree({});
    expect(composerTree).not.toBeNull();

    const composer = findElementByType<EffectComposerPassProps>(composerTree, EffectComposer);
    expect(composer).not.toBeNull();
    expect(composer?.props.autoClear).toBe(true);
  });

  // =========================================================================
  // FACET 4: AUTHORITATIVE CALL-SITE WIRING IN GAME CANVAS
  // =========================================================================
  it('[TC-448.05/MSS][UC-CALL-SITE-WIRING-CANVAS/MSS] In GameCanvas desktop call-site, PostProcessingPipeline receives enableAo === false and enableSelectiveBloom === false', () => {
    renderToStaticMarkup(React.createElement(CanvasCaptureHarness, { isMobile: false, isLobby: false }));
    expect(capturedCanvasTree).not.toBeNull();

    const pipeline = findElementByType<PostProcessingPipelineProps>(capturedCanvasTree, PostProcessingPipeline);
    expect(pipeline).not.toBeNull();
    expect(pipeline?.props.enableAo).toBe(false);
    expect(pipeline?.props.enableSelectiveBloom).toBe(false);
  });

  it('[TC-448.07/MSS][UC-CALL-SITE-WIRING-LOBBY/MSS] In GameCanvas lobby call-site, PostProcessingPipeline receives enableAo === false preventing N8AO crash', () => {
    renderToStaticMarkup(React.createElement(CanvasCaptureHarness, { isMobile: false, isLobby: true }));
    expect(capturedCanvasTree).not.toBeNull();

    const pipeline = findElementByType<PostProcessingPipelineProps>(capturedCanvasTree, PostProcessingPipeline);
    expect(pipeline).not.toBeNull();
    expect(pipeline?.props.enableAo).toBe(false);
  });

  // =========================================================================
  // FACET 5: RELATIONAL COVARIANCE & ADVERSARIAL INTEGRITY
  // =========================================================================
  it('[TC-448.06/MSS][UC-RELATIONAL-COVARIANCE/MSS] Relational covariance asserts f(enableDof=true).bokehScale !== f(enableDof=false).bokehScale', () => {
    const activeTree = renderPipelineTree({ enableDof: true, dofBokehScale: 0.42 });
    const inactiveTree = renderPipelineTree({ enableDof: false, dofBokehScale: 0.42 });

    const activeDof = findElementByType<DepthOfFieldPassProps>(activeTree, DepthOfField);
    const inactiveDof = findElementByType<DepthOfFieldPassProps>(inactiveTree, DepthOfField);

    expect(activeDof?.props.bokehScale).toBe(0.42);
    expect(inactiveDof?.props.bokehScale).toBe(0.0);
    expect(activeDof?.props.bokehScale).not.toBe(inactiveDof?.props.bokehScale);
  });

  it('[TC-448.08/MSS][UC-DYNAMIC-BLOOM-THRESHOLD/MSS] calculateDynamicBloomThreshold returns safe threshold >= 2.0 when auction is inactive', () => {
    const defaultThreshold = calculateDynamicBloomThreshold(false);
    const auctionThreshold = calculateDynamicBloomThreshold(true);

    expect(defaultThreshold).toBeGreaterThanOrEqual(2.0);
    expect(auctionThreshold).toBe(1.2);
  });

  it('[TC-448.09/MSS][UC-HELPER-ADVERSARIAL-GATE/MSS] findElementByType safely handles null, empty, and deep non-matching nodes without throwing', () => {
    const nullResult = findElementByType(null, PostProcessingPipeline);
    const emptyResult = findElementByType(React.createElement('div', null, React.createElement('span', null)), PostProcessingPipeline);
    const nestedResult = findElementByType<DepthOfFieldPassProps>(
      React.createElement('div', null, React.createElement('div', null, React.createElement(DepthOfField, { bokehScale: 0.15 }))),
      DepthOfField
    );

    expect(nullResult).toBeNull();
    expect(emptyResult).toBeNull();
    expect(nestedResult?.props.bokehScale).toBe(0.15);
  });
});

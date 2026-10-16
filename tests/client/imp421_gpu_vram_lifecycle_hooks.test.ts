// @vitest-environment happy-dom
// [UI-3D/MSS][TC-421/MSS] IMP-421: GPU VRAM Lifecycle & Managed Three.js Resource Hooks Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 1, Gotcha 8, Gotcha 21), .agents/plans/PLAN_IMP_421_GPU_VRAM_LIFECYCLE_HOOKS.md
// Seam Discipline: Interface is the test boundary. Banned monkey-patching React internals (spyOn(React)).
// Testing Harness: Uses natural createRoot and act() lifecycle for hook verification.

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BoxGeometry, BufferGeometry, CanvasTexture } from 'three';
import {
  useManagedBufferGeometry,
  useManagedCanvasTexture,
  useManagedDisposable,
  disposeResource,
  isDisposable,
} from '../../src/client/3d/hooks/use_managed_geometry';
import { CentralHologram } from '../../src/client/3d/penthouse_hologram';

vi.mock('@react-three/fiber', async () => {
  const { createR3FMock, sharedR3FHarness } = await import('../helpers/r3f_test_harness');
  return createR3FMock(sharedR3FHarness);
});

vi.mock('@react-three/drei', () => ({
  RoundedBox: (props: { readonly children?: React.ReactNode; [key: string]: unknown }) =>
    React.createElement('rounded-box', props, props.children),
}));

describe('[UC-421] GPU VRAM Lifecycle & Managed Three.js Resource Hooks', () => {
  let container: HTMLDivElement | null = null;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    const currentRoot = root;
    const currentContainer = container;
    if (currentRoot && currentContainer) {
      act(() => {
        currentRoot.unmount();
      });
      currentContainer.remove();
    }
    container = null;
    root = null;
    vi.restoreAllMocks();
  });

  it('TC-421.01 [UC-MANAGED-RESOURCE-UNMOUNT-DISPOSAL/MSS]: disposes BufferGeometry upon unmount', () => {
    let capturedGeo: BoxGeometry | null = null;
    const disposeSpy = vi.fn();

    function TestComponent(): React.ReactElement | null {
      const geo = useManagedBufferGeometry(() => {
        const box = new BoxGeometry(1, 1, 1);
        box.dispose = disposeSpy;
        return box;
      }, []);
      capturedGeo = geo;
      return null;
    }

    act(() => {
      root?.render(React.createElement(TestComponent));
    });

    expect(capturedGeo).not.toBeNull();
    expect(disposeSpy).toHaveBeenCalledTimes(0);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-421.02 [UC-MANAGED-RESOURCE-DEPS-DISPOSAL/MSS]: disposes prior BufferGeometry when dependencies change', () => {
    const disposeSpy1 = vi.fn();
    const disposeSpy2 = vi.fn();
    let setDimensionFn: ((dim: number) => void) | null = null;
    let capturedGeo: BoxGeometry | null = null;

    function TestComponent(): React.ReactElement | null {
      const [dim, setDim] = useState(1);
      setDimensionFn = setDim;
      const geo = useManagedBufferGeometry(() => {
        const box = new BoxGeometry(dim, dim, dim);
        box.dispose = dim === 1 ? disposeSpy1 : disposeSpy2;
        return box;
      }, [dim]);
      capturedGeo = geo;
      return null;
    }

    act(() => {
      root?.render(React.createElement(TestComponent));
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(0);

    act(() => {
      setDimensionFn?.(2);
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    expect(disposeSpy2).toHaveBeenCalledTimes(0);
    expect(capturedGeo).not.toBeNull();
  });

  it('TC-421.03 [UC-MANAGED-TEXTURE-UNMOUNT-DISPOSAL/MSS]: disposes CanvasTexture upon unmount', () => {
    let capturedTex: CanvasTexture | null = null;
    const disposeSpy = vi.fn();

    function TestComponent(): React.ReactElement | null {
      const tex = useManagedCanvasTexture(() => {
        const canvas = document.createElement('canvas');
        const texture = new CanvasTexture(canvas);
        texture.dispose = disposeSpy;
        return texture;
      }, []);
      capturedTex = tex;
      return null;
    }

    act(() => {
      root?.render(React.createElement(TestComponent));
    });

    expect(capturedTex).not.toBeNull();
    expect(disposeSpy).toHaveBeenCalledTimes(0);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-421.04 [UC-MANAGED-TEXTURE-DEPS-DISPOSAL/MSS]: disposes prior CanvasTexture when dependencies change', () => {
    const disposeSpy1 = vi.fn();
    const disposeSpy2 = vi.fn();
    let setLabelFn: ((l: string) => void) | null = null;

    function TestComponent(): React.ReactElement | null {
      const [label, setLabel] = useState('alpha');
      setLabelFn = setLabel;
      return useManagedCanvasTexture(() => {
        const canvas = document.createElement('canvas');
        const texture = new CanvasTexture(canvas);
        texture.dispose = label === 'alpha' ? disposeSpy1 : disposeSpy2;
        return texture;
      }, [label]) ? null : null;
    }

    act(() => {
      root?.render(React.createElement(TestComponent));
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(0);

    act(() => {
      setLabelFn?.('beta');
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    expect(disposeSpy2).toHaveBeenCalledTimes(0);
  });

  it('TC-421.05 [UC-MANAGED-RESOURCE-SAFETY-GUARDS/A1]: safely guards invalid disposables and erroring factories', () => {
    expect(isDisposable(null)).toBe(false);
    expect(isDisposable({ dispose: 'not-a-function' })).toBe(false);
    expect(isDisposable({ dispose: () => {} })).toBe(true);

    const throwingDisposable = {
      dispose: () => {
        throw new Error('Disposal failure');
      },
    };
    expect(disposeResource(throwingDisposable)).toBe(false);
  });

  it('TC-421.06 [UC-MANAGED-RESOURCE-CONSUMER-WIRING/MSS]: proves CentralHologram actively disposes particle geometry and hud texture upon unmount', () => {
    const geoDisposeSpy = vi.spyOn(BufferGeometry.prototype, 'dispose');
    const texDisposeSpy = vi.spyOn(CanvasTexture.prototype, 'dispose');

    act(() => {
      root?.render(React.createElement(CentralHologram));
    });

    expect(geoDisposeSpy).toHaveBeenCalledTimes(0);
    expect(texDisposeSpy).toHaveBeenCalledTimes(0);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(geoDisposeSpy).toHaveBeenCalledTimes(1);
    expect(texDisposeSpy).toHaveBeenCalledTimes(1);
  });
});

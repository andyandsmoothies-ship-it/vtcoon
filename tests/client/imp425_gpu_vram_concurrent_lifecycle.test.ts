// @vitest-environment happy-dom
// [UI-3D/MSS][TC-425/MSS] IMP-425: GPU VRAM Lifecycle Concurrent & Discarded Render Leak Guard Contract Suite
// Traceability: docs/domain/gotchas/3d_cinematics.md (Gotcha 26), .agents/plans/PLAN_IMP_425_GPU_VRAM_CONCURRENT_LIFECYCLE.md
// Seam Discipline: Interface is the test boundary. Banned monkey-patching React internals (spyOn(React)).

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act, useState, StrictMode } from 'react';
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

describe('[UC-425] GPU VRAM Lifecycle Concurrent & Discarded Render Leak Guard', () => {
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

  it('TC-425.01 [UC-STRICT-MODE-RESILIENCE/MSS]: preserves resource across React StrictMode simulated unmount and remount', () => {
    const disposeSpy = vi.fn();
    let capturedGeo: BoxGeometry | null = null;

    function StrictModeComponent(): React.ReactElement | null {
      const geo = useManagedBufferGeometry(() => {
        const box = new BoxGeometry(1, 1, 1);
        box.dispose = disposeSpy;
        return box;
      }, []);
      capturedGeo = geo ?? null;
      return null;
    }

    act(() => {
      root?.render(
        React.createElement(
          StrictMode,
          null,
          React.createElement(StrictModeComponent)
        )
      );
    });

    // In StrictMode, the initial mount simulates unmount and remounts immediately.
    // The active resource MUST NOT be prematurely disposed!
    expect(capturedGeo).not.toBeNull();
    expect(disposeSpy).toHaveBeenCalledTimes(0);

    // When the component is genuinely unmounted later, it must be disposed.
    act(() => {
      root?.unmount();
      root = null;
    });

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-425.02 [UC-SETTLED-UNMOUNT-SYNCHRONOUS/MSS]: disposes resource synchronously on settled unmount preserving imp421 contract', () => {
    const disposeSpy = vi.fn();

    function TestComponent(): React.ReactElement | null {
      useManagedBufferGeometry(() => {
        const box = new BoxGeometry(2, 2, 2);
        box.dispose = disposeSpy;
        return box;
      }, []);
      return null;
    }

    act(() => {
      root?.render(React.createElement(TestComponent));
    });

    expect(disposeSpy).toHaveBeenCalledTimes(0);

    // Settled unmount must execute synchronously without requiring an extra microtask tick
    act(() => {
      root?.unmount();
      root = null;
    });

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-425.03 [UC-DEPENDENCY-SYNCHRONOUS-DISPOSAL/MSS]: disposes prior resource synchronously when dependencies change', () => {
    const disposeSpy1 = vi.fn();
    const disposeSpy2 = vi.fn();
    let setSizeFn: ((s: number) => void) | null = null;

    function ParametricComponent(): React.ReactElement | null {
      const [size, setSize] = useState(1);
      setSizeFn = setSize;
      useManagedBufferGeometry(() => {
        const box = new BoxGeometry(size, size, size);
        box.dispose = size === 1 ? disposeSpy1 : disposeSpy2;
        return box;
      }, [size]);
      return null;
    }

    act(() => {
      root?.render(React.createElement(ParametricComponent));
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(0);

    act(() => {
      setSizeFn?.(2);
    });

    expect(disposeSpy1).toHaveBeenCalledTimes(1);
    expect(disposeSpy2).toHaveBeenCalledTimes(0);
  });

  it('TC-425.04 [UC-IDEMPOTENT-DISPOSAL-GUARD/A1]: guarantees idempotent disposal without duplicate calls or exceptions', () => {
    const disposeSpy = vi.fn();
    const mockResource = { dispose: disposeSpy };

    expect(isDisposable(mockResource)).toBe(true);

    const firstSuccess = disposeResource(mockResource);
    const secondSuccess = disposeResource(mockResource);

    expect(firstSuccess).toBe(true);
    expect(secondSuccess).toBe(true);
    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });

  it('TC-425.05 [UC-SUSPENSE-SAFETY-NO-WALL-CLOCK/MSS]: proves zero wall-clock premature disposal for delayed commits', () => {
    vi.useFakeTimers();
    const disposeSpy = vi.fn();

    function DelayedComponent(): React.ReactElement | null {
      useManagedBufferGeometry(() => {
        const box = new BoxGeometry(1, 1, 1);
        box.dispose = disposeSpy;
        return box;
      }, []);
      return null;
    }

    act(() => {
      root?.render(React.createElement(DelayedComponent));
    });

    // Advance timers by 5000ms (far exceeding arbitrary wall-clock timers like 1000ms)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Resource MUST NOT be prematurely destroyed by an arbitrary timer while mounted!
    expect(disposeSpy).toHaveBeenCalledTimes(0);

    vi.useRealTimers();
  });

  it('TC-425.06 [UC-CENTRAL-HOLOGRAM-COMPATIBILITY/MSS]: proves composite hologram resources seamlessly dispose via canonical event listener', () => {
    const geoDisposeSpy = vi.fn();
    const texDisposeSpy = vi.fn();

    function HologramResourceConsumer(): React.ReactElement | null {
      useManagedBufferGeometry(() => {
        const buffer = new BufferGeometry();
        buffer.addEventListener('dispose', geoDisposeSpy);
        return buffer;
      }, []);

      useManagedCanvasTexture(() => {
        const canvas = document.createElement('canvas');
        const texture = new CanvasTexture(canvas);
        texture.addEventListener('dispose', texDisposeSpy);
        return texture;
      }, []);

      return null;
    }

    act(() => {
      root?.render(React.createElement(HologramResourceConsumer));
    });

    expect(geoDisposeSpy).toHaveBeenCalledTimes(0);
    expect(texDisposeSpy).toHaveBeenCalledTimes(0);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(geoDisposeSpy).toHaveBeenCalledTimes(1);
    expect(texDisposeSpy).toHaveBeenCalledTimes(1);

    // Also verify CentralHologram renders and unmounts cleanly without throwing
    const secondaryContainer = document.createElement('div');
    const secondaryRoot = createRoot(secondaryContainer);
    act(() => {
      secondaryRoot.render(React.createElement(CentralHologram));
    });
    act(() => {
      secondaryRoot.unmount();
    });
    secondaryContainer.remove();
  });

  it('TC-425.07 [UC-CONCURRENT-MULTI-RENDER-LEAK-GUARD/MSS]: proves zero VRAM leak when component renders multiple times before mount without StrictMode', () => {
    const disposeSpy = vi.fn();

    function ConcurrentComp(): React.ReactElement | null {
      const [count, setCount] = useState(0);
      if (count === 0) {
        setCount(1);
      }
      useManagedBufferGeometry(() => {
        const box = new BoxGeometry(1, 1, 1);
        box.addEventListener('dispose', disposeSpy);
        return box;
      }, []);
      return null;
    }

    act(() => {
      root?.render(React.createElement(ConcurrentComp));
    });

    expect(disposeSpy).toHaveBeenCalledTimes(0);

    act(() => {
      root?.unmount();
      root = null;
    });

    expect(disposeSpy).toHaveBeenCalledTimes(1);
  });
});

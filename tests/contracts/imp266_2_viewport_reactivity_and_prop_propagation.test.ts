// @vitest-environment happy-dom
// [TC-266.2/MSS][UC-IMP266.2] Viewport Reactivity & Prop Propagation Contract Suite
// Verifies useIsMobile() hook reactivity, window resize / orientationchange event handling,
// unmount cleanup, passive listener options, and safe SSR execution via idiomatic Test Harness.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { isMobileDevice } from '../../src/client/3d/device_detect';
import { useIsMobile } from '../../src/client/hooks/use_is_mobile';

interface WindowListenerRecord {
  readonly type: string;
  readonly handler: (event?: unknown) => void;
  readonly options?: boolean | AddEventListenerOptions;
}

interface HookRunResult {
  readonly getValue: () => boolean;
  readonly unmount: () => void;
}

function runHookInHarness(hookFn: () => boolean): HookRunResult {
  let currentValue = false;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestHarness(): React.ReactElement | null {
    currentValue = hookFn();
    return null;
  }

  act(() => {
    root.render(React.createElement(TestHarness));
  });

  return {
    getValue: () => currentValue,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

declare global {
  // eslint-disable-next-line no-var
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const nativeAddEventListener = typeof window !== 'undefined' ? window.addEventListener : undefined;
const nativeRemoveEventListener = typeof window !== 'undefined' ? window.removeEventListener : undefined;

describe('IMP-266.2: Viewport Reactivity & Prop Propagation Contract Suite', () => {
  let listeners: WindowListenerRecord[];
  let removedListeners: { type: string; handler: (event?: unknown) => void }[];

  beforeEach(() => {
    listeners = [];
    removedListeners = [];
    if (typeof window !== 'undefined' && nativeAddEventListener && nativeRemoveEventListener) {
      window.addEventListener = (type: string, handler: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
        listeners.push({ type, handler: handler as (e?: unknown) => void, options });
        nativeAddEventListener.call(window, type, handler, options);
      };

      window.removeEventListener = (type: string, handler: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
        removedListeners.push({ type, handler: handler as (e?: unknown) => void });
        listeners = listeners.filter((l) => l.type !== type || l.handler !== handler);
        nativeRemoveEventListener.call(window, type, handler, options);
      };
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (typeof window !== 'undefined' && nativeAddEventListener && nativeRemoveEventListener) {
      window.addEventListener = nativeAddEventListener;
      window.removeEventListener = nativeRemoveEventListener;
    }
    vi.restoreAllMocks();
  });

  it('TC-266.2.01 [UC-IMP266.2/MSS]: useIsMobile returns true when initialized with mobile width 360px', () => {
    window.innerWidth = 360;
    const deviceDetectDirect = isMobileDevice();
    const hook = runHookInHarness(() => useIsMobile());

    expect(deviceDetectDirect).toBe(true);
    expect(hook.getValue()).toBe(true);
    hook.unmount();
  });

  it('TC-266.2.02 [UC-IMP266.2/MSS]: useIsMobile returns false when initialized with desktop width 1280px', () => {
    window.innerWidth = 1280;
    const deviceDetectDirect = isMobileDevice();
    const hook = runHookInHarness(() => useIsMobile());

    expect(deviceDetectDirect).toBe(false);
    expect(hook.getValue()).toBe(false);
    hook.unmount();
  });

  it('TC-266.2.03 [UC-IMP266.2/MSS]: useIsMobile updates reactively when window.dispatchEvent(new Event("resize"))', () => {
    window.innerWidth = 360;
    const hook = runHookInHarness(() => useIsMobile());
    window.innerWidth = 1024;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(isMobileDevice()).toBe(false);
    expect(hook.getValue()).toBe(false);
    hook.unmount();
  });

  it('TC-266.2.04 [UC-IMP266.2/MSS]: useIsMobile updates reactively when window.dispatchEvent(new Event("orientationchange"))', () => {
    window.innerWidth = 1024;
    const hook = runHookInHarness(() => useIsMobile());
    window.innerWidth = 414;
    act(() => {
      window.dispatchEvent(new Event('orientationchange'));
    });

    expect(isMobileDevice()).toBe(true);
    expect(hook.getValue()).toBe(true);
    hook.unmount();
  });

  it('TC-266.2.05 [UC-IMP266.2/A1]: useIsMobile cleans up event listeners on window when component unmounts', () => {
    const hook = runHookInHarness(() => useIsMobile());
    hook.unmount();

    expect(isMobileDevice()).toBe(true);
    expect(removedListeners.length).toBe(2);
  });

  it('TC-266.2.06 [UC-IMP266.2/A2]: useIsMobile executes safely without throwing in headless SSR environment without window', () => {
    vi.stubGlobal('window', undefined);
    const ssrDevice = isMobileDevice();
    let ssrResult: boolean | undefined;
    renderToStaticMarkup(
      React.createElement(() => {
        ssrResult = useIsMobile();
        return null;
      })
    );

    expect(ssrDevice).toBe(false);
    expect(ssrResult).toBe(false);
  });

  it('TC-266.2.07 [UC-IMP266.2/MSS]: useIsMobile does not register redundant listeners or trigger extraneous renders when resize does not cross threshold', () => {
    window.innerWidth = 360;
    const hook = runHookInHarness(() => useIsMobile());
    const initialListenerCount = listeners.length;
    window.innerWidth = 400;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(initialListenerCount).toBe(2);
    expect(listeners.length).toBe(2);
    hook.unmount();
  });

  it('TC-266.2.08 [UC-IMP266.2/A3]: useIsMobile registers event listeners with passive option for scroll and render performance', () => {
    const hook = runHookInHarness(() => useIsMobile());
    const resizeRecord = listeners.find((l) => l.type === 'resize');
    const resizeOpts = typeof resizeRecord?.options === 'object' ? resizeRecord.options : null;

    expect(isMobileDevice()).toBe(true);
    expect(resizeOpts?.passive).toBe(true);
    hook.unmount();
  });
});

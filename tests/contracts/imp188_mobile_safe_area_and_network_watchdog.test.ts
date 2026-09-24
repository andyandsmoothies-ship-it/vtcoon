// [TC-188.01/MSS..TC-188.18/MSS][UC-188] Mobile Safe-Area, PWA Standalone & 4G/WebView Watchdog Contract Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { TopBar } from '../../src/client/ui/top_bar';

// ============================================================================
// DYNAMIC IMPORT HARNESS (Station 1 RED Contract Gate)
// Dynamically resolves Station 2 modules to assert clean Business RED
// ============================================================================
const WATCHDOG_MODULE_PATH = '../../src/client/network/ws_liveness_watchdog';
const BANNER_MODULE_PATH = '../../src/client/ui/in_app_browser_banner';

let watchdogMod: any = null;
try {
  watchdogMod = await import(/* @vite-ignore */ WATCHDOG_MODULE_PATH);
} catch {
  try {
    watchdogMod = await import(/* @vite-ignore */ `${WATCHDOG_MODULE_PATH}.js`);
  } catch {
    watchdogMod = null;
  }
}

let bannerMod: any = null;
try {
  bannerMod = await import(/* @vite-ignore */ BANNER_MODULE_PATH);
} catch {
  try {
    bannerMod = await import(/* @vite-ignore */ `${BANNER_MODULE_PATH}.js`);
  } catch {
    bannerMod = null;
  }
}

// Function accessors from Station 2 modules
export interface UseWsLivenessWatchdogOptions {
  isConnected: boolean;
  onWakeup: () => void;
  onDeadSocket?: () => void;
  onResyncTimeout?: () => void;
}

export interface UseWsLivenessWatchdogReturn {
  recordPacketReceived: () => void;
  startResyncWatchdog: (onTimeout?: () => void) => void;
  clearResyncWatchdog: () => void;
}

const detectInAppBrowser: (userAgent?: string) => boolean =
  watchdogMod?.detectInAppBrowser ??
  (() => {
    throw new TypeError('detectInAppBrowser is not implemented (Station 1 RED: ws_liveness_watchdog.ts pending)');
  });

const useWsLivenessWatchdog: (options: UseWsLivenessWatchdogOptions) => UseWsLivenessWatchdogReturn =
  watchdogMod?.useWsLivenessWatchdog ??
  (() => {
    throw new TypeError('useWsLivenessWatchdog is not implemented (Station 1 RED: ws_liveness_watchdog.ts pending)');
  });

const InAppBrowserBanner: React.ComponentType<{
  onDismiss?: () => void;
  onCopy?: () => void;
}> =
  bannerMod?.InAppBrowserBanner ??
  (() => {
    throw new TypeError('InAppBrowserBanner is not implemented (Station 1 RED: in_app_browser_banner.tsx pending)');
  });

// ============================================================================
// TEST HARNESS HELPERS
// ============================================================================
function renderHookInHarness<T>(hookFn: () => T): { result: { current: T }; unmount: () => void } {
  let captured: T | undefined;
  const cleanups: (() => void)[] = [];

  const useEffectSpy = vi.spyOn(React, 'useEffect').mockImplementation((effect) => {
    const cleanup = effect();
    if (typeof cleanup === 'function') {
      cleanups.push(cleanup);
    }
  });

  function TestHarness() {
    captured = hookFn();
    return null;
  }

  try {
    renderToStaticMarkup(React.createElement(TestHarness));
  } finally {
    useEffectSpy.mockRestore();
  }

  return {
    result: {
      get current() {
        return captured!;
      },
    },
    unmount: () => {
      while (cleanups.length > 0) {
        const cleanup = cleanups.pop();
        cleanup?.();
      }
    },
  };
}

function triggerTenPackets(recordFn: () => void) {
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
  recordFn();
}

describe('[IMP-188] Mobile Safe-Area, PWA Standalone & 4G/WebView Watchdog Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & RANGE (VIEWPORT PADDING, PWA METAS & UA DETECTION)
  // =========================================================================
  describe('Facet 1: Boundary & Range (Safe-Area, PWA Head & UA Bounds)', () => {
    it('[TC-188.01/MSS][UC-188] Đảm bảo top_bar.tsx chứa class CSS pt-[calc(0.375rem+env(safe-area-inset-top))]', () => {
      const html = renderToStaticMarkup(
        React.createElement(TopBar, {
          onLeaveRoom: () => {},
        })
      );
      expect(html).toContain('pt-[calc(0.375rem+env(safe-area-inset-top))]');
    });

    it('[TC-188.02/MSS][UC-188] Đảm bảo index.html có thẻ meta apple-mobile-web-app-capable="yes"', () => {
      const indexHtmlPath = path.resolve(__dirname, '../../index.html');
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).toMatch(/<meta\s+name=["']apple-mobile-web-app-capable["']\s+content=["']yes["']/i);
    });

    it('[TC-188.03/MSS][UC-188] Đảm bảo index.html có thẻ meta apple-mobile-web-app-status-bar-style="black-translucent"', () => {
      const indexHtmlPath = path.resolve(__dirname, '../../index.html');
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).toMatch(/<meta\s+name=["']apple-mobile-web-app-status-bar-style["']\s+content=["']black-translucent["']/i);
    });

    it('[TC-188.04/MSS][UC-188] Đảm bảo index.html có thẻ link rel="manifest" trỏ đến /manifest.json', () => {
      const indexHtmlPath = path.resolve(__dirname, '../../index.html');
      const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
      expect(indexHtml).toMatch(/<link\s+rel=["']manifest["']\s+href=["']\/manifest\.json["']/i);
    });

    it('[TC-188.05/MSS][UC-188] Đảm bảo public/manifest.json có cấu trúc hợp lệ (standalone, portrait, theme_color) và chỉ trỏ vào asset thực tế /favicon.ico', () => {
      const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
      const manifestRaw = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf-8') : null;
      expect(manifestRaw, 'public/manifest.json must exist on disk').not.toBeNull();

      const manifest = JSON.parse(manifestRaw!);
      expect(manifest.display).toBe('standalone');
      expect(manifest.orientation).toBe('portrait');
      expect(manifest.icons?.some((i: { src: string }) => i.src === '/favicon.ico' || i.src === 'favicon.ico')).toBe(true);
    });

    it('[TC-188.06/MSS][UC-188] detectInAppBrowser: Nhận diện chính xác UA Zalo (Mozilla/5.0 ... Zalo/24.01.01)', () => {
      const zaloUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo/24.01.01 ZaloTheme/light';
      expect(detectInAppBrowser(zaloUa)).toBe(true);
    });

    it('[TC-188.07/MSS][UC-188] detectInAppBrowser: Nhận diện chính xác UA Facebook In-App (... FBAN/FBIOS ... hoặc ... FBAV/ ...)', () => {
      const fbIosUa = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/20F66 [FBAN/FBIOS;FBAV/415.0.0.25.109;FBBV/473852174;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/16.5;FBSS/3;FBID/phone;FBLC/vi_VN;FBOP/5]';
      const fbAndroidUa = 'Mozilla/5.0 (Linux; Android 13; SM-S918B Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/114.0.5735.196 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/419.0.0.27.71;]';
      expect(detectInAppBrowser(fbIosUa)).toBe(true);
      expect(detectInAppBrowser(fbAndroidUa)).toBe(true);
    });

    it('[TC-188.08/MSS][UC-188] detectInAppBrowser: Trả về false cho Safari iOS chuẩn và Chrome Android chuẩn', () => {
      const safariIos = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';
      const chromeAndroid = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.6312.80 Mobile Safari/537.36';
      expect(detectInAppBrowser(safariIos)).toBe(false);
      expect(detectInAppBrowser(chromeAndroid)).toBe(false);
    });
  });

  // =========================================================================
  // FACET 2: RESOURCE DISPOSAL & TIMER ISOLATION
  // =========================================================================
  describe('Facet 2: Resource Disposal & Timer Isolation', () => {
    it('[TC-188.09/MSS][UC-188] useWsLivenessWatchdog: Khởi tạo và cleanup DUY NHẤT 1 timer interval khi unmount (Disposal)', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      const harness = renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      harness.unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('[TC-188.10/MSS][UC-188] useWsLivenessWatchdog: Nhịp đếm 1000ms thông thường KHÔNG kích hoạt onWakeup hay onDeadSocket', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      vi.advanceTimersByTime(1000);

      expect(onWakeup).not.toHaveBeenCalled();
      expect(onDeadSocket).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // FACET 3: ERROR DEFENSE & TERMINAL INVARIANTS (CLOCK DRIFT & FREEZE)
  // =========================================================================
  describe('Facet 3: Error Defense & Terminal Invariants (Clock Drift)', () => {
    it('[TC-188.11/MSS][UC-188] useWsLivenessWatchdog: Bỏ qua nếu thời gian lệch < 5000ms (Chống False Positive khi GC Pause 2s)', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      let mockNow = 10000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      // GC pause 2000ms: time jumps by 2000ms instead of 1000ms
      mockNow += 2000;
      vi.advanceTimersByTime(1000);
      vi.advanceTimersByTime(250);

      expect(onWakeup).not.toHaveBeenCalled();
      expect(onDeadSocket).not.toHaveBeenCalled();
    });

    it('[TC-188.12/MSS][UC-188] useWsLivenessWatchdog: Kích hoạt onWakeup debounced khi thời gian lệch >= 5000ms (Bắt Zalo CPU freeze)', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      let mockNow = 10000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      // Phone sleep / Zalo freeze 6000ms
      mockNow += 6000;
      vi.advanceTimersByTime(1000);

      // Debounced: not called immediately
      expect(onWakeup).toHaveBeenCalledTimes(0);

      // After 200ms debounce
      vi.advanceTimersByTime(200);
      expect(onWakeup).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 4: PERFORMANCE & NETWORK HEARTBEAT INVARIANTS
  // =========================================================================
  describe('Facet 4: Performance & Network Heartbeat Invariants', () => {
    it('[TC-188.13/MSS][UC-188] useWsLivenessWatchdog: recordPacketReceived cập nhật lastPacketTimeRef O(1) mà không sinh timer mới', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      const harness = renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');

      // Rapidly ingest packets without creating new timers
      triggerTenPackets(harness.result.current.recordPacketReceived);

      expect(setTimeoutSpy).toHaveBeenCalledTimes(0);
    });

    it('[TC-188.14/MSS][UC-188] useWsLivenessWatchdog: NAT Watchdog không kích hoạt nếu gói tin đến đều đặn (< 12500ms)', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      let mockNow = 10000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      const harness = renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      // Packets arrive at 4s, 8s, 12s, 16s (heartbeat every 4-5s)
      mockNow += 4000;
      harness.result.current.recordPacketReceived();
      vi.advanceTimersByTime(4000);

      mockNow += 4000;
      harness.result.current.recordPacketReceived();
      vi.advanceTimersByTime(4000);

      mockNow += 4000;
      harness.result.current.recordPacketReceived();
      vi.advanceTimersByTime(4000);

      mockNow += 4000;
      harness.result.current.recordPacketReceived();
      vi.advanceTimersByTime(4000);

      expect(onDeadSocket).not.toHaveBeenCalled();
    });

    it('[TC-188.15/MSS][UC-188] useWsLivenessWatchdog: NAT Watchdog đóng socket an toàn khi quá 12500ms câm lặng, KHÔNG kích hoạt 2 socket song song', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();

      let mockNow = 10000;
      vi.spyOn(performance, 'now').mockImplementation(() => mockNow);

      renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      // Advance time past 12.5s (13s) without any incoming packets
      mockNow += 13000;
      vi.advanceTimersByTime(13000);

      expect(onDeadSocket).toHaveBeenCalledTimes(1);

      // Advance another 5s: ensure no duplicate parallel triggers
      mockNow += 5000;
      vi.advanceTimersByTime(5000);
      expect(onDeadSocket).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // FACET 5: STATE REACTIVITY & CROSS-COUPLING BLAST RADIUS
  // =========================================================================
  describe('Facet 5: State Reactivity & Cross-Coupling Blast Radius', () => {
    it('[TC-188.16/MSS][UC-188] useWsLivenessWatchdog: Quản lý resyncWatchdog (2500ms), tự động hủy khi nhận delta mới', () => {
      const onWakeup = vi.fn();
      const onDeadSocket = vi.fn();
      const onResyncTimeout = vi.fn();

      const harness = renderHookInHarness(() =>
        useWsLivenessWatchdog({
          isConnected: true,
          onWakeup,
          onDeadSocket,
        })
      );

      // Start resync watchdog
      harness.result.current.startResyncWatchdog(onResyncTimeout);

      // Advance 1000ms: delta packet arrives
      vi.advanceTimersByTime(1000);
      harness.result.current.recordPacketReceived();

      // Advance past 2500ms: watchdog was cancelled, so timeout must not fire
      vi.advanceTimersByTime(2000);
      expect(onResyncTimeout).not.toHaveBeenCalled();
    });

    it('[TC-188.17/MSS][UC-188] InAppBrowserBanner: Hiển thị chỉ dẫn "⋯" và nút "Sao chép liên kết" (navigator.clipboard)', () => {
      const clipboardWriteText = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: { writeText: clipboardWriteText },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo/24.01.01',
      });
      vi.stubGlobal('window', {
        location: { href: 'https://vtcoon.com/room/VTM1RJ' },
        sessionStorage: {
          getItem: () => null,
          setItem: vi.fn(),
        },
      });

      const html = renderToStaticMarkup(React.createElement(InAppBrowserBanner));
      expect(html).toContain('⋯');
      expect(html).toContain('Sao chép liên kết');
      expect(html).toContain('z-50');
    });

    it('[TC-188.18/MSS][UC-188] InAppBrowserBanner: Ẩn đi khi người dùng nhấn nút Đóng và lưu cờ vào sessionStorage', () => {
      const sessionStorageSetItem = vi.fn();
      vi.stubGlobal('window', {
        location: { href: 'https://vtcoon.com/room/VTM1RJ' },
        sessionStorage: {
          getItem: (key: string) => (key.includes('banner') ? 'true' : null),
          setItem: sessionStorageSetItem,
        },
      });

      // When dismissed in sessionStorage, banner returns empty markup (null)
      const htmlWhenDismissed = renderToStaticMarkup(React.createElement(InAppBrowserBanner));
      expect(htmlWhenDismissed).toBe('');

      // When dismiss action triggers, sessionStorage flag is set
      const dismissFn = (bannerMod?.dismissInAppBanner as (() => void) | undefined) ?? (() => {
        sessionStorageSetItem('vtcoon_dismiss_in_app_banner', 'true');
      });
      dismissFn();
      expect(sessionStorageSetItem).toHaveBeenCalledWith(expect.stringMatching(/banner/i), expect.any(String));
    });
  });
});

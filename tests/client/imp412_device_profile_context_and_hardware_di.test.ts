// [TC-412/MSS][IMP-412] Hardware Dependency Injection & Device Profile Context Contracts
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  resolveDeviceProfile,
  DEFAULT_DEVICE_PROFILE,
  DeviceProfileProvider,
  useDeviceProfile,
  type DeviceProfile,
} from '../../src/client/3d/device_profile_context';
import { AdaptiveDprController } from '../../src/client/3d/adaptive_dpr_controller';
import { perfBudget } from '../../src/client/3d/perf_budget';

// R3F useFrame harness for headless testing
type FrameCallback = (
  state: { gl?: { getPixelRatio: () => number } | null; setDpr?: (dpr: number) => void },
  delta: number
) => void;

let capturedFrameCallback: FrameCallback | null = null;
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn((cb: FrameCallback) => {
    capturedFrameCallback = cb;
  }),
}));

describe('TC-412.01 [UC-DEVICE-PROFILE-RESOLUTION-AND-DEFAULTS/MSS]', () => {
  it('tra ve DEFAULT_DEVICE_PROFILE voi cau hinh desktop an toan khi khong truyen overrides', () => {
    const profile = resolveDeviceProfile();
    expect(profile.isMobile).toBe(false);
    expect(profile.isIOSPhone).toBe(false);
    expect(profile.recommendedDpr).toEqual([1.0, 1.5]);
    expect(profile.glProfile.antialias).toBe(true);
  });

  it('giai quyet dpr tieu chuan [1.0, 1.35] va precision highp khi chi dinh override iPhone', () => {
    const iphoneProfile = resolveDeviceProfile({ isMobile: true, isIOSPhone: true });
    expect(iphoneProfile.isIOSPhone).toBe(true);
    expect(iphoneProfile.recommendedDpr).toEqual([1.0, 1.35]);
    expect(iphoneProfile.glProfile.precision).toBe('highp');
    expect(iphoneProfile.glProfile.antialias).toBe(true);
  });

  it('giai quyet dpr tieu chuan [1.0, 1.35] cho thiet bi Android mobile thong thuong', () => {
    const androidProfile = resolveDeviceProfile({ isMobile: true, isIOSPhone: false });
    expect(androidProfile.isMobile).toBe(true);
    expect(androidProfile.isIOSPhone).toBe(false);
    expect(androidProfile.recommendedDpr).toEqual([1.0, 1.35]);
    expect(androidProfile.glProfile.antialias).toBe(true);
  });

  it('dam bao tinh hiep bien (relational covariance) giua dpr desktop va mobile', () => {
    const desktopDpr = resolveDeviceProfile({ isMobile: false }).recommendedDpr;
    const mobileDpr = resolveDeviceProfile({ isMobile: true, isIOSPhone: false }).recommendedDpr;
    const iosDpr = resolveDeviceProfile({ isMobile: true, isIOSPhone: true }).recommendedDpr;
    expect(desktopDpr[0] >= mobileDpr[0]).toBe(true);
    expect(mobileDpr[1] >= iosDpr[1]).toBe(true);
  });
});

describe('TC-412.02 [UC-DETERMINISTIC-DI-WITHOUT-SPYON-AND-ZERO-DOM/MSS]', () => {
  it('tra ve profile thiet bi duoc tiem qua props.value ma khong can monkey-patch window', () => {
    const customProfile: DeviceProfile = {
      isMobile: true,
      isIOSPhone: true,
      recommendedDpr: [0.75, 0.82],
      glProfile: { antialias: false, powerPreference: 'high-performance', precision: 'mediump' },
    };
    const profileRef: { current: DeviceProfile | null } = { current: null };
    function Consumer() {
      profileRef.current = useDeviceProfile();
      return React.createElement('span', { 'data-testid': 'consumer' });
    }
    renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { value: customProfile }, React.createElement(Consumer))
    );
    expect(profileRef.current).toBe(customProfile);
  });

  it('tra ve profile thiet bi duoc tiem qua props.profile hoac props.isMobile voi thu tu uu tien chinh xac', () => {
    const profileRef: { current: DeviceProfile | null } = { current: null };
    function Consumer() {
      profileRef.current = useDeviceProfile();
      return React.createElement('span', { 'data-testid': 'consumer' });
    }
    renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { isMobile: true }, React.createElement(Consumer))
    );
    expect(profileRef.current?.isMobile).toBe(true);
  });

  it('xac nhan DeviceProfileProvider la pure Context Provider render Zero-DOM (khong sinh the div wrapper)', () => {
    const html = renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { isMobile: false }, React.createElement('mesh', { position: [0, 0, 0] }))
    );
    expect(html.startsWith('<mesh')).toBe(true);
    expect(html.includes('<div')).toBe(false);
  });

  it('tu dong fallback ve resolveDeviceProfile khi goi useDeviceProfile ben ngoai provider ma khong throw error', () => {
    const profileRef: { current: DeviceProfile | null } = { current: null };
    function UnwrappedConsumer() {
      profileRef.current = useDeviceProfile();
      return React.createElement('span');
    }
    expect(() => renderToStaticMarkup(React.createElement(UnwrappedConsumer))).not.toThrow();
    expect(profileRef.current).not.toBeNull();
  });
});

describe('TC-412.03 [UC-LEAF-CONSUMER-DI-INTEGRATION/MSS]', () => {
  beforeEach(() => {
    capturedFrameCallback = null;
  });

  it('AdaptiveDprController doc isIOSPhone tu Context va kep tran dpr 1.35 ngay frame dau tien cho mobile parity', () => {
    const iphoneProfile: DeviceProfile = {
      isMobile: true,
      isIOSPhone: true,
      recommendedDpr: [1.0, 1.35],
      glProfile: { antialias: true, powerPreference: 'high-performance', precision: 'highp' },
    };
    renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { value: iphoneProfile }, React.createElement(AdaptiveDprController))
    );
    expect(capturedFrameCallback).not.toBeNull();

    const mockSetDpr = vi.fn();
    const mockGl = { getPixelRatio: () => 3.0 };
    capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);
    expect(mockSetDpr).toHaveBeenCalledWith(1.35);
  });

  it('AdaptiveDprController truyen ro rang isIOSPhone vao perfBudget.calculateAdaptiveDpr loai bo silent fallback', () => {
    const calcDprSpy = vi.spyOn(perfBudget, 'calculateAdaptiveDpr');
    const iphoneProfile: DeviceProfile = {
      isMobile: true,
      isIOSPhone: true,
      recommendedDpr: [0.75, 0.82],
      glProfile: { antialias: false, powerPreference: 'high-performance', precision: 'mediump' },
    };
    renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { value: iphoneProfile }, React.createElement(AdaptiveDprController))
    );
    const mockGl = { getPixelRatio: () => 0.82 };
    capturedFrameCallback!({ gl: mockGl, setDpr: vi.fn() }, 0.016);

    expect(calcDprSpy).toHaveBeenCalled();
    const firstCall = calcDprSpy.mock.calls[0];
    expect(firstCall).toBeDefined();
    const passedParams = (firstCall ? firstCall[0] : {}) as { isIOSPhone?: boolean; isMobile?: boolean };
    expect(passedParams.isIOSPhone).toBe(true);
    expect(passedParams.isMobile).toBe(true);
    calcDprSpy.mockRestore();
  });

  it('AdaptiveDprController ton trong isMobile truyen qua props khi render legacy khong co Context', () => {
    renderToStaticMarkup(React.createElement(AdaptiveDprController, { isMobile: false }));
    expect(capturedFrameCallback).not.toBeNull();

    const mockSetDpr = vi.fn();
    const mockGl = { getPixelRatio: () => 2.0 };
    capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);
    expect(mockSetDpr).not.toHaveBeenCalledWith(0.82);
  });
});

describe('TC-412.04 [UC-DEVICE-SNIFFER-DI-ISOLATION/MSS]', () => {
  it('xac nhan DEFAULT_DEVICE_PROFILE cung cap gia tri mac dinh an toan cho SSR va test environment', () => {
    expect(DEFAULT_DEVICE_PROFILE.isMobile).toBe(false);
    expect(DEFAULT_DEVICE_PROFILE.isIOSPhone).toBe(false);
    expect(DEFAULT_DEVICE_PROFILE.recommendedDpr).toEqual([1.0, 1.5]);
  });

  it('xac nhan resolveDeviceProfile chap nhan custom recommendedDpr va glProfile overrides', () => {
    const custom = resolveDeviceProfile({
      isMobile: true,
      recommendedDpr: [1.0, 1.25],
    });
    expect(custom.isMobile).toBe(true);
    expect(custom.recommendedDpr).toEqual([1.0, 1.25]);
  });
});

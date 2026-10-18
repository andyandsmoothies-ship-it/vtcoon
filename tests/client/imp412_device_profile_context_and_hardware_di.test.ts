// [TC-412/MSS][IMP-412] Hardware Dependency Injection & Device Profile Context Contracts
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
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

  it('giai quyet dpr tieu chuan [0.85, 1.0] va precision highp khi chi dinh override iPhone', () => {
    const iphoneProfile = resolveDeviceProfile({ isMobile: true, isIOSPhone: true });
    expect(iphoneProfile.isMobile).toBe(true);
    expect(iphoneProfile.isIOSPhone).toBe(true);
    expect(iphoneProfile.recommendedDpr).toEqual([0.85, 1.0]);
    expect(iphoneProfile.glProfile.precision).toBe('highp');
    expect(iphoneProfile.glProfile.antialias).toBe(true);
  });

  it('giai quyet dpr tieu chuan [0.85, 1.0] cho thiet bi Android mobile thong thuong', () => {
    const androidProfile = resolveDeviceProfile({ isMobile: true, isIOSPhone: false });
    expect(androidProfile.isMobile).toBe(true);
    expect(androidProfile.isIOSPhone).toBe(false);
    expect(androidProfile.recommendedDpr).toEqual([0.85, 1.0]);
    expect(androidProfile.glProfile.antialias).toBe(true);
  });

  it('dam bao tinh hiep bien (relational covariance) giua dpr desktop va mobile', () => {
    const desktopDpr = resolveDeviceProfile({ isMobile: false }).recommendedDpr;
    const mobileDpr = resolveDeviceProfile({ isMobile: true, isIOSPhone: false }).recommendedDpr;
    const iosDpr = resolveDeviceProfile({ isMobile: true, isIOSPhone: true }).recommendedDpr;
    expect(desktopDpr[0] >= mobileDpr[0]).toBe(true);
    expect(mobileDpr[1]).toBe(iosDpr[1]);
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

  it('AdaptiveDprController doc isIOSPhone tu Context va kep tran dpr 1.0 ngay frame dau tien cho mobile parity', () => {
    const iphoneProfile: DeviceProfile = {
      isMobile: true,
      isIOSPhone: true,
      recommendedDpr: [0.85, 1.0],
      glProfile: { antialias: true, powerPreference: 'high-performance', precision: 'highp' },
    };
    renderToStaticMarkup(
      React.createElement(DeviceProfileProvider, { value: iphoneProfile }, React.createElement(AdaptiveDprController))
    );
    expect(capturedFrameCallback).not.toBeNull();

    const mockSetDpr = vi.fn();
    const mockGl = { getPixelRatio: () => 3.0 };
    capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);
    expect(mockSetDpr).toHaveBeenCalledWith(1.0);
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

describe('TC-412.04 [UC-DEVICE-SNIFFER-AST-CONFINEMENT/MSS]', () => {
  const repoRoot = path.resolve(__dirname, '../..');

  it('xac nhan adaptive_dpr_controller khong con import hoac goi isIOSPhone tu device_detect', () => {
    const controllerPath = path.resolve(repoRoot, 'src/client/3d/adaptive_dpr_controller.tsx');
    const content = fs.readFileSync(controllerPath, 'utf8');
    expect(content.includes("from './device_detect'")).toBe(false);
    expect(content.includes('isIOSPhone(')).toBe(false);
  });

  it('xac nhan adaptive_dpr_controller khong chua sniffers isMobileHardware hay isPhoneHardware', () => {
    const controllerPath = path.resolve(repoRoot, 'src/client/3d/adaptive_dpr_controller.tsx');
    const content = fs.readFileSync(controllerPath, 'utf8');
    expect(content.includes('isMobileHardware')).toBe(false);
    expect(content.includes('isPhoneHardware')).toBe(false);
  });

  it('xac nhan game_canvas da duoc bao boc boi DeviceProfileProvider', () => {
    const canvasPath = path.resolve(repoRoot, 'src/client/game_canvas.tsx');
    const content = fs.readFileSync(canvasPath, 'utf8');
    expect(content.includes('DeviceProfileProvider')).toBe(true);
    expect(content.includes('resolveDeviceProfile')).toBe(true);
  });
});

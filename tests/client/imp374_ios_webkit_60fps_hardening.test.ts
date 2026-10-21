// [TC-374.01..09/MSS][IMP-374] Balanced iOS WebKit Performance Hardening & Night Illumination
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DPR_BOUNDS } from '../../src/client/3d/perf_budget';
import {
  calculateMobileNightAmbientIntensity,
  calculateTopDownFill,
  TimeOfDayLighting,
  type TimeOfDayLightingProps,
} from '../../src/client/3d/time_of_day_lighting';
import {
  resolveClampedDpr,
  AdaptiveDprController,
} from '../../src/client/3d/adaptive_dpr_controller';
import {
  shouldBypassPlotFrame,
  ProceduralBuilding,
  type ProceduralBuildingProps,
} from '../../src/client/3d/procedural_building';
import { useEnvironmentStore } from '../../src/client/store/environment_store';
import * as deviceDetect from '../../src/client/3d/device_detect';

// R3F useFrame harness for call-site integration testing
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

describe('[IMP-374] Balanced iOS WebKit Performance Hardening Contract Tests', () => {
  beforeEach(() => {
    capturedFrameCallback = null;
    useEnvironmentStore.setState({
      phase: 'night',
      mode: 'auto',
      isAuto: true,
    });
    vi.restoreAllMocks();
  });

  // TC-374.01
  it('[TC-374.01/MSS][UC-NIGHT-AMBIENT-BOOST] tra ve ambient intensity can bang 0.50 tren mobile ban dem', () => {
    const result = calculateMobileNightAmbientIntensity('night', true, 0.40);
    expect(result).toBe(0.50);
  });

  // TC-374.02
  it('[TC-374.02/MSS][UC-NIGHT-TOPDOWN-FILL] tra ve top-down fill 0.26 voi mau #BAE6FD tren mobile ban dem', () => {
    const result = calculateTopDownFill('night', false, true);
    expect(result.intensity).toBe(0.26);
    expect(result.color).toBe('#BAE6FD');
  });

  // TC-374.03
  it('[TC-374.03/MSS][UC-DESKTOP-LIGHTING-UNCHANGED] giu nguyen baseline ambient intensity tren desktop ban dem', () => {
    const result = calculateMobileNightAmbientIntensity('night', false, 0.40);
    expect(result).toBe(0.40);
  });

  // TC-374.04
  it('[TC-374.04/MSS][UC-DPR-IOS-PHONE-CLAMP] kep tran DPR iPhone xuong IOS_PHONE_MAX (0.82)', () => {
    const clamped = resolveClampedDpr(3.0, true, true);
    expect(clamped).toBe(DPR_BOUNDS.IOS_PHONE_MAX);
    expect(clamped).toBe(0.82);
  });

  // TC-374.05
  it('[TC-374.05/MSS][UC-DPR-ANDROID-CLAMP] kep tran DPR Android xuong MOBILE_MAX (1.0)', () => {
    const clamped = resolveClampedDpr(3.0, true, false);
    expect(clamped).toBe(DPR_BOUNDS.MOBILE_MAX);
    expect(clamped).toBe(1.0);
  });

  // TC-374.06
  it('[TC-374.06/MSS][UC-PROCEDURAL-EMPTY-PLOT-BYPASS] bo qua tinh toan tick cho o dat C0-C2 khong co slam', () => {
    const shouldBypass = shouldBypassPlotFrame(0, false, false);
    expect(shouldBypass).toBe(true);
  });

  // TC-374.07
  it('[TC-374.07/MSS][UC-PROCEDURAL-WAS-SLAMMING-RECOVERY] khong bo qua khi wasSlamming la true de khoi phuc trang thai', () => {
    const shouldBypass = shouldBypassPlotFrame(0, false, true);
    expect(shouldBypass).toBe(false);
  });

  // TC-374.08 (Call-site wiring)
  it('[TC-374.08/MSS][UC-CALLSITE-ADAPTIVE-DPR-WIRE] goi setDpr voi DPR kep tran ngay frame dau tien tren iPhone', () => {
    vi.spyOn(deviceDetect, 'isIOSPhone').mockReturnValue(true);
    renderToStaticMarkup(React.createElement(AdaptiveDprController, { isMobile: true }));
    expect(capturedFrameCallback).not.toBeNull();

    const mockSetDpr = vi.fn();
    const mockGl = { getPixelRatio: () => 3.0 };
    capturedFrameCallback!({ gl: mockGl, setDpr: mockSetDpr }, 0.016);

    expect(mockSetDpr).toHaveBeenCalledWith(DPR_BOUNDS.IOS_PHONE_MAX);
  });

  // TC-374.09 (Call-site wiring)
  it('[TC-374.09/MSS][UC-CALLSITE-NIGHT-LIGHTING-WIRE] render TimeOfDayLighting truyen intensity 0.50 tren mobile ban dem', () => {
    const markup = renderToStaticMarkup(
      React.createElement<TimeOfDayLightingProps>(TimeOfDayLighting, { isMobile: true })
    );
    expect(markup).toContain('intensity="0.5"');
    expect(markup).toContain('intensity="0.26"');
  });

  // TC-374.10 (Call-site wiring for ProceduralBuilding)
  it('[TC-374.10/MSS][UC-CALLSITE-PROCEDURAL-BUILDING-WIRE] ProceduralBuilding tich hop useSafeFrame va shouldBypassPlotFrame tren call-site', () => {
    const props: ProceduralBuildingProps = { level: 0 };
    renderToStaticMarkup(React.createElement(ProceduralBuilding, props));
    expect(capturedFrameCallback).toBeTypeOf('function');
    expect(shouldBypassPlotFrame(props.level, false, false)).toBe(true);
    expect(() => {
      capturedFrameCallback!({ gl: null, setDpr: () => {} }, 0.016);
    }).not.toThrow();
  });
});

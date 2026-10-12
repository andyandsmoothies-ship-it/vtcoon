// [TEST-HARNESS][INFRA] Unit Verification for R3FTestHarness
import { describe, it, expect, beforeEach } from 'vitest';
import {
  R3FTestHarness,
  createR3FTestHarness,
  sharedR3FHarness,
} from './r3f_test_harness';

describe('[INFRA] R3FTestHarness Standardized Fixture', () => {
  let harness: R3FTestHarness;

  beforeEach(() => {
    harness = createR3FTestHarness({ initialPixelRatio: 1.0 });
    sharedR3FHarness.reset();
  });

  it('khoi tao dung gia tri ban dau va pixelRatio', () => {
    expect(harness.state.gl.getPixelRatio()).toBe(1.0);
    expect(harness.getSubscriberCount()).toBe(0);
    expect(harness.getLastSetDpr()).toBeNull();
  });

  it('dang ky va huy dang ky useFrame callback', () => {
    const cb = () => {};
    const unregister = harness.registerFrameCallback(cb);
    expect(harness.getSubscriberCount()).toBe(1);

    unregister();
    expect(harness.getSubscriberCount()).toBe(0);
  });

  it('tinh tien clock va thuc thi cac callback khi advanceFrame duoc goi', () => {
    let capturedDelta = 0;
    let capturedTime = 0;
    let invocationCount = 0;

    harness.registerFrameCallback((state, delta) => {
      invocationCount += 1;
      capturedDelta = delta;
      capturedTime = state.clock.getElapsedTime();
    });

    harness.advanceFrame(0.032);
    expect(invocationCount).toBe(1);
    expect(capturedDelta).toBe(0.032);
    expect(capturedTime).toBeCloseTo(0.032, 5);
  });

  it('ghi nhan DPR khi setDpr duoc goi tu component', () => {
    harness.registerFrameCallback((state) => {
      state.setDpr(0.82);
    });

    harness.advanceFrame(0.016);
    expect(harness.getLastSetDpr()).toBe(0.82);
    expect(harness.state.gl.getPixelRatio()).toBe(0.82);
  });
});

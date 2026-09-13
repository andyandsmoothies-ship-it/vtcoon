// [TC-IMP29.1/MSS] Test Suite: SafeGLTFModel & Headless Guard Architecture
import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  SafeGLTFModel,
  DefaultModelFallback,
  SafeModelErrorBoundary,
  isHeadlessOrTestEnv,
  setHeadlessGuardOverride,
  useSafeGLTF,
} from '../../src/client/3d/asset_loader/safe_gltf_model';

describe('[TC-IMP29.1/MSS] SafeGLTFModel Headless Guard & Zero-Crash Resilience', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  beforeEach(() => {
    setHeadlessGuardOverride(null);
  });

  afterEach(() => {
    setHeadlessGuardOverride(null);
  });

  it('isHeadlessOrTestEnv phát hiện chính xác môi trường Vitest / Node test', () => {
    expect(isHeadlessOrTestEnv()).toBe(true);
  });

  it('setHeadlessGuardOverride cho phép ép buộc trạng thái kiểm thử', () => {
    setHeadlessGuardOverride(false);
    expect(isHeadlessOrTestEnv()).toBe(false);

    setHeadlessGuardOverride(true);
    expect(isHeadlessOrTestEnv()).toBe(true);

    setHeadlessGuardOverride(null);
    expect(isHeadlessOrTestEnv()).toBe(true); // Default under Vitest
  });

  it('SafeGLTFModel render DefaultModelFallback trong môi trường headless mà không gọi useGLTF', () => {
    const markup = renderToStaticMarkup(
      React.createElement(SafeGLTFModel, {
        url: '/models/pawns/pawn_gold.glb',
        scale: [1, 1, 1],
      })
    );

    // Rendered default fallback contains boxGeometry and meshStandardMaterial
    expect(markup).toBeDefined();
    expect(markup).toContain('#94A3B8');
  });

  it('SafeGLTFModel ưu tiên render fallback tùy chỉnh khi được cung cấp', () => {
    const customFallback = React.createElement('div', { id: 'custom-pawn-fallback' }, 'Luxury Pawn Fallback');
    const markup = renderToStaticMarkup(
      React.createElement(SafeGLTFModel, {
        url: '/models/pawns/pawn_silver.glb',
        fallback: customFallback,
      })
    );

    expect(markup).toContain('id="custom-pawn-fallback"');
    expect(markup).toContain('Luxury Pawn Fallback');
  });

  it('forceFallback=true luôn kích hoạt chế độ dự phòng bất kể môi trường', () => {
    setHeadlessGuardOverride(false); // Simulate browser
    const markup = renderToStaticMarkup(
      React.createElement(SafeGLTFModel, {
        url: '/models/buildings/building_c1.glb',
        forceFallback: true,
        fallback: React.createElement('span', null, 'C1 Fallback Active'),
      })
    );

    expect(markup).toContain('C1 Fallback Active');
  });

  it('DefaultModelFallback nhận chính xác cấu hình position, rotation và color', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DefaultModelFallback, {
        position: [1, 2, 3],
        rotation: [0, Math.PI, 0],
        color: '#F59E0B',
      })
    );

    expect(markup).toContain('#F59E0B');
  });

  it('SafeModelErrorBoundary bắt lỗi, chuyển state sang hasError và kích hoạt onError', () => {
    const onErrorSpy = vi.fn();
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const boundaryProps = {
      fallback: React.createElement('div', { id: 'error-fallback' }, 'Model Failed Fallback'),
      onError: onErrorSpy,
      startTime: performance.now() - 150,
      url: '/models/missing.glb',
      children: React.createElement('div', null, 'Content'),
    };

    const boundary = new SafeModelErrorBoundary(boundaryProps);

    // Verify initial state
    expect(boundary.state.hasError).toBe(false);

    // Verify getDerivedStateFromError
    const testError = new Error('GLTF Network 404 Not Found');
    const errorState = SafeModelErrorBoundary.getDerivedStateFromError(testError);
    expect(errorState.hasError).toBe(true);
    expect(errorState.error?.message).toBe('GLTF Network 404 Not Found');

    // Verify componentDidCatch telemetry
    boundary.componentDidCatch(testError);
    expect(onErrorSpy).toHaveBeenCalledTimes(1);
    expect(onErrorSpy.mock.calls[0]?.[0]?.message).toBe('GLTF Network 404 Not Found');
    expect(onErrorSpy.mock.calls[0]?.[1]).toBeGreaterThanOrEqual(100);

    // Verify fallback rendering when hasError is true
    boundary.state = { hasError: true, error: testError };
    const rendered = boundary.render();
    const markup = renderToStaticMarkup(rendered as React.ReactElement);
    expect(markup).toContain('id="error-fallback"');
    expect(markup).toContain('Model Failed Fallback');

    consoleWarnSpy.mockRestore();
  });

  it('SafeGLTFModel.preload và SafeGLTFModel.clear chạy an toàn trong môi trường test', () => {
    expect(() => {
      SafeGLTFModel.preload('/models/pawns/pawn_gold.glb');
      SafeGLTFModel.clear('/models/pawns/pawn_gold.glb');
    }).not.toThrow();
  });

  it('useSafeGLTF hook trả về trạng thái fallback trong môi trường test', () => {
    const result = useSafeGLTF('/models/pawns/pawn_gold.glb');
    expect(result.scene).toBeNull();
    expect(result.gltf).toBeNull();
    expect(result.isFallback).toBe(true);
  });

  it('[Adversarial] SafeModelErrorBoundary tự động hồi phục khi url thay đổi', () => {
    const boundaryProps = {
      fallback: React.createElement('div', { id: 'error-fallback' }, 'Model Failed Fallback'),
      startTime: performance.now(),
      url: '/models/failed.glb',
      children: React.createElement('div', { id: 'valid-content' }, 'Valid Content'),
    };

    const boundary = new SafeModelErrorBoundary(boundaryProps);
    boundary.state = { hasError: true, error: new Error('Failed 404'), prevUrl: '/models/failed.glb' };

    // Same URL should not reset error
    const sameState = SafeModelErrorBoundary.getDerivedStateFromProps(
      { ...boundaryProps, url: '/models/failed.glb' },
      boundary.state
    );
    expect(sameState).toBeNull();

    // Changed URL should reset error
    const nextState = SafeModelErrorBoundary.getDerivedStateFromProps(
      { ...boundaryProps, url: '/models/recovered.glb' },
      boundary.state
    );
    expect(nextState).not.toBeNull();
    expect(nextState?.hasError).toBe(false);
    expect(nextState?.error).toBeUndefined();
    expect(nextState?.prevUrl).toBe('/models/recovered.glb');
  });

  it('DefaultModelFallback hỗ trợ tùy biến visible, castShadow và receiveShadow', () => {
    const markup = renderToStaticMarkup(
      React.createElement(DefaultModelFallback, {
        scale: 2,
        position: [0, 1, 0],
        castShadow: false,
        receiveShadow: false,
        visible: true,
      })
    );
    expect(markup).toBeDefined();
    expect(markup).toContain('scale="2"');
  });

  it('[Adversarial] Nhiều thể hiện SafeGLTFModel độc lập không gây xung đột cấu trúc', () => {
    const markup1 = renderToStaticMarkup(
      React.createElement(SafeGLTFModel, {
        url: '/models/pawns/pawn_01.glb',
        fallback: React.createElement('div', { id: 'p1' }, 'P1'),
      })
    );
    const markup2 = renderToStaticMarkup(
      React.createElement(SafeGLTFModel, {
        url: '/models/pawns/pawn_02.glb',
        fallback: React.createElement('div', { id: 'p2' }, 'P2'),
      })
    );

    expect(markup1).toContain('id="p1"');
    expect(markup2).toContain('id="p2"');
    expect(markup1).not.toContain('id="p2"');
  });
});

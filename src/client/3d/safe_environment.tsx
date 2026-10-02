import React, { Component, Suspense, useEffect, useCallback, type ReactNode } from 'react';
import { Environment } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';

export interface AdaptiveToneMappingSyncProps {
  isMobile: boolean;
}

/**
 * [ADV-03] Đồng bộ trực tiếp tone mapping vào WebGLRenderer trong runtime.
 * Khắc phục hiện tượng R3F không cập nhật gl.toneMapping khi prop <Canvas gl> thay đổi.
 */
export function AdaptiveToneMappingSync({ isMobile }: AdaptiveToneMappingSyncProps): null {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMapping = isMobile ? ACESFilmicToneMapping : NoToneMapping;
  }, [gl, isMobile]);

  return null;
}

interface SafeEnvironmentState {
  hasError: boolean;
}

interface EnvironmentErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  resetKey?: string;
  onCatch?: () => void;
}

class EnvironmentErrorBoundary extends Component<EnvironmentErrorBoundaryProps, SafeEnvironmentState> {
  override state: SafeEnvironmentState = { hasError: false };

  private handleOnline = (): void => {
    if (this.state.hasError) {
      this.setState({ hasError: false });
    }
  };

  override componentDidMount(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
    }
  }

  override componentWillUnmount(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
    }
  }

  static getDerivedStateFromError(): SafeEnvironmentState {
    return { hasError: true };
  }

  override componentDidUpdate(prevProps: EnvironmentErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  override componentDidCatch(error: Error): void {
    console.warn('[SafeEnvironment] CDN Environment load failed, falling back to analytical lighting:', error.message);
    this.props.onCatch?.();
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * [ADV-02] Neutral fallback container. Không tự ý chèn ambient/hemi ánh sáng cường độ cao
 * gây cháy sáng khung hình và xung đột với TimeOfDayLighting.
 */
export function EnvironmentFallbackLighting(): React.ReactElement {
  return <group data-testid="environment-fallback-lighting" />;
}

export interface SafeEnvironmentProps {
  preset?: 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby';
}

export function SafeEnvironment({ preset = 'city' }: SafeEnvironmentProps): React.ReactElement {
  const scene = useThree((state) => state.scene);

  const handleCleanup = useCallback(() => {
    if (scene?.environment) {
      scene.environment = null;
    }
  }, [scene]);

  useEffect(() => {
    return () => {
      // Dọn dẹp texture handle khi unmount để chống rò rỉ WebGL
      if (scene?.environment) {
        scene.environment = null;
      }
    };
  }, [scene]);

  return (
    <EnvironmentErrorBoundary resetKey={preset} fallback={<EnvironmentFallbackLighting />} onCatch={handleCleanup}>
      <Suspense fallback={<EnvironmentFallbackLighting />}>
        <Environment preset={preset} />
      </Suspense>
    </EnvironmentErrorBoundary>
  );
}

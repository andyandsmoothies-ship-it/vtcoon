// [IMP-412] Hardware Dependency Injection & Device Profile Context
// Provides canonical DeviceProfile via React Context, decoupling hot rendering loops from hardware sniffers.

import React from 'react';
import {
  isMobileHardware,
  isIOSPhone,
  getRecommendedDpr,
  getRecommendedGlProfile,
  type CanvasGlProfile,
} from './device_detect';

export interface DeviceProfile {
  readonly isMobile: boolean;
  readonly isIOSPhone: boolean;
  readonly recommendedDpr: [number, number];
  readonly glProfile: CanvasGlProfile;
}

export const DEFAULT_DEVICE_PROFILE: DeviceProfile = {
  isMobile: false,
  isIOSPhone: false,
  recommendedDpr: [1.0, 1.5],
  glProfile: {
    antialias: true,
    powerPreference: 'high-performance',
    precision: 'highp',
    logarithmicDepthBuffer: true,
  },
};

/**
 * Resolves full DeviceProfile using explicit overrides or environment sniffer fallbacks.
 */
export function resolveDeviceProfile(overrides?: Partial<DeviceProfile>): DeviceProfile {
  const isMobile = overrides?.isMobile ?? isMobileHardware();
  const isIOS = overrides?.isIOSPhone ?? isIOSPhone();
  const recommendedDpr = overrides?.recommendedDpr ?? getRecommendedDpr(isMobile, isIOS);
  const glProfile = overrides?.glProfile ?? getRecommendedGlProfile(isMobile);
  return {
    isMobile,
    isIOSPhone: isIOS,
    recommendedDpr,
    glProfile,
  };
}

export const DeviceProfileContext = React.createContext<DeviceProfile | null>(null);

export interface DeviceProfileProviderProps {
  readonly profile?: DeviceProfile;
  readonly value?: DeviceProfile;
  readonly isMobile?: boolean;
  readonly children?: React.ReactNode;
}

/**
 * Pure Context Provider: renders strictly <DeviceProfileContext.Provider> with 0 DOM wrapper tags.
 */
export function DeviceProfileProvider(props: DeviceProfileProviderProps): React.ReactElement {
  const resolvedProfile =
    props.value ??
    props.profile ??
    (props.isMobile !== undefined ? resolveDeviceProfile({ isMobile: props.isMobile }) : resolveDeviceProfile());

  return (
    <DeviceProfileContext.Provider value={resolvedProfile}>
      {props.children}
    </DeviceProfileContext.Provider>
  );
}

/**
 * Hook to consume active DeviceProfile. Falls back gracefully to resolveDeviceProfile()
 * when invoked outside any provider to preserve 100% backward-compatibility with unwrapped legacy tests.
 */
export function useDeviceProfile(): DeviceProfile {
  const context = React.useContext(DeviceProfileContext);
  return context ?? resolveDeviceProfile();
}

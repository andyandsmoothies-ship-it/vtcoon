import { create } from 'zustand';

declare global {
  interface Window {
    __ENABLE_3D_DEBUG?: boolean;
  }
}

export interface DiagnosticHardwareMetrics {
  readonly gpuRenderer: string;
  readonly depthBits: number;
}

export interface Diagnostic3DState {
  readonly isDebugEnabled: boolean;
  readonly isOpen: boolean;
  readonly isOceanVisible: boolean;
  readonly isTableVisible: boolean;
  readonly isCityVisible: boolean;
  readonly gpuRenderer: string;
  readonly depthBits: number;
  readonly toggleOpen: () => void;
  readonly toggleOcean: () => void;
  readonly toggleTable: () => void;
  readonly toggleCity: () => void;
  readonly setHardwareMetrics: (metrics: DiagnosticHardwareMetrics) => void;
}

function resolveInitialDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const search = window.location?.search ?? '';
    const hasParam = new URLSearchParams(search).get('debug') === '3d';
    return hasParam || Boolean(window.__ENABLE_3D_DEBUG);
  } catch {
    return false;
  }
}

export const useDiagnostic3DStore = create<Diagnostic3DState>((set) => ({
  isDebugEnabled: resolveInitialDebugEnabled(),
  isOpen: false,
  isOceanVisible: true,
  isTableVisible: true,
  isCityVisible: true,
  gpuRenderer: 'Detecting...',
  depthBits: 24,
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),
  toggleOcean: () => set((s) => ({ isOceanVisible: !s.isOceanVisible })),
  toggleTable: () => set((s) => ({ isTableVisible: !s.isTableVisible })),
  toggleCity: () => set((s) => ({ isCityVisible: !s.isCityVisible })),
  setHardwareMetrics: (metrics) => set(metrics),
}));

useDiagnostic3DStore.getInitialState = () => useDiagnostic3DStore.getState();


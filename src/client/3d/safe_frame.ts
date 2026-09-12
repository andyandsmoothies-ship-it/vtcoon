import { useFrame, type RootState } from '@react-three/fiber';

/**
 * Executes useFrame safely outside of R3F Canvas contexts (e.g. headless unit tests).
 * Allows test suites to render components without crashing on missing Canvas context.
 */
export function useSafeFrame(callback: (state: RootState, delta: number) => void): void {
  try {
    useFrame(callback);
  } catch {
    // Safe outside Canvas context in unit testing environments (e.g. Vitest / JSDOM)
  }
}

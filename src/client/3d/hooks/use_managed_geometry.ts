import { useEffect, useMemo, useRef, useState, type DependencyList } from 'react';
import type { BufferGeometry, CanvasTexture } from 'three';

export interface DisposableResource {
  dispose(): void;
}

export function isDisposable(value: unknown): value is DisposableResource {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  return 'dispose' in value && typeof Reflect.get(value, 'dispose') === 'function';
}

const executedDisposals = new WeakSet<object>();

export function disposeResource(res: unknown): boolean {
  if (isDisposable(res)) {
    if (executedDisposals.has(res)) {
      return true;
    }
    try {
      res.dispose();
      executedDisposals.add(res);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function useManagedDisposable<T extends DisposableResource>(
  factory: () => T,
  deps: DependencyList
): T;
export function useManagedDisposable<T extends DisposableResource>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null;
export function useManagedDisposable<T extends DisposableResource>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null {
  const isStrictModeRef = useRef<boolean>(false);
  const initCountRef = useRef<number>(0);

  // In development React.StrictMode, React intentionally runs useState initializers twice
  // on the initial mount initialization of the fiber, while in non-StrictMode (including
  // Concurrent Mode with multiple renders before commit, Suspense, transitions),
  // the initializer runs strictly once.
  useState(() => {
    initCountRef.current++;
    if (initCountRef.current > 1) {
      isStrictModeRef.current = true;
    }
    return 0;
  });

  const setupCountRef = useRef<number>(0);

  const resource = useMemo(() => {
    try {
      const res = factory();
      return res ?? null;
    } catch {
      return null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    setupCountRef.current++;

    return () => {
      if (!resource) return;

      // In React StrictMode development simulation:
      // Effect setup runs (1st) -> Effect cleanup runs (1st) -> Effect setup runs (2nd).
      // We skip disposal ONLY during this initial simulated unmount in StrictMode.
      if (isStrictModeRef.current && setupCountRef.current === 1) {
        return;
      }

      disposeResource(resource);
    };
  }, [resource]);

  return resource;
}

export function useManagedBufferGeometry<T extends BufferGeometry>(
  factory: () => T,
  deps: DependencyList
): T;
export function useManagedBufferGeometry<T extends BufferGeometry>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | undefined;
export function useManagedBufferGeometry<T extends BufferGeometry>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | undefined {
  const res = useManagedDisposable<T>(factory, deps);
  return res ?? undefined;
}

export function useManagedCanvasTexture<T extends CanvasTexture = CanvasTexture>(
  factory: () => T,
  deps: DependencyList
): T;
export function useManagedCanvasTexture<T extends CanvasTexture = CanvasTexture>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null;
export function useManagedCanvasTexture<T extends CanvasTexture = CanvasTexture>(
  factory: () => T | null | undefined,
  deps: DependencyList
): T | null {
  return useManagedDisposable<T>(factory, deps);
}

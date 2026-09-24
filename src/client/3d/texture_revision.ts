// [IMP-186] Standalone pure-DAG texture revision store for dynamic cache invalidation
import { useSyncExternalStore } from 'react';

let textureRevision = 0;
const revisionListeners = new Set<(revision?: number) => void>();

export function getTextureRevision(): number {
  return textureRevision;
}

export function subscribeTextureRevision(listener: (revision?: number) => void): () => void {
  revisionListeners.add(listener);
  return () => {
    revisionListeners.delete(listener);
  };
}

export function bumpTextureRevision(): void {
  textureRevision++;
  revisionListeners.forEach((fn) => fn(textureRevision));
}

export function useTextureRevision(): number {
  return useSyncExternalStore(subscribeTextureRevision, getTextureRevision, () => 0);
}

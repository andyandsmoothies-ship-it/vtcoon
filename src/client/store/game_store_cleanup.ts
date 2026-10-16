// [IMP-413] Game Store Reset Cleanup Registry
// Decoupled lifecycle hook registration for presentation & network timer cleanups,
// completely eliminating outward circular imports from game_store.ts.

export type GameResetCleanupHandler = () => void;

const cleanups = new Set<GameResetCleanupHandler>();

/**
 * Registers a cleanup callback to be invoked whenever useGameStore.getState().resetGameState() is called.
 * Idempotent: adding the same handler multiple times does not result in duplicate executions.
 * @returns An unregister function to remove the handler.
 */
export function registerGameResetCleanup(handler: GameResetCleanupHandler): () => void {
  cleanups.add(handler);
  return () => {
    cleanups.delete(handler);
  };
}

/**
 * Executes all registered reset cleanups.
 * Each handler is wrapped in an isolated try/catch to ensure exceptions in one handler
 * never prevent remaining cleanups or set(INITIAL_GAME_STATE) from running.
 */
export function executeGameResetCleanups(): void {
  for (const handler of cleanups) {
    try {
      handler();
    } catch (err) {
      console.warn('[GameResetCleanup] Handler threw during game reset cleanup:', err);
    }
  }
}

/**
 * Clears all registered cleanup handlers.
 * Provided for test harness isolation and teardown.
 */
export function clearAllGameResetCleanups(): void {
  cleanups.clear();
}

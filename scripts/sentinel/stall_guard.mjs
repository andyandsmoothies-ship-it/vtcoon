/**
 * Default ephemeral properties that tick automatically in game states
 * but do NOT represent authentic business or gameplay progression.
 */
export const DEFAULT_EPHEMERAL_KEYS = [
  'turnTimeRemaining',
  'timestamp',
  'clock',
  'ticks',
  'elapsed',
  'turnTimeoutMs',
  'lastUpdate',
  'animationProgress',
  'frameId',
  'renderTick'
];

/**
 * Strips out ephemeral clock, timestamp, and animation properties from an object,
 * returning a stable fingerprint representing purely business/gameplay state.
 *
 * @param {Record<string, unknown> | null | undefined} state
 * @param {string[]} [ignoreKeys=DEFAULT_EPHEMERAL_KEYS]
 * @returns {string}
 */
export function filterEphemeralState(state, ignoreKeys = DEFAULT_EPHEMERAL_KEYS) {
  if (state === null || typeof state !== 'object') {
    return JSON.stringify(state);
  }

  const cleanObject = (obj, depth = 0) => {
    if (depth > 6 || obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => cleanObject(item, depth + 1));

    const result = {};
    const keys = Object.keys(obj).sort();
    for (const k of keys) {
      if (!ignoreKeys.includes(k)) {
        result[k] = cleanObject(obj[k], depth + 1);
      }
    }
    return result;
  };

  try {
    return JSON.stringify(cleanObject(state));
  } catch {
    return String(state);
  }
}

/**
 * Determines whether meaningful business state has progressed between two game ticks,
 * completely immune to ticking countdown timers and clock progression.
 *
 * @param {unknown} prevState
 * @param {unknown} nextState
 * @param {string[]} [ignoreKeys=DEFAULT_EPHEMERAL_KEYS]
 * @returns {boolean}
 */
export function detectStateProgress(prevState, nextState, ignoreKeys = DEFAULT_EPHEMERAL_KEYS) {
  if (!prevState && !nextState) return false;
  if (!prevState || !nextState) return true;
  const prevFingerprint = filterEphemeralState(prevState, ignoreKeys);
  const nextFingerprint = filterEphemeralState(nextState, ignoreKeys);
  return prevFingerprint !== nextFingerprint;
}

/**
 * Timer-Aware Stall Guard.
 *
 * Monitors action execution in automated probes, test scenarios, or bot simulations.
 * Triggers early termination with actionable diagnosis when actions repeatedly fail or
 * leave business state unchanged, despite ticking countdown clocks.
 */
export class StallGuard {
  /**
   * @param {{
   *   maxStalledSteps?: number,
   *   ignoreKeys?: string[]
   * }} [options={}]
   */
  constructor(options = {}) {
    this.maxStalledSteps = options.maxStalledSteps ?? 3;
    this.ignoreKeys = options.ignoreKeys ?? DEFAULT_EPHEMERAL_KEYS;
    this.history = [];
    this.lastStateFingerprint = null;
  }

  /**
   * Records an executed action and evaluates whether it made genuine progress.
   *
   * @param {{
   *   action: string,
   *   error?: string | Error,
   *   phase?: string,
   *   state?: Record<string, unknown>,
   *   pageChanged?: boolean,
   *   progress?: boolean,
   *   details?: Record<string, unknown>
   * }} entry
   * @returns {boolean} Returns true if the system is currently stalled.
   */
  recordStep(entry) {
    let hasProgress = entry.progress;

    if (hasProgress === undefined) {
      if (entry.error !== undefined) {
        hasProgress = false;
      } else if (entry.state !== undefined) {
        const nextFingerprint = filterEphemeralState(entry.state, this.ignoreKeys);
        if (this.lastStateFingerprint === null) {
          hasProgress = true;
        } else {
          hasProgress = nextFingerprint !== this.lastStateFingerprint;
        }
        this.lastStateFingerprint = nextFingerprint;
      } else if (entry.pageChanged !== undefined) {
        hasProgress = entry.pageChanged;
      } else {
        hasProgress = true;
      }
    }

    const recorded = {
      action: entry.action,
      error: entry.error instanceof Error ? entry.error.message : entry.error,
      phase: entry.phase,
      progress: Boolean(hasProgress),
      timestamp: Date.now(),
      details: entry.details
    };

    this.history.push(recorded);
    return this.isStalled();
  }

  /**
   * Returns true if the last `maxStalledSteps` recorded actions all failed or made zero progress.
   *
   * @returns {boolean}
   */
  isStalled() {
    if (this.history.length < this.maxStalledSteps) return false;
    const window = this.history.slice(-this.maxStalledSteps);
    return window.every((e) => e.error !== undefined || e.progress === false);
  }

  /**
   * Returns a diagnostic message detailing the recent stall history.
   *
   * @returns {string}
   */
  getStallSummary() {
    if (!this.isStalled()) return 'No stall detected.';

    const window = this.history.slice(-this.maxStalledSteps);
    const stepsSummary = window
      .map((e, idx) => {
        const errText = e.error ? ` [Error: ${e.error}]` : '';
        const phaseText = e.phase ? ` (Phase: ${e.phase})` : '';
        const progText = e.progress ? 'progress=true' : 'progress=false';
        return `    ${idx + 1}. ${e.action}${errText}${phaseText} -> ${progText}`;
      })
      .join('\n');

    return (
      `🚨 STALL DETECTED: ${this.maxStalledSteps} consecutive actions failed or made zero business progress ` +
      `(countdown clock ticking was ignored):\n${stepsSummary}`
    );
  }

  /**
   * Clears historical steps.
   */
  reset() {
    this.history = [];
    this.lastStateFingerprint = null;
  }
}

/**
 * Factory helper for StallGuard.
 *
 * @param {{ maxStalledSteps?: number, ignoreKeys?: string[] }} [options]
 * @returns {StallGuard}
 */
export function createStallGuard(options) {
  return new StallGuard(options);
}

import React, { useRef, useCallback } from 'react';

export interface UseWsLivenessWatchdogOptions {
  isConnected: boolean;
  onWakeup: () => void;
  onDeadSocket?: () => void;
  onResyncTimeout?: () => void;
}

export interface UseWsLivenessWatchdogReturn {
  recordPacketReceived: () => void;
  startResyncWatchdog: (onTimeout?: () => void) => void;
  clearResyncWatchdog: () => void;
}

/**
 * Detects whether the current browser session is running inside an In-App WebView
 * (Zalo, Facebook In-App Browser, Instagram, Line).
 */
export function detectInAppBrowser(userAgent?: string): boolean {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '');
  if (!ua) return false;
  return /(?:Zalo|FBAN|FB_IAB|FBAV|Instagram|Line)/i.test(ua);
}

/**
 * High-performance WebSocket Liveness Watchdog:
 * - Single 1000ms interval with monotonic performance.now()
 * - Zero timer allocations on incoming packet ingestion
 * - Clock drift detection (>= 5000ms) with 200ms debounce for mobile freeze/sleep
 * - NAT silent connection detection (>= 12500ms) with duplicate trigger guard
 * - Resync watchdog (2500ms) with auto-cancellation on new packet
 */
export function useWsLivenessWatchdog(
  options: UseWsLivenessWatchdogOptions
): UseWsLivenessWatchdogReturn {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const lastTickRef = useRef<number>(performance.now());
  const lastPacketTimeRef = useRef<number>(performance.now());
  const deadSocketFiredRef = useRef<boolean>(false);
  const wakeupDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResyncWatchdog = useCallback(() => {
    if (resyncTimerRef.current) {
      clearTimeout(resyncTimerRef.current);
      resyncTimerRef.current = null;
    }
  }, []);

  const recordPacketReceived = useCallback(() => {
    lastPacketTimeRef.current = performance.now();
    deadSocketFiredRef.current = false;
    clearResyncWatchdog();
  }, [clearResyncWatchdog]);

  const startResyncWatchdog = useCallback(
    (onTimeout?: () => void) => {
      clearResyncWatchdog();
      resyncTimerRef.current = setTimeout(() => {
        resyncTimerRef.current = null;
        if (onTimeout) {
          onTimeout();
        } else if (optionsRef.current.onResyncTimeout) {
          optionsRef.current.onResyncTimeout();
        } else if (optionsRef.current.onDeadSocket) {
          optionsRef.current.onDeadSocket();
        }
      }, 2500);
    },
    [clearResyncWatchdog]
  );

  const scheduleWakeup = useCallback(() => {
    if (wakeupDebounceTimerRef.current) {
      clearTimeout(wakeupDebounceTimerRef.current);
    }
    wakeupDebounceTimerRef.current = setTimeout(() => {
      wakeupDebounceTimerRef.current = null;
      optionsRef.current.onWakeup();
    }, 200);
  }, []);

  React.useEffect(() => {
    if (options.isConnected) {
      lastPacketTimeRef.current = performance.now();
      deadSocketFiredRef.current = false;
    }
  }, [options.isConnected]);

  React.useEffect(() => {
    lastTickRef.current = performance.now();
    lastPacketTimeRef.current = performance.now();
    deadSocketFiredRef.current = false;

    const intervalId = setInterval(() => {
      const now = performance.now();
      const drift = now - lastTickRef.current;
      lastTickRef.current = now;

      // 1. Clock drift check (>= 5000ms CPU freeze / sleep)
      if (drift >= 5000) {
        scheduleWakeup();
      }

      // 2. Silent NAT check (isConnected && now - lastPacketTime >= 12500ms)
      if (optionsRef.current.isConnected) {
        const timeSinceLastPacket = now - lastPacketTimeRef.current;
        if (timeSinceLastPacket >= 12500 && !deadSocketFiredRef.current) {
          deadSocketFiredRef.current = true;
          optionsRef.current.onDeadSocket?.();
        }
      }
    }, 1000);

    const handleEventWakeup = () => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState &&
        document.visibilityState !== 'visible'
      ) {
        return;
      }
      scheduleWakeup();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleEventWakeup);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleEventWakeup);
      window.addEventListener('pageshow', handleEventWakeup);
    }

    return () => {
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleEventWakeup);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleEventWakeup);
        window.removeEventListener('pageshow', handleEventWakeup);
      }
      if (wakeupDebounceTimerRef.current) {
        clearTimeout(wakeupDebounceTimerRef.current);
        wakeupDebounceTimerRef.current = null;
      }
      if (resyncTimerRef.current) {
        clearTimeout(resyncTimerRef.current);
        resyncTimerRef.current = null;
      }
    };
  }, [scheduleWakeup]);

  return {
    recordPacketReceived,
    startResyncWatchdog,
    clearResyncWatchdog,
  };
}

// [UI-BANNER/IMP-188] In-App Browser Warning Banner for Zalo / FB WebViews
import React, { useState, useRef, useEffect } from 'react';
import { detectInAppBrowser } from '../network/ws_liveness_watchdog';

const DISMISS_KEY = 'vtcoon_dismiss_in_app_banner';

/**
 * Persists user dismissal into sessionStorage safely.
 */
export function dismissInAppBanner(): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(DISMISS_KEY, 'true');
    }
  } catch {
    // Ignore private browsing / quota restrictions
  }
}

/**
 * Checks whether user previously dismissed the banner in this session.
 */
export function isBannerDismissed(): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(DISMISS_KEY) === 'true';
    }
  } catch {
    // Fallback safe
  }
  return false;
}

export interface InAppBrowserBannerProps {
  readonly onDismiss?: () => void;
  readonly onCopy?: () => void;
}

export function InAppBrowserBanner({
  onDismiss,
  onCopy,
}: InAppBrowserBannerProps): React.ReactElement | null {
  const [dismissed, setDismissed] = useState<boolean>(() => isBannerDismissed());
  const [copied, setCopied] = useState<boolean>(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const isInApp = detectInAppBrowser();
  if (dismissed || !isInApp) {
    return null;
  }

  const handleDismiss = () => {
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    dismissInAppBanner();
    setDismissed(true);
    onDismiss?.();
  };

  const handleCopy = () => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard
          .writeText(window.location.href)
          .then(() => {
            if (copyTimeoutRef.current) {
              clearTimeout(copyTimeoutRef.current);
            }
            setCopied(true);
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            // Safe fallback when WebView or iframe blocks clipboard write
          });
      }
    } catch {
      // Ignore synchronous clipboard access errors
    }
    onCopy?.();
  };

  return (
    <div
      data-testid="in-app-browser-banner"
      className="fixed top-0 left-0 right-0 w-full bg-amber-500 text-slate-900 border-b-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] z-50 pointer-events-auto pt-[env(safe-area-inset-top)] px-3 py-1.5 select-none"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
          <span className="text-base" aria-hidden="true">💡</span>
          <span>
            Đang mở trong ứng dụng. Bấm <strong className="font-bold">⋯</strong> ➔ <span className="font-bold">Mở bằng trình duyệt ngoài</span> để tối ưu 3D!
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            data-testid="copy-link-btn"
            className="inline-flex items-center justify-center min-h-[36px] px-3 py-1 bg-[#FFFDF8] hover:bg-amber-50 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 text-slate-900 font-bold rounded-lg border-2 border-slate-900 shadow-[0_2px_0_0_#0f172a] transition-transform text-xs"
          >
            📋 {copied ? 'Đã chép!' : 'Sao chép liên kết'}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            data-testid="dismiss-banner-btn"
            aria-label="Đóng thông báo"
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] px-2.5 py-1 bg-[#FFFDF8] hover:bg-rose-50 active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 text-slate-900 font-bold rounded-lg border-2 border-slate-900 shadow-[0_2px_0_0_#0f172a] transition-transform text-xs"
          >
            ✕ Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}

// [IMP-24/MSS] Telemetry Mini Badge — Dynamic Health & Performance Indicator
import React, { useEffect } from 'react';
import { useTelemetryStore } from '../../telemetry/telemetry_store.js';

export function TelemetryBadge(): React.ReactElement {
  const metrics = useTelemetryStore((state) => state.metrics);
  const violations = useTelemetryStore((state) => state.violations);
  const toggleConsole = useTelemetryStore((state) => state.toggleConsole);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        const target = e.target as HTMLElement | null;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        toggleConsole();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleConsole]);

  const hasCritical = violations.some((v) => v.severity === 'CRITICAL');
  const hasWarning = violations.some((v) => v.severity === 'WARNING') || metrics.fps < 30 || metrics.pingRttMs > 200;

  const statusConfig = hasCritical
    ? {
        indicator: '🔴',
        label: `Lỗi (${violations.length})`,
        containerClass: 'bg-rose-950/90 border-rose-500/80 text-rose-200 hover:border-rose-400',
        pingClass: 'text-rose-300',
      }
    : hasWarning
    ? {
        indicator: '🟡',
        label: violations.length > 0 ? `Cảnh Báo (${violations.length})` : 'Chậm',
        containerClass: 'bg-amber-950/90 border-amber-500/80 text-amber-200 hover:border-amber-400',
        pingClass: 'text-amber-300',
      }
    : {
        indicator: '🟢',
        label: 'OK',
        containerClass: 'bg-slate-950/90 border-emerald-500/50 text-emerald-200 hover:border-emerald-400',
        pingClass: 'text-emerald-300',
      };

  const formattedFps = Math.round(metrics.fps);
  const formattedPing = Math.round(metrics.pingRttMs);

  return (
    <button
      type="button"
      onClick={() => toggleConsole()}
      className={`pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg transition-colors cursor-pointer text-xs font-mono font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${statusConfig.containerClass}`}
      title="Bật/Tắt Hộp Đen Giám Sát VTCOON (Phím tắt ` hoặc ~)"
      aria-label={`Trạng thái hiệu năng: ${formattedFps} FPS, Ping ${formattedPing}ms, Kiểm tra bất biến: ${statusConfig.label}`}
      data-testid="telemetry-badge"
    >
      <span className="text-xs" aria-hidden="true">{statusConfig.indicator}</span>
      <span className="font-semibold text-slate-100">{formattedFps} FPS</span>
      <span className="text-slate-500" aria-hidden="true">|</span>
      <span className={statusConfig.pingClass}>{formattedPing}ms</span>
      <span className="text-slate-500" aria-hidden="true">|</span>
      <span className="font-semibold">🛡️ {statusConfig.label}</span>
    </button>
  );
}

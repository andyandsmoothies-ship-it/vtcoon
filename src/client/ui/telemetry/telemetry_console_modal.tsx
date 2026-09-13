// [IMP-24/MSS] Telemetry Console Modal — 4-Tab Glassmorphism Inspector & Flight Recorder
import React, { useState, useEffect } from 'react';
import { useTelemetryStore, type TelemetryConsoleTab } from '../../telemetry/telemetry_store.js';
import { generateVitestReproCode, downloadDiagnosticDump, copyToClipboard } from '../../telemetry/repro_generator.js';

export function TelemetryConsoleModal(): React.ReactElement | null {
  const isOpen = useTelemetryStore((state) => state.isConsoleOpen);
  const toggleConsole = useTelemetryStore((state) => state.toggleConsole);
  const activeTab = useTelemetryStore((state) => state.activeTab);
  const setActiveTab = useTelemetryStore((state) => state.setActiveTab);
  const metrics = useTelemetryStore((state) => state.metrics);
  const auditLogs = useTelemetryStore((state) => state.auditLogs);
  const snapshots = useTelemetryStore((state) => state.snapshots);
  const violations = useTelemetryStore((state) => state.violations);
  const autoFreezeEnabled = useTelemetryStore((state) => state.autoFreezeEnabled);
  const setAutoFreezeEnabled = useTelemetryStore((state) => state.setAutoFreezeEnabled);
  const isFrozen = useTelemetryStore((state) => state.isFrozen);
  const setIsFrozen = useTelemetryStore((state) => state.setIsFrozen);
  const clearViolations = useTelemetryStore((state) => state.clearViolations);
  const exportDump = useTelemetryStore((state) => state.exportFlightRecorderDump);

  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        toggleConsole(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleConsole]);

  if (!isOpen) return null;

  const handleCopyRepro = async () => {
    const dump = exportDump();
    const code = generateVitestReproCode(dump);
    const success = await copyToClipboard(code);
    setCopyFeedback(success ? '✅ Đã sao chép mã Vitest!' : '❌ Không thể sao chép');
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const handleDownloadDump = () => {
    const dump = exportDump();
    downloadDiagnosticDump(dump);
  };

  const latestSnapshot = snapshots[0];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm pointer-events-auto select-none"
      role="dialog"
      aria-modal="true"
      aria-label="Hộp Đen & Giám Sát Thời Gian Thực"
    >
      <div className="flex flex-col w-full max-w-4xl h-[90vh] max-h-[720px] bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden="true">🛡️</span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-300">
                HỘP ĐEN & GIÁM SÁT THỜI GIAN THỰC (VTCOON TELEMETRY)
              </h2>
              <p className="text-[11px] text-slate-400">
                Theo dõi hiệu năng, kiểm tra bất biến và xuất mã test tái hiện lỗi tức thì
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleConsole(false)}
            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
            aria-label="Đóng bảng điều khiển"
          >
            ✕ Đóng (Esc)
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex px-4 pt-2 bg-slate-950 border-b border-slate-800 gap-1.5 overflow-x-auto">
          {[
            { id: 'perf', label: '⚡ Hiệu Năng' },
            { id: 'audit', label: `📜 Nhật Ký (${auditLogs.length})` },
            { id: 'invariants', label: `🛡️ Bất Biến (${violations.length})` },
            { id: 'trace', label: '🔍 Truy Vết & Tái Hiện' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const tabClass = isActive
              ? 'border-amber-400 bg-slate-900 text-amber-300 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40';
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as TelemetryConsoleTab)}
                className={`px-3 py-2 text-xs border rounded-t-xl cursor-pointer transition-colors ${tabClass}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-900 font-sans text-xs">
          {activeTab === 'perf' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Tốc Độ Khung Hình</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{Math.round(metrics.fps)} FPS</span>
                <span className="text-[10px] text-slate-500 block mt-1">Mục tiêu: 60 FPS</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Độ Trễ Khung Hình</span>
                <span className="text-2xl font-bold font-mono text-amber-300">{metrics.frameTimeMs.toFixed(1)} ms</span>
                <span className="text-[10px] text-slate-500 block mt-1">Chuẩn: 16.6ms / frame</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Draw Calls WebGL</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{metrics.drawCalls}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Ngân sách tối đa: 85</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Số Lượng Tam Giác</span>
                <span className="text-2xl font-bold font-mono text-indigo-400">{metrics.triangles.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block mt-1">Ngân sách: 150.000</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Độ Trễ Mạng (Ping RTT)</span>
                <span className="text-2xl font-bold font-mono text-teal-400">{Math.round(metrics.pingRttMs)} ms</span>
                <span className="text-[10px] text-slate-500 block mt-1">WebSocket Heartbeat</span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
                <span className="text-slate-400 block text-[11px]">Kích Thước Delta</span>
                <span className="text-2xl font-bold font-mono text-violet-400">{metrics.deltaBytes} B</span>
                <span className="text-[10px] text-slate-500 block mt-1">Hạn mức &lt; 10 KB/tick</span>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-1.5">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 text-slate-500">Chưa có nhật ký hoạt động nào được ghi nhận.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[11px]">
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-700 bg-slate-800 text-slate-300">
                      {log.source}
                    </span>
                    <span className="text-amber-400 font-semibold">{log.action}</span>
                    <span className="text-slate-300 truncate flex-1">{log.payloadSummary}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'invariants' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 flex justify-between">
                  <span>1. Bảo Toàn Tiền Tệ</span>
                  <span className="text-emerald-400 font-semibold">BẬT (Δ = 0)</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 flex justify-between">
                  <span>2. Tọa Độ Di Chuyển</span>
                  <span className="text-emerald-400 font-semibold">BẬT ((d1+d2)%40)</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 flex justify-between">
                  <span>3. Số Dư Không Âm</span>
                  <span className="text-emerald-400 font-semibold">BẬT (Guarded)</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/50 flex justify-between">
                  <span>4. Quyền Sở Hữu BĐS</span>
                  <span className="text-emerald-400 font-semibold">BẬT (0-3 Stars)</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-amber-300">Danh Sách Cảnh Báo Vi Phạm ({violations.length})</span>
                {violations.length > 0 && (
                  <button
                    type="button"
                    onClick={clearViolations}
                    className="px-2.5 py-1 text-[11px] rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Xóa Danh Sách
                  </button>
                )}
              </div>

              {violations.length === 0 ? (
                <div className="text-center py-8 text-emerald-400 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                  🛡️ Không phát hiện bất kỳ vi phạm bất biến nào. Hệ thống vận hành toàn vẹn 100%!
                </div>
              ) : (
                <div className="space-y-2">
                  {violations.map((v) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border ${
                        v.severity === 'CRITICAL'
                          ? 'border-rose-700/80 bg-rose-950/40 text-rose-200'
                          : 'border-amber-700/80 bg-amber-950/40 text-amber-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{v.type}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700">
                          {v.severity}
                        </span>
                      </div>
                      <p className="text-[11px]">{v.message}</p>
                      <pre className="mt-1.5 p-2 rounded bg-slate-950/80 text-[10px] font-mono overflow-x-auto text-slate-300">
                        {JSON.stringify(v.details, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trace' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <span className="font-bold block text-slate-200">Debug Auto-Freeze Hiện Trường</span>
                  <span className="text-slate-400 text-[11px]">
                    Tự động đóng băng đồng hồ và lượt chơi khi phát hiện lỗi nghiêm trọng (CRITICAL)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {isFrozen && (
                    <button
                      type="button"
                      onClick={() => setIsFrozen(false)}
                      className="px-2.5 py-1 rounded-lg border border-amber-600 bg-amber-900 text-amber-200 text-xs font-bold cursor-pointer"
                    >
                      Bỏ Đóng Băng
                    </button>
                  )}
                  <input
                    type="checkbox"
                    checked={autoFreezeEnabled}
                    onChange={(e) => setAutoFreezeEnabled(e.target.checked)}
                    className="w-4 h-4 cursor-pointer accent-amber-500"
                    id="auto-freeze-checkbox"
                  />
                </div>
              </div>

              {latestSnapshot ? (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60">
                  <span className="font-bold text-amber-300 block mb-2">
                    Ảnh Chụp Vi Sai Snapshot Gần Nhất (Tick #{latestSnapshot.tick})
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Trạng Thái Trước (Pre-State)</span>
                      <pre className="text-slate-300 overflow-x-auto">{JSON.stringify(latestSnapshot.preStateSummary, null, 2)}</pre>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Trạng Thái Sau (Post-State)</span>
                      <pre className="text-slate-300 overflow-x-auto">{JSON.stringify(latestSnapshot.postStateSummary, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 border border-slate-800 rounded-xl">
                  Chưa có snapshot vi sai nào trong bộ nhớ đệm.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyRepro}
                  className="px-4 py-2 rounded-xl border border-amber-500/60 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold text-xs cursor-pointer shadow-md transition-colors"
                >
                  📋 Sao Chép Test Tái Hiện (Vitest Code)
                </button>
                <button
                  type="button"
                  onClick={handleDownloadDump}
                  className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer shadow-md transition-colors"
                >
                  💾 Tải Tệp Hộp Đen JSON
                </button>
                {copyFeedback && (
                  <span className="text-xs font-semibold text-emerald-400 animate-fade-in">{copyFeedback}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

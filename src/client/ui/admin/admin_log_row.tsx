// [IMP-25/MSS][IMP-28/MSS] Reusable Admin Log Row Component
import React from 'react';
import type { AdminRoomLogEntry } from '../../../server/network/admin_manager';

export interface AdminLogRowProps {
  readonly log: AdminRoomLogEntry;
}

export function AdminLogRow({ log }: AdminLogRowProps): React.ReactElement {
  const sourceColor =
    log.source === 'SYSTEM'
      ? 'text-purple-400'
      : log.source === 'BOT'
      ? 'text-cyan-400'
      : 'text-amber-400';

  return (
    <div className="flex gap-2">
      <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
      <span className={`font-bold ${sourceColor}`}>[{log.source}]</span>
      <span className="text-emerald-400 font-semibold">{log.action}</span>
      <span className="text-slate-300 flex-1">{log.payloadSummary}</span>
    </div>
  );
}

// [IMP-25/MSS] Admin Lock Screen Component
import React from 'react';

export interface AdminLockScreenProps {
  readonly secret: string;
  readonly authError: string | null;
  readonly onSecretChange: (val: string) => void;
  readonly onSubmit: () => void;
}

export function AdminLockScreen({
  secret,
  authError,
  onSecretChange,
  onSubmit,
}: AdminLockScreenProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4 font-sans text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 text-center">
          <span className="text-3xl">🛡️</span>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-amber-400">VTCOON ADMIN PORTAL</h1>
          <p className="mt-1 text-xs text-slate-400">Trung Tâm Quản Trị & Giám Sát Đa Bàn Chơi</p>
        </div>
        {authError && (
          <div className="mb-4 rounded-lg border border-red-500/50 bg-red-950/40 p-3 text-xs text-red-300">
            {authError}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-300">Mã Bí Mật Quản Trị (Secret Key)</label>
            <input
              type="password"
              value={secret}
              onChange={(e) => onSecretChange(e.target.value)}
              placeholder="vtcoon-admin-2026"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-amber-300 focus:border-amber-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400"
          >
            Đăng Nhập Quản Trị
          </button>
          <a href="/" className="block text-center text-xs text-slate-400 hover:text-amber-400">
            ← Quay Lại Trò Chơi
          </a>
        </form>
      </div>
    </div>
  );
}

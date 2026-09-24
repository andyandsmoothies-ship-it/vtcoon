// [IMP-168] WelcomeHubModal — Welcome Hub & Controlled Intentional Room Creation
import React, { useState, useRef } from 'react';
import { useLobbyStore } from '../../store/lobby_store';
import { GameRulesModal } from '../modals/game_rules_modal';
import { AudioEngine } from '../../audio/audio_engine';

export interface WelcomeHubModalProps {
  readonly onOpenRules?: () => void;
}

export function WelcomeHubModal(props: WelcomeHubModalProps = {}): React.ReactElement {
  const [code, setCode] = useState('');
  const [showRules, setShowRules] = useState(false);
  const codeRef = useRef('');
  const storeJoining = useLobbyStore((s) => s.isJoining);
  const isJoining = storeJoining || useLobbyStore.getState().isJoining;

  const cleanCode = code.trim().toUpperCase();
  const isValidCode = /^[A-Z0-9]{6}$/.test(cleanCode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    codeRef.current = val;
    setCode(val);
  };

  const handleCreateRoom = () => {
    if (isJoining) return;
    AudioEngine.resumeAudioContext();
    useLobbyStore.getState().createCustomRoom(false);
  };

  const handleJoinRoom = () => {
    if (isJoining) return;
    AudioEngine.resumeAudioContext();
    const targetCode = (codeRef.current || code).trim().toUpperCase();
    useLobbyStore.getState().joinCustomRoom(targetCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isJoining) return;
    const targetCode = (codeRef.current || code).trim().toUpperCase();
    if (e.key === 'Enter' && /^[A-Z0-9]{6}$/.test(targetCode)) {
      handleJoinRoom();
    }
  };

  const handleOpenRules = () => {
    if (props.onOpenRules) {
      props.onOpenRules();
    } else {
      setShowRules(true);
    }
  };

  const rendered = (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4 select-none pointer-events-auto"
      data-testid="welcome-hub-overlay"
    >
      <div
        className="w-full max-w-[380px] sm:max-w-[420px] max-h-[90dvh] overflow-y-auto bg-slate-900 border-2 border-amber-400/80 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-5 sm:p-6 flex flex-col text-slate-100 gap-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-hub-title"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-amber-400/30">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-100 flex items-center justify-center font-black text-amber-950 text-base shadow-[0_2px_0_0_#78350f] border border-amber-200 shrink-0">
            VT
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 id="welcome-hub-title" className="text-2xl font-black tracking-wider text-amber-400 leading-none">
                VTCOON
              </h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-950 font-black uppercase tracking-wider leading-none">
                3D
              </span>
            </div>
            <p className="text-[11px] font-bold text-amber-200/80 uppercase tracking-widest mt-1 truncate">
              Đại Gia Bất Động Sản Bến Cảng
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            data-testid="create-room-btn"
            disabled={isJoining}
            onClick={handleCreateRoom}
            className="w-full min-h-[48px] px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 font-black text-sm uppercase tracking-wider shadow-[0_3px_0_0_#78350f] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span>🎮</span>
            <span>Tạo Phòng Mới</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 my-0.5">
          <div className="flex-1 h-px bg-slate-700/80" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Hoặc nhập mã phòng
          </span>
          <div className="flex-1 h-px bg-slate-700/80" />
        </div>

        {/* Room Code Input & Join Button */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="text"
              data-testid="join-room-input"
              data-testid-alt="room-code-input"
              value={code}
              disabled={isJoining}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="VTxxxx"
              maxLength={6}
              className="flex-1 min-h-[44px] px-3.5 text-center uppercase font-mono font-black tracking-widest text-sm rounded-xl bg-slate-800 border border-amber-400/40 text-amber-200 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label="Nhập mã phòng 6 ký tự"
            />
            <button
              type="button"
              data-testid="join-room-btn"
              disabled={!isValidCode || isJoining}
              onClick={handleJoinRoom}
              className="min-h-[44px] px-4 flex items-center justify-center gap-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 shadow-[0_2px_0_0_#78350f] active:translate-y-0.5 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 shrink-0"
            >
              {isJoining ? (
                <>
                  <span className="inline-block w-3.5 h-3.5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                  <span>Đang Vào...</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">👉</span>
                  <span>Vào Bàn</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer / Rules */}
        <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
          <button
            type="button"
            data-testid="open-rules-btn"
            onClick={handleOpenRules}
            className="w-full min-h-[44px] px-4 py-2.5 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer active:translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
          >
            <span>📖</span>
            <span>Hướng Dẫn & Thể Lệ Game</span>
          </button>
        </div>
      </div>

      {showRules && (
        <GameRulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
      )}
    </div>
  );

  if (typeof props === 'object' && props !== null) {
    try {
      (props as any).children = rendered;
    } catch {
      /* safe-ignore if frozen */
    }
  }

  return rendered;
}

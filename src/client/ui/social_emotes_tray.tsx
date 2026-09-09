// [UI-S05/MSS] SocialEmotesTray Component — Quick social expression bar
// 5 biểu cảm: Cười, Khóc, Đốt tiền, Bắn tim, Cay cú
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SOCIAL_EMOTES, EMOTE_COOLDOWN_MS, type EmoteId } from '../../domain/emotes';
import { AudioEngine } from '../audio/audio_engine';
import { SoundEffect } from '../audio/audio_types';

export interface SocialEmotesTrayProps {
  readonly onSendEmote?: (emoteId: string) => void;
  readonly disabled?: boolean;
}

export function SocialEmotesTray({
  onSendEmote,
  disabled = false,
}: SocialEmotesTrayProps): React.ReactElement {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
    };
  }, []);

  const handleClick = useCallback(
    (emoteId: EmoteId) => {
      if (isOnCooldown || disabled) return;

      AudioEngine.playSfx(SoundEffect.CARD_DRAW);
      onSendEmote?.(emoteId);

      setIsOnCooldown(true);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => {
        setIsOnCooldown(false);
        cooldownTimerRef.current = null;
      }, EMOTE_COOLDOWN_MS);
    },
    [isOnCooldown, disabled, onSendEmote]
  );

  return (
    <nav
      className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/70 rounded-2xl p-1.5 px-2.5 shadow-xl select-none"
      role="toolbar"
      aria-label="Khay biểu cảm tương tác nhanh"
    >
      {SOCIAL_EMOTES.map((emote) => (
        <button
          key={emote.id}
          type="button"
          disabled={disabled || isOnCooldown}
          onClick={() => handleClick(emote.id)}
          className={`relative w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-150 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
            disabled || isOnCooldown
              ? 'opacity-40 cursor-not-allowed grayscale'
              : 'hover:bg-slate-800/80 hover:scale-110 active:scale-90 hover:shadow-lg'
          }`}
          title={emote.label}
          aria-label={emote.label}
        >
          <span aria-hidden="true">{emote.icon}</span>
        </button>
      ))}
    </nav>
  );
}

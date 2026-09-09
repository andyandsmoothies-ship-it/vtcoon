// [UI-S04/MSS] ModalBackdrop — Reusable modal overlay backdrop (Z-20, click outside & Escape to close)
import React, { useEffect, useCallback } from 'react';

export interface ModalBackdropProps {
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
  readonly title?: string;
}

export function ModalBackdrop({ children, onClose, title }: ModalBackdropProps): React.ReactElement {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex items-center justify-center p-4 pointer-events-auto select-none"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Hộp thoại'}
    >
      {children}
    </div>
  );
}

// [UI-S04/MSS] ModalBackdrop — Reusable modal overlay backdrop (Z-20, click outside & Escape to close, Focus Trap)
import React, { useEffect, useCallback, useRef } from 'react';

export interface ModalBackdropProps {
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
  readonly title?: string;
}

export function ModalBackdrop({ children, onClose, title }: ModalBackdropProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
        return;
      }

      // [WCAG 2.1.2] Bẫy tiêu điểm xoay vòng bên trong Modal (Focus Trap)
      if (e.key === 'Tab' && containerRef.current) {
        const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !containerRef.current.contains(document.activeElement)) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement || !containerRef.current.contains(document.activeElement)) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    // Tự động focus vào phần tử đầu tiên khi mở modal
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const firstFocusable = containerRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled])'
        );
        firstFocusable?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      ref={containerRef}
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

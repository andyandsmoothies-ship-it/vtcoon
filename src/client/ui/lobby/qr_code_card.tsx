// [TC-NET02.3/MSS] QrCodeCard — Khối hiển thị mã QR và chia sẻ liên kết phòng sảnh chờ
import React, { useEffect, useState } from 'react';
import { generateQrDataUrl, buildRoomInviteUrl } from './qr_helper';

export interface QrCodeCardProps {
  readonly roomCode: string;
}

export function QrCodeCard({ roomCode }: QrCodeCardProps): React.ReactElement {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [hasError, setHasError] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  let inviteUrl = '';
  try {
    inviteUrl = buildRoomInviteUrl(roomCode);
  } catch {
    inviteUrl = '';
  }

  useEffect(() => {
    let active = true;
    if (!inviteUrl) {
      setHasError(true);
      return;
    }
    setHasError(false);
    void generateQrDataUrl(inviteUrl)
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setHasError(true);
      });
    return () => {
      active = false;
    };
  }, [inviteUrl]);

  const handleCopyLink = async (): Promise<void> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }
    } catch {
      // Fallback nếu clipboard API bị hạn chế
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
      <h3 className="text-sm font-semibold tracking-wider uppercase text-slate-400 mb-2">
        Mã QR Mời Bạn Bè
      </h3>

      <div className="p-3 bg-white rounded-xl shadow-inner my-2 flex items-center justify-center min-w-[200px] min-h-[200px]">
        {hasError ? (
          <div className="w-48 h-48 flex items-center justify-center text-xs text-rose-500 text-center px-4" data-testid="lobby-qr-error">
            Không thể tạo mã QR cho phòng này.
          </div>
        ) : qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Mã QR phòng ${roomCode}`}
            className="w-48 h-48 block"
            data-testid="lobby-qr-image"
          />
        ) : (
          <div className="w-48 h-48 flex items-center justify-center text-xs text-slate-400">
            Đang tạo mã QR...
          </div>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center mt-2 max-w-[240px]">
        Quét mã bằng camera điện thoại hoặc thiết bị khác để gia nhập ngay.
      </p>

      <div className="w-full mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-2">
        <div className="text-[11px] text-slate-500 truncate px-2 py-1 bg-slate-950/60 rounded border border-slate-800 text-center select-all">
          {inviteUrl}
        </div>
        <button
          type="button"
          onClick={handleCopyLink}
          className={`w-full py-2 px-4 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
            isCopied
              ? 'bg-emerald-600 text-white border border-emerald-500'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
          }`}
          data-testid="copy-invite-link-btn"
        >
          {isCopied ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Đã Sao Chép Liên Kết!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                />
              </svg>
              <span>Sao Chép Liên Kết Mời</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

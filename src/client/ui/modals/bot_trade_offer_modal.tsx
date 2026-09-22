import React, { useEffect, useState } from 'react';
import { BOARD_CONFIG } from '../../../domain/board_config.js';
import { PROPERTY_DEEDS } from '../../../domain/property_data.js';
import { COLOR_GROUP_HEX } from '../../../domain/theme.js';
import { formatCurrency } from '../ui_helpers.js';
import { useGameStore } from '../../store/game_store.js';

export interface BotTradeOfferModalProps {
  readonly offerId: string;
  readonly cellIndex: number;
  readonly price: number;
  readonly buyerId: string;
  readonly sellerId: string;
  readonly expiresAt: number;
  readonly offeredCellIndex?: number;
  readonly onAccept: (offerId: string) => void;
  readonly onReject: (offerId: string) => void;
  readonly onClose?: () => void;
}

export function BotTradeOfferModal({
  offerId,
  cellIndex,
  price,
  buyerId,
  expiresAt,
  offeredCellIndex,
  onAccept,
  onReject,
  onClose,
}: BotTradeOfferModalProps): React.ReactElement {
  const playersInfo = useGameStore((state) => state.playersInfo);
  const buyer = playersInfo[buyerId];
  const buyerName = buyer?.name ?? 'Bot AI';

  const isSwap = offeredCellIndex !== undefined;
  const cell = BOARD_CONFIG[cellIndex];
  const propertyName = cell?.name ?? `Ô Đất #${cellIndex}`;
  const deed = PROPERTY_DEEDS.get(cellIndex);
  const cellColor = cell?.colorGroup ? COLOR_GROUP_HEX[cell.colorGroup] : '#f59e0b';
  const basePrice = deed?.price ?? 1000;
  const premiumPercent = basePrice > 0 ? Math.round(((price - basePrice) / basePrice) * 100) : 0;

  const offeredCell = isSwap && offeredCellIndex !== undefined ? BOARD_CONFIG[offeredCellIndex] : undefined;
  const offeredDeed = isSwap && offeredCellIndex !== undefined ? PROPERTY_DEEDS.get(offeredCellIndex) : undefined;
  const offeredColor = offeredCell?.colorGroup ? COLOR_GROUP_HEX[offeredCell.colorGroup] : '#f59e0b';
  const offeredBasePrice = offeredDeed?.price ?? 1000;

  const [remainingMs, setRemainingMs] = useState(() => Math.max(0, expiresAt - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, expiresAt - Date.now());
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(timer);
        onReject(offerId);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [expiresAt, offerId, onReject]);

  const secondsLeft = Math.ceil(remainingMs / 1000);
  const progressPercent = Math.min(100, Math.max(0, (remainingMs / 15_000) * 100));
  const isUrgent = secondsLeft <= 5;

  const absPrice = Math.abs(price);
  const taxAmount = Math.round(absPrice * 0.05);
  const netReceived = absPrice - taxAmount;

  return (
    <div
      data-testid="bot-trade-offer-modal"
      className="w-full max-w-md bg-[#FFFDF8] border-2 border-amber-900/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bot-trade-modal-title"
    >
      {/* Header */}
      <header className="p-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-800/60 border border-amber-300/40 flex items-center justify-center text-lg shrink-0 shadow-inner">
            {buyer?.mascotIcon || (buyer?.isBot ? '🤖' : '👤')}
          </div>
          <div>
            <h2 id="bot-trade-modal-title" className="text-sm font-black uppercase tracking-wider text-white">
              {isSwap ? 'Đề Xuất Đổi Đất 2 Chiều 🤝' : 'Đề Xuất Mua Đất Độc Quyền'}
            </h2>
            <p className="text-[11px] text-amber-100 font-medium">
              Từ đối thủ <span className="font-bold text-white">{buyerName}</span>
            </p>
          </div>
        </div>
        <div
          data-testid="trade-offer-timer"
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border transition-colors ${
            isUrgent
              ? 'bg-rose-950/80 text-rose-200 border-rose-400/50 animate-pulse'
              : 'bg-black/25 text-amber-200 border-amber-300/30'
          }`}
        >
          <span>⏱️</span>
          <span>{secondsLeft}s</span>
        </div>
      </header>

      {/* Progress Bar 15s */}
      <div className="w-full bg-amber-950/20 h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-100 ease-linear ${
            isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 flex flex-col gap-3">
        {isSwap ? (
          /* Giao diện Đổi Đất 2 Chiều */
          <div className="flex flex-col gap-2.5">
            {/* Khối 1: Ô bạn nhận */}
            <div className="p-2.5 bg-emerald-50/60 border border-emerald-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-6 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: offeredColor }}
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">🎁 Bạn Nhận Được</span>
                  <h3 className="text-sm font-black text-slate-800">{offeredCell?.name ?? `Ô Đất #${offeredCellIndex}`}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá Gốc</span>
                <div className="text-xs font-semibold text-slate-600">{formatCurrency(offeredBasePrice)}</div>
              </div>
            </div>

            {/* Biểu tượng hoán đổi */}
            <div className="flex items-center justify-center text-xs font-bold text-amber-700 gap-1.5 -my-1">
              <span>⇅ HOÁN ĐỔI VỚI</span>
            </div>

            {/* Khối 2: Ô bạn nhượng */}
            <div className="p-2.5 bg-amber-50/60 border border-amber-300 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-6 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cellColor }}
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">📤 Bạn Chuyển Nhượng</span>
                  <h3 className="text-sm font-black text-slate-800">{propertyName}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá Gốc</span>
                <div className="text-xs font-semibold text-slate-600">{formatCurrency(basePrice)}</div>
              </div>
            </div>

            {/* Khối 3: Bù tiền & Thuế */}
            <div className="p-2.5 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-1.5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 min-w-0">
                <span className="font-bold text-slate-700">Chênh Lệch Tiền Mặt:</span>
                {price > 0 ? (
                  <span className="font-black text-emerald-700">+{formatCurrency(price)} (Bạn nhận thêm)</span>
                ) : price < 0 ? (
                  <span className="font-black text-rose-700">-{formatCurrency(absPrice)} (Bạn bù thêm)</span>
                ) : (
                  <span className="font-black text-slate-700">0 Tr. (Ngang giá)</span>
                )}
              </div>
              {absPrice > 0 && (
                <div className="pt-1 border-t border-slate-300/60 flex justify-between text-[11px] text-slate-600 font-medium">
                  <span>Thuế kho bạc (5%): -{formatCurrency(taxAmount)}</span>
                  <span className="font-bold text-slate-800">
                    {price > 0 ? `Thực nhận: ${formatCurrency(netReceived)}` : `Tổng chi: ${formatCurrency(absPrice)}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Giao diện Mua Đất Đơn */
          <div className="p-3 bg-[#F7F2E7] border border-slate-300 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                {cell?.colorGroup && (
                  <span
                    className="w-2.5 h-6 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: cellColor }}
                  />
                )}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ô Đất Mục Tiêu</span>
                  <h3 className="text-base font-black text-slate-800">{propertyName}</h3>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Giá Gốc</span>
                <div className="text-xs font-semibold text-slate-600">{formatCurrency(basePrice)}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-300/60 flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-slate-700">Giá Đề Xuất Mua:</span>
                <span className="ml-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  +{premiumPercent}%
                </span>
              </div>
              <span className="text-lg font-black text-emerald-700">{formatCurrency(price)}</span>
            </div>

            <div className="pt-1.5 border-t border-slate-300/60 flex justify-between text-[11px] text-slate-600 font-medium">
              <span>Thuế kho bạc (5%): -{formatCurrency(taxAmount)}</span>
              <span className="font-bold text-slate-800">Thực nhận: {formatCurrency(netReceived)}</span>
            </div>
          </div>
        )}

        {/* Cảnh báo độc quyền */}
        <div
          data-testid="monopoly-warning-banner"
          className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900"
        >
          <span className="text-base shrink-0">⚠️</span>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-amber-950">LƯU Ý CHIẾN LƯỢC:</span>
            <p className="text-[11px] text-amber-900 leading-snug">
              {isSwap
                ? 'Hãy cân nhắc kỹ phân khu của ô đất nhận và nhượng trước khi chốt thỏa thuận đổi đất!'
                : 'Nếu bán ô đất này, đối thủ sẽ hoàn thiện trọn bộ phân khu và có thể xây dựng khách sạn thu phí cực lớn!'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <footer className="p-4 pt-1 bg-[#F7F2E7] border-t border-slate-300 flex gap-2.5">
        <button
          type="button"
          data-testid="reject-trade-btn"
          aria-label={isSwap ? 'Từ chối đổi đất' : 'Từ chối bán đất'}
          onClick={() => onReject(offerId)}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-xl font-black text-xs text-white bg-rose-600 hover:bg-rose-700 border-2 border-rose-800 shadow-[0_4px_0_0_#9f1239] active:shadow-[0_1px_0_0_#9f1239] active:translate-y-[3px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
        >
          {isSwap ? '✕ TỪ CHỐI ĐỔI' : '✕ TỪ CHỐI BÁN'}
        </button>
        <button
          type="button"
          data-testid="accept-trade-btn"
          aria-label={isSwap ? 'Đồng ý đổi đất' : 'Đồng ý bán đất'}
          onClick={() => onAccept(offerId)}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-xl font-black text-xs text-white bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {isSwap ? '✓ ĐỒNG Ý ĐỔI' : '✓ ĐỒNG Ý BÁN'}
        </button>
      </footer>
    </div>
  );
}

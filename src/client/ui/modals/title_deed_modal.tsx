import React from 'react';
import { getDeedDisplayInfo } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { CellType } from '../../../domain/board_config';
import { getTileAssetUrl } from '../../assets/tile_assets';
import { useGameStore } from '../../store/game_store';
import { MarketCardId } from '../../../domain/event_card_types';
import type { MarketModifier } from '../../../domain/room';

export interface TitleDeedModalProps {
  readonly cellIndex: number;
  readonly canBuy?: boolean;
  readonly isOwned?: boolean;
  readonly isOwner?: boolean;
  readonly isMortgaged?: boolean;
  readonly ownerName?: string;
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly hasMonopoly?: boolean;
  readonly upgradeBlockedReason?: string;
  readonly downgradeBlockedReason?: string;
  readonly onBuy?: () => void;
  readonly onPass?: () => void;
  readonly onClose?: () => void;
  readonly onMortgage?: () => void;
  readonly onRedeem?: () => void;
  readonly onUpgrade?: () => void;
  readonly onDowngrade?: () => void;
  readonly ownedProperties?: readonly number[];
  readonly onSelectCell?: (cellIndex: number) => void;
  readonly activeModifiers?: ReadonlyArray<MarketModifier>;
  readonly isTradeFrozen?: boolean;
}

const PROPERTY_TIERS = [
  { chip: 'C0', label: 'Đất Nền', icon: '🚩', sub: 'Phí dừng chân cơ bản' },
  { chip: 'C1', label: 'Nhà Phố', icon: '🏡', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C2', label: 'Khách Sạn', icon: '🏨', sub: 'Phí thuê + chi phí nâng cấp' },
  { chip: 'C3', label: 'Quần thể Resort/TTTM', icon: '👑', sub: 'Phí thuê tối đa' },
] as const;

const RAILROAD_TIERS = [
  { chip: '1 Ga', label: '1 Bến / Ga', icon: '🚊', sub: '1 trạm vận tải' },
  { chip: '2 Ga', label: '2 Bến / Ga', icon: '🚊', sub: '2 trạm kết nối' },
  { chip: '3 Ga', label: '3 Bến / Ga', icon: '🚊', sub: '3 trạm liên kết' },
  { chip: '4 Ga', label: '4 Bến / Ga', icon: '👑', sub: 'Toàn mạng lưới' },
] as const;

export function TitleDeedModal({
  cellIndex,
  canBuy = true,
  isOwned = false,
  isOwner = false,
  isMortgaged = false,
  ownerName,
  currentLevel,
  upgradeCost,
  hasMonopoly = false,
  upgradeBlockedReason,
  downgradeBlockedReason,
  onBuy,
  onPass,
  onClose,
  onMortgage,
  onRedeem,
  onUpgrade,
  onDowngrade,
  ownedProperties,
  onSelectCell,
  activeModifiers: propsActiveModifiers,
  isTradeFrozen: propsIsTradeFrozen,
}: TitleDeedModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);
  const currentIndex = ownedProperties ? ownedProperties.indexOf(cellIndex) : -1;
  const showCarousel = Boolean(isOwner && ownedProperties && ownedProperties.length > 1 && currentIndex !== -1);

  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const effectiveModifiers = propsActiveModifiers ?? (isSSR ? useGameStore.getState().activeModifiers : storeModifiers) ?? [];
  const isTradeFrozen = propsIsTradeFrozen ??
    effectiveModifiers.some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0);

  const activeModifierBadges = React.useMemo(() => {
    const badges: Array<{ icon: string; text: string }> = [];
    for (const m of effectiveModifiers) {
      if (m.remainingRounds > 0 && (m.affectedCells ?? []).includes(cellIndex)) {
        if (m.type === MarketCardId.MC_FUEL_SURGE) {
          badges.push({ icon: '⚡', text: 'Biến Động Xăng Dầu: Phụ thu +500 Tr. cước vận tải' });
        } else if (m.type === MarketCardId.MC_PEAK_TOURISM) {
          badges.push({ icon: '🌊', text: 'Mùa Du Lịch: Nhân đôi phí thuê (x2)' });
        } else if (m.type === MarketCardId.MC_UTILITY_DOUBLE) {
          badges.push({ icon: '💡', text: 'Giá Điện & Viễn Thông: Nhân đôi phí dịch vụ (x2)' });
        } else if (m.type === MarketCardId.MC_COASTAL_STORM) {
          badges.push({ icon: '🌀', text: 'Bão Lũ Duyên Hải: Miễn 100% tiền thuê & cô lập giao thông' });
        } else if (m.type === MarketCardId.MC_NIGHT_ECONOMY) {
          badges.push({ icon: '🌙', text: 'Kinh Tế Ban Đêm: Nhân đôi phí dịch vụ (x2)' });
        } else if (m.type === MarketCardId.MC_ALCOHOL_CHECK) {
          badges.push({ icon: '🚨', text: 'Nghị Định 100: Giảm 50% tiền thuê; chốt phạt 800 Tr. & giữ xe' });
        } else if (m.type === MarketCardId.MC_PUBLIC_INVEST) {
          badges.push({ icon: '🏗️', text: 'Vốn Đầu Tư Công: Nhân đôi cước phí vận tải (x2)' });
        }
      }
    }
    return badges;
  }, [cellIndex, effectiveModifiers]);

  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [cellIndex]);

  const tileAssetUrl = React.useMemo(() => {
    if (!deed) return null;
    try {
      return getTileAssetUrl(cellIndex);
    } catch {
      return null;
    }
  }, [cellIndex, deed]);

  if (!deed) {
    return (
      <div className="bg-[#FFFDF8] border-2 border-slate-900 p-6 rounded-2xl text-center max-w-sm text-slate-900 shadow-[0_6px_0_0_#0f172a]">
        <p className="text-sm font-bold">Không tìm thấy thông tin Sổ Đỏ cho ô #{cellIndex}.</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 min-h-[48px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs border-2 border-slate-900 shadow-[0_4px_0_0_#0f172a] active:shadow-[0_1px_0_0_#0f172a] active:translate-y-[3px] transition-all inline-flex items-center justify-center whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          Đóng
        </button>
      </div>
    );
  }

  const ribbonColor = deed.colorGroup ? COLOR_GROUP_HEX[deed.colorGroup] : '#334155';
  const hasUpgrades = deed.upgradeCosts.some((cost) => cost > 0);
  const isRailroad = deed.cellType === CellType.Railroad;
  const isUtility = deed.cellType === CellType.Utility;
  const tiers = isRailroad ? RAILROAD_TIERS : PROPERTY_TIERS;

  const showImage = Boolean(tileAssetUrl) && !imageError;

  const showUpgrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade);
  const showDowngrade = Boolean(isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade);
  const showMortgage = Boolean(isOwner && (isMortgaged ? onRedeem : onMortgage));
  const actionCount = (showUpgrade ? 1 : 0) + (showDowngrade ? 1 : 0) + (showMortgage ? 1 : 0);
  const closeButtonSpan = (!isOwner || actionCount === 0 || actionCount === 2) ? 'col-span-2' : '';

  return (
    <div
      className="relative w-full max-w-md max-h-[90vh] md:max-h-[85vh] bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] ring-2 ring-slate-900/10 overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-90 fade-in duration-200 ease-out select-none p-5 text-slate-900"
      data-testid="title-deed-modal"
    >
      {/* Khung viền chỉ mực kép bên trong */}
      <div
        className="pointer-events-none absolute inset-1.5 rounded-xl border border-slate-300/80 z-10"
        aria-hidden="true"
      />

      {/* Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] overflow-hidden z-0"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" className="w-[360px] h-[360px] text-slate-900 fill-none stroke-current" strokeWidth="1.5">
          <circle cx="200" cy="200" r="28" fill="currentColor" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="14" fill="currentColor" />
          {Array.from({ length: 14 }).map((_, i) => (
            <polygon
              key={i}
              points="196,160 204,160 200,135"
              fill="currentColor"
              transform={`rotate(${(i * 360) / 14} 200 200)`}
            />
          ))}
          <circle cx="200" cy="200" r="75" strokeDasharray="3 3" />
          <circle cx="200" cy="200" r="95" />
          <circle cx="200" cy="200" r="120" strokeDasharray="6 4" strokeWidth="2" />
          <circle cx="200" cy="200" r="145" />
          <circle cx="200" cy="200" r="165" strokeDasharray="4 2" />
          <circle cx="200" cy="200" r="185" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Ruy-băng tiêu đề (Ribbon Header) cờ bàn */}
      <header
        className="px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] rounded-b-xl mx-1 mt-1 rounded-t-lg shrink-0 z-10"
        style={{ backgroundColor: ribbonColor }}
      >
        <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
        {!onClose && (
          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
        )}
        <p className="text-[10px] uppercase tracking-widest text-white/95 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
        </p>
        <h2 className="tracking-wide text-xs sm:text-sm font-black uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5 px-3 py-1 leading-snug break-words mx-auto">
          {deed.name}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng Sổ Đỏ"
            className="absolute top-2.5 right-2.5 min-w-[48px] min-h-[48px] w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 border border-white/40 flex items-center justify-center text-white text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors cursor-pointer z-20 shadow-md"
          >
            ✕
          </button>
        )}
      </header>
      {showCarousel && ownedProperties && (
        <div
          className="title-deed-carousel mx-1 mt-2 px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs z-10 shrink-0 font-bold"
          data-testid="title-deed-carousel"
        >
          <button
            type="button"
            onClick={() => {
              const prevIdx = (currentIndex - 1 + ownedProperties.length) % ownedProperties.length;
              const target = ownedProperties[prevIdx];
              if (target !== undefined) onSelectCell?.(target);
            }}
            aria-label="Sổ đỏ trước"
            className="min-h-[36px] min-w-[68px] px-2.5 py-1 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-800 text-xs font-bold shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
          >
            ◀ Trước
          </button>
          <span className="text-[11px] text-slate-600 font-mono">
            {currentIndex + 1} / {ownedProperties.length}
          </span>
          <button
            type="button"
            onClick={() => {
              const nextIdx = (currentIndex + 1) % ownedProperties.length;
              const target = ownedProperties[nextIdx];
              if (target !== undefined) onSelectCell?.(target);
            }}
            aria-label="Sổ đỏ tiếp theo"
            className="min-h-[36px] min-w-[68px] px-2.5 py-1 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-800 text-xs font-bold shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
          >
            Sau ▶
          </button>
        </div>
      )}

      {/* Huy hiệu chứng nhận chủ quyền và con dấu Sổ Đỏ (IMP-58) */}
      {isOwned && (
        <div
          className="mx-1 mt-2 py-1.5 px-3 rounded-xl border border-amber-600/40 bg-amber-100/70 flex items-center justify-between shadow-sm text-xs shrink-0 z-10 text-slate-900"
          data-testid="ownership-certificate-seal"
        >
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">📜</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-900 tracking-wider uppercase">
                CHỨNG NHẬN QUYỀN SỞ HỮU
              </span>
              <span className="font-bold text-slate-900 text-xs truncate">
                Chủ sở hữu: {ownerName || 'Đã có chủ'}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">
            SỔ ĐỎ CHÍNH CHỦ
          </span>
        </div>
      )}

      {/* Huy hiệu Thẻ Thị Trường đang tác động (IMP-76) */}
      {activeModifierBadges.map((badge, idx) => (
        <div
          key={idx}
          className="mx-1 mt-2 py-1.5 px-3 rounded-xl border-2 border-slate-900 bg-amber-100 flex items-center justify-center gap-2 shadow-[0_2px_0_0_#0f172a] text-xs font-bold text-slate-900 shrink-0 z-10"
          data-testid="market-modifier-badge"
        >
          <span className="text-sm" aria-hidden="true">{badge.icon}</span>
          <span>{badge.text}</span>
        </div>
      ))}

      {/* Thông tin giá niêm yết & thế chấp */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 p-4 space-y-3 text-xs md:text-sm text-slate-900">
        {/* Diorama Art Showcase Banner (IMP-33) */}
        <div
          className="relative w-full h-32 sm:h-36 rounded-xl bg-[#F7F2E7] border border-slate-300 overflow-hidden flex items-center justify-center p-2 shadow-inner"
          data-testid="diorama-art-banner"
        >
          {showImage && tileAssetUrl ? (
            <img
              src={tileAssetUrl}
              alt={deed.name}
              onError={() => setImageError(true)}
              className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)]"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full rounded-lg flex flex-col items-center justify-center gap-1.5 opacity-90 border border-white/10"
              style={{ backgroundColor: `${ribbonColor}33` }}
              data-testid="diorama-fallback"
            >
              <span className="text-3xl sm:text-4xl drop-shadow-md" aria-hidden="true">
                {isRailroad ? '🚊' : isUtility ? '⚡' : '🏛️'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/80">
                {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Di Sản & Bất Động Sản'}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5 bg-[#F7F2E7] p-2.5 rounded-xl border border-slate-300">
          <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-600 block text-[11px] font-medium">Giá niêm yết</span>
            <span className="text-emerald-700 font-extrabold text-sm">{formatCurrency(deed.price)}</span>
          </div>
          <div className="bg-white/90 p-2 rounded-lg border border-slate-200">
            <span className="text-slate-600 block text-[11px] font-medium">Giá trị thế chấp</span>
            <span className="text-amber-700 font-extrabold text-sm">{formatCurrency(deed.mortgageValue)}</span>
          </div>
        </div>

        {isMortgaged && (
          <div className="p-2 rounded-xl bg-rose-100 border border-rose-400 text-rose-800 text-xs text-center font-bold flex items-center justify-center gap-1.5 shadow-sm">
            <span aria-hidden="true">⚠️</span>
            <span>Tài sản đang thế chấp — Tạm ngưng thu phí thuê</span>
          </div>
        )}

        {/* Biểu phí dừng chân C0–C3 dạng Badge Cards có icon và chip phân cấp */}
        <div className="bg-[#F7F2E7] rounded-xl border border-slate-300 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              {isRailroad ? 'Biểu Phí Theo Số Ga Sở Hữu' : isUtility ? 'Phí Dịch Vụ Cơ Bản' : 'Biểu Phí Dừng Chân'}
            </p>
            <span className="text-[10px] text-slate-600 font-bold">VNĐ</span>
          </div>

          {isUtility ? (
            <div className="space-y-2 text-xs text-slate-900">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/90 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-base" aria-hidden="true">⚡</span>
                  <span className="font-semibold text-slate-900">Phí cơ sở (1 trạm):</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(deed.rents[0])}</span>
              </div>
              <p className="text-[10px] text-slate-600 italic px-1">
                * Thu 4× điểm xúc xắc (1 trạm) hoặc 10× điểm xúc xắc (khi sở hữu cả 2 trạm).
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {deed.rents.map((rent, idx) => {
                const tier = tiers[idx];
                const isMax = idx === 3;
                const cost = hasUpgrades && idx > 0 ? deed.upgradeCosts[idx - 1] : undefined;
                const tierClass = isMax ? 'bg-amber-100/70 border-amber-400' : 'bg-white/90 border-slate-200';
                return (
                  <div key={tier ? tier.chip : idx} className={`flex justify-between items-center p-2 rounded-xl border transition-all ${tierClass}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base" aria-hidden="true">
                        {tier?.icon}
                      </span>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${
                        isMax ? 'bg-amber-200 text-amber-900 border-amber-400' : 'bg-slate-100 text-slate-900 border-slate-300'
                      }`}>
                        {tier?.chip}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs text-slate-900">
                          {tier?.label}
                        </span>
                        <span className="text-[10px] text-slate-600 font-medium">
                          {cost && cost > 0 ? `Nâng cấp: +${formatCurrency(cost)}` : tier?.sub}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-black text-xs text-slate-900">
                        {formatCurrency(idx === 0 && hasMonopoly && !isRailroad && !isUtility ? rent * 2 : rent)}
                      </span>
                      {idx === 0 && hasMonopoly && !isRailroad && !isUtility && (
                        <span className="text-[9px] font-extrabold text-emerald-700">x2 ĐỘC QUYỀN</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Nút hành động 3D tactile vật lý */}
      <footer className="relative z-10 p-4 pt-2 bg-[#F7F2E7] border-t border-slate-300 grid grid-cols-2 gap-2 shrink-0">
        {isOwned ? (
          <>
            <div className="col-span-2 min-h-[48px] py-2 px-3 rounded-xl font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-400 text-xs text-center flex items-center justify-center shadow-sm truncate">
              ✓ Đã Sở Hữu {ownerName ? `(${ownerName})` : ''}
            </div>
            {isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) < 3 && onUpgrade && (
              <button
                type="button"
                onClick={onUpgrade}
                disabled={Boolean(upgradeBlockedReason)}
                title={upgradeBlockedReason}
                className={`min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 ${
                  upgradeBlockedReason
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-teal-600 hover:bg-teal-500 text-white border-2 border-teal-800 shadow-[0_4px_0_0_#115e59] active:shadow-[0_1px_0_0_#115e59] active:translate-y-[3px] focus-visible:ring-teal-400 cursor-pointer'
                }`}
              >
                Nâng Cấp (+{formatCurrency(upgradeCost ?? 0)})
              </button>
            )}
            {isOwner && !isMortgaged && hasUpgrades && (currentLevel ?? 0) > 0 && onDowngrade && (
              <button
                type="button"
                onClick={onDowngrade}
                disabled={Boolean(downgradeBlockedReason)}
                title={downgradeBlockedReason}
                className={`min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-bold text-xs transition-all focus-visible:outline-none focus-visible:ring-2 ${
                  downgradeBlockedReason
                    ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none'
                    : 'bg-orange-600 hover:bg-orange-500 text-white border-2 border-orange-800 shadow-[0_4px_0_0_#7c2d12] active:shadow-[0_1px_0_0_#7c2d12] active:translate-y-[3px] focus-visible:ring-orange-400 cursor-pointer'
                }`}
              >
                Hạ Cấp (-50%)
              </button>
            )}
            {isOwner && (isMortgaged ? onRedeem : onMortgage) && (
              <button
                type="button"
                onClick={isTradeFrozen && !isMortgaged ? undefined : (isMortgaged ? onRedeem : onMortgage)}
                disabled={Boolean(isTradeFrozen && !isMortgaged)}
                title={isTradeFrozen && !isMortgaged ? 'Thị trường đang đóng băng giao dịch' : undefined}
                className={`min-h-[48px] whitespace-nowrap px-3.5 py-2 rounded-xl font-black text-xs border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isTradeFrozen && !isMortgaged
                    ? 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-900 border-amber-700 shadow-[0_4px_0_0_#b45309] active:shadow-[0_1px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
                }`}
              >
                {isMortgaged ? 'Giải Chấp' : 'Thế Chấp'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${closeButtonSpan} min-h-[48px] whitespace-nowrap px-4 py-2 rounded-xl font-bold text-slate-900 bg-slate-200 hover:bg-slate-300 border-2 border-slate-400 shadow-[0_4px_0_0_#64748b] active:shadow-[0_1px_0_0_#64748b] active:translate-y-[3px] text-xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer`}
            >
              Đóng
            </button>
            {upgradeBlockedReason && (
              <div className="col-span-2 w-full p-2 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 text-[11px] font-bold text-center">
                ⚠️ {upgradeBlockedReason}
              </div>
            )}
            {downgradeBlockedReason && (
              <div className="col-span-2 w-full p-2 rounded-xl bg-orange-100 border border-orange-400 text-orange-900 text-[11px] font-bold text-center">
                ⚠️ {downgradeBlockedReason}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={isTradeFrozen ? undefined : onBuy}
              disabled={isTradeFrozen || !canBuy}
              className={`min-h-[48px] whitespace-nowrap py-3 px-3.5 sm:px-6 rounded-xl font-black tracking-wide uppercase text-xs sm:text-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 truncate ${
                isTradeFrozen
                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
                  : canBuy
                  ? 'bg-emerald-700 hover:bg-emerald-600 border-2 border-emerald-700 shadow-[0_4px_0_0_#065f46] active:shadow-[0_1px_0_0_#065f46] active:translate-y-[3px] text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
              }`}
            >
              {isTradeFrozen ? 'Thị Trường Đóng Băng' : canBuy ? `Mua BĐS (${formatCurrency(deed.price)})` : 'Không Đủ Tiền'}
            </button>

            <button
              type="button"
              onClick={isTradeFrozen ? onClose : (onPass ?? onClose)}
              className="min-h-[48px] whitespace-nowrap py-3 px-3.5 sm:px-6 rounded-xl uppercase text-xs sm:text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer bg-[#FFFDF8] hover:bg-slate-100 text-slate-800 font-black border-2 border-slate-800 shadow-[0_4px_0_0_#1e293b] active:shadow-none active:translate-y-[3px]"
            >
              {isTradeFrozen ? 'Đóng' : 'Bỏ Qua'}
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

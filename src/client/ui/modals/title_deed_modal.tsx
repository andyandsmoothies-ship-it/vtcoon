import React from 'react';
import { getDeedDisplayInfo } from './modal_helpers';
import { formatCurrency } from '../ui_helpers';
import { COLOR_GROUP_HEX } from '../../../domain/theme';
import { CellType } from '../../../domain/board_config';
import { getTileAssetUrl } from '../../assets/tile_assets';
import { useGameStore } from '../../store/game_store';
import { MarketCardId, ChanceCardId } from '../../../domain/event_card_types';
import { MacroCycleType } from '../../../domain/macro_cycle_types';
import type { MarketModifier } from '../../../domain/room';
import { EVENT_ICON_REGISTRY } from '../../domain_visual_bridge';
import { TitleDeedArtShowcase } from './title_deed_art_showcase';
import { TitleDeedRentTable } from './title_deed_rent_table';
import { TitleDeedActionFooter } from './title_deed_action_footer';
import { PurchaseDecisionCard } from './purchase_decision_card';
import type { PurchaseDecisionPlayer } from './purchase_decision_logic';
import type { UpgradeActionEvaluation } from './title_deed_affordance';

export interface TitleDeedModalProps {
  readonly cellIndex: number;
  readonly canBuy?: boolean;
  readonly isOwned?: boolean;
  readonly isOwner?: boolean;
  readonly isMortgaged?: boolean;
  readonly ownerName?: string;
  readonly currentLevel?: 0 | 1 | 2 | 3;
  readonly upgradeCost?: number;
  readonly upgradeCosts?: readonly number[];
  readonly upgradeEvaluation?: UpgradeActionEvaluation;
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
  readonly buyerBalance?: number;
  readonly buyerId?: string;
  readonly allPlayers?: Record<string, PurchaseDecisionPlayer>;
  readonly isBuyOpportunity?: boolean;
  readonly shortfall?: number;
  readonly canCoverWithMortgage?: boolean;
  readonly totalMortgageCapacity?: number;
  readonly onOpenMortgage?: () => void;
  readonly isUpgradedUtility?: boolean;
  readonly isETC?: boolean;
}

const MODIFIER_DESCS: Record<string, { icon: string; text: string }> = {
  [MarketCardId.MC_FUEL_SURGE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_FUEL_SURGE], text: 'Biến Động Xăng Dầu: Phụ thu +500 cước vận tải' },
  [MarketCardId.MC_PEAK_TOURISM]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_PEAK_TOURISM], text: 'Mùa Du Lịch: Nhân đôi phí thuê (x2)' },
  [MarketCardId.MC_LAND_FEVER]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_LAND_FEVER], text: 'Sốt Đất Vệ Tinh: Nhân đôi tiền thuê (x2)' },
  [MarketCardId.MC_UTILITY_DOUBLE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_UTILITY_DOUBLE], text: 'Giá Điện & Viễn Thông: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_COASTAL_STORM]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_COASTAL_STORM], text: 'Bão Lũ Duyên Hải: Miễn 100% tiền thuê & cô lập giao thông' },
  [MarketCardId.MC_NIGHT_ECONOMY]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_NIGHT_ECONOMY], text: 'Kinh Tế Ban Đêm: Nhân đôi phí dịch vụ (x2)' },
  [MarketCardId.MC_ALCOHOL_CHECK]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_ALCOHOL_CHECK], text: 'Nghị Định 100: Giảm 50% tiền thuê; chốt phạt 800 & giữ xe' },
  [MarketCardId.MC_PUBLIC_INVEST]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_PUBLIC_INVEST], text: 'Vốn Đầu Tư Công: Nhân đôi cước phí vận tải (x2)' },
  [MarketCardId.MC_URBAN_PLANNING]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_URBAN_PLANNING], text: 'Quy Hoạch Đô Thị: Thuê x1.5 & Thế chấp nhận 60%' },
  [MarketCardId.MC_FREEZE_TRADE]: { icon: EVENT_ICON_REGISTRY[MarketCardId.MC_FREEZE_TRADE], text: 'Đóng Băng Giao Dịch: Không thể sang tên' },
  [MacroCycleType.MACRO_LAND_FEVER]: { icon: EVENT_ICON_REGISTRY[MacroCycleType.MACRO_LAND_FEVER], text: 'Sốt Đất Vĩ Mô: Thuê x2.5, Xây nhà -25%' },
  [MacroCycleType.MACRO_LIQUIDITY_FREEZE]: { icon: EVENT_ICON_REGISTRY[MacroCycleType.MACRO_LIQUIDITY_FREEZE], text: 'Đóng Băng Thanh Khoản: Giảm 50% tiền thuê' },
  [ChanceCardId.CC_PORT_EXCLUSIVE]: { icon: EVENT_ICON_REGISTRY[ChanceCardId.CC_PORT_EXCLUSIVE], text: 'Hợp Tác Cảng: Hưởng 50% doanh thu cước' },
};

export function TitleDeedModal({
  cellIndex,
  canBuy = true,
  isOwned = false,
  isOwner = false,
  isMortgaged = false,
  ownerName,
  currentLevel,
  upgradeCost,
  upgradeCosts: propsUpgradeCosts,
  upgradeEvaluation,
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
  buyerBalance,
  buyerId,
  allPlayers,
  isBuyOpportunity,
  shortfall,
  canCoverWithMortgage,
  totalMortgageCapacity,
  onOpenMortgage,
  isUpgradedUtility = false,
  isETC = false,
}: TitleDeedModalProps): React.ReactElement {
  const deed = getDeedDisplayInfo(cellIndex);
  const currentIndex = ownedProperties ? ownedProperties.indexOf(cellIndex) : -1;
  const showCarousel = Boolean(isOwner && ownedProperties && ownedProperties.length > 1 && currentIndex !== -1);

  const isSSR = typeof window === 'undefined';
  const storeModifiers = useGameStore((state) => state.activeModifiers);
  const effectiveModifiers = propsActiveModifiers ?? (isSSR ? useGameStore.getState().activeModifiers : storeModifiers) ?? [];
  const isTradeFrozen = propsIsTradeFrozen ??
    effectiveModifiers.some((m) => m.type === MarketCardId.MC_FREEZE_TRADE && m.remainingRounds > 0);
  const isLiquidityFrozen = effectiveModifiers.some(
    (m) => String(m.type) === 'MACRO_LIQUIDITY_FREEZE' &&
           m.remainingRounds > 0 &&
           (m.affectedCells ?? []).includes(cellIndex),
  );

  const activeModifierBadges = React.useMemo(() => {
    return effectiveModifiers
      .filter((m) => m.remainingRounds > 0 && (m.affectedCells ?? []).includes(cellIndex))
      .map((m) => MODIFIER_DESCS[m.type])
      .filter((b): b is { icon: string; text: string } => Boolean(b));
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
      // Safe fallback for unlisted tiles in tests or special cells
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
  const isRailroad = deed.cellType === CellType.Railroad;
  const isUtility = deed.cellType === CellType.Utility;
  const hasUpgrades = isUtility ? !isUpgradedUtility : isRailroad ? !isETC : deed.upgradeCosts.some((cost) => cost > 0);

  const showImage = Boolean(tileAssetUrl) && !imageError;

  return (
    <div
      className="relative w-full max-w-md md:max-w-[730px] max-h-[90dvh] md:max-h-[85vh] bg-[#FFFDF8] border-2 border-slate-900 rounded-2xl shadow-[0_6px_0_0_#0f172a] ring-2 ring-slate-900/10 overflow-hidden flex flex-col pointer-events-auto animate-in zoom-in-90 fade-in duration-200 ease-out select-none p-2.5 sm:p-4 text-slate-900"
      data-testid="title-deed-modal"
    >
      {/* Khung viền chỉ mực kép bên trong */}
      <div className="pointer-events-none absolute inset-1.5 rounded-xl border border-slate-300/80 z-10" aria-hidden="true" />

      {/* Hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.04] overflow-hidden z-0" aria-hidden="true">
        <svg viewBox="0 0 400 400" className="w-[360px] h-[360px] text-slate-900 fill-none stroke-current" strokeWidth="1.5">
          <circle cx="200" cy="200" r="28" fill="currentColor" fillOpacity="0.3" />
          <circle cx="200" cy="200" r="14" fill="currentColor" />
          {Array.from({ length: 14 }).map((_, i) => (
            <polygon key={i} points="196,160 204,160 200,135" fill="currentColor" transform={`rotate(${(i * 360) / 14} 200 200)`} />
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
      {(() => {
        const isBrightGroup = ribbonColor === '#F1C40F' || ribbonColor === '#EAB308' || ribbonColor === '#38BDF8' || ribbonColor === '#FACC15';
        const textColorClass = isBrightGroup ? 'text-slate-950 font-black drop-shadow-none' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]';
        const subTextColorClass = isBrightGroup ? 'text-slate-900/90 font-black drop-shadow-none' : 'text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]';

        return (
          <header
            className="px-3 py-2 text-center relative border-2 border-slate-900 shadow-[0_3px_0_0_#0f172a] rounded-b-xl mx-1 mt-1 rounded-t-lg shrink-0 z-10"
            style={{ backgroundColor: ribbonColor }}
          >
            {!onClose && (
              <>
                <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-white/80 border border-slate-900" aria-hidden="true" />
              </>
            )}
            <p className={`text-[10px] uppercase tracking-widest font-black px-12 sm:px-14 ${subTextColorClass}`}>
              {isRailroad ? 'Hạ Tầng Giao Thông' : isUtility ? 'Tiện Ích Quốc Gia' : 'Giấy Chứng Nhận Quyền Sở Hữu'}
            </p>
            <h2 className={`tracking-wide text-xs sm:text-sm font-black uppercase ${textColorClass} mt-0.5 py-1 px-12 sm:px-14 leading-snug break-words mx-auto`}>
              {deed.name}
            </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-2.5 min-w-[44px] min-h-[44px] w-8 h-8 rounded-full bg-black/25 bg-black/35 hover:bg-black/55 backdrop-blur-sm border border-white/60 flex items-center justify-center text-white text-sm font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-all hover:scale-105 active:scale-95 cursor-pointer z-20 shadow-md"
            aria-label="Đóng Sổ Đỏ"
          >
            ✕
          </button>
        )}
          </header>
        );
      })()}

      {/* Bộ chọn Carousel chuyển đổi nhanh giữa các BĐS của chính chủ */}
      {showCarousel && ownedProperties && (
        <div className="title-deed-carousel mx-1 mt-2 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-between text-xs z-10 shrink-0 font-bold" data-testid="title-deed-carousel">
          <button
            type="button"
            onClick={() => onSelectCell?.(ownedProperties[(currentIndex - 1 + ownedProperties.length) % ownedProperties.length]!)}
            aria-label="Sổ đỏ trước"
            className="min-h-[44px] min-w-[68px] px-3.5 py-2 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-800 text-xs font-bold shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
          >
            ◀ Trước
          </button>
          <span className="text-[11px] text-slate-600 font-mono">{currentIndex + 1} / {ownedProperties.length}</span>
          <button
            type="button"
            onClick={() => onSelectCell?.(ownedProperties[(currentIndex + 1) % ownedProperties.length]!)}
            aria-label="Sổ đỏ tiếp theo"
            className="min-h-[44px] min-w-[68px] px-3.5 py-2 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-lg text-slate-800 text-xs font-bold shadow-[0_2px_0_0_#cbd5e1] active:shadow-none active:translate-y-[2px] transition-all cursor-pointer inline-flex items-center justify-center"
          >
            Sau ▶
          </button>
        </div>
      )}

      {/* Huy hiệu chứng nhận chủ quyền và con dấu Sổ Đỏ (IMP-58) */}
      {isOwned && (
        <div className="mx-1 mt-2 py-1.5 px-3 rounded-xl border border-amber-600/40 bg-amber-100/70 flex items-center justify-between shadow-sm text-xs shrink-0 z-10 text-slate-900" data-testid="ownership-certificate-seal">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden="true">📜</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-amber-900 tracking-wider uppercase">CHỨNG NHẬN QUYỀN SỞ HỮU</span>
              <span className="font-bold text-slate-900 text-xs truncate">Chủ sở hữu: {ownerName || 'Đã có chủ'}</span>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
            isOwner ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
          }`}>
            {isOwner ? 'SỔ ĐỎ CHÍNH CHỦ' : 'ĐÃ CÓ CHỦ'}
          </span>
        </div>
      )}

      {/* Huy hiệu Thẻ Thị Trường đang tác động (IMP-76) */}
      {activeModifierBadges.map((badge, idx) => (
        <div key={idx} className="mx-1 mt-2 py-1.5 px-3 rounded-xl border-2 border-slate-900 bg-amber-100 flex items-center justify-center gap-2 shadow-[0_2px_0_0_#0f172a] text-xs font-bold text-slate-900 shrink-0 z-10" data-testid="market-modifier-badge">
          <span className="text-sm" aria-hidden="true">{badge.icon}</span>
          <span>{badge.text}</span>
        </div>
      ))}

      {/* Thân thẻ cuộn mượt mà (bảo toàn flex-1 min-h-0 overflow-y-auto pr-1 cho test contract) */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto pr-1 p-2 sm:p-3 text-xs md:text-sm text-slate-900 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex flex-col md:grid md:grid-cols-[1fr_1.15fr] gap-2.5 sm:gap-3.5 items-start">
          {/* Cột 1 (Desktop) / Phần trên (Mobile): Ảnh BĐS, Giá niêm yết, Thế chấp, Radar Quy Hoạch */}
          <div className="w-full space-y-2 sm:space-y-2.5">
            {/* Hàng Hero: Ảnh BĐS + Khối giá niêm yết & Giá trị thế chấp */}
            <div className="flex flex-row gap-2 sm:gap-2.5 items-stretch">
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                <TitleDeedArtShowcase
                  tileAssetUrl={tileAssetUrl}
                  deedName={deed.name}
                  ribbonColor={ribbonColor}
                  isRailroad={isRailroad}
                  isUtility={isUtility}
                  showImage={showImage}
                  onImageError={() => setImageError(true)}
                  className="w-full h-full"
                />
              </div>

              {/* Khối giá niêm yết & giá thế chấp */}
              <div className="flex-1 grid grid-cols-2 gap-1.5 sm:gap-2 bg-[#F7F2E7] p-1.5 sm:p-2 rounded-xl border border-slate-300">
                <div className="bg-white/95 p-1.5 sm:p-2 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-center">
                  <span className="text-slate-500 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none mb-1">Giá niêm yết</span>
                  <span className="text-emerald-700 font-black text-xs sm:text-sm leading-tight tracking-tight flex items-baseline gap-1">
                    {formatCurrency(deed.price)} <span className="text-[10px] sm:text-[11px] font-bold text-emerald-600/80">Tr.</span>
                  </span>
                </div>
                <div className="bg-white/95 p-1.5 sm:p-2 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-center">
                  <span className="text-slate-500 block text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider leading-none mb-1">Giá trị thế chấp</span>
                  <span className="text-amber-700 font-black text-xs sm:text-sm leading-tight tracking-tight flex items-baseline gap-1">
                    {formatCurrency(deed.mortgageValue)} <span className="text-[10px] sm:text-[11px] font-bold text-amber-600/80">Tr.</span>
                  </span>
                </div>
              </div>
            </div>

            {(canBuy || isTradeFrozen) && !isOwned && (
              <PurchaseDecisionCard
                cellIndex={cellIndex}
                deedPrice={deed.price}
                buyerBalance={buyerBalance}
                buyerId={buyerId}
                allPlayers={allPlayers}
                isTradeFrozen={isTradeFrozen}
              />
            )}

            {isMortgaged && (
              <div className="p-2 rounded-xl bg-rose-100 border border-rose-400 text-rose-800 text-xs text-center font-bold flex items-center justify-center gap-1.5 shadow-sm">
                <span aria-hidden="true">⚠️</span>
                <span>Tài sản đang thế chấp — Tạm ngưng thu phí thuê</span>
              </div>
            )}
          </div>

          {/* Cột 2 (Desktop) / Phần dưới (Mobile): Biểu phí cước dừng chân / ga */}
          <div className="w-full">
            <TitleDeedRentTable
              key={cellIndex}
              isRailroad={isRailroad}
              isUtility={isUtility}
              rents={deed.rents}
              upgradeCosts={propsUpgradeCosts ?? deed.upgradeCosts}
              hasMonopoly={hasMonopoly}
              currentLevel={currentLevel}
              isOwner={isOwner}
              compact={canBuy && !isOwned}
              cellIndex={cellIndex}
              isUpgradedUtility={isUpgradedUtility}
              isETC={isETC}
            />
          </div>
        </div>
      </div>

      {/* Nút hành động 3D tactile vật lý */}
      <TitleDeedActionFooter
        isOwned={isOwned}
        isOwner={isOwner}
        isMortgaged={isMortgaged}
        ownerName={ownerName}
        canBuy={canBuy}
        isTradeFrozen={isTradeFrozen}
        isLiquidityFrozen={isLiquidityFrozen}
        hasUpgrades={hasUpgrades}
        currentLevel={currentLevel}
        upgradeCost={upgradeCost}
        upgradeBlockedReason={upgradeBlockedReason}
        upgradeEvaluation={upgradeEvaluation}
        downgradeBlockedReason={downgradeBlockedReason}
        deedPrice={deed.price}
        onBuy={onBuy}
        onPass={onPass}
        onClose={onClose}
        onMortgage={onMortgage}
        onRedeem={onRedeem}
        onUpgrade={onUpgrade}
        onDowngrade={onDowngrade}
        isBuyOpportunity={isBuyOpportunity}
        shortfall={shortfall}
        canCoverWithMortgage={canCoverWithMortgage}
        totalMortgageCapacity={totalMortgageCapacity}
        onOpenMortgage={onOpenMortgage}
        cellIndex={cellIndex}
        isUtility={isUtility}
        isRailroad={isRailroad}
        isUpgradedUtility={isUpgradedUtility}
        isETC={isETC}
      />
    </div>

  );
}

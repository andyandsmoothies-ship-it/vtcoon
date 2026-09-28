# KẾ HOẠCH TRIỂN KHAI CHI TIẾT (IMPLEMENTATION PLAN - REVISION 3)
## TICKET: IMP-217 — Corporate Bond Tranches, Collateral Selection & End-to-End Pipeline Wiring

> **Phân loại rủi ro**: Tier 2 (Full Rigor — Wire Network, Domain FSM & UI Redesign > 50 LOC)  
> **Quy trình áp dụng**: 3 Trạm (Station 1 RED Contract Tests $\to$ Station 2 GREEN Implementation $\to$ Station 2.5 Scout $\to$ Station 3 Independent Reviews)  
> **Báo cáo thẩm định kiến trúc**: [`.agents/audit/PLAN_AUDIT_IMP217.md`](file:///c:/Users/HP/Documents/GitHub/vtcoon/.agents/audit/PLAN_AUDIT_IMP217.md) — Đã tích hợp đầy đủ 4 điểm cứng (C1 Treasury full function, C2 L376 coordinate, C3 Sequential execution order, C4 Lifecycle tests matrix).

---

### 1. PHÂN TÍCH HIỆN TRẠNG & BẢNG ĐO LƯỜNG LOC BASELINE

| Tệp Vật Lý | Phân Loại Tier | LOC Hiện Tại | Dự Kiến Thay Đổi (+ / -) | LOC Sau Cùng | Ngân Sách Trần | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/domain/bond_types.ts` | Tier 1 (Domain/FSM) | 15 | +38 / -2 | ~51 | <= 400 LOC | ✔️ An toàn |
| `src/server/bond_manager.ts` | Tier 1 (Domain/FSM) | 171 | +65 / -25 | ~211 | <= 400 LOC | ✔️ An toàn |
| `src/server/intent_dispatcher.ts` | Tier 1 (Domain/FSM) | 180 | +4 / -2 | ~182 | <= 400 LOC | ✔️ An toàn |
| `src/server/room_manager.ts` | Tier 1 (Domain/FSM) | 379 | +3 / -1 | ~381 | <= 400 LOC | ✔️ An toàn |
| `src/client/ui/modals/bond_issuance_tab.tsx` | Tier 2 (UI/View) | 104 | +120 / -45 | ~179 | <= 500 LOC | ✔️ An toàn |
| `src/client/ui/modals/property_portfolio_modal.tsx` | Tier 2 (UI/View) | 467 | +10 / -4 | ~473 | <= 500 LOC | ✔️ An toàn |
| `src/client/ui/modals/modal_host.tsx` | Tier 2 (UI/View) | 455 | +12 / -2 | ~465 | <= 500 LOC | ✔️ An toàn |

---

### 2. QUY TẮC THỨ TỰ ÁP DỤNG MÃ NGUỒN BẮT BUỘC (SEQUENTIAL APPLICATION ORDER - C3)

Để đảm bảo trình biên dịch TypeScript không gặp lỗi `TS2339` (thuộc tính không tồn tại trên kiểu dữ liệu) hoặc lỗi tham chiếu biến (`ReferenceError`), **Implementer bắt buộc phải áp dụng các đoạn mã theo đúng thứ tự 6 bước sau:**

```
[Bước 1] Snippet 3.1 ──> src/domain/bond_types.ts (SSOT Type & Constants)
                             │
                             ▼
[Bước 2] Snippet 3.2 ──> src/server/bond_manager.ts (FSM Logic & Treasury Fix)
                             │
                             ▼
[Bước 3] Snippet 3.3 ──> src/server/intent_dispatcher.ts & src/server/room_manager.ts (L376)
                             │
                             ▼
[Bước 4] Snippet 3.4 ──> src/client/ui/modals/modal_host.tsx (Import & Wire Props)
                             │
                             ▼
[Bước 5] Snippet 3.5 ──> src/client/ui/modals/property_portfolio_modal.tsx (Interface)
                             │
                             ▼
[Bước 6] Snippet 3.6 ──> src/client/ui/modals/bond_issuance_tab.tsx (Tactile UI)
```

---

### 3. ĐOẠN MÃ THAY THẾ CHÍNH XÁC (EXACT DROP-IN SNIPPETS)

#### Snippet 3.1: Mở rộng `src/domain/bond_types.ts`
*(Thay thế toàn bộ tệp `src/domain/bond_types.ts` — L1-L15)*
```typescript
export enum BondTrancheId {
  WORKING_CAPITAL = 'WORKING_CAPITAL',
  EXPANSION = 'EXPANSION',
  ALL_IN = 'ALL_IN',
}

export interface BondTrancheConfig {
  readonly id: BondTrancheId;
  readonly name: string;
  readonly loanRatio: number;
  readonly durationRounds: number;
  readonly interestRate: number;
  readonly collateralRatio: number;
}

export const BOND_TRANCHES: Record<BondTrancheId, BondTrancheConfig> = {
  [BondTrancheId.WORKING_CAPITAL]: {
    id: BondTrancheId.WORKING_CAPITAL,
    name: 'Tín Dụng Lưu Động',
    loanRatio: 0.20,
    durationRounds: 2,
    interestRate: 0.08,
    collateralRatio: 1.00,
  },
  [BondTrancheId.EXPANSION]: {
    id: BondTrancheId.EXPANSION,
    name: 'Đầu Tư Tăng Tốc',
    loanRatio: 0.40,
    durationRounds: 3,
    interestRate: 0.15,
    collateralRatio: 1.20,
  },
  [BondTrancheId.ALL_IN]: {
    id: BondTrancheId.ALL_IN,
    name: 'Thâu Tóm Tất Tay',
    loanRatio: 0.60,
    durationRounds: 3,
    interestRate: 0.20,
    collateralRatio: 0.50,
  },
};

export interface BondContract {
  readonly trancheId?: BondTrancheId;
  readonly principal: number;
  readonly repayAmount: number;
  readonly roundsLeft: number;
  readonly collateralCells: readonly number[];
  readonly isActive: boolean;
}

export const BOND_MIN_NET_WORTH = 3_000;
export const BOND_MIN_PROPERTIES = 2;
export const BOND_LOAN_RATIO = 0.80;
export const BOND_INTEREST_RATE = 0.20;
export const BOND_DURATION_ROUNDS = 3;
export const BOND_MIN_COLLATERAL_RATIO = 0.50;
```

---

#### Snippet 3.2: Nâng cấp `src/server/bond_manager.ts`
*(Thay thế các hàm `validateIssueBond`, `handleIssueBond`, `handleRepayBond` và TOÀN BỘ `processBondTurnTransition` — C1)*
```typescript
import {
  type BondContract,
  BondTrancheId,
  type BondTrancheConfig,
  BOND_TRANCHES,
  BOND_MIN_NET_WORTH,
  BOND_MIN_PROPERTIES,
  BOND_LOAN_RATIO,
  BOND_INTEREST_RATE,
  BOND_DURATION_ROUNDS,
  BOND_MIN_COLLATERAL_RATIO,
} from '../domain/bond_types';

export function validateIssueBond(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  trancheId?: BondTrancheId,
): { valid: boolean; reason?: string; principal?: number; collateralCells?: number[]; tranche?: BondTrancheConfig } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player) return { valid: false, reason: ActionRejectReason.INVALID_PLAYER };
  if (player.bondContract?.isActive) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  const netWorth = calculateNetWorth(playerId, registry, stateMap, room.players);
  if (netWorth < BOND_MIN_NET_WORTH) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  const unmortgagedCells: number[] = [];
  for (const [cellIndex, owner] of registry) {
    if (owner === playerId && !player.mortgagedProperties?.includes(cellIndex)) {
      unmortgagedCells.push(cellIndex);
    }
  }

  if (unmortgagedCells.length < BOND_MIN_PROPERTIES) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  // Legacy Fallback khi trancheId === undefined (bảo toàn 100% hợp đồng TC-192C)
  if (!trancheId) {
    const principal = Math.floor(netWorth * BOND_LOAN_RATIO);
    const totalCollateralValue = unmortgagedCells.reduce(
      (sum, cell) => sum + (PROPERTY_DEEDS.get(cell)?.price ?? 0),
      0,
    );
    if (totalCollateralValue < principal * BOND_MIN_COLLATERAL_RATIO) {
      return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
    }
    return { valid: true, principal, collateralCells: unmortgagedCells };
  }

  const tranche = BOND_TRANCHES[trancheId] ?? BOND_TRANCHES[BondTrancheId.WORKING_CAPITAL];
  const principal = Math.floor(netWorth * tranche.loanRatio);

  if (trancheId === BondTrancheId.ALL_IN) {
    const totalCollateralValue = unmortgagedCells.reduce(
      (sum, cell) => sum + (PROPERTY_DEEDS.get(cell)?.price ?? 0),
      0,
    );
    if (totalCollateralValue < principal * tranche.collateralRatio) {
      return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
    }
    return { valid: true, principal, collateralCells: unmortgagedCells, tranche };
  }

  // Sắp xếp các ô đất tăng dần theo giá trị niêm yết
  const sortedCells = [...unmortgagedCells].sort((a, b) => {
    const priceA = PROPERTY_DEEDS.get(a)?.price ?? 0;
    const priceB = PROPERTY_DEEDS.get(b)?.price ?? 0;
    return priceA - priceB;
  });

  const requiredCollateralValue = Math.floor(principal * tranche.collateralRatio);
  let accumulatedValue = 0;
  const selectedCollaterals: number[] = [];

  for (const cell of sortedCells) {
    selectedCollaterals.push(cell);
    accumulatedValue += PROPERTY_DEEDS.get(cell)?.price ?? 0;
    if (accumulatedValue >= requiredCollateralValue && selectedCollaterals.length >= BOND_MIN_PROPERTIES) {
      break;
    }
  }

  if (accumulatedValue < requiredCollateralValue || selectedCollaterals.length < BOND_MIN_PROPERTIES) {
    return { valid: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }

  return { valid: true, principal, collateralCells: selectedCollaterals, tranche };
}

export function handleIssueBond(
  room: Room,
  playerId: string,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  trancheId?: BondTrancheId,
): { success: boolean; reason?: string; bondContract?: BondContract } {
  const validation = validateIssueBond(room, playerId, registry, stateMap, trancheId);
  if (!validation.valid || validation.principal === undefined || !validation.collateralCells) {
    return { success: false, reason: validation.reason };
  }

  const player = room.players.find((p) => p.id === playerId)!;
  player.balance += validation.principal;

  const interestRate = validation.tranche ? validation.tranche.interestRate : BOND_INTEREST_RATE;
  const durationRounds = validation.tranche ? validation.tranche.durationRounds : BOND_DURATION_ROUNDS;

  const contract: BondContract = {
    trancheId: validation.tranche?.id,
    principal: validation.principal,
    repayAmount: Math.floor(validation.principal * (1 + interestRate)),
    roundsLeft: durationRounds,
    collateralCells: validation.collateralCells,
    isActive: true,
  };
  player.bondContract = contract;
  return { success: true, bondContract: contract };
}

export function handleRepayBond(
  room: Room,
  playerId: string,
): { success: boolean; reason?: string } {
  const player = room.players.find((p) => p.id === playerId);
  if (!player?.bondContract?.isActive) {
    return { success: false, reason: ActionRejectReason.BOND_NOT_ELIGIBLE };
  }
  if (player.balance < player.bondContract.repayAmount) {
    return { success: false, reason: ActionRejectReason.INSUFFICIENT_FUNDS };
  }
  player.balance -= player.bondContract.repayAmount;
  const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
  room.treasury = (room.treasury ?? 0) + interestPaid;
  player.bondContract = null;
  return { success: true };
}

export function processBondTurnTransition(
  room: Room,
  player: Player,
  registry: PropertyRegistry,
  stateMap: PropertyStateMap,
  auctions?: Map<string, AuctionSession>,
  roomCode?: string,
): void {
  if (!player.bondContract?.isActive) return;

  // Nhánh 1: Chưa đến hạn tất toán (roundsLeft > 1) -> Đếm lùi 1 vòng
  if (player.bondContract.roundsLeft > 1) {
    player.bondContract = { ...player.bondContract, roundsLeft: player.bondContract.roundsLeft - 1 };
    return;
  }

  // Nhánh 2: Đáo hạn (roundsLeft === 1) và đủ tiền tất toán
  if (player.balance >= player.bondContract.repayAmount) {
    player.balance -= player.bondContract.repayAmount;
    const interestPaid = Math.max(0, player.bondContract.repayAmount - player.bondContract.principal);
    room.treasury = (room.treasury ?? 0) + interestPaid;
    player.bondContract = null;
    return;
  }

  // Nhánh 3: Đáo hạn (roundsLeft === 1) nhưng không đủ tiền -> VỠ NỢ TRÁI PHIẾU
  const cash = Math.min(Math.max(0, player.balance), player.bondContract.repayAmount);
  player.balance -= cash;
  room.treasury = (room.treasury ?? 0) + cash;

  const cells = [...player.bondContract.collateralCells];
  for (const cell of cells) {
    registry.delete(cell);
    stateMap.delete(cell);
  }

  room.fireSaleQueue = cells;
  player.bondContract = null;

  if (room.fireSaleQueue.length > 0) {
    const first = room.fireSaleQueue.shift()!;
    handleStartFireSaleAuction(room, first, auctions, roomCode ?? room.roomCode, player.id);
  }
}
```

---

#### Snippet 3.3: Nối dây Server Intent trong `src/server/intent_dispatcher.ts` & `src/server/room_manager.ts` (C2)
1. Trong `src/server/intent_dispatcher.ts` (L15-L38):
```typescript
import type { BondTrancheId } from '../domain/bond_types';

export type PlayerIntent =
  ...
  | { type: 'INTENT_ISSUE_BOND'; trancheId?: BondTrancheId }
  | { type: 'INTENT_REPAY_BOND' }
  ...

// Dispatcher:
  INTENT_ISSUE_BOND: (m, rc, p, i) => m.handleIssueBond(rc, p, (i as { trancheId?: BondTrancheId })?.trancheId),
  INTENT_REPAY_BOND: (m, rc, p) => m.handleRepayBond(rc, p),
```

2. Trong `src/server/room_manager.ts`:
- Import tại L21:
```typescript
import { handleIssueBond, handleRepayBond } from './bond_manager';
import type { BondTrancheId } from '../domain/bond_types';
```
- **Thay thế chính xác tại Dòng 376 (L376 - C2):**
```typescript
// src/server/room_manager.ts:376
  handleIssueBond(rc: string, p: string, trancheId?: BondTrancheId) { const s = this.getSession(rc); return s ? handleIssueBond(s.room, p, s.registry, s.propertyStates, trancheId) : { success: false, reason: 'INVALID_ROOM' }; }
```

---

#### Snippet 3.4: Bổ sung Import & Nối Dây UI Client trong `src/client/ui/modals/modal_host.tsx`
- Bổ sung Import tại phần đầu tệp:
```typescript
import { calculatePlayerNetWorth } from '../ui_helpers';
```
- Thay thế khối render `activeModal === 'portfolio'` (L176-L233):
```typescript
      {activeModal === 'portfolio' && (() => {
        const owned = myPlayer?.ownedProperties ?? [];
        const unmortgagedCount = owned.filter((idx) => !myPlayer?.mortgagedProperties?.includes(idx)).length;
        const playerNW = calculatePlayerNetWorth(
          myPlayer?.balance ?? 0,
          owned,
          useGameStore.getState().levelMap,
          myPlayer?.mortgagedProperties ?? [],
          myPlayer?.mortgageLoans,
        );

        return (
          <PropertyPortfolioModal
            ownedProperties={owned}
            isTradeFrozen={isTradeFrozen}
            activeModifiers={activeModifiers}
            propertyStates={Object.fromEntries(
              owned.map((idx) => [
                idx,
                {
                  ownerId: myId,
                  level: useGameStore.getState().levelMap[idx] ?? 0,
                  isMortgaged: Boolean(myPlayer?.mortgagedProperties?.includes(idx)),
                },
              ])
            )}
            currentBalance={myPlayer?.balance ?? 0}
            playerNetWorth={playerNW}
            unmortgagedPropertiesCount={unmortgagedCount}
            bondContract={myPlayer?.bondContract}
            isInInsolvency={useGameStore.getState().activeModal === 'insolvency' || (myPlayer?.balance ?? 0) < 0}
            isMyTurn={currentTurnPlayerId === myId}
            turnPhase={useGameStore.getState().turnPhase}
            allPlayers={playersInfo}
            onIssueBond={(trancheId) => onIntent?.({ type: 'INTENT_ISSUE_BOND', trancheId })}
            onRepayBond={() => onIntent?.({ type: 'INTENT_REPAY_BOND' })}
            onQuickTrade={(targetPlayerId, targetPropertyIndex) => {
              closeModal();
              useGameStore.getState().openModal('trade', {
                targetPlayerId,
                offeredProperties: [],
                requestedProperties: [targetPropertyIndex],
                cashOffer: 0,
                cashRequest: 0,
              });
            }}
            onViewVacantCell={(cellIndex) => {
              closeModal();
              useGameStore.getState().setCameraFocusCell(cellIndex);
              useGameStore.getState().openModal('deed', {
                cellIndex,
                canBuy: false,
                ownedProperties: myPlayer?.ownedProperties,
              });
            }}
            onUpgrade={(cellIndex) => {
              onIntent?.({ type: 'INTENT_UPGRADE', cellIndex });
            }}
            onHoverCell={(cellIndex) => useGameStore.getState().setCameraFocusCell(cellIndex)}
            onSelectDeed={(cellIndex) => {
              closeModal();
              useGameStore.getState().openModal('deed', {
                cellIndex,
                canBuy: false,
                ownedProperties: myPlayer?.ownedProperties,
              });
            }}
            onMortgage={(cellIndex) => onIntent?.({ type: 'INTENT_MORTGAGE', cellIndex })}
            onRedeem={(cellIndex) => onIntent?.({ type: 'INTENT_REDEEM', cellIndex })}
            onDowngrade={(cellIndex) => onIntent?.({ type: 'INTENT_DOWNGRADE', cellIndex })}
            onAutoSolvency={() => onIntent?.({ type: 'INTENT_AUTO_SOLVENCY' })}
            onClose={() => { useGameStore.getState().setCameraFocusCell(null); closeModal(); }}
          />
        );
      })()}
```

---

#### Snippet 3.5: Cập nhật `src/client/ui/modals/property_portfolio_modal.tsx`
- Import tại L10:
```typescript
import { type BondContract, BondTrancheId } from '../../../domain/bond_types';
```
- Mở rộng interface `PropertyPortfolioModalProps` (L13-L36):
```typescript
export interface PropertyPortfolioModalProps {
  readonly ownedProperties: readonly number[];
  readonly isTradeFrozen?: boolean;
  readonly activeModifiers?: readonly { readonly type: string; readonly remainingRounds: number; readonly affectedCells?: readonly number[] }[];
  readonly propertyStates?: Record<number, { readonly ownerId?: string | null; readonly level?: number; readonly isMortgaged?: boolean }>;
  readonly currentBalance?: number;
  readonly playerNetWorth?: number;
  readonly unmortgagedPropertiesCount?: number;
  readonly isInInsolvency?: boolean;
  readonly isMyTurn?: boolean;
  readonly turnPhase?: string;
  readonly allPlayers?: Record<string, { readonly id: string; readonly name?: string; readonly balance?: number; readonly tokenColor?: string; readonly isBot?: boolean; readonly ownedProperties?: readonly number[] }>;
  readonly onQuickTrade?: (targetPlayerId: string, targetPropertyIndex: number) => void;
  readonly onViewVacantCell?: (cellIndex: number) => void;
  readonly onUpgrade?: (cellIndex: number) => void;
  readonly onHoverCell?: (cellIndex: number | null) => void;
  readonly onSelectDeed?: (cellIndex: number) => void;
  readonly onMortgage?: (cellIndex: number) => void;
  readonly onRedeem?: (cellIndex: number) => void;
  readonly onDowngrade?: (cellIndex: number) => void;
  readonly onClose?: () => void;
  readonly bondContract?: BondContract | null;
  readonly onIssueBond?: (trancheId?: BondTrancheId) => void;
  readonly onRepayBond?: () => void;
  readonly onAutoSolvency?: () => void;
}
```
- Destructure và truyền xuống `BondIssuanceTab` (L40-L111):
```typescript
export function PropertyPortfolioModal({
  ownedProperties, isTradeFrozen, activeModifiers = [], propertyStates = {}, currentBalance = 0, isInInsolvency = false,
  isMyTurn, turnPhase, allPlayers, onQuickTrade, onViewVacantCell, onUpgrade, onHoverCell,
  onSelectDeed, onMortgage, onRedeem, onDowngrade, onClose, bondContract, onIssueBond, onRepayBond, onAutoSolvency,
  playerNetWorth, unmortgagedPropertiesCount,
}: PropertyPortfolioModalProps): React.ReactElement {
...
      {activeTab === 'bonds' ? (
        <div className="p-4 flex-1 overflow-y-auto">
          <BondIssuanceTab
            bondContract={bondContract}
            balance={currentBalance}
            isMyTurn={isMyTurn}
            playerNetWorth={playerNetWorth}
            unmortgagedPropertiesCount={unmortgagedPropertiesCount}
            onIssueBond={onIssueBond}
            onRepayBond={onRepayBond}
          />
        </div>
      ) : (
```

---

#### Snippet 3.6: Đoạn Mã Drop-in Hoàn Chỉnh Cho `src/client/ui/modals/bond_issuance_tab.tsx`
*(Thay thế toàn bộ tệp `src/client/ui/modals/bond_issuance_tab.tsx` — L1-L104)*
```tsx
import React, { useState } from 'react';
import { type BondContract, BondTrancheId, BOND_TRANCHES } from '../../../domain/bond_types';
import { formatCurrency } from '../ui_helpers';

interface BondIssuanceTabProps {
  readonly bondContract?: BondContract | null;
  readonly balance: number;
  readonly isMyTurn?: boolean;
  readonly playerNetWorth?: number;
  readonly unmortgagedPropertiesCount?: number;
  readonly onIssueBond?: (trancheId?: BondTrancheId) => void;
  readonly onRepayBond?: () => void;
}

export function BondIssuanceTab({
  bondContract,
  balance,
  isMyTurn,
  playerNetWorth = 0,
  unmortgagedPropertiesCount = 0,
  onIssueBond,
  onRepayBond,
}: BondIssuanceTabProps): React.ReactElement {
  const [selectedTranche, setSelectedTranche] = useState<BondTrancheId>(BondTrancheId.WORKING_CAPITAL);

  if (bondContract?.isActive) {
    const canRepay = balance >= bondContract.repayAmount && Boolean(isMyTurn);
    const activeTrancheName = bondContract.trancheId ? BOND_TRANCHES[bondContract.trancheId]?.name : 'Trái Phiếu Doanh Nghiệp';

    return (
      <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900">
        <div className="flex items-center justify-between border-b border-amber-900/10 pb-2">
          <div>
            <h4 className="font-black text-sm text-amber-950 uppercase">Hợp Đồng Trái Phiếu Đang Hoạt Động</h4>
            <span className="text-[11px] font-bold text-amber-800">{activeTrancheName}</span>
          </div>
          <span className="text-xs bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full font-bold">
            Còn {bondContract.roundsLeft} vòng
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><span className="text-slate-500">Khoản Vay Gốc:</span> <strong className="font-mono">{formatCurrency(bondContract.principal)}</strong></div>
          <div><span className="text-slate-500">Số Tiền Đáo Hạn:</span> <strong className="font-mono text-rose-700">{formatCurrency(bondContract.repayAmount)}</strong></div>
          <div className="col-span-2"><span className="text-slate-500">Tài Sản Đảm Bảo:</span> <strong>{bondContract.collateralCells.length} BĐS (Đang Khóa)</strong></div>
        </div>
        <button
          type="button"
          onClick={onRepayBond}
          disabled={!canRepay}
          className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
            canRepay
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-emerald-800 shadow-[0_4px_0_0_#065f46] active:translate-y-[3px] cursor-pointer'
              : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
          }`}
        >
          {`Tất Toán Trước Hạn (${formatCurrency(bondContract.repayAmount)})`}
        </button>
      </div>
    );
  }

  const hasNetWorth = playerNetWorth >= 3000;
  const hasEnoughDeeds = unmortgagedPropertiesCount >= 2;
  const canIssue = Boolean(isMyTurn) && hasNetWorth && hasEnoughDeeds;

  const blockedReason = !isMyTurn
    ? 'Chỉ có thể phát hành trong lượt của bạn'
    : !hasNetWorth
    ? 'Cần tối thiểu 3.000 Net Worth để phát hành trái phiếu'
    : !hasEnoughDeeds
    ? 'Cần sở hữu ít nhất 2 Bất Động Sản chưa thế chấp'
    : undefined;

  const trancheConfig = BOND_TRANCHES[selectedTranche];
  const loanPrincipal = Math.floor(playerNetWorth * trancheConfig.loanRatio);

  return (
    <div className="space-y-4 p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-slate-900 text-xs">
      <div className="border-b border-amber-900/10 pb-2">
        <h4 className="font-black text-sm text-amber-950 uppercase">Đòn Bẩy Trái Phiếu Doanh Nghiệp</h4>
        <p className="text-slate-600 mt-1">Chọn gói đòn bẩy vốn phù hợp với chiến lược tài chính của bạn.</p>
      </div>

      {/* 3 Tranches Cards: Dọc trên Mobile 360px, Ngang trên sm */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(Object.values(BOND_TRANCHES)).map((t) => {
          const isSelected = selectedTranche === t.id;
          const estPrincipal = Math.floor(playerNetWorth * t.loanRatio);
          const estInterest = Math.round(t.interestRate * 100);

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTranche(t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px] ${
                isSelected
                  ? 'border-amber-600 bg-amber-50 shadow-sm ring-2 ring-amber-400/50'
                  : 'border-slate-300 bg-white/80 hover:bg-white text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-slate-900">{t.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    t.id === BondTrancheId.ALL_IN ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {Math.round(t.loanRatio * 100)}% NW
                  </span>
                </div>
                <div className="mt-1 font-mono font-bold text-amber-950 text-sm">
                  {formatCurrency(estPrincipal)}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200 pt-1">
                <span>Kỳ hạn: <strong>{t.durationRounds} vòng</strong></span>
                <span>Lãi: <strong className="text-rose-600">+{estInterest}%</strong></span>
              </div>
            </button>
          );
        })}
      </div>

      <ul className="space-y-1.5 list-disc pl-4 text-slate-700 text-[11px]">
        <li>Tối thiểu Net Worth 3.000 (Hiện có: <strong className="font-mono">{formatCurrency(playerNetWorth)}</strong>).</li>
        <li>Sở hữu ít nhất 2 Bất Động Sản chưa thế chấp (Hiện có: <strong>{unmortgagedPropertiesCount} BĐS</strong>).</li>
        <li>Tài sản đảm bảo được ưu tiên chọn từ các ô đất rẻ nhất; vẫn được <strong>thu tiền thuê 100%</strong>.</li>
      </ul>

      {blockedReason && (
        <div
          data-testid="bond-blocked-notice"
          className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-semibold flex items-center gap-1.5"
        >
          <span>⚠️</span>
          <span>{blockedReason}</span>
        </div>
      )}

      <button
        type="button"
        data-testid="issue-bond-btn"
        onClick={() => canIssue && onIssueBond?.(selectedTranche)}
        disabled={!canIssue}
        className={`w-full min-h-[46px] py-2.5 px-4 rounded-xl font-black text-xs transition-all ${
          canIssue
            ? 'bg-amber-500 hover:bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_4px_0_0_#b45309] active:translate-y-[3px] cursor-pointer'
            : 'bg-slate-200 text-slate-400 border border-slate-300 shadow-none cursor-not-allowed'
        }`}
      >
        {canIssue ? `PHÁT HÀNH ${trancheConfig.name.toUpperCase()} (+${formatCurrency(loanPrincipal)})` : 'PHÁT HÀNH TRÁI PHIẾU'}
      </button>
    </div>
  );
}
```

---

### 4. MA TRẬN KIỂM THỬ 18 ATOMIC TESTS (STATION 1: RED CONTRACT TESTS - C4)
Tập trung tại `tests/contracts/imp217_corporate_bond_tranches_and_pipeline.test.ts`:
* **Facet 1: Định nghĩa & Khởi tạo 3 Gói Tranches** ([TC-217.01] - [TC-217.04])
  - `[TC-217.01/MSS][UC-IMP217]` `BOND_TRANCHES` chứa đúng 3 gói `WORKING_CAPITAL`, `EXPANSION`, `ALL_IN`.
  - `[TC-217.02/MSS][UC-IMP217]` Khởi tạo hợp đồng `WORKING_CAPITAL`: vay 20% Net Worth, kỳ hạn 2 vòng, lãi 8%.
  - `[TC-217.03/MSS][UC-IMP217]` Khởi tạo hợp đồng `EXPANSION`: vay 40% Net Worth, kỳ hạn 3 vòng, lãi 15%.
  - `[TC-217.04/MSS][UC-IMP217]` Khởi tạo hợp đồng `ALL_IN`: vay 60% Net Worth, kỳ hạn 3 vòng, lãi 20%.
* **Facet 2: Thuật toán chọn tài sản bảo đảm tối ưu** ([TC-217.05] - [TC-217.08])
  - `[TC-217.05/MSS][UC-IMP217]` Gói 1 tự động chọn các ô đất rẻ nhất trước, không khóa các ô đắt đỏ.
  - `[TC-217.06/MSS][UC-IMP217]` Gói 2 tự động tích lũy đủ $\ge 120\%$ giá trị khoản vay và $\ge 2$ ô đất.
  - `[TC-217.07/MSS][UC-IMP217]` Gói 3 tự động khóa toàn bộ danh mục đất sạch chưa thế chấp.
  - `[TC-217.08/MSS][UC-IMP217]` Các ô đất ngoài danh mục bảo đảm vẫn được phép thế chấp hoặc chuyển nhượng P2P bình thường.
* **Facet 3: Bảo toàn ngân quỹ, Vòng đời & Xử lý vỡ nợ (C1, C4)** ([TC-217.09] - [TC-217.11c])
  - `[TC-217.09/MSS][UC-IMP217]` Gói 1 tất toán: Lãi 8% nộp đúng vào `room.treasury` (`repayAmount - principal`), không sinh tiền khống 20%.
  - `[TC-217.10/MSS][UC-IMP217]` Gói 2 tất toán: Lãi 15% nộp đúng vào `room.treasury`.
  - `[TC-217.11/MSS][UC-IMP217]` Khi vỡ nợ, chỉ các ô nằm trong `collateralCells` bị đưa vào `fireSaleQueue`, không tịch thu nhầm ô ngoài danh mục.
  - `[TC-217.11b/MSS][UC-IMP217]` **(C4)** `processBondTurnTransition`: `roundsLeft` giảm đúng 1 đơn vị sau mỗi lượt của con nợ (ví dụ Gói 2: 3 $\to$ 2 $\to$ 1).
  - `[TC-217.11c/MSS][UC-IMP217]` **(C4)** `processBondTurnTransition`: Kích hoạt tất toán hoặc phát mãi chính xác tại mốc `roundsLeft === 1`, không trigger non khi `roundsLeft > 1`.
* **Facet 4: Dây Nối Pipeline Từ Server Intent Đến Client Wire** ([TC-217.12] - [TC-217.14])
  - `[TC-217.12/MSS][UC-IMP217]` `INTENT_ISSUE_BOND` truyền `trancheId` được server bóc tách và thực thi chính xác.
  - `[TC-217.13/MSS][UC-IMP217]` `modal_host.tsx` tính toán và truyền đúng `playerNetWorth` thực tế (không còn bị `undefined`).
  - `[TC-217.14/MSS][UC-IMP217]` `PropertyPortfolioModal` truyền toàn vẹn `playerNetWorth`, `unmortgagedPropertiesCount` xuống `BondIssuanceTab`.
* **Facet 5: Công Thái Học & Trạng Thái Giao Diện 3 Gói (UI Affordance)** ([TC-217.15] - [TC-217.16])
  - `[TC-217.15/MSS][UC-IMP217]` `BondIssuanceTab` render bố cục `grid-cols-1 sm:grid-cols-3` an toàn trên mobile 360px.
  - `[TC-217.16/MSS][UC-IMP217]` Thẻ cảnh báo `bond-blocked-notice` biến mất khi người chơi đủ điều kiện, nút bấm active với touch target `min-h-[46px]`.

---

### 5. KẾ HOẠCH BÀO CHỮA & THẨM ĐỊNH (DEFENSE PLAN)
1. **Adversarial Inversion**: Station 1 tạo test `imp217_corporate_bond_tranches_and_pipeline.test.ts` và chứng minh RED 100%.
2. **Triển khai Station 2**: Implementer áp dụng đúng 6 snippets trên theo đúng thứ tự 1 $\to$ 6.
3. **Station 2.5 Scout**: Quét 5 nguyên mẫu lỗi, đối soát LOC ngân sách (< 400 LOC Tier 1, < 500 LOC Tier 2).
4. **Station 3**: Phê duyệt độc lập từ `spec-reviewer`, `code-reviewer`, `ui-craft-reviewer`.

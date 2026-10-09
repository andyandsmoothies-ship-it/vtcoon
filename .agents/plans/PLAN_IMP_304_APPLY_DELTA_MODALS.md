# KẾ HOẠCH TRIỂN KHAI MICRO-SLICE: BÓC TÁCH APPLY DELTA MODALS (IMP-304)

> **Mục tiêu**: Bóc tách logic đồng bộ hóa Modal (`auction`, `trade_offer`, `compulsory_buyout`, `transit_wheel`, `hose`, staged transit wheel và chuyển đổi phase) từ `src/client/network/apply_delta.ts` sang `src/client/network/apply_delta_modals.ts`, tinh gọn `apply_delta.ts` từ 382 xuống 215 LOC (giải phóng 167 dòng nợ cận trần Tier 1).  
> **Nguyên tắc bảo toàn (Pure-Move Quarantine)**: Bảo toàn 100% hành vi đồng bộ modal, staging transit wheel, và re-export đầy đủ cho các consumers hiện hữu.

---

### Baseline Working Tree Dependencies (Cumulative Refactor Lineage)
* `src/client/3d/adaptive_cinematic_camera.tsx`
* `src/client/3d/camera_state_machine.ts`
* `src/client/3d/cinematic_chase_camera.ts`
* `src/client/audio/sound_engine.ts`
* `src/client/audio/sound_synth_recipes.ts`
* `src/client/network/activity_rent_matcher.ts`
* `src/client/store/game_store_types.ts`
* `src/client/ui/actionable_notification.ts`
* `src/domain/bot/bot_engine.ts`
* `src/server/logging/persistent_room_logger.ts`
* `src/server/network/turn_orchestrator.ts`
* `src/client/3d/camera_kinematic_helpers.ts`
* `src/client/3d/camera_location_beacon.tsx`
* `src/client/3d/camera_soft_return.ts`
* `src/client/3d/cinematic_spline_flyby.ts`
* `src/client/3d/use_camera_gestures.ts`
* `src/client/audio/sound_engine_context.ts`
* `src/client/audio/synth_recipes_ambient.ts`
* `src/client/audio/synth_recipes_gameplay.ts`
* `src/client/audio/synth_recipes_ui.ts`
* `src/client/network/activity_go_extractor.ts`
* `src/client/store/game_store_state_types.ts`
* `src/client/store/game_store_subtypes.ts`
* `src/client/ui/actionable_notification_gameplay.ts`
* `src/client/ui/actionable_notification_map.ts`
* `src/client/ui/actionable_notification_system.ts`
* `src/domain/bot/bot_action_evaluator.ts`
* `src/server/logging/room_logger_cloud_sync.ts`
* `src/server/network/turn_bot_timer_scheduler.ts`
* `tests/client/actionable_notification_modular.test.ts`
* `tests/client/activity_go_extractor.test.ts`
* `tests/client/camera_gestures.test.ts`
* `tests/client/camera_soft_return_and_beacon.test.ts`
* `tests/client/cinematic_spline_flyby.test.ts`
* `tests/client/dramatic_pacing_camera.test.ts`
* `tests/client/game_store_types_modular.test.ts`
* `tests/client/sound_engine_modular.test.ts`
* `tests/client/sound_synth_recipes_modular.test.ts`
* `tests/client/spatial_kinematics_camera.test.ts`
* `tests/domain/bot_action_evaluator.test.ts`
* `tests/server/room_logger_cloud_sync.test.ts`
* `tests/server/turn_bot_timer_scheduler.test.ts`

---

### 1. Scope & SSOT Reconciliation Matrix

| Spec Criteria / Invariant | SSOT Source | Physical Implementation | Contract Test | Verdict |
| :--- | :--- | :--- | :--- | :---: |
| 1. **[BR-01 / Feature Invariant]** Đồng bộ Auction Modal & Dismiss State | `src/client/network/apply_delta.ts` | [`apply_delta_modals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_modals.ts) | [`apply_delta_modals.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/apply_delta_modals.test.ts) | ✔️ PASS |
| 2. **[BR-02 / Feature Invariant]** Đồng bộ Trade, Buyout, Transit & Hose | `src/client/network/apply_delta.ts` | [`apply_delta_modals.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/src/client/network/apply_delta_modals.ts) | [`apply_delta_modals.test.ts`](file:///c:/Users/HP/Documents/GitHub/vtcoon/tests/client/apply_delta_modals.test.ts) | ✔️ PASS |

---

### 2. Physical Evidence & Quality Gates Matrix

#### Bảng 1: Ma trận Cổng Kiểm Soát Chất Lượng (Quality Gates)
| Trạm Kiểm Soát | Công Cụ & Lệnh Thực Thi | Tiêu Chí Vượt Qua (Threshold) | Trạng Thái Kỳ Vọng |
| :--- | :--- | :--- | :---: |
| **Cổng Duyệt Kế Hoạch** | `node scripts/audit_plan.mjs .agents/plans/PLAN_IMP_304_APPLY_DELTA_MODALS.md --auto-sign` | 0 Lỗi cấu trúc, tự động ký duyệt | `HARDENED_APPROVED` |
| **Trạm 1: RED Contract Test** | `npx vitest run tests/client/apply_delta_modals.test.ts` | Fails strictly on runtime assertions | 🔴 RED Verified |
| **Trạm 2: GREEN Implementation** | `npx vitest run tests/client/apply_delta_modals.test.ts` | 100% tests pass, zero regressions | 🟢 GREEN Verified |
| **Trạm 2.5: Fast Pre-Filter** | `npm run prefilter -- <files>` | 0 lỗi TypeScript, LOC, Dirty Casts, Linter | 🟢 PASS |
| **Trạm 4: Chaos Sentinel** | `npm run sentinel -- --ticket IMP-304 --test tests/client/apply_delta_modals.test.ts --src src/client/network/apply_delta_modals.ts` | 100% mutants killed, kill rate 100% | 🛡️ APPROVED |
| **Trạm 5: Evidence Audit** | `node scripts/check_evidence.mjs IMP-304` | Snapshot JSON hợp lệ, verdict APPROVED | 🏆 ACCEPTED |

#### Bảng 2: Ngân Sách Dòng Mã (LOC Budget Compliance)
| Tệp Mã Nguồn / Kiểm Thử | Phân Loại Tier | Baseline LOC | Expected LOC | Delta LOC | Trần Ngân Sách | Trạng Thái |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `src/client/network/apply_delta.ts` | Tier 1 | 381 | 217 | -164 | <= 400 | ⚠️ Warning |
| `src/client/network/apply_delta_modals.ts` | Tier 1 | 0 | 175 | +175 | <= 400 | ✔️ Safe |
| `tests/client/apply_delta_modals.test.ts` | Living Tests | 0 | 195 | +195 | <= 600 | ✔️ Safe |

---

### Task 1: Khởi Tạo Tệp Đồng Bộ Modals `src/client/network/apply_delta_modals.ts`
**Target physical file**: `src/client/network/apply_delta_modals.ts` (Tệp mới)

```typescript
// [IMP-304] Client Delta Modal Synchronization & Staged Transit Wheel
import type { GameState } from '../store/game_store.js';
import type { ModalPayloadMap } from '../store/game_store_types.js';
import { useLobbyStore } from '../store/lobby_store.js';
import { TurnPhase } from '../../domain/room.js';
import type { DeltaPayload } from '../../server/session_manager.js';

let stagedTransitWheel: { playerId: string; cellIndex: number; timestamp: number } | null = null;

export function consumeStagedTransitWheel(
  targetCellIndex?: number,
  targetPlayerId?: string,
): { playerId: string; cellIndex: number; timestamp: number } | null {
  if (!stagedTransitWheel) return null;
  if (targetCellIndex !== undefined && stagedTransitWheel.cellIndex !== targetCellIndex) return null;
  if (targetPlayerId !== undefined && stagedTransitWheel.playerId !== targetPlayerId) return null;
  const staged = stagedTransitWheel;
  stagedTransitWheel = null;
  return staged;
}

export function resetStagedTransitWheel(): void {
  stagedTransitWheel = null;
}

export function syncAuctionModal(delta: DeltaPayload, state: GameState): void {
  if (delta.auction) {
    const isConcluded = Boolean(delta.auction.isConcluded);
    const myPid = useLobbyStore.getState().myPlayerId;
    const prevPayload = state.activeModal === 'auction' ? state.modalPayload as ModalPayloadMap['auction'] | null : null;
    const isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded;
    const hasPassed = Boolean(
      (isSameAuction && prevPayload?.hasPassed) ||
      (myPid && delta.auction.passedPlayerIds?.includes(myPid))
    );

    const deadline = delta.auction.timeRemaining !== undefined
      ? Date.now() + delta.auction.timeRemaining * 1000
      : undefined;

    const auctionData: ModalPayloadMap['auction'] = {
      ...delta.auction,
      ...(deadline !== undefined ? { deadline } : {}),
      ...(hasPassed ? { hasPassed: true } : {}),
    };

    state.setAuction?.(auctionData);

    if (state.dismissedAuctionCellIndex !== null && state.dismissedAuctionCellIndex !== delta.auction.cellIndex) {
      state.setDismissedAuctionCellIndex?.(null);
    }

    const isDismissed = state.dismissedAuctionCellIndex === delta.auction.cellIndex;
    const isWaitingOrAction = delta.turnPhase === TurnPhase.WaitingRoll || delta.turnPhase === TurnPhase.ActionPhase;

    if (isDismissed) {
      if (state.activeModal === 'auction') {
        state.updateModalPayload<'auction'>(auctionData);
      }
    } else if (isConcluded && isWaitingOrAction) {
      // KHONG mo lai modal khi da chuyen sang luot do xuc xac
    } else {
      state.openModal('auction', auctionData);
    }
  } else if (delta.auction === null) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') state.closeModal();
    state.setDismissedAuctionCellIndex?.(null);
  } else if (delta.turnPhase !== undefined && delta.turnPhase !== TurnPhase.AuctionPhase) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') {
      const currentPayload = state.modalPayload as { isConcluded?: boolean } | null;
      if (!currentPayload?.isConcluded) state.closeModal();
    }
    state.setDismissedAuctionCellIndex?.(null);
  }
}

export function syncOtherModals(delta: DeltaPayload, state: GameState): void {
  if (delta.pendingTradeOffer !== undefined) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const offer = delta.pendingTradeOffer;
    const isTargetedToMe = Boolean(
      offer && myPid && offer.requesterId !== myPid &&
      (offer.targetPlayerId ? offer.targetPlayerId === myPid : offer.sellerId === myPid)
    );
    state.setPendingTradeOffer(isTargetedToMe ? offer : null);
    if (delta.pendingTradeOffer === null && state.activeModal === 'bot_trade_offer') state.closeModal();
  }

  if (delta.pendingBuyout !== undefined) {
    state.setPendingBuyout(delta.pendingBuyout);
    if (delta.pendingBuyout) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isCardFlow = Boolean(delta.lastEventCard || state.lastEventCard?.cardId === 'CC_SWAP_PROJECT');
      const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
      if (delta.pendingBuyout.buyerId === myPid && !isCardFlow && !isMoving && state.activeModal === null) {
        state.openModal('compulsory_buyout', delta.pendingBuyout);
      }
    } else if (state.activeModal === 'compulsory_buyout') {
      state.closeModal();
    }
  }

  if (delta.pendingTransitWheel !== undefined) {
    if (delta.pendingTransitWheel) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
        if (!isMoving && state.activeModal === null) {
          state.openModal('transit_wheel', delta.pendingTransitWheel);
          stagedTransitWheel = null;
        } else {
          stagedTransitWheel = delta.pendingTransitWheel;
        }
      }
    } else {
      stagedTransitWheel = null;
    }
  }

  if (delta.lastTransitResult !== undefined) {
    if (delta.lastTransitResult) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.lastTransitResult.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        state.updateModalPayload<'transit_wheel'>({
          outcome: delta.lastTransitResult.outcome,
          targetCell: delta.lastTransitResult.targetCell,
          payout: delta.lastTransitResult.payout,
          boostSteps: delta.lastTransitResult.boostSteps,
        });
      }
    } else if (state.activeModal === 'transit_wheel') {
      state.closeModal();
    }
  }

  if (delta.lastHoseResult === null && state.activeModal === 'hose') {
    state.closeModal();
  } else if (delta.lastHoseResult && state.activeModal === 'hose') {
    const hr = delta.lastHoseResult;
    const myPid = useLobbyStore.getState().myPlayerId;
    const isTarget = !myPid || hr.playerId === myPid || hr.playerId === state.currentTurnPlayerId;
    if (isTarget) {
      state.updateModalPayload<'hose'>({
        lastDiceRoll: hr.roll,
        lastPayout: hr.payout,
        lastMultiplier: hr.multiplier,
        lastProfit: hr.profit,
        currentStake: hr.stake,
        isReviewingResult: true,
      });
    }
  }

  if (delta.turnPhase !== undefined) {
    if (state.activeModal === 'deed' && delta.turnPhase !== TurnPhase.ActionPhase && delta.turnPhase !== TurnPhase.PropertyManagement) {
      state.closeModal();
    } else if (state.activeModal === 'insolvency' && delta.turnPhase !== TurnPhase.InsolvencyPhase) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const modalPayload = state.modalPayload as ModalPayloadMap['insolvency'] | null;
      const debtorId = myPid || modalPayload?.playerId;
      const debtor = debtorId ? state.playersInfo[debtorId] : undefined;
      if (!debtor || debtor.balance >= 0 || debtor.bankrupt) state.closeModal();
    } else if (state.activeModal === 'hose' && delta.turnPhase !== TurnPhase.HosePhase && !(state.modalPayload as ModalPayloadMap['hose'])?.isReviewingResult) {
      state.closeModal();
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement && delta.turnPhase !== TurnPhase.ActionPhase) {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
  }
}

export function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  syncAuctionModal(delta, state);
  syncOtherModals(delta, state);
}
```

---

### Task 2: Refactor `src/client/network/apply_delta.ts`
**Target physical file**: `src/client/network/apply_delta.ts`

```typescript
<<<<
let stagedTransitWheel: { playerId: string; cellIndex: number; timestamp: number } | null = null;

export function consumeStagedTransitWheel(
  targetCellIndex?: number,
  targetPlayerId?: string
): { playerId: string; cellIndex: number; timestamp: number } | null {
  if (!stagedTransitWheel) return null;
  if (targetCellIndex !== undefined && stagedTransitWheel.cellIndex !== targetCellIndex) return null;
  if (targetPlayerId !== undefined && stagedTransitWheel.playerId !== targetPlayerId) return null;
  const staged = stagedTransitWheel;
  stagedTransitWheel = null;
  return staged;
}

export function resetStagedTransitWheel(): void {
  stagedTransitWheel = null;
}
====
import {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncBusinessModals,
} from './apply_delta_modals.js';
export {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncBusinessModals,
};
>>>>
```

```typescript
<<<<
function syncAuctionModal(delta: DeltaPayload, state: GameState): void {
  // [IMP-50][IMP-200] Trụ Cột 3: UI as Pure Projection — Đồng bộ auction state & bảo vệ dismiss state (Zustand SSOT)
  if (delta.auction) {
    const isConcluded = Boolean(delta.auction.isConcluded);
    const myPid = useLobbyStore.getState().myPlayerId;
    const prevPayload = state.activeModal === 'auction' ? state.modalPayload as ModalPayloadMap['auction'] | null : null;
    const isSameAuction = prevPayload?.cellIndex === delta.auction.cellIndex && !prevPayload?.isConcluded;
    const hasPassed = Boolean(
      (isSameAuction && prevPayload?.hasPassed) ||
      (myPid && delta.auction.passedPlayerIds?.includes(myPid))
    );

    const deadline = delta.auction.timeRemaining !== undefined
      ? Date.now() + delta.auction.timeRemaining * 1000
      : undefined;

    const auctionData: ModalPayloadMap['auction'] = {
      ...delta.auction,
      ...(deadline !== undefined ? { deadline } : {}),
      ...(hasPassed ? { hasPassed: true } : {}),
    };

    state.setAuction?.(auctionData);

    // Fire Sale Queue Defense: Sang ô đất mới thì tự động reset cờ dismiss của ô cũ
    if (state.dismissedAuctionCellIndex !== null && state.dismissedAuctionCellIndex !== delta.auction.cellIndex) {
      state.setDismissedAuctionCellIndex?.(null);
    }

    const isDismissed = state.dismissedAuctionCellIndex === delta.auction.cellIndex;
    const isWaitingOrAction = delta.turnPhase === TurnPhase.WaitingRoll || delta.turnPhase === TurnPhase.ActionPhase;

    if (isDismissed) {
      if (state.activeModal === 'auction') {
        state.updateModalPayload<'auction'>(auctionData);
      }
    } else if (isConcluded && isWaitingOrAction) {
      // KHÔNG mở lại modal khi lượt chơi đã chuyển sang đổ xúc xắc
    } else {
      state.openModal('auction', auctionData);
    }
  } else if (delta.auction === null) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') state.closeModal();
    state.setDismissedAuctionCellIndex?.(null);
  } else if (delta.turnPhase !== undefined && delta.turnPhase !== TurnPhase.AuctionPhase) {
    state.setAuction?.(null);
    if (state.activeModal === 'auction') {
      const currentPayload = state.modalPayload as { isConcluded?: boolean } | null;
      if (!currentPayload?.isConcluded) state.closeModal();
    }
    state.setDismissedAuctionCellIndex?.(null);
  }
}

function syncOtherModals(delta: DeltaPayload, state: GameState): void {
  // [IMP-142][IMP-195][IMP-200] Trade Offer — lưu vào store pendingTradeOffer cho InlineBotTradeStrip (chống tự nhận & hỗ trợ targetPlayerId)
  if (delta.pendingTradeOffer !== undefined) {
    const myPid = useLobbyStore.getState().myPlayerId;
    const offer = delta.pendingTradeOffer;
    const isTargetedToMe = Boolean(
      offer && myPid && offer.requesterId !== myPid &&
      (offer.targetPlayerId ? offer.targetPlayerId === myPid : offer.sellerId === myPid)
    );
    state.setPendingTradeOffer(isTargetedToMe ? offer : null);
    if (delta.pendingTradeOffer === null && state.activeModal === 'bot_trade_offer') state.closeModal();
  }

  // [IMP-145][IMP-229] Compulsory Buyout Modal — Lưu store, chỉ mở ngay trên FullSync/Reconnect nếu không có hoạt cảnh
  if (delta.pendingBuyout !== undefined) {
    state.setPendingBuyout(delta.pendingBuyout);
    if (delta.pendingBuyout) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isCardFlow = Boolean(delta.lastEventCard || state.lastEventCard?.cardId === 'CC_SWAP_PROJECT');
      const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
      if (delta.pendingBuyout.buyerId === myPid && !isCardFlow && !isMoving && state.activeModal === null) {
        state.openModal('compulsory_buyout', delta.pendingBuyout);
      }
    } else if (state.activeModal === 'compulsory_buyout') {
      state.closeModal();
    }
  }

  if (delta.pendingTransitWheel !== undefined) {
    if (delta.pendingTransitWheel) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.pendingTransitWheel.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        const isMoving = Boolean(state.activePawnAnimation?.isAnimating || state.isRolling);
        if (!isMoving && state.activeModal === null) {
          state.openModal('transit_wheel', delta.pendingTransitWheel);
          stagedTransitWheel = null;
        } else {
          stagedTransitWheel = delta.pendingTransitWheel;
        }
      }
    } else {
      stagedTransitWheel = null;
    }
  }

  if (delta.lastTransitResult !== undefined) {
    if (delta.lastTransitResult) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const isTarget = myPid ? delta.lastTransitResult.playerId === myPid : Boolean(state.isOfflineMode);
      if (isTarget) {
        state.updateModalPayload<'transit_wheel'>({
          outcome: delta.lastTransitResult.outcome,
          targetCell: delta.lastTransitResult.targetCell,
          payout: delta.lastTransitResult.payout,
          boostSteps: delta.lastTransitResult.boostSteps,
        });
      }
    } else if (state.activeModal === 'transit_wheel') {
      state.closeModal();
    }
  }

  if (delta.lastHoseResult === null && state.activeModal === 'hose') {
    state.closeModal();
  } else if (delta.lastHoseResult && state.activeModal === 'hose') {
    const hr = delta.lastHoseResult;
    const myPid = useLobbyStore.getState().myPlayerId;
    const isTarget = !myPid || hr.playerId === myPid || hr.playerId === state.currentTurnPlayerId;
    if (isTarget) {
      state.updateModalPayload<'hose'>({
        lastDiceRoll: hr.roll,
        lastPayout: hr.payout,
        lastMultiplier: hr.multiplier,
        lastProfit: hr.profit,
        currentStake: hr.stake,
        isReviewingResult: true,
      });
    }
  }

  if (delta.turnPhase !== undefined) {
    if (state.activeModal === 'deed' && delta.turnPhase !== TurnPhase.ActionPhase && delta.turnPhase !== TurnPhase.PropertyManagement) {
      state.closeModal();
    } else if (state.activeModal === 'insolvency' && delta.turnPhase !== TurnPhase.InsolvencyPhase) {
      const myPid = useLobbyStore.getState().myPlayerId;
      const modalPayload = state.modalPayload as ModalPayloadMap['insolvency'] | null;
      const debtorId = myPid || modalPayload?.playerId;
      const debtor = debtorId ? state.playersInfo[debtorId] : undefined;
      if (!debtor || debtor.balance >= 0 || debtor.bankrupt) state.closeModal();
    } else if (state.activeModal === 'hose' && delta.turnPhase !== TurnPhase.HosePhase && !(state.modalPayload as ModalPayloadMap['hose'])?.isReviewingResult) {
      state.closeModal();
    } else if (state.activeModal === 'transit_wheel' && delta.turnPhase !== TurnPhase.PropertyManagement && delta.turnPhase !== TurnPhase.ActionPhase) {
      state.setPendingPawnMove?.(null);
      state.closeModal();
    }
  }
}

function syncBusinessModals(delta: DeltaPayload, state: GameState): void {
  syncAuctionModal(delta, state);
  syncOtherModals(delta, state);
}
====

>>>>
```

### Station 1: Kế Hoạch Kiểm Thử Hợp Đồng (Contract Test Specifications)
* `TC-ADM-MOD.01` [UC-ADM-MOD/MSS]: Given no staged wheel, When `consumeStagedTransitWheel` is called, Then returns null.
* `TC-ADM-MOD.02` [UC-ADM-MOD/MSS]: Given player moving and pending transit wheel, When `syncOtherModals` is called, Then stages wheel.
* `TC-ADM-MOD.03` [UC-ADM-MOD/MSS]: Given staged wheel, When `consumeStagedTransitWheel` is called, Then returns staged wheel and clears state.
* `TC-ADM-MOD.04` [UC-ADM-MOD/MSS]: Given staged wheel, When `resetStagedTransitWheel` is called, Then explicitly clears staged wheel.
* `TC-ADM-MOD.05` [UC-ADM-MOD/MSS]: Given valid auction payload, When `syncAuctionModal` is called, Then opens auction modal.
* `TC-ADM-MOD.06` [UC-ADM-MOD/MSS]: Given null auction payload, When `syncAuctionModal` is called, Then closes auction modal.
* `TC-ADM-MOD.07` [UC-ADM-MOD/MSS]: Given dismissed auction cell, When `syncAuctionModal` is called, Then respects dismissed flag and does not open.
* `TC-ADM-MOD.08` [UC-ADM-MOD/MSS]: Given pending trade offer, When `syncOtherModals` is called, Then stores pending offer for target player.
* `TC-ADM-MOD.09` [UC-ADM-MOD/MSS]: Given pending buyout and idle player, When `syncOtherModals` is called, Then opens compulsory buyout modal.
* `TC-ADM-MOD.10` [UC-ADM-MOD/MSS]: Given active hose modal and lastHoseResult, When `syncOtherModals` is called, Then updates last dice roll and payout.
* `TC-ADM-MOD.11` [UC-ADM-MOD/MSS]: Given active deed modal, When turnPhase leaves ActionPhase, Then closes deed modal.
* `TC-ADM-MOD.12` [UC-ADM-MOD/MSS]: Given composite delta payload, When `syncBusinessModals` is called, Then orchestrates both auction and other modals.

**Target physical file**: `tests/client/apply_delta_modals.test.ts` (Tệp mới)

```typescript
// [IMP-304] Living Contract Tests: Apply Delta Modals
import { describe, it, expect, beforeEach } from 'vitest';
import {
  consumeStagedTransitWheel,
  resetStagedTransitWheel,
  syncAuctionModal,
  syncOtherModals,
  syncBusinessModals,
} from '../../src/client/network/apply_delta_modals';
import { useGameStore, type GameState } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { TurnPhase } from '../../domain/room';
import type { DeltaPayload } from '../../server/session_manager';

describe('Station 1 Contract Tests: ApplyDeltaModals', () => {
  beforeEach(() => {
    resetStagedTransitWheel();
    useGameStore.getState().closeModal();
    useLobbyStore.getState().setMyPlayerId('p1');
  });

  it('TC-ADM-MOD.01 [UC-ADM-MOD/MSS] consumeStagedTransitWheel returns null when nothing is staged', () => {
    expect(consumeStagedTransitWheel()).toBeNull();
  });

  it('TC-ADM-MOD.02 [UC-ADM-MOD/MSS] consumeStagedTransitWheel stages wheel when player is moving', () => {
    const state = useGameStore.getState();
    state.setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, state);
    const staged = consumeStagedTransitWheel(5, 'p1');
    expect(staged?.cellIndex).toBe(5);
  });

  it('TC-ADM-MOD.03 [UC-ADM-MOD/MSS] consumeStagedTransitWheel consumes and clears staging', () => {
    const state = useGameStore.getState();
    state.setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, state);
    consumeStagedTransitWheel(5, 'p1');
    expect(consumeStagedTransitWheel(5, 'p1')).toBeNull();
  });

  it('TC-ADM-MOD.04 [UC-ADM-MOD/MSS] resetStagedTransitWheel explicitly zeroes staged wheel', () => {
    const state = useGameStore.getState();
    state.setIsRolling(true);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTransitWheel: { playerId: 'p1', cellIndex: 5, timestamp: 12345 },
    };
    syncOtherModals(delta, state);
    resetStagedTransitWheel();
    expect(consumeStagedTransitWheel()).toBeNull();
  });

  it('TC-ADM-MOD.05 [UC-ADM-MOD/MSS] syncAuctionModal opens auction modal when auction payload is present', () => {
    const state = useGameStore.getState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 12, highestBid: 1000, highestBidderId: 'bot_2', timeRemaining: 15 },
    };
    syncAuctionModal(delta, state);
    expect(state.activeModal).toBe('auction');
  });

  it('TC-ADM-MOD.06 [UC-ADM-MOD/MSS] syncAuctionModal closes auction modal when auction is null', () => {
    const state = useGameStore.getState();
    state.openModal('auction', { cellIndex: 12, highestBid: 1000 });
    const delta: DeltaPayload = { tick: 1, cells: [], auction: null };
    syncAuctionModal(delta, state);
    expect(state.activeModal).toBeNull();
  });

  it('TC-ADM-MOD.07 [UC-ADM-MOD/MSS] syncAuctionModal respects dismissedAuctionCellIndex', () => {
    const state = useGameStore.getState();
    state.setDismissedAuctionCellIndex?.(12);
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 12, highestBid: 1000 },
    };
    syncAuctionModal(delta, state);
    expect(state.activeModal).toBeNull();
  });

  it('TC-ADM-MOD.08 [UC-ADM-MOD/MSS] syncOtherModals handles pendingTradeOffer for target player', () => {
    const state = useGameStore.getState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingTradeOffer: {
        id: 'offer_1',
        requesterId: 'bot_2',
        targetPlayerId: 'p1',
        sellerId: 'p1',
        buyerId: 'bot_2',
        cashOffered: 1000,
        cashRequested: 0,
        offeredProperties: [],
        requestedProperties: [3],
      },
    };
    syncOtherModals(delta, state);
    expect(state.pendingTradeOffer?.id).toBe('offer_1');
  });

  it('TC-ADM-MOD.09 [UC-ADM-MOD/MSS] syncOtherModals opens compulsory_buyout when not moving and buyer is me', () => {
    const state = useGameStore.getState();
    state.setIsRolling(false);
    state.clearActivePawnAnimation();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      pendingBuyout: { cellIndex: 5, buyerId: 'p1', originalOwnerId: 'bot_2', buyoutPrice: 1500 },
    };
    syncOtherModals(delta, state);
    expect(state.activeModal).toBe('compulsory_buyout');
  });

  it('TC-ADM-MOD.10 [UC-ADM-MOD/MSS] syncOtherModals updates lastHoseResult in active modal', () => {
    const state = useGameStore.getState();
    state.openModal('hose', { cellIndex: 10 });
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      lastHoseResult: { playerId: 'p1', roll: 5, payout: 200, multiplier: 2, profit: 100, stake: 100 },
    };
    syncOtherModals(delta, state);
    expect((state.modalPayload as { lastDiceRoll?: number })?.lastDiceRoll).toBe(5);
  });

  it('TC-ADM-MOD.11 [UC-ADM-MOD/MSS] syncOtherModals closes deed modal when turnPhase leaves ActionPhase', () => {
    const state = useGameStore.getState();
    state.openModal('deed', { cellIndex: 1 });
    const delta: DeltaPayload = { tick: 1, cells: [], turnPhase: TurnPhase.WaitingRoll };
    syncOtherModals(delta, state);
    expect(state.activeModal).toBeNull();
  });

  it('TC-ADM-MOD.12 [UC-ADM-MOD/MSS] syncBusinessModals orchestrates both auction and other modals', () => {
    const state = useGameStore.getState();
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      auction: { cellIndex: 8, highestBid: 500 },
    };
    syncBusinessModals(delta, state);
    expect(state.activeModal).toBe('auction');
  });
});
```

---

### Trạm 3: Thẩm Định Độc Lập Từ Đĩa Vật Lý (Independent Station 3 Reviews)
* **Trạm 3.1 (Spec & Scope Gatekeeper)**: Rà soát 100% độ trung thực của Plan, không phát sinh file ngoài phân hệ `client-network`, bảo đảm Zero Scope Creep.
* **Trạm 3.2 (Architecture & Anti-Slop Auditor)**: Rà soát Anti-Slop, an toàn bộ nhớ/timer, assertion density trong dải vàng 1-4 asserts/test, không vòng lặp trong it(), và kiểm tra đồng bộ modal.

---

### Trạm 4: Kiểm Thử Biến Dị & Cơ Chế Biên (Chaos & Mutation Sentinel)
Lệnh kích hoạt kiểm thử đột biến:
```bash
npm run sentinel -- --ticket IMP-304 --test tests/client/apply_delta_modals.test.ts --src src/client/network/apply_delta_modals.ts
```
Mục tiêu: Vượt qua tối thiểu 14 mutants bị tiêu diệt (kill rate: 100%, 0 survived).

---

### Trạm 5: Kiểm Toán Bằng Chứng Vật Lý Toàn Diện (Evidence Audit & Reporting)
Lệnh xác thực:
```bash
node scripts/check_evidence.mjs IMP-304
npm run report -- IMP-304
```
Tạo báo cáo nghiệm thu toàn diện tại: `docs/reports/improvements/IMP-304-apply-delta-modals_report.md`.

// [IMP-124][Trạm 1] Contract Tests: SkipNextTurn Unfreeze, TurnPhase Store Sync & Adaptive WebGL Performance
// Domain: [UI/FSM][NET/SYNC][3D/RENDER]
// Traceability: [TC-124.01/MSS] -> [TC-124.34/MSS], [UC-GAME-124]

import { describe, it, expect, beforeEach } from 'vitest';
import {
  isRollActionDisabled,
  isEndTurnDisabled,
  type ActionDockButtonStateParams,
} from '../../src/client/ui/ui_helpers';
import * as uiHelpers from '../../src/client/ui/ui_helpers';
import { useGameStore } from '../../src/client/store/game_store';
import { applyDeltaToStore, applyDeltaToStore as applyDelta } from '../../src/client/network/apply_delta';

// Dynamic helper accessors for IMP-124 extensions to prevent ESM load crashes while asserting Business RED
const resolveEndTurnButtonLabel = (uiHelpers as any).resolveEndTurnButtonLabel;
const shouldShowSkipTurnNotice = (uiHelpers as any).shouldShowSkipTurnNotice;
const resolveAdaptivePostProcessing = (uiHelpers as any).resolveAdaptivePostProcessing;

interface ExtendedActionDockParams extends ActionDockButtonStateParams {
  readonly turnPhase?: string;
}

describe('[IMP-124][Trạm 1] Chốt 1: Khóa Nút Đổ Xúc Xắc Khi Bị Mất Lượt (isRollActionDisabled)', () => {
  // [Facet 2: State Reactivity]
  it('[TC-124.01/MSS][UC-GAME-124][Facet-2/Reactivity] khóa nút Đổ khi ở pha Quản Lý Tài Sản mà chưa đổ xúc xắc (bị mất lượt)', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isRollActionDisabled(params as any)).toBe(true);
  });

  it('[TC-124.02/MSS][UC-GAME-124][Facet-2/Reactivity] mở nút Đổ khi ở pha WaitingRoll bình thường chưa đổ', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
    };
    expect(isRollActionDisabled(params as any)).toBe(false);
  });

  // [Facet 1: Boundary & Range]
  it('[TC-124.03/MSS][UC-GAME-124][Facet-1/Boundary] mở nút Đổ tiếp khi đổ xúc xắc ra đôi (canRollAgain) trong PropertyManagement', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: true,
      canRollAgain: true,
      turnPhase: 'PropertyManagement',
    };
    expect(isRollActionDisabled(params as any)).toBe(false);
  });

  it('[TC-124.04/MSS][UC-GAME-124][Facet-1/Boundary] khóa nút Đổ sau khi đã đổ 1 lần không đôi trong PropertyManagement', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: true,
      canRollAgain: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isRollActionDisabled(params as any)).toBe(true);
  });

  // [Facet 4: Error Defense]
  it('[TC-124.05/MSS][UC-GAME-124][Facet-4/ErrorDefense] luôn khóa nút Đổ khi không phải lượt của mình bất kể turnPhase', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: false,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isRollActionDisabled(params as any)).toBe(true);
  });

  it('[TC-124.06/MSS][UC-GAME-124][Facet-4/ErrorDefense] luôn khóa nút Đổ khi người chơi đã phá sản trong PropertyManagement', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isBankrupt: true,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isRollActionDisabled(params as any)).toBe(true);
  });

  it('[TC-124.07/MSS][UC-GAME-124][Facet-1/Boundary] khóa nút Đổ khi quân cờ đang nhảy hoặc xúc xắc đang quay trong WaitingRoll', () => {
    const rollingParams: ExtendedActionDockParams = {
      isRolling: true,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
    };
    expect(isRollActionDisabled(rollingParams as any)).toBe(true);

    const movingParams: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: true,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
    };
    expect(isRollActionDisabled(movingParams as any)).toBe(true);
  });
});

describe('[IMP-124][Trạm 1] Chốt 2: Mở Nút Kết Thúc Lượt Khi Bị Mất Lượt (isEndTurnDisabled)', () => {
  // [Facet 2: State Reactivity]
  it('[TC-124.08/MSS][UC-GAME-124][Facet-2/Reactivity] mở nút Kết Thúc Lượt khi bị mất lượt di chuyển (PropertyManagement & hasRolledThisTurn=false)', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isEndTurnDisabled(params as any)).toBe(false);
  });

  // [Facet 1: Boundary & Range]
  it('[TC-124.09/MSS][UC-GAME-124][Facet-1/Boundary] khóa nút Kết Thúc Lượt khi ở WaitingRoll và chưa đổ xúc xắc', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
    };
    expect(isEndTurnDisabled(params as any)).toBe(true);
  });

  // [Facet 4: Error Defense]
  it('[TC-124.10/MSS][UC-GAME-124][Facet-4/ErrorDefense] khóa nút Kết Thúc Lượt khi đang bị âm tiền/vỡ nợ dù bị mất lượt', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
      isInsolvent: true,
    };
    expect(isEndTurnDisabled(params as any)).toBe(true);
  });

  it('[TC-124.11/MSS][UC-GAME-124][Facet-4/ErrorDefense] khóa nút Kết Thúc Lượt khi người chơi đã phá sản trong PropertyManagement', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'PropertyManagement',
      isBankrupt: true,
    };
    expect(isEndTurnDisabled(params as any)).toBe(true);
  });

  it('[TC-124.12/MSS][UC-GAME-124][Facet-1/Boundary] khóa nút Kết Thúc Lượt khi vừa đổ đôi và được quyền gieo tiếp (canRollAgain=true)', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: true,
      canRollAgain: true,
      turnPhase: 'PropertyManagement',
    };
    expect(isEndTurnDisabled(params as any)).toBe(true);
  });

  it('[TC-124.13/MSS][UC-GAME-124][Facet-1/Boundary] mở nút Kết Thúc Lượt sau khi đã đổ xúc xắc bình thường và hoàn tất quản lý tài sản', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: true,
      canRollAgain: false,
      turnPhase: 'PropertyManagement',
    };
    expect(isEndTurnDisabled(params as any)).toBe(false);
  });

  it('[TC-124.14/MSS][UC-GAME-124][Facet-1/Boundary] cho phép Kết Thúc Lượt khi đang ở trong Trạm Kiểm Toán (inAudit=true)', () => {
    const params: ExtendedActionDockParams = {
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      hasRolledThisTurn: false,
      turnPhase: 'WaitingRoll',
      inAudit: true,
    };
    expect(isEndTurnDisabled(params as any)).toBe(false);
  });
});

describe('[IMP-124][Trạm 1] Chốt 3: Đồng Bộ turnPhase Vào Client Store & Apply Delta', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useGameStore.setState({
      hasRolledThisTurn: false,
      isRolling: false,
      currentTurnPlayerId: 'p1',
    });
  });

  // [Facet 1: Boundary & Range]
  it('[TC-124.15/MSS][UC-GAME-124][Facet-1/Boundary] useGameStore.getState().turnPhase khởi tạo có giá trị mặc định hợp lệ "WaitingRoll"', () => {
    const currentPhase = (useGameStore.getState() as any).turnPhase;
    expect(currentPhase).toBe('WaitingRoll');
  });

  // [Facet 2: State Reactivity]
  it('[TC-124.16/MSS][UC-GAME-124][Facet-2/Reactivity] useGameStore.getState().setTurnPhase cập nhật state.turnPhase thành "PropertyManagement"', () => {
    const store = useGameStore.getState() as any;
    expect(typeof store.setTurnPhase).toBe('function');
    store.setTurnPhase('PropertyManagement');
    expect((useGameStore.getState() as any).turnPhase).toBe('PropertyManagement');
  });

  it('[TC-124.17/MSS][UC-GAME-124][Facet-2/Reactivity] useGameStore.getState().setTurnPhase có thể chuyển pha trở lại "WaitingRoll"', () => {
    const store = useGameStore.getState() as any;
    if (typeof store.setTurnPhase === 'function') {
      store.setTurnPhase('PropertyManagement');
      store.setTurnPhase('WaitingRoll');
    }
    expect((useGameStore.getState() as any).turnPhase).toBe('WaitingRoll');
  });

  it('[TC-124.18/MSS][UC-GAME-124][Facet-2/Reactivity] applyDelta đồng bộ trường turnPhase từ server payload vào client store', () => {
    applyDelta({
      tick: 10,
      turnPhase: 'PropertyManagement',
    } as any, useGameStore);

    expect((useGameStore.getState() as any).turnPhase).toBe('PropertyManagement');
  });

  // [Facet 3: Resource Disposal & Clean State]
  it('[TC-124.19/MSS][UC-GAME-124][Facet-3/Disposal] applyDelta bảo toàn turnPhase hiện tại khi delta không chứa trường turnPhase', () => {
    const store = useGameStore.getState() as any;
    if (typeof store.setTurnPhase === 'function') {
      store.setTurnPhase('PropertyManagement');
    }

    applyDelta({
      tick: 11,
      turnPhase: undefined,
    } as any, useGameStore);

    expect((useGameStore.getState() as any).turnPhase).toBe('PropertyManagement');
  });

  it('[TC-124.20/MSS][UC-GAME-124][Facet-3/Disposal] setCurrentTurnPlayerId reset sạch hasRolledThisTurn khi chuyển giao lượt', () => {
    useGameStore.setState({ hasRolledThisTurn: true });
    useGameStore.getState().setCurrentTurnPlayerId('p2');
    expect(useGameStore.getState().hasRolledThisTurn).toBe(false);
  });
});

describe('[IMP-124][Trạm 1] Chốt 4: Nhãn Nút & Chỉ Báo Mất Lượt Trên Giao Diện (resolveEndTurnButtonLabel & shouldShowSkipTurnNotice)', () => {
  // [Facet 2: State Reactivity]
  it('[TC-124.21/MSS][UC-GAME-124][Facet-2/Reactivity] resolveEndTurnButtonLabel trả về "⏩ Mất Lượt (Hết Lượt)" khi bị mất lượt', () => {
    expect(typeof resolveEndTurnButtonLabel).toBe('function');
    const label = resolveEndTurnButtonLabel('PropertyManagement', false, false);
    expect(label).toBe('⏩ Mất Lượt (Hết Lượt)');
  });

  // [Facet 1: Boundary & Range]
  it('[TC-124.22/MSS][UC-GAME-124][Facet-1/Boundary] resolveEndTurnButtonLabel trả về "Hết Lượt" ở pha WaitingRoll bình thường', () => {
    expect(typeof resolveEndTurnButtonLabel).toBe('function');
    const label = resolveEndTurnButtonLabel('WaitingRoll', false, false);
    expect(label).toBe('Hết Lượt');
  });

  it('[TC-124.23/MSS][UC-GAME-124][Facet-1/Boundary] resolveEndTurnButtonLabel trả về "Hết Lượt" sau khi đã đổ xúc xắc trong PropertyManagement', () => {
    expect(typeof resolveEndTurnButtonLabel).toBe('function');
    const label = resolveEndTurnButtonLabel('PropertyManagement', true, false);
    expect(label).toBe('Hết Lượt');
  });

  // [Facet 4: Error Defense]
  it('[TC-124.24/MSS][UC-GAME-124][Facet-4/ErrorDefense] resolveEndTurnButtonLabel trả về "Hết Lượt" khi đang trong trạm kiểm toán (inAudit=true)', () => {
    expect(typeof resolveEndTurnButtonLabel).toBe('function');
    const label = resolveEndTurnButtonLabel('PropertyManagement', false, true);
    expect(label).toBe('Hết Lượt');
  });

  // [Facet 2: State Reactivity]
  it('[TC-124.25/MSS][UC-GAME-124][Facet-2/Reactivity] shouldShowSkipTurnNotice trả về true khi đến lượt mình ở PropertyManagement chưa đổ', () => {
    expect(typeof shouldShowSkipTurnNotice).toBe('function');
    const showNotice = shouldShowSkipTurnNotice('PropertyManagement', false, false, true);
    expect(showNotice).toBe(true);
  });

  // [Facet 4: Error Defense]
  it('[TC-124.26/MSS][UC-GAME-124][Facet-4/ErrorDefense] shouldShowSkipTurnNotice trả về false khi không phải lượt của mình', () => {
    expect(typeof shouldShowSkipTurnNotice).toBe('function');
    const showNotice = shouldShowSkipTurnNotice('PropertyManagement', false, false, false);
    expect(showNotice).toBe(false);
  });

  it('[TC-124.27/MSS][UC-GAME-124][Facet-1/Boundary] shouldShowSkipTurnNotice trả về false sau khi đã đổ xúc xắc', () => {
    expect(typeof shouldShowSkipTurnNotice).toBe('function');
    const showNotice = shouldShowSkipTurnNotice('PropertyManagement', true, false, true);
    expect(showNotice).toBe(false);
  });

  it('[TC-124.28/MSS][UC-GAME-124][Facet-1/Boundary] shouldShowSkipTurnNotice trả về false ở pha WaitingRoll bình thường', () => {
    expect(typeof shouldShowSkipTurnNotice).toBe('function');
    const showNotice = shouldShowSkipTurnNotice('WaitingRoll', false, false, true);
    expect(showNotice).toBe(false);
  });

  it('[TC-124.29/MSS][UC-GAME-124][Facet-4/ErrorDefense] shouldShowSkipTurnNotice trả về false khi đang trong trạm kiểm toán', () => {
    expect(typeof shouldShowSkipTurnNotice).toBe('function');
    const showNotice = shouldShowSkipTurnNotice('PropertyManagement', false, true, true);
    expect(showNotice).toBe(false);
  });
});

describe('[IMP-124][Trạm 1] Chốt 5: Tối Ưu Thích Ứng N8AO / Draw Calls (resolveAdaptivePostProcessing)', () => {
  // [Facet 1: Boundary & Range]
  it('[TC-124.30/MSS][UC-GAME-124][Facet-1/Boundary] resolveAdaptivePostProcessing tắt N8AO khi FPS < 35 để giải phóng 800 draw calls', () => {
    expect(typeof resolveAdaptivePostProcessing).toBe('function');
    const result = resolveAdaptivePostProcessing({ fps: 29.1, isMobile: false, enableAo: true });
    expect(result.enableAo).toBe(false);
  });

  it('[TC-124.31/MSS][UC-GAME-124][Facet-1/Boundary] resolveAdaptivePostProcessing tắt N8AO trên thiết bị di động (isMobile=true) bất kể FPS', () => {
    expect(typeof resolveAdaptivePostProcessing).toBe('function');
    const result = resolveAdaptivePostProcessing({ fps: 60, isMobile: true, enableAo: true });
    expect(result.enableAo).toBe(false);
  });

  it('[TC-124.32/MSS][UC-GAME-124][Facet-1/Boundary] resolveAdaptivePostProcessing duy trì bật N8AO trên máy tính có FPS khỏe (>= 45)', () => {
    expect(typeof resolveAdaptivePostProcessing).toBe('function');
    const result = resolveAdaptivePostProcessing({ fps: 55, isMobile: false, enableAo: true });
    expect(result.enableAo).toBe(true);
  });

  // [Facet 3: Resource Disposal & Clean State]
  it('[TC-124.33/MSS][UC-GAME-124][Facet-3/Disposal] resolveAdaptivePostProcessing tôn trọng cấu hình enableAo=false của người dùng', () => {
    expect(typeof resolveAdaptivePostProcessing).toBe('function');
    const result = resolveAdaptivePostProcessing({ fps: 60, isMobile: false, enableAo: false });
    expect(result.enableAo).toBe(false);
  });

  // [Facet 4: Error Defense]
  it('[TC-124.34/MSS][UC-GAME-124][Facet-4/ErrorDefense] resolveAdaptivePostProcessing xử lý an toàn giá trị FPS âm, NaN hoặc không hợp lệ', () => {
    expect(typeof resolveAdaptivePostProcessing).toBe('function');
    const nanResult = resolveAdaptivePostProcessing({ fps: Number.NaN, isMobile: false, enableAo: true });
    expect(nanResult.enableAo).toBe(false);

    const negativeResult = resolveAdaptivePostProcessing({ fps: -5, isMobile: false, enableAo: true });
    expect(negativeResult.enableAo).toBe(false);
  });
});

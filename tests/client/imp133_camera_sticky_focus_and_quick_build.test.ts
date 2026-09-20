// [TC-IMP133/MSS][UC-CAM-01][UC-PROP-01][UC-UI-01][UC-TRADE-01][UC-CAM-02]
// Contract Test Suite for IMP-133: Camera Sticky Focus, 1-Click Quick Build & BĐS Portfolio / P2P Trade UX Overhaul
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveCameraTargetCell } from '../../src/client/3d/use_game_camera';
import type { PawnAnimationState } from '../../src/client/store/game_store';
import { useGameStore } from '../../src/client/store/game_store';
import * as modalHelpers from '../../src/client/ui/modals/modal_helpers';
import { PropertyPortfolioModal, type PropertyPortfolioModalProps } from '../../src/client/ui/modals/property_portfolio_modal';
import { TradeModal, type TradeModalProps } from '../../src/client/ui/modals/trade_modal';

// ============================================================================
// Types & Interfaces for IMP-133 Specifications
// ============================================================================

export interface PropertyUpgradeEligibilityParams {
  readonly cellIndex: number;
  readonly isMyTurn: boolean;
  readonly turnPhase: string;
  readonly balance: number;
  readonly ownedProperties: readonly number[];
  readonly propertyStates?: Record<number, {
    readonly level?: number;
    readonly isMortgaged?: boolean;
    readonly ownerId?: string | null;
  }>;
}

export interface PropertyUpgradeEligibilityResult {
  readonly canUpgrade: boolean;
  readonly reason?: string;
  readonly upgradeCost?: number;
  readonly nextLevel?: number;
  readonly hasMonopoly?: boolean;
}

type ModalHelpersWithUpgradeCheck = typeof modalHelpers & {
  checkPropertyUpgradeEligibility?: (params: PropertyUpgradeEligibilityParams) => PropertyUpgradeEligibilityResult;
};

interface GameStoreWithCameraFocus {
  readonly cameraFocusCell?: number | null;
  readonly setCameraFocusCell?: (cell: number | null) => void;
  readonly setIsRolling?: (isRolling: boolean) => void;
  readonly triggerDiceRoll?: (dice: [number, number], diceSeq?: number) => void;
}

type ExtendedGameState = ReturnType<typeof useGameStore.getState> & GameStoreWithCameraFocus;

export interface ExtendedPortfolioModalProps extends PropertyPortfolioModalProps {
  readonly isMyTurn?: boolean;
  readonly turnPhase?: string;
  readonly onUpgrade?: (cellIndex: number) => void;
  readonly onHoverCell?: (cellIndex: number | null) => void;
}

export interface RecenterPawnPillProps {
  readonly activeModal?: string | null;
  readonly cameraFocusCell: number | null;
  readonly pawnPosition: number;
  readonly onRecenter?: () => void;
}

// Dynamic import holder for RecenterPawnPill
let RecenterPawnPill: React.ComponentType<RecenterPawnPillProps> | null = null;
let recenterImportError: Error | null = null;

beforeAll(async () => {
  try {
    // @ts-ignore - Module will be created by implementer in Station 2
    const mod = await import('../../src/client/ui/recenter_pawn_pill.js');
    RecenterPawnPill = mod.RecenterPawnPill ?? mod.default ?? null;
  } catch {
    // Fallback for Station 1 red testing phase
    try {
      // @ts-ignore - Module will be created by implementer in Station 2
      const modFallback = await import('../../src/client/ui/recenter_pawn_pill');
      RecenterPawnPill = modFallback.RecenterPawnPill ?? modFallback.default ?? null;
    } catch (err: unknown) {
      // Expected uninitialized module in Station 1
      recenterImportError = err instanceof Error ? err : new Error(String(err));
      RecenterPawnPill = null;
    }
  }
});

type CameraResolverFn = (
  activeAnimation: PawnAnimationState | null,
  currentTurnPlayerId: string | null,
  playerPositions: Record<string, number>,
  modalPayload?: { cellIndex?: number } | null,
  cameraFocusCell?: number | null
) => number | null;

const resolveTarget = resolveCameraTargetCell as CameraResolverFn;

// ============================================================================
// CHỐT 1: Camera Sticky Focus & Chuỗi Ưu Tiên
// ============================================================================
describe('[IMP-133][Trạm 1] Chốt 1: Camera Sticky Focus & Chuỗi Ưu Tiên', () => {
  beforeEach(() => {
    const store = useGameStore.getState() as ExtendedGameState;
    store.closeModal();
    if (typeof store.setCameraFocusCell === 'function') {
      store.setCameraFocusCell(null);
    }
  });

  it('[TC-IMP133.01/MSS][UC-CAM-01][Facet-1/Boundary] cameraFocusCell mặc định là null trong Game Store', () => {
    const store = useGameStore.getState() as ExtendedGameState;
    expect(store.cameraFocusCell, '[RED GATE] cameraFocusCell must exist in GameState and default to null').toBeNull();
  });

  it('[TC-IMP133.02/MSS][UC-CAM-01][Facet-2/Reactivity] Gọi setCameraFocusCell(39) cập nhật state === 39; setCameraFocusCell(null) xóa rỗng', () => {
    const store = useGameStore.getState() as ExtendedGameState;
    expect(typeof store.setCameraFocusCell, '[RED GATE] setCameraFocusCell action must exist on useGameStore').toBe('function');
    store.setCameraFocusCell!(39);
    expect((useGameStore.getState() as ExtendedGameState).cameraFocusCell).toBe(39);
    store.setCameraFocusCell!(null);
    expect((useGameStore.getState() as ExtendedGameState).cameraFocusCell).toBeNull();
  });

  it('[TC-IMP133.03/MSS][UC-CAM-01][Facet-2/Reactivity] resolveCameraTargetCell: Khi cameraFocusCell có giá trị và modalPayload rỗng, ưu tiên trả về cameraFocusCell', () => {
    const target = resolveTarget(null, 'p1', { p1: 0 }, null, 39);
    expect(target, '[RED GATE] resolveCameraTargetCell must return cameraFocusCell (39) when modalPayload is null').toBe(39);
  });

  it('[TC-IMP133.04/MSS][UC-CAM-01][Facet-4/ErrorDefense] resolveCameraTargetCell: Khi quân cờ đang nhảy (activeAnimation.isAnimating = true), bắt buộc trả về waypoint quân cờ, KHÔNG để cameraFocusCell cướp góc quay', () => {
    const movingAnimation: PawnAnimationState = {
      playerId: 'p1',
      fromCell: 0,
      targetCell: 3,
      waypoints: [1, 2, 3],
      currentIndex: 1,
      isAnimating: true,
    };
    const target = resolveTarget(movingAnimation, 'p1', { p1: 0 }, null, 39);
    expect(target, '[RED GATE] Active jumping pawn waypoint must take precedence over cameraFocusCell').toBe(2);
  });

  it('[TC-IMP133.05/MSS][UC-CAM-01][Facet-1/Boundary] resolveCameraTargetCell: modalPayload.cellIndex có độ ưu tiên cao nhất, đè lên cameraFocusCell', () => {
    const target = resolveTarget(null, 'p1', { p1: 0 }, { cellIndex: 1 }, 39);
    expect(target, '[RED GATE] modalPayload.cellIndex (1) must override cameraFocusCell (39)').toBe(1);
  });

  it('[TC-IMP133.06/MSS][UC-CAM-01][Facet-3/Disposal] Khi gieo xúc xắc (isRolling = true), cameraFocusCell tự động được reset về null', () => {
    const store = useGameStore.getState() as ExtendedGameState;
    expect(typeof store.setCameraFocusCell, '[RED GATE] setCameraFocusCell action must exist').toBe('function');
    store.setCameraFocusCell!(39);
    expect((useGameStore.getState() as ExtendedGameState).cameraFocusCell).toBe(39);

    if (typeof store.setIsRolling === 'function') {
      store.setIsRolling(true);
    }
    expect((useGameStore.getState() as ExtendedGameState).cameraFocusCell, '[RED GATE] cameraFocusCell must reset to null when rolling dice').toBeNull();
  });
});

// ============================================================================
// CHỐT 2: Hàm Thuần Túy Kiểm Tra Nâng Cấp BĐS (modal_helpers.ts)
// ============================================================================
describe('[IMP-133][Trạm 1] Chốt 2: Hàm Thuần Túy Kiểm Tra Nâng Cấp BĐS (checkPropertyUpgradeEligibility)', () => {
  const helpers = modalHelpers as ModalHelpersWithUpgradeCheck;

  it('[TC-IMP133.07/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do "Chờ đến lượt xây dựng" nếu isMyTurn === false', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported from modal_helpers.ts').toBe('function');
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: false,
      turnPhase: 'PropertyManagement',
      balance: 5000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 0 }, 3: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toBe('Chờ đến lượt xây dựng');
  });

  it('[TC-IMP133.08/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do "Chờ đến lượt xây dựng" nếu turnPhase !== "PropertyManagement"', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'WaitingRoll',
      balance: 5000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 0 }, 3: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toBe('Chờ đến lượt xây dựng');
  });

  it('[TC-IMP133.09/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do "Cần sở hữu trọn bộ màu trước khi nâng cấp" nếu người chơi chưa đủ bộ màu', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    // Ô 6 (Bình Dương Dĩ An - nhóm Thanh gồm 6, 8, 9), người chơi chỉ có 6 và 8
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 6,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 5000,
      ownedProperties: [6, 8],
      propertyStates: { 6: { level: 0 }, 8: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toBe('Cần sở hữu trọn bộ màu trước khi nâng cấp');
  });

  it('[TC-IMP133.10/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do "Không thể nâng cấp khi nhóm có ô thế chấp" nếu có ô thế chấp trong bộ', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    // Bộ Nâu [1, 3], ô 3 đang bị thế chấp
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 5000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 0 }, 3: { level: 0, isMortgaged: true } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toBe('Không thể nâng cấp khi nhóm có ô thế chấp');
  });

  it('[TC-IMP133.11/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do xây đều tay nếu ô cùng nhóm có cấp độ thấp hơn', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    // Bộ Nâu [1, 3], ô 1 đã lên C1, ô 3 vẫn ở C0. Không được nâng ô 1 lên C2 trước ô 3
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 5000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 1 }, 3: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toMatch(/đều tay/i);
  });

  it('[TC-IMP133.12/MSS][UC-PROP-01][Facet-4/ErrorDefense] checkPropertyUpgradeEligibility: Trả về canUpgrade: false kèm lý do "Số dư không đủ" nếu balance < upgradeCost', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    // Ô 1 chi phí nâng cấp C0->C1 là 300, số dư chỉ có 200
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 200,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 0 }, 3: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(false);
    expect(result.reason).toBe('Số dư không đủ');
  });

  it('[TC-IMP133.13/MSS][UC-PROP-01][Facet-2/Reactivity] checkPropertyUpgradeEligibility: Trả về canUpgrade: true, upgradeCost: 300, nextLevel: 1, hasMonopoly: true khi thỏa mãn 100% điều kiện', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    const result = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 1000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 0 }, 3: { level: 0 } },
    });
    expect(result.canUpgrade).toBe(true);
    expect(result.upgradeCost).toBe(300);
    expect(result.nextLevel).toBe(1);
    expect(result.hasMonopoly).toBe(true);
  });

  it('[TC-IMP133.14/MSS][UC-PROP-01][Facet-1/Boundary] checkPropertyUpgradeEligibility: Ô cấp 3 (Max level) hoặc ô Ga/Tiện ích trả về canUpgrade: false', () => {
    expect(typeof helpers.checkPropertyUpgradeEligibility, '[RED GATE] checkPropertyUpgradeEligibility must be exported').toBe('function');
    // Ô 1 đã đạt C3 (Resort)
    const resultMax = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 1,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 10000,
      ownedProperties: [1, 3],
      propertyStates: { 1: { level: 3 }, 3: { level: 3 } },
    });
    expect(resultMax.canUpgrade).toBe(false);

    // Ô 5 (Ga Long Thành - Railroad)
    const resultRailroad = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 5,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 10000,
      ownedProperties: [5],
    });
    expect(resultRailroad.canUpgrade).toBe(false);

    // Ô 12 (EVN - Utility)
    const resultUtility = helpers.checkPropertyUpgradeEligibility!({
      cellIndex: 12,
      isMyTurn: true,
      turnPhase: 'PropertyManagement',
      balance: 10000,
      ownedProperties: [12],
    });
    expect(resultUtility.canUpgrade).toBe(false);
  });
});

// ============================================================================
// CHỐT 3: Nút Nâng Cấp Nhanh & Thẻ BĐS Xúc Giác (property_portfolio_modal.tsx)
// ============================================================================
describe('[IMP-133][Trạm 1] Chốt 3: Nút Nâng Cấp Nhanh & Thẻ BĐS Xúc Giác', () => {
  it('[TC-IMP133.15/MSS][UC-UI-01][Facet-1/Boundary] Mỗi thẻ BĐS render dải ruy băng màu đỉnh thẻ có data-testid="property-color-ribbon"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1, 6],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
          6: { level: 0, isMortgaged: false },
        },
        currentBalance: 2000,
      })
    );
    expect(html).toContain('data-testid="property-color-ribbon"');
  });

  it('[TC-IMP133.16/MSS][UC-UI-01][Facet-2/Reactivity] Render nút Nâng Cấp Nhanh [🏗️ Xây C1] chuẩn min-h-[44px] khi canUpgrade === true', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1, 3],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
          3: { level: 0, isMortgaged: false },
        },
        currentBalance: 5000,
        isMyTurn: true,
        turnPhase: 'PropertyManagement',
      })
    );
    expect(html).toContain('🏗️ Xây C1');
    expect(html).toContain('min-h-[44px]');
  });

  it('[TC-IMP133.17/MSS][UC-UI-01][Facet-2/Reactivity] Nút Nâng Cấp Nhanh gắn đúng data-testid="property-quick-build-btn" để tiếp nhận click nâng cấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1, 3],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
          3: { level: 0, isMortgaged: false },
        },
        currentBalance: 5000,
        isMyTurn: true,
        turnPhase: 'PropertyManagement',
      })
    );
    expect(html).toContain('data-testid="property-quick-build-btn"');
  });

  it('[TC-IMP133.18/MSS][UC-UI-01][Facet-4/ErrorDefense] Khi canUpgrade === false, nút hiển thị disabled kèm giải thích lý do rõ ràng', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1, 3],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
          3: { level: 0, isMortgaged: false },
        },
        currentBalance: 5000,
        isMyTurn: false, // Chưa đến lượt
        turnPhase: 'PropertyManagement',
      })
    );
    expect(html).toContain('disabled');
    expect(html).toContain('Chờ đến lượt xây dựng');
  });

  it('[TC-IMP133.19/MSS][UC-UI-01][Facet-2/Reactivity] Mỗi thẻ BĐS hỗ trợ trigger tương tác rê chuột hoặc chạm vào thẻ (onHoverCell)', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
        },
        currentBalance: 2000,
      })
    );
    expect(html).toContain('data-testid="property-portfolio-item-1"');
    expect(html).toContain('onmouseenter');
  });

  it('[TC-IMP133.20/MSS][UC-UI-01][Facet-2/Reactivity] Render thanh lọc phân loại (Filter bar) có các tab "Tất Cả", "Có Thể Xây", "Đang Thế Chấp"', () => {
    const html = renderToStaticMarkup(
      React.createElement(PropertyPortfolioModal as React.ComponentType<ExtendedPortfolioModalProps>, {
        ownedProperties: [1, 6],
        propertyStates: {
          1: { level: 0, isMortgaged: false },
          6: { level: 0, isMortgaged: true },
        },
        currentBalance: 2000,
      })
    );
    expect(html).toContain('data-testid="portfolio-filter-bar"');
    expect(html).toContain('Tất Cả');
    expect(html).toContain('Có Thể Xây');
    expect(html).toContain('Đang Thế Chấp');
  });
});

// ============================================================================
// CHỐT 4: Trang Đàm Phán Thương Lượng P2P Thích Ứng (trade_modal.tsx)
// ============================================================================
describe('[IMP-133][Trạm 1] Chốt 4: Trang Đàm Phán Thương Lượng P2P Thích Ứng', () => {
  it('[TC-IMP133.21/MSS][UC-TRADE-01][Facet-1/Boundary] Render cấu trúc 2 cột trên desktop (sm:grid) và tab phân đoạn mobile [Bạn Đưa] vs [Đối Tác] (sm:hidden)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );
    expect(html).toContain('sm:grid');
    expect(html).toContain('data-testid="trade-mobile-segmented-tabs"');
    expect(html).toContain('sm:hidden');
  });

  it('[TC-IMP133.22/MSS][UC-TRADE-01][Facet-2/Reactivity] Cụm Stepper tiền mặt có nút [-] và [+] đạt chuẩn min-h-[44px] min-w-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );
    expect(html).toContain('data-testid="cash-stepper-decrement"');
    expect(html).toContain('min-h-[44px] min-w-[44px]');
  });

  it('[TC-IMP133.23/MSS][UC-TRADE-01][Facet-4/ErrorDefense] Nút giảm tiền [-] không cho phép số tiền bị âm và hiển thị disabled khi số tiền = 0', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialCashOffer: 0,
      })
    );
    expect(html).toContain('data-testid="cash-stepper-decrement"');
    // Khi tiền = 0, nút decrement phải bị disable
    expect(html).toMatch(/data-testid="cash-stepper-decrement"[^>]*disabled/);
  });

  it('[TC-IMP133.24/MSS][UC-TRADE-01][Facet-2/Reactivity] Hiển thị thanh Cán Cân Thương Vụ (deal-balance-meter) so sánh tổng giá trị tài sản 2 bên', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialOffered: [1], // Cần Thơ Cái Răng: 600 Tr.
        initialRequested: [6], // Bình Dương Dĩ An: 1000 Tr.
      })
    );
    expect(html).toContain('data-testid="deal-balance-meter"');
    expect(html).toContain('Cán Cân Thương Vụ');
  });
});

// ============================================================================
// CHỐT 5: Nút Nổi Quay Về Quân Cờ (recenter_pawn_pill.tsx)
// ============================================================================
describe('[IMP-133][Trạm 1] Chốt 5: Nút Nổi Quay Về Quân Cờ (RecenterPawnPill)', () => {
  it('[TC-IMP133.25/MSS][UC-CAM-02][Facet-1/Boundary] Render nút [♟️ Về Quân Cờ] khi !activeModal && cameraFocusCell !== null && cameraFocusCell !== pawnPosition', () => {
    expect(
      RecenterPawnPill,
      `[RED GATE] RecenterPawnPill component must be exported from src/client/ui/recenter_pawn_pill: ${recenterImportError?.message ?? 'Module not found'}`
    ).toBeTruthy();

    const html = renderToStaticMarkup(
      React.createElement(RecenterPawnPill!, {
        activeModal: null,
        cameraFocusCell: 39,
        pawnPosition: 0,
        onRecenter: vi.fn(),
      })
    );
    expect(html).toContain('data-testid="recenter-pawn-pill"');
    expect(html).toContain('Về Quân Cờ');
  });

  it('[TC-IMP133.26/MSS][UC-CAM-02][Facet-3/Disposal] Không render (trả về rỗng) khi activeModal !== null hoặc cameraFocusCell === null hoặc cameraFocusCell === pawnPosition', () => {
    expect(
      RecenterPawnPill,
      `[RED GATE] RecenterPawnPill must be implemented: ${recenterImportError?.message ?? 'Module not found'}`
    ).toBeTruthy();

    // Case 1: activeModal đang mở
    const htmlModal = renderToStaticMarkup(
      React.createElement(RecenterPawnPill!, {
        activeModal: 'deed',
        cameraFocusCell: 39,
        pawnPosition: 0,
      })
    );
    expect(htmlModal).toBe('');

    // Case 2: cameraFocusCell là null
    const htmlNullFocus = renderToStaticMarkup(
      React.createElement(RecenterPawnPill!, {
        activeModal: null,
        cameraFocusCell: null,
        pawnPosition: 0,
      })
    );
    expect(htmlNullFocus).toBe('');

    // Case 3: cameraFocusCell trùng với vị trí quân cờ
    const htmlSamePos = renderToStaticMarkup(
      React.createElement(RecenterPawnPill!, {
        activeModal: null,
        cameraFocusCell: 5,
        pawnPosition: 5,
      })
    );
    expect(htmlSamePos).toBe('');
  });

  it('[TC-IMP133.27/MSS][UC-CAM-02][Facet-2/Reactivity] Bấm nút [♟️ Về Quân Cờ] gọi callback onRecenter()', () => {
    expect(
      RecenterPawnPill,
      `[RED GATE] RecenterPawnPill must be implemented: ${recenterImportError?.message ?? 'Module not found'}`
    ).toBeTruthy();

    const onRecenterSpy = vi.fn();
    const element = (RecenterPawnPill as (props: RecenterPawnPillProps) => React.ReactElement<{ onClick?: () => void }> | null)({
      activeModal: null,
      cameraFocusCell: 39,
      pawnPosition: 0,
      onRecenter: onRecenterSpy,
    });
    expect(element, 'RecenterPawnPill element must not be null').not.toBeNull();
    element?.props?.onClick?.();
    expect(onRecenterSpy).toHaveBeenCalledTimes(1);
  });
});

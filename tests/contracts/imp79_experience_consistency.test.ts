// [TC-IMP79/MSS] Contract Tests for IMP-79: Experience Consistency & Edge-Case Polish (VERIFIED PASS)
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TurnPhase } from '../../src/domain/room';
import type { DeltaPayload } from '../../src/server/session_manager';
import { useGameStore, type GameState } from '../../src/client/store/game_store';
import { useActivityStore } from '../../src/client/store/activity_store';
import { applyPhaseAndTimerDeltas } from '../../src/client/network/apply_delta';
import {
  detectEventCardActivities,
  detectAuctionActivities,
  trackDeltaActivities,
} from '../../src/client/network/activity_tracker';
import {
  processPayerFee,
  extractMiscellaneousBalances,
  type BalanceDelta,
  type PropertyFinancialContext,
} from '../../src/client/network/activity_financial_tracker';
import { isRollActionDisabled, isEndTurnDisabled } from '../../src/client/ui/ui_helpers';
import { ActionDock } from '../../src/client/ui/action_dock';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';

const createDelta = (partial: Partial<DeltaPayload>): DeltaPayload => ({
  tick: 0,
  cells: [],
  ...partial,
});

const createPlayerInfo = (id: string, name: string) => ({
  id,
  name,
  balance: 5000,
  tokenColor: '#10b981',
  ownedProperties: [],
});

describe('[TC-79.1/MSS] Auction Victory Fanfare & Log Notification', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      unreadCount: 0,
      lastAuctionBid: undefined,
    });
  });

  it('TC-79.1.1: detectAuctionActivities tạo log Búa gõ thành công khi delta.auction === null và có người trả giá', () => {
    useActivityStore.setState({
      lastAuctionBid: {
        cellIndex: 5,
        currentBid: 1200,
        highestBidderId: 'p2',
      },
    });

    const mockState = {
      playersInfo: {
        p2: { id: 'p2', name: 'Shark Hưng', tokenColor: '#10b981' },
      },
    } as unknown as GameState;

    const delta: DeltaPayload = createDelta({ auction: null });
    const entries = detectAuctionActivities(delta, mockState, mockState);

    expect(entries.length).toBe(1);
    expect(entries[0]?.type).toBe('auction');
    expect(entries[0]?.message).toContain('Búa gõ thành công');
    expect(entries[0]?.message).toContain('Shark Hưng');
  });

  it('TC-79.1.2: detectAuctionActivities bảo lưu thông tin winningBid và cellIndex trong log búa gõ', () => {
    useActivityStore.setState({
      lastAuctionBid: {
        cellIndex: 8,
        currentBid: 2500,
        highestBidderId: 'p3',
      },
    });

    const mockState = {
      playersInfo: {
        p3: { id: 'p3', name: 'Bot AI 3', tokenColor: '#f59e0b' },
      },
    } as unknown as GameState;

    const delta: DeltaPayload = createDelta({ auction: null });
    const entries = detectAuctionActivities(delta, mockState, mockState);

    expect(entries[0]?.amount).toBe(-2500);
    expect(entries[0]?.cellIndex).toBe(8);
  });

  it('TC-79.1.3: detectAuctionActivities dọn dẹp lastAuctionBid sau khi phát log búa gõ thành công', () => {
    useActivityStore.setState({
      lastAuctionBid: {
        cellIndex: 8,
        currentBid: 2500,
        highestBidderId: 'p3',
      },
    });

    const mockState = { playersInfo: {} } as unknown as GameState;
    detectAuctionActivities(createDelta({ auction: null }), mockState, mockState);

    expect(useActivityStore.getState().lastAuctionBid).toBeUndefined();
  });

  it('TC-79.1.4: AuctionModal hiển thị banner gõ búa thắng cuộc khi isConcluded = true', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 5,
        currentBid: 1500,
        highestBidderId: 'p1',
        timeRemaining: 0,
        myId: 'p1',
        isConcluded: true,
      } as any)
    );

    expect(html).toContain('BÚA GÕ THÀNH CÔNG');
    expect(html).toContain('1.500 Tr.');
  });
});

describe('[TC-79.2/MSS] Event Card Activity Logger (Edge Case: Swallowed Card Logs)', () => {
  beforeEach(() => {
    useActivityStore.setState({
      activityLogs: [],
      unreadCount: 0,
    });
  });

  it('TC-79.2.1: detectEventCardActivities tạo log loại card khi có delta.lastEventCard', () => {
    const delta: DeltaPayload = createDelta({
      lastEventCard: {
        id: 'chance_repair',
        type: 'Chance',
        title: 'Sửa Chữa Nhà Cửa',
        description: 'Bảo trì toàn bộ công trình',
        effectDelta: -500,
        drawnBy: 'p2',
        cardType: 'chance',
        cardId: 'CC_REPAIR',
      },
    });

    const mockState = {
      playersInfo: {
        p2: { name: 'Bot AI 2', tokenColor: '#f59e0b' },
      },
    } as unknown as GameState;

    const entries = detectEventCardActivities(delta, mockState, mockState);
    expect(entries.length).toBe(1);
    expect(entries[0]?.type).toBe('card');
  });

  it('TC-79.2.2: định dạng thông điệp Phiếu Thị Trường có nhãn [Thị Trường] và tên thẻ', () => {
    const delta: DeltaPayload = createDelta({
      lastEventCard: {
        id: 'market_tax_break',
        type: 'Market',
        title: 'Gói Kích Thích Kinh Tế',
        description: 'Giảm 50% thuế bất động sản',
        cardType: 'market',
        cardId: 'MC_TAX_BREAK',
      },
    });

    const mockState = { playersInfo: {} } as unknown as GameState;
    const entries = detectEventCardActivities(delta, mockState, mockState);
    expect(entries[0]?.message).toContain('Thị Trường');
    expect(entries[0]?.message).toContain('Gói Kích Thích Kinh Tế');
  });

  it('TC-79.2.3: định dạng thông điệp Phiếu Cơ Hội có tên người rút và tên thẻ', () => {
    const delta: DeltaPayload = createDelta({
      lastEventCard: {
        id: 'chance_diplomatic',
        type: 'Chance',
        title: 'Miễn Phí Cứu Trợ',
        description: 'Thẻ giải cứu khỏi Trạm Kiểm Toán',
        drawnBy: 'p1',
        cardType: 'chance',
        cardId: 'CC_DIPLOMATIC',
      },
    });

    const mockState = {
      playersInfo: { p1: { name: 'Người Chơi 1' } },
    } as unknown as GameState;

    const entries = detectEventCardActivities(delta, mockState, mockState);
    expect(entries[0]?.message).toContain('Người Chơi 1');
    expect(entries[0]?.message).toContain('Miễn Phí Cứu Trợ');
  });

  it('TC-79.2.4: chống ghi trùng lặp thẻ khi nhận liên tiếp deltas cùng lastEventCard', () => {
    const delta: DeltaPayload = createDelta({
      lastEventCard: {
        id: 'chance_speeding',
        type: 'Chance',
        title: 'Chạy Quá Tốc Độ',
        description: 'Nộp phạt 150 Tr.',
        cardType: 'chance',
        cardId: 'CC_SPEEDING',
      },
    });

    const mockState = { playersInfo: {} } as unknown as GameState;
    const entries1 = detectEventCardActivities(delta, mockState, mockState);
    const entries2 = detectEventCardActivities(delta, mockState, mockState);

    expect(entries1.length).toBe(1);
    expect(entries2.length).toBe(0);
  });

  it('TC-79.2.5: trackDeltaActivities đẩy log thẻ sự kiện vào useActivityStore', () => {
    const delta: DeltaPayload = createDelta({
      lastEventCard: {
        id: 'chance_lottery',
        type: 'Chance',
        title: 'Trúng Thưởng Xổ Số',
        description: 'Nhận 1.000 Tr. tiền thưởng',
        cardType: 'chance',
        cardId: 'CC_LOTTERY',
      },
    });

    const mockState = { playersInfo: {} } as unknown as GameState;
    trackDeltaActivities(delta, mockState, mockState);

    const logs = useActivityStore.getState().activityLogs;
    expect(logs.some((l) => l.type === 'card' && l.message.includes('Trúng Thưởng Xổ Số'))).toBe(true);
  });
});

describe('[TC-79.3/MSS] Audit Mechanics & Bail Out UI (Edge Case: In-Jail Softlock)', () => {
  it('TC-79.3.1: isRollActionDisabled cho phép gieo xúc xắc đầu turn tìm cơ hội ra đôi và khóa nút sau khi đã gieo không đôi', () => {
    // Khi inAudit = true, hasRolledThisTurn = false: isRollActionDisabled trả về false
    const initialRollDisabled = isRollActionDisabled({
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isBankrupt: false,
      hasRolledThisTurn: false,
      canRollAgain: false,
      inAudit: true,
    } as any);
    expect(initialRollDisabled).toBe(false);

    // Khi inAudit = true, hasRolledThisTurn = true, canRollAgain = false: isRollActionDisabled trả về true
    const secondRollDisabled = isRollActionDisabled({
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isBankrupt: false,
      hasRolledThisTurn: true,
      canRollAgain: false,
      inAudit: true,
    } as any);
    expect(secondRollDisabled).toBe(true);
  });

  it('TC-79.3.2: isEndTurnDisabled trả về false khi inAudit = true và isMyTurn = true (cho phép kết thúc lượt)', () => {
    const disabled = isEndTurnDisabled({
      isRolling: false,
      isPawnMoving: false,
      isMyTurn: true,
      isBankrupt: false,
      hasRolledThisTurn: false,
      canRollAgain: false,
      isInsolvent: false,
      inAudit: true,
    } as any);

    expect(disabled).toBe(false);
  });

  it('TC-79.3.3: ActionDock hiển thị nút Bảo Lãnh khi actingPlayer có inAudit = true và isMyTurn = true', () => {
    const ssrState = {
      currentTurnPlayerId: 'p1',
      dice: [0, 0],
      hasRolledThisTurn: false,
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 5000,
          inAudit: true,
          auditTurnsLeft: 3,
        },
      },
    } as unknown as GameState;

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        ssrState,
      })
    );

    expect(html).toContain('Bảo Lãnh');
  });

  it('TC-79.3.4: ActionDock vô hiệu hóa nút Bảo Lãnh khi số dư người chơi < 500 Tr.', () => {
    const ssrState = {
      currentTurnPlayerId: 'p1',
      dice: [0, 0],
      hasRolledThisTurn: false,
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 300,
          inAudit: true,
          auditTurnsLeft: 2,
        },
      },
    } as unknown as GameState;

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        ssrState,
      })
    );

    expect(html).toMatch(/disabled=""[^>]*>[\s\S]*?Bảo Lãnh/);
  });

  it('TC-79.3.5: ActionDock hiển thị số lượt còn lại của Trạm Kiểm Toán', () => {
    const ssrState = {
      currentTurnPlayerId: 'p1',
      dice: [0, 0],
      hasRolledThisTurn: false,
      playerPositions: { p1: 10 },
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Player 1',
          balance: 2000,
          inAudit: true,
          auditTurnsLeft: 3,
        },
      },
    } as unknown as GameState;

    const html = renderToStaticMarkup(
      React.createElement(ActionDock, {
        localPlayerId: 'p1',
        ssrState,
      })
    );

    expect(html).toContain('3 lượt');
  });
});

describe('[TC-79.4/MSS] Financial Context Disambiguation (Edge Case: Generic Fee Logging)', () => {
  const dummyContext: PropertyFinancialContext = {
    boughtCellIndices: [],
    upgradedCells: [],
    unmortgagedCells: [],
    mortgagedCells: [],
  };

  it('TC-79.4.1: processPayerFee tạo log Lệ Phí Đất Đai khi người nộp đang ở Ô 04', () => {
    const payer: BalanceDelta = {
      id: 'p1',
      diff: -1000,
      pInfo: createPlayerInfo('p1', 'Shark Hưng'),
    };

    const delta: DeltaPayload = createDelta({
      players: [{ id: 'p1', position: 4, balance: 9000 }],
    });

    const log = processPayerFee(payer, dummyContext, delta);
    expect(log).toBeDefined();
    expect(log?.message).toContain('Lệ Phí Đăng Ký Đất Đai');
    expect(log?.message).toContain('1.000 Tr.');
  });

  it('TC-79.4.2: processPayerFee tạo log Bảo Lãnh Kiểm Toán khi người chơi nộp 500 Tr. rời khỏi Trạm', () => {
    const payer: BalanceDelta = {
      id: 'p2',
      diff: -500,
      pInfo: createPlayerInfo('p2', 'Bot AI 2'),
    };

    const delta: DeltaPayload = createDelta({
      players: [{ id: 'p2', position: 10, balance: 4500, inAudit: false, auditTurnsLeft: 0 }],
    });

    const prevState = {
      playersInfo: {
        p2: { id: 'p2', inAudit: true, auditTurnsLeft: 2 },
      },
    } as unknown as GameState;

    const log = processPayerFee(payer, dummyContext, delta, prevState);
    expect(log).toBeDefined();
    expect(log?.message).toContain('Bảo Lãnh Kiểm Toán');
    expect(log?.message).toContain('500 Tr.');
  });

  it('TC-79.4.3: processPayerFee fallback về log phí chung cho các khoản trừ khác', () => {
    const payer: BalanceDelta = {
      id: 'p3',
      diff: -200,
      pInfo: createPlayerInfo('p3', 'Bot AI 3'),
    };

    const delta: DeltaPayload = createDelta({
      players: [{ id: 'p3', position: 12, balance: 1800 }],
    });

    const log = processPayerFee(payer, dummyContext, delta);
    expect(log).toBeDefined();
    expect(log?.message).toContain('nộp phí');
  });

  it('TC-79.4.4: extractMiscellaneousBalances trích xuất thành công danh sách log tài chính phân loại', () => {
    const payers: BalanceDelta[] = [
      { id: 'p1', diff: -1000, pInfo: createPlayerInfo('p1', 'Shark Hưng') },
    ];
    const handledPayers = new Set<string>();
    const handledReceivers = new Set<string>();

    const delta: DeltaPayload = createDelta({
      players: [{ id: 'p1', position: 4, balance: 9000 }],
    });

    const logs = extractMiscellaneousBalances(
      payers,
      [],
      handledPayers,
      handledReceivers,
      dummyContext,
      delta
    );

    expect(logs.length).toBe(1);
    expect(logs[0]?.message).toContain('Lệ Phí Đăng Ký Đất Đai');
  });
});

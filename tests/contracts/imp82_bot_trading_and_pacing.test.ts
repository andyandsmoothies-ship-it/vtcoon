// [TC-82][UC-IMP82] Contract Test Suite: Human-like Bot Trading and Pacing (IMP-82)
// Universal 4-Facet Behavioral Matrix:
// Facet 1: Monopoly Gap Detection & Asymmetric Pricing (TC-82.01..04)
// Facet 2: Seller Bot Acceptance / Rejection & Kingmaking Defense (TC-82.05..08)
// Facet 3: Proactive Bot Trade Integration in PropertyManagement & Cooldown (TC-82.09..12)
// Facet 4: TopBar Bot Pacing Display & Watchdog 90s Auction Tolerance (TC-82.13..16)

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TurnPhase, createPlayer, createRoom, type Player, type Room } from '../../src/domain/room.js';
import { ActionRejectReason } from '../../src/domain/action_reasons.js';
import { BotPersonality, type BotConfig } from '../../src/domain/bot/bot_types.js';
import * as botEngine from '../../src/domain/bot/bot_engine.js';
import { decideBotIntent } from '../../src/domain/bot/bot_engine.js';
import { coordTrade, type RoomContext } from '../../src/server/room_property_coordinator.js';
import { TopBar } from '../../src/client/ui/top_bar.js';
import { useGameStore, type PlayerHudInfo } from '../../src/client/store/game_store.js';
import { watchdogMonitor } from '../../src/client/telemetry/watchdog_monitor.js';
import type { PropertyRegistry, PropertyStateMap } from '../../src/domain/property_data.js';

// Station 1 (RED Contract) -> Station 2 (GREEN Implementation) Dynamic Resolution
let tradeModule: any = null;
try {
  tradeModule = await import(/* @vite-ignore */ '../../src/domain/bot/bot_trade.js');
} catch {
  tradeModule = null;
}

const findMonopolyGap: any = tradeModule?.findMonopolyGap ?? (botEngine as any).findMonopolyGap;
const calculateTradeOfferPrice: any = tradeModule?.calculateTradeOfferPrice ?? (botEngine as any).calculateTradeOfferPrice;
const evaluateBotTradeAcceptance: any = tradeModule?.evaluateBotTradeAcceptance ?? (botEngine as any).evaluateBotTradeAcceptance;

function createTestRoomSetup(opts?: {
  readonly roundCount?: number;
  readonly phase?: TurnPhase;
}) {
  const room = createRoom('host_user');
  room.started = true;
  room.roundCount = opts?.roundCount ?? 5;
  room.phase = opts?.phase ?? TurnPhase.PropertyManagement;

  const botAlpha = createPlayer('bot_alpha');
  botAlpha.isBot = true;
  botAlpha.balance = 12_000;
  botAlpha.position = 16;

  const opponentBeta = createPlayer('opponent_beta');
  opponentBeta.isBot = false;
  opponentBeta.balance = 10_000;
  opponentBeta.position = 19;

  const thirdPlayer = createPlayer('player_gamma');
  thirdPlayer.isBot = false;
  thirdPlayer.balance = 8_000;
  thirdPlayer.position = 0;

  room.players = [botAlpha, opponentBeta, thirdPlayer];
  room.currentPlayerIndex = 0;

  const registry: PropertyRegistry = new Map();
  const stateMap: PropertyStateMap = new Map();

  return { room, botAlpha, opponentBeta, thirdPlayer, registry, stateMap };
}

describe('[TC-82][UC-IMP82] IMP-82 Bot Trading and Pacing Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentTurnPlayerId: 'p1',
      turnTimeRemaining: 30,
      treasuryPool: 5_000,
      roundNumber: 3,
      maxRounds: 30,
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Phố Cổ',
          balance: 15_000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          isBot: false,
        } as PlayerHudInfo,
      },
    });
  });

  // =========================================================================
  // FACET 1: Monopoly Gap Detection & Asymmetric Pricing (TC-82.01..04)
  // =========================================================================
  describe('Facet 1: Monopoly Gap Detection & Asymmetric Pricing', () => {
    it('[TC-82.01/MSS][UC-IMP82] findMonopolyGap: Phát hiện chính xác ô còn thiếu khi Bot sở hữu 2/3 ô của nhóm màu Cam', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup();
      // Orange group: 16 (Bình Định), 18 (Huế), 19 (Đà Nẵng)
      registry.set(16, botAlpha.id);
      registry.set(18, botAlpha.id);
      registry.set(19, opponentBeta.id);
      stateMap.set(16, { level: 0 });
      stateMap.set(18, { level: 0 });
      stateMap.set(19, { level: 0 });

      const gap = findMonopolyGap(botAlpha, room, registry, stateMap);

      expect(gap).not.toBeNull();
      expect(gap?.cellIndex).toBe(19);
      expect(gap?.targetOwnerId).toBe(opponentBeta.id);
    });

    it('[TC-82.02/MSS][UC-IMP82] findMonopolyGap: Trả về null khi Bot không có nhóm màu nào đạt N-1 ô hoặc ô còn thiếu đã có công trình/bị cầm cố', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup();
      // Bot only owns 1/3 cells of Orange group (cell 16)
      registry.set(16, botAlpha.id);
      registry.set(18, opponentBeta.id);
      registry.set(19, opponentBeta.id);
      stateMap.set(16, { level: 0 });
      stateMap.set(18, { level: 0 });
      stateMap.set(19, { level: 1 }); // has building

      const gapWithBuilding = findMonopolyGap(botAlpha, room, registry, stateMap);
      expect(gapWithBuilding).toBeNull();

      // Bot owns 2/3 but target cell is mortgaged
      registry.set(18, botAlpha.id);
      stateMap.set(19, { level: 0, isMortgaged: true });
      const gapMortgaged = findMonopolyGap(botAlpha, room, registry, stateMap);
      expect(gapMortgaged).toBeNull();
    });

    it('[TC-82.03/MSS][UC-IMP82] calculateTradeOfferPrice: Bot Aggressive định giá 1.4x giá gốc; Balanced 1.25x; Passive 1.1x', () => {
      const { botAlpha } = createTestRoomSetup();
      // Cell 19 (Đà Nẵng) base price = 2000
      const priceAggressive = calculateTradeOfferPrice(19, botAlpha, BotPersonality.Aggressive);
      const priceBalanced = calculateTradeOfferPrice(19, botAlpha, BotPersonality.Balanced);
      const pricePassive = calculateTradeOfferPrice(19, botAlpha, BotPersonality.Passive);

      expect(priceAggressive).toBe(2800); // 2000 * 1.4
      expect(priceBalanced).toBe(2500);   // 2000 * 1.25
      expect(pricePassive).toBe(2200);    // 2000 * 1.1
    });

    it('[TC-82.04/MSS][UC-IMP82] calculateTradeOfferPrice: Trả về null nếu bot.balance - offerPrice < threat.safetyBuffer', () => {
      const { botAlpha } = createTestRoomSetup();
      // Cell 19 offer price for Aggressive is 2800.
      // Bot has only 3000 cash. If required safety buffer is 500, free cash is only 200 < 500.
      botAlpha.balance = 3000;
      const customSafetyBuffer = 500;

      const price = calculateTradeOfferPrice(19, botAlpha, BotPersonality.Aggressive, customSafetyBuffer);
      expect(price).toBeNull();
    });
  });

  // =========================================================================
  // FACET 2: Seller Bot Acceptance / Rejection & Kingmaking Defense (TC-82.05..08)
  // =========================================================================
  describe('Facet 2: Seller Bot Acceptance / Rejection & Kingmaking Defense', () => {
    it('[TC-82.05/MSS][UC-IMP82] evaluateBotTradeAcceptance: Bot Aggressive từ chối bán nếu việc bán ô đất giúp đối thủ hoàn thành độc quyền, ngay cả khi giá đề xuất 1.5x', () => {
      const { room, opponentBeta, thirdPlayer, registry, stateMap } = createTestRoomSetup();
      // OpponentBeta is seller (Bot Aggressive). ThirdPlayer is buyer who already owns 16, 18.
      // Selling 19 gives thirdPlayer the Orange monopoly.
      registry.set(16, thirdPlayer.id);
      registry.set(18, thirdPlayer.id);
      registry.set(19, opponentBeta.id);
      opponentBeta.isBot = true;

      const offerPrice = 3000; // 1.5x base price 2000
      const decision = evaluateBotTradeAcceptance(
        19,
        offerPrice,
        opponentBeta,
        thirdPlayer,
        room,
        registry,
        stateMap,
        BotPersonality.Aggressive,
      );

      expect(decision.accept).toBe(false);
      expect(decision.reason).toBe('PREVENT_MONOPOLY');
    });

    it('[TC-82.06/MSS][UC-IMP82] evaluateBotTradeAcceptance: Bot Aggressive đồng ý bán nếu người mua trả giá cắt cổ (>= 2.5x) và Bot đang thiếu hụt tiền mặt', () => {
      const { room, opponentBeta, thirdPlayer, registry, stateMap } = createTestRoomSetup();
      registry.set(19, opponentBeta.id);
      opponentBeta.isBot = true;
      opponentBeta.balance = 200; // severe cash shortage < safetyBuffer

      const exorbitantPrice = 5000; // 2.5x base price 2000
      const decision = evaluateBotTradeAcceptance(
        19,
        exorbitantPrice,
        opponentBeta,
        thirdPlayer,
        room,
        registry,
        stateMap,
        BotPersonality.Aggressive,
      );

      expect(decision.accept).toBe(true);
    });

    it('[TC-82.07/MSS][UC-IMP82] evaluateBotTradeAcceptance: Bot Balanced từ chối bán cho người mua đang dẫn đầu tài sản (kingmaking defense); chấp thuận bán ô đất lẻ không cùng bộ nếu giá >= 1.3x', () => {
      const { room, opponentBeta, thirdPlayer, registry, stateMap } = createTestRoomSetup();
      registry.set(19, opponentBeta.id);
      opponentBeta.isBot = true;
      opponentBeta.balance = 8_000;

      // Kingmaking defense: buyer is runaway wealth leader
      thirdPlayer.balance = 45_000;
      const decisionKingmaking = evaluateBotTradeAcceptance(
        19,
        2700,
        opponentBeta,
        thirdPlayer,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );
      expect(decisionKingmaking.accept).toBe(false);
      expect(decisionKingmaking.reason).toBe('KINGMAKING_DEFENSE');

      // Orphan property accepted at >= 1.3x from non-leader
      thirdPlayer.balance = 9_000;
      const decisionAccept = evaluateBotTradeAcceptance(
        19,
        2600, // 1.3x base price 2000
        opponentBeta,
        thirdPlayer,
        room,
        registry,
        stateMap,
        BotPersonality.Balanced,
      );
      expect(decisionAccept.accept).toBe(true);
    });

    it('[TC-82.08/MSS][UC-IMP82] evaluateBotTradeAcceptance: Bot Passive chấp thuận bán ô đất lẻ khi giá đề xuất >= 1.25x và số dư tiền mặt dưới mức an toàn', () => {
      const { room, opponentBeta, thirdPlayer, registry, stateMap } = createTestRoomSetup();
      registry.set(19, opponentBeta.id);
      opponentBeta.isBot = true;
      opponentBeta.balance = 250; // below safety buffer

      const decision = evaluateBotTradeAcceptance(
        19,
        2500, // 1.25x base price 2000
        opponentBeta,
        thirdPlayer,
        room,
        registry,
        stateMap,
        BotPersonality.Passive,
      );

      expect(decision.accept).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: Proactive Bot Trade Integration in PropertyManagement & Cooldown (TC-82.09..12)
  // =========================================================================
  describe('Facet 3: Proactive Bot Trade Integration & Cooldown', () => {
    it('[TC-82.09/MSS][UC-IMP82] decideBotIntent: Tại TurnPhase.PropertyManagement, nếu không có ô nâng cấp/chuộc đất và phát hiện gap hợp lệ, Bot trả về intent INTENT_TRADE_OFFER', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup({
        phase: TurnPhase.PropertyManagement,
        roundCount: 6,
      });
      // Bot owns 16, 18. OpponentBeta owns 19. No upgrades possible, no mortgages to redeem.
      registry.set(16, botAlpha.id);
      registry.set(18, botAlpha.id);
      registry.set(19, opponentBeta.id);
      stateMap.set(16, { level: 0 });
      stateMap.set(18, { level: 0 });
      stateMap.set(19, { level: 0 });

      const config: BotConfig = {
        personality: BotPersonality.Aggressive,
        balanceThresholdMultiplier: 1.0,
      };

      const intent = decideBotIntent(botAlpha, room, registry, stateMap, config);

      expect(intent).not.toBeNull();
      expect(intent?.type).toBe('INTENT_TRADE_OFFER');
      expect(intent?.cellIndex).toBe(19);
      expect(intent?.targetPlayerId ?? intent?.sellerId).toBe(opponentBeta.id);
    });

    it('[TC-82.10/MSS][UC-IMP82] Cooldown: Bot chỉ đề xuất tối đa 1 lần mỗi 2 vòng; nếu vừa đề xuất ở vòng hiện tại thì lần sau trả về INTENT_END_TURN', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup({
        phase: TurnPhase.PropertyManagement,
        roundCount: 6,
      });
      registry.set(16, botAlpha.id);
      registry.set(18, botAlpha.id);
      registry.set(19, opponentBeta.id);
      stateMap.set(16, { level: 0 });
      stateMap.set(18, { level: 0 });
      stateMap.set(19, { level: 0 });

      // Bot recently made a trade offer in round 6 (same round cooldown active)
      (botAlpha as any).lastTradeOfferRound = 6;

      const config: BotConfig = {
        personality: BotPersonality.Aggressive,
        balanceThresholdMultiplier: 1.0,
      };

      const intent = decideBotIntent(botAlpha, room, registry, stateMap, config);

      expect(intent).not.toBeNull();
      expect(intent?.type).toBe('INTENT_END_TURN');
    });

    it('[TC-82.11/MSS][UC-IMP82] coordTrade: Giao dịch P2P giữa 2 Bot thành công khi người bán chấp thuận, chuyển giao quyền sở hữu và tài chính chuẩn xác', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup();
      // opponentBeta is seller bot in cash trouble, botAlpha is buyer bot offering 5000 (exorbitant)
      opponentBeta.isBot = true;
      opponentBeta.balance = 400;
      botAlpha.balance = 12_000;
      registry.set(19, opponentBeta.id);
      stateMap.set(19, { level: 0 });

      const ctx: RoomContext = { room, reg: registry, sm: stateMap };
      const tradePrice = 5000;
      const res = coordTrade(ctx, botAlpha.id, opponentBeta.id, botAlpha.id, 19, tradePrice);

      expect(res.success).toBe(true);
      expect(registry.get(19)).toBe(botAlpha.id);
      expect(botAlpha.balance).toBe(7000); // 12000 - 5000
      expect(opponentBeta.balance).toBeGreaterThan(400); // received net funds after tax
    });

    it('[TC-82.12/MSS][UC-IMP82] coordTrade: Giao dịch P2P bị từ chối nếu người bán là Bot đánh giá không đạt tiêu chí chấp thuận (TRADE_REJECTED)', () => {
      const { room, botAlpha, opponentBeta, registry, stateMap } = createTestRoomSetup();
      // opponentBeta is seller (Aggressive bot). botAlpha already owns 16, 18 and wants 19.
      // Selling 19 gives botAlpha monopoly, but offer is only 2500. OpponentBeta rejects.
      opponentBeta.isBot = true;
      registry.set(16, botAlpha.id);
      registry.set(18, botAlpha.id);
      registry.set(19, opponentBeta.id);
      stateMap.set(16, { level: 0 });
      stateMap.set(18, { level: 0 });
      stateMap.set(19, { level: 0 });

      const initialBuyerBalance = botAlpha.balance;
      const initialSellerBalance = opponentBeta.balance;

      const ctx: RoomContext = { room, reg: registry, sm: stateMap };
      const res = coordTrade(ctx, botAlpha.id, opponentBeta.id, botAlpha.id, 19, 2500);

      expect(res.success).toBe(false);
      expect(res.reason).toBe((ActionRejectReason as any).TRADE_REJECTED ?? 'TRADE_REJECTED');
      expect(registry.get(19)).toBe(opponentBeta.id);
      expect(botAlpha.balance).toBe(initialBuyerBalance);
      expect(opponentBeta.balance).toBe(initialSellerBalance);
    });
  });

  // =========================================================================
  // FACET 4: TopBar Bot Pacing Display & Watchdog 90s Auction Tolerance (TC-82.13..16)
  // =========================================================================
  describe('Facet 4: TopBar Bot Pacing Display & Watchdog 90s Auction Tolerance', () => {
    it('[TC-82.13/MSS][UC-IMP82] TopBar: khi currentTurnPlayer.isBot === true, hiển thị chuỗi 🤖 Đang tính... thay vì 00:00', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_pacing_p1',
        playersInfo: {
          bot_pacing_p1: {
            id: 'bot_pacing_p1',
            name: 'Bot Siêu Trí Tuệ',
            balance: 10_000,
            tokenColor: '#2563EB',
            ownedProperties: [],
            isBot: true,
          } as PlayerHudInfo,
        },
        turnTimeRemaining: 0,
      });

      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).toContain('🤖 Đang tính...');
      expect(html).not.toContain('00:00');
    });

    it('[TC-82.14/MSS][UC-IMP82] TopBar: không áp dụng class màu đỏ cảnh báo text-rose-600 animate-pulse khi là lượt Bot', () => {
      useGameStore.setState({
        currentTurnPlayerId: 'bot_pacing_p1',
        playersInfo: {
          bot_pacing_p1: {
            id: 'bot_pacing_p1',
            name: 'Bot Siêu Trí Tuệ',
            balance: 10_000,
            tokenColor: '#2563EB',
            ownedProperties: [],
            isBot: true,
          } as PlayerHudInfo,
        },
        turnTimeRemaining: 0,
      });

      const html = renderToStaticMarkup(React.createElement(TopBar));

      expect(html).not.toContain('text-rose-600 font-extrabold animate-pulse');
    });

    it('[TC-82.15/MSS][UC-IMP82] watchdogMonitor.checkTurnStall: Khi isInAuction === true, lượt đấu giá kéo dài 60s (> 45s) không kích hoạt vi phạm TURN_STALLED', () => {
      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: -8,
        elapsedTurnMs: 60_000,
        tick: 14,
        isInAuction: true,
      } as any);

      expect(violation).toBeNull();
    });

    it('[TC-82.16/MSS][UC-IMP82] watchdogMonitor.checkTurnStall: Khi isInAuction === true, nếu kéo dài quá 90s (> 90.000ms) thì mới kích hoạt vi phạm TURN_STALLED', () => {
      const violation = watchdogMonitor.checkTurnStall({
        currentTurnPlayerId: 'p1',
        timeRemaining: -12,
        elapsedTurnMs: 91_500,
        tick: 15,
        isInAuction: true,
      } as any);

      expect(violation).not.toBeNull();
      expect(violation?.type).toBe('TURN_STALLED');
      expect(violation?.details?.elapsedMs).toBe(91_500);
    });
  });
});

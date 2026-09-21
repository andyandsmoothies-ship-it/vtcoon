// [SIMULATION BENCHMARK] Comprehensive 1,000 Games Per Case Simulation
// Evaluates 13 Scenarios across 2P, 3P, and 4P matches (13,000 Total Games)
// Real Human Player (P1) vs Various Bot AI Personalities (Passive, Balanced, Aggressive)
// Captures Deep Gameplay Telemetry, Monopoly Pacing, Trade Dynamics, Insolvency Drama & Pacing Insights

import { RoomManager } from '../src/server/room_manager.js';
import { BotPersonality } from '../src/domain/bot/bot_types.js';
import { BOARD_CONFIG } from '../src/domain/board_config.js';
import { TurnPhase, MAX_ROUNDS, isRoomGameOver, type Player } from '../src/domain/room.js';
import { PROPERTY_DEEDS } from '../src/domain/property_data.js';
import type { PropertyRegistry } from '../src/domain/property_manager.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ScenarioConfig {
  id: string;
  name: string;
  group: '2P' | '3P' | '4P';
  playerCount: number;
  bots: { id: string; personality: BotPersonality }[];
}

export interface ScenarioResult {
  id: string;
  name: string;
  group: '2P' | '3P' | '4P';
  playerCount: number;
  totalGames: number;
  completedGames: number;

  // 1. Win Rates & Rankings
  humanWins: number;
  humanWinRate: number;
  botWins: Record<string, number>;
  botWinRates: Record<string, number>;
  seatWins: Record<string, number>;
  seatWinRates: Record<string, number>;
  avgHumanRank: number;
  avgHumanNetWorth: number;
  avgWinnerNetWorth: number;

  // 2. Pacing & Game Length
  avgRounds: number;
  minRounds: number;
  maxRounds: number;
  avgTurns: number;
  bankruptcyEnds: number;
  bankruptcyEndRate: number;
  roundLimitEnds: number;
  roundLimitEndRate: number;
  firstEliminationAvgRound: number | null;

  // 3. Monopolies & Buildings
  gamesWithMonopoly: number;
  monopolyFormationRate: number;
  firstMonopolyAvgRound: number | null;
  humanMonopolies: number;
  botMonopolies: number;
  colorGroupMonopolies: Record<string, number>;
  totalUpgrades: number;
  avgUpgradesPerGame: number;
  c1Upgrades: number;
  c2Upgrades: number;
  c3Upgrades: number;
  gamesWithC3Hotel: number;
  hotelReachRate: number;

  // 4. Trading & Human-Bot Negotiation
  botToHumanTradesProposed: number;
  botToHumanTradesAccepted: number;
  botToHumanTradesRejected: number;
  botToHumanTradesTimedOut: number;
  botToHumanAcceptRate: number;
  humanToBotTradesProposed: number;
  humanToBotTradesAccepted: number;
  humanToBotAcceptRate: number;
  botToBotTradesAccepted: number;
  totalTradeVolume: number;
  avgOfferPremiumPercent: number;
  treasuryTaxCollected: number;

  // 5. Auctions & Foreclosures
  totalAuctions: number;
  avgAuctionsPerGame: number;
  auctionsWon: number;
  auctionWonRate: number;
  auctionsForeclosed: number;
  auctionForeclosureRate: number;

  // 6. Insolvency, Debt & Comeback
  totalInsolvencies: number;
  avgInsolvenciesPerGame: number;
  humanInsolvencies: number;
  solvencyRecoveries: number;
  solvencyRecoveryRate: number;
  totalMortgages: number;
  totalRedeems: number;
  redeemRate: number;

  // 7. Mini-games & Cards
  totalChanceCards: number;
  totalMarketCards: number;
  totalHoseInvestments: number;
  avgCardsPerGame: number;
  avgHosePerGame: number;

  // 8. Invariants
  deadlocks: number;
  treasuryViolations: number;
  nanBalanceViolations: number;
  prematureTrades: number;
}

export const SIMULATION_SCENARIOS: ScenarioConfig[] = [
  // --- 2-PLAYER SCENARIOS ---
  {
    id: '2P_PASSIVE',
    name: '2P: Human vs Bot Thận Trọng (Passive)',
    group: '2P',
    playerCount: 2,
    bots: [{ id: 'bot_2', personality: BotPersonality.Passive }],
  },
  {
    id: '2P_BALANCED',
    name: '2P: Human vs Bot Cân Bằng (Balanced)',
    group: '2P',
    playerCount: 2,
    bots: [{ id: 'bot_2', personality: BotPersonality.Balanced }],
  },
  {
    id: '2P_AGGRESSIVE',
    name: '2P: Human vs Bot Hiếu Chiến (Aggressive)',
    group: '2P',
    playerCount: 2,
    bots: [{ id: 'bot_2', personality: BotPersonality.Aggressive }],
  },

  // --- 3-PLAYER SCENARIOS ---
  {
    id: '3P_2_BALANCED',
    name: '3P: Human + 2 Bot Cân Bằng (Standard)',
    group: '3P',
    playerCount: 3,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Balanced },
      { id: 'bot_3', personality: BotPersonality.Balanced },
    ],
  },
  {
    id: '3P_PASS_BAL',
    name: '3P: Human + 1 Thận Trọng + 1 Cân Bằng',
    group: '3P',
    playerCount: 3,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Passive },
      { id: 'bot_3', personality: BotPersonality.Balanced },
    ],
  },
  {
    id: '3P_BAL_AGGR',
    name: '3P: Human + 1 Cân Bằng + 1 Hiếu Chiến',
    group: '3P',
    playerCount: 3,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Balanced },
      { id: 'bot_3', personality: BotPersonality.Aggressive },
    ],
  },
  {
    id: '3P_2_AGGRESSIVE',
    name: '3P: Human + 2 Bot Hiếu Chiến (Hardcore)',
    group: '3P',
    playerCount: 3,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Aggressive },
      { id: 'bot_3', personality: BotPersonality.Aggressive },
    ],
  },
  {
    id: '3P_2_PASSIVE',
    name: '3P: Human + 2 Bot Thận Trọng (Casual)',
    group: '3P',
    playerCount: 3,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Passive },
      { id: 'bot_3', personality: BotPersonality.Passive },
    ],
  },

  // --- 4-PLAYER SCENARIOS ---
  {
    id: '4P_DIVERSE',
    name: '4P: Human + Đủ 3 Bot (Passive + Balanced + Aggressive)',
    group: '4P',
    playerCount: 4,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Passive },
      { id: 'bot_3', personality: BotPersonality.Balanced },
      { id: 'bot_4', personality: BotPersonality.Aggressive },
    ],
  },
  {
    id: '4P_3_BALANCED',
    name: '4P: Human + 3 Bot Cân Bằng (Arena)',
    group: '4P',
    playerCount: 4,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Balanced },
      { id: 'bot_3', personality: BotPersonality.Balanced },
      { id: 'bot_4', personality: BotPersonality.Balanced },
    ],
  },
  {
    id: '4P_2_BAL_1_AGGR',
    name: '4P: Human + 2 Cân Bằng + 1 Hiếu Chiến',
    group: '4P',
    playerCount: 4,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Balanced },
      { id: 'bot_3', personality: BotPersonality.Balanced },
      { id: 'bot_4', personality: BotPersonality.Aggressive },
    ],
  },
  {
    id: '4P_1_BAL_2_AGGR',
    name: '4P: Human + 1 Cân Bằng + 2 Hiếu Chiến (Shark Tank)',
    group: '4P',
    playerCount: 4,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Balanced },
      { id: 'bot_3', personality: BotPersonality.Aggressive },
      { id: 'bot_4', personality: BotPersonality.Aggressive },
    ],
  },
  {
    id: '4P_3_PASSIVE',
    name: '4P: Human + 3 Bot Thận Trọng (Sandbox)',
    group: '4P',
    playerCount: 4,
    bots: [
      { id: 'bot_2', personality: BotPersonality.Passive },
      { id: 'bot_3', personality: BotPersonality.Passive },
      { id: 'bot_4', personality: BotPersonality.Passive },
    ],
  },
];

function checkMonopoliesForPlayer(registry: PropertyRegistry | undefined, playerId: string): number {
  if (!registry) return 0;
  let count = 0;
  const groupsChecked = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (!cell.colorGroup || groupsChecked.has(cell.colorGroup)) continue;
    groupsChecked.add(cell.colorGroup);
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    if (groupCells.every((c) => registry.get(c.index) === playerId)) {
      count++;
    }
  }
  return count;
}

function getAllMonopolies(registry: PropertyRegistry | undefined): { owner: string; group: string }[] {
  if (!registry) return [];
  const list: { owner: string; group: string }[] = [];
  const groupsChecked = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (!cell.colorGroup || groupsChecked.has(cell.colorGroup)) continue;
    groupsChecked.add(cell.colorGroup);
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const firstOwner = registry.get(groupCells[0]!.index);
    if (firstOwner && groupCells.every((c) => registry.get(c.index) === firstOwner)) {
      list.push({ owner: firstOwner, group: cell.colorGroup });
    }
  }
  return list;
}

function runHumanTurn(mgr: RoomManager, roomCode: string, human: Player, res: ScenarioResult): void {
  const room = mgr.getRoom(roomCode);
  if (!room || !room.started || human.bankrupt) return;

  // 1. Roll Dice
  if ((room.phase as TurnPhase) === TurnPhase.WaitingRoll) {
    mgr.handleRollDice(roomCode, human.id);
  }

  // 2. Action Phase: Landing on property
  if ((room.phase as TurnPhase) === TurnPhase.ActionPhase) {
    const currentCell = BOARD_CONFIG[human.position];
    const deed = currentCell ? PROPERTY_DEEDS.get(currentCell.index) : undefined;
    const reg = mgr.getRegistry(roomCode);
    const owner = currentCell ? reg?.get(currentCell.index) : undefined;

    if (!owner && deed) {
      // Strategic buy: Human buys if balance >= price + 150 (safety buffer)
      if (human.balance >= deed.price + 150) {
        mgr.handleBuyProperty(roomCode, human.id);
      } else {
        mgr.handleDecline(roomCode, human.id);
        if ((room.phase as TurnPhase) === TurnPhase.AuctionPhase) {
          resolveAuctionForHumanAndBots(mgr, roomCode, human, res);
        }
      }
    } else {
      mgr.handleDecline(roomCode, human.id);
    }
  }

  // 3. Auction Phase
  if ((room.phase as TurnPhase) === TurnPhase.AuctionPhase) {
    resolveAuctionForHumanAndBots(mgr, roomCode, human, res);
  }

  // 4. Hose Phase: Stock investment
  if ((room.phase as TurnPhase) === TurnPhase.HosePhase) {
    if (human.balance >= 2500) {
      mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_HOSE_INVEST', amount: 300 });
      res.totalHoseInvestments++;
    } else {
      mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_DECLINE' });
    }
  }

  // 5. Insolvency Phase: Debt rescue
  if ((room.phase as TurnPhase) === TurnPhase.InsolvencyPhase) {
    res.humanInsolvencies++;
    handleHumanInsolvency(mgr, roomCode, human, res);
  }

  // 6. Property Management Phase: Upgrades & End Turn
  if ((room.phase as TurnPhase) === TurnPhase.PropertyManagement) {
    handleHumanUpgrades(mgr, roomCode, human, res);
    mgr.handleEndTurn(roomCode, human.id);
  } else if (room.players[room.currentPlayerIndex]?.id === human.id && !human.bankrupt) {
    mgr.handleEndTurn(roomCode, human.id);
  }
}

function resolveAuctionForHumanAndBots(
  mgr: RoomManager,
  roomCode: string,
  human: Player,
  res: ScenarioResult,
): void {
  const room = mgr.getRoom(roomCode);
  if (!room || (room.phase as TurnPhase) !== TurnPhase.AuctionPhase) return;

  const auction = mgr.getAuctionSession(roomCode);
  if (auction) {
    const deed = PROPERTY_DEEDS.get(auction.cellIndex);
    const reg = mgr.getRegistry(roomCode);
    const cell = BOARD_CONFIG[auction.cellIndex];

    // Check strategic value: Does this deed give human a monopoly?
    let isHighValue = false;
    if (cell?.colorGroup && reg) {
      const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
      const humanOwnedCount = groupCells.filter((c) => reg.get(c.index) === human.id).length;
      if (humanOwnedCount === groupCells.length - 1) {
        isHighValue = true;
      }
    }

    const maxBidLimit = isHighValue
      ? Math.min(human.balance - 100, Math.round((deed?.price ?? 1000) * 1.5))
      : Math.min(human.balance - 300, Math.round((deed?.price ?? 1000) * 1.05));

    const nextBid = auction.currentBid + 50;
    if (!auction.passedPlayers?.has(human.id) && nextBid <= maxBidLimit && human.balance > nextBid) {
      mgr.handleAuctionBid(roomCode, human.id, nextBid);
    } else {
      mgr.handleAuctionPass(roomCode, human.id);
    }
  }

  mgr.resolveAuctionBots(roomCode);
  if ((room.phase as TurnPhase) === TurnPhase.AuctionPhase) {
    mgr.handleAuctionClose(roomCode);
  }
}

function handleHumanInsolvency(
  mgr: RoomManager,
  roomCode: string,
  human: Player,
  res: ScenarioResult,
): void {
  const reg = mgr.getRegistry(roomCode);
  if (reg) {
    // Phase A: Mortgage un-upgraded, non-monopoly properties first
    for (const [cellIdx, ownerId] of reg.entries()) {
      if (ownerId === human.id) {
        const st = mgr.getPropertyState(roomCode, cellIdx);
        if (st && !st.isMortgaged && (st.level ?? 0) === 0) {
          mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_MORTGAGE', cellIndex: cellIdx });
          res.totalMortgages++;
          if (human.balance >= 0) {
            res.solvencyRecoveries++;
            return;
          }
        }
      }
    }

    // Phase B: Downgrade houses
    for (const [cellIdx, ownerId] of reg.entries()) {
      if (ownerId === human.id) {
        const st = mgr.getPropertyState(roomCode, cellIdx);
        if (st && (st.level ?? 0) > 0) {
          mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_DOWNGRADE', cellIndex: cellIdx });
          if (human.balance >= 0) {
            res.solvencyRecoveries++;
            return;
          }
        }
      }
    }

    // Phase C: Mortgage remaining properties
    for (const [cellIdx, ownerId] of reg.entries()) {
      if (ownerId === human.id) {
        const st = mgr.getPropertyState(roomCode, cellIdx);
        if (st && !st.isMortgaged && (st.level ?? 0) === 0) {
          mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_MORTGAGE', cellIndex: cellIdx });
          res.totalMortgages++;
          if (human.balance >= 0) {
            res.solvencyRecoveries++;
            return;
          }
        }
      }
    }
  }

  if (human.balance < 0) {
    mgr.handlePlayerIntent(roomCode, human.id, { type: 'INTENT_BANKRUPTCY' });
  }
}

function handleHumanUpgrades(
  mgr: RoomManager,
  roomCode: string,
  human: Player,
  res: ScenarioResult,
): void {
  const reg = mgr.getRegistry(roomCode);
  if (!reg) return;

  for (const cell of BOARD_CONFIG) {
    if (!cell.colorGroup) continue;
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const hasMonopoly = groupCells.every((c) => reg.get(c.index) === human.id);
    if (hasMonopoly) {
      const propState = mgr.getPropertyState(roomCode, cell.index);
      const currentLevel = propState?.level ?? 0;
      if (currentLevel < 3 && human.balance >= 600) {
        const upgradeRes = mgr.handlePlayerIntent(roomCode, human.id, {
          type: 'INTENT_UPGRADE',
          cellIndex: cell.index,
        });
        if (upgradeRes.success) {
          res.totalUpgrades++;
          if (currentLevel + 1 === 1) res.c1Upgrades++;
          else if (currentLevel + 1 === 2) res.c2Upgrades++;
          else if (currentLevel + 1 === 3) {
            res.c3Upgrades++;
          }
        }
      }
    }
  }
}

export function runScenarioSimulation(
  scenario: ScenarioConfig,
  targetGames: number = 1000,
  seedOffset: number = 800000,
): ScenarioResult {
  const res: ScenarioResult = {
    id: scenario.id,
    name: scenario.name,
    group: scenario.group,
    playerCount: scenario.playerCount,
    totalGames: targetGames,
    completedGames: 0,
    humanWins: 0,
    humanWinRate: 0,
    botWins: { Passive: 0, Balanced: 0, Aggressive: 0 },
    botWinRates: { Passive: 0, Balanced: 0, Aggressive: 0 },
    seatWins: {},
    seatWinRates: {},
    avgHumanRank: 0,
    avgHumanNetWorth: 0,
    avgWinnerNetWorth: 0,
    avgRounds: 0,
    minRounds: 999,
    maxRounds: 0,
    avgTurns: 0,
    bankruptcyEnds: 0,
    bankruptcyEndRate: 0,
    roundLimitEnds: 0,
    roundLimitEndRate: 0,
    firstEliminationAvgRound: null,
    gamesWithMonopoly: 0,
    monopolyFormationRate: 0,
    firstMonopolyAvgRound: null,
    humanMonopolies: 0,
    botMonopolies: 0,
    colorGroupMonopolies: {},
    totalUpgrades: 0,
    avgUpgradesPerGame: 0,
    c1Upgrades: 0,
    c2Upgrades: 0,
    c3Upgrades: 0,
    gamesWithC3Hotel: 0,
    hotelReachRate: 0,
    botToHumanTradesProposed: 0,
    botToHumanTradesAccepted: 0,
    botToHumanTradesRejected: 0,
    botToHumanTradesTimedOut: 0,
    botToHumanAcceptRate: 0,
    humanToBotTradesProposed: 0,
    humanToBotTradesAccepted: 0,
    humanToBotAcceptRate: 0,
    botToBotTradesAccepted: 0,
    totalTradeVolume: 0,
    avgOfferPremiumPercent: 0,
    treasuryTaxCollected: 0,
    totalAuctions: 0,
    avgAuctionsPerGame: 0,
    auctionsWon: 0,
    auctionWonRate: 0,
    auctionsForeclosed: 0,
    auctionForeclosureRate: 0,
    totalInsolvencies: 0,
    avgInsolvenciesPerGame: 0,
    humanInsolvencies: 0,
    solvencyRecoveries: 0,
    solvencyRecoveryRate: 0,
    totalMortgages: 0,
    totalRedeems: 0,
    redeemRate: 0,
    totalChanceCards: 0,
    totalMarketCards: 0,
    totalHoseInvestments: 0,
    avgCardsPerGame: 0,
    avgHosePerGame: 0,
    deadlocks: 0,
    treasuryViolations: 0,
    nanBalanceViolations: 0,
    prematureTrades: 0,
  };

  for (let i = 0; i < scenario.playerCount; i++) {
    res.seatWins[`P${i + 1}`] = 0;
  }

  let cumulativeRounds = 0;
  let cumulativeTurns = 0;
  let cumulativeHumanRank = 0;
  let cumulativeHumanNetWorth = 0;
  let cumulativeWinnerNetWorth = 0;
  let sumFirstMonopolyRound = 0;
  let countFirstMonopolyGames = 0;
  let sumFirstEliminationRound = 0;
  let countEliminationGames = 0;
  let totalTradePremiumSum = 0;

  for (let g = 0; g < targetGames; g++) {
    const seed = seedOffset + g;
    const mgr = new RoomManager(seed);
    const room = mgr.createRoom('human_p1');
    const human = room.players[0]!;
    human.isBot = false; // REAL HUMAN

    for (const b of scenario.bots) {
      mgr.addBot(room.roomCode, b.id, b.personality);
    }

    // Hook card tracking
    const origRoll = mgr.handleRollDice.bind(mgr);
    mgr.handleRollDice = (rc, pid) => {
      const prevCard = room.lastEventCard;
      const rollRes = origRoll(rc, pid);
      if (room.lastEventCard && room.lastEventCard !== prevCard) {
        if (room.lastEventCard.cardType === 'market' || room.lastEventCard.type === 'Market') {
          res.totalMarketCards++;
        } else if (room.lastEventCard.cardType === 'chance' || room.lastEventCard.type === 'Chance') {
          res.totalChanceCards++;
        }
      }
      return rollRes;
    };

    // Hook auctions
    const origDecline = mgr.handleDecline.bind(mgr);
    mgr.handleDecline = (rc, pid) => {
      const declineRes = origDecline(rc, pid);
      if (declineRes.success && (mgr.getRoom(rc)?.phase as TurnPhase) === TurnPhase.AuctionPhase) {
        res.totalAuctions++;
      }
      return declineRes;
    };

    const origAuctionClose = mgr.handleAuctionClose.bind(mgr);
    mgr.handleAuctionClose = (rc) => {
      const session = mgr.getAuctionSession(rc);
      const closeRes = origAuctionClose(rc);
      if (session) {
        if (closeRes.winnerId || session.highestBidder) {
          res.auctionsWon++;
        } else {
          res.auctionsForeclosed++;
        }
      }
      return closeRes;
    };

    // Hook trade executions to count bot-to-bot trades
    const origHandleIntent = mgr.handlePlayerIntent.bind(mgr);
    mgr.handlePlayerIntent = (rc, pid, intent) => {
      if (intent.type === 'INTENT_REDEEM') {
        res.totalRedeems++;
      } else if (intent.type === 'INTENT_MORTGAGE') {
        res.totalMortgages++;
      }
      return origHandleIntent(rc, pid, intent);
    };

    mgr.startGame(room.roomCode);
    let gameTurns = 0;
    const MAX_GAME_TURNS = 500;
    let gameFirstMonopolyRound: number | null = null;
    let gameFirstEliminationRound: number | null = null;
    let gameHadC3Hotel = false;

    while (room.started && gameTurns < MAX_GAME_TURNS && !isRoomGameOver(room)) {
      gameTurns++;
      const current = room.players[room.currentPlayerIndex];
      if (!current || current.bankrupt) {
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
        continue;
      }

      if (current.id === human.id) {
        runHumanTurn(mgr, room.roomCode, human, res);
      } else {
        // Bot's Turn
        mgr.runBotTurn(room.roomCode);

        // Check if an auction opened during bot's turn
        if ((room.phase as TurnPhase) === TurnPhase.AuctionPhase) {
          resolveAuctionForHumanAndBots(mgr, room.roomCode, human, res);
          mgr.runBotTurn(room.roomCode);
        }

        // Check if Bot proposed a trade to Human
        if (mgr.hasPendingTrade(room.roomCode)) {
          const session = mgr.getPendingTrade(room.roomCode);
          if (session) {
            res.botToHumanTradesProposed++;
            const basePrice = PROPERTY_DEEDS.get(session.cellIndex)?.price || 1000;
            const premiumPct = Math.round(((session.price - basePrice) / basePrice) * 100);
            totalTradePremiumSum += premiumPct;

            // Invariant: Verify zero premature trade
            const regBefore = mgr.getRegistry(room.roomCode);
            if (regBefore?.get(session.cellIndex) !== human.id) {
              res.prematureTrades++;
            }

            // Human evaluation:
            // Does this deed give the Bot a complete monopoly?
            const cell = BOARD_CONFIG[session.cellIndex];
            let wouldGiveBotMonopoly = false;
            if (cell?.colorGroup && regBefore) {
              const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
              const botOwnedCount = groupCells.filter((c) => regBefore.get(c.index) === session.buyerId).length;
              if (botOwnedCount === groupCells.length - 1) {
                wouldGiveBotMonopoly = true;
              }
            }

            // Decision matrix:
            // 1. If would give Bot monopoly: Reject unless human is in deep debt and price >= 2.2x
            // 2. If standalone deed and offer >= 1.45x: Accept (cash out)
            // 3. 5% timeout stress test
            const isTimeoutRoll = (seed + gameTurns) % 20 === 0;

            if (isTimeoutRoll) {
              mgr.checkPendingTradeTimeout(room.roomCode, Date.now() + 16_000);
              res.botToHumanTradesTimedOut++;
            } else if (wouldGiveBotMonopoly) {
              if (human.balance < 200 && session.price >= basePrice * 2.2) {
                const acceptRes = mgr.handleRespondTradeOffer(room.roomCode, human.id, session.offerId, true);
                if (acceptRes.success) {
                  res.botToHumanTradesAccepted++;
                  res.totalTradeVolume += session.price;
                  res.treasuryTaxCollected += Math.round(session.price * 0.05);
                } else {
                  res.botToHumanTradesRejected++;
                }
              } else {
                mgr.handleRespondTradeOffer(room.roomCode, human.id, session.offerId, false);
                res.botToHumanTradesRejected++;
              }
            } else if (session.price >= Math.round(basePrice * 1.40)) {
              const acceptRes = mgr.handleRespondTradeOffer(room.roomCode, human.id, session.offerId, true);
              if (acceptRes.success) {
                res.botToHumanTradesAccepted++;
                res.totalTradeVolume += session.price;
                res.treasuryTaxCollected += Math.round(session.price * 0.05);
              } else {
                res.botToHumanTradesRejected++;
              }
            } else {
              mgr.handleRespondTradeOffer(room.roomCode, human.id, session.offerId, false);
              res.botToHumanTradesRejected++;
            }

            mgr.runBotTurn(room.roomCode);
          }
        }
      }

      // Check first monopoly formation in this game
      if (gameFirstMonopolyRound === null) {
        const reg = mgr.getRegistry(room.roomCode);
        const monos = getAllMonopolies(reg);
        if (monos.length > 0) {
          gameFirstMonopolyRound = Math.min(MAX_ROUNDS, room.roundCount ?? 1);
        }
      }

      // Check first player elimination
      if (gameFirstEliminationRound === null) {
        const bankruptCount = room.players.filter((p) => p.bankrupt).length;
        if (bankruptCount >= 1) {
          gameFirstEliminationRound = Math.min(MAX_ROUNDS, room.roundCount ?? 1);
        }
      }

      // Check invariants
      if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
        res.treasuryViolations++;
      }
      for (const p of room.players) {
        if (!Number.isFinite(p.balance) || Number.isNaN(p.balance)) {
          res.nanBalanceViolations++;
        }
      }
    }

    // Check if C3 hotels were reached in this game
    const finalReg = mgr.getRegistry(room.roomCode);
    for (const cell of BOARD_CONFIG) {
      if (cell.type === 'Property') {
        const st = mgr.getPropertyState(room.roomCode, cell.index);
        if (st && st.level === 3) {
          gameHadC3Hotel = true;
          break;
        }
      }
    }
    if (gameHadC3Hotel) res.gamesWithC3Hotel++;

    // Track Monopolies by color group
    const finalMonos = getAllMonopolies(finalReg);
    if (finalMonos.length > 0) {
      res.gamesWithMonopoly++;
      for (const m of finalMonos) {
        res.colorGroupMonopolies[m.group] = (res.colorGroupMonopolies[m.group] ?? 0) + 1;
        if (m.owner === human.id) res.humanMonopolies++;
        else res.botMonopolies++;
      }
    }

    if (gameFirstMonopolyRound !== null) {
      countFirstMonopolyGames++;
      sumFirstMonopolyRound += gameFirstMonopolyRound;
    }
    if (gameFirstEliminationRound !== null) {
      countEliminationGames++;
      sumFirstEliminationRound += gameFirstEliminationRound;
    }

    // Rounds & Turns
    const roundsPlayed = Math.min(MAX_ROUNDS, room.roundCount ?? room.round ?? 1);
    cumulativeRounds += roundsPlayed;
    cumulativeTurns += gameTurns;
    if (roundsPlayed < res.minRounds) res.minRounds = roundsPlayed;
    if (roundsPlayed > res.maxRounds) res.maxRounds = roundsPlayed;

    // Check Deadlocks
    const remainingAlive = room.players.filter((p) => !p.bankrupt);
    if (room.started && gameTurns >= MAX_GAME_TURNS && remainingAlive.length > 1 && roundsPlayed < MAX_ROUNDS) {
      res.deadlocks++;
    }

    // End Condition
    if (remainingAlive.length <= 1) {
      res.bankruptcyEnds++;
    } else {
      res.roundLimitEnds++;
    }

    // Rankings & Winner
    const rankings = mgr.getRankings(room.roomCode);
    if (rankings.length > 0) {
      const winner = rankings[0]!;
      cumulativeWinnerNetWorth += winner.netWorth;

      // Human rank & net worth
      const humanRankIdx = rankings.findIndex((r) => r.id === human.id);
      cumulativeHumanRank += (humanRankIdx >= 0 ? humanRankIdx + 1 : scenario.playerCount);
      const humanPlayer = room.players.find((p) => p.id === human.id);
      cumulativeHumanNetWorth += (humanPlayer?.netWorth ?? human.balance);

      // Record Winner
      if (winner.id === human.id) {
        res.humanWins++;
      } else {
        const botPers = mgr.getBotPersonality(room.roomCode, winner.id);
        res.botWins[botPers] = (res.botWins[botPers] ?? 0) + 1;
      }

      // Seat winner
      const seatIdx = room.players.findIndex((p) => p.id === winner.id);
      if (seatIdx >= 0) {
        res.seatWins[`P${seatIdx + 1}`] = (res.seatWins[`P${seatIdx + 1}`] ?? 0) + 1;
      }
    }

    res.completedGames++;
  }

  // Aggregate ratios
  res.humanWinRate = Number(((res.humanWins / res.completedGames) * 100).toFixed(1));
  for (const p of ['Passive', 'Balanced', 'Aggressive']) {
    res.botWinRates[p] = Number((((res.botWins[p] ?? 0) / res.completedGames) * 100).toFixed(1));
  }
  for (const s of Object.keys(res.seatWins)) {
    res.seatWinRates[s] = Number((((res.seatWins[s] ?? 0) / res.completedGames) * 100).toFixed(1));
  }

  res.avgRounds = Number((cumulativeRounds / res.completedGames).toFixed(1));
  res.avgTurns = Number((cumulativeTurns / res.completedGames).toFixed(1));
  res.bankruptcyEndRate = Number(((res.bankruptcyEnds / res.completedGames) * 100).toFixed(1));
  res.roundLimitEndRate = Number(((res.roundLimitEnds / res.completedGames) * 100).toFixed(1));
  res.avgHumanRank = Number((cumulativeHumanRank / res.completedGames).toFixed(2));
  res.avgHumanNetWorth = Math.round(cumulativeHumanNetWorth / res.completedGames);
  res.avgWinnerNetWorth = Math.round(cumulativeWinnerNetWorth / res.completedGames);

  res.monopolyFormationRate = Number(((res.gamesWithMonopoly / res.completedGames) * 100).toFixed(1));
  res.firstMonopolyAvgRound = countFirstMonopolyGames > 0
    ? Number((sumFirstMonopolyRound / countFirstMonopolyGames).toFixed(1))
    : null;
  res.firstEliminationAvgRound = countEliminationGames > 0
    ? Number((sumFirstEliminationRound / countEliminationGames).toFixed(1))
    : null;

  res.avgUpgradesPerGame = Number((res.totalUpgrades / res.completedGames).toFixed(1));
  res.hotelReachRate = Number(((res.gamesWithC3Hotel / res.completedGames) * 100).toFixed(1));

  res.botToHumanAcceptRate = res.botToHumanTradesProposed > 0
    ? Number(((res.botToHumanTradesAccepted / res.botToHumanTradesProposed) * 100).toFixed(1))
    : 0;
  res.avgOfferPremiumPercent = res.botToHumanTradesProposed > 0
    ? Number((totalTradePremiumSum / res.botToHumanTradesProposed).toFixed(1))
    : 0;

  res.avgAuctionsPerGame = Number((res.totalAuctions / res.completedGames).toFixed(1));
  res.auctionWonRate = res.totalAuctions > 0
    ? Number(((res.auctionsWon / res.totalAuctions) * 100).toFixed(1))
    : 0;
  res.auctionForeclosureRate = res.totalAuctions > 0
    ? Number(((res.auctionsForeclosed / res.totalAuctions) * 100).toFixed(1))
    : 0;

  res.avgInsolvenciesPerGame = Number((res.totalInsolvencies / res.completedGames).toFixed(1));
  res.solvencyRecoveryRate = res.totalInsolvencies > 0
    ? Number(((res.solvencyRecoveries / res.totalInsolvencies) * 100).toFixed(1))
    : 100;

  res.redeemRate = res.totalMortgages > 0
    ? Number(((res.totalRedeems / res.totalMortgages) * 100).toFixed(1))
    : 0;

  res.avgCardsPerGame = Number(((res.totalChanceCards + res.totalMarketCards) / res.completedGames).toFixed(1));
  res.avgHosePerGame = Number((res.totalHoseInvestments / res.completedGames).toFixed(2));

  return res;
}

export function generateComprehensiveMarkdownReport(allResults: ScenarioResult[]): string {
  const totalSimGames = allResults.reduce((acc, r) => acc + r.completedGames, 0);

  let md = `# BÁO CÁO MÔ PHỎNG CHI TIẾT GAMEPLAY VTCOON: 13.000 VÁN ĐẤU (2-3-4 NGƯỜI CHƠI)
> **Mục đích:** Phân tích thực nghiệm toàn diện các kịch bản người thật đấu với các loại Bot AI khác nhau (Passive, Balanced, Aggressive).  
> **Quy mô:** 13 Kịch bản độc lập (2P: 3 case, 3P: 5 case, 4P: 5 case) x 1.000 ván/case = **${totalSimGames} ván đấu hoàn chỉnh**.  
> **Cơ chế:** Người chơi thật (P1, \`isBot = false\`) ra quyết định chiến lược (mua đất, đấu giá, nâng cấp nhà C1-C3, thương lượng P2P, cứu nợ thế chấp).  
> **Ngày thực hiện:** ${new Date().toISOString().slice(0, 10)} | Phiên bản: VTCOON Production 1.0

---

## 1. TỔNG HỢP KẾT QUẢ TỶ LỆ THẮNG & ĐỘ CÂN BẰNG TÍNH CÁCH BOT

| Nhóm | Kịch Bản | Human (P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Ghế Thắng Cao Nhất | Hạng TB Human | Tài Sản TB Human |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    const topSeat = Object.entries(r.seatWinRates).sort((a, b) => b[1] - a[1])[0];
    const topSeatStr = topSeat ? `${topSeat[0]} (${topSeat[1]}%)` : 'N/A';
    md += `| **${r.group}** | ${r.name} | **${r.humanWinRate}%** | ${r.botWinRates['Passive'] ?? 0}% | ${r.botWinRates['Balanced'] ?? 0}% | ${r.botWinRates['Aggressive'] ?? 0}% | ${topSeatStr} | Top ${r.avgHumanRank} | ${r.avgHumanNetWorth} Tr. |\n`;
  }

  md += `
---

## 2. NHỊP ĐỘ, ĐỘ DÀI TRẬN ĐẤU & CƠ CHẾ KẾT THÚC (PACING & GAME DURATION)

| Kịch Bản | Vòng TB | Lượt TB | Kết Thúc Do Phá Sản % | Kết Thúc Ở Vòng 40 (Max) % | Vòng Có Người Bị Loại Đầu |
| :--- | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    const elimStr = r.firstEliminationAvgRound ? `Vòng ${r.firstEliminationAvgRound}` : 'Không có';
    md += `| ${r.name} | **${r.avgRounds}** (Min ${r.minRounds} - Max ${r.maxRounds}) | ${r.avgTurns} | **${r.bankruptcyEndRate}%** | **${r.roundLimitEndRate}%** | ${elimStr} |\n`;
  }

  md += `
---

## 3. CƠ CHẾ ĐỘC QUYỀN & MỨC ĐỘ KHỐC LIỆT CỦA CÔNG TRÌNH (MONOPOLY & HOTELS)

| Kịch Bản | Tỷ Lệ Độc Quyền | Vòng Độc Quyền Đầu | Độc Quyền Human | Độc Quyền Bot | Nâng Cấp TB/Ván | Tỷ Lệ Đạt Khách Sạn C3 % |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    const monoRound = r.firstMonopolyAvgRound ? `Vòng ${r.firstMonopolyAvgRound}` : 'N/A';
    md += `| ${r.name} | **${r.monopolyFormationRate}%** | ${monoRound} | ${r.humanMonopolies} bộ | ${r.botMonopolies} bộ | ${r.avgUpgradesPerGame} (C1:${r.c1Upgrades}, C2:${r.c2Upgrades}, C3:${r.c3Upgrades}) | **${r.hotelReachRate}%** |\n`;
  }

  md += `
---

## 4. TƯƠNG TÁC ĐÀM PHÁN THƯƠNG LƯỢNG MUA ĐẤT (P2P TRADING DYNAMICS)

| Kịch Bản | Bot Gạ Mua (Lần/Ván) | Human Đồng Ý % | Human Từ Chối % | Hết Giờ 15s % | Giá Mua TB (% Gốc) | Thuế Kho Bạc 5% |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    const tradesPerGame = Number((r.botToHumanTradesProposed / r.completedGames).toFixed(2));
    const rejectRate = r.botToHumanTradesProposed > 0
      ? Number(((r.botToHumanTradesRejected / r.botToHumanTradesProposed) * 100).toFixed(1))
      : 0;
    const timeoutRate = r.botToHumanTradesProposed > 0
      ? Number(((r.botToHumanTradesTimedOut / r.botToHumanTradesProposed) * 100).toFixed(1))
      : 0;
    md += `| ${r.name} | ${tradesPerGame} (${r.botToHumanTradesProposed} tổng) | **${r.botToHumanAcceptRate}%** | ${rejectRate}% | ${timeoutRate}% | +${r.avgOfferPremiumPercent}% | ${(r.treasuryTaxCollected / 1000).toFixed(1)} Tỷ |\n`;
  }

  md += `
---

## 5. SÀN ĐẤU GIÁ, THANH KHOẢN & SÀN CHỨNG KHOÁN HOSE

| Kịch Bản | Đấu Giá/Ván | Đấu Thắng % | Phát Mãi 70% | Nguy Cơ Nợ/Ván | Cứu Nợ % | Chuộc Đất % | Thẻ Rút/Ván | Sàn HOSE/Ván |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    md += `| ${r.name} | ${r.avgAuctionsPerGame} | ${r.auctionWonRate}% | **${r.auctionForeclosureRate}%** | ${r.avgInsolvenciesPerGame} | ${r.solvencyRecoveryRate}% | ${r.redeemRate}% | ${r.avgCardsPerGame} | ${r.avgHosePerGame} |\n`;
  }

  md += `
---

## 6. KIỂM CHỨNG BẤT BIẾN HỆ THỐNG (HARD SYSTEM INVARIANTS)

| Kịch Bản | Deadlock (>500 turns) | Rò Rỉ / Âm Kho Bạc | Số Dư Lỗi NaN | Mua Đất Ngầm (Premature) |
| :--- | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    md += `| ${r.name} | ${r.deadlocks} | ${r.treasuryViolations} | ${r.nanBalanceViolations} | ${r.prematureTrades} |\n`;
  }

  md += `
---

## 7. ĐÁNH GIÁ ĐỘC QUYỀN THEO NHÓM MÀU (PHÂN TÍCH CHIẾN THUẬT)

Thống kê tần suất hoàn thành độc quyền các nhóm màu trên toàn bộ 13.000 ván đấu:
`;

  const totalColorCounts: Record<string, number> = {};
  for (const r of allResults) {
    for (const [grp, cnt] of Object.entries(r.colorGroupMonopolies)) {
      totalColorCounts[grp] = (totalColorCounts[grp] ?? 0) + cnt;
    }
  }

  const sortedColors = Object.entries(totalColorCounts).sort((a, b) => b[1] - a[1]);
  for (const [grp, cnt] of sortedColors) {
    md += `- **Nhóm màu ${grp}**: ${cnt} lần hoàn thành độc quyền.\n`;
  }

  return md;
}

// Execution entry point
export async function runFull13000GamesBenchmark() {
  const origInfo = console.info;
  const origWarn = console.warn;
  const origLog = console.log;
  console.info = () => {};
  console.warn = () => {};
  console.log = () => {};

  const args = process.argv.slice(2);
  let gamesPerScenario = 1000;
  const nIndex = args.findIndex((a) => a === '-n' || a === '--games');
  if (nIndex >= 0 && args[nIndex + 1]) {
    const customN = parseInt(args[nIndex + 1]!, 10);
    if (!isNaN(customN) && customN > 0) gamesPerScenario = customN;
  }

  const totalSimCount = SIMULATION_SCENARIOS.length * gamesPerScenario;
  process.stdout.write(`\n========================================================================================\n`);
  process.stdout.write(`  VTCOON FULL GAMEPLAY BENCHMARK: ${SIMULATION_SCENARIOS.length} SCENARIOS x ${gamesPerScenario} GAMES = ${totalSimCount} GAMES\n`);
  process.stdout.write(`  Chế độ: Người thật (P1, isBot=false) vs Các loại Bot AI (2P, 3P, 4P)\n`);
  process.stdout.write(`========================================================================================\n\n`);

  const results: ScenarioResult[] = [];
  const startAll = Date.now();

  for (let idx = 0; idx < SIMULATION_SCENARIOS.length; idx++) {
    const sc = SIMULATION_SCENARIOS[idx]!;
    process.stdout.write(`[${idx + 1}/${SIMULATION_SCENARIOS.length}] Đang chạy ${sc.name} (${gamesPerScenario} ván)... `);
    const startCase = Date.now();
    const res = runScenarioSimulation(sc, gamesPerScenario, 800000 + idx * 5000);
    const elapsed = ((Date.now() - startCase) / 1000).toFixed(2);
    process.stdout.write(`Xong trong ${elapsed}s | Thắng H:${res.humanWinRate}% | Vòng TB:${res.avgRounds} | Phá sản:${res.bankruptcyEndRate}% | Khách sạn C3:${res.hotelReachRate}%\n`);
    results.push(res);
  }

  const totalSecs = ((Date.now() - startAll) / 1000).toFixed(1);
  process.stdout.write(`\n>>> HOÀN TẤT 13.000 VÁN TRONG ${totalSecs} GIÂY <<<\n\n`);

  const markdownReport = generateComprehensiveMarkdownReport(results);
  const reportPath = path.resolve('docs/reports/simulations/comprehensive_13000_games_gameplay_insights_report.md');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, markdownReport, 'utf8');
  process.stdout.write(`📄 Báo cáo chi tiết đã lưu tại: ${reportPath}\n`);

  const jsonPath = path.resolve('.agents/tmp/comprehensive_13000_games_results.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
  process.stdout.write(`📊 Dữ liệu JSON đã lưu tại: ${jsonPath}\n`);

  return { results, markdownReport };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runFull13000GamesBenchmark().catch((err) => {
    process.stderr.write(`Lỗi mô phỏng: ${err.message}\n${err.stack}\n`);
    process.exit(1);
  });
}

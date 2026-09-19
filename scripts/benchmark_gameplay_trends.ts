// [BENCHMARK] Automated Headless Simulation Benchmark for Gameplay Trends & Bot Balance
// Evaluates 13 Scenarios (2P, 3P, 4P) with Human Baseline (P1) vs Passive, Balanced, Aggressive Bots
import { RoomManager } from '../src/server/room_manager.js';
import { BotPersonality } from '../src/domain/bot/bot_types.js';
import { BOARD_CONFIG } from '../src/domain/board_config.js';
import { TurnPhase, MAX_ROUNDS, isRoomGameOver } from '../src/domain/room.js';
import type { PropertyRegistry } from '../src/domain/property_manager.js';
import type { AuctionSession } from '../src/server/auction_manager.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface ScenarioDef {
  id: string;
  name: string;
  group: '2P' | '3P' | '4P';
  playerCount: number;
  bots: BotPersonality[];
}

export interface ScenarioMetrics {
  id: string;
  name: string;
  group: '2P' | '3P' | '4P';
  playerCount: number;
  totalGames: number;
  completedGames: number;
  // Win rates
  humanWins: number;
  humanWinRate: number;
  botWins: Record<string, number>;
  botWinRates: Record<string, number>;
  seatWins: Record<string, number>;
  seatWinRates: Record<string, number>;
  // Pacing
  avgRounds: number;
  avgTurns: number;
  bankruptcyEnds: number;
  bankruptcyEndRate: number;
  roundLimitEnds: number;
  roundLimitEndRate: number;
  // Real estate
  firstMonopolyAvgRound: number | null;
  monopolyFormationRate: number;
  totalUpgrades: number;
  avgUpgradesPerGame: number;
  totalC1: number;
  totalC2: number;
  totalC3: number;
  avgC1: number;
  avgC2: number;
  avgC3: number;
  // Solvency & rescue
  totalInsolvencies: number;
  avgInsolvenciesPerGame: number;
  solvencyMortgages: number;
  solvencyDowngrades: number;
  solvencyRecoveries: number;
  totalBankruptcies: number;
  solvencyRecoveryRate: number;
  // Auctions
  totalAuctions: number;
  avgAuctionsPerGame: number;
  auctionsWon: number;
  auctionWonRate: number;
  auctionsForeclosed: number;
  auctionForeclosureRate: number;
  // Phiếu / Thẻ sự kiện & Sàn HOSE
  totalChanceCards: number;
  totalMarketCards: number;
  totalHoseInvestments: number;
  avgCardsPerGame: number;
  avgHosePerGame: number;
  uniqueCardsCoverage: number;
  // Giao dịch P2P & Chuộc đất
  totalTradesProposed: number;
  totalTradesAccepted: number;
  tradeAcceptRate: number;
  totalMortgages: number;
  totalRedeems: number;
  redeemRate: number;
  // Invariants
  deadlockCount: number;
  treasuryLeakCount: number;
  avgFinalTreasury: number;
  avgWinnerNetWorth: number;
}

export const SCENARIO_MATRIX: ScenarioDef[] = [
  // 1. Nhóm 2 Người Chơi
  { id: '2p_passive', name: '2P (Human + Passive)', group: '2P', playerCount: 2, bots: [BotPersonality.Passive] },
  { id: '2p_balanced', name: '2P (Human + Balanced)', group: '2P', playerCount: 2, bots: [BotPersonality.Balanced] },
  { id: '2p_aggressive', name: '2P (Human + Aggressive)', group: '2P', playerCount: 2, bots: [BotPersonality.Aggressive] },

  // 2. Nhóm 3 Người Chơi (Homogeneous & Mixed)
  { id: '3p_homo_passive', name: '3P (Human + 2 Passive)', group: '3P', playerCount: 3, bots: [BotPersonality.Passive, BotPersonality.Passive] },
  { id: '3p_homo_balanced', name: '3P (Human + 2 Balanced)', group: '3P', playerCount: 3, bots: [BotPersonality.Balanced, BotPersonality.Balanced] },
  { id: '3p_homo_aggressive', name: '3P (Human + 2 Aggressive)', group: '3P', playerCount: 3, bots: [BotPersonality.Aggressive, BotPersonality.Aggressive] },
  { id: '3p_mixed_pass_bal', name: '3P (Human + Passive + Balanced)', group: '3P', playerCount: 3, bots: [BotPersonality.Passive, BotPersonality.Balanced] },
  { id: '3p_mixed_pass_aggr', name: '3P (Human + Passive + Aggressive)', group: '3P', playerCount: 3, bots: [BotPersonality.Passive, BotPersonality.Aggressive] },
  { id: '3p_mixed_bal_aggr', name: '3P (Human + Balanced + Aggressive)', group: '3P', playerCount: 3, bots: [BotPersonality.Balanced, BotPersonality.Aggressive] },

  // 3. Nhóm 4 Người Chơi (Diverse & Homogeneous)
  { id: '4p_diverse', name: '4P (Human + Pass + Bal + Aggr)', group: '4P', playerCount: 4, bots: [BotPersonality.Passive, BotPersonality.Balanced, BotPersonality.Aggressive] },
  { id: '4p_homo_passive', name: '4P (Human + 3 Passive)', group: '4P', playerCount: 4, bots: [BotPersonality.Passive, BotPersonality.Passive, BotPersonality.Passive] },
  { id: '4p_homo_balanced', name: '4P (Human + 3 Balanced)', group: '4P', playerCount: 4, bots: [BotPersonality.Balanced, BotPersonality.Balanced, BotPersonality.Balanced] },
  { id: '4p_homo_aggressive', name: '4P (Human + 3 Aggressive)', group: '4P', playerCount: 4, bots: [BotPersonality.Aggressive, BotPersonality.Aggressive, BotPersonality.Aggressive] },
];

function checkMonopolies(registry?: PropertyRegistry): string[] {
  if (!registry) return [];
  const formedGroups: string[] = [];
  const groupsChecked = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (!cell.colorGroup || groupsChecked.has(cell.colorGroup)) continue;
    groupsChecked.add(cell.colorGroup);
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const firstOwner = registry.get(groupCells[0]!.index);
    if (firstOwner && groupCells.every((c) => registry.get(c.index) === firstOwner)) {
      formedGroups.push(cell.colorGroup);
    }
  }
  return formedGroups;
}

export function runSingleScenario(scenario: ScenarioDef, gamesToRun: number, seedBase: number = 600000): ScenarioMetrics {
  const m: ScenarioMetrics = {
    id: scenario.id,
    name: scenario.name,
    group: scenario.group,
    playerCount: scenario.playerCount,
    totalGames: gamesToRun,
    completedGames: 0,
    humanWins: 0,
    humanWinRate: 0,
    botWins: { Passive: 0, Balanced: 0, Aggressive: 0 },
    botWinRates: { Passive: 0, Balanced: 0, Aggressive: 0 },
    seatWins: {},
    seatWinRates: {},
    avgRounds: 0,
    avgTurns: 0,
    bankruptcyEnds: 0,
    bankruptcyEndRate: 0,
    roundLimitEnds: 0,
    roundLimitEndRate: 0,
    firstMonopolyAvgRound: null,
    monopolyFormationRate: 0,
    totalUpgrades: 0,
    avgUpgradesPerGame: 0,
    totalC1: 0,
    totalC2: 0,
    totalC3: 0,
    avgC1: 0,
    avgC2: 0,
    avgC3: 0,
    totalInsolvencies: 0,
    avgInsolvenciesPerGame: 0,
    solvencyMortgages: 0,
    solvencyDowngrades: 0,
    solvencyRecoveries: 0,
    totalBankruptcies: 0,
    solvencyRecoveryRate: 0,
    totalAuctions: 0,
    avgAuctionsPerGame: 0,
    auctionsWon: 0,
    auctionWonRate: 0,
    auctionsForeclosed: 0,
    auctionForeclosureRate: 0,
    totalChanceCards: 0,
    totalMarketCards: 0,
    totalHoseInvestments: 0,
    avgCardsPerGame: 0,
    avgHosePerGame: 0,
    uniqueCardsCoverage: 0,
    totalTradesProposed: 0,
    totalTradesAccepted: 0,
    tradeAcceptRate: 0,
    totalMortgages: 0,
    totalRedeems: 0,
    redeemRate: 0,
    deadlockCount: 0,
    treasuryLeakCount: 0,
    avgFinalTreasury: 0,
    avgWinnerNetWorth: 0,
  };

  for (let i = 0; i < scenario.playerCount; i++) {
    m.seatWins[`P${i + 1}`] = 0;
  }

  let cumulativeRounds = 0;
  let cumulativeTurns = 0;
  let cumulativeWinnerNetWorth = 0;
  let cumulativeFinalTreasury = 0;
  let gamesWithMonopoly = 0;
  let sumFirstMonopolyRound = 0;
  const uniqueCardsDrawn = new Set<string>();

  const origInfo = console.info;
  const origWarn = console.warn;
  console.info = () => {};
  console.warn = () => {};

  try {
    for (let g = 0; g < gamesToRun; g++) {
      const seed = seedBase + g;
      const mgr = new RoomManager(seed);
      const room = mgr.createRoom('p1');
      room.players[0]!.isBot = true;
      mgr.setBotPersonality(room.roomCode, 'p1', BotPersonality.Balanced);

      for (let i = 0; i < scenario.bots.length; i++) {
        mgr.addBot(room.roomCode, `bot${i + 2}`, scenario.bots[i]);
      }

      let activeInsolvencyPlayerId: string | null = null;
      let activeAuctionSession: AuctionSession | null = null;

      // Hook rolls to track card draws (phiếu Cơ Hội / Khí Vận)
      const origHandleRoll = mgr.handleRollDice.bind(mgr);
      mgr.handleRollDice = (rc, pid) => {
        const prevCard = room.lastEventCard;
        const res = origHandleRoll(rc, pid);
        if (room.lastEventCard && room.lastEventCard !== prevCard) {
          if (room.lastEventCard.cardType === 'market' || room.lastEventCard.type === 'Market') {
            m.totalMarketCards++;
            uniqueCardsDrawn.add(room.lastEventCard.id);
          } else if (room.lastEventCard.cardType === 'chance' || room.lastEventCard.type === 'Chance') {
            m.totalChanceCards++;
            uniqueCardsDrawn.add(room.lastEventCard.id);
          }
        }
        return res;
      };

      // Hook player intent to track upgrades, solvency, trades, redeems, hose
      const origHandleIntent = mgr.handlePlayerIntent.bind(mgr);
      mgr.handlePlayerIntent = (rc, pid, intent) => {
        const player = room.players.find((pl) => pl.id === pid);
        const wasInsolvency = (room.phase as TurnPhase) === TurnPhase.InsolvencyPhase || Boolean(player && player.balance < 0);
        if (wasInsolvency && activeInsolvencyPlayerId !== pid) {
          activeInsolvencyPlayerId = pid;
          m.totalInsolvencies++;
        }

        if (intent.type === 'INTENT_TRADE_OFFER' || intent.type === 'INTENT_P2P_TRADE_OFFER') {
          m.totalTradesProposed++;
        } else if (intent.type === 'INTENT_MORTGAGE') {
          m.totalMortgages++;
        }

        let prevLevel = 0;
        if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
          prevLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
        }

        const res = origHandleIntent(rc, pid, intent);
        if (res.success) {
          if (intent.type === 'INTENT_TRADE_OFFER' || intent.type === 'INTENT_P2P_TRADE_OFFER') {
            m.totalTradesAccepted++;
          } else if (intent.type === 'INTENT_REDEEM') {
            m.totalRedeems++;
          } else if (intent.type === 'INTENT_INVEST' || intent.type === 'INTENT_HOSE_INVEST') {
            m.totalHoseInvestments++;
          } else if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
            const newLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
            if (newLevel > prevLevel) {
              m.totalUpgrades++;
              if (newLevel === 1) m.totalC1++;
              else if (newLevel === 2) m.totalC2++;
              else if (newLevel === 3) m.totalC3++;
            }
          } else if (intent.type === 'INTENT_MORTGAGE') {
            if (wasInsolvency) m.solvencyMortgages++;
          } else if (intent.type === 'INTENT_DOWNGRADE') {
            if (wasInsolvency) m.solvencyDowngrades++;
          } else if (intent.type === 'INTENT_BANKRUPTCY') {
            m.totalBankruptcies++;
            activeInsolvencyPlayerId = null;
          }
          if (wasInsolvency && player && player.balance >= 0) {
            m.solvencyRecoveries++;
            activeInsolvencyPlayerId = null;
          }
        }
        return res;
      };

      // Hook auctions
      const origHandleDecline = mgr.handleDecline.bind(mgr);
      mgr.handleDecline = (rc, pid) => {
        const res = origHandleDecline(rc, pid);
        if (res.success) {
          m.totalAuctions++;
          activeAuctionSession = mgr.getAuctionSession(rc) ?? null;
        }
        return res;
      };

      const origHandlePass = mgr.handleAuctionPass.bind(mgr);
      mgr.handleAuctionPass = (rc, pid) => {
        const res = origHandlePass(rc, pid);
        const cur = mgr.getAuctionSession(rc);
        if (activeAuctionSession && !cur) {
          if (activeAuctionSession.highestBidder) m.auctionsWon++;
          else m.auctionsForeclosed++;
          activeAuctionSession = null;
        }
        return res;
      };

      const origHandleClose = mgr.handleAuctionClose.bind(mgr);
      mgr.handleAuctionClose = (rc) => {
        const prev = activeAuctionSession ?? mgr.getAuctionSession(rc);
        const res = origHandleClose(rc);
        if (prev) {
          if (res.winnerId || prev.highestBidder) m.auctionsWon++;
          else m.auctionsForeclosed++;
          activeAuctionSession = null;
        }
        return res;
      };

      mgr.startGame(room.roomCode);

      let turnCount = 0;
      const MAX_TURNS = 500;
      let firstMonopolyRound: number | null = null;

      while (room.started && turnCount < MAX_TURNS) {
        if (isRoomGameOver(room)) break;

        mgr.runBotTurn(room.roomCode);
        turnCount++;

        if (firstMonopolyRound === null) {
          const reg = mgr.getRegistry(room.roomCode);
          if (checkMonopolies(reg).length > 0) {
            firstMonopolyRound = Math.min(MAX_ROUNDS, room.roundCount ?? 1);
          }
        }

        if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
          m.treasuryLeakCount++;
        }
      }

      const remaining = room.players.filter((p) => !p.bankrupt);
      if (remaining.length > 1 && (room.roundCount ?? 1) < MAX_ROUNDS && turnCount >= MAX_TURNS) {
        m.deadlockCount++;
      }

      if (remaining.length <= 1) m.bankruptcyEnds++;
      else m.roundLimitEnds++;

      const gameRounds = Math.min(MAX_ROUNDS, room.roundCount ?? 1);
      cumulativeRounds += gameRounds;
      cumulativeTurns += turnCount;
      cumulativeFinalTreasury += room.treasury;

      if (firstMonopolyRound !== null) {
        gamesWithMonopoly++;
        sumFirstMonopolyRound += firstMonopolyRound;
      }

      const rankings = mgr.getRankings(room.roomCode);
      if (rankings.length > 0) {
        const winner = rankings[0]!;
        const winnerId = winner.id;
        if (winnerId === 'p1') {
          m.humanWins++;
        } else {
          const pers = mgr.getBotPersonality(room.roomCode, winnerId);
          m.botWins[pers] = (m.botWins[pers] ?? 0) + 1;
        }
        const seatIdx = room.players.findIndex((p) => p.id === winnerId);
        if (seatIdx >= 0) {
          m.seatWins[`P${seatIdx + 1}`] = (m.seatWins[`P${seatIdx + 1}`] ?? 0) + 1;
        }
        cumulativeWinnerNetWorth += winner.netWorth;
      }

      m.completedGames++;
    }
  } finally {
    console.info = origInfo;
    console.warn = origWarn;
  }

  // Aggregate ratios
  m.humanWinRate = parseFloat(((m.humanWins / m.completedGames) * 100).toFixed(1));
  for (const p of ['Passive', 'Balanced', 'Aggressive']) {
    m.botWinRates[p] = parseFloat((((m.botWins[p] ?? 0) / m.completedGames) * 100).toFixed(1));
  }
  for (const s of Object.keys(m.seatWins)) {
    m.seatWinRates[s] = parseFloat((((m.seatWins[s] ?? 0) / m.completedGames) * 100).toFixed(1));
  }

  m.avgRounds = parseFloat((cumulativeRounds / m.completedGames).toFixed(2));
  m.avgTurns = parseFloat((cumulativeTurns / m.completedGames).toFixed(1));
  m.bankruptcyEndRate = parseFloat(((m.bankruptcyEnds / m.completedGames) * 100).toFixed(1));
  m.roundLimitEndRate = parseFloat(((m.roundLimitEnds / m.completedGames) * 100).toFixed(1));

  m.firstMonopolyAvgRound = gamesWithMonopoly > 0 ? parseFloat((sumFirstMonopolyRound / gamesWithMonopoly).toFixed(1)) : null;
  m.monopolyFormationRate = parseFloat(((gamesWithMonopoly / m.completedGames) * 100).toFixed(1));

  m.avgUpgradesPerGame = parseFloat((m.totalUpgrades / m.completedGames).toFixed(2));
  m.avgC1 = parseFloat((m.totalC1 / m.completedGames).toFixed(2));
  m.avgC2 = parseFloat((m.totalC2 / m.completedGames).toFixed(2));
  m.avgC3 = parseFloat((m.totalC3 / m.completedGames).toFixed(2));

  m.avgInsolvenciesPerGame = parseFloat((m.totalInsolvencies / m.completedGames).toFixed(2));
  m.solvencyRecoveryRate = m.totalInsolvencies > 0
    ? parseFloat(((m.solvencyRecoveries / m.totalInsolvencies) * 100).toFixed(1))
    : 100;

  m.avgAuctionsPerGame = parseFloat((m.totalAuctions / m.completedGames).toFixed(2));
  m.auctionWonRate = m.totalAuctions > 0 ? parseFloat(((m.auctionsWon / m.totalAuctions) * 100).toFixed(1)) : 0;
  m.auctionForeclosureRate = m.totalAuctions > 0 ? parseFloat(((m.auctionsForeclosed / m.totalAuctions) * 100).toFixed(1)) : 0;

  m.avgFinalTreasury = Math.round(cumulativeFinalTreasury / m.completedGames);
  m.avgWinnerNetWorth = Math.round(cumulativeWinnerNetWorth / m.completedGames);

  m.tradeAcceptRate = m.totalTradesProposed > 0 ? parseFloat(((m.totalTradesAccepted / m.totalTradesProposed) * 100).toFixed(1)) : 0;
  m.redeemRate = m.totalMortgages > 0 ? parseFloat(((m.totalRedeems / m.totalMortgages) * 100).toFixed(1)) : 0;
  m.avgCardsPerGame = parseFloat(((m.totalChanceCards + m.totalMarketCards) / m.completedGames).toFixed(2));
  m.avgHosePerGame = parseFloat((m.totalHoseInvestments / m.completedGames).toFixed(2));
  m.uniqueCardsCoverage = uniqueCardsDrawn.size;

  return m;
}

export async function main() {
  const args = process.argv.slice(2);
  let gamesPerScenario = 100;
  if (args.includes('--deep')) {
    gamesPerScenario = 300;
  }
  const nIndex = args.findIndex((a) => a === '-n' || a === '--games');
  if (nIndex >= 0 && args[nIndex + 1]) {
    const customN = parseInt(args[nIndex + 1]!, 10);
    if (!isNaN(customN) && customN > 0) gamesPerScenario = customN;
  }

  const groupFilter = args.find((a) => a.startsWith('--group='))?.split('=')[1]?.toUpperCase();
  const selectedScenarios = SCENARIO_MATRIX.filter((s) => !groupFilter || s.group === groupFilter);

  process.stdout.write(`\n========================================================================================\n`);
  process.stdout.write(`  VTCOON GAMEPLAY TRENDS & BOT BALANCE BENCHMARK (HEADLESS SIMULATION)\n`);
  process.stdout.write(`  Quy mô: ${selectedScenarios.length} kịch bản x ${gamesPerScenario} ván/kịch bản = ${selectedScenarios.length * gamesPerScenario} ván\n`);
  process.stdout.write(`========================================================================================\n\n`);

  const startTime = Date.now();
  const results: ScenarioMetrics[] = [];

  for (let i = 0; i < selectedScenarios.length; i++) {
    const sc = selectedScenarios[i]!;
    process.stdout.write(`[${i + 1}/${selectedScenarios.length}] Đang chạy ${sc.name}... `);
    const scStart = Date.now();
    const seedBase = 600000 + i * 10000;
    const metric = runSingleScenario(sc, gamesPerScenario, seedBase);
    results.push(metric);
    const scElapsed = ((Date.now() - scStart) / 1000).toFixed(2);
    process.stdout.write(`Hoàn tất (${scElapsed}s) | Win H:${metric.humanWinRate}% | AvgRnd:${metric.avgRounds} | Mono:${metric.monopolyFormationRate}%\n`);
  }

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  process.stdout.write(`\n>>> HOÀN TẤT ${results.length * gamesPerScenario} VÁN TRONG ${totalElapsed} GIÂY <<<\n\n`);

  // Format tables
  printSummaryTables(results);

  // Save JSON report
  const jsonPath = path.resolve(process.cwd(), '.agents/tmp/gameplay_trends_benchmark.json');
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify({ meta: { gamesPerScenario, totalElapsedSec: parseFloat(totalElapsed), timestamp: new Date().toISOString() }, scenarios: results }, null, 2), 'utf8');
  process.stdout.write(`\nĐã lưu dữ liệu JSON chi tiết tại: ${jsonPath}\n`);
}

function printSummaryTables(results: ScenarioMetrics[]): void {
  process.stdout.write('--- BẢNG 1: TỶ LỆ THẮNG & ĐỘ CÂN BẰNG TÍNH CÁCH BOT (% THẮNG) ---\n');
  process.stdout.write('| Kịch Bản | Human(P1) | Bot Passive | Bot Balanced | Bot Aggressive | Vị Trí Thắng Cao Nhất |\n');
  process.stdout.write('| :--- | :---: | :---: | :---: | :---: | :---: |\n');
  for (const r of results) {
    const topSeat = Object.entries(r.seatWinRates).sort((a, b) => b[1] - a[1])[0];
    const topSeatStr = topSeat ? `${topSeat[0]} (${topSeat[1]}%)` : '-';
    process.stdout.write(`| ${r.name.padEnd(30)} | ${String(r.humanWinRate).padStart(5)}% | ${String(r.botWinRates['Passive']).padStart(7)}% | ${String(r.botWinRates['Balanced']).padStart(8)}% | ${String(r.botWinRates['Aggressive']).padStart(10)}% | ${topSeatStr.padEnd(16)} |\n`);
  }

  process.stdout.write('\n--- BẢNG 2: NHỊP ĐỘ, ĐỘ DÀI VÁN & PHÁT TRIỂN BẤT ĐỘNG SẢN ---\n');
  process.stdout.write(`| Kịch Bản | Vòng TB | Lượt TB | Phá Sản % | Hết ${MAX_ROUNDS} Vòng % | Vòng Độc Quyền Đầu | Tỷ Lệ Độc Quyền | C1+C2+C3/Ván |\n`);
  process.stdout.write('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n');
  for (const r of results) {
    const fMon = r.firstMonopolyAvgRound !== null ? `Vòng ${r.firstMonopolyAvgRound}` : 'N/A';
    process.stdout.write(`| ${r.name.padEnd(30)} | ${String(r.avgRounds).padStart(5)} | ${String(r.avgTurns).padStart(6)} | ${String(r.bankruptcyEndRate).padStart(6)}% | ${String(r.roundLimitEndRate).padStart(9)}% | ${fMon.padStart(14)} | ${String(r.monopolyFormationRate).padStart(11)}% | ${String(r.avgUpgradesPerGame).padStart(8)} |\n`);
  }

  process.stdout.write('\n--- BẢNG 3: KHỦNG HOẢNG THANH KHOẢN, ĐẤU GIÁ & BẤT BIẾN KHO BẠC ---\n');
  process.stdout.write('| Kịch Bản | Nợ/Ván | Cứu Nợ % | Đấu Giá/Ván | Thầu Thắng % | Phát Mãi % | Kho Bạc Cuối | Deadlock |\n');
  process.stdout.write('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n');
  for (const r of results) {
    process.stdout.write(`| ${r.name.padEnd(30)} | ${String(r.avgInsolvenciesPerGame).padStart(5)} | ${String(r.solvencyRecoveryRate).padStart(6)}% | ${String(r.avgAuctionsPerGame).padStart(8)} | ${String(r.auctionWonRate).padStart(8)}% | ${String(r.auctionForeclosureRate).padStart(7)}% | ${String(r.avgFinalTreasury).padStart(8)} Tr. | ${String(r.deadlockCount).padStart(5)} |\n`);
  }

  process.stdout.write('\n--- BẢNG 4: MỞ PHIẾU, SÀN HOSE, ĐÀM PHÁN P2P BOT & CHUỘC ĐẤT ---\n');
  process.stdout.write('| Kịch Bản | Thẻ Rút/Ván (Cơ Hội+Khí Vận) | Độ Phủ Thẻ | Lượt HOSE/Ván | Đề Xuất P2P | Thành Công | Tỷ Lệ Nhất Trí | Chuộc/Cầm (%) |\n');
  process.stdout.write('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |\n');
  for (const r of results) {
    const cardStr = `${r.avgCardsPerGame} thẻ`;
    const coverageStr = `${r.uniqueCardsCoverage}/36`;
    const redeemStr = `${r.totalRedeems}/${r.totalMortgages} (${r.redeemRate}%)`;
    process.stdout.write(`| ${r.name.padEnd(30)} | ${cardStr.padStart(28)} | ${coverageStr.padStart(10)} | ${String(r.avgHosePerGame).padStart(13)} | ${String(r.totalTradesProposed).padStart(11)} | ${String(r.totalTradesAccepted).padStart(10)} | ${String(r.tradeAcceptRate).padStart(14)}% | ${redeemStr.padStart(15)} |\n`);
  }
}

if (process.argv[1] && process.argv[1].includes('benchmark_gameplay_trends')) {
  main().catch((err) => {
    console.error('Lỗi thực thi benchmark:', err);
    process.exit(1);
  });
}

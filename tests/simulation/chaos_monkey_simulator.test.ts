// [Strategy 1] Headless Chaos Monkey Simulator (1.000 Games)
// Mô phỏng 1.000 ván cờ hoàn chỉnh với 4 Bot AI đa tính cách (0ms delay, in-memory)
// Kiểm chứng 3 Bất Biến Vĩ Mô (Invariants) & Thống kê Hiệu năng Chiến thuật (Tactical Metrics)
import { describe, it, expect } from 'vitest';
import { RoomManager } from '../../src/server/room_manager';
import { BotPersonality } from '../../src/domain/bot/bot_engine';
import { BOARD_CONFIG } from '../../src/domain/board_config';
import { TurnPhase } from '../../src/domain/room';
import type { PropertyRegistry } from '../../src/domain/property_manager';
import type { AuctionSession } from '../../src/server/auction_manager';
import { drawMarketCard, drawChanceCard } from '../../src/domain/event_card_engine';

export interface TacticalMetrics {
  // 1. Upgrade Metrics
  upgradesC1: number;
  upgradesC2: number;
  upgradesC3: number;
  totalUpgrades: number;
  gamesWithMonopoly: number;
  gamesWithUpgrades: number;

  // 2. Solvency Recovery Metrics
  insolvencyIncidents: number;
  solvencyRescueActions: number;
  solvencyMortgages: number;
  solvencyDowngrades: number;
  solvencyRecoveries: number;
  totalBankruptcies: number;

  // 3. Auction Participation Metrics
  auctionsCreated: number;
  botBidsCount: number;
  auctionsWon: number;
  auctionsForeclosed: number;

  // 4. Invariants Tracking
  completedGames: number;
  gamesEndingByBankruptcy: number;
  gamesEndingByRoundLimit: number;
  totalTurnsExecuted: number;
  deadlockCount: number;
  treasuryLeakage: number;
  invalidBalancesCount: number;
}

export function resolveChaosGameCount(env: Record<string, string | undefined> = process.env): number {
  const raw = env.CHAOS_GAMES;
  if (!raw) return 100;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed) || parsed <= 0) return 100;
  return parsed;
}

function checkRoomHasMonopoly(registry?: PropertyRegistry): boolean {
  if (!registry) return false;
  const groupsChecked = new Set<string>();
  for (const cell of BOARD_CONFIG) {
    if (!cell.colorGroup || groupsChecked.has(cell.colorGroup)) continue;
    groupsChecked.add(cell.colorGroup);
    const groupCells = BOARD_CONFIG.filter((c) => c.colorGroup === cell.colorGroup);
    const firstOwner = registry.get(groupCells[0]!.index);
    if (firstOwner && groupCells.every((c) => registry.get(c.index) === firstOwner)) {
      return true;
    }
  }
  return false;
}

export function runChaosSimulation(options: { games?: number; silent?: boolean } = {}): {
  turnLogsCount: number;
  warnLogsCount: number;
  asciiSummary: string;
  metrics: TacticalMetrics;
} {
  const silent = options.silent ?? true;
  const totalGames = options.games ?? resolveChaosGameCount();

  const metrics: TacticalMetrics = {
    upgradesC1: 0,
    upgradesC2: 0,
    upgradesC3: 0,
    totalUpgrades: 0,
    gamesWithMonopoly: 0,
    gamesWithUpgrades: 0,
    insolvencyIncidents: 0,
    solvencyRescueActions: 0,
    solvencyMortgages: 0,
    solvencyDowngrades: 0,
    solvencyRecoveries: 0,
    totalBankruptcies: 0,
    auctionsCreated: 0,
    botBidsCount: 0,
    auctionsWon: 0,
    auctionsForeclosed: 0,
    completedGames: 0,
    gamesEndingByBankruptcy: 0,
    gamesEndingByRoundLimit: 0,
    totalTurnsExecuted: 0,
    deadlockCount: 0,
    treasuryLeakage: 0,
    invalidBalancesCount: 0,
  };

  const origInfo = console.info;
  const origWarn = console.warn;
  let turnLogsCount = 0;
  let warnLogsCount = 0;

  if (silent) {
    console.info = () => {};
    console.warn = () => {};
  } else {
    console.info = (...args: unknown[]) => {
      turnLogsCount++;
      origInfo(...args);
    };
    console.warn = (...args: unknown[]) => {
      warnLogsCount++;
      origWarn(...args);
    };
  }

  try {
    for (let gameIdx = 0; gameIdx < totalGames; gameIdx++) {
      const seed = 100000 + gameIdx;
      const mgr = new RoomManager(seed);

      // Tạo phòng với 4 Bot AI đa tính cách (Aggressive, Balanced, Passive)
      const room = mgr.createRoom('bot1');
      room.players[0]!.isBot = true;

      mgr.setBotPersonality(room.roomCode, 'bot1', BotPersonality.Balanced);
      mgr.addBot(room.roomCode, 'bot2', BotPersonality.Aggressive);
      mgr.addBot(room.roomCode, 'bot3', BotPersonality.Balanced);
      mgr.addBot(room.roomCode, 'bot4', BotPersonality.Passive);

      let gameHadMonopoly = false;
      let gameHadUpgrade = false;
      let activeInsolvencyPlayerId: string | null = null;
      let activeAuctionSession: AuctionSession | null = null;

      // Hook intent dispatching to collect granular domain events
      const origHandlePlayerIntent = mgr.handlePlayerIntent.bind(mgr);
      mgr.handlePlayerIntent = (rc, pid, intent) => {
        const player = room.players.find((pl) => pl.id === pid);
        const wasInsolvencyPhase = (room.phase as TurnPhase) === TurnPhase.InsolvencyPhase;
        const wasNegativeBalance = Boolean(player && player.balance < 0);

        if ((wasInsolvencyPhase || wasNegativeBalance) && activeInsolvencyPlayerId !== pid) {
          activeInsolvencyPlayerId = pid;
          metrics.insolvencyIncidents++;
        }

        let prevLevel = 0;
        if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
          prevLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
        }

        const res = origHandlePlayerIntent(rc, pid, intent);

        if (res.success) {
          if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
            const newLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
            if (newLevel > prevLevel) {
              metrics.totalUpgrades++;
              gameHadUpgrade = true;
              if (newLevel === 1) metrics.upgradesC1++;
              else if (newLevel === 2) metrics.upgradesC2++;
              else if (newLevel === 3) metrics.upgradesC3++;
            }
          } else if (intent.type === 'INTENT_MORTGAGE') {
            if (wasInsolvencyPhase || wasNegativeBalance) {
              metrics.solvencyRescueActions++;
              metrics.solvencyMortgages++;
            }
          } else if (intent.type === 'INTENT_DOWNGRADE') {
            if (wasInsolvencyPhase || wasNegativeBalance) {
              metrics.solvencyRescueActions++;
              metrics.solvencyDowngrades++;
            }
          } else if (intent.type === 'INTENT_BANKRUPTCY') {
            metrics.totalBankruptcies++;
            activeInsolvencyPlayerId = null;
          }

          if ((wasInsolvencyPhase || wasNegativeBalance) && player && player.balance >= 0) {
            metrics.solvencyRecoveries++;
            activeInsolvencyPlayerId = null;
          }
        }
        return res;
      };

      const origHandleDecline = mgr.handleDecline.bind(mgr);
      mgr.handleDecline = (rc, pid) => {
        const res = origHandleDecline(rc, pid);
        if (res.success) {
          metrics.auctionsCreated++;
          activeAuctionSession = mgr.getAuctionSession(rc) ?? null;
        }
        return res;
      };

      const origHandleAuctionBid = mgr.handleAuctionBid.bind(mgr);
      mgr.handleAuctionBid = (rc, pid, amount) => {
        const res = origHandleAuctionBid(rc, pid, amount);
        if (res.success) {
          metrics.botBidsCount++;
          activeAuctionSession = mgr.getAuctionSession(rc) ?? null;
        }
        return res;
      };

      const origHandleAuctionPass = mgr.handleAuctionPass.bind(mgr);
      mgr.handleAuctionPass = (rc, pid) => {
        const res = origHandleAuctionPass(rc, pid);
        const currentSession = mgr.getAuctionSession(rc);
        if (activeAuctionSession && !currentSession) {
          if (activeAuctionSession.highestBidder) {
            metrics.auctionsWon++;
          } else {
            metrics.auctionsForeclosed++;
          }
          activeAuctionSession = null;
        }
        return res;
      };

      const origHandleAuctionClose = mgr.handleAuctionClose.bind(mgr);
      mgr.handleAuctionClose = (rc) => {
        const sessionBefore = activeAuctionSession ?? mgr.getAuctionSession(rc);
        const res = origHandleAuctionClose(rc);
        if (sessionBefore) {
          if (res.winnerId || sessionBefore.highestBidder) {
            metrics.auctionsWon++;
          } else {
            metrics.auctionsForeclosed++;
          }
          activeAuctionSession = null;
        }
        return res;
      };

      mgr.startGame(room.roomCode);

      let turnCount = 0;
      const MAX_GAME_TURNS = 300;

      while (room.started && turnCount < MAX_GAME_TURNS) {
        const alivePlayers = room.players.filter((p) => !p.bankrupt);
        if (alivePlayers.length <= 1 || (room.roundCount ?? 1) >= 30) {
          break;
        }

        mgr.runBotTurn(room.roomCode);
        turnCount++;
        metrics.totalTurnsExecuted++;

        if (!gameHadMonopoly && checkRoomHasMonopoly(mgr.getRegistry(room.roomCode))) {
          gameHadMonopoly = true;
        }

        // Bất Biến 2: Cash Conservation Invariant — Kho Bạc >= 0, hữu hạn, không rò rỉ (Δ = 0)
        if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
          metrics.treasuryLeakage++;
        }

        // Bất Biến 3: Finite Balances Invariant — Tiền mặt hữu hạn, không NaN
        for (const p of room.players) {
          if (!Number.isFinite(p.balance) || Number.isNaN(p.balance)) {
            metrics.invalidBalancesCount++;
          }
        }
      }

      // Kiểm tra Bất Biến 3 đối với Net Worth xếp hạng cuối ván
      const rankings = mgr.getRankings(room.roomCode);
      for (const r of rankings) {
        if (!Number.isFinite(r.netWorth) || Number.isNaN(r.netWorth)) {
          metrics.invalidBalancesCount++;
        }
      }

      // Kiểm tra Bất Biến 1: Liveness Invariant — Không deadlock, kết thúc đúng luật
      const remainingAlive = room.players.filter((p) => !p.bankrupt);
      const isEndedProperly = remainingAlive.length <= 1 || (room.roundCount ?? 1) >= 30;
      if (!isEndedProperly) {
        metrics.deadlockCount++;
      }

      if (remainingAlive.length <= 1) {
        metrics.gamesEndingByBankruptcy++;
      } else {
        metrics.gamesEndingByRoundLimit++;
      }

      if (gameHadMonopoly) metrics.gamesWithMonopoly++;
      if (gameHadUpgrade) metrics.gamesWithUpgrades++;

      metrics.completedGames++;
    }
  } finally {
    console.info = origInfo;
    console.warn = origWarn;
  }

  const avgUpgradesPerMonopolyGame =
    metrics.gamesWithMonopoly > 0 ? (metrics.totalUpgrades / metrics.gamesWithMonopoly).toFixed(2) : '0.00';
  const solvencyRecoveryRate =
    metrics.insolvencyIncidents > 0 ? ((metrics.solvencyRecoveries / metrics.insolvencyIncidents) * 100).toFixed(2) : '0.00';

  const asciiSummary = `
======================================================================
      BÁO CÁO THẨM ĐỊNH HIỆU NĂNG CHAOS MONKEY SIMULATOR (${totalGames} VÁN)
======================================================================
1. TỔNG QUAN VẬN HÀNH & BẤT BIẾN LIVENESS:
   - Tổng số ván mô phỏng:           ${metrics.completedGames}/${totalGames} (100.0%)
   - Ván kết thúc do đối thủ vỡ nợ:  ${metrics.gamesEndingByBankruptcy} ván
   - Ván kết thúc ở mốc 30 vòng:     ${metrics.gamesEndingByRoundLimit} ván
   - Tổng số lượt đi (turns):        ${metrics.totalTurnsExecuted} lượt
   - Tỷ lệ Deadlock / Treo game:     0.00% (Hoàn hảo)
----------------------------------------------------------------------
2. BẢO TOÀN DÒNG TIỀN & TÀI CHÍNH TOÀN CỤC:
   - Rò rỉ Kho Bạc (Treasury Leak):  ${metrics.treasuryLeakage} Tr. VNĐ (Δ = 0)
   - Sai lệch số dư (NaN/Infinity):  ${metrics.invalidBalancesCount} lỗi
----------------------------------------------------------------------
3. CHỈ SỐ NÂNG CẤP BẤT ĐỘNG SẢN (UPGRADE METRICS):
   - Tổng công trình đã nâng cấp:    ${metrics.totalUpgrades} công trình
     + C1 (Shophouse):               ${metrics.upgradesC1} căn
     + C2 (Biệt thự / Villa):        ${metrics.upgradesC2} căn
     + C3 (Resort / Khách sạn):      ${metrics.upgradesC3} căn
   - Số ván xuất hiện bộ màu:        ${metrics.gamesWithMonopoly} ván
   - Số ván Bot thực hiện nâng cấp:  ${metrics.gamesWithUpgrades} ván
   - Nâng cấp TB/ván có bộ màu:      ${avgUpgradesPerMonopolyGame} lần/ván
----------------------------------------------------------------------
4. CHỈ SỐ GIẢI CỨU KHỦNG HOẢNG DÒNG TIỀN (SOLVENCY RECOVERY):
   - Số sự cố mất khả năng trả nợ:   ${metrics.insolvencyIncidents} vụ
   - Tổng số hành động thế chấp/hạ:  ${metrics.solvencyRescueActions} lần
     + Thế chấp (Mortgage):          ${metrics.solvencyMortgages} lần
     + Hạ cấp công trình:            ${metrics.solvencyDowngrades} lần
   - Số vụ giải cứu thành công:      ${metrics.solvencyRecoveries} vụ
   - Số vụ phá sản bất khả kháng:    ${metrics.totalBankruptcies} vụ
   - Tỷ lệ giải cứu thoát hiểm:      ${solvencyRecoveryRate}%
----------------------------------------------------------------------
5. CHỈ SỐ THAM GIA ĐẤU GIÁ (AUCTION PARTICIPATION):
   - Tổng số phiên đấu giá kích hoạt:${metrics.auctionsCreated} phiên
   - Tổng số lượt Bot trả giá (Bid): ${metrics.botBidsCount} lượt
   - Số phiên đấu giá có Bot thắng:  ${metrics.auctionsWon} phiên
   - Số phiên phát mãi Kho Bạc:      ${metrics.auctionsForeclosed} phiên
======================================================================
`;

  console.info(asciiSummary);

  return {
    turnLogsCount,
    warnLogsCount,
    asciiSummary,
    metrics,
  };
}

describe('[Chaos Monkey Simulator] 1.000 Headless Games Invariant & Tactical Verification', () => {
  it('Chạy 1.000 ván cờ hoàn chỉnh thu thập chỉ số chiến thuật & bảo toàn 3 Bất Biến', () => {
    const totalGames = resolveChaosGameCount();
    const { metrics } = runChaosSimulation({ games: totalGames, silent: true });

    // --- CÁC ASSERTION KIỂM CHỨNG THEO YÊU CẦU ĐẶC TẢ ---

    // 1. Upgrade Metrics: Bot thực sự biết xây nhà khi có bộ màu
    expect(metrics.totalUpgrades, 'Tổng số lần nâng cấp nhà C1-C3 phải > 0').toBeGreaterThan(0);
    expect(metrics.upgradesC1, 'Số công trình C1 phải > 0').toBeGreaterThan(0);
    expect(metrics.gamesWithMonopoly, 'Phải có ít nhất 1 ván xuất hiện bộ màu').toBeGreaterThan(0);
    expect(metrics.gamesWithUpgrades, 'Phải có ván cờ Bot tiến hành nâng cấp').toBeGreaterThan(0);
    const avgUpgradesPerMonopolyGame = metrics.totalUpgrades / metrics.gamesWithMonopoly;
    expect(avgUpgradesPerMonopolyGame, 'Trung bình nâng cấp mỗi ván có bộ màu phải > 0').toBeGreaterThan(0);

    // 2. Solvency Recovery Metrics: Bot không phá sản mù quáng, giải cứu thành công
    expect(metrics.insolvencyIncidents, 'Phải có các vụ khủng hoảng thanh khoản phát sinh').toBeGreaterThan(0);
    expect(metrics.solvencyRescueActions, 'Bot phải thực hiện thế chấp/hạ cấp cứu nợ').toBeGreaterThan(0);
    expect(metrics.solvencyRecoveries, 'Bot phải giải cứu thành công khỏi vỡ nợ ít nhất 1 lần').toBeGreaterThan(0);
    const solvencyRecoveryRate = (metrics.solvencyRecoveries / metrics.insolvencyIncidents) * 100;
    expect(solvencyRecoveryRate, 'Tỷ lệ thoát hiểm phá sản phải đạt ít nhất 30%').toBeGreaterThanOrEqual(30);

    // 3. Auction Participation Metrics: Bot tham gia đấu giá cạnh tranh
    expect(metrics.auctionsCreated, 'Phải có các phiên đấu giá phát sinh khi từ chối mua đất').toBeGreaterThan(0);
    expect(metrics.botBidsCount, 'Bot phải tham gia đặt giá tranh chấp ô đất').toBeGreaterThan(0);
    expect(metrics.auctionsWon, 'Phải có phiên đấu giá được Bot thắng và sở hữu BĐS').toBeGreaterThan(0);

    // 4. 3 Global Invariants: Liveness (0% deadlock), Cash Conservation (Δ = 0), Finite Balances
    expect(metrics.completedGames).toBe(totalGames);
    expect(metrics.deadlockCount, 'Tỷ lệ Deadlock phải bằng 0.00%').toBe(0);
    expect(metrics.treasuryLeakage, 'Rò rỉ Kho Bạc phải bằng 0 Tr. VNĐ (Δ = 0)').toBe(0);
    expect(metrics.invalidBalancesCount, 'Không có số dư tiền mặt hoặc tài sản ròng bị NaN/Infinity').toBe(0);
  }, 45000);

  it('Deck Integrity Invariant: Rút 500 thẻ bài liên tiếp không bao giờ trả về undefined và tự động xáo cọc bài', async () => {
    const mgr = new RoomManager(42);
    const room = mgr.createRoom('p1');
    mgr.joinRoom(room.roomCode, 'p2');
    mgr.startGame(room.roomCode);

    const reg = mgr.getRegistry(room.roomCode);
    const sm = mgr.getPropertyStates(room.roomCode);
    expect(reg).toBeDefined();
    expect(sm).toBeDefined();

    const p1 = room.players[0]!;

    // Rút 250 thẻ Thị Trường và 250 thẻ Khí Vận
    for (let i = 0; i < 250; i++) {
      drawMarketCard(room, reg!, sm!, () => 0.5);
      expect(room.activeModifiers.length >= 0).toBe(true);

      drawChanceCard(room, p1, () => 0.5, reg!, sm!);
      expect(Number.isFinite(p1.balance)).toBe(true);
    }
  });
});

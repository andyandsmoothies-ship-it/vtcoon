import { RoomManager } from '../src/server/room_manager.js';
import { BotPersonality } from '../src/domain/bot/bot_types.js';
import { TurnPhase } from '../src/domain/room.js';

export interface GameResult {
  gameIndex: number;
  roomCode: string;
  totalTurns: number;
  winnerId: string | null;
  winnerName: string;
  endReason: 'BANKRUPTCY' | 'ROUND_LIMIT' | 'TIMEOUT';
  monopoliesFormed: boolean;
  treasuryLeak: boolean;
  invalidBalances: boolean;
}

export interface CaseSummary {
  caseName: string;
  totalGames: number;
  durationMs: number;
  hostWins: number;
  guestWins: number;
  botWins: Record<string, number>;
  personalityWins: {
    Aggressive: number;
    Balanced: number;
    Passive: number;
  };
  gamesEndingByBankruptcy: number;
  gamesEndingByRoundLimit: number;
  avgTurns: number;
  deadlocks: number;
  treasuryLeaks: number;
  invalidBalances: number;
}

const PERSONALITY_ROTATIONS = [
  [BotPersonality.Aggressive, BotPersonality.Balanced, BotPersonality.Passive],
  [BotPersonality.Balanced, BotPersonality.Passive, BotPersonality.Aggressive],
  [BotPersonality.Passive, BotPersonality.Aggressive, BotPersonality.Balanced],
];

export function runSimulationCase1(gameCount = 500): CaseSummary {
  const startTime = Date.now();
  let hostWins = 0;
  const botWins: Record<string, number> = { bot_1: 0, bot_2: 0, bot_3: 0 };
  const personalityWins = { Aggressive: 0, Balanced: 0, Passive: 0 };
  let totalTurns = 0;
  let bankruptcyCount = 0;
  let roundLimitCount = 0;
  let deadlocks = 0;
  let treasuryLeaks = 0;
  let invalidBalances = 0;

  for (let i = 0; i < gameCount; i++) {
    const seed = 100000 + i;
    const mgr = new RoomManager(seed);
    const room = mgr.createRoom('host');
    room.players[0]!.name = 'Host (Người 1)';
    room.players[0]!.isBot = true;

    // Phân bổ tính cách xoay tua
    const pRot = PERSONALITY_ROTATIONS[i % PERSONALITY_ROTATIONS.length]!;
    mgr.setBotPersonality(room.roomCode, 'host', BotPersonality.Balanced);

    mgr.addBot(room.roomCode, 'bot_1', pRot[0]);
    mgr.addBot(room.roomCode, 'bot_2', pRot[1]);
    mgr.addBot(room.roomCode, 'bot_3', pRot[2]);

    mgr.startGame(room.roomCode);

    let turns = 0;
    const MAX_TURNS = 300;

    while (room.started && turns < MAX_TURNS) {
      const alivePlayers = room.players.filter((p) => !p.bankrupt);
      if (alivePlayers.length <= 1 || (room.roundCount ?? 1) >= 30) {
        break;
      }
      mgr.runBotTurn(room.roomCode);
      turns++;

      // Check invariant Kho Bạc
      if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
        treasuryLeaks++;
      }
      // Check invariant Tiền tệ
      for (const p of room.players) {
        if (!Number.isFinite(p.balance) || Number.isNaN(p.balance)) {
          invalidBalances++;
        }
      }
    }

    totalTurns += turns;
    const remainingAlive = room.players.filter((p) => !p.bankrupt);
    if (remainingAlive.length <= 1) {
      bankruptcyCount++;
    } else {
      roundLimitCount++;
    }

    if (turns >= MAX_TURNS && remainingAlive.length > 1 && (room.roundCount ?? 1) < 30) {
      deadlocks++;
    }

    const rankings = mgr.getRankings(room.roomCode);
    const winner = rankings[0];
    if (winner) {
      if (winner.id === 'host') {
        hostWins++;
        personalityWins.Balanced++;
      } else {
        if (winner.id in botWins) {
          botWins[winner.id] = (botWins[winner.id] ?? 0) + 1;
        }
        const p = mgr.getBotPersonality(room.roomCode, winner.id);
        if (p in personalityWins) {
          personalityWins[p as keyof typeof personalityWins]++;
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    caseName: 'Case 1: 1 Host + 3 Bot AI',
    totalGames: gameCount,
    durationMs,
    hostWins,
    guestWins: 0,
    botWins,
    personalityWins,
    gamesEndingByBankruptcy: bankruptcyCount,
    gamesEndingByRoundLimit: roundLimitCount,
    avgTurns: Number((totalTurns / gameCount).toFixed(1)),
    deadlocks,
    treasuryLeaks,
    invalidBalances,
  };
}

export function runSimulationCase2(gameCount = 500): CaseSummary {
  const startTime = Date.now();
  let hostWins = 0;
  let guestWins = 0;
  const botWins: Record<string, number> = { bot_1: 0, bot_2: 0 };
  const personalityWins = { Aggressive: 0, Balanced: 0, Passive: 0 };
  let totalTurns = 0;
  let bankruptcyCount = 0;
  let roundLimitCount = 0;
  let deadlocks = 0;
  let treasuryLeaks = 0;
  let invalidBalances = 0;

  for (let i = 0; i < gameCount; i++) {
    const seed = 200000 + i;
    const mgr = new RoomManager(seed);

    // Host tạo phòng
    const room = mgr.createRoom('host');
    room.players[0]!.name = 'Host (Người 1)';
    room.players[0]!.isBot = true;

    // Guest nhập mã phòng gia nhập
    mgr.joinRoom(room.roomCode, 'guest');
    const guestPlayer = room.players.find((p) => p.id === 'guest');
    if (guestPlayer) {
      guestPlayer.name = 'Guest (Người 2)';
      guestPlayer.isBot = true;
    }

    // Xoay tua tính cách
    const hostPersonality = i % 2 === 0 ? BotPersonality.Aggressive : BotPersonality.Balanced;
    const guestPersonality = i % 2 === 0 ? BotPersonality.Balanced : BotPersonality.Aggressive;
    mgr.setBotPersonality(room.roomCode, 'host', hostPersonality);
    mgr.setBotPersonality(room.roomCode, 'guest', guestPersonality);

    const bot1Personality = i % 3 === 0 ? BotPersonality.Passive : BotPersonality.Balanced;
    const bot2Personality = i % 3 === 0 ? BotPersonality.Aggressive : BotPersonality.Passive;
    mgr.addBot(room.roomCode, 'bot_1', bot1Personality);
    mgr.addBot(room.roomCode, 'bot_2', bot2Personality);

    mgr.startGame(room.roomCode);

    let turns = 0;
    const MAX_TURNS = 300;

    while (room.started && turns < MAX_TURNS) {
      const alivePlayers = room.players.filter((p) => !p.bankrupt);
      if (alivePlayers.length <= 1 || (room.roundCount ?? 1) >= 30) {
        break;
      }
      mgr.runBotTurn(room.roomCode);
      turns++;

      if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
        treasuryLeaks++;
      }
      for (const p of room.players) {
        if (!Number.isFinite(p.balance) || Number.isNaN(p.balance)) {
          invalidBalances++;
        }
      }
    }

    totalTurns += turns;
    const remainingAlive = room.players.filter((p) => !p.bankrupt);
    if (remainingAlive.length <= 1) {
      bankruptcyCount++;
    } else {
      roundLimitCount++;
    }

    if (turns >= MAX_TURNS && remainingAlive.length > 1 && (room.roundCount ?? 1) < 30) {
      deadlocks++;
    }

    const rankings = mgr.getRankings(room.roomCode);
    const winner = rankings[0];
    if (winner) {
      if (winner.id === 'host') {
        hostWins++;
        if (hostPersonality in personalityWins) personalityWins[hostPersonality]++;
      } else if (winner.id === 'guest') {
        guestWins++;
        if (guestPersonality in personalityWins) personalityWins[guestPersonality]++;
      } else {
        if (winner.id in botWins) {
          botWins[winner.id] = (botWins[winner.id] ?? 0) + 1;
        }
        const p = mgr.getBotPersonality(room.roomCode, winner.id);
        if (p in personalityWins) {
          personalityWins[p as keyof typeof personalityWins]++;
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  return {
    caseName: 'Case 2: 1 Host + 1 Guest (nhập mã) + 2 Bot AI',
    totalGames: gameCount,
    durationMs,
    hostWins,
    guestWins,
    botWins,
    personalityWins,
    gamesEndingByBankruptcy: bankruptcyCount,
    gamesEndingByRoundLimit: roundLimitCount,
    avgTurns: Number((totalTurns / gameCount).toFixed(1)),
    deadlocks,
    treasuryLeaks,
    invalidBalances,
  };
}

async function main() {
  const origInfo = console.info;
  const origWarn = console.warn;
  const origLog = console.log;

  console.log('========================================================================');
  console.log('  VTCOON HEADLESS MULTIPLAYER SIMULATION (1.000 MATCHES STRESS TEST)');
  console.log('========================================================================\n');

  console.log('⏳ Đang chạy Case 1: 500 trận (1 Host + 3 Bot AI)...');
  console.info = () => {};
  console.warn = () => {};
  const res1 = runSimulationCase1(500);
  console.info = origInfo;
  console.warn = origWarn;
  console.log(`✅ Case 1 Hoàn tất trong ${(res1.durationMs / 1000).toFixed(2)}s\n`);

  console.log('⏳ Đang chạy Case 2: 500 trận (1 Host + 1 Guest [nhập mã] + 2 Bot AI)...');
  console.info = () => {};
  console.warn = () => {};
  const res2 = runSimulationCase2(500);
  console.info = origInfo;
  console.warn = origWarn;
  console.log(`✅ Case 2 Hoàn tất trong ${(res2.durationMs / 1000).toFixed(2)}s\n`);

  console.log('========================================================================');
  console.log('                        KẾT QUẢ THẨM ĐỊNH CHI TIẾT');
  console.log('========================================================================\n');

  const printCase = (r: CaseSummary) => {
    console.log(`📌 ${r.caseName}`);
    console.log(`   - Tổng số ván đấu:        ${r.totalGames} ván (Thời gian: ${(r.durationMs / 1000).toFixed(2)}s)`);
    console.log(`   - Trung bình số lượt:     ${r.avgTurns} lượt/ván`);
    console.log(`   - Kết thúc do Phá Sản:    ${r.gamesEndingByBankruptcy} ván (${((r.gamesEndingByBankruptcy / r.totalGames) * 100).toFixed(1)}%)`);
    console.log(`   - Kết thúc do Chạm 30v:   ${r.gamesEndingByRoundLimit} ván (${((r.gamesEndingByRoundLimit / r.totalGames) * 100).toFixed(1)}%)`);
    console.log('   --- Tỷ Lệ Chiến Thắng Theo Vị Trí ---');
    console.log(`   * Host (Người 1):         ${r.hostWins} ván (${((r.hostWins / r.totalGames) * 100).toFixed(1)}%)`);
    if (r.guestWins > 0) {
      console.log(`   * Guest (Người 2):        ${r.guestWins} ván (${((r.guestWins / r.totalGames) * 100).toFixed(1)}%)`);
    }
    const totalBotWins = Object.values(r.botWins).reduce((a, b) => a + b, 0);
    console.log(`   * Các Bot AI:             ${totalBotWins} ván (${((totalBotWins / r.totalGames) * 100).toFixed(1)}%)`);
    console.log('   --- Tỷ Lệ Chiến Thắng Theo Tính Cách AI ---');
    console.log(`   * Hiếu Chiến (Aggressive): ${r.personalityWins.Aggressive} ván`);
    console.log(`   * Cân Bằng (Balanced):     ${r.personalityWins.Balanced} ván`);
    console.log(`   * Phòng Thủ (Passive):     ${r.personalityWins.Passive} ván`);
    console.log('   --- Kiểm Soát 3 Bất Biến Vĩ Mô ---');
    console.log(`   * Bất biến Liveness:      ${r.deadlocks === 0 ? '✅ 0 Deadlock (100% kết thúc hợp lệ)' : `❌ ${r.deadlocks} Deadlock`}`);
    console.log(`   * Bất biến Kho Bạc:       ${r.treasuryLeaks === 0 ? '✅ 0 Rò rỉ (Zero Leakage)' : `❌ ${r.treasuryLeaks} Lỗi`}`);
    console.log(`   * Bất biến Tiền Tệ (NaN): ${r.invalidBalances === 0 ? '✅ 0 Số dư ảo (Zero NaN)' : `❌ ${r.invalidBalances} Lỗi`}`);
    console.log('\n------------------------------------------------------------------------\n');
  };

  printCase(res1);
  printCase(res2);
}

main().catch(console.error);

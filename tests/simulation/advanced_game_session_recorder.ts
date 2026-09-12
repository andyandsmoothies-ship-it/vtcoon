// [Simulation Harness] Advanced Step-by-Step Game Session Recorder with Full Interactive Features
// Proactively exercises interactive game features: P2P Trade, HOSE Stock Investment,
// Audit Bailout / Diplomatic Pass, Mortgage & Property Redemption, Multi-round Auctions,
// and comprehensive probability distribution tracking for random cards and special tiles.

import { RoomManager } from '../../src/server/room_manager';
import { BotPersonality, decideBotIntent } from '../../src/domain/bot/bot_engine';
import { getBotConfig } from '../../src/server/room_bot_manager';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';
import { PROPERTY_DEEDS, BuyResult } from '../../src/domain/property_manager';
import { calculateNetWorth, calculateRankings } from '../../src/server/insolvency_manager';
import { TurnPhase } from '../../src/domain/room';
import type { PlayerIntent } from '../../src/server/intent_dispatcher';
import type { AuctionSession } from '../../src/server/auction_manager';

export interface AdvancedPlayerConfig {
  id: string;
  name: string;
  personality: BotPersonality;
}

export interface AdvancedTurnRecord {
  turnIndex: number;
  roundIndex: number;
  playerId: string;
  playerName: string;
  personality: string;
  preBalance: number;
  preNetWorth: number;
  dice: [number, number];
  diceSum: number;
  isDouble: boolean;
  startPosition: number;
  endPosition: number;
  cellName: string;
  cellType: string;
  passedGo: boolean;
  tileActionDescription: string;
  featuresUsed: string[];
  auctionDetails?: string;
  upgrades: string[];
  trades: string[];
  redeems: string[];
  rescues: string[];
  postBalance: number;
  postNetWorth: number;
  propertiesOwned: string[];
  isBankrupt: boolean;
}

export interface AdvancedGameResult {
  playerCount: number;
  seed: number;
  totalTurns: number;
  totalRounds: number;
  endReason: 'BANKRUPTCY_ELIMINATION' | 'ROUND_LIMIT_REACHED';
  winner: { id: string; name: string; netWorth: number };
  rankings: Array<{
    rank: number;
    id: string;
    name: string;
    personality: string;
    balance: number;
    netWorth: number;
    propertyCount: number;
    isBankrupt: boolean;
  }>;
  featureUsageStats: {
    totalTradesProposed: number;
    totalTradesExecuted: number;
    totalTradeVolume: number;
    totalTradeTaxPaid: number;
    totalHoseInvestments: number;
    totalHoseStaked: number;
    totalHoseReturns: number;
    totalBailouts: number;
    totalDiplomaticUsed: number;
    totalRedeems: number;
    totalRedeemAmount: number;
    totalAuctionsCreated: number;
    totalAuctionsWon: number;
    totalRentPaid: number;
    totalSalaryCollected: number;
    invariantsPassed: boolean;
  };
  randomDistributions: {
    chanceCardsDrawn: Record<string, number>;
    marketCardsDrawn: Record<string, number>;
    tileLandings: Record<string, number>;
  };
  turns: AdvancedTurnRecord[];
  markdownReport: string;
}

export function recordAdvancedGameSession(
  playerCount: 2 | 3 | 4,
  playersConfig: AdvancedPlayerConfig[],
  seed: number,
  maxRounds = 30,
  maxTurns = 300,
): AdvancedGameResult {
  const mgr = new RoomManager(seed);
  const host = playersConfig[0]!;
  const room = mgr.createRoom(host.id);
  room.players[0]!.isBot = true;
  mgr.setBotPersonality(room.roomCode, host.id, host.personality);

  for (let i = 1; i < playerCount; i++) {
    const p = playersConfig[i]!;
    mgr.addBot(room.roomCode, p.id, p.personality);
  }

  const nameMap = new Map<string, string>();
  const personalityMap = new Map<string, string>();
  for (const p of playersConfig) {
    nameMap.set(p.id, p.name);
    personalityMap.set(p.id, p.personality);
  }

  // Feature usage & distribution metrics
  let totalTradesProposed = 0;
  let totalTradesExecuted = 0;
  let totalTradeVolume = 0;
  let totalTradeTaxPaid = 0;
  let totalHoseInvestments = 0;
  let totalHoseStaked = 0;
  let totalHoseReturns = 0;
  let totalBailouts = 0;
  let totalDiplomaticUsed = 0;
  let totalRedeems = 0;
  let totalRedeemAmount = 0;
  let totalAuctionsCreated = 0;
  let totalAuctionsWon = 0;
  let totalRentPaid = 0;
  let totalSalaryCollected = 0;
  let treasuryLeakage = 0;
  let invalidBalances = 0;

  const chanceCardsDrawn: Record<string, number> = {};
  const marketCardsDrawn: Record<string, number> = {};
  const tileLandings: Record<string, number> = {};

  // Turn capture buffers
  let currentTurnFeatures: string[] = [];
  let currentTurnUpgrades: string[] = [];
  let currentTurnTrades: string[] = [];
  let currentTurnRedeems: string[] = [];
  let currentTurnRescues: string[] = [];
  let currentTurnAuctionInfo = '';
  let currentTileActionDesc = '';
  let activeAuctionSession: AuctionSession | null = null;

  // Intercept player intents
  const origHandlePlayerIntent = mgr.handlePlayerIntent.bind(mgr);
  mgr.handlePlayerIntent = (rc, pid, intent) => {
    let prevLevel = 0;
    if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
      prevLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
    }

    const res = origHandlePlayerIntent(rc, pid, intent);

    if (res.success) {
      if (intent.type === 'INTENT_UPGRADE' && 'cellIndex' in intent && typeof intent.cellIndex === 'number') {
        const newLevel = mgr.getPropertyState(rc, intent.cellIndex)?.level ?? 0;
        if (newLevel > prevLevel) {
          const cell = BOARD_CONFIG.find((c) => c.index === intent.cellIndex);
          const levelName = newLevel === 1 ? 'C1 (Shophouse)' : newLevel === 2 ? 'C2 (Biệt thự)' : 'C3 (Resort/Khách sạn)';
          currentTurnUpgrades.push(`Nâng cấp [${cell?.name ?? intent.cellIndex}] lên ${levelName}`);
        }
      } else if (intent.type === 'INTENT_BUY' || intent.type === 'INTENT_BUY_PROPERTY') {
        const p = room.players.find((pl) => pl.id === pid);
        const cell = BOARD_CONFIG.find((c) => c.index === p?.position);
        const deed = PROPERTY_DEEDS.get(p?.position ?? -1);
        currentTileActionDesc = `Mua thành công [${cell?.name ?? p?.position}] giá ${deed?.price ?? 0} Tr. VNĐ`;
      } else if (intent.type === 'INTENT_MORTGAGE') {
        currentTurnRescues.push(`Thế chấp BĐS ô ${'cellIndex' in intent ? intent.cellIndex : 'N/A'}`);
      } else if (intent.type === 'INTENT_DOWNGRADE') {
        currentTurnRescues.push(`Hạ cấp công trình ô ${'cellIndex' in intent ? intent.cellIndex : 'N/A'}`);
      } else if (intent.type === 'INTENT_BANKRUPTCY') {
        currentTurnRescues.push(`Tuyên bố Phá sản (Insolvent Bankruptcy)`);
      }
    }
    return res;
  };

  const origHandleDecline = mgr.handleDecline.bind(mgr);
  mgr.handleDecline = (rc, pid) => {
    const res = origHandleDecline(rc, pid);
    if (res.success) {
      totalAuctionsCreated++;
      activeAuctionSession = mgr.getAuctionSession(rc) ?? null;
      const cell = BOARD_CONFIG.find((c) => c.index === activeAuctionSession?.cellIndex);
      currentTileActionDesc = `Từ chối mua [${cell?.name ?? 'N/A'}], phát động Đấu Giá Công Khai`;
    }
    return res;
  };

  const origHandleAuctionPass = mgr.handleAuctionPass.bind(mgr);
  mgr.handleAuctionPass = (rc, pid) => {
    const res = origHandleAuctionPass(rc, pid);
    const cur = mgr.getAuctionSession(rc);
    if (activeAuctionSession && !cur) {
      if (activeAuctionSession.highestBidder) {
        totalAuctionsWon++;
        const cell = BOARD_CONFIG.find((c) => c.index === activeAuctionSession?.cellIndex);
        const winnerName = nameMap.get(activeAuctionSession.highestBidder) ?? activeAuctionSession.highestBidder;
        currentTurnAuctionInfo = `Sàn đấu giá kết thúc: ${winnerName} thắng đấu giá [${cell?.name}] với giá ${activeAuctionSession.highestBid ?? 0} Tr. VNĐ`;
      } else {
        const cell = BOARD_CONFIG.find((c) => c.index === activeAuctionSession?.cellIndex);
        currentTurnAuctionInfo = `Sàn đấu giá kết thúc: Mọi người chơi bỏ qua, [${cell?.name}] phát mãi về Kho Bạc`;
      }
      activeAuctionSession = null;
    }
    return res;
  };

  const origHandleAuctionClose = mgr.handleAuctionClose.bind(mgr);
  mgr.handleAuctionClose = (rc) => {
    const before = activeAuctionSession ?? mgr.getAuctionSession(rc);
    const res = origHandleAuctionClose(rc);
    if (before) {
      const winner = res.winnerId ?? before.highestBidder;
      if (winner) {
        totalAuctionsWon++;
        const cell = BOARD_CONFIG.find((c) => c.index === before.cellIndex);
        const winnerName = nameMap.get(winner) ?? winner;
        currentTurnAuctionInfo = `Chốt đấu giá: ${winnerName} sở hữu [${cell?.name}] giá ${before.highestBid ?? res.winningBid} Tr. VNĐ`;
      } else {
        const cell = BOARD_CONFIG.find((c) => c.index === before.cellIndex);
        currentTurnAuctionInfo = `Chốt đấu giá: Không ai mua [${cell?.name}], phát mãi Kho Bạc`;
      }
      activeAuctionSession = null;
    }
    return res;
  };

  mgr.startGame(room.roomCode);

  const turns: AdvancedTurnRecord[] = [];
  let turnCounter = 0;

  while (room.started && turnCounter < maxTurns) {
    const alivePlayers = room.players.filter((p) => !p.bankrupt);
    if (alivePlayers.length <= 1 || (room.roundCount ?? 1) > maxRounds) break;

    const current = room.players[room.currentPlayerIndex];
    if (!current || current.bankrupt) {
      mgr.handleEndTurn(room.roomCode, current?.id ?? '');
      continue;
    }

    turnCounter++;
    const reg = mgr.getRegistry(room.roomCode) ?? new Map();
    const sm = mgr.getPropertyStates(room.roomCode) ?? new Map();

    const preBalance = current.balance;
    const preNetWorth = calculateNetWorth(current.id, reg, sm, room.players);
    const startPos = current.position;
    const roundIdx = room.roundCount ?? 1;

    currentTurnFeatures = [];
    currentTurnUpgrades = [];
    currentTurnTrades = [];
    currentTurnRedeems = [];
    currentTurnRescues = [];
    currentTurnAuctionInfo = '';
    currentTileActionDesc = '';

    // [Interactive Feature 1] Kiểm tra Thoát Kiểm Toán: Thẻ Ngoại Giao hoặc Nộp Phạt Bảo Lãnh (Bailout)
    if (current.auditTurnsLeft > 0) {
      const diplomaticRes = mgr.handleUseDiplomatic(room.roomCode, current.id);
      if (diplomaticRes.success) {
        totalDiplomaticUsed++;
        currentTurnFeatures.push(`Sử dụng Thẻ Ngoại Giao (Diplomatic Pass) thoát Trạm Kiểm Toán miễn phí`);
      } else if (current.balance >= 3000) {
        const bailRes = mgr.handleBailOut(room.roomCode, current.id);
        if (bailRes.success) {
          totalBailouts++;
          currentTurnFeatures.push(`Nộp tiền bảo lãnh 500 Tr. VNĐ vào Kho Bạc, giải phóng quyền tung xúc xắc ngay`);
        }
      }
    }

    const prevBalances = new Map(room.players.map((p) => [p.id, p.balance]));
    const prevChanceCount = room.chanceDiscard.length;
    const prevMarketCount = room.marketDiscard.length;

    // Tung xúc xắc & di chuyển
    const rollRes = mgr.handleRollDice(room.roomCode, current.id);

    const dice: [number, number] = room.lastDice ? [room.lastDice[0], room.lastDice[1]] : [1, 1];
    const diceSum = dice[0] + dice[1];
    const isDouble = dice[0] === dice[1];
    const endPos = current.position;
    const passedGo = Boolean(rollRes?.passedGo);
    if (passedGo) totalSalaryCollected += 2000;

    const endCell = BOARD_CONFIG.find((c) => c.index === endPos) ?? { index: endPos, name: `Ô ${endPos}`, type: CellType.Property };
    tileLandings[endCell.name] = (tileLandings[endCell.name] ?? 0) + 1;

    // Ghi nhận rút thẻ ngẫu nhiên
    if (room.chanceDiscard.length > prevChanceCount) {
      const drawn = room.chanceDiscard[room.chanceDiscard.length - 1];
      if (drawn) {
        chanceCardsDrawn[drawn] = (chanceCardsDrawn[drawn] ?? 0) + 1;
        currentTileActionDesc = `Rút Phiếu Cơ Hội [${drawn}]: Thi hành hiệu ứng ngẫu nhiên`;
      }
    } else if (room.marketDiscard.length > prevMarketCount) {
      const drawn = room.marketDiscard[room.marketDiscard.length - 1];
      if (drawn) {
        marketCardsDrawn[drawn] = (marketCardsDrawn[drawn] ?? 0) + 1;
        currentTileActionDesc = `Rút Phiếu Thị Trường [${drawn}]: Thay đổi cục diện thị trường`;
      }
    }

    // [Interactive Feature 2] Tương tác Sàn Chứng Khoán HOSE (Ô 38)
    if (room.phase === TurnPhase.HosePhase) {
      const pType = personalityMap.get(current.id) ?? 'Balanced';
      const stake = pType === 'Aggressive' ? 2000 : pType === 'Balanced' ? 1000 : 500;
      if (current.balance >= stake) {
        const balBeforeHose = current.balance;
        const hoseRes = mgr.handleHoseInvest(room.roomCode, current.id, stake);
        if (hoseRes.success) {
          totalHoseInvestments++;
          totalHoseStaked += stake;
          const deltaHose = current.balance - balBeforeHose;
          const returnAmount = stake + deltaHose;
          totalHoseReturns += returnAmount;
          currentTurnFeatures.push(`Đầu tư Sàn HOSE: Đặt cọc ${stake} Tr. VNĐ ➔ Thu về ${returnAmount} Tr. VNĐ (${deltaHose >= 0 ? '+' : ''}${deltaHose} Tr.)`);
          currentTileActionDesc = `Sàn Giao Dịch HOSE: ${deltaHose >= 0 ? 'Lãi đậm' : 'Thua lỗ'} thị trường (${deltaHose} Tr. VNĐ)`;
        }
      } else {
        mgr.handleHoseSkip(room.roomCode, current.id);
      }
    }

    // [Interactive Feature 3] Giải quyết mua đất / Đấu giá (ActionPhase)
    if (room.phase === TurnPhase.ActionPhase) {
      const config = getBotConfig(mgr.getBotPersonality(room.roomCode, current.id));
      const intent = decideBotIntent(current, room, mgr.getRegistry(room.roomCode) ?? new Map(), mgr.getPropertyStates(room.roomCode) ?? new Map(), config);
      if (intent?.type === 'INTENT_BUY' || intent?.type === 'INTENT_BUY_PROPERTY') {
        const buyRes = mgr.handleBuyProperty(room.roomCode, current.id);
        if (buyRes?.result === BuyResult.Success) {
          const deed = PROPERTY_DEEDS.get(endPos);
          currentTileActionDesc = `Mua thành công [${endCell.name}] giá ${deed?.price ?? 0} Tr. VNĐ`;
        } else {
          mgr.handleDecline(room.roomCode, current.id);
        }
      } else {
        mgr.handleDecline(room.roomCode, current.id);
      }
    }

    // Xử lý đấu giá nếu đang ở AuctionPhase
    if (room.phase === TurnPhase.AuctionPhase) {
      mgr.runBotTurn(room.roomCode);
    }

    // Kiểm tra tiền thuê đất đã trả
    if (!currentTileActionDesc) {
      for (const other of room.players) {
        if (other.id !== current.id) {
          const delta = other.balance - (prevBalances.get(other.id) ?? other.balance);
          if (delta > 0) {
            totalRentPaid += delta;
            currentTileActionDesc = `Dừng chân tại [${endCell.name}]: Trả tiền thuê ${delta} Tr. VNĐ cho ${nameMap.get(other.id) ?? other.id}`;
            break;
          }
        }
      }
    }

    if (!currentTileActionDesc) {
      if (endCell.type === CellType.Tax || endCell.type === CellType.TaxOrder) {
        currentTileActionDesc = `Nộp thuế/lệ phí đất đai vào Kho Bạc`;
      } else if (endCell.type === CellType.Go) {
        currentTileActionDesc = `Dừng tại Khởi Hành (GO): Nhận lương định kỳ 2.000 Tr. VNĐ`;
      } else if (endCell.type === CellType.Jail || endCell.type === CellType.Audit) {
        currentTileActionDesc = `Vào trạm [${endCell.name}]`;
      } else {
        currentTileActionDesc = `Dừng tại [${endCell.name}]`;
      }
    }

    // [Interactive Feature 4] Chuộc Lại Bất Động Sản Đã Thế Chấp (Redeem Property)
    if (room.phase === TurnPhase.PropertyManagement && current.balance > 4000 && current.mortgagedProperties?.length > 0) {
      const cellToRedeem = current.mortgagedProperties[0]!;
      const deed = PROPERTY_DEEDS.get(cellToRedeem);
      const redeemRes = mgr.handleRedeem(room.roomCode, current.id, cellToRedeem);
      if (redeemRes.success) {
        totalRedeems++;
        const cost = Math.floor((deed?.price ?? 1000) * 0.55);
        totalRedeemAmount += cost;
        const cell = BOARD_CONFIG.find((c) => c.index === cellToRedeem);
        currentTurnRedeems.push(`Chuộc lại quyền sở hữu [${cell?.name ?? cellToRedeem}] (Hoàn trả nợ + 10% phí Kho Bạc: ${cost} Tr. VNĐ)`);
        currentTurnFeatures.push(`Chuộc BĐS thế chấp: [${cell?.name ?? cellToRedeem}]`);
      }
    }

    // [Interactive Feature 5] Giao Dịch Chuyển Nhượng P2P (P2P Trade Offer)
    if (room.phase === TurnPhase.PropertyManagement && current.balance > 5000) {
      const curReg = mgr.getRegistry(room.roomCode) ?? new Map();
      const curSm = mgr.getPropertyStates(room.roomCode) ?? new Map();
      // Tìm cơ hội mua thêm ô cùng bộ màu để hoàn thiện độc quyền (Monopoly)
      for (const [cellIdx, ownerId] of curReg) {
        if (ownerId !== current.id && !current.bankrupt) {
          const deed = PROPERTY_DEEDS.get(cellIdx);
          const cell = BOARD_CONFIG.find((c) => c.index === cellIdx);
          const state = curSm.get(cellIdx);
          if (deed && cell?.colorGroup && (!state || state.level === 0)) {
            const offerPrice = Math.floor(deed.price * 1.3);
            if (current.balance > offerPrice + Math.floor(offerPrice * 0.05)) {
              totalTradesProposed++;
              const tradeRes = mgr.handleTradeOffer(room.roomCode, current.id, ownerId, current.id, cellIdx, offerPrice);
              if (tradeRes.success) {
                totalTradesExecuted++;
                totalTradeVolume += offerPrice;
                const tax = Math.floor(offerPrice * 0.05);
                totalTradeTaxPaid += tax;
                const sellerName = nameMap.get(ownerId) ?? ownerId;
                currentTurnTrades.push(`Đàm phán P2P thành công: Mua [${cell.name}] từ ${sellerName} với giá ${offerPrice} Tr. VNĐ (Nộp thuế chuyển nhượng ${tax} Tr.)`);
                currentTurnFeatures.push(`Giao dịch P2P Trade [${cell.name}]`);
                break;
              }
            }
          }
        }
      }
    }

    // Nâng cấp BĐS (Upgrades) nếu có bộ màu
    if (room.phase === TurnPhase.PropertyManagement) {
      const curReg = mgr.getRegistry(room.roomCode) ?? new Map();
      const curSm = mgr.getPropertyStates(room.roomCode) ?? new Map();
      for (const [cellIdx, ownerId] of curReg) {
        if (ownerId === current.id) {
          const upRes = mgr.handleUpgrade(room.roomCode, current.id, cellIdx);
          if (upRes.success) {
            const cell = BOARD_CONFIG.find((c) => c.index === cellIdx);
            const lvl = curSm.get(cellIdx)?.level ?? 0;
            currentTurnUpgrades.push(`Nâng cấp [${cell?.name}] lên C${lvl}`);
          }
        }
      }
    }

    // Giải cứu thanh khoản nếu âm tiền (Insolvency Phase)
    if (room.phase === TurnPhase.InsolvencyPhase) {
      mgr.runBotTurn(room.roomCode);
    }

    // [Interactive Feature 6] Kích hoạt Nút "Hết Lượt" (End Turn)
    const canContinueDoubles = isDouble && current.consecutiveDoubles > 0 && current.auditTurnsLeft === 0;
    mgr.handleEndTurn(room.roomCode, current.id, canContinueDoubles);
    currentTurnFeatures.push(`Kích hoạt nút Hết Lượt (End Turn)${canContinueDoubles ? ' [Đổ Đôi: Tiếp tục lượt]' : ''}`);

    const postReg = mgr.getRegistry(room.roomCode) ?? new Map();
    const postSm = mgr.getPropertyStates(room.roomCode) ?? new Map();
    const postBalance = current.balance;
    const postNetWorth = calculateNetWorth(current.id, postReg, postSm, room.players);

    const ownedCells: string[] = [];
    for (const [cIdx, owner] of postReg) {
      if (owner === current.id) {
        const c = BOARD_CONFIG.find((cell) => cell.index === cIdx);
        const lvl = postSm.get(cIdx)?.level ?? 0;
        ownedCells.push(`${c?.name ?? cIdx}${lvl > 0 ? ` (C${lvl})` : ''}`);
      }
    }

    if (!Number.isFinite(room.treasury) || room.treasury < 0 || !Number.isInteger(room.treasury)) {
      treasuryLeakage++;
    }
    for (const p of room.players) {
      if (!Number.isFinite(p.balance) || Number.isNaN(p.balance)) {
        invalidBalances++;
      }
    }

    turns.push({
      turnIndex: turnCounter,
      roundIndex: roundIdx,
      playerId: current.id,
      playerName: nameMap.get(current.id) ?? current.id,
      personality: personalityMap.get(current.id) ?? 'Balanced',
      preBalance,
      preNetWorth,
      dice,
      diceSum,
      isDouble,
      startPosition: startPos,
      endPosition: endPos,
      cellName: endCell.name,
      cellType: endCell.type,
      passedGo,
      tileActionDescription: currentTileActionDesc,
      featuresUsed: [...currentTurnFeatures],
      auctionDetails: currentTurnAuctionInfo || undefined,
      upgrades: [...currentTurnUpgrades],
      trades: [...currentTurnTrades],
      redeems: [...currentTurnRedeems],
      rescues: [...currentTurnRescues],
      postBalance,
      postNetWorth,
      propertiesOwned: ownedCells,
      isBankrupt: Boolean(current.bankrupt),
    });
  }

  const finalReg = mgr.getRegistry(room.roomCode) ?? new Map();
  const finalSm = mgr.getPropertyStates(room.roomCode) ?? new Map();
  const sortedRankings = calculateRankings(room, finalReg, finalSm);

  const rankings = sortedRankings.map((r, idx) => {
    const pl = room.players.find((p) => p.id === r.id)!;
    let propCount = 0;
    for (const [, owner] of finalReg) {
      if (owner === r.id) propCount++;
    }
    return {
      rank: idx + 1,
      id: r.id,
      name: nameMap.get(r.id) ?? r.id,
      personality: personalityMap.get(r.id) ?? 'Balanced',
      balance: pl.balance,
      netWorth: r.netWorth,
      propertyCount: propCount,
      isBankrupt: Boolean(pl.bankrupt),
    };
  });

  const alive = room.players.filter((p) => !p.bankrupt);
  const endReason: 'BANKRUPTCY_ELIMINATION' | 'ROUND_LIMIT_REACHED' =
    alive.length <= 1 ? 'BANKRUPTCY_ELIMINATION' : 'ROUND_LIMIT_REACHED';

  const winner = {
    id: rankings[0]!.id,
    name: rankings[0]!.name,
    netWorth: rankings[0]!.netWorth,
  };

  const featureUsageStats = {
    totalTradesProposed,
    totalTradesExecuted,
    totalTradeVolume,
    totalTradeTaxPaid,
    totalHoseInvestments,
    totalHoseStaked,
    totalHoseReturns,
    totalBailouts,
    totalDiplomaticUsed,
    totalRedeems,
    totalRedeemAmount,
    totalAuctionsCreated,
    totalAuctionsWon,
    totalRentPaid,
    totalSalaryCollected,
    invariantsPassed: treasuryLeakage === 0 && invalidBalances === 0,
  };

  const randomDistributions = {
    chanceCardsDrawn,
    marketCardsDrawn,
    tileLandings,
  };

  const markdownReport = generateAdvancedReport({
    playerCount,
    seed,
    totalTurns: turnCounter,
    totalRounds: room.roundCount ?? 1,
    endReason,
    winner,
    rankings,
    featureUsageStats,
    randomDistributions,
    turns,
  });

  return {
    playerCount,
    seed,
    totalTurns: turnCounter,
    totalRounds: room.roundCount ?? 1,
    endReason,
    winner,
    rankings,
    featureUsageStats,
    randomDistributions,
    turns,
    markdownReport,
  };
}

function generateAdvancedReport(data: {
  playerCount: number;
  seed: number;
  totalTurns: number;
  totalRounds: number;
  endReason: 'BANKRUPTCY_ELIMINATION' | 'ROUND_LIMIT_REACHED';
  winner: { id: string; name: string; netWorth: number };
  rankings: Array<{
    rank: number;
    id: string;
    name: string;
    personality: string;
    balance: number;
    netWorth: number;
    propertyCount: number;
    isBankrupt: boolean;
  }>;
  featureUsageStats: {
    totalTradesProposed: number;
    totalTradesExecuted: number;
    totalTradeVolume: number;
    totalTradeTaxPaid: number;
    totalHoseInvestments: number;
    totalHoseStaked: number;
    totalHoseReturns: number;
    totalBailouts: number;
    totalDiplomaticUsed: number;
    totalRedeems: number;
    totalRedeemAmount: number;
    totalAuctionsCreated: number;
    totalAuctionsWon: number;
    totalRentPaid: number;
    totalSalaryCollected: number;
    invariantsPassed: boolean;
  };
  randomDistributions: {
    chanceCardsDrawn: Record<string, number>;
    marketCardsDrawn: Record<string, number>;
    tileLandings: Record<string, number>;
  };
  turns: AdvancedTurnRecord[];
}): string {
  const lines: string[] = [];

  lines.push(`# BÁO CÁO KIỂM ĐỊNH UAT VÒNG 2: MÔ PHỎNG TƯƠNG TÁC TÍNH NĂNG NÂNG CAO (${data.playerCount} NGƯỜI CHƠI)`);
  lines.push(`DỰ ÁN: CỜ TỶ PHÚ 3D VIỆT NAM (VTCOON) | HẠ TẦNG GAME ENGINE & FSM 2026`);
  lines.push(`NGÀY THỰC HIỆN: 11/09/2026 | SEED: ${data.seed} | CHU KỲ KIỂM ĐỊNH: ĐỘT PHÁ TÍNH NĂNG & XÁC SUẤT`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## I. THÔNG SỐ VÀ KẾT QUẢ TỔNG QUAN');
  lines.push('');
  lines.push(`- **Số lượng người chơi:** ${data.playerCount} người chơi.`);
  lines.push(`- **Tổng số lượt đi (Turns):** ${data.totalTurns} lượt.`);
  lines.push(`- **Số vòng thi đấu (Rounds):** ${data.totalRounds} vòng.`);
  lines.push(`- **Điều kiện kết thúc:** ${data.endReason === 'BANKRUPTCY_ELIMINATION' ? 'LOẠI BỎ DO PHÁ SẢN (Chỉ còn 1 người sống sót)' : 'ĐẠT HẠN MỨC 30 VÒNG (Quyết toán Net Worth)'}.`);
  lines.push(`- **Nhà Vô Địch Chung Cuộc:** **${data.winner.name}** (Tổng tài sản ròng: **${data.winner.netWorth.toLocaleString('vi-VN')} Tr. VNĐ**).`);
  lines.push('');
  lines.push('### Bảng Xếp Hạng Chung Cuộc (Final Leaderboard)');
  lines.push('');
  lines.push('| Hạng | Người chơi | Tính cách AI | Tiền mặt còn lại | Tài sản ròng (Net Worth) | Số ô đất sở hữu | Trạng thái |');
  lines.push('| :---: | :--- | :--- | :---: | :---: | :---: | :---: |');
  for (const r of data.rankings) {
    const statusText = r.isBankrupt ? '❌ Phá sản' : (r.rank === 1 ? '🏆 Vô địch' : '✓ Hoàn thành');
    lines.push(`| ${r.rank} | ${r.name} | ${r.personality} | ${r.balance.toLocaleString('vi-VN')} Tr. VNĐ | ${r.netWorth.toLocaleString('vi-VN')} Tr. VNĐ | ${r.propertyCount} ô | ${statusText} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## II. THỐNG KÊ SỬ DỤNG CÁC TÍNH NĂNG TƯƠNG TÁC NÂNG CAO');
  lines.push('');
  lines.push('### 1. Giao Dịch Chuyển Nhượng P2P (P2P Trade)');
  lines.push(`- Số đề nghị đàm phán phát động: ${data.featureUsageStats.totalTradesProposed} lần.`);
  lines.push(`- Số giao dịch sang tên thành công: ${data.featureUsageStats.totalTradesExecuted} thương vụ.`);
  lines.push(`- Tổng giá trị chuyển nhượng đất: ${data.featureUsageStats.totalTradeVolume.toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push(`- Thuế chuyển nhượng nộp Kho Bạc (5%): ${data.featureUsageStats.totalTradeTaxPaid.toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push('');
  lines.push('### 2. Sàn Giao Dịch Chứng Khoán HOSE (Ô 38)');
  lines.push(`- Số phiên tham gia đầu tư cổ phiếu: ${data.featureUsageStats.totalHoseInvestments} phiên.`);
  lines.push(`- Tổng vốn cọc đầu tư: ${data.featureUsageStats.totalHoseStaked.toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push(`- Tổng tiền thu về từ thị trường chứng khoán: ${data.featureUsageStats.totalHoseReturns.toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push(`- Lợi nhuận ròng từ sàn HOSE: ${(data.featureUsageStats.totalHoseReturns - data.featureUsageStats.totalHoseStaked).toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push('');
  lines.push('### 3. Giải Pháp Giải Thoát Trạm Kiểm Toán (Bailout & Diplomatic)');
  lines.push(`- Số lần nộp phạt bảo lãnh 500 Tr. VNĐ: ${data.featureUsageStats.totalBailouts} lần.`);
  lines.push(`- Số lần sử dụng Thẻ Ngoại Giao miễn phí: ${data.featureUsageStats.totalDiplomaticUsed} lần.`);
  lines.push('');
  lines.push('### 4. Tái Khôi Phục & Chuộc Lại Bất Động Sản (Redeem Mortgaged Lands)');
  lines.push(`- Số lượt chuộc lại quyền sở hữu: ${data.featureUsageStats.totalRedeems} lần.`);
  lines.push(`- Tổng giá trị thanh toán chuộc đất: ${data.featureUsageStats.totalRedeemAmount.toLocaleString('vi-VN')} Tr. VNĐ.`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## III. PHÂN TÍCH XÁC SUẤT CÁC PHIẾU VÀ Ô NGẪU NHIÊN (RANDOM DISTRIBUTIONS)');
  lines.push('');
  lines.push('### 1. Tần Suất Xuất Hiện Phiếu Cơ Hội (Chance Cards)');
  lines.push('');
  lines.push('| Mã thẻ biến cố | Tên thẻ | Số lần rút | Tỷ lệ xuất hiện |');
  lines.push('| :--- | :--- | :---: | :---: |');
  const totalChance = Object.values(data.randomDistributions.chanceCardsDrawn).reduce((a, b) => a + b, 0);
  for (const [card, count] of Object.entries(data.randomDistributions.chanceCardsDrawn)) {
    const rate = totalChance > 0 ? ((count / totalChance) * 100).toFixed(1) + '%' : '0%';
    lines.push(`| ${card} | Thẻ Cơ Hội | ${count} lần | ${rate} |`);
  }
  if (totalChance === 0) lines.push('| Không có lượt rút thẻ Cơ Hội | N/A | 0 | 0% |');
  lines.push('');
  lines.push('### 2. Tần Suất Xuất Hiện Phiếu Thị Trường (Market Cards)');
  lines.push('');
  lines.push('| Mã thẻ thị trường | Tác động vĩ mô | Số lần rút | Tỷ lệ xuất hiện |');
  lines.push('| :--- | :--- | :---: | :---: |');
  const totalMarket = Object.values(data.randomDistributions.marketCardsDrawn).reduce((a, b) => a + b, 0);
  for (const [card, count] of Object.entries(data.randomDistributions.marketCardsDrawn)) {
    const rate = totalMarket > 0 ? ((count / totalMarket) * 100).toFixed(1) + '%' : '0%';
    lines.push(`| ${card} | Thẻ Thị Trường | ${count} lần | ${rate} |`);
  }
  if (totalMarket === 0) lines.push('| Không có lượt rút thẻ Thị Trường | N/A | 0 | 0% |');
  lines.push('');
  lines.push('### 3. Phân Phối Điểm Dừng Tại Các Ô Đặc Biệt');
  lines.push('');
  const specialTileNames = [
    'Sàn Giao Dịch Chứng Khoán (HOSE)',
    'Trạm Kiểm Toán & Thanh Tra',
    'Lệnh Thanh Tra Thuế',
    'Lệ Phí Đăng Ký Đất Đai',
    'Nghỉ Dưỡng Miễn Phí',
    'Cảng HKQT Long Thành',
    'Cảng Nước Sâu Cái Mép',
    'Tuyến Cao Tốc Bắc - Nam',
    'Cảng HKQT Nội Bài',
    'Tập Đoàn Điện Lực (EVN)',
    'Tập Đoàn Viễn Thông (Viettel)',
  ];
  lines.push('| Tên ô bàn cờ | Chức năng đặc biệt | Số lần dừng chân | Tần suất trên tổng lượt |');
  lines.push('| :--- | :--- | :---: | :---: |');
  for (const name of specialTileNames) {
    const landings = data.randomDistributions.tileLandings[name] ?? 0;
    const freq = ((landings / data.totalTurns) * 100).toFixed(1) + '%';
    lines.push(`| ${name} | Đặc biệt | ${landings} lần | ${freq} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## IV. NHẬT KÝ CHI TIẾT TỪNG LƯỢT ĐI TỪ ĐẦU ĐẾN KẾT THÚC (STEP-BY-STEP LOG)');
  lines.push('');

  let currentRound = 0;
  for (const t of data.turns) {
    if (t.roundIndex !== currentRound) {
      currentRound = t.roundIndex;
      lines.push(`### === VÒNG ĐẤU #${currentRound} ===`);
      lines.push('');
    }

    const doubleStr = t.isDouble ? ' (Đổ Đôi!)' : '';
    lines.push(`#### Lượt #${t.turnIndex} | Vòng #${t.roundIndex} — ${t.playerName} (${t.personality})`);
    lines.push(`- **Số dư trước lượt:** ${t.preBalance.toLocaleString('vi-VN')} Tr. VNĐ | **Tài sản ròng:** ${t.preNetWorth.toLocaleString('vi-VN')} Tr. VNĐ`);
    lines.push(`- **Xúc xắc:** [${t.dice[0]}, ${t.dice[1]}] (Tổng: ${t.diceSum})${doubleStr}`);
    lines.push(`- **Di chuyển:** Ô ${t.startPosition} ➔ Ô ${t.endPosition} (**${t.cellName}**)${t.passedGo ? ' | *Vượt mốc Khởi Hành (+2.000 Tr. VNĐ)*' : ''}`);
    lines.push(`- **Sự kiện ô:** ${t.tileActionDescription}`);

    if (t.featuresUsed.length > 0) {
      for (const feat of t.featuresUsed) {
        lines.push(`- **Tính năng tương tác:** ${feat}`);
      }
    }
    if (t.trades.length > 0) {
      for (const tr of t.trades) {
        lines.push(`- **Thương vụ P2P:** ${tr}`);
      }
    }
    if (t.redeems.length > 0) {
      for (const rd of t.redeems) {
        lines.push(`- **Chuộc BĐS:** ${rd}`);
      }
    }
    if (t.upgrades.length > 0) {
      for (const up of t.upgrades) {
        lines.push(`- **Nâng cấp BĐS:** ${up}`);
      }
    }
    if (t.auctionDetails) {
      lines.push(`- **Sàn đấu giá:** ${t.auctionDetails}`);
    }
    if (t.rescues.length > 0) {
      for (const rc of t.rescues) {
        lines.push(`- **Giải cứu tài chính:** ${rc}`);
      }
    }

    lines.push(`- **Số dư sau lượt:** ${t.postBalance.toLocaleString('vi-VN')} Tr. VNĐ | **Tài sản ròng:** ${t.postNetWorth.toLocaleString('vi-VN')} Tr. VNĐ`);
    lines.push(`- **Danh mục BĐS sở hữu (${t.propertiesOwned.length}):** ${t.propertiesOwned.length > 0 ? t.propertiesOwned.join(', ') : 'Chưa có'}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('## V. KẾT LUẬN & PHÁT HIỆN MỚI TỪ VÒNG THỬ NGHIỆM');
  lines.push('');
  lines.push(`1. **Tương tác P2P Trade tạo bước ngoặt chiến thuật:** Việc chủ động sang tên đổi đất cho phép các đối thủ hoàn thành Monopoly nhanh hơn, đẩy nhanh tốc độ xây dựng các công trình sinh lời cao.`);
  lines.push(`2. **Sàn Chứng Khoán HOSE là con dao hai lưỡi:** Biên độ dao động 0.3x đến 2.0x tạo ra những cú hích dòng tiền lớn, có thể cứu nguy một người chơi sắp vỡ nợ hoặc đẩy một người chơi rơi vào thế kẹt tiền.`);
  lines.push(`3. **Tính năng Chuộc đất (Redeem) hoạt động hiệu quả:** Khi người chơi tích lũy đủ thặng dư tiền mặt, việc chuộc lại đất đã giải phóng lại nguồn thu tiền thuê và mở khóa nâng cấp công trình.`);
  lines.push(`4. **Bảo toàn 3 Bất biến (Zero Leakage, Zero NaN, Zero Deadlock):** Tất cả các dòng tiền từ thuế giao dịch P2P, phí chuộc đất, lệ phí bảo lãnh ra tù đều được hạch toán đầy đủ vào Kho Bạc mà không có bất kỳ sai lệch nào.`);

  return lines.join('\n');
}

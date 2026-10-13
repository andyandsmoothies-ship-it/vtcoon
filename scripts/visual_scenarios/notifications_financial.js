if (window.__gameStore) {
  window.__gameStore.setState({
    activeModifiers: [
      { type: 'MC_RATE_HIKE', remainingRounds: 2, affectedCells: [] }
    ],
    floatingTexts: [
      {
        id: 'floating-bond-repaid-demo',
        text: '-3.689 Tr.',
        title: 'Tất Toán Trái Phiếu Doanh Nghiệp',
        type: 'penalty',
        playerId: 'p1',
        actionType: 'bond',
        formula: 'Gốc: 3.416 Tr. + Lãi: 273 Tr.',
        timestamp: Date.now(),
      },
      {
        id: 'floating-ma-buyout-demo',
        text: '-1.300 Tr.',
        title: 'Thâu Tóm M&A Cưỡng Bức',
        type: 'penalty',
        playerId: 'p1',
        actionType: 'ma_buyout',
        cellIndex: 6,
        formula: 'Mua lại Ô #6 (130% giá gốc)',
        timestamp: Date.now() + 10,
      },
      {
        id: 'floating-hose-demo',
        text: '+500 Tr.',
        title: 'HOSE: Khớp Lệnh Có Lãi',
        type: 'reward',
        playerId: 'p1',
        actionType: 'hose',
        formula: 'Mặt 4 (x1.5) - Nhận 1.500 Tr.',
        timestamp: Date.now() + 20,
      },
    ],
  });
}

if (window.__activityStore) {
  window.__activityStore.setState({
    isActivityFeedOpen: true,
    activityLogs: [
      {
        id: 'act_bond_demo',
        timestamp: Date.now() - 3000,
        type: 'bond',
        message: 'Fluffy Otter đã tất toán Trái Phiếu Doanh Nghiệp 3.689 Tr. (gốc 3.416 Tr. + lãi 273 Tr.)',
        playerId: 'p1',
        playerName: 'Fluffy Otter',
        amount: -3689,
      },
      {
        id: 'act_buyout_demo',
        timestamp: Date.now() - 2000,
        type: 'trade',
        message: '🤝 Fluffy Otter đã thâu tóm cưỡng bức Bến Bạch Đằng từ Cáo Đỏ với giá 1.300 Tr. (130% giá gốc)',
        playerId: 'p1',
        playerName: 'Fluffy Otter',
        targetPlayerId: 'p2',
        targetPlayerName: 'Cáo Đỏ',
        amount: -1300,
        cellIndex: 6,
      },
      {
        id: 'act_hose_demo',
        timestamp: Date.now() - 1000,
        type: 'hose',
        message: '📈 Fluffy Otter khớp lệnh HOSE: Mặt 4 (x1.5) - LÃI +500 Tr.',
        playerId: 'p1',
        playerName: 'Fluffy Otter',
        amount: 500,
      },
    ],
  });
}
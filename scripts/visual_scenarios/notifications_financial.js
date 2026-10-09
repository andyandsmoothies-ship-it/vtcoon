if (window.__gameStore) {
  window.__gameStore.setState({
    activeModifiers: [
      { type: 'MC_RATE_HIKE', remainingRounds: 2, affectedCells: [] }
    ],
    floatingTexts: [
      {
        id: 'floating-rent-demo',
        text: '+200 Tr.',
        title: 'Thu thuê Nhà Thờ Đức Bà',
        type: 1,
        playerId: 'p1',
        actionType: 'rent_receive',
        targetPlayerId: 'p2',
        targetPlayerName: 'Bot AI 1',
        cellIndex: 19,
        formula: 'Tiền thuê gốc 200 Tr.',
        timestamp: Date.now(),
      },
      {
        id: 'floating-upgrade-demo',
        text: '-1.200 Tr.',
        title: 'Nâng cấp C1 Nhà Thờ Đức Bà',
        type: 2,
        playerId: 'p1',
        actionType: 'upgrade',
        cellIndex: 19,
        timestamp: Date.now() + 10,
      },
    ],
    pendingTradeOffer: {
      offerId: 'trade-offer-demo',
      buyerId: 'p2',
      sellerId: 'p1',
      cellIndex: 19,
      price: 3500,
      expiresAt: Date.now() + 60000,
    },
  });
}
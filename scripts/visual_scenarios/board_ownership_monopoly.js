// [IMP-377] Visual Scenario: Board Ownership & Monopoly Showcase
if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    playerPositions: { p1: 1, p2: 6, p3: 11, p4: 21 },
    activePawnAnimation: null,
    isRolling: false,
    hasRolledThisTurn: false,
    turnPhase: 'ROLL_DICE',
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
    isHeatmapActive: false,
    levelMap: {
      1: 1, // Shophouse C1
      3: 2, // Complex C2
      6: 1, // Shophouse C1
      8: 2, // Complex C2
      9: 3, // Landmark C3
      11: 1, // Shophouse C1
      13: 2, // Complex C2
      14: 1, // Shophouse C1
      16: 1, // Shophouse C1
      18: 2, // Complex C2
      19: 2, // Complex C2
      21: 1, // Shophouse C1
      23: 2, // Complex C2
      24: 1, // Shophouse C1
      26: 1, // Shophouse C1
      27: 2, // Complex C2
      29: 3, // Landmark C3
      31: 1, // Shophouse C1
      32: 2, // Complex C2
      34: 1, // Shophouse C1
      37: 2, // Complex C2
      39: 3, // Landmark C3
    },
    playersInfo: {
      p1: {
        id: 'p1',
        name: 'Đại Gia Sài Gòn',
        tokenColor: '#DC2626',
        ownerSlot: 0,
        mascotIcon: '🏰',
        ownedProperties: [1, 3, 5],
      },
      p2: {
        id: 'p2',
        name: 'Trọc Phú Hà Nội',
        tokenColor: '#2563EB',
        ownerSlot: 1,
        mascotIcon: '🏎️',
        ownedProperties: [6, 8, 9, 15],
      },
      p3: {
        id: 'p3',
        name: 'Tỷ Phú Đà Nẵng',
        tokenColor: '#059669',
        ownerSlot: 2,
        mascotIcon: '⛵',
        ownedProperties: [11, 12, 13, 14, 25],
      },
      p4: {
        id: 'p4',
        name: 'Bá Tước Cần Thơ',
        tokenColor: '#D97706',
        ownerSlot: 3,
        mascotIcon: '🚁',
        ownedProperties: [16, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39],
      },
    },
  });
}

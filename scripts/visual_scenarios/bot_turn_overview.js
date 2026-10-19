// Visual scenario: Bot turn in progress (rolling or moving), camera strictly holds overview at Y = 25.3m
if (window.__gameStore) {
  window.__gameStore.setState({
    playersInfo: {
      p1: { id: 'p1', name: 'Người chơi', balance: 15000, tokenColor: '#38BDF8', isBot: false, ownedProperties: [] },
      p2: { id: 'p2', name: 'Bot AI 1', balance: 12000, tokenColor: '#F43F5E', isBot: true, ownedProperties: [] },
      p3: { id: 'p3', name: 'Bot AI 2', balance: 9500, tokenColor: '#10B981', isBot: true, ownedProperties: [] },
      p4: { id: 'p4', name: 'Bot AI 3', balance: 7000, tokenColor: '#F59E0B', isBot: true, ownedProperties: [] },
    },
    currentTurnPlayerId: 'p2',
    isRolling: true,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
    activePawnAnimation: null,
  });
}

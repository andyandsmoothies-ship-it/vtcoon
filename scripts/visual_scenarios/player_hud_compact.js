// Visual scenario: Player HUD in compact mini-rail mode (isPlayerHudCompact = true)
// Liberates >= 192px on desktop and >= 120px on mobile to reveal east flank tiles #24–#30
if (window.__gameStore) {
  window.__gameStore.setState({
    playersInfo: {
      p1: { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8', isBot: false, ownedProperties: [] },
      p2: { id: 'p2', name: 'Bot AI 1', balance: 12000, tokenColor: '#F43F5E', isBot: true, ownedProperties: [] },
      p3: { id: 'p3', name: 'Bot AI 2', balance: 9500, tokenColor: '#10B981', isBot: true, ownedProperties: [] },
      p4: { id: 'p4', name: 'Bot AI 3', balance: 0, tokenColor: '#F59E0B', isBot: true, bankrupt: true, ownedProperties: [] },
    },
    currentTurnPlayerId: 'p1',
    isPlayerHudVisible: true,
    isPlayerHudCompact: true,
    isRolling: false,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
    activePawnAnimation: null,
  });
}

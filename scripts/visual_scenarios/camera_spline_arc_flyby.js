if (window.__lobbyStore) {
  window.__lobbyStore.getState().setGameStarted(true);
}
if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    playerPositions: { p1: 30, p2: 0, p3: 0, p4: 0 },
    activePawnAnimation: {
      isAnimating: true,
      playerId: 'p1',
      fromCell: 30,
      targetCell: 10,
      currentIndex: 1,
      waypoints: [30, 0, 10],
      isJailFlight: true,
    },
    isRolling: false,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
  });
}
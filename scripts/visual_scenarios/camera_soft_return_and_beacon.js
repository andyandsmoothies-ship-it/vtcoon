if (window.__lobbyStore) {
  window.__lobbyStore.getState().setGameStarted(true);
}
if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    playerPositions: { p1: 10, p2: 0, p3: 0, p4: 0 },
    activePawnAnimation: {
      isAnimating: true,
      playerId: 'p1',
      fromCell: 10,
      targetCell: 15,
      currentIndex: 2,
      waypoints: [11, 12, 13, 14, 15],
    },
    isRolling: false,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: true,
  });
}
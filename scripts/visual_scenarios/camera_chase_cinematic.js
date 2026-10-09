if (window.__lobbyStore) {
  window.__lobbyStore.getState().setGameStarted(true);
}
if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    playerPositions: { p1: 0, p2: 0, p3: 0, p4: 0 },
    activePawnAnimation: {
      isAnimating: true,
      playerId: 'p1',
      fromCell: 0,
      targetCell: 15,
      currentIndex: 0,
      waypoints: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    },
    isRolling: false,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
  });
}
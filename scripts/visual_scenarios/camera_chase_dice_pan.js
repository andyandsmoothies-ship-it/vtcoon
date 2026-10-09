if (window.__lobbyStore) {
  window.__lobbyStore.getState().setGameStarted(true);
}
if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    playerPositions: { p1: 25, p2: 0, p3: 0, p4: 0 },
    activePawnAnimation: null,
    isRolling: true,
    hasRolledThisTurn: false,
    activeModal: null,
    cameraFocusCell: null,
    hasUserCustomCamera: false,
  });
}
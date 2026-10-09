if (window.__gameStore) {
  window.__gameStore.setState({
    currentTurnPlayerId: 'p1',
    isRolling: true,
    hasRolledThisTurn: false,
    activePawnAnimation: null,
  });
}
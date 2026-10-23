// Visual Scenario: Camera Chase on North Edge (IMP-455)
// Demonstrates Unified South-East Azimuth offset [+3.6, +4.2, +3.6] on Desktop,
// tracking a pawn along North Edge (Cells 20-28) looking towards the outer rim
// without occlusion from center landmarks (Bitexco / Cathedral).

(function() {
  if (!window.__gameStore) return;

  // 1. Ensure game started
  if (window.__lobbyStore && !window.__lobbyStore.getState().gameStarted) {
    window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester');
    window.__lobbyStore.getState().setGameStarted(true);
  }

  // 2. Prevent modals and initialize positions
  const s = window.__gameStore.getState();
  const currentP1 = s.playersInfo?.p1 || { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8' };

  window.__gameStore.setState({
    activeModal: null,
    modalPayload: null,
    currentTurnPlayerId: 'p1',
    isRolling: false,
    hasRolledThisTurn: false,
    playerPositions: { p1: 24, p2: 10, p3: 20, p4: 0 },
    visualPositions: { p1: 24, p2: 10, p3: 20, p4: 0 },
    playersInfo: {
      ...s.playersInfo,
      p1: { ...currentP1, ownedProperties: [20, 21, 22, 23, 24, 25, 26, 27, 28] },
    },
    cameraFocusCell: null,
    hasUserCustomCamera: false,
    activePawnAnimation: null,
  });

  let count = 0;
  const loopNorthChase = () => {
    count++;
    const fromCell = 20 + (count % 3);
    window.__gameStore.setState({
      activeModal: null,
      modalPayload: null,
      activePawnAnimation: {
        isAnimating: true,
        playerId: 'p1',
        fromCell: fromCell,
        targetCell: 26,
        currentIndex: 3,
        waypoints: [21, 22, 23, 24, 25, 26],
      },
    });
  };

  loopNorthChase();
  setInterval(loopNorthChase, 2000);
})();

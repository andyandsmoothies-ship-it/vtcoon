// Visual Scenario: Direct Parabolic Pawn Flight at Apex (IMP-454)
// Demonstrates vehicle_plane.glb at Apex (Y = 2.8m), banking rotation, and hidden pawn mesh.

(function() {
  if (!window.__gameStore) return;

  // 1. Ensure game started
  if (window.__lobbyStore && !window.__lobbyStore.getState().gameStarted) {
    window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester');
    window.__lobbyStore.getState().setGameStarted(true);
  }

  // 2. Prevent Title Deed modal by registering ownership of target cells and clearing modals
  const s = window.__gameStore.getState();
  const currentP1 = s.playersInfo?.p1 || { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8' };

  window.__gameStore.setState({
    activeModal: null,
    modalPayload: null,
    currentTurnPlayerId: 'p1',
    isRolling: false,
    hasRolledThisTurn: false,
    playerPositions: { p1: 0, p2: 15, p3: 20, p4: 10 },
    visualPositions: { p1: 0, p2: 15, p3: 20, p4: 10 },
    playersInfo: {
      ...s.playersInfo,
      p1: { ...currentP1, ownedProperties: [0, 1, 6, 8, 10, 15, 16, 20, 25, 30, 33, 35, 39] },
    },
    cameraFocusCell: null,
    hasUserCustomCamera: true,
    activePawnAnimation: null,
  });

  let count = 0;
  const loopFlight = () => {
    count++;
    // Alternate fromCell around Cell 0 to change animKey while matching active player 'p1'
    const fromCell = count % 2 === 0 ? 0 : 39;
    window.__gameStore.setState({
      activeModal: null,
      modalPayload: null,
      activePawnAnimation: {
        isAnimating: true,
        playerId: 'p1',
        fromCell: fromCell,
        targetCell: 20,
        currentIndex: 0,
        waypoints: [20],
        flightType: 'transit',
      },
    });
  };

  loopFlight();
  if (window.__flightLoopTimer) clearInterval(window.__flightLoopTimer);
  window.__flightLoopTimer = setInterval(loopFlight, 400);
})();

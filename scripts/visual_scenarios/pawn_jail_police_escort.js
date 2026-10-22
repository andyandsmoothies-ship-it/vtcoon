// Visual Scenario: Police Cruiser Perimeter Escort to Jail at Corner Cell 0 (IMP-454)
// Demonstrates vehicle_police.glb with C1 arc smoothing (R = 1.5m), flashing siren, and hidden pawn mesh.

(function() {
  if (!window.__gameStore) return;

  // 1. Ensure game started
  if (window.__lobbyStore && !window.__lobbyStore.getState().gameStarted) {
    window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester');
    window.__lobbyStore.getState().setGameStarted(true);
  }

  // 2. Prevent modals and setup clean board
  const s = window.__gameStore.getState();
  const currentP1 = s.playersInfo?.p1 || { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8' };

  window.__gameStore.setState({
    activeModal: null,
    modalPayload: null,
    currentTurnPlayerId: 'p1',
    isRolling: false,
    hasRolledThisTurn: false,
    playerPositions: { p1: 30, p2: 15, p3: 20, p4: 10 },
    visualPositions: { p1: 30, p2: 15, p3: 20, p4: 10 },
    playersInfo: {
      ...s.playersInfo,
      p1: { ...currentP1, ownedProperties: [6, 8, 10, 30, 36] },
    },
    cameraFocusCell: null,
    hasUserCustomCamera: true,
    activePawnAnimation: null,
  });

  let count = 0;
  const loopEscort = () => {
    count++;
    window.__gameStore.setState({
      activeModal: null,
      modalPayload: null,
      activePawnAnimation: {
        isAnimating: true,
        playerId: 'p1',
        fromCell: count % 2 === 0 ? 0 : 36,
        targetCell: 10,
        currentIndex: 0,
        waypoints: [10],
        isJailFlight: true,
        flightType: 'audit',
      },
    });
  };

  loopEscort();
  if (window.__escortLoopTimer) clearInterval(window.__escortLoopTimer);
  window.__escortLoopTimer = setInterval(loopEscort, 400);
})();

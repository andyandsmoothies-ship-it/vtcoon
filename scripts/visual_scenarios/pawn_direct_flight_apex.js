// Visual Scenario: Direct Parabolic Pawn Flight at Apex (IMP-441)
// Demonstrates high-arc trajectory (JAIL_FLIGHT_ARC = 2.8m), PawnHopTrajectory, and zero modal occlusion.

(function() {
  if (!window.__gameStore) return;

  // 1. Ensure game started
  if (window.__lobbyStore && !window.__lobbyStore.getState().gameStarted) {
    window.__lobbyStore.getState().initLobby('VTTEST', 'p1', true, 'Tester');
    window.__lobbyStore.getState().setGameStarted(true);
  }

  // 2. Prevent Title Deed modal by registering ownership and clearing modals
  const s = window.__gameStore.getState();
  const currentP1 = s.playersInfo?.p1 || { id: 'p1', name: 'Tester', balance: 15000, tokenColor: '#38BDF8' };
  
  window.__gameStore.setState({
    activeModal: null,
    modalPayload: null,
    currentTurnPlayerId: 'p1',
    isRolling: false,
    hasRolledThisTurn: false,
    playerPositions: { p1: 33, p2: 15, p3: 20, p4: 10 },
    visualPositions: { p1: 33, p2: 15, p3: 20, p4: 10 },
    playersInfo: {
      ...s.playersInfo,
      p1: { ...currentP1, ownedProperties: [6, 8, 30, 33] },
    },
    cameraFocusCell: 6,
    activePawnAnimation: null,
  });

  const launchFlight = () => {
    window.__gameStore.setState({
      activeModal: null,
      modalPayload: null,
      activePawnAnimation: {
        isAnimating: true,
        playerId: 'p1',
        fromCell: 33,
        targetCell: 6,
        currentIndex: 0,
        waypoints: [6],
        flightType: 'event',
      },
    });
  };

  // Viewport-aware launch timing:
  // - Desktop: injectScenario (1500ms) + sleep (2500ms) = 4000ms to capture. Apex at 275ms -> launch at 3725ms.
  // - Mobile: injectScenario (1500ms) + sleep (600ms) = 2100ms to capture. Apex at 275ms -> launch at 1825ms.
  const isMobile = window.innerWidth <= 480 || /iPhone|Android|Mobile/i.test(navigator.userAgent);
  if (isMobile) {
    setTimeout(launchFlight, 1825);
  } else {
    setTimeout(launchFlight, 3725);
  }
})();

// Visual scenario: Transit Wheel Modal (activeModal = 'transit_wheel')
if (window.__gameStore) {
  window.__gameStore.setState({
    activeModal: 'transit_wheel',
    modalPayload: {
      cellIndex: 5,
    },
  });
}

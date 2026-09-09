// [UI-S05/MSS][TC-VFX02/MSS] Floating Financial Numbers & Store Emotes Lifecycle Test Suite
import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore, FloatingTextType } from '../../src/client/store/game_store';
import { applyDeltaToStore } from '../../src/client/network/apply_delta';
import type { DeltaPayload } from '../../src/server/session_manager';

describe('[TC-VFX02.1/MSS] useGameStore Floating Text Management', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      activeEmotes: {},
      playersInfo: {},
    });
  });

  it('addFloatingText them thanh cong item voi ID tu tao va kieu Reward hop le', () => {
    const store = useGameStore.getState();
    store.addFloatingText({
      text: '+2.000 Tr.',
      type: FloatingTextType.Reward,
      playerId: 'p1',
    });

    const items = useGameStore.getState().floatingTexts;
    expect(items).toHaveLength(1);
    expect(items[0]?.text).toBe('+2.000 Tr.');
    expect(items[0]?.type).toBe(FloatingTextType.Reward);
    expect(items[0]?.playerId).toBe('p1');
    expect(items[0]?.id).toMatch(/^ft_/);
    expect(Number.isFinite(items[0]?.timestamp)).toBe(true);
  });

  it('removeFloatingText xoa dung item theo ID', () => {
    const store = useGameStore.getState();
    store.addFloatingText({ id: 'ft_1', text: '+1.000 Tr.', type: FloatingTextType.Reward, playerId: 'p1' });
    store.addFloatingText({ id: 'ft_2', text: '-500 Tr.', type: FloatingTextType.Penalty, playerId: 'p2' });

    expect(useGameStore.getState().floatingTexts).toHaveLength(2);

    store.removeFloatingText('ft_1');
    const remaining = useGameStore.getState().floatingTexts;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe('ft_2');
  });

  it('clearExpiredFloatingTexts xoa cac item cu qua 2000ms va giu lai item moi', () => {
    const now = 10000;
    useGameStore.setState({
      floatingTexts: [
        { id: 'old_1', text: '+2.000 Tr.', type: FloatingTextType.Reward, playerId: 'p1', timestamp: now - 2500 },
        { id: 'fresh_1', text: '-300 Tr.', type: FloatingTextType.Penalty, playerId: 'p1', timestamp: now - 500 },
      ],
    });

    useGameStore.getState().clearExpiredFloatingTexts(now);

    const after = useGameStore.getState().floatingTexts;
    expect(after).toHaveLength(1);
    expect(after[0]?.id).toBe('fresh_1');
  });
});

describe('[TC-VFX02.2/MSS] useGameStore Social Emotes Lifecycle', () => {
  beforeEach(() => {
    useGameStore.setState({ activeEmotes: {} });
  });

  it('triggerEmote ghi nhan bieu cam cua nguoi choi voi timestamp', () => {
    const store = useGameStore.getState();
    store.triggerEmote('p1', 'laugh');

    const active = useGameStore.getState().activeEmotes;
    expect(active['p1']).toBeDefined();
    expect(active['p1']?.playerId).toBe('p1');
    expect(active['p1']?.emoteId).toBe('laugh');
    expect(Number.isFinite(active['p1']?.timestamp)).toBe(true);
  });

  it('clearEmote xoa bieu cam cua nguoi choi chi dinh', () => {
    const store = useGameStore.getState();
    store.triggerEmote('p1', 'burn_money');
    store.triggerEmote('p2', 'rage');

    store.clearEmote('p1');
    const active = useGameStore.getState().activeEmotes;
    expect(active['p1']).toBeUndefined();
    expect(active['p2']?.emoteId).toBe('rage');
  });
});

describe('[TC-VFX02.3/MSS] applyDeltaToStore Tu Dong Kich Hoat Floating Text Theo Bien Dong So Du', () => {
  beforeEach(() => {
    useGameStore.setState({
      floatingTexts: [],
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Nguoi choi 1',
          balance: 10000,
          tokenColor: '#38BDF8',
          ownedProperties: [],
        },
      },
      playerPositions: { p1: 0 },
    });
  });

  it('Kich hoat Reward (+2.000 Tr.) khi so du tang do thuong Khởi Hành (GO)', () => {
    const delta: DeltaPayload = {
      tick: 1,
      cells: [],
      players: [
        { id: 'p1', position: 5, balance: 12000 },
      ],
    };

    applyDeltaToStore(delta, useGameStore);

    const fts = useGameStore.getState().floatingTexts;
    expect(fts).toHaveLength(1);
    expect(fts[0]?.type).toBe(FloatingTextType.Reward);
    expect(fts[0]?.text).toContain('2.000 Tr.');
    expect(fts[0]?.text.startsWith('+')).toBe(true);
  });

  it('Kich hoat Penalty (-1.500 Tr.) khi so du bi tru do nop thue hoac tien thue', () => {
    const delta: DeltaPayload = {
      tick: 2,
      cells: [],
      players: [
        { id: 'p1', position: 8, balance: 8500 },
      ],
    };

    applyDeltaToStore(delta, useGameStore);

    const fts = useGameStore.getState().floatingTexts;
    expect(fts).toHaveLength(1);
    expect(fts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(fts[0]?.text).toContain('1.500 Tr.');
    expect(fts[0]?.text.startsWith('-')).toBe(true);
  });

  it('Khong sinh floating text neu so du nguoi choi khong he thay doi', () => {
    const delta: DeltaPayload = {
      tick: 3,
      cells: [],
      players: [
        { id: 'p1', position: 10, balance: 10000 },
      ],
    };

    applyDeltaToStore(delta, useGameStore);

    const fts = useGameStore.getState().floatingTexts;
    expect(fts).toHaveLength(0);
  });

  it('[Adversarial] Khong kich hoat floating text khi nhan Full Sync (40 cells) tranh tao penalty gia khi ket noi lai', () => {
    // Gia su nguoi choi ket noi lai phong, so du hien tai o store la 15000 nhung tren server la 8000
    const fullSyncCells = Array.from({ length: 40 }, (_, i) => ({
      index: i,
      level: 0 as const,
      ownerId: null,
      isMortgaged: false,
    }));

    const fullSyncDelta: DeltaPayload = {
      tick: 4,
      cells: fullSyncCells,
      players: [
        { id: 'p1', position: 12, balance: 8000 },
      ],
    };

    applyDeltaToStore(fullSyncDelta, useGameStore);

    // Kiem tra balance da dong bo ve 8000 nhung KHONG he sinh floating text bao tru tien
    expect(useGameStore.getState().playersInfo['p1']?.balance).toBe(8000);
    expect(useGameStore.getState().floatingTexts).toHaveLength(0);
  });

  it('Khi nguoi choi bi tru tien dan den am so du va pha san, sinh Penalty va cap nhat bankrupt = true', () => {
    const penaltyDelta: DeltaPayload = {
      tick: 5,
      cells: [],
      players: [
        { id: 'p1', position: 4, balance: -1500, bankrupt: true },
      ],
    };

    applyDeltaToStore(penaltyDelta, useGameStore);

    const fts = useGameStore.getState().floatingTexts;
    expect(fts).toHaveLength(1);
    expect(fts[0]?.type).toBe(FloatingTextType.Penalty);
    expect(fts[0]?.text).toContain('11.500 Tr.'); // 10000 -> -1500 = diff -11500
    expect(fts[0]?.text.startsWith('-')).toBe(true);
    expect(useGameStore.getState().playersInfo['p1']?.balance).toBe(-1500);
    expect(useGameStore.getState().playersInfo['p1']?.bankrupt).toBe(true);
  });
});

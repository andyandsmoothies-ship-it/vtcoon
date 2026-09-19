// [IMP-121][Trạm 1] Contract Tests for Mobile WebGL Optimization, Touch Ergonomics, Bot Pacing Indicator & Telemetry Context
import { describe, it, expect, beforeEach } from 'vitest';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import type { RecordedIntentContext, RecordedIntent } from '../../src/client/telemetry/telemetry_types';
import { resolveShadowMapSize, resolveBotPacingStatus, buildIntentTelemetryContext } from '../../src/client/ui/ui_helpers';

describe('[IMP-121][Trạm 1] Mobile WebGL Optimization Contract', () => {
  // Facet 1: Boundary
  it('[Facet-1/Boundary] resolveShadowMapSize returns 1024 for mobile device', () => {
    const size = resolveShadowMapSize(true);
    expect(size).toBe(1024);
  });

  it('[Facet-1/Boundary] resolveShadowMapSize returns 2048 for desktop device', () => {
    const size = resolveShadowMapSize(false);
    expect(size).toBe(2048);
  });

  it('[Facet-4/ErrorDefense] resolveShadowMapSize defaults to 2048 when isMobile is undefined', () => {
    const size = resolveShadowMapSize(undefined);
    expect(size).toBe(2048);
  });
});

describe('[IMP-121][Trạm 1] Bot Pacing Indicator Contract', () => {
  const mockPlayers = {
    p1: { id: 'p1', name: 'Đại Gia Sài Gòn', isBot: false },
    bot_2: { id: 'bot_2', name: 'Hoàng Nam', isBot: true },
    bot_3: { id: 'bot_3', name: 'Bảo Trâm', isBot: true },
    bot_4: { id: 'bot_4', name: 'Minh Tuấn', isBot: true },
  };

  // Facet 2: State Reactivity
  it('[Facet-2/StateReactivity] resolveBotPacingStatus returns null when it is local player turn', () => {
    const status = resolveBotPacingStatus('p1', 'p1', mockPlayers);
    expect(status).toBeNull();
  });

  it('[Facet-2/StateReactivity] resolveBotPacingStatus returns correct bot info for active bot', () => {
    const status = resolveBotPacingStatus('bot_2', 'p1', mockPlayers);
    expect(status).not.toBeNull();
    expect(status?.botName).toBe('Hoàng Nam');
    expect(status?.botOrder).toBe(1);
    expect(status?.totalBots).toBe(3);
    expect(status?.displayText).toContain('Hoàng Nam');
  });

  it('[Facet-2/StateReactivity] resolveBotPacingStatus calculates correct bot order for 2nd and 3rd bots', () => {
    const statusBot3 = resolveBotPacingStatus('bot_3', 'p1', mockPlayers);
    expect(statusBot3?.botOrder).toBe(2);
    expect(statusBot3?.totalBots).toBe(3);

    const statusBot4 = resolveBotPacingStatus('bot_4', 'p1', mockPlayers);
    expect(statusBot4?.botOrder).toBe(3);
    expect(statusBot4?.totalBots).toBe(3);
  });

  // Facet 4: Error Defense
  it('[Facet-4/ErrorDefense] resolveBotPacingStatus returns null when active player is not a bot', () => {
    const mockTwoHumans = {
      p1: { id: 'p1', name: 'Người 1', isBot: false },
      p2: { id: 'p2', name: 'Người 2', isBot: false },
    };
    const status = resolveBotPacingStatus('p2', 'p1', mockTwoHumans);
    expect(status).toBeNull();
  });

  it('[Facet-4/ErrorDefense] resolveBotPacingStatus handles empty or undefined playersInfo gracefully', () => {
    const status = resolveBotPacingStatus('bot_2', 'p1', {});
    expect(status).toBeNull();
  });
});

describe('[IMP-121][Trạm 1] Telemetry Intent Context Contract', () => {
  beforeEach(() => {
    useTelemetryStore.getState().reset();
  });

  // Facet 1: Boundary
  it('[Facet-1/Boundary] buildIntentTelemetryContext identifies standard first roll', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [2, 5],
      consecutiveDoubles: 0,
      balance: 10000,
      position: 4,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(false);
    expect(ctx.buttonLabel).toBe('Đổ Xúc Xắc');
    expect(ctx.note).toBeUndefined();
  });

  it('[Facet-1/Boundary] buildIntentTelemetryContext identifies doubles follow-up roll', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_ROLL',
      dice: [4, 4],
      consecutiveDoubles: 1,
      balance: 9500,
      position: 8,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(true);
    expect(ctx.buttonLabel).toBe('Đổ Tiếp (Đôi)');
    expect(ctx.note).toBe('DOUBLES_FOLLOWUP_ROLL');
  });

  // Facet 2: State Reactivity
  it('[Facet-2/StateReactivity] recordIntent stores full context alongside intent', () => {
    const testContext: RecordedIntentContext = {
      buttonLabel: 'Đổ Tiếp (Đôi)',
      isDoublesRoll: true,
      consecutiveDoubles: 1,
      dice: [3, 3],
      position: 12,
      balance: 5000,
      note: 'DOUBLES_FOLLOWUP_ROLL',
    };

    useTelemetryStore.getState().recordIntent('p1', { type: 'INTENT_ROLL' }, testContext);

    const recorded = useTelemetryStore.getState().recordedIntents;
    expect(recorded.length).toBe(1);
    expect(recorded[0]?.playerId).toBe('p1');
    expect(recorded[0]?.context).toEqual(testContext);
    expect(recorded[0]?.context?.isDoublesRoll).toBe(true);
  });

  // Facet 3: Resource Disposal
  it('[Facet-3/ResourceDisposal] recordIntent maintains FIFO cap of 100 items with context', () => {
    for (let i = 0; i < 110; i++) {
      useTelemetryStore.getState().recordIntent('p1', { type: 'INTENT_BID', amount: i }, {
        balance: 1000 + i,
        position: i % 40,
      });
    }

    const recorded = useTelemetryStore.getState().recordedIntents;
    expect(recorded.length).toBe(100);
    // Item đầu tiên phải là item thứ 10 (index 10)
    expect((recorded[0]?.intent as { amount: number }).amount).toBe(10);
    // Item cuối cùng phải là item thứ 109
    expect((recorded[99]?.intent as { amount: number }).amount).toBe(109);
  });

  it('[Facet-3/ResourceDisposal] reset resets recordedIntents with context cleanly', () => {
    useTelemetryStore.getState().recordIntent('p1', { type: 'INTENT_ROLL' }, { isDoublesRoll: false });
    expect(useTelemetryStore.getState().recordedIntents.length).toBe(1);

    useTelemetryStore.getState().reset();
    expect(useTelemetryStore.getState().recordedIntents.length).toBe(0);
  });

  // Facet 4: Error Defense
  it('[Facet-4/ErrorDefense] recordIntent operates safely without context (backward compatibility)', () => {
    useTelemetryStore.getState().recordIntent('p1', { type: 'INTENT_END_TURN' });

    const recorded = useTelemetryStore.getState().recordedIntents;
    expect(recorded.length).toBe(1);
    expect(recorded[0]?.playerId).toBe('p1');
    expect(recorded[0]?.context).toBeUndefined();
  });

  it('[Facet-4/ErrorDefense] buildIntentTelemetryContext handles non-roll intents safely', () => {
    const ctx = buildIntentTelemetryContext({
      intentType: 'INTENT_BUY_PROPERTY',
      dice: [1, 2],
      consecutiveDoubles: 0,
      balance: 3000,
      position: 15,
      currentTurnPlayerId: 'p1',
      localPlayerId: 'p1',
    });
    expect(ctx.isDoublesRoll).toBe(false);
    expect(ctx.buttonLabel).toBeUndefined();
    expect(ctx.note).toBeUndefined();
  });
});

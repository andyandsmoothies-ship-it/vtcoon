// [UC-GAME-018/MSS][TC-NET05/MSS] Social Emotes WebSocket Protocol & Security Tests
import { describe, it, expect, vi } from 'vitest';
import { EnvelopeValidator } from '../../src/server/security/envelope_validator';
import { handleWsMessage, type WsMessageHandlerContext } from '../../src/client/network/use_game_ws';
import type { WsServerMessage } from '../../src/server/network/network_types';

describe('[TC-NET05.1/MSS] EnvelopeValidator — EMOTE Message Validation', () => {
  const validator = new EnvelopeValidator();

  it('Chap nhan message EMOTE hop le voi day du roomCode, playerId va emoteId chuan', () => {
    const validRaw = JSON.stringify({
      type: 'EMOTE',
      roomCode: 'VT8888',
      playerId: 'p1',
      emoteId: 'laugh',
    });

    const res = validator.parseAndValidate(validRaw);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.message.type).toBe('EMOTE');
      if (res.message.type === 'EMOTE') {
        expect(res.message.roomCode).toBe('VT8888');
        expect(res.message.playerId).toBe('p1');
        expect(res.message.emoteId).toBe('laugh');
      }
    }
  });

  it('Chap nhan tat ca 5 emoteId chuan: laugh, cry, burn_money, heart, rage', () => {
    const validIds = ['laugh', 'cry', 'burn_money', 'heart', 'rage'];
    for (const emoteId of validIds) {
      const res = validator.parseAndValidate(
        JSON.stringify({ type: 'EMOTE', roomCode: 'ROOM1', playerId: 'p1', emoteId })
      );
      expect(res.success).toBe(true);
    }
  });

  it('[Adversarial] Tu choi emoteId khong nam trong danh muc chuan', () => {
    const invalidRaw = JSON.stringify({
      type: 'EMOTE',
      roomCode: 'VT8888',
      playerId: 'p1',
      emoteId: 'invalid_alien_face',
    });

    const res = validator.parseAndValidate(invalidRaw);
    expect(res.success).toBe(false);
    if (!res.success && !res.ignore) {
      expect(res.reasonCode).toBe('INVALID_ENVELOPE');
    }
  });

  it('[Adversarial] Tu choi message thieu roomCode hoac playerId', () => {
    const missingRoom = JSON.stringify({ type: 'EMOTE', playerId: 'p1', emoteId: 'cry' });
    expect(validator.parseAndValidate(missingRoom).success).toBe(false);

    const missingPlayer = JSON.stringify({ type: 'EMOTE', roomCode: 'VT8888', emoteId: 'cry' });
    expect(validator.parseAndValidate(missingPlayer).success).toBe(false);

    const emptyRoom = JSON.stringify({ type: 'EMOTE', roomCode: '', playerId: 'p1', emoteId: 'cry' });
    expect(validator.parseAndValidate(emptyRoom).success).toBe(false);
  });
});

describe('[TC-NET05.2/MSS] Client handleWsMessage — PLAYER_EMOTE Dispatching', () => {
  it('Goi callback onEmote khi nhan duoc goi tin PLAYER_EMOTE tu server', () => {
    const onEmoteMock = vi.fn();
    const sendMock = vi.fn();

    const ctx: WsMessageHandlerContext = {
      roomCode: 'VT8888',
      playerId: 'p1',
      socket: { send: sendMock },
      onEmote: onEmoteMock,
    };

    const serverMsg: WsServerMessage = {
      type: 'PLAYER_EMOTE',
      playerId: 'p2',
      emoteId: 'heart',
      timestamp: 1788960000000,
    };

    handleWsMessage(serverMsg, ctx);

    expect(onEmoteMock).toHaveBeenCalledTimes(1);
    expect(onEmoteMock).toHaveBeenCalledWith('p2', 'heart', 1788960000000);
  });
});

describe('[TC-NET05.3/MSS] Live WebSocket EMOTE Broadcasting Integration', () => {
  const TEST_PORT = 3110;

  it('Phat song PLAYER_EMOTE den tat ca nguoi choi trong phong qua WebSocket that', async () => {
    const { WebSocket } = await import('ws');
    const { WssServer } = await import('../../src/server/network/wss_server.js');
    const server = new WssServer({ port: TEST_PORT });

    const openSocket = (): Promise<InstanceType<typeof WebSocket>> =>
      new Promise((resolve, reject) => {
        const ws = new WebSocket(`ws://localhost:${TEST_PORT}`);
        ws.once('open', () => resolve(ws));
        ws.once('error', reject);
      });

    const collectMessages = (
      socket: InstanceType<typeof WebSocket>,
      count: number,
      timeoutMs = 3000,
    ): Promise<WsServerMessage[]> =>
      new Promise((resolve, reject) => {
        const msgs: WsServerMessage[] = [];
        const timer = setTimeout(() => {
          reject(new Error(`Timeout: Nhan duoc ${msgs.length}/${count} messages`));
        }, timeoutMs);

        const onMsg = (data: Buffer | string): void => {
          msgs.push(JSON.parse(data.toString()) as WsServerMessage);
          if (msgs.length === count) {
            clearTimeout(timer);
            socket.off('message', onMsg);
            resolve(msgs);
          }
        };
        socket.on('message', onMsg);
      });

    const ws1 = await openSocket();
    const ws2 = await openSocket();

    try {
      // 1. ws1 tao phong
      const p1Init = collectMessages(ws1, 2);
      ws1.send(JSON.stringify({ type: 'CREATE_ROOM', playerId: 'p1' }));
      const [createMsg] = await p1Init;
      expect(createMsg?.type).toBe('ROOM_CREATED');
      const roomCode = (createMsg as { roomCode: string }).roomCode;

      // 2. ws2 tham gia phong
      const p2Init = collectMessages(ws2, 2);
      ws2.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, playerId: 'p2' }));
      await p2Init;

      // 3. ws1 gui EMOTE "burn_money"
      const p1EmotePromise = collectMessages(ws1, 1);
      const p2EmotePromise = collectMessages(ws2, 1);

      ws1.send(JSON.stringify({
        type: 'EMOTE',
        roomCode,
        playerId: 'p1',
        emoteId: 'burn_money',
      }));

      const [p1Recv] = await p1EmotePromise;
      const [p2Recv] = await p2EmotePromise;

      // Ca 2 nguoi choi trong phong deu nhan duoc PLAYER_EMOTE
      expect(p1Recv?.type).toBe('PLAYER_EMOTE');
      expect((p1Recv as { emoteId: string }).emoteId).toBe('burn_money');
      expect((p1Recv as { playerId: string }).playerId).toBe('p1');

      expect(p2Recv?.type).toBe('PLAYER_EMOTE');
      expect((p2Recv as { emoteId: string }).emoteId).toBe('burn_money');
      expect((p2Recv as { playerId: string }).playerId).toBe('p1');
    } finally {
      ws1.close();
      ws2.close();
      await server.close();
    }
  });
});

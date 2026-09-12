// [UI-06/MSS][TC-NET02/MSS] Widget & Markup Tests: Sảnh Chờ (Lobby Screen Components)
// Nguồn: docs/epics/networking/_epic_ledger.md § Slice NET-02
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { useLobbyStore } from '../../src/client/store/lobby_store';
import { PlayerSlotCard } from '../../src/client/ui/lobby/player_slot_card';
import { QrCodeCard } from '../../src/client/ui/lobby/qr_code_card';
import { LobbyView } from '../../src/client/ui/lobby/lobby_view';
import { createEmptySlot } from '../../src/client/store/lobby_types';
import { BotPersonality } from '../../src/domain/bot/bot_engine';

describe('[UI-06.1/MSS] PlayerSlotCard Component Markup', () => {
  it('Hiển thị đúng vị trí trống và nút Thêm Bot AI cho Host', () => {
    const emptySlot = createEmptySlot(1);
    const element = React.createElement(PlayerSlotCard, {
      slot: emptySlot,
      isHostViewer: true,
      onToggleBot: () => {},
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('data-testid="lobby-slot-1-empty"');
    expect(html).toContain('Trống');
    expect(html).toContain('data-testid="add-bot-slot-1-btn"');
    expect(html).toContain('+ Thêm Bot AI');
  });

  it('Hiển thị đúng thông tin Host với biểu tượng vương miện', () => {
    const hostSlot = {
      ...createEmptySlot(0),
      playerId: 'p1',
      playerName: 'Chủ Sảnh Hà Nội',
      isHost: true,
      isReady: true,
      isOccupied: true,
    };
    const element = React.createElement(PlayerSlotCard, {
      slot: hostSlot,
      isHostViewer: true,
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('data-testid="lobby-slot-0-occupied"');
    expect(html).toContain('Chủ Phòng');
    expect(html).toContain('Chủ Sảnh Hà Nội');
  });

  it('Hiển thị thẻ Bot AI với tính cách và nút đổi vòng quanh (cycle)', () => {
    const botSlot = {
      ...createEmptySlot(2),
      playerId: 'bot_3',
      playerName: 'Bot AI 3 (Aggressive)',
      isBot: true,
      isReady: true,
      botPersonality: BotPersonality.Aggressive,
      isOccupied: true,
    };
    const element = React.createElement(PlayerSlotCard, {
      slot: botSlot,
      isHostViewer: true,
      onToggleBot: () => {},
      onCycleBotPersonality: () => {},
    });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('data-testid="lobby-slot-2-occupied"');
    expect(html).toContain('Bot AI');
    expect(html).toContain('Hiếu Chiến');
    expect(html).toContain('data-testid="cycle-bot-2-btn"');
    expect(html).toContain('data-testid="remove-bot-slot-2-btn"');
  });
});

describe('[UI-06.2/MSS] QrCodeCard Component Markup', () => {
  it('Hiển thị khối QR Code với mã phòng và nút sao chép liên kết', () => {
    const element = React.createElement(QrCodeCard, { roomCode: 'HN9999' });
    const html = renderToStaticMarkup(element);
    expect(html).toContain('Mã QR Mời Bạn Bè');
    expect(html).toContain('data-testid="copy-invite-link-btn"');
    expect(html).toContain('Sao Chép Liên Kết Mời');
  });
});

describe('[UI-06.3/MSS] LobbyView Full Screen Markup', () => {
  beforeEach(() => {
    useLobbyStore.getState().resetLobby();
  });

  it('Render màn hình Host đầy đủ 4 slots, mã phòng 6 ký tự và nút Bắt Đầu', () => {
    useLobbyStore.getState().initLobby('SG8888', 'h1', true, 'Đại Gia P1');
    const state = useLobbyStore.getState();
    const element = React.createElement(LobbyView, {
      roomCode: state.roomCode ?? undefined,
      isHost: state.isHost,
      slots: state.slots,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('VTCOON');
    expect(html).toContain('data-testid="toggle-lobby-panel-btn"');
    expect(html).toContain('data-testid="lobby-room-code"');
    expect(html).toContain('SG8888');
    expect(html).toContain('data-testid="lobby-slots-grid"');
    expect(html).toContain('data-testid="start-game-btn"');
    expect(html).toContain('data-testid="leave-lobby-btn"');
  });

  it('Render màn hình Guest hiển thị nút Sẵn Sàng thay vì Bắt Đầu', () => {
    useLobbyStore.getState().initLobby('SG8888', 'g2', false, 'Khách Mời P2');
    const state = useLobbyStore.getState();
    const element = React.createElement(LobbyView, {
      roomCode: state.roomCode ?? undefined,
      isHost: state.isHost,
      slots: state.slots,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-testid="toggle-ready-btn"');
    expect(html).toContain('SẴN SÀNG');
    expect(html).not.toContain('data-testid="start-game-btn"');
  });

  it('Render thẻ Tóm Tắt Thể Lệ Thi Đấu với vốn 15.000 Tr., 30 vòng và điều kiện thắng', () => {
    useLobbyStore.getState().initLobby('HN1234', 'h1', true, 'Host');
    const state = useLobbyStore.getState();
    const element = React.createElement(LobbyView, {
      roomCode: state.roomCode ?? undefined,
      isHost: state.isHost,
      slots: state.slots,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-testid="lobby-rules-card"');
    expect(html).toContain('Tóm Tắt Thể Lệ Thi Đấu');
    expect(html).toContain('15.000 Tr. VNĐ');
    expect(html).toContain('30 vòng');
    expect(html).toContain('+2.000 Tr. VNĐ');
    expect(html).toContain('Điều kiện thắng');
  });

  it('Render màn hình với 3 Bot AI hiển thị đầy đủ thẻ (4/4) và nút Bắt Đầu sẵn sàng', () => {
    useLobbyStore.getState().initLobby('VT8888', 'p1', true, 'Đại Gia Chủ Sảnh P1');
    useLobbyStore.getState().toggleBotSlot(1, BotPersonality.Balanced);
    useLobbyStore.getState().toggleBotSlot(2, BotPersonality.Aggressive);
    useLobbyStore.getState().toggleBotSlot(3, BotPersonality.Passive);

    const state = useLobbyStore.getState();
    const element = React.createElement(LobbyView, {
      roomCode: state.roomCode ?? undefined,
      isHost: state.isHost,
      slots: state.slots,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('Danh Sách Người Chơi (4/4)');
    expect(html).toContain('data-testid="lobby-slot-1-occupied"');
    expect(html).toContain('data-testid="lobby-slot-2-occupied"');
    expect(html).toContain('data-testid="lobby-slot-3-occupied"');
    expect(html).toContain('data-testid="start-game-btn"');
    expect(html).toContain('BẮT ĐẦU TRẬN ĐẤU');
  });

  it('Render nút chuyển/tắt âm thanh sảnh chờ lobby-mute-toggle-button', () => {
    useLobbyStore.getState().initLobby('VT7777', 'p1', true, 'Chủ Sảnh');
    const state = useLobbyStore.getState();
    const element = React.createElement(LobbyView, {
      roomCode: state.roomCode ?? undefined,
      isHost: state.isHost,
      slots: state.slots,
    });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('data-testid="lobby-mute-toggle-button"');
    expect(html).toContain('data-testid="toggle-lobby-panel-btn"');
  });
});

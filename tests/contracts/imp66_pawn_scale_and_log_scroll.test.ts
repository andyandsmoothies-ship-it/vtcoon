// [TC-IMP66.1/MSS] Test Suite: IMP-66 Pawn Scale Normalization & Auto-Scroll Activity Feed
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  LUXURY_PAWN_CONFIGS,
  LuxuryPawnModel,
  getPawnConfigBySlot,
} from '../../src/client/3d/luxury_pawn_models';
import { PlayerCard } from '../../src/client/ui/player_card';
import {
  ActivityFeedSidebar,
  shouldShowScrollBottom,
} from '../../src/client/ui/activity_feed_sidebar';
import type { PlayerHudInfo } from '../../src/client/store/game_store_types';

describe('[TC-IMP66.1/MSS] 3D Luxury Pawn Stature & Icon Normalization', () => {
  it('LUXURY_PAWN_CONFIGS định nghĩa đầy đủ 4 quân cờ với icon emoji và cấu hình scale', () => {
    expect(LUXURY_PAWN_CONFIGS).toHaveLength(4);

    const expectedIcons = ['🏰', '💣', '🐎', '👑'];
    for (let i = 0; i < 4; i++) {
      const cfg = LUXURY_PAWN_CONFIGS[i];
      expect(cfg).toBeDefined();
      expect(cfg?.icon).toBe(expectedIcons[i]);
      expect(Array.isArray(cfg?.scale)).toBe(true);
      expect(cfg?.scale).toHaveLength(3);
    }
  });

  it('Các quân cờ có cấu hình scale đồng bộ [1.0, 1.0, 1.0]', () => {
    for (let i = 0; i < 4; i++) {
      const cfg = LUXURY_PAWN_CONFIGS[i]!;
      expect(Array.from(cfg.scale)).toEqual([1.0, 1.0, 1.0]);
    }
  });

  it('getPawnConfigBySlot trả về đúng cấu hình hoặc fallback an toàn', () => {
    expect(getPawnConfigBySlot(0).name).toContain('Xe');
    expect(getPawnConfigBySlot(1).icon).toBe('💣');
    expect(getPawnConfigBySlot(2).icon).toBe('🐎');
    expect(getPawnConfigBySlot(3).icon).toBe('👑');
    expect(getPawnConfigBySlot(99).icon).toBe('🏰'); // Fallback slot 0
  });

  it('LuxuryPawnModel render an toàn với scale mới cho toàn bộ 4 slots', () => {
    for (let i = 0; i < 4; i++) {
      const html = renderToStaticMarkup(React.createElement(LuxuryPawnModel, { slotIndex: i }));
      expect(html).toContain('scale="0.625,0.625,0.625"');
    }
  });
});

describe('[TC-IMP66.2/MSS] 2D PlayerCard Tactile Pawn Avatars', () => {
  const mockPlayer: PlayerHudInfo = {
    id: 'p1',
    name: 'Đại Gia Chủ Sảnh (P1)',
    balance: 15000,
    tokenColor: '#DC2626',
    ownedProperties: [],
  };

  const mockBot: PlayerHudInfo = {
    id: 'bot_3',
    name: 'Bot AI 3 (Aggressive)',
    balance: 15000,
    tokenColor: '#10B981',
    ownedProperties: [],
    isBot: true,
  };

  it('PlayerCard hiển thị huy hiệu quân cờ lớn (32px) thay vì chỉ chấm tròn nhỏ', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockPlayer,
        isCurrentTurn: true,
        levelMap: {},
        slotIndex: 0,
      })
    );

    expect(html).toContain('data-testid="player-pawn-badge-p1"');
    expect(html).toContain('🏰'); // Host pawn icon (Xe chiến)
    expect(html).toContain('w-8 h-8'); // Kích thước lớn 32px
  });

  it('PlayerCard của Bot cũng hiển thị huy hiệu quân cờ to rõ ràng tương ứng theo slot', () => {
    const html = renderToStaticMarkup(
      React.createElement(PlayerCard, {
        player: mockBot,
        isCurrentTurn: false,
        levelMap: {},
        slotIndex: 2,
      })
    );

    expect(html).toContain('data-testid="player-pawn-badge-bot_3"');
    expect(html).toContain('🐎'); // Ngựa bạc icon cho slot 2
    expect(html).toContain('w-8 h-8');
    expect(html).toContain('BOT');
  });
});

describe('[TC-IMP66.3/MSS] ActivityFeedSidebar Auto-Scroll to Bottom', () => {
  it('shouldShowScrollBottom xác định đúng khi người dùng đang cuộn lên trên', () => {
    // Đang ở đáy: scrollTop + clientHeight >= scrollHeight - 60
    expect(shouldShowScrollBottom(400, 500, 100)).toBe(false);

    // Đang cuộn lên trên cách đáy 150px
    expect(shouldShowScrollBottom(200, 500, 100)).toBe(true);
  });

  it('ActivityFeedSidebar render đầy đủ container nhật ký và nút cuộn đáy khi cần', () => {
    const html = renderToStaticMarkup(
      React.createElement(ActivityFeedSidebar, {
        isOpen: true,
        logs: [
          { id: '1', timestamp: Date.now(), type: 'system', message: 'Ván đấu bắt đầu' },
          { id: '2', timestamp: Date.now(), type: 'dice', message: 'P1 đổ 8 điểm' },
        ],
      })
    );

    expect(html).toContain('data-testid="activity-log-list"');
    expect(html).toContain('data-testid="activity-log-bottom-anchor"');
  });
});

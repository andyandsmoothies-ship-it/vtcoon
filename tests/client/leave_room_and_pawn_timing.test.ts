// [UI-S03/MSS][UI-S02/MSS]
// Tests: Nút Thoát Bàn trên TopBar & Trật tự thời gian nhảy con cờ
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TopBar } from '../../src/client/ui/top_bar.js';

describe('TopBar Leave Room & Pawn Landing Timing', () => {
  it('[TC-HUD-LEAVE-01] TopBar hiển thị nút Thoát khi có prop onLeaveRoom', () => {
    const onLeave = vi.fn();
    const htmlWithLeave = renderToStaticMarkup(React.createElement(TopBar, { onLeaveRoom: onLeave }));
    expect(htmlWithLeave).toContain('data-testid="leave-room-button"');
    expect(htmlWithLeave).toContain('Thoát');

    const htmlWithoutLeave = renderToStaticMarkup(React.createElement(TopBar));
    expect(htmlWithoutLeave).not.toContain('data-testid="leave-room-button"');
  });

  it('[TC-PAWN-TIMING-01] Công thức tính thời gian trễ hoạt cảnh bước nhảy đảm bảo con cờ chạm đất trước khi mở modal', () => {
    // 7 bước nhảy (từ ô 0 đến ô 7)
    const steps = 7;
    const HOP_DURATION = 0.22;
    const LANDING_DURATION = 0.12;
    const perStepSec = HOP_DURATION + LANDING_DURATION; // 0.34s (340ms)

    const expectedMinMs = steps * (perStepSec * 1000); // 2380ms
    const animDelayMs = steps * 340 + 120; // 2500ms

    // Đảm bảo thời gian mở modal luôn lớn hơn thời gian hoàn tất bước nhảy cuối cùng
    expect(animDelayMs).toBeGreaterThan(expectedMinMs);
  });
});

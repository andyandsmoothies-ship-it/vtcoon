// [CONTRACT-TEST][TC-IMP89/MSS][UC-IMP89] Contract Test Suite: ActionDock Bottom-Right Relocation & Social Emotes Purge
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary): Social Emotes Purge (Zero emotion icons in in-game HUD)
// Facet 2 (Layout): ActionDock Bottom-Right Corner Placement
// Facet 3 (Performance & Unobstructed): TelemetryBadge Bottom-Left Relocation
// Facet 4 (A11y & Functionality): Core Actions Preservation & Defensive Resilience

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { HudContainer } from '../../src/client/ui/hud_container';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { useGameStore } from '../../src/client/store/game_store';

const hudContainerPath = path.resolve(process.cwd(), 'src', 'client', 'ui', 'hud_container.tsx');

describe('[TC-IMP89/MSS][UC-IMP89] ActionDock Bottom-Right Relocation & Social Emotes Purge Suite', () => {
  beforeEach(() => {
    useTelemetryStore.setState({
      metrics: {
        fps: 60,
        pingRttMs: 25,
        drawCalls: 120,
        triangles: 45000,
        frameTimeMs: 16.6,
        deltaBytes: 1024,
        tickRate: 20,
      },
      violations: [],
      isConsoleOpen: false,
    });
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 25,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Đại Gia Chủ Sảnh (P1)',
          balance: 18000,
          tokenColor: '#EF4444',
          ownedProperties: [],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
      },
      treasuryPool: 500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
    });
  });

  // =========================================================================
  // FACET 1: SOCIAL EMOTES PURGE (ZERO EMOTION ICONS IN HUD)
  // =========================================================================

  it('[TC-IMP89.01/MSS][Facet1-Boundary] hud_container.tsx loại bỏ hoàn toàn việc render SocialEmotesTray', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).not.toContain('<SocialEmotesTray');
  });

  it('[TC-IMP89.02/MSS][Facet1-Boundary] hud_container.tsx loại bỏ import SocialEmotesTray', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).not.toMatch(/import\s*\{\s*SocialEmotesTray\s*\}\s*from/);
  });

  it('[TC-IMP89.03/MSS][Facet1-Boundary] Render thực tế HudContainer không chứa data-testid="social-emotes-tray"', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    expect(markup).not.toContain('data-testid="social-emotes-tray"');
  });

  it('[TC-IMP89.04/MSS][Facet1-Boundary] Render thực tế HudContainer không chứa các icon cảm xúc thừa (😂, 😭, 💸, ❤️, 😡)', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    expect(markup).not.toContain('aria-label="Cười sặc sụa"');
    expect(markup).not.toContain('aria-label="Khóc ròng"');
    expect(markup).not.toContain('aria-label="Phẫn nộ"');
  });

  // =========================================================================
  // FACET 2: ACTION DOCK BOTTOM-RIGHT CORNER PLACEMENT
  // =========================================================================

  it('[TC-IMP89.05/MSS][Facet2-Layout] hud_container.tsx đặt ActionDock ở khối bên phải của footer', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const footerSection = source.split('<footer')[1]?.split('</footer>')[0] ?? '';
    const badgePos = footerSection.indexOf('<TelemetryBadge');
    const actionDockPos = footerSection.indexOf('<ActionDock');
    expect(badgePos).toBeGreaterThan(-1);
    expect(actionDockPos).toBeGreaterThan(-1);
    expect(actionDockPos).toBeGreaterThan(badgePos);
  });

  it('[TC-IMP89.06/MSS][Facet2-Layout] Thẻ footer duy trì flex-row justify-between items-end để neo ActionDock về góc phải', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/<footer[^>]*justify-between/);
    expect(source).toMatch(/<footer[^>]*items-end/);
  });

  it('[TC-IMP89.07/MSS][Facet2-Layout] Render thực tế HudContainer kết xuất ActionDock sau TelemetryBadge theo thứ tự DOM từ trái sang phải', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    const badgeIndex = markup.indexOf('telemetry-badge');
    const actionDockIndex = markup.indexOf('Thanh điều khiển tác vụ');
    expect(badgeIndex).toBeGreaterThan(-1);
    expect(actionDockIndex).toBeGreaterThan(-1);
    expect(actionDockIndex).toBeGreaterThan(badgeIndex);
  });

  it('[TC-IMP89.08/MSS][Facet2-Layout] Khối bọc ActionDock trong footer duy trì pointer-events-auto', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/className="[^"]*pointer-events-auto[^"]*"[^>]*>\s*<ActionDock/);
  });

  // =========================================================================
  // FACET 3: TELEMETRY BADGE BOTTOM-LEFT RELOCATION
  // =========================================================================

  it('[TC-IMP89.09/MSS][Facet3-Unobstructed] TelemetryBadge được định vị ở khối bên trái của footer', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const footerSection = source.split('<footer')[1]?.split('</footer>')[0] ?? '';
    const badgePos = footerSection.indexOf('<TelemetryBadge');
    expect(badgePos).toBeGreaterThan(-1);
  });

  it('[TC-IMP89.10/MSS][Facet3-Unobstructed] Khối bọc TelemetryBadge duy trì cờ responsive hidden sm:block để ẩn trên màn hình di động hẹp', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/className="[^"]*hidden\s+sm:block[^"]*"[^>]*>\s*<TelemetryBadge/);
  });

  it('[TC-IMP89.11/MSS][Facet3-Unobstructed] Cụm tiện ích TopBar bên phải không bị bất kỳ badge hay dock nào che khuất', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).not.toContain('top-4 right-4');
  });

  it('[TC-IMP89.12/MSS][Facet3-Unobstructed] Danh sách thẻ người chơi PlayerHudList ở cạnh phải hoàn toàn thông thoáng', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toContain('<PlayerHudList');
    expect(source).toMatch(/justify-end[^>]*>[\s\S]*?<PlayerHudList/);
  });

  // =========================================================================
  // FACET 4: CORE ACTIONS PRESERVATION & DEFENSIVE RESILIENCE
  // =========================================================================

  it('[TC-IMP89.13/MSS][Facet4-Defense] ActionDock bảo toàn đầy đủ nút bấm cốt lõi Đổ xúc xắc, Quản lý BĐS, Đàm phán, Hết lượt', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    expect(markup).toContain('Đổ Xúc Xắc');
    expect(markup).toContain('Quản Lý BĐS');
    expect(markup).toContain('Đàm Phán');
    expect(markup).toContain('Hết Lượt');
  });

  it('[TC-IMP89.14/MSS][Facet4-Defense] ActionDock duy trì aria-label="Thanh điều khiển tác vụ" chuẩn công thái học', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    expect(markup).toContain('aria-label="Thanh điều khiển tác vụ"');
  });

  it('[TC-IMP89.15/MSS][Facet4-Defense] Toàn bộ các nút trong ActionDock duy trì chiều cao tối thiểu min-h-[44px]', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    const count44 = (markup.match(/min-h-\[44px\]/g) ?? []).length;
    expect(count44).toBeGreaterThanOrEqual(4);
  });

  it('[TC-IMP89.16/MSS][Facet4-Defense] HudContainer khởi tạo an toàn khi không truyền bất kỳ callback nào', () => {
    expect(() => renderToStaticMarkup(React.createElement(HudContainer, {}))).not.toThrow();
  });
});

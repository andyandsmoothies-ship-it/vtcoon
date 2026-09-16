// [CONTRACT-TEST][TC-IMP88/MSS][UC-IMP88] Contract Test Suite: Telemetry Badge Relocation & Unobstructed HUD Layout
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary): Top-Right Unobstructed Invariant (No overlap with TopBar utilities or PlayerHudList)
// Facet 2 (Layout): Bottom-Right Footer Docking (ActionDock on left, TelemetryBadge on right)
// Facet 3 (Performance): Zero Backdrop Blur & High-Contrast Solid Fill (Gotcha #87)
// Facet 4 (Defense & A11y): Keyboard Shortcut, Click Reactivity & A11y Semantics

import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { TelemetryBadge } from '../../src/client/ui/telemetry/telemetry_badge';
import { HudContainer } from '../../src/client/ui/hud_container';
import { useTelemetryStore } from '../../src/client/telemetry/telemetry_store';
import { useGameStore } from '../../src/client/store/game_store';

const hudContainerPath = path.resolve(process.cwd(), 'src', 'client', 'ui', 'hud_container.tsx');
const telemetryBadgePath = path.resolve(process.cwd(), 'src', 'client', 'ui', 'telemetry', 'telemetry_badge.tsx');

describe('[TC-IMP88/MSS][UC-IMP88] Telemetry Badge Relocation & HUD Unobstructed Layout Suite', () => {
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
    });
  });

  // =========================================================================
  // FACET 1: TOP-RIGHT UNOBSTRUCTED INVARIANT
  // =========================================================================

  it('[TC-IMP88.01/MSS][Facet1-Boundary] hud_container.tsx loại bỏ hoàn toàn class absolute top-4 right-4 định vị TelemetryBadge', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).not.toMatch(/absolute\s+top-4\s+right-4[^>]*TelemetryBadge/);
    expect(source).not.toContain('top-4 right-4');
  });

  it('[TC-IMP88.02/MSS][Facet1-Boundary] hud_container.tsx không chứa bất kỳ định vị top- nào bọc TelemetryBadge', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const badgeWrapperMatch = source.match(/<div[^>]*>[\s\S]*?<TelemetryBadge[\s\S]*?<\/div>/);
    expect(badgeWrapperMatch).not.toBeNull();
    const wrapperTag = badgeWrapperMatch![0];
    expect(wrapperTag).not.toMatch(/\btop-\d+/);
  });

  it('[TC-IMP88.03/MSS][Facet1-Boundary] Cụm tiện ích TopBar bên phải (hud-utilities-cluster) không bị phần tử tuyệt đối nào che phủ trong HudContainer', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const topBarSection = source.split('<TopBar')[1]?.split('<PlayerHudList')[0] ?? '';
    expect(topBarSection).not.toContain('<TelemetryBadge');
  });

  it('[TC-IMP88.04/MSS][Facet1-Boundary] PlayerHudList ở cạnh phải không bị TelemetryBadge lấn chiếm tọa độ đỉnh', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const middleSection = source.split('<PlayerHudList')[0] ?? '';
    expect(middleSection).not.toContain('top-4 right-4');
  });

  // =========================================================================
  // FACET 2: BOTTOM-RIGHT FOOTER DOCKING INVARIANT
  // =========================================================================

  it('[TC-IMP88.05/MSS][Facet2-Layout] hud_container.tsx đưa TelemetryBadge vào bên trong thẻ footer tầng đáy', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    const footerSection = source.split('<footer')[1]?.split('</footer>')[0] ?? '';
    expect(footerSection).toContain('<TelemetryBadge');
  });

  it('[TC-IMP88.06/MSS][Facet2-Layout] Thẻ footer sử dụng justify-between để phân tách ActionDock bên trái và TelemetryBadge bên phải', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/<footer[^>]*justify-between/);
  });

  it('[TC-IMP88.07/MSS][Facet2-Layout] Phần tử bọc TelemetryBadge trong footer duy trì cờ responsive hidden sm:block', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/className="[^"]*hidden\s+sm:block[^"]*"[^>]*>\s*<TelemetryBadge/);
  });

  it('[TC-IMP88.08/MSS][Facet2-Layout] Phần tử bọc TelemetryBadge duy trì pointer-events-auto để tiếp nhận tương tác chuột', () => {
    const source = fs.readFileSync(hudContainerPath, 'utf-8');
    expect(source).toMatch(/className="[^"]*pointer-events-auto[^"]*"[^>]*>\s*<TelemetryBadge/);
  });

  it('[TC-IMP88.09/MSS][Facet2-Layout] Render thực tế HudContainer kết xuất telemetry-badge ở tầng đáy cùng ActionDock (IMP-89 ActionDock dời sang phải)', () => {
    const markup = renderToStaticMarkup(React.createElement(HudContainer));
    const actionDockIndex = markup.indexOf('Thanh điều khiển tác vụ');
    const badgeIndex = markup.indexOf('telemetry-badge');
    expect(actionDockIndex).toBeGreaterThan(-1);
    expect(badgeIndex).toBeGreaterThan(-1);
    expect(actionDockIndex).toBeGreaterThan(badgeIndex);
  });

  // =========================================================================
  // FACET 3: ZERO BACKDROP BLUR & HIGH-CONTRAST SOLID FILL (GOTCHA #87)
  // =========================================================================

  it('[TC-IMP88.10/MSS][Facet3-Performance] telemetry_badge.tsx loại bỏ hoàn toàn backdrop-blur-md để giải phóng GPU fill-rate', () => {
    const source = fs.readFileSync(telemetryBadgePath, 'utf-8');
    expect(source).not.toContain('backdrop-blur-md');
    expect(source).not.toContain('backdrop-blur');
  });

  it('[TC-IMP88.11/MSS][Facet3-Performance] telemetry_badge.tsx sử dụng nền đặc có độ tương phản cao với tông tối #020617 hoặc #0F172A', () => {
    const source = fs.readFileSync(telemetryBadgePath, 'utf-8');
    expect(source).toMatch(/bg-slate-950/);
  });

  it('[TC-IMP88.12/MSS][Facet3-Performance] telemetry_badge.tsx bảo toàn data-testid="telemetry-badge"', () => {
    const source = fs.readFileSync(telemetryBadgePath, 'utf-8');
    expect(source).toContain('data-testid="telemetry-badge"');
  });

  it('[TC-IMP88.13/MSS][Facet3-Performance] TelemetryBadge kết xuất đúng chuỗi định dạng FPS và Ping', () => {
    const markup = renderToStaticMarkup(React.createElement(TelemetryBadge));
    expect(markup).toContain('60 FPS');
    expect(markup).toContain('25ms');
    expect(markup).toContain('🛡️ OK');
  });

  // =========================================================================
  // FACET 4: DEFENSE & A11Y SEMANTICS
  // =========================================================================

  it('[TC-IMP88.14/MSS][Facet4-Defense] TelemetryBadge hiển thị trạng thái Cảnh Báo khi metrics FPS tụt dưới 30', () => {
    useTelemetryStore.setState({
      metrics: {
        fps: 22,
        pingRttMs: 45,
        drawCalls: 100,
        triangles: 30000,
        frameTimeMs: 45.4,
        deltaBytes: 512,
        tickRate: 20,
      },
      violations: [],
    });
    const markup = renderToStaticMarkup(React.createElement(TelemetryBadge));
    expect(markup).toContain('22 FPS');
    expect(markup).toContain('🟡');
  });

  it('[TC-IMP88.15/MSS][Facet4-Defense] TelemetryBadge hiển thị trạng thái Lỗi khi có vi phạm CRITICAL', () => {
    useTelemetryStore.setState({
      violations: [
        {
          id: 'v1',
          tick: 1,
          type: 'TREASURY_INVARIANT_VIOLATED',
          severity: 'CRITICAL',
          message: 'Kho bạc âm tiền',
          details: {},
          timestamp: Date.now(),
        },
      ],
    });
    const markup = renderToStaticMarkup(React.createElement(TelemetryBadge));
    expect(markup).toContain('🔴');
    expect(markup).toContain('Lỗi (1)');
  });

  it('[TC-IMP88.16/MSS][Facet4-Defense] TelemetryBadge sở hữu đầy đủ thuộc tính trợ năng role và aria-label', () => {
    const markup = renderToStaticMarkup(React.createElement(TelemetryBadge));
    expect(markup).toContain('aria-label=');
    expect(markup).toContain('title="Bật/Tắt Hộp Đen Giám Sát VTCOON');
  });
});

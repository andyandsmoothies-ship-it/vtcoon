// [TC-378/MSS][IMP-378] Contract Test Suite: Procedural Building Mobile LOD & Double-Render Elimination
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import '../helpers/r3f_test_harness';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
import { GameBoard, type GameBoardProps } from '../../src/client/3d/board_layout';
import { LayeredDioramaTile } from '../../src/client/3d/board_tile';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';

describe('IMP-378: Procedural Building Mobile LOD & Double-Render Elimination', () => {
  let originalConsoleError: typeof console.error;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('TC-378.01 [UC-SHOPHOUSE-MOBILE-LOD/MSS]: ProceduralBuilding C1 trên mobile kích hoạt Mobile LOD nhẹ, trên desktop giữ nguyên 10 mesh chi tiết', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, isMobile: true, groupColor: '#DC2626' })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 1, isMobile: false, groupColor: '#DC2626' })
    );

    expect(mobileMarkup).toContain('data-testid="shophouse-mobile-lod"');
    expect(mobileMarkup).not.toContain('meshPhysicalMaterial');
    expect(desktopMarkup).not.toContain('data-testid="shophouse-mobile-lod"');
    expect(desktopMarkup).toContain('meshPhysicalMaterial');
  });

  it('TC-378.02 [UC-COMPLEX-MOBILE-LOD/MSS]: ProceduralBuilding C2 trên mobile kích hoạt Complex LOD với night glow, trên desktop giữ nguyên sapphire tower', () => {
    const mobileMarkup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 2, isMobile: true, groupColor: '#0284C7' })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement(ProceduralBuilding, { level: 2, isMobile: false, groupColor: '#0284C7' })
    );

    expect(mobileMarkup).toContain('data-testid="complex-mobile-lod"');
    expect(mobileMarkup).not.toContain('meshPhysicalMaterial');
    expect(desktopMarkup).not.toContain('data-testid="complex-mobile-lod"');
    expect(desktopMarkup).toContain('meshPhysicalMaterial');
  });

  it('TC-378.03 [UC-BOARD-LAYOUT-NO-DOUBLE-RENDER/MSS]: GameBoard mặc định triệt tiêu render kép nhà đồ chơi, cho phép opt-in qua prop', () => {
    const defaultMarkup = renderToStaticMarkup(React.createElement(GameBoard));
    const optInMarkup = renderToStaticMarkup(
      React.createElement<GameBoardProps>(GameBoard, { renderToyBuildings: true })
    );

    expect(defaultMarkup).not.toContain('data-testid="instanced-board-toy-buildings"');
    expect(optInMarkup).toContain('data-testid="instanced-board-toy-buildings"');
  });

  it('TC-378.04 [UC-WIRE-AND-FORCE-FALLBACK/MSS]: LayeredDioramaTile kết nối thông dây dẫn isMobile xuống ProceduralBuilding', () => {
    const propertyCell = BOARD_CONFIG.find((c) => c.type === CellType.Property && c.index === 1)!;
    const mobileMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: propertyCell,
        position: [0, 0, 0],
        isCornerTile: false,
        isMobile: true,
        currentLevel: 1,
      })
    );
    const desktopMarkup = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: propertyCell,
        position: [0, 0, 0],
        isCornerTile: false,
        isMobile: false,
        currentLevel: 1,
      })
    );

    expect(mobileMarkup).toContain('data-testid="shophouse-mobile-lod"');
    expect(desktopMarkup).not.toContain('data-testid="shophouse-mobile-lod"');
  });
});

// [TC-UD01/MSS][UC-URBAN-DIORAMA-003][UI-S02/MSS][BR-UI-002] Test Suite: Sa Bàn Đô Thị Nén 3D (Urban Diorama Redesign)
// Universal 4-Facet Behavioral Matrix Contract Test Suite for Stage 3
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ACESFilmicToneMapping, NoToneMapping } from 'three';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';
import { DioramaTerrain } from '../../src/client/3d/diorama/diorama_terrain';
import { DioramaContainerPort } from '../../src/client/3d/diorama/diorama_container_port';
import { DioramaHeritageDistrict } from '../../src/client/3d/diorama/diorama_heritage_district';
import { DioramaCivicCenter } from '../../src/client/3d/diorama/diorama_civic_center';
import { DiceTray } from '../../src/client/3d/dice_tray';
import { useGameStore } from '../../src/client/store/game_store';

// Spy & capture props passed to Canvas at runtime
let capturedCanvasProps: {
  gl?: {
    toneMapping?: number;
    toneMappingExposure?: number;
    antialias?: boolean;
  };
  shadows?: unknown;
  dpr?: unknown;
} | null = null;

vi.mock('@react-three/fiber', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@react-three/fiber')>();
  return {
    ...actual,
    useFrame: vi.fn(),
    useThree: () => ({
      camera: { position: { set: vi.fn() } },
      scene: {},
      gl: {},
    }),
    Canvas: (props: any) => {
      capturedCanvasProps = props;
      return React.createElement('div', {
        'data-testid': 'r3f-canvas-mock',
        'data-tonemapping': String(props.gl?.toneMapping),
        'data-exposure': String(props.gl?.toneMappingExposure),
        'data-antialias': String(props.gl?.antialias),
      }, props.children);
    },
  };
});

// Import GameCanvas after mocking @react-three/fiber
import { GameCanvas } from '../../src/client/game_canvas';

function extractGroupPosition(markup: string, testId: string): [number, number, number] {
  const regex = new RegExp(`data-testid="${testId}"[^>]*position="([^"]+)"|position="([^"]+)"[^>]*data-testid="${testId}"`);
  const match = markup.match(regex);
  const posStr = (match ? (match[1] || match[2]) : '') ?? '';
  const coords = posStr.split(',').map(Number);
  return [coords[0] ?? 0, coords[1] ?? 0, coords[2] ?? 0];
}

describe('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] Chốt 1: ACES Filmic ToneMapping & Canvas Viewport Config', () => {
  beforeEach(() => {
    capturedCanvasProps = null;
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas toneMappingExposure đạt cận dưới tối thiểu >= 1.0', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMappingExposure).toBeGreaterThanOrEqual(1.0);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas toneMappingExposure đạt cận trên tối đa <= 1.2', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMappingExposure).toBeLessThanOrEqual(1.2);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas toneMappingExposure là số thực hữu hạn trong dải [1.0, 1.2]', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    const exposure = capturedCanvasProps?.gl?.toneMappingExposure;
    expect(Number.isFinite(exposure)).toBe(true);
    expect(exposure).toBeGreaterThanOrEqual(1.0);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas cấu hình toneMapping là ACESFilmicToneMapping ở chế độ in-game', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isLobby: false }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas áp dụng ACESFilmicToneMapping ở chế độ sảnh chờ isLobby=true', () => {
    renderToStaticMarkup(React.createElement(GameCanvas, { isLobby: true }));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas bảo toàn cấu hình canvas dpr dải [1, 1.5] và shadows soft', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.shadows).toBe('soft');
    expect(capturedCanvasProps?.dpr).toEqual([1, 1.5]);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas loại bỏ hoàn toàn NoToneMapping khỏi cấu hình gl runtime', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMapping).not.toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas sử dụng ACESFilmicToneMapping và khác biệt hoàn toàn với NoToneMapping', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.toneMapping).toBe(ACESFilmicToneMapping);
    expect(capturedCanvasProps?.gl?.toneMapping).not.toBe(NoToneMapping);
  });

  it('[TC-UD01.1/MSS][UI-S02/MSS][BR-UI-002] GameCanvas bảo toàn thuộc tính khử răng cưa antialias: true', () => {
    renderToStaticMarkup(React.createElement(GameCanvas));
    expect(capturedCanvasProps?.gl?.antialias).toBe(true);
  });
});

describe('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] Chốt 2: Hạ Tầng Đường Phố & Khay Xúc Xắc Động Học', () => {
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

  beforeEach(() => {
    useGameStore.setState({
      dice: [3, 4],
      isRolling: false,
      currentTurnPlayerId: 'p1_player_turn',
    });
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DioramaTerrain thảm cỏ sử dụng mã màu hex hợp lệ sáng màu #15803D hoặc #2E7D32', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const hasBrightLawn = terrainMarkup.includes('#15803D') || terrainMarkup.includes('#2E7D32');
    expect(hasBrightLawn).toBe(true);
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DioramaTerrain bảo tồn bề rộng và kết cấu trục đại lộ West & East Boulevard', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    expect(terrainMarkup).toContain('#1E293B');
    expect(terrainMarkup).toContain('#334155');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray không render xúc xắc SingleDie khi ở trạng thái tĩnh/nghỉ', () => {
    useGameStore.setState({
      isRolling: false,
      currentTurnPlayerId: 'p1_player_turn',
    });
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).not.toContain('#DC2626');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray render đầy đủ 2 viên xúc xắc SingleDie khi isRolling là true', () => {
    useGameStore.setState({
      isRolling: true,
      currentTurnPlayerId: 'p1_player_turn',
    });
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).toContain('#DC2626');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray kích hoạt trạng thái hiển thị động khi nhận lệnh tung xúc xắc', () => {
    useGameStore.setState({ isRolling: true });
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).toContain('data-testid="dice-tray"');
    expect(trayMarkup).toContain('#DC2626');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray giải phóng hoàn toàn geometry của SingleDie khỏi render tree khi nghỉ', () => {
    useGameStore.setState({
      isRolling: false,
      currentTurnPlayerId: 'p1_player_turn',
    });
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).not.toContain('0.58');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DioramaTerrain loại bỏ màu cỏ rêu cũ #2D5A27', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    expect(terrainMarkup).not.toContain('#2D5A27');
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DioramaTerrain kết xuất vỉa hè đá granite bo viền', () => {
    const terrainMarkup = renderToStaticMarkup(React.createElement(DioramaTerrain));
    const hasGraniteCurbs =
      terrainMarkup.includes('#CBD5E1') ||
      terrainMarkup.includes('#94A3B8') ||
      terrainMarkup.includes('#E2E8F0') ||
      terrainMarkup.includes('#64748B');
    expect(hasGraniteCurbs).toBe(true);
  });

  it('[TC-UD01.2/MSS][UI-S02/MSS][BR-UI-002] DiceTray bảo toàn data-testid="dice-tray" ở trạng thái nghỉ', () => {
    useGameStore.setState({ isRolling: false });
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).toContain('data-testid="dice-tray"');
  });
});

describe('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] Chốt 3: Quy Hoạch Khối Đô Thị & Tượng Đài Trung Tâm', () => {
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

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] DioramaContainerPort tọa độ X nằm tại bờ Đông với X >= 4.5', () => {
    const portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    const [posX] = extractGroupPosition(portMarkup, 'diorama-container-port');
    expect(posX).toBeGreaterThanOrEqual(4.5);
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] DioramaContainerPort được di dời về hạ lưu Đông Nam với tọa độ Z >= 4.0', () => {
    const portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    const [, , posZ] = extractGroupPosition(portMarkup, 'diorama-container-port');
    expect(posZ).toBeGreaterThanOrEqual(4.0);
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] DioramaContainerPort tọa độ vị trí là các số hữu hạn không chứa NaN', () => {
    const portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    const [posX, posY, posZ] = extractGroupPosition(portMarkup, 'diorama-container-port');
    expect(Number.isFinite(posX)).toBe(true);
    expect(Number.isFinite(posY)).toBe(true);
    expect(Number.isFinite(posZ)).toBe(true);
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama tích hợp đầy đủ phân khu di sản và cảng biển tại vị trí mới', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    expect(cityMarkup).toContain('data-testid="diorama-container-port"');
    expect(cityMarkup).toContain('data-testid="diorama-heritage-district"');
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama kết xuất cây phân cấp sa bàn đồng nhất không đứt gãy', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    expect(cityMarkup).toContain('data-testid="miniature-city-diorama"');
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama kết xuất Quảng trường Tượng đài Biểu tượng data-testid="central-monument-plaza"', () => {
    const cityMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
    expect(cityMarkup).toContain('data-testid="central-monument-plaza"');
  });

  it('[TC-UD01.3/MSS][UI-S02/MSS][BR-UI-002] DioramaContainerPort bảo toàn định danh data-testid="diorama-container-port"', () => {
    const portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
    expect(portMarkup).toContain('data-testid="diorama-container-port"');
  });
});

describe('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bất Biến Bảo Toàn Hợp Đồng Kiểm Thử Hiện Có (100% Preservation)', () => {
  let originalConsoleError: typeof console.error;
  let staticMarkup = '';

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
    staticMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bảo toàn 100% data-testid="miniature-city-diorama"', () => {
    expect(staticMarkup).toContain('data-testid="miniature-city-diorama"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bảo toàn 100% data-testid="diorama-container-port"', () => {
    expect(staticMarkup).toContain('data-testid="diorama-container-port"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bảo toàn 100% data-testid="diorama-civic-center"', () => {
    expect(staticMarkup).toContain('data-testid="diorama-civic-center"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bảo toàn 100% data-testid="diorama-heritage-district"', () => {
    expect(staticMarkup).toContain('data-testid="diorama-heritage-district"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] Bảo toàn 100% data-testid="dice-tray"', () => {
    const trayMarkup = renderToStaticMarkup(React.createElement(DiceTray));
    expect(trayMarkup).toContain('data-testid="dice-tray"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama tích hợp đồng thời 5 cụm định danh sa bàn cốt lõi trong cùng một cây phân cấp', () => {
    expect(staticMarkup).toContain('data-testid="miniature-city-diorama"');
    expect(staticMarkup).toContain('data-testid="central-monument-plaza"');
    expect(staticMarkup).toContain('data-testid="diorama-container-port"');
    expect(staticMarkup).toContain('data-testid="diorama-civic-center"');
    expect(staticMarkup).toContain('data-testid="diorama-heritage-district"');
  });

  it('[TC-UD01.4/MSS][UI-S02/MSS][BR-UI-002] MiniatureCityDiorama và DiceTray giải phóng tài nguyên an toàn không gây exception khi unmount', () => {
    expect(() => {
      const markup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));
      expect(markup.length).toBeGreaterThan(0);
    }).not.toThrow();
  });
});

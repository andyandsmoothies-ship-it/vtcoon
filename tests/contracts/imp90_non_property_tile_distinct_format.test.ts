// [CONTRACT-TEST][TC-IMP90/MSS][UC-IMP90] Contract Test Suite: Non-Property Tiles Distinct Format & Semantic Hierarchy
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary): Header Color Band Elimination on Non-Property Tiles
// Facet 2 (Typography): Charcoal #0F172A Text on Ivory Parchment vs White Bold on Property Banners
// Facet 3 (Footer Differentiation): Purchasable Price Trays vs Action Badges
// Facet 4 (Defense & Stability): Anisotropy, Cache Management & Boundary Defense

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getTileTexture,
  clearTileTextureCache,
} from '../../src/client/3d/tile_texture_generator';
import { isPropertyTile } from '../../src/client/3d/tile_texture_data';

interface RecordedFillRect {
  x: number;
  y: number;
  w: number;
  h: number;
  fillStyle: string;
}

interface RecordedFillText {
  text: string;
  x: number;
  y: number;
  font: string;
  fillStyle: string;
}

interface RecordedStrokeText {
  text: string;
  x: number;
  y: number;
  font: string;
  strokeStyle: string;
  lineWidth: number;
}

interface RecordedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  strokeStyle: string;
  lineWidth: number;
}

interface MockCanvasRenderingContext2D {
  canvas: { width: number; height: number };
  save: ReturnType<typeof vi.fn>;
  restore: ReturnType<typeof vi.fn>;
  beginPath: ReturnType<typeof vi.fn>;
  closePath: ReturnType<typeof vi.fn>;
  clip: ReturnType<typeof vi.fn>;
  fill: ReturnType<typeof vi.fn>;
  stroke: ReturnType<typeof vi.fn>;
  scale: ReturnType<typeof vi.fn>;
  translate: ReturnType<typeof vi.fn>;
  moveTo: ReturnType<typeof vi.fn>;
  lineTo: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
  rect: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  strokeRect: ReturnType<typeof vi.fn>;
  roundRect: ReturnType<typeof vi.fn>;
  arc: ReturnType<typeof vi.fn>;
  quadraticCurveTo: ReturnType<typeof vi.fn>;
  bezierCurveTo: ReturnType<typeof vi.fn>;
  ellipse: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
  font: string;
  textAlign: string;
  textBaseline: string;
  fillText: ReturnType<typeof vi.fn>;
  strokeText: ReturnType<typeof vi.fn>;
}

interface MockCanvasElement {
  width: number;
  height: number;
  getContext: (type: string) => MockCanvasRenderingContext2D | null;
}

interface MockDocument {
  createElement: (tagName: string) => MockCanvasElement | Record<string, unknown>;
}

interface MockGlobal {
  document?: unknown;
}

const mockEnv = globalThis as MockGlobal;

const PROPERTY_INDICES = [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39];
const NON_PROPERTY_INDICES = [2, 4, 5, 7, 12, 15, 17, 22, 25, 28, 33, 35, 36, 38];
const INFRASTRUCTURE_INDICES = [5, 12, 15, 25, 28, 35];
const SPECIAL_EVENT_INDICES = [2, 4, 7, 17, 22, 33, 36, 38];

describe('[TC-IMP90/MSS][UC-IMP90] Non-Property Tiles Distinct Format & Semantic Hierarchy Suite', () => {
  let originalDocument: unknown;
  let recordedFillRects: RecordedFillRect[] = [];
  let recordedFillTexts: RecordedFillText[] = [];
  let recordedStrokeTexts: RecordedStrokeText[] = [];
  let currentFont = '';
  let currentFillStyle = '';
  let currentStrokeStyle = '';
  let currentLineWidth = 1;
  let lastMoveTo: [number, number] = [0, 0];
  let recordedLines: RecordedLine[] = [];

  beforeEach(() => {
    originalDocument = mockEnv.document;
    recordedFillRects = [];
    recordedFillTexts = [];
    recordedStrokeTexts = [];
    recordedLines = [];
    currentFont = '';
    currentFillStyle = '';
    currentStrokeStyle = '';
    currentLineWidth = 1;
    clearTileTextureCache();

    const mockCtx: MockCanvasRenderingContext2D = {
      canvas: { width: 1024, height: 1360 },
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      moveTo: vi.fn((x: number, y: number) => {
        lastMoveTo = [x, y];
      }),
      lineTo: vi.fn((x: number, y: number) => {
        recordedLines.push({
          x1: lastMoveTo[0],
          y1: lastMoveTo[1],
          x2: x,
          y2: y,
          strokeStyle: currentStrokeStyle,
          lineWidth: currentLineWidth,
        });
      }),
      drawImage: vi.fn(),
      rect: vi.fn(),
      fillRect: vi.fn((x: number, y: number, w: number, h: number) => {
        recordedFillRects.push({ x, y, w, h, fillStyle: currentFillStyle });
      }),
      strokeRect: vi.fn(),
      roundRect: vi.fn(),
      arc: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      ellipse: vi.fn(),
      clearRect: vi.fn(),
      set fillStyle(val: string) {
        currentFillStyle = val;
      },
      get fillStyle() {
        return currentFillStyle;
      },
      set strokeStyle(val: string) {
        currentStrokeStyle = val;
      },
      get strokeStyle() {
        return currentStrokeStyle;
      },
      set lineWidth(val: number) {
        currentLineWidth = val;
      },
      get lineWidth() {
        return currentLineWidth;
      },
      set font(val: string) {
        currentFont = val;
      },
      get font() {
        return currentFont;
      },
      textAlign: 'center',
      textBaseline: 'middle',
      fillText: vi.fn((text: string, x: number, y: number) => {
        recordedFillTexts.push({
          text,
          x,
          y,
          font: currentFont,
          fillStyle: currentFillStyle,
        });
      }),
      strokeText: vi.fn((text: string, x: number, y: number) => {
        recordedStrokeTexts.push({
          text,
          x,
          y,
          font: currentFont,
          strokeStyle: currentStrokeStyle,
          lineWidth: currentLineWidth,
        });
      }),
    };

    const mockCanvas: MockCanvasElement = {
      width: 1024,
      height: 1360,
      getContext: vi.fn((type: string) => {
        if (type === '2d') return mockCtx;
        return null;
      }),
    };

    const mockDoc: MockDocument = {
      createElement: vi.fn((tagName: string) => {
        if (tagName === 'canvas') return mockCanvas;
        return {};
      }),
    };

    mockEnv.document = mockDoc;
  });

  afterEach(() => {
    mockEnv.document = originalDocument;
    clearTileTextureCache();
  });

  // =========================================================================
  // FACET 1: BOUNDARY & HEADER COLOR BAND ELIMINATION
  // =========================================================================

  it.each(NON_PROPERTY_INDICES)(
    '[TC-90.01/MSS][Facet1-Boundary] Ô phi nhà đất %i hoàn toàn KHÔNG có dải băng màu 56px ở header',
    (idx) => {
      getTileTexture(idx);
      const bannerFill = recordedFillRects.find(
        (r) => r.x === 0 && r.y === 0 && r.w === 256 && r.h === 56 && r.fillStyle !== '#F3EEDF'
      );
      expect(bannerFill).toBeUndefined();
    }
  );

  it.each(PROPERTY_INDICES)(
    '[TC-90.02/MSS][Facet1-Boundary] Ô nhà đất %i BẢO TOÀN việc vẽ dải băng màu 56px ở header',
    (idx) => {
      getTileTexture(idx);
      const bannerFill = recordedFillRects.find(
        (r) => r.x === 0 && r.y === 0 && r.w === 256 && r.h === 56 && r.fillStyle !== '#F3EEDF'
      );
      expect(bannerFill).toBeDefined();
    }
  );

  it.each(Array.from({ length: 40 }, (_, i) => i))(
    '[TC-90.03/MSS][Facet1-Boundary] isPropertyTile xác định chính xác ô %i',
    (i) => {
      const expected = PROPERTY_INDICES.includes(i);
      expect(isPropertyTile(i)).toBe(expected);
    }
  );

  it.each([0, 10, 20, 30])(
    '[TC-90.04/MSS][Facet1-Boundary] Ô góc %i bảo toàn kết xuất canvas',
    (cornerIdx) => {
      const tex = getTileTexture(cornerIdx);
      expect(tex).not.toBeNull();
    }
  );

  // =========================================================================
  // FACET 2: TYPOGRAPHY & VISUAL CONTRAST
  // =========================================================================

  it.each(NON_PROPERTY_INDICES)(
    '[TC-90.05/MSS][Facet2-Typography] Ô phi nhà đất %i kết xuất tiêu đề với màu than đen #0F172A trên nền ngà',
    (idx) => {
      getTileTexture(idx);
      const titleEntry = recordedFillTexts.find((t) => t.y <= 40);
      expect(titleEntry).toBeDefined();
      expect(titleEntry?.fillStyle).toBe('#0F172A');
    }
  );

  it.each(NON_PROPERTY_INDICES)(
    '[TC-90.06/MSS][Facet2-Typography] Ô phi nhà đất %i sử dụng font in hoa đậm nét 900 24px hoặc 26px',
    (idx) => {
      getTileTexture(idx);
      const titleEntry = recordedFillTexts.find((t) => t.y <= 40);
      expect(titleEntry?.font).toMatch(/900\s+(24|26)px/);
    }
  );

  it.each(NON_PROPERTY_INDICES)(
    '[TC-90.07/MSS][Facet2-Typography] Ô phi nhà đất %i kết xuất phụ đề với màu xám slate #475569',
    (idx) => {
      getTileTexture(idx);
      const subEntry = recordedFillTexts.find((t) => t.y > 40 && t.y <= 85);
      expect(subEntry).toBeDefined();
      expect(subEntry?.fillStyle).toBe('#475569');
    }
  );

  it.each(PROPERTY_INDICES)(
    '[TC-90.08/MSS][Facet2-Typography] Ô nhà đất %i BẢO TOÀN chữ tiêu đề màu trắng #FFFFFF viền than đen',
    (idx) => {
      getTileTexture(idx);
      const titleFill = recordedFillTexts.find((t) => t.y === 28);
      expect(titleFill?.fillStyle).toBe('#FFFFFF');

      const titleStroke = recordedStrokeTexts.find((t) => t.y === 28);
      expect(titleStroke?.strokeStyle).toBe('#0F172A');
      expect(titleStroke?.lineWidth).toBeGreaterThanOrEqual(2.5);
    }
  );

  // =========================================================================
  // FACET 3: FOOTER DIFFERENTIATION (PRICE TRAY VS ACTION BADGE)
  // =========================================================================

  it.each(INFRASTRUCTURE_INDICES)(
    '[TC-90.09/MSS][Facet3-Footer] Ô hạ tầng & tiện ích %i in chữ giá tiền trực tiếp lên nền giấy ngà (IMP-104)',
    (idx) => {
      getTileTexture(idx);
      const priceEntry = recordedFillTexts.find((t) => t.y >= 270 && t.y <= 315);
      expect(priceEntry).toBeDefined();
      expect(priceEntry?.fillStyle).toBe('#0F172A');
      expect(priceEntry?.text).toMatch(/^(1\.500|2\.000)$/);
    }
  );

  it.each([7, 22, 36])(
    '[TC-90.10/MSS][Facet3-Footer] Ô Phiếu Cơ Hội %i kết xuất nhãn hành động "RÚT THẺ CƠ HỘI" ở đáy ô',
    (idx) => {
      getTileTexture(idx);
      const actionEntry = recordedFillTexts.find((t) => t.y >= 270 && t.y <= 315);
      expect(actionEntry).toBeDefined();
      expect(actionEntry?.text).toBe('RÚT THẺ CƠ HỘI');
    }
  );

  it.each([2, 17, 33])(
    '[TC-90.11/MSS][Facet3-Footer] Ô Phiếu Thị Trường %i kết xuất nhãn hành động "RÚT THẺ THỊ TRƯỜNG" ở đáy ô',
    (idx) => {
      getTileTexture(idx);
      const actionEntry = recordedFillTexts.find((t) => t.y >= 270 && t.y <= 315);
      expect(actionEntry).toBeDefined();
      expect(actionEntry?.text).toBe('RÚT THẺ THỊ TRƯỜNG');
    }
  );

  it('[TC-90.12/MSS][Facet3-Footer] Ô 04 Lệ Phí Đất kết xuất nhãn hành động "NỘP 1.000" ở đáy ô', () => {
    recordedFillTexts = [];
    clearTileTextureCache();
    getTileTexture(4);

    const actionEntry = recordedFillTexts.find((t) => t.y >= 270 && t.y <= 315);
    expect(actionEntry, 'Ô 04 Lệ Phí Đất phải có nhãn nộp phí').toBeDefined();
    expect(actionEntry?.text).toBe('NỘP 1.000');
  });

  it('[TC-90.13/MSS][Facet3-Footer] Ô 38 Sàn HOSE kết xuất nhãn hành động "1D6 ĐẶT CƯỢC" ở đáy ô', () => {
    recordedFillTexts = [];
    clearTileTextureCache();
    getTileTexture(38);

    const actionEntry = recordedFillTexts.find((t) => t.y >= 270 && t.y <= 315);
    expect(actionEntry, 'Ô 38 Sàn HOSE phải có nhãn đặt cược').toBeDefined();
    expect(actionEntry?.text).toBe('1D6 ĐẶT CƯỢC');
  });

  it.each(SPECIAL_EVENT_INDICES)(
    '[TC-90.14/MSS][Facet3-Footer] Ô sự kiện %i không kết xuất định dạng giá tiền mua đất (Tr.) gây nhầm lẫn',
    (idx) => {
      getTileTexture(idx);
      const priceEntry = recordedFillTexts.find(
        (t) => t.y >= 270 && t.y <= 315 && t.text.match(/^\d+(\.\d+)?\s+Tr\.$/)
      );
      expect(priceEntry).toBeUndefined();
    }
  );

  // =========================================================================
  // FACET 4: DEFENSE & ARCHITECTURAL STABILITY
  // =========================================================================

  it('[TC-90.15/MSS][Facet4-Defense] Ô hạ tầng/tiện ích có đường chỉ phân cách (divider) dưới header', () => {
    recordedLines = [];
    clearTileTextureCache();
    getTileTexture(5); // Long Thành

    const dividerLine = recordedLines.find((l) => l.y1 >= 75 && l.y1 <= 95 && l.y2 >= 75 && l.y2 <= 95);
    expect(dividerLine, 'Ô hạ tầng phải có đường phân cách dưới header').toBeDefined();
  });

  it('[TC-90.16/MSS][Facet4-Defense] Chỉ số ô ngoài biên 99 hoặc -1 trả về texture hợp lệ hoặc null an toàn', () => {
    expect(() => getTileTexture(99)).not.toThrow();
    expect(() => getTileTexture(-1)).not.toThrow();
  });

  it('[TC-90.17/MSS][Facet4-Defense] clearTileTextureCache giải phóng bộ nhớ texture tức thì', () => {
    const tex1 = getTileTexture(1);
    clearTileTextureCache();
    const tex2 = getTileTexture(1);
    expect(tex1).not.toBe(tex2);
  });

  it('[TC-90.18/MSS][Facet4-Defense] Texture tạo ra duy trì anisotropy 16 và LinearMipmapLinearFilter', () => {
    clearTileTextureCache();
    const tex = getTileTexture(1);
    expect(tex?.anisotropy).toBe(16);
    expect(tex?.generateMipmaps).toBe(true);
  });
});

// [TC-P1/MSS] Test Suite Giai Đoạn 1: Ánh sáng Môi trường IBL & Mặt Bàn Cờ Bo Viền (PBR Beveled Diorama)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProceduralBuilding } from '../../src/client/3d/procedural_building';
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

describe('[TC-P1.1/MSS] ProceduralBuilding — Sapphire Glass PBR & Beveled RoundedBox Meshes', () => {

  it('Cấp 2 (Cao ốc Sapphire) kết xuất meshPhysicalMaterial với ior=1.52 và roughness=0.04', () => {
    const html = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 2 }));
    expect(html).toContain('ior="1.52"');
    expect(html).toContain('roughness="0.04"');
    expect(html).toContain('extrudeGeometry'); // RoundedBox tạo ra extrudeGeometry
    expect(html).toContain('#0284C7'); // Màu Sapphire Blue
  });

  it('Cấp 3 (Landmark Hoàng Kim) kết xuất Sapphire glass ior=1.52 trên cửa sổ và Skybridge', () => {
    const html = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 3 }));
    expect(html).toContain('ior="1.52"');
    expect(html).toContain('roughness="0.04"');
    expect(html).toContain('#38BDF8'); // Skybridge Cyan/Sapphire
    expect(html).toContain('#F59E0B'); // Gold accents
    expect(html).toContain('extrudeGeometry'); // RoundedBox tháp đôi
  });

  it('Cấp 1 (Nhà phố Đông Dương) kết xuất RoundedBox bo mép chân móng và thân nhà', () => {
    const html = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 1 }));
    expect(html).toContain('extrudeGeometry');
    expect(html).toContain('#FEF3C7');
    expect(html).toContain('#451A03');
  });

  it('[Adversarial] Cấp 0 (Đất trống) không kết xuất RoundedBox extrudeGeometry hay kính Sapphire', () => {
    const html = renderToStaticMarkup(React.createElement(ProceduralBuilding, { level: 0 }));
    expect(html).not.toContain('ior="1.52"');
    expect(html).not.toContain('extrudeGeometry');
    expect(html).toContain('#DC2626');
  });
});

describe('[TC-P1.2/MSS] Board Layout & Tile Base — Beveled RoundedBox & Champagne Gold Bezels', () => {
  it('board_layout.tsx sử dụng RoundedBox radius=0.08 smoothness=4 cho kè đá promenade', () => {
    const boardPath = path.resolve(process.cwd(), 'src/client/3d/board_layout.tsx');
    const source = fs.readFileSync(boardPath, 'utf-8');
    expect(source).toContain("import { RoundedBox } from '@react-three/drei';");
    expect(source).toContain('radius={0.08}');
    expect(source).toContain('smoothness={4}');
    expect(source).toContain('args={[21.4, 0.24, 21.4]}');
  });

  it('board_layout.tsx bổ sung nẹp kim loại vàng Champagne viền ngoài và viền trong của 40 ô cờ', () => {
    const boardPath = path.resolve(process.cwd(), 'src/client/3d/board_layout.tsx');
    const source = fs.readFileSync(boardPath, 'utf-8');
    expect(source).toContain('args={[20.72, 0.04, 20.72]}');
    expect(source).toContain('args={[15.88, 0.042, 15.88]}');
    expect(source).toContain('metalness={0.95}');
    expect(source).toContain('envMapIntensity={1.8}');
  });

  it('board_tile.tsx sử dụng RoundedBox radius=0.08 smoothness=4 cho cả ô góc và ô thường', () => {
    const tilePath = path.resolve(process.cwd(), 'src/client/3d/board_tile.tsx');
    const source = fs.readFileSync(tilePath, 'utf-8');
    expect(source).toContain("RoundedBox } from '@react-three/drei';");
    expect(source).toContain('<RoundedBox args={[2.2, 0.22, 2.2]} radius={0.08} smoothness={4}');
    expect(source).toContain('<RoundedBox args={[1.68, 0.2, 2.2]} radius={0.08} smoothness={4}');
    expect(source).toContain('envMapIntensity={1.2}');
    expect(source).toContain('envMapIntensity={1.0}');
  });

  it('[Architecture & Safety] Khung kè promenade và nẹp kim loại không được che lấp mặt hồ và thảm cỏ trung tâm', () => {
    const boardPath = path.resolve(process.cwd(), 'src/client/3d/board_layout.tsx');
    const source = fs.readFileSync(boardPath, 'utf-8');
    // Promenade rim top = Y + height/2 = -0.16 + 0.12 = -0.04 (phải thấp hơn mặt cỏ Y=0.00 và mặt nước Y=0.05)
    expect(source).toContain('position={[0, -0.16, 0]}');
    // Bezels top = -0.045 + 0.02 = -0.025 (phải nằm dưới mặt cỏ Y=0.00)
    expect(source).toContain('position={[0, -0.045, 0]}');
  });
});

describe('[TC-P1.3/MSS] IBL Environment & Atmosphere Balancing', () => {
  it('game_canvas.tsx duy trì Environment preset="city" bọc trong Suspense cho phản chiếu IBL', () => {
    const canvasPath = path.resolve(process.cwd(), 'src/client/game_canvas.tsx');
    const source = fs.readFileSync(canvasPath, 'utf-8');
    expect(source).toContain('<Environment preset="city" />');
  });

  it('time_of_day_lighting.tsx điều tiết scene.environmentIntensity giữa ngày, hoàng hôn và ban đêm không dùng dirty cast', () => {
    const lightingPath = path.resolve(process.cwd(), 'src/client/3d/time_of_day_lighting.tsx');
    const source = fs.readFileSync(lightingPath, 'utf-8');
    expect(source).toContain('environmentIntensity');
    expect(source).toContain("phase === 'night' ? 0.16 : phase === 'sunset' ? 0.28 : 0.75");
    expect(source).not.toContain('(state.scene as any)');
  });
});

describe('[TC-P1.4/MSS] LayeredDioramaTile Runtime Markup — Beveled ExtrudeGeometry & PBR', () => {
  it('Ô góc (Corner Tile) kết xuất RoundedBox extrudeGeometry và vật liệu PBR đá slate sẫm bóng', async () => {
    const { LayeredDioramaTile } = await import('../../src/client/3d/board_tile');
    const { BOARD_CONFIG } = await import('../../src/domain/board_config');
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: BOARD_CONFIG[0]!,
        position: [0, 0, 0],
        currentLevel: 0,
        isCornerTile: true,
      })
    );
    expect(html).toContain('extrudeGeometry');
    expect(html).toContain('#1E293B');
    expect(html).toContain('envMapIntensity="1.2"');
  });

  it('Ô thường (Normal Tile) kết xuất RoundedBox extrudeGeometry và vật liệu PBR ngà sứ', async () => {
    const { LayeredDioramaTile } = await import('../../src/client/3d/board_tile');
    const { BOARD_CONFIG } = await import('../../src/domain/board_config');
    const html = renderToStaticMarkup(
      React.createElement(LayeredDioramaTile, {
        cell: BOARD_CONFIG[1]!,
        position: [0, 0, 0],
        currentLevel: 1,
        isCornerTile: false,
      })
    );
    expect(html).toContain('extrudeGeometry');
    expect(html).toContain('#EDE5D8');
    expect(html).toContain('envMapIntensity="1"');
  });
});

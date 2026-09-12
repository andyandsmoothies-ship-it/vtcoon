// [UI-S01/MSS][UI-S04/MSS][IMP-13] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis Tests
// Endless Living Ocean, 15-degree Sloped Sand Shoreline & Layered Tropical Foliage (Step 3)
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { LayeredTropicalFoliage, TROPICAL_TREES } from '../../src/client/3d/layered_tropical_foliage';

describe('[UI-S01/MSS][IMP-13] CoastalIslandEnvironment — Structure & Visual Atmosphere Contract', () => {
  it('CoastalIslandEnvironment duoc export duoi dang React Functional Component', () => {
    expect(typeof CoastalIslandEnvironment).toBe('function');
    expect(typeof LayeredTropicalFoliage).toBe('function');
  });

  const envPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'coastal_island_environment.tsx');
  const envSource = fs.readFileSync(envPath, 'utf-8');

  const foliagePath = path.resolve(process.cwd(), 'src', 'client', '3d', 'layered_tropical_foliage.tsx');
  const foliageSource = fs.readFileSync(foliagePath, 'utf-8');

  it('Endless Living Ocean: Chua day du cac tang quang hoc, luoi song 240x240 va chu ky Gerstner', () => {
    // 1. Phan tang quang hoc dai duong: Ngoc bich -> Xanh tham dai duong -> Day vuc chan troi
    expect(envSource).toContain('#06B6D4'); // Shallow turquoise water sat bo
    expect(envSource).toContain('#0369A1'); // Ocean mid deep blue
    expect(envSource).toContain('#0284C7'); // Dynamic tropical ocean blue
    expect(envSource).toContain('#0C4A6E'); // Deep horizon ocean abyss

    // 2. Luoi song Gerstner 240x240 phu kin tam nhin camera
    expect(envSource).toContain('args={[240, 240, 96, 96]}');
    expect(envSource).toContain('computeVertexNormals');
    expect(envSource).toContain('oceanGeomRef');
    expect(envSource).toContain('Math.PI * 2 / 3.5'); // Chu ky thuy trieu boi song 3.5s
  });

  it('Sloped Sand Shoreline: Bo bien cat vang vat nghieng 15 do va loai bo hoan toan dia xam', () => {
    // 1. Chat lieu cat vang bien nhiet doi (#FDE68A, roughness: 0.85)
    expect(envSource).toContain('#FDE68A'); // Warm tropical sand tone
    expect(envSource).toContain('roughness={0.85}');

    // 2. Dai bot bien trang ven bo co gian chu ky 3.5s
    expect(envSource).toContain('#FFFFFF');
    expect(envSource).toContain('ringGeometry');

    // 3. Loai bo hoan toan dia xam nhan tao (#94A3B8) va tham co san golf phang ([21.0, 24.5, 0.22, 48])
    expect(envSource).not.toContain('#94A3B8');
    expect(envSource).not.toContain('args={[21.0, 24.5, 0.22, 48]}');

    // 4. Go vat nghieng bo cat chuan 15 do
    expect(envSource).toContain('args={[27.8, 28.85, 0.28, 64]}');
  });

  it('Layered Tropical Foliage: Cay nhiet doi 3 tang non xep lech goc gom trong InstancedMesh', () => {
    // 1. Tich hop component vao moi truong
    expect(envSource).toContain('<LayeredTropicalFoliage />');

    // 2. 3 Tang non: Xanh reu dam (#15803D) va xanh anh vang nang (#4ADE80)
    expect(foliageSource).toContain('#15803D'); // Tier 1 base cone
    expect(foliageSource).toContain('#16A34A'); // Tier 2 mid cone
    expect(foliageSource).toContain('#4ADE80'); // Tier 3 sunlit crown cone
    expect(foliageSource).toContain('#78350F'); // Than cay cong tu nhien

    // 3. Gom toan bo 32 cay vao 4 InstancedMesh giam 97.5% draw calls
    expect(foliageSource).toContain('instancedMesh');
    expect(TROPICAL_TREES.length).toBe(32);
    expect(foliageSource).toContain('Math.PI / 6'); // Goc lech tang 2 (30 do)
    expect(foliageSource).toContain('Math.PI / 3'); // Goc lech tang 3 (60 do)
  });

  it('Chua day du ha tang vien chinh: Rang nui, tau container, cau vuot & may troi', () => {
    // 1. Rang doi nui xanh bao quanh phia Bac va Dong
    expect(envSource).toContain('#166534');
    expect(envSource).toContain('#15803D');
    expect(envSource).toContain('#22C55E'); // Doi xanh phia Dong Nam

    // 2. Tau container ngoai khoi voi cac thung hang da sac
    expect(envSource).toContain('#DC2626'); // Red cargo ship hull
    expect(envSource).toContain('#10B981'); // Green container
    expect(envSource).toContain('#3B82F6'); // Blue container

    // 3. May trang xop bong benh tren bau troi
    expect(envSource).toContain('sphereGeometry');
    expect(envSource).toContain('transparent');
  });

  it('GameBoard tich hop CoastalIslandEnvironment thay the cho TabletopEnvironment', () => {
    const boardPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'board_layout.tsx');
    const boardSource = fs.readFileSync(boardPath, 'utf-8');
    expect(boardSource).toContain('<CoastalIslandEnvironment />');
    expect(boardSource).toContain("import { CoastalIslandEnvironment } from './coastal_island_environment';");
    expect(boardSource).not.toContain('<TabletopEnvironment />');
  });
});

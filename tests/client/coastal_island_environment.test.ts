// [UI-S01/MSS][UI-S04/MSS] CoastalIslandEnvironment — Vietnamese Coastal Island Metropolis Tests
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';

describe('[UI-S01/MSS] CoastalIslandEnvironment — Structure & Visual Atmosphere Contract', () => {
  it('CoastalIslandEnvironment duoc export duoi dang React Functional Component', () => {
    expect(typeof CoastalIslandEnvironment).toBe('function');
  });

  const envPath = path.resolve(process.cwd(), 'src', 'client', '3d', 'coastal_island_environment.tsx');
  const envSource = fs.readFileSync(envPath, 'utf-8');

  it('Chua day du cac thanh phan dai duong va bo bien nhiet doi Retropoly', () => {
    // 1. Dai duong ngoc bich
    expect(envSource).toContain('#0284C7'); // Ocean deep blue
    expect(envSource).toContain('#06B6D4'); // Shallow turquoise water

    // 2. Bai cat vang am ap
    expect(envSource).toContain('#F6D5A8'); // Warm tropical sand

    // 3. Them co xanh ngoc luc bao
    expect(envSource).toContain('#22C55E'); // Emerald grass plateau

    // 4. Hang cay dua nhiet doi ven bien
    expect(envSource).toContain('cylinderGeometry');
    expect(envSource).toContain('coneGeometry');

    // 5. Rang doi nui xanh bao quanh phia Bac va Dong
    expect(envSource).toContain('#166534');
    expect(envSource).toContain('#15803D');

    // 6. Tau container ngoai khoi voi cac thung hang da sac
    expect(envSource).toContain('#DC2626'); // Red cargo ship hull
    expect(envSource).toContain('#10B981'); // Green container
    expect(envSource).toContain('#3B82F6'); // Blue container

    // 7. May trang xop bong benh tren bau troi
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

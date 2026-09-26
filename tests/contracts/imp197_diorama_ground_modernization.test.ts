// [TC-197/MSS][UC-IMP197] Contract Test Suite: Diorama Ground Modernization, Clean Sky & Rooftop Toybox
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { HorizonMountainRange } from '../../src/client/3d/horizon_mountain_range';
import { DioramaSkyline } from '../../src/client/3d/diorama/diorama_skyline';
import { HIGHRISE_CONFIGS } from '../../src/client/3d/diorama/diorama_highrise_blocks';
import { MiniatureCityDiorama } from '../../src/client/3d/miniature_city_diorama';

describe('[TC-197/MSS][UC-IMP197] IMP-197 Diorama Ground Modernization Contract Suite', () => {
  let originalConsoleError: typeof console.error;
  let coastalMarkup = '';
  let horizonMarkup = '';
  let skylineMarkup = '';
  let dioramaMarkup = '';
  let poolModuleMarkup = '';
  let coastalSource = '';

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

    coastalMarkup = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
    horizonMarkup = renderToStaticMarkup(React.createElement(HorizonMountainRange));
    skylineMarkup = renderToStaticMarkup(React.createElement(DioramaSkyline));
    dioramaMarkup = renderToStaticMarkup(React.createElement(MiniatureCityDiorama));

    // Scoped extraction of residential pool module to prevent false greens from other diorama components
    const poolModuleMatch = dioramaMarkup.match(/<[^>]*data-testid="diorama-residential-pool"[\s\S]*?<\/group>/);
    poolModuleMarkup = poolModuleMatch ? poolModuleMatch[0] : '';

    const coastalPath = path.resolve(process.cwd(), 'src/client/3d/coastal_island_environment.tsx');
    coastalSource = fs.readFileSync(coastalPath, 'utf-8');
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // =========================================================================
  // FACET 1: Clean Sky Guarantee & Zero Airborne Clutter
  // =========================================================================
  describe('Facet 1: Clean Sky Guarantee & Zero Airborne Clutter', () => {
    it('[TC-197.01/MSS][UC-IMP197] CoastalIslandEnvironment khong chua boxGeometry canh may bay dan dung', () => {
      expect(coastalMarkup).not.toContain('args="3.2,0.05,0.6"');
    });

    it('[TC-197.02/MSS][UC-IMP197] CoastalIslandEnvironment khong chua cylinderGeometry than may bay dan dung', () => {
      expect(coastalMarkup).not.toContain('args="0.22,0.22,2.6,8"');
    });

    it('[TC-197.03/MSS][UC-IMP197] CoastalIslandEnvironment khong chua cum 6 may trang lo lung tang cao cy >= 19', () => {
      const hasHighAirborneClouds = /key=\{`cloud-\$\{cIdx\}`\}\s+position=\{[^}]*,\s*(?:19|2[0-9])/m.test(coastalSource);
      expect(hasHighAirborneClouds).toBe(false);
    });

    it('[TC-197.04/MSS][UC-IMP197] HorizonMountainRange khong chua cum may trang suoi suon nui', () => {
      expect(horizonMarkup).not.toContain('opacity="0.86"');
      expect(horizonMarkup).not.toContain('args="2.2,14,14"');
    });

    it('[TC-197.05/MSS][UC-IMP197] CoastalIslandEnvironment bao toan dai duong data-testid=living-ocean-water', () => {
      expect(coastalMarkup).toContain('data-testid="living-ocean-water"');
    });

    it('[TC-197.06/MSS][UC-IMP197] CoastalIslandEnvironment bao toan dan hai au data-testid=coastal-seagulls', () => {
      expect(coastalMarkup).toContain('data-testid="coastal-seagulls"');
    });
  });

  // =========================================================================
  // FACET 2: Bitexco Hero Landmark Prominence & Skyline Hierarchy
  // =========================================================================
  describe('Facet 2: Bitexco Hero Landmark Prominence & Skyline Hierarchy', () => {
    it('[TC-197.07/MSS][UC-IMP197] Bitexco trong DioramaSkyline co dinh vuon cao >= 2.85m', () => {
      expect(skylineMarkup).toContain('data-testid="bitexco-crown"');
      expect(skylineMarkup).toContain('position="0,2.85,0"');
    });

    it('[TC-197.08/MSS][UC-IMP197] Thap phu tower-4 co chieu cao khong che height <= 1.4m', () => {
      const tower = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-4');
      expect(tower?.height).toBeLessThanOrEqual(1.4);
    });

    it('[TC-197.09/MSS][UC-IMP197] Thap phu tower-5 co chieu cao khong che height <= 1.4m', () => {
      const tower = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-5');
      expect(tower?.height).toBeLessThanOrEqual(1.4);
    });

    it('[TC-197.10/MSS][UC-IMP197] Thap phu tower-6 co chieu cao khong che height <= 1.4m', () => {
      const tower = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-6');
      expect(tower?.height).toBeLessThanOrEqual(1.4);
    });

    it('[TC-197.11/MSS][UC-IMP197] Thap phu tower-7 co chieu cao khong che height <= 1.4m', () => {
      const tower = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-7');
      expect(tower?.height).toBeLessThanOrEqual(1.4);
    });

    it('[TC-197.12/MSS][UC-IMP197] Thap phu tower-8, tower-9, tower-10 co chieu cao khong che height <= 1.4m', () => {
      const t8 = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-8');
      const t9 = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-9');
      const t10 = HIGHRISE_CONFIGS.find((t) => t.id === 'tower-10');
      expect(t8?.height).toBeLessThanOrEqual(1.4);
      expect(t9?.height).toBeLessThanOrEqual(1.4);
      expect(t10?.height).toBeLessThanOrEqual(1.4);
    });

    it('[TC-197.13/MSS][UC-IMP197] Bitexco cao gap >= 2.0 lan chieu cao trung binh cac thap phu bao quanh', () => {
      const surroundingIds = ['tower-4', 'tower-5', 'tower-6', 'tower-7', 'tower-8', 'tower-9', 'tower-10'];
      const surroundingHeights = HIGHRISE_CONFIGS.filter((t) => surroundingIds.includes(t.id)).map((t) => t.height);
      const avgSurroundingHeight = surroundingHeights.reduce((sum, h) => sum + h, 0) / surroundingHeights.length;
      const bitexcoPinnacle = 2.85;
      expect(bitexcoPinnacle / avgSurroundingHeight).toBeGreaterThanOrEqual(2.0);
    });

    it('[TC-197.14/MSS][UC-IMP197] 3 thap hau canh xa (tower-1..3) tai z <= -5.8 duy tri Math.max >= 2.3m bao toan TC-70.22', () => {
      const backdrop = HIGHRISE_CONFIGS.filter((t) => ['tower-1', 'tower-2', 'tower-3'].includes(t.id));
      const maxHeight = Math.max(...backdrop.map((t) => t.height));
      expect(maxHeight).toBeGreaterThanOrEqual(2.3);
      expect(backdrop.every((t) => t.z <= -5.8)).toBe(true);
    });
  });

  // =========================================================================
  // FACET 3: Tactile Rooftop Toybox: Rooftop Infinity Pool & Helipad
  // =========================================================================
  describe('Facet 3: Tactile Rooftop Toybox: Rooftop Infinity Pool & Helipad', () => {
    it('[TC-197.15/MSS][UC-IMP197] MiniatureCityDiorama chua module to hop data-testid=diorama-residential-pool', () => {
      expect(dioramaMarkup).toContain('data-testid="diorama-residential-pool"');
    });

    it('[TC-197.16/MSS][UC-IMP197] Module dan cu co ho boi san thuong data-testid=rooftop-pool', () => {
      expect(poolModuleMarkup).toContain('data-testid="rooftop-pool"');
    });

    it('[TC-197.17/MSS][UC-IMP197] Ho boi san thuong co mau nuoc ngoc lam #0EA5E9 va vien cam thach trang', () => {
      expect(poolModuleMarkup).toContain('#0EA5E9');
      expect(poolModuleMarkup).toMatch(/(?:#FFFFFF|#F8FAFC|#F1F5F9)/);
    });

    it('[TC-197.18/MSS][UC-IMP197] San thuong co ghe tam nang nghi duong', () => {
      expect(poolModuleMarkup).toContain('data-testid="pool-sun-lounger"');
    });

    it('[TC-197.19/MSS][UC-IMP197] San thuong co du che resort nghi duong', () => {
      expect(poolModuleMarkup).toContain('data-testid="pool-resort-umbrella"');
    });

    it('[TC-197.20/MSS][UC-IMP197] San do truc thang Helipad data-testid=residential-helipad co ky hieu [H]', () => {
      expect(poolModuleMarkup).toContain('data-testid="residential-helipad"');
      expect(poolModuleMarkup).toMatch(/(?:data-testid="helipad-h-mark"|\[H\]|>H<)/);
    });

    it('[TC-197.21/MSS][UC-IMP197] Toa do mong to hop residential pool dat tai Ban dao Dong [3.2, 0.025, 0.5]', () => {
      expect(dioramaMarkup).toMatch(/<[^>]*data-testid="diorama-residential-pool"[^>]*position="3\.2,\s*0\.025,\s*0\.5"/);
    });
  });

  // =========================================================================
  // FACET 4: Day/Night Emissive Lighting Reactivity
  // =========================================================================
  describe('Facet 4: Day/Night Emissive Lighting Reactivity', () => {
    it('[TC-197.22/MSS][UC-IMP197] Mat nuoc ho boi san thuong co phan xa da quang ban dem emissive=#0284C7', () => {
      expect(poolModuleMarkup).toContain('emissive="#0284C7"');
    });

    it('[TC-197.23/MSS][UC-IMP197] Cua so va ban cong to hop toa anh sang vang am emissive=#FEF08A', () => {
      expect(poolModuleMarkup).toContain('emissive="#FEF08A"');
    });
  });

  // =========================================================================
  // FACET 5: Depth Stacking & LOC Budget Compliance
  // =========================================================================
  describe('Facet 5: Depth Stacking & LOC Budget Compliance', () => {
    it('[TC-197.24/MSS][UC-IMP197] Cao do co so mong thap cao oc dat chuan y = 0.025 (STANDEE_BASE_Y)', () => {
      const baseHeight = 0.025;
      const allAligned = HIGHRISE_CONFIGS.every((t) => t.y === baseHeight);
      expect(allAligned).toBe(true);
    });

    it('[TC-197.25/MSS][UC-IMP197] coastal_island_environment.tsx tuan thu ngan sach LOC <= 400', () => {
      const targetPath = path.resolve(process.cwd(), 'src/client/3d/coastal_island_environment.tsx');
      const loc = fs.readFileSync(targetPath, 'utf-8').split('\n').length;
      expect(loc).toBeLessThanOrEqual(400);
    });

    it('[TC-197.26/MSS][UC-IMP197] horizon_mountain_range.tsx tuan thu ngan sach LOC <= 300', () => {
      const targetPath = path.resolve(process.cwd(), 'src/client/3d/horizon_mountain_range.tsx');
      const loc = fs.readFileSync(targetPath, 'utf-8').split('\n').length;
      expect(loc).toBeLessThanOrEqual(300);
    });

    it('[TC-197.27/MSS][UC-IMP197] diorama_highrise_blocks.tsx tuan thu ngan sach LOC <= 300', () => {
      const targetPath = path.resolve(process.cwd(), 'src/client/3d/diorama/diorama_highrise_blocks.tsx');
      const loc = fs.readFileSync(targetPath, 'utf-8').split('\n').length;
      expect(loc).toBeLessThanOrEqual(300);
    });

    it('[TC-197.28/MSS][UC-IMP197] miniature_city_diorama.tsx tuan thu ngan sach LOC <= 400', () => {
      const targetPath = path.resolve(process.cwd(), 'src/client/3d/miniature_city_diorama.tsx');
      const loc = fs.readFileSync(targetPath, 'utf-8').split('\n').length;
      expect(loc).toBeLessThanOrEqual(400);
    });
  });
});

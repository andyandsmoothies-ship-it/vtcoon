// [TC-224.01/MSS..TC-224.16/MSS][UC-IMP224] Dynamic Depth of Field (DoF) Contract Suite
// Universal 5-Facet Behavioral Matrix & Detroit Style
// Ticket IMP-224: Dynamic Depth of Field — Tilt-Shift Macro Dien Anh Theo Camera State
import { describe, it, expect } from 'vitest';
import {
  calculateDofConfig,
  resolveDofTarget,
  DOF_PROFILES,
  DEFAULT_PIPELINE_CONFIG,
  PostProcessingPipeline,
} from '../../src/client/3d/post_processing_pipeline';
import { CAMERA_CONFIG } from '../../src/client/3d/camera_state_machine';
import { cellPosition } from '../../src/client/3d/board_coords';

describe('[TC-224/MSS][UC-IMP224] Dynamic Depth of Field — Contract Suite', () => {
  // =========================================================================
  // Facet 1: Overview & Motion — DoF Bat Buoc Tat (4 tests)
  // =========================================================================
  describe('Facet 1: Overview & Motion — DoF Bat Buoc Tat', () => {
    it('[TC-224.01/MSS][UC-IMP224][Facet-1/AllNullDisabled] Tat ca params null/false -> enableDof: false va bokehScale: 0.0', () => {
      const config = calculateDofConfig({
        activeModal: null,
        cameraFocusCell: null,
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(false);
      expect(config.bokehScale).toBe(0.0);
      expect(config.focusRange).toBe(320.0);
    });

    it('[TC-224.02/MSS][UC-IMP224][Facet-1/RollingPriorityOff] isRolling = true (bat ke modal hay cell) -> enableDof: false', () => {
      const configAuction = calculateDofConfig({
        isRolling: true,
        activeModal: 'auction',
        cameraFocusCell: 12,
      });
      expect(configAuction.enableDof).toBe(false);
      expect(configAuction.bokehScale).toBe(0.0);

      const configDeed = calculateDofConfig({
        isRolling: true,
        activeModal: 'deed',
        cameraFocusCell: 5,
      });
      expect(configDeed.enableDof).toBe(false);
    });

    it('[TC-224.03/MSS][UC-IMP224][Facet-1/PawnAnimatingOff] isPawnAnimating = true -> enableDof: false', () => {
      const config = calculateDofConfig({
        isPawnAnimating: true,
        cameraFocusCell: 8,
        activeModal: 'deed',
      });
      expect(config.enableDof).toBe(false);
      expect(config.bokehScale).toBe(0.0);
      expect(config.focusRange).toBe(320.0);
    });

    it('[TC-224.04/MSS][UC-IMP224][Facet-1/OverviewLegibility] activeModal = null + cameraFocusCell = null -> enableDof: false (bao toan Gotcha #54 Overview Legibility)', () => {
      const config = calculateDofConfig({
        activeModal: null,
        cameraFocusCell: null,
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(false);
      expect(config.bokehScale).toBe(0.0);
      const target = resolveDofTarget({ activeModal: null, cameraFocusCell: null });
      expect(target).toEqual([0, 0, 0]);
    });
  });

  // =========================================================================
  // Facet 2: Tile Focus — DoF Nhe & Tieu Cu Bam O Co (4 tests)
  // =========================================================================
  describe('Facet 2: Tile Focus — DoF Nhe & Tieu Cu Bam O Co', () => {
    it('[TC-224.05/MSS][UC-IMP224][Facet-2/CellFocusTileProfile] cameraFocusCell = 15 -> { enableDof: true, bokehScale: 0.28, focusRange: 9.0 }', () => {
      const config = calculateDofConfig({
        cameraFocusCell: 15,
        activeModal: null,
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(true);
      expect(config.bokehScale).toBe(0.28);
      expect(config.focusRange).toBe(9.0);
    });

    it('[TC-224.06/MSS][UC-IMP224][Facet-2/DeedModalTileProfile] activeModal = deed -> enableDof: true, bokehScale: 0.28', () => {
      const config = calculateDofConfig({
        activeModal: 'deed',
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(true);
      expect(config.bokehScale).toBe(0.28);
      expect(config.focusRange).toBe(9.0);
    });

    it('[TC-224.07/MSS][UC-IMP224][Facet-2/DynamicFocalTargetCell] resolveDofTarget({ cameraFocusCell: 10 }) tra ve toa do cellPosition(10), khong phai [0, 0, 0]', () => {
      const targetFromFocus = resolveDofTarget({ cameraFocusCell: 10 });
      const expectedCell10 = cellPosition(10);
      expect(targetFromFocus).toEqual(expectedCell10);
      expect(targetFromFocus).not.toEqual([0, 0, 0]);

      const targetFromPayload = resolveDofTarget({ modalPayload: { cellIndex: 25 } });
      expect(targetFromPayload).toEqual(cellPosition(25));
    });

    it('[TC-224.08/MSS][UC-IMP224][Facet-2/PortfolioModalTileProfile] activeModal = portfolio -> { enableDof: true, bokehScale: 0.28, focusRange: 9.0 }', () => {
      const config = calculateDofConfig({
        activeModal: 'portfolio',
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(true);
      expect(config.bokehScale).toBe(0.28);
      expect(config.focusRange).toBe(9.0);
    });
  });

  // =========================================================================
  // Facet 3: Auction Focus — DoF Vua & Buc Dau Gia Trung Tam (3 tests)
  // =========================================================================
  describe('Facet 3: Auction Focus — DoF Vua & Buc Dau Gia Trung Tam', () => {
    it('[TC-224.09/MSS][UC-IMP224][Facet-3/AuctionTheatricalProfile] activeModal = auction -> { enableDof: true, bokehScale: 0.45, focusRange: 6.0 }', () => {
      const config = calculateDofConfig({
        activeModal: 'auction',
        isRolling: false,
        isPawnAnimating: false,
      });
      expect(config.enableDof).toBe(true);
      expect(config.bokehScale).toBe(0.45);
      expect(config.focusRange).toBe(6.0);
    });

    it('[TC-224.10/MSS][UC-IMP224][Facet-3/AuctionPedestalTarget] resolveDofTarget({ activeModal: auction }) tra ve [0, 3.0, 0] (CAMERA_CONFIG.auction_focus.target)', () => {
      const target = resolveDofTarget({ activeModal: 'auction' });
      expect(target).toEqual([0, 3.0, 0]);
      expect(target).toEqual(CAMERA_CONFIG.auction_focus.target);
    });

    it('[TC-224.11/MSS][UC-IMP224][Facet-3/OpticalHierarchyContrast] So sanh tuong doi: DOF_PROFILES.auction.bokehScale (0.45) > DOF_PROFILES.tile.bokehScale (0.28) va DOF_PROFILES.auction.focusRange (6.0) < DOF_PROFILES.tile.focusRange (9.0)', () => {
      expect(DOF_PROFILES.auction.bokehScale).toBeGreaterThan(DOF_PROFILES.tile.bokehScale);
      expect(DOF_PROFILES.auction.focusRange).toBeLessThan(DOF_PROFILES.tile.focusRange);
      expect(DOF_PROFILES.off.bokehScale).toBe(0.0);
    });
  });

  // =========================================================================
  // Facet 4: Defensive Guards & Pure Function Contracts (3 tests)
  // =========================================================================
  describe('Facet 4: Defensive Guards & Pure Function Contracts', () => {
    it('[TC-224.12/MSS][UC-IMP224][Facet-4/DefensiveEmptyFallback] Goi calculateDofConfig va resolveDofTarget voi params undefined/empty -> tra ve DOF_PROFILES.off va [0, 0, 0] an toan, khong nem ngoai le', () => {
      expect(calculateDofConfig()).toEqual(DOF_PROFILES.off);
      expect(calculateDofConfig({})).toEqual(DOF_PROFILES.off);
      expect(resolveDofTarget()).toEqual([0, 0, 0]);
      expect(resolveDofTarget({})).toEqual([0, 0, 0]);
    });

    it('[TC-224.13/MSS][UC-IMP224][Facet-4/ReferentialTransparency] Tinh thuan tuy (Pure Function): Cung tham so dau vao luon sinh cung ket qua dau ra (Referential Transparency)', () => {
      const params = { activeModal: 'auction', cameraFocusCell: 12 };
      const res1 = calculateDofConfig(params);
      const res2 = calculateDofConfig(params);
      expect(res1).toEqual(res2);

      const target1 = resolveDofTarget(params);
      const target2 = resolveDofTarget(params);
      expect(target1).toEqual(target2);
    });

    it('[TC-224.14/MSS][UC-IMP224][Facet-4/BokehRangeClamping] Gia tri bokehScale hop le [0.0, 1.0] va game_over triet tieu DoF ke ca khi co cameraFocusCell', () => {
      const auctionScale = calculateDofConfig({ activeModal: 'auction' }).bokehScale;
      const tileScale = calculateDofConfig({ activeModal: 'deed' }).bokehScale;
      expect(auctionScale >= 0.0 && auctionScale <= 1.0).toBe(true);
      expect(tileScale >= 0.0 && tileScale <= 1.0).toBe(true);

      const gameOverConfig = calculateDofConfig({ activeModal: 'game_over', cameraFocusCell: 15 });
      expect(gameOverConfig).toEqual(DOF_PROFILES.off);
      expect(resolveDofTarget({ activeModal: 'game_over', cameraFocusCell: 15 })).toEqual([0, 0, 0]);
    });
  });

  // =========================================================================
  // Facet 5: Backward Compatibility & Regression Immunity (2 tests)
  // =========================================================================
  describe('Facet 5: Backward Compatibility & Regression Immunity', () => {
    it('[TC-224.15/MSS][UC-IMP224][Facet-5/DefaultDofOffIntegrity] Khong truyen enableDof -> mac dinh false (bao toan IMP-38.1)', () => {
      expect(DEFAULT_PIPELINE_CONFIG.enableDof).toBe(false);
      expect(DEFAULT_PIPELINE_CONFIG.dofBokehScale).toBe(0.0);
      const element = PostProcessingPipeline({});
      expect(element).not.toBeNull();
    });

    it('[TC-224.16/MSS][UC-IMP224][Facet-5/DisabledPipelineReturnNull] PostProcessingPipeline({ enabled: false }) tra ve null (bao toan hanh vi tat pipeline tren mobile)', () => {
      expect(PostProcessingPipeline({ enabled: false })).toBeNull();
      expect(PostProcessingPipeline({ enabled: false, enableDof: true, dofBokehScale: 0.45 })).toBeNull();
    });
  });
});

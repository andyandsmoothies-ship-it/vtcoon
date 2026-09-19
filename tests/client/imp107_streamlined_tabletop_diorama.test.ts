// [UC-IMP107/MSS][3D-S01/MSS] Contract Test Suite: Streamlined Tabletop Diorama & Zero Outer Ring Clutter
// Universal 4-Facet Behavioral Matrix:
// Facet 1 (Boundary & Range): Plinth dimensions ([19.2, 0.2, 19.2]), shallow lagoon water radius <= 16.0
// Facet 2 (Visual De-cluttering): Zero peripheral trees (TropicalPalmsCluster, LayeredTropicalFoliage), zero outer lawn cylinder (#22C55E), zero outer landmarks (TrainStation, Airport, Umbrellas)
// Facet 3 (Atmospheric Retention & Cohesive World): 100% preservation of Living Ocean (Gerstner waves #0284C7, abyss #0C4A6E), HorizonMountainRange, seagulls, patrol boat, cargo ships
// Facet 4 (Center Diorama Integrity & Backward Compatibility): Preservation of MiniatureCityDiorama and support for streamlined={false} full island restoration

import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Ensure Zustand stores evaluate live state instead of stale initial snapshot during Node.js SSR test rendering
const origUseSyncExternalStore = React.useSyncExternalStore;
React.useSyncExternalStore = ((subscribe, getSnapshot, _getServerSnapshot) => {
  return origUseSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}) as typeof React.useSyncExternalStore;

import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { GameBoard, DEPTH_LAYER_STACK } from '../../src/client/3d/board_layout';
import { useGameStore } from '../../src/client/store/game_store';
import { useLobbyStore } from '../../src/client/store/lobby_store';

describe('[UC-IMP107/MSS] Streamlined Tabletop Diorama & Zero Outer Ring Clutter Contract Suite', () => {
  beforeEach(() => {
    useGameStore.setState({
      roundNumber: 1,
      maxRounds: 30,
      turnTimeRemaining: 30,
      currentTurnPlayerId: 'p1',
      playersInfo: {
        p1: {
          id: 'p1',
          name: 'Chủ Tịch Hưng',
          balance: 15000,
          tokenColor: '#ef4444',
          ownedProperties: [1],
          mortgagedProperties: [],
          mortgageLoans: {},
          isBot: false,
          bankrupt: false,
          inAudit: false,
        },
      },
      treasuryPool: 2500,
      isRolling: false,
      hasRolledThisTurn: false,
      activeEmotes: {},
      levelMap: {},
      playerPositions: {},
    });

    useLobbyStore.setState({
      myPlayerId: 'p1',
      slots: [],
    });
  });

  // =========================================================================
  // FACET 1: BOUNDARY & PLINTH GEOMETRY CONSTRAINTS
  // =========================================================================

  describe('Facet 1: Boundary & Plinth Geometry Constraints', () => {
    it('[UC-IMP107/MSS-F1.1] CoastalIslandEnvironment defaults to streamlined=true without outer lawn cylinder [15.6, 17.6, 0.26, 64]', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
      // In streamlined mode, the huge circular lawn args={[15.6, 17.6, 0.26, 64]} is eliminated
      expect(html).not.toContain('args="15.6,17.6,0.26,64"');
    });

    it('[UC-IMP107/MSS-F1.2] CoastalIslandEnvironment in streamlined mode eliminates outer sloped sand cylinders [17.4, 21, 0.24, 64]', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).not.toContain('args="17.4,21,0.24,64"');
      expect(html).not.toContain('args="27.8,28.85,0.28,64"');
    });

    it('[UC-IMP107/MSS-F1.3] CoastalIslandEnvironment in streamlined mode hugs the board perimeter with flush water collar and zero outer disk', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('color="#06B6D4"');
      expect(html).toContain('color="#FFFFFF"');
      // Should not use any outer circular lagoon cylinders
      expect(html).not.toContain('args="16.3,19.5,0.08,48"');
      expect(html).not.toContain('args="13.2,14.8,0.08,48"');
    });

    it('[UC-IMP107/MSS-F1.4] GameBoard constrains walnut table plinth to args=[19.2, 0.2, 19.2] to hug DioramaBoardRim', () => {
      const html = renderToStaticMarkup(React.createElement(GameBoard));
      expect(html).toContain('args="19.2,0.2,19.2"');
      expect(html).not.toContain('args="32,0.2,32"');
      expect(DEPTH_LAYER_STACK.WALNUT_TABLE_Y).toBe(-0.350);
    });
  });

  // =========================================================================
  // FACET 2: VISUAL DE-CLUTTERING & ZERO PERIPHERAL OBSTACLES
  // =========================================================================

  describe('Facet 2: Visual De-cluttering & Zero Peripheral Obstacles', () => {
    it('[UC-IMP107/MSS-F2.1] CoastalIslandEnvironment streamlined mode purges TropicalPalmsCluster (60 trees)', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).not.toContain('data-testid="tropical-palms-cluster"');
    });

    it('[UC-IMP107/MSS-F2.2] CoastalIslandEnvironment streamlined mode purges LayeredTropicalFoliage (32 trees)', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).not.toContain('data-testid="layered-tropical-foliage"');
    });

    it('[UC-IMP107/MSS-F2.3] CoastalIslandEnvironment streamlined mode purges East Grand Station train landmark from board edge', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      // Train station tarmac box args="13.2,0.32,5.4" must be purged from streamlined view
      expect(html).not.toContain('args="13.2,0.32,5.4"');
    });

    it('[UC-IMP107/MSS-F2.4] CoastalIslandEnvironment streamlined mode purges Airport runway landmark from board edge', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      // Airport terminal box args="13.5,0.32,7.5" and runway tarmac args="12.2,0.06,2.4" must be purged
      expect(html).not.toContain('args="13.5,0.32,7.5"');
      expect(html).not.toContain('args="12.2,0.06,2.4"');
    });

    it('[UC-IMP107/MSS-F2.5] CoastalIslandEnvironment streamlined mode purges beach umbrellas and nearshore pier bridges', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      // Pier viaduct args="12,0.18,1.4"
      expect(html).not.toContain('args="12,0.18,1.4"');
    });

    it('[UC-IMP107/MSS-F2.6] CoastalIslandEnvironment streamlined mode purges nearshore 9h yacht and container ship', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).not.toContain('position="-11.5,-0.3,12"');
      expect(html).not.toContain('position="-15,-0.3,9.5"');
    });
  });

  // =========================================================================
  // FACET 3: ATMOSPHERIC RETENTION & SINGLE COHESIVE WORLD
  // =========================================================================

  describe('Facet 3: Atmospheric Retention & Single Cohesive World', () => {
    it('[UC-IMP107/MSS-F3.1] CoastalIslandEnvironment retains Endless Living Ocean deep abyss and Gerstner waves', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('color="#0C4A6E"');
      expect(html).toContain('color="#0284C7"');
      expect(html).toContain('color="#0369A1"');
    });

    it('[UC-IMP107/MSS-F3.2] CoastalIslandEnvironment retains CoastalPatrolBoat dynamic marine patrol', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('data-testid="coastal-patrol-boat"');
    });

    it('[UC-IMP107/MSS-F3.3] CoastalIslandEnvironment retains CoastalSeagulls flock animation', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('data-testid="coastal-seagulls"');
    });

    it('[UC-IMP107/MSS-F3.4] CoastalIslandEnvironment retains HorizonMountainRange in the northern horizon', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('data-testid="horizon-mountain-range"');
    });

    it('[UC-IMP107/MSS-F3.5] CoastalIslandEnvironment retains distant cargo container ships in deep water', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: true }));
      expect(html).toContain('color="#DC2626"');
    });
  });

  // =========================================================================
  // FACET 4: CENTER DIORAMA INTEGRITY & BACKWARD COMPATIBILITY
  // =========================================================================

  describe('Facet 4: Center Diorama Integrity & Backward Compatibility', () => {
    it('[UC-IMP107/MSS-F4.1] CoastalIslandEnvironment with streamlined=false restores full island terrain and trees', () => {
      const html = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment, { streamlined: false }));
      expect(html).toContain('data-testid="tropical-palms-cluster"');
      expect(html).toContain('data-testid="layered-tropical-foliage"');
      expect(html).toContain('args="13.2,0.32,5.4"');
    });

    it('[UC-IMP107/MSS-F4.2] GameBoard preserves MiniatureCityDiorama center city landmarks 100%', () => {
      const html = renderToStaticMarkup(React.createElement(GameBoard));
      expect(html).toContain('data-testid="miniature-city-diorama"');
      expect(html).toContain('data-testid="diorama-board-rim"');
      expect(html).toContain('data-testid="central-monument-plaza"');
      expect(html).toContain('data-testid="diorama-pedestrian-promenades"');
      expect(html).toContain('data-testid="diorama-urban-canopy"');
    });
  });
});

// [IMP-308] Living Contract Tests: Masterplan District Card Sub-component
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MasterplanDistrictCard,
  type DistrictCardPlayer,
  type CellOwnershipInfo,
} from '../../src/client/ui/modals/masterplan_district_card.js';
import { DISTRICT_GROUPS } from '../../src/client/ui/modals/masterplan_constants.js';

const MOCK_PLAYERS: Record<string, DistrictCardPlayer> = {
  p1: {
    id: 'p1',
    name: 'Đại Gia Sài Gòn',
    tokenColor: '#c0392b',
    avatar: '🦁',
  },
  p2: {
    id: 'p2',
    name: 'Tỷ Phú Hà Thành',
    tokenColor: '#2980b9',
    avatar: '🦅',
  },
};

describe('Station 1 Contract Tests: MasterplanDistrictCard', () => {
  const districtBrown = DISTRICT_GROUPS[0]!; // Brown district: cells 1, 3 (total 2 cells)
  const districtCyan = DISTRICT_GROUPS[1]!; // Cyan district: cells 6, 8, 9 (total 3 cells)

  it('TC-MPDC.01 [UC-MPDC/MSS] renders monopoly badge when one player owns all cells', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: MOCK_PLAYERS['p1'] ?? null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
      }),
    );

    expect(html.includes('data-monopoly="true"')).toBe(true);
    expect(html.includes('Độc Quyền (Đại Gia Sài Gòn)')).toBe(true);
  });

  it('TC-MPDC.02 [UC-MPDC/MSS] renders near-monopoly badge when leading player owns totalCells - 1', () => {
    const getOwnership = (cellIndex: number): CellOwnershipInfo => {
      if (cellIndex === 6 || cellIndex === 8) {
        return { owner: MOCK_PLAYERS['p1'] ?? null, isMortgaged: false, level: 0 };
      }
      return { owner: null, isMortgaged: false, level: 0 };
    };

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtCyan,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
      }),
    );

    expect(html.includes('data-near-monopoly="true"')).toBe(true);
    expect(html.includes('Sắp Độc Quyền')).toBe(true);
  });

  it('TC-MPDC.03 [UC-MPDC/MSS] does not render monopoly badge when cells are split between players', () => {
    const getOwnership = (cellIndex: number): CellOwnershipInfo => ({
      owner: cellIndex === 6 ? MOCK_PLAYERS['p1'] ?? null : cellIndex === 8 ? MOCK_PLAYERS['p2'] ?? null : null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtCyan,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
      }),
    );

    expect(html.includes('data-monopoly="true"')).toBe(false);
    expect(html.includes('data-near-monopoly="true"')).toBe(false);
  });

  it('TC-MPDC.04 [UC-MPDC/MSS] renders vacant badge when all district cells are vacant', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p1',
      }),
    );

    expect(html.includes(`data-testid="district-status-vacant-${districtBrown.id}"`)).toBe(true);
    expect(html.includes('Đất Trống')).toBe(true);
  });

  it('TC-MPDC.05 [UC-MPDC/A1] renders disabled quick-trade button when trade is frozen', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: MOCK_PLAYERS['p1'] ?? null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
        isTradeFrozen: true,
      }),
    );

    expect(html.includes(`data-testid="quick-trade-btn-1"`)).toBe(true);
    expect(html.includes('disabled=""')).toBe(true);
  });

  it('TC-MPDC.06 [UC-MPDC/MSS] renders enabled quick-trade button when trade is not frozen', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: MOCK_PLAYERS['p1'] ?? null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
        isTradeFrozen: false,
      }),
    );

    expect(html.includes('disabled=""')).toBe(false);
    expect(html.includes('Đổi Ô')).toBe(true);
  });

  it('TC-MPDC.07 [UC-MPDC/MSS] renders mortgaged badge when cell is mortgaged', () => {
    const getOwnership = (cellIndex: number): CellOwnershipInfo => ({
      owner: MOCK_PLAYERS['p1'] ?? null,
      isMortgaged: cellIndex === 1,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
      }),
    );

    expect(html.includes('data-mortgaged="true"')).toBe(true);
    expect(html.includes('Thế Chấp')).toBe(true);
  });

  it('TC-MPDC.08 [UC-MPDC/MSS] renders house level badge when level > 0', () => {
    const getOwnership = (cellIndex: number): CellOwnershipInfo => ({
      owner: MOCK_PLAYERS['p1'] ?? null,
      isMortgaged: false,
      level: cellIndex === 1 ? 2 : 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
        myPlayerId: 'p2',
      }),
    );

    expect(html.includes('C2')).toBe(true);
    expect(html.includes('C3')).toBe(false);
  });

  it('TC-MPDC.09 [UC-MPDC/MSS] renders district ribbon with district hexColor', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
      }),
    );

    expect(html.includes('data-testid="district-ribbon"')).toBe(true);
    expect(html.includes(districtBrown.hexColor)).toBe(true);
  });

  it('TC-MPDC.10 [UC-MPDC/MSS] renders vacant progress segment with data-vacant="true"', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
      }),
    );

    expect(html.includes(`data-testid="district-progress-segment-1"`)).toBe(true);
    expect(html.includes('data-vacant="true"')).toBe(true);
  });

  it('TC-MPDC.11 [UC-MPDC/MSS] renders 3D view button for each cell', () => {
    const getOwnership = (): CellOwnershipInfo => ({
      owner: null,
      isMortgaged: false,
      level: 0,
    });

    const html = renderToStaticMarkup(
      React.createElement(MasterplanDistrictCard, {
        district: districtBrown,
        players: MOCK_PLAYERS,
        getCellOwnership: getOwnership,
      }),
    );

    expect(html.includes(`data-testid="view-cell-btn-1"`)).toBe(true);
    expect(html.includes(`data-testid="view-cell-btn-3"`)).toBe(true);
  });

  it('TC-MPDC.12 [UC-MPDC/MSS] verifies brown district structural metadata constants', () => {
    expect(districtBrown.cellIndices.length).toBe(2);
    expect(districtBrown.id).toBe('Nau');
  });

  it('TC-MPDC.13 [UC-MPDC/MSS] verifies cyan district structural metadata constants', () => {
    expect(districtCyan.cellIndices.length).toBe(3);
    expect(districtCyan.id).toBe('XanhDaTroi');
  });

  it('TC-MPDC.14 [UC-MPDC/MSS] verifies district cell indices array mapping', () => {
    expect(districtBrown.name).toBe('Đồng Bằng Sông Cửu Long');
    expect(districtBrown.cellIndices).toEqual([1, 3]);
  });

  it('TC-MPDC.15 [UC-MPDC/MSS] verifies cyan district cell indices array mapping', () => {
    expect(districtCyan.name).toBe('Đông Nam Bộ');
    expect(districtCyan.cellIndices).toEqual([6, 8, 9]);
  });

  it('TC-MPDC.16 [UC-MPDC/MSS] verifies district hexColor codes', () => {
    expect(districtBrown.hexColor).toBe('#8B5E3C');
    expect(districtCyan.hexColor).toBe('#2980b9');
  });
});

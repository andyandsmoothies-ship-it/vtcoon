// [TC-04.T2/MSS] Board Config — CellType Expansion & 6 Tile Schema Update
// Traceability: UC-GAME-009/MSS, UC-GAME-038/MSS, UC-GAME-040/MSS, UC-GAME-045/MSS, UC-GAME-046/MSS, UC-GAME-047/MSS

import { describe, it, expect } from 'vitest';
import { BOARD_CONFIG, CellType } from '../../src/domain/board_config';

describe('[UC-GAME-009/MSS] Board Config — Schema 40 o', () => {
  it('BOARD_CONFIG chua dung 40 phan tu', () => {
    expect(BOARD_CONFIG).toHaveLength(40);
  });

  it('moi o co index, name, type hop le', () => {
    for (let i = 0; i < BOARD_CONFIG.length; i++) {
      const cell = BOARD_CONFIG[i]!;
      expect(cell.index).toBe(i);
      expect(cell.name.length).toBeGreaterThan(0);
      expect(Object.values(CellType)).toContain(cell.type);
    }
  });

  it('o dau tien (index 0) la o Khoi Hanh (Go)', () => {
    expect(BOARD_CONFIG[0]?.type).toBe(CellType.Go);
  });

  it('[UC-GAME-009/MSS] cac o dac biet dung vi tri: FreeParking=20', () => {
    expect(BOARD_CONFIG[20]?.type).toBe(CellType.FreeParking);
  });
});

describe('[TC-04.T2/MSS] Mo rong CellType & Board Config', () => {
  it('CellType chua du 4 gia tri moi: Market, Hose, TaxOrder, Audit', () => {
    expect(CellType.Market).toBe('Market');
    expect(CellType.Hose).toBe('Hose');
    expect(CellType.TaxOrder).toBe('TaxOrder');
    expect(CellType.Audit).toBe('Audit');
  });

  it('bao toan cac gia tri enum cu trong CellType de tranh gay tuong thich nguoc', () => {
    expect(CellType.CommunityChest).toBe('CommunityChest');
    expect(CellType.Jail).toBe('Jail');
    expect(CellType.GoToJail).toBe('GoToJail');
    expect(CellType.Tax).toBe('Tax');
  });

  it('o 02/17/33 co type Market va dung index', () => {
    expect(BOARD_CONFIG[2]?.type).toBe(CellType.Market);
    expect(BOARD_CONFIG[2]?.index).toBe(2);
    expect(BOARD_CONFIG[17]?.type).toBe(CellType.Market);
    expect(BOARD_CONFIG[17]?.index).toBe(17);
    expect(BOARD_CONFIG[33]?.type).toBe(CellType.Market);
    expect(BOARD_CONFIG[33]?.index).toBe(33);
  });

  it('o 07/22/36 co type Chance va dung index', () => {
    expect(BOARD_CONFIG[7]?.type).toBe(CellType.Chance);
    expect(BOARD_CONFIG[7]?.index).toBe(7);
    expect(BOARD_CONFIG[22]?.type).toBe(CellType.Chance);
    expect(BOARD_CONFIG[22]?.index).toBe(22);
    expect(BOARD_CONFIG[36]?.type).toBe(CellType.Chance);
    expect(BOARD_CONFIG[36]?.index).toBe(36);
  });

  it('o 10 co type Audit va dung index', () => {
    expect(BOARD_CONFIG[10]?.type).toBe(CellType.Audit);
    expect(BOARD_CONFIG[10]?.index).toBe(10);
  });

  it('o 30 co type TaxOrder va dung index', () => {
    expect(BOARD_CONFIG[30]?.type).toBe(CellType.TaxOrder);
    expect(BOARD_CONFIG[30]?.index).toBe(30);
  });

  it('o 38 co type Hose va dung index', () => {
    expect(BOARD_CONFIG[38]?.type).toBe(CellType.Hose);
    expect(BOARD_CONFIG[38]?.index).toBe(38);
  });
});

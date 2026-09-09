// [TC-UI04/MSS] Test Suite Slice UI-04: Business Modals Logic & Store Contracts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDeedDisplayInfo,
  calculateAuctionIncrements,
  calculateTradeTax,
  validateTradeOffer,
} from '../../src/client/ui/modals/modal_helpers';
import { useGameStore } from '../../src/client/store/game_store';
import { ColorGroup } from '../../src/domain/board_config';

describe('[TC-UI04.1/MSS] Tra Cuu Thong Tin So Do (getDeedDisplayInfo)', () => {
  it('Tra cuu chinh xac bang gia 4 cap va chi phi nang cap cho o BĐS binh thuong', () => {
    const deed = getDeedDisplayInfo(1); // Cần Thơ Cái Răng
    expect(deed).not.toBeNull();
    expect(deed?.name).toBe('Cần Thơ (Cái Răng)');
    expect(deed?.colorGroup).toBe(ColorGroup.Nau);
    expect(deed?.price).toBe(600);
    expect(deed?.mortgageValue).toBe(300);
    expect(deed?.rents).toEqual([60, 210, 540, 1320]);
    expect(deed?.upgradeCosts).toEqual([300, 450, 600]);
  });

  it('Tra cuu o Railroad tra ve gia mua, the chap, phi theo 4 bac ga va khong co chi phi nang cap', () => {
    const railroad = getDeedDisplayInfo(5); // Sân bay Long Thành
    expect(railroad).not.toBeNull();
    expect(railroad?.price).toBe(2000);
    expect(railroad?.mortgageValue).toBe(1000);
    expect(railroad?.rents).toEqual([500, 1000, 2000, 4000]);
    expect(railroad?.upgradeCosts).toEqual([0, 0, 0]);
  });

  it('Tra cuu o Utility tra ve gia mua, the chap va gia thue co ban', () => {
    const util = getDeedDisplayInfo(12); // EVN
    expect(util).not.toBeNull();
    expect(util?.price).toBe(1500);
    expect(util?.mortgageValue).toBe(750);
    expect(util?.rents[0]).toBe(280);
    expect(util?.upgradeCosts).toEqual([0, 0, 0]);
  });

  it('[TC-UI04.1-inv/Adversarial] O dac biet (GO, Thue, Co Hoi) hoac out of bounds tra ve null', () => {
    expect(getDeedDisplayInfo(0)).toBeNull(); // GO
    expect(getDeedDisplayInfo(4)).toBeNull(); // Thuế
    expect(getDeedDisplayInfo(7)).toBeNull(); // Cơ Hội
    expect(getDeedDisplayInfo(20)).toBeNull(); // Free Parking
    expect(getDeedDisplayInfo(-1)).toBeNull();
    expect(getDeedDisplayInfo(40)).toBeNull();
    expect(getDeedDisplayInfo(1.5)).toBeNull();
  });
});

describe('[TC-UI04.2/MSS] Tinh Toan Buoc Gia Dau Gia (calculateAuctionIncrements)', () => {
  it('Sinh dung 3 buoc gia tang dan [+50, +100, +200 Tr.] tu muc gia hop le', () => {
    expect(calculateAuctionIncrements(600)).toEqual([650, 700, 800]);
    expect(calculateAuctionIncrements(0)).toEqual([50, 100, 200]);
  });

  it('Lam tron gia tri le va chuan hoa an toan', () => {
    expect(calculateAuctionIncrements(450.8)).toEqual([500, 550, 650]);
  });

  it('[TC-UI04.2-inv/Adversarial] Gia am hoac NaN bi chuan hoa ve 0', () => {
    expect(calculateAuctionIncrements(-100)).toEqual([50, 100, 200]);
    expect(calculateAuctionIncrements(Number.NaN)).toEqual([50, 100, 200]);
    expect(calculateAuctionIncrements(Number.POSITIVE_INFINITY)).toEqual([50, 100, 200]);
  });
});

describe('[TC-UI04.3/MSS] Tinh Thue Chuyen Nhuong P2P 5% (calculateTradeTax)', () => {
  it('Tinh dung 5% thue cho khoan tien duong', () => {
    expect(calculateTradeTax(1000)).toBe(50);
    expect(calculateTradeTax(2500)).toBe(125);
  });

  it('Ho tro tinh thue theo ty le dac biet (Macro Card MC_ANTI_SPECULATE 20%)', () => {
    expect(calculateTradeTax(1000, 0.20)).toBe(200);
  });

  it('Lam tron xuong Math.floor theo tieu chuan Kho Bac', () => {
    expect(calculateTradeTax(15)).toBe(0); // 15 * 0.05 = 0.75 -> 0
    expect(calculateTradeTax(30)).toBe(1); // 30 * 0.05 = 1.5 -> 1
  });

  it('[TC-UI04.3-inv/Adversarial] Tien chenh lech am, 0 hoac NaN tra ve 0 thue', () => {
    expect(calculateTradeTax(0)).toBe(0);
    expect(calculateTradeTax(-500)).toBe(0);
    expect(calculateTradeTax(Number.NaN)).toBe(0);
    expect(calculateTradeTax(Number.NEGATIVE_INFINITY)).toBe(0);
  });
});

describe('[TC-UI04.4/MSS] Kiem Tra Hop Le De Xuat P2P (validateTradeOffer)', () => {
  const baseTrade = {
    offeredProperties: [1],
    requestedProperties: [6],
    cashOffer: 0,
    cashRequest: 0,
    myBalance: 2000,
    myProperties: [1, 3],
    targetProperties: [6, 8],
  };

  it('Chap nhan giao dich dat doi dat hop le', () => {
    expect(validateTradeOffer(baseTrade)).toBe(true);
  });

  it('Chap nhan giao dich mua dat bang tien mat trong gioi han so du', () => {
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [], cashOffer: 1000 })).toBe(true);
  });

  it('Chap nhan giao dich ban dat nhan tien', () => {
    expect(validateTradeOffer({ ...baseTrade, requestedProperties: [], cashRequest: 500 })).toBe(true);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi de xuat rong khong co dat lan tien', () => {
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [], requestedProperties: [] })).toBe(false);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi khi tien mat bu vuot qua so du nguoi choi hoac doi tac', () => {
    expect(validateTradeOffer({ ...baseTrade, cashOffer: 2500, myBalance: 2000 })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, cashRequest: 5000, targetBalance: 2000 })).toBe(false);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi xung dot ca hai ben deu bu tien mat', () => {
    expect(validateTradeOffer({ ...baseTrade, cashOffer: 500, cashRequest: 300 })).toBe(false);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi tien am hoac NaN', () => {
    expect(validateTradeOffer({ ...baseTrade, cashOffer: -100 })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, cashRequest: Number.NaN })).toBe(false);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi khi de xuat tai san khong so huu hoac trung lap', () => {
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [99] })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, requestedProperties: [99] })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [1, 1] })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [1], requestedProperties: [1] })).toBe(false);
  });

  it('[TC-UI04.4-inv/Adversarial] Tu choi khi tai san de xuat hoac yeu cau dang bi the chap', () => {
    expect(validateTradeOffer({ ...baseTrade, offeredProperties: [1], myMortgagedProperties: [1] })).toBe(false);
    expect(validateTradeOffer({ ...baseTrade, requestedProperties: [6], targetMortgagedProperties: [6] })).toBe(false);
  });
});

describe('[TC-UI04.5/MSS] Quan Ly Trang Thai Modals Trong Zustand Store', () => {
  beforeEach(() => {
    useGameStore.getState().closeModal();
  });

  it('Trang thai ban dau activeModal va modalPayload deu la null', () => {
    const state = useGameStore.getState();
    expect(state.activeModal).toBeNull();
    expect(state.modalPayload).toBeNull();
  });

  it('openModal mo dung modal Title Deed kem payload', () => {
    useGameStore.getState().openModal('deed', { cellIndex: 1, canBuy: true });
    const state = useGameStore.getState();
    expect(state.activeModal).toBe('deed');
    expect(state.modalPayload).toEqual({ cellIndex: 1, canBuy: true });
  });

  it('updateModalPayload cap nhat tung phan payload dang mo', () => {
    useGameStore.getState().openModal('auction', {
      cellIndex: 6,
      currentBid: 500,
      highestBidderId: 'p1',
      timeRemaining: 15,
      hasPassed: false,
    });
    useGameStore.getState().updateModalPayload<'auction'>({ currentBid: 550, highestBidderId: 'p2' });
    const state = useGameStore.getState();
    expect(state.modalPayload).toMatchObject({ currentBid: 550, highestBidderId: 'p2', cellIndex: 6 });
  });

  it('Mo modal moi tu dong ghi de modal cu va closeModal reset sach se', () => {
    useGameStore.getState().openModal('deed', { cellIndex: 3 });
    expect(useGameStore.getState().activeModal).toBe('deed');

    useGameStore.getState().openModal('event', {
      cardType: 'chance',
      cardId: 'CC_TEST',
      title: 'Thử Nghiệm',
      description: 'Mô tả',
    });
    expect(useGameStore.getState().activeModal).toBe('event');

    useGameStore.getState().closeModal();
    expect(useGameStore.getState().activeModal).toBeNull();
    expect(useGameStore.getState().modalPayload).toBeNull();
  });
});

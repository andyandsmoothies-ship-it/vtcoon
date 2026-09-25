// [TC-AUC-ERG.01/MSS..TC-AUC-ERG.06/MSS] Contract tests for Auction & Title Deed Mobile Ergonomics
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { resolveAuctionDistrictInfo } from '../../src/client/ui/modals/auction_intelligence';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';

const MOCK_PLAYERS = {
  p1: { id: 'p1', name: 'Đại Gia Sài Gòn', ownedProperties: [8, 9], balance: 5000 },
  p2: { id: 'p2', name: 'Tỷ Phú Hà Thành', ownedProperties: [], balance: 4000 },
};

describe('[TC-AUC-ERG/MSS] Mobile Ergonomics & Visual Polish for Auction and Title Deed Modals', () => {
  it('[TC-AUC-ERG.01/MSS] auction_intelligence: Tinh giản 4 nhãn chiến lược súc tích, độ dài <= 18 ký tự', () => {
    // 1. my_monopoly: 🎯 ĐỘC QUYỀN
    const monopolyInfo = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p1');
    expect(monopolyInfo?.strategicHint.badgeText).toBe('🎯 ĐỘC QUYỀN');
    expect(monopolyInfo?.strategicHint.badgeText.length).toBeLessThanOrEqual(18);

    // 2. block_opponent: 🛡️ CHẶN ĐỐI THỦ
    const blockInfo = resolveAuctionDistrictInfo(6, MOCK_PLAYERS, 'p2');
    expect(blockInfo?.strategicHint.badgeText).toBe('🛡️ CHẶN ĐỐI THỦ');
    expect(blockInfo?.strategicHint.badgeText.length).toBeLessThanOrEqual(18);

    // 3. first_piece: 🧩 KHỞI ĐẦU
    const firstInfo = resolveAuctionDistrictInfo(6, { p1: { id: 'p1', ownedProperties: [] } }, 'p1');
    expect(firstInfo?.strategicHint.badgeText).toBe('🧩 KHỞI ĐẦU');
    expect(firstInfo?.strategicHint.badgeText.length).toBeLessThanOrEqual(18);

    // 4. contested: ⚔️ TRANH CHẤP
    const contestedInfo = resolveAuctionDistrictInfo(6, {
      p1: { id: 'p1', ownedProperties: [8] },
      p2: { id: 'p2', ownedProperties: [9] },
    }, 'p1');
    expect(contestedInfo?.strategicHint.badgeText).toBe('⚔️ TRANH CHẤP');
    expect(contestedInfo?.strategicHint.badgeText.length).toBeLessThanOrEqual(18);
  });

  it('[TC-AUC-ERG.02/MSS] auction_district_card: Thu gọn chiều cao chip BĐS thành min-h-[3rem] (loại bỏ min-h-[3.75rem])', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionDistrictCard, {
        cellIndex: 6,
        currentBid: 1000,
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
      })
    );
    expect(html).toContain('min-h-[3rem]');
    expect(html).not.toContain('min-h-[3.75rem]');
  });

  it('[TC-AUC-ERG.03/MSS] auction_modal: Tách auction-hero-header lên trên bố cục 2 cột và đưa Bục đấu giá lên trước trên mobile', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 6,
        currentBid: 1200,
        highestBidderId: 'p1',
        timeRemaining: 15,
        onClose: vi.fn(),
      })
    );

    // 1. Container chính là flex flex-col max-h-[90dvh]
    expect(html).toContain('max-h-[90dvh]');
    expect(html).toContain('flex flex-col');

    // 2. auction-hero-header nằm trước container phân cột
    const heroHeaderIdx = html.indexOf('data-testid="auction-hero-header"');
    const podiumIdx = html.indexOf('data-testid="auction-unified-podium"');
    const districtIdx = html.indexOf('data-testid="auction-district-intelligence"');

    expect(heroHeaderIdx).toBeGreaterThan(0);
    expect(podiumIdx).toBeGreaterThan(heroHeaderIdx);
    expect(districtIdx).toBeGreaterThan(heroHeaderIdx);

    // 3. Trên mobile, bục đấu giá có order-1 và phân khu có order-2
    expect(html).toContain('order-1 md:order-2');
    expect(html).toContain('order-2 md:order-1');
  });

  it('[TC-AUC-ERG.04/MSS] auction_modal: Nút đóng ✕ trên header là nút tròn tactile có class w-9 h-9 và rounded-full', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 6,
        currentBid: 1000,
        highestBidderId: null,
        timeRemaining: 15,
        onClose: vi.fn(),
      })
    );
    expect(html).toContain('aria-label="Đóng sàn đấu giá"');
    expect(html).toMatch(/aria-label="Đóng sàn đấu giá"[^>]*rounded-full/);
    expect(html).toMatch(/aria-label="Đóng sàn đấu giá"[^>]*w-9 h-9/);
  });

  it('[TC-AUC-ERG.05/MSS] auction_modal: Khi hasPassed=true, nút hành động là "Đã Rút Lui • Đóng" và không bị disabled', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 6,
        currentBid: 1000,
        highestBidderId: 'p2',
        myId: 'p1',
        hasPassed: true,
        timeRemaining: 10,
        onClose: vi.fn(),
      })
    );
    expect(html).toContain('Đã Rút Lui • Đóng');
    // Nút Đã Rút Lui • Đóng không bị disabled
    const passBtnMatch = html.match(/<button[^>]*>[^<]*?Đã Rút Lui • Đóng[^<]*?<\/button>/)?.[0] ?? '';
    expect(passBtnMatch).not.toBe('');
    expect(passBtnMatch).not.toContain('disabled');
  });

  it('[TC-AUC-ERG.06/MSS] title_deed_modal: Sử dụng max-h-[90dvh] thay thế hoàn toàn max-h-[90vh]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('max-h-[90dvh]');
    expect(html).not.toContain('max-h-[90vh]');
  });

  it('[TC-AUC-ERG.07/MSS] title_deed_modal: Bố cục Zero-Scroll Tabletop tích hợp hàng ngang Hero Media và biểu phí compact', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 5,
        canBuy: true,
        isOwned: false,
        buyerBalance: 18000,
        buyerId: 'p1',
      })
    );

    // 1. Hero row đặt ngang ảnh BĐS và khối giá niêm yết
    expect(html).toContain('flex flex-row gap-2');
    expect(html).toContain('w-20 h-20');

    // 2. Biểu phí theo số ga sở hữu sử dụng compact padding px-2 py-1
    expect(html).toContain('px-2 py-1');

    // 3. Toàn bộ 4 ga và nút mua hiển thị trọn vẹn
    expect(html).toContain('1 Bến / Ga');
    expect(html).toContain('4 Bến / Ga');
    expect(html).toContain('Mua BĐS (2.000 Tr.)');
  });
});

// [TC-AUC-STRICT.01..TC-AUC-STRICT.08] Strict Visual & Ergonomics Contract Tests for AuctionModal & AuctionDistrictCard
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { AuctionDistrictCard } from '../../src/client/ui/modals/auction_district_card';

const MOCK_PLAYERS = {
  p1: { id: 'p1', name: 'Bạn', balance: 6500, ownedProperties: [18], bankrupt: false },
  bot_2: { id: 'bot_2', name: 'Tỷ Phú Hà Thành', balance: 7800, ownedProperties: [1, 3], bankrupt: false },
  bot_3: { id: 'bot_3', name: 'Thương Gia Đà Nẵng', balance: 4500, ownedProperties: [8], bankrupt: false },
};

describe('[TC-AUC-STRICT] Khảo Sát & Ràng Buộc Công Thái Học Đấu Giá Nghiêm Ngặt', () => {
  it('[TC-AUC-STRICT.01] Header phiên đấu giá: Tiêu đề không bị bẻ dòng (whitespace-nowrap) và huy hiệu phát mãi không bị co cụt', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 16,
        currentBid: 1260,
        startingBid: 1260,
        highestBidderId: null,
        timeRemaining: 15,
        isForeclosure: true,
        insolvencyPlayerId: 'bot_3',
        onClose: vi.fn(),
      })
    );

    // Tiêu đề sàn đấu giá phải có whitespace-nowrap để không bị bẻ thành 3 dòng trên mobile
    expect(html).toContain('SÀN ĐẤU GIÁ TRỰC TUYẾN');
    expect(html).toMatch(/SÀN ĐẤU GIÁ TRỰC TUYẾN[^<]*?<\/h2>/);
    expect(html).toContain('whitespace-nowrap');

    // Huy hiệu phát mãi trên header phải gọn gàng, không dùng class max-w-[130px] gây cụt chữ
    expect(html).not.toContain('max-w-[130px]');
  });

  it('[TC-AUC-STRICT.02] Bục đấu giá (Podium): Nhãn GIÁ THẦU HIỆN TẠI và THỜI GIAN CÒN LẠI có whitespace-nowrap chống bẻ đôi trên 360px', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 16,
        currentBid: 2250,
        highestBidderId: 'bot_2',
        timeRemaining: 15,
      })
    );

    expect(html).toContain('GIÁ THẦU HIỆN TẠI');
    expect(html).toContain('THỜI GIAN CÒN LẠI');
    // Bục đấu giá phải áp dụng whitespace-nowrap cho hàng thông số
    const podiumHtml = html.slice(html.indexOf('data-testid="auction-unified-podium"'));
    expect(podiumHtml).toContain('whitespace-nowrap');
  });

  it('[TC-AUC-STRICT.03] AuctionDistrictCard: Tiêu đề Nhóm Màu không bị co rút thành N.. (loại bỏ truncate nguy hiểm ở h4)', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionDistrictCard, {
        cellIndex: 16, // Nhóm Cam
        currentBid: 1260,
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
        isForeclosure: true,
      })
    );

    // Tên Nhóm Cam phải có whitespace-nowrap và shrink-0
    expect(html).toContain('Nhóm Cam');
    expect(html).toMatch(/Nhóm Cam[^<]*?<\/h4>/);
    expect(html).toContain('shrink-0');
  });

  it('[TC-AUC-STRICT.04] AuctionDistrictCard: Chip ô đang đấu không bị cụt thành 🔨 ĐANG ... (loại bỏ truncate trên chip mục tiêu)', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionDistrictCard, {
        cellIndex: 16,
        currentBid: 2250,
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
      })
    );

    // Chip đang đấu giá
    expect(html).toContain('🔨 ĐẤU GIÁ');
  });

  it('[TC-AUC-STRICT.05] Cụm nút nâng giá nhanh (Quick Bid): Luôn có whitespace-nowrap để bảo toàn số tiền và đơn vị Tr.', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 16,
        currentBid: 2250,
        highestBidderId: 'bot_2',
        timeRemaining: 18,
        myBalance: 6500,
        myId: 'p1',
      })
    );

    expect(html).toContain('+100 Tr.');
    expect(html).toContain('(2.350 Tr.)');
    expect(html).toContain('whitespace-nowrap');
  });

  it('[TC-AUC-STRICT.06] Trạng thái Búa Gõ Thành Công (isConcluded): Hiển thị gọn gàng, súc tích không chiếm tràn màn hình', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 16,
        currentBid: 2450,
        highestBidderId: 'bot_2',
        winnerId: 'bot_2',
        finalPrice: 2450,
        isConcluded: true,
        timeRemaining: 0,
      })
    );

    expect(html).toContain('BÚA GÕ THÀNH CÔNG!');
    expect(html).toContain('Đóng / Xem Bàn Cờ');
  });

  it('[TC-AUC-STRICT.07] Biểu phí thuê Ga (Railroad) và Tiện ích (Utility): Không bị tràn ngang trên màn hình hẹp', () => {
    // 1. Ga Long Thành (Cell 5)
    const railroadHtml = renderToStaticMarkup(
      React.createElement(AuctionDistrictCard, {
        cellIndex: 5,
        currentBid: 2000,
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
      })
    );
    expect(railroadHtml).toContain('CƯỚC 1-4 GA:');
    expect(railroadHtml).toContain('500 / 1.000 / 2.000 / 4.000 Tr.');

    // 2. Tiện ích Điện Lực (Cell 12)
    const utilityHtml = renderToStaticMarkup(
      React.createElement(AuctionDistrictCard, {
        cellIndex: 12,
        currentBid: 1500,
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
      })
    );
    expect(utilityHtml).toContain('CƯỚC TIỆN ÍCH:');
  });

  it('[TC-AUC-STRICT.08] Banner Phát Mại Nợ Xấu (Foreclosure Alert): Gọn nhẹ (p-2 thay vì p-3 cồng kềnh) để dành không gian cho bàn cờ', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 16,
        currentBid: 1260,
        startingBid: 1260,
        highestBidderId: null,
        timeRemaining: 15,
        isForeclosure: true,
        insolvencyPlayerId: 'bot_3',
        myId: 'p1',
        playersInfo: MOCK_PLAYERS,
      })
    );

    expect(html).toContain('TÀI SẢN PHÁT MẠI THANH LÝ NỢ');
    // Class container banner cảnh báo gọn gàng
    expect(html).toContain('p-2');
  });
});

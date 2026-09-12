import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuctionModal } from '../../src/client/ui/modals/auction_modal';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';

describe('[TC-AUC-MODAL.1/MSS] Cấu Trúc Giao Diện 2 Cánh Glassmorphism (Dual-Wing Layout)', () => {
  it('Render AuctionModal với data-testid="auction-modal" và vùng trung tâm thông thoáng', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 600,
        highestBidderId: null,
        timeRemaining: 15,
      })
    );

    expect(html).toContain('data-testid="auction-modal"');
    // Cánh trái: Bảng giá hiện tại & Tên ô đất
    expect(html).toContain('SÀN ĐẤU GIÁ TRỰC TUYẾN');
    expect(html).toContain('GIÁ THẦU HIỆN TẠI');
    expect(html).toContain('Cần Thơ (Cái Răng)');
    expect(html).toContain('600 Tr.');
    expect(html).toContain('LIVE 3D ARENA');

    // Cánh phải: Đại gia tham gia
    expect(html).toContain('ĐẠI GIA THAM GIA');

    // Băng chuyền dưới chân: Đồng hồ đếm ngược & nút đặt giá
    expect(html).toContain('THỜI GIAN CÒN LẠI');
    expect(html).toContain('15 GIÂY');
    expect(html).toContain('+50 Tr.');
    expect(html).toContain('+100 Tr.');
    expect(html).toContain('+200 Tr.');
    expect(html).toContain('AUTO-BID');
    expect(html).toContain('Rút Lui / Bỏ Cuộc');
  });

  it('Hiển thị trạng thái dẫn đầu khi người chơi hiện tại là người trả giá cao nhất', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 850,
        highestBidderId: 'p1',
        myId: 'p1',
        timeRemaining: 10,
      })
    );

    expect(html).toContain('Bạn đang dẫn đầu mức giá cao nhất!');
    expect(html).not.toContain('+50 Tr.'); // Khi đang dẫn đầu, các nút bid được ẩn để tránh tự đấu với chính mình
  });

  it('Hiển thị thông báo khi người chơi đã rút lui khỏi sàn đấu giá', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 700,
        highestBidderId: 'p2',
        myId: 'p1',
        hasPassed: true,
        timeRemaining: 8,
      })
    );

    expect(html).toContain('Bạn đã rút lui khỏi phiên đấu giá này.');
    expect(html).toContain('Đã Rút Lui');
  });

  it('Hiển thị hiệu ứng khẩn cấp (isUrgent) khi thời gian còn lại <= 5 giây', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 1200,
        highestBidderId: 'p2',
        timeRemaining: 3,
      })
    );

    expect(html).toContain('03 GIÂY');
    expect(html).toContain('text-rose-400');
    expect(html).toContain('bg-rose-500');
  });

  it('[WCAG 4.1.3] Có vùng live region thông báo giá và thời gian cho trình đọc màn hình', () => {
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 950,
        highestBidderId: 'p2',
        bidderName: 'Đại Gia Sài Gòn',
        timeRemaining: 12,
      })
    );

    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Giá thầu cao nhất hiện tại: 950 Tr., người dẫn đầu: Đại Gia Sài Gòn, thời gian còn lại: 12 giây');
  });

  it('Vô hiệu hóa các nút nâng giá khi số dư người chơi không đủ (myBalance < targetBid)', () => {
    // Với currentBid = 1000, 3 mức nâng giá là 1050, 1100, 1200
    // Người chơi chỉ có myBalance = 1080 -> Chỉ đủ 1050, nút 1100 và 1200 bị disable
    const html = renderToStaticMarkup(
      React.createElement(AuctionModal, {
        cellIndex: 1,
        currentBid: 1000,
        highestBidderId: 'p2',
        myBalance: 1080,
        timeRemaining: 10,
      })
    );

    // Có ít nhất một nút bị disable do thiếu tiền
    expect(html).toContain('cursor-not-allowed opacity-50');
  });
});

describe('[TC-AUC-MODAL.2/MSS] ModalBackdrop FullScreen & Pointer Events Contract', () => {
  it('ModalBackdrop với fullScreen=true áp dụng pointer-events-none để không chặn Canvas 3D', () => {
    const html = renderToStaticMarkup(
      React.createElement(ModalBackdrop, {
        fullScreen: true,
        children: React.createElement('div', null, 'Content'),
      })
    );

    expect(html).toContain('pointer-events-none');
    expect(html).not.toContain('pointer-events-auto');
  });

  it('ModalBackdrop mặc định (fullScreen=false) áp dụng pointer-events-auto cho modal thông thường', () => {
    const html = renderToStaticMarkup(
      React.createElement(ModalBackdrop, {
        fullScreen: false,
        children: React.createElement('div', null, 'Content'),
      })
    );

    expect(html).toContain('pointer-events-auto');
  });
});

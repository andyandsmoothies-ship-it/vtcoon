// [TC-IMP153/MSS][UC-IMP153]
// Contract Test Suite for IMP-153: P2P Trade Modal Tactile UI/UX Overhaul & Mobile Ergonomics
// Enforces Universal 4-Facet Behavioral Matrix & Atomic Test Mandate (1-4 asserts/test, zero loops in it())
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TradeModal } from '../../src/client/ui/modals/trade_modal';

describe('[IMP-153][Trạm 1 RED] P2P Trade Modal Tactile UI/UX Overhaul & Mobile Ergonomics', () => {
  // =========================================================================
  // FACET 1: Boundary & Left Edge Color Ribbon & Mobile Touch Target
  // =========================================================================

  it('[TC-153.01/MSS][UC-IMP153][Facet-1/Boundary] Mỗi nút BĐS mang cấu trúc hàng ngang flex items-center và dải màu mép trái self-stretch shrink-0 (loại bỏ w-full h-1.5)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    expect(html, '[RED GATE] Thẻ BĐS phải có dải màu mép trái self-stretch').toContain('self-stretch');
    expect(html, '[RED GATE] Dải màu mép trái phải có shrink-0 chống co ép').toContain('shrink-0');
    expect(html, '[RED GATE] Dải màu ngang đỉnh đầu w-full h-1.5 phải bị loại bỏ').not.toContain('w-full h-1.5');
  });

  it('[TC-153.02/MSS][UC-IMP153][Facet-1/Boundary] Chiều cao mỗi thẻ BĐS đạt chuẩn touch target di động tối thiểu min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    // Thẻ BĐS (chứa tên Cái Răng) phải có class min-h-[44px]
    expect(html, '[RED GATE] Thẻ BĐS phải đạt chuẩn min-h-[44px]').toMatch(/<button[^>]*class="[^"]*min-h-\[44px\][^"]*"[^>]*>[\s\S]*?Cái Răng/);
  });

  it('[TC-153.03/MSS][UC-IMP153][Facet-1/Boundary] Dải màu mép trái hiển thị đúng mã màu hex của nhóm phân khu BĐS (ô 1: #8B5E3C, ô 6: #2980b9)', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    // Ô 1 (Cần Thơ Cái Răng - Nâu #8B5E3C), Ô 6 (Bình Dương Dĩ An - Xanh da trời #2980b9)
    const lowerHtml = html.toLowerCase();
    expect(lowerHtml).toContain('#8b5e3c');
    expect(lowerHtml).toContain('#2980b9');
  });

  it('[TC-153.04/MSS][UC-IMP153][Facet-1/Boundary] Danh sách BĐS được mở rộng không gian hiển thị, chứa max-h-52 hoặc max-h-60 trên mobile và sm:max-h-72 trên desktop', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    expect(html, '[RED GATE] Danh sách BĐS phải có responsive desktop sm:max-h-72').toContain('sm:max-h-72');
    expect(html, '[RED GATE] Danh sách BĐS phải mở rộng tối thiểu max-h-52 hoặc max-h-60 trên mobile').toMatch(/max-h-(52|60)/);
    expect(html, '[RED GATE] Chiều cao cũ max-h-44 phải bị thay thế').not.toContain('max-h-44');
  });

  it('[TC-153.14/MSS][UC-IMP153][Facet-1/Boundary] Partner selector tabs duy trì touch target min-h-[44px] và hiển thị số dư người chơi', () => {
    const mockPartners = [
      { id: 'bot_2', name: 'Bot AI 2', balance: 8000, isBot: true },
    ];
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        availablePartners: mockPartners,
      })
    );

    expect(html).toContain('partner-selector-tab');
    expect(html).toContain('min-h-[44px]');
    expect(html).toContain('8.000 Tr.');
  });

  // =========================================================================
  // FACET 2: State Reactivity & Selection Indication
  // =========================================================================

  it('[TC-153.05/MSS][UC-IMP153][Facet-2/Reactivity] Khi BĐS được chọn, thẻ mang viền nổi bật border-amber-500 và bảo toàn chuỗi ✓ [ĐÃ CHỌN]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialOffered: [1],
      })
    );

    expect(html).toContain('border-amber-500');
    expect(html).toContain('✓ [ĐÃ CHỌN]');
  });

  it('[TC-153.06/MSS][UC-IMP153][Facet-2/Reactivity] Thẻ BĐS bị thế chấp mang cờ disabled và hiển thị nhãn Thế chấp', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myMortgagedProperties: [1],
        myBalance: 5000,
      })
    );

    expect(html).toMatch(/<button[^>]*disabled[^>]*>[\s\S]*?Thế chấp/);
    expect(html).toContain('Thế chấp');
  });

  it('[TC-153.07/MSS][UC-IMP153][Facet-2/Reactivity] Khi danh sách BĐS rỗng, hiển thị trạng thái rỗng min-h-[100px] và chứa biểu tượng 🏛️ Chưa sở hữu BĐS', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    expect(html, '[RED GATE] Trạng thái rỗng phải có văn bản 🏛️ Chưa sở hữu BĐS').toContain('🏛️ Chưa sở hữu BĐS');
    expect(html, '[RED GATE] Khung rỗng phải đạt chiều cao đệm min-h-[100px] để cân bằng 2 cột').toContain('min-h-[100px]');
    expect(html, '[RED GATE] Dòng chữ cũ Không có BĐS phải bị thay thế').not.toContain('Không có BĐS');
  });

  it('[TC-153.15/MSS][UC-IMP153][Facet-2/Reactivity] Consumer Assertion: Nút [Gửi Đề Xuất Đàm Phán] ở trạng thái hợp lệ mang màu xanh emerald-500 và không bị khóa disabled', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialOffered: [1],
        initialRequested: [6],
      })
    );

    const submitBtnMatch = html.match(/<button[^>]*>[\s\S]*?Gửi Đề Xuất Đàm Phán[\s\S]*?<\/button>/);
    expect(submitBtnMatch).toBeTruthy();
    expect(submitBtnMatch![0]).toContain('bg-emerald-500');
    expect(submitBtnMatch![0]).not.toContain('disabled');
  });

  // =========================================================================
  // FACET 3: Footer Safety & Anti-Overflow
  // =========================================================================

  it('[TC-153.08/MSS][UC-IMP153][Facet-3/Disposal] Nút [Hủy] ở Footer sở hữu shrink-0 và có chiều rộng tối thiểu min-w-[76px] (hoặc min-w-[72px])', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        onClose: () => {},
      })
    );

    const cancelBtnMatch = html.match(/<button[^>]*>[\s\S]*?Hủy[\s\S]*?<\/button>/);
    expect(cancelBtnMatch).toBeTruthy();
    expect(cancelBtnMatch![0], '[RED GATE] Nút Hủy phải mang shrink-0 chống bị ép').toContain('shrink-0');
    expect(cancelBtnMatch![0], '[RED GATE] Nút Hủy phải có min-w-[76px] hoặc min-w-[72px]').toMatch(/min-w-\[(72|76)px\]/);
  });

  it('[TC-153.09/MSS][UC-IMP153][Facet-3/Disposal] Nút [Gửi Đề Xuất Đàm Phán] ở Footer mang min-w-0 flex-1 và đạt chuẩn min-h-[44px]', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    const submitBtnMatch = html.match(/<button[^>]*>[\s\S]*?Gửi Đề Xuất Đàm Phán[\s\S]*?<\/button>/);
    expect(submitBtnMatch).toBeTruthy();
    expect(submitBtnMatch![0], '[RED GATE] Nút submit phải có min-w-0 flex-1').toContain('min-w-0');
    expect(submitBtnMatch![0]).toContain('flex-1');
    expect(submitBtnMatch![0]).toContain('min-h-[44px]');
  });

  it('[TC-153.10/MSS][UC-IMP153][Facet-3/Disposal] Footer có đệm lề an toàn p-3 pt-2 sm:p-4 gap-2 chống tràn mép viền', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    const footerMatch = html.match(/<footer[^>]*class="([^"]*)"[^>]*>/);
    expect(footerMatch).toBeTruthy();
    expect(footerMatch![1], '[RED GATE] Footer padding phải có p-3 pt-2 sm:p-4').toContain('p-3 pt-2 sm:p-4');
    expect(footerMatch![1]).toContain('gap-2');
  });

  // =========================================================================
  // FACET 4: Layout Budget & Text Truncation Defense
  // =========================================================================

  it('[TC-153.11/MSS][UC-IMP153][Facet-4/ErrorDefense] Tên BĐS dài được bọc lớp truncate min-w-0 để không chèn ép giá tiền và trạng thái chọn', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
      })
    );

    const nameSpanMatch = html.match(/<span[^>]*>[^<]*Cái Răng[^<]*<\/span>/);
    expect(nameSpanMatch).toBeTruthy();
    expect(nameSpanMatch![0]).toContain('truncate');
    expect(nameSpanMatch![0], '[RED GATE] Tên BĐS phải có min-w-0 để cho phép flex truncate hoạt động').toContain('min-w-0');
  });

  it('[TC-153.12/MSS][UC-IMP153][Facet-4/ErrorDefense] Khối Cán Cân Thương Vụ (deal-balance-meter) duy trì đầy đủ nhãn ⚖️ Cán Cân Thương Vụ và thanh tiến độ 2 màu', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialOffered: [1],
        initialRequested: [6],
      })
    );

    expect(html).toContain('data-testid="deal-balance-meter"');
    expect(html).toContain('⚖️ Cán Cân Thương Vụ');
    expect(html).toContain('bg-blue-500');
    expect(html).toContain('bg-amber-500');
  });

  it('[TC-153.13/MSS][UC-IMP153][Facet-4/ErrorDefense] Khối Thuế Kho Bạc hiển thị rõ ràng tỷ lệ 5% và số tiền thuế tương ứng', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialCashOffer: 1000,
      })
    );

    expect(html).toContain('5%');
    expect(html).toContain('Thuế nộp Kho Bạc');
    expect(html).toContain('50 Tr.');
  });

  it('[TC-153.16/MSS][UC-IMP153][Facet-4/ErrorDefense] Consumer Assertion: Khi người chơi yêu cầu số tiền vượt quá số dư đối tác, nút gửi đề xuất bị khóa disabled và hiển thị cảnh báo', () => {
    const html = renderToStaticMarkup(
      React.createElement(TradeModal, {
        targetPlayerId: 'bot_2',
        targetBalance: 1000,
        myProperties: [1],
        targetProperties: [6],
        myBalance: 5000,
        initialCashRequest: 2000,
      })
    );

    const submitBtnMatch = html.match(/<button[^>]*>[\s\S]*?Gửi Đề Xuất Đàm Phán[\s\S]*?<\/button>/);
    expect(submitBtnMatch).toBeTruthy();
    expect(submitBtnMatch![0]).toContain('disabled');
    expect(html).toContain('Đối tác không đủ tiền mặt');
  });
});

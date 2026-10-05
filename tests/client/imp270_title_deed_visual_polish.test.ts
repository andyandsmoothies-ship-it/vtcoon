import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { TitleDeedRentTable } from '../../src/client/ui/modals/title_deed_rent_table';
import { TitleDeedActionFooter } from '../../src/client/ui/modals/title_deed_action_footer';

describe('IMP-270 TitleDeedModal Visual Polish (Desktop & Mobile 360px)', () => {
  it('[TC-270.01/MSS][UC-DEED-POLISH/MSS] Nút đóng ✕ trên ribbon header có độ tương phản nâng cao border-white/60 và bg-black/35', () => {
    // Given TitleDeedModal render với nút đóng
    // When render ra HTML
    // Then nút đóng chứa đúng class tương phản cao và hiệu ứng co giãn
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
        onClose: () => {},
      })
    );
    expect(html).toContain('border-white/60');
    expect(html).toContain('bg-black/35');
    expect(html).toContain('hover:scale-105 active:scale-95');
    expect(html).toContain('aria-label="Đóng Sổ Đỏ"');
  });

  it('[TC-270.02/MSS][UC-DEED-POLISH/MSS] Hero Giá niêm yết hiển thị đơn vị Tr. và font in đậm nổi bật', () => {
    // Given TitleDeedModal cho ô 1 (giá 600)
    // When render ra HTML
    // Then giá niêm yết có định dạng số kèm nhãn đơn vị Tr.
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('Giá niêm yết');
    expect(html).toContain('600');
    expect(html).toContain('Tr.');
  });

  it('[TC-270.03/MSS][UC-DEED-POLISH/MSS] Hero Giá trị thế chấp hiển thị đơn vị Tr. và font in đậm nổi bật', () => {
    // Given TitleDeedModal cho ô 1 (thế chấp 300)
    // When render ra HTML
    // Then giá trị thế chấp có định dạng số kèm nhãn đơn vị Tr.
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        canBuy: true,
        isOwned: false,
      })
    );
    expect(html).toContain('Giá trị thế chấp');
    expect(html).toContain('300');
    expect(html).toContain('Tr.');
  });

  it('[TC-270.04/MSS][UC-DEED-POLISH/MSS] TitleDeedRentTable giải phóng tiêu đề C3 Quần thể Resort/TTTM khỏi hàng ép với huy hiệu', () => {
    // Given TitleDeedRentTable của ô đặc thù (cellIndex: 6) có huy hiệu Giữ Chân Mất Lượt
    // When render ra HTML
    // Then cả tiêu đề Quần thể Resort/TTTM và huy hiệu Giữ Chân Mất Lượt đều hiện diện đầy đủ
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedRentTable, {
        isRailroad: false,
        isUtility: false,
        rents: [50, 150, 450, 1000],
        upgradeCosts: [200, 200, 200],
        cellIndex: 6,
      })
    );
    expect(html).toContain('Quần thể Resort/TTTM');
    expect(html).toContain('Giữ Chân Mất Lượt');
  });

  it('[TC-270.05/MSS][UC-DEED-POLISH/MSS] TitleDeedActionFooter nút Từ Chối Mua sử dụng tone Warm Slate / Terracotta', () => {
    // Given TitleDeedActionFooter ở trạng thái có thể mua (canBuy: true)
    // When render ra HTML
    // Then nút Từ Chối Mua mang nền kem sáng bg-[#FFFBF2], chữ rose-800 và bảo toàn tactile shadow
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedActionFooter, {
        isOwned: false,
        canBuy: true,
        deedPrice: 1000,
        onPass: () => {},
      })
    );
    expect(html).toContain('✕ Từ Chối Mua');
    expect(html).toContain('bg-[#FFFBF2]');
    expect(html).toContain('text-rose-800');
    expect(html).toContain('min-h-[48px]');
  });
});

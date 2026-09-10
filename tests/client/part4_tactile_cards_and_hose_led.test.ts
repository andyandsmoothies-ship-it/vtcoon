// [TC-PART4/MSS] Test Suite Phần 4: Thẻ Bài Game 3D Kim Loại Dập Nổi & Sàn HOSE Bảng Điện Tử LED
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { TitleDeedModal } from '../../src/client/ui/modals/title_deed_modal';
import { HoseModal } from '../../src/client/ui/modals/hose_modal';
import { HOSE_OUTCOMES } from '../../src/domain/event_card_types';

describe('[TC-P4.1/MSS] Thẻ Bài Game 3D Kim Loại TitleDeedModal', () => {
  it('Khung viền đôi mạ vàng dập nổi và hiệu ứng đổ bóng chuẩn xác', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('border-amber-400');
    expect(html).toContain('shadow-[0_0_25px_rgba(245,158,11,0.3)]');
    expect(html).toContain('border-amber-400/40');
    expect(html).toContain('data-testid="title-deed-modal"');
  });

  it('Chứa hoa văn dập chìm Trống Đồng Đông Sơn cổ truyền', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1 })
    );
    expect(html).toContain('<svg');
    expect(html).toContain('viewBox="0 0 400 400"');
    expect(html).toContain('polygon');
    expect(html).toContain('stroke-dasharray="3 3"');
    expect(html).toContain('opacity-[0.06]');
  });

  it('Các nút bấm hành động có độ dày vật lý 4px kèm độ lún cơ học khi bấm', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, { cellIndex: 1, canBuy: true, isOwned: false })
    );
    expect(html).toContain('border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1');
    expect(html).toContain('border-b-4 border-slate-950 active:border-b-0 active:translate-y-1');
  });

  it('Hỗ trợ đầy đủ các trạng thái Nâng Cấp, Hạ Cấp, Thế Chấp với nút bấm 3D vật lý', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: false,
        currentLevel: 1,
        upgradeCost: 450,
        ownerName: 'Đại Gia Hà Nội',
        onUpgrade: () => {},
        onDowngrade: () => {},
        onMortgage: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Nâng Cấp (+450 Tr.)');
    expect(html).toContain('Hạ Cấp (-50%)');
    expect(html).toContain('Thế Chấp');
    expect(html).toContain('border-teal-800');
    expect(html).toContain('border-orange-900');
    expect(html).toContain('border-amber-900');
  });

  it('Hiển thị thông báo cảnh báo thế chấp rõ ràng khi isMortgaged là true', () => {
    const html = renderToStaticMarkup(
      React.createElement(TitleDeedModal, {
        cellIndex: 1,
        isOwned: true,
        isOwner: true,
        isMortgaged: true,
        ownerName: 'Đại Gia Hà Nội',
        onRedeem: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Tài sản đang thế chấp — Tạm ngưng thu phí thuê');
    expect(html).toContain('Giải Chấp');
  });
});

describe('[TC-P4.2/MSS] Bảng Điện Tử LED Sàn Chứng Khoán HOSE', () => {
  it('Hiển thị giao diện bảng điện tử LED giao dịch trực tuyến với Ticker VN-INDEX và VN30', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, { myBalance: 15000, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
    );
    expect(html).toContain('role="dialog"');
    expect(html).toContain('SÀN CHỨNG KHOÁN HOSE');
    expect(html).toContain('VN-INDEX');
    expect(html).toContain('VN30');
    expect(html).toContain('HOSE LIVE');
    expect(html).toContain('animate-pulse');
  });

  it('Bảng tỷ lệ khớp lệnh 1D6 với đầy đủ mã màu xanh lá (tăng), đỏ (giảm), vàng (tham chiếu)', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, { myBalance: 15000, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
    );
    for (const [face, mult] of Object.entries(HOSE_OUTCOMES)) {
      expect(html).toContain(`Mặt ${face}`);
      expect(html).toContain(`${mult.toFixed(2)}x`);
    }
    expect(html).toContain('text-emerald-400');
    expect(html).toContain('text-rose-400');
    expect(html).toContain('text-amber-300');
  });

  it('Hiển thị kết quả xúc xắc 1D6 và số tiền thu về kèm icon xúc xắc trực quan', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        lastDiceRoll: 5,
        lastPayout: 1500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Điểm xúc xắc 1D6: <strong class="text-amber-400">5</strong>');
    expect(html).toContain('Tiền thu về: 1.500 Tr.');
    expect(html).toContain('Khớp Lệnh Lãi');
    expect(html).toContain('text-emerald-400');
  });

  it('Kết quả khớp lệnh lỗ hiển thị mã màu đỏ sàn (rose) và badge Khớp Lệnh Lỗ', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        lastDiceRoll: 1,
        lastPayout: 250,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Điểm xúc xắc 1D6: <strong class="text-amber-400">1</strong>');
    expect(html).toContain('Tiền thu về: 250 Tr.');
    expect(html).toContain('Khớp Lệnh Lỗ');
    expect(html).toContain('text-rose-400');
    expect(html).toContain('bg-rose-950/80');
  });

  it('Kết quả khớp lệnh hòa vốn hiển thị mã màu vàng tham chiếu và badge Khớp Lệnh Hòa', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, {
        myBalance: 15000,
        lastDiceRoll: 3,
        lastPayout: 500,
        defaultStake: 500,
        onInvest: () => {},
        onSkip: () => {},
        onClose: () => {},
      })
    );
    expect(html).toContain('Điểm xúc xắc 1D6: <strong class="text-amber-400">3</strong>');
    expect(html).toContain('Tiền thu về: 500 Tr.');
    expect(html).toContain('Khớp Lệnh Hòa');
    expect(html).toContain('text-amber-300');
    expect(html).toContain('bg-amber-950/80');
  });

  it('Nút bấm đặt cược và bỏ qua có thiết kế cơ học vật lý 3D 4px', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, { myBalance: 15000, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
    );
    expect(html).toContain('border-b-4 border-slate-950 active:border-b-0 active:translate-y-1');
    expect(html).toContain('border-b-4 border-amber-700 active:border-b-0 active:translate-y-1');
  });

  it('[Adversarial Inversion] Khi không đủ tiền đặt cược, nút bấm bị vô hiệu hóa an toàn', () => {
    const html = renderToStaticMarkup(
      React.createElement(HoseModal, { myBalance: 300, onInvest: () => {}, onSkip: () => {}, onClose: () => {} })
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain('cursor-not-allowed');
  });
});

describe('[TC-P4.3/MSS] Đóng Gói Bộ 28 Prompt Standee 3D Bản Địa', () => {
  const filePath = path.resolve(__dirname, '../../docs/assets/danh_sach_28_prompt_standee_vtcoon.md');

  it('Tệp danh sách 28 prompt tồn tại và có dung lượng hợp lệ', () => {
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content.length).toBeGreaterThan(5000);
  });

  it('Chứa Universal Style Wrapper (Tiền tố, Hậu tố và Negative Prompt)', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('Universal Style Wrapper');
    expect(content).toContain('Isometric 3D diorama standee token of [LANDMARK_SUBJECT]');
    expect(content).toContain('Unreal Engine 5 render, Octane render');
    expect(content).toContain('Negative Prompt');
  });

  it('Bao phủ đầy đủ 28 ô tài sản kinh tế từ Ô 01 Cái Răng đến Ô 39 Nguyễn Huệ', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const expectedTiles = [
      'Ô 01', 'Ô 03', 'Ô 05', 'Ô 06', 'Ô 08', 'Ô 09',
      'Ô 11', 'Ô 12', 'Ô 13', 'Ô 14', 'Ô 15', 'Ô 16', 'Ô 18', 'Ô 19',
      'Ô 21', 'Ô 23', 'Ô 24', 'Ô 25', 'Ô 26', 'Ô 27', 'Ô 28', 'Ô 29',
      'Ô 31', 'Ô 32', 'Ô 34', 'Ô 35', 'Ô 37', 'Ô 39',
    ];

    for (const tile of expectedTiles) {
      expect(content).toContain(tile);
    }
  });

  it('Chứa hướng dẫn nạp ảnh vào public/assets/tiles/ và kích hoạt trong code', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('public/assets/tiles/');
    expect(content).toContain('READY_TILES');
    expect(content).toContain('src/client/assets/tile_assets.ts');
  });

  it('Tuân thủ Markdown Hygiene: không chứa khối ký hiệu toán học LaTeX ($)', () => {
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).not.toContain('$');
  });
});

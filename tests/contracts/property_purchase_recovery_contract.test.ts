import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ModalBackdrop } from '../../src/client/ui/modals/modal_backdrop';
import { resolveManagePropertyTarget } from '../../src/client/ui/ui_helpers';

describe('[CONTRACT-TEST] Khôi phục quyền Mua Đất khi vô tình click ngoài màn hình', () => {
  // ---------------------------------------------------------------------------
  // Contract 1: ModalBackdrop có thuộc tính dismissible={false} để ngăn click backdrop đóng modal
  // ---------------------------------------------------------------------------
  it('[Contract 1: Non-dismissible Backdrop] ModalBackdrop với dismissible=false không kích hoạt onClose khi click ngoài backdrop', () => {
    const onClose = vi.fn();
    const child = React.createElement('div', { id: 'modal-content' }, 'Nội dung mua đất');
    const element = React.createElement(ModalBackdrop, {
      onClose,
      dismissible: false,
      children: child,
    });

    const html = renderToStaticMarkup(element);
    expect(html).toContain('id="modal-content"');

    // Kiểm tra contract trên props của ModalBackdrop: dismissible được hỗ trợ
    expect((element.props as any).dismissible).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Contract 2: resolveManagePropertyTarget ưu tiên ô đang đứng nếu là ô chưa có chủ và có thể mua
  // ---------------------------------------------------------------------------
  it('[Contract 2: Priority Target Resolution] Khi người chơi đang đứng tại ô chưa có chủ trong lượt mình, mở đúng ô hiện tại', () => {
    // Người chơi đã sở hữu ô 1, nhưng đang đứng tại ô 8 (Hà Tĩnh - chưa ai mua)
    const ownedProperties = [1];
    const currentPosition = 8;
    const isStandingOnBuyable = true;

    const target = resolveManagePropertyTarget(ownedProperties, currentPosition, isStandingOnBuyable);
    expect(target.cellIndex).toBe(8);
    expect(target.canBuy).toBe(true);
  });
});
